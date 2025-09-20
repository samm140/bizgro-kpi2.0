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

// Enhanced Sam Avatar Component with dynamic moods
const SamAvatar = ({ size = 48, mood = 'thinking' }) => {
  // Different moods for different insights
  const moods = {
    thinking: { eyebrowAngle: 15, mouthCurve: 'M 35 58 Q 50 63, 65 58' },
    concerned: { eyebrowAngle: -10, mouthCurve: 'M 35 62 Q 50 57, 65 62' },
    happy: { eyebrowAngle: 5, mouthCurve: 'M 35 55 Q 50 68, 65 55' },
    alert: { eyebrowAngle: -15, mouthCurve: 'M 40 60 L 60 60' }
  };
  
  const currentMood = moods[mood] || moods.thinking;
  
  return (
    <div 
      className="relative rounded-full bg-gradient-to-br from-amber-600 to-amber-800 p-0.5"
      style={{ width: size, height: size }}
    >
      <div className="rounded-full bg-zinc-900 p-1 w-full h-full flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Face base */}
          <ellipse cx="50" cy="45" rx="32" ry="35" fill="#D4A574" />
          
          {/* Hair */}
          <path d="M 20 30 Q 50 15, 80 30 L 80 25 Q 50 10, 20 25 Z" fill="#2C1810" />
          
          {/* Eyebrows */}
          <path 
            d={`M 30 35 Q 35 ${33 - currentMood.eyebrowAngle/3}, 40 35`} 
            fill="none" 
            stroke="#2C1810" 
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path 
            d={`M 60 35 Q 65 ${33 - currentMood.eyebrowAngle/3}, 70 35`} 
            fill="none" 
            stroke="#2C1810" 
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          
          {/* Eyes */}
          <ellipse cx="36" cy="42" rx="4" ry="5" fill="#2C1810" />
          <ellipse cx="64" cy="42" rx="4" ry="5" fill="#2C1810" />
          <ellipse cx="37" cy="41" rx="1.5" ry="2" fill="#FFF" opacity="0.8" />
          <ellipse cx="65" cy="41" rx="1.5" ry="2" fill="#FFF" opacity="0.8" />
          
          {/* Beard */}
          <path d="M 35 55 Q 50 65, 65 55 L 65 70 Q 50 75, 35 70 Z" fill="#2C1810" opacity="0.7" />
          <path d="M 45 60 L 45 68 Q 50 70, 55 68 L 55 60" fill="#2C1810" opacity="0.5" />
          
          {/* Mouth */}
          <path 
            d={currentMood.mouthCurve} 
            fill="none" 
            stroke="#2C1810" 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
          
          {/* Suit jacket collar */}
          <path d="M 20 80 L 35 75 L 50 78 L 65 75 L 80 80 L 80 100 L 20 100 Z" fill="#6B4423" />
          <path d="M 45 78 L 50 85 L 55 78 L 50 100" fill="#B8341C" />
        </svg>
      </div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900 animate-pulse" />
    </div>
  );
};

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

