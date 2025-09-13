import React, { useState, useMemo, useEffect, createContext, useContext } from 'react';

// Formatters from second version
const formatters = {
  pct: (v) => (v == null ? '—' : `${(v * 100).toFixed(2)}%`),
  money: (v) =>
    v == null
      ? '—'
      : Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v),
  days: (v) => (v == null ? '—' : `${Math.round(v)} days`),
};

// Create a simple metrics context
const MetricsContext = createContext({
  registry: {},
  setRegistry: () => {},
  selectedForDashboard: [],
  addToDashboard: () => {},
  removeFromDashboard: () => {}
});

// Complete metrics data from first version - all 85 metrics
const ALL_METRICS_DATA = [
  // Liquidity Metrics (8)
  { id: 'LIQ001', category: 'Liquidity', title: 'Current Ratio (Ops)', formula: '=(CashBank + CashQB + CurrentAR) / CurrentAP', fields: 'Cash in Bank, Cash on Hand (QuickBooks), Current AR $, Current AP $', visual: 'KPI Card + sparkline; Bullet vs 1.5–2.0', grain: 'Weekly', benchmark: 'Target: 1.5-2.0', enabled: true },
  { id: 'LIQ002', category: 'Liquidity', title: 'Quick Ratio', formula: '=(CashBank + CashQB + (CurrentAR - Retention)) / CurrentAP', fields: 'Cash in Bank, Cash on Hand, Current AR $, Retention Receivables, Current AP $', visual: 'KPI Card; Bullet vs 1.0', grain: 'Weekly', benchmark: 'Target: >1.0', enabled: true },
  { id: 'LIQ003', category: 'Liquidity', title: 'Cash Ratio', formula: '=(CashBank + CashQB) / CurrentAP', fields: 'Cash in Bank, Cash on Hand, Current AP $', visual: 'KPI Card; Trend line', grain: 'Weekly', benchmark: 'Healthy if >0.5', enabled: true },
  { id: 'LIQ004', category: 'Liquidity', title: 'Net Working Capital', formula: '=(CashBank + CashQB + CurrentAR) - CurrentAP', fields: 'Cash in Bank, Cash on Hand, Current AR $, Current AP $', visual: 'KPI Card; Waterfall', grain: 'Weekly', benchmark: 'Track WoW delta', enabled: true },
  { id: 'LIQ005', category: 'Liquidity', title: 'LOC Utilization %', formula: '=LOC_Drawn / LOC_Limit', fields: 'LOC Drawn, LOC Limit', visual: 'Gauge; Trend line', grain: 'Weekly', benchmark: 'Keep <80%', enabled: false },
  { id: 'LIQ006', category: 'Liquidity', title: 'Cash Runway (Weeks)', formula: '=TotalCash / WeeklyBurnRate', fields: 'Total Cash, Operating Expenses', visual: 'KPI Card with alert', grain: 'Weekly', benchmark: '>12 weeks', enabled: true },
  { id: 'LIQ007', category: 'Liquidity', title: 'Cash Conversion Cycle', formula: '=DSO + DIO - DPO', fields: 'AR, Inventory, AP, Revenue, COGS', visual: 'Trend line', grain: 'Weekly', benchmark: '<30 days ideal', enabled: false },
  { id: 'LIQ008', category: 'Liquidity', title: 'Free Cash Flow', formula: '=Operating Cash - CapEx', fields: 'Collections, Operating Expenses, Capital Expenditures', visual: 'Area chart', grain: 'Weekly', benchmark: 'Positive trend', enabled: true },

  // AR / Collections Metrics (7)
  { id: 'AR001', category: 'AR / Collections', title: 'DSO (Days Sales Outstanding)', formula: '=(CurrentAR / Revenue) * DaysInPeriod', fields: 'Current AR $, Revenue Billed', visual: 'KPI Card; Trend', grain: 'Weekly', benchmark: '<45 days', enabled: true },
  { id: 'AR002', category: 'AR / Collections', title: 'Collection Efficiency %', formula: '=Collections / BilledRevenue', fields: 'Collections $, Revenue Billed to Date', visual: 'Gauge; Bar chart', grain: 'Weekly', benchmark: '>95%', enabled: true },
  { id: 'AR003', category: 'AR / Collections', title: 'AR Aging Buckets', formula: '=GroupBy(AR, AgeDays)', fields: 'Current AR $, Invoice Dates', visual: 'Stacked bar', grain: 'Weekly', benchmark: '<10% over 90 days', enabled: true },
  { id: 'AR004', category: 'AR / Collections', title: 'Collections Velocity', formula: '=Collections / AvgDailyRevenue', fields: 'Collections $, Revenue', visual: 'Line chart', grain: 'Weekly', benchmark: 'Improving trend', enabled: false },
  { id: 'AR005', category: 'AR / Collections', title: 'Overdue AR %', formula: '=OverdueAR / TotalAR', fields: 'Overdue AR, Current AR $', visual: 'KPI Card with alert', grain: 'Weekly', benchmark: '<15%', enabled: true },
  { id: 'AR006', category: 'AR / Collections', title: 'Retention as % of AR', formula: '=RetentionReceivables / CurrentAR', fields: 'Retention Receivables, Current AR $', visual: 'Donut chart', grain: 'Weekly', benchmark: '<10%', enabled: false },
  { id: 'AR007', category: 'AR / Collections', title: 'Bad Debt Reserve', formula: '=OverdueAR * RiskFactor', fields: 'Overdue AR, Historical Loss Rate', visual: 'KPI Card', grain: 'Monthly', benchmark: '<2% of revenue', enabled: false },

  // AP / Payables Metrics (3)
  { id: 'AP001', category: 'AP / Payables', title: 'DPO (Days Payables Outstanding)', formula: '=(CurrentAP / COGS) * DaysInPeriod', fields: 'Current AP $, COGS Accrual', visual: 'KPI Card; Trend', grain: 'Weekly', benchmark: '30-45 days', enabled: true },
  { id: 'AP002', category: 'AP / Payables', title: 'AP Aging', formula: '=GroupBy(AP, AgeDays)', fields: 'Current AP $, Invoice Dates', visual: 'Stacked bar', grain: 'Weekly', benchmark: 'Manage >60 days', enabled: false },
  { id: 'AP003', category: 'AP / Payables', title: 'Payment Terms Utilization', formula: '=ActualDPO / ContractedTerms', fields: 'AP Payment Dates, Vendor Terms', visual: 'Bar chart', grain: 'Monthly', benchmark: 'Optimize to terms', enabled: false },

  // Profitability Metrics (7)
  { id: 'PROF001', category: 'Profitability', title: 'Gross Profit Margin %', formula: '=GrossProfit / Revenue * 100', fields: 'Gross Profit Accrual, Revenue Billed', visual: 'KPI Card; Line trend', grain: 'Weekly', benchmark: '>30%', enabled: true },
  { id: 'PROF002', category: 'Profitability', title: 'Operating Margin %', formula: '=(GrossProfit - OpEx) / Revenue * 100', fields: 'Gross Profit, Operating Expenses, Revenue', visual: 'KPI Card; Waterfall', grain: 'Weekly', benchmark: '>10%', enabled: true },
  { id: 'PROF003', category: 'Profitability', title: 'EBITDA', formula: '=Revenue - COGS - OpEx + D&A', fields: 'Revenue, COGS, Operating Expenses', visual: 'Bar chart', grain: 'Monthly', benchmark: 'Industry specific', enabled: false },
  { id: 'PROF004', category: 'Profitability', title: 'Net Profit Margin', formula: '=NetIncome / Revenue * 100', fields: 'Net Income, Revenue', visual: 'KPI Card', grain: 'Monthly', benchmark: '>5%', enabled: false },
  { id: 'PROF005', category: 'Profitability', title: 'Contribution Margin', formula: '=(Revenue - VariableCosts) / Revenue', fields: 'Revenue, Variable Costs', visual: 'Stacked area', grain: 'Weekly', benchmark: '>40%', enabled: false },
  { id: 'PROF006', category: 'Profitability', title: 'Break-even Point', formula: '=FixedCosts / ContributionMargin', fields: 'Fixed Costs, Contribution Margin', visual: 'Line chart', grain: 'Monthly', benchmark: 'Project specific', enabled: false },
  { id: 'PROF007', category: 'Profitability', title: 'ROI', formula: '=(Gain - Cost) / Cost * 100', fields: 'Project Revenue, Project Costs', visual: 'Bar chart', grain: 'Project', benchmark: '>20%', enabled: false },

  // Sales Metrics (5)
  { id: 'SALES001', category: 'Sales', title: 'Win Rate %', formula: '=JobsWon / TotalBids * 100', fields: 'Jobs Won #, Total Estimates', visual: 'Gauge; Funnel', grain: 'Weekly', benchmark: '>33%', enabled: true },
  { id: 'SALES002', category: 'Sales', title: 'Average Deal Size', formula: '=JobsWonDollar / JobsWonNumber', fields: 'Jobs Won $, Jobs Won #', visual: 'Bar chart', grain: 'Weekly', benchmark: 'Track growth', enabled: true },
  { id: 'SALES003', category: 'Sales', title: 'Sales Velocity', formula: '=(Opportunities * WinRate * DealSize) / SalesCycle', fields: 'Pipeline metrics', visual: 'KPI Card', grain: 'Weekly', benchmark: 'Increasing', enabled: false },
  { id: 'SALES004', category: 'Sales', title: 'Pipeline Coverage', formula: '=PipelineValue / SalesTarget', fields: 'Total Estimates, Revenue Target', visual: 'Bar vs target', grain: 'Monthly', benchmark: '>3x', enabled: false },
  { id: 'SALES005', category: 'Sales', title: 'Customer Acquisition Cost', formula: '=SalesExpenses / NewCustomers', fields: 'Sales Costs, New Customers', visual: 'Trend line', grain: 'Monthly', benchmark: '<10% of deal', enabled: false },

  // Bids / Funnel Metrics (9)
  { id: 'BID001', category: 'Bids / Funnel', title: 'Bid-to-Award Ratio', formula: '=JobsWon / TotalEstimates', fields: 'Jobs Won #, New Estimated Jobs', visual: 'Funnel chart', grain: 'Weekly', benchmark: '>25%', enabled: true },
  { id: 'BID002', category: 'Bids / Funnel', title: 'Invitations Conversion', formula: '=Estimates / Invitations', fields: 'New Estimated Jobs, Total Invitations', visual: 'Funnel', grain: 'Weekly', benchmark: '>60%', enabled: true },
  { id: 'BID003', category: 'Bids / Funnel', title: 'GC Relationship Score', formula: '=ExistingGC / TotalInvites', fields: 'Invites Existing GC, Total Invitations', visual: 'Donut chart', grain: 'Weekly', benchmark: '>70%', enabled: false },
  { id: 'BID004', category: 'Bids / Funnel', title: 'Bid Hit Rate', formula: '=WonValue / TotalBidValue', fields: 'Jobs Won $, Total Estimates $', visual: 'KPI Card', grain: 'Weekly', benchmark: '>30%', enabled: true },
  { id: 'BID005', category: 'Bids / Funnel', title: 'Average Bid Size', formula: '=TotalEstimates / NewEstimatedJobs', fields: 'Total Estimates $, New Estimated Jobs', visual: 'Bar chart', grain: 'Weekly', benchmark: 'Track trend', enabled: false },
  { id: 'BID006', category: 'Bids / Funnel', title: 'Bid Turnaround Time', formula: '=AvgDays(BidSubmit - BidRequest)', fields: 'Bid dates', visual: 'Histogram', grain: 'Weekly', benchmark: '<5 days', enabled: false },
  { id: 'BID007', category: 'Bids / Funnel', title: 'Qualified Leads', formula: '=QualifiedBids / TotalInquiries', fields: 'Qualified Opportunities, Total Inquiries', visual: 'Funnel', grain: 'Weekly', benchmark: '>50%', enabled: false },
  { id: 'BID008', category: 'Bids / Funnel', title: 'Pipeline Velocity', formula: '=StageProgressionRate', fields: 'Stage transitions', visual: 'Sankey diagram', grain: 'Weekly', benchmark: 'No bottlenecks', enabled: false },
  { id: 'BID009', category: 'Bids / Funnel', title: 'Lost Bid Analysis', formula: '=GroupBy(LostBids, Reason)', fields: 'Lost bid reasons', visual: 'Pie chart', grain: 'Monthly', benchmark: 'Address top issues', enabled: false },

  // Projects Metrics (3)
  { id: 'PROJ001', category: 'Projects', title: 'Active Projects', formula: '=COUNT(ActiveProjects)', fields: 'WIP Projects', visual: 'KPI Card', grain: 'Weekly', benchmark: 'Capacity based', enabled: true },
  { id: 'PROJ002', category: 'Projects', title: 'Project Start Rate', formula: '=JobsStarted / JobsWon', fields: 'Jobs Started #, Jobs Won #', visual: 'Bar chart', grain: 'Weekly', benchmark: '>80% within 30d', enabled: true },
  { id: 'PROJ003', category: 'Projects', title: 'Project Completion Rate', formula: '=JobsCompleted / JobsStarted', fields: 'Jobs Completed, Jobs Started #', visual: 'Progress bars', grain: 'Weekly', benchmark: 'On schedule', enabled: false },

  // Backlog Metrics (5)
  { id: 'BACK001', category: 'Backlog', title: 'Total Backlog', formula: '=SUM(ContractValue - BilledToDate)', fields: 'Contract values, Revenue Billed', visual: 'KPI Card; Area chart', grain: 'Weekly', benchmark: '>6 months revenue', enabled: true },
  { id: 'BACK002', category: 'Backlog', title: 'Backlog Burn Rate', formula: '=RevenueRecognized / BacklogStart', fields: 'Revenue, Backlog', visual: 'Burn-down chart', grain: 'Weekly', benchmark: 'Steady burn', enabled: false },
  { id: 'BACK003', category: 'Backlog', title: 'Backlog Coverage', formula: '=Backlog / MonthlyRevenue', fields: 'Backlog, Revenue Run Rate', visual: 'KPI Card', grain: 'Weekly', benchmark: '>6 months', enabled: true },
  { id: 'BACK004', category: 'Backlog', title: 'Upcoming Jobs Pipeline', formula: '=UpcomingJobsDollar', fields: 'Upcoming Jobs $', visual: 'Pipeline view', grain: 'Weekly', benchmark: 'Growth trend', enabled: true },
  { id: 'BACK005', category: 'Backlog', title: 'Backlog Quality', formula: '=WeightedByMargin(Backlog)', fields: 'Backlog, Project Margins', visual: 'Heat map', grain: 'Monthly', benchmark: '>30% GM', enabled: false },

  // WIP Metrics (5)
  { id: 'WIP001', category: 'WIP', title: 'WIP Balance', formula: '=WIPDollar', fields: 'WIP $', visual: 'KPI Card; Waterfall', grain: 'Weekly', benchmark: 'Match revenue', enabled: true },
  { id: 'WIP002', category: 'WIP', title: 'WIP Turns', formula: '=Revenue / AvgWIP', fields: 'Revenue, WIP $', visual: 'Trend line', grain: 'Monthly', benchmark: '>12x annually', enabled: false },
  { id: 'WIP003', category: 'WIP', title: 'Unbilled Revenue', formula: '=WIP - BilledNotCollected', fields: 'WIP $, Billed Revenue', visual: 'Stacked bar', grain: 'Weekly', benchmark: '<30 days revenue', enabled: false },
  { id: 'WIP004', category: 'WIP', title: 'WIP Aging', formula: '=GroupBy(WIP, ProjectAge)', fields: 'WIP $, Project Start Dates', visual: 'Histogram', grain: 'Weekly', benchmark: '<10% >90 days', enabled: false },
  { id: 'WIP005', category: 'WIP', title: 'Revenue Left to Bill', formula: '=RevLeftToBill', fields: 'Rev Left to Bill on Jobs in WIP', visual: 'KPI Card', grain: 'Weekly', benchmark: 'Decreasing', enabled: true },

  // Revenue Quality Metrics (3)
  { id: 'REV001', category: 'Revenue Quality', title: 'Revenue Recognition Rate', formula: '=RevenueRecognized / ContractValue', fields: 'Revenue, Contract Values', visual: 'Progress bars', grain: 'Weekly', benchmark: 'Per schedule', enabled: false },
  { id: 'REV002', category: 'Revenue Quality', title: 'Change Order %', formula: '=ChangeOrders / OriginalContract', fields: 'Change Orders, Contract Values', visual: 'KPI Card', grain: 'Weekly', benchmark: '>5% opportunity', enabled: true },
  { id: 'REV003', category: 'Revenue Quality', title: 'Recurring Revenue %', formula: '=RecurringRevenue / TotalRevenue', fields: 'Recurring contracts, Total Revenue', visual: 'Donut chart', grain: 'Monthly', benchmark: '>20% stable', enabled: false },

  // Workforce Metrics (9)
  { id: 'WORK001', category: 'Workforce', title: 'Total Headcount', formula: '=FieldEmployees + Supervisors + Office', fields: 'Field Employees, Supervisors, Office', visual: 'Stacked bar', grain: 'Weekly', benchmark: 'Per plan', enabled: true },
  { id: 'WORK002', category: 'Workforce', title: 'Revenue per Employee', formula: '=Revenue / TotalEmployees', fields: 'Revenue, Total Headcount', visual: 'KPI Card; Trend', grain: 'Weekly', benchmark: '>$200k/year', enabled: true },
  { id: 'WORK003', category: 'Workforce', title: 'Field to Office Ratio', formula: '=FieldEmployees / Office', fields: 'Field Employees, Office', visual: 'Ratio chart', grain: 'Weekly', benchmark: '6:1 typical', enabled: false },
  { id: 'WORK004', category: 'Workforce', title: 'Supervisor Ratio', formula: '=FieldEmployees / Supervisors', fields: 'Field Employees, Supervisors', visual: 'KPI Card', grain: 'Weekly', benchmark: '8:1 optimal', enabled: false },
  { id: 'WORK005', category: 'Workforce', title: 'Turnover Rate', formula: '=Terminations / AvgHeadcount', fields: 'Employees Fired, Total Headcount', visual: 'Line chart', grain: 'Monthly', benchmark: '<10% annually', enabled: true },
  { id: 'WORK006', category: 'Workforce', title: 'Hiring Velocity', formula: '=NewHires / OpenPositions', fields: 'New Hires, Open Positions', visual: 'Bar chart', grain: 'Weekly', benchmark: 'Fill within 30d', enabled: false },
  { id: 'WORK007', category: 'Workforce', title: 'Labor Efficiency', formula: '=Revenue / LaborCosts', fields: 'Revenue, Gross Wages Accrual', visual: 'Trend line', grain: 'Weekly', benchmark: '>3.0x', enabled: false },
  { id: 'WORK008', category: 'Workforce', title: 'Overtime %', formula: '=OvertimeHours / TotalHours', fields: 'Overtime, Regular Hours', visual: 'Heat map', grain: 'Weekly', benchmark: '<10%', enabled: false },
  { id: 'WORK009', category: 'Workforce', title: 'Utilization Rate', formula: '=BillableHours / TotalHours', fields: 'Billable Hours, Total Hours', visual: 'Gauge', grain: 'Weekly', benchmark: '>75%', enabled: false },

  // Risk Metrics (4)
  { id: 'RISK001', category: 'Risk', title: 'Customer Concentration', formula: '=Top3Customers / TotalRevenue', fields: 'Customer Revenue Data', visual: 'Pie chart', grain: 'Monthly', benchmark: '<50%', enabled: true },
  { id: 'RISK002', category: 'Risk', title: 'Project Risk Score', formula: '=WeightedRiskFactors', fields: 'Project complexity, Timeline, Margin', visual: 'Heat map', grain: 'Weekly', benchmark: 'Minimize red', enabled: false },
  { id: 'RISK003', category: 'Risk', title: 'Cash at Risk', formula: '=UncollectedAR + UnbilledWIP', fields: 'AR, WIP', visual: 'KPI Card alert', grain: 'Weekly', benchmark: '<60 days revenue', enabled: false },
  { id: 'RISK004', category: 'Risk', title: 'Contract Compliance', formula: '=CompliantContracts / TotalContracts', fields: 'Contract reviews', visual: 'Progress bar', grain: 'Monthly', benchmark: '100%', enabled: false },

  // Comparative Metrics (4)
  { id: 'COMP001', category: 'Comparative', title: 'YoY Revenue Growth', formula: '=(CurrentRevenue - PriorRevenue) / PriorRevenue', fields: 'Revenue YTD, Prior Year Revenue', visual: 'Bar chart comparison', grain: 'Monthly', benchmark: '>15%', enabled: true },
  { id: 'COMP002', category: 'Comparative', title: 'QoQ Performance', formula: '=(CurrentQuarter - PriorQuarter) / PriorQuarter', fields: 'Quarterly metrics', visual: 'Waterfall', grain: 'Quarterly', benchmark: 'Positive', enabled: false },
  { id: 'COMP003', category: 'Comparative', title: 'Budget Variance', formula: '=(Actual - Budget) / Budget', fields: 'Actuals, Budget', visual: 'Variance chart', grain: 'Monthly', benchmark: '<5% variance', enabled: false },
  { id: 'COMP004', category: 'Comparative', title: 'Peer Benchmarking', formula: '=CompanyMetric / IndustryAverage', fields: 'Internal metrics, Industry data', visual: 'Radar chart', grain: 'Quarterly', benchmark: '>1.0x', enabled: false },

  // Helper Metrics (7)
  { id: 'HELP001', category: 'Helper', title: 'Data Completeness', formula: '=FilledFields / RequiredFields', fields: 'All weekly entry fields', visual: 'Progress bar', grain: 'Weekly', benchmark: '100%', enabled: true },
  { id: 'HELP002', category: 'Helper', title: 'Metric Health Score', formula: '=MetricsInRange / TotalMetrics', fields: 'All metric values vs benchmarks', visual: 'Health dashboard', grain: 'Real-time', benchmark: '>80% green', enabled: false },
  { id: 'HELP003', category: 'Helper', title: 'Alert Count', formula: '=COUNT(MetricsOutOfRange)', fields: 'Metric thresholds', visual: 'Alert panel', grain: 'Real-time', benchmark: '<5 critical', enabled: false },
  { id: 'HELP004', category: 'Helper', title: 'Forecast Accuracy', formula: '=1 - ABS(Forecast - Actual) / Actual', fields: 'Forecasts, Actuals', visual: 'Line comparison', grain: 'Monthly', benchmark: '>90%', enabled: false },
  { id: 'HELP005', category: 'Helper', title: 'Rolling Averages', formula: '=AVG(MetricValues, Period)', fields: 'Historical data', visual: 'Moving average lines', grain: 'Configurable', benchmark: 'Smoothed trends', enabled: false },
  { id: 'HELP006', category: 'Helper', title: 'Seasonality Index', formula: '=CurrentPeriod / HistoricalAverage', fields: 'Historical patterns', visual: 'Seasonal chart', grain: 'Monthly', benchmark: 'Understand cycles', enabled: false },
  { id: 'HELP007', category: 'Helper', title: 'Data Freshness', formula: '=NOW() - LastUpdate', fields: 'Update timestamps', visual: 'Status indicator', grain: 'Real-time', benchmark: '<24 hours', enabled: false },

  // Board UX Metrics (6)
  { id: 'UX001', category: 'Board UX', title: 'Executive Score', formula: '=WeightedAvg(KeyMetrics)', fields: 'Selected KPIs', visual: 'Single score card', grain: 'Weekly', benchmark: '>80/100', enabled: true },
  { id: 'UX002', category: 'Board UX', title: 'Traffic Light Status', formula: '=IF(Metric<Red, "Red", IF(Metric<Yellow, "Yellow", "Green"))', fields: 'All metrics vs thresholds', visual: 'Traffic light grid', grain: 'Real-time', benchmark: 'Maximize green', enabled: true },
  { id: 'UX003', category: 'Board UX', title: 'Trend Arrows', formula: '=CurrentValue - PriorValue', fields: 'All metrics with history', visual: 'Arrow indicators', grain: 'Period over period', benchmark: 'Positive trends', enabled: true },
  { id: 'UX004', category: 'Board UX', title: 'Top Insights', formula: '=RANK(MetricChanges)', fields: 'All metric deltas', visual: 'Insight cards', grain: 'Weekly', benchmark: 'Actionable items', enabled: false },
  { id: 'UX005', category: 'Board UX', title: 'Action Items', formula: '=GenerateActions(OutOfRangeMetrics)', fields: 'Metrics below threshold', visual: 'Task list', grain: 'Real-time', benchmark: 'Clear next steps', enabled: false },
  { id: 'UX006', category: 'Board UX', title: 'Performance Index', formula: '=CompositeScore(AllCategories)', fields: 'Category averages', visual: 'Spider chart', grain: 'Weekly', benchmark: 'Balanced scorecard', enabled: false }
];

