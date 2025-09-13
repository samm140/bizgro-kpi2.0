// src/utils/computeMetric.js
export function normalizeFormatterName(name) {
  if (!name) return 'number';
  const n = String(name).toLowerCase();
  if (n === 'percentage' || n === 'percent' || n === 'pct') return 'pct';
  if (n === 'currency' || n === 'money' || n === 'usd') return 'money';
  if (n === 'ratio' || n === 'x') return 'ratio';
  if (n === 'months' || n === 'month' || n === 'mo') return 'months';
  if (n === 'days' || n === 'day') return 'days';
  if (n === 'number' || n === 'num') return 'number';
  return n;
}

export const formatters = {
  number: (v) => (v == null || Number.isNaN(v) ? '—' :
    Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(v)),
  pct: (v) => (v == null || Number.isNaN(v) ? '—' :
    `${(v * 100).toFixed(2)}%`),
  money: (v) => (v == null || Number.isNaN(v) ? '—' :
    Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)),
  days: (v) => (v == null || Number.isNaN(v) ? '—' : `${Math.round(v)} days`),
  ratio: (v) => (v == null || Number.isNaN(v) ? '—' :
    `${Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(v)}x`),
  months: (v) => (v == null || Number.isNaN(v) ? '—' :
    `${Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(v)} mo`),
};

export function applyFormatter(value, formatterName) {
  const key = normalizeFormatterName(formatterName);
  const f = formatters[key] || formatters.number;
  return f(value);
}

export function computeMetric(formula, data = {}) {
  if (!formula) return null;
  const tokens = Object.keys(data).sort((a, b) => b.length - a.length);
  let expr = `(${formula})`;
  for (const t of tokens) {
    const val = Number(data[t]);
    const safe = Number.isFinite(val) ? val : 0;
    expr = expr.replace(new RegExp(`\\b${t}\\b`, 'g'), String(safe));
  }
  // Expression must be pure math after replacements
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

export function evaluateTarget(value, target) {
  if (value == null || Number.isNaN(value) || !target) return 'neutral';
  if (typeof target === 'function') return target(value) ? 'healthy' : 'danger';
  const { min, max } = target;
  if (min != null && max != null) {
    if (value < min || value > max) return 'warning';
    return 'healthy';
  }
  if (min != null) return value >= min ? 'healthy' : 'danger';
  if (max != null) return value <= max ? 'healthy' : 'danger';
  return 'neutral';
}
