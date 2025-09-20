// src/App.jsx
// Updated to integrate with new Authentication, SideHeader, and Permission components

import React, { useState, useEffect } from 'react';
import './App.css';
import Authentication from './components/Authentication';
import SideHeader from './SideHeader';
import { MetricsProvider, useMetrics } from './components/MetricsContext';
import { PermissionProvider } from './services/rbac/PermissionProvider'; // FIXED: Import from PermissionProvider.jsx
import ChartVisualization from './components/ChartVisualization';
import HistoricalDataView from './components/HistoricalDataView';
import EnhancedDashboard from './components/EnhancedDashboard';
import EnhancedDynamicDashboard from './components/dashboard/EnhancedDynamicDashboard';
import ExecutiveDashboard from './components/dashboard/ExecutiveDashboard';
import InsightsBoard from './components/InsightsBoard';
import EnhancedWeeklyEntry from './components/EnhancedWeeklyEntry';
import MetricsCatalog from './components/MetricsCatalog';
import QBOSync from './components/shared/QBOSync';
import DiamondBackDashboard from './components/portfolio/DiamondbackDashboard.jsx';
import ARDashboard from './components/portfolio/ARDashboard';
import APDashboard from './components/portfolio/APDashboard';
import BizGroReports from './components/reports/BizGroReports';
import AdminConsole from './components/admin/AdminConsole'; // Add AdminConsole import
import { googleSheetsService } from './services/googleSheets';
import { dataExportService } from './services/dataExport';
import environment from './services/environment';
import HeaderNavigation from './components/HeaderNavigation.jsx';
import DigitalCFODashboard from './DigitalCFODashboard';

console.log('DigitalCFODashboard component:', DigitalCFODashboard);
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
            savingsAccount: '500000',
            locDrawn: '200000',
            locLimit: '1000000'
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
            savingsAccount: '500000',
            locDrawn: '250000',
            locLimit: '1000000'
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
            savingsAccount: '550000',
            locDrawn: '300000',
            locLimit: '1000000'
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

