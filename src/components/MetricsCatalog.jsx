// src/components/MetricsCatalog.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useMetricsStore } from '../state/metricsStore'; // ← fix: was "@/state/metricsStore"

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

function CatalogCard({ metric, isSelected, onToggle }) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-slate-200 font-medium">{metric.label}</div>
          <div className="text-xs text-slate-400 mt-1">{metric.category} • {metric.key}</div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span className="text-slate-500">Formula:</span> {metric.formula}
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
            isSelected ? 'bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
                       : 'bg-sky-500/15 text-sky-200 hover:bg-sky-500/25'
          }`}
        >
          {isSelected ? 'On Dashboard' : 'Add to Dashboard'}
        </button>
      </div>
    </div>
  );
}

export default function MetricsCatalog() {
  const { registry, setRegistry, selectedForDashboard, addToDashboard, removeFromDashboard } = useMetricsStore();
  const [query, setQuery] = useState('');

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-200">Metrics Catalog</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search metrics…"
          className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-6">
        {categories.map(([cat, items]) => (
          <section key={cat}>
            <div className="text-slate-300 text-sm mb-2">{cat}</div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((metric) => {
                const isSelected = selectedForDashboard.includes(metric.id);
                return (
                  <CatalogCard
                    key={metric.id}
                    metric={metric}
                    isSelected={isSelected}
                    onToggle={() => (isSelected ? removeFromDashboard(metric.id) : addToDashboard(metric.id))}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

