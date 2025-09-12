import React from 'react';
import { UserProfile } from './Authentication';

const Header = ({ currentView, setCurrentView, user, showProfile, setShowProfile }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-3xl font-bold italic">
              <img src="bizgro-kpi2.0-logo.png" alt="BizGro Logo" className="h-12 w-auto mr-3" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-200"></h1>
              <p className="text-xs text-gray-400">KPI-2.0 Financial System</p>
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
            
            {/* User Menu - Only show if user prop is provided */}
            {user && (
              <div className="relative ml-4">
                <button
                  onClick={() => setShowProfile && setShowProfile(!showProfile)}
                  className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <i className="fas fa-user-circle text-gray-300"></i>
                  <span className="text-sm text-gray-300">{user.name || 'User'}</span>
                  <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                </button>
                
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-4">
                    <UserProfile />
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
