import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { TrendingUp, TrendingDown, DollarSign, Activity, Users, Package, Clock, AlertCircle } from 'lucide-react';

// Simple bar chart component (no Chart.js needed)
const SimpleBarChart = ({ data, labels, title, color = '#3b82f6' }) => {
  const maxValue = Math.max(...data);
  
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">{title}</h3>
      <div className="flex items-end h-48 gap-2">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full transition-all duration-300 hover:opacity-80 cursor-pointer relative"
              style={{
                backgroundColor: color,
                height: `${(value / maxValue) * 180}px`,
                borderRadius: '4px 4px 0 0'
              }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100">
                ${(value / 1000).toFixed(0)}k
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400 text-center">{labels[index]}</div>
            <div className="text-sm text-blue-400 font-bold">${(value / 1000).toFixed(0)}k</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple pie chart component
const SimplePieChart = ({ data, labels, title, colors }) => {
  const total = data.reduce((sum, val) => sum + val, 0);
  let currentAngle = -90;
  
  const slices = data.map((value, index) => {
    const percentage = (value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    return {
      value,
      percentage,
      angle,
      startAngle,
      color: colors[index],
      label: labels[index]
    };
  });
  
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">{title}</h3>
      <div className="flex items-center gap-6">
        <div className="w-48 h-48 relative">
          <svg width="192" height="192" className="transform -rotate-90">
            {slices.map((slice, index) => {
              const x1 = 96 + 76 * Math.cos((slice.startAngle * Math.PI) / 180);
              const y1 = 96 + 76 * Math.sin((slice.startAngle * Math.PI) / 180);
              const x2 = 96 + 76 * Math.cos(((slice.startAngle + slice.angle) * Math.PI) / 180);
              const y2 = 96 + 76 * Math.sin(((slice.startAngle + slice.angle) * Math.PI) / 180);
              const largeArc = slice.angle > 180 ? 1 : 0;
              
              return (
                <path
                  key={index}
                  d={`M 96 96 L ${x1} ${y1} A 76 76 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={slice.color}
                  stroke="rgba(15, 23, 42, 0.5)"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-300 hover:opacity-80"
                />
              );
            })}
          </svg>
        </div>
        <div className="flex-1">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center mb-2">
              <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: slice.color }}></div>
              <div className="flex-1 text-sm text-gray-200">{slice.label}</div>
              <div className="text-sm text-gray-400">{slice.percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChartVisualization = ({ data }) => {
  const revenueChartRef = useRef(null);
  const gpmChartRef = useRef(null);
  const revenueChartInstance = useRef(null);
  const gpmChartInstance = useRef(null);
  
  // State for processed data
  const [processedData, setProcessedData] = useState({
    kpis: {},
    chartData: {
      revenue: [],
      collections: [],
      weeks: [],
      arBreakdown: [],
      workforce: [],
      pipeline: []
    }
  });

  // Process data for visual charts
  useEffect(() => {
    if (!data) return;
    
    // Get entries
    let entries = [];
    if (data?.allEntries && Array.isArray(data.allEntries)) {
      entries = data.allEntries;
    } else if (Array.isArray(data)) {
      entries = data;
    }
    
    // Get latest entry for KPIs
    const latestWeek = entries[entries.length - 1] || {};
    const previousWeek = entries[entries.length - 2] || {};
    
    // Calculate KPIs
    const kpis = {
      revenue: {
        value: latestWeek.revenueBilledToDate || 0,
        change: previousWeek.revenueBilledToDate 
          ? ((latestWeek.revenueBilledToDate - previousWeek.revenueBilledToDate) / previousWeek.revenueBilledToDate * 100).toFixed(1)
          : 0,
        label: 'Revenue YTD'
      },
      cashPosition: {
        value: (latestWeek.cashInBank || 0) + (latestWeek.cashOnHand || 0),
        change: previousWeek.cashInBank 
          ? ((((latestWeek.cashInBank + latestWeek.cashOnHand) - (previousWeek.cashInBank + previousWeek.cashOnHand)) / (previousWeek.cashInBank + previousWeek.cashOnHand)) * 100).toFixed(1)
          : 0,
        label: 'Cash Position'
      },
      grossMargin: {
        value: latestWeek.grossProfitAccrual && latestWeek.revenueBilledToDate
          ? ((latestWeek.grossProfitAccrual / latestWeek.revenueBilledToDate) * 100).toFixed(1)
          : data?.gpmAverage || 0,
        label: 'Gross Margin %'
      },
      activeProjects: {
        value: data?.activeProjects || latestWeek.jobsStartedNumber || 0,
        change: previousWeek.jobsStartedNumber 
          ? latestWeek.jobsStartedNumber - previousWeek.jobsStartedNumber
          : 0,
        label: 'Active Projects'
      },
      currentRatio: {
        value: latestWeek.currentAR && latestWeek.currentAP 
          ? (latestWeek.currentAR / latestWeek.currentAP).toFixed(2)
          : 'N/A',
        label: 'Current Ratio'
      },
      collectionEfficiency: {
        value: latestWeek.collections && latestWeek.revenueBilledToDate
          ? ((latestWeek.collections / latestWeek.revenueBilledToDate) * 100).toFixed(1)
          : 0,
        label: 'Collection Rate %'
      }
    };
    
    // Prepare chart data for visual charts
    const recentEntries = entries.slice(-6);
    
    // AR Breakdown
    const overdueAR = parseFloat(latestWeek.overdueAR || 0);
    const retentionAR = parseFloat(latestWeek.retentionReceivables || 0);
    const currentCleanAR = (latestWeek.currentAR || 0) - overdueAR - retentionAR;
    
    // Workforce
    const fieldEmployees = parseFloat(latestWeek.fieldEmployees || 0);
    const supervisors = parseFloat(latestWeek.supervisors || 0);
    const office = parseFloat(latestWeek.office || 0);
    
    // Pipeline
    const estimates = parseFloat(latestWeek.totalEstimates || 0);
    const jobsWonDollar = parseFloat(latestWeek.jobsWonDollar || 0);
    const wip = parseFloat(latestWeek.wipDollar || 0);
    const backlog = parseFloat(latestWeek.upcomingJobsDollar || 0);
    
    setProcessedData({
      kpis,
      chartData: {
        revenue: recentEntries.map(e => parseFloat(e.revenueBilledToDate || 0)),
        collections: recentEntries.map(e => parseFloat(e.collections || 0)),
        weeks: recentEntries.map((e, i) => e.weekEnding || `Week ${i + 1}`),
        arBreakdown: [currentCleanAR, retentionAR, overdueAR],
        workforce: [fieldEmployees, supervisors, office],
        pipeline: [estimates, jobsWonDollar, wip, backlog]
      }
    });
  }, [data]);

  // Chart.js charts
  useEffect(() => {
    if (!data) return;

    // Destroy existing charts
    if (revenueChartInstance.current) revenueChartInstance.current.destroy();
    if (gpmChartInstance.current) gpmChartInstance.current.destroy();

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#e5e7eb' }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#f3f4f6',
          bodyColor: '#e5e7eb',
          borderColor: '#334155',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: { color: '#9ca3af' },
          grid: { color: 'rgba(75, 85, 99, 0.3)' }
        },
        y: {
          ticks: { color: '#9ca3af' },
          grid: { color: 'rgba(75, 85, 99, 0.3)' }
        }
      }
    };

    // Revenue Chart
    const revenueCtx = revenueChartRef.current.getContext('2d');
    revenueChartInstance.current = new Chart(revenueCtx, {
      type: 'bar',
      data: {
        labels: data.weeks,
        datasets: [
          {
            label: 'Revenue',
            data: data.weeklyRevenue,
            backgroundColor: 'rgba(212, 167, 106, 0.8)',
            borderColor: 'rgba(212, 167, 106, 1)',
            borderWidth: 1
          },
          {
            label: 'Collections',
            data: data.weeklyCollections,
            backgroundColor: 'rgba(139, 105, 20, 0.8)',
            borderColor: 'rgba(139, 105, 20, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            ticks: {
              ...commonOptions.scales.y.ticks,
              callback: (value) => '$' + value / 1000 + 'k'
            }
          }
        }
      }
    });

    // GPM Chart
    const gpmCtx = gpmChartRef.current.getContext('2d');
    gpmChartInstance.current = new Chart(gpmCtx, {
      type: 'line',
      data: {
        labels: data.weeks,
        datasets: [
          {
            label: 'GPM %',
            data: data.gpmTrend,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Target',
            data: Array(data.weeks.length).fill(30),
            borderColor: '#ef4444',
            borderDash: [5, 5],
            pointRadius: 0
          }
        ]
      },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            ticks: {
              ...commonOptions.scales.y.ticks,
              callback: (value) => value + '%'
            }
          }
        }
      }
    });

    return () => {
      if (revenueChartInstance.current) revenueChartInstance.current.destroy();
      if (gpmChartInstance.current) gpmChartInstance.current.destroy();
    };
  }, [data]);

  if (!data) return null;

  // Format currency
  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Format change
  const formatChange = (value, isPercent = true) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'N/A';
    const prefix = numValue > 0 ? '+' : '';
    return isPercent ? `${prefix}${value}%` : `${prefix}${value}`;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            {parseFloat(processedData.kpis.revenue?.change) > 0 ? 
              <TrendingUp className="w-4 h-4 text-green-500" /> : 
              <TrendingDown className="w-4 h-4 text-red-500" />
            }
          </div>
          <p className="text-xs text-gray-600">{processedData.kpis.revenue?.label}</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(processedData.kpis.revenue?.value || 0)}</p>
          <p className="text-xs text-gray-500">{formatChange(processedData.kpis.revenue?.change)}</p>
        </div>

        {/* Cash Position Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            {parseFloat(processedData.kpis.cashPosition?.change) > 0 ? 
              <TrendingUp className="w-4 h-4 text-green-500" /> : 
              <TrendingDown className="w-4 h-4 text-red-500" />
            }
          </div>
          <p className="text-xs text-gray-600">{processedData.kpis.cashPosition?.label}</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(processedData.kpis.cashPosition?.value || 0)}</p>
          <p className="text-xs text-gray-500">{formatChange(processedData.kpis.cashPosition?.change)}</p>
        </div>

        {/* Gross Margin Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className={`text-xs ${parseFloat(processedData.kpis.grossMargin?.value) >= 30 ? 'text-green-600' : 'text-orange-600'}`}>
              {parseFloat(processedData.kpis.grossMargin?.value) >= 30 ? 'On Target' : 'Below'}
            </span>
          </div>
          <p className="text-xs text-gray-600">{processedData.kpis.grossMargin?.label}</p>
          <p className="text-lg font-bold text-gray-900">{processedData.kpis.grossMargin?.value}%</p>
          <p className="text-xs text-gray-500">Target: 30%</p>
        </div>

        {/* Active Projects Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-orange-600" />
            {processedData.kpis.activeProjects?.change > 0 ? 
              <TrendingUp className="w-4 h-4 text-green-500" /> : 
              processedData.kpis.activeProjects?.change < 0 ?
              <TrendingDown className="w-4 h-4 text-red-500" /> :
              <span className="w-4 h-4 text-gray-400">→</span>
            }
          </div>
          <p className="text-xs text-gray-600">{processedData.kpis.activeProjects?.label}</p>
          <p className="text-lg font-bold text-gray-900">{processedData.kpis.activeProjects?.value}</p>
          <p className="text-xs text-gray-500">{formatChange(processedData.kpis.activeProjects?.change, false)} from last week</p>
        </div>

        {/* Current Ratio Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 text-teal-600" />
            <span className={`text-xs ${parseFloat(processedData.kpis.currentRatio?.value) >= 1.5 ? 'text-green-600' : parseFloat(processedData.kpis.currentRatio?.value) >= 1.2 ? 'text-orange-600' : 'text-red-600'}`}>
              {parseFloat(processedData.kpis.currentRatio?.value) >= 1.5 ? 'Healthy' : parseFloat(processedData.kpis.currentRatio?.value) >= 1.2 ? 'Adequate' : 'Low'}
            </span>
          </div>
          <p className="text-xs text-gray-600">{processedData.kpis.currentRatio?.label}</p>
          <p className="text-lg font-bold text-gray-900">{processedData.kpis.currentRatio?.value}</p>
          <p className="text-xs text-gray-500">Target: ≥1.5</p>
        </div>

        {/* Collection Efficiency Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span className={`text-xs ${parseFloat(processedData.kpis.collectionEfficiency?.value) >= 95 ? 'text-green-600' : parseFloat(processedData.kpis.collectionEfficiency?.value) >= 85 ? 'text-orange-600' : 'text-red-600'}`}>
              {parseFloat(processedData.kpis.collectionEfficiency?.value) >= 95 ? 'Excellent' : parseFloat(processedData.kpis.collectionEfficiency?.value) >= 85 ? 'Good' : 'Needs Work'}
            </span>
          </div>
          <p className="text-xs text-gray-600">{processedData.kpis.collectionEfficiency?.label}</p>
          <p className="text-lg font-bold text-gray-900">{processedData.kpis.collectionEfficiency?.value}%</p>
          <p className="text-xs text-gray-500">Target: ≥95%</p>
        </div>
      </div>

      {/* Original Chart.js Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Revenue vs Collections</h3>
          <div style={{ height: '300px' }}>
            <canvas ref={revenueChartRef}></canvas>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">GPM % Trend</h3>
          <div style={{ height: '300px' }}>
            <canvas ref={gpmChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Additional Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Bar Chart */}
        <SimpleBarChart 
          data={processedData.chartData.revenue}
          labels={processedData.chartData.weeks}
          title="Revenue Billed (Visual)"
          color="#3b82f6"
        />
        
        {/* Collections Bar Chart */}
        <SimpleBarChart 
          data={processedData.chartData.collections}
          labels={processedData.chartData.weeks}
          title="Collections (Visual)"
          color="#10b981"
        />
        
        {/* AR Breakdown Pie Chart */}
        <SimplePieChart
          data={processedData.chartData.arBreakdown}
          labels={['Current AR', 'Retention', 'Overdue >90d']}
          title="AR Aging Analysis"
          colors={['#10b981', '#f59e0b', '#ef4444']}
        />
        
        {/* Workforce Pie Chart */}
        <SimplePieChart
          data={processedData.chartData.workforce}
          labels={['Field', 'Supervisors', 'Office']}
          title="Workforce Distribution"
          colors={['#3b82f6', '#8b5cf6', '#06b6d4']}
        />
        
        {/* Pipeline Bar Chart */}
        <SimpleBarChart
          data={processedData.chartData.pipeline}
          labels={['Estimates', 'Won', 'WIP', 'Backlog']}
          title="Project Pipeline"
          color="#8b5cf6"
        />
      </div>

      {/* Weekly Summary Table */}
      {data.allEntries && data.allEntries.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Weekly Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Week</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Collections</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">GPM %</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cash</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">AR</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">AP</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Projects</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.allEntries.slice(-5).reverse().map((entry, index) => {
                  const gpm = entry.grossProfitAccrual && entry.revenueBilledToDate
                    ? ((entry.grossProfitAccrual / entry.revenueBilledToDate) * 100).toFixed(1)
                    : 'N/A';
                  const totalCash = (entry.cashInBank || 0) + (entry.cashOnHand || 0);
                  
                  return (
                    <tr key={index} className={index === 0 ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-2 text-sm text-gray-900">{entry.weekEnding}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(entry.revenueBilledToDate || 0)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(entry.collections || 0)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">
                        <span className={`font-medium ${parseFloat(gpm) >= 30 ? 'text-green-600' : 'text-orange-600'}`}>
                          {gpm}%
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(totalCash)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(entry.currentAR || 0)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(entry.currentAP || 0)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{entry.jobsStartedNumber || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data.allEntries.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Showing last 5 weeks of {data.allEntries.length} total entries
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Dashboard Information</h4>
        <p className="text-sm text-blue-800">
          This dashboard displays {data.allEntries?.length || 0} weeks of financial data from your WeeklyEntry form.
          The charts show both Chart.js visualizations and custom visual components.
        </p>
      </div>
    </div>
  );
};

export default ChartVisualization;
