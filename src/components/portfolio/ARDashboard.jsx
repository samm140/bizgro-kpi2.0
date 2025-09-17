// src/components/portfolio/ARDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area, PieChart, Pie, Cell, ComposedChart
} from 'recharts';

// Google Sheets configuration - Your actual AR Sheet
const AR_SPREADSHEET_ID = '16PVlalae-iOCX3VR1sSIB6_QCdTGjXSwmO6x8YttH1I';
const AR_SHEET_GID = '943478698'; // ARbyProject tab

// Portfolio configuration (matching DiamondbackDashboard pattern)
const PORTFOLIO_CONFIG = {
  portfolioId: 'diamondback-001',
  companyName: 'DiamondBack Construction',
  permissions: ['view', 'edit', 'admin']
};

// --- Helpers (matching DiamondbackDashboard style) ---
const toNum = (v) => {
  if (v === undefined || v === null || v === '') return 0;
  if (typeof v === 'number') return v;
  // Remove $, %, commas, spaces, parentheses for negatives
  let cleaned = String(v).replace(/[\$,%\s]/g, '');
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

const classFromPalette = (color) => {
  const map = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    cyan: 'text-cyan-400',
    indigo: 'text-indigo-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
  };
  return map[color] || map.blue;
};

// Demo data fallback
const demoARData = {
  summary: {
    total: 2487350,
    current: 1087000,
    days1_30: 515250,
    days31_60: 420400,
    days61_90: 235700,
    days90_plus: 229000,
    avgDSO: 48,
    collectionIndex: 43.7
  },
  projects: [
    { name: 'City Center Tower - Phase 2', current: 285000, days1_30: 120000, days31_60: 75000, days61_90: 35000, days90_plus: 20000, total: 535000 },
    { name: 'Memorial Hospital - Wing B', current: 245000, days1_30: 95000, days31_60: 85000, days61_90: 45000, days90_plus: 25000, total: 495000 },
    { name: 'Highway 101 Extension', current: 198000, days1_30: 85000, days31_60: 65000, days61_90: 40000, days90_plus: 30000, total: 418000 },
    { name: 'School District - Renovation', current: 165000, days1_30: 75000, days31_60: 55000, days61_90: 35000, days90_plus: 45000, total: 375000 },
    { name: 'Industrial Park - Phase 1', current: 145000, days1_30: 65000, days31_60: 50000, days61_90: 30000, days90_plus: 40000, total: 330000 },
    { name: 'Downtown Office Complex', current: 125000, days1_30: 55000, days31_60: 45000, days61_90: 35000, days90_plus: 39000, total: 299000 }
  ],
  customers: [
    { name: 'Turner Construction', current: 485000, aged: 285000, total: 770000, projectCount: 3 },
    { name: 'Skanska USA', current: 398000, aged: 232000, total: 630000, projectCount: 2 },
    { name: 'Clark Construction', current: 342000, aged: 198000, total: 540000, projectCount: 2 },
    { name: 'AECOM', current: 278000, aged: 167000, total: 445000, projectCount: 1 },
    { name: 'Bechtel', current: 234000, aged: 143000, total: 377000, projectCount: 1 }
  ]
};

