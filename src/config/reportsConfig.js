// src/config/reportsConfig.js
// Configuration for all Reach Reporting dashboards

export const reportsConfig = {
  // Base URL for Reach Reporting
  baseUrl: 'https://reports.bizgropartners.com',
  
  // Default theme (dark/light)
  defaultTheme: 'dark',
  
  // Default iframe heights
  defaultHeight: 900,
  
  // Report categories and their dashboards
  categories: {
    financial: {
      name: 'Financial Analytics',
      icon: 'fas fa-chart-line',
      color: 'from-blue-600 to-blue-700',
      description: 'Core financial metrics and performance indicators',
      reports: [
        {
          id: 'revenue-analysis',
          title: 'Revenue Analysis Dashboard',
          description: 'Comprehensive revenue trends, YoY comparisons, and forecasting',
          embedId: 'TC3kWIS7rgHDjSs',
          shareUrl: 'https://reports.bizgropartners.com/shared/~TC3kWIS7rgHDjSs',
          height: 1000,
          tags: ['Revenue', 'Trends', 'YTD'],
          refreshInterval: 300000, // 5 minutes
          permissions: ['admin', 'finance', 'executive']
        },
        {
          id: 'cash-flow',
          title: 'Cash Flow Management',
          description: 'Real-time cash position, collections, and liquidity metrics',
          embedId: '6Z0ZGAd~J8lKkXYz', // Correct embed ID from your URL
          shareUrl: 'https://reports.bizgropartners.com/embed/6Z0ZGAd~J8lKkXYz', // Correct share URL
          height: 800,
          tags: ['Cash', 'Collections', 'Liquidity'],
          refreshInterval: 300000, // 5 minutes
          permissions: ['admin', 'finance', 'executive'],
          // Script integration requirements
          requiresScript: true,
          scriptConfig: {
            enableScrollSync: true,
            dynamicHeight: true
          }
        },
        {
          id: 'profitability',
          title: 'Profitability Metrics',
          description: 'Gross margin analysis, EBITDA tracking, and cost management',
          embedId: 'YOUR_PROFIT_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_PROFIT_ID',
          height: 900,
          tags: ['Margins', 'EBITDA', 'Costs'],
          refreshInterval: 600000, // 10 minutes
          permissions: ['admin', 'finance', 'executive']
        },
        {
          id: 'ar-aging',
          title: 'AR Aging Report',
          description: 'Accounts receivable aging analysis and collection tracking',
          embedId: 'YOUR_AR_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_AR_ID',
          height: 750,
          tags: ['AR', 'Collections', 'Aging'],
          refreshInterval: 300000,
          permissions: ['admin', 'finance']
        }
      ]
    },
    
    operational: {
      name: 'Operational Insights',
      icon: 'fas fa-cogs',
      color: 'from-green-600 to-green-700',
      description: 'Operations, projects, and workforce analytics',
      reports: [
        {
          id: 'project-performance',
          title: 'Project Performance',
          description: 'Active project tracking, completion rates, and variance analysis',
          embedId: 'YOUR_PROJECT_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_PROJECT_ID',
          height: 850,
          tags: ['Projects', 'WIP', 'Completion'],
          refreshInterval: 600000,
          permissions: ['admin', 'operations', 'pm']
        },
        {
          id: 'workforce-analytics',
          title: 'Workforce Analytics',
          description: 'Employee metrics, productivity tracking, and resource allocation',
          embedId: 'YOUR_WORKFORCE_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_WORKFORCE_ID',
          height: 750,
          tags: ['HR', 'Productivity', 'Resources'],
          refreshInterval: 900000, // 15 minutes
          permissions: ['admin', 'hr', 'executive']
        },
        {
          id: 'equipment-utilization',
          title: 'Equipment Utilization',
          description: 'Asset tracking, maintenance schedules, and utilization rates',
          embedId: 'YOUR_EQUIPMENT_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_EQUIPMENT_ID',
          height: 700,
          tags: ['Assets', 'Equipment', 'Utilization'],
          refreshInterval: 900000,
          permissions: ['admin', 'operations']
        }
      ]
    },
    
    executive: {
      name: 'Executive Dashboards',
      icon: 'fas fa-briefcase',
      color: 'from-purple-600 to-purple-700',
      description: 'High-level strategic views and board reporting',
      reports: [
        {
          id: 'kpi-summary',
          title: 'Executive KPI Summary',
          description: 'High-level KPIs, strategic metrics, and performance indicators',
          embedId: 'YOUR_KPI_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_KPI_ID',
          height: 1200,
          tags: ['KPIs', 'Strategic', 'Summary'],
          refreshInterval: 300000,
          permissions: ['executive', 'admin']
        },
        {
          id: 'board-report',
          title: 'Board Meeting Dashboard',
          description: 'Quarterly performance, YTD results, and strategic initiatives',
          embedId: 'YOUR_BOARD_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_BOARD_ID',
          height: 1100,
          tags: ['Quarterly', 'Board', 'Strategic'],
          refreshInterval: 600000,
          permissions: ['executive', 'admin', 'board']
        },
        {
          id: 'strategic-initiatives',
          title: 'Strategic Initiatives Tracker',
          description: 'Progress on key strategic projects and transformation efforts',
          embedId: 'YOUR_STRATEGIC_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_STRATEGIC_ID',
          height: 900,
          tags: ['Strategy', 'Initiatives', 'Transformation'],
          refreshInterval: 900000,
          permissions: ['executive', 'admin']
        }
      ]
    },
    
    portfolio: {
      name: 'Portfolio Companies',
      icon: 'fas fa-building',
      color: 'from-amber-600 to-amber-700',
      description: 'Multi-company portfolio analytics and comparisons',
      reports: [
        {
          id: 'portfolio-overview',
          title: 'Portfolio Overview',
          description: 'Consolidated view of all portfolio company performance',
          embedId: 'YOUR_PORTFOLIO_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_PORTFOLIO_ID',
          height: 950,
          tags: ['Portfolio', 'Consolidated', 'Multi-Company'],
          refreshInterval: 600000,
          permissions: ['executive', 'admin', 'portfolio']
        },
        {
          id: 'comparative-analysis',
          title: 'Comparative Analysis',
          description: 'Cross-company performance comparisons and benchmarking',
          embedId: 'YOUR_COMPARE_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_COMPARE_ID',
          height: 800,
          tags: ['Comparison', 'Benchmarking', 'Analysis'],
          refreshInterval: 600000,
          permissions: ['executive', 'admin', 'portfolio']
        },
        {
          id: 'diamondback-dashboard',
          title: 'DiamondBack Masonry Dashboard',
          description: 'Detailed financial and operational metrics for DiamondBack',
          embedId: 'YOUR_DIAMONDBACK_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_DIAMONDBACK_ID',
          height: 1000,
          tags: ['DiamondBack', 'Masonry', 'Construction'],
          refreshInterval: 300000,
          permissions: ['executive', 'admin', 'portfolio']
        }
      ]
    },
    
    sales: {
      name: 'Sales & Marketing',
      icon: 'fas fa-chart-area',
      color: 'from-pink-600 to-pink-700',
      description: 'Sales pipeline, marketing metrics, and customer analytics',
      reports: [
        {
          id: 'sales-pipeline',
          title: 'Sales Pipeline Dashboard',
          description: 'Pipeline stages, conversion rates, and sales forecasting',
          embedId: 'YOUR_SALES_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_SALES_ID',
          height: 850,
          tags: ['Sales', 'Pipeline', 'Forecast'],
          refreshInterval: 300000,
          permissions: ['admin', 'sales', 'executive']
        },
        {
          id: 'customer-analytics',
          title: 'Customer Analytics',
          description: 'Customer segmentation, lifetime value, and retention metrics',
          embedId: 'YOUR_CUSTOMER_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_CUSTOMER_ID',
          height: 800,
          tags: ['Customers', 'LTV', 'Retention'],
          refreshInterval: 600000,
          permissions: ['admin', 'sales', 'marketing']
        }
      ]
    },
    
    compliance: {
      name: 'Risk & Compliance',
      icon: 'fas fa-shield-alt',
      color: 'from-red-600 to-red-700',
      description: 'Risk management, compliance tracking, and audit reports',
      reports: [
        {
          id: 'risk-dashboard',
          title: 'Risk Management Dashboard',
          description: 'Enterprise risk assessment and mitigation tracking',
          embedId: 'YOUR_RISK_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_RISK_ID',
          height: 900,
          tags: ['Risk', 'Compliance', 'Audit'],
          refreshInterval: 900000,
          permissions: ['admin', 'compliance', 'executive']
        },
        {
          id: 'compliance-tracker',
          title: 'Compliance Tracker',
          description: 'Regulatory compliance status and certification tracking',
          embedId: 'YOUR_COMPLIANCE_ID', // Replace with actual ID
          shareUrl: 'https://reports.bizgropartners.com/shared/YOUR_COMPLIANCE_ID',
          height: 750,
          tags: ['Compliance', 'Regulatory', 'Certifications'],
          refreshInterval: 900000,
          permissions: ['admin', 'compliance']
        }
      ]
    }
  },
  
  // Quick access reports (shown on main page)
  quickAccess: [
    'revenue-analysis',
    'cash-flow',
    'kpi-summary',
    'project-performance'
  ],
  
  // Default permissions for demo mode
  demoPermissions: ['admin', 'finance', 'executive', 'operations', 'portfolio'],
  
  // Embedding options
  embedOptions: {
    theme: 'dark', // or 'light'
    showToolbar: true,
    showFilters: true,
    allowExport: true,
    allowFullscreen: true
  },
  
  // Custom styling for embedded iframes
  iframeStyles: {
    border: 'none',
    borderRadius: '0.5rem',
    background: 'rgba(30, 41, 59, 0.5)'
  },
  
  // Script initialization for Reach Reporting communication
  initScript: function() {
    // Reach Reporting scroll and resize handler
    function rrSendScroll() {
      var iframes = document.getElementsByClassName("rr-embed");
      var de = document.documentElement;
      for (var i = 0; i < iframes.length; i += 1) {
        var box = iframes[i].getBoundingClientRect();
        var top = box.top + window.pageYOffset - de.clientTop;
        var message = JSON.stringify({
          channel: "rr",
          id: parseInt(iframes[i].getAttribute("data-rr-id"), 10),
          scrollY: window.scrollY,
          offsetTop: top
        });
        iframes[i].contentWindow.postMessage(message, "*");
      }
    }
    
    // Message handler for dynamic height adjustment
    window.addEventListener("message", function(e) {
      try {
        var d = JSON.parse(e.data);
        var c = d.channel;
        if (c === "rr") {
          document.getElementById("dashboard-" + d.id).style.height = d.height + "px";
          rrSendScroll();
        }
      } catch {}
    });
    
    // Scroll event listener
    window.addEventListener("scroll", rrSendScroll);
  }
};

