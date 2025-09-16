import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell
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
  };
  return map[color] || map.blue;
};

const DiamondbackDashboard = () => {
  const [wipData, setWipData] = useState([]);
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

      const headers = rows[0];
      const dataRows = rows.slice(1).filter(r => r.some(c => c && c.length));

      const formattedData = dataRows.map(r => {
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = r[idx] ?? '';
        });
        return obj;
      });

      setWipData(formattedData);
      setLoading(false);
      // eslint-disable-next-line no-console
      console.log('Loaded', formattedData.length, 'projects from CSV');
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
      const formattedData = (payload.table.rows || []).map(r => {
        const obj = {};
        (r.c || []).forEach((cell, idx) => {
          obj[cols[idx] || `col_${idx}`] = cell && cell.v !== null ? cell.v : '';
        });
        return obj;
      });

      setWipData(formattedData);
      setLoading(false);
      console.log('Loaded', formattedData.length, 'projects using gviz JSON endpoint');
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

  // --- small components ---
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

  const RiskFlag = ({ level }) => {
    const colors = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-green-500' };
    return (
      <span className={`inline-block px-2 py-1 rounded text-xs text-white ${colors[level] || 'bg-slate-500'}`}>
        {String(level || '').toUpperCase()}
      </span>
    );
  };

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
      <div className="flex space-x-4">
        {['overview', 'projects', 'risk', 'reconciliation', 'trends'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
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

          {/* Over/Under Waterfall (approximation) */}
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
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  formatter={(value) => `$${Math.round(value).toLocaleString()}`}
                />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Scatter Plot */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Risk Matrix: % Complete vs Margin</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="percentComplete" name="% Complete" stroke="#94a3b8" domain={[0, 100]} />
                <YAxis dataKey="mtd" name="Margin TD" stroke="#94a3b8" domain={[-10, 40]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  formatter={(value, name) => [
                    name === 'percentComplete' || name === 'mtd'
                      ? `${(value || 0).toFixed(1)}%`
                      : `${(value || 0).toLocaleString()}`,
                    name,
                  ]}
                />
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

          {/* Top Risk Projects */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Top Risk Projects</h3>
            <div className="space-y-3">
              {enrichedProjects
                .slice()
                .sort((a, b) => Math.abs(b.overUnderPercent) - Math.abs(a.overUnderPercent))
                .slice(0, 10)
                .map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div>
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

          {/* O/U Distribution */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Over/Under Distribution by Project</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrichedProjects.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="Project" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  formatter={(value) => `${(value || 0).toFixed(1)}%`}
                />
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

      {/* Selected Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedProject(null)}>
          <div className="bg-slate-800 rounded-xl p-8 max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
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
