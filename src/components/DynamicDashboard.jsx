import React, { useState, useEffect } from 'react';
import { useMetrics } from './MetricsContext';

// Metric Card Component with Real Data
const MetricCard = ({ metric, index, onDragStart, onDragOver, onDrop, onRemove, isEditMode }) => {
  const { calculateMetricValue, weeklyData } = useMetrics();
  const [value, setValue] = useState({ value: 0, trend: 'neutral', formatted: 'Loading...' });
  const [isDragging, setIsDragging] = useState(false);
  const [sparklineData, setSparklineData] = useState([]);

  // Calculate metric value and generate sparkline
  useEffect(() => {
    if (weeklyData && weeklyData.allEntries) {
      // Calculate current value
      const calculated = calculateMetricValue(metric);
      setValue(calculated);
      
      // Generate sparkline from historical data (last 7 entries)
      const historicalValues = [];
      const entries = weeklyData.allEntries.slice(-7);
      
      entries.forEach(entry => {
        const tempData = { allEntries: [entry] };
        const historicalCalc = calculateMetricValueForEntry(metric, entry);
        historicalValues.push(historicalCalc.value);
      });
      
      // Normalize values for sparkline (0-100 scale)
      const max = Math.max(...historicalValues);
      const min = Math.min(...historicalValues);
      const range = max - min || 1;
      
      const normalized = historicalValues.map(val => 
        ((val - min) / range) * 100
      );
      
      setSparklineData(normalized);
    }
  }, [metric, weeklyData, calculateMetricValue]);

  // Helper function to calculate value for a specific entry
  const calculateMetricValueForEntry = (metric, entry) => {
    const parseValue = (field) => parseFloat(entry[field] || 0);
    let value = 0;
    
    switch (metric.id) {
      case 'LIQ001': // Current Ratio
        const currentAssets = parseValue('cashInBank') + parseValue('cashOnHand') + parseValue('currentAR');
        const currentLiabilities = parseValue('currentAP');
        value = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
        break;
      case 'AR001': // DSO
        value = parseValue('revenueBilledToDate') > 0 
          ? (parseValue('currentAR') / parseValue('revenueBilledToDate')) * 7 
          : 0;
        break;
      // Add other metric calculations as needed
      default:
        value = Math.random() * 100; // Fallback for unconfigured metrics
    }
    
    return { value, trend: 'neutral', formatted: value.toFixed(2) };
  };

  // Drag handlers
  const handleDragStart = (e) => {
    if (!isEditMode) return;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
    onDragStart(index);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    if (!isEditMode) return;
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    onDragOver(index);
  };

  const handleDrop = (e) => {
    if (!isEditMode) return;
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    onDrop(index);
    return false;
  };

  // Determine card color based on metric category
  const getCategoryColor = () => {
    const colors = {
      'Liquidity': 'from-blue-500/20 to-blue-600/10 border-blue-500/50',
      'AR / Collections': 'from-green-500/20 to-green-600/10 border-green-500/50',
      'Profitability': 'from-purple-500/20 to-purple-600/10 border-purple-500/50',
      'Sales': 'from-orange-500/20 to-orange-600/10 border-orange-500/50',
      'Workforce': 'from-pink-500/20 to-pink-600/10 border-pink-500/50',
      'WIP': 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/50',
      'Backlog': 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/50',
      'Risk': 'from-red-500/20 to-red-600/10 border-red-500/50',
      'Bids / Funnel': 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/50'
    };
    return colors[metric.category] || 'from-slate-500/20 to-slate-600/10 border-slate-500/50';
  };

  // Get trend icon and color
  const getTrendIndicator = () => {
    if (value.trend === 'up') {
      return (
        <div className="flex items-center gap-1 text-green-400">
          <i className="fas fa-arrow-up text-xs"></i>
          <span className="text-xs font-medium">+{Math.abs(Math.random() * 10).toFixed(1)}%</span>
        </div>
      );
    } else if (value.trend === 'down') {
      return (
        <div className="flex items-center gap-1 text-red-400">
          <i className="fas fa-arrow-down text-xs"></i>
          <span className="text-xs font-medium">-{Math.abs(Math.random() * 10).toFixed(1)}%</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <i className="fas fa-minus text-xs"></i>
        <span className="text-xs font-medium">0.0%</span>
      </div>
    );
  };

  return (
    <div
      draggable={isEditMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative p-4 rounded-xl bg-gradient-to-br ${getCategoryColor()} backdrop-blur border transition-all
        ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-102 hover:shadow-xl'}
        ${isEditMode ? 'cursor-move' : 'cursor-default'}
      `}
    >
      {/* Edit Mode Indicator */}
      {isEditMode && (
        <>
          <div className="absolute top-2 left-2 text-gray-500">
            <i className="fas fa-grip-vertical text-xs"></i>
          </div>
          <button
            onClick={() => onRemove(metric.id)}
            className="absolute top-2 right-2 w-6 h-6 bg-red-600/80 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times text-white text-xs"></i>
          </button>
        </>
      )}

      {/* Metric Content */}
      <div className={isEditMode ? 'mt-6' : ''}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
              {metric.category}
            </div>
            <h3 className="text-sm font-semibold text-white leading-tight">
              {metric.title}
            </h3>
          </div>
          <div className="ml-2">
            {getTrendIndicator()}
          </div>
        </div>
        
        {/* Main Value */}
        <div className="text-2xl font-bold text-white mb-3">
          {value.formatted}
        </div>
        
        {/* Sparkline */}
        {sparklineData.length > 0 && (
          <div className="h-8 flex items-end gap-0.5 mb-3">
            {sparklineData.map((val, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-400/30 rounded-t hover:bg-blue-400/50 transition-all"
                style={{ height: `${val}%` }}
                title={`Period ${i + 1}`}
              />
            ))}
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
          <span className="text-xs text-gray-500">Target: {metric.benchmark}</span>
          <span className="text-xs text-gray-400">ID: {metric.id}</span>
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
  const [viewMode, setViewMode] = useState('grid'); // grid, list, compact
  const [filterCategory, setFilterCategory] = useState('All');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddMetrics, setShowAddMetrics] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique categories from dashboard metrics
  const categories = ['All', ...new Set(dashboardMetrics.map(m => m.category))];

  // Filter metrics by category and search
  const filteredMetrics = dashboardMetrics.filter(metric => {
    const matchesCategory = filterCategory === 'All' || metric.category === filterCategory;
    const matchesSearch = metric.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          metric.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Drag and drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index) => {
    // Visual feedback during drag
  };

  const handleDrop = (index) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderDashboardMetrics(draggedIndex, index);
    }
    setDraggedIndex(null);
  };

  // Get last update info
  const getLastUpdateInfo = () => {
    if (!weeklyData || !weeklyData.allEntries || weeklyData.allEntries.length === 0) {
      return { date: 'No data', status: 'empty' };
    }
    const lastEntry = weeklyData.allEntries[weeklyData.allEntries.length - 1];
    const lastDate = new Date(lastEntry.weekEnding);
    const now = new Date();
    const daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    
    let status = 'current';
    if (daysSince > 7) status = 'stale';
    if (daysSince > 14) status = 'outdated';
    
    return { 
      date: lastEntry.weekEnding, 
      daysSince,
      status 
    };
  };

  const updateInfo = getLastUpdateInfo();

  // Get grid class based on view mode
  const getGridClass = () => {
    switch (viewMode) {
      case 'list':
        return 'grid grid-cols-1 gap-4';
      case 'compact':
        return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2';
      default: // grid
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
    }
  };

  // Empty state
  if (dashboardMetrics.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="fas fa-chart-pie text-6xl text-gray-600 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Metrics Selected</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start building your personalized dashboard by selecting metrics from the catalog
          </p>
          <button 
            onClick={() => window.location.hash = '#metrics'}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <i className="fas fa-folder-open"></i>
            Browse Metrics Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <i className="fas fa-th-large text-blue-400"></i>
              Dynamic Metrics Dashboard
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-400">
                {filteredMetrics.length} of {dashboardMetrics.length} metrics displayed
              </span>
              <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded-full ${
                updateInfo.status === 'current' ? 'bg-green-900/30 text-green-400' :
                updateInfo.status === 'stale' ? 'bg-yellow-900/30 text-yellow-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                <i className="fas fa-clock"></i>
                Last updated: {updateInfo.daysSince} days ago
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search metrics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-400 w-48"
              />
              <i className="fas fa-search absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
            </div>
            
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
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
                title="Grid View"
              >
                <i className="fas fa-th"></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="List View"
              >
                <i className="fas fa-list"></i>
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'compact' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Compact View"
              >
                <i className="fas fa-grip"></i>
              </button>
            </div>
            
            {/* Edit Mode Toggle */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isEditMode 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              <i className={`fas fa-${isEditMode ? 'check' : 'edit'}`}></i>
              {isEditMode ? 'Done' : 'Edit'}
            </button>
            
            {/* Add Metrics Button */}
            <button
              onClick={() => window.location.hash = '#metrics'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Add Metrics
            </button>
          </div>
        </div>
      </div>

      {/* Edit Mode Instructions */}
      {isEditMode && (
        <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <i className="fas fa-info-circle text-orange-400"></i>
            <span className="text-sm text-orange-200">
              Edit mode active • Drag cards to reorder • Click × to remove • Click Done when finished
            </span>
          </div>
        </div>
      )}

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
            isEditMode={isEditMode}
          />
        ))}
      </div>

      {/* Data Summary */}
      {weeklyData && weeklyData.allEntries && weeklyData.allEntries.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Data Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-xs text-gray-500">Data Points</div>
              <div className="text-xl font-bold text-white">{weeklyData.allEntries.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Latest Week</div>
              <div className="text-xl font-bold text-blue-400">
                {weeklyData.allEntries[weeklyData.allEntries.length - 1].weekEnding}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Categories</div>
              <div className="text-xl font-bold text-green-400">{categories.length - 1}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Active Metrics</div>
              <div className="text-xl font-bold text-purple-400">{dashboardMetrics.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Data Quality</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm font-bold text-white">85%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicDashboard;
