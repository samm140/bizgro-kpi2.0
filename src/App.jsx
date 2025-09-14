// src/App.jsx
// Updated to integrate the Enhanced Dynamic Dashboard, Executive Dashboard, QBO Integration, Portfolio Companies, and BizGro Reports

import React, { useState, useEffect, useContext } from 'react';
import './App.css';
import { AuthProvider, AuthContext, LoginForm, UserProfile } from './components/Authentication';
import { MetricsProvider, useMetrics } from './components/MetricsContext';
import ChartVisualization from './components/ChartVisualization';
import HistoricalDataView from './components/HistoricalDataView';
import EnhancedDashboard from './components/EnhancedDashboard';
import EnhancedDynamicDashboard from './components/dashboard/EnhancedDynamicDashboard';
import ExecutiveDashboard from './components/dashboard/ExecutiveDashboard';
import InsightsBoard from './components/InsightsBoard';
import EnhancedWeeklyEntry from './components/EnhancedWeeklyEntry';
import MetricsCatalog from './components/MetricsCatalog';
import QBOSync from './components/shared/QBOSync'; // NEW: QBO Sync Widget
import DiamondBackDashboard from './components/portfolio/DiamondbackDashboard.jsx';
import BizGroReports from './components/reports/BizGroReports'; // NEW: BizGro Reports
import { googleSheetsService } from './services/googleSheets';
import { dataExportService } from './services/dataExport';
import environment from './services/environment'; // Environment service for GitHub Pages compatibility

console.log('EnhancedWeeklyEntry imported:', EnhancedWeeklyEntry);

