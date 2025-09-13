// src/components/dashboard/DynamicMetrics.jsx
import React, { useEffect } from 'react';
import { useMetricsStore } from '../../state/metricsStore';
import { useMetricsData } from '../../hooks/useMetricsData';
import { computeMetric, evaluateTarget, formatters } from '../../utils/computeMetric';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity,
  X,
  Settings,
  Info
} from 'lucide-react';

const MetricCard = ({ metric, value, status, onRemove }) => {
  const fmt = formatters[metric.formatter] || formatters.number;
  const formattedValue = fmt(value);

  const statusColors = {
    healthy: 'bg-green-500/15 text-green-300 border-green-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    danger:  'bg-red-500/15 text-red-300 border-red-500/30',
    neutral: 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  };

  const statusIcons = {
    healthy: <TrendingUp className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    danger:  <TrendingDown className="w-4 h-4" />,
    neutral: <Activity className="w-4 h-4" />
  };

  return (
    <div className="group relative bg-slate-800/60 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all">
      <button
        onClick={() => onRemove(metric.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded"
        aria-label={`Remove ${metric.label}`}
      >
        <X className="w-4 h-4 text-slate-400" />
      </button>

      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">{metric.category}</div>
          <div className="text-sm font-medium text-slate-200">{metric.label}</div>
        </div>
        <div className={`p-1.5 rounded-lg ${statusColors[status]}`}>
          {statusIcons[status]}
        </div>
      </div>

      <div className="text-2xl font-bold text-white mb-2">
        {formattedValue}
      </div>

      {metric.target && (
        <div className="text-xs text-slate-400">
          Target:{' '}
          {metric.target.min != null && metric.target.max != null
            ? `${metric.target.min}-${metric.target.max}`
            : metric.target.min != null
            ? `≥ ${metric.target.min}`
            : metric.target.max != null
            ? `≤ ${metric.target.max}`
            : '—'}
        </div>
      )}

      {metric.description && (
        <div className="mt-2 text-xs text-slate-500" title={metric.description}>
          <Info className="w-3 h-3 inline mr-1" />
          {metric.description}
        </div>
      )}
    </div>
  );
};

export default function DynamicMetrics() {
  const { 
    selectedForDashboard, 
    registry, 
    removeFromDashboard,
    initializeRegistry 
  } = useMetricsStore();

  // Pull live metric data (mapped from Weekly Entry / dashboard snapshot)
  const { loading, data, lastUpdated } = useMetricsData();

  // Ensure registry is populated on first mount
  useEffect(() => {
    if (!registry || Object.keys(registry).length === 0) {
      initializeRegistry?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-slate-400">Loading metrics...</span>
      </div>
    );
  }

  if (!selectedForDashboard?.length) {
    return (
      <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700 border-dashed">
        <Activity className="mx-auto h-12 w-12 text-slate-600 mb-3" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">No Metrics Selected</h3>
        <p className="text-sm text-slate-400 mb-4">
          Choose metrics from the catalog to display on your dashboard.
        </p>
        <button
          onClick={() => window.location.hash = '#metrics'}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configure Metrics
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-200">Dynamic Metrics</h2>
          {lastUpdated && (
            <span className="text-xs text-slate-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <button
          onClick={() => window.location.hash = '#metrics'}
          className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-1"
        >
          <Settings className="w-4 h-4" />
          Manage
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {selectedForDashboard.map((metricId) => {
          const metric = registry[metricId];
          if (!metric) return null;

          const value = computeMetric(metric.formula, data);
          const status = evaluateTarget(value, metric.target);

          return (
            <MetricCard
              key={metricId}
              metric={metric}
              value={value}
              status={status}
              onRemove={removeFromDashboard}
            />
          );
        })}
      </div>
    </div>
  );
}

