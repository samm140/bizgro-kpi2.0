import React, { useState, useEffect, useContext } from 'react';
import './App.css';
import { AuthProvider, AuthContext, LoginForm, UserProfile } from './components/Authentication';
import ChartVisualization from './components/ChartVisualization';
import HistoricalDataView from './components/HistoricalDataView';
import { googleSheetsService } from './services/googleSheets';
import { dataExportService } from './services/dataExport';

// Mock API for data management
const mockApi = {
  initData: () => {
    if (!localStorage.getItem('bizgro_kpi_data')) {
      localStorage.setItem('bizgro_kpi_data', JSON.stringify({
        revenueYTD: 14204274,
        gpmAverage: 34.08,
        activeProjects: 23,
        cashPosition: 1044957,
        weeks: ['W31', 'W32', 'W33', 'W34', 'W35', 'W36'],
        weeklyRevenue: [60929, 574503, 227737, 167973, 8828, 593209],
        weeklyCollections: [206426, 151413, 337294, 323508, 259749, 527147],
        gpmTrend: [28.5, 26.3, 31.2, 29.8, 30.5, 47.42],
        currentAR: 2145000,
        currentAP: 845000,
        cashOnHand: 445000,
        backlog: 21800000,
        cashFlowData: {
          cashPosition: [1000000, 1100000, 1050000, 1200000, 1150000, 1044957],
          arBalance: [2100000, 2000000, 2150000, 2050000, 2200000, 2145000],
          apBalance: [800000, 850000, 820000, 870000, 840000, 845000]
        },
        backlogData: {
          backlog: [20000000, 20500000, 21000000, 21300000, 21500000, 21800000],
          jobsInProgress: [20, 21, 22, 23, 23, 23]
        }
      }));
    }
  },
  getDashboardData: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem('bizgro_kpi_data'));
        resolve(data);
      }, 300);
    });
  },
  submitWeeklyData: (formData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem('bizgro_kpi_data'));
        
        // Update metrics
        if (formData.revenueBilled) {
          data.weeklyRevenue.push(parseFloat(formData.revenueBilled));
          data.weeklyRevenue.shift();
        }
        if (formData.collections) {
          data.weeklyCollections.push(parseFloat(formData.collections));
          data.weeklyCollections.shift();
        }
        if (formData.gpmAccrual) {
          data.gpmTrend.push(parseFloat(formData.gpmAccrual));
          data.gpmTrend.shift();
        }
        
        // Update week labels
        const lastWeek = parseInt(data.weeks[data.weeks.length - 1].replace('W', ''));
        data.weeks.push(`W${lastWeek + 1}`);
        data.weeks.shift();
        
        localStorage.setItem('bizgro_kpi_data', JSON.stringify(data));
        resolve({ success: true });
      }, 500);
    });
  }
};