// Main Component
const MetricsCatalog = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [metrics, setMetrics] = useState(ALL_METRICS_DATA);
  const [showEnabledOnly, setShowEnabledOnly] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState(null);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  
  // Local state for dashboard metrics
  const [selectedForDashboard, setSelectedForDashboard] = useState([]);
  const [registry, setRegistry] = useState({});

  // Initialize registry with our metrics
  useEffect(() => {
    const reg = {};
    for (const m of metrics) {
      reg[m.id] = { 
        ...m, 
        key: m.id.toLowerCase(),
        label: m.title,
        formatter: m.formatterName ? formatters[m.formatterName] : null 
      };
    }
    setRegistry(reg);
  }, [metrics]);

  // Dashboard management functions
  const addToDashboard = (metricId) => {
    setSelectedForDashboard(prev => [...prev, metricId]);
  };

  const removeFromDashboard = (metricId) => {
    setSelectedForDashboard(prev => prev.filter(id => id !== metricId));
  };

  // Check if metric is on dashboard
  const isOnDashboard = (metricId) => {
    return selectedForDashboard.includes(metricId);
  };

  // Toggle metric on dashboard
  const toggleDashboard = (metric) => {
    if (isOnDashboard(metric.id)) {
      removeFromDashboard(metric.id);
    } else {
      addToDashboard(metric.id);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const enabledMetrics = metrics.filter(m => m.enabled);
    const categories = [...new Set(metrics.map(m => m.category))];
    
    return {
      total: metrics.length,
      enabled: enabledMetrics.length,
      categories: categories.length,
      completion: Math.round((enabledMetrics.length / metrics.length) * 100)
    };
  }, [metrics]);

  // Filter metrics
  const filteredMetrics = useMemo(() => {
    let filtered = [...metrics];
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.fields.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (showEnabledOnly) {
      filtered = filtered.filter(m => m.enabled);
    }
    
    return filtered;
  }, [metrics, selectedCategory, searchQuery, showEnabledOnly]);

  // Get unique categories
  const categories = useMemo(() => {
    return ['All', ...new Set(metrics.map(m => m.category))];
  }, [metrics]);

  // Toggle metric enabled status
  const toggleMetric = (id) => {
    setMetrics(prev => prev.map(m => 
      m.id === id ? { ...m, enabled: !m.enabled } : m
    ));
  };

  // Export metrics configuration
  const exportConfig = () => {
    const config = metrics.map(m => ({
      id: m.id,
      enabled: m.enabled
    }));
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'metrics-config.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Metric Card Component
  const MetricCard = ({ metric }) => {
    const isExpanded = expandedMetric === metric.id;
    
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-all">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white">{metric.title}</h4>
              <span className="text-xs px-2 py-1 bg-slate-700 rounded text-gray-400">
                {metric.category}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{metric.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleDashboard(metric)}
              className={`p-2 rounded-lg transition-colors ${
                isOnDashboard(metric.id)
                  ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                  : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
              }`}
              title={isOnDashboard(metric.id) ? 'Remove from dashboard' : 'Add to dashboard'}
            >
              {isOnDashboard(metric.id) ? <i className="fas fa-star"></i> : <i className="far fa-star"></i>}
            </button>
            <button
              onClick={() => toggleMetric(metric.id)}
              className={`p-2 rounded-lg transition-colors ${
                metric.enabled 
                  ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' 
                  : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
              }`}
              title={metric.enabled ? 'Disable metric' : 'Enable metric'}
            >
              {metric.enabled ? <i className="fas fa-eye"></i> : <i className="fas fa-eye-slash"></i>}
            </button>
            <button
              onClick={() => setExpandedMetric(isExpanded ? null : metric.id)}
              className="p-2 rounded-lg bg-slate-700 text-gray-400 hover:bg-slate-600 transition-colors"
              title="Expand details"
            >
              {isExpanded ? <i className="fas fa-chevron-up"></i> : <i className="fas fa-chevron-down"></i>}
            </button>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <i className="fas fa-calculator text-blue-400"></i>
            <code className="text-xs bg-slate-900 px-2 py-1 rounded text-blue-300 break-all">
              {metric.formula}
            </code>
          </div>
          
          {metric.benchmark && (
            <div className="flex items-center gap-2">
              <i className="fas fa-chart-line text-green-400"></i>
              <span className="text-xs text-green-400">{metric.benchmark}</span>
            </div>
          )}
          
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
              <div>
                <span className="text-xs text-gray-500">Required Fields:</span>
                <p className="text-xs text-gray-300 mt-1">{metric.fields}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Visualization:</span>
                <p className="text-xs text-gray-300 mt-1">{metric.visual}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Update Frequency:</span>
                <p className="text-xs text-gray-300 mt-1">{metric.grain}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Visual Types Showcase
  const VisualShowcase = () => {
    const visualTypes = [
      { name: 'KPI Cards', count: 28, icon: '📊', color: 'bg-blue-900/30' },
      { name: 'Line Charts', count: 15, icon: '📈', color: 'bg-green-900/30' },
      { name: 'Bar Charts', count: 12, icon: '📊', color: 'bg-purple-900/30' },
      { name: 'Gauges', count: 8, icon: '🎯', color: 'bg-orange-900/30' },
      { name: 'Funnels', count: 6, icon: '🔻', color: 'bg-pink-900/30' },
      { name: 'Heat Maps', count: 4, icon: '🗺️', color: 'bg-red-900/30' },
      { name: 'Waterfalls', count: 3, icon: '💧', color: 'bg-cyan-900/30' },
      { name: 'Spider Charts', count: 2, icon: '🕸️', color: 'bg-indigo-900/30' },
      { name: 'Progress Bars', count: 7, icon: '⏳', color: 'bg-yellow-900/30' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visualTypes.map((viz, idx) => (
          <div key={idx} className={`${viz.color} rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer`}>
            <div className="text-4xl mb-3">{viz.icon}</div>
            <h4 className="font-semibold text-white text-lg">{viz.name}</h4>
            <p className="text-sm text-gray-400 mt-2">
              Used by {viz.count} metrics
            </p>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <i className="fas fa-chart-line mr-1"></i>
              Click to see examples
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Category Overview
  const CategoryOverview = () => {
    const categoryStats = useMemo(() => {
      const stats = {};
      metrics.forEach(m => {
        if (!stats[m.category]) {
          stats[m.category] = { total: 0, enabled: 0 };
        }
        stats[m.category].total++;
        if (m.enabled) stats[m.category].enabled++;
      });
      return stats;
    }, [metrics]);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(categoryStats).map(([cat, stat]) => (
          <div 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`bg-slate-800/50 backdrop-blur rounded-lg p-4 border cursor-pointer transition-all ${
              selectedCategory === cat ? 'border-blue-500 bg-slate-700/50' : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <h4 className="font-medium text-sm text-gray-300 mb-2">{cat}</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{stat.enabled}</span>
              <span className="text-sm text-gray-500">/ {stat.total}</span>
            </div>
            <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                style={{ width: `${(stat.enabled / stat.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Metrics Catalog & Glossary</h2>
          <p className="text-gray-400 text-sm">Complete reference guide for all 85 financial metrics tracked in BizGro KPI 2.0</p>
        </div>
        <button
          onClick={() => setShowRecommendationModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Recommend Metric
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Metrics</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <i className="fas fa-database text-2xl text-blue-400"></i>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-green-400">{stats.enabled}</p>
            </div>
            <i className="fas fa-eye text-2xl text-green-400"></i>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Categories</p>
              <p className="text-2xl font-bold text-white">{stats.categories}</p>
            </div>
            <i className="fas fa-filter text-2xl text-purple-400"></i>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Coverage</p>
              <p className="text-2xl font-bold text-blue-400">{stats.completion}%</p>
            </div>
            <i className="fas fa-chart-line text-2xl text-blue-400"></i>
          </div>
        </div>
      </div>

      {/* Category Overview */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Category Overview</h3>
        <CategoryOverview />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['catalog', 'visual', 'export'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${
              activeTab === tab 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {tab === 'catalog' && 'Metrics Catalog'}
            {tab === 'visual' && 'Visualizations'}
            {tab === 'export' && 'Export & Import'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'catalog' && (
        <>
          {/* Search and Filters */}
          <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 border border-slate-700 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Search metrics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400"
                  />
                </div>
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEnabledOnly}
                  onChange={(e) => setShowEnabledOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-gray-300">Active only</span>
              </label>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMetrics.map(metric => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
          
          {filteredMetrics.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-exclamation-circle text-5xl text-gray-600 mb-4"></i>
              <p className="text-gray-400">No metrics found matching your criteria</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'visual' && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-6 text-white">Visualization Types</h3>
          <VisualShowcase />
        </div>
      )}

      {activeTab === 'export' && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-6 text-white">Export & Import Configuration</h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-700 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Export Current Configuration</h4>
              <p className="text-sm text-gray-400 mb-4">Download your current metrics configuration including enabled/disabled status</p>
              <button
                onClick={exportConfig}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <i className="fas fa-download"></i>
                Export Configuration
              </button>
            </div>
            
            <div className="p-4 bg-slate-700 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Import Configuration</h4>
              <p className="text-sm text-gray-400 mb-4">Upload a previously exported configuration file</p>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <i className="fas fa-upload"></i>
                Import Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Modal */}
      {showRecommendationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4 text-white">Recommend New Metric</h3>
            <p className="text-gray-400 mb-4">
              Thank you for your interest in improving our metrics system! 
              Please email your metric recommendations to: <span className="text-blue-400">metrics@bizgro.com</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Include: Metric name, formula, required fields, suggested visualization, and business justification.
            </p>
            <button
              onClick={() => setShowRecommendationModal(false)}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsCatalog;