// Enhanced Mock API with all required fields
const mockApi = {
  initData: () => {
    if (!localStorage.getItem('bizgro_kpi_data')) {
      localStorage.setItem('bizgro_kpi_data', JSON.stringify({
        revenueYTD: 14204274,
        priorYearRevenue: 12680000,
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
        allEntries: [
          { 
            weekEnding: '2025-08-23', 
            currentAR: '1900000', 
            retentionReceivables: '200000', 
            currentAP: '1100000', 
            cashInBank: '1300000', 
            cashOnHand: '8000', 
            grossProfitAccrual: '120000', 
            revenueBilledToDate: '450000', 
            retention: '50000', 
            collections: '400000', 
            jobsWonNumber: '3', 
            invitesExistingGC: '6', 
            invitesNewGC: '3', 
            totalEstimates: '1800000', 
            newEstimatedJobs: '5', 
            jobsWonDollar: '900000', 
            jobsStartedDollar: '600000', 
            jobsStartedNumber: '2', 
            upcomingJobsDollar: '3800000', 
            wipDollar: '22000000', 
            revLeftToBill: '10000000', 
            fieldEmployees: '34', 
            supervisors: '5', 
            office: '6', 
            newHires: '2', 
            employeesFired: '1',
            cogsAccrual: '330000',
            grossWagesAccrual: '280000',
            jobsCompleted: '1',
            changeOrders: '45000',
            overdueAR: '150000',
            concentrationRisk: '35',
            savingsAccount: '500000', // NEW: Added for QBO compatibility
            locDrawn: '200000', // NEW: Added for QBO compatibility
            locLimit: '1000000' // NEW: Added for QBO compatibility
          },
          { 
            weekEnding: '2025-08-30', 
            currentAR: '2000000', 
            retentionReceivables: '220000', 
            currentAP: '1200000', 
            cashInBank: '1400000', 
            cashOnHand: '10000', 
            grossProfitAccrual: '140000', 
            revenueBilledToDate: '480000', 
            retention: '55000', 
            collections: '460000', 
            jobsWonNumber: '2', 
            invitesExistingGC: '5', 
            invitesNewGC: '2', 
            totalEstimates: '1500000', 
            newEstimatedJobs: '4', 
            jobsWonDollar: '700000', 
            jobsStartedDollar: '800000', 
            jobsStartedNumber: '2', 
            upcomingJobsDollar: '4000000', 
            wipDollar: '22500000', 
            revLeftToBill: '10500000', 
            fieldEmployees: '35', 
            supervisors: '5', 
            office: '6', 
            newHires: '1', 
            employeesFired: '0',
            cogsAccrual: '340000',
            grossWagesAccrual: '290000',
            jobsCompleted: '0',
            changeOrders: '30000',
            overdueAR: '180000',
            concentrationRisk: '32',
            savingsAccount: '500000', // NEW
            locDrawn: '250000', // NEW
            locLimit: '1000000' // NEW
          },
          { 
            weekEnding: '2025-09-06', 
            currentAR: '2300000', 
            retentionReceivables: '250000', 
            currentAP: '1500000', 
            cashInBank: '1700000', 
            cashOnHand: '12000', 
            grossProfitAccrual: '200000', 
            revenueBilledToDate: '700000', 
            retention: '60000', 
            collections: '650000', 
            jobsWonNumber: '1', 
            invitesExistingGC: '4', 
            invitesNewGC: '1', 
            totalEstimates: '1200000', 
            newEstimatedJobs: '3', 
            jobsWonDollar: '500000', 
            jobsStartedDollar: '400000', 
            jobsStartedNumber: '1', 
            upcomingJobsDollar: '4100000', 
            wipDollar: '23000000', 
            revLeftToBill: '11000000', 
            fieldEmployees: '36', 
            supervisors: '5', 
            office: '6', 
            newHires: '1', 
            employeesFired: '0',
            cogsAccrual: '500000',
            grossWagesAccrual: '310000',
            jobsCompleted: '2',
            changeOrders: '60000',
            overdueAR: '200000',
            concentrationRisk: '30',
            savingsAccount: '550000', // NEW
            locDrawn: '300000', // NEW
            locLimit: '1000000' // NEW
          }
        ]
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
        
        // Add to allEntries array
        data.allEntries.push(formData);
        if (data.allEntries.length > 10) data.allEntries.shift();
        
        // Update summary metrics
        if (formData.revenueBilledToDate || formData.revenueBilledNet) {
          data.weeklyRevenue.push(parseFloat(formData.revenueBilledToDate || formData.revenueBilledNet));
          data.weeklyRevenue.shift();
        }
        if (formData.collections) {
          data.weeklyCollections.push(parseFloat(formData.collections));
          data.weeklyCollections.shift();
        }
        if (formData.grossProfitAccrual) {
          const revenue = parseFloat(formData.revenueBilledToDate || formData.revenueBilledNet || 1);
          const gpm = (parseFloat(formData.grossProfitAccrual) / revenue) * 100;
          data.gpmTrend.push(gpm);
          data.gpmTrend.shift();
        }
        
        // Update week labels
        const lastWeek = parseInt(data.weeks[data.weeks.length - 1].replace('W', ''));
        data.weeks.push(`W${lastWeek + 1}`);
        data.weeks.shift();
        
        // Update cash position if provided
        if (formData.cashInBank) {
          data.cashPosition = parseFloat(formData.cashInBank) + parseFloat(formData.cashOnHand || 0);
        }
        
        localStorage.setItem('bizgro_kpi_data', JSON.stringify(data));
        resolve({ success: true });
      }, 500);
    });
  }
};