// Updated Google Sheets Integration with better data processing
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
    console.log('Total columns:', headers.length);
    
    // Column AB is index 27, Column AC is index 28
    const mostRecentDebitCol = 27;  // Column AB
    const mostRecentCreditCol = 28; // Column AC
    
    console.log(`Using columns AB (${mostRecentDebitCol}) for debit and AC (${mostRecentCreditCol}) for credit`);
    
    // Process data rows with detailed tracking
    const accountBalances = new Map();
    const dataRows = rows.slice(5).filter(row => row.length > mostRecentCreditCol && row[0] && row[0].trim() !== '');
    
    console.log('Processing', dataRows.length, 'data rows');
    
    // Track totals by type for verification
    const typeTotals = {
      Asset: { debit: 0, credit: 0 },
      Liability: { debit: 0, credit: 0 },
      Equity: { debit: 0, credit: 0 },
      Revenue: { debit: 0, credit: 0 },
      COGS: { debit: 0, credit: 0 },
      Expense: { debit: 0, credit: 0 },
      OtherIncome: { debit: 0, credit: 0 },
      OtherExpense: { debit: 0, credit: 0 }
    };
    
    dataRows.forEach((row, idx) => {
      const accountName = row[0].trim();
      const accountNumber = row[1] || '';
      const mainType = row[3] || ''; // Column D
      const subType = row[4] || '';  // Column E
      
      if (!accountName) return;
      
      // Parse debit and credit values
      const debitStr = row[mostRecentDebitCol] || '0';
      const creditStr = row[mostRecentCreditCol] || '0';
      
      // Handle various number formats including parentheses for negatives
      const parseAmount = (str) => {
        const cleaned = String(str)
          .replace(/[$,\s]/g, '')
          .replace(/\((.+)\)/, '-$1')
          .replace(/[^\d.-]/g, '');
        return parseFloat(cleaned) || 0;
      };
      
      const debit = Math.abs(parseAmount(debitStr));
      const credit = Math.abs(parseAmount(creditStr));
      
      // Skip if both are zero
      if (debit === 0 && credit === 0) return;
      
      // Determine account type
      let accountType = getAccountTypeFromClassification(mainType, subType);
      if (!accountType) {
        accountType = getAccountTypeFromName(accountName);
      }
      
      // Track totals for debugging
      if (typeTotals[accountType]) {
        typeTotals[accountType].debit += debit;
        typeTotals[accountType].credit += credit;
      }
      
      // Calculate balance based on normal balance rules
      let balance;
      
      // Assets, Expenses, COGS normally have debit balances
      if (accountType === 'Asset' || accountType === 'Expense' || 
          accountType === 'COGS' || accountType === 'OtherExpense') {
        balance = debit - credit;
      } 
      // Liabilities, Equity, Revenue normally have credit balances
      else {
        balance = credit - debit;
      }
      
      // Use absolute value for aggregation
      balance = Math.abs(balance);
      
      // Aggregate by account name
      const key = `${accountName}_${accountType}`;
      if (accountBalances.has(key)) {
        const existing = accountBalances.get(key);
        accountBalances.set(key, {
          account: accountName,
          number: accountNumber,
          type: accountType,
          mainType: mainType,
          subType: subType,
          amount: existing.amount + balance,
          debit: existing.debit + debit,
          credit: existing.credit + credit
        });
      } else {
        accountBalances.set(key, {
          account: accountName,
          number: accountNumber,
          type: accountType,
          mainType: mainType,
          subType: subType,
          amount: balance,
          debit: debit,
          credit: credit
        });
      }
      
      // Detailed logging for first few rows
      if (idx < 20) {
        console.log(`Row ${idx}: ${accountName} (${accountType})`);
        console.log(`  Debit: ${debit.toFixed(2)}, Credit: ${credit.toFixed(2)}, Balance: ${balance.toFixed(2)}`);
      }
    });
    
    // Log type totals for verification
    console.log('Type Totals:', typeTotals);
    
    // Convert to array and prepare final data
    const items = Array.from(accountBalances.values())
      .filter(item => item.amount > 0.01)
      .map(item => ({
        account: item.account,
        type: item.type,
        amount: item.amount,
        debit: item.debit,
        credit: item.credit
      }));
    
    console.log('Final aggregated accounts:', items.length);
    
    // Summary by type
    const summary = {};
    items.forEach(item => {
      if (!summary[item.type]) {
        summary[item.type] = { 
          count: 0, 
          total: 0,
          debitTotal: 0,
          creditTotal: 0
        };
      }
      summary[item.type].count++;
      summary[item.type].total += item.amount;
      summary[item.type].debitTotal += item.debit || 0;
      summary[item.type].creditTotal += item.credit || 0;
    });
    
    console.log('Final Summary by Type:', summary);
    
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

// Helper function for empty KPI object
function getEmptyKPI() {
  return {
    revenue: 0, cogs: 0, opex: 0, otherIncome: 0, otherExpense: 0,
    grossProfit: 0, operatingIncome: 0, ebitda: 0, netIncome: 0,
    assets: 0, cash: 0, ar: 0, inv: 0, fixedAssets: 0,
    liabilities: 0, ap: 0, std: 0, ltd: 0, debt: 0, equity: 0,
    currentAssets: 0, currentLiabilities: 0, workingCapital: 0,
    currentRatio: 0, quickRatio: 0, cashRatio: 0,
    grossMarginPct: 0, operatingMarginPct: 0, ebitdaMarginPct: 0, netMarginPct: 0,
    ROA: 0, ROE: 0, ROCE: 0, assetTurnover: 0,
    DSO: 0, DIO: 0, DPO: 0, CCC: 0, invTurns: 0,
    debtToAssets: 0, debtToEquity: 0, debtToEBITDA: null,
    interestCoverage: null, equityMultiplier: 0, dupontROE: 0
  };
}

