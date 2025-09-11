// File: src/components/Dashboard.jsx
const dashboardJsx = `import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const Dashboard = ({ data }) => {
  const revenueChartRef = useRef(null);
  const gpmChartRef = useRef(null);
  const revenueChartInstance = useRef(null);
  const gpmChartInstance = useRef(null);

  useEffect(() => {
    if (data) {
      initCharts();
    }
    return () => {
      if (revenueChartInstance.current) revenueChartInstance.current.destroy();
      if (gpmChartInstance.current) gpmChartInstance.current.destroy();
    };
  }, [data]);

  const initCharts = () => {
    // Revenue Chart
    if (revenueChartRef.current) {
      revenueChartInstance.current = new Chart(revenueChartRef.current, {
        type: 'bar',
        data: {
          labels: data.weeks || ['W31', 'W32', 'W33', 'W34', 'W35', 'W36'],
          datasets: [{
            label: 'Revenue',
            data: data.weeklyRevenue || [420000, 380000, 460000, 440000, 470000, 450000],
            backgroundColor: 'rgba(212, 167, 106, 0.8)',
            borderColor: '#D4A76A',
            borderWidth: 1
          }, {
            label: 'Collections',
            data: data.weeklyCollections || [400000, 370000, 430000, 425000, 445000, 435000],
            backgroundColor: 'rgba(139, 105, 20, 0.8)',
            borderColor: '#8B6914',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#e5e7eb' }
            }
          },
          scales: {
            y: {
              ticks: { 
                color: '#9ca3af',
                callback: value => '$' + (value/1000) + 'k'
              },
              grid: { color: 'rgba(75, 85, 99, 0.3)' }
            },
            x: {
              ticks: { color: '#9ca3af' },
              grid: { color: 'rgba(75, 85, 99, 0.3)' }
            }
          }
        }
      });
    }

    // GPM Chart
    if (gpmChartRef.current) {
      gpmChartInstance.current = new Chart(gpmChartRef.current, {
        type: 'line',
        data: {
          labels: data.weeks || ['W31', 'W32', 'W33', 'W34', 'W35', 'W36'],
          datasets: [{
            label: 'GPM %',
            data: data.gpmTrend || [28.5, 26.3, 31.2, 29.8, 30.5, 28.9],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
          }, {
            label: 'Target',
            data: [30, 30, 30, 30, 30, 30],
            borderColor: '#ef4444',
            borderDash: [5, 5],
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#e5e7eb' }
            }
          },
          scales: {
            y: {
              ticks: { 
                color: '#9ca3af',
                callback: value => value + '%'
              },
              grid: { color: 'rgba(75, 85, 99, 0.3)' }
            },
            x: {
              ticks: { color: '#9ca3af' },
              grid: { color: 'rgba(75, 85, 99, 0.3)' }
            }
          }
        }
      });
    }
  };

  if (!data) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Executive Dashboard</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Revenue YTD</p>
              <p className="text-3xl font-bold">${(data.revenueYTD / 1000000).toFixed(1)}M</p>
              <p className="text-green-400 text-xs mt-2">↑ 12% vs last year</p>
            </div>
            <i className="fas fa-dollar-sign text-green-400 text-xl"></i>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">GPM Average</p>
              <p className="text-3xl font-bold">{data.gpmAverage}%</p>
              <p className="text-green-400 text-xs mt-2">Above 30% target</p>
            </div>
            <i className="fas fa-percentage text-blue-400 text-xl"></i>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Active Projects</p>
              <p className="text-3xl font-bold">{data.activeProjects}</p>
              <p className="text-gray-400 text-xs mt-2">$21.8M in WIP</p>
            </div>
            <i className="fas fa-building text-purple-400 text-xl"></i>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Cash Position</p>
              <p className="text-3xl font-bold">${(data.cashPosition / 1000000).toFixed(2)}M</p>
              <p className="text-yellow-400 text-xs mt-2">DSO: 40 days</p>
            </div>
            <i className="fas fa-wallet text-orange-400 text-xl"></i>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Revenue vs Collections</h3>
          <div style={{ height: '300px' }}>
            <canvas ref={revenueChartRef}></canvas>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">GPM % Trend</h3>
          <div style={{ height: '300px' }}>
            <canvas ref={gpmChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;`;