// Header Component
const Header = ({ currentView, setCurrentView, user, showProfile, setShowProfile, useEnhancedDashboard, setUseEnhancedDashboard, logout }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-3xl font-bold italic">
              <img src="bizgro-kpi2.0-logo.png" alt="BizGro Logo" className="h-12 w-auto mr-3" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-200">KPI 2.0</h1>
              <p className="text-xs text-gray-400">Financial System</p>
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
              onClick={() => setCurrentView('portfolio')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'portfolio' 
                  ? 'bg-biz-primary text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              }`}
            >
              <i className="fas fa-building mr-2"></i>Portfolio
            </button>
            <button 
              onClick={() => setCurrentView('reports')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'reports' 
                  ? 'bg-biz-primary text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              }`}
            >
              <i className="fas fa-chart-bar mr-2"></i>Reports
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
              onClick={() => setCurrentView('insights')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'insights' 
                  ? 'bg-biz-primary text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              }`}
            >
              <i className="fas fa-lightbulb mr-2"></i>Insights
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
            <button 
              onClick={() => setCurrentView('metrics')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'metrics' 
                  ? 'bg-biz-primary text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              }`}
            >
              <i className="fas fa-book mr-2"></i>Metrics
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
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-300">Enhanced Dashboard</span>
                      <input 
                        type="checkbox" 
                        checked={useEnhancedDashboard}
                        onChange={(e) => setUseEnhancedDashboard(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-biz-primary"
                      />
                    </label>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={logout}
                      className="w-full px-3 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-400 rounded transition-colors text-sm"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

// Main App Component
function App() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [currentView, setCurrentView] = useState('dashboard');
  const [dashboardView, setDashboardView] = useState('agenda'); // Default to agenda
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [useGoogleSheets, setUseGoogleSheets] = useState(false);
  const [useEnhancedDashboard, setUseEnhancedDashboard] = useState(true);
  const [showSyncWidget, setShowSyncWidget] = useState(true); // NEW: State for QBO sync widget
  const [backendAvailable, setBackendAvailable] = useState(false); // Backend availability for GitHub Pages

  // Get updateWeeklyData from context if available
  const metricsContext = typeof useMetrics !== 'undefined' ? useMetrics() : null;

  // QBO sync handler with backend check
  const handleQBOSync = async () => {
    if (!backendAvailable) {
      console.log('Backend not available - QBO sync disabled');
      return;
    }
    
    try {
      // Call your QBO sync API here
      console.log('Syncing with QuickBooks Online...');
      // await qboApi.syncWeeklyData();
      await fetchLatestData();
    } catch (error) {
      console.error('QBO sync error:', error);
    }
  };

  // Function to fetch latest data
  const fetchLatestData = async () => {
    try {
      const data = await mockApi.getDashboardData();
      setDashboardData(data);
      
      // Update metrics context if available
      if (metricsContext && metricsContext.updateWeeklyData) {
        metricsContext.updateWeeklyData(data);
      }
      
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

  // Check backend availability for GitHub Pages deployment
  useEffect(() => {
    const checkBackend = async () => {
      const isAvailable = await environment.checkBackendConnection();
      setBackendAvailable(isAvailable);
      
      // Log environment information for debugging
      if (!isAvailable && environment.isGitHubPages()) {
        console.log('Running on GitHub Pages - Backend features disabled');
      }
    };
    checkBackend();
  }, []);

  // Polling for updates every 30 seconds when on dashboard
  useEffect(() => {
    if (isAuthenticated && currentView === 'dashboard') {
      const interval = setInterval(() => {
        fetchLatestData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentView, isAuthenticated]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        switch(e.key) {
          case 'd': setCurrentView('dashboard'); break;
          case 'p': setCurrentView('portfolio'); break;
          case 'r': setCurrentView('reports'); break;
          case 'e': setCurrentView('entry'); break;
          case 'i': setCurrentView('insights'); break;
          case 'm': setCurrentView('metrics'); break;
          case 'h': setCurrentView('historical'); break;
          case 'q': 
            if (backendAvailable) {
              setShowSyncWidget(!showSyncWidget); 
            }
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSyncWidget, backendAvailable]);

  // Navigation bridge: react to #hash and custom events
  useEffect(() => {
    const applyHash = () => {
      const h = (window.location.hash || '').replace('#', '').toLowerCase();
      if (h === 'dashboard' || h === 'portfolio' || h === 'reports' || h === 'entry' || h === 'insights' || h === 'historical' || h === 'metrics') {
        setCurrentView(h);
      }
    };

    const onHashChange = () => applyHash();

    const onNavigate = (e) => {
      const dest = (e.detail || '').toLowerCase();
      if (!dest) return;
      window.location.hash = `#${dest}`;
      setCurrentView(dest);
    };

    // initialize from current hash
    applyHash();

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('bg:navigate', onNavigate);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('bg:navigate', onNavigate);
    };
  }, []);

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => window.location.reload()} />;
  }

  // Updated handleWeeklySubmit with enhanced error handling and demo mode support
  const handleWeeklySubmit = async (formData) => {
    setLoading(true);
    try {
      // Check if we're using mock API or real backend
      if (environment.isGitHubPages() || !backendAvailable) {
        // Submit to mock API (localStorage)
        const result = await mockApi.submitWeeklyData(formData);
        if (result.success) {
          // Show success message for demo mode
          const message = environment.isGitHubPages() 
            ? 'Weekly data saved successfully! (Demo Mode - Data stored locally)'
            : 'Weekly data saved successfully!';
          alert(message);
          
          // Refresh dashboard data
          await fetchLatestData();
          
          // Switch to dashboard view
          setCurrentView('dashboard');
        }
      } else {
        // If backend is available, submit to real backend
        await mockApi.submitWeeklyData(formData); // Replace with real backend call when available
        
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
      }
    } catch (error) {
      console.error('Error saving weekly data:', error);
      alert('Error saving data. Please try again.');
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
      {/* Header Component */}
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        user={user}
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        useEnhancedDashboard={useEnhancedDashboard}
        setUseEnhancedDashboard={setUseEnhancedDashboard}
        logout={logout}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-biz-primary mx-auto mb-4"></div>
              <p className="text-gray-300">Loading...</p>
            </div>
          </div>
        ) : currentView === 'portfolio' ? (
          <DiamondBackDashboard />
        ) : currentView === 'reports' ? (
          <BizGroReports />
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
            
            {/* Dashboard view tabs */}
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setDashboardView('agenda')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dashboardView === 'agenda' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <i className="fas fa-calendar mr-2"></i>Agenda
              </button>
              <button 
                onClick={() => setDashboardView('dynamic')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dashboardView === 'dynamic' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <i className="fas fa-th-large mr-2"></i>Dynamic Metrics
              </button>
              <button 
                onClick={() => setDashboardView('enhanced')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dashboardView === 'enhanced' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <i className="fas fa-chart-bar mr-2"></i>Enhanced View
              </button>
              <button 
                onClick={() => setDashboardView('charts')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dashboardView === 'charts' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <i className="fas fa-chart-line mr-2"></i>Charts View
              </button>
            </div>
            
            {/* Conditional rendering */}
            {dashboardView === 'agenda' ? (
              <ExecutiveDashboard data={dashboardData} />
            ) : dashboardView === 'dynamic' ? (
              <EnhancedDynamicDashboard data={dashboardData} />
            ) : dashboardView === 'enhanced' ? (
              <EnhancedDashboard data={dashboardData} />
            ) : (
              dashboardData && <ChartVisualization data={dashboardData} />
            )}
          </div>
        ) : currentView === 'entry' ? (
          <EnhancedWeeklyEntry 
            onSubmit={handleWeeklySubmit} 
            onCancel={() => setCurrentView('dashboard')} 
          />
        ) : currentView === 'insights' ? (
          <InsightsBoard data={dashboardData} />
        ) : currentView === 'historical' ? (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-200">Historical Data Analysis</h2>
            <HistoricalDataView 
              data={historicalData.length > 0 ? historicalData : dashboardData?.allEntries || []}
              onEdit={handleHistoricalEdit}
              onDelete={handleHistoricalDelete}
            />
          </div>
        ) : currentView === 'metrics' ? (
          <MetricsCatalog />
        ) : null}
      </main>

      {/* QBO Sync Widget - Only show if backend is available */}
      {showSyncWidget && backendAvailable && (
        <QBOSync 
          position="fixed"
          showDetails={true}
          autoSync={false}
          syncInterval={300000}
          onSync={handleQBOSync}
        />
      )}
      
      {/* Toggle button for QBO sync widget - Only show if backend is available */}
      {backendAvailable && (
        <button
          onClick={() => setShowSyncWidget(!showSyncWidget)}
          className="fixed bottom-6 left-6 z-50 p-3 bg-slate-800 hover:bg-slate-700 rounded-full shadow-lg transition-all"
          title={showSyncWidget ? 'Hide QBO Sync Widget (Alt+Q)' : 'Show QBO Sync Widget (Alt+Q)'}
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {showSyncWidget ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            )}
          </svg>
        </button>
      )}
      
      {/* GitHub Pages notification */}
      {environment.isGitHubPages() && (
        <div className="fixed bottom-6 left-6 z-40 bg-yellow-900/90 text-yellow-200 px-4 py-2 rounded-lg shadow-lg text-sm">
          <i className="fas fa-info-circle mr-2"></i>
          Demo Mode - Backend features disabled
        </div>
      )}
      
      {/* Footer with keyboard shortcuts hint */}
      <footer className="mt-12 pb-4 text-center text-xs text-gray-500">
        Keyboard shortcuts: Alt+D (Dashboard), Alt+P (Portfolio), Alt+R (Reports), Alt+E (Entry), Alt+I (Insights), Alt+M (Metrics), Alt+H (Historical)
        {backendAvailable && ', Alt+Q (QBO Widget)'}
      </footer>
    </div>
  );
}

// Wrap App with AuthProvider and MetricsProvider
function AppWithAuth() {
  return (
    <AuthProvider>
      <MetricsProvider>
        <App />
      </MetricsProvider>
    </AuthProvider>
  );
}

export default AppWithAuth;
