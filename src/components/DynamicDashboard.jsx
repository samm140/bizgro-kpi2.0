import React, { useState, useEffect } from 'react';
import { useMetrics } from './MetricsContext';

// Metric Card Component
const MetricCard = ({ metric, index, onDragStart, onDragOver, onDrop, onRemove }) => {
  const { calculateMetricValue } = useMetrics();
  const [value, setValue] = useState({ value: 0, trend: 'neutral', formatted: 'Loading...' });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const calculated = calculateMetricValue(metric);
    setValue(calculated);
  }, [metric, calculateMetricValue]);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
    onDragStart(index);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    onDragOver(index);
  };

  const handleDrop = (e) => {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    onDrop(index);
    return false;
  };

  // Determine card color based on metric category
  const getCategoryColor = () => {
    switch (metric.category) {
      case 'Liquidity': return 'border-blue-500 bg-blue-900/20';
      case 'AR / Collections': return 'border-green-500 bg-green-900/20';
      case 'Profitability': return 'border-purple-500 bg-purple-900/20';
      case 'Sales': return 'border-orange-500 bg-orange-900/20';
      case 'Workforce': return 'border-pink-500 bg-pink-900/20';
      case 'WIP': return 'border-yellow-500 bg-yellow-900/20';
      case 'Risk': return 'border-red-500 bg-red-900/20';
      default: return 'border-slate-500 bg-slate-900/20';
    }
  };

  // Get trend icon
  const getTrendIcon = () => {
    if (value.trend === 'up') {
      return <i className="fas fa-arrow-up text-green-400"></i>;
    } else if (value.trend === 'down') {
      return <i className="fas fa-arrow-down text-red-400"></i>;
    }
    return <i className="fas fa-minus text-gray-400"></i>;
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative p-4 rounded-lg border-2 ${getCategoryColor()} backdrop-blur transition-all cursor-move
        ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-102 hover:shadow-lg'}
      `}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 left-2 text-gray-500">
        <i className="fas fa-grip-vertical"></i>
      </div>
      
      {/* Remove Button */}
      <button
        onClick={() => onRemove(metric.id)}
        className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition-colors"
      >
        <i className="fas fa-times"></i>
      </button>

      {/* Metric Content */}
      <div className="mt-2">
        <div className="text-xs text-gray-400 mb-1">{metric.category}</div>
        <h3 className="text-sm font-semibold text-white mb-2">{metric.title}</h3>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            {value.formatted}
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className="text-xs text-gray-400">{metric.benchmark}</span>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-slate-700">
          <div className="text-xs text-gray-500">Formula:</div>
          <code className="text-xs text-blue-300">{metric.formula}</code>
        </div>
      </div>
    </div>
  );
};

// Main Dynamic Dashboard Component
const DynamicDashboard = () => {
  const { 
    dashboardMetrics, 
    reorderDashboardMetrics, 
    removeMetricFromDashboard,
    weeklyData 
  } = useMetrics();
  
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, compact
  const [filterCategory, setFilterCategory] = useState('All');

  // Get unique categories
  const categories = ['All', ...new Set(dashboardMetrics.map(m => m.category))];

  // Filter metrics by category
  const filteredMetrics = filterCategory === 'All' 
    ? dashboardMetrics 
    : dashboardMetrics.filter(m => m.category === filterCategory);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index) => {
    setDragOverIndex(index);
  };

  const handleDrop = (index) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderDashboardMetrics(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Get last update time
  const getLastUpdateTime = () => {
    if (!weeklyData || !weeklyData.allEntries || weeklyData.allEntries.length === 0) {
      return 'No data available';
    }
    const lastEntry = weeklyData.allEntries[weeklyData.allEntries.length - 1];
    return `Last updated: ${lastEntry.weekEnding || 'Unknown'}`;
  };

  // Get grid class based on view mode
  const getGridClass = () => {
    switch (viewMode) {
      case 'list':
        return 'grid grid-cols-1 gap-4';
      case 'compact':
        return 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2';
      default: // grid
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
    }
  };

  if (dashboardMetrics.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-chart-pie text-6xl text-gray-600 mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-400 mb-2">No Metrics Selected</h3>
        <p className="text-gray-500 mb-6">
          Go to the Metrics Catalog to select metrics for your dashboard
        </p>
        <button 
          onClick={() => window.location.hash = '#metrics'}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Metrics
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Dynamic Metrics Dashboard</h2>
            <p className="text-sm text-gray-400 mt-1">{getLastUpdateTime()}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            {/* View Mode Toggle */}
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="fas fa-th"></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="fas fa-list"></i>
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'compact' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="fas fa-grip"></i>
              </button>
            </div>
            
            {/* Metrics Count */}
            <div className="px-3 py-1.5 bg-slate-700 rounded text-sm text-gray-300">
              {filteredMetrics.length} metrics
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={getGridClass()}>
        {filteredMetrics.map((metric, index) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            index={index}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onRemove={removeMetricFromDashboard}
          />
        ))}
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Quick Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500">Total Metrics</div>
            <div className="text-xl font-bold text-white">{dashboardMetrics.length}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Categories</div>
            <div className="text-xl font-bold text-blue-400">{categories.length - 1}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Data Points</div>
            <div className="text-xl font-bold text-green-400">
              {weeklyData?.allEntries?.length || 0}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Last Week</div>
            <div className="text-xl font-bold text-purple-400">
              {weeklyData?.weeks?.[weeklyData.weeks.length - 1] || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <i className="fas fa-info-circle text-blue-400 mt-1"></i>
          <div className="text-sm text-gray-300">
            <p className="font-semibold mb-1">Dashboard Tips:</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• Drag and drop cards to reorder them</li>
              <li>• Click the × to remove a metric from the dashboard</li>
              <li>• Use the view mode buttons to change layout</li>
              <li>• Filter by category to focus on specific metrics</li>
              <li>• Go to Metrics Catalog to add more metrics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicDashboard;
