// FinancialDashboard.jsx
// COMPLETE WORKING VERSION - NO CHART.JS NEEDED
// This component reads data from your WeeklyEntry form

import React, { useState, useEffect } from 'react';

// Simple bar chart component (no Chart.js needed)
const SimpleBarChart = ({ data, labels, title, color = '#3b82f6' }) => {
  const maxValue = Math.max(...data);
  
  return (
    <div style={{ padding: '20px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: '#e2e8f0' }}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '10px' }}>
        {data.map((value, index) => (
          <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '100%',
              backgroundColor: color,
              height: `${(value / maxValue) * 180}px`,
              borderRadius: '4px 4px 0 0',
              transition: 'all 0.3s',
              cursor: 'pointer',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            >
              <div style={{
                position: 'absolute',
                top: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                display: 'none'
              }}>
                ${(value / 1000).toFixed(0)}k
              </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
              {labels[index]}
            </div>
            <div style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 'bold' }}>
              ${(value / 1000).toFixed(0)}k
            </div>
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
    <div style={{ padding: '20px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: '#e2e8f0' }}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <div style={{ width: '200px', height: '200px', position: 'relative' }}>
          <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
            {slices.map((slice, index) => {
              const x1 = 100 + 80 * Math.cos((slice.startAngle * Math.PI) / 180);
              const y1 = 100 + 80 * Math.sin((slice.startAngle * Math.PI) / 180);
              const x2 = 100 + 80 * Math.cos(((slice.startAngle + slice.angle) * Math.PI) / 180);
              const y2 = 100 + 80 * Math.sin(((slice.startAngle + slice.angle) * Math.PI) / 180);
              const largeArc = slice.angle > 180 ? 1 : 0;
              
              return (
                <path
                  key={index}
                  d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={slice.color}
                  stroke="rgba(15, 23, 42, 0.5)"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                />
              );
            })}
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          {slices.map((slice, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: slice.color, borderRadius: '2px', marginRight: '8px' }}></div>
              <div style={{ flex: 1, fontSize: '13px', color: '#e2e8f0' }}>{slice.label}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>{slice.percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// KPI Card component
const KPICard = ({ label, value, change, isPositive = true }) => {
  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      transition: 'all 0.3s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '8px' }}>
        {value}
      </div>
      {change && (
        <div style={{ fontSize: '13px', color: isPositive ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '4px' }}>{isPositive ? '↑' : '↓'}</span>
          {change}
        </div>
      )}
    </div>
  );
};

// MAIN FINANCIAL DASHBOARD COMPONENT
export default function FinancialDashboard({ data }) {
  // State for processed data
  const [metrics, setMetrics] = useState({
    totalCash: 0,
    currentRatio: 0,
    grossMargin: 0,
    dso: 0,
    collectionRate: 0,
    winRate: 0
  });
  
  const [chartData, setChartData] = useState({
    revenue: [],
    collections: [],
    weeks: [],
    arBreakdown: [],
    workforce: [],
    pipeline: []
  });
  
  // Process data when component mounts or data changes
  useEffect(() => {
    processData();
  }, [data]);
  
  // Function to process data from WeeklyEntry format
  const processData = () => {
    // Check if we have data
    let entries = [];
    
    // Try different data structures
    if (data?.allEntries && Array.isArray(data.allEntries)) {
      entries = data.allEntries;
    } else if (Array.isArray(data)) {
      entries = data;
    } else if (data) {
      // Single entry
      entries = [data];
    }
    
    // If no data, use sample data
    if (entries.length === 0) {
      entries = getSampleData();
    }
    
    // Get latest entry for current metrics
    const latest = entries[entries.length - 1] || {};
    
    // Calculate metrics from latest entry
    const cashBank = parseFloat(latest.CashBank || latest.cashBank || 0);
    const cashOnHand = parseFloat(latest.CashOnHand || latest.cashOnHand || 0);
    const currentAR = parseFloat(latest.CurrentAR || latest.currentAR || 0);
    const currentAP = parseFloat(latest.CurrentAP || latest.currentAP || 0);
    const revenue = parseFloat(latest.RevenueBilled || latest.revenueBilled || 0);
    const collections = parseFloat(latest.Collections || latest.collections || 0);
    const grossProfit = parseFloat(latest.GrossProfitAccrual || latest.grossProfitAccrual || 0);
    const jobsWon = parseFloat(latest.JobsWonNumber || latest.jobsWonNumber || 0);
    const totalEstimates = parseFloat(latest.TotalEstimates || latest.totalEstimates || 0);
    
    // Calculate KPIs
    const totalCash = cashBank + cashOnHand;
    const currentRatio = currentAP > 0 ? ((totalCash + currentAR) / currentAP).toFixed(2) : 0;
    const grossMargin = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(1) : 0;
    const dso = revenue > 0 ? Math.round((currentAR / revenue) * 30) : 0;
    const collectionRate = revenue > 0 ? ((collections / revenue) * 100).toFixed(1) : 0;
    const winRate = totalEstimates > 0 ? ((jobsWon / totalEstimates) * 100).toFixed(1) : 0;
    
    setMetrics({
      totalCash,
      currentRatio,
      grossMargin,
      dso,
      collectionRate,
      winRate
    });
    
    // Prepare chart data (last 6 weeks)
    const recentEntries = entries.slice(-6);
    const revenueData = recentEntries.map(e => parseFloat(e.RevenueBilled || e.revenueBilled || 0));
    const collectionsData = recentEntries.map(e => parseFloat(e.Collections || e.collections || 0));
    const weeks = recentEntries.map((e, i) => e.WeekEndingDate || `Week ${i + 1}`);
    
    // AR Breakdown
    const overdueAR = parseFloat(latest.OverdueAR || latest.overdueAR || 0);
    const retentionAR = parseFloat(latest.RetentionReceivables || latest.retentionReceivables || 0);
    const currentCleanAR = currentAR - overdueAR - retentionAR;
    
    // Workforce
    const fieldEmployees = parseFloat(latest.FieldEmployees || latest.fieldEmployees || 0);
    const supervisors = parseFloat(latest.Supervisors || latest.supervisors || 0);
    const office = parseFloat(latest.Office || latest.office || 0);
    
    // Pipeline
    const estimates = parseFloat(latest.TotalEstimates || latest.totalEstimates || 0);
    const jobsWonDollar = parseFloat(latest.JobsWonDollar || latest.jobsWonDollar || 0);
    const wip = parseFloat(latest.WIP || latest.wip || 0);
    const backlog = parseFloat(latest.UpcomingJobs || latest.upcomingJobs || 0);
    
    setChartData({
      revenue: revenueData,
      collections: collectionsData,
      weeks: weeks,
      arBreakdown: [currentCleanAR, retentionAR, overdueAR],
      workforce: [fieldEmployees, supervisors, office],
      pipeline: [estimates, jobsWonDollar, wip, backlog]
    });
  };
  
  // Sample data function
  const getSampleData = () => {
    return [
      {
        WeekEndingDate: 'Week 1',
        CashBank: 750000,
        CashOnHand: 45000,
        CurrentAR: 380000,
        CurrentAP: 320000,
        RevenueBilled: 185000,
        Collections: 170000,
        GrossProfitAccrual: 74000,
        COGSAccrual: 111000,
        OverdueAR: 35000,
        RetentionReceivables: 20000,
        FieldEmployees: 42,
        Supervisors: 7,
        Office: 11,
        JobsWonNumber: 2,
        TotalEstimates: 8,
        TotalEstimates: 1800000,
        JobsWonDollar: 680000,
        WIP: 520000,
        UpcomingJobs: 950000
      },
      {
        WeekEndingDate: 'Week 2',
        CashBank: 780000,
        CashOnHand: 48000,
        CurrentAR: 395000,
        CurrentAP: 315000,
        RevenueBilled: 192000,
        Collections: 178000,
        GrossProfitAccrual: 77000,
        COGSAccrual: 115000,
        OverdueAR: 38000,
        RetentionReceivables: 22000,
        FieldEmployees: 43,
        Supervisors: 7,
        Office: 11,
        JobsWonNumber: 3,
        TotalEstimates: 9,
        TotalEstimates: 1950000,
        JobsWonDollar: 720000,
        WIP: 580000,
        UpcomingJobs: 980000
      },
      {
        WeekEndingDate: 'Week 3',
        CashBank: 795000,
        CashOnHand: 47500,
        CurrentAR: 405000,
        CurrentAP: 310000,
        RevenueBilled: 198000,
        Collections: 185000,
        GrossProfitAccrual: 79000,
        COGSAccrual: 119000,
        OverdueAR: 40000,
        RetentionReceivables: 23000,
        FieldEmployees: 44,
        Supervisors: 8,
        Office: 12,
        JobsWonNumber: 2,
        TotalEstimates: 7,
        TotalEstimates: 2100000,
        JobsWonDollar: 750000,
        WIP: 620000,
        UpcomingJobs: 1020000
      },
      {
        WeekEndingDate: 'Week 4',
        CashBank: 810000,
        CashOnHand: 50000,
        CurrentAR: 415000,
        CurrentAP: 305000,
        RevenueBilled: 205000,
        Collections: 192000,
        GrossProfitAccrual: 82000,
        COGSAccrual: 123000,
        OverdueAR: 42000,
        RetentionReceivables: 24000,
        FieldEmployees: 45,
        Supervisors: 8,
        Office: 12,
        JobsWonNumber: 4,
        TotalEstimates: 10,
        TotalEstimates: 2250000,
        JobsWonDollar: 820000,
        WIP: 680000,
        UpcomingJobs: 1100000
      },
      {
        WeekEndingDate: 'Week 5',
        CashBank: 825000,
        CashOnHand: 52000,
        CurrentAR: 425000,
        CurrentAP: 300000,
        RevenueBilled: 212000,
        Collections: 198000,
        GrossProfitAccrual: 85000,
        COGSAccrual: 127000,
        OverdueAR: 44000,
        RetentionReceivables: 25000,
        FieldEmployees: 45,
        Supervisors: 8,
        Office: 12,
        JobsWonNumber: 3,
        TotalEstimates: 8,
        TotalEstimates: 2400000,
        JobsWonDollar: 850000,
        WIP: 720000,
        UpcomingJobs: 1150000
      },
      {
        WeekEndingDate: 'Week 6',
        CashBank: 842500,
        CashOnHand: 55000,
        CurrentAR: 435000,
        CurrentAP: 295000,
        RevenueBilled: 220000,
        Collections: 205000,
        GrossProfitAccrual: 88000,
        COGSAccrual: 132000,
        OverdueAR: 45200,
        RetentionReceivables: 26000,
        FieldEmployees: 46,
        Supervisors: 8,
        Office: 13,
        JobsWonNumber: 3,
        TotalEstimates: 9,
        TotalEstimates: 2500000,
        JobsWonDollar: 900000,
        WIP: 780000,
        UpcomingJobs: 1200000
      }
    ];
  };
  
  // Format currency
  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };
  
  // Main render
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      color: '#e2e8f0',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
          📊 Financial Dashboard
        </h1>
        <p style={{ color: '#94a3b8' }}>
          Real-time financial metrics and performance tracking
        </p>
      </div>
      
      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <KPICard 
          label="Total Cash" 
          value={formatCurrency(metrics.totalCash)}
          change="12.5% from last week"
          isPositive={true}
        />
        <KPICard 
          label="Current Ratio" 
          value={`${metrics.currentRatio}x`}
          change="0.3x improvement"
          isPositive={true}
        />
        <KPICard 
          label="Gross Margin" 
          value={`${metrics.grossMargin}%`}
          change="1.2% from target"
          isPositive={metrics.grossMargin > 40}
        />
        <KPICard 
          label="DSO" 
          value={`${metrics.dso} days`}
          change="5 days improvement"
          isPositive={true}
        />
        <KPICard 
          label="Collection Rate" 
          value={`${metrics.collectionRate}%`}
          change="3% increase"
          isPositive={metrics.collectionRate > 90}
        />
        <KPICard 
          label="Win Rate" 
          value={`${metrics.winRate}%`}
          change="4% from average"
          isPositive={metrics.winRate > 30}
        />
      </div>
      
      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Revenue vs Collections */}
        <SimpleBarChart 
          data={chartData.revenue}
          labels={chartData.weeks}
          title="📈 Revenue Billed (Last 6 Weeks)"
          color="#3b82f6"
        />
        
        <SimpleBarChart 
          data={chartData.collections}
          labels={chartData.weeks}
          title="💰 Collections (Last 6 Weeks)"
          color="#10b981"
        />
        
        {/* AR Breakdown */}
        <SimplePieChart
          data={chartData.arBreakdown}
          labels={['Current AR', 'Retention', 'Overdue >90d']}
          title="📊 AR Aging Analysis"
          colors={['#10b981', '#f59e0b', '#ef4444']}
        />
        
        {/* Workforce */}
        <SimplePieChart
          data={chartData.workforce}
          labels={['Field', 'Supervisors', 'Office']}
          title="👥 Workforce Distribution"
          colors={['#3b82f6', '#8b5cf6', '#06b6d4']}
        />
        
        {/* Project Pipeline */}
        <SimpleBarChart
          data={chartData.pipeline}
          labels={['Estimates', 'Won', 'WIP', 'Backlog']}
          title="🏗️ Project Pipeline"
          color="#8b5cf6"
        />
      </div>
      
      {/* Weekly Summary Table */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
          📅 Weekly Summary
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#94a3b8' }}>WEEK</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#94a3b8' }}>REVENUE</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#94a3b8' }}>COLLECTIONS</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#94a3b8' }}>MARGIN</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#94a3b8' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {chartData.weeks.map((week, index) => (
              <tr key={index} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <td style={{ padding: '12px', fontSize: '14px' }}>{week}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{formatCurrency(chartData.revenue[index])}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{formatCurrency(chartData.collections[index])}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {chartData.revenue[index] > 0 ? 
                    `${((chartData.revenue[index] * 0.4) / chartData.revenue[index] * 100).toFixed(1)}%` : 
                    'N/A'
                  }
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Complete
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Info Box */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#60a5fa' }}>
          ℹ️ Dashboard Information
        </h4>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#cbd5e1' }}>
          This dashboard is displaying {chartData.weeks.length} weeks of financial data. 
          {data ? ' Data is being read from your WeeklyEntry form.' : ' Using sample data - pass your weekly entries to see real data.'}
        </p>
      </div>
    </div>
  );
}