// Main App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [dashboardView, setDashboardView] = useState('agenda');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [useGoogleSheets, setUseGoogleSheets] = useState(false);
  const [showSyncWidget, setShowSyncWidget] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [currentPortfolioId, setCurrentPortfolioId] = useState('default');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Get updateWeeklyData from context if available
  const metricsContext = typeof useMetrics !== 'undefined' ? useMetrics() : null;

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const storedAuth = localStorage.getItem('isAuthenticated') || sessionStorage.getItem('isAuthenticated');
      
      if (storedUser && storedAuth === 'true') {
        const userData = JSON.parse(storedUser);
        // Ensure user has a role, default to 'Operational' if not set
        if (!userData.role) {
          userData.role = 'Operational';
          localStorage.setItem('user', JSON.stringify(userData));
        }
        setUser(userData);
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Handle login success
  const handleLogin = (userData) => {
    // Ensure new users get a default role
    if (!userData.role) {
      userData.role = 'Operational'; // Default role for new users
    }
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('isAuthenticated');
    
    setUser(null);
    setIsAuthenticated(false);
  };

  // QBO sync handler with backend check
  const handleQBOSync = async () => {
    if (!backendAvailable) {
      console.log('Backend not available - QBO sync disabled');
      return;
    }
    
    try {
      console.log('Syncing with QuickBooks Online...');
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
      
      if (metricsContext && metricsContext.updateWeeklyData) {
        metricsContext.updateWeeklyData(data);
      }
      
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

  // Check backend availability
  useEffect(() => {
    const checkBackend = async () => {
      const isAvailable = await environment.checkBackendConnection();
      setBackendAvailable(isAvailable);
      
      if (!isAvailable && environment.isGitHubPages()) {
        console.log('Running on GitHub Pages - Backend features disabled');
      }
    };
    checkBackend();
  }, []);

  // Polling for updates
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
          case 'p': 
            if (e.shiftKey) {
              setCurrentView('ap-dashboard');
            } else {
              setCurrentView('portfolio');
            }
            break;
          case 'a': 
            if (e.shiftKey) {
              setCurrentView('admin');
            } else {
              setCurrentView('ar-dashboard');
            }
            break;
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

  // Handle weekly submit
  const handleWeeklySubmit = async (formData) => {
    setLoading(true);
    try {
      if (environment.isGitHubPages() || !backendAvailable) {
        const result = await mockApi.submitWeeklyData(formData);
        if (result.success) {
          const message = environment.isGitHubPages() 
            ? 'Weekly data saved successfully! (Demo Mode - Data stored locally)'
            : 'Weekly data saved successfully!';
          alert(message);
          
          await fetchLatestData();
          setCurrentView('dashboard');
        }
      } else {
        await mockApi.submitWeeklyData(formData);
        
        if (useGoogleSheets && import.meta.env.VITE_GOOGLE_SHEETS_ID) {
          await googleSheetsService.submitWeeklyData(
            formData,
            import.meta.env.VITE_GOOGLE_SHEETS_ID
          );
        }
        
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <Authentication onSuccess={handleLogin} />;
  }

  // Main app with SideHeader and HeaderNavigation
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-biz-darker">
      <HeaderNavigation />
      <SideHeader 
        onLogout={handleLogout} 
        onCollapsedChange={setIsSidebarCollapsed}
        onNavigate={setCurrentView}
        currentView={currentView}
      />
      
      {/* Main Content - Adjusted margin based on sidebar state and top header */}
      <main className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} pt-20 relative z-10`}>
        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-biz-primary mx-auto mb-4"></div>
                <p className="text-gray-300">Loading...</p>
              </div>
            </div>
          ) : currentView === 'admin' ? (
            <AdminConsole />
          ) : currentView === 'portfolio' ? (
            <DiamondBackDashboard />
          ) : currentView === 'ar-dashboard' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-200">Receivables Dashboard</h2>
                <select
                  value={currentPortfolioId}
                  onChange={(e) => setCurrentPortfolioId(e.target.value)}
                  className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg border border-slate-600 focus:border-biz-primary focus:outline-none"
                >
                  <option value="default">All Companies</option>
                  <option value="diamondback">DiamondBack Construction</option>
                  <option value="bluestone">BlueStone Builders</option>
                  <option value="ironforge">IronForge Industries</option>
                </select>
              </div>
              <ARDashboard portfolioId={currentPortfolioId} />
            </div>
          ) : currentView === 'ap-dashboard' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-200">Payables Dashboard</h2>
                <select
                  value={currentPortfolioId}
                  onChange={(e) => setCurrentPortfolioId(e.target.value)}
                  className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg border border-slate-600 focus:border-biz-primary focus:outline-none"
                >
                  <option value="default">All Companies</option>
                  <option value="diamondback">DiamondBack Construction</option>
                  <option value="bluestone">BlueStone Builders</option>
                  <option value="ironforge">IronForge Industries</option>
                </select>
              </div>
              <APDashboard portfolioId={currentPortfolioId} />
            </div>
          ) : currentView === 'reports' ? (
            <BizGroReports />
          ) : currentView === 'cfo-dashboard' ? (
            <DigitalCFODashboard />
      
          ) : currentView === 'dashboard' ? (
            <div>
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
          ) : currentView === 'settings' ? (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-200">System Settings</h2>
              <p className="text-gray-400">System settings configuration coming soon...</p>
            </div>
          ) : null}
        </div>
      </main>

      {/* QBO Sync Widget */}
      {showSyncWidget && backendAvailable && (
        <QBOSync 
          position="fixed"
          showDetails={true}
          autoSync={false}
          syncInterval={300000}
          onSync={handleQBOSync}
        />
      )}
      
      {/* Toggle button for QBO sync widget */}
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
      
      {/* Footer with keyboard shortcuts */}
      <footer className="mt-12 pb-4 text-center text-xs text-gray-500">
        Keyboard shortcuts: Alt+D (Dashboard), Alt+P (Portfolio), Alt+A (AR Dashboard), 
        Shift+Alt+P (AP Dashboard), Alt+R (Reports), Alt+E (Entry), Alt+I (Insights), 
        Alt+M (Metrics), Alt+H (Historical)
        {user?.role === 'Admin' && ', Shift+Alt+A (Admin Console)'}
        {backendAvailable && ', Alt+Q (QBO Widget)'}
      </footer>
    </div>
  );
}

// Wrap App with Providers
function AppWithProviders() {
  return (
    <PermissionProvider>
      <MetricsProvider>
        <App />
      </MetricsProvider>
    </PermissionProvider>
  );
}

export default AppWithProviders;
