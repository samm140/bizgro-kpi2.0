// src/components/dashboard/ExecutiveDashboard.jsx
// Updated main dashboard component with Financial Charts View integration

import React, { useState } from 'react';
import { 
  BarChart3,
  FileText,
  Shield,
  Download,
  Upload,
  Link2
} from 'lucide-react';
import EnhancedDynamicDashboard from './EnhancedDynamicDashboard';
import FinancialChartsView from './FinancialChartsView';
// Import your Enhanced View component here
// import EnhancedView from './EnhancedView';

export default function ExecutiveDashboard() {
  const [activeView, setActiveView] = useState('charts'); // Default to Charts View
  const [data, setData] = useState(null); // Your data state

  // Tab button component for consistent styling
  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  // Export functions
  const handleExportExcel = () => {
    console.log('Exporting to Excel...');
    // Implement Excel export logic
  };

  const handleExportCSV = () => {
    console.log('Exporting to CSV...');
    // Implement CSV export logic
  };

  const handleConnectSheets = () => {
    console.log('Connecting to Google Sheets...');
    // Implement Google Sheets connection logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Navigation Bar */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">KPI</span>
              </div>
              <div>
                <h1 className="text-white font-semibold">KPI 2.0</h1>
                <p className="text-xs text-slate-400">Financial System</p>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 text-blue-400 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
              <button className="px-4 py-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                📝 Weekly Entry
              </button>
              <button className="px-4 py-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                💡 Insights
              </button>
              <button className="px-4 py-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                📊 Historical
              </button>
              <button className="px-4 py-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                📈 Metrics
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                Demo User ▼
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-header with title and actions */}
      <div className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Executive Dashboard</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export Excel
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={handleConnectSheets}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                Connect Sheets
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <TabButton
            id="dynamic"
            label="Dynamic Metrics"
            icon={Shield}
            isActive={activeView === 'dynamic'}
            onClick={setActiveView}
          />
          <TabButton
            id="enhanced"
            label="Enhanced View"
            icon={FileText}
            isActive={activeView === 'enhanced'}
            onClick={setActiveView}
          />
          <TabButton
            id="charts"
            label="Charts View"
            icon={BarChart3}
            isActive={activeView === 'charts'}
            onClick={setActiveView}
          />
        </div>

        {/* View Content */}
        <div className="transition-all duration-300">
          {activeView === 'dynamic' && (
            <EnhancedDynamicDashboard data={data} />
          )}
          
          {activeView === 'enhanced' && (
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50">
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Enhanced View</h3>
                <p className="text-slate-400">
                  Your enhanced view component will be displayed here
                </p>
                {/* Replace with: <EnhancedView data={data} /> */}
              </div>
            </div>
          )}
          
          {activeView === 'charts' && (
            <FinancialChartsView data={data} />
          )}
        </div>
      </div>
    </div>
  );
}
