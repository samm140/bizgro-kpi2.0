import React, { useMemo, useState, useEffect, useCallback } from "react";
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, LineChart, 
  Gauge, Sparkles, Download, Upload, Calculator, Target, Settings2, 
  BarChart2, PieChart, Layers3, Activity, DollarSign, Landmark, 
  PiggyBank, Building2, FileSpreadsheet, ArrowRightLeft, RefreshCw,
  Database, Cloud, AlertCircle, Info, ChevronRight, Eye, EyeOff,
  Zap, Shield, TrendingDown as TrendDown, User, Brain, Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart as RLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart as RBarChart, Bar, CartesianGrid, Legend, AreaChart, Area,
  ComposedChart, Scatter, PieChart as RPieChart, Pie, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, Sankey
} from "recharts";

// Sam Avatar Component - Cartoon style advisor icon
const SamAvatar = ({ size = 40 }) => (
  <div 
    className="relative rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-0.5"
    style={{ width: size, height: size }}
  >
    <div className="rounded-full bg-zinc-900 p-1 w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Face */}
        <circle cx="50" cy="50" r="35" fill="#fdbcb4" />
        {/* Hair */}
        <path d="M 25 35 Q 50 20, 75 35" fill="#8B4513" strokeWidth="2" />
        {/* Eyes */}
        <circle cx="38" cy="45" r="3" fill="#333" />
        <circle cx="62" cy="45" r="3" fill="#333" />
        {/* Glasses */}
        <circle cx="38" cy="45" r="8" fill="none" stroke="#333" strokeWidth="2" />
        <circle cx="62" cy="45" r="8" fill="none" stroke="#333" strokeWidth="2" />
        <line x1="46" y1="45" x2="54" y2="45" stroke="#333" strokeWidth="2" />
        {/* Smile */}
        <path d="M 35 58 Q 50 68, 65 58" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        {/* Tie indication */}
        <polygon points="50,70 45,80 55,80" fill="#4169E1" />
      </svg>
    </div>
    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900 animate-pulse" />
  </div>
);

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
const GID = '451520574';
const CORS_PROXY = 'https://corsproxy.io/?';

// Enhanced account type mapping using main type and subtype
function getAccountTypeFromClassification(mainType, subType) {
  const mainTypeLower = (mainType || '').toLowerCase();
  const subTypeLower = (subType || '').toLowerCase();
  
  if (mainTypeLower.includes('asset')) return 'Asset';
  if (mainTypeLower.includes('liability')) return 'Liability';
  if (mainTypeLower.includes('equity')) return 'Equity';
  if (mainTypeLower.includes('revenue') || mainTypeLower.includes('income')) return 'Revenue';
  if (mainTypeLower.includes('expense')) return 'Expense';
  if (mainTypeLower.includes('cogs') || mainTypeLower.includes('cost of goods')) return 'COGS';
  
  if (subTypeLower.includes('revenue') || subTypeLower.includes('sales')) return 'Revenue';
  if (subTypeLower.includes('direct cost') || subTypeLower.includes('cogs')) return 'COGS';
  if (subTypeLower.includes('operating expense') || subTypeLower.includes('overhead')) return 'Expense';
  if (subTypeLower.includes('other income')) return 'OtherIncome';
  if (subTypeLower.includes('other expense') || subTypeLower.includes('interest expense')) return 'OtherExpense';
  if (subTypeLower.includes('current asset')) return 'Asset';
  if (subTypeLower.includes('fixed asset')) return 'Asset';
  if (subTypeLower.includes('current liability')) return 'Liability';
  if (subTypeLower.includes('long term liability')) return 'Liability';
  
  return null;
}

