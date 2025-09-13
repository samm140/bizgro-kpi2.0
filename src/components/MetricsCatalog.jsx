// src/components/MetricsCatalog.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useMetricsStore } from '../state/metricsStore'; // relative path keeps Vite happy

// ---------- Formatters (labels only for Catalog; Dynamic uses utils/computeMetric) ----------
const FORMATTER_NAMES = ['pct', 'days', 'money', 'number'];

// ---------- Helpers: key & benchmark parsing ----------
const slugify = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

// Parses strings like:
// "Target: 1.5-2.0", ">95%", "Healthy if >0.5", "<45 days", "Keep <80%"
// Returns { target: {min?,max?} | null, formatterName?: 'pct'|'days'|'number' }
function parseBenchmark(benchmark = '', title = '') {
  const out = { target: null, formatterName: null };
  if (!benchmark) return out;

  const str = benchmark.toLowerCase();
  const isPct = str.includes('%');
  const isDays = str.includes('day');

  // Range: e.g., "1.5-2.0"
  const range = str.match(/(\d+(\.\d+)?)\s*[-–]\s*(\d+(\.\d+)?)/);
  if (range) {
    let min = parseFloat(range[1]);
    let max = parseFloat(range[3]);
    if (isPct) { min /= 100; max /= 100; }
    out.target = { min, max };
    out.formatterName = isPct ? 'pct' : isDays ? 'days' : null;
    return out;
  }

  // Comparators: <, >, ≤, ≥ etc (pick the first occurrence)
  // Examples: "<45 days", "> 1.0", "healthy if >0.5", "keep <80%"
  const lt = str.match(/(?:^|[\s:])<(=?)(\s*)(\d+(\.\d+)?)/);
  const gt = str.match(/(?:^|[\s:])>(=?)(\s*)(\d+(\.\d+)?)/);

  if (lt) {
    let max = parseFloat(lt[3]);
    if (isPct) max /= 100;
    out.target = { max };
    out.formatterName = isPct ? 'pct' : isDays ? 'days' : null;
    return out;
  }
  if (gt) {
    let min = parseFloat(gt[3]);
    if (isPct) min /= 100;
    out.target = { min };
    out.formatterName = isPct ? 'pct' : isDays ? 'days' : null;
    return out;
  }

  // Fallback heuristics by title if benchmark doesn't specify units
  if (!out.formatterName) {
    if (/%/.test(title)) out.formatterName = 'pct';
    else if (/days?|dso|dpo/i.test(title)) out.formatterName = 'days';
  }
  return out;
}

// ---------------------------------------------------------
// Complete metrics data - all 85 metrics (from your spec)
// ---------------------------------------------------------
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

// ---------- Catalog Card ----------
function CatalogCard({ metric, isSelected, onToggle }) {
  return (
    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-slate-200 font-medium">{metric.label}</div>
          <div className="text-xs text-slate-400 mt-1">{metric.category} • {metric.key}</div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span className="text-slate-500">Formula:</span> {metric.formula}
          </div>
          {metric.description && (
            <div className="mt-1 text-[11px] text-slate-500">{metric.description}</div>
          )}
        </div>
        <button
          onClick={onToggle}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
            isSelected ? 'bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
                       : 'bg-sky-500/15 text-sky-200 hover:bg-sky-500/25'
          }`}
        >
          {isSelected ? 'On Dashboard' : 'Add to Dashboard'}
        </button>
      </div>
    </div>
  );
}

export default function MetricsCatalog() {
  const { registry, setRegistry, selectedForDashboard, addToDashboard, removeFromDashboard } = useMetricsStore();
  const [query, setQuery] = useState('');

  // Build registry from ALL_METRICS_DATA, and PARSE benchmarks -> {target, formatterName}
  useEffect(() => {
    if (!registry || Object.keys(registry).length === 0) {
      const reg = {};
      for (const m of ALL_METRICS_DATA) {
        const parsed = parseBenchmark(m.benchmark, m.title);
        reg[m.id] = {
          id: m.id,
          key: slugify(m.title || m.id),
          label: m.title || m.id,
          category: m.category,
          // Strip leading '=' for our evaluator
          formula: (m.formula || '').replace(/^=/, ''),
          description: m.benchmark || '',
          target: parsed.target || null,
          formatterName: parsed.formatterName || null,
        };
      }
      setRegistry(reg);
    }
  }, [registry, setRegistry]);

  const list = useMemo(() => Object.values(registry || {}), [registry]);

  const categories = useMemo(() => {
    const m = new Map();
    for (const item of list) {
      if (query && !(`${item.label} ${item.key} ${item.category}`.toLowerCase().includes(query.toLowerCase()))) continue;
      if (!m.has(item.category)) m.set(item.category, []);
      m.get(item.category).push(item);
    }
    return Array.from(m.entries());
  }, [list, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-200">Metrics Catalog</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search metrics…"
          className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-6">
        {categories.map(([cat, items]) => (
          <section key={cat}>
            <div className="text-slate-300 text-sm mb-2">{cat}</div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((metric) => {
                const isSelected = selectedForDashboard.includes(metric.id);
                return (
                  <CatalogCard
                    key={metric.id}
                    metric={metric}
                    isSelected={isSelected}
                    onToggle={() =>
                      isSelected ? removeFromDashboard(metric.id) : addToDashboard(metric.id)
                    }
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

