import React, { useMemo, useState, useEffect, useCallback } from "react";
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, LineChart, 
  Gauge, Sparkles, Download, Upload, Calculator, Target, Settings2, 
  BarChart2, PieChart, Layers3, Activity, DollarSign, Landmark, 
  PiggyBank, Building2, FileSpreadsheet, ArrowRightLeft, RefreshCw,
  Database, Cloud, AlertCircle, Info, ChevronRight, Eye, EyeOff,
  Zap, Shield, TrendingDown as TrendDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart as RLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart as RBarChart, Bar, CartesianGrid, Legend, AreaChart, Area,
  ComposedChart, Scatter, PieChart as RPieChart, Pie, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, Sankey
} from "recharts";

// Enhanced UI Components
const Card = ({ className = "", children, gradient = false }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl ${gradient ? 'bg-gradient-to-br from-zinc-900/50 to-zinc-800/30' : 'bg-zinc-900/50'} border border-zinc-800 p-4 shadow-lg backdrop-blur-sm ${className}`}
  >
    {children}
  </motion.div>
);

const SectionTitle = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-700 border border-zinc-700">
        <Icon className="w-5 h-5 text-blue-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          {title}
        </h3>
        {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

const Badge = ({ tone = "default", children, pulse = false }) => {
  const tones = {
    default: "bg-zinc-800 text-zinc-200 border-zinc-700",
    good: "bg-emerald-900/30 text-emerald-300 border-emerald-700/50",
    warn: "bg-amber-900/30 text-amber-300 border-amber-700/50",
    bad: "bg-rose-900/30 text-rose-300 border-rose-700/50",
    info: "bg-blue-900/30 text-blue-300 border-blue-700/50",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs border ${tones[tone]} ${pulse ? 'animate-pulse' : ''}`}>
      {children}
    </span>
  );
};