function getAccountTypeFromName(accountName) {
  const nameLower = accountName.toLowerCase();
  
  if (nameLower.includes('revenue') || nameLower.includes('sales') || 
      nameLower.includes('income') && !nameLower.includes('tax')) {
    return 'Revenue';
  }
  
  if (nameLower.includes('cost of goods') || nameLower.includes('cogs') || 
      nameLower.includes('direct cost') || nameLower.includes('d - ')) {
    return 'COGS';
  }
  
  if (nameLower.includes('cash') || nameLower.includes('bank') || 
      nameLower.includes('receivable') || nameLower.includes('inventory') || 
      nameLower.includes('prepaid') || nameLower.includes('equipment') || 
      nameLower.includes('vehicle') || nameLower.includes('building')) {
    return 'Asset';
  }
  
  if (nameLower.includes('payable') || nameLower.includes('loan') || 
      nameLower.includes('debt') || nameLower.includes('credit card') || 
      nameLower.includes('mortgage')) {
    return 'Liability';
  }
  
  if (nameLower.includes('equity') || nameLower.includes('capital') || 
      nameLower.includes('retained earnings') || nameLower.includes('distribution')) {
    return 'Equity';
  }
  
  if (nameLower.includes('other income') || nameLower.includes('interest income')) {
    return 'OtherIncome';
  }
  if (nameLower.includes('other expense') || nameLower.includes('interest expense') || 
      nameLower.includes('depreciation') || nameLower.includes('amortization')) {
    return 'OtherExpense';
  }
  
  return 'Expense';
}

