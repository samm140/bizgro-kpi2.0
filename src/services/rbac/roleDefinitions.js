// src/services/rbac/roleDefinitions.js

export const ROLES = {
  ADMIN: 'Admin',
  EXECUTIVE: 'Executive',
  FINANCIAL: 'Financial',
  OPERATIONAL: 'Operational',
  SALES: 'Sales',
  INVESTOR: 'Investor'
};

export const PERMISSIONS = {
  // CRUD Operations
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  
  // Special Operations
  APPROVE: 'approve',
  EXPORT: 'export',
  COMMENT: 'comment',
  OVERRIDE: 'override',
  CONFIGURE: 'configure',
  SYNC: 'sync',
  MANAGE: 'manage',
  WRITEOFF: 'writeoff',
  PURGE: 'purge'
};

export const MODULES = {
  DASHBOARD: 'dashboard',
  WIP: 'wip',
  WEEKLY_ENTRY: 'weeklyEntry',
  REPORTS: 'reports',
  METRICS: 'metrics',
  INSIGHTS: 'insights',
  HISTORICAL: 'historical',
  AR: 'ar',
  AP: 'ap',
  USER_MANAGEMENT: 'userManagement',
  ROLE_MANAGEMENT: 'roleManagement',
  SYSTEM_SETTINGS: 'systemSettings',
  AUDIT_LOGS: 'auditLogs'
};

