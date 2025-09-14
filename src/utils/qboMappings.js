// QuickBooks Online to BizGro Field Mappings
export const qboFieldMappings = {
  accounts: {
    'Accounts Receivable': {
      bizgroField: 'currentAR',
      category: 'accounting',
      refreshRate: 'real-time'
    },
    'Retention Receivable': {
      bizgroField: 'retentionReceivables',
      category: 'accounting',
      refreshRate: 'real-time'
    },
    'Accounts Payable': {
      bizgroField: 'currentAP',
      category: 'accounting',
      refreshRate: 'real-time'
    },
    'Petty Cash': {
      bizgroField: 'cashOnHand',
      category: 'accounting',
      refreshRate: 'real-time'
    },
    'Checking': {
      bizgroField: 'cashInBank',
      category: 'accounting',
      refreshRate: 'real-time'
    },
    'Line of Credit': {
      bizgroField: 'locDrawn',
      category: 'accounting',
      refreshRate: 'real-time'
    },
    'Savings': {
      bizgroField: 'savingsAccount',
      category: 'accounting',
      refreshRate: 'real-time'
    }
  },
  
  reports: {
    profitLoss: {
      'Total Income': 'revenueBilledYTD',
      'Total COGS': 'totalCOGS',
      'Gross Profit': 'grossProfit',
      'Total Expenses': 'totalExpenses',
      'Net Income': 'netIncome'
    },
    
    arAging: {
      'Current': 'arCurrent',
      '1-30': 'ar30Days',
      '31-60': 'ar60Days',
      '61-90': 'ar90Days',
      'Over 90': 'arOver90'
    }
  },
  
  customFields: {
    'Project Status': {
      bizgroField: 'projectStatus',
      values: ['Not Started', 'In Progress', 'Complete']
    },
    'Retention Percentage': {
      bizgroField: 'retentionPercentage',
      dataType: 'number'
    },
    'Project Type': {
      bizgroField: 'projectType',
      values: ['Masonry', 'Stucco', 'Masonry/Stucco', 'Other']
    }
  }
};

// Variance thresholds for alerts
export const varianceThresholds = {
  critical: 15,  // Percentage variance requiring immediate attention
  warning: 10,   // Percentage variance requiring review
  normal: 5      // Expected variance range
};

// Sync configuration
export const syncConfig = {
  realTime: ['cashOnHand', 'cashInBank', 'currentAR', 'currentAP'],
  daily: ['revenueBilledYTD', 'grossProfit', 'projectStatus'],
  weekly: ['backlog', 'wipAmount', 'employeeCount']
};
