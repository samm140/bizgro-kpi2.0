// src/components/portfolio/DiamondbackDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// Google Sheets configuration
const SPREADSHEET_ID = '1cJk9quQv9naXoQaVWBC4ueo0RwDfJ_RgK_ZObjrt7VM';
const SHEET_GID = '1032119441'; // From your sheet URL after #gid=

// --- helpers ---
const toNum = (v) => {
  if (v === undefined || v === null) return 0;
  if (typeof v === 'number') return v;
  // remove $, %, commas, spaces
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

const classFromPalette = (color) => {
  // avoid Tailwind purge issues with dynamic class names
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

// Reconciliation data structure
const reconciliationData = {
  projectRevenue: {
    cyBilledToDate: 26400884.11,
    pyBilledToDate: 19179059.22,
    cyOnly: 7221824.89,
    cyRevenueEarned: 26935127.84,
    pyRevenueEarned: 19966275.07,
    cyOnlyEarned: 7883196.20
  },
  priorYear: {
    rvsOverUnder: -252972.12,
    overbilling: 912542.26,
    underbilling: 785414.68,
    overUnderTotal: -127127.58,
    totalIncome: 7421237.79,
    updatedOverbilling: 144201.54,
    updatedUnderbilling: 931417.39,
    updatedTotal: 787215.85,
    bookedVsUpdatedOB: 768340.72,
    bookedVsUpdatedUB: -146002.71,
    bookedVsUpdatedTotal: -914343.43
  },
  current: {
    overbilling: 176953.98,
    underbilling: 711197.72,
    overUnderTotal: 534243.73,
    billedToDate: 7221824.89,
    earnedToDate: 7883196.20,
    netOverUnder: -72285.32
  },
  costs: {
    totalDirectCogs: 5233002.86,
    jobCostsToDate: 5234263.52,
    difference: 1260.66,
    totalCogs: 5906947.56,
    unallocatedCogs: 672684.04,
    cyCost: 18439401.53,
    pyCost: 13205138.01,
    cyOnlyCost: 5234263.52
  },
  metrics: {
    indirectAllocation: 9.31,
    grossMarginToDate: 20.40
  }
};

// ---------- small UI components ----------
const RiskFlag = ({ level }) => {
  const colors = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-green-500' };
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs text-white ${colors[level] || 'bg-slate-500'}`}>
      {String(level || '').toUpperCase()}
    </span>
  );
};

const MetricCard = ({ title, value, subtitle, trend, color = 'blue' }) => {
  const colorClass = classFromPalette(color);
  const isNumber = typeof value === 'number';
  const display =
    isNumber
      ? (Math.abs(value) < 1000
          ? value.toLocaleString('en-US', { maximumFractionDigits: 2 })
          : value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            }))
      : value;

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
          <h3 className={`text-3xl font-bold ${colorClass}`}>{display}</h3>
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

// Custom tooltip for dollar amounts in waterfall
const CustomWaterfallTooltip = ({ active, payload }) => {
  if (active && payload && payload[0]) {
    return (
      <div className="bg-slate-900 border border-slate-600 rounded p-3">
        <p className="text-gray-300 text-sm">{payload[0].payload.name}</p>
        <p className="text-white font-bold">{formatDollars(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for percentages in risk charts
const CustomPercentTooltip = ({ active, payload }) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-600 rounded p-3">
        <p className="text-white font-bold">{data.Project || data.name}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-gray-300 text-sm">
            {entry.name}: {entry.value?.toFixed(1)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom dollar tooltip
const CustomDollarTooltip = ({ active, payload }) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-600 rounded p-3">
        <p className="text-white font-bold">{data.Project || data.name}</p>
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

/* ============================================
   ReconciliationWaterfall Component (ADDED)
   ============================================ */
// Add this component inside DiamondbackDashboard.jsx (before the main component)
const ReconciliationWaterfall = ({
  rvsPriorOU = -252972.12,
  updatedPYTotal = 787215.85,
  currentPeriodOUTotal = 534243.73,
  title = 'RVS Prior O/U → Updated PY → Current Period (Waterfall)',
}) => {
  // Build waterfall dataset with cumulative positioning
  const buildWaterfall = (steps) => {
    let running = 0;
    return steps.map((s, i) => {
      const base = i === 0 ? 0 : running;
      running += s.delta;
      return {
        label: s.label,
        base: Math.min(base, running),
        deltaPos: s.delta > 0 ? s.delta : 0,
        deltaNeg: s.delta < 0 ? -s.delta : 0,
        total: running,
        color: s.color,
      };
    });
  };

  const steps = [
    { label: 'RVS prior O/U', delta: rvsPriorOU, color: '#94a3b8' },
    { label: 'Updated PY O/U (Net)', delta: updatedPYTotal, color: '#10b981' },
    { label: 'Current Period O/U (Net)', delta: currentPeriodOUTotal, color: '#f59e0b' },
  ];

  const data = buildWaterfall(steps);

  const CustomWFTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const datum = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-600 rounded p-3">
        <p className="text-gray-300 text-sm">{datum.label}</p>
        {'total' in datum ? (
          <p className="text-white font-bold">Total: {formatDollars(datum.total)}</p>
        ) : null}
        {payload.map((p, idx) => (
          <p key={idx} className="text-gray-400 text-xs">
            {p.dataKey === 'deltaPos' && p.value ? `+ ${formatDollars(p.value)}` : null}
            {p.dataKey === 'deltaNeg' && p.value ? `- ${formatDollars(p.value)}` : null}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" tickFormatter={formatDollars} />
          <Tooltip content={<CustomWFTooltip />} />
          <Bar dataKey="base" stackId="w" fill="transparent" />
          <Bar dataKey="deltaPos" stackId="w">
            {data.map((d, i) => (
              <Cell key={`p-${i}`} fill={d.color || '#10b981'} />
            ))}
          </Bar>
          <Bar dataKey="deltaNeg" stackId="w">
            {data.map((d, i) => (
              <Cell key={`n-${i}`} fill={d.color || '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-500 mt-3">
        Interpretation: Start at zero. Apply the prior-year roll-forward balance (<strong>RVS prior O/U</strong>), then apply
        <strong> Updated PY</strong> net O/U, then the <strong>Current Period</strong> net O/U. The final stacked height equals the net
        over/under position flowing into your balance sheet and WIP tie-out.
      </p>
    </div>
  );
};

const DiamondbackDashboard = () => {
  const [wipData, setWipData] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState({}); // For P-T columns
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchWIPData();
    const interval = setInterval(fetchWIPData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchWIPData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Always use CORS proxy for the artifact environment
      const proxyUrl = 'https://corsproxy.io/?';
      const directUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
      const csvUrl = proxyUrl + encodeURIComponent(directUrl);
      
      console.log('Fetching from:', csvUrl);

      const response = await fetch(csvUrl, { 
        cache: 'no-store',
        headers: {
          'Accept': 'text/csv'
        }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const csvText = await response.text();

      // robust-ish CSV parsing (still simpler than PapaParse)
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

      if (!rows.length) throw new Error('No data found in sheet');

      // Skip the first row (totals) and use the second row as headers
      const headers = rows[1] || rows[0]; // Use row 2 as headers (index 1)
      
      // Only use columns A-N (indices 0-13)
      const projectHeaders = headers.slice(0, 14);
      
      // Extract summary metrics from columns P-T (indices 15-19)
      const summaryData = {};
      if (rows[0] && rows[0].length > 19) {
        // P & Q pair
        const labelP = rows[0][15];
        const valueQ = toNum(rows[0][16]);
        if (labelP) summaryData[labelP] = valueQ;
        
        // S & T pair
        const labelS = rows[0][18];
        const valueT = toNum(rows[0][19]);
        if (labelS) summaryData[labelS] = valueT;
      }
      setSummaryMetrics(summaryData);
      
      const dataRows = rows.slice(2).filter(r => r.some(c => c && c.length)); // Start from row 3 for data

      const formattedData = dataRows.map(r => {
        const obj = {};
        projectHeaders.forEach((h, idx) => {
          obj[h] = r[idx] ?? '';
        });
        return obj;
      });

      setWipData(formattedData);
      setLoading(false);
      console.log('Loaded', formattedData.length, 'projects from CSV (columns A-N only)');
      console.log('Summary metrics from P-T:', summaryData);
    } catch (err) {
      console.error('CSV fetch error:', err);
      // Try JSON fallback
      await tryAlternativeFetch();
    }
  };

  // Alternative fetch method using Google Visualization JSON endpoint
  const tryAlternativeFetch = async () => {
    try {
      const jsonUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;
      const resp = await fetch(jsonUrl, { cache: 'no-store' });
      const text = await resp.text();
      // Strip the JS wrapper: google.visualization.Query.setResponse(...)
      const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*?)\);?$/);
      if (!match) throw new Error('Unexpected JSON format from gviz endpoint');
      const payload = JSON.parse(match[1]);

      const cols = (payload.table.cols || []).map(c => c.label || c.id || '');
      // Use only first 14 columns
      const projectCols = cols.slice(0, 14);
      
      // Skip the first row (totals) in the gviz data too
      const dataRowsToProcess = (payload.table.rows || []).slice(1); // Skip first data row which contains totals
      const formattedData = dataRowsToProcess.map(r => {
        const obj = {};
        (r.c || []).slice(0, 14).forEach((cell, idx) => {
          obj[projectCols[idx] || `col_${idx}`] = cell && cell.v !== null ? cell.v : '';
        });
        return obj;
      });

      setWipData(formattedData);
      setLoading(false);
      console.log('Loaded', formattedData.length, 'projects using gviz JSON endpoint (columns A-N only)');
    } catch (err) {
      console.error('Alternative fetch also failed:', err);
      setError(
        `Unable to load data from Google Sheets (CORS or format). 
Suggestions:
1) Ensure the Sheet is shared "Anyone with the link: Viewer".
2) Use the gviz JSON URL above in a server-side function and proxy to the client.
3) If testing locally, try a local CORS proxy or deploy to a domain.`
      );
      setLoading(false);
    }
  };

  // --- portfolio metrics ---
  const calculatePortfolioMetrics = () => {
    if (!wipData.length)
      return {
        totalContract: 0,
        earnedToDate: 0,
        billedToDate: 0,
        actualCosts: 0,
        estimatedCosts: 0,
        overbilled: 0,
        underbilled: 0,
        profitToDate: 0,
        marginToDate: 0,
        estimatedProfit: 0,
        estimatedMargin: 0,
        backlogRemaining: 0,
        netOverUnder: 0,
        projectsInProgress: 0,
        totalProjects: 0,
      };

    const totalContract = wipData.reduce((s, p) => s + toNum(p['Total Contract']), 0);
    const earnedToDate = wipData.reduce((s, p) => s + toNum(p['Revenue Earned to Date']), 0);
    const billedToDate = wipData.reduce((s, p) => s + toNum(p['Revenue Billed to Date']), 0);
    const actualCosts = wipData.reduce((s, p) => s + toNum(p['Job Costs to Date'] || p['Actual Costs To Date']), 0);
    const estimatedCosts = wipData.reduce((s, p) => s + toNum(p['Estimated Costs']), 0);

    const overbilled = wipData.reduce((s, p) => {
      const btd = toNum(p['Revenue Billed to Date']);
      const ret = toNum(p['Revenue Earned to Date']);
      return s + Math.max(btd - ret, 0);
    }, 0);

    const underbilled = wipData.reduce((s, p) => {
      const btd = toNum(p['Revenue Billed to Date']);
      const ret = toNum(p['Revenue Earned to Date']);
      return s + Math.max(ret - btd, 0);
    }, 0);

    const profitToDate = earnedToDate - actualCosts;
    const marginToDate = earnedToDate > 0 ? (profitToDate / earnedToDate) * 100 : 0;
    const estimatedProfit = totalContract - estimatedCosts;
    const estimatedMargin = totalContract > 0 ? (estimatedProfit / totalContract) * 100 : 0;
    const backlogRemaining = totalContract - earnedToDate;
    const netOverUnder = overbilled - underbilled;

    const projectsInProgress = wipData.filter((p) => {
      const pct = toNum(p['% Complete']);
      return pct > 0 && pct < 100;
    }).length;

    return {
      totalContract,
      earnedToDate,
      billedToDate,
      actualCosts,
      estimatedCosts,
      overbilled,
      underbilled,
      profitToDate,
      marginToDate,
      estimatedProfit,
      estimatedMargin,
      backlogRemaining,
      netOverUnder,
      projectsInProgress,
      totalProjects: wipData.length,
    };
  };

  const metrics = calculatePortfolioMetrics();

  // --- per-project enrichment ---
  const calculateProjectMetrics = (project) => {
    const tc = toNum(project['Total Contract']);
    const eac = toNum(project['Estimated Costs']);
    const ac = toNum(project['Job Costs to Date'] || project['Actual Costs To Date']);
    const btd = toNum(project['Revenue Billed to Date']);
    const ret = toNum(project['Revenue Earned to Date']);

    const percentComplete = eac > 0 ? (ac / eac) * 100 : 0;
    const overbilled = Math.max(btd - ret, 0);
    const underbilled = Math.max(ret - btd, 0);
    const ptd = ret - ac;
    const mtd = ret > 0 ? (ptd / ret) * 100 : 0;
    const epac = tc - eac;
    const emac = tc > 0 ? (epac / tc) * 100 : 0;
    const overUnderPercent = tc > 0 ? ((btd - ret) / tc) * 100 : 0;
    const riskLevel =
      Math.abs(overUnderPercent) > 5 ? 'high' : Math.abs(overUnderPercent) > 2 ? 'medium' : 'low';

    return {
      ...project,
      percentComplete,
      overbilled,
      underbilled,
      ptd,
      mtd,
      epac,
      emac,
      overUnderPercent,
      riskLevel,
    };
  };

  const enrichedProjects = wipData.map(calculateProjectMetrics);

  // Calculate customer analytics
  const calculateCustomerAnalytics = () => {
    const customerData = {};
    enrichedProjects.forEach(p => {
      const customer = p['Customer'];
      if (!customer) return;
      if (!customerData[customer]) {
        customerData[customer] = {
          name: customer,
          projectCount: 0,
          totalVolume: 0,
          totalEarned: 0,
          totalCosts: 0,
          avgMargin: 0,
          margins: []
        };
      }
      customerData[customer].projectCount++;
      customerData[customer].totalVolume += toNum(p['Total Contract']);
      customerData[customer].totalEarned += toNum(p['Revenue Earned to Date']);
      customerData[customer].totalCosts += toNum(p['Job Costs to Date'] || p['Actual Costs To Date']);
      customerData[customer].margins.push(p.mtd);
    });
    Object.values(customerData).forEach(c => {
      c.avgMargin = c.margins.reduce((a, b) => a + b, 0) / c.margins.length || 0;
      c.marginCategory = c.avgMargin > 25 ? 'high' : c.avgMargin > 15 ? 'medium' : 'low';
      c.volumeShare = (c.totalVolume / (metrics.totalContract || 1)) * 100 || 0;
    });
    return Object.values(customerData);
  };

  const customerAnalytics = calculateCustomerAnalytics();

  // Prepare risk distribution data
  const riskDistribution = [
    { name: 'Low Risk', value: enrichedProjects.filter(p => p.riskLevel === 'low').length, color: '#10b981' },
    { name: 'Medium Risk', value: enrichedProjects.filter(p => p.riskLevel === 'medium').length, color: '#f59e0b' },
    { name: 'High Risk', value: enrichedProjects.filter(p => p.riskLevel === 'high').length, color: '#ef4444' }
  ];

  // --- render branches ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400 text-center">
          <i className="fas fa-spinner fa-spin text-4xl mb-4"></i>
          <p>Loading WIP data from Google Sheets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-400 text-center max-w-2xl">
          <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <h2 className="text-2xl font-bold mb-2">Configuration Required</h2>
          <p className="mb-4 whitespace-pre-wrap">{error}</p>
          <button
            onClick={fetchWIPData}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-sync mr-2"></i>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <i className="fas fa-hard-hat mr-3"></i>
              DiamondBack Construction WIP Analysis
            </h1>
            <p className="text-amber-100 mt-2">Real-time contract analysis and work-in-progress metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-amber-100 text-sm">Last updated: {new Date().toLocaleTimeString()}</span>
            <button
              onClick={fetchWIPData}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
            >
              <i className="fas fa-sync mr-2"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex space-x-4 overflow-x-auto">
        {['overview', 'projects', 'risk', 'trends', 'reconciliation'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedView === view
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Portfolio Metrics Cards */}
      {selectedView === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Total Contract Value" value={metrics.totalContract} subtitle={`${metrics.totalProjects} projects`} color="blue" />
            <MetricCard
              title="Earned to Date"
              value={metrics.earnedToDate || 0}
              subtitle={`${((metrics.earnedToDate / (metrics.totalContract || 1)) * 100).toFixed(1)}% of total`}
              color="green"
            />
            <MetricCard
              title="Profit to Date"
              value={metrics.profitToDate || 0}
              subtitle={`Margin: ${(metrics.marginToDate || 0).toFixed(1)}%`}
              trend={(metrics.marginToDate || 0) - (metrics.estimatedMargin || 0)}
              color="cyan"
            />
            <MetricCard
              title="Net Over/Under"
              value={metrics.netOverUnder || 0}
              subtitle={`OB: ${Math.round(metrics.overbilled || 0).toLocaleString()} | UB: ${Math.round(metrics.underbilled || 0).toLocaleString()}`}
              color={metrics.netOverUnder > 0 ? 'green' : 'red'}
            />
          </div>

          {/* Summary Metrics from P-T columns */}
          {Object.keys(summaryMetrics).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(summaryMetrics).map(([label, value]) => (
                <MetricCard key={label} title={label} value={value} color="purple" />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard title="Backlog Remaining" value={metrics.backlogRemaining} subtitle="Unearned contract value" color="purple" />
            <MetricCard
              title="Estimated Margin @ Completion"
              value={`${(metrics.estimatedMargin || 0).toFixed(1)}%`}
              subtitle={`Profit: ${Math.round(metrics.estimatedProfit || 0).toLocaleString()}`}
              trend={(metrics.estimatedMargin || 0) - 20} // assumes 20% target
              color="indigo"
            />
            <MetricCard title="Projects in Progress" value={metrics.projectsInProgress} subtitle={`of ${metrics.totalProjects} total`} color="orange" />
          </div>

          {/* Over/Under Waterfall with dollar formatting */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Billing Reconciliation Waterfall</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Billed', value: metrics.billedToDate, fill: '#3b82f6' },
                  { name: 'Earned', value: -metrics.earnedToDate, fill: '#ef4444' },
                  { name: 'Overbilled', value: metrics.overbilled, fill: '#10b981' },
                  { name: 'Underbilled', value: -metrics.underbilled, fill: '#f59e0b' },
                  { name: 'Net O/U', value: metrics.netOverUnder, fill: metrics.netOverUnder > 0 ? '#10b981' : '#ef4444' },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={formatDollars} />
                <Tooltip content={<CustomWaterfallTooltip />} />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Projects View */}
      {selectedView === 'projects' && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Contract</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">% Complete</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Earned</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Billed</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">O/U</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Margin TD</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {enrichedProjects.map((project, index) => {
                  const tc = toNum(project['Total Contract']);
                  const o = Math.max(toNum(project['Revenue Billed to Date']) - toNum(project['Revenue Earned to Date']), 0);
                  const u = Math.max(toNum(project['Revenue Earned to Date']) - toNum(project['Revenue Billed to Date']), 0);
                  const ouLabel = o > 0 ? '+' : u > 0 ? '-' : '';
                  const ouVal = Math.abs(o || u);

                  return (
                    <tr
                      key={index}
                      className="hover:bg-slate-700/30 cursor-pointer transition-colors"
                      onClick={() => setSelectedProject(project)}
                    >
                      <td className="px-4 py-3 text-gray-300">{project['Project']}</td>
                      <td className="px-4 py-3 text-gray-300">{project['Customer']}</td>
                      <td className="px-4 py-3 text-right text-gray-300">
                        ${Math.round(tc).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end">
                          <div className="w-24 bg-slate-600 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${Math.max(0, Math.min(project.percentComplete, 100)).toFixed(1)}%` }}
                            />
                          </div>
                          <span className="text-gray-300 text-sm">
                            {(project.percentComplete || 0).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300">
                        ${Math.round(toNum(project['Revenue Earned to Date'])).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300">
                        ${Math.round(toNum(project['Revenue Billed to Date'])).toLocaleString()}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          o > 0 ? 'text-green-400' : u > 0 ? 'text-amber-400' : 'text-gray-300'
                        }`}
                      >
                        {ouLabel}${Math.round(ouVal).toLocaleString()}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          project.mtd > 20 ? 'text-green-400' : project.mtd > 15 ? 'text-amber-400' : 'text-red-400'
                        }`}
                      >
                        {(project.mtd || 0).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <RiskFlag level={project.riskLevel} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Risk Analysis View */}
      {selectedView === 'risk' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Scatter Plot with percentage tooltips */}
            <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Risk Matrix: % Complete vs Margin</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="percentComplete" name="% Complete" stroke="#94a3b8" domain={[0, 100]} unit="%" />
                  <YAxis dataKey="mtd" name="Margin TD" stroke="#94a3b8" domain={[-10, 40]} unit="%" />
                  <Tooltip content={<CustomPercentTooltip />} />
                  <Scatter name="Projects" data={enrichedProjects} fill="#8884d8">
                    {enrichedProjects.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.riskLevel === 'high' ? '#ef4444' : entry.riskLevel === 'medium' ? '#f59e0b' : '#10b981'}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Risk Distribution Pie Chart */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {riskDistribution.map((item) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-gray-400">{item.value} projects</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Risk Projects */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Top Risk Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {enrichedProjects
                .slice()
                .sort((a, b) => Math.abs(b.overUnderPercent) - Math.abs(a.overUnderPercent))
                .slice(0, 10)
                .map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-200">{project['Project']}</p>
                      <p className="text-sm text-gray-400">{project['Customer']}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          Math.abs(project.overUnderPercent || 0) > 5 ? 'text-red-400' : 'text-amber-400'
                        }`}
                      >
                        {(project.overUnderPercent || 0).toFixed(1)}% O/U
                      </p>
                      <RiskFlag level={project.riskLevel} />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* O/U Distribution with percentage tooltips */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Over/Under Distribution by Project (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrichedProjects.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="Project" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomPercentTooltip />} />
                <Bar dataKey="overUnderPercent" name="O/U % of Contract">
                  {enrichedProjects.slice(0, 20).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={(entry.overUnderPercent || 0) > 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Enhanced Trends View with Customer Analytics */}
      {selectedView === 'trends' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Volume Concentration */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Customer Volume Concentration</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerAnalytics
                      .sort((a, b) => b.totalVolume - a.totalVolume)
                      .slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalVolume"
                    nameKey="name"
                  >
                    {customerAnalytics.slice(0, 8).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'][index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatDollars(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Customer Margin Analysis */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Customer Margin Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={customerAnalytics
                    .sort((a, b) => b.avgMargin - a.avgMargin)
                    .slice(0, 10)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomPercentTooltip />} />
                  <Bar dataKey="avgMargin" name="Avg Margin %">
                    {customerAnalytics.slice(0, 10).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.avgMargin > 25 ? '#10b981' : entry.avgMargin > 15 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Contract Size vs Margin with corrected currency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Contract Size vs Profit Margin</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="contractValue" 
                    name="Contract Size" 
                    stroke="#94a3b8" 
                    tickFormatter={formatDollars}
                    domain={['dataMin', 'dataMax']}
                  />
                  <YAxis 
                    dataKey="mtd" 
                    name="Margin %" 
                    stroke="#94a3b8" 
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomDollarTooltip />} />
                  <Scatter 
                    name="Projects" 
                    data={enrichedProjects.map(p => ({
                      ...p,
                      contractValue: toNum(p['Total Contract']),
                      Project: p['Project']
                    }))} 
                    fill="#8b5cf6"
                  >
                    {enrichedProjects.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.mtd > 20 ? '#10b981' : entry.mtd > 10 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Top 5 Projects Performance Radar */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Top 5 Projects - Performance Metrics</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={enrichedProjects.slice(0, 5).map(p => ({
                  project: (p['Project'] || '').substring(0, 15),
                  margin: p.mtd,
                  completion: p.percentComplete,
                  efficiency: Math.min(100, (p.mtd / 20) * 100) // relative to 20% target
                }))}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="project" stroke="#94a3b8" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                  <Radar name="Margin %" dataKey="margin" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Radar name="Completion %" dataKey="completion" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Tooltip content={<CustomPercentTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Performance Table */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Customer Performance Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Projects</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Total Volume</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Volume Share</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Avg Margin</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {customerAnalytics
                    .sort((a, b) => b.totalVolume - a.totalVolume)
                    .slice(0, 15)
                    .map((customer, index) => (
                      <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-gray-300">{customer.name}</td>
                        <td className="px-4 py-3 text-right text-gray-300">{customer.projectCount}</td>
                        <td className="px-4 py-3 text-right text-gray-300">
                          {formatDollars(customer.totalVolume)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">
                          {customer.volumeShare.toFixed(1)}%
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          customer.avgMargin > 25 ? 'text-green-400' : 
                          customer.avgMargin > 15 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {customer.avgMargin.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          <RiskFlag level={customer.marginCategory === 'high' ? 'low' : 
                                          customer.marginCategory === 'medium' ? 'medium' : 'high'} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reconciliation View */}
      {selectedView === 'reconciliation' && (
        <div className="space-y-6">
          {/* Project Revenue Calculations */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Project Revenue Calculations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Current Year</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Billed to Date</span>
                    <span className="text-gray-200 font-medium">{formatDollars(reconciliationData.projectRevenue.cyBilledToDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Revenue Earned</span>
                    <span className="text-gray-200 font-medium">{formatDollars(reconciliationData.projectRevenue.cyRevenueEarned)}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Prior Year</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Billed to Date</span>
                    <span className="text-gray-200 font-medium">{formatDollars(reconciliationData.projectRevenue.pyBilledToDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Revenue Earned</span>
                    <span className="text-gray-200 font-medium">{formatDollars(reconciliationData.projectRevenue.pyRevenueEarned)}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Current Year Only</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Billed to Date</span>
                    <span className="text-green-400 font-bold">{formatDollars(reconciliationData.projectRevenue.cyOnly)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Revenue Earned</span>
                    <span className="text-green-400 font-bold">{formatDollars(reconciliationData.projectRevenue.cyOnlyEarned)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prior Year Over/Under Calculations */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Prior Year Over/Under Calculations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-3">Balance Sheet Totals</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">RVS Prior O/U</span>
                    <span className="text-red-400 font-medium">{formatDollars(reconciliationData.priorYear.rvsOverUnder)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Overbilling</span>
                    <span className="text-gray-200">{formatDollars(reconciliationData.priorYear.overbilling)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Underbilling</span>
                    <span className="text-gray-200">{formatDollars(reconciliationData.priorYear.underbilling)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-600 pt-2">
                    <span className="text-gray-300">O/U Total</span>
                    <span className="text-red-400 font-bold">{formatDollars(reconciliationData.priorYear.overUnderTotal)}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-3">Updated Prior Year WIP</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Overbilling (Updated)</span>
                    <span className="text-gray-200">{formatDollars(reconciliationData.priorYear.updatedOverbilling)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Underbilling (Updated)</span>
                    <span className="text-gray-200">{formatDollars(reconciliationData.priorYear.updatedUnderbilling)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-600 pt-2">
                    <span className="text-gray-300">O/U Total (Updated)</span>
                    <span className="text-green-400 font-bold">{formatDollars(reconciliationData.priorYear.updatedTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">Booked vs Updated</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Overbilling</span>
                  <span className="text-gray-200">{formatDollars(reconciliationData.priorYear.bookedVsUpdatedOB)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Underbilling</span>
                  <span className="text-red-400">{formatDollars(reconciliationData.priorYear.bookedVsUpdatedUB)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total</span>
                  <span className="text-red-400 font-bold">{formatDollars(reconciliationData.priorYear.bookedVsUpdatedTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Period Over/Under */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Current Period Over/Under Calculations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard title="Current Overbilling" value={reconciliationData.current.overbilling} color="green" />
              <MetricCard title="Current Underbilling" value={reconciliationData.current.underbilling} color="amber" />
              <MetricCard title="O/U Total (Current)" value={reconciliationData.current.overUnderTotal} color="blue" />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Revenue Earned to Date</span>
                  <span className="text-blue-400 font-bold">{formatDollars(reconciliationData.current.earnedToDate)}</span>
                </div>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Net Over/Under (Difference)</span>
                  <span className="text-red-400 font-bold">{formatDollars(reconciliationData.current.netOverUnder)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Cost Calculations */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Project Cost Calculations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Direct Costs</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Direct COGS</span>
                    <span className="text-gray-200 font-medium">{formatDollars(reconciliationData.costs.totalDirectCogs)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Job Costs to Date</span>
                    <span className="text-gray-200 font-medium">{formatDollars(reconciliationData.costs.jobCostsToDate)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-600 pt-2">
                    <span className="text-gray-300">Difference</span>
                    <span className="text-amber-400">{formatDollars(reconciliationData.costs.difference)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Total COGS Analysis</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total COGS</span>
                    <span className="text-gray-200 font-medium">{formatDollars(reconciliationData.costs.totalCogs)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Job Costs to Date</span>
                    <span className="text-gray-200 font-medium">{formatDollars(reconciliationData.costs.jobCostsToDate)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-600 pt-2">
                    <span className="text-gray-300">Unallocated COGS</span>
                    <span className="text-red-400 font-bold">{formatDollars(reconciliationData.costs.unallocatedCogs)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">Year-over-Year</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">CY Cost</span>
                    <span className="text-gray-200 font-medium">{formatDollars(reconciliationData.costs.cyCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">PY Cost</span>
                    <span className="text-gray-200 font-medium">{formatDollars(reconciliationData.costs.pyCost)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-600 pt-2">
                    <span className="text-gray-300">CY Only</span>
                    <span className="text-green-400 font-bold">{formatDollars(reconciliationData.costs.cyOnlyCost)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Key Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-gray-300">Indirect Allocation %</p>
                    <p className="text-xs text-gray-500">Overhead allocation rate</p>
                  </div>
                  <span className="text-2xl font-bold text-amber-400">{reconciliationData.metrics.indirectAllocation}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-gray-300">Gross Margin to Date</p>
                    <p className="text-xs text-gray-500">Overall profitability</p>
                  </div>
                  <span className="text-2xl font-bold text-green-400">{reconciliationData.metrics.grossMarginToDate}%</span>
                </div>
              </div>
            </div>

            {/* Reconciliation Summary */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Reconciliation Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                  <span className="text-gray-300">Total Income</span>
                  <span className="text-gray-200 font-medium">{formatDollars(reconciliationData.priorYear.totalIncome)}</span>
                </div>
                <div className="flex justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                  <span className="text-gray-300">Revenue Earned (CY)</span>
                  <span className="text-gray-200 font-medium">{formatDollars(reconciliationData.current.earnedToDate)}</span>
                </div>
                <div className="flex justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                  <span className="text-gray-300">Total B/S (PY)</span>
                  <span className="text-gray-200 font-medium">{formatDollars(6968852.77)}</span>
                </div>
                <div className="flex justify-between p-2 hover:bg-slate-700/30 rounded transition-colors">
                  <span className="text-gray-300">Total WIP (Updated)</span>
                  <span className="text-gray-200 font-medium">{formatDollars(7955481.52)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* >>> ADDED: Two ReconciliationWaterfall charts <<< */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Period Waterfall */}
            <ReconciliationWaterfall
              title="Billed → Earned → Net O/U (Current)"
              rvsPriorOU={reconciliationData.current.billedToDate}
              updatedPYTotal={-reconciliationData.current.earnedToDate}
              currentPeriodOUTotal={reconciliationData.current.overUnderTotal}
            />
            
            {/* Historical Reconciliation Waterfall */}
            <ReconciliationWaterfall
              title="Prior Year O/U Reconciliation"
              rvsPriorOU={reconciliationData.priorYear.rvsOverUnder}
              updatedPYTotal={reconciliationData.priorYear.updatedTotal}
              currentPeriodOUTotal={reconciliationData.current.overUnderTotal}
            />
          </div>

          {/* Waterfall Chart for Reconciliation */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Revenue Reconciliation Waterfall</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={[
                  { name: 'PY Revenue', value: reconciliationData.projectRevenue.pyRevenueEarned, fill: '#3b82f6' },
                  { name: 'CY Earned', value: reconciliationData.projectRevenue.cyOnlyEarned, fill: '#10b981' },
                  { name: 'PY O/U Adjustment', value: reconciliationData.priorYear.bookedVsUpdatedTotal, fill: '#ef4444' },
                  { name: 'Current O/U', value: reconciliationData.current.overUnderTotal, fill: '#f59e0b' },
                  { name: 'Total CY Revenue', value: reconciliationData.projectRevenue.cyRevenueEarned, fill: '#8b5cf6' }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" angle={-20} textAnchor="end" height={80} />
                <YAxis stroke="#94a3b8" tickFormatter={formatDollars} />
                <Tooltip content={<CustomWaterfallTooltip />} />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Selected Project Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-slate-800 rounded-xl p-8 max-w-4xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-200">{selectedProject['Project']}</h2>
                <p className="text-gray-400">{selectedProject['Customer']}</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-gray-200">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Contract Value</p>
                <p className="text-xl font-bold text-gray-200">
                  ${Math.round(toNum(selectedProject['Total Contract'])).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">% Complete</p>
                <p className="text-xl font-bold text-blue-400">{(selectedProject.percentComplete || 0).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Margin TD</p>
                <p className="text-xl font-bold text-green-400">{(selectedProject.mtd || 0).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Risk Level</p>
                <div className="mt-1">
                  <RiskFlag level={selectedProject.riskLevel} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Revenue Analysis</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Earned to Date</span>
                      <span className="text-gray-200 font-medium">
                        ${Math.round(toNum(selectedProject['Revenue Earned to Date'])).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Billed to Date</span>
                      <span className="text-gray-200 font-medium">
                        ${Math.round(toNum(selectedProject['Revenue Billed to Date'])).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-600 pt-2">
                      <span className="text-gray-300">Over/Under</span>
                      <span
                        className={`font-bold ${
                          selectedProject.overbilled > 0 ? 'text-green-400' : 'text-amber-400'
                        }`}
                      >
                        {selectedProject.overbilled > 0 ? '+' : '-'}$
                        {Math.round(Math.abs(selectedProject.overbilled || selectedProject.underbilled)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Cost Analysis</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Actual Costs TD</span>
                      <span className="text-gray-200 font-medium">
                        ${Math.round(toNum(selectedProject['Job Costs to Date'] || selectedProject['Actual Costs To Date'])).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Estimated at Completion</span>
                      <span className="text-gray-200 font-medium">
                        ${Math.round(toNum(selectedProject['Estimated Costs'])).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-600 pt-2">
                      <span className="text-gray-300">Cost to Complete</span>
                      <span className="text-gray-200 font-bold">
                        ${Math.max(toNum(selectedProject['Estimated Costs']) - toNum(selectedProject['Job Costs to Date'] || selectedProject['Actual Costs To Date']), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DiamondbackDashboard;
