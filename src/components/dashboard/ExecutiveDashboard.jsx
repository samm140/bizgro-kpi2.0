import React, { useState, useEffect } from 'react';
import ChartVisualization from '../ChartVisualization';
import EnhancedDynamicDashboard from './EnhancedDynamicDashboard';
import AgendaPanels from './AgendaPanels';
import { TrendingUp, TrendingDown, AlertCircle, Clock, Users, Briefcase, DollarSign, Activity, Calendar } from 'lucide-react';

export default function ExecutiveDashboard({ data: propData }) {
  const [activeView, setActiveView] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use prop data or get from localStorage
  useEffect(() => {
    if (propData) {
      setData(propData);
      setLoading(false);
    } else {
      // Fallback to localStorage if no prop data
      try {
        const storedData = localStorage.getItem('bizgro_kpi_data');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setData(parsedData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoading(false);
    }
  }, [propData]);

  // Calculate metrics from your real data
  const metrics = data ? {
    revenue: data.revenueYTD || 0,
    revenueChange: calculateChange(data),
    cashFlow: data.cashPosition || 0,
    cashFlowChange: calculateCashChange(data),
    activeProjects: data.activeProjects || 0,
    projectsChange: calculateProjectChange(data),
    teamSize: calculateTeamSize(data),
    teamChange: calculateTeamChange(data),
    gpm: data.gpmAverage || 0,
    gpmStatus: (data.gpmAverage || 0) > 30 ? 'up' : 'down',
    currentRatio: data.currentAR && data.currentAP ? (data.currentAR / data.currentAP).toFixed(2) : 'N/A',
    ratioStatus: getRatioStatus(data),
    backlog: data.backlog || 0,
    backlogChange: calculateBacklogChange(data)
  } : null;

  // Helper functions for calculations
  function calculateChange(data) {
    if (!data.weeklyEntries || data.weeklyEntries.length < 2) return 0;
    const latest = data.weeklyEntries[data.weeklyEntries.length - 1];
    const previous = data.weeklyEntries[data.weeklyEntries.length - 2];
    if (!latest || !previous || !previous.revenueBilledToDate) return 0;
    const change = ((latest.revenueBilledToDate - previous.revenueBilledToDate) / previous.revenueBilledToDate * 100).toFixed(1);
    return isNaN(change) ? 0 : change;
  }

  function calculateCashChange(data) {
    if (!data.weeklyEntries || data.weeklyEntries.length < 2) return 0;
    const latest = data.weeklyEntries[data.weeklyEntries.length - 1];
    const previous = data.weeklyEntries[data.weeklyEntries.length - 2];
    if (!latest || !previous) return 0;
    const latestCash = (parseFloat(latest.cashInBank) || 0) + (parseFloat(latest.cashOnHand) || 0);
    const previousCash = (parseFloat(previous.cashInBank) || 0) + (parseFloat(previous.cashOnHand) || 0);
    if (previousCash === 0) return 0;
    const change = ((latestCash - previousCash) / previousCash * 100).toFixed(1);
    return isNaN(change) ? 0 : change;
  }

  function calculateProjectChange(data) {
    if (!data.weeklyEntries || data.weeklyEntries.length < 2) return 0;
    const latest = data.weeklyEntries[data.weeklyEntries.length - 1];
    const previous = data.weeklyEntries[data.weeklyEntries.length - 2];
    if (!latest || !previous) return 0;
    return (parseFloat(latest.jobsStartedNumber) || 0) - (parseFloat(previous.jobsStartedNumber) || 0);
  }

  function calculateTeamSize(data) {
    if (!data.weeklyEntries || data.weeklyEntries.length === 0) return 0;
    const latest = data.weeklyEntries[data.weeklyEntries.length - 1];
    return (parseFloat(latest.fieldEmployees) || 0) + (parseFloat(latest.supervisors) || 0) + (parseFloat(latest.office) || 0);
  }

  function calculateTeamChange(data) {
    if (!data.weeklyEntries || data.weeklyEntries.length < 2) return 0;
    const latest = data.weeklyEntries[data.weeklyEntries.length - 1];
    const previous = data.weeklyEntries[data.weeklyEntries.length - 2];
    if (!latest || !previous) return 0;
    const latestTeam = (parseFloat(latest.fieldEmployees) || 0) + (parseFloat(latest.supervisors) || 0) + (parseFloat(latest.office) || 0);
    const previousTeam = (parseFloat(previous.fieldEmployees) || 0) + (parseFloat(previous.supervisors) || 0) + (parseFloat(previous.office) || 0);
    return latestTeam - previousTeam;
  }

  function getRatioStatus(data) {
    if (!data.currentAR || !data.currentAP || data.currentAP === 0) return 'neutral';
    const ratio = data.currentAR / data.currentAP;
    return ratio >= 1.5 ? 'up' : ratio >= 1.2 ? 'neutral' : 'down';
  }

  function calculateBacklogChange(data) {
    if (!data.weeklyEntries || data.weeklyEntries.length < 2) return 0;
    const latest = data.weeklyEntries[data.weeklyEntries.length - 1];
    const previous = data.weeklyEntries[data.weeklyEntries.length - 2];
    if (!latest || !previous || !previous.upcomingJobsDollar) return 0;
    const change = ((parseFloat(latest.upcomingJobsDollar) - parseFloat(previous.upcomingJobsDollar)) / parseFloat(previous.upcomingJobsDollar) * 100).toFixed(1);
    return isNaN(change) ? 0 : change;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation - Including Agendas tab */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex space-x-1 p-1">
          <button
            onClick={() => setActiveView('overview')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeView === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('charts')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeView === 'charts'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Charts
          </button>
          <button
            onClick={() => setActiveView('metrics')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeView === 'metrics'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveView('agendas')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              activeView === 'agendas'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Agendas
          </button>
        </div>
      </div>

      {/* Overview View */}
      {activeView === 'overview' && metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue Card */}
            <MetricCard
              title="Revenue YTD"
              value={`$${(metrics.revenue / 1000000).toFixed(2)}M`}
              change={`${metrics.revenueChange}%`}
              trend={parseFloat(metrics.revenueChange) > 0 ? 'up' : 'down'}
              icon={<DollarSign className="w-5 h-5" />}
              iconColor="text-green-600"
              bgColor="bg-green-50"
            />

            {/* Cash Flow Card */}
            <MetricCard
              title="Cash Position"
              value={`$${(metrics.cashFlow / 1000).toFixed(0)}K`}
              change={`${metrics.cashFlowChange}%`}
              trend={parseFloat(metrics.cashFlowChange) > 0 ? 'up' : 'down'}
              icon={<Activity className="w-5 h-5" />}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
            />

            {/* Projects Card */}
            <MetricCard
              title="Active Projects"
              value={metrics.activeProjects}
              change={`${metrics.projectsChange > 0 ? '+' : ''}${metrics.projectsChange}`}
              trend={metrics.projectsChange > 0 ? 'up' : metrics.projectsChange < 0 ? 'down' : 'neutral'}
              icon={<Briefcase className="w-5 h-5" />}
              iconColor="text-purple-600"
              bgColor="bg-purple-50"
            />

            {/* Team Card */}
            <MetricCard
              title="Team Size"
              value={metrics.teamSize}
              change={`${metrics.teamChange > 0 ? '+' : ''}${metrics.teamChange}`}
              trend={metrics.teamChange > 0 ? 'up' : metrics.teamChange < 0 ? 'down' : 'neutral'}
              icon={<Users className="w-5 h-5" />}
              iconColor="text-orange-600"
              bgColor="bg-orange-50"
            />

            {/* GPM Card */}
            <MetricCard
              title="Gross Profit Margin"
              value={`${metrics.gpm.toFixed(1)}%`}
              change={metrics.gpmStatus === 'up' ? 'Above Target' : 'Below Target'}
              trend={metrics.gpmStatus}
              icon={<TrendingUp className="w-5 h-5" />}
              iconColor="text-indigo-600"
              bgColor="bg-indigo-50"
            />

            {/* Current Ratio Card */}
            <MetricCard
              title="Current Ratio"
              value={metrics.currentRatio}
              change={metrics.ratioStatus === 'up' ? 'Healthy' : metrics.ratioStatus === 'neutral' ? 'Adequate' : 'Low'}
              trend={metrics.ratioStatus}
              icon={<AlertCircle className="w-5 h-5" />}
              iconColor="text-teal-600"
              bgColor="bg-teal-50"
            />

            {/* Backlog Card */}
            <MetricCard
              title="Backlog"
              value={`$${(metrics.backlog / 1000000).toFixed(2)}M`}
              change={`${metrics.backlogChange}%`}
              trend={parseFloat(metrics.backlogChange) > 0 ? 'up' : 'down'}
              icon={<Clock className="w-5 h-5" />}
              iconColor="text-pink-600"
              bgColor="bg-pink-50"
            />

            {/* Days Sales Outstanding */}
            <MetricCard
              title="DSO"
              value={calculateDSO(data)}
              change={getDSOStatus(data)}
              trend={getDSOTrend(data)}
              icon={<Activity className="w-5 h-5" />}
              iconColor="text-gray-600"
              bgColor="bg-gray-50"
            />
          </div>
        </>
      )}

      {/* Charts View */}
      {activeView === 'charts' && data && (
        <ChartVisualization data={data} />
      )}

      {/* Metrics View */}
      {activeView === 'metrics' && (
        <EnhancedDynamicDashboard data={data} />
      )}

      {/* Agendas View - Dedicated tab with AgendaPanels */}
      {activeView === 'agendas' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-700" />
              <h3 className="text-sm font-semibold text-blue-900">Meeting Agendas</h3>
            </div>
            <p className="text-sm text-blue-800">
              Standard agendas for KPI calls and board meetings. All calls are recorded with AI notetaker for documentation.
            </p>
          </div>
          <AgendaPanels />
        </div>
      )}
    </div>
  );
}

// MetricCard Component
function MetricCard({ title, value, change, trend, icon, iconColor, bgColor }) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <span className="w-4 h-4 text-gray-400">→</span>;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        {getTrendIcon()}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className={`text-sm ${getTrendColor()}`}>{change}</p>
    </div>
  );
}

