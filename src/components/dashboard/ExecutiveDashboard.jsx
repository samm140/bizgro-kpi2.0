import React, { useState } from 'react';
import AgendaPanels from './AgendaPanels';
import WeeklyEntryQBODashboard from './WeeklyEntryQBODashboard';
import { Calendar, TrendingUp, Database, BarChart3, FileText, DollarSign } from 'lucide-react';

export default function ExecutiveDashboard({ data }) {
  const [activeView, setActiveView] = useState('overview'); // overview, agendas, qbo

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'text-blue-400' },
    { id: 'agendas', label: 'Meeting Agendas', icon: Calendar, color: 'text-purple-400' },
    { id: 'qbo', label: 'QBO Integration', icon: Database, color: 'text-green-400' }
  ];

  // Calculate summary metrics from data
  const summaryMetrics = {
    revenue: data?.revenueYTD || 14204274,
    revenueTarget: 14000000,
    cashPosition: data?.cashPosition || 1044957,
    gpmAverage: data?.gpmAverage || 34.08,
    gpmTarget: 30,
    activeProjects: data?.activeProjects || 23,
    backlog: data?.backlog || 21800000,
    dso: data?.dso || 45,
    dpo: data?.dpo || 38
  };

  const revenueProgress = (summaryMetrics.revenue / summaryMetrics.revenueTarget) * 100;
  const gpmStatus = summaryMetrics.gpmAverage >= summaryMetrics.gpmTarget ? 'above' : 'below';

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section with Navigation */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-200 mb-2">Executive Dashboard</h2>
            <p className="text-base text-gray-400">
              Comprehensive view of financial performance, meeting agendas, and QuickBooks integration
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-900/30 text-green-400 text-sm rounded-full border border-green-800">
              Live Data
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeView === item.id
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-900/50 text-gray-400 hover:bg-slate-800 hover:text-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeView === item.id ? item.color : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Section */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue Card */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-xs text-gray-500">YTD</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-200">
                  ${(summaryMetrics.revenue / 1000000).toFixed(2)}M
                </p>
                <p className="text-xs text-gray-400">Revenue</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Target: $14M</span>
                    <span className="text-green-400">{revenueProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div 
                      className="bg-green-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(revenueProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cash Position Card */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-gray-500">Current</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-200">
                  ${(summaryMetrics.cashPosition / 1000000).toFixed(2)}M
                </p>
                <p className="text-xs text-gray-400">Cash Position</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">DSO: {summaryMetrics.dso} days</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">DPO: {summaryMetrics.dpo} days</span>
                </div>
              </div>
            </div>

            {/* GPM Card */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <span className={`text-xs ${gpmStatus === 'above' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {gpmStatus === 'above' ? '↑' : '↓'} Target
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-200">
                  {summaryMetrics.gpmAverage.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400">Gross Margin</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Target: {summaryMetrics.gpmTarget}%</span>
                    <span className={gpmStatus === 'above' ? 'text-green-400' : 'text-yellow-400'}>
                      {gpmStatus === 'above' ? '+' : ''}{(summaryMetrics.gpmAverage - summaryMetrics.gpmTarget).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Backlog Card */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <span className="text-xs text-gray-500">Pipeline</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-200">
                  ${(summaryMetrics.backlog / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-400">Backlog</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Active: {summaryMetrics.activeProjects}</span>
                    <span className="text-orange-400">
                      ~{Math.round(summaryMetrics.backlog / summaryMetrics.revenue * 12)} mo.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setActiveView('qbo')}
                className="p-4 bg-slate-900/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Database className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="font-medium text-gray-200">Sync QuickBooks</p>
                    <p className="text-sm text-gray-400">Update financial data</p>
                  </div>
                </div>
              </button>
              
              <button className="p-4 bg-slate-900/50 hover:bg-slate-700 rounded-lg transition-colors text-left">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-200">Generate Report</p>
                    <p className="text-sm text-gray-400">Weekly KPI summary</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => setActiveView('agendas')}
                className="p-4 bg-slate-900/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="font-medium text-gray-200">View Agendas</p>
                    <p className="text-sm text-gray-400">Meeting preparation</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <p className="text-sm text-gray-300">
                  Weekly data entry completed for week ending {new Date().toLocaleDateString()}
                </p>
                <span className="ml-auto text-xs text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <p className="text-sm text-gray-300">
                  QuickBooks sync completed successfully - 14 fields updated
                </p>
                <span className="ml-auto text-xs text-gray-500">5 hours ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <p className="text-sm text-gray-300">
                  Variance alert: Current AR shows 12% difference from QBO
                </p>
                <span className="ml-auto text-xs text-gray-500">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Agendas Section */}
      {activeView === 'agendas' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-200">Meeting Agendas</h3>
            </div>
            <p className="text-base text-gray-400">
              Standard agendas for KPI calls and board meetings. All calls are recorded with AI notetaker for documentation.
            </p>
          </div>
          
          {/* Agenda Panels */}
          <AgendaPanels />
        </div>
      )}

      {/* QBO Integration Section */}
      {activeView === 'qbo' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-gray-200">QuickBooks Online Integration</h3>
            </div>
            <p className="text-base text-gray-400">
              Sync financial data, track variances, and maintain accurate records with automated QuickBooks integration.
            </p>
          </div>
          
          {/* QBO Dashboard Component */}
          <WeeklyEntryQBODashboard />
        </div>
      )}
    </div>
  );
}
