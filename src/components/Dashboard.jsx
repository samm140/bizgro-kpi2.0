import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import KpiCard from './KpiCard';

const Dashboard = ({ data }) => {
  const revenueChartRef = useRef(null);
  const gpmChartRef = useRef(null);
  const revenueChartInstance = useRef(null);
  const gpmChartInstance = useRef(null);

  useEffect(() => {
    if (data) {
      initCharts();
    }
    
    // Cleanup function to destroy charts on unmount
    return () => {
      if (revenueChartInstance.current) {
        revenueChartInstance.current.destroy();
      }
      if (gpmChartInstance.current) {
        gpmChartInstance.current.destroy();
      }
    };
  }, [data]);

  const initCharts = () => {
    // Destroy existing chart instances if they exist
    if (revenueChartInstance.current) {
      revenueChartInstance.current.destroy();
    }
    if (gpmChartInstance.current) {
      gpmChartInstance.current.destroy();
    }

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#e5e7eb' }
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
            backgroundColor: 'rgba(212, 167, 106, 0.8)'
          },
          {
            label: 'Collections',
            data: data.weeklyCollections,
            backgroundColor: 'rgba(139, 105, 20, 0.8)'
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
  };

  if (!data) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-200">Executive Dashboard</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Revenue YTD"
          value={`$${(data.revenueYTD / 1000000).toFixed(1)}M`}
          trendText="↑ 12% vs last year"
          trendColor="text-green-400"
          icon="fa-dollar-sign"
          iconColor="text-green-400"
        />
        <KpiCard
          title="GPM Average"
          value={`${data.gpmAverage}%`}
          trendText="Above 30% target"
          trendColor="text-green-400"
          icon="fa-percentage"
          iconColor="text-blue-400"
        />
        <KpiCard
          title="Active Projects"
          value={data.activeProjects}
          footerText="$21.8M in WIP"
          icon="fa-building"
          iconColor="text-purple-400"
        />
        <KpiCard
          title="Cash Position"
          value={`$${(data.cashPosition / 1000000).toFixed(2)}M`}
          footerText="DSO: 40 days"
          icon="fa-wallet"
          iconColor="text-orange-400"
        />
      </div>
      
      {/* Charts */}
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
    </div>
  );
};

export default Dashboard;
