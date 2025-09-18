import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell,
  ComposedChart
} from 'recharts';

// Comprehensive AP Dashboard with Google Sheets Integration
const APDashboard = ({ portfolioId = 'default' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('summary');
  const [filterDays, setFilterDays] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [topN, setTopN] = useState(6);

  // Color palette matching AR Dashboard
  const palette = ['#0ea5e9', '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#14b8a6', '#a855f7'];

  // Utility functions
  const currency = (n) => (n ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  const pct = (n) => `${(n * 100).toFixed(1)}%`;
  const sum = (arr, key) => arr?.reduce((a, c) => a + (key ? (c[key] ?? 0) : c ?? 0), 0) ?? 0;

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    // Auto-run test in debug mode
    if (debugMode) {
      testAPDataFetch();
    }
    
    return () => clearInterval(interval);
  }, [portfolioId]);

  const fetchData = async () => {
    console.log('Starting AP data fetch...');
    setLoading(true);
    setError(null);

    try {
      // Import the default export, not a named export
      const apGoogleSheetsDataService = (await import('../../services/apGoogleSheetsDataService')).default;
      
      // Now call the method
      const allData = await apGoogleSheetsDataService.getAllAPData();
      
      console.log('AP Data received:', allData);
      
      if (allData) {
        setData(allData);
        setError(null);
      } else {
        throw new Error('No AP data returned from service');
      }
    } catch (err) {
      console.error('Error fetching AP data:', err);
      setError(err.message);
      setData(getMockData());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Test function to debug data fetching
  const testAPDataFetch = async () => {
    console.log('=====================================');
    console.log('RUNNING AP DATA FETCH TEST');
    console.log('=====================================');
    
    try {
      // Import the default export
      const apGoogleSheetsDataService = (await import('../../services/apGoogleSheetsDataService')).default;
      
      // Test fetching data
      console.log('Testing AP data fetch...');
      const data = await apGoogleSheetsDataService.getAllAPData();
      console.log('AP Data result:', data);
      
      // Check what's in the summary
      console.log('AP Summary:', data.apSummary);
      console.log('Vendors found:', data.apByVendor?.length || 0);
      console.log('Projects found:', data.apByProject?.length || 0);
      console.log('Aging trend points:', data.agingTrend?.length || 0);
      
      // Check if we got real data or mock
      if (data.apSummary?.total > 0) {
        console.log('✓ Real data loaded successfully!');
        console.log('Total AP:', data.apSummary.total);
      } else {
        console.log('✗ No real data - using mock fallback');
      }
      
      // Test the connection directly
      if (apGoogleSheetsDataService.testConnection) {
        console.log('\nTesting direct sheet connection...');
        await apGoogleSheetsDataService.testConnection();
      }
      
      // Add to window for manual testing
      window.apTestData = data;
      window.apService = apGoogleSheetsDataService;
      console.log('\nTest complete! Access data with:');
      console.log('- window.apTestData (to see fetched data)');
      console.log('- window.apService (to access service methods)');
      console.log('- window.apService.testConnection() (to test connection)');
      
    } catch (error) {
      console.error('Test failed:', error);
      console.error('Stack trace:', error.stack);
    }
  };

  const getMockData = () => ({
    apSummary: {
      total: 1573400,
      current: 602000,
      b1_30: 318200,
      b31_60: 254600,
      b61_90: 182800,
      b90_plus: 216800,
      dpo: 43,
      onTimePct: 88,
      billsMTD: 512300,
      paymentsMTD: 438900
    },
    apByVendor: [
      { vendor: 'Sherwin-Williams', amount: 221400 },
      { vendor: 'Grainger', amount: 187900 },
      { vendor: 'Fastenal', amount: 165300 },
      { vendor: 'Home Depot Pro', amount: 142800 },
      { vendor: 'HD Supply', amount: 118200 },
      { vendor: 'United Rentals', amount: 101600 }
    ],
    apByProject: [
      { project: 'Merit – HQ Renovation', amount: 142500 },
      { project: 'Dayton – Hospital Wing', amount: 128900 },
      { project: 'Bobby – Stadium Phase II', amount: 117600 }
    ],
    agingTrend: [
      { date: '2025-05-31', current: 520000, b1_30: 285000, b31_60: 215000, b61_90: 170000, b90_plus: 195000 },
      { date: '2025-06-30', current: 565000, b1_30: 300000, b31_60: 225000, b61_90: 175000, b90_plus: 205000 },
      { date: '2025-07-31', current: 602000, b1_30: 318200, b31_60: 254600, b61_90: 182800, b90_plus: 216800 }
    ],
    billsVsPayments: [
      { date: '2025-05-31', bills: 455000, payments: 432000 },
      { date: '2025-06-30', bills: 498000, payments: 471000 },
      { date: '2025-07-31', bills: 512300, payments: 438900 }
    ],
    bankSnapshot: [
      { account: 'Operating – BOA', balance: 425000 },
      { account: 'Payroll – Chase', balance: 187500 },
      { account: 'MM – Fidelity', balance: 610000 }
    ],
    bankTrend: [
      { date: '2025-05-31', balance: 945000 },
      { date: '2025-06-30', balance: 1015000 },
      { date: '2025-07-31', balance: 1187500 }
    ],
    liquidAssets: {
      cash: 1187500,
      marketableSecurities: 375000,
      revolverAvailability: 800000,
      other: 125000
    },
    vendors: [],
    invoices: [],
    lastUpdated: new Date().toISOString()
  });

  // Calculate metrics
  const calculateMetrics = () => {
    if (!data?.apSummary) return null;

    const ap = data.apSummary;
    const totalOverdue = ap.b1_30 + ap.b31_60 + ap.b61_90 + ap.b90_plus;
    const currentRatio = ap.current / (totalOverdue || 1);
    const healthScore = (ap.current / (ap.total || 1)) * 100;
    
    return {
      ...ap,
      totalOverdue,
      currentRatio: currentRatio.toFixed(2),
      healthScore: healthScore.toFixed(1),
      vendorCount: data.apByVendor?.length || 0,
      highRiskCount: data.apByVendor?.filter(v => v.amount > 100000).length || 0,
      netCashflow: ap.paymentsMTD - ap.billsMTD
    };
  };

  // Calculate vendor concentration metrics
  const calculateConcentration = () => {
    if (!data?.apByVendor) return { top1: 0, top3: 0, top5: 0, hhi: 0, gini: 0 };
    
    const total = sum(data.apByVendor, 'amount');
    const shares = data.apByVendor.map(v => ({ ...v, share: v.amount / total }));
    
    const top1 = shares[0]?.share || 0;
    const top3 = shares.slice(0, 3).reduce((a, v) => a + v.share, 0);
    const top5 = shares.slice(0, 5).reduce((a, v) => a + v.share, 0);
    const hhi = shares.reduce((a, v) => a + Math.pow(v.share, 2), 0);
    
    // Simplified Gini coefficient
    const gini = 0.35; // Would need full calculation
    
    return { top1, top3, top5, hhi, gini };
  };

  const metrics = calculateMetrics();
  const concentration = calculateConcentration();

  // Filter vendors based on search
  const getFilteredVendors = () => {
    if (!data?.apByVendor) return [];
    
    let filtered = [...data.apByVendor];
    
    if (searchTerm) {
      filtered = filtered.filter(v => 
        v.vendor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.slice(0, topN);
  };

  const filteredVendors = getFilteredVendors();

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading AP data from Google Sheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Panel */}
      {debugMode && (
        <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-yellow-400 font-semibold">Debug Mode - AP Dashboard</h3>
            <div className="space-x-2">
              <button
                onClick={testAPDataFetch}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
              >
                Run Test
              </button>
              <button
                onClick={fetchData}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
              >
                Retry Fetch
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-400 mb-2">
            Check browser console for detailed test results. Test will auto-run when debug mode is enabled.
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-yellow-400 hover:text-yellow-300">
              View AP Data Structure
            </summary>
            <pre className="text-xs bg-gray-900/50 p-2 rounded mt-2 overflow-auto max-h-60">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">Accounts Payable Dashboard</h2>
          {data?.lastUpdated && (
            <span className="text-sm text-gray-400">
              Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg transition-colors"
          >
            {debugMode ? 'Hide' : 'Show'} Debug
          </button>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className={`px-4 py-2 rounded-lg transition-colors ${
              refreshing 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {error && !debugMode && (
        <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">Using cached/mock data. Enable debug mode for details.</p>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex space-x-2 border-b border-gray-700 overflow-x-auto">
        {['summary', 'vendors', 'projects', 'aging', 'cashflow', 'concentration', 'alerts'].map(view => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-4 py-2 font-medium capitalize transition-colors whitespace-nowrap ${
              selectedView === view
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Summary View */}
      {selectedView === 'summary' && metrics && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg p-6 bg-gray-800/50 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total A/P</span>
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{currency(metrics.total)}</p>
              <p className="text-xs text-gray-500 mt-1">Current: {currency(metrics.current)}</p>
            </div>

            <div className="rounded-lg p-6 bg-gray-800/50 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">MTD Bills</span>
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{currency(metrics.billsMTD)}</p>
              <p className="text-xs text-gray-500 mt-1">Payments: {currency(metrics.paymentsMTD)}</p>
              <div className="mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  metrics.netCashflow >= 0 
                    ? 'bg-green-900/50 text-green-400' 
                    : 'bg-red-900/50 text-red-400'
                }`}>
                  {metrics.netCashflow >= 0 ? '+' : ''}{currency(metrics.netCashflow)}
                </span>
              </div>
            </div>

            <div className="rounded-lg p-6 bg-gray-800/50 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">DPO</span>
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{metrics.dpo} days</p>
              <p className="text-xs text-gray-500 mt-1">Days Payable Outstanding</p>
            </div>

            <div className="rounded-lg p-6 bg-gray-800/50 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">On-Time %</span>
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{metrics.onTimePct}%</p>
              <p className="text-xs text-gray-500 mt-1">Vendor payment compliance</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AP Aging Pie Chart */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">AP Aging Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Current', value: metrics.current },
                        { name: '1-30', value: metrics.b1_30 },
                        { name: '31-60', value: metrics.b31_60 },
                        { name: '61-90', value: metrics.b61_90 },
                        { name: '90+', value: metrics.b90_plus }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {[0, 1, 2, 3, 4].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={palette[index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => currency(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Liquid Assets */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Liquid Assets</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(data?.liquidAssets || {}).map(([k, v]) => ({
                      name: k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1'),
                      value: v
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                    <YAxis tick={{ fill: '#9CA3AF' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => currency(v)} contentStyle={{ backgroundColor: '#1F2937' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} fill={palette[1]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendors View */}
      {selectedView === 'vendors' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            <select
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value={6}>Top 6</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>All</option>
            </select>
          </div>

          {/* Vendor Chart and Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Top Vendors by AP</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...filteredVendors].reverse()}
                    layout="horizontal"
                    margin={{ top: 8, right: 16, left: 80, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" tick={{ fill: '#9CA3AF' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="vendor" tick={{ fill: '#9CA3AF' }} width={75} />
                    <Tooltip formatter={(v) => currency(v)} contentStyle={{ backgroundColor: '#1F2937' }} />
                    <Bar dataKey="amount" radius={[0, 8, 8, 0]} fill={palette[0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Vendor Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Vendor</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">Amount</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredVendors.map((vendor, idx) => (
                      <tr key={idx} className="hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-white text-sm">{vendor.vendor}</td>
                        <td className="px-4 py-3 text-right text-white">{currency(vendor.amount)}</td>
                        <td className="px-4 py-3 text-right text-gray-400">
                          {((vendor.amount / metrics.total) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects View */}
      {selectedView === 'projects' && data?.apByProject && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">AP by Project</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.apByProject.slice(0, topN)}
                margin={{ top: 8, right: 16, left: 16, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="project" 
                  tick={{ fill: '#9CA3AF' }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tick={{ fill: '#9CA3AF' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => currency(v)} contentStyle={{ backgroundColor: '#1F2937' }} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill={palette[2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Aging Trend View */}
      {selectedView === 'aging' && data?.agingTrend && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">AP Aging Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.agingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#9CA3AF' }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => currency(v)} contentStyle={{ backgroundColor: '#1F2937' }} />
                  <Legend />
                  <Bar dataKey="current" stackId="a" name="Current" fill={palette[0]} />
                  <Bar dataKey="b1_30" stackId="a" name="1-30" fill={palette[1]} />
                  <Bar dataKey="b31_60" stackId="a" name="31-60" fill={palette[2]} />
                  <Bar dataKey="b61_90" stackId="a" name="61-90" fill={palette[3]} />
                  <Bar dataKey="b90_plus" stackId="a" name="90+" fill={palette[4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Current', value: metrics.current, color: 'text-green-400' },
              { label: '1-30 Days', value: metrics.b1_30, color: 'text-blue-400' },
              { label: '31-60 Days', value: metrics.b31_60, color: 'text-yellow-400' },
              { label: '61-90 Days', value: metrics.b61_90, color: 'text-orange-400' },
              { label: '90+ Days', value: metrics.b90_plus, color: 'text-red-400' }
            ].map((bucket, idx) => (
              <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
                <p className="text-gray-400 text-xs mb-2">{bucket.label}</p>
                <p className={`text-2xl font-bold ${bucket.color}`}>
                  ${(bucket.value / 1000).toFixed(0)}k
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {((bucket.value / metrics.total) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cashflow View */}
      {selectedView === 'cashflow' && (
        <div className="space-y-6">
          {/* Bills vs Payments */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Bills vs Payments Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.billsVsPayments || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fill: '#9CA3AF' }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => currency(v)} contentStyle={{ backgroundColor: '#1F2937' }} />
                  <Legend />
                  <Line type="monotone" dataKey="bills" stroke={palette[4]} strokeWidth={2} dot={false} name="Bills" />
                  <Line type="monotone" dataKey="payments" stroke={palette[2]} strokeWidth={2} dot={false} name="Payments" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bank Balances */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Bank Accounts</h3>
              <div className="space-y-3">
                {data?.bankSnapshot?.map((bank, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">{bank.account}</span>
                    <span className="text-white font-medium">{currency(bank.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 font-semibold">
                  <span className="text-gray-300">Total Cash</span>
                  <span className="text-green-400">
                    {currency(data?.bankSnapshot?.reduce((sum, b) => sum + b.balance, 0) || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Cash Trend</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.bankTrend || []}>
                    <defs>
                      <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" tick={{ fill: '#9CA3AF' }} />
                    <YAxis tick={{ fill: '#9CA3AF' }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => currency(v)} contentStyle={{ backgroundColor: '#1F2937' }} />
                    <Area type="monotone" dataKey="balance" stroke="#0ea5e9" fill="url(#cashGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Concentration View */}
      {selectedView === 'concentration' && (
        <div className="space-y-6">
          {/* Concentration Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="rounded-lg p-5 bg-gray-800/50 border border-gray-700">
              <div className="text-sm text-gray-400">Top 1 Vendor</div>
              <div className="mt-1 text-2xl font-semibold text-white">{pct(concentration.top1)}</div>
              <StatusIndicator value={concentration.top1} goodMax={0.20} warnMax={0.35} />
            </div>
            <div className="rounded-lg p-5 bg-gray-800/50 border border-gray-700">
              <div className="text-sm text-gray-400">Top 3 Share</div>
              <div className="mt-1 text-2xl font-semibold text-white">{pct(concentration.top3)}</div>
              <StatusIndicator value={concentration.top3} goodMax={0.45} warnMax={0.65} />
            </div>
            <div className="rounded-lg p-5 bg-gray-800/50 border border-gray-700">
              <div className="text-sm text-gray-400">Top 5 Share</div>
              <div className="mt-1 text-2xl font-semibold text-white">{pct(concentration.top5)}</div>
              <StatusIndicator value={concentration.top5} goodMax={0.60} warnMax={0.75} />
            </div>
            <div className="rounded-lg p-5 bg-gray-800/50 border border-gray-700">
              <div className="text-sm text-gray-400">HHI Index</div>
              <div className="mt-1 text-2xl font-semibold text-white">{concentration.hhi.toFixed(3)}</div>
              <StatusIndicator value={concentration.hhi} goodMax={0.15} warnMax={0.25} />
            </div>
            <div className="rounded-lg p-5 bg-gray-800/50 border border-gray-700">
              <div className="text-sm text-gray-400">Gini Coefficient</div>
              <div className="mt-1 text-2xl font-semibold text-white">{concentration.gini.toFixed(3)}</div>
              <StatusIndicator value={concentration.gini} goodMax={0.45} warnMax={0.65} />
            </div>
          </div>

          {/* Pareto Chart */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Vendor Concentration - Pareto Analysis</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                  data={data?.apByVendor?.slice(0, 10).map((v, i, arr) => {
                    const cumulative = arr.slice(0, i + 1).reduce((sum, item) => sum + item.amount, 0);
                    const total = arr.reduce((sum, item) => sum + item.amount, 0);
                    return {
                      ...v,
                      cumShare: cumulative / total
                    };
                  })}
                  margin={{ top: 8, right: 16, left: 8, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="vendor" angle={-25} textAnchor="end" height={80} tick={{ fill: '#9CA3AF' }} />
                  <YAxis yAxisId="left" tick={{ fill: '#9CA3AF' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 1]} tick={{ fill: '#9CA3AF' }} tickFormatter={(v) => `${Math.round(v*100)}%`} />
                  <Tooltip formatter={(v, n) => n === 'cumShare' ? pct(v) : currency(v)} contentStyle={{ backgroundColor: '#1F2937' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="amount" name="AP Amount" fill={palette[0]} radius={[6,6,0,0]} />
                  <Line yAxisId="right" type="monotone" dataKey="cumShare" name="Cumulative %" stroke={palette[4]} strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Alerts View */}
      {selectedView === 'alerts' && (
        <div className="space-y-6">
          <AlertsPanel 
            data={data} 
            metrics={metrics} 
            concentration={concentration}
          />
        </div>
      )}
    </div>
  );
};

// Status Indicator Component
const StatusIndicator = ({ value, goodMax, warnMax, goodMin, warnMin }) => {
  let status = 'ok';
  
  if (goodMax !== undefined) {
    if (value > warnMax) status = 'alert';
    else if (value > goodMax) status = 'warn';
  } else if (goodMin !== undefined) {
    if (value < warnMin) status = 'alert';
    else if (value < goodMin) status = 'warn';
  }
  
  const colors = {
    ok: 'bg-green-900/50 text-green-400',
    warn: 'bg-yellow-900/50 text-yellow-400',
    alert: 'bg-red-900/50 text-red-400'
  };
  
  const labels = {
    ok: 'Good',
    warn: 'Warning',
    alert: 'Alert'
  };
  
  return (
    <div className="mt-2">
      <span className={`px-2 py-0.5 rounded-full text-xs ${colors[status]}`}>
        {labels[status]}
      </span>
    </div>
  );
};

// Alerts Panel Component
const AlertsPanel = ({ data, metrics, concentration }) => {
  const alerts = [];
  
  // Concentration alerts
  if (concentration.top1 > 0.35) {
    alerts.push({
      severity: 'alert',
      title: `High concentration risk: Top vendor at ${(concentration.top1 * 100).toFixed(1)}%`,
      detail: 'Consider diversifying vendor base to reduce supply chain risk.'
    });
  } else if (concentration.top1 > 0.20) {
    alerts.push({
      severity: 'warn',
      title: `Vendor concentration warning: Top vendor at ${(concentration.top1 * 100).toFixed(1)}%`,
      detail: 'Monitor vendor performance and consider backup suppliers.'
    });
  }
  
  // Payment performance alerts
  if (metrics?.onTimePct < 90) {
    alerts.push({
      severity: metrics.onTimePct < 80 ? 'alert' : 'warn',
      title: `On-time payment rate low: ${metrics.onTimePct}%`,
      detail: 'Review AP processes to improve payment timeliness and maintain vendor relationships.'
    });
  }
  
  // Aging alerts
  if (metrics?.b90_plus > metrics?.total * 0.25) {
    alerts.push({
      severity: 'alert',
      title: `High aged payables: ${((metrics.b90_plus / metrics.total) * 100).toFixed(1)}% over 90 days`,
      detail: 'Escalate old invoices for resolution to avoid vendor disputes.'
    });
  }
  
  // Cashflow alerts
  if (metrics?.netCashflow < 0 && Math.abs(metrics.netCashflow) > metrics.billsMTD * 0.2) {
    alerts.push({
      severity: 'warn',
      title: `Negative cashflow trend: ${Math.abs(metrics.netCashflow).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
      detail: 'Bills exceeding payments significantly. Review payment scheduling.'
    });
  }
  
  // DPO alerts
  if (metrics?.dpo > 60) {
    alerts.push({
      severity: 'warn',
      title: `Extended payment cycle: ${metrics.dpo} days`,
      detail: 'Long payment cycles may strain vendor relationships.'
    });
  }
  
  // Add positive alerts
  if (alerts.length === 0) {
    alerts.push({
      severity: 'ok',
      title: 'All metrics within normal ranges',
      detail: 'No immediate AP concerns detected.'
    });
  }
  
  const alertColors = {
    ok: 'bg-green-900/20 border-green-600/50 text-green-400',
    warn: 'bg-yellow-900/20 border-yellow-600/50 text-yellow-400',
    alert: 'bg-red-900/20 border-red-600/50 text-red-400'
  };
  
  return (
    <div>
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">
          Active Alerts ({alerts.filter(a => a.severity !== 'ok').length})
        </h3>
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <div 
              key={idx}
              className={`rounded-lg p-4 border ${alertColors[alert.severity]}`}
            >
              <div className="font-medium">{alert.title}</div>
              <div className="text-sm opacity-90 mt-1">{alert.detail}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Benchmarks Reference */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Target Benchmarks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">Concentration Targets</h4>
            <ul className="space-y-1 text-gray-400">
              <li>• Top vendor ≤ 20% (warn &gt; 35%)</li>
              <li>• Top 3 vendors ≤ 45% (warn &gt; 65%)</li>
              <li>• Top 5 vendors ≤ 60% (warn &gt; 75%)</li>
              <li>• HHI ≤ 0.15 (warn &gt; 0.25)</li>
              <li>• Gini ≤ 0.45 (warn &gt; 0.65)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">Performance Targets</h4>
            <ul className="space-y-1 text-gray-400">
              <li>• On-time payments ≥ 95%</li>
              <li>• DPO 30-45 days optimal</li>
              <li>• AP &gt; 90 days ≤ 15% of total</li>
              <li>• Monthly bill/payment variance ≤ 10%</li>
              <li>• Vendor compliance ≥ 98%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APDashboard;
