import React from 'react';

const Header = ({ currentView, setCurrentView }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
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
          </div>
          
          {/* Navigation Buttons */}
          <nav className="flex space-x-2">
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
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