// Complete role configurations
export const roleConfigurations = {
  [ROLES.ADMIN]: {
    name: 'Administrator',
    description: 'Full system access with all administrative privileges',
    permissions: {
      [MODULES.DASHBOARD]: ['create', 'read', 'update', 'delete'],
      [MODULES.WIP]: ['create', 'read', 'update', 'delete', 'approve'],
      [MODULES.WEEKLY_ENTRY]: ['create', 'read', 'update', 'delete', 'override'],
      [MODULES.REPORTS]: ['create', 'read', 'update', 'delete', 'export'],
      [MODULES.METRICS]: ['create', 'read', 'update', 'delete', 'configure'],
      [MODULES.INSIGHTS]: ['create', 'read', 'update', 'delete'],
      [MODULES.HISTORICAL]: ['create', 'read', 'update', 'delete', 'purge'],
      [MODULES.AR]: ['create', 'read', 'update', 'delete', 'writeoff'],
      [MODULES.AP]: ['create', 'read', 'update', 'delete', 'approve'],
      [MODULES.USER_MANAGEMENT]: ['create', 'read', 'update', 'delete'],
      [MODULES.ROLE_MANAGEMENT]: ['create', 'read', 'update', 'delete'],
      [MODULES.SYSTEM_SETTINGS]: ['read', 'update', 'configure'],
      [MODULES.AUDIT_LOGS]: ['read', 'export', 'purge']
    },
    dataScope: {
      level: 'global',
      restrictions: []
    },
    features: {
      sensitiveData: true,
      exportRights: true,
      bulkOperations: true,
      apiAccess: true,
      customReports: true,
      dataRetention: true
    },
    limits: {
      approvalLimit: null,
      exportLimit: null,
      apiRateLimit: 10000
    },
    ui: {
      color: 'red',
      icon: 'shield-alt',
      badge: 'ADMIN'
    }
  },

  [ROLES.EXECUTIVE]: {
    name: 'Executive',
    description: 'Strategic oversight with read access to all high-level metrics',
    permissions: {
      [MODULES.DASHBOARD]: ['read'],
      [MODULES.WIP]: ['read', 'comment'],
      [MODULES.WEEKLY_ENTRY]: ['read', 'approve'],
      [MODULES.REPORTS]: ['read', 'export'],
      [MODULES.METRICS]: ['read'],
      [MODULES.INSIGHTS]: ['read', 'create', 'comment'],
      [MODULES.HISTORICAL]: ['read'],
      [MODULES.AR]: ['read'],
      [MODULES.AP]: ['read']
    },
    dataScope: {
      level: 'global',
      restrictions: []
    },
    features: {
      sensitiveData: true,
      exportRights: true,
      bulkOperations: false,
      apiAccess: true,
      customReports: true,
      dataRetention: false
    },
    limits: {
      approvalLimit: null,
      exportLimit: 100,
      apiRateLimit: 1000
    },
    ui: {
      color: 'purple',
      icon: 'chart-line',
      badge: 'EXEC'
    }
  },

  [ROLES.FINANCIAL]: {
    name: 'Financial Officer',
    description: 'Financial operations and reporting with approval capabilities',
    permissions: {
      [MODULES.DASHBOARD]: ['read'],
      [MODULES.WIP]: ['read', 'update', 'approve'],
      [MODULES.WEEKLY_ENTRY]: ['create', 'read', 'update'],
      [MODULES.REPORTS]: ['create', 'read', 'export'],
      [MODULES.METRICS]: ['read', 'update'],
      [MODULES.INSIGHTS]: ['read'],
      [MODULES.HISTORICAL]: ['read', 'update'],
      [MODULES.AR]: ['create', 'read', 'update', 'delete', 'writeoff'],
      [MODULES.AP]: ['create', 'read', 'update', 'delete', 'approve']
    },
    dataScope: {
      level: 'company',
      restrictions: ['assigned_companies']
    },
    features: {
      sensitiveData: true,
      exportRights: true,
      bulkOperations: true,
      apiAccess: true,
      customReports: false,
      dataRetention: false
    },
    limits: {
      approvalLimit: 1000000,
      exportLimit: 50,
      apiRateLimit: 5000
    },
    ui: {
      color: 'green',
      icon: 'dollar-sign',
      badge: 'FIN'
    }
  },

  [ROLES.OPERATIONAL]: {
    name: 'Operations Manager',
    description: 'Project and operational management with limited financial visibility',
    permissions: {
      [MODULES.DASHBOARD]: ['read'],
      [MODULES.WIP]: ['create', 'read', 'update'],
      [MODULES.WEEKLY_ENTRY]: ['create', 'read', 'update'],
      [MODULES.REPORTS]: ['read'],
      [MODULES.METRICS]: ['read'],
      [MODULES.INSIGHTS]: ['read'],
      [MODULES.HISTORICAL]: ['read'],
      [MODULES.AR]: ['read'],
      [MODULES.AP]: ['read']
    },
    dataScope: {
      level: 'project',
      restrictions: ['assigned_projects', 'team_projects']
    },
    features: {
      sensitiveData: false,
      exportRights: false,
      bulkOperations: false,
      apiAccess: false,
      customReports: false,
      dataRetention: false
    },
    limits: {
      approvalLimit: 50000,
      exportLimit: 10,
      apiRateLimit: 100
    },
    ui: {
      color: 'blue',
      icon: 'hard-hat',
      badge: 'OPS'
    }
  },

  [ROLES.SALES]: {
    name: 'Sales Representative',
    description: 'Customer and opportunity management with limited project visibility',
    permissions: {
      [MODULES.DASHBOARD]: ['read'],
      [MODULES.WIP]: ['read'],
      [MODULES.REPORTS]: ['read'],
      [MODULES.INSIGHTS]: ['read']
    },
    dataScope: {
      level: 'customer',
      restrictions: ['assigned_customers', 'opportunities']
    },
    features: {
      sensitiveData: false,
      exportRights: false,
      bulkOperations: false,
      apiAccess: false,
      customReports: false,
      dataRetention: false
    },
    limits: {
      approvalLimit: 0,
      exportLimit: 5,
      apiRateLimit: 50
    },
    ui: {
      color: 'orange',
      icon: 'handshake',
      badge: 'SALES'
    }
  },

  [ROLES.INVESTOR]: {
    name: 'Investor',
    description: 'Read-only access to portfolio performance and financial summaries',
    permissions: {
      [MODULES.DASHBOARD]: ['read'],
      [MODULES.WIP]: ['read'],
      [MODULES.REPORTS]: ['read'],
      [MODULES.METRICS]: ['read'],
      [MODULES.INSIGHTS]: ['read'],
      [MODULES.HISTORICAL]: ['read']
    },
    dataScope: {
      level: 'portfolio',
      restrictions: ['summary_only', 'aggregated_data']
    },
    features: {
      sensitiveData: false,
      exportRights: true,
      bulkOperations: false,
      apiAccess: false,
      customReports: false,
      dataRetention: false
    },
    limits: {
      approvalLimit: 0,
      exportLimit: 20,
      apiRateLimit: 10
    },
    ui: {
      color: 'indigo',
      icon: 'chart-pie',
      badge: 'INV'
    }
  }
};

// Permission checking utilities
export class PermissionManager {
  constructor(userRole, userPermissions) {
    this.role = userRole;
    this.permissions = userPermissions || roleConfigurations[userRole]?.permissions || {};
    this.config = roleConfigurations[userRole] || {};
  }

  // Check if user has specific permission for a module
  hasPermission(module, action) {
    if (!this.permissions[module]) return false;
    return this.permissions[module].includes(action);
  }

  // Check if user can access a module at all
  canAccessModule(module) {
    return !!this.permissions[module];
  }

  // Check if user can perform CRUD operations
  canCreate(module) {
    return this.hasPermission(module, PERMISSIONS.CREATE);
  }

  canRead(module) {
    return this.hasPermission(module, PERMISSIONS.READ);
  }

  canUpdate(module) {
    return this.hasPermission(module, PERMISSIONS.UPDATE);
  }

  canDelete(module) {
    return this.hasPermission(module, PERMISSIONS.DELETE);
  }

