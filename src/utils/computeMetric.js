// src/utils/computeMetric.js
// Safe expression evaluator + helpers for targets & formatting.

export const formatters = {
  number: (v) => (v == null || Number.isNaN(v) ? '—' :
    Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(v)),
  pct: (v) => (v == null || Number.isNaN(v) ? '—' :
    `${(v * 100).toFixed(2)}%`),
  days: (v) => (v == null || Number.isNaN(v) ? '—' : `${Math.round(v)} days`),
  money: (v) => (v == null || Number.isNaN(v) ? '—' :
    Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)),
};

export function applyFormatter(value, formatterName) {
  const f = formatters[formatterName] || formatters.number;
  return f(value);
}

// Replace tokens in a simple arithmetic expression with numeric values and eval.
export function computeMetric(formula, data = {}) {
  if (!formula) return null;

  // Replace tokens with values (longest keys first to avoid partial matches)
  const tokens = Object.keys(data).sort((a, b) => b.length - a.length);
  let expr = `(${formula})`;
  for (const t of tokens) {
    const val = Number(data[t]);
    const safe = Number.isFinite(val) ? val : 0;
    expr = expr.replace(new RegExp(`\\b${t}\\b`, 'g'), String(safe));
  }

  // Whitelist for safety
  if (!/^[0-9+\-*/().\s]*$/.test(expr)) return null;

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${expr});`);
    const result = fn();
    return Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

// Determine status vs target.
// target may be {min?, max?} OR a function(value)=>boolean
export function evaluateTarget(value, target) {
  if (value == null || Number.isNaN(value)) return 'neutral';
  if (!target) return 'neutral';
  if (typeof target === 'function') return target(value) ? 'healthy' : 'danger';

  const { min, max } = target;
  if (min != null && max != null) {
    if (value < min) return 'warning';
    if (value > max) return 'warning';
    return 'healthy';
  }
  if (min != null) return value >= min ? 'healthy' : 'danger';
  if (max != null) return value <= max ? 'healthy' : 'danger';
  return 'neutral';
}
