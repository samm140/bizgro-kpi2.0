// src/components/MetricsCatalog.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useMetricsStore } from '@/state/metricsStore';
import DynamicMetrics from '@/components/dashboard/DynamicMetrics';

const formatters = {
  pct: (v) => (v == null ? '—' : `${(v * 100).toFixed(2)}%`),
  money: (v) =>
    v == null
      ? '—'
      : Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v),
  days: (v) => (v == null ? '—' : `${Math.round(v)} days`),
};

// Example built-in catalog; in production, fetch from /api/metrics
const DEFAULT_CATALOG = [
  {
    id: 'LIQ001',
    key: 'current_ratio_ops',
    label: 'Current Ratio (Ops)',
    category: 'Liquidity',
    formula: '(CashBank + CashOB + CurrentAR) / CurrentAP',
    target: { min: 1.5, max: 2.0 },
  },
  {
    id: 'LIQ002',
    key: 'quick_ratio',
    label: 'Quick Ratio',
    category: 'Liquidity',
    formula: '(CashBank + CashOB + (CurrentAR - Retention)) / CurrentAP',
    target: (v) => v >= 1.0,
  },
  {
    id: 'LIQ003',
    key: 'cash_ratio',
    label: 'Cash Ratio',
    category: 'Liquidity',
    formula: '(CashBank + CashOB) / CurrentAP',
    target: (v) => v >= 0.5,
  },
  {
    id: 'COL001',
    key: 'collections_to_billings',
    label: 'Collections / Billings',
    category: 'AR / Collections',
    formula: 'Collections / RevenueBilledToDate',
    target: (v) => v >= 0.9,
    formatterName: 'pct',
  },
  {
    id: 'PROF001',
    key: 'gross_margin_week',
    label: 'Gross Margin (Week)',
    category: 'Profitability',
    formula: 'GrossProfitAccrual / RevenueBilledToDate',
    target: (v) => v >= 0.25,
    formatterName: 'pct',
  },
  {
    id: 'AR001',
    key: 'overdue_ar_weight',
    label: 'Overdue AR Weight',
    category: 'AR / Collections',
    formula: 'OverdueAR / CurrentAR',
    target: (v) => v <= 0.15,
    formatterName: 'pct',
  },
];