// Main App Component
function App() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [useGoogleSheets, setUseGoogleSheets] = useState(false);

  // Function to fetch latest data
  const fetchLatestData = async () => {
    try {
      const data = await mockApi.getDashboardData();
      setDashboardData(data);
      
      // If Google Sheets is enabled and configured
      if (useGoogleSheets && import.meta.env.VITE_GOOGLE_SHEETS_ID) {
        try {
          const sheetsData = await googleSheetsService.getHistoricalData(
            import.meta.env.VITE_GOOGLE_SHEETS_ID
          );
          setHistoricalData(sheetsData);
        } catch (error) {
          console.log('Google Sheets not configured or accessible');
        }
      }
    } catch (error) {
      console.error('Error fetching latest data:', error);
    }
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      mockApi.initData();
      fetchLatestData();
    }
  }, [isAuthenticated]);

  // Polling for updates every 30 seconds when on dashboard
  useEffect(() => {
    if (isAuthenticated && currentView === 'dashboard') {
      const interval = setInterval(() => {
        fetchLatestData();
      }, 30000); // Poll every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [currentView, isAuthenticated]);

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => window.location.reload()} />;
  }

  const handleWeeklySubmit = async (formData) => {
    setLoading(true);
    try {
      // Submit to local storage
      await mockApi.submitWeeklyData(formData);
      
      // If Google Sheets is enabled, submit there too
      if (useGoogleSheets && import.meta.env.VITE_GOOGLE_SHEETS_ID) {
        await googleSheetsService.submitWeeklyData(
          formData,
          import.meta.env.VITE_GOOGLE_SHEETS_ID
        );
      }
      
      // Refresh data and switch to dashboard
      await fetchLatestData();
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Error submitting data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportDashboard = (format) => {
    if (dashboardData) {
      dataExportService.exportDashboardData(dashboardData, format);
    }
  };

  const handleHistoricalEdit = (id, updatedData) => {
    setHistoricalData(prev => 
      prev.map(item => item.id === id ? updatedData : item)
    );
  };

  const handleHistoricalDelete = (id) => {
    setHistoricalData(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-biz-darker">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-3xl font-bold italic">
                <span className="text-db-tan">D</span>
                <span className="text-db-brown">B</span>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-200">BizGro KPI 2.0</h1>
                <p className="text-xs text-gray-400">DiamondBack Financial System</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'dashboard' 
                    ? 'bg-biz-primary text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                }`}
              >
                <i className="fas fa-chart-line mr-2"></i>Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('entry')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'entry' 
                    ? 'bg-biz-primary text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                }`}
              >
                <i className="fas fa-edit mr-2"></i>Weekly Entry
              </button>
              <button 
                onClick={() => setCurrentView('historical')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'historical' 
                    ? 'bg-biz-primary text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                }`}
              >
                <i className="fas fa-history mr-2"></i>Historical
              </button>
              
              {/* User Menu */}
              <div className="relative ml-4">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <i className="fas fa-user-circle text-gray-300"></i>
                  <span className="text-sm text-gray-300">{user?.name || 'User'}</span>
                  <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                </button>
                
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-4">
                    <UserProfile />
                  </div>
                )}
              </div>
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
              <p className="text-gray-300">Loading...</p>
            </div>
          </div>
        ) : currentView === 'dashboard' ? (
          <div>
            {/* Dashboard Header with Export */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-200">Executive Dashboard</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExportDashboard('excel')}
                  className="px-4 py-2 bg-green-900/50 hover:bg-green-900/70 text-green-400 rounded transition-colors text-sm"
                >
                  <i className="fas fa-file-excel mr-2"></i>Export Excel
                </button>
                <button
                  onClick={() => handleExportDashboard('csv')}
                  className="px-4 py-2 bg-blue-900/50 hover:bg-blue-900/70 text-blue-400 rounded transition-colors text-sm"
                >
                  <i className="fas fa-file-csv mr-2"></i>Export CSV
                </button>
                <button
                  onClick={() => setUseGoogleSheets(!useGoogleSheets)}
                  className={`px-4 py-2 rounded transition-colors text-sm ${
                    useGoogleSheets 
                      ? 'bg-green-900/50 text-green-400' 
                      : 'bg-slate-700 text-gray-400'
                  }`}
                >
                  <i className="fas fa-sync mr-2"></i>
                  {useGoogleSheets ? 'Sheets Connected' : 'Connect Sheets'}
                </button>
              </div>
            </div>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Revenue YTD</p>
                    <p className="text-3xl font-bold text-gray-100">
                      ${dashboardData ? (dashboardData.revenueYTD / 1000000).toFixed(1) : '14.2'}M
                    </p>
                    <p className="text-green-400 text-xs mt-2">↑ 12% vs last year</p>
                  </div>
                  <i className="fas fa-dollar-sign text-green-400 text-xl"></i>
                </div>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">GPM Average</p>
                    <p className="text-3xl font-bold text-gray-100">
                      {dashboardData ? dashboardData.gpmAverage : '34.08'}%
                    </p>
                    <p className="text-green-400 text-xs mt-2">Above 30% target</p>
                  </div>
                  <i className="fas fa-percentage text-blue-400 text-xl"></i>
                </div>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Active Projects</p>
                    <p className="text-3xl font-bold text-gray-100">
                      {dashboardData ? dashboardData.activeProjects : '23'}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      ${dashboardData ? (dashboardData.backlog / 1000000).toFixed(1) : '21.8'}M in WIP
                    </p>
                  </div>
                  <i className="fas fa-building text-purple-400 text-xl"></i>
                </div>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">Cash Position</p>
                    <p className="text-3xl font-bold text-gray-100">
                      ${dashboardData ? (dashboardData.cashPosition / 1000000).toFixed(2) : '1.04'}M
                    </p>
                    <p className="text-gray-400 text-xs mt-2">DSO: 40 days</p>
                  </div>
                  <i className="fas fa-wallet text-orange-400 text-xl"></i>
                </div>
              </div>
            </div>

            {/* Charts */}
            {dashboardData && <ChartVisualization data={dashboardData} />}
          </div>
        ) : currentView === 'entry' ? (
          <WeeklyEntryForm onSubmit={handleWeeklySubmit} onCancel={() => setCurrentView('dashboard')} />
        ) : currentView === 'historical' ? (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-200">Historical Data Analysis</h2>
            <HistoricalDataView 
              data={historicalData.length > 0 ? historicalData : generateSampleHistoricalData()}
              onEdit={handleHistoricalEdit}
              onDelete={handleHistoricalDelete}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}

// Generate sample historical data if no real data available
function generateSampleHistoricalData() {
  const data = [];
  const currentDate = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const weekDate = new Date(currentDate);
    weekDate.setDate(weekDate.getDate() - (i * 7));
    
    data.push({
      id: `week-${i}`,
      weekEndDate: weekDate.toISOString().split('T')[0],
      weekNumber: 52 - i,
      year: weekDate.getFullYear(),
      revenueBilled: Math.floor(Math.random() * 500000) + 100000,
      collections: Math.floor(Math.random() * 400000) + 100000,
      gpmAccrual: (Math.random() * 20 + 25).toFixed(2),
      backlog: 20000000 + (Math.random() * 2000000),
      currentAR: 2000000 + (Math.random() * 200000),
      currentAP: 800000 + (Math.random() * 100000),
      jobsWon: Math.floor(Math.random() * 1000000) + 100000,
      jobsInProgress: Math.floor(Math.random() * 5) + 20
    });
  }
  
  return data;
}

// Weekly Entry Form Component (simplified version - you can replace with your full version)
function WeeklyEntryForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    weekEndDate: new Date().toISOString().split('T')[0],
    revenueBilled: '',
    collections: '',
    gpmAccrual: '',
    currentAR: '',
    currentAP: '',
    backlog: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-200">Weekly Data Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Week Ending</label>
            <input
              type="date"
              name="weekEndDate"
              value={formData.weekEndDate}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-gray-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Revenue Billed</label>
            <input
              type="number"
              name="revenueBilled"
              value={formData.revenueBilled}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Collections</label>
            <input
              type="number"
              name="collections"
              value={formData.collections}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">GPM %</label>
            <input
              type="number"
              name="gpmAccrual"
              value={formData.gpmAccrual}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-gray-200"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-200 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-biz-primary hover:bg-blue-600 text-white rounded transition-colors"
          >
            Submit Data
          </button>
        </div>
      </form>
    </div>
  );
}

// Wrap App with AuthProvider
function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;
