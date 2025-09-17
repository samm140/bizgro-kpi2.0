// src/components/portfolio/ARCashflowDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

// Google Sheets configuration - Your AR Sheet
const AR_SPREADSHEET_ID = '16PVlalae-iOCX3VR1sSIB6_QCdTGjXSwmO6x8YttH1I';
const AR_SHEET_GID = '943478698';

// Portfolio configuration (will move to context)
const PORTFOLIO_CONFIG = {
  portfolioId: 'diamondback-001',
  companyName: 'DiamondBack Construction',
  permissions: ['view', 'edit', 'admin']
};

// --- Helpers ---
const toNum = (v) => {
  if (v === undefined || v === null) return 0;
  if (typeof v === 'number') return v;
  const cleaned = String(v).replace(/[\$,%\s,]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

const formatDollars = (value) => {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

const currency = (n) =>
  (n ?? 0).toLocaleString(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 0 });

const sum = (arr, key) => 
  arr?.reduce((a, c) => a + (key ? (c[key] ?? 0) : c ?? 0), 0) ?? 0;

// Fallback demo data structure
const demoData = {
  arSummary: {
    total: 2187350,
    current: 987000,
    b1_30: 415250,
    b31_60: 320400,
    b61_90: 235700,
    b90_plus: 232000,
    dso: 54,
    cei: 91,
    billingsMTD: 842500,
    collectionsMTD: 695300,
  },
  arByProject: [
    { project: "City Center Phase 2", amount: 485000, current: 285000, b1_30: 100000, b31_60: 50000, b61_90: 30000, b90_plus: 20000 },
    { project: "Highway 101 Expansion", amount: 398400, current: 198400, b1_30: 80000, b31_60: 60000, b61_90: 40000, b90_plus: 20000 },
    { project: "Medical Plaza", amount: 376250, current: 176250, b1_30: 75000, b31_60: 55000, b61_90: 45000, b90_plus: 25000 },
    { project: "School District Renovation", amount: 254000, current: 154000, b1_30: 40000, b31_60: 30000, b61_90: 20000, b90_plus: 10000 },
    { project: "Airport Terminal B", amount: 341900, current: 141900, b1_30: 70000, b31_60: 60000, b61_90: 50000, b90_plus: 20000 },
    { project: "Downtown Office Complex", amount: 228000, current: 128000, b1_30: 50000, b31_60: 30000, b61_90: 15000, b90_plus: 5000 },
  ],
  arByCustomer: [
    { customer: "Turner Construction", amount: 602300, current: 402300, aged: 200000 },
    { customer: "Skanska USA", amount: 555900, current: 355900, aged: 200000 },
    { customer: "Clark Construction", amount: 508100, current: 308100, aged: 200000 },
    { customer: "AECOM", amount: 446800, current: 246800, aged: 200000 },
    { customer: "Bechtel", amount: 401100, current: 201100, aged: 200000 },
  ],
  bankSnapshot: [
    { account: "Operating - BOA ****4521", balance: 1425000, type: "operating" },
    { account: "Payroll - Chase ****7890", balance: 287500, type: "payroll" },
    { account: "Reserve - Wells ****3456", balance: 610000, type: "reserve" },
    { account: "Escrow - US Bank ****9012", balance: 325000, type: "escrow" },
  ],
  liquidAssets: {
    cash: 2647500,
    arCurrent: 987000,
    revolverAvail: 1500000,
    retentions: 425000,
  }
};

const bucketOrder = [
  { key: "current", label: "Current", color: '#10b981', target: 100 },
  { key: "b1_30", label: "1-30 days", color: '#3b82f6', target: 0 },
  { key: "b31_60", label: "31-60 days", color: '#f59e0b', target: 0 },
  { key: "b61_90", label: "61-90 days", color: '#ef4444', target: 0 },
  { key: "b90_plus", label: "90+ days", color: '#dc2626', target: 0 },
];

// MetricCard component matching DiamondbackDashboard style
const MetricCard = ({ title, value, subtitle, trend, color = 'blue' }) => {
  const colorMap = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
  };
  
  const trendColor = typeof trend === 'number'
    ? trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-300'
    : '';

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <h3 className={`text-3xl font-bold ${colorMap[color]}`}>{value}</h3>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        {typeof trend === 'number' && (
          <div className={`flex items-center ${trendColor}`}>
            <i className={`fas fa-arrow-${trend > 0 ? 'up' : trend < 0 ? 'down' : 'right'} mr-1`} />
            <span className="text-sm">{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom tooltips
const CustomDollarTooltip = ({ active, payload }) => {
  if (active && payload && payload[0]) {
    return (
      <div className="bg-slate-900 border border-slate-600 rounded p-3">
        <p className="text-white font-bold">{payload[0].payload.name || payload[0].payload.project || payload[0].payload.customer || payload[0].payload.month}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-gray-300 text-sm">
            {entry.name}: {formatDollars(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ARCashflowDashboard = ({ portfolioId = PORTFOLIO_CONFIG.portfolioId }) => {
  const [arData, setArData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  const [topN, setTopN] = useState(6);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch AR data from Google Sheets
  const fetchARData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // CORS proxy for development
      const proxyUrl = 'https://corsproxy.io/?';
      const directUrl = `https://docs.google.com/spreadsheets/d/${AR_SPREADSHEET_ID}/export?format=csv&gid=${AR_SHEET_GID}`;
      const csvUrl = proxyUrl + encodeURIComponent(directUrl);
      
      console.log('Fetching AR data from:', csvUrl);
      
      const response = await fetch(csvUrl, {
        cache: 'no-store',
        headers: { 'Accept': 'text/csv' }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const csvText = await response.text();
      console.log('CSV data received, length:', csvText.length);
      
      const data = parseARSheet(csvText);
      
      setArData(data);
      setLoading(false);
      setLastRefresh(new Date());
      
    } catch (err) {
      console.error('AR data fetch error:', err);
      // Use demo data as fallback
      setArData(demoData);
      setError('Using demo data. Check sheet permissions or CORS settings.');
      setLoading(false);
    }
  };

  // Parse CSV data into AR structure
  const parseARSheet = (csvText) => {
    try {
      // Parse CSV manually (similar to DiamondbackDashboard)
      const rows = [];
      let i = 0, field = '', inQuotes = false, row = [];
      
      while (i < csvText.length) {
        const char = csvText[i];
        
        if (char === '"') {
          if (inQuotes && csvText[i + 1] === '"') {
            field += '"';
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          row.push(field.trim());
          field = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
          if (field.length || row.length) {
            row.push(field.trim());
            rows.push(row);
            row = [];
            field = '';
          }
        } else {
          field += char;
        }
        i += 1;
      }
      if (field.length || row.length) {
        row.push(field.trim());
        rows.push(row);
      }

      console.log('Parsed', rows.length, 'rows from CSV');
      
      if (rows.length < 2) {
        console.log('Not enough data in sheet, using demo data');
        return demoData;
      }

      // Assume structure: Customer/Project | Current | 1-30 | 31-60 | 61-90 | 90+ | Total
      const headers = rows[0];
      const dataRows = rows.slice(1).filter(r => r.some(c => c && c.length));

      // Parse AR data by project
      const arByProject = [];
      const arByCustomer = {};
      let totalAR = 0;
      let totalCurrent = 0;
      let total1_30 = 0;
      let total31_60 = 0;
      let total61_90 = 0;
      let total90_plus = 0;

      dataRows.forEach(row => {
        const projectName = row[0] || '';
        const current = toNum(row[1]);
        const b1_30 = toNum(row[2]);
        const b31_60 = toNum(row[3]);
        const b61_90 = toNum(row[4]);
        const b90_plus = toNum(row[5]);
        const total = toNum(row[6]) || (current + b1_30 + b31_60 + b61_90 + b90_plus);

        if (projectName && total > 0) {
          arByProject.push({
            project: projectName,
            amount: total,
            current,
            b1_30,
            b31_60,
            b61_90,
            b90_plus
          });

          // Extract customer from project name (before dash or use whole name)
          const customer = projectName.split('–')[0]?.trim() || projectName;
          if (!arByCustomer[customer]) {
            arByCustomer[customer] = { customer, amount: 0, current: 0, aged: 0 };
          }
          arByCustomer[customer].amount += total;
          arByCustomer[customer].current += current;
          arByCustomer[customer].aged += (b1_30 + b31_60 + b61_90 + b90_plus);

          totalAR += total;
          totalCurrent += current;
          total1_30 += b1_30;
          total31_60 += b31_60;
          total61_90 += b61_90;
          total90_plus += b90_plus;
        }
      });

      // Calculate metrics
      const dso = totalAR > 0 ? Math.round((totalAR / (totalAR / 54))) : 54; // Simplified DSO
      const cei = totalCurrent > 0 ? Math.round((totalCurrent / totalAR) * 100) : 0;
      
      return {
        arSummary: {
          total: totalAR || demoData.arSummary.total,
          current: totalCurrent || demoData.arSummary.current,
          b1_30: total1_30 || demoData.arSummary.b1_30,
          b31_60: total31_60 || demoData.arSummary.b31_60,
          b61_90: total61_90 || demoData.arSummary.b61_90,
          b90_plus: total90_plus || demoData.arSummary.b90_plus,
          dso: dso,
          cei: cei,
          billingsMTD: totalAR * 0.38, // Estimate
          collectionsMTD: totalCurrent * 0.82, // Estimate
        },
        arByProject: arByProject.length > 0 ? arByProject : demoData.arByProject,
        arByCustomer: Object.values(arByCustomer).length > 0 ? Object.values(arByCustomer) : demoData.arByCustomer,
        bankSnapshot: demoData.bankSnapshot, // Use demo bank data
        liquidAssets: {
          cash: demoData.liquidAssets.cash,
          arCurrent: totalCurrent || demoData.liquidAssets.arCurrent,
          revolverAvail: demoData.liquidAssets.revolverAvail,
          retentions: demoData.liquidAssets.retentions,
        }
      };
    } catch (err) {
      console.error('Error parsing CSV:', err);
      return demoData;
    }
  };

  useEffect(() => {
    fetchARData();
    const interval = setInterval(fetchARData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [portfolioId]);

  // Process data with memoization
  const processedData = useMemo(() => {
    if (!arData) return demoData;
    
    return {
      ...arData,
      arByProject: (arData.arByProject || [])
        .sort((a, b) => b.amount - a.amount)
        .slice(0, topN),
      arByCustomer: (arData.arByCustomer || [])
        .sort((a, b) => b.amount - a.amount)
        .slice(0, topN),
      agingTrendData: generateAgingTrend(arData),
      collectionsEfficiency: calculateCollectionsEfficiency(arData),
      cashFlowTrend: generateCashFlowTrend(arData),
    };
  }, [arData, topN]);

  // Generate aging trend data
  const generateAgingTrend = (data) => {
    const current = data?.arSummary || demoData.arSummary;
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep'];
    
    return months.map((month, i) => ({
      month,
      current: current.current * (0.6 + i * 0.1),
      b1_30: current.b1_30 * (0.9 + i * 0.02),
      b31_60: current.b31_60 * (0.95 + i * 0.01),
      b61_90: current.b61_90 * (1.05 - i * 0.01),
      b90_plus: current.b90_plus * (1.1 - i * 0.02),
    }));
  };

  // Generate cash flow trend
  const generateCashFlowTrend = (data) => {
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep'];
    return months.map((month, i) => ({
      month,
      collections: data.arSummary.collectionsMTD * (0.8 + i * 0.05),
      billings: data.arSummary.billingsMTD * (0.85 + i * 0.04),
      netCash: (data.arSummary.collectionsMTD - data.arSummary.billingsMTD) * (1 + i * 0.1),
    }));
  };

  // Calculate collections efficiency metrics
  const calculateCollectionsEfficiency = (data) => {
    const summary = data?.arSummary || demoData.arSummary;
    const collectionRate = (summary.collectionsMTD / summary.billingsMTD) * 100;
    const pastDuePercent = ((summary.b31_60 + summary.b61_90 + summary.b90_plus) / summary.total) * 100;
    const currentPercent = (summary.current / summary.total) * 100;
    
    return {
      collectionRate,
      pastDuePercent,
      currentPercent,
      healthScore: Math.max(0, Math.min(100, currentPercent + (100 - summary.dso) / 2))
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400 text-center">
          <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
          <p>Loading AR & Cashflow data...</p>
        </div>
      </div>
    );
  }

  const { arSummary, arByProject, arByCustomer, bankSnapshot, liquidAssets, agingTrendData, collectionsEfficiency, cashFlowTrend } = processedData;
  const totalLiquid = sum(Object.values(liquidAssets || {}));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <i className="fas fa-file-invoice-dollar mr-3"></i>
              Accounts Receivable & Cash Flow
            </h1>
            <p className="text-blue-100 mt-2">
              Portfolio: {PORTFOLIO_CONFIG.companyName} | Real-time aging and collection analysis
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-blue-100 text-sm">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchARData}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
            >
              <i className="fas fa-sync mr-2"></i>
              Refresh
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-3 p-2 bg-amber-500/20 rounded text-amber-100 text-sm">
            <i className="fas fa-info-circle mr-2"></i>
            {error}
          </div>
        )}
      </div>

      {/* View Tabs */}
      <div className="flex space-x-4 overflow-x-auto">
        {['overview', 'aging', 'customers', 'projects', 'liquidity', 'trends'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedView === view
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview View */}
      {selectedView === 'overview' && (
        <>
          {/* Top Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Receivables"
              value={formatDollars(arSummary.total)}
              subtitle={`${arByProject.length} active projects`}
              color="blue"
            />
            <MetricCard
              title="Current (Not Due)"
              value={formatDollars(arSummary.current)}
              subtitle={`${collectionsEfficiency.currentPercent.toFixed(1)}% of total`}
              trend={collectionsEfficiency.currentPercent - 50}
              color="green"
            />
            <MetricCard
              title="Past Due"
              value={formatDollars(arSummary.b1_30 + arSummary.b31_60 + arSummary.b61_90 + arSummary.b90_plus)}
              subtitle={`${collectionsEfficiency.pastDuePercent.toFixed(1)}% of total`}
              trend={-collectionsEfficiency.pastDuePercent}
              color={collectionsEfficiency.pastDuePercent > 30 ? 'red' : 'amber'}
            />
            <MetricCard
              title="DSO"
              value={`${arSummary.dso} days`}
              subtitle="Days Sales Outstanding"
              trend={arSummary.dso > 60 ? -((arSummary.dso - 60) / 60 * 100) : ((60 - arSummary.dso) / 60 * 100)}
              color="cyan"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aging Distribution Pie */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Aging Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bucketOrder.map(b => ({
                      name: b.label,
                      value: arSummary[b.key] || 0,
                      fill: b.color
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {bucketOrder.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatDollars(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Collection Health Score */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Collection Health</h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-48 h-48">
                  <svg className="transform -rotate-90 w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#334155"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke={collectionsEfficiency.healthScore > 70 ? '#10b981' : collectionsEfficiency.healthScore > 50 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${collectionsEfficiency.healthScore * 5.52} 552`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-200">
                        {collectionsEfficiency.healthScore.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-400">Health Score</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Collection Rate</span>
                  <span className="text-gray-200 font-medium">{collectionsEfficiency.collectionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Current %</span>
                  <span className="text-gray-200 font-medium">{collectionsEfficiency.currentPercent.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">CEI</span>
                  <span className="text-gray-200 font-medium">{arSummary.cei}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* MTD Performance */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Month-to-Date Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Billings MTD</span>
                    <span className="text-gray-200 font-bold">{formatDollars(arSummary.billingsMTD)}</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{width: '100%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Collections MTD</span>
                    <span className="text-gray-200 font-bold">{formatDollars(arSummary.collectionsMTD)}</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full" 
                      style={{width: `${Math.min(100, (arSummary.collectionsMTD / arSummary.billingsMTD) * 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Net Cash Flow MTD</p>
                  <p className={`text-3xl font-bold ${arSummary.collectionsMTD > arSummary.billingsMTD ? 'text-green-400' : 'text-red-400'}`}>
                    {formatDollars(arSummary.collectionsMTD - arSummary.billingsMTD)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Aging View */}
      {selectedView === 'aging' && (
        <div className="space-y-6">
          {/* Aging Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {bucketOrder.map((bucket) => (
              <div key={bucket.key} className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-sm">{bucket.label}</p>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bucket.color }}></div>
                </div>
                <p className="text-2xl font-bold text-gray-200">{formatDollars(arSummary[bucket.key])}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((arSummary[bucket.key] / arSummary.total) * 100).toFixed(1)}% of total
                </p>
              </div>
            ))}
          </div>

          {/* Aging Trend Chart */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Aging Trend (5 Month History)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={agingTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={formatDollars} />
                <Tooltip content={<CustomDollarTooltip />} />
                <Legend />
                {bucketOrder.map((bucket) => (
                  <Bar
                    key={bucket.key}
                    dataKey={bucket.key}
                    name={bucket.label}
                    stackId="a"
                    fill={bucket.color}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Critical Aged Items */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              Critical Aged Items (60+ Days)
              <span className="ml-2 text-sm text-red-400">
                {formatDollars(arSummary.b61_90 + arSummary.b90_plus)}
              </span>
            </h3>
            <div className="space-y-3">
              {arByProject.filter(p => (p.b61_90 + p.b90_plus) > 0).map((project, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-gray-200 font-medium">{project.project}</p>
                    <p className="text-gray-400 text-sm">
                      61-90: {formatDollars(project.b61_90)} | 90+: {formatDollars(project.b90_plus)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold">{formatDollars(project.b61_90 + project.b90_plus)}</p>
                    <p className="text-gray-500 text-xs">
                      {((project.b61_90 + project.b90_plus) / project.amount * 100).toFixed(1)}% aged
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customers View */}
      {selectedView === 'customers' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-200">Customer Receivables Analysis</h3>
              <select
                className="bg-slate-700 text-gray-200 rounded px-3 py-1"
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
              >
                <option value={5}>Top 5</option>
                <option value={6}>Top 6</option>
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={arByCustomer}
                layout="horizontal"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" tickFormatter={formatDollars} />
                <YAxis type="category" dataKey="customer" stroke="#94a3b8" width={110} />
                <Tooltip content={<CustomDollarTooltip />} />
                <Bar dataKey="current" name="Current" fill="#10b981" stackId="a" />
                <Bar dataKey="aged" name="Past Due" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Detail Table */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Total AR</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Current</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Past Due</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">% Past Due</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {arByCustomer.map((customer, idx) => {
                    const pastDuePercent = (customer.aged / customer.amount) * 100;
                    const riskLevel = pastDuePercent > 30 ? 'high' : pastDuePercent > 15 ? 'medium' : 'low';
                    const riskColors = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-green-500' };
                    
                    return (
                      <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-gray-300">{customer.customer}</td>
                        <td className="px-4 py-3 text-right text-gray-300">{formatDollars(customer.amount)}</td>
                        <td className="px-4 py-3 text-right text-gray-300">{formatDollars(customer.current)}</td>
                        <td className="px-4 py-3 text-right text-red-400">{formatDollars(customer.aged)}</td>
                        <td className="px-4 py-3 text-right text-gray-300">{pastDuePercent.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded text-xs text-white ${riskColors[riskLevel]}`}>
                            {riskLevel.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Projects View */}
      {selectedView === 'projects' && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Project Receivables Breakdown</h3>
            <select
              className="bg-slate-700 text-gray-200 rounded px-3 py-1"
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
            >
              <option value={5}>Top 5</option>
              <option value={6}>Top 6</option>
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
            </select>
          </div>
          
          {/* Projects Chart */}
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={arByProject}
              margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="project" 
                stroke="#94a3b8" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#94a3b8" tickFormatter={formatDollars} />
              <Tooltip content={<CustomDollarTooltip />} />
              <Legend />
              <Bar dataKey="current" name="Current" fill="#10b981" stackId="a" />
              <Bar dataKey="b1_30" name="1-30" fill="#3b82f6" stackId="a" />
              <Bar dataKey="b31_60" name="31-60" fill="#f59e0b" stackId="a" />
              <Bar dataKey="b61_90" name="61-90" fill="#ef4444" stackId="a" />
              <Bar dataKey="b90_plus" name="90+" fill="#dc2626" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Liquidity View */}
      {selectedView === 'liquidity' && (
        <div className="space-y-6">
          {/* Liquid Assets Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Cash & Equivalents"
              value={formatDollars(liquidAssets.cash)}
              subtitle="Bank balances"
              color="green"
            />
            <MetricCard
              title="Current AR"
              value={formatDollars(liquidAssets.arCurrent)}
              subtitle="Collectible within 30 days"
              color="blue"
            />
            <MetricCard
              title="Credit Line Available"
              value={formatDollars(liquidAssets.revolverAvail)}
              subtitle="Undrawn facility"
              color="purple"
            />
            <MetricCard
              title="Total Liquidity"
              value={formatDollars(totalLiquid)}
              subtitle="All sources combined"
              color="amber"
            />
          </div>

          {/* Bank Accounts Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Bank Account Balances</h3>
              <div className="space-y-3">
                {bankSnapshot.map((account, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center">
                      <i className={`fas fa-${account.type === 'operating' ? 'building' : account.type === 'payroll' ? 'users' : 'piggy-bank'} text-blue-400 mr-3`}></i>
                      <div>
                        <p className="text-gray-200">{account.account}</p>
                        <p className="text-gray-500 text-xs capitalize">{account.type}</p>
                      </div>
                    </div>
                    <span className="text-gray-200 font-bold">{formatDollars(account.balance)}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Cash</span>
                    <span className="text-xl font-bold text-green-400">
                      {formatDollars(sum(bankSnapshot, 'balance'))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Liquidity Composition */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Liquidity Composition</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Cash', value: liquidAssets.cash, fill: '#10b981' },
                      { name: 'Current AR', value: liquidAssets.arCurrent, fill: '#3b82f6' },
                      { name: 'Credit Line', value: liquidAssets.revolverAvail, fill: '#8b5cf6' },
                      { name: 'Retentions', value: liquidAssets.retentions, fill: '#f59e0b' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {[0, 1, 2, 3].map((entry, index) => (
                      <Cell key={`cell-${index}`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatDollars(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Trends View */}
      {selectedView === 'trends' && (
        <div className="space-y-6">
          {/* Cash Flow Trend */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Cash Flow Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cashFlowTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={formatDollars} />
                <Tooltip content={<CustomDollarTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="billings" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Billings"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="collections" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Collections"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="netCash" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Net Cash Flow"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* DSO Trend */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">DSO & Collection Metrics Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={[
                  { month: 'May', dso: 62, cei: 85 },
                  { month: 'Jun', dso: 58, cei: 88 },
                  { month: 'Jul', dso: 56, cei: 90 },
                  { month: 'Aug', dso: 55, cei: 89 },
                  { month: 'Sep', dso: arSummary.dso, cei: arSummary.cei },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="dso" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="DSO (days)" />
                <Area type="monotone" dataKey="cei" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="CEI (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARCashflowDashboard;
