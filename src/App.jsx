// App.jsx - Fixed version without useAuth
import React, { useState, useEffect, useContext } from 'react';
import { AuthProvider, AuthContext, LoginForm } from './components/Authentication';
import { MetricsProvider, useMetrics } from './components/MetricsContext';
import DynamicDashboard from './components/DynamicDashboard';
import MetricsCatalog from './components/MetricsCatalog';
import EnhancedWeeklyEntry from './components/EnhancedWeeklyEntry';
import HistoricalDataView from './components/HistoricalDataView';
import InsightsBoard from './components/InsightsBoard';

// Navigation Component
const Navigation = ({ currentView, setCurrentView, user, onLogout }) => {
  const { dashboardMetrics } = useMetrics();
  
  return (
    <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <img 
  src="bizgro-kpi2.0-logo.png" 
  alt="BizGro Logo" 
  className="h-12 w-auto"
/>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl"></span>
              </div>
              {/* Title and Subtitle */}
              <div>
                <h1 className="text-xl font-bold text-white">KPI 2.0</h1>
                <p className="text-xs text-gray-400">Financial System</p>
              </div>
            </div>
          </div>
          
          <nav className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              }`}
            >
              <i className="fas fa-chart-line mr-2"></i>
              Dashboard
              {dashboardMetrics.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-500 rounded-full text-xs">
                  {dashboardMetrics.length}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => setCurrentView('metrics')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'metrics' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              }`}
            >
              <i className="fas fa-book mr-2"></i>
              Metrics Catalog
            </button>
            
            <button 
              onClick={() => setCurrentView('entry')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'entry' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              }`}
            >
              <i className="fas fa-edit mr-2"></i>
              Weekly Entry
            </button>
            
            <button 
              onClick={() => setCurrentView('historical')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'historical' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              }`}
            >
              <i className="fas fa-history mr-2"></i>
              Historical
            </button>
            
            <button 
              onClick={() => setCurrentView('insights')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'insights' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              }`}
            >
              <i className="fas fa-lightbulb mr-2"></i>
              Insights
            </button>
            
            <div className="ml-4 pl-4 border-l border-slate-600">
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-400 rounded-lg transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

// Main Dashboard View with Tabs
const DashboardView = () => {
  const { dashboardMetrics } = useMetrics();
  const [activeTab, setActiveTab] = useState('dynamic');
  
  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Executive Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('dynamic')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'dynamic'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <i className="fas fa-th-large mr-2"></i>
            Dynamic Metrics ({dashboardMetrics.length})
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            <i className="fas fa-chart-bar mr-2"></i>
            Overview
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'dynamic' ? (
        <DynamicDashboard />
      ) : (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <p className="text-gray-400">Overview dashboard content here...</p>
        </div>
      )}
    </div>
  );
};

// Main App Component
function MainApp() {
  const { user, logout } = useContext(AuthContext);
  const { updateWeeklyData, dashboardMetrics } = useMetrics();
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Initialize demo data on first load
  useEffect(() => {
    const initData = localStorage.getItem('bizgro_kpi_data');
    if (!initData) {
      const demoData = {
        weeks: ['W31', 'W32', 'W33', 'W34', 'W35', 'W36'],
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
            collections: '400000',
            jobsWonNumber: '3',
            jobsWonDollar: '900000',
            totalEstimates: '1800000',
            newEstimatedJobs: '5',
            fieldEmployees: '34',
            supervisors: '5',
            office: '6',
            wipDollar: '22000000',
            revLeftToBill: '10000000',
            upcomingJobsDollar: '3800000',
            concentrationRisk: '35'
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
            collections: '460000',
            jobsWonNumber: '2',
            jobsWonDollar: '700000',
            totalEstimates: '1500000',
            newEstimatedJobs: '4',
            fieldEmployees: '35',
            supervisors: '5',
            office: '6',
            wipDollar: '22500000',
            revLeftToBill: '10500000',
            upcomingJobsDollar: '4000000',
            concentrationRisk: '32'
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
            collections: '650000',
            jobsWonNumber: '1',
            jobsWonDollar: '500000',
            totalEstimates: '1200000',
            newEstimatedJobs: '3',
            fieldEmployees: '36',
            supervisors: '5',
            office: '6',
            wipDollar: '23000000',
            revLeftToBill: '11000000',
            upcomingJobsDollar: '4100000',
            concentrationRisk: '30'
          }
        ]
      };
      localStorage.setItem('bizgro_kpi_data', JSON.stringify(demoData));
      updateWeeklyData(demoData);
    } else {
      updateWeeklyData(JSON.parse(initData));
    }
  }, []);
  
  // Handle weekly data submission
  const handleWeeklySubmit = async (formData) => {
    setLoading(true);
    try {
      // Get existing data
      const existingData = JSON.parse(localStorage.getItem('bizgro_kpi_data') || '{}');
      
      // Add new entry
      const newEntry = {
        ...formData,
        weekEnding: formData.weekEnding || new Date().toISOString().split('T')[0]
      };
      
      existingData.allEntries = existingData.allEntries || [];
      existingData.allEntries.push(newEntry);
      
      // Keep only last 52 weeks
      if (existingData.allEntries.length > 52) {
        existingData.allEntries = existingData.allEntries.slice(-52);
      }
      
      // Update weeks array
      const lastWeek = existingData.weeks?.[existingData.weeks.length - 1] || 'W0';
      const weekNum = parseInt(lastWeek.replace('W', '')) + 1;
      existingData.weeks = existingData.weeks || [];
      existingData.weeks.push(`W${weekNum}`);
      if (existingData.weeks.length > 6) {
        existingData.weeks.shift();
      }
      
      // Save to localStorage
      localStorage.setItem('bizgro_kpi_data', JSON.stringify(existingData));
      
      // Update context
      updateWeeklyData(existingData);
      
      // Switch to dashboard
      setCurrentView('dashboard');
      
      // Show success message
      alert('Weekly data submitted successfully!');
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Error submitting data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle navigation with hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ['dashboard', 'metrics', 'entry', 'historical', 'insights'].includes(hash)) {
        setCurrentView(hash);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Update hash when view changes
  useEffect(() => {
    window.location.hash = currentView;
  }, [currentView]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        user={user}
        onLogout={logout}
      />
      
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'metrics' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Metrics Catalog</h2>
                <MetricsCatalog />
              </div>
            )}
            {currentView === 'entry' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Weekly Data Entry</h2>
                <EnhancedWeeklyEntry 
                  onSubmit={handleWeeklySubmit}
                  onCancel={() => setCurrentView('dashboard')}
                />
              </div>
            )}
            {currentView === 'historical' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Historical Data</h2>
                <HistoricalDataView />
              </div>
            )}
            {currentView === 'insights' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Insights Board</h2>
                <InsightsBoard />
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Quick Add Button - Floating */}
      {currentView === 'dashboard' && (
        <button
          onClick={() => setCurrentView('metrics')}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-110 z-30"
          title="Add Metrics"
        >
          <i className="fas fa-plus text-xl"></i>
        </button>
      )}
    </div>
  );
}

// Auth Wrapper Component
function AuthWrapper() {
  const { isAuthenticated } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return <MainApp />;
}

// App Wrapper with Providers
function App() {
  return (
    <AuthProvider>
      <MetricsProvider>
        <AuthWrapper />
      </MetricsProvider>
    </AuthProvider>
  );
}

export default App;
