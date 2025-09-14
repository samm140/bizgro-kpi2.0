// ============================================
// IMPROVED FILE: src/hooks/useMetricsData.js
// Enhanced version with better error handling and stability
// ============================================

import { useEffect, useState, useCallback, useRef } from 'react';

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
      
      // Get data directly from localStorage (matching your mockApi pattern)
      const storedData = localStorage.getItem('kpi2_dashboard_data');
      const weeklyEntries = JSON.parse(localStorage.getItem('kpi2_weekly_entries') || '[]');
      
      let dashboardData = {};
      if (storedData) {
        try {
          dashboardData = JSON.parse(storedData);
        } catch (parseError) {
          console.error('Error parsing dashboard data:', parseError);
          dashboardData = {};
        }
      }
      
      // Get the latest weekly entry
      const latestEntry = weeklyEntries.length > 0 
        ? weeklyEntries[weeklyEntries.length - 1] 
        : {};
      
      // Calculate aggregated values from all entries
      const totalRevenue = weeklyEntries.reduce((sum, entry) => 
        sum + (parseFloat(entry.revenueBilledToDate) || 0), 0);
      
      const avgGPM = weeklyEntries.length > 0
        ? weeklyEntries.reduce((sum, entry) => 
            sum + (parseFloat(entry.grossProfitAccrual) || 0), 0) / weeklyEntries.length
        : 0;
      
      // Map data to metric formula variables with proper type conversion
      const mappedData = {
        // Financial Position
        CashBank: parseFloat(latestEntry.cashInBank || dashboardData.cashInBank || 0),
        CashOnHand: parseFloat(latestEntry.cashOnHand || dashboardData.cashOnHand || 0),
        CurrentAR: parseFloat(latestEntry.currentAR || dashboardData.currentAR || 0),
        RetentionReceivables: parseFloat(latestEntry.retentionReceivables || 0),
        OverdueAR: parseFloat(latestEntry.overdueAR || 0),
        CurrentAP: parseFloat(latestEntry.currentAP || dashboardData.currentAP || 0),
        
        // Revenue & Profitability
        RevenueBilledToDate: parseFloat(latestEntry.revenueBilledToDate || totalRevenue || 0),
        GrossProfitAccrual: parseFloat(latestEntry.grossProfitAccrual || avgGPM || 0),
        CogsAccrual: parseFloat(latestEntry.cogsAccrual || 0),
        GrossWagesAccrual: parseFloat(latestEntry.grossWagesAccrual || 0),
        Collections: parseFloat(latestEntry.collections || 0),
        Retention: parseFloat(latestEntry.retention || 0),
        PriorYearRevenue: parseFloat(dashboardData.priorYearRevenue || 4500000), // Default value
        
        // Sales & Pipeline
        JobsWonNumber: parseInt(latestEntry.jobsWonNumber || 0, 10),
        JobsWonDollar: parseFloat(latestEntry.jobsWonDollar || 0),
        TotalEstimates: parseInt(latestEntry.totalEstimates || 0, 10),
        InvitesExistingGC: parseInt(latestEntry.invitesExistingGC || 0, 10),
        InvitesNewGC: parseInt(latestEntry.invitesNewGC || 0, 10),
        NewEstimatedJobs: parseInt(latestEntry.newEstimatedJobs || 0, 10),
        
        // Projects & Backlog
        JobsStartedNumber: parseInt(latestEntry.jobsStartedNumber || 0, 10),
        JobsStartedDollar: parseFloat(latestEntry.jobsStartedDollar || 0),
        JobsCompleted: parseInt(latestEntry.jobsCompleted || 0, 10),
        UpcomingJobsDollar: parseFloat(latestEntry.upcomingJobsDollar || 0),
        WipDollar: parseFloat(latestEntry.wipDollar || 0),
        RevLeftToBill: parseFloat(latestEntry.revLeftToBill || 0),
        
        // Workforce
        FieldEmployees: parseInt(latestEntry.fieldEmployees || 0, 10),
        Supervisors: parseInt(latestEntry.supervisors || 0, 10),
        Office: parseInt(latestEntry.office || 0, 10),
        NewHires: parseInt(latestEntry.newHires || 0, 10),
        EmployeesFired: parseInt(latestEntry.employeesFired || 0, 10),
        
        // Risk
        ConcentrationRisk: parseFloat(latestEntry.concentrationRisk || 0)
      };
      
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
  }, []); // Empty deps since we're only reading from localStorage
  
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
      if (e.key === 'kpi2_dashboard_data' || e.key === 'kpi2_weekly_entries') {
        fetchData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
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
import { createContext, useContext } from 'react';

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
