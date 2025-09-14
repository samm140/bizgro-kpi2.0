// src/hooks/useMetricsData.jsx
// Updated hook to properly connect with WeeklyEntry data

import React, { useEffect, useState, useCallback, useRef, createContext, useContext } from 'react';

export function useMetricsData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Memoize the fetch function to prevent recreating on every render
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      // Get data from localStorage - using your existing keys
      const dashboardData = localStorage.getItem('bizgro_kpi_data');
      const weeklyEntries = localStorage.getItem('kpi2_weekly_entries');
      
      let parsedDashboard = {};
      let parsedWeekly = [];
      
      if (dashboardData) {
        try {
          parsedDashboard = JSON.parse(dashboardData);
        } catch (e) {
          console.error('Error parsing dashboard data:', e);
        }
      }
      
      if (weeklyEntries) {
        try {
          parsedWeekly = JSON.parse(weeklyEntries);
        } catch (e) {
          console.error('Error parsing weekly entries:', e);
        }
      }
      
      // Get the latest entry from allEntries or weekly entries
      const allEntries = parsedDashboard.allEntries || parsedWeekly || [];
      const latestEntry = allEntries.length > 0 ? allEntries[allEntries.length - 1] : {};
      
      // Map data to match metric formula variables
      const mappedData = {
        // Financial Position
        CashBank: parseFloat(latestEntry.cashInBank) || parseFloat(parsedDashboard.cashInBank) || 0,
        CashOnHand: parseFloat(latestEntry.cashOnHand) || parseFloat(parsedDashboard.cashOnHand) || 0,
        CurrentAR: parseFloat(latestEntry.currentAR) || parseFloat(parsedDashboard.currentAR) || 0,
        RetentionReceivables: parseFloat(latestEntry.retentionReceivables) || 0,
        OverdueAR: parseFloat(latestEntry.overdueAR) || 0,
        CurrentAP: parseFloat(latestEntry.currentAP) || parseFloat(parsedDashboard.currentAP) || 0,
        
        // Revenue & Profitability
        RevenueBilledToDate: parseFloat(latestEntry.revenueBilledToDate) || 0,
        GrossProfitAccrual: parseFloat(latestEntry.grossProfitAccrual) || 0,
        CogsAccrual: parseFloat(latestEntry.cogsAccrual) || 0,
        GrossWagesAccrual: parseFloat(latestEntry.grossWagesAccrual) || 0,
        Collections: parseFloat(latestEntry.collections) || 0,
        Retention: parseFloat(latestEntry.retention) || 0,
        PriorYearRevenue: parseFloat(parsedDashboard.priorYearRevenue) || 12680000,
        ChangeOrders: parseFloat(latestEntry.changeOrders) || 0,
        
        // Sales & Pipeline
        JobsWonNumber: parseInt(latestEntry.jobsWonNumber, 10) || 0,
        JobsWonDollar: parseFloat(latestEntry.jobsWonDollar) || 0,
        TotalEstimates: parseInt(latestEntry.totalEstimates, 10) || parseInt(latestEntry.newEstimatedJobs, 10) || 0,
        InvitesExistingGC: parseInt(latestEntry.invitesExistingGC, 10) || 0,
        InvitesNewGC: parseInt(latestEntry.invitesNewGC, 10) || 0,
        NewEstimatedJobs: parseInt(latestEntry.newEstimatedJobs, 10) || 0,
        
        // Projects & Backlog
        JobsStartedNumber: parseInt(latestEntry.jobsStartedNumber, 10) || 0,
        JobsStartedDollar: parseFloat(latestEntry.jobsStartedDollar) || 0,
        JobsCompleted: parseInt(latestEntry.jobsCompleted, 10) || 0,
        UpcomingJobsDollar: parseFloat(latestEntry.upcomingJobsDollar) || 0,
        WipDollar: parseFloat(latestEntry.wipDollar) || 0,
        RevLeftToBill: parseFloat(latestEntry.revLeftToBill) || 0,
        ActiveProjectsCount: parseInt(parsedDashboard.activeProjects, 10) || 23,
        BacklogAmount: parseFloat(parsedDashboard.backlog) || 21800000,
        
        // Workforce
        FieldEmployees: parseInt(latestEntry.fieldEmployees, 10) || 0,
        Supervisors: parseInt(latestEntry.supervisors, 10) || 0,
        Office: parseInt(latestEntry.office, 10) || 0,
        NewHires: parseInt(latestEntry.newHires, 10) || 0,
        EmployeesFired: parseInt(latestEntry.employeesFired, 10) || 0,
        
        // Risk
        ConcentrationRisk: parseFloat(latestEntry.concentrationRisk) || 0,
        
        // Calculated/Derived fields
        TotalCash: 0,
        WeeklyBurnRate: 0,
        MonthlyRevenue: 0,
        DSO: 0,
        DPO: 0,
        DIO: 0,
        
        // Operational Metrics
        OpEx: 150000, // Default operational expenses
        CapEx: 50000, // Default capital expenditures
        LOC_Drawn: 500000,
        LOC_Limit: 2000000,
        AvgDailyRevenue: 0,
        RiskFactor: 0.02, // 2% default risk factor
        
        // Additional metrics from dashboard summary
        RevenueYTD: parseFloat(parsedDashboard.revenueYTD) || 14204274,
        GPMAverage: parseFloat(parsedDashboard.gpmAverage) || 34.08,
        CashPosition: parseFloat(parsedDashboard.cashPosition) || 1044957,
      };
      
      // Calculate derived fields
      mappedData.TotalCash = mappedData.CashBank + mappedData.CashOnHand;
      mappedData.WeeklyBurnRate = (mappedData.OpEx + mappedData.GrossWagesAccrual) / 4; // Monthly expenses / 4 weeks
      mappedData.MonthlyRevenue = mappedData.RevenueBilledToDate * 4; // Weekly revenue * 4
      mappedData.AvgDailyRevenue = mappedData.RevenueBilledToDate / 7;
      
      // Calculate DSO if we have revenue
      if (mappedData.RevenueBilledToDate > 0) {
        mappedData.DSO = (mappedData.CurrentAR / mappedData.RevenueBilledToDate) * 7;
      }
      
      // Calculate DPO if we have COGS
      if (mappedData.CogsAccrual > 0) {
        mappedData.DPO = (mappedData.CurrentAP / mappedData.CogsAccrual) * 7;
      }
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setData(mappedData);
        setLastUpdated(new Date());
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching metrics data:', error);
      if (isMountedRef.current) {
        setError(error.message || 'Failed to fetch metrics data');
        setLoading(false);
      }
    }
  }, []);
  
  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;
    
    // Initial fetch
    fetchData();
    
    // Set up refresh interval (30 seconds)
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        fetchData();
      }
    }, 30000);
    
    // Listen for storage events (when data changes in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'bizgro_kpi_data' || e.key === 'kpi2_weekly_entries') {
        fetchData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events that might be triggered after data submission
    const handleDataUpdate = () => {
      fetchData();
    };
    
    window.addEventListener('kpi:dataUpdated', handleDataUpdate);
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('kpi:dataUpdated', handleDataUpdate);
    };
  }, [fetchData]);
  
  // Provide a manual refresh function
  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);
  
  return { 
    loading, 
    data, 
    lastUpdated, 
    error,
    refresh 
  };
}

// Optional: Export a provider pattern for global state management
const MetricsDataContext = createContext(null);

export function MetricsDataProvider({ children }) {
  const metricsData = useMetricsData();
  
  return (
    <MetricsDataContext.Provider value={metricsData}>
      {children}
    </MetricsDataContext.Provider>
  );
}

export function useMetricsContext() {
  const context = useContext(MetricsDataContext);
  if (!context) {
    throw new Error('useMetricsContext must be used within MetricsDataProvider');
  }
  return context;
}