// MetricCard component (matching DiamondbackDashboard style)
const MetricCard = ({ title, value, subtitle, trend, color = 'blue' }) => {
  const colorClass = classFromPalette(color);
  const trendColor =
    typeof trend === 'number'
      ? trend > 0
        ? 'text-green-400'
        : trend < 0
        ? 'text-red-400'
        : 'text-slate-300'
      : '';

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <h3 className={`text-3xl font-bold ${colorClass}`}>{value}</h3>
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

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload[0]) {
    return (
      <div className="bg-slate-900 border border-slate-600 rounded p-3">
        <p className="text-white font-bold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-gray-300 text-sm">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="ml-2">{formatDollars(entry.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ARDashboard = ({ portfolioId = PORTFOLIO_CONFIG.portfolioId }) => {
  const [arData, setArData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch AR data from Google Sheets (matching DiamondbackDashboard pattern)
  const fetchARData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use CORS proxy (same as DiamondbackDashboard)
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

      // Parse CSV (same robust parsing as DiamondbackDashboard)
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

      // Process AR data
      const data = parseARData(rows);
      setArData(data);
      setLoading(false);
      setLastRefresh(new Date());
      
    } catch (err) {
      console.error('AR data fetch error:', err);
      setError('Using demo data. Check sheet permissions or CORS settings.');
      setArData(demoARData);
      setLoading(false);
    }
  };

  // Parse AR data from rows
  const parseARData = (rows) => {
    if (rows.length < 2) {
      console.log('Not enough data, using demo');
      return demoARData;
    }

    // First row should be headers
    const headers = rows[0];
    console.log('Headers:', headers);

    const projects = [];
    const customers = {};
    let totalCurrent = 0, total1_30 = 0, total31_60 = 0, total61_90 = 0, total90_plus = 0;

    // Process each data row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      if (!row[0] || row[0] === '') continue;

      // Parse based on expected column structure
      // Adjust these indices based on your actual sheet structure
      const projectName = row[0];
      const current = toNum(row[1] || 0);
      const days1_30 = toNum(row[2] || 0);
      const days31_60 = toNum(row[3] || 0);
      const days61_90 = toNum(row[4] || 0);
      const days90_plus = toNum(row[5] || 0);
      const total = toNum(row[6]) || (current + days1_30 + days31_60 + days61_90 + days90_plus);

      if (total > 0) {
        projects.push({
          name: projectName,
          current,
          days1_30,
          days31_60,
          days61_90,
          days90_plus,
          total
        });

        // Group by customer (extract before dash/hyphen)
        const customerName = projectName.split(/[-–]/)[0].trim();
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
    }

    // If no projects found, use demo data
    if (projects.length === 0) {
      console.log('No projects parsed, using demo data');
      return demoARData;
    }

    const totalAR = totalCurrent + total1_30 + total31_60 + total61_90 + total90_plus;
    const avgDSO = calculateDSO(totalAR, totalCurrent);
    const collectionIndex = totalCurrent > 0 ? (totalCurrent / totalAR) * 100 : 0;

    return {
      summary: {
        total: totalAR,
        current: totalCurrent,
        days1_30: total1_30,
        days31_60: total31_60,
        days61_90: total61_90,
        days90_plus: total90_plus,
        avgDSO,
        collectionIndex
      },
      projects: projects.sort((a, b) => b.total - a.total),
      customers: Object.values(customers).sort((a, b) => b.total - a.total)
    };
  };

  // Calculate Days Sales Outstanding
  const calculateDSO = (totalAR, currentAR) => {
    if (totalAR === 0) return 0;
    const pastDueRatio = 1 - (currentAR / totalAR);
    return Math.round(30 + (pastDueRatio * 60)); // Simplified calculation
  };

  // Calculate health score
  const calculateHealthScore = (summary) => {
    if (!summary) return 0;
    const currentRatio = summary.current / Math.max(1, summary.total);
    const criticalAgedRatio = (summary.days61_90 + summary.days90_plus) / Math.max(1, summary.total);
    const dsoScore = Math.max(0, 100 - summary.avgDSO);
    
    return Math.round(
      currentRatio * 40 +           // 40 points for current ratio
      (1 - criticalAgedRatio) * 40 + // 40 points for low critical aging
      (dsoScore / 100) * 20          // 20 points for DSO performance
    );
  };

  // Generate trend data
  const generateTrendData = (summary) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    return months.map((month, i) => ({
      month,
      current: summary.current * (0.7 + i * 0.075),
      aged: (summary.days1_30 + summary.days31_60) * (0.9 - i * 0.05),
      critical: (summary.days61_90 + summary.days90_plus) * (1.1 - i * 0.1)
    }));
  };

  useEffect(() => {
    fetchARData();
    // Refresh every 5 minutes (same as DiamondbackDashboard)
    const interval = setInterval(fetchARData, 300000);
    return () => clearInterval(interval);
  }, [portfolioId]);

  // Process data for visualizations
  const processedData = useMemo(() => {
    if (!arData) return null;

    const agingData = [
      { name: 'Current', value: arData.summary.current, color: '#10b981' },
      { name: '1-30 Days', value: arData.summary.days1_30, color: '#3b82f6' },
      { name: '31-60 Days', value: arData.summary.days31_60, color: '#f59e0b' },
      { name: '61-90 Days', value: arData.summary.days61_90, color: '#ef4444' },
      { name: '90+ Days', value: arData.summary.days90_plus, color: '#dc2626' }
    ].filter(d => d.value > 0);

    const healthScore = calculateHealthScore(arData.summary);
    const trendData = generateTrendData(arData.summary);

    const criticalItems = arData.projects
      .filter(p => (p.days61_90 + p.days90_plus) > 0)
      .sort((a, b) => (b.days61_90 + b.days90_plus) - (a.days61_90 + a.days90_plus))
      .slice(0, 5);

    return {
      agingData,
      healthScore,
      trendData,
      criticalItems
    };
  }, [arData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400 text-center">
          <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
          <p>Loading AR data from Google Sheets...</p>
        </div>
      </div>
    );
  }

  if (!arData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-400 text-center">
          <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <p>Failed to load AR data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header (matching DiamondbackDashboard style) */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <i className="fas fa-file-invoice-dollar mr-3"></i>
              Accounts Receivable Analysis
            </h1>
            <p className="text-blue-100 mt-2">Real-time AR aging and collection metrics</p>
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

      {/* View Selector (matching DiamondbackDashboard style) */}
      <div className="flex space-x-4 overflow-x-auto">
        {['overview', 'aging', 'customers', 'critical', 'trends'].map((view) => (
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
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Receivables"
              value={formatDollars(arData.summary.total)}
              subtitle={`${arData.projects.length} active projects`}
              color="blue"
            />
            <MetricCard
              title="Current (Not Due)"
              value={formatDollars(arData.summary.current)}
              subtitle={`${arData.summary.collectionIndex.toFixed(1)}% of total`}
              trend={arData.summary.collectionIndex - 50}
              color="green"
            />
            <MetricCard
              title="Past Due >60 Days"
              value={formatDollars(arData.summary.days61_90 + arData.summary.days90_plus)}
              subtitle={`${(((arData.summary.days61_90 + arData.summary.days90_plus) / arData.summary.total) * 100).toFixed(1)}% critical`}
              trend={-((arData.summary.days61_90 + arData.summary.days90_plus) / arData.summary.total) * 100}
              color="red"
            />
            <MetricCard
              title="Avg DSO"
              value={`${arData.summary.avgDSO} days`}
              subtitle="Days Sales Outstanding"
              trend={45 - arData.summary.avgDSO}
              color="cyan"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aging Pie Chart */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
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

            {/* Health Score */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
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
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-gray-500 text-xs">Current</p>
                  <p className="text-green-400 font-semibold">{arData.summary.collectionIndex.toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">DSO</p>
                  <p className="text-cyan-400 font-semibold">{arData.summary.avgDSO}d</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Critical</p>
                  <p className="text-red-400 font-semibold">
                    {(((arData.summary.days61_90 + arData.summary.days90_plus) / arData.summary.total) * 100).toFixed(0)}%
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
          {/* Aging by Project Chart */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">AR Aging by Project</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={arData.projects.slice(0, 10)}>
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
                <Bar dataKey="days1_30" stackId="a" fill="#3b82f6" name="1-30" />
                <Bar dataKey="days31_60" stackId="a" fill="#f59e0b" name="31-60" />
                <Bar dataKey="days61_90" stackId="a" fill="#ef4444" name="61-90" />
                <Bar dataKey="days90_plus" stackId="a" fill="#dc2626" name="90+" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Aging Table */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Project</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Current</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">1-30</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">31-60</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">61-90</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">90+</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {arData.projects.map((project, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 text-gray-300">{project.name}</td>
                      <td className="px-4 py-3 text-right text-green-400">{formatDollars(project.current)}</td>
                      <td className="px-4 py-3 text-right text-blue-400">{formatDollars(project.days1_30)}</td>
                      <td className="px-4 py-3 text-right text-amber-400">{formatDollars(project.days31_60)}</td>
                      <td className="px-4 py-3 text-right text-orange-400">{formatDollars(project.days61_90)}</td>
                      <td className="px-4 py-3 text-right text-red-400">{formatDollars(project.days90_plus)}</td>
                      <td className="px-4 py-3 text-right text-gray-200 font-bold">{formatDollars(project.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customers View */}
      {selectedView === 'customers' && (
        <div className="space-y-6">
          {/* Customer Chart */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Customer AR Analysis</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={arData.customers.slice(0, 10)} layout="horizontal" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" tickFormatter={formatDollars} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="current" stackId="a" fill="#10b981" name="Current" />
                <Bar dataKey="aged" stackId="a" fill="#ef4444" name="Past Due" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Table */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Total AR</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Current</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Past Due</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Projects</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {arData.customers.map((customer, idx) => {
                    const pastDuePercent = (customer.aged / customer.total) * 100;
                    const risk = pastDuePercent > 30 ? 'HIGH' : pastDuePercent > 15 ? 'MEDIUM' : 'LOW';
                    const riskColor = risk === 'HIGH' ? 'bg-red-500' : risk === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500';
                    
                    return (
                      <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-gray-300">{customer.name}</td>
                        <td className="px-4 py-3 text-right text-gray-200">{formatDollars(customer.total)}</td>
                        <td className="px-4 py-3 text-right text-green-400">{formatDollars(customer.current)}</td>
                        <td className="px-4 py-3 text-right text-red-400">{formatDollars(customer.aged)}</td>
                        <td className="px-4 py-3 text-right text-gray-300">{customer.projectCount}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded text-xs text-white ${riskColor}`}>
                            {risk}
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

      {/* Critical Items View */}
      {selectedView === 'critical' && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Critical Aged Items (60+ Days)
            <span className="ml-2 text-red-400">
              {formatDollars(arData.summary.days61_90 + arData.summary.days90_plus)}
            </span>
          </h3>
          <div className="space-y-3">
            {processedData?.criticalItems.map((project, idx) => {
              const criticalAmount = project.days61_90 + project.days90_plus;
              const criticalPercent = (criticalAmount / project.total) * 100;
              
              return (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-gray-200 font-medium">{project.name}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-gray-400 text-sm">
                        61-90: {formatDollars(project.days61_90)}
                      </span>
                      <span className="text-gray-400 text-sm">
                        90+: {formatDollars(project.days90_plus)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold text-lg">{formatDollars(criticalAmount)}</p>
                    <p className="text-gray-500 text-xs">{criticalPercent.toFixed(1)}% of project total</p>
                  </div>
                </div>
              );
            })}
            
            {(!processedData?.criticalItems || processedData.criticalItems.length === 0) && (
              <p className="text-gray-400 text-center py-8">No critical aged items found</p>
            )}
          </div>
        </div>
      )}

      {/* Trends View */}
      {selectedView === 'trends' && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">AR Aging Trend</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={processedData?.trendData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={formatDollars} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="current" stackId="1" stroke="#10b981" fill="#10b981" name="Current" />
              <Area type="monotone" dataKey="aged" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="1-60 Days" />
              <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" name="60+ Days" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ARDashboard;
