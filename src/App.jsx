// File: src/App.jsx
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import WeeklyEntry from './components/WeeklyEntry';
import LoadingSpinner from './components/LoadingSpinner';
import { mockApi } from './services/mockApi';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const data = await mockApi.getDashboardData();
    setDashboardData(data);
    setLoading(false);
  };

  const handleFormSubmit = async (formData) => {
    await mockApi.submitWeeklyData(formData);
    await loadDashboard();
    setCurrentView('dashboard');
  };

  const switchView = (view) => {
    setCurrentView(view);
    if (view === 'dashboard') {
      loadDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-biz-darker">
      <Header currentView={currentView} onViewChange={switchView} />
      
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <LoadingSpinner />
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