async function fetchGoogleSheetData() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
    const proxyUrl = CORS_PROXY + encodeURIComponent(url);
    
    console.log('Fetching ledger data from Google Sheets with GID:', GID);
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('Raw CSV data received, length:', text.length);
    
    const rows = text.split('\n').map(row => {
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
    
    if (rows.length < 6) {
      throw new Error('Sheet has insufficient data');
    }
    
    const headers = rows[4];
    console.log('Headers found:', headers);
    
    // Column AB is index 27 (A=0, B=1, ... AB=27)
    // Column AC is index 28
    const mostRecentDebitCol = 27;  // Column AB
    const mostRecentCreditCol = 28; // Column AC
    
    console.log(`Using columns AB (${mostRecentDebitCol}) for debit and AC (${mostRecentCreditCol}) for credit`);
    
    const accountBalances = new Map();
    const dataRows = rows.slice(5).filter(row => row.length > mostRecentCreditCol && row[0]);
    
    console.log('Processing', dataRows.length, 'data rows');
    
    dataRows.forEach((row, idx) => {
      const accountName = row[0];
      const accountNumber = row[1] || '';
      const mainType = row[3] || '';
      const subType = row[4] || '';
      
      if (!accountName || accountName.trim() === '') return;
      
      const debitStr = row[mostRecentDebitCol] || '0';
      const creditStr = row[mostRecentCreditCol] || '0';
      
      const debit = parseFloat(String(debitStr).replace(/[$,\s()]/g, '').replace(/\((.+)\)/, '-$1')) || 0;
      const credit = parseFloat(String(creditStr).replace(/[$,\s()]/g, '').replace(/\((.+)\)/, '-$1')) || 0;
      
      let accountType = getAccountTypeFromClassification(mainType, subType);
      if (!accountType) {
        accountType = getAccountTypeFromName(accountName);
      }
      
      let balance;
      if (accountType === 'Asset' || accountType === 'Expense' || 
          accountType === 'COGS' || accountType === 'OtherExpense') {
        balance = debit - credit;
      } else {
        balance = credit - debit;
      }
      
      const key = accountName;
      if (accountBalances.has(key)) {
        const existing = accountBalances.get(key);
        accountBalances.set(key, {
          account: accountName,
          number: accountNumber,
          type: accountType,
          mainType: mainType,
          subType: subType,
          amount: existing.amount + balance
        });
      } else {
        accountBalances.set(key, {
          account: accountName,
          number: accountNumber,
          type: accountType,
          mainType: mainType,
          subType: subType,
          amount: balance
        });
      }
      
      if (idx < 10) {
        console.log(`Row ${idx}: ${accountName} (${mainType}/${subType} -> ${accountType})`);
        console.log(`  Debit: ${debit}, Credit: ${credit}, Balance: ${balance}`);
      }
    });
    
    const items = Array.from(accountBalances.values())
      .filter(item => Math.abs(item.amount) > 0.01)
      .map(item => ({
        account: item.account,
        type: item.type,
        amount: Math.abs(item.amount)
      }));
    
    console.log('Aggregated accounts:', items.length);
    
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

function summarize(items) {
  const sumBy = (filterFn) => items.filter(filterFn).reduce((a, b) => a + b.amount, 0);
  
  const revenue = Math.abs(sumBy((i) => i.type === "Revenue"));
  const cogs = Math.abs(sumBy((i) => i.type === "COGS"));
  const opex = Math.abs(sumBy((i) => i.type === "Expense"));
  const otherIncome = Math.abs(sumBy((i) => i.type === "OtherIncome"));
  const otherExpense = Math.abs(sumBy((i) => i.type === "OtherExpense"));
  const grossProfit = revenue - cogs;
  const operatingIncome = grossProfit - opex;
  const ebitda = grossProfit - opex + otherIncome - otherExpense;
  const netIncome = ebitda;

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

  const currentAssets = cash + ar + inv;
  const currentLiabilities = ap + std;
  const currentRatio = currentLiabilities !== 0 ? currentAssets / currentLiabilities : Infinity;
  const quickRatio = currentLiabilities !== 0 ? (cash + ar) / currentLiabilities : Infinity;
  const cashRatio = currentLiabilities !== 0 ? cash / currentLiabilities : Infinity;
  const workingCapital = currentAssets - currentLiabilities;

  const grossMarginPct = revenue !== 0 ? (grossProfit / revenue) * 100 : 0;
  const operatingMarginPct = revenue !== 0 ? (operatingIncome / revenue) * 100 : 0;
  const ebitdaMarginPct = revenue !== 0 ? (ebitda / revenue) * 100 : 0;
  const netMarginPct = revenue !== 0 ? (netIncome / revenue) * 100 : 0;
  const ROA = assets !== 0 ? (netIncome / assets) * 100 : 0;
  const ROE = equity !== 0 ? (netIncome / equity) * 100 : 0;
  const ROCE = (assets - currentLiabilities) !== 0 ? (operatingIncome / (assets - currentLiabilities)) * 100 : 0;

  const assetTurnover = assets !== 0 ? revenue / assets : 0;
  const DSO = revenue > 0 ? (ar / revenue) * 365 : null;
  const DIO = cogs > 0 ? (inv / cogs) * 365 : null;
  const DPO = cogs > 0 ? (ap / cogs) * 365 : null;
  const CCC = (DSO || 0) + (DIO || 0) - (DPO || 0);
  const invTurns = inv > 0 && cogs > 0 ? (cogs / inv) : null;

  const debtToAssets = assets !== 0 ? debt / assets : 0;
  const debtToEquity = equity !== 0 ? debt / equity : 0;
  const debtToEBITDA = ebitda !== 0 ? debt / ebitda : null;
  const interestCoverage = otherExpense > 0 ? ebitda / otherExpense : null;
  const equityMultiplier = equity !== 0 ? assets / equity : 0;

  const dupontROE = netMarginPct * assetTurnover * equityMultiplier;

  return {
    revenue, cogs, opex, otherIncome, otherExpense, grossProfit, operatingIncome, ebitda, netIncome,
    assets, cash, ar, inv, liabilities, ap, std, ltd, debt, equity, workingCapital,
    currentRatio, quickRatio, cashRatio,
    grossMarginPct, operatingMarginPct, ebitdaMarginPct, netMarginPct,
    ROA, ROE, ROCE, assetTurnover,
    DSO, DIO, DPO, CCC, invTurns,
    debtToAssets, debtToEquity, debtToEBITDA, interestCoverage, equityMultiplier,
    dupontROE
  };
}

// Margin Moves with Sam Component
function MarginMovesWithSam({ kpi, onScenarioChange }) {
  const [selectedScenario, setSelectedScenario] = useState('current');
  const [customInputs, setCustomInputs] = useState({
    revenueChange: 0,
    cogsReduction: 0,
    opexReduction: 0,
    priceIncrease: 0,
    volumeChange: 0
  });

  const getInsights = () => {
    const insights = [];
    
    if (kpi.grossMarginPct < 28) {
      insights.push({
        type: 'critical',
        title: 'Margin Crisis Alert',
        message: `Your gross margin at ${kpi.grossMarginPct.toFixed(1)}% is critically below industry standards.`,
        action: 'Immediate action needed: Review pricing strategy, renegotiate supplier contracts, or consider product mix optimization.',
        impact: `A 2% price increase could add $${((kpi.revenue * 0.02) / 1000).toFixed(0)}K to your bottom line.`
      });
    }

    if (kpi.DIO > 75) {
      insights.push({
        type: 'warning',
        title: 'Inventory Drag',
        message: `${kpi.DIO?.toFixed(0) || 'N/A'} days of inventory is tying up $${(kpi.inv / 1000).toFixed(0)}K in working capital.`,
        action: 'Implement JIT inventory management or improve demand forecasting.',
        impact: `Reducing DIO to 60 days would free up $${((kpi.inv * 0.2) / 1000).toFixed(0)}K in cash.`
      });
    }

    if (kpi.ebitdaMarginPct < 12) {
      insights.push({
        type: 'warning',
        title: 'EBITDA Squeeze',
        message: `Your EBITDA margin of ${kpi.ebitdaMarginPct.toFixed(1)}% limits growth investments.`,
        action: 'Focus on operational efficiency: automate repetitive tasks, optimize headcount, renegotiate fixed costs.',
        impact: `Every 1% improvement in EBITDA margin = $${(kpi.revenue * 0.01 / 1000).toFixed(0)}K additional cash flow.`
      });
    }

    if (kpi.CCC > 75) {
      insights.push({
        type: 'info',
        title: 'Cash Cycle Opportunity',
        message: `Your ${kpi.CCC?.toFixed(0) || 'N/A'}-day cash cycle is above optimal.`,
        action: 'Negotiate better payment terms: 2/10 net 30 discounts, factor receivables, or extend payables.',
        impact: `Improving CCC by 15 days could reduce working capital needs by $${((kpi.revenue / 365 * 15) / 1000).toFixed(0)}K.`
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'good',
        title: 'Strong Performance',
        message: 'Your financial metrics are healthy across the board.',
        action: 'Consider growth investments or strategic acquisitions to leverage your strong position.',
        impact: 'You have the financial flexibility to pursue aggressive growth strategies.'
      });
    }

    return insights;
  };

  const calculateScenario = () => {
    const scenario = { ...kpi };
    
    scenario.revenue = kpi.revenue * (1 + customInputs.revenueChange / 100);
    scenario.cogs = kpi.cogs * (1 - customInputs.cogsReduction / 100);
    scenario.opex = kpi.opex * (1 - customInputs.opexReduction / 100);
    
    if (customInputs.priceIncrease > 0) {
      scenario.revenue *= (1 + customInputs.priceIncrease / 100);
      const volumeImpact = -customInputs.priceIncrease * 0.3;
      scenario.revenue *= (1 + volumeImpact / 100);
    }
    
    scenario.grossProfit = scenario.revenue - scenario.cogs;
    scenario.grossMarginPct = (scenario.grossProfit / scenario.revenue) * 100;
    scenario.ebitda = scenario.grossProfit - scenario.opex;
    scenario.ebitdaMarginPct = (scenario.ebitda / scenario.revenue) * 100;
    
    return scenario;
  };

  const scenarioKPI = calculateScenario();
  const insights = getInsights();

  const scenarios = {
    'pricing-power': {
      name: '3% Price Increase',
      revenueChange: 3,
      cogsReduction: 0,
      opexReduction: 0,
      description: 'Test pricing elasticity'
    },
    'operational-excellence': {
      name: 'Operational Excellence',
      revenueChange: 0,
      cogsReduction: 5,
      opexReduction: 10,
      description: 'Cost reduction focus'
    },
    'growth-mode': {
      name: 'Growth Investment',
      revenueChange: 20,
      cogsReduction: -2,
      opexReduction: -15,
      description: 'Invest for growth'
    },
    'turnaround': {
      name: 'Turnaround Plan',
      revenueChange: -10,
      cogsReduction: 8,
      opexReduction: 20,
      description: 'Survival mode'
    }
  };

  return (
    <div className="space-y-4">
      <Card gradient={true}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <SamAvatar size={48} />
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Margin Moves with Sam
              </h3>
              <p className="text-xs text-zinc-400">Your AI CFO Advisor • Live Analysis</p>
            </div>
          </div>
          <Badge tone="good" pulse={true}>
            <Brain className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
        
        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-lg border ${
                insight.type === 'critical' ? 'bg-red-900/20 border-red-800' :
                insight.type === 'warning' ? 'bg-amber-900/20 border-amber-800' :
                insight.type === 'good' ? 'bg-emerald-900/20 border-emerald-800' :
                'bg-blue-900/20 border-blue-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  insight.type === 'critical' ? 'bg-red-800' :
                  insight.type === 'warning' ? 'bg-amber-800' :
                  insight.type === 'good' ? 'bg-emerald-800' :
                  'bg-blue-800'
                }`}>
                  {insight.type === 'good' ? 
                    <CheckCircle2 className="w-4 h-4" /> :
                    <AlertTriangle className="w-4 h-4" />
                  }
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                  <p className="text-xs text-zinc-400 mb-2">{insight.message}</p>
                  <div className="bg-black/30 rounded p-2">
                    <p className="text-xs text-zinc-300 mb-1">
                      <span className="text-green-400">→ Action:</span> {insight.action}
                    </p>
                    <p className="text-xs text-zinc-300">
                      <span className="text-blue-400">💰 Impact:</span> {insight.impact}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card gradient={true}>
        <SectionTitle 
          icon={Calculator} 
          title="What-If Scenario Modeler" 
          subtitle="Test strategic moves in real-time"
        />
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
          {Object.entries(scenarios).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => {
                setCustomInputs({
                  revenueChange: scenario.revenueChange,
                  cogsReduction: scenario.cogsReduction,
                  opexReduction: scenario.opexReduction,
                  priceIncrease: 0,
                  volumeChange: 0
                });
                setSelectedScenario(key);
              }}
              className={`p-3 rounded-lg border transition-all ${
                selectedScenario === key 
                  ? 'bg-blue-900/30 border-blue-600' 
                  : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <p className="text-xs font-semibold mb-1">{scenario.name}</p>
              <p className="text-xs text-zinc-500">{scenario.description}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <div>
            <label className="text-xs text-zinc-400">Revenue Δ%</label>
            <input
              type="number"
              value={customInputs.revenueChange}
              onChange={(e) => {
                setCustomInputs({...customInputs, revenueChange: parseFloat(e.target.value) || 0});
                setSelectedScenario('custom');
              }}
              className="w-full mt-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400">COGS ↓%</label>
            <input
              type="number"
              value={customInputs.cogsReduction}
              onChange={(e) => {
                setCustomInputs({...customInputs, cogsReduction: parseFloat(e.target.value) || 0});
                setSelectedScenario('custom');
              }}
              className="w-full mt-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400">Opex ↓%</label>
            <input
              type="number"
              value={customInputs.opexReduction}
              onChange={(e) => {
                setCustomInputs({...customInputs, opexReduction: parseFloat(e.target.value) || 0});
                setSelectedScenario('custom');
              }}
              className="w-full mt-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400">Price ↑%</label>
            <input
              type="number"
              value={customInputs.priceIncrease}
              onChange={(e) => {
                setCustomInputs({...customInputs, priceIncrease: parseFloat(e.target.value) || 0});
                setSelectedScenario('custom');
              }}
              className="w-full mt-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-sm"
            />
          </div>
          <button
            onClick={() => {
              setCustomInputs({
                revenueChange: 0,
                cogsReduction: 0,
                opexReduction: 0,
                priceIncrease: 0,
                volumeChange: 0
              });
              setSelectedScenario('current');
            }}
            className="mt-5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="p-3 bg-zinc-900/50 rounded-lg">
            <p className="text-xs text-zinc-400 mb-2">Gross Margin Impact</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">{kpi.grossMarginPct.toFixed(1)}%</span>
              <span className="text-xs">→</span>
              <span className={`text-lg font-semibold ${
                scenarioKPI.grossMarginPct > kpi.grossMarginPct ? 'text-green-400' : 
                scenarioKPI.grossMarginPct < kpi.grossMarginPct ? 'text-red-400' : ''
              }`}>
                {scenarioKPI.grossMarginPct.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Δ {(scenarioKPI.grossMarginPct - kpi.grossMarginPct).toFixed(1)} pts
            </p>
          </div>

          <div className="p-3 bg-zinc-900/50 rounded-lg">
            <p className="text-xs text-zinc-400 mb-2">EBITDA Impact</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">{dollars(kpi.ebitda)}</span>
              <span className="text-xs">→</span>
              <span className={`text-lg font-semibold ${
                scenarioKPI.ebitda > kpi.ebitda ? 'text-green-400' : 
                scenarioKPI.ebitda < kpi.ebitda ? 'text-red-400' : ''
              }`}>
                {dollars(scenarioKPI.ebitda)}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Δ {dollars(scenarioKPI.ebitda - kpi.ebitda)}
            </p>
          </div>

          <div className="p-3 bg-zinc-900/50 rounded-lg">
            <p className="text-xs text-zinc-400 mb-2">Cash Flow Impact (Annual)</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-semibold ${
                scenarioKPI.ebitda > kpi.ebitda ? 'text-green-400' : 
                scenarioKPI.ebitda < kpi.ebitda ? 'text-red-400' : 
                'text-zinc-400'
              }`}>
                {scenarioKPI.ebitda > kpi.ebitda ? '+' : ''}{dollars((scenarioKPI.ebitda - kpi.ebitda) * 12)}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Additional annual cash generation
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Metric Component
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

// Alerts Component
function Alerts({ kpi, targets }) {
  const items = [];
  
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
  
  if (kpi.grossMarginPct < targets.grossMarginPctMin) {
    items.push({
      tone: "warn",
      icon: TrendDown,
      title: "Margin Compression",
      text: `Gross Margin ${percent(kpi.grossMarginPct)} below target ${percent(targets.grossMarginPctMin)}`,
      action: "Review pricing strategy and negotiate supplier contracts."
    });
  }
  
  if (kpi.CCC > targets.CCCMax) {
    items.push({
      tone: "warn",
      icon: RefreshCw,
      title: "Cash Conversion Cycle",
      text: `CCC ${kpi.CCC?.toFixed(0) || 'N/A'} days > ${targets.CCCMax} days`,
      action: "Optimize inventory levels and accelerate collections."
    });
  }
  
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
  const [selectedView, setSelectedView] = useState('overview');
  const [debugOpen, setDebugOpen] = useState(false);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [sheetsError, setSheetsError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
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

  const loadSheetsData = useCallback(async () => {
    if (isLoadingSheets) return;
    
    setIsLoadingSheets(true);
    setSheetsError(null);
    
    try {
      const data = await fetchGoogleSheetData();
      if (data && data.length > 0) {
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

  useEffect(() => {
    if (isInitialLoad) {
      loadSheetsData();
    }
    
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing Google Sheets data...');
        loadSheetsData();
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadSheetsData, isInitialLoad]);

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
        
        {autoRefresh && (
          <Card className="mb-4 border-green-800/40 bg-green-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm text-green-300">
                  Real-time sync active • Refreshing every {refreshInterval / 1000} seconds • Reading columns AB & AC
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

        <Card className="mb-6" gradient={true}>
          <SectionTitle 
            icon={FileSpreadsheet} 
            title="Trial Balance Input" 
            subtitle="Account,Type,Amount format (Auto-aggregated from ledger columns AB & AC)"
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

        <AnimatePresence mode="wait">
          {selectedView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Margin Moves with Sam - Featured at Top */}
              <div className="mb-6">
                <MarginMovesWithSam 
                  kpi={kpi} 
                  onScenarioChange={(scenario) => {
                    console.log('Scenario changed:', scenario);
                  }}
                />
              </div>

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
                            {isFinite(item.value) ? item.value.toFixed(2) : '—'}
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

          {selectedView === 'liquidity' && (
            <motion.div
              key="liquidity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <Metric label="Cash" value={dollars(kpi.cash)} sublabel="Immediate liquidity" />
                <Metric label="Working Capital" value={dollars(kpi.workingCapital)} sublabel="Operating cushion" />
                <Metric label="Cash Conversion" value={`${kpi.CCC?.toFixed(0) || '—'} days`} sublabel="Days to convert" />
              </div>

              <Card>
                <SectionTitle icon={Activity} title="Cash Flow Metrics" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 bg-zinc-900/50 rounded-lg">
                    <p className="text-xs text-zinc-400">DSO</p>
                    <p className="text-lg font-semibold">{kpi.DSO?.toFixed(0) || '—'} days</p>
                  </div>
                  <div className="p-3 bg-zinc-900/50 rounded-lg">
                    <p className="text-xs text-zinc-400">DIO</p>
                    <p className="text-lg font-semibold">{kpi.DIO?.toFixed(0) || '—'} days</p>
                  </div>
                  <div className="p-3 bg-zinc-900/50 rounded-lg">
                    <p className="text-xs text-zinc-400">DPO</p>
                    <p className="text-lg font-semibold">{kpi.DPO?.toFixed(0) || '—'} days</p>
                  </div>
                  <div className="p-3 bg-zinc-900/50 rounded-lg">
                    <p className="text-xs text-zinc-400">Inventory Turns</p>
                    <p className="text-lg font-semibold">{kpi.invTurns?.toFixed(1) || '—'}x</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {selectedView === 'efficiency' && (
            <motion.div
              key="efficiency"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <SectionTitle icon={Activity} title="Operating Efficiency" />
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Asset Turnover</span>
                      <span className="text-sm font-semibold">{kpi.assetTurnover.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Operating Margin</span>
                      <span className="text-sm font-semibold">{kpi.operatingMarginPct.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">ROCE</span>
                      <span className="text-sm font-semibold">{kpi.ROCE.toFixed(1)}%</span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <SectionTitle icon={RefreshCw} title="Working Capital Cycle" />
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Cash Conversion Cycle</span>
                      <span className="text-sm font-semibold">{kpi.CCC?.toFixed(0) || '—'} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Receivables Period</span>
                      <span className="text-sm font-semibold">{kpi.DSO?.toFixed(0) || '—'} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Payables Period</span>
                      <span className="text-sm font-semibold">{kpi.DPO?.toFixed(0) || '—'} days</span>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {selectedView === 'leverage' && (
            <motion.div
              key="leverage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <Metric label="Total Debt" value={dollars(kpi.debt)} sublabel="Short + Long term" />
                <Metric label="Debt/Equity" value={`${kpi.debtToEquity.toFixed(2)}x`} sublabel="Leverage ratio" />
                <Metric label="Debt/EBITDA" value={`${kpi.debtToEBITDA?.toFixed(2) || '—'}x`} sublabel="Coverage multiple" />
              </div>

              <Card>
                <SectionTitle icon={Landmark} title="Capital Structure" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 bg-zinc-900/50 rounded-lg">
                    <p className="text-xs text-zinc-400">Total Assets</p>
                    <p className="text-lg font-semibold">{dollars(kpi.assets)}</p>
                  </div>
                  <div className="p-3 bg-zinc-900/50 rounded-lg">
                    <p className="text-xs text-zinc-400">Total Liabilities</p>
                    <p className="text-lg font-semibold">{dollars(kpi.liabilities)}</p>
                  </div>
                  <div className="p-3 bg-zinc-900/50 rounded-lg">
                    <p className="text-xs text-zinc-400">Equity</p>
                    <p className="text-lg font-semibold">{dollars(kpi.equity)}</p>
                  </div>
                  <div className="p-3 bg-zinc-900/50 rounded-lg">
                    <p className="text-xs text-zinc-400">Interest Coverage</p>
                    <p className="text-lg font-semibold">{kpi.interestCoverage?.toFixed(1) || '—'}x</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <DebugPanel data={kpi} isOpen={debugOpen} onToggle={() => setDebugOpen(!debugOpen)} />

        <div className="text-center text-xs text-zinc-500 mt-8">
          BizGro KPI 2.0 Digital CFO Dashboard with Margin Moves with Sam™ 
          • {autoRefresh ? '🟢 Real-time sync active' : '⭕ Manual refresh mode'}
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
