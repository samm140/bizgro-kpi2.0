// src/components/dashboard/FinancialChartsView.jsx
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
  Filter,
  ChevronUp,
  ChevronDown,
  Eye,
  FileText,
  Zap,
  Info,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Chart from 'chart.js/auto';

// Helper function to safely get numeric value from data
const getNumericValue = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '' || value === '-') return defaultValue;
  if (typeof value === 'number') return value;
  // Remove currency symbols and commas
  const cleaned = String(value).replace(/[$,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper function to calculate metrics from data
const calculateMetrics = (data) => {
  if (!data) return {};
  
  const currentEntry = Array.isArray(data) ? data[data.length - 1] : data;
  
  return {
    // Cash metrics
    totalCash: getNumericValue(currentEntry.CashBank) + getNumericValue(currentEntry.CashOnHand),
    currentRatio: currentEntry.CurrentAP ? 
      ((getNumericValue(currentEntry.CashBank) + getNumericValue(currentEntry.CashOnHand) + getNumericValue(currentEntry.CurrentAR)) / getNumericValue(currentEntry.CurrentAP)).toFixed(2) : 'N/A',
    quickRatio: currentEntry.CurrentAP ? 
      ((getNumericValue(currentEntry.CashBank) + getNumericValue(currentEntry.CashOnHand) + (getNumericValue(currentEntry.CurrentAR) - getNumericValue(currentEntry.RetentionReceivables))) / getNumericValue(currentEntry.CurrentAP)).toFixed(2) : 'N/A',
    
    // Profitability metrics
    grossMargin: currentEntry.RevenueBilled ? 
      ((getNumericValue(currentEntry.GrossProfitAccrual) / getNumericValue(currentEntry.RevenueBilled)) * 100).toFixed(1) : 'N/A',
    
    // Collections metrics
    dso: currentEntry.RevenueBilled ? 
      Math.round((getNumericValue(currentEntry.CurrentAR) / getNumericValue(currentEntry.RevenueBilled)) * 30) : 'N/A',
    collectionEfficiency: currentEntry.RevenueBilled ? 
      ((getNumericValue(currentEntry.Collections) / getNumericValue(currentEntry.RevenueBilled)) * 100).toFixed(1) : 'N/A',
    
    // Sales metrics
    winRate: currentEntry.TotalEstimates ? 
      ((getNumericValue(currentEntry.JobsWonNumber) / getNumericValue(currentEntry.TotalEstimates)) * 100).toFixed(1) : 'N/A',
    avgDealSize: currentEntry.JobsWonNumber ? 
      (getNumericValue(currentEntry.JobsWonDollar) / getNumericValue(currentEntry.JobsWonNumber)) : 0,
    
    // Workforce metrics
    totalHeadcount: getNumericValue(currentEntry.FieldEmployees) + 
                   getNumericValue(currentEntry.Supervisors) + 
                   getNumericValue(currentEntry.Office),
    turnoverRate: currentEntry.FieldEmployees ? 
      ((getNumericValue(currentEntry.EmployeesFired) / (getNumericValue(currentEntry.FieldEmployees) + getNumericValue(currentEntry.Supervisors) + getNumericValue(currentEntry.Office))) * 100).toFixed(1) : '0'
  };
};

// Helper function to get historical data for charts
const getHistoricalData = (allEntries, field, count = 6) => {
  if (!allEntries || !Array.isArray(allEntries)) return [];
  
  const recentEntries = allEntries.slice(-count);
  return recentEntries.map(entry => getNumericValue(entry[field]));
};

// Helper function to get week labels
const getWeekLabels = (allEntries, count = 6) => {
  if (!allEntries || !Array.isArray(allEntries)) {
    return ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
  }
  
  const recentEntries = allEntries.slice(-count);
  return recentEntries.map((entry, index) => {
    if (entry.WeekEndingDate) {
      const date = new Date(entry.WeekEndingDate);
      return `W${date.getMonth() + 1}/${date.getDate()}`;
    }
    return `Week ${index + 1}`;
  });
};

// KPI Card Component
const KPICard = ({ label, value, change, changeType, icon: Icon }) => {
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

// Metric Item Component
const MetricItem = ({ label, value, type = 'default' }) => {
  const valueColors = {
    default: 'text-white',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-blue-400'
  };

  return (
    <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm font-semibold ${valueColors[type]}`}>{value}</span>
    </div>
  );
};

// Submissions Table Row Component
const TableRow = ({ data, onView }) => {
  const statusStyles = {
    Complete: 'bg-green-900/30 text-green-400 border-green-500/30',
    Pending: 'bg-red-900/30 text-red-400 border-red-500/30',
    'In Review': 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
  };

  return (
    <tr className="hover:bg-slate-800/30 transition-colors">
      <td className="px-4 py-3 text-sm text-slate-300">{data.weekEnding}</td>
      <td className="px-4 py-3">
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusStyles[data.status]}`}>
          {data.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-300">{data.cashTotal}</td>
      <td className="px-4 py-3 text-sm text-slate-300">{data.revenueBilled}</td>
      <td className="px-4 py-3 text-sm text-slate-300">{data.collections}</td>
      <td className="px-4 py-3 text-sm text-slate-300">{data.grossMargin}</td>
      <td className="px-4 py-3 text-sm text-slate-300">{data.currentRatio}</td>
      <td className="px-4 py-3 text-sm text-slate-300">{data.jobsWon}</td>
      <td className="px-4 py-3 text-sm text-slate-300">{data.backlog}</td>
      <td className="px-4 py-3 text-sm text-slate-300">{data.submittedBy}</td>
      <td className="px-4 py-3">
        <button
          onClick={() => onView(data.id)}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          View
        </button>
      </td>
    </tr>
  );
};

// Main Financial Charts View Component
export default function FinancialChartsView({ data }) {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [activeFilters, setActiveFilters] = useState(['All Metrics']);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Extract metrics data from props
  const metricsData = data?.allEntries?.[data.allEntries.length - 1] || {};
  const allEntries = data?.allEntries || [];
  
  // Calculate current metrics
  const currentMetrics = useMemo(() => calculateMetrics(metricsData), [metricsData]);
  
  // Calculate comparison metrics (previous period)
  const previousMetrics = useMemo(() => {
    if (allEntries.length > 1) {
      return calculateMetrics(allEntries[allEntries.length - 2]);
    }
    return {};
  }, [allEntries]);
  
  // Chart refs
  const cashFlowChartRef = useRef(null);
  const revenueChartRef = useRef(null);
  const arAgingChartRef = useRef(null);
  const pipelineChartRef = useRef(null);
  const profitChartRef = useRef(null);
  const workforceChartRef = useRef(null);
  const bidFunnelChartRef = useRef(null);
  const workingCapitalChartRef = useRef(null);
  const customerConcentrationChartRef = useRef(null);

  // Chart instances refs
  const chartInstances = useRef({});

  // Transform data for table
  const tableData = useMemo(() => {
    if (!allEntries || allEntries.length === 0) return [];
    
    return allEntries.slice(-5).reverse().map((entry, index) => ({
      id: index + 1,
      weekEnding: entry.WeekEndingDate || `Week ${index + 1}`,
      status: entry.Status || 'Complete',
      cashTotal: `$${(getNumericValue(entry.CashBank) + getNumericValue(entry.CashOnHand)).toLocaleString()}`,
      revenueBilled: `$${getNumericValue(entry.RevenueBilled).toLocaleString()}`,
      collections: `$${getNumericValue(entry.Collections).toLocaleString()}`,
      grossMargin: entry.RevenueBilled ? 
        `${((getNumericValue(entry.GrossProfitAccrual) / getNumericValue(entry.RevenueBilled)) * 100).toFixed(1)}%` : 'N/A',
      currentRatio: currentMetrics.currentRatio ? `${currentMetrics.currentRatio}x` : 'N/A',
      jobsWon: entry.JobsWonNumber || '0',
      backlog: `$${(getNumericValue(entry.UpcomingJobs) / 1000).toFixed(0)}K`,
      submittedBy: entry.SubmittedBy || 'System'
    }));
  }, [allEntries, currentMetrics]);

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

  const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          padding: 15,
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  // Initialize and update charts
  useEffect(() => {
    const initializeCharts = () => {
      // Destroy existing charts
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });

      const weekLabels = getWeekLabels(allEntries);

      // Cash Flow Chart
      if (cashFlowChartRef.current) {
        const ctx = cashFlowChartRef.current.getContext('2d');
        const cashInData = getHistoricalData(allEntries, 'Collections');
        const cashOutData = cashInData.map(val => val * 0.85); // Estimate cash out as 85% of collections
        const netCashData = cashInData.map((val, i) => val - cashOutData[i]);

        chartInstances.current.cashFlow = new Chart(ctx, {
          type: 'line',
          data: {
            labels: weekLabels,
            datasets: [
              {
                label: 'Cash In',
                data: cashInData,
                borderColor: chartColors.success,
                backgroundColor: chartColors.successAlpha,
                tension: 0.4
              },
              {
                label: 'Cash Out',
                data: cashOutData,
                borderColor: chartColors.danger,
                backgroundColor: chartColors.dangerAlpha,
                tension: 0.4
              },
              {
                label: 'Net Cash',
                data: netCashData,
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primaryAlpha,
                tension: 0.4
              }
            ]
          },
          options: defaultChartOptions
        });
      }

      // Revenue vs Collections Chart
      if (revenueChartRef.current) {
        const ctx = revenueChartRef.current.getContext('2d');
        const revenueData = getHistoricalData(allEntries, 'RevenueBilled');
        const collectionsData = getHistoricalData(allEntries, 'Collections');

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
          options: defaultChartOptions
        });
      }

      // AR Aging Chart
      if (arAgingChartRef.current && metricsData) {
        const ctx = arAgingChartRef.current.getContext('2d');
        const currentAR = getNumericValue(metricsData.CurrentAR);
        const overdueAR = getNumericValue(metricsData.OverdueAR);
        const current = currentAR - overdueAR;
        const thirtyToSixty = currentAR * 0.2; // Estimate
        const sixtyToNinety = currentAR * 0.1; // Estimate

        chartInstances.current.arAging = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Current', '30-60 days', '60-90 days', '>90 days'],
            datasets: [{
              data: [current, thirtyToSixty, sixtyToNinety, overdueAR],
              backgroundColor: [
                chartColors.success,
                chartColors.warning,
                'rgba(245, 158, 11, 0.7)',
                chartColors.danger
              ]
            }]
          },
          options: {
            ...defaultChartOptions,
            plugins: {
              ...defaultChartOptions.plugins,
              legend: {
                ...defaultChartOptions.plugins.legend,
                position: 'right'
              }
            }
          }
        });
      }

      // Pipeline Chart
      if (pipelineChartRef.current && metricsData) {
        const ctx = pipelineChartRef.current.getContext('2d');
        const pipelineData = [
          getNumericValue(metricsData.TotalEstimates),
          getNumericValue(metricsData.JobsWonDollar),
          getNumericValue(metricsData.WIP),
          getNumericValue(metricsData.JobsCompletedNumber) * (getNumericValue(metricsData.JobsWonDollar) / Math.max(1, getNumericValue(metricsData.JobsWonNumber))),
          getNumericValue(metricsData.UpcomingJobs)
        ];

        chartInstances.current.pipeline = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Bidding', 'Awarded', 'In Progress', 'Completed', 'Backlog'],
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
            ...defaultChartOptions,
            indexAxis: 'y',
            plugins: {
              ...defaultChartOptions.plugins,
              legend: { display: false }
            }
          }
        });
      }

      // Profitability Chart
      if (profitChartRef.current) {
        const ctx = profitChartRef.current.getContext('2d');
        const grossProfitData = getHistoricalData(allEntries, 'GrossProfitAccrual');
        const cogsData = getHistoricalData(allEntries, 'COGSAccrual');

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
              }
            ]
          },
          options: defaultChartOptions
        });
      }

      // Workforce Chart
      if (workforceChartRef.current && metricsData) {
        const ctx = workforceChartRef.current.getContext('2d');
        const workforceData = [
          getNumericValue(metricsData.FieldEmployees),
          getNumericValue(metricsData.Supervisors),
          getNumericValue(metricsData.Office)
        ];

        chartInstances.current.workforce = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Field Employees', 'Supervisors', 'Office Staff'],
            datasets: [{
              data: workforceData,
              backgroundColor: [
                chartColors.primary,
                chartColors.secondary,
                chartColors.info
              ]
            }]
          },
          options: {
            ...defaultChartOptions,
            plugins: {
              ...defaultChartOptions.plugins,
              legend: {
                ...defaultChartOptions.plugins.legend,
                position: 'right'
              }
            }
          }
        });
      }

      // Bid Funnel Chart
      if (bidFunnelChartRef.current && metricsData) {
        const ctx = bidFunnelChartRef.current.getContext('2d');
        const invites = getNumericValue(metricsData.InvitesExisting) + getNumericValue(metricsData.InvitesNew);
        const estimates = getNumericValue(metricsData.NewEstimatedJobsNumber);
        const totalEstimates = getNumericValue(metricsData.TotalEstimates);
        const jobsWon = getNumericValue(metricsData.JobsWonNumber);

        chartInstances.current.bidFunnel = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Invites', 'Estimates', 'Submitted', 'Won'],
            datasets: [
              {
                label: 'Count',
                data: [invites, estimates, totalEstimates, jobsWon],
                backgroundColor: chartColors.primary
              },
              {
                label: 'Value ($K)',
                data: [
                  totalEstimates * 50, // Estimate value
                  getNumericValue(metricsData.TotalEstimates) / 1000,
                  getNumericValue(metricsData.TotalEstimates) / 1000 * 0.8,
                  getNumericValue(metricsData.JobsWonDollar) / 1000
                ],
                backgroundColor: chartColors.secondary
              }
            ]
          },
          options: defaultChartOptions
        });
      }

      // Working Capital Chart
      if (workingCapitalChartRef.current && metricsData) {
        const ctx = workingCapitalChartRef.current.getContext('2d');
        const currentAssets = getNumericValue(metricsData.CashBank) + 
                             getNumericValue(metricsData.CashOnHand) + 
                             getNumericValue(metricsData.CurrentAR);
        const currentLiabilities = getNumericValue(metricsData.CurrentAP);
        const workingCapital = currentAssets - currentLiabilities;

        chartInstances.current.workingCapital = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Current Assets', 'Current Liabilities', 'Working Capital'],
            datasets: [{
              label: 'Amount',
              data: [currentAssets, currentLiabilities, workingCapital],
              backgroundColor: [
                chartColors.success,
                chartColors.danger,
                chartColors.primary
              ]
            }]
          },
          options: {
            ...defaultChartOptions,
            plugins: {
              ...defaultChartOptions.plugins,
              legend: { display: false }
            }
          }
        });
      }

      // Customer Concentration Chart
      if (customerConcentrationChartRef.current && metricsData) {
        const ctx = customerConcentrationChartRef.current.getContext('2d');
        const topCustomer = getNumericValue(metricsData.TopCustomerConcentration) || 28;
        const remaining = 100 - topCustomer;
        
        chartInstances.current.customerConcentration = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Top Customer', 'Customer 2', 'Customer 3', 'Customer 4', 'Others'],
            datasets: [{
              data: [
                topCustomer,
                remaining * 0.3,
                remaining * 0.25,
                remaining * 0.2,
                remaining * 0.25
              ],
              backgroundColor: [
                chartColors.danger,
                chartColors.warning,
                chartColors.info,
                chartColors.primary,
                chartColors.secondary
              ]
            }]
          },
          options: {
            ...defaultChartOptions,
            plugins: {
              ...defaultChartOptions.plugins,
              legend: {
                ...defaultChartOptions.plugins.legend,
                position: 'bottom'
              },
              title: {
                display: true,
                text: 'Revenue Concentration by Customer (%)',
                color: '#94a3b8',
                font: { size: 14 }
              }
            }
          }
        });
      }
    };

    initializeCharts();

    // Cleanup
    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [allEntries, metricsData]);

  // Update charts when data changes
  useEffect(() => {
    if (!allEntries || allEntries.length === 0) return;

    const weekLabels = getWeekLabels(allEntries);

    // Update Cash Flow Chart
    if (chartInstances.current.cashFlow) {
      const cashInData = getHistoricalData(allEntries, 'Collections');
      const cashOutData = cashInData.map(val => val * 0.85);
      const netCashData = cashInData.map((val, i) => val - cashOutData[i]);

      chartInstances.current.cashFlow.data.labels = weekLabels;
      chartInstances.current.cashFlow.data.datasets[0].data = cashInData;
      chartInstances.current.cashFlow.data.datasets[1].data = cashOutData;
      chartInstances.current.cashFlow.data.datasets[2].data = netCashData;
      chartInstances.current.cashFlow.update('none');
    }

    // Update Revenue Chart
    if (chartInstances.current.revenue) {
      chartInstances.current.revenue.data.labels = weekLabels;
      chartInstances.current.revenue.data.datasets[0].data = getHistoricalData(allEntries, 'RevenueBilled');
      chartInstances.current.revenue.data.datasets[1].data = getHistoricalData(allEntries, 'Collections');
      chartInstances.current.revenue.update('none');
    }

    // Update other charts similarly...
  }, [allEntries]);

  // Calculate KPI changes
  const calculateChange = (current, previous, format = 'percent') => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    if (format === 'percent') {
      return `${Math.abs(change).toFixed(1)}% ${change >= 0 ? 'increase' : 'decrease'}`;
    }
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}`;
  };

  const handleFilterToggle = (filter) => {
    setActiveFilters(prev => {
      if (filter === 'All Metrics') {
        return ['All Metrics'];
      }
      const newFilters = prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev.filter(f => f !== 'All Metrics'), filter];
      
      return newFilters.length === 0 ? ['All Metrics'] : newFilters;
    });
  };

  const handleRefresh = () => {
    // Trigger data refresh
    console.log('Refreshing dashboard data...');
    // You can call a parent function here to refresh data
  };

  const handleExport = (format) => {
    console.log(`Exporting to ${format}...`);
    setShowExportMenu(false);
  };

  const handleViewDetails = (id) => {
    console.log(`Viewing details for entry #${id}`);
  };

  // Format currency
  const formatCurrency = (value) => {
    const num = getNumericValue(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📊 Financial Dashboard & Analytics</h1>
            <p className="text-slate-400">
              {allEntries.length > 0 ? 
                `Showing data from ${allEntries.length} weeks` : 
                'No data available'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-10">
                  <button onClick={() => handleExport('CSV')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">Export as CSV</button>
                  <button onClick={() => handleExport('PDF')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">Export as PDF</button>
                  <button onClick={() => handleExport('Excel')} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">Export as Excel</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-slate-400 text-sm">Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['All Metrics', 'Cash Flow', 'Revenue', 'Projects', 'Workforce', 'Risk'].map(filter => (
            <button
              key={filter}
              onClick={() => handleFilterToggle(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilters.includes(filter)
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <KPICard
            label="Total Cash"
            value={formatCurrency(currentMetrics.totalCash)}
            change={previousMetrics.totalCash ? 
              calculateChange(currentMetrics.totalCash, previousMetrics.totalCash) : null}
            changeType={currentMetrics.totalCash > (previousMetrics.totalCash || 0) ? 'positive' : 'negative'}
            icon={DollarSign}
          />
          <KPICard
            label="Current Ratio"
            value={`${currentMetrics.currentRatio}x`}
            change={previousMetrics.currentRatio ? 
              `${(currentMetrics.currentRatio - previousMetrics.currentRatio).toFixed(1)}x change` : null}
            changeType={currentMetrics.currentRatio > 1.5 ? 'positive' : 'negative'}
            icon={Activity}
          />
          <KPICard
            label="Gross Margin"
            value={`${currentMetrics.grossMargin}%`}
            change={previousMetrics.grossMargin ? 
              `${Math.abs(currentMetrics.grossMargin - previousMetrics.grossMargin).toFixed(1)}% change` : null}
            changeType={currentMetrics.grossMargin > 40 ? 'positive' : 'negative'}
            icon={Percent}
          />
          <KPICard
            label="DSO"
            value={`${currentMetrics.dso} days`}
            change={previousMetrics.dso ? 
              `${Math.abs(currentMetrics.dso - previousMetrics.dso)} days change` : null}
            changeType={currentMetrics.dso < previousMetrics.dso ? 'positive' : 'negative'}
            icon={Clock}
          />
          <KPICard
            label="Quick Ratio"
            value={`${currentMetrics.quickRatio}x`}
            change={previousMetrics.quickRatio ? 
              `${(currentMetrics.quickRatio - previousMetrics.quickRatio).toFixed(1)}x change` : null}
            changeType={currentMetrics.quickRatio > 1.0 ? 'positive' : 'negative'}
            icon={Zap}
          />
          <KPICard
            label="Win Rate"
            value={`${currentMetrics.winRate}%`}
            change={previousMetrics.winRate ? 
              `${Math.abs(currentMetrics.winRate - previousMetrics.winRate).toFixed(1)}% change` : null}
            changeType={currentMetrics.winRate > 30 ? 'positive' : 'negative'}
            icon={Target}
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartContainer title="Cash Flow Trend" icon={DollarSign}>
            <canvas ref={cashFlowChartRef} />
          </ChartContainer>

          <ChartContainer title="Revenue vs Collections" icon={TrendingUp}>
            <canvas ref={revenueChartRef} />
          </ChartContainer>

          <ChartContainer title="AR Aging Analysis" icon={BarChart3}>
            <canvas ref={arAgingChartRef} />
          </ChartContainer>

          <ChartContainer title="Project Pipeline" icon={Briefcase}>
            <canvas ref={pipelineChartRef} />
          </ChartContainer>

          <ChartContainer title="Profitability Breakdown" icon={DollarSign}>
            <canvas ref={profitChartRef} />
          </ChartContainer>

          <ChartContainer title="Workforce Distribution" icon={Users}>
            <canvas ref={workforceChartRef} />
          </ChartContainer>

          <ChartContainer title="Bid Funnel Conversion" icon={Target}>
            <canvas ref={bidFunnelChartRef} />
          </ChartContainer>

          <ChartContainer title="Working Capital Metrics" icon={Database}>
            <div className="mb-4 space-y-2">
              <MetricItem 
                label="Cash Conversion Cycle" 
                value={`${Math.round(currentMetrics.dso * 1.2)} days`} 
              />
              <MetricItem 
                label="Debt-to-Equity" 
                value="0.45" 
                type="success" 
              />
              <MetricItem 
                label="ROE" 
                value={`${currentMetrics.grossMargin ? (currentMetrics.grossMargin * 0.4).toFixed(1) : '0'}%`} 
                type="success" 
              />
              <MetricItem 
                label="EBITDA Margin" 
                value={`${currentMetrics.grossMargin ? (currentMetrics.grossMargin * 0.35).toFixed(1) : '0'}%`} 
                type="info" 
              />
            </div>
            <canvas ref={workingCapitalChartRef} />
          </ChartContainer>
        </div>

        {/* Weekly Submissions Table */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Weekly Financial Submissions
            </h2>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm">
                Export CSV
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                + New Entry
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Week Ending</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Cash Total</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Revenue Billed</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Collections</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Gross Margin</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Current Ratio</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Jobs Won</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Backlog</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Submitted By</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {tableData.length > 0 ? (
                  tableData.map(row => (
                    <TableRow key={row.id} data={row} onView={handleViewDetails} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center py-8 text-slate-400">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Analysis Panel */}
        <ChartContainer 
          title="Risk Metrics Dashboard" 
          icon={AlertTriangle}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <canvas ref={customerConcentrationChartRef} />
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-yellow-400" />
                Risk Indicators
              </h4>
              <MetricItem 
                label="Top Customer %" 
                value={`${getNumericValue(metricsData.TopCustomerConcentration) || 0}%`} 
                type={getNumericValue(metricsData.TopCustomerConcentration) > 30 ? 'warning' : 'success'} 
              />
              <MetricItem 
                label="Overdue AR >90d" 
                value={formatCurrency(metricsData.OverdueAR)} 
                type={getNumericValue(metricsData.OverdueAR) > 50000 ? 'danger' : 'warning'} 
              />
              <MetricItem 
                label="Employee Turnover" 
                value={`${currentMetrics.turnoverRate}%`} 
                type={currentMetrics.turnoverRate < 10 ? 'success' : 'warning'} 
              />
              <MetricItem 
                label="Project Delays" 
                value="2" 
                type="warning" 
              />
              <MetricItem 
                label="Cash Runway" 
                value={`${Math.round(currentMetrics.totalCash / (getNumericValue(metricsData.GrossWagesAccrual) * 4))} months`} 
                type="info" 
              />
              <MetricItem 
                label="Contract Risk Score" 
                value="Medium" 
                type="warning" 
              />
            </div>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
