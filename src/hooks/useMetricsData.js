// ============================================
// FIXED FILE: src/hooks/useMetricsData.js
// This version works with your existing mockApi structure
// ============================================

import { useEffect, useState } from 'react';

export function useMetricsData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get data directly from localStorage (matching your mockApi pattern)
        const storedData = localStorage.getItem('kpi2_dashboard_data');
        const weeklyEntries = JSON.parse(localStorage.getItem('kpi2_weekly_entries') || '[]');
        
        let dashboardData = {};
        if (storedData) {
          dashboardData = JSON.parse(storedData);
        }
        
        // Get the latest weekly entry
        const latestEntry = weeklyEntries.length > 0 
          ? weeklyEntries[weeklyEntries.length - 1] 
          : {};
        
        // Calculate aggregated values from all entries
        const totalRevenue = weeklyEntries.reduce((sum, entry) => 
          sum + (entry.revenueBilledToDate || 0), 0);
        
        const avgGPM = weeklyEntries.length > 0
          ? weeklyEntries.reduce((sum, entry) => 
              sum + (entry.grossProfitAccrual || 0), 0) / weeklyEntries.length
          : 0;
        
        // Map data to metric formula variables
        const mappedData = {
          // Financial Position
          CashBank: latestEntry.cashInBank || dashboardData.cashInBank || 0,
          CashOnHand: latestEntry.cashOnHand || dashboardData.cashOnHand || 0,
          CurrentAR: latestEntry.currentAR || dashboardData.currentAR || 0,
          RetentionReceivables: latestEntry.retentionReceivables || 0,
          OverdueAR: latestEntry.overdueAR || 0,
          CurrentAP: latestEntry.currentAP || dashboardData.currentAP || 0,
          
          // Revenue & Profitability
          RevenueBilledToDate: latestEntry.revenueBilledToDate || totalRevenue || 0,
          GrossProfitAccrual: latestEntry.grossProfitAccrual || avgGPM || 0,
          CogsAccrual: latestEntry.cogsAccrual || 0,
          GrossWagesAccrual: latestEntry.grossWagesAccrual || 0,
          Collections: latestEntry.collections || 0,
          Retention: latestEntry.retention || 0,
          PriorYearRevenue: dashboardData.priorYearRevenue || 4500000, // Default value
          
          // Sales & Pipeline
          JobsWonNumber: latestEntry.jobsWonNumber || 0,
          JobsWonDollar: latestEntry.jobsWonDollar || 0,
          TotalEstimates: latestEntry.totalEstimates || 0,
          InvitesExistingGC: latestEntry.invitesExistingGC || 0,
          InvitesNewGC: latestEntry.invitesNewGC || 0,
          NewEstimatedJobs: latestEntry.newEstimatedJobs || 0,
          
          // Projects & Backlog
          JobsStartedNumber: latestEntry.jobsStartedNumber || 0,
          JobsStartedDollar: latestEntry.jobsStartedDollar || 0,
          JobsCompleted: latestEntry.jobsCompleted || 0,
          UpcomingJobsDollar: latestEntry.upcomingJobsDollar || 0,
          WipDollar: latestEntry.wipDollar || 0,
          RevLeftToBill: latestEntry.revLeftToBill || 0,
          
          // Workforce
          FieldEmployees: latestEntry.fieldEmployees || 0,
          Supervisors: latestEntry.supervisors || 0,
          Office: latestEntry.office || 0,
          NewHires: latestEntry.newHires || 0,
          EmployeesFired: latestEntry.employeesFired || 0,
          
          // Risk
          ConcentrationRisk: latestEntry.concentrationRisk || 0
        };
        
        setData(mappedData);
        setLastUpdated(new Date());
        setLoading(false);
      } catch (error) {
        console.error('Error fetching metrics data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { loading, data, lastUpdated };
}
