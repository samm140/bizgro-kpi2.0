// src/components/dashboard/WeeklyEntryQBODashboard.jsx
import React, { useState, useEffect } from 'react';

const WeeklyEntryQBODashboard = ({ data, isQBOConnected = false }) => {
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Get the most recent entry
  const latestEntry = data?.allEntries?.[data.allEntries.length - 1] || {};
  
  // Calculate quick metrics
  const calculateMetrics = () => {
    if (!latestEntry) return {};
    
    return {
      totalCash: parseFloat(latestEntry.cashInBank || 0) + 
                 parseFloat(latestEntry.cashOnHand || 0) + 
                 parseFloat(latestEntry.savingsAccount || 0),
      netAR: parseFloat(latestEntry.currentAR || 0) - parseFloat(latestEntry.overdueAR || 0),
      workingCapital: (parseFloat(latestEntry.currentAR || 0) + 
                       parseFloat(latestEntry.cashInBank || 0)) - 
                       parseFloat(latestEntry.currentAP || 0),
      locAvailable: parseFloat(latestEntry.locLimit || 0) - parseFloat(latestEntry.locDrawn || 0)
    };
  };
  
  const metrics = calculateMetrics();
  
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-200">
          <i className="fas fa-file-invoice-dollar mr-2 text-green-400"></i>
          Weekly Entry Summary
        </h3>
        <div className="flex items-center space-x-4">
          {isQBOConnected && (
            <span className="text-xs text-green-400 bg-green-900/20 px-3 py-1 rounded-full">
              <i className="fas fa-check-circle mr-1"></i>QBO Connected
            </span>
          )}
          <span className="text-xs text-gray-400">
            Week Ending: {formatDate(latestEntry.weekEnding)}
          </span>
        </div>
      </div>
      
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Total Cash</div>
          <div className="text-lg font-bold text-green-400">
            {formatCurrency(metrics.totalCash)}
          </div>
        </div>
        
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Net AR</div>
          <div className="text-lg font-bold text-blue-400">
            {formatCurrency(metrics.netAR)}
          </div>
        </div>
        
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Working Capital</div>
          <div className={`text-lg font-bold ${metrics.workingCapital >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(metrics.workingCapital)}
          </div>
        </div>
        
        <div className="bg-slate-700/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">LOC Available</div>
          <div className="text-lg font-bold text-purple-400">
            {formatCurrency(metrics.locAvailable)}
          </div>
        </div>
      </div>
      
      {/* Entry Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue & Collections */}
        <div className="bg-slate-900/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Revenue & Collections</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Revenue Billed</span>
              <span className="text-sm text-gray-200">
                {formatCurrency(latestEntry.revenueBilledToDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Collections</span>
              <span className="text-sm text-gray-200">
                {formatCurrency(latestEntry.collections)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Gross Profit</span>
              <span className="text-sm text-gray-200">
                {formatCurrency(latestEntry.grossProfitAccrual)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Jobs & Backlog */}
        <div className="bg-slate-900/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Jobs & Backlog</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Jobs Won</span>
              <span className="text-sm text-gray-200">
                {latestEntry.jobsWonNumber || 0} ({formatCurrency(latestEntry.jobsWonDollar)})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">WIP</span>
              <span className="text-sm text-gray-200">
                {formatCurrency(latestEntry.wipDollar)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Upcoming Jobs</span>
              <span className="text-sm text-gray-200">
                {formatCurrency(latestEntry.upcomingJobsDollar)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Workforce */}
        <div className="bg-slate-900/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Workforce</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Field Employees</span>
              <span className="text-sm text-gray-200">{latestEntry.fieldEmployees || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Supervisors</span>
              <span className="text-sm text-gray-200">{latestEntry.supervisors || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">Office Staff</span>
              <span className="text-sm text-gray-200">{latestEntry.office || 0}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {lastSyncTime ? `Last synced: ${formatDate(lastSyncTime)}` : 'Not synced'}
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded text-sm transition-colors">
            <i className="fas fa-eye mr-1"></i>View Details
          </button>
          {isQBOConnected && (
            <button 
              className="px-3 py-1 bg-green-900/50 hover:bg-green-900/70 text-green-400 rounded text-sm transition-colors"
              onClick={() => {
                setSyncStatus('syncing');
                setTimeout(() => {
                  setSyncStatus('synced');
                  setLastSyncTime(new Date());
                  setTimeout(() => setSyncStatus('idle'), 2000);
                }, 1500);
              }}
              disabled={syncStatus === 'syncing'}
            >
              {syncStatus === 'syncing' ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1"></i>Syncing...
                </>
              ) : syncStatus === 'synced' ? (
                <>
                  <i className="fas fa-check mr-1"></i>Synced
                </>
              ) : (
                <>
                  <i className="fas fa-sync mr-1"></i>Sync with QBO
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyEntryQBODashboard;
