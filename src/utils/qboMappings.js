// utils/qboMappings.js - QuickBooks Online Field Mapping Configuration

// Field mappings between BizGro and QuickBooks
export const qboFieldMappings = {
  // Balance Sheet Accounts
  accounts: {
    'Accounts Receivable': {
      bizgroField: 'currentAR',
      category: 'asset',
      refreshRate: 'real-time',
      dbColumn: 'current_ar'
    },
    'Retention Receivable': {
      bizgroField: 'retentionReceivables',
      category: 'asset',
      refreshRate: 'real-time',
      dbColumn: 'retention_receivables'
    },
    'Accounts Payable': {
      bizgroField: 'currentAP',
      category: 'liability',
      refreshRate: 'real-time',
      dbColumn: 'current_ap'
    },
    'Petty Cash': {
      bizgroField: 'cashOnHand',
      category: 'asset',
      refreshRate: 'real-time',
      dbColumn: 'cash_on_hand'
    },
    'Checking': {
      bizgroField: 'cashInBank',
      category: 'asset',
      refreshRate: 'real-time',
      dbColumn: 'cash_in_bank'
    },
    'Savings': {
      bizgroField: 'savingsAccount',
      category: 'asset',
      refreshRate: 'real-time',
      dbColumn: 'savings_account'
    },
    'Line of Credit': {
      bizgroField: 'locDrawn',
      category: 'liability',
      refreshRate: 'real-time',
      dbColumn: 'loc_drawn'
    },
    'Work in Progress': {
      bizgroField: 'wipAmount',
      category: 'asset',
      refreshRate: 'daily',
      dbColumn: 'wip_amount'
    }
  },

  // Income Statement Mappings
  incomeStatement: {
    'Sales': {
      bizgroField: 'revenueBilledNet',
      category: 'income',
      refreshRate: 'daily',
      dbColumn: 'revenue_billed_net'
    },
    'Cost of Goods Sold': {
      bizgroField: 'cogsAccrual',
      category: 'expense',
      refreshRate: 'daily',
      dbColumn: 'cogs_accrual'
    },
    'Gross Wages': {
      bizgroField: 'grossWagesAccrual',
      category: 'expense',
      refreshRate: 'daily',
      dbColumn: 'gross_wages_accrual'
    },
    'Subcontractor Costs': {
      bizgroField: 'subsAmount',
      category: 'expense',
      refreshRate: 'weekly',
      dbColumn: 'subs_amount'
    }
  },

  // Calculated Fields
  calculated: {
    grossProfitAccrual: {
      formula: 'revenueBilledNet - cogsAccrual',
      dbColumn: 'gross_profit_accrual'
    },
    gpmAccrual: {
      formula: '(grossProfitAccrual / revenueBilledNet) * 100',
      dbColumn: 'gpm_accrual'
    },
    totalCash: {
      formula: 'cashOnHand + cashInBank + savingsAccount',
      dbColumn: null // Not stored, calculated on the fly
    },
    currentRatio: {
      formula: 'currentAR / currentAP',
      dbColumn: null
    },
    locUtilization: {
      formula: '(locDrawn / locLimit) * 100',
      dbColumn: null
    }
  },

  // Custom Fields (need to be created in QBO)
  customFields: {
    'CF:Retention Percentage': {
      bizgroField: 'retentionPercentage',
      dataType: 'number',
      dbColumn: null
    },
    'CF:Project Status': {
      bizgroField: 'projectStatus',
      dataType: 'list',
      values: ['Not Started', 'In Progress', 'Complete'],
      dbColumn: null
    },
    'CF:Project Type': {
      bizgroField: 'projectType',
      dataType: 'list',
      values: ['Masonry', 'Stucco', 'Masonry/Stucco', 'Other'],
      dbColumn: null
    },
    'CF:Worker Comp Mod': {
      bizgroField: 'workersCompMod',
      dataType: 'number',
      dbColumn: 'workers_comp_mod'
    }
  },

  // Report Mappings
  reports: {
    profitLoss: {
      'Total Income': 'revenueBilledNet',
      'Total COGS': 'cogsAccrual',
      'Gross Profit': 'grossProfitAccrual',
      'Total Expenses': 'totalExpenses',
      'Net Income': 'netIncome'
    },
    balanceSheet: {
      'Total Current Assets': 'totalCurrentAssets',
      'Total Fixed Assets': 'totalFixedAssets',
      'Total Current Liabilities': 'totalCurrentLiabilities',
      'Total Long Term Liabilities': 'totalLongTermLiabilities',
      'Total Equity': 'totalEquity'
    },
    arAging: {
      'Current': 'arCurrent',
      '1-30': 'ar30Days',
      '31-60': 'ar60Days',
      '61-90': 'ar90Days',
      'Over 90': 'arOver90'
    },
    apAging: {
      'Current': 'apCurrent',
      '1-30': 'ap30Days',
      '31-60': 'ap60Days',
      '61-90': 'ap90Days',
      'Over 90': 'apOver90'
    }
  },

  // Entity Mappings
  entities: {
    Customer: {
      bizgroEntity: 'jobs',
      fields: {
        'DisplayName': 'jobName',
        'Balance': 'jobBalance',
        'Active': 'jobActive',
        'Job': 'isJob'
      }
    },
    Vendor: {
      bizgroEntity: 'contractors',
      fields: {
        'DisplayName': 'contractorName',
        'Balance': 'contractorBalance',
        'Vendor1099': 'is1099',
        'Active': 'contractorActive'
      }
    },
    Employee: {
      bizgroEntity: 'employees',
      fields: {
        'DisplayName': 'employeeName',
        'Active': 'employeeActive',
        'EmployeeType': 'employeeType'
      }
    },
    Invoice: {
      bizgroEntity: 'invoices',
      fields: {
        'DocNumber': 'invoiceNumber',
        'TotalAmt': 'invoiceAmount',
        'Balance': 'invoiceBalance',
        'TxnDate': 'invoiceDate',
        'DueDate': 'dueDate'
      }
    },
    Estimate: {
      bizgroEntity: 'estimates',
      fields: {
        'DocNumber': 'estimateNumber',
        'TotalAmt': 'estimateAmount',
        'TxnStatus': 'estimateStatus',
        'TxnDate': 'estimateDate'
      }
    }
  }
};

