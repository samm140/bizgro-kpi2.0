// src/components/dashboard/FinancialChartsIntegrated.jsx
// This version connects to your WeeklyEntry data structure and computes metrics

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Users,
  Target,
  Calendar,
  AlertTriangle,
  BarChart3,
  PieChart,
  Clock,
  Briefcase,
  Database,
  Shield,
  Percent,
  Download,
  RefreshCw,
  Zap,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { computeMetric, evaluateTarget, applyFormatter } from '../../utils/computeMetric';
import { useMetricsData } from '../../hooks/useMetricsData';

/**
 * This component expects data from your WeeklyEntry.jsx form with these fields:
 * 
 * ACCOUNTING & CASH:
 * - CurrentAR (Current Accounts Receivable)
 * - RetentionReceivables
 * - OverdueAR (Overdue AR >90 days)
 * - CurrentAP (Current Accounts Payable)
 * - CashOnHand (Cash on Hand QB)
 * - CashBank (Cash in Bank)
 * 
 * SALES & REVENUE:
 * - RevenueBilled (Revenue Billed)
 * - Retention
 * - Collections (Collections/Deposits)
 * - ChangeOrders
 * 
 * PROFITABILITY & COSTS:
 * - GrossProfitAccrual (Gross Profit Accrual)
 * - COGSAccrual (COGS Accrual)
 * - GrossWagesAccrual (Gross Wages Accrual)
 * 
 * BIDS & FUNNEL:
 * - InvitesExisting (Invites - Existing GCs)
 * - InvitesNew (Invites - New GCs)
 * - NewEstimatedJobsNumber (New Estimated Jobs #)
 * - TotalEstimates
 * - JobsWonNumber (Jobs Won #)
 * - JobsWonDollar (Jobs Won $)
 * 
 * PROJECTS & BACKLOG:
 * - JobsStartedNumber (Jobs Started #)
 * - JobsStartedDollar (Jobs Started $)
 * - JobsCompletedNumber (Jobs Completed #)
 * - UpcomingJobs (Upcoming Jobs/Backlog)
 * - WIP (Work in Progress)
 * - RevenueLeftToBill
 * 
 * WORKFORCE:
 * - FieldEmployees
 * - Supervisors
 * - Office
 * - NewHires
 * - EmployeesFired (Employees Fired/Lost)
 * 
 * RISK METRICS:
 * - TopCustomerConcentration (Top Customer Concentration %)
 * 
 * META:
 * - WeekEndingDate (Week Ending Date)
 */

