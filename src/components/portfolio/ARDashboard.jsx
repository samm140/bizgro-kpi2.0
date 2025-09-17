import React, { useState, useEffect } from 'react';
import { googleSheetsDataService } from '../../services/googleSheetsDataService';

const ARDashboard = ({ portfolioId = 'default' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('summary');
  const [filterDays, setFilterDays] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real data from Google Sheets
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const allData = await googleSheetsDataService.getAllData();
      setData(allData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Using cached or mock data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [portfolioId]);

  // Calculate summary metrics
  const calculateMetrics = () => {
    if (!data?.agedReceivables) return null;

    const receivables = data.agedReceivables;
    const totalAR = receivables.reduce((sum, r) => sum + r.total, 0);
    const currentAR = receivables.reduce((sum, r) => sum + r.current, 0);
    const overdueAR = receivables.reduce((sum, r) => sum + r.days30 + r.days60 + r.days90, 0);
    const over90AR = receivables.reduce((sum, r) => sum + r.days90, 0);

    return {
      totalAR,
      currentAR,
      overdueAR,
      over90AR,
      avgDaysSales: totalAR > 0 ? (overdueAR / totalAR * 30).toFixed(1) : 0,
      collectionRate: totalAR > 0 ? ((currentAR / totalAR) * 100).toFixed(1) : 0,
      customerCount: receivables.length,
      highRiskCount: receivables.filter(r => r.days90 > 0).length
    };
  };

  // Filter receivables based on selected criteria
  const getFilteredReceivables = () => {
    if (!data?.agedReceivables) return [];

    let filtered = [...data.agedReceivables];

    // Apply days filter
    if (filterDays === 'current') {
      filtered = filtered.filter(r => r.current > 0);
    } else if (filterDays === '30') {
      filtered = filtered.filter(r => r.days30 > 0);
    } else if (filterDays === '60') {
      filtered = filtered.filter(r => r.days60 > 0);
    } else if (filterDays === '90') {
      filtered = filtered.filter(r => r.days90 > 0);
    } else if (filterDays === 'overdue') {
      filtered = filtered.filter(r => r.days30 > 0 || r.days60 > 0 || r.days90 > 0);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by total amount descending
    return filtered.sort((a, b) => b.total - a.total);
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
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">Accounts Receivable Analysis</h2>
          {data?.lastUpdated && (
            <span className="text-sm text-gray-400">
              Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className={`px-4 py-2 rounded-lg transition-colors ${
            refreshing 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {refreshing ? (
            <>
              <svg className="animate-spin inline-block w-4 h-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <svg className="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">{error}</p>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex space-x-2 border-b border-gray-700">
        <button
          onClick={() => setSelectedView('summary')}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedView === 'summary'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setSelectedView('details')}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedView === 'details'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Customer Details
        </button>
        <button
          onClick={() => setSelectedView('pl')}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedView === 'pl'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          P&L Analysis
        </button>
        <button
          onClick={() => setSelectedView('transactions')}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedView === 'transactions'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Transactions
        </button>
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
              <p className="text-xs text-green-400 mt-1">{metrics.collectionRate}% collection rate</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Overdue</span>
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">${metrics.overdueAR.toLocaleString()}</p>
              <p className="text-xs text-yellow-400 mt-1">Avg {metrics.avgDaysSales} days</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Over 90 Days</span>
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">${metrics.over90AR.toLocaleString()}</p>
              <p className="text-xs text-red-400 mt-1">{metrics.highRiskCount} high-risk accounts</p>
            </div>
          </div>

          {/* Aging Chart */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Aging Distribution</h3>
            <div className="space-y-4">
              {['Current', '1-30 Days', '31-60 Days', '61-90 Days', 'Over 90 Days'].map((label, idx) => {
                const values = [
                  metrics.currentAR,
                  data.agedReceivables.reduce((sum, r) => sum + r.days30, 0),
                  data.agedReceivables.reduce((sum, r) => sum + r.days60, 0),
                  data.agedReceivables.reduce((sum, r) => sum + (r.days90 > 0 && r.days90 < 10000 ? r.days90 : 0), 0),
                  data.agedReceivables.reduce((sum, r) => sum + (r.days90 >= 10000 ? r.days90 : 0), 0)
                ];
                const value = values[idx];
                const percentage = metrics.totalAR > 0 ? (value / metrics.totalAR * 100) : 0;
                const colors = ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
                
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-white">${value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${colors[idx]} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">1-30</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">31-60</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">61-90</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">90+</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredReceivables.map((customer, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{customer.customer}</p>
                          {customer.email && (
                            <p className="text-gray-400 text-xs mt-1">{customer.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-white">
                        ${customer.current.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-white">
                        ${customer.days30.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-yellow-400">
                        ${customer.days60.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-orange-400">
                        ${customer.days90.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-red-400">
                        ${customer.days90.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-white font-bold">${customer.total.toLocaleString()}</p>
                        <p className="text-gray-400 text-xs">{customer.percentOfTotal.toFixed(1)}%</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-blue-400 hover:text-blue-300 text-sm">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* P&L Analysis View */}
      {selectedView === 'pl' && data?.profitLossAccrual && data?.profitLossCash && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accrual P&L */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Profit & Loss (Accrual)</h3>
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

              <div className="flex justify-between py-3 border-t-2 border-gray-600">
                <span className="text-white font-semibold">Net Income</span>
                <span className={`font-bold text-lg ${data.profitLossAccrual.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${data.profitLossAccrual.netIncome.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Cash P&L */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Profit & Loss (Cash)</h3>
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

              <div className="flex justify-between py-3 border-t-2 border-gray-600">
                <span className="text-white font-semibold">Net Income</span>
                <span className={`font-bold text-lg ${data.profitLossCash.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${data.profitLossCash.netIncome.toLocaleString()}
                </span>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Memo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data.transactionList.slice(0, 20).map((transaction, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-white text-sm">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.type === 'Invoice' ? 'bg-blue-900/50 text-blue-400' :
                        transaction.type === 'Payment' ? 'bg-green-900/50 text-green-400' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{transaction.number}</td>
                    <td className="px-6 py-4 text-white text-sm">{transaction.name}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{transaction.memo}</td>
                    <td className="px-6 py-4 text-right text-white">
                      ${Math.abs(transaction.amount).toLocaleString()}
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