// Variance thresholds for different field types
export const varianceThresholds = {
  // Financial fields
  currentAR: { warning: 10, critical: 15 },
  currentAP: { warning: 10, critical: 15 },
  cashInBank: { warning: 5, critical: 10 },
  cashOnHand: { warning: 5, critical: 10 },
  savingsAccount: { warning: 5, critical: 10 },
  
  // Revenue fields
  revenueBilledNet: { warning: 15, critical: 20 },
  collections: { warning: 15, critical: 20 },
  grossProfitAccrual: { warning: 10, critical: 15 },
  gpmAccrual: { warning: 5, critical: 10 },
  
  // Project fields
  backlogAmount: { warning: 20, critical: 30 },
  wipAmount: { warning: 15, critical: 25 },
  
  // Credit fields
  locDrawn: { warning: 5, critical: 10 },
  
  // Default for unmapped fields
  default: { warning: 10, critical: 15 }
};

// Sync configuration
export const syncConfig = {
  // Fields that should sync in real-time (via webhooks)
  realTimeFields: [
    'currentAR',
    'currentAP',
    'cashOnHand',
    'cashInBank',
    'savingsAccount',
    'locDrawn'
  ],
  
  // Fields that sync daily
  dailyFields: [
    'revenueBilledNet',
    'grossProfitAccrual',
    'cogsAccrual',
    'collections',
    'wipAmount'
  ],
  
  // Fields that sync weekly
  weeklyFields: [
    'backlogAmount',
    'backlogCount',
    'jobsWonAmount',
    'jobsWonCount',
    'fieldW2Amount',
    'subsAmount'
  ],
  
  // Fields that are manually entered only (no QBO sync)
  manualOnlyFields: [
    'invitesExistingGC',
    'invitesNewGC',
    'newEstimatedJobs',
    'concentrationRisk',
    'newHires',
    'employeesFired'
  ]
};

