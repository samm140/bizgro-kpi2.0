// src/components/portfolio/ARCashflowDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

// Google Sheets configuration
const AR_SPREADSHEET_ID = 'YOUR_AR_SHEET_ID_HERE'; // Replace with your sheet ID
const AR_SHEET_GID = 'YOUR_AR_GID_HERE'; // Replace with your sheet GID

// Portfolio configuration (will be moved to context/props later)
const PORTFOLIO_CONFIG = {
  portfolioId: 'diamondback-001', // Unique identifier for this company
  companyName: 'DiamondBack Construction',
  permissions: ['view', 'edit', 'admin'] // User permissions model
};

// --- Helpers (matching DiamondbackDashboard style) ---
const toNum = (v) => {
  if (v === undefined || v === null) return 0;
  if (typeof v === 'number') return v;
  const cleaned = String(v).replace(/[\$,%\s]/g, '');
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
  (n ?? 0).toLocaleString(undefined, { style: "currency", currency: "USD" });

const sum = (arr, key) => 
  arr?.reduce((a, c) => a + (key ? (c[key] ?? 0) : c ?? 0), 0) ?? 0;

// Demo data structure (fallback when sheets unavailable)
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
    { project: "Merit – HQ Renovation", amount: 265000 },
    { project: "Dayton – Hospital Wing", amount: 198400 },
    { project: "Bobby – Stadium Phase II", amount: 176250 },
    { project: "Merit – Plant Coatings", amount: 154000 },
    { project: "Dayton – K‑12 Complex", amount: 141900 },
    { project: "Bobby – Civic Center", amount: 128000 },
  ],
  arByCustomer: [
    { customer: "Turner Construction", amount: 402300 },
    { customer: "Skanska", amount: 355900 },
    { customer: "Clark Builders", amount: 308100 },
    { customer: "AECOM", amount: 246800 },
    { customer: "Bechtel", amount: 201100 },
  ],
  bankSnapshot: [
    { account: "Operating – BOA", balance: 425000 },
    { account: "Payroll – Chase", balance: 187500 },
    { account: "MM – Fidelity", balance: 610000 },
  ],
  liquidAssets: {
    cash: 1222500,
    marketableSecurities: 375000,
    revolverAvailability: 800000,
    other: 125000,
  }
};

const bucketOrder = [
  { key: "current", label: "Current", color: '#10b981' },
  { key: "b1_30", label: "1–30 days", color: '#3b82f6' },
  { key: "b31_60", label: "31–60 days", color: '#f59e0b' },
  { key: "b61_90", label: "61–90 days", color: '#ef4444' },
  { key: "b90_plus", label: "> 90 days", color: '#dc2626' },
];