// Enhanced Helpers
const dollars = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const val = Math.abs(n);
  if (val >= 1e9) return `${sign}$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `${sign}$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1e3) return `${sign}$${(val / 1e3).toFixed(1)}K`;
  return `${sign}$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const percent = (n, d = 1) => (isFinite(n) ? `${n.toFixed(d)}%` : "—");

// Google Sheets Integration
const SHEET_ID = '16PVlalae-iOCX3VR1sSIB6_QCdTGjXSwmO6x8YttH1I';
const GID = '451520574'; // Your specific sheet tab GID
const CORS_PROXY = 'https://corsproxy.io/?';

// Map account names to categories for classification
const accountTypeMap = {
  // Revenue accounts
  'revenue': ['revenue', 'sales', 'income', 'contract revenue'],
  
  // COGS accounts
  'cogs': ['cost of goods', 'cogs', 'cost of sales', 'direct cost', 'd - materials', 'd payroll', 
           'd fuel', 'd - equipment', 'd - subcontractors', 'd - vehicle'],
  
  // Operating Expenses
  'expense': ['expense', 'payroll', 'rent', 'utilities', 'insurance', 'professional', 
              'office', 'admin', 'advertising', 'marketing', 'meals', 'travel', 
              'i wages', 'i payroll', 'indirect'],
  
  // Assets
  'asset': ['cash', 'bank', 'accounts receivable', 'inventory', 'prepaid', 'equipment', 
            'vehicle', 'furniture', 'building', 'land', 'asset', 'deposit'],
  
  // Liabilities
  'liability': ['accounts payable', 'payable', 'accrued', 'loan', 'debt', 'credit card', 
                'liability', 'mortgage', 'note payable'],
  
  // Equity
  'equity': ['equity', 'capital', 'retained earnings', 'distribution', 'drawing', 'dividend'],
  
  // Other Income/Expense
  'otherincome': ['other income', 'interest income', 'gain'],
  'otherexpense': ['other expense', 'interest expense', 'loss', 'depreciation', 'amortization']
};

// Function to determine account type from account name
function getAccountType(accountName) {
  const nameLower = accountName.toLowerCase();
  
  for (const [type, patterns] of Object.entries(accountTypeMap)) {
    if (patterns.some(pattern => nameLower.includes(pattern))) {
      // Normalize to expected format
      switch(type) {
        case 'revenue': return 'Revenue';
        case 'cogs': return 'COGS';
        case 'expense': return 'Expense';
        case 'asset': return 'Asset';
        case 'liability': return 'Liability';
        case 'equity': return 'Equity';
        case 'otherincome': return 'OtherIncome';
        case 'otherexpense': return 'OtherExpense';
        default: return 'Expense';
      }
    }
  }
  
  // Default to Expense if no match
  return 'Expense';
}

async function fetchGoogleSheetData() {
  try {
    // Use export URL with specific GID for CSV format
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
    const proxyUrl = CORS_PROXY + encodeURIComponent(url);
    
    console.log('Fetching ledger data from Google Sheets with GID:', GID);
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('Raw CSV data received, length:', text.length);
    
    // Parse CSV
    const rows = text.split('\n').map(row => {
      // Handle CSV with potential commas in values
      const cells = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      cells.push(current.trim());
      
      return cells.map(cell => cell.replace(/^"|"$/g, '').trim());
    });
    
    // Headers are on row 5 (index 4)
    if (rows.length < 6) {
      throw new Error('Sheet has insufficient data');
    }
    
    const headers = rows[4];
    console.log('Headers found:', headers);
    
    // Find the most recent month's columns (rightmost debit/credit pair)
    let mostRecentDebitCol = -1;
    let mostRecentCreditCol = -1;
    
    // Scan from right to left to find the last debit/credit pair
    for (let i = headers.length - 2; i >= 5; i -= 2) {
      // Look for debit column (should be at even position from F onwards)
      if (i >= 5) {
        mostRecentDebitCol = i;
        mostRecentCreditCol = i + 1;
        console.log(`Using columns ${i} (debit) and ${i + 1} (credit) for most recent month`);
        break;
      }
    }
    
    if (mostRecentDebitCol === -1) {
      // Fallback to columns F and G (indices 5 and 6)
      mostRecentDebitCol = 5;
      mostRecentCreditCol = 6;
      console.log('Using default columns F and G');
    }
    
    // Process data rows (starting from row 6, index 5)
    const accountBalances = new Map();
    const dataRows = rows.slice(5).filter(row => row.length > mostRecentCreditCol && row[0]);
    
    console.log('Processing', dataRows.length, 'data rows');
    
    dataRows.forEach((row, idx) => {
      const accountName = row[0];
      const accountNumber = row[1] || '';
      
      if (!accountName || accountName.trim() === '') return;
      
      // Get debit and credit values for the most recent month
      const debitStr = row[mostRecentDebitCol] || '0';
      const creditStr = row[mostRecentCreditCol] || '0';
      
      const debit = parseFloat(String(debitStr).replace(/[$,\s()]/g, '')) || 0;
      const credit = parseFloat(String(creditStr).replace(/[$,\s()]/g, '')) || 0;
      
      // Calculate net balance (debit - credit for most accounts)
      let balance = debit - credit;
      
      // Determine account type
      const accountType = getAccountType(accountName);
      
      // For revenue and liability accounts, credits increase the balance
      if (accountType === 'Revenue' || accountType === 'Liability' || accountType === 'Equity') {
        balance = credit - debit;
      }
      
      // Aggregate by account name (sum up all entries for the same account)
      const key = accountName;
      if (accountBalances.has(key)) {
        accountBalances.set(key, {
          account: accountName,
          number: accountNumber,
          type: accountType,
          amount: accountBalances.get(key).amount + balance
        });
      } else {
        accountBalances.set(key, {
          account: accountName,
          number: accountNumber,
          type: accountType,
          amount: balance
        });
      }
      
      if (idx < 10) { // Log first few entries for debugging
        console.log(`Row ${idx}: ${accountName} (${accountType}) - Debit: ${debit}, Credit: ${credit}, Balance: ${balance}`);
      }
    });
    
    // Convert map to array and filter out zero balances
    const items = Array.from(accountBalances.values())
      .filter(item => Math.abs(item.amount) > 0.01);
    
    console.log('Aggregated accounts:', items.length);
    console.log('Sample aggregated data:', items.slice(0, 5));
    
    // Log summary by type
    const summary = {};
    items.forEach(item => {
      if (!summary[item.type]) {
        summary[item.type] = { count: 0, total: 0 };
      }
      summary[item.type].count++;
      summary[item.type].total += item.amount;
    });
    console.log('Summary by type:', summary);
    
    return items;
    
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return null;
  }
}

// Enhanced Type Normalization (keeping for backward compatibility)
const normalizeType = (tRaw = "") => {
  const t = String(tRaw).trim().toLowerCase();
  const typeMap = {
    'Revenue': ['rev', 'sales', 'revenue', 'income'],
    'COGS': ['cogs', 'cost of goods sold', 'cost of sales', 'direct costs'],
    'Expense': ['exp', 'opex', 'expense', 'operating expense', 'sg&a'],
    'Asset': ['asset', 'assets', 'current asset', 'fixed asset'],
    'Liability': ['liab', 'liability', 'liabilities', 'current liability', 'long term liability'],
    'Equity': ['equity', 'capital', 'retained earnings'],
    'OtherIncome': ['otherincome', 'other income', 'interest income'],
    'OtherExpense': ['otherexpense', 'other expense', 'interest expense']
  };
  
  for (const [key, patterns] of Object.entries(typeMap)) {
    if (patterns.some(p => t.includes(p))) return key;
  }
  return tRaw || "Expense";
};

// Enhanced TB Parser
function parseTB(text) {
  const rows = text
    .split(/\n|\r/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.toLowerCase().startsWith("account"));
  const items = [];
  
  for (const line of rows) {
    const parts = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map((p) => p.replaceAll('"', '').trim());
    if (parts.length < 2) continue;
    const [account, typeRaw, amountRaw] = [parts[0], parts[1], parts[2] ?? "0"];
    const amount = Number(String(amountRaw).replace(/[$,\s]/g, "")) || 0;
    items.push({ account, type: normalizeType(typeRaw), amount });
  }
  return items;
}

// Enhanced Financial Summary with More Ratios
function summarize(items) {
  const sumBy = (filterFn) => items.filter(filterFn).reduce((a, b) => a + b.amount, 0);
  
  // P&L Items
  const revenue = Math.abs(sumBy((i) => i.type === "Revenue"));
  const cogs = Math.abs(sumBy((i) => i.type === "COGS"));
  const opex = Math.abs(sumBy((i) => i.type === "Expense"));
  const otherIncome = Math.abs(sumBy((i) => i.type === "OtherIncome"));
  const otherExpense = Math.abs(sumBy((i) => i.type === "OtherExpense"));
  const grossProfit = revenue - cogs;
  const operatingIncome = grossProfit - opex;
  const ebitda = grossProfit - opex + otherIncome - otherExpense;
  const netIncome = ebitda;

  // Balance Sheet Items
  const assets = Math.abs(sumBy((i) => i.type === "Asset"));
  const cash = Math.abs(items.filter(i => i.type === "Asset" && i.account.toLowerCase().includes("cash"))
    .reduce((sum, item) => sum + item.amount, 0));
  const ar = Math.abs(items.filter(i => i.type === "Asset" && i.account.toLowerCase().includes("accounts receivable"))
    .reduce((sum, item) => sum + item.amount, 0));
  const inv = Math.abs(items.filter(i => i.type === "Asset" && i.account.toLowerCase().includes("inventory"))
    .reduce((sum, item) => sum + item.amount, 0));
  const liabilities = Math.abs(sumBy((i) => i.type === "Liability"));
  const ap = Math.abs(items.filter(i => i.type === "Liability" && i.account.toLowerCase().includes("accounts payable"))
    .reduce((sum, item) => sum + item.amount, 0));
  const std = Math.abs(items.filter(i => i.type === "Liability" && i.account.toLowerCase().includes("short term"))
    .reduce((sum, item) => sum + item.amount, 0));
  const ltd = Math.abs(items.filter(i => i.type === "Liability" && i.account.toLowerCase().includes("long term"))
    .reduce((sum, item) => sum + item.amount, 0));
  const equity = Math.abs(sumBy((i) => i.type === "Equity")) || (assets - liabilities);
  const debt = std + ltd;

  // Liquidity Ratios
  const currentAssets = cash + ar + inv;
  const currentLiabilities = ap + std;
  const currentRatio = currentLiabilities !== 0 ? currentAssets / currentLiabilities : Infinity;
  const quickRatio = currentLiabilities !== 0 ? (cash + ar) / currentLiabilities : Infinity;
  const cashRatio = currentLiabilities !== 0 ? cash / currentLiabilities : Infinity;
  const workingCapital = currentAssets - currentLiabilities;

  // Profitability Ratios
  const grossMarginPct = revenue !== 0 ? (grossProfit / revenue) * 100 : 0;
  const operatingMarginPct = revenue !== 0 ? (operatingIncome / revenue) * 100 : 0;
  const ebitdaMarginPct = revenue !== 0 ? (ebitda / revenue) * 100 : 0;
  const netMarginPct = revenue !== 0 ? (netIncome / revenue) * 100 : 0;
  const ROA = assets !== 0 ? (netIncome / assets) * 100 : 0;
  const ROE = equity !== 0 ? (netIncome / equity) * 100 : 0;
  const ROCE = (assets - currentLiabilities) !== 0 ? (operatingIncome / (assets - currentLiabilities)) * 100 : 0;

  // Efficiency Ratios
  const assetTurnover = assets !== 0 ? revenue / assets : 0;
  const DSO = revenue > 0 ? (ar / revenue) * 365 : null;
  const DIO = cogs > 0 ? (inv / cogs) * 365 : null;
  const DPO = cogs > 0 ? (ap / cogs) * 365 : null;
  const CCC = (DSO || 0) + (DIO || 0) - (DPO || 0);
  const invTurns = inv > 0 && cogs > 0 ? (cogs / inv) : null;

  // Leverage Ratios
  const debtToAssets = assets !== 0 ? debt / assets : 0;
  const debtToEquity = equity !== 0 ? debt / equity : 0;
  const debtToEBITDA = ebitda !== 0 ? debt / ebitda : null;
  const interestCoverage = otherExpense > 0 ? ebitda / otherExpense : null;
  const equityMultiplier = equity !== 0 ? assets / equity : 0;

  // DuPont Analysis
  const dupontROE = netMarginPct * assetTurnover * equityMultiplier;

  return {
    // P&L
    revenue, cogs, opex, otherIncome, otherExpense, grossProfit, operatingIncome, ebitda, netIncome,
    // Balance Sheet
    assets, cash, ar, inv, liabilities, ap, std, ltd, debt, equity, workingCapital,
    // Ratios
    currentRatio, quickRatio, cashRatio,
    grossMarginPct, operatingMarginPct, ebitdaMarginPct, netMarginPct,
    ROA, ROE, ROCE, assetTurnover,
    DSO, DIO, DPO, CCC, invTurns,
    debtToAssets, debtToEquity, debtToEBITDA, interestCoverage, equityMultiplier,
    dupontROE
  };
}

// Enhanced Metric Component
function Metric({ label, value, sublabel, trend, tooltip, onClick }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const up = trend && trend > 0;
  const down = trend && trend < 0;
  
  return (
    <Card gradient={true}>
      <div 
        className={`flex items-center justify-between ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-zinc-400">{label}</p>
          <p className="text-2xl font-semibold mt-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {value}
          </p>
          {sublabel && <p className="text-xs text-zinc-400 mt-1">{sublabel}</p>}
        </div>
        {trend !== undefined && (
          <Badge tone={up ? "good" : down ? "bad" : "default"}>
            {up && <TrendingUp className="w-4 h-4 mr-1" />}
            {down && <TrendingDown className="w-4 h-4 mr-1" />}
            {trend > 0 ? `+${trend.toFixed(1)}%` : `${trend?.toFixed(1)}%`}
          </Badge>
        )}
      </div>
      {showTooltip && tooltip && (
        <div className="absolute z-10 bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-300 mt-2">
          {tooltip}
        </div>
      )}
    </Card>
  );
}

