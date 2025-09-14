// src/utils/computeMetric.js

/**
 * Normalizes formatter names to standard keys
 * @param {string|null|undefined} name - The formatter name to normalize
 * @returns {string} Normalized formatter key
 */
export function normalizeFormatterName(name) {
  if (!name) return 'number';
  
  const n = String(name).toLowerCase().trim();
  
  // Map common aliases to standard formatter keys
  const aliasMap = {
    'percentage': 'pct',
    'percent': 'pct',
    'pct': 'pct',
    'currency': 'money',
    'money': 'money',
    'usd': 'money',
    'dollar': 'money',
    'dollars': 'money',
    'ratio': 'ratio',
    'x': 'ratio',
    'multiple': 'ratio',
    'months': 'months',
    'month': 'months',
    'mo': 'months',
    'days': 'days',
    'day': 'days',
    'd': 'days',
    'number': 'number',
    'num': 'number',
    'int': 'integer',
    'integer': 'integer',
    'boolean': 'boolean',
    'bool': 'boolean',
    'yes/no': 'boolean',
  };
  
  return aliasMap[n] || n;
}

/**
 * Collection of value formatters
 * Each formatter handles null/NaN values gracefully
 */
export const formatters = {
  number: (v) => {
    if (v == null || Number.isNaN(v)) return '—';
    return new Intl.NumberFormat(undefined, { 
      maximumFractionDigits: 2,
      minimumFractionDigits: 0 
    }).format(v);
  },
  
  integer: (v) => {
    if (v == null || Number.isNaN(v)) return '—';
    return new Intl.NumberFormat(undefined, { 
      maximumFractionDigits: 0 
    }).format(Math.round(v));
  },
  
  pct: (v) => {
    if (v == null || Number.isNaN(v)) return '—';
    const percentage = v * 100;
    // Handle very small percentages
    if (Math.abs(percentage) < 0.01 && percentage !== 0) {
      return '<0.01%';
    }
    return `${percentage.toFixed(2)}%`;
  },
  
  money: (v) => {
    if (v == null || Number.isNaN(v)) return '—';
    // Format based on magnitude
    const absValue = Math.abs(v);
    if (absValue >= 1e9) {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      }).format(v / 1e9).replace(/\.0$/, '') + 'B';
    } else if (absValue >= 1e6) {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      }).format(v / 1e6).replace(/\.0$/, '') + 'M';
    } else if (absValue >= 1e3) {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      }).format(v / 1e3).replace(/\.0$/, '') + 'K';
    }
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: absValue < 10 ? 2 : 0,
    }).format(v);
  },
  
  days: (v) => {
    if (v == null || Number.isNaN(v)) return '—';
    const days = Math.round(v);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    if (days === -1) return 'Yesterday';
    if (days < 0) return `${Math.abs(days)} days ago`;
    return `${days} days`;
  },
  
  ratio: (v) => {
    if (v == null || Number.isNaN(v)) return '—';
    return `${new Intl.NumberFormat(undefined, { 
      maximumFractionDigits: 2,
      minimumFractionDigits: 0 
    }).format(v)}x`;
  },
  
  months: (v) => {
    if (v == null || Number.isNaN(v)) return '—';
    const months = Number(v);
    if (months === 1) return '1 month';
    if (months < 1 && months > 0) {
      const days = Math.round(months * 30);
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${new Intl.NumberFormat(undefined, { 
      maximumFractionDigits: 1,
      minimumFractionDigits: 0 
    }).format(months)} months`;
  },
  
  boolean: (v) => {
    if (v == null || Number.isNaN(v)) return '—';
    return v ? 'Yes' : 'No';
  }
};

/**
 * Applies a formatter to a value
 * @param {number|null|undefined} value - The value to format
 * @param {string} formatterName - The name of the formatter to use
 * @returns {string} Formatted value
 */
export function applyFormatter(value, formatterName) {
  const key = normalizeFormatterName(formatterName);
  const formatter = formatters[key] || formatters.number;
  return formatter(value);
}

/**
 * Validates that an expression contains only safe mathematical operations
 * @param {string} expr - The expression to validate
 * @returns {boolean} True if expression is safe
 */
function isSafeMathExpression(expr) {
  // Remove all whitespace for easier validation
  const cleaned = expr.replace(/\s+/g, '');
  
  // Check for only allowed characters
  if (!/^[\d+\-*/().\s]+$/.test(expr)) return false;
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    /[+\-*/]{3,}/,        // Triple operators
    /\(\)/,               // Empty parentheses
    /\d+\.\d+\.\d+/,      // Multiple decimal points
    /^[*/]/,              // Starting with multiply/divide
    /[*/]$/,              // Ending with operator
    /\)[^+\-*/()]/,       // Invalid character after closing paren
    /[^+\-*/()]\(/,       // Invalid character before opening paren
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(cleaned));
}

/**
 * Safely evaluates a mathematical expression
 * @param {string} expr - The expression to evaluate
 * @returns {number|null} The result or null if evaluation fails
 */
function safeEval(expr) {
  if (!isSafeMathExpression(expr)) return null;
  
  try {
    // Additional safety: wrap in parseFloat to ensure numeric result
    // eslint-disable-next-line no-new-func
    const fn = new Function(`
      "use strict";
      const result = ${expr};
      if (typeof result !== 'number') return null;
      return result;
    `);
    const result = fn();
    return Number.isFinite(result) ? result : null;
  } catch (error) {
    console.warn('Expression evaluation failed:', error.message);
    return null;
  }
}

/**
 * Computes a metric value from a formula and data
 * @param {string} formula - Mathematical formula with variable placeholders
 * @param {Object.<string, number>} data - Variable values to substitute
 * @returns {number|null} Computed result or null if invalid
 * 
 * @example
 * computeMetric('revenue / costs', { revenue: 1000, costs: 200 }) // Returns 5
 * computeMetric('(a + b) * c', { a: 10, b: 20, c: 2 }) // Returns 60
 */
export function computeMetric(formula, data = {}) {
  if (!formula || typeof formula !== 'string') return null;
  
  // Create a map of tokens sorted by length (longest first)
  const tokens = Object.keys(data)
    .filter(key => key && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) // Valid identifier names only
    .sort((a, b) => b.length - a.length);
  
  // Start with the formula wrapped in parentheses for safety
  let expr = `(${formula})`;
  
  // Replace tokens with their numeric values
  for (const token of tokens) {
    const value = Number(data[token]);
    // Use 0 for non-finite values, but track if we had any
    const safeValue = Number.isFinite(value) ? value : 0;
    
    // Use word boundaries to avoid partial replacements
    // Escape special regex characters in token name
    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    expr = expr.replace(
      new RegExp(`\\b${escapedToken}\\b`, 'g'), 
      `(${safeValue})`
    );
  }
  
  return safeEval(expr);
}

/**
 * Target configuration for metric evaluation
 * @typedef {Object} TargetConfig
 * @property {number} [min] - Minimum acceptable value
 * @property {number} [max] - Maximum acceptable value
 * @property {number} [warningBuffer] - Percentage buffer for warning zone (default: 0.1 = 10%)
 */

/**
 * Evaluates a metric value against target thresholds
 * @param {number|null|undefined} value - The metric value to evaluate
 * @param {TargetConfig|Function|null} target - Target configuration or evaluation function
 * @returns {'healthy'|'warning'|'danger'|'neutral'} Evaluation result
 * 
 * @example
 * evaluateTarget(85, { min: 80, max: 100 }) // Returns 'healthy'
 * evaluateTarget(75, { min: 80, max: 100, warningBuffer: 0.05 }) // Returns 'warning'
 * evaluateTarget(50, v => v > 60) // Returns 'danger'
 */
export function evaluateTarget(value, target) {
  // Handle invalid inputs
  if (value == null || Number.isNaN(value) || !target) {
    return 'neutral';
  }
  
  // Handle function-based targets
  if (typeof target === 'function') {
    try {
      return target(value) ? 'healthy' : 'danger';
    } catch (error) {
      console.warn('Target function evaluation failed:', error.message);
      return 'neutral';
    }
  }
  
  // Handle object-based targets
  const { min, max, warningBuffer = 0.1 } = target;
  
  // Both min and max defined - range check with warning zones
  if (min != null && max != null) {
    const range = max - min;
    const warningZone = range * warningBuffer;
    
    // Danger zones (completely out of range)
    if (value < min - warningZone || value > max + warningZone) {
      return 'danger';
    }
    
    // Warning zones (slightly out of range)
    if (value < min || value > max) {
      return 'warning';
    }
    
    // Warning zones (close to boundaries)
    if (value < min + warningZone || value > max - warningZone) {
      return 'warning';
    }
    
    return 'healthy';
  }
  
  // Only minimum defined
  if (min != null) {
    const warningThreshold = min * (1 - warningBuffer);
    if (value < warningThreshold) return 'danger';
    if (value < min) return 'warning';
    return 'healthy';
  }
  
  // Only maximum defined
  if (max != null) {
    const warningThreshold = max * (1 + warningBuffer);
    if (value > warningThreshold) return 'danger';
    if (value > max) return 'warning';
    return 'healthy';
  }
  
  return 'neutral';
}

/**
 * Batch computes multiple metrics
 * @param {Object.<string, string>} formulas - Map of metric names to formulas
 * @param {Object.<string, number>} data - Variable values
 * @returns {Object.<string, number|null>} Computed metrics
 */
export function computeMetrics(formulas, data = {}) {
  const results = {};
  for (const [name, formula] of Object.entries(formulas)) {
    results[name] = computeMetric(formula, data);
  }
  return results;
}

/**
 * Creates a formatted metric display with evaluation
 * @param {number|null} value - The metric value
 * @param {Object} options - Display options
 * @param {string} options.formatter - Formatter name
 * @param {TargetConfig} options.target - Target configuration
 * @param {string} options.label - Metric label
 * @returns {Object} Formatted metric with metadata
 */
export function createMetricDisplay(value, options = {}) {
  const { formatter = 'number', target = null, label = '' } = options;
  
  return {
    label,
    value,
    formatted: applyFormatter(value, formatter),
    status: evaluateTarget(value, target),
    timestamp: new Date().toISOString()
  };
}