// Helper functions for DSO
function calculateDSO(data) {
  if (!data || !data.allEntries || data.allEntries.length === 0) return 'N/A';
  const latest = data.allEntries[data.allEntries.length - 1];
  if (!latest || !latest.currentAR || !latest.revenueBilledToDate || parseFloat(latest.revenueBilledToDate) === 0) return 'N/A';
  const dso = (parseFloat(latest.currentAR) / parseFloat(latest.revenueBilledToDate) * 30).toFixed(0);
  return `${dso} days`;
}

function getDSOStatus(data) {
  if (!data || !data.allEntries || data.allEntries.length === 0) return 'N/A';
  const latest = data.allEntries[data.allEntries.length - 1];
  if (!latest || !latest.currentAR || !latest.revenueBilledToDate || parseFloat(latest.revenueBilledToDate) === 0) return 'N/A';
  const dso = parseFloat(latest.currentAR) / parseFloat(latest.revenueBilledToDate) * 30;
  if (dso < 45) return 'Good';
  if (dso < 60) return 'Warning';
  return 'High';
}

function getDSOTrend(data) {
  if (!data || !data.allEntries || data.allEntries.length === 0) return 'neutral';
  const latest = data.allEntries[data.allEntries.length - 1];
  if (!latest || !latest.currentAR || !latest.revenueBilledToDate || parseFloat(latest.revenueBilledToDate) === 0) return 'neutral';
  const dso = parseFloat(latest.currentAR) / parseFloat(latest.revenueBilledToDate) * 30;
  if (dso < 45) return 'up';
  if (dso < 60) return 'neutral';
  return 'down';
}