// Computed Metrics based on your WeeklyEntry fields
const COMPUTED_METRICS = {
  // Quick Calculations (shown in your form header)
  totalCash: (data) => {
    const cashBank = parseFloat(data.CashBank) || 0;
    const cashOnHand = parseFloat(data.CashOnHand) || 0;
    return cashBank + cashOnHand;
  },
  
  currentRatio: (data) => {
    const currentAssets = (parseFloat(data.CashBank) || 0) + 
                          (parseFloat(data.CashOnHand) || 0) + 
                          (parseFloat(data.CurrentAR) || 0);
    const currentLiabilities = parseFloat(data.CurrentAP) || 0;
    return currentLiabilities > 0 ? (currentAssets / currentLiabilities).toFixed(2) : 'N/A';
  },
  
  grossMargin: (data) => {
    const grossProfit = parseFloat(data.GrossProfitAccrual) || 0;
    const revenue = parseFloat(data.RevenueBilled) || 0;
    return revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : 'N/A';
  },
  
  // Additional KPIs
  quickRatio: (data) => {
    const quickAssets = (parseFloat(data.CashBank) || 0) + 
                       (parseFloat(data.CashOnHand) || 0) + 
                       (parseFloat(data.CurrentAR) || 0) - 
                       (parseFloat(data.RetentionReceivables) || 0);
    const currentLiabilities = parseFloat(data.CurrentAP) || 0;
    return currentLiabilities > 0 ? (quickAssets / currentLiabilities).toFixed(2) : 'N/A';
  },
  
  dso: (data) => {
    const ar = parseFloat(data.CurrentAR) || 0;
    const revenue = parseFloat(data.RevenueBilled) || 0;
    return revenue > 0 ? Math.round((ar / revenue) * 30) : 'N/A';
  },
  
  collectionEfficiency: (data) => {
    const collections = parseFloat(data.Collections) || 0;
    const revenue = parseFloat(data.RevenueBilled) || 0;
    return revenue > 0 ? ((collections / revenue) * 100).toFixed(1) : 'N/A';
  },
  
  winRate: (data) => {
    const jobsWon = parseFloat(data.JobsWonNumber) || 0;
    const totalEstimates = parseFloat(data.TotalEstimates) || 0;
    return totalEstimates > 0 ? ((jobsWon / totalEstimates) * 100).toFixed(1) : 'N/A';
  },
  
  avgDealSize: (data) => {
    const jobsWonDollar = parseFloat(data.JobsWonDollar) || 0;
    const jobsWonNumber = parseFloat(data.JobsWonNumber) || 0;
    return jobsWonNumber > 0 ? Math.round(jobsWonDollar / jobsWonNumber) : 0;
  },
  
  projectStartRate: (data) => {
    const jobsStarted = parseFloat(data.JobsStartedNumber) || 0;
    const jobsWon = parseFloat(data.JobsWonNumber) || 0;
    return jobsWon > 0 ? ((jobsStarted / jobsWon) * 100).toFixed(1) : 'N/A';
  },
  
  totalHeadcount: (data) => {
    return (parseFloat(data.FieldEmployees) || 0) + 
           (parseFloat(data.Supervisors) || 0) + 
           (parseFloat(data.Office) || 0);
  },
  
  revenuePerEmployee: (data) => {
    const revenue = parseFloat(data.RevenueBilled) || 0;
    const headcount = COMPUTED_METRICS.totalHeadcount(data);
    return headcount > 0 ? Math.round(revenue / headcount) : 0;
  },
  
  overdueARPercent: (data) => {
    const overdueAR = parseFloat(data.OverdueAR) || 0;
    const currentAR = parseFloat(data.CurrentAR) || 0;
    return currentAR > 0 ? ((overdueAR / currentAR) * 100).toFixed(1) : '0';
  },
  
  retentionPercent: (data) => {
    const retention = parseFloat(data.RetentionReceivables) || 0;
    const currentAR = parseFloat(data.CurrentAR) || 0;
    return currentAR > 0 ? ((retention / currentAR) * 100).toFixed(1) : '0';
  },
  
  cashConversionCycle: (data) => {
    const dso = COMPUTED_METRICS.dso(data);
    // Estimate DPO (Days Payable Outstanding) as 30 days
    const dpo = 30;
    return typeof dso === 'number' ? dso - dpo : 'N/A';
  },
  
  backlogMonths: (data) => {
    const backlog = parseFloat(data.UpcomingJobs) || 0;
    const monthlyRevenue = parseFloat(data.RevenueBilled) || 0;
    return monthlyRevenue > 0 ? (backlog / monthlyRevenue).toFixed(1) : 'N/A';
  }
};

// Helper to safely parse numeric values
const getNumericValue = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '' || value === '-') return defaultValue;
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[$,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultValue : parsed;
};

