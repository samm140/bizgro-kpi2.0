import React, { useState, useEffect } from 'react';

const ARDashboard = ({ portfolioId = 'default' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('summary');
  const [filterDays, setFilterDays] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [portfolioId]);

  const fetchData = async () => {
    console.log('Starting data fetch...');
    setLoading(true);
    setError(null);
    setDebugInfo({});

    try {
      const { googleSheetsDataService } = await import('../../services/googleSheetsDataService');
      setDebugInfo(prev => ({ ...prev, serviceImported: true }));
      
      const allData = await googleSheetsDataService.getAllData();
      console.log('Data received:', allData);
      setDebugInfo(prev => ({ ...prev, dataReceived: true, dataStructure: allData }));

      if (allData) {
        setData(allData);
        setError(null);
      } else {
        throw new Error('No data returned from service');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setDebugInfo(prev => ({ ...prev, error: err.message, stack: err.stack }));
      setData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => ({
    agedReceivables: [
      {
        customer: 'ABC Construction LLC',
        current: 45000,
        days30: 12000,
        days60: 8000,
        days90: 5000,
        total: 70000,
        percentOfTotal: 35,
        month1: 12000,
        month2: 5000,
        month3: 3000,
        month4: 2000,
        month5: 2000,
        older: 1000,
        pastDueAverage: 42
      },
      {
        customer: 'XYZ Builders Inc',
        current: 25000,
        days30: 15000,
        days60: 0,
        days90: 2000,
        total: 42000,
        percentOfTotal: 21,
        month1: 15000,
        month2: 0,
        month3: 0,
        month4: 1000,
        month5: 1000,
        older: 0,
        pastDueAverage: 28
      },
      {
        customer: 'Premier Contracting',
        current: 38000,
        days30: 5000,
        days60: 3000,
        days90: 0,
        total: 46000,
        percentOfTotal: 23,
        month1: 5000,
        month2: 2000,
        month3: 1000,
        month4: 0,
        month5: 0,
        older: 0,
        pastDueAverage: 15
      }
    ],
    profitLossAccrual: {
      type: 'accrual',
      revenue: [
        { account: 'Construction Revenue', amount: 850000 },
        { account: 'Service Revenue', amount: 125000 },
        { account: 'Consulting Revenue', amount: 45000 }
      ],
      expenses: [
        { account: 'Labor Costs', amount: 425000 },
        { account: 'Materials', amount: 285000 },
        { account: 'Operating Expenses', amount: 95000 }
      ],
      totalRevenue: 1020000,
      totalExpenses: 805000,
      netIncome: 215000,
      grossProfit: 306000,
      operatingIncome: 215000,
      transactions: []
    },
    profitLossCash: {
      type: 'cash',
      revenue: [
        { account: 'Cash Revenue', amount: 750000 },
        { account: 'Service Revenue', amount: 100000 }
      ],
      expenses: [
        { account: 'Cash Payments', amount: 400000 },
        { account: 'Operating Costs', amount: 250000 }
      ],
      totalRevenue: 850000,
      totalExpenses: 650000,
      netIncome: 200000,
      grossProfit: 255000,
      operatingIncome: 200000,
      transactions: []
    },
    transactionList: [
      {
        date: '2025-01-20',
        type: 'Invoice',
        number: 'INV-2025-001',
        name: 'ABC Construction LLC',
        customer: 'ABC Construction LLC',
        memo: 'Progress billing - Phase 2',
        amount: 45000,
        openBalance: 45000,
        status: 'Open',
        entity: 'ABC Construction LLC'
      },
      {
        date: '2025-01-18',
        type: 'Payment',
        number: 'PMT-2025-015',
        name: 'XYZ Builders Inc',
        customer: 'XYZ Builders Inc',
        memo: 'Payment received',
        amount: 25000,
        openBalance: 0,
        status: 'Cleared',
        entity: 'XYZ Builders Inc'
      }
    ],
    lastUpdated: new Date().toISOString()
  });

  // Calculate comprehensive metrics
  const calculateMetrics = () => {
    if (!data?.agedReceivables) return null;

    const receivables = data.agedReceivables;
    const totalAR = receivables.reduce((sum, r) => sum + r.total, 0);
    const currentAR = receivables.reduce((sum, r) => sum + r.current, 0);
    const days30AR = receivables.reduce((sum, r) => sum + (r.days30 || r.month1 || 0), 0);
    const days60AR = receivables.reduce((sum, r) => sum + (r.days60 || (r.month2 + r.month3) || 0), 0);
    const days90AR = receivables.reduce((sum, r) => sum + (r.days90 || (r.month4 + r.month5 + r.older) || 0), 0);
    const overdueAR = days30AR + days60AR + days90AR;

    // Financial ratios
    const revenue = data.profitLossAccrual?.totalRevenue || 1;
    const dso = totalAR > 0 ? (totalAR / (revenue / 365)) : 0; // Days Sales Outstanding
    const currentRatio = currentAR / (overdueAR || 1);
    const agingHealth = currentAR / (totalAR || 1) * 100;
    const collectionEfficiency = 100 - (days90AR / (totalAR || 1) * 100);

    return {
      totalAR,
      currentAR,
      days30AR,
      days60AR,
      days90AR,
      overdueAR,
      avgDaysSales: dso.toFixed(1),
      collectionRate: agingHealth.toFixed(1),
      currentRatio: currentRatio.toFixed(2),
      collectionEfficiency: collectionEfficiency.toFixed(1),
      customerCount: receivables.length,
      highRiskCount: receivables.filter(r => (r.days90 || r.month4 || 0) > 0).length,
      avgPastDue: receivables.reduce((sum, r) => sum + (r.pastDueAverage || 0), 0) / receivables.length
    };
  };

  // Filter receivables
  const getFilteredReceivables = () => {
    if (!data?.agedReceivables) return [];

    let filtered = [...data.agedReceivables];

    if (filterDays === 'current') {
      filtered = filtered.filter(r => r.current > 0);
    } else if (filterDays === '30') {
      filtered = filtered.filter(r => (r.days30 || r.month1) > 0);
    } else if (filterDays === '60') {
      filtered = filtered.filter(r => (r.days60 || r.month2 || r.month3) > 0);
    } else if (filterDays === '90') {
      filtered = filtered.filter(r => (r.days90 || r.month4 || r.month5 || r.older) > 0);
    } else if (filterDays === 'overdue') {
      filtered = filtered.filter(r => 
        (r.days30 || r.month1 || r.days60 || r.month2 || r.month3 || r.days90 || r.month4 || r.month5 || r.older) > 0
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => b.total - a.total);
  };

  const testDirectAccess = async () => {
    const SPREADSHEET_ID = '16PVlalae-iOCX3VR1sSIB6_QCdTGjXSwmO6x8YttH1I';
    const gid = '98770792';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}`;
    
    console.log('Testing direct CSV access:', csvUrl);
    
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(csvUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        const text = await response.text();
        console.log('CSV Response (first 500 chars):', text.substring(0, 500));
        alert('✅ Successfully connected to Google Sheets!');
        await fetchData();
        return true;
      } else {
        alert(`❌ Connection failed with status: ${response.status}`);
        return false;
      }
    } catch (error) {
      alert(`❌ Connection error: ${error.message}`);
      return false;
    }
  };

  const metrics = calculateMetrics();
  const filteredReceivables = getFilteredReceivables();

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading AR data from Google Sheets...</p>
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
            <h3 className="text-yellow-400 font-semibold">Debug Mode</h3>
            <div className="space-x-2">
              <button
                onClick={testDirectAccess}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
              >
                Test Connection
              </button>
              <button
                onClick={fetchData}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
              >
                Retry Fetch
              </button>
            </div>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-yellow-400 hover:text-yellow-300">
              View Data Structure
            </summary>
            <pre className="text-xs bg-gray-900/50 p-2 rounded mt-2 overflow-auto max-h-60">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">Accounts Receivable Analysis</h2>
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
      <div className="flex space-x-2 border-b border-gray-700">
        {['summary', 'details', 'aging', 'ratios', 'pl', 'transactions'].map(view => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              selectedView === view
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {view === 'pl' ? 'P&L' : view === 'details' ? 'Customers' : view}
          </button>
        ))}
      </div>

      {/* Summary View */}
      {selectedView === 'summary' && metrics && (
        <div>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total AR</span>
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">${metrics.totalAR.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{metrics.customerCount} customers</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Current</span>
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">${metrics.currentAR.toLocaleString()}</p>
              <p className="text-xs text-green-400 mt-1">{metrics.collectionRate}% healthy</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Overdue</span>
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">${metrics.overdueAR.toLocaleString()}</p>
              <p className="text-xs text-yellow-400 mt-1">Avg {metrics.avgPastDue.toFixed(0)} days</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Over 90 Days</span>
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">${metrics.days90AR.toLocaleString()}</p>
              <p className="text-xs text-red-400 mt-1">{metrics.highRiskCount} high-risk</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Collection Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Days Sales Outstanding (DSO)</span>
                  <span className="text-white font-medium">{metrics.avgDaysSales} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Collection Efficiency</span>
                  <span className="text-white font-medium">{metrics.collectionEfficiency}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Ratio</span>
                  <span className="text-white font-medium">{metrics.currentRatio}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Past Due</span>
                  <span className="text-white font-medium">{metrics.avgPastDue.toFixed(0)} days</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Top At-Risk Accounts</h3>
              <div className="space-y-2">
                {data?.agedReceivables
                  ?.filter(r => (r.days90 || r.month4 || r.month5 || r.older || 0) > 0)
                  .slice(0, 4)
                  .map((customer, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700">
                      <div>
                        <p className="text-white text-sm">{customer.customer}</p>
                        <p className="text-red-400 text-xs">90+ days overdue</p>
                      </div>
                      <p className="text-red-400 font-medium">
                        ${(customer.days90 || customer.month4 + customer.month5 + customer.older || 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details View */}
      {selectedView === 'details' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
            <select
              value={filterDays}
              onChange={(e) => setFilterDays(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Receivables</option>
              <option value="current">Current Only</option>
              <option value="overdue">Overdue Only</option>
              <option value="30">30+ Days</option>
              <option value="60">60+ Days</option>
              <option value="90">90+ Days</option>
            </select>
          </div>

          {/* Customer Table */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Current</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">1 Month</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">2 Months</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">3 Months</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">4+ Months</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredReceivables.map((customer, idx) => {
                    const older = (customer.month4 || 0) + (customer.month5 || 0) + (customer.older || 0);
                    return (
                      <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{customer.customer}</p>
                          {customer.pastDueAverage > 0 && (
                            <p className="text-gray-400 text-xs mt-1">Avg {customer.pastDueAverage} days past due</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-white">
                          ${(customer.current || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-white">
                          ${(customer.month1 || customer.days30 || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-yellow-400">
                          ${(customer.month2 || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-orange-400">
                          ${(customer.month3 || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-red-400">
                          ${older.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-white font-bold">${customer.total.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400">
                          {customer.percentOfTotal?.toFixed(1) || '0'}%
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

      {/* Aging Analysis View */}
      {selectedView === 'aging' && metrics && (
        <div className="space-y-6">
          {/* Aging Chart */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Aging Distribution</h3>
            <div className="space-y-4">
              {[
                { label: 'Current', value: metrics.currentAR, color: 'bg-green-500' },
                { label: '1-30 Days', value: metrics.days30AR, color: 'bg-blue-500' },
                { label: '31-60 Days', value: metrics.days60AR, color: 'bg-yellow-500' },
                { label: '61-90 Days', value: metrics.days90AR - (data?.agedReceivables?.reduce((sum, r) => sum + (r.older || 0), 0) || 0), color: 'bg-orange-500' },
                { label: 'Over 90 Days', value: data?.agedReceivables?.reduce((sum, r) => sum + (r.older || 0), 0) || 0, color: 'bg-red-500' }
              ].map((item, idx) => {
                const percentage = metrics.totalAR > 0 ? (item.value / metrics.totalAR * 100) : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white">${item.value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className={`${item.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Aging Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {['Current', '1 Month', '2 Months', '3 Months', '4 Months', '5+ Months'].map((label, idx) => {
                const values = [
                  metrics.currentAR,
                  data?.agedReceivables?.reduce((sum, r) => sum + (r.month1 || 0), 0) || 0,
                  data?.agedReceivables?.reduce((sum, r) => sum + (r.month2 || 0), 0) || 0,
                  data?.agedReceivables?.reduce((sum, r) => sum + (r.month3 || 0), 0) || 0,
                  data?.agedReceivables?.reduce((sum, r) => sum + (r.month4 || 0), 0) || 0,
                  data?.agedReceivables?.reduce((sum, r) => sum + (r.month5 + r.older || 0), 0) || 0
                ];
                const value = values[idx] || 0;
                const colors = ['text-green-400', 'text-blue-400', 'text-yellow-400', 'text-orange-400', 'text-red-400', 'text-red-600'];
                
                return (
                  <div key={label} className="text-center">
                    <p className="text-gray-400 text-xs mb-2">{label}</p>
                    <p className={`text-2xl font-bold ${colors[idx]}`}>
                      ${(value / 1000).toFixed(0)}k
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Financial Ratios View */}
      {selectedView === 'ratios' && metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Collection Ratios</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Days Sales Outstanding (DSO)</span>
                  <span className="text-white font-bold">{metrics.avgDaysSales} days</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${parseFloat(metrics.avgDaysSales) < 30 ? 'bg-green-500' : parseFloat(metrics.avgDaysSales) < 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, parseFloat(metrics.avgDaysSales) / 90 * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: &lt; 30 days</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Collection Efficiency</span>
                  <span className="text-white font-bold">{metrics.collectionEfficiency}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${parseFloat(metrics.collectionEfficiency) > 90 ? 'bg-green-500' : parseFloat(metrics.collectionEfficiency) > 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${metrics.collectionEfficiency}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: &gt; 90%</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Current Ratio</span>
                  <span className="text-white font-bold">{metrics.currentRatio}x</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${parseFloat(metrics.currentRatio) > 2 ? 'bg-green-500' : parseFloat(metrics.currentRatio) > 1 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, parseFloat(metrics.currentRatio) / 3 * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: &gt; 2.0x</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Indicators</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">High Risk Accounts</span>
                <span className={`font-bold ${metrics.highRiskCount > 5 ? 'text-red-400' : metrics.highRiskCount > 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {metrics.highRiskCount} accounts
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">90+ Days Exposure</span>
                <span className={`font-bold ${metrics.days90AR > 50000 ? 'text-red-400' : metrics.days90AR > 20000 ? 'text-yellow-400' : 'text-green-400'}`}>
                  ${metrics.days90AR.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Aging Health Score</span>
                <span className={`font-bold ${parseFloat(metrics.collectionRate) > 70 ? 'text-green-400' : parseFloat(metrics.collectionRate) > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {metrics.collectionRate}%
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Average Past Due</span>
                <span className={`font-bold ${metrics.avgPastDue < 30 ? 'text-green-400' : metrics.avgPastDue < 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {metrics.avgPastDue.toFixed(0)} days
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* P&L Analysis View */}
      {selectedView === 'pl' && data?.profitLossAccrual && data?.profitLossCash && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accrual P&L */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Profit & Loss (Accrual Basis)</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Revenue</p>
                {data.profitLossAccrual.revenue.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1">
                    <span className="text-gray-300 text-sm">{item.account}</span>
                    <span className="text-white">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t border-gray-700 mt-2">
                  <span className="text-gray-300 font-medium">Total Revenue</span>
                  <span className="text-green-400 font-bold">${data.profitLossAccrual.totalRevenue.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Expenses</p>
                {data.profitLossAccrual.expenses.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1">
                    <span className="text-gray-300 text-sm">{item.account}</span>
                    <span className="text-white">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t border-gray-700 mt-2">
                  <span className="text-gray-300 font-medium">Total Expenses</span>
                  <span className="text-red-400 font-bold">${data.profitLossAccrual.totalExpenses.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t-2 border-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-300">Gross Profit</span>
                  <span className="text-white">${data.profitLossAccrual.grossProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Gross Margin</span>
                  <span className="text-white">
                    {((data.profitLossAccrual.grossProfit / data.profitLossAccrual.totalRevenue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-white font-semibold">Net Income</span>
                  <span className={`font-bold text-lg ${data.profitLossAccrual.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${data.profitLossAccrual.netIncome.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cash P&L */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Profit & Loss (Cash Basis)</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Revenue</p>
                {data.profitLossCash.revenue.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1">
                    <span className="text-gray-300 text-sm">{item.account}</span>
                    <span className="text-white">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t border-gray-700 mt-2">
                  <span className="text-gray-300 font-medium">Total Revenue</span>
                  <span className="text-green-400 font-bold">${data.profitLossCash.totalRevenue.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Expenses</p>
                {data.profitLossCash.expenses.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1">
                    <span className="text-gray-300 text-sm">{item.account}</span>
                    <span className="text-white">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t border-gray-700 mt-2">
                  <span className="text-gray-300 font-medium">Total Expenses</span>
                  <span className="text-red-400 font-bold">${data.profitLossCash.totalExpenses.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t-2 border-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-300">Gross Profit</span>
                  <span className="text-white">${data.profitLossCash.grossProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Gross Margin</span>
                  <span className="text-white">
                    {((data.profitLossCash.grossProfit / data.profitLossCash.totalRevenue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-white font-semibold">Net Income</span>
                  <span className={`font-bold text-lg ${data.profitLossCash.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${data.profitLossCash.netIncome.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="lg:col-span-2 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Accrual vs Cash Comparison</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Metric</p>
                <p className="text-white py-2">Revenue</p>
                <p className="text-white py-2">Expenses</p>
                <p className="text-white py-2 font-semibold">Net Income</p>
                <p className="text-white py-2">Margin %</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Accrual</p>
                <p className="text-white py-2">${(data.profitLossAccrual.totalRevenue / 1000).toFixed(0)}k</p>
                <p className="text-white py-2">${(data.profitLossAccrual.totalExpenses / 1000).toFixed(0)}k</p>
                <p className={`py-2 font-semibold ${data.profitLossAccrual.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${(data.profitLossAccrual.netIncome / 1000).toFixed(0)}k
                </p>
                <p className="text-white py-2">
                  {((data.profitLossAccrual.netIncome / data.profitLossAccrual.totalRevenue) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Cash</p>
                <p className="text-white py-2">${(data.profitLossCash.totalRevenue / 1000).toFixed(0)}k</p>
                <p className="text-white py-2">${(data.profitLossCash.totalExpenses / 1000).toFixed(0)}k</p>
                <p className={`py-2 font-semibold ${data.profitLossCash.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${(data.profitLossCash.netIncome / 1000).toFixed(0)}k
                </p>
                <p className="text-white py-2">
                  {((data.profitLossCash.netIncome / data.profitLossCash.totalRevenue) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions View */}
      {selectedView === 'transactions' && data?.transactionList && (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer/Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Memo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data.transactionList.slice(0, 20).map((transaction, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-white text-sm">
                      {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.type === 'Invoice' ? 'bg-blue-900/50 text-blue-400' :
                        transaction.type === 'Payment' ? 'bg-green-900/50 text-green-400' :
                        transaction.type === 'Bill' ? 'bg-orange-900/50 text-orange-400' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{transaction.number}</td>
                    <td className="px-6 py-4 text-white text-sm">{transaction.entity}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{transaction.memo}</td>
                    <td className="px-6 py-4 text-right text-white">
                      ${Math.abs(transaction.amount || transaction.netAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.status === 'Open' ? 'bg-yellow-900/50 text-yellow-400' :
                        transaction.status === 'Cleared' ? 'bg-green-900/50 text-green-400' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {transaction.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARDashboard;