// Fixed summarize function with corrected calculations
function summarize(items) {
  if (!items || items.length === 0) {
    console.log('No items to summarize');
    return getEmptyKPI();
  }
  
  // Helper functions
  const sumBy = (filterFn) => {
    const filtered = items.filter(filterFn);
    const sum = filtered.reduce((a, b) => a + (b.amount || 0), 0);
    return Math.abs(sum);
  };
  
  const sumByAccountName = (type, namePatterns) => {
    const filtered = items.filter(i => {
      if (i.type !== type) return false;
      const accountLower = i.account.toLowerCase();
      return namePatterns.some(pattern => accountLower.includes(pattern));
    });
    const sum = filtered.reduce((a, b) => a + (b.amount || 0), 0);
    return Math.abs(sum);
  };
  
  // P&L Items
  const revenue = sumBy((i) => i.type === "Revenue");
  const cogs = sumBy((i) => i.type === "COGS");
  const opex = sumBy((i) => i.type === "Expense");
  const otherIncome = sumBy((i) => i.type === "OtherIncome");
  const otherExpense = sumBy((i) => i.type === "OtherExpense");
  
  const grossProfit = revenue - cogs;
  const operatingIncome = grossProfit - opex;
  const ebitda = operatingIncome + otherIncome - otherExpense;
  const netIncome = ebitda;
  
  // Balance Sheet Items - look for specific account names
  const assets = sumBy((i) => i.type === "Asset");
  
  // Look for cash accounts - search for 'bus complete chk' as shown in your data
  const cash = items
    .filter(i => i.type === "Asset" && 
      (i.account.toLowerCase().includes("cash") || 
       i.account.toLowerCase().includes("bank") ||
       i.account.toLowerCase().includes("chk") ||
       i.account.toLowerCase().includes("checking")))
    .reduce((sum, item) => sum + item.amount, 0);
    
  // Look for AR accounts
  const ar = items
    .filter(i => i.type === "Asset" && 
      (i.account.toLowerCase().includes("receivable") ||
       i.account.toLowerCase().includes("a/r")))
    .reduce((sum, item) => sum + item.amount, 0);
    
  // Look for inventory
  const inv = items
    .filter(i => i.type === "Asset" && 
      (i.account.toLowerCase().includes("inventory") ||
       i.account.toLowerCase().includes("stock")))
    .reduce((sum, item) => sum + item.amount, 0);
    
  const fixedAssets = items
    .filter(i => i.type === "Asset" && 
      (i.account.toLowerCase().includes("equipment") ||
       i.account.toLowerCase().includes("vehicle") ||
       i.account.toLowerCase().includes("machinery") ||
       i.account.toLowerCase().includes("furniture") ||
       i.account.toLowerCase().includes("building") ||
       i.account.toLowerCase().includes("accumulated depreciation")))
    .reduce((sum, item) => sum + item.amount, 0);
  
  const liabilities = sumBy((i) => i.type === "Liability");
  
  // Look for AP - search for 'due from irs' and other payables
  const ap = items
    .filter(i => i.type === "Liability" && 
      (i.account.toLowerCase().includes("payable") ||
       i.account.toLowerCase().includes("a/p") ||
       i.account.toLowerCase().includes("due from") ||
       i.account.toLowerCase().includes("due to")))
    .reduce((sum, item) => sum + item.amount, 0);
    
  // Look for short term debt
  const std = items
    .filter(i => i.type === "Liability" && 
      (i.account.toLowerCase().includes("short term") ||
       i.account.toLowerCase().includes("current portion") ||
       i.account.toLowerCase().includes("line of credit")))
    .reduce((sum, item) => sum + item.amount, 0);
    
  // Look for long term debt - search for 'capitalized mortgage'
  const ltd = items
    .filter(i => i.type === "Liability" && 
      (i.account.toLowerCase().includes("long term") ||
       i.account.toLowerCase().includes("mortgage") ||
       i.account.toLowerCase().includes("loan") ||
       i.account.toLowerCase().includes("note payable")))
    .reduce((sum, item) => sum + item.amount, 0);
  
  const equity = sumBy((i) => i.type === "Equity") || (assets - liabilities);
  const debt = std + ltd;
  
  // Calculate current assets and liabilities properly
  const currentAssets = cash + ar + inv;
  const currentLiabilities = ap + std;
  
  const workingCapital = currentAssets - currentLiabilities;
  
  // Safe division helper
  const safeDivide = (num, den, def = 0) => {
    if (!den || den === 0 || !isFinite(num/den)) return def;
    return num / den;
  };
  
  // Liquidity Ratios
  const currentRatio = safeDivide(currentAssets, currentLiabilities, 0);
  const quickRatio = safeDivide(cash + ar, currentLiabilities, 0);
  const cashRatio = safeDivide(cash, currentLiabilities, 0);
  
  // Profitability Ratios
  const grossMarginPct = safeDivide(grossProfit, revenue, 0) * 100;
  const operatingMarginPct = safeDivide(operatingIncome, revenue, 0) * 100;
  const ebitdaMarginPct = safeDivide(ebitda, revenue, 0) * 100;
  const netMarginPct = safeDivide(netIncome, revenue, 0) * 100;
  const ROA = safeDivide(netIncome, assets, 0) * 100;
  const ROE = safeDivide(netIncome, equity, 0) * 100;
  const ROCE = safeDivide(operatingIncome, (assets - currentLiabilities), 0) * 100;
  
  // Efficiency Ratios - Fixed calculations
  const assetTurnover = safeDivide(revenue, assets, 0);
  
  // Days calculations - annualized (assuming monthly data)
  const annualRevenue = revenue * 12;
  const annualCOGS = cogs * 12;
  
  const DSO = ar > 0 && annualRevenue > 0 ? (ar / annualRevenue) * 365 : 0;
  const DIO = inv > 0 && annualCOGS > 0 ? (inv / annualCOGS) * 365 : 0;
  const DPO = ap > 0 && annualCOGS > 0 ? (ap / annualCOGS) * 365 : 0;
  const CCC = DSO + DIO - DPO;
  const invTurns = inv > 0 ? safeDivide(annualCOGS, inv, 0) : 0;
  
  // Leverage Ratios
  const debtToAssets = safeDivide(debt, assets, 0);
  const debtToEquity = safeDivide(debt, equity, 0);
  const debtToEBITDA = ebitda > 0 ? safeDivide(debt, (ebitda * 12), 0) : 0; // Annualized EBITDA
  const interestCoverage = otherExpense > 0 ? safeDivide(ebitda, otherExpense, 0) : 0;
  const equityMultiplier = safeDivide(assets, equity, 0);
  
  const dupontROE = (netMarginPct / 100) * assetTurnover * equityMultiplier * 100;
  
  const result = {
    // P&L
    revenue, cogs, opex, otherIncome, otherExpense, 
    grossProfit, operatingIncome, ebitda, netIncome,
    // Balance Sheet
    assets, cash, ar, inv, fixedAssets,
    liabilities, ap, std, ltd, debt, equity, 
    currentAssets, currentLiabilities, workingCapital,
    // Ratios
    currentRatio, quickRatio, cashRatio,
    grossMarginPct, operatingMarginPct, ebitdaMarginPct, netMarginPct,
    ROA, ROE, ROCE, assetTurnover,
    DSO, DIO, DPO, CCC, invTurns,
    debtToAssets, debtToEquity, debtToEBITDA, 
    interestCoverage, equityMultiplier,
    dupontROE
  };
  
  console.log('Calculated KPIs:', {
    cash, ar, inv, ap,
    currentAssets, currentLiabilities,
    DSO, DIO, DPO, CCC,
    debt, equity, debtToEBITDA
  });
  
  return result;
}

