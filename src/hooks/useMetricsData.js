import { useEffect, useState } from 'react';
import { getDashboardData } from '../services/mockApi';

export function useMetricsData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await getDashboardData();
        const latestEntry = dashboardData.allEntries?.[0] || {};
        
        // Map dashboard data to metric formula variables
        const mappedData = {
          // Financial Position
          CashBank: latestEntry.cashInBank || 0,
          CashOnHand: latestEntry.cashOnHand || 0,
          CurrentAR: latestEntry.currentAR || 0,
          RetentionReceivables: latestEntry.retentionReceivables || 0,
          OverdueAR: latestEntry.overdueAR || 0,
          CurrentAP: latestEntry.currentAP || 0,
          
          // Revenue & Profitability
          RevenueBilledToDate: latestEntry.revenueBilledToDate || 0,
          GrossProfitAccrual: latestEntry.grossProfitAccrual || 0,
          CogsAccrual: latestEntry.cogsAccrual || 0,
          GrossWagesAccrual: latestEntry.grossWagesAccrual || 0,
          Collections: latestEntry.collections || 0,
          Retention: latestEntry.retention || 0,
          PriorYearRevenue: dashboardData.priorYearRevenue || 0,
          
          // Sales & Pipeline
          JobsWonNumber: latestEntry.jobsWonNumber || 0,
          JobsWonDollar: latestEntry.jobsWonDollar || 0,
          TotalEstimates: latestEntry.totalEstimates || 0,
          
          // Projects & Backlog
          JobsStartedNumber: latestEntry.jobsStartedNumber || 0,
          JobsStartedDollar: latestEntry.jobsStartedDollar || 0,
          UpcomingJobsDollar: latestEntry.upcomingJobsDollar || 0,
          WipDollar: latestEntry.wipDollar || 0,
          RevLeftToBill: latestEntry.revLeftToBill || 0,
          
          // Workforce
          FieldEmployees: latestEntry.fieldEmployees || 0,
          Supervisors: latestEntry.supervisors || 0,
          Office: latestEntry.office || 0,
          
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
