import React from 'react';
import './App.css';

function App() {
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-200">Executive Dashboard</h2>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Revenue YTD</p>
                <p className="text-3xl font-bold text-gray-100">$14.2M</p>
                <p className="text-green-400 text-xs mt-2">↑ 12% vs last year</p>
              </div>
              <i className="fas fa-dollar-sign text-green-400 text-xl"></i>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">GPM Average</p>
                <p className="text-3xl font-bold text-gray-100">34.08%</p>
                <p className="text-green-400 text-xs mt-2">Above 30% target</p>
              </div>
              <i className="fas fa-percentage text-blue-400 text-xl"></i>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Active Projects</p>
                <p className="text-3xl font-bold text-gray-100">23</p>
                <p className="text-gray-400 text-xs mt-2">$21.8M in WIP</p>
              </div>
              <i className="fas fa-building text-purple-400 text-xl"></i>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Cash Position</p>
                <p className="text-3xl font-bold text-gray-100">$1.04M</p>
                <p className="text-gray-400 text-xs mt-2">DSO: 40 days</p>
              </div>
              <i className="fas fa-wallet text-orange-400 text-xl"></i>
            </div>
          </div>
        </div>

        {/* Placeholder for Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Revenue vs Collections</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Chart will be displayed here</p>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">GPM % Trend</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Chart will be displayed here</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