// Updated Margin Moves with Sam Component
function MarginMovesWithSam({ kpi, onScenarioChange }) {
  const [selectedScenario, setSelectedScenario] = useState('current');
  const [customInputs, setCustomInputs] = useState({
    revenueChange: 0,
    cogsReduction: 0,
    opexReduction: 0,
    priceIncrease: 0,
    volumeChange: 0
  });

  // Determine Sam's mood based on metrics
  const getSamMood = () => {
    if (kpi.grossMarginPct < 20 || kpi.currentRatio < 1) return 'concerned';
    if (kpi.grossMarginPct > 40 && kpi.currentRatio > 2) return 'happy';
    if (kpi.CCC > 90 || kpi.debtToEBITDA > 4) return 'alert';
    return 'thinking';
  };

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

    if (kpi.DIO && kpi.DIO > 75) {
      insights.push({
        type: 'warning',
        title: 'Inventory Drag',
        message: `${kpi.DIO.toFixed(0)} days of inventory is tying up $${(kpi.inv / 1000).toFixed(0)}K in working capital.`,
        action: 'Implement JIT inventory management or improve demand forecasting.',
        impact: `Reducing DIO to 60 days would free up $${((kpi.inv * 0.2) / 1000).toFixed(0)}K in cash.`
      });
    }

    if (kpi.CCC && kpi.CCC > 75) {
      insights.push({
        type: 'info',
        title: 'Cash Cycle Opportunity',
        message: `Your ${kpi.CCC.toFixed(0)}-day cash cycle is above optimal.`,
        action: 'Negotiate better payment terms: 2/10 net 30 discounts, factor receivables, or extend payables.',
        impact: `Improving CCC by 15 days could reduce working capital needs by $${((kpi.revenue * 12 / 365 * 15) / 1000).toFixed(0)}K.`
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
  const samMood = getSamMood();

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
            <SamAvatar size={56} mood={samMood} />
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
  
  if (kpi.currentRatio > 0 && kpi.currentRatio < targets.currentRatioMin) {
    items.push({
      tone: "bad",
      icon: AlertTriangle,
      title: "Liquidity Risk",
      text: `Current Ratio ${kpi.currentRatio.toFixed(2)} < ${targets.currentRatioMin}`,
      action: "Accelerate collections, negotiate payment terms, or secure short-term financing."
    });
  }
  
  if (kpi.cashRatio > 0 && kpi.cashRatio < 0.2) {
    items.push({
      tone: "warn",
      icon: AlertCircle,
      title: "Cash Position",
      text: `Cash Ratio ${kpi.cashRatio.toFixed(2)} is critically low`,
      action: "Consider factoring receivables or drawing on credit line."
    });
  }
  
  if (kpi.grossMarginPct > 0 && kpi.grossMarginPct < targets.grossMarginPctMin) {
    items.push({
      tone: "warn",
      icon: TrendDown,
      title: "Margin Compression",
      text: `Gross Margin ${percent(kpi.grossMarginPct)} below target ${percent(targets.grossMarginPctMin)}`,
      action: "Review pricing strategy and negotiate supplier contracts."
    });
  }
  
  if (kpi.CCC > 0 && kpi.CCC > targets.CCCMax) {
    items.push({
      tone: "warn",
      icon: RefreshCw,
      title: "Cash Conversion Cycle",
      text: `CCC ${kpi.CCC.toFixed(0)} days > ${targets.CCCMax} days`,
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
                  sublabel={`${kpi.revenue > 0 ? percent((kpi.cash / kpi.revenue) * 100) : '—'} of revenue`}
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
                            {isFinite(item.value) && item.value > 0 ? item.value.toFixed(2) : '—'}
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
                <Metric label="Cash Conversion" value={`${kpi.CCC > 0 ? kpi.CCC.toFixed(0) : '—'} days`} sublabel="Days to convert" />
              </div>

              <Card>
                <SectionTitle icon={Activity} title="Cash Flow Metrics" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 bg-zinc-900/50 rounded-lg">
                    <p className="text-xs text-zinc-400">DSO</p>
                    <p className="text-lg font-semibold">{kpi.DSO > 0 ? `${kpi.DSO.toFixed(0)} days` : '—'}</p>
                  </div>
                  <div className="p-3 bg-zinc-900/50 rounded-lg">
                    <p className="text-xs text-zinc-400">DIO</p>
                    <p className="text-lg font-semibold">{kpi.DIO > 0 ? `${kpi.DIO.toFixed(0)} days` : '—'}</p>
                  </div>
                  <div className="p-3 bg-zinc-900/50 rounded-lg">
                    <p className="text-xs text-zinc-400">DPO</p>
                    <p className="text-lg font-semibold">{kpi.DPO > 0 ? `${kpi.DPO.toFixed(0)} days` : '—'}</p>
                  </div>
                  <div className="p-3 bg-zinc-900/50 rounded-lg">
                    <p className="text-xs text-zinc-400">Inventory Turns</p>
                    <p className="text-lg font-semibold">{kpi.invTurns > 0 ? `${kpi.invTurns.toFixed(1)}x` : '—'}</p>
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
                      <span className="text-sm font-semibold">{kpi.CCC > 0 ? `${kpi.CCC.toFixed(0)} days` : '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Receivables Period</span>
                      <span className="text-sm font-semibold">{kpi.DSO > 0 ? `${kpi.DSO.toFixed(0)} days` : '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Payables Period</span>
                      <span className="text-sm font-semibold">{kpi.DPO > 0 ? `${kpi.DPO.toFixed(0)} days` : '—'}</span>
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
                <Metric label="Debt/EBITDA" value={kpi.debtToEBITDA ? `${kpi.debtToEBITDA.toFixed(2)}x` : '—'} sublabel="Coverage multiple" />
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
                    <p className="text-lg font-semibold">{kpi.interestCoverage ? `${kpi.interestCoverage.toFixed(1)}x` : '—'}</p>
                  </div>
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
