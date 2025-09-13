import React, { useState } from 'react';

// Import the MetricsCatalog component (in your app, this would be an actual import)
// For this demo, I'll include a simplified version inline

const Dashboard = () => {
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'metrics'
  const [selectedMetrics, setSelectedMetrics] = useState([]); // Store selected metrics
  
  // Handle navigation to metrics catalog
  const handleConfigureMetrics = () => {
    setActiveView('metrics');
  };

  // Handle going back to dashboard
  const handleBackToDashboard = () => {
    setActiveView('dashboard');
  };

  // Empty State Component
  const EmptyDashboard = () => (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              {/* BizGro Logo - In your app, replace with: <img src="/bizgro-kpi2.0-logo.png" alt="BizGro KPI 2.0" className="h-10" /> */}
              <div className="flex items-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="10" y="10" width="20" height="20" transform="rotate(45 20 20)" fill="#10B981" />
                  <rect x="12" y="12" width="16" height="16" transform="rotate(45 20 20)" fill="#3B82F6" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-white">BizGro</span>
                  <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">KPI 2.0</span>
                </div>
                <span className="text-xs text-gray-500">Financial System</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
              <i className="fas fa-chart-line"></i>
              Dashboard
            </button>
            <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded">Weekly Entry</button>
            <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded">Insights</button>
            <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded">Historical</button>
            <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded">Metrics</button>
          </div>
        </div>
      </div>

      {/* Dashboard Title Bar */}
      <div className="border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Executive Dashboard</h1>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded text-sm flex items-center gap-2">
                <i className="fas fa-file-excel"></i>
                Export Excel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm flex items-center gap-2">
                <i className="fas fa-file-csv"></i>
                Export CSV
              </button>
              <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded text-sm flex items-center gap-2">
                <i className="fas fa-link"></i>
                Connect Sheets
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
            <i className="fas fa-th-large"></i>
            Dynamic Metrics
          </button>
          <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded flex items-center gap-2">
            <i className="fas fa-chart-bar"></i>
            Charts View
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-32">
        <div className="text-gray-500 mb-8">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            <polyline points="7 10 12 5 17 10" />
            <line x1="12" y1="5" x2="12" y2="19" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-300 mb-2">No Metrics Selected</h2>
        <p className="text-gray-500 mb-8">Choose metrics from the catalog to display on your dashboard.</p>
        
        <button 
          onClick={handleConfigureMetrics}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <i className="fas fa-cog"></i>
          Configure Metrics
        </button>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-700 bg-gray-800 px-6 py-3">
        <p className="text-xs text-gray-500 text-center">
          Keyboard shortcuts: Alt+D (Dashboard), Alt+E (Entry), Alt+I (Insights), Alt+M (Metrics), Alt+H (Historical)
        </p>
      </div>
    </div>
  );

  // Simplified Metrics Catalog View
  const MetricsCatalogView = () => (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleBackToDashboard}
              className="text-gray-400 hover:text-white"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Content */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Metrics Catalog</h1>
        
        {/* Sample metrics for demonstration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'LIQ001', name: 'Current Ratio', category: 'Liquidity' },
            { id: 'AR001', name: 'DSO', category: 'AR / Collections' },
            { id: 'PROF001', name: 'Gross Margin', category: 'Profitability' },
            { id: 'SALES001', name: 'Win Rate', category: 'Sales' },
            { id: 'WIP001', name: 'WIP Balance', category: 'WIP' },
            { id: 'BACK001', name: 'Total Backlog', category: 'Backlog' },
          ].map(metric => (
            <div key={metric.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{metric.name}</h3>
                  <p className="text-sm text-gray-400">{metric.category}</p>
                  <p className="text-xs text-gray-500">{metric.id}</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedMetrics(prev => [...prev, metric.id]);
                    // Show a toast or feedback
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                >
                  Add to Dashboard
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <button 
            onClick={handleBackToDashboard}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Save and Return to Dashboard
          </button>
          <button 
            onClick={handleBackToDashboard}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Render based on active view
  return activeView === 'metrics' ? <MetricsCatalogView /> : <EmptyDashboard />;
};

export default Dashboard;