// Field validation rules
export const fieldValidation = {
  // Percentage fields (0-100)
  percentageFields: [
    'gpmAccrual',
    'concentrationRisk',
    'locUtilization'
  ],
  
  // Currency fields (positive values only)
  currencyFields: [
    'currentAR',
    'currentAP',
    'cashInBank',
    'cashOnHand',
    'savingsAccount',
    'revenueBilledNet',
    'grossProfitAccrual',
    'collections',
    'backlogAmount',
    'wipAmount',
    'locDrawn',
    'locLimit'
  ],
  
  // Integer fields
  integerFields: [
    'jobsWonCount',
    'jobsStartedCount',
    'backlogCount',
    'wipCount',
    'fieldW2Count',
    'subsCount',
    'invitesExistingGC',
    'invitesNewGC',
    'newEstimatedJobs',
    'jobsCompleted',
    'supervisors',
    'office',
    'newHires',
    'employeesFired'
  ],
  
  // Decimal fields (2 decimal places)
  decimalFields: [
    'workersCompMod'
  ],
  
  // Required fields
  requiredFields: [
    'weekEnding'
  ]
};

// Helper functions for field mapping
export const getMappedQBOField = (bizgroField) => {
  // Check accounts
  for (const [qboName, mapping] of Object.entries(qboFieldMappings.accounts)) {
    if (mapping.bizgroField === bizgroField) {
      return { qboName, ...mapping };
    }
  }
  
  // Check income statement
  for (const [qboName, mapping] of Object.entries(qboFieldMappings.incomeStatement)) {
    if (mapping.bizgroField === bizgroField) {
      return { qboName, ...mapping };
    }
  }
  
  // Check custom fields
  for (const [qboName, mapping] of Object.entries(qboFieldMappings.customFields)) {
    if (mapping.bizgroField === bizgroField) {
      return { qboName, ...mapping };
    }
  }
  
  return null;
};

export const getVarianceThreshold = (fieldName) => {
  return varianceThresholds[fieldName] || varianceThresholds.default;
};

export const isRealTimeField = (fieldName) => {
  return syncConfig.realTimeFields.includes(fieldName);
};

export const isManualOnlyField = (fieldName) => {
  return syncConfig.manualOnlyFields.includes(fieldName);
};

export const validateField = (fieldName, value) => {
  const errors = [];
  
  // Check required
  if (fieldValidation.requiredFields.includes(fieldName) && !value) {
    errors.push(`${fieldName} is required`);
  }
  
  // Check percentage range
  if (fieldValidation.percentageFields.includes(fieldName)) {
    const numValue = parseFloat(value);
    if (numValue < 0 || numValue > 100) {
      errors.push(`${fieldName} must be between 0 and 100`);
    }
  }
  
  // Check positive currency
  if (fieldValidation.currencyFields.includes(fieldName)) {
    const numValue = parseFloat(value);
    if (numValue < 0) {
      errors.push(`${fieldName} must be a positive value`);
    }
  }
  
  // Check integer
  if (fieldValidation.integerFields.includes(fieldName)) {
    if (value && !Number.isInteger(Number(value))) {
      errors.push(`${fieldName} must be a whole number`);
    }
  }
  
  return errors;
};

// Export utility for batch field mapping
export const mapBizGroToQBO = (bizgroData) => {
  const qboData = {};
  
  for (const [field, value] of Object.entries(bizgroData)) {
    const mapping = getMappedQBOField(field);
    if (mapping && !isManualOnlyField(field)) {
      qboData[mapping.qboName] = value;
    }
  }
  
  return qboData;
};

// Export utility for reverse mapping (QBO to BizGro)
export const mapQBOToBizGro = (qboData) => {
  const bizgroData = {};
  
  // Map accounts
  for (const [qboName, value] of Object.entries(qboData)) {
    const mapping = qboFieldMappings.accounts[qboName] || 
                    qboFieldMappings.incomeStatement[qboName];
    if (mapping) {
      bizgroData[mapping.bizgroField] = value;
    }
  }
  
  // Calculate derived fields
  if (bizgroData.revenueBilledNet && bizgroData.cogsAccrual) {
    bizgroData.grossProfitAccrual = bizgroData.revenueBilledNet - bizgroData.cogsAccrual;
    bizgroData.gpmAccrual = ((bizgroData.grossProfitAccrual / bizgroData.revenueBilledNet) * 100).toFixed(2);
  }
  
  return bizgroData;
};
