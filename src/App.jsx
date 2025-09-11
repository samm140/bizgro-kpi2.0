import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import WeeklyEntry from './components/WeeklyEntry';
import { mockApi } from './services/api';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // Initialize mock data on app load
    mockApi.initData();
    if (currentView === 'dashboard') {
      loadDashboardData();
    }
  }, [currentView]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    await mockApi.submitWeeklyData(formData);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-biz-darker">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView}
      />
      
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-biz-primary mx-auto mb-4"></div>
              <p className="text-gray-300">Loading Dashboard...</p>
            </div>
          </div>
        ) : currentView === 'dashboard' ? (
          <Dashboard data={dashboardData} />
        ) : (
          <WeeklyEntry onSubmit={handleFormSubmit} />
        )}
      </main>
    </div>
  );
}

export default App;