  // Check special permissions
  canApprove(module) {
    return this.hasPermission(module, PERMISSIONS.APPROVE);
  }

  canExport(module) {
    return this.hasPermission(module, PERMISSIONS.EXPORT);
  }

  // Check data scope
  canAccessCompany(companyId, userCompanies) {
    if (this.config.dataScope?.level === 'global') return true;
    if (this.config.dataScope?.level === 'company') {
      return userCompanies.includes(companyId);
    }
    return false;
  }

  canAccessProject(projectId, userProjects) {
    if (this.config.dataScope?.level === 'global') return true;
    if (this.config.dataScope?.level === 'company') return true;
    if (this.config.dataScope?.level === 'project') {
      return userProjects.includes(projectId);
    }
    return false;
  }

  // Check financial limits
  canApproveAmount(amount) {
    const limit = this.config.limits?.approvalLimit;
    if (limit === null) return true;
    return amount <= limit;
  }

  // Check feature access
  canViewSensitiveData() {
    return this.config.features?.sensitiveData || false;
  }

  canExportData() {
    return this.config.features?.exportRights || false;
  }

  canUseBulkOperations() {
    return this.config.features?.bulkOperations || false;
  }

  // Get filtered data based on role
  filterDataByRole(data, dataType) {
    if (this.config.dataScope?.level === 'global') {
      return data;
    }

    if (this.config.dataScope?.restrictions?.includes('summary_only')) {
      // Return aggregated data for investors
      return this.aggregateData(data);
    }

    if (!this.canViewSensitiveData()) {
      // Remove sensitive fields for operational/sales roles
      return this.removeSensitiveFields(data);
    }

    return data;
  }

  // Remove sensitive financial fields
  removeSensitiveFields(data) {
    const sensitiveFields = [
      'grossMargin', 'netMargin', 'profitToDate', 'marginToDate',
      'actualCosts', 'estimatedCosts', 'costBreakdown'
    ];
    
    if (Array.isArray(data)) {
      return data.map(item => this.removeSensitiveFields(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const filtered = { ...data };
      sensitiveFields.forEach(field => delete filtered[field]);
      return filtered;
    }
    
    return data;
  }

  // Aggregate data for summary view
  aggregateData(data) {
    if (!Array.isArray(data)) return data;
    
    return {
      totalCount: data.length,
      totalValue: data.reduce((sum, item) => sum + (item.value || 0), 0),
      averageValue: data.reduce((sum, item) => sum + (item.value || 0), 0) / data.length,
      summary: 'Aggregated view - detailed data not available'
    };
  }

  // Get UI configuration for role
  getUIConfig() {
    return this.config.ui || {};
  }

  // Get navigation items based on permissions - UPDATED WITH NEW MENU NAMES
  getNavigationItems() {
    const allNavItems = [
      { name: 'Dashboard', module: MODULES.DASHBOARD, icon: 'home', view: 'dashboard' },
      { name: 'Work in Progress', module: MODULES.WIP, icon: 'briefcase', view: 'portfolio' },
      { name: 'Receivables', module: MODULES.AR, icon: 'dollar-sign', view: 'ar-dashboard' },
      { name: 'Payables', module: MODULES.AP, icon: 'credit-card', view: 'ap-dashboard' },
      { name: 'FP&A Reports', module: MODULES.REPORTS, icon: 'file-text', view: 'reports' },
      { name: 'CFO Analysis', module: MODULES.REPORTS, icon: 'chart-pie', view: 'cfo-dashboard' },
      { name: 'Insights', module: MODULES.INSIGHTS, icon: 'trending-up', view: 'insights' },
      { name: 'Weekly Entry', module: MODULES.WEEKLY_ENTRY, icon: 'calendar', view: 'entry', badge: 'New' },
      { name: 'Historical', module: MODULES.HISTORICAL, icon: 'clock', view: 'historical' },
      { name: 'Ratio Glossary', module: MODULES.METRICS, icon: 'bar-chart', view: 'metrics' }
    ];

    // Add admin-only items if user has permission
    if (this.canAccessModule(MODULES.USER_MANAGEMENT)) {
      allNavItems.push({ 
        name: 'Admin Console', 
        module: MODULES.USER_MANAGEMENT, 
        icon: 'shield', 
        view: 'admin' 
      });
    }
    
    if (this.canAccessModule(MODULES.SYSTEM_SETTINGS)) {
      allNavItems.push({ 
        name: 'Settings', 
        module: MODULES.SYSTEM_SETTINGS, 
        icon: 'settings', 
        view: 'settings' 
      });
    }

    return allNavItems.filter(item => this.canAccessModule(item.module));
  }
}

// Utility function to check permissions in components
export const can = (permissions, module, action) => {
  if (!permissions) return false;
  return permissions.hasPermission(module, action);
};
