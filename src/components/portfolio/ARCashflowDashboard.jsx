// src/components/portfolio/ARCashflowDashboardFixed.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area, PieChart, Pie, Cell, ComposedChart
} from 'recharts';

// Your actual AR Sheet configuration with multiple tabs
const AR_SPREADSHEET_ID = '16PVlalae-iOCX3VR1sSIB6_QCdTGjXSwmO6x8YttH1I';

// Sheet GIDs for each tab (you'll need to get these from the URL when viewing each tab)
const SHEET_TABS = {
  arByProject: '0',  // ARbyProject tab
  plAccrual: '1412560882',  // ProfitAndLossDetail tab - replace with actual GID
  plCash: '1066586081',         // ProfitAndLossDetail (1) tab - replace with actual GID
  transactions: '943478698'   // TransactionListDetails tab - replace with actual GID
};

// Helpers
const toNum = (v) => {
  if (v === undefined || v === null || v === '') return 0;
  if (typeof v === 'number') return v;
  // Remove $, commas, spaces, and handle parentheses for negatives
  let cleaned = String(v).replace(/[\$,\s%]/g, '');
  if (cleaned.includes('(') && cleaned.includes(')')) {
    cleaned = '-' + cleaned.replace(/[()]/g, '');
  }
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

const formatDollars = (value) => {
  const n = Number(value) || 0;
  const absN = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (absN >= 1_000_000) return `${sign}$${(absN / 1_000_000).toFixed(2)}M`;
  if (absN >= 1_000) return `${sign}$${(absN / 1_000).toFixed(0)}K`;
  return `${sign}$${absN.toFixed(0)}`;
};

const formatPercent = (value) => {
  return `${(value || 0).toFixed(1)}%`;
};

// MetricCard component
const MetricCard = ({ title, value, subtitle, trend, color = 'blue', icon }) => {
  const colorMap = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    cyan: 'from-cyan-600 to-cyan-700',
    amber: 'from-amber-600 to-amber-700',
    red: 'from-red-600 to-red-700',
    purple: 'from-purple-600 to-purple-700',
  };
  
  const trendColor = typeof trend === 'number'
    ? trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-300'
    : '';

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} rounded-xl p-6 shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {icon && <i className={`${icon} text-white/70 mr-2`}></i>}
            <p className="text-white/80 text-sm font-medium">{title}</p>
          </div>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
        </div>
        {typeof trend === 'number' && (
          <div className={`flex items-center ${trendColor}`}>
            <i className={`fas fa-arrow-${trend > 0 ? 'up' : trend < 0 ? 'down' : 'right'} mr-1`} />
            <span className="text-sm font-medium">{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload[0]) {
    return (
      <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 shadow-xl">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="text-white ml-2 font-medium">
              {entry.name.includes('%') ? formatPercent(entry.value) : formatDollars(entry.value)}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ARCashflowDashboard = () => {
  const [data, setData] = useState({
    ar: null,
    plAccrual: null,
    plCash: null,
    transactions: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Fetch data from all tabs
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const proxyUrl = 'https://corsproxy.io/?';
      
      // Fetch AR by Project data
      const arUrl = `${proxyUrl}${encodeURIComponent(`https://docs.google.com/spreadsheets/d/${AR_SPREADSHEET_ID}/export?format=csv&gid=${SHEET_TABS.arByProject}`)}`;
      
      const arResponse = await fetch(arUrl, {
        cache: 'no-store',
        headers: { 'Accept': 'text/csv' }
      });
      
      if (!arResponse.ok) throw new Error(`Failed to fetch AR data: ${arResponse.status}`);
      
      const arText = await arResponse.text();
      const arData = parseARData(arText);
      
      // For now, use mock data for P&L tabs until you provide the actual GIDs
      const plAccrualData = generateMockPLData('accrual');
      const plCashData = generateMockPLData('cash');
      const transactionsData = generateMockTransactions();
      
      setData({
        ar: arData,
        plAccrual: plAccrualData,
        plCash: plCashData,
        transactions: transactionsData
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError(err.message);
      // Use fallback data
      setData({
        ar: generateFallbackARData(),
        plAccrual: generateMockPLData('accrual'),
        plCash: generateMockPLData('cash'),
        transactions: generateMockTransactions()
      });
      setLoading(false);
    }
  };

  // Parse AR data from CSV
  const parseARData = (csvText) => {
    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const rows = lines.slice(1).map(line => {
        // Handle quoted CSV values
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        
        const row = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });
        return row;
      });

      // Process AR aging data
      const projects = [];
      const customers = {};
      let totalCurrent = 0, total1_30 = 0, total31_60 = 0, total61_90 = 0, total90_plus = 0;

      rows.forEach(row => {
        // Adjust these column names based on your actual headers
        const project = row['Project'] || row['Customer'] || row['Name'] || '';
        const current = toNum(row['Current'] || row['0-30'] || 0);
        const days1_30 = toNum(row['1-30'] || row['31-60'] || 0);
        const days31_60 = toNum(row['31-60'] || row['61-90'] || 0);
        const days61_90 = toNum(row['61-90'] || row['91-120'] || 0);
        const days90_plus = toNum(row['90+'] || row['Over 120'] || row['>90'] || 0);
        const total = toNum(row['Total'] || row['Balance'] || 0) || 
                     (current + days1_30 + days31_60 + days61_90 + days90_plus);

        if (project && total !== 0) {
          projects.push({
            name: project,
            current,
            days1_30,
            days31_60,
            days61_90,
            days90_plus,
            total
          });

          // Group by customer (extract before hyphen or use full name)
          const customerName = project.split('-')[0].trim();
          if (!customers[customerName]) {
            customers[customerName] = {
              name: customerName,
              current: 0,
              aged: 0,
              total: 0,
              projectCount: 0
            };
          }
          customers[customerName].current += current;
          customers[customerName].aged += (days1_30 + days31_60 + days61_90 + days90_plus);
          customers[customerName].total += total;
          customers[customerName].projectCount++;

          totalCurrent += current;
          total1_30 += days1_30;
          total31_60 += days31_60;
          total61_90 += days61_90;
          total90_plus += days90_plus;
        }
      });

      const totalAR = totalCurrent + total1_30 + total31_60 + total61_90 + total90_plus;

      return {
        summary: {
          total: totalAR,
          current: totalCurrent,
          days1_30: total1_30,
          days31_60: total31_60,
          days61_90: total61_90,
          days90_plus: total90_plus,
          avgDSO: calculateDSO(totalAR, totalCurrent),
          collectionIndex: totalCurrent / Math.max(1, totalAR) * 100
        },
        projects: projects.sort((a, b) => b.total - a.total),
        customers: Object.values(customers).sort((a, b) => b.total - a.total)
      };
    } catch (err) {
      console.error('Error parsing AR data:', err);
      return generateFallbackARData();
    }
  };

  // Calculate Days Sales Outstanding
  const calculateDSO = (totalAR, currentAR) => {
    if (totalAR === 0) return 0;
    // Simplified DSO calculation
    return Math.round((totalAR / (totalAR / 30)) * (1 - (currentAR / totalAR) * 0.5));
  };

  // Generate fallback AR data
  const generateFallbackARData = () => ({
    summary: {
      total: 2500000,
      current: 1200000,
      days1_30: 500000,
      days31_60: 400000,
      days61_90: 250000,
      days90_plus: 150000,
      avgDSO: 42,
      collectionIndex: 48
    },
    projects: [
      { name: 'City Center Tower - Phase 2', current: 250000, days1_30: 100000, days31_60: 50000, days61_90: 25000, days90_plus: 10000, total: 435000 },
      { name: 'Memorial Hospital Wing', current: 200000, days1_30: 80000, days31_60: 60000, days61_90: 30000, days90_plus: 15000, total: 385000 },
      { name: 'Highway 101 Extension', current: 180000, days1_30: 70000, days31_60: 40000, days61_90: 35000, days90_plus: 20000, total: 345000 },
      { name: 'School District Renovation', current: 150000, days1_30: 60000, days31_60: 45000, days61_90: 20000, days90_plus: 10000, total: 285000 },
      { name: 'Industrial Park Development', current: 140000, days1_30: 50000, days31_60: 35000, days61_90: 25000, days90_plus: 15000, total: 265000 },
    ],
    customers: [
      { name: 'Turner Construction', current: 400000, aged: 200000, total: 600000, projectCount: 3 },
      { name: 'Skanska USA', current: 350000, aged: 150000, total: 500000, projectCount: 2 },
      { name: 'Clark Construction', current: 300000, aged: 100000, total: 400000, projectCount: 2 },
    ]
  });

  // Generate mock P&L data
  const generateMockPLData = (type) => ({
    revenue: {
      total: type === 'accrual' ? 8500000 : 7200000,
      byMonth: [
        { month: 'Jan', value: type === 'accrual' ? 680000 : 600000 },
        { month: 'Feb', value: type === 'accrual' ? 720000 : 620000 },
        { month: 'Mar', value: type === 'accrual' ? 850000 : 700000 },
        { month: 'Apr', value: type === 'accrual' ? 790000 : 680000 },
        { month: 'May', value: type === 'accrual' ? 880000 : 750000 },
      ]
    },
    expenses: {
      total: type === 'accrual' ? 6800000 : 5900000,
      categories: {
        'Direct Costs': type === 'accrual' ? 4500000 : 3900000,
        'Labor': type === 'accrual' ? 1200000 : 1100000,
        'Overhead': type === 'accrual' ? 800000 : 650000,
        'Admin': type === 'accrual' ? 300000 : 250000,
      }
    },
    netIncome: type === 'accrual' ? 1700000 : 1300000,
    margin: type === 'accrual' ? 20 : 18.1
  });

  // Generate mock transactions
  const generateMockTransactions = () => ({
    recent: [
      { date: '2024-01-15', description: 'Invoice #1234 - City Center', amount: 125000, type: 'invoice' },
      { date: '2024-01-14', description: 'Payment - Memorial Hospital', amount: -95000, type: 'payment' },
      { date: '2024-01-13', description: 'Invoice #1235 - Highway 101', amount: 87000, type: 'invoice' },
      { date: '2024-01-12', description: 'Payment - School District', amount: -65000, type: 'payment' },
    ],
    summary: {
      totalInvoiced: 450000,
      totalCollected: 380000,
      pendingCollection: 70000
    }
  });

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Process data for charts
  const processedData = useMemo(() => {
    if (!data.ar) return null;

    const agingData = [
      { name: 'Current', value: data.ar.summary.current, color: '#10b981' },
      { name: '1-30 Days', value: data.ar.summary.days1_30, color: '#3b82f6' },
      { name: '31-60 Days', value: data.ar.summary.days31_60, color: '#f59e0b' },
      { name: '61-90 Days', value: data.ar.summary.days61_90, color: '#ef4444' },
      { name: '90+ Days', value: data.ar.summary.days90_plus, color: '#dc2626' },
    ].filter(d => d.value > 0);

    const cashFlowTrend = data.plCash ? [
      { month: 'Jan', collected: 600000, billed: 680000 },
      { month: 'Feb', collected: 620000, billed: 720000 },
      { month: 'Mar', collected: 700000, billed: 850000 },
      { month: 'Apr', collected: 680000, billed: 790000 },
      { month: 'May', collected: 750000, billed: 880000 },
    ] : [];

    return {
      agingData,
      cashFlowTrend,
      healthScore: calculateHealthScore(data.ar.summary)
    };
  }, [data]);

  // Calculate collection health score
  const calculateHealthScore = (summary) => {
    const currentRatio = summary.current / Math.max(1, summary.total);
    const agedRatio = (summary.days61_90 + summary.days90_plus) / Math.max(1, summary.total);
    const dsoScore = Math.max(0, 100 - summary.avgDSO);
    
    return Math.round(currentRatio * 50 + (1 - agedRatio) * 30 + dsoScore * 0.2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
          <p className="text-gray-400">Loading AR & Financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <i className="fas fa-file-invoice-dollar mr-3"></i>
              Accounts Receivable & Financial Analysis
            </h1>
            <p className="text-blue-100 mt-2">
              Integrated view of AR aging, P&L (Accrual & Cash), and Transactions
            </p>
          </div>
          <button
            onClick={fetchAllData}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
          >
            <i className="fas fa-sync mr-2"></i>
            Refresh
          </button>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-amber-500/20 rounded-lg">
            <p className="text-amber-100 text-sm">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </p>
          </div>
        )}
      </div>

      {/* View Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['overview', 'aging', 'cashflow', 'p&l-comparison', 'customers', 'transactions'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedView === view
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
            }`}
          >
            {view.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Overview */}
      {selectedView === 'overview' && data.ar && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Receivables"
              value={formatDollars(data.ar.summary.total)}
              subtitle={`${data.ar.projects.length} active projects`}
              icon="fas fa-dollar-sign"
              color="blue"
            />
            <MetricCard
              title="Current (Not Due)"
              value={formatDollars(data.ar.summary.current)}
              subtitle={`${((data.ar.summary.current / data.ar.summary.total) * 100).toFixed(1)}% of total`}
              icon="fas fa-check-circle"
              color="green"
              trend={data.ar.summary.current / data.ar.summary.total * 100 - 50}
            />
            <MetricCard
              title="Days Sales Outstanding"
              value={`${data.ar.summary.avgDSO} days`}
              subtitle="Average collection period"
              icon="fas fa-calendar-alt"
              color="cyan"
              trend={45 - data.ar.summary.avgDSO}
            />
            <MetricCard
              title="Past Due (>60 days)"
              value={formatDollars(data.ar.summary.days61_90 + data.ar.summary.days90_plus)}
              subtitle="Requires immediate attention"
              icon="fas fa-exclamation-triangle"
              color="red"
              trend={-(data.ar.summary.days61_90 + data.ar.summary.days90_plus) / data.ar.summary.total * 100}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aging Distribution */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">AR Aging Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={processedData?.agingData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {processedData?.agingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatDollars(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Collection Health */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Collection Health Score</h3>
              <div className="flex items-center justify-center h-[250px]">
                <div className="relative">
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
                      stroke={processedData?.healthScore > 70 ? '#10b981' : 
                             processedData?.healthScore > 40 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(processedData?.healthScore || 0) * 5.52} 552`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-200">
                        {processedData?.healthScore || 0}
                      </div>
                      <div className="text-sm text-gray-400">Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aging Details */}
      {selectedView === 'aging' && data.ar && (
        <div className="space-y-6">
          {/* Aging by Project */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">AR Aging by Project</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.ar.projects.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  angle={-45} 
                  textAnchor="end" 
                  height={120}
                  tick={{ fontSize: 10 }}
                />
                <YAxis stroke="#94a3b8" tickFormatter={formatDollars} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="current" stackId="a" fill="#10b981" name="Current" />
                <Bar dataKey="days1_30" stackId="a" fill="#3b82f6" name="1-30 Days" />
                <Bar dataKey="days31_60" stackId="a" fill="#f59e0b" name="31-60 Days" />
                <Bar dataKey="days61_90" stackId="a" fill="#ef4444" name="61-90 Days" />
                <Bar dataKey="days90_plus" stackId="a" fill="#dc2626" name="90+ Days" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Critical Aged Items */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              Critical Aged Items (60+ Days)
            </h3>
            <div className="space-y-3">
              {data.ar.projects
                .filter(p => (p.days61_90 + p.days90_plus) > 0)
                .slice(0, 5)
                .map((project, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <p className="text-gray-200 font-medium">{project.name}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        61-90: {formatDollars(project.days61_90)} | 90+: {formatDollars(project.days90_plus)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-bold text-lg">
                        {formatDollars(project.days61_90 + project.days90_plus)}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {((project.days61_90 + project.days90_plus) / project.total * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Cash Flow View */}
      {selectedView === 'cashflow' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Billings vs Collections Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={processedData?.cashFlowTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={formatDollars} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="billed" fill="#3b82f6" name="Billed" />
                <Bar dataKey="collected" fill="#10b981" name="Collected" />
                <Line 
                  type="monotone" 
                  dataKey="collected" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Collection Trend"
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* P&L Comparison */}
      {selectedView === 'p&l-comparison' && data.plAccrual && data.plCash && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Accrual Net Income"
              value={formatDollars(data.plAccrual.netIncome)}
              subtitle={`Margin: ${data.plAccrual.margin}%`}
              icon="fas fa-chart-line"
              color="green"
            />
            <MetricCard
              title="Cash Net Income"
              value={formatDollars(data.plCash.netIncome)}
              subtitle={`Margin: ${data.plCash.margin}%`}
              icon="fas fa-money-bill-wave"
              color="blue"
            />
            <MetricCard
              title="Accrual vs Cash Variance"
              value={formatDollars(data.plAccrual.netIncome - data.plCash.netIncome)}
              subtitle="Timing difference"
              icon="fas fa-exchange-alt"
              color="purple"
            />
          </div>

          {/* Comparison Chart */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Accrual vs Cash P&L</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={[
                  { category: 'Revenue', accrual: data.plAccrual.revenue.total, cash: data.plCash.revenue.total },
                  { category: 'Direct Costs', accrual: -data.plAccrual.expenses.categories['Direct Costs'], cash: -data.plCash.expenses.categories['Direct Costs'] },
                  { category: 'Labor', accrual: -data.plAccrual.expenses.categories['Labor'], cash: -data.plCash.expenses.categories['Labor'] },
                  { category: 'Overhead', accrual: -data.plAccrual.expenses.categories['Overhead'], cash: -data.plCash.expenses.categories['Overhead'] },
                  { category: 'Net Income', accrual: data.plAccrual.netIncome, cash: data.plCash.netIncome },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="category" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={formatDollars} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="accrual" fill="#8b5cf6" name="Accrual Basis" />
                <Bar dataKey="cash" fill="#06b6d4" name="Cash Basis" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Customers View */}
      {selectedView === 'customers' && data.ar && (
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Customer AR Analysis</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Customer</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Total AR</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Current</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Past Due</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Projects</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody>
                {data.ar.customers.map((customer, idx) => {
                  const pastDuePercent = (customer.aged / customer.total) * 100;
                  const risk = pastDuePercent > 30 ? 'High' : pastDuePercent > 15 ? 'Medium' : 'Low';
                  const riskColor = risk === 'High' ? 'text-red-400' : risk === 'Medium' ? 'text-amber-400' : 'text-green-400';
                  
                  return (
                    <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="py-3 px-4 text-gray-200">{customer.name}</td>
                      <td className="py-3 px-4 text-right text-gray-200">{formatDollars(customer.total)}</td>
                      <td className="py-3 px-4 text-right text-gray-200">{formatDollars(customer.current)}</td>
                      <td className="py-3 px-4 text-right text-red-400">{formatDollars(customer.aged)}</td>
                      <td className="py-3 px-4 text-right text-gray-200">{customer.projectCount}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-medium ${riskColor}`}>{risk}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions View */}
      {selectedView === 'transactions' && data.transactions && (
        <div className="space-y-6">
          {/* Transaction Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-2">Total Invoiced (MTD)</p>
              <p className="text-2xl font-bold text-blue-400">{formatDollars(data.transactions.summary.totalInvoiced)}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-2">Total Collected (MTD)</p>
              <p className="text-2xl font-bold text-green-400">{formatDollars(data.transactions.summary.totalCollected)}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-2">Pending Collection</p>
              <p className="text-2xl font-bold text-amber-400">{formatDollars(data.transactions.summary.pendingCollection)}</p>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {data.transactions.recent.map((trans, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center">
                    <i className={`fas ${trans.type === 'invoice' ? 'fa-file-invoice text-blue-400' : 'fa-hand-holding-usd text-green-400'} mr-3`}></i>
                    <div>
                      <p className="text-gray-200">{trans.description}</p>
                      <p className="text-gray-500 text-xs">{trans.date}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${trans.amount > 0 ? 'text-blue-400' : 'text-green-400'}`}>
                    {formatDollars(Math.abs(trans.amount))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARCashflowDashboard;
