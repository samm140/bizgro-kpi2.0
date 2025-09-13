import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMetricsStore = create(
  persist(
    (set, get) => ({
      // Complete metrics registry with BizGro-specific formulas
      registry: {},
      
      // User's selected metrics for dashboard display
      selectedForDashboard: [],
      
      // Initialize with default BizGro metrics
      initializeRegistry: () => {
        const defaultRegistry = {
          // LIQUIDITY METRICS
          'LIQ001': {
            id: 'LIQ001',
            key: 'current_ratio',
            label: 'Current Ratio',
            category: 'Liquidity',
            formula: '(CashBank + CashOnHand + CurrentAR - RetentionReceivables) / CurrentAP',
            target: { min: 1.5, max: 2.0 },
            formatter: 'ratio',
            description: 'Measures ability to pay short-term obligations'
          },
          'LIQ002': {
            id: 'LIQ002',
            key: 'quick_ratio',
            label: 'Quick Ratio',
            category: 'Liquidity',
            formula: '(CashBank + CashOnHand + CurrentAR) / CurrentAP',
            target: { min: 1.0 },
            formatter: 'ratio',
            description: 'More conservative liquidity measure'
          },
          'LIQ003': {
            id: 'LIQ003',
            key: 'cash_ratio',
            label: 'Cash Ratio',
            category: 'Liquidity',
            formula: '(CashBank + CashOnHand) / CurrentAP',
            target: { min: 0.5 },
            formatter: 'ratio'
          },
          
          // EFFICIENCY METRICS
          'EFF001': {
            id: 'EFF001',
            key: 'dso',
            label: 'Days Sales Outstanding',
            category: 'Efficiency',
            formula: '(CurrentAR / RevenueBilledToDate) * 365',
            target: { max: 45 },
            formatter: 'days',
            description: 'Average collection period'
          },
          'EFF002': {
            id: 'EFF002',
            key: 'dpo',
            label: 'Days Payable Outstanding',
            category: 'Efficiency',
            formula: '(CurrentAP / (CogsAccrual + GrossWagesAccrual)) * 365',
            target: { min: 30, max: 60 },
            formatter: 'days'
          },
          'EFF003': {
            id: 'EFF003',
            key: 'cash_conversion_cycle',
            label: 'Cash Conversion Cycle',
            category: 'Efficiency',
            formula: '((CurrentAR / RevenueBilledToDate) - (CurrentAP / CogsAccrual)) * 365',
            target: { max: 30 },
            formatter: 'days'
          },
          
          // PROFITABILITY METRICS
          'PRF001': {
            id: 'PRF001',
            key: 'gross_margin',
            label: 'Gross Profit Margin',
            category: 'Profitability',
            formula: '(GrossProfitAccrual / RevenueBilledToDate) * 100',
            target: { min: 30 },
            formatter: 'percentage'
          },
          'PRF002': {
            id: 'PRF002',
            key: 'revenue_per_employee',
            label: 'Revenue per Employee',
            category: 'Profitability',
            formula: 'RevenueBilledToDate / (FieldEmployees + Supervisors + Office)',
            formatter: 'currency'
          },
          
          // GROWTH METRICS
          'GRW001': {
            id: 'GRW001',
            key: 'revenue_growth',
            label: 'Revenue Growth Rate',
            category: 'Growth',
            formula: '((RevenueBilledToDate - PriorYearRevenue) / PriorYearRevenue) * 100',
            target: { min: 15 },
            formatter: 'percentage'
          },
          'GRW002': {
            id: 'GRW002',
            key: 'win_rate',
            label: 'Job Win Rate',
            category: 'Growth',
            formula: '(JobsWonNumber / TotalEstimates) * 100',
            target: { min: 25 },
            formatter: 'percentage'
          },
          
          // OPERATIONAL METRICS
          'OPS001': {
            id: 'OPS001',
            key: 'backlog_ratio',
            label: 'Backlog Coverage',
            category: 'Operations',
            formula: '(UpcomingJobsDollar + WipDollar) / (RevenueBilledToDate / 12)',
            target: { min: 3 },
            formatter: 'months',
            description: 'Months of revenue in backlog'
          },
          'OPS002': {
            id: 'OPS002',
            key: 'utilization_rate',
            label: 'Field Utilization',
            category: 'Operations',
            formula: '(JobsStartedNumber / FieldEmployees) * 100',
            target: { min: 85 },
            formatter: 'percentage'
          },
          
          // RISK METRICS
          'RSK001': {
            id: 'RSK001',
            key: 'concentration_risk',
            label: 'Customer Concentration',
            category: 'Risk',
            formula: 'ConcentrationRisk',
            target: { max: 30 },
            formatter: 'percentage',
            description: 'Revenue from top customer'
          },
          'RSK002': {
            id: 'RSK002',
            key: 'overdue_ar_ratio',
            label: 'Overdue AR Ratio',
            category: 'Risk',
            formula: '(OverdueAR / CurrentAR) * 100',
            target: { max: 10 },
            formatter: 'percentage'
          }
        };
        
        set({ registry: defaultRegistry });
      },
      
      setRegistry: (registry) => set({ registry }),
      
      addToDashboard: (metricId) => {
        const current = get().selectedForDashboard;
        if (!current.includes(metricId)) {
          set({ selectedForDashboard: [...current, metricId] });
        }
      },
      
      removeFromDashboard: (metricId) => {
        set({ 
          selectedForDashboard: get().selectedForDashboard.filter(id => id !== metricId)
        });
      },
      
      toggleMetric: (metricId) => {
        const current = get().selectedForDashboard;
        if (current.includes(metricId)) {
          get().removeFromDashboard(metricId);
        } else {
          get().addToDashboard(metricId);
        }
      },
      
      reorderMetrics: (newOrder) => {
        set({ selectedForDashboard: newOrder });
      },
      
      getSelectedMetrics: () => {
        const { registry, selectedForDashboard } = get();
        return selectedForDashboard
          .map(id => registry[id])
          .filter(Boolean);
      }
    }),
    {
      name: 'bizgro-metrics-selection',
      partialize: (state) => ({ 
        selectedForDashboard: state.selectedForDashboard 
      })
    }
  )
);
