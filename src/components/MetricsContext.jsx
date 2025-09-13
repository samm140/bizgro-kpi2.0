import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context for metrics management
const MetricsContext = createContext();

// Custom hook to use metrics context
export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetrics must be used within MetricsProvider');
  }
  return context;
};

// Metrics Provider Component
export const MetricsProvider = ({ children }) => {
  // Selected metrics for dashboard with their positions
  const [dashboardMetrics, setDashboardMetrics] = useState(() => {
    const saved = localStorage.getItem('bizgro_dashboard_metrics');
    return saved ? JSON.parse(saved) : [];
  });

  // Available metrics configuration
  const [metricsConfig, setMetricsConfig] = useState(() => {
    const saved = localStorage.getItem('bizgro_metrics_config');
    return saved ? JSON.parse(saved) : {};
  });

  // Weekly data for calculations
  const [weeklyData, setWeeklyData] = useState(() => {
    const data = localStorage.getItem('bizgro_kpi_data');
    return data ? JSON.parse(data) : null;
  });

  // Save to localStorage whenever dashboard metrics change
  useEffect(() => {
    localStorage.setItem('bizgro_dashboard_metrics', JSON.stringify(dashboardMetrics));
  }, [dashboardMetrics]);

  // Save metrics config to localStorage
  useEffect(() => {
    localStorage.setItem('bizgro_metrics_config', JSON.stringify(metricsConfig));
  }, [metricsConfig]);

  // Add metric to dashboard
  const addMetricToDashboard = (metric) => {
    setDashboardMetrics(prev => {
      // Check if already exists
      if (prev.some(m => m.id === metric.id)) {
        return prev;
      }
      // Add with position at the end
      return [...prev, { ...metric, position: prev.length }];
    });
  };

  // Remove metric from dashboard
  const removeMetricFromDashboard = (metricId) => {
    setDashboardMetrics(prev => {
      const filtered = prev.filter(m => m.id !== metricId);
      // Recalculate positions
      return filtered.map((m, index) => ({ ...m, position: index }));
    });
  };

  // Reorder metrics on dashboard
  const reorderDashboardMetrics = (startIndex, endIndex) => {
    setDashboardMetrics(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      // Update positions
      return result.map((m, index) => ({ ...m, position: index }));
    });
  };

  // Calculate metric value based on formula and data
  const calculateMetricValue = (metric) => {
    if (!weeklyData || !weeklyData.allEntries || weeklyData.allEntries.length === 0) {
      return { value: 0, trend: 'neutral', formatted: 'No Data' };
    }

    const latestEntry = weeklyData.allEntries[weeklyData.allEntries.length - 1];
    const previousEntry = weeklyData.allEntries[weeklyData.allEntries.length - 2];
    
    let value = 0;
    let trend = 'neutral';
    let formatted = '';

    // Parse values from latest entry
    const parseValue = (field) => parseFloat(latestEntry[field] || 0);
    
    // Calculate based on metric ID
    switch (metric.id) {
      // Liquidity Metrics
      case 'LIQ001': // Current Ratio
        const currentAssets = parseValue('cashInBank') + parseValue('cashOnHand') + parseValue('currentAR');
        const currentLiabilities = parseValue('currentAP');
        value = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
        formatted = value.toFixed(2) + 'x';
        trend = value > 1.5 ? 'up' : value < 1.0 ? 'down' : 'neutral';
        break;
        
      case 'LIQ002': // Quick Ratio
        const quickAssets = parseValue('cashInBank') + parseValue('cashOnHand') + 
                           (parseValue('currentAR') - parseValue('retentionReceivables'));
        value = parseValue('currentAP') > 0 ? quickAssets / parseValue('currentAP') : 0;
        formatted = value.toFixed(2) + 'x';
        trend = value > 1.0 ? 'up' : 'down';
        break;
        
      case 'LIQ003': // Cash Ratio
        const cash = parseValue('cashInBank') + parseValue('cashOnHand');
        value = parseValue('currentAP') > 0 ? cash / parseValue('currentAP') : 0;
        formatted = value.toFixed(2) + 'x';
        trend = value > 0.5 ? 'up' : 'down';
        break;
        
      // AR / Collections Metrics
      case 'AR001': // DSO
        const ar = parseValue('currentAR');
        const revenue = parseValue('revenueBilledToDate');
        value = revenue > 0 ? (ar / revenue) * 7 : 0;
        formatted = Math.round(value) + ' days';
        trend = value < 45 ? 'up' : 'down';
        break;
        
      case 'AR002': // Collection Efficiency
        const collections = parseValue('collections');
        const billed = parseValue('revenueBilledToDate');
        value = billed > 0 ? (collections / billed) * 100 : 0;
        formatted = value.toFixed(1) + '%';
        trend = value > 95 ? 'up' : value < 85 ? 'down' : 'neutral';
        break;
        
      // Profitability Metrics
      case 'PROF001': // Gross Profit Margin
        const gp = parseValue('grossProfitAccrual');
        const rev = parseValue('revenueBilledToDate');
        value = rev > 0 ? (gp / rev) * 100 : 0;
        formatted = value.toFixed(1) + '%';
        trend = value > 30 ? 'up' : 'down';
        break;
        
      // Sales Metrics
      case 'SALES001': // Win Rate
        const jobsWon = parseValue('jobsWonNumber');
        const totalEstimates = parseValue('newEstimatedJobs');
        value = totalEstimates > 0 ? (jobsWon / totalEstimates) * 100 : 0;
        formatted = value.toFixed(1) + '%';
        trend = value > 33 ? 'up' : 'down';
        break;
        
      case 'SALES002': // Average Deal Size
        const wonDollar = parseValue('jobsWonDollar');
        const wonNumber = parseValue('jobsWonNumber');
        value = wonNumber > 0 ? wonDollar / wonNumber : 0;
        formatted = '$' + (value / 1000).toFixed(0) + 'k';
        trend = previousEntry && previousEntry.jobsWonNumber > 0 ? 
          (value > parseFloat(previousEntry.jobsWonDollar) / parseFloat(previousEntry.jobsWonNumber) ? 'up' : 'down') : 'neutral';
        break;
        
      // Workforce Metrics
      case 'WORK001': // Total Headcount
        value = parseValue('fieldEmployees') + parseValue('supervisors') + parseValue('office');
        formatted = Math.round(value).toString();
        trend = previousEntry ? 
          (value > parseFloat(previousEntry.fieldEmployees || 0) + parseFloat(previousEntry.supervisors || 0) + parseFloat(previousEntry.office || 0) ? 'up' : 'down') : 'neutral';
        break;
        
      case 'WORK002': // Revenue per Employee
        const totalRevenue = parseValue('revenueBilledToDate');
        const totalEmployees = parseValue('fieldEmployees') + parseValue('supervisors') + parseValue('office');
        value = totalEmployees > 0 ? totalRevenue / totalEmployees : 0;
        formatted = '$' + (value / 1000).toFixed(0) + 'k';
        trend = value > 200000/52 ? 'up' : 'down'; // Weekly threshold
        break;
        
      // WIP Metrics
      case 'WIP001': // WIP Balance
        value = parseValue('wipDollar');
        formatted = '$' + (value / 1000000).toFixed(1) + 'M';
        trend = 'neutral';
        break;
        
      case 'WIP005': // Revenue Left to Bill
        value = parseValue('revLeftToBill');
        formatted = '$' + (value / 1000000).toFixed(1) + 'M';
        trend = previousEntry && parseFloat(previousEntry.revLeftToBill) > value ? 'up' : 'down';
        break;
        
      // Backlog Metrics
      case 'BACK004': // Upcoming Jobs Pipeline
        value = parseValue('upcomingJobsDollar');
        formatted = '$' + (value / 1000000).toFixed(1) + 'M';
        trend = previousEntry && parseFloat(previousEntry.upcomingJobsDollar) < value ? 'up' : 'down';
        break;
        
      // Risk Metrics
      case 'RISK001': // Customer Concentration
        value = parseValue('concentrationRisk');
        formatted = value.toFixed(0) + '%';
        trend = value < 50 ? 'up' : 'down';
        break;
        
      default:
        formatted = 'N/A';
        break;
    }

    return { value, trend, formatted };
  };

  // Update weekly data
  const updateWeeklyData = (data) => {
    setWeeklyData(data);
    localStorage.setItem('bizgro_kpi_data', JSON.stringify(data));
  };

  const value = {
    dashboardMetrics,
    metricsConfig,
    weeklyData,
    addMetricToDashboard,
    removeMetricFromDashboard,
    reorderDashboardMetrics,
    calculateMetricValue,
    updateWeeklyData,
    setMetricsConfig
  };

  return (
    <MetricsContext.Provider value={value}>
      {children}
    </MetricsContext.Provider>
  );
};

export default MetricsContext;
