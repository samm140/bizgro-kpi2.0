import React, { useState, useEffect } from 'react';

// Simple AR Dashboard with debug mode
const ARDashboard = ({ portfolioId = 'default' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugMode, setDebugMode] = useState(true); // Start in debug mode
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    fetchData();
  }, [portfolioId]);

  const fetchData = async () => {
    console.log('Starting data fetch...');
    setLoading(true);
    setError(null);
    setDebugInfo({});

    try {
      // Try to import and use the service
      const { googleSheetsDataService } = await import('../../services/googleSheetsDataService');
      
      setDebugInfo(prev => ({ ...prev, serviceImported: true }));
      console.log('Service imported successfully');

      // Try to get all data
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
      
      // Use fallback mock data
      setData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => ({
    agedReceivables: [
      {
        customer: 'Mock Customer 1',
        current: 50000,
        days30: 10000,
        days60: 5000,
        days90: 2000,
        total: 67000,
        percentOfTotal: 50
      },
      {
        customer: 'Mock Customer 2',
        current: 30000,
        days30: 5000,
        days60: 2000,
        days90: 0,
        total: 37000,
        percentOfTotal: 30
      }
    ],
    profitLossAccrual: {
      totalRevenue: 100000,
      totalExpenses: 70000,
      netIncome: 30000
    },
    profitLossCash: {
      totalRevenue: 90000,
      totalExpenses: 65000,
      netIncome: 25000
    },
    transactionList: [],
    lastUpdated: new Date().toISOString()
  });

  // Simple test to check if we can access Google Sheets directly
  const testDirectAccess = async () => {
    const SPREADSHEET_ID = '16PVlalae-iOCX3VR1sSIB6_QCdTGjXSwmO6x8YttH1I';
    const gid = '98770792'; // Aged Receivables
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}`;
    
    console.log('Testing direct CSV access:', csvUrl);
    
    try {
      // Try with CORS proxy
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(csvUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        const text = await response.text();
        console.log('CSV Response (first 500 chars):', text.substring(0, 500));
        
        // Parse CSV to see the structure
        const lines = text.split('\n');
        console.log('Number of lines:', lines.length);
        console.log('First 5 lines:', lines.slice(0, 5));
        
        alert('✅ Successfully connected to Google Sheets! Check console for details.');
        return true;
      } else {
        console.error('Response not OK:', response.status);
        alert(`❌ Connection failed with status: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('Direct access error:', error);
      alert(`❌ Connection error: ${error.message}`);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading AR data...</p>
        </div>
      </div>
    );
  }

  const metrics = data ? {
    totalAR: data.agedReceivables?.reduce((sum, r) => sum + (r.total || 0), 0) || 0,
    currentAR: data.agedReceivables?.reduce((sum, r) => sum + (r.current || 0), 0) || 0,
    overdueAR: data.agedReceivables?.reduce((sum, r) => sum + (r.days30 || 0) + (r.days60 || 0) + (r.days90 || 0), 0) || 0,
    customerCount: data.agedReceivables?.length || 0
  } : { totalAR: 0, currentAR: 0, overdueAR: 0, customerCount: 0 };

  return (
    <div className="space-y-6">
      {/* Debug Controls */}
      <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-yellow-400 font-semibold">Debug Mode</h3>
          <div className="space-x-2">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm"
            >
              {debugMode ? 'Hide Debug' : 'Show Debug'}
            </button>
            <button
              onClick={testDirectAccess}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
            >
              Test Direct Connection
            </button>
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
            >
              Retry Fetch
            </button>
          </div>
        </div>

        {debugMode && (
          <div className="space-y-2 text-sm">
            <div className="text-gray-300">
              <strong>Status:</strong> {loading ? 'Loading...' : error ? `Error: ${error}` : 'Data Loaded'}
            </div>
            <div className="text-gray-300">
              <strong>Data Source:</strong> {error ? 'Mock Data (Fallback)' : 'Google Sheets (Attempting)'}
            </div>
            <div className="text-gray-300">
              <strong>Customers Found:</strong> {metrics.customerCount}
            </div>
            <div className="text-gray-300">
              <strong>Last Updated:</strong> {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'N/A'}
            </div>
            
            {debugInfo.error && (
              <div className="bg-red-900/20 p-2 rounded mt-2">
                <strong className="text-red-400">Error Details:</strong>
                <pre className="text-xs text-gray-300 mt-1">{debugInfo.error}</pre>
              </div>
            )}

            <details className="mt-2">
              <summary className="cursor-pointer text-yellow-400 hover:text-yellow-300">
                View Raw Data Structure
              </summary>
              <pre className="text-xs bg-gray-900/50 p-2 rounded mt-2 overflow-auto max-h-60">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
          <p className="text-red-400">
            ⚠️ Unable to connect to Google Sheets. Using mock data.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Make sure your sheet is publicly viewable (Share → Anyone with link → Viewer)
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Total AR</p>
          <p className="text-2xl font-bold text-white">${metrics.totalAR.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.customerCount} customers</p>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Current</p>
          <p className="text-2xl font-bold text-white">${metrics.currentAR.toLocaleString()}</p>
          <p className="text-xs text-green-400 mt-1">Not overdue</p>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Overdue</p>
          <p className="text-2xl font-bold text-white">${metrics.overdueAR.toLocaleString()}</p>
          <p className="text-xs text-yellow-400 mt-1">Needs attention</p>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Collection Rate</p>
          <p className="text-2xl font-bold text-white">
            {metrics.totalAR > 0 ? ((metrics.currentAR / metrics.totalAR) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-xs text-blue-400 mt-1">Current / Total</p>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Customer Receivables</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Customer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Current</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">30 Days</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">60 Days</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">90+ Days</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {data?.agedReceivables?.map((customer, idx) => (
                <tr key={idx} className="hover:bg-gray-800/30">
                  <td className="px-6 py-4 text-white">{customer.customer}</td>
                  <td className="px-6 py-4 text-right text-white">
                    ${(customer.current || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-white">
                    ${(customer.days30 || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-yellow-400">
                    ${(customer.days60 || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-red-400">
                    ${(customer.days90 || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-white font-bold">
                    ${(customer.total || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ARDashboard;