// Helper function to get report by ID
export const getReportById = (reportId) => {
  for (const category of Object.values(reportsConfig.categories)) {
    const report = category.reports.find(r => r.id === reportId);
    if (report) return report;
  }
  return null;
};

// Helper function to get reports by permission
export const getReportsByPermission = (userPermissions = []) => {
  const accessibleReports = [];
  
  for (const category of Object.values(reportsConfig.categories)) {
    const categoryReports = category.reports.filter(report => 
      report.permissions.some(permission => 
        userPermissions.includes(permission)
      )
    );
    
    if (categoryReports.length > 0) {
      accessibleReports.push({
        ...category,
        reports: categoryReports
      });
    }
  }
  
  return accessibleReports;
};

// Helper function to build embed URL
export const buildEmbedUrl = (embedId, options = {}) => {
  const baseUrl = reportsConfig.baseUrl;
  const theme = options.theme || reportsConfig.embedOptions.theme;
  const params = new URLSearchParams({
    theme,
    ...options
  });
  
  return `${baseUrl}/embed/~${embedId}?${params.toString()}`;
};

// Helper function to build share URL
export const buildShareUrl = (embedId) => {
  return `${reportsConfig.baseUrl}/shared/~${embedId}`;
};

// Initialize the script when this module is loaded
if (typeof window !== 'undefined') {
  reportsConfig.initScript();
}

export default reportsConfig;