// KPI Card Component
const KPICard = ({ label, value, change, changeType, icon: Icon, target }) => {
  const isPositive = changeType === 'positive';
  const ChangeIcon = isPositive ? ArrowUp : ArrowDown;
  
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-white">
            {value}
          </p>
        </div>
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
      </div>
      {change && (
        <div className={`flex items-center gap-1.5 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          <ChangeIcon className="w-4 h-4" />
          <span>{change}</span>
        </div>
      )}
      {target && (
        <div className="text-xs text-slate-500 mt-2">
          Target: {target}
        </div>
      )}
    </div>
  );
};

// Chart Container Component
const ChartContainer = ({ title, icon: Icon, children, className = "" }) => {
  return (
    <div className={`bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 ${className}`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
};

// Main Component
export default function FinancialChartsIntegrated({ data, weeklyEntries }) {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  // Use the custom hook if no data is passed
  const { loading, data: hookData, lastUpdated, error, refresh } = useMetricsData();
  
  // Priority: props data > hook data > empty object
  const currentData = data || hookData || {};
  
  // Get all weekly entries (for historical charts)
  const allEntries = weeklyEntries || currentData.allEntries || [];
  
  // Get the most recent entry for current metrics
  const latestEntry = allEntries.length > 0 ? allEntries[allEntries.length - 1] : {};
  
  // Calculate all metrics using your formulas
  const metrics = useMemo(() => {
    const result = {};
    for (const [key, calculator] of Object.entries(COMPUTED_METRICS)) {
      result[key] = calculator(latestEntry);
    }
    return result;
  }, [latestEntry]);
  
  // Calculate previous period metrics for comparison
  const previousMetrics = useMemo(() => {
    if (allEntries.length > 1) {
      const previousEntry = allEntries[allEntries.length - 2];
      const result = {};
      for (const [key, calculator] of Object.entries(COMPUTED_METRICS)) {
        result[key] = calculator(previousEntry);
      }
      return result;
    }
    return {};
  }, [allEntries]);
  
  // Chart refs
  const chartRefs = {
    cashFlow: useRef(null),
    revenue: useRef(null),
    arAging: useRef(null),
    pipeline: useRef(null),
    profit: useRef(null),
    workforce: useRef(null),
    bidFunnel: useRef(null),
    workingCapital: useRef(null),
    customerConcentration: useRef(null)
  };
  
  const chartInstances = useRef({});
  
  // Chart configuration
  const chartColors = {
    primary: 'rgba(59, 130, 246, 1)',
    secondary: 'rgba(147, 51, 234, 1)',
    success: 'rgba(34, 197, 94, 1)',
    danger: 'rgba(239, 68, 68, 1)',
    warning: 'rgba(245, 158, 11, 1)',
    info: 'rgba(6, 182, 212, 1)',
    primaryAlpha: 'rgba(59, 130, 246, 0.1)',
    secondaryAlpha: 'rgba(147, 51, 234, 0.1)',
    successAlpha: 'rgba(34, 197, 94, 0.1)',
    dangerAlpha: 'rgba(239, 68, 68, 0.1)',
  };
  
  // Initialize charts with your data
  useEffect(() => {
    if (allEntries.length === 0) return;
    
    // Destroy existing charts
    Object.values(chartInstances.current).forEach(chart => {
      if (chart) chart.destroy();
    });
    
    // Get last 6 weeks of data
    const recentEntries = allEntries.slice(-6);
    const weekLabels = recentEntries.map((entry, i) => 
      entry.WeekEndingDate ? `W ${entry.WeekEndingDate}` : `Week ${i + 1}`
    );
    
    // Cash Flow Chart - Using Collections data
    if (chartRefs.cashFlow.current) {
      const ctx = chartRefs.cashFlow.current.getContext('2d');
      const cashInData = recentEntries.map(e => getNumericValue(e.Collections));
      const cashOutData = recentEntries.map(e => 
        getNumericValue(e.COGSAccrual) + getNumericValue(e.GrossWagesAccrual)
      );
      const netCashData = cashInData.map((val, i) => val - cashOutData[i]);
      
      chartInstances.current.cashFlow = new Chart(ctx, {
        type: 'line',
        data: {
          labels: weekLabels,
          datasets: [
            {
              label: 'Collections (Cash In)',
              data: cashInData,
              borderColor: chartColors.success,
              backgroundColor: chartColors.successAlpha,
              tension: 0.4
            },
            {
              label: 'Costs (Cash Out)',
              data: cashOutData,
              borderColor: chartColors.danger,
              backgroundColor: chartColors.dangerAlpha,
              tension: 0.4
            },
            {
              label: 'Net Cash Flow',
              data: netCashData,
              borderColor: chartColors.primary,
              backgroundColor: chartColors.primaryAlpha,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8' } }
          },
          scales: {
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } },
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } }
          }
        }
      });
    }
    
    // Revenue vs Collections Chart
    if (chartRefs.revenue.current) {
      const ctx = chartRefs.revenue.current.getContext('2d');
      const revenueData = recentEntries.map(e => getNumericValue(e.RevenueBilled));
      const collectionsData = recentEntries.map(e => getNumericValue(e.Collections));
      
      chartInstances.current.revenue = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: weekLabels,
          datasets: [
            {
              label: 'Revenue Billed',
              data: revenueData,
              backgroundColor: chartColors.primary
            },
            {
              label: 'Collections',
              data: collectionsData,
              backgroundColor: chartColors.secondary
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8' } }
          },
          scales: {
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } },
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } }
          }
        }
      });
    }
    
    // AR Aging Analysis - Using your fields
    if (chartRefs.arAging.current && latestEntry) {
      const ctx = chartRefs.arAging.current.getContext('2d');
      const currentAR = getNumericValue(latestEntry.CurrentAR);
      const overdueAR = getNumericValue(latestEntry.OverdueAR);
      const retentionAR = getNumericValue(latestEntry.RetentionReceivables);
      const currentClean = currentAR - overdueAR - retentionAR;
      
      chartInstances.current.arAging = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Current', 'Retention', 'Overdue >90 days'],
          datasets: [{
            data: [currentClean, retentionAR, overdueAR],
            backgroundColor: [chartColors.success, chartColors.warning, chartColors.danger]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#94a3b8' } }
          }
        }
      });
    }
    
    // Project Pipeline - Using your project fields
    if (chartRefs.pipeline.current && latestEntry) {
      const ctx = chartRefs.pipeline.current.getContext('2d');
      const pipelineData = [
        getNumericValue(latestEntry.TotalEstimates),
        getNumericValue(latestEntry.JobsWonDollar),
        getNumericValue(latestEntry.JobsStartedDollar),
        getNumericValue(latestEntry.WIP),
        getNumericValue(latestEntry.UpcomingJobs)
      ];
      
      chartInstances.current.pipeline = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Estimates', 'Won', 'Started', 'WIP', 'Backlog'],
          datasets: [{
            label: 'Project Value',
            data: pipelineData,
            backgroundColor: [
              chartColors.info,
              chartColors.warning,
              chartColors.primary,
              chartColors.success,
              chartColors.secondary
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } }
          }
        }
      });
    }
    
    // Profitability Chart - Using your P&L fields
    if (chartRefs.profit.current) {
      const ctx = chartRefs.profit.current.getContext('2d');
      const grossProfitData = recentEntries.map(e => getNumericValue(e.GrossProfitAccrual));
      const cogsData = recentEntries.map(e => getNumericValue(e.COGSAccrual));
      const wagesData = recentEntries.map(e => getNumericValue(e.GrossWagesAccrual));
      
      chartInstances.current.profit = new Chart(ctx, {
        type: 'line',
        data: {
          labels: weekLabels,
          datasets: [
            {
              label: 'Gross Profit',
              data: grossProfitData,
              borderColor: chartColors.success,
              backgroundColor: chartColors.successAlpha,
              fill: true,
              tension: 0.4
            },
            {
              label: 'COGS',
              data: cogsData,
              borderColor: chartColors.danger,
              backgroundColor: chartColors.dangerAlpha,
              fill: true,
              tension: 0.4
            },
            {
              label: 'Wages',
              data: wagesData,
              borderColor: chartColors.warning,
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8' } }
          },
          scales: {
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } },
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } }
          }
        }
      });
    }
    
    // Workforce Distribution - Using your workforce fields
    if (chartRefs.workforce.current && latestEntry) {
      const ctx = chartRefs.workforce.current.getContext('2d');
      const workforceData = [
        getNumericValue(latestEntry.FieldEmployees),
        getNumericValue(latestEntry.Supervisors),
        getNumericValue(latestEntry.Office)
      ];
      
      chartInstances.current.workforce = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Field Employees', 'Supervisors', 'Office Staff'],
          datasets: [{
            data: workforceData,
            backgroundColor: [chartColors.primary, chartColors.secondary, chartColors.info]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#94a3b8' } }
          }
        }
      });
    }
    
    // Bid Funnel - Using your bid tracking fields
    if (chartRefs.bidFunnel.current && latestEntry) {
      const ctx = chartRefs.bidFunnel.current.getContext('2d');
      const totalInvites = getNumericValue(latestEntry.InvitesExisting) + 
                          getNumericValue(latestEntry.InvitesNew);
      
      chartInstances.current.bidFunnel = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Invites', 'New Estimates', 'Total Estimates', 'Jobs Won'],
          datasets: [
            {
              label: 'Count',
              data: [
                totalInvites,
                getNumericValue(latestEntry.NewEstimatedJobsNumber),
                getNumericValue(latestEntry.TotalEstimates),
                getNumericValue(latestEntry.JobsWonNumber)
              ],
              backgroundColor: chartColors.primary
            },
            {
              label: 'Value ($K)',
              data: [
                0, // No dollar value for invites
                getNumericValue(latestEntry.TotalEstimates) / 1000,
                getNumericValue(latestEntry.TotalEstimates) / 1000,
                getNumericValue(latestEntry.JobsWonDollar) / 1000
              ],
              backgroundColor: chartColors.secondary
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8' } }
          },
          scales: {
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } },
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } }
          }
        }
      });
    }
    
    // Working Capital - Using your balance sheet fields
    if (chartRefs.workingCapital.current && latestEntry) {
      const ctx = chartRefs.workingCapital.current.getContext('2d');
      const currentAssets = getNumericValue(latestEntry.CashBank) + 
                           getNumericValue(latestEntry.CashOnHand) + 
                           getNumericValue(latestEntry.CurrentAR);
      const currentLiabilities = getNumericValue(latestEntry.CurrentAP);
      const workingCapital = currentAssets - currentLiabilities;
      
      chartInstances.current.workingCapital = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Current Assets', 'Current Liabilities', 'Working Capital'],
          datasets: [{
            label: 'Amount',
            data: [currentAssets, currentLiabilities, workingCapital],
            backgroundColor: [chartColors.success, chartColors.danger, chartColors.primary]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148, 163, 184, 0.1)' } }
          }
        }
      });
    }
    
    // Customer Concentration - Using your risk field
    if (chartRefs.customerConcentration.current && latestEntry) {
      const ctx = chartRefs.customerConcentration.current.getContext('2d');
      const topCustomer = getNumericValue(latestEntry.TopCustomerConcentration) || 28;
      const remaining = 100 - topCustomer;
      
      chartInstances.current.customerConcentration = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Top Customer', 'Other Customers'],
          datasets: [{
            data: [topCustomer, remaining],
            backgroundColor: [chartColors.danger, chartColors.success]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8' } },
            title: {
              display: true,
              text: 'Revenue Concentration (%)',
              color: '#94a3b8'
            }
          }
        }
      });
    }
    
    // Cleanup
    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [allEntries, latestEntry]);
  
  // Format currency
  const formatCurrency = (value) => {
    const num = getNumericValue(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };
  
  // Calculate changes
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0 || previous === 'N/A') return null;
    const curr = parseFloat(current);
    const prev = parseFloat(previous);
    if (isNaN(curr) || isNaN(prev)) return null;
    const change = ((curr - prev) / prev) * 100;
    return `${Math.abs(change).toFixed(1)}% ${change >= 0 ? 'increase' : 'decrease'}`;
  };
  
  if (loading && !latestEntry) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading financial data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12 bg-red-900/20 rounded-lg">
        <p className="text-red-400 mb-4">Error loading data: {error}</p>
        <button onClick={refresh} className="px-4 py-2 bg-blue-600 text-white rounded">
          Retry
        </button>
      </div>
    );
  }
  
  if (allEntries.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/30 rounded-lg">
        <p className="text-slate-400 mb-4">No weekly entries found</p>
        <p className="text-sm text-slate-500">Please add weekly entries to see financial charts</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">📊 Financial Dashboard</h1>
        <p className="text-slate-400">
          Week Ending: {latestEntry.WeekEndingDate || 'N/A'} | 
          Total Entries: {allEntries.length}
        </p>
        
        {/* KPI Cards - Using computed metrics from your data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-6">
          <KPICard
            label="Total Cash"
            value={formatCurrency(metrics.totalCash)}
            change={calculateChange(metrics.totalCash, previousMetrics.totalCash)}
            changeType={metrics.totalCash > (previousMetrics.totalCash || 0) ? 'positive' : 'negative'}
            icon={DollarSign}
          />
          <KPICard
            label="Current Ratio"
            value={`${metrics.currentRatio}x`}
            change={calculateChange(metrics.currentRatio, previousMetrics.currentRatio)}
            changeType={parseFloat(metrics.currentRatio) > 1.5 ? 'positive' : 'negative'}
            icon={Activity}
            target="≥1.5x"
          />
          <KPICard
            label="Gross Margin"
            value={`${metrics.grossMargin}%`}
            change={calculateChange(metrics.grossMargin, previousMetrics.grossMargin)}
            changeType={parseFloat(metrics.grossMargin) > 30 ? 'positive' : 'negative'}
            icon={Percent}
            target="≥30%"
          />
          <KPICard
            label="DSO"
            value={`${metrics.dso} days`}
            change={calculateChange(metrics.dso, previousMetrics.dso)}
            changeType={metrics.dso < 45 ? 'positive' : 'negative'}
            icon={Clock}
            target="≤45 days"
          />
          <KPICard
            label="Collection Rate"
            value={`${metrics.collectionEfficiency}%`}
            change={calculateChange(metrics.collectionEfficiency, previousMetrics.collectionEfficiency)}
            changeType={parseFloat(metrics.collectionEfficiency) > 90 ? 'positive' : 'negative'}
            icon={Zap}
            target="≥90%"
          />
          <KPICard
            label="Win Rate"
            value={`${metrics.winRate}%`}
            change={calculateChange(metrics.winRate, previousMetrics.winRate)}
            changeType={parseFloat(metrics.winRate) > 30 ? 'positive' : 'negative'}
            icon={Target}
            target="≥33%"
          />
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <ChartContainer title="Cash Flow Trend" icon={DollarSign}>
            <div style={{ height: '300px' }}>
              <canvas ref={chartRefs.cashFlow} />
            </div>
          </ChartContainer>
          
          <ChartContainer title="Revenue vs Collections" icon={TrendingUp}>
            <div style={{ height: '300px' }}>
              <canvas ref={chartRefs.revenue} />
            </div>
          </ChartContainer>
          
          <ChartContainer title="AR Aging Analysis" icon={BarChart3}>
            <div style={{ height: '300px' }}>
              <canvas ref={chartRefs.arAging} />
            </div>
          </ChartContainer>
          
          <ChartContainer title="Project Pipeline" icon={Briefcase}>
            <div style={{ height: '300px' }}>
              <canvas ref={chartRefs.pipeline} />
            </div>
          </ChartContainer>
          
          <ChartContainer title="Profitability Breakdown" icon={DollarSign}>
            <div style={{ height: '300px' }}>
              <canvas ref={chartRefs.profit} />
            </div>
          </ChartContainer>
          
          <ChartContainer title="Workforce Distribution" icon={Users}>
            <div style={{ height: '300px' }}>
              <canvas ref={chartRefs.workforce} />
            </div>
          </ChartContainer>
          
          <ChartContainer title="Bid Funnel Conversion" icon={Target}>
            <div style={{ height: '300px' }}>
              <canvas ref={chartRefs.bidFunnel} />
            </div>
          </ChartContainer>
          
          <ChartContainer title="Working Capital" icon={Database}>
            <div style={{ height: '300px' }}>
              <canvas ref={chartRefs.workingCapital} />
            </div>
          </ChartContainer>
        </div>
        
        {/* Risk Metrics */}
        <ChartContainer title="Risk Analysis" icon={AlertTriangle} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div style={{ height: '300px' }}>
              <canvas ref={chartRefs.customerConcentration} />
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-slate-900/50 rounded-lg flex justify-between">
                <span className="text-sm text-slate-400">Top Customer %</span>
                <span className={`text-sm font-bold ${latestEntry.TopCustomerConcentration > 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {latestEntry.TopCustomerConcentration || 0}%
                </span>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg flex justify-between">
                <span className="text-sm text-slate-400">Overdue AR %</span>
                <span className={`text-sm font-bold ${parseFloat(metrics.overdueARPercent) > 15 ? 'text-red-400' : 'text-green-400'}`}>
                  {metrics.overdueARPercent}%
                </span>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg flex justify-between">
                <span className="text-sm text-slate-400">Retention %</span>
                <span className="text-sm font-bold text-blue-400">
                  {metrics.retentionPercent}%
                </span>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg flex justify-between">
                <span className="text-sm text-slate-400">Total Headcount</span>
                <span className="text-sm font-bold text-white">
                  {metrics.totalHeadcount}
                </span>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg flex justify-between">
                <span className="text-sm text-slate-400">Revenue/Employee</span>
                <span className="text-sm font-bold text-white">
                  {formatCurrency(metrics.revenuePerEmployee)}
                </span>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg flex justify-between">
                <span className="text-sm text-slate-400">Backlog Coverage</span>
                <span className="text-sm font-bold text-white">
                  {metrics.backlogMonths} months
                </span>
              </div>
            </div>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
