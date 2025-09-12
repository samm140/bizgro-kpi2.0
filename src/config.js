// config.js - KPI 2.0 Financial System Configuration

const config = {
  // Application Branding
  app: {
    name: 'KPI 2.0',
    fullName: 'KPI 2.0 Financial System',
    company: 'BizGro Partners',
    logo: 'bizgro-kpi2.0-logo.png',
    favicon: '/favicon.ico',
    copyright: '© 2025 BizGro Partners, Inc. All rights reserved.'
  },

  // Authentication Settings
  auth: {
    // Google OAuth Configuration
    google: {
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
      allowedDomains: ['bizgropartners.com'], // Only allow these email domains
      autoSelect: false,
      cancelOnTapOutside: true
    },
    
    // Demo Account (remove in production)
    demo: {
      email: 'demo@bizgropartners.com',
      password: 'kpi2024',
      enabled: true // Set to false in production
    },
    
    // Session Settings
    session: {
      storagePrefix: 'kpi2_', // Prefix for localStorage keys
      rememberMe: true,
      timeout: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    }
  },

  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    timeout: 30000, // 30 seconds
    retry: 3
  },

  // Google Sheets Integration
  googleSheets: {
    enabled: process.env.REACT_APP_GOOGLE_SHEETS_ENABLED === 'true',
    sheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID || '',
    apiKey: process.env.REACT_APP_GOOGLE_API_KEY || ''
  },

  // Features Toggle
  features: {
    enhancedDashboard: true,
    googleOAuth: true,
    exportToExcel: true,
    exportToCSV: true,
    historicalData: true,
    insightsBoard: true,
    metricsCatalog: true,
    realTimeUpdates: true,
    keyboardShortcuts: true
  },

  // Dashboard Settings
  dashboard: {
    refreshInterval: 30000, // 30 seconds
    maxDataPoints: 10, // Maximum number of weeks to display
    defaultView: 'dashboard', // dashboard | entry | insights | historical | metrics
    chartColors: {
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#a855f7',
      warning: '#f59e0b',
      danger: '#ef4444',
      success: '#10b981'
    }
  },

  // Theme Configuration
  theme: {
    mode: 'dark', // dark | light
    colors: {
      primary: '#3b82f6',
      secondary: '#10b981',
      background: {
        main: 'from-slate-900 to-slate-800',
        card: 'slate-800/50',
        hover: 'slate-700/50'
      },
      text: {
        primary: 'gray-100',
        secondary: 'gray-400',
        muted: 'gray-500'
      },
      border: 'slate-700'
    }
  },

  // Metric Thresholds (for color coding)
  thresholds: {
    currentRatio: {
      good: 1.5,
      warning: 1.2,
      danger: 1.0
    },
    dso: {
      good: 45,
      warning: 60,
      danger: 90
    },
    grossMargin: {
      good: 30,
      warning: 25,
      danger: 20
    },
    collectionEfficiency: {
      good: 95,
      warning: 85,
      danger: 75
    },
    cashRunway: {
      good: 12, // weeks
      warning: 8,
      danger: 4
    }
  },

  // Export Settings
  export: {
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
    currency: 'USD',
    decimalPlaces: 2,
    fileName: {
      prefix: 'KPI2_',
      dateFormat: 'YYYY-MM-DD',
      includeTimestamp: true
    }
  },

  // Validation Rules
  validation: {
    email: {
      pattern: /^[a-zA-Z0-9._%+-]+@bizgropartners\.com$/,
      message: 'Please use a valid @bizgropartners.com email address'
    },
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    financialData: {
      maxValue: 999999999,
      minValue: -999999999,
      allowNegative: true,
      decimalPlaces: 2
    }
  },

  // Error Messages
  errors: {
    auth: {
      invalidCredentials: 'Invalid email or password',
      accountExists: 'An account with this email already exists',
      domainNotAllowed: 'Please use your @bizgropartners.com email address',
      sessionExpired: 'Your session has expired. Please sign in again.',
      googleSignInFailed: 'Google sign-in failed. Please try again or use email/password.'
    },
    data: {
      loadFailed: 'Failed to load data. Please refresh the page.',
      saveFailed: 'Failed to save data. Please try again.',
      exportFailed: 'Failed to export data. Please try again.',
      validationFailed: 'Please check your input and try again.'
    }
  },

  // Development Settings
  dev: {
    enableLogging: process.env.NODE_ENV === 'development',
    showDebugInfo: process.env.NODE_ENV === 'development',
    mockData: process.env.NODE_ENV === 'development',
    bypassAuth: false // Never set to true in production!
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  config.auth.demo.enabled = false;
  config.dev.bypassAuth = false;
  config.dev.mockData = false;
}

export default config;
