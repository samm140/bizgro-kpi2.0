// src/components/dashboard/FinancialChartsView.jsx
import React, { useState, useEffect, useRef } from 'react';
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

  // Sample data for demonstration
  const [tableData] = useState([
    { id: 1, weekEnding: '2024-01-07', status: 'Complete', cashTotal: '$842,500', revenueBilled: '$215,000', collections: '$198,500', grossMargin: '42.8%', currentRatio: '2.4x', jobsWon: '3', backlog: '$1.2M', submittedBy: 'J. Smith' },
    { id: 2, weekEnding: '2023-12-31', status: 'Complete', cashTotal: '$756,200', revenueBilled: '$189,000', collections: '$172,000', grossMargin: '41.5%', currentRatio: '2.1x', jobsWon: '2', backlog: '$980K', submittedBy: 'J. Smith' },
    { id: 3, weekEnding: '2023-12-24', status: 'In Review', cashTotal: '$698,300', revenueBilled: '$176,500', collections: '$165,200', grossMargin: '40.2%', currentRatio: '2.0x', jobsWon: '4', backlog: '$850K', submittedBy: 'M. Johnson' },
    { id: 4, weekEnding: '2023-12-17', status: 'Complete', cashTotal: '$712,800', revenueBilled: '$201,000', collections: '$188,000', grossMargin: '43.1%', currentRatio: '2.3x', jobsWon: '1', backlog: '$920K', submittedBy: 'J. Smith' },
    { id: 5, weekEnding: '2023-12-10', status: 'Pending', cashTotal: '-', revenueBilled: '-', collections: '-', grossMargin: '-', currentRatio: '-', jobsWon: '-', backlog: '-', submittedBy: '-' }
  ]);

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

  // Initialize charts
  useEffect(() => {
    const initializeCharts = () => {
      // Destroy existing charts
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });

      // Cash Flow Chart
      if (cashFlowChartRef.current) {
        const ctx = cashFlowChartRef.current.getContext('2d');
        chartInstances.current.cashFlow = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [
              {
                label: 'Cash In',
                data: [180000, 195000, 172000, 188000, 198500, 215000],
                borderColor: chartColors.success,
                backgroundColor: chartColors.successAlpha,
                tension: 0.4
              },
              {
                label: 'Cash Out',
                data: [165000, 178000, 158000, 172000, 181000, 195000],
                borderColor: chartColors.danger,
                backgroundColor: chartColors.dangerAlpha,
                tension: 0.4
              },
              {
                label: 'Net Cash',
                data: [15000, 17000, 14000, 16000, 17500, 20000],
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
        chartInstances.current.revenue = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Revenue Billed',
                data: [215000, 189000, 176500, 201000, 198500, 225000],
                backgroundColor: chartColors.primary
              },
              {
                label: 'Collections',
                data: [198500, 172000, 165200, 188000, 185000, 210000],
                backgroundColor: chartColors.secondary
              }
            ]
          },
          options: defaultChartOptions
        });
      }

      // AR Aging Chart
      if (arAgingChartRef.current) {
        const ctx = arAgingChartRef.current.getContext('2d');
        chartInstances.current.arAging = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Current', '30-60 days', '60-90 days', '>90 days'],
            datasets: [{
              data: [420000, 125000, 68000, 45200],
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
      if (pipelineChartRef.current) {
        const ctx = pipelineChartRef.current.getContext('2d');
        chartInstances.current.pipeline = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Bidding', 'Awarded', 'In Progress', 'Completed', 'Backlog'],
            datasets: [{
              label: 'Project Value',
              data: [850000, 420000, 680000, 320000, 1200000],
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
        chartInstances.current.profit = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Gross Profit',
                data: [92000, 78000, 71000, 86000, 85000, 96000],
                borderColor: chartColors.success,
                backgroundColor: chartColors.successAlpha,
                fill: true,
                tension: 0.4
              },
              {
                label: 'COGS',
                data: [123000, 111000, 105500, 115000, 113500, 129000],
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
      if (workforceChartRef.current) {
        const ctx = workforceChartRef.current.getContext('2d');
        chartInstances.current.workforce = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Field Employees', 'Supervisors', 'Office Staff'],
            datasets: [{
              data: [45, 8, 12],
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
      if (bidFunnelChartRef.current) {
        const ctx = bidFunnelChartRef.current.getContext('2d');
        chartInstances.current.bidFunnel = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Invites', 'Estimates', 'Submitted', 'Won'],
            datasets: [
              {
                label: 'Count',
                data: [85, 62, 48, 16],
                backgroundColor: chartColors.primary
              },
              {
                label: 'Value ($K)',
                data: [4200, 3100, 2400, 820],
                backgroundColor: chartColors.secondary
              }
            ]
          },
          options: defaultChartOptions
        });
      }

      // Working Capital Chart
      if (workingCapitalChartRef.current) {
        const ctx = workingCapitalChartRef.current.getContext('2d');
        chartInstances.current.workingCapital = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Current Assets', 'Current Liabilities', 'Working Capital'],
            datasets: [{
              label: 'Amount',
              data: [1250000, 520000, 730000],
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
      if (customerConcentrationChartRef.current) {
        const ctx = customerConcentrationChartRef.current.getContext('2d');
        chartInstances.current.customerConcentration = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Top Customer', 'Customer 2', 'Customer 3', 'Customer 4', 'Others'],
            datasets: [{
              data: [28, 18, 15, 12, 27],
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
  }, []);

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
    // Implement data refresh logic
    console.log('Refreshing dashboard data...');
  };

  const handleExport = (format) => {
    console.log(`Exporting to ${format}...`);
    setShowExportMenu(false);
  };

  const handleViewDetails = (id) => {
    console.log(`Viewing details for entry #${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📊 Financial Dashboard & Analytics</h1>
            <p className="text-slate-400">Comprehensive financial metrics and performance tracking</p>
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
            value="$842,500"
            change="12.5% from last week"
            changeType="positive"
            icon={DollarSign}
          />
          <KPICard
            label="Current Ratio"
            value="2.4x"
            change="0.3x improvement"
            changeType="positive"
            icon={Activity}
          />
          <KPICard
            label="Gross Margin"
            value="42.8%"
            change="1.2% from target"
            changeType="negative"
            icon={Percent}
          />
          <KPICard
            label="DSO"
            value="45 days"
            change="5 days improvement"
            changeType="positive"
            icon={Clock}
          />
          <KPICard
            label="Quick Ratio"
            value="1.8x"
            change="0.2x from last month"
            changeType="positive"
            icon={Zap}
          />
          <KPICard
            label="Win Rate"
            value="34%"
            change="4% from average"
            changeType="positive"
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
              <MetricItem label="Cash Conversion Cycle" value="52 days" />
              <MetricItem label="Debt-to-Equity" value="0.45" type="success" />
              <MetricItem label="ROE" value="18.5%" type="success" />
              <MetricItem label="EBITDA Margin" value="15.2%" type="info" />
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
                {tableData.map(row => (
                  <TableRow key={row.id} data={row} onView={handleViewDetails} />
                ))}
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
              <MetricItem label="Top Customer %" value="28%" type="warning" />
              <MetricItem label="Overdue AR >90d" value="$45,200" type="danger" />
              <MetricItem label="Employee Turnover" value="8%" type="success" />
              <MetricItem label="Project Delays" value="2" type="warning" />
              <MetricItem label="Cash Runway" value="4.2 months" type="info" />
              <MetricItem label="Contract Risk Score" value="Medium" type="warning" />
            </div>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
