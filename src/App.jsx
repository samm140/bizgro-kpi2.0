// File: src/App.jsx
const appJsx = `import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import WeeklyEntry from './components/WeeklyEntry';
import { mockApi } from './services/mockApi';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const dashboardData = await mockApi.getDashboardData();
    setData(dashboardData);
    setLoading(false);
  };

  const handleDataSubmit = async (formData) => {
    await mockApi.submitWeeklyData(formData);
    await loadDashboardData();
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-biz-darker">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="text-3xl font-bold italic">
                  <span className="text-db-tan">D</span>
                  <span className="text-db-brown">B</span>
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-semibold">BizGro KPI 2.0</h1>
                  <p className="text-xs text-gray-400">DiamondBack Financial System</p>
                </div>
              </div>
            </div>
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={\`px-4 py-2 rounded-lg transition-colors \${
                  currentView === 'dashboard' 
                    ? 'bg-biz-primary text-white' 
                    : 'bg-slate-700 hover:bg-slate-600'
                }\`}
              >
                <i className="fas fa-chart-line mr-2"></i>Dashboard
              </button>
              <button
                onClick={() => setCurrentView('entry')}
                className={\`px-4 py-2 rounded-lg transition-colors \${
                  currentView === 'entry' 
                    ? 'bg-biz-primary text-white' 
                    : 'bg-slate-700 hover:bg-slate-600'
                }\`}
              >
                <i className="fas fa-edit mr-2"></i>Weekly Entry
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-biz-primary mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
        ) : currentView === 'dashboard' ? (
          <Dashboard data={data} />
        ) : (
          <WeeklyEntry onSubmit={handleDataSubmit} />
        )}
      </main>
    </div>
  );
}

export default App;`;
