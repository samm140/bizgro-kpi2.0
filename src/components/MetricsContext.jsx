// MetricsContext.jsx - Complete Merged Version with Dashboard & State Management
import React, { createContext, useContext, useState, useEffect } from 'react';

const MetricsContext = createContext();

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
};

export const MetricsProvider = ({ children }) => {
  // ============= DASHBOARD METRICS MANAGEMENT (from first version) =============
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

  // ============= WEEKLY DATA MANAGEMENT (from second version) =============
  const [weeklyData, setWeeklyData] = useState({
    revenueYTD: 0,
    priorYearRevenue: 0,
    gpmAverage: 0,
    activeProjects: 0,
    cashPosition: 0,
    weeks: [],
    weeklyRevenue: [],
    weeklyCollections: [],
    gpmTrend: [],
    currentAR: 0,
    currentAP: 0,
    cashOnHand: 0,
    backlog: 0,
    allEntries: [],
    dso: 45,
    dpo: 38
  });

  const [syncStatus, setSyncStatus] = useState({
    qbo: 'disconnected',
    lastSync: null,
    autoSync: false,
    syncInterval: 300000
  });

  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ============= LIFECYCLE & PERSISTENCE =============
  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Save dashboard metrics to localStorage
  useEffect(() => {
    localStorage.setItem('bizgro_dashboard_metrics', JSON.stringify(dashboardMetrics));
  }, [dashboardMetrics]);

  // Save metrics config to localStorage
  useEffect(() => {
    localStorage.setItem('bizgro_metrics_config', JSON.stringify(metricsConfig));
  }, [metricsConfig]);

  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem('bizgro_kpi_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setWeeklyData(prev => ({ ...prev, ...parsed }));
      }

      const entries = JSON.parse(localStorage.getItem('weekly_entries_history') || '[]');
      if (entries.length > 0) {
        calculateMetrics(entries);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  // ============= DASHBOARD METRICS FUNCTIONS (from first version) =============
  // Add metric to dashboard
  const addMetricToDashboard = (metric) => {
    setDashboardMetrics(prev => {
      if (prev.some(m => m.id === metric.id)) {
        return prev;
      }
      return [...prev, { ...metric, position: prev.length }];
    });
  };

  // Remove metric from dashboard
  const removeMetricFromDashboard = (metricId) => {
    setDashboardMetrics(prev => {
      const filtered = prev.filter(m => m.id !== metricId);
      return filtered.map((m, index) => ({ ...m, position: index }));
    });
  };

  // Reorder metrics on dashboard
  const reorderDashboardMetrics = (startIndex, endIndex) => {
    setDashboardMetrics(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((m, index) => ({ ...m, position: index }));
    });
  };

  // ============= METRIC CALCULATIONS (enhanced from first version) =============
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
      // ===== LIQUIDITY METRICS =====
      case 'LIQ001': // Current Ratio
        const currentAssets = parseValue('cashInBank') + parseValue('cashOnHand') + 
                             parseValue('savingsAccount') + parseValue('currentAR');
        const currentLiabilities = parseValue('currentAP');
        value = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
        formatted = value.toFixed(2) + 'x';
        trend = value > 1.5 ? 'up' : value < 1.0 ? 'down' : 'neutral';
        break;
        
      case 'LIQ002': // Quick Ratio
        const quickAssets = parseValue('cashInBank') + parseValue('cashOnHand') + 
                           parseValue('savingsAccount') +
                           (parseValue('currentAR') - parseValue('retentionReceivables'));
        value = parseValue('currentAP') > 0 ? quickAssets / parseValue('currentAP') : 0;
        formatted = value.toFixed(2) + 'x';
        trend = value > 1.0 ? 'up' : 'down';
        break;
        
      case 'LIQ003': // Cash Ratio
        const cash = parseValue('cashInBank') + parseValue('cashOnHand') + parseValue('savingsAccount');
        value = parseValue('currentAP') > 0 ? cash / parseValue('currentAP') : 0;
        formatted = value.toFixed(2) + 'x';
        trend = value > 0.5 ? 'up' : 'down';
        break;

      case 'LIQ004': // Working Capital
        const wc = (parseValue('cashInBank') + parseValue('cashOnHand') + parseValue('currentAR')) - parseValue('currentAP');
        value = wc;
        formatted = '$' + (value / 1000000).toFixed(2) + 'M';
        trend = value > 0 ? 'up' : 'down';
        break;
        
      // ===== AR / COLLECTIONS METRICS =====
      case 'AR001': // DSO (Days Sales Outstanding)
        const ar = parseValue('currentAR');
        const revenue = parseValue('revenueBilledNet');
        value = revenue > 0 ? (ar / revenue) * 7 : 0;
        formatted = Math.round(value) + ' days';
        trend = value < 45 ? 'up' : 'down';
        break;
        
      case 'AR002': // Collection Efficiency
        const collections = parseValue('collections');
        const billed = parseValue('revenueBilledNet');
        value = billed > 0 ? (collections / billed) * 100 : 0;
        formatted = value.toFixed(1) + '%';
        trend = value > 95 ? 'up' : value < 85 ? 'down' : 'neutral';
        break;

      case 'AR003': // Overdue AR %
        const overdueAR = parseValue('overdueAR');
        const totalAR = parseValue('currentAR');
        value = totalAR > 0 ? (overdueAR / totalAR) * 100 : 0;
        formatted = value.toFixed(1) + '%';
        trend = value < 20 ? 'up' : 'down';
        break;
        
      // ===== PROFITABILITY METRICS =====
      case 'PROF001': // Gross Profit Margin
        const gp = parseValue('grossProfitAccrual');
        const rev = parseValue('revenueBilledNet');
        value = rev > 0 ? (gp / rev) * 100 : 0;
        formatted = value.toFixed(1) + '%';
        trend = value > 30 ? 'up' : 'down';
        break;

      case 'PROF002': // Net Profit Margin
        const netProfit = parseValue('grossProfitAccrual') - parseValue('grossWagesAccrual');
        const totalRev = parseValue('revenueBilledNet');
        value = totalRev > 0 ? (netProfit / totalRev) * 100 : 0;
        formatted = value.toFixed(1) + '%';
        trend = value > 15 ? 'up' : 'down';
        break;

      case 'PROF003': // COGS %
        const cogs = parseValue('cogsAccrual');
        const revForCogs = parseValue('revenueBilledNet');
        value = revForCogs > 0 ? (cogs / revForCogs) * 100 : 0;
        formatted = value.toFixed(1) + '%';
        trend = value < 70 ? 'up' : 'down';
        break;
        
      // ===== SALES METRICS =====
      case 'SALES001': // Win Rate
        const jobsWon = parseValue('jobsWonCount');
        const totalEstimates = parseValue('newEstimatedJobs');
        value = totalEstimates > 0 ? (jobsWon / totalEstimates) * 100 : 0;
        formatted = value.toFixed(1) + '%';
        trend = value > 33 ? 'up' : 'down';
        break;
        
      case 'SALES002': // Average Deal Size
        const wonDollar = parseValue('jobsWonAmount');
        const wonNumber = parseValue('jobsWonCount');
        value = wonNumber > 0 ? wonDollar / wonNumber : 0;
        formatted = '$' + (value / 1000).toFixed(0) + 'k';
        trend = previousEntry && previousEntry.jobsWonCount > 0 ? 
          (value > parseFloat(previousEntry.jobsWonAmount) / parseFloat(previousEntry.jobsWonCount) ? 'up' : 'down') : 'neutral';
        break;

      case 'SALES003': // Pipeline Value
        const totalEst = parseValue('totalEstimates');
        value = totalEst;
        formatted = '$' + (value / 1000000).toFixed(2) + 'M';
        trend = previousEntry && value > parseFloat(previousEntry.totalEstimates || 0) ? 'up' : 'down';
        break;
        
      // ===== WORKFORCE METRICS =====
      case 'WORK001': // Total Headcount
        value = parseValue('fieldW2Count') + parseValue('subsCount') + 
                parseValue('supervisors') + parseValue('office');
        formatted = Math.round(value).toString();
        trend = previousEntry ? 
          (value > parseFloat(previousEntry.fieldW2Count || 0) + parseFloat(previousEntry.subsCount || 0) + 
           parseFloat(previousEntry.supervisors || 0) + parseFloat(previousEntry.office || 0) ? 'up' : 'down') : 'neutral';
        break;
        
      case 'WORK002': // Revenue per Employee
        const totalRevenue = parseValue('revenueBilledNet');
        const totalEmployees = parseValue('fieldW2Count') + parseValue('supervisors') + parseValue('office');
        value = totalEmployees > 0 ? totalRevenue / totalEmployees : 0;
        formatted = '$' + (value / 1000).toFixed(0) + 'k';
        trend = value > 200000/52 ? 'up' : 'down'; // Weekly threshold
        break;

      case 'WORK003': // Turnover Rate
        const terminated = parseValue('employeesFired');
        const totalEmp = parseValue('fieldW2Count') + parseValue('supervisors') + parseValue('office');
        value = totalEmp > 0 ? (terminated / totalEmp) * 100 : 0;
        formatted = value.toFixed(1) + '%';
        trend = value < 2 ? 'up' : 'down'; // Weekly threshold
        break;
        
      // ===== WIP METRICS =====
      case 'WIP001': // WIP Balance
        value = parseValue('wipAmount');
        formatted = '$' + (value / 1000000).toFixed(2) + 'M';
        trend = 'neutral';
        break;

      case 'WIP002': // WIP Count
        value = parseValue('wipCount');
        formatted = value.toString();
        trend = value > 0 ? 'up' : 'down';
        break;
        
      case 'WIP003': // Revenue Left to Bill
        value = parseValue('revLeftToBill');
        formatted = '$' + (value / 1000000).toFixed(2) + 'M';
        trend = previousEntry && parseFloat(previousEntry.revLeftToBill) > value ? 'up' : 'down';
        break;

      case 'WIP004': // Average WIP Size
        const wipTotal = parseValue('wipAmount');
        const wipNum = parseValue('wipCount');
        value = wipNum > 0 ? wipTotal / wipNum : 0;
        formatted = '$' + (value / 1000).toFixed(0) + 'k';
        trend = 'neutral';
        break;
        
      // ===== BACKLOG METRICS =====
      case 'BACK001': // Total Backlog
        value = parseValue('backlogAmount');
        formatted = '$' + (value / 1000000).toFixed(2) + 'M';
        trend = previousEntry && value > parseFloat(previousEntry.backlogAmount || 0) ? 'up' : 'down';
        break;

      case 'BACK002': // Backlog Count
        value = parseValue('backlogCount');
        formatted = value.toString();
        trend = previousEntry && value > parseFloat(previousEntry.backlogCount || 0) ? 'up' : 'down';
        break;

      case 'BACK003': // Months of Backlog
        const monthlyRev = parseValue('revenueBilledNet') * 4.33; // Convert weekly to monthly
        value = monthlyRev > 0 ? parseValue('backlogAmount') / monthlyRev : 0;
        formatted = value.toFixed(1) + ' months';
        trend = value > 3 ? 'up' : 'down';
        break;

      case 'BACK004': // Upcoming Jobs Pipeline
        value = parseValue('upcomingJobsDollar');
        formatted = '$' + (value / 1000000).toFixed(2) + 'M';
        trend = previousEntry && parseFloat(previousEntry.upcomingJobsDollar) < value ? 'up' : 'down';
        break;
        
      // ===== RISK METRICS =====
      case 'RISK001': // Customer Concentration
        value = parseValue('concentrationRisk');
        formatted = value.toFixed(0) + '%';
        trend = value < 50 ? 'up' : 'down';
        break;

      case 'RISK002': // LOC Utilization
        const locDrawn = parseValue('locDrawn');
        const locLimit = parseValue('locLimit');
        value = locLimit > 0 ? (locDrawn / locLimit) * 100 : 0;
        formatted = value.toFixed(1) + '%';
        trend = value < 70 ? 'up' : 'down';
        break;

      case 'RISK003': // Workers Comp Mod
        value = parseValue('workersCompMod');
        formatted = value.toFixed(2);
        trend = value < 1.0 ? 'up' : 'down';
        break;

      // ===== CASH METRICS =====
      case 'CASH001': // Total Cash Position
        value = parseValue('cashInBank') + parseValue('cashOnHand') + parseValue('savingsAccount');
        formatted = '$' + (value / 1000000).toFixed(2) + 'M';
        trend = previousEntry ? 
          (value > parseFloat(previousEntry.cashInBank || 0) + parseFloat(previousEntry.cashOnHand || 0) + 
           parseFloat(previousEntry.savingsAccount || 0) ? 'up' : 'down') : 'neutral';
        break;

      case 'CASH002': // Cash Burn Rate
        const currentCash = parseValue('cashInBank') + parseValue('cashOnHand') + parseValue('savingsAccount');
        const prevCash = previousEntry ? 
          parseFloat(previousEntry.cashInBank || 0) + parseFloat(previousEntry.cashOnHand || 0) + 
          parseFloat(previousEntry.savingsAccount || 0) : currentCash;
        value = prevCash - currentCash;
        formatted = '$' + (Math.abs(value) / 1000).toFixed(0) + 'k';
        trend = value < 0 ? 'up' : 'down'; // Negative burn is good
        break;
        
      default:
        formatted = 'N/A';
        break;
    }

    return { value, trend, formatted, metricId: metric.id };
  };

  // ============= DATA PROCESSING (from second version) =============
  const calculateMetrics = (entries) => {
    if (!entries || entries.length === 0) return;

    // Sort entries by date
    const sorted = entries.sort((a, b) => new Date(a.weekEnding) - new Date(b.weekEnding));
    
    // Calculate YTD metrics
    const ytdRevenue = sorted.reduce((sum, entry) => sum + parseFloat(entry.revenueBilledNet || entry.revenueBilledToDate || 0), 0);
    const ytdCollections = sorted.reduce((sum, entry) => sum + parseFloat(entry.collections || 0), 0);
    const ytdGrossProfit = sorted.reduce((sum, entry) => sum + parseFloat(entry.grossProfitAccrual || 0), 0);
    
    // Calculate averages
    const avgGPM = ytdRevenue > 0 ? (ytdGrossProfit / ytdRevenue * 100) : 0;
    
    // Get latest values
    const latest = sorted[sorted.length - 1];
    const cashPosition = parseFloat(latest.cashInBank || 0) + 
                        parseFloat(latest.cashOnHand || 0) + 
                        parseFloat(latest.savingsAccount || 0);
    
    // Calculate DSO and DPO
    const dso = calculateDSO(latest.currentAR, ytdRevenue);
    const dpo = calculateDPO(latest.currentAP, latest.cogsAccrual);
    
    // Extract weekly trends (last 6 weeks)
    const last6Weeks = sorted.slice(-6);
    const weeklyRevenue = last6Weeks.map(w => parseFloat(w.revenueBilledNet || w.revenueBilledToDate || 0));
    const weeklyCollections = last6Weeks.map(w => parseFloat(w.collections || 0));
    const gpmTrend = last6Weeks.map(w => parseFloat(w.gpmAccrual || 0));
    const weeks = last6Weeks.map(w => `W${new Date(w.weekEnding).getWeek()}`);
    
    setWeeklyData(prev => ({
      ...prev,
      revenueYTD: ytdRevenue,
      gpmAverage: avgGPM.toFixed(2),
      activeProjects: parseInt(latest.wipCount || 0),
      cashPosition,
      currentAR: parseFloat(latest.currentAR || 0),
      currentAP: parseFloat(latest.currentAP || 0),
      cashOnHand: parseFloat(latest.cashOnHand || 0),
      backlog: parseFloat(latest.backlogAmount || 0),
      weeks,
      weeklyRevenue,
      weeklyCollections,
      gpmTrend,
      allEntries: sorted,
      dso,
      dpo
    }));

    // Check for alerts
    checkForAlerts(latest, avgGPM);
  };

  const calculateDSO = (ar, revenue) => {
    if (!revenue || revenue === 0) return 0;
    return Math.round((ar / (revenue / 365)));
  };

  const calculateDPO = (ap, cogs) => {
    if (!cogs || cogs === 0) return 0;
    return Math.round((ap / (cogs / 365)));
  };

  const checkForAlerts = (latestEntry, avgGPM) => {
    const newAlerts = [];
    
    // Check GPM threshold
    if (avgGPM < 30) {
      newAlerts.push({
        id: 'gpm-low',
        type: 'warning',
        message: `Gross margin ${avgGPM.toFixed(1)}% is below 30% target`,
        metric: 'GPM',
        value: avgGPM
      });
    }
    
    // Check AR aging
    if (latestEntry.overdueAR && latestEntry.currentAR) {
      const overduePercent = (latestEntry.overdueAR / latestEntry.currentAR) * 100;
      if (overduePercent > 20) {
        newAlerts.push({
          id: 'ar-overdue',
          type: 'critical',
          message: `${overduePercent.toFixed(0)}% of AR is overdue (>60 days)`,
          metric: 'AR',
          value: overduePercent
        });
      }
    }
    
    // Check LOC utilization
    if (latestEntry.locDrawn && latestEntry.locLimit) {
      const locUtil = (latestEntry.locDrawn / latestEntry.locLimit) * 100;
      if (locUtil > 80) {
        newAlerts.push({
          id: 'loc-high',
          type: 'warning',
          message: `LOC utilization at ${locUtil.toFixed(0)}%`,
          metric: 'LOC',
          value: locUtil
        });
      }
    }
    
    // Check concentration risk
    if (latestEntry.concentrationRisk > 30) {
      newAlerts.push({
        id: 'concentration-risk',
        type: 'warning',
        message: `Customer concentration risk at ${latestEntry.concentrationRisk}%`,
        metric: 'Risk',
        value: latestEntry.concentrationRisk
      });
    }

    // Check cash position
    const cashTotal = parseFloat(latestEntry.cashInBank || 0) + 
                     parseFloat(latestEntry.cashOnHand || 0) + 
                     parseFloat(latestEntry.savingsAccount || 0);
    const weeklyBurn = parseFloat(latestEntry.cogsAccrual || 0) + parseFloat(latestEntry.grossWagesAccrual || 0);
    const weeksOfCash = weeklyBurn > 0 ? cashTotal / weeklyBurn : 0;
    
    if (weeksOfCash < 8) {
      newAlerts.push({
        id: 'cash-low',
        type: 'critical',
        message: `Only ${weeksOfCash.toFixed(1)} weeks of cash remaining`,
        metric: 'Cash',
        value: weeksOfCash
      });
    }
    
    setAlerts(newAlerts);
  };

  const updateWeeklyData = (newData) => {
    setWeeklyData(prev => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('bizgro_kpi_data', JSON.stringify(updated));
      return updated;
    });
    
    // Recalculate metrics if entries were updated
    if (newData.allEntries) {
      calculateMetrics(newData.allEntries);
    }
  };

  const updateSyncStatus = (status) => {
    setSyncStatus(prev => ({ ...prev, ...status }));
  };

  const clearAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const exportData = () => {
    const exportData = {
      weeklyData,
      syncStatus,
      dashboardMetrics,
      metricsConfig,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `bizgro_kpi_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (fileContent) => {
    try {
      const imported = JSON.parse(fileContent);
      if (imported.weeklyData) {
        updateWeeklyData(imported.weeklyData);
      }
      if (imported.syncStatus) {
        updateSyncStatus(imported.syncStatus);
      }
      if (imported.dashboardMetrics) {
        setDashboardMetrics(imported.dashboardMetrics);
      }
      if (imported.metricsConfig) {
        setMetricsConfig(imported.metricsConfig);
      }
      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, message: 'Failed to import data' };
    }
  };

  const resetData = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.removeItem('bizgro_kpi_data');
      localStorage.removeItem('weekly_entries_history');
      localStorage.removeItem('qbo_sync_log');
      localStorage.removeItem('bizgro_dashboard_metrics');
      localStorage.removeItem('bizgro_metrics_config');
      
      setWeeklyData({
        revenueYTD: 0,
        priorYearRevenue: 0,
        gpmAverage: 0,
        activeProjects: 0,
        cashPosition: 0,
        weeks: [],
        weeklyRevenue: [],
        weeklyCollections: [],
        gpmTrend: [],
        currentAR: 0,
        currentAP: 0,
        cashOnHand: 0,
        backlog: 0,
        allEntries: [],
        dso: 45,
        dpo: 38
      });
      
      setDashboardMetrics([]);
      setMetricsConfig({});
      setAlerts([]);
      
      return { success: true, message: 'All data has been reset' };
    }
    return { success: false, message: 'Reset cancelled' };
  };

  // Helper to get week number
  Date.prototype.getWeek = function() {
    const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };

  const value = {
    // Dashboard Metrics State & Actions
    dashboardMetrics,
    metricsConfig,
    addMetricToDashboard,
    removeMetricFromDashboard,
    reorderDashboardMetrics,
    calculateMetricValue,
    setMetricsConfig,
    
    // Weekly Data State
    weeklyData,
    syncStatus,
    alerts,
    isLoading,
    
    // Weekly Data Actions
    updateWeeklyData,
    updateSyncStatus,
    clearAlert,
    clearAllAlerts,
    setIsLoading,
    
    // Utilities
    calculateMetrics,
    exportData,
    importData,
    resetData,
    loadSavedData
  };

  return (
    <MetricsContext.Provider value={value}>
      {children}
    </MetricsContext.Provider>
  );
};

export default MetricsContext;