function CatalogCard({
  metric,
  isSelected,
  onToggle,
  selectMode,
  checked,
  onSelectToggle,
  onDragStart,
  onDragEnd,
}) {
  return (
    <div
      className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 relative"
      draggable={!isSelected}                 // draggable only if not already added
      onDragStart={(e) => !isSelected && onDragStart(e, metric.id)}
      onDragEnd={(e) => onDragEnd(e)}
    >
      {/* Optional selection checkbox support (kept – can be hidden if you don’t need it) */}
      {selectMode && (
        <label className="absolute top-3 left-3 inline-flex items-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={!!checked}
            onChange={() => onSelectToggle(metric.id)}
            className="h-4 w-4 rounded border-slate-500 bg-slate-800"
          />
          Select
        </label>
      )}

      <div className="flex items-start justify-between">
        <div className={`${selectMode ? 'pl-6' : ''}`}>
          <div className="text-slate-200 font-medium">{metric.label}</div>
          <div className="text-xs text-slate-400 mt-1">{metric.category} • {metric.key}</div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span className="text-slate-500">Formula:</span> {metric.formula}
          </div>

          {!isSelected && (
            <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
              Draggable
            </span>
          )}
        </div>

        <button
          onClick={onToggle}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
            isSelected ? 'bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
                       : 'bg-sky-500/15 text-sky-200 hover:bg-sky-500/25'
          }`}
          title={isSelected ? 'Remove from dashboard' : 'Add to dashboard'}
        >
          {isSelected ? <i className="fas fa-star" /> : <i className="far fa-star" />}
          {isSelected ? 'On Dashboard' : 'Add'}
        </button>
      </div>
    </div>
  );
}

export default function MetricsCatalog() {
  const {
    registry,
    setRegistry,
    selectedForDashboard,
    addToDashboard,
    removeFromDashboard,
  } = useMetricsStore();

  const [query, setQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // DnD visual state for the drop zone
  const [isDropping, setIsDropping] = useState(false);

  // Boot registry once (could be replaced by fetch to /api/metrics)
  useEffect(() => {
    if (!registry || Object.keys(registry).length === 0) {
      const reg = {};
      for (const m of DEFAULT_CATALOG) {
        reg[m.id] = { ...m, formatter: m.formatterName ? formatters[m.formatterName] : null };
      }
      setRegistry(reg);
    }
  }, [registry, setRegistry]);

  const list = useMemo(() => Object.values(registry || {}), [registry]);

  const categories = useMemo(() => {
    const m = new Map();
    for (const item of list) {
      if (query && !(`${item.label} ${item.key} ${item.category}`.toLowerCase().includes(query.toLowerCase()))) continue;
      if (!m.has(item.category)) m.set(item.category, []);
      m.get(item.category).push(item);
    }
    return Array.from(m.entries());
  }, [list, query]);

  // ----- Select mode helpers (optional but preserved) -----
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const bulkAdd = () => {
    selectedIds.forEach((id) => {
      if (!selectedForDashboard.includes(id)) addToDashboard(id);
    });
    clearSelection();
    setSelectMode(false);
  };
  const bulkRemove = () => {
    selectedIds.forEach((id) => {
      if (selectedForDashboard.includes(id)) removeFromDashboard(id);
    });
    clearSelection();
    setSelectMode(false);
  };

  // ----- Drag & drop handlers -----
  const handleDragStart = useCallback((e, id) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'copy';
    e.currentTarget.classList.add('opacity-60', 'ring', 'ring-sky-500/40');
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.currentTarget.classList.remove('opacity-60', 'ring', 'ring-sky-500/40');
  }, []);

  const handleDropOver = useCallback((e) => {
    e.preventDefault();
    setIsDropping(true);
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDropLeave = useCallback(() => setIsDropping(false), []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDropping(false);
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    if (!selectedForDashboard.includes(id)) addToDashboard(id);
  }, [addToDashboard, selectedForDashboard]);

  return (
    <div className="space-y-6">
      {/* Header + toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-200">Metrics Catalog</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectMode(!selectMode); if (selectMode) clearSelection(); }}
            className={`px-3 py-2 rounded-lg text-sm ${
              selectMode ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
            title="Multi-select metrics"
          >
            {selectMode ? 'Exit Select' : 'Select'}
          </button>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search metrics…"
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Split view: Catalog (left) + Live Preview / Drop Zone (right) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Catalog */}
        <div className="space-y-6">
          {selectMode && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 flex items-center gap-2">
              <span className="text-sm text-slate-300">
                Selected: <span className="font-semibold text-white">{selectedIds.size}</span>
              </span>
              <div className="h-4 w-px bg-slate-700 mx-1" />
              <button
                onClick={bulkAdd}
                className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-sm disabled:opacity-50"
                disabled={selectedIds.size === 0}
              >
                Add Selected to Dashboard
              </button>
              <button
                onClick={bulkRemove}
                className="px-3 py-1.5 rounded bg-rose-600 text-white hover:bg-rose-700 text-sm disabled:opacity-50"
                disabled={selectedIds.size === 0}
              >
                Remove Selected
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 rounded bg-slate-700 text-slate-200 hover:bg-slate-600 text-sm"
              >
                Clear
              </button>
            </div>
          )}

          <div className="grid gap-6">
            {categories.map(([cat, items]) => (
              <section key={cat}>
                <div className="text-slate-300 text-sm mb-2">{cat}</div>
                <div className="grid gap-3 md:grid-cols-2">
                  {items.map((metric) => {
                    const isSelected = selectedForDashboard.includes(metric.id);
                    return (
                      <CatalogCard
                        key={metric.id}
                        metric={metric}
                        isSelected={isSelected}
                        onToggle={() =>
                          isSelected ? removeFromDashboard(metric.id) : addToDashboard(metric.id)
                        }
                        selectMode={selectMode}
                        checked={selectedIds.has(metric.id)}
                        onSelectToggle={toggleSelect}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Right: Drop Zone + Live Preview */}
        <div>
          <div
            onDragOver={handleDropOver}
            onDragLeave={handleDropLeave}
            onDrop={handleDrop}
            className={`mb-4 rounded-xl border-2 border-dashed transition-all ${
              isDropping ? 'border-sky-500 bg-sky-500/5' : 'border-slate-700 bg-slate-800/30'
            }`}
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="text-slate-300 text-sm">
                <i className="fas fa-hand-pointer mr-2 text-sky-400" />
                Drag metrics here (or click ⭐ in the catalog)
              </div>
              <div className="text-xs text-slate-500">
                {selectedForDashboard.length} selected
              </div>
            </div>
          </div>

          {/* Live preview uses your existing DynamicMetrics, so values come from Weekly Entry data */}
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-200 font-semibold">Live Dashboard Preview</h3>
              <button
                onClick={() => (window.location.hash = '#dashboard')}
                className="px-3 py-1.5 rounded bg-slate-700 text-slate-200 hover:bg-slate-600 text-xs"
                title="Go to Dashboard"
              >
                View on Dashboard
              </button>
            </div>
            <DynamicMetrics />
          </div>
        </div>
      </div>
    </div>
  );
}

