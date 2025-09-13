// Formatters for different metric types
export const formatters = {
  ratio: (v) => v == null ? '—' : v.toFixed(2),
  percentage: (v) => v == null ? '—' : `${v.toFixed(1)}%`,
  currency: (v) => v == null ? '—' : new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(v),
  days: (v) => v == null ? '—' : `${Math.round(v)} days`,
  months: (v) => v == null ? '—' : `${v.toFixed(1)} months`,
  number: (v) => v == null ? '—' : new Intl.NumberFormat().format(Math.round(v))
};

export function computeMetric(formula, data = {}) {
  if (!formula) return null;
  
  try {
    // Create a safe evaluation context
    const safeData = {};
    Object.keys(data).forEach(key => {
      const value = Number(data[key]);
      safeData[key] = Number.isFinite(value) ? value : 0;
    });
    
    // Replace formula tokens with values
    let expression = formula;
    
    // Sort keys by length (longest first) to avoid partial replacements
    const keys = Object.keys(safeData).sort((a, b) => b.length - a.length);
    
    keys.forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      expression = expression.replace(regex, safeData[key]);
    });
    
    // Validate expression contains only safe characters
    if (!/^[0-9+\-*/().\s]*$/.test(expression)) {
      console.warn('Unsafe formula expression:', expression);
      return null;
    }
    
    // Evaluate the expression
    const result = Function('"use strict"; return (' + expression + ')')();
    
    return Number.isFinite(result) ? result : null;
  } catch (error) {
    console.error('Metric computation error:', error, 'Formula:', formula);
    return null;
  }
}

export function evaluateTarget(value, target) {
  if (value == null || !target) return 'neutral';
  
  if (typeof target === 'function') {
    return target(value) ? 'healthy' : 'warning';
  }
  
  if (target.min !== undefined && target.max !== undefined) {
    if (value >= target.min && value <= target.max) return 'healthy';
    if (value < target.min * 0.8 || value > target.max * 1.2) return 'danger';
    return 'warning';
  }
  
  if (target.min !== undefined) {
    if (value >= target.min) return 'healthy';
    if (value < target.min * 0.8) return 'danger';
    return 'warning';
  }
  
  if (target.max !== undefined) {
    if (value <= target.max) return 'healthy';
    if (value > target.max * 1.2) return 'danger';
    return 'warning';
  }
  
  return 'neutral';
}