// Debug Panel Component
function DebugPanel({ data, isOpen, onToggle }) {
  return (
    <div className={`fixed right-0 top-20 z-50 transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <button
        onClick={onToggle}
        className="absolute -left-10 top-0 bg-zinc-800 border border-zinc-700 rounded-l-lg p-2"
      >
        {isOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      <div className="w-96 h-96 overflow-auto bg-zinc-900 border-l border-zinc-700 p-4">
        <h3 className="text-sm font-semibold mb-2">Debug Data</h3>
        <pre className="text-xs text-zinc-400">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// Enhanced Alerts with Actionable Insights
function Alerts({ kpi, targets }) {
  const items = [];
  
  // Liquidity Alerts
  if (kpi.currentRatio < targets.currentRatioMin) {
    items.push({
      tone: "bad",
      icon: AlertTriangle,
      title: "Liquidity Risk",
      text: `Current Ratio ${kpi.currentRatio.toFixed(2)} < ${targets.currentRatioMin}`,
      action: "Accelerate collections, negotiate payment terms, or secure short-term financing."
    });
  }
  
  if (kpi.cashRatio < 0.2) {
    items.push({
      tone: "warn",
      icon: AlertCircle,
      title: "Cash Position",
      text: `Cash Ratio ${kpi.cashRatio.toFixed(2)} is critically low`,
      action: "Consider factoring receivables or drawing on credit line."
    });
  }
  
  // Profitability Alerts
  if (kpi.grossMarginPct < targets.grossMarginPctMin) {
    items.push({
      tone: "warn",
      icon: TrendDown,
      title: "Margin Compression",
      text: `Gross Margin ${percent(kpi.grossMarginPct)} below target ${percent(targets.grossMarginPctMin)}`,
      action: "Review pricing strategy and negotiate supplier contracts."
    });
  }
  
  // Efficiency Alerts
  if (kpi.CCC > targets.CCCMax) {
    items.push({
      tone: "warn",
      icon: RefreshCw,
      title: "Cash Conversion Cycle",
      text: `CCC ${kpi.CCC.toFixed(0)} days > ${targets.CCCMax} days`,
      action: "Optimize inventory levels and accelerate collections."
    });
  }
  
  // Leverage Alerts
  if (kpi.debtToEBITDA !== null && kpi.debtToEBITDA > targets.debtToEBITDAMax) {
    items.push({
      tone: "bad",
      icon: Landmark,
      title: "Leverage Concern",
      text: `Debt/EBITDA ${kpi.debtToEBITDA.toFixed(2)}x exceeds ${targets.debtToEBITDAMax}x`,
      action: "Focus on EBITDA growth or debt reduction before additional borrowing."
    });
  }
  
  if (items.length === 0) {
    items.push({
      tone: "good",
      icon: CheckCircle2,
      title: "Healthy Metrics",
      text: "All monitored financial benchmarks are within targets.",
      action: "Continue monitoring and optimize for growth."
    });
  }

  return (
    <div className="space-y-3">
      {items.map((alert, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`p-3 rounded-xl border ${
            alert.tone === "good" ? "border-emerald-800/40 bg-emerald-900/20" :
            alert.tone === "bad" ? "border-rose-800/40 bg-rose-900/20" :
            alert.tone === "warn" ? "border-amber-800/40 bg-amber-900/20" :
            "border-blue-800/40 bg-blue-900/20"
          }`}
        >
          <div className="flex items-start gap-3">
            <alert.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">{alert.title}</p>
              <p className="text-xs text-zinc-400 mt-1">{alert.text}</p>
              {alert.action && (
                <p className="text-xs text-zinc-300 mt-2 pl-3 border-l-2 border-zinc-700">
                  {alert.action}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Main Dashboard Component
export default function DigitalCFODashboard() {
  const [tbText, setTbText] = useState(defaultTBText());
  const [growth, setGrowth] = useState(12);
  const [marginImprovement, setMarginImprovement] = useState(0);
  const [selectedView, setSelectedView] = useState('overview');
  const [debugOpen, setDebugOpen] = useState(false);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [sheetsError, setSheetsError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds default
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [target, setTarget] = useState({
    grossMarginPctMin: 30,
    operatingMarginPctMin: 15,
    ebitdaMarginPctMin: 18,
    currentRatioMin: 1.5,
    quickRatioMin: 1.2,
    DSOMax: 45,
    DIOMax: 60,
    DPOMin: 30,
    CCCMax: 75,
    debtToEBITDAMax: 3.0,
    ROEMin: 15,
    ROAMin: 8,
  });

  const items = useMemo(() => parseTB(tbText), [tbText]);
  const kpi = useMemo(() => summarize(items), [items]);

  // Load Google Sheets Data
  const loadSheetsData = useCallback(async () => {
    if (isLoadingSheets) return; // Prevent concurrent loads
    
    setIsLoadingSheets(true);
    setSheetsError(null);
    
    try {
      const data = await fetchGoogleSheetData();
      if (data && data.length > 0) {
        // Convert to TB format
        const tbLines = ['Account,Type,Amount'];
        data.forEach(item => {
          tbLines.push(`${item.account},${item.type},${item.amount}`);
        });
        setTbText(tbLines.join('\n'));
        setLastUpdateTime(new Date());
        console.log('Successfully loaded', data.length, 'items from Google Sheets at', new Date().toLocaleTimeString());
      } else {
        setSheetsError('No data found in sheet');
      }
    } catch (error) {
      console.error('Error loading sheets:', error);
      setSheetsError(error.message);
    } finally {
      setIsLoadingSheets(false);
      setIsInitialLoad(false);
    }
  }, [isLoadingSheets]);

  // Auto-refresh effect
  useEffect(() => {
    // Load immediately on mount
    if (isInitialLoad) {
      loadSheetsData();
    }
    
    // Set up auto-refresh interval if enabled
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing Google Sheets data...');
        loadSheetsData();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadSheetsData, isInitialLoad]);

  // Build visualization data
  const waterfallData = useMemo(() => [
    { name: "Revenue", value: kpi.revenue, fill: "#10b981" },
    { name: "COGS", value: -kpi.cogs, fill: "#ef4444" },
    { name: "Gross Profit", value: kpi.grossProfit, fill: "#3b82f6" },
    { name: "Opex", value: -kpi.opex, fill: "#f59e0b" },
    { name: "Other", value: (kpi.otherIncome - kpi.otherExpense), fill: "#8b5cf6" },
    { name: "EBITDA", value: kpi.ebitda, fill: "#10b981" },
  ], [kpi]);

  const marginAnalysisData = useMemo(() => [
    { name: 'Gross', value: kpi.grossMarginPct, target: target.grossMarginPctMin },
    { name: 'Operating', value: kpi.operatingMarginPct, target: target.operatingMarginPctMin },
    { name: 'EBITDA', value: kpi.ebitdaMarginPct, target: target.ebitdaMarginPctMin },
    { name: 'Net', value: kpi.netMarginPct, target: 15 },
  ], [kpi, target]);

  const liquidityData = useMemo(() => [
    { metric: 'Current', value: kpi.currentRatio, target: target.currentRatioMin, max: 3 },
    { metric: 'Quick', value: kpi.quickRatio, target: target.quickRatioMin, max: 2 },
    { metric: 'Cash', value: kpi.cashRatio, target: 0.5, max: 1 },
  ], [kpi, target]);

  const duPontData = useMemo(() => [
    { name: 'Net Margin', value: kpi.netMarginPct },
    { name: 'Asset Turnover', value: kpi.assetTurnover * 100 },
    { name: 'Equity Multiplier', value: kpi.equityMultiplier * 10 },
    { name: 'ROE', value: kpi.ROE },
  ], [kpi]);

  // Scenario Analysis
  const scenarioAnalysis = useMemo(() => {
    const base = { revenue: kpi.revenue, ebitda: kpi.ebitda, margin: kpi.ebitdaMarginPct };
    const optimistic = {
      revenue: base.revenue * 1.2,
      ebitda: base.revenue * 1.2 * ((base.margin + 5) / 100),
      margin: base.margin + 5
    };
    const pessimistic = {
      revenue: base.revenue * 0.85,
      ebitda: base.revenue * 0.85 * ((base.margin - 3) / 100),
      margin: base.margin - 3
    };
    
    return [
      { scenario: 'Pessimistic', ...pessimistic },
      { scenario: 'Base', ...base },
      { scenario: 'Optimistic', ...optimistic },
    ];
  }, [kpi]);

  return (
    <div className="min-h-screen w-full text-zinc-100 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Digital CFO Dashboard
              </h1>
              {autoRefresh && (
                <Badge tone="good" pulse={true}>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Live
                </Badge>
              )}
            </div>
            <p className="text-zinc-400 text-sm mt-2">
              Advanced financial analysis with Google Sheets integration
              {lastUpdateTime && (
                <span className="ml-2 text-zinc-500">
                  • Last updated: {lastUpdateTime.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Auto-refresh controls */}
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-zinc-300">Auto-refresh</span>
              </label>
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="ml-2 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300"
                >
                  <option value="10000">10s</option>
                  <option value="30000">30s</option>
                  <option value="60000">1m</option>
                  <option value="300000">5m</option>
                </select>
              )}
            </div>
            <button
              onClick={loadSheetsData}
              disabled={isLoadingSheets}
              className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:opacity-90 transition-opacity ${isLoadingSheets ? 'opacity-50' : ''}`}
            >
              {isLoadingSheets ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  Refresh Now
                </>
              )}
            </button>
            <button
              onClick={() => setTbText(defaultTBText())}
              className="inline-flex items-center gap-2 px-3 py-2 border border-zinc-700 rounded-xl hover:bg-zinc-900"
            >
              <Database className="w-4 h-4" /> Demo Data
            </button>
            <button
              onClick={() => setDebugOpen(!debugOpen)}
              className="inline-flex items-center gap-2 px-3 py-2 border border-zinc-700 rounded-xl hover:bg-zinc-900"
            >
              {debugOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Debug
            </button>
          </div>
        </div>

        {/* Sheets Status Display */}
        {sheetsError && (
          <Card className="mb-4 border-amber-800/40 bg-amber-900/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <p className="text-sm text-amber-300">
                Google Sheets Error: {sheetsError}
              </p>
            </div>
          </Card>
        )}
        
        {/* Real-time Status Indicator */}
        {autoRefresh && (
          <Card className="mb-4 border-green-800/40 bg-green-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm text-green-300">
                  Real-time sync active • Refreshing every {refreshInterval / 1000} seconds
                </p>
              </div>
              <button
                onClick={() => setAutoRefresh(false)}
                className="text-xs text-green-400 hover:text-green-300 underline"
              >
                Pause
              </button>
            </div>
          </Card>
        )}

        {/* View Selector Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['overview', 'profitability', 'liquidity', 'efficiency', 'leverage', 'scenarios'].map(view => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-4 py-2 rounded-xl capitalize transition-all ${
                selectedView === view 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                  : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* TB Input Section */}
        <Card className="mb-6" gradient={true}>
          <SectionTitle 
            icon={FileSpreadsheet} 
            title="Trial Balance Input" 
            subtitle="Account,Type,Amount format (Auto-aggregated from ledger)"
            action={
              <Badge tone="info" pulse={isLoadingSheets}>
                {items.length} accounts loaded
              </Badge>
            }
          />
          <textarea
            className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={tbText}
            onChange={(e) => setTbText(e.target.value)}
            placeholder="Account,Type,Amount"
          />
        </Card>

        {/* Dynamic Content Based on View */}
        <AnimatePresence mode="wait">
          {selectedView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Metric 
                  label="Revenue" 
                  value={dollars(kpi.revenue)} 
                  sublabel={`YoY Growth ${growth}%`}
                  trend={growth}
                  tooltip="Total revenue from all sources"
                />
                <Metric 
                  label="EBITDA" 
                  value={dollars(kpi.ebitda)} 
                  sublabel={`Margin ${percent(kpi.ebitdaMarginPct)}`}
                  tooltip="Earnings before interest, taxes, depreciation, and amortization"
                />
                <Metric 
                  label="Working Capital" 
                  value={dollars(kpi.workingCapital)} 
                  sublabel={`CCC ${kpi.CCC ? kpi.CCC.toFixed(0) : '—'} days`}
                  tooltip="Current assets minus current liabilities"
                />
                <Metric 
                  label="Cash Position" 
                  value={dollars(kpi.cash)} 
                  sublabel={`${percent((kpi.cash / kpi.revenue) * 100)} of revenue`}
                  tooltip="Total cash and cash equivalents"
                />
              </div>

              {/* Main Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <Card gradient={true}>
                  <SectionTitle icon={BarChart2} title="P&L Waterfall" />
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RBarChart data={waterfallData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => dollars(v)} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v) => dollars(v)} />
                        <Bar dataKey="value" fill="#3b82f6">
                          {waterfallData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </RBarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card gradient={true}>
                  <SectionTitle icon={LineChart} title="Margin Analysis" />
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={marginAnalysisData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                        <Bar dataKey="value" fill="#3b82f6" />
                        <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Alerts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <SectionTitle icon={Shield} title="Financial Health Alerts" />
                  <Alerts kpi={kpi} targets={target} />
                </Card>

                <Card>
                  <SectionTitle icon={Gauge} title="Quick Ratios" />
                  <div className="space-y-3">
                    {liquidityData.map(item => (
                      <div key={item.metric} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-400">{item.metric} Ratio</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-zinc-800 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                item.value >= item.target ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {item.value.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {selectedView === 'profitability' && (
            <motion.div
              key="profitability"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <Metric label="ROE" value={`${kpi.ROE.toFixed(1)}%`} sublabel="Return on Equity" />
                <Metric label="ROA" value={`${kpi.ROA.toFixed(1)}%`} sublabel="Return on Assets" />
                <Metric label="ROCE" value={`${kpi.ROCE.toFixed(1)}%`} sublabel="Return on Capital Employed" />
              </div>

              <Card>
                <SectionTitle icon={PieChart} title="DuPont Analysis" subtitle="ROE decomposition" />
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={duPontData}>
                      <PolarGrid strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis angle={90} domain={[0, Math.max(...duPontData.map(d => d.value))]} />
                      <Radar name="Value" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          )}

          {selectedView === 'scenarios' && (
            <motion.div
              key="scenarios"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <SectionTitle icon={Zap} title="Scenario Analysis" subtitle="Compare different business outcomes" />
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RBarChart data={scenarioAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="scenario" />
                      <YAxis yAxisId="left" tickFormatter={(v) => dollars(v)} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v, name) => name === 'margin' ? `${v.toFixed(1)}%` : dollars(v)} />
                      <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" />
                      <Bar yAxisId="left" dataKey="ebitda" fill="#10b981" />
                      <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#f59e0b" />
                      <Legend />
                    </RBarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Debug Panel */}
        <DebugPanel data={kpi} isOpen={debugOpen} onToggle={() => setDebugOpen(!debugOpen)} />

        {/* Footer */}
        <div className="text-center text-xs text-zinc-500 mt-8">
          BizGro KPI 2.0 Digital CFO Dashboard • {autoRefresh ? '🟢 Real-time sync active' : '⭕ Manual refresh mode'}
          {lastUpdateTime && (
            <span className="ml-2">
              • Next refresh: {autoRefresh ? new Date(lastUpdateTime.getTime() + refreshInterval).toLocaleTimeString() : 'Manual'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Default demo data
function defaultTBText() {
  return `Account,Type,Amount
Revenue - Service,Revenue,1500000
Revenue - Product,Revenue,350000
Cost of Goods Sold,COGS,925000
Payroll,Expense,420000
Rent,Expense,84000
Marketing,Expense,65000
General & Admin,Expense,110000
Interest Income,OtherIncome,5000
Interest Expense,OtherExpense,45000
Cash,Asset,185000
Accounts Receivable,Asset,420000
Inventory,Asset,280000
Fixed Assets,Asset,650000
Accounts Payable,Liability,310000
Short Term Debt,Liability,125000
Long Term Debt,Liability,680000
Retained Earnings,Equity,420000`;
}