// MetricCard component (matching DiamondbackDashboard style)
const MetricCard = ({ title, value, subtitle, trend, color = 'blue' }) => {
  const colorMap = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
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
        <p className="text-white font-bold">{payload[0].payload.name || payload[0].payload.project || payload[0].payload.customer}</p>
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
      
      // CORS proxy for development (same pattern as DiamondbackDashboard)
      const proxyUrl = 'https://corsproxy.io/?';
      const directUrl = `https://docs.google.com/spreadsheets/d/${AR_SPREADSHEET_ID}/export?format=csv&gid=${AR_SHEET_GID}`;
      const csvUrl = proxyUrl + encodeURIComponent(directUrl);
      
      const response = await fetch(csvUrl, {
        cache: 'no-store',
        headers: { 'Accept': 'text/csv' }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const csvText = await response.text();
      const data = parseARSheet(csvText);
      
      setArData(data);
      setLoading(false);
      setLastRefresh(new Date());
      
    } catch (err) {
      console.error('AR data fetch error:', err);
      // Fallback to demo data
      setArData(demoData);
      setError('Using demo data. Configure sheet ID for live data.');
      setLoading(false);
    }
  };

  // Parse CSV data into AR structure
  const parseARSheet = (csvText) => {
    // This would parse your actual sheet structure
    // For now, returning demo data structure
    // You'll need to map your actual column headers here
    
    const rows = csvText.split('\n').map(row => row.split(','));
    
    // Example mapping (adjust to your sheet structure):
    // Column A: Customer/Project
    // Column B: Current
    // Column C: 1-30 days
    // Column D: 31-60 days
    // Column E: 61-90 days
    // Column F: >90 days
    // etc.
    
    return demoData; // Replace with actual parsing logic
  };

  // API function for future backend integration
  /* Commented out for future use
  const fetchARDataAPI = async (portfolioId) => {
    try {
      const response = await fetch(`/api/portfolio/${portfolioId}/ar-cashflow`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('API fetch failed');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('API error:', err);
      throw err;
    }
  };
  */

  useEffect(() => {
    fetchARData();
    // Refresh every 5 minutes (matching DiamondbackDashboard)
    const interval = setInterval(fetchARData, 300000);
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
    };
  }, [arData, topN]);

  // Generate aging trend data
  const generateAgingTrend = (data) => {
    // This would generate trend data from historical snapshots
    // For now, creating synthetic trend
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

  // Calculate collections efficiency metrics
  const calculateCollectionsEfficiency = (data) => {
    const summary = data?.arSummary || demoData.arSummary;
    const collectionRate = (summary.collectionsMTD / summary.billingsMTD) * 100;
    const pastDuePercent = ((summary.b31_60 + summary.b61_90 + summary.b90_plus) / summary.total) * 100;
    
    return {
      collectionRate,
      pastDuePercent,
      healthScore: Math.max(0, 100 - pastDuePercent - Math.max(0, 54 - summary.dso))
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

  const { arSummary, arByProject, arByCustomer, bankSnapshot, liquidAssets, agingTrendData, collectionsEfficiency } = processedData;
  const totalLiquid = sum(Object.values(liquidAssets || {}));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <i className="fas fa-file-invoice-dollar mr-3"></i>
              AR & Cashflow Analysis
            </h1>
            <p className="text-blue-100 mt-2">
              Portfolio: {PORTFOLIO_CONFIG.companyName} | ID: {portfolioId}
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
            <i className="fas fa-exclamation-triangle mr-2"></i>
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
              title="Total A/R"
              value={formatDollars(arSummary.total)}
              subtitle={`Current: ${formatDollars(arSummary.current)}`}
              color="blue"
            />
            <MetricCard
              title="DSO"
              value={`${arSummary.dso} days`}
              subtitle="Days Sales Outstanding"
              trend={arSummary.dso > 60 ? -((arSummary.dso - 60) / 60 * 100) : ((60 - arSummary.dso) / 60 * 100)}
              color="cyan"
            />
            <MetricCard
              title="Collection Rate"
              value={`${collectionsEfficiency.collectionRate.toFixed(1)}%`}
              subtitle={`CEI: ${arSummary.cei}%`}
              trend={collectionsEfficiency.collectionRate - 100}
              color="green"
            />
            <MetricCard
              title="Past Due %"
              value={`${collectionsEfficiency.pastDuePercent.toFixed(1)}%`}
              subtitle={`Amount: ${formatDollars(arSummary.b31_60 + arSummary.b61_90 + arSummary.b90_plus)}`}
              trend={-collectionsEfficiency.pastDuePercent}
              color={collectionsEfficiency.pastDuePercent > 30 ? 'red' : 'amber'}
            />
          </div>

          {/* Quick Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aging Pie Chart */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">A/R Aging Distribution</h3>
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

            {/* Billings vs Collections */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">MTD Performance</h3>
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
                <div className="pt-3 border-t border-slate-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Collection Efficiency</span>
                    <span className={`font-bold ${collectionsEfficiency.collectionRate > 90 ? 'text-green-400' : 'text-amber-400'}`}>
                      {collectionsEfficiency.collectionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Aging View */}
      {selectedView === 'aging' && (
        <div className="space-y-6">
          {/* Aging Trend Chart */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Aging Trend Analysis</h3>
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

          {/* Aging Health Score */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Collection Health Score</h3>
            <div className="flex items-center justify-center">
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
          </div>
        </div>
      )}

      {/* Customers View */}
      {selectedView === 'customers' && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Top Customers by A/R</h3>
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
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" tickFormatter={formatDollars} />
              <YAxis type="category" dataKey="customer" stroke="#94a3b8" />
              <Tooltip content={<CustomDollarTooltip />} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Projects View */}
      {selectedView === 'projects' && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Top Projects by A/R</h3>
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
              data={arByProject}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" tickFormatter={formatDollars} />
              <YAxis type="category" dataKey="project" stroke="#94a3b8" />
              <Tooltip content={<CustomDollarTooltip />} />
              <Bar dataKey="amount" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Liquidity View */}
      {selectedView === 'liquidity' && (
        <div className="space-y-6">
          {/* Liquid Assets Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Cash & Equivalents"
              value={formatDollars(liquidAssets.cash)}
              subtitle="Immediately available"
              color="green"
            />
            <MetricCard
              title="Marketable Securities"
              value={formatDollars(liquidAssets.marketableSecurities)}
              subtitle="Short-term investments"
              color="blue"
            />
            <MetricCard
              title="Revolver Available"
              value={formatDollars(liquidAssets.revolverAvailability)}
              subtitle="Credit line available"
              color="cyan"
            />
            <MetricCard
              title="Total Liquidity"
              value={formatDollars(totalLiquid)}
              subtitle="All liquid sources"
              color="amber"
            />
          </div>

          {/* Bank Accounts */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Bank Account Balances</h3>
            <div className="space-y-3">
              {bankSnapshot.map((account, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center">
                    <i className="fas fa-university text-blue-400 mr-3"></i>
                    <span className="text-gray-300">{account.account}</span>
                  </div>
                  <span className="text-gray-200 font-bold">{formatDollars(account.balance)}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Bank Balances</span>
                  <span className="text-xl font-bold text-green-400">
                    {formatDollars(sum(bankSnapshot, 'balance'))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends View */}
      {selectedView === 'trends' && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Collections Trend</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={agingTrendData.map(d => ({
                month: d.month,
                collections: d.current * 0.8 + Math.random() * d.current * 0.2,
                billings: d.current * 0.9 + Math.random() * d.current * 0.1,
              }))}
            >
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
              />
              <Line 
                type="monotone" 
                dataKey="collections" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Collections"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ARCashflowDashboard;
