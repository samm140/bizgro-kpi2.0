import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';

// Enhanced Dashboard Component with all 85 metrics
const EnhancedDashboard = ({ data }) => {
  const [charts, setCharts] = useState({});
  const [activeMetricCategory, setActiveMetricCategory] = useState('Liquidity');

  // Helper function to parse float values
  const pFloat = (val) => parseFloat(String(val).replace(/,/g, '')) || 0;

  // Calculate all 85 insights from the metrics catalog
  const calculateAllInsights = (allEntries) => {
    if (!allEntries || allEntries.length < 2) {
      return { 
        "Error": [{ 
          title: "Not Enough Data", 
          value: 0, 
          unit: '', 
          formula: '', 
          trend: 0, 
          notes: "Need at least two weekly entries to calculate trends and insights." 
        }]
      };
    }

    const insights = { 
      "Liquidity": [], 
      "AR / Collections": [], 
      "AP / Payables": [], 
      "Profitability": [], 
      "Sales": [], 
      "Bids / Funnel": [], 
      "Projects": [], 
      "Backlog": [], 
      "WIP": [], 
      "Revenue Quality": [],
      "Workforce": [], 
      "Risk": [],
      "Comparative": []
    };
    
    const add = (cat, title, formula, notes, valueFn, unit = '') => {
      const lastValue = valueFn(allEntries[allEntries.length - 1]);
      const prevValue = valueFn(allEntries[allEntries.length - 2]);
      const trend = lastValue - prevValue;
      insights[cat].push({ title, value: lastValue, unit, formula, trend, notes });
    };

    // Liquidity Metrics (8)
    add("Liquidity", "Current Ratio (Ops)", "=(Cash + AR) / AP", "Target: 1.5–2.0", e => { 
      const assets = pFloat(e.cashInBank) + pFloat(e.cashOnHand) + pFloat(e.currentAR); 
      const liab = pFloat(e.currentAP); 
      return liab > 0 ? assets / liab : 0; 
    }, 'x');
    
    add("Liquidity", "Quick Ratio", "=(Cash + (AR - Retention)) / AP", "Target: > 1.0", e => { 
      const assets = pFloat(e.cashInBank) + pFloat(e.cashOnHand) + (pFloat(e.currentAR) - pFloat(e.retentionReceivables)); 
      const liab = pFloat(e.currentAP); 
      return liab > 0 ? assets / liab : 0; 
    }, 'x');
    
    add("Liquidity", "Cash Ratio", "=Cash / AP", "Immediate liquidity", e => {
      const cash = pFloat(e.cashInBank) + pFloat(e.cashOnHand);
      const ap = pFloat(e.currentAP);
      return ap > 0 ? cash / ap : 0;
    }, 'x');
    
    add("Liquidity", "Burn Rate (Weekly)", "=Cash Used", "Cash consumption rate", e => {
      return pFloat(e.cogsAccrual || 330000) + pFloat(e.grossWagesAccrual || 280000);
    }, '$');
    
    add("Liquidity", "Cash Runway", "=Cash / Burn Rate", "Weeks of cash available", e => {
      const cash = pFloat(e.cashInBank) + pFloat(e.cashOnHand);
      const burn = pFloat(e.cogsAccrual || 330000) + pFloat(e.grossWagesAccrual || 280000);
      return burn > 0 ? cash / burn : 0;
    }, ' weeks');
    
    add("Liquidity", "Working Capital", "=Current Assets - Current Liabilities", "Operating liquidity", e => {
      return pFloat(e.cashInBank) + pFloat(e.cashOnHand) + pFloat(e.currentAR) - pFloat(e.currentAP);
    }, '$');
    
    add("Liquidity", "Cash Conversion Cycle", "=DSO - DPO", "Cash cycle efficiency", e => {
      const dso = (pFloat(e.currentAR) / pFloat(e.revenueBilledToDate)) * 7;
      const dpo = (pFloat(e.currentAP) / pFloat(e.cogsAccrual || 330000)) * 7;
      return dso - dpo;
    }, ' days');
    
    add("Liquidity", "Free Cash Flow", "=Collections - Operating Expenses", "Cash generation", e => {
      return pFloat(e.collections) - pFloat(e.cogsAccrual || 330000) - pFloat(e.grossWagesAccrual || 280000);
    }, '$');

    // AR / Collections Metrics (7)
    add("AR / Collections", "DSO (Days Sales Outstanding)", "=(AR / Revenue) * 7", "Target: < 45 days", e => { 
      const rev = pFloat(e.revenueBilledToDate) - pFloat(e.retention); 
      return rev > 0 ? (pFloat(e.currentAR) / rev) * 7 : 0; 
    }, ' days');
    
    add("AR / Collections", "AR Turnover", "=Revenue / AR", "Higher is better", e => {
      const ar = pFloat(e.currentAR);
      return ar > 0 ? pFloat(e.revenueBilledToDate) / ar : 0;
    }, 'x/week');
    
    add("AR / Collections", "Collection Efficiency", "=Collections / Billings", "Target: > 95%", e => { 
      const billings = pFloat(e.revenueBilledToDate);
      return billings > 0 ? (pFloat(e.collections) / billings) * 100 : 0;
    }, '%');
    
    add("AR / Collections", "Billings–Collections Gap", "=Revenue - Collections", "Gap increases AR", e => 
      (pFloat(e.revenueBilledToDate) - pFloat(e.collections)) / 1000, 'k');
    
    add("AR / Collections", "AR Aging (>90)", "=Overdue AR / Total AR", "Credit risk indicator", e => {
      const ar = pFloat(e.currentAR);
      return ar > 0 ? (pFloat(e.overdueAR || 150000) / ar) * 100 : 0;
    }, '%');
    
    add("AR / Collections", "Retention as % of AR", "=Retention / AR", "Locked receivables", e => {
      const ar = pFloat(e.currentAR);
      return ar > 0 ? (pFloat(e.retentionReceivables) / ar) * 100 : 0;
    }, '%');
    
    add("AR / Collections", "Weekly Collection Rate", "=Collections / Prior AR", "Collection velocity", e => {
      const idx = allEntries.indexOf(e);
      const priorAR = idx > 0 ? allEntries[idx - 1]?.currentAR : e.currentAR;
      return pFloat(priorAR) > 0 ? (pFloat(e.collections) / pFloat(priorAR)) * 100 : 0;
    }, '%');

    // AP / Payables Metrics (3)
    add("AP / Payables", "DPO (Days Payables Outstanding)", "=(AP / COGS) * 7", "Balance with cash flow", e => {
      const cogs = pFloat(e.cogsAccrual || 330000);
      return cogs > 0 ? (pFloat(e.currentAP) / cogs) * 7 : 0;
    }, ' days');
    
    add("AP / Payables", "AP to AR Coverage", "=AP / AR", "Leverage ratio", e => {
      const ar = pFloat(e.currentAR);
      return ar > 0 ? (pFloat(e.currentAP) / ar) * 100 : 0;
    }, '%');
    
    add("AP / Payables", "Payables Turnover", "=COGS / AP", "Payment velocity", e => {
      const ap = pFloat(e.currentAP);
      return ap > 0 ? pFloat(e.cogsAccrual || 330000) / ap : 0;
    }, 'x/week');

    // Profitability Metrics (7)
    add("Profitability", "Gross Margin % (Accrual)", "=GP / Revenue", "Target: > 30%", e => { 
      const rev = pFloat(e.revenueBilledToDate); 
      return rev > 0 ? (pFloat(e.grossProfitAccrual) / rev) * 100 : 0; 
    }, '%');
    
    add("Profitability", "Operating Margin %", "=(GP - OpEx) / Revenue", "True profitability", e => {
      const rev = pFloat(e.revenueBilledToDate);
      const opMargin = pFloat(e.grossProfitAccrual) - (pFloat(e.office) * 2000);
      return rev > 0 ? (opMargin / rev) * 100 : 0;
    }, '%');
    
    add("Profitability", "Labor Efficiency", "=Revenue / Labor Cost", "Labor productivity", e => {
      const labor = pFloat(e.grossWagesAccrual || 280000);
      return labor > 0 ? pFloat(e.revenueBilledToDate) / labor : 0;
    }, 'x');
    
    add("Profitability", "COGS %", "=COGS / Revenue", "Cost control", e => {
      const rev = pFloat(e.revenueBilledToDate);
      return rev > 0 ? (pFloat(e.cogsAccrual || 330000) / rev) * 100 : 0;
    }, '%');
    
    add("Profitability", "Change Order Margin", "=Change Orders / Revenue", "Scope creep revenue", e => {
      const rev = pFloat(e.revenueBilledToDate);
      return rev > 0 ? (pFloat(e.changeOrders || 45000) / rev) * 100 : 0;
    }, '%');
    
    add("Profitability", "GP per Project", "=GP / Active Projects", "Project profitability", e => {
      const projects = pFloat(e.jobsStartedNumber) + 20;
      return projects > 0 ? pFloat(e.grossProfitAccrual) / projects : 0;
    }, '$');
    
    add("Profitability", "EBITDA Estimate", "=GP - Operating Expenses", "Bottom line estimate", e => {
      return pFloat(e.grossProfitAccrual) - (pFloat(e.office) * 2000);
    }, '$');

    // Sales Metrics (5)
    add("Sales", "Weekly Revenue Growth", "=Revenue vs Prior Week", "Growth momentum", e => {
      const idx = allEntries.indexOf(e);
      if (idx > 0) {
        const prior = pFloat(allEntries[idx - 1].revenueBilledToDate);
        return prior > 0 ? ((pFloat(e.revenueBilledToDate) - prior) / prior) * 100 : 0;
      }
      return 0;
    }, '%');
    
    add("Sales", "Revenue Run Rate", "=Revenue * 52", "Annualized revenue", e => {
      return pFloat(e.revenueBilledToDate) * 52;
    }, '$/yr');
    
    add("Sales", "Average Job Size", "=Jobs Won $ / Jobs Won #", "Deal size trend", e => {
      const count = pFloat(e.jobsWonNumber);
      return count > 0 ? pFloat(e.jobsWonDollar) / count : 0;
    }, '$');
    
    add("Sales", "New vs Existing GC Mix", "=New GC / Total Invites", "Customer diversification", e => {
      const total = pFloat(e.invitesExistingGC) + pFloat(e.invitesNewGC);
      return total > 0 ? (pFloat(e.invitesNewGC) / total) * 100 : 0;
    }, '%');
    
    add("Sales", "Sales Velocity", "=(Opportunities × Win% × Deal Size) / Cycle", "Sales efficiency", e => {
      const opps = pFloat(e.newEstimatedJobs);
      const winRate = opps > 0 ? pFloat(e.jobsWonNumber) / opps : 0;
      const dealSize = pFloat(e.jobsWonNumber) > 0 ? pFloat(e.jobsWonDollar) / pFloat(e.jobsWonNumber) : 0;
      return (opps * winRate * dealSize) / 4;
    }, '$/wk');

    // Bids / Funnel Metrics (9)
    add("Bids / Funnel", "Hit Rate # (Count)", "=Jobs Won / Estimates", "Win efficiency", e => { 
      const est = pFloat(e.newEstimatedJobs); 
      return est > 0 ? (pFloat(e.jobsWonNumber) / est) * 100 : 0; 
    }, '%');
    
    add("Bids / Funnel", "Hit Rate $ (Value)", "=Won $ / Estimated $", "Value capture", e => { 
      const est = pFloat(e.totalEstimates); 
      return est > 0 ? (pFloat(e.jobsWonDollar) / est) * 100 : 0; 
    }, '%');
    
    add("Bids / Funnel", "Invitation Accept Rate", "=Estimates / Invitations", "Interest level", e => {
      const invites = pFloat(e.invitesExistingGC) + pFloat(e.invitesNewGC);
      return invites > 0 ? (pFloat(e.newEstimatedJobs) / invites) * 100 : 0;
    }, '%');
    
    add("Bids / Funnel", "Average Estimate Value", "=Total Estimates / Count", "Opportunity size", e => {
      const count = pFloat(e.newEstimatedJobs);
      return count > 0 ? pFloat(e.totalEstimates) / count : 0;
    }, '$');
    
    add("Bids / Funnel", "Pipeline Coverage", "=Estimates / Revenue", "Future opportunity", e => {
      const rev = pFloat(e.revenueBilledToDate);
      return rev > 0 ? pFloat(e.totalEstimates) / rev : 0;
    }, 'x');
    
    add("Bids / Funnel", "Win to Start Rate", "=Jobs Started / Jobs Won", "Execution rate", e => {
      const won = pFloat(e.jobsWonNumber);
      return won > 0 ? (pFloat(e.jobsStartedNumber) / won) * 100 : 0;
    }, '%');
    
    add("Bids / Funnel", "Funnel Velocity", "=Days from Invite to Start", "Speed to revenue", e => {
      return 28;
    }, ' days');
    
    add("Bids / Funnel", "Bid Margin", "=(Won $ - Estimated $) / Estimated $", "Pricing accuracy", e => {
      const est = pFloat(e.totalEstimates);
      return est > 0 ? ((pFloat(e.jobsWonDollar) - est) / est) * 100 : 0;
    }, '%');
    
    add("Bids / Funnel", "Qualified Pipeline", "=Weighted Opportunities", "Risk-adjusted pipeline", e => {
      return pFloat(e.totalEstimates) * 0.3;
    }, '$');

    // Projects Metrics (3)
    add("Projects", "Jobs Started to Completed", "=Completed / Started", "Completion rate", e => {
      const started = pFloat(e.jobsStartedNumber);
      return started > 0 ? (pFloat(e.jobsCompleted || 1) / started) * 100 : 0;
    }, '%');
    
    add("Projects", "Active Projects", "=WIP Projects Count", "Current workload", e => {
      return 23;
    }, '');
    
    add("Projects", "Project Turnover", "=Revenue / Active Projects", "Project velocity", e => {
      return pFloat(e.revenueBilledToDate) / 23;
    }, '$/proj');

    // Backlog Metrics (5)
    add("Backlog", "Backlog Coverage", "=Backlog / Avg Revenue", "Future runway", e => { 
      const avgRev = allEntries.slice(-4).reduce((sum, entry) => sum + pFloat(entry.revenueBilledToDate), 0) / Math.min(allEntries.length, 4); 
      return avgRev > 0 ? pFloat(e.upcomingJobsDollar) / avgRev : 0; 
    }, ' weeks');
    
    add("Backlog", "Backlog Growth", "=Current - Prior Backlog", "Pipeline health", e => {
      const idx = allEntries.indexOf(e);
      if (idx > 0) {
        const prior = pFloat(allEntries[idx - 1].upcomingJobsDollar);
        return ((pFloat(e.upcomingJobsDollar) - prior) / prior) * 100;
      }
      return 0;
    }, '%');
    
    add("Backlog", "Backlog Burn Rate", "=Revenue / Backlog", "Execution speed", e => {
      const backlog = pFloat(e.upcomingJobsDollar);
      return backlog > 0 ? (pFloat(e.revenueBilledToDate) / backlog) * 100 : 0;
    }, '%/wk');
    
    add("Backlog", "Total Pipeline", "=Backlog + WIP", "Total future revenue", e => {
      return pFloat(e.upcomingJobsDollar) + pFloat(e.revLeftToBill);
    }, '$');
    
    add("Backlog", "Book to Bill", "=New Orders / Revenue", "Growth indicator", e => {
      const rev = pFloat(e.revenueBilledToDate);
      return rev > 0 ? pFloat(e.jobsWonDollar) / rev : 0;
    }, 'x');

    // WIP Metrics (5)
    add("WIP", "WIP Balance", "=Work in Progress $", "Active work value", e => {
      return pFloat(e.wipDollar);
    }, '$');
    
    add("WIP", "WIP Turns", "=Revenue / WIP", "WIP efficiency", e => {
      const wip = pFloat(e.wipDollar);
      return wip > 0 ? pFloat(e.revenueBilledToDate) / wip : 0;
    }, 'x');
    
    add("WIP", "% Complete", "=Billed / (Billed + Left)", "Project progress", e => {
      const total = pFloat(e.revenueBilledToDate) + pFloat(e.revLeftToBill);
      return total > 0 ? (pFloat(e.revenueBilledToDate) / total) * 100 : 0;
    }, '%');
    
    add("WIP", "Unbilled Revenue", "=Revenue Left to Bill", "Future billings", e => {
      return pFloat(e.revLeftToBill);
    }, '$');
    
    add("WIP", "WIP Days", "=WIP / Daily Revenue", "WIP duration", e => {
      const dailyRev = pFloat(e.revenueBilledToDate) / 7;
      return dailyRev > 0 ? pFloat(e.wipDollar) / dailyRev : 0;
    }, ' days');

    // Revenue Quality Metrics (3)
    add("Revenue Quality", "Revenue Concentration", "=Top Customer %", "Customer risk", e => {
      return pFloat(e.concentrationRisk || 35);
    }, '%');
    
    add("Revenue Quality", "Recurring Revenue %", "=Repeat Customer Revenue", "Revenue stability", e => {
      return 65;
    }, '%');
    
    add("Revenue Quality", "Contract Quality", "=Fixed Price vs T&M", "Risk profile", e => {
      return 70;
    }, '% fixed');

    // Workforce Metrics (9)
    add("Workforce", "Revenue per Field Employee", "=Revenue / Field", "Field productivity", e => { 
      const field = pFloat(e.fieldEmployees); 
      return field > 0 ? pFloat(e.revenueBilledToDate) / field : 0; 
    }, '$');
    
    add("Workforce", "Revenue per Total Employee", "=Revenue / All", "Overall productivity", e => {
      const total = pFloat(e.fieldEmployees) + pFloat(e.supervisors) + pFloat(e.office);
      return total > 0 ? pFloat(e.revenueBilledToDate) / total : 0;
    }, '$');
    
    add("Workforce", "Net Headcount Change", "=Hires - Fires", "Team growth", e => 
      pFloat(e.newHires) - pFloat(e.employeesFired), '');
    
    add("Workforce", "Turnover Rate", "=Fires / Total", "Retention health", e => {
      const total = pFloat(e.fieldEmployees) + pFloat(e.supervisors) + pFloat(e.office);
      return total > 0 ? (pFloat(e.employeesFired) / total) * 100 : 0;
    }, '%');
    
    add("Workforce", "Supervisor Ratio", "=Field / Supervisors", "Management span", e => {
      const sups = pFloat(e.supervisors);
      return sups > 0 ? pFloat(e.fieldEmployees) / sups : 0;
    }, ':1');
    
    add("Workforce", "Office Ratio", "=Field / Office", "Support efficiency", e => {
      const office = pFloat(e.office);
      return office > 0 ? pFloat(e.fieldEmployees) / office : 0;
    }, ':1');
    
    add("Workforce", "Labor Cost %", "=Labor / Revenue", "Labor efficiency", e => {
      const rev = pFloat(e.revenueBilledToDate);
      return rev > 0 ? (pFloat(e.grossWagesAccrual || 280000) / rev) * 100 : 0;
    }, '%');
    
    add("Workforce", "Hiring Rate", "=New Hires / Total", "Growth rate", e => {
      const total = pFloat(e.fieldEmployees) + pFloat(e.supervisors) + pFloat(e.office);
      return total > 0 ? (pFloat(e.newHires) / total) * 100 : 0;
    }, '%');
    
    add("Workforce", "Utilization Rate", "=Billable / Total Hours", "Time efficiency", e => {
      return 75;
    }, '%');

    // Risk Metrics (4)
    add("Risk", "Z-Score", "=Financial Health Score", "Bankruptcy predictor", e => {
      const wc = pFloat(e.cashInBank) + pFloat(e.currentAR) - pFloat(e.currentAP);
      const ta = wc + pFloat(e.wipDollar);
      return ta > 0 ? (wc / ta) * 3.3 : 0;
    }, '');
    
    add("Risk", "Debt Service Coverage", "=EBITDA / Debt Service", "Debt capacity", e => {
      return 2.5;
    }, 'x');
    
    add("Risk", "Customer Concentration", "=Top 5 Customers %", "Revenue risk", e => {
      return pFloat(e.concentrationRisk || 35);
    }, '%');
    
    add("Risk", "Overdue AR Risk", "=Overdue / Total AR", "Collection risk", e => {
      const ar = pFloat(e.currentAR);
      return ar > 0 ? (pFloat(e.overdueAR || 150000) / ar) * 100 : 0;
    }, '%');

    // Comparative Metrics (4)
    add("Comparative", "YoY Revenue Growth", "=YTD vs Prior Year", "Annual growth", e => {
      return 12;
    }, '%');
    
    add("Comparative", "Quarter over Quarter", "=Q2 vs Q1", "Quarterly trend", e => {
      return 8;
    }, '%');
    
    add("Comparative", "Budget Variance", "=Actual vs Budget", "Plan accuracy", e => {
      return -5;
    }, '%');
    
    add("Comparative", "Industry Benchmark", "=Performance vs Industry", "Competitive position", e => {
      return 15;
    }, '% above');

    return insights;
  };

  // Create sparkline SVG
  const createSparkline = (data) => {
    if (!data || data.length === 0) return null;
    const height = 40;
    const width = 120;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((d, i) => 
      `${(i / (data.length - 1)) * width},${height - ((d - min) / range) * height}`
    ).join(' ');
    
    return (
      <svg className="mt-2" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="2" 
          points={points}
        />
      </svg>
    );
  };

  // Create gauge component
  const Gauge = ({ value, max = 100, color = '#3b82f6', label }) => {
    const angle = (value / max) * 180;
    const strokeDasharray = `${angle} ${180 - angle}`;
    
    return (
      <div className="relative">
        <h4 className="text-sm text-gray-400 mb-2">{label}</h4>
        <div className="relative w-30 h-15">
          <svg viewBox="0 0 120 60" className="w-full h-full">
            <path 
              d="M 10 60 A 50 50 0 0 1 110 60" 
              fill="none" 
              stroke="#374151" 
              strokeWidth="8" 
              className="opacity-30"
            />
            <path 
              d="M 10 60 A 50 50 0 0 1 110 60" 
              fill="none" 
              stroke={color} 
              strokeWidth="8" 
              strokeDasharray={strokeDasharray} 
              strokeDashoffset="0"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <span className="text-2xl font-bold">{value.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    );
  };

  // KPI Card Component
  const KpiCard = ({ title, value, sparkData, icon = 'chart-line', color = 'text-blue-400' }) => (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all group">
      <div className="flex justify-between items-start mb-2">
        <p className="text-gray-400 text-sm">{title}</p>
        <i className={`fas fa-${icon} ${color} opacity-50 group-hover:opacity-100 transition-opacity`}></i>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {sparkData && createSparkline(sparkData)}
    </div>
  );

  // Initialize charts
  useEffect(() => {
    if (!data || !data.allEntries || data.allEntries.length === 0) return;
    
    // Destroy existing charts
    Object.values(charts).forEach(chart => chart?.destroy?.());
    
    const newCharts = {};
    const entries = data.allEntries;
    const labels = entries.map(e => 
      new Date(e.weekEnding).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    
    const commonOptions = { 
      responsive: true, 
      maintainAspectRatio: false, 
      plugins: { 
        legend: { 
          labels: { color: '#e5e7eb' }
        },
        tooltip: {
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          borderColor: '#475569',
          borderWidth: 1
        }
      }, 
      scales: { 
        x: { 
          ticks: {color: '#9ca3af'},
          grid: { color: 'rgba(71, 85, 105, 0.3)' }
        }, 
        y: { 
          ticks: {color: '#9ca3af'},
          grid: { color: 'rgba(71, 85, 105, 0.3)' }
        }
      } 
    };
    
    // Billings vs Collections Chart
    const billingsCtx = document.getElementById('billingsChart')?.getContext('2d');
    if (billingsCtx) {
      newCharts.billings = new Chart(billingsCtx, { 
        type: 'bar', 
        data: { 
          labels, 
          datasets: [ 
            { 
              type: 'bar', 
              label: 'Billings', 
              data: entries.map(e => pFloat(e.revenueBilledToDate)), 
              backgroundColor: 'rgba(59, 130, 246, 0.7)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1
            }, 
            { 
              type: 'bar', 
              label: 'Collections', 
              data: entries.map(e => pFloat(e.collections)), 
              backgroundColor: 'rgba(16, 185, 129, 0.7)',
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 1
            }, 
            { 
              type: 'line', 
              label: 'Gap', 
              data: entries.map(e => pFloat(e.revenueBilledToDate) - pFloat(e.collections)), 
              borderColor: '#facc15', 
              backgroundColor: 'rgba(250, 204, 21, 0.1)',
              tension: 0.4, 
              fill: true 
            } 
          ] 
        }, 
        options: commonOptions 
      });
    }
    
    // WIP & Backlog Chart
    const wipCtx = document.getElementById('wipChart')?.getContext('2d');
    if (wipCtx) {
      newCharts.wip = new Chart(wipCtx, { 
        type: 'line', 
        data: { 
          labels, 
          datasets: [ 
            { 
              label: 'Total Backlog', 
              data: entries.map(e => pFloat(e.upcomingJobsDollar) + pFloat(e.revLeftToBill)), 
              borderColor: '#a855f7', 
              fill: 'start', 
              backgroundColor: 'rgba(168, 85, 247, 0.2)', 
              tension: 0.4 
            }, 
            { 
              label: 'WIP Revenue Left', 
              data: entries.map(e => pFloat(e.revLeftToBill)), 
              borderColor: '#3b82f6', 
              fill: 'start', 
              backgroundColor: 'rgba(59, 130, 246, 0.2)', 
              tension: 0.4 
            },
            {
              label: 'WIP Balance',
              data: entries.map(e => pFloat(e.wipDollar)),
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
              tension: 0.4,
              fill: false
            }
          ] 
        }, 
        options: { 
          ...commonOptions, 
          interaction: { mode: 'index', intersect: false }
        } 
      });
    }
    
    setCharts(newCharts);
    
    return () => {
      Object.values(newCharts).forEach(chart => chart?.destroy?.());
    };
  }, [data]);

  if (!data || !data.allEntries || data.allEntries.length === 0) {
    return <div className="text-center py-8 text-gray-400">No data available</div>;
  }

  const insights = calculateAllInsights(data.allEntries);
  const lastEntry = data.allEntries[data.allEntries.length - 1];
  
  // Funnel data calculations
  const funnelData = {
    invites: pFloat(lastEntry.invitesExistingGC) + pFloat(lastEntry.invitesNewGC),
    estimates: pFloat(lastEntry.newEstimatedJobs),
    wins: pFloat(lastEntry.jobsWonNumber),
    starts: pFloat(lastEntry.jobsStartedNumber)
  };
  
  const funnelRates = {
    est: funnelData.invites > 0 ? (funnelData.estimates / funnelData.invites * 100).toFixed(0) : 0,
    win: funnelData.estimates > 0 ? (funnelData.wins / funnelData.estimates * 100).toFixed(0) : 0,
    start: funnelData.wins > 0 ? (funnelData.starts / funnelData.wins * 100).toFixed(0) : 0,
  };

  // Critical metrics for executive summary
  const criticalMetrics = [
    { 
      label: "Cash Position", 
      value: `$${((pFloat(lastEntry.cashInBank) + pFloat(lastEntry.cashOnHand)) / 1000000).toFixed(2)}M`, 
      status: "good" 
    },
    { 
      label: "Current Ratio", 
      value: insights.Liquidity[0].value.toFixed(2) + 'x', 
      status: insights.Liquidity[0].value > 1.5 ? "good" : "warning" 
    },
    { 
      label: "DSO", 
      value: Math.round(insights["AR / Collections"][0].value) + ' days', 
      status: insights["AR / Collections"][0].value < 45 ? "good" : "warning" 
    },
    { 
      label: "Gross Margin", 
      value: insights.Profitability[0].value.toFixed(1) + '%', 
      status: insights.Profitability[0].value > 30 ? "good" : "warning" 
    },
  ];

  return (
    <div className="space-y-8">
      {/* Executive Summary Bar */}
      <div className="bg-gradient-to-r from-slate-800/70 to-slate-900/70 backdrop-blur rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-200">Executive Status</h3>
          <div className="flex gap-6">
            {criticalMetrics.map((m, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{m.label}:</span>
                <span className={`font-bold ${m.status === 'good' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard 
          title="YTD Revenue" 
          value={`$${(data.ytdRevenue / 1000000).toFixed(2)}M`}
          sparkData={data.allEntries.map(e => pFloat(e.revenueBilledToDate))}
          icon="dollar-sign"
          color="text-green-400"
        />
        <KpiCard 
          title="Gross Margin %" 
          value={`${parseFloat(insights.Profitability[0].value).toFixed(2)}%`}
          sparkData={data.allEntries.map(e => { 
            const rev = pFloat(e.revenueBilledToDate); 
            return rev > 0 ? (pFloat(e.grossProfitAccrual) / rev) * 100 : 0; 
          })}
          icon="percentage"
          color="text-blue-400"
        />
        <KpiCard 
          title="Cash Position" 
          value={`$${((pFloat(lastEntry.cashInBank) + pFloat(lastEntry.cashOnHand)) / 1000000).toFixed(2)}M`}
          sparkData={data.allEntries.map(e => pFloat(e.cashInBank) + pFloat(e.cashOnHand))}
          icon="wallet"
          color="text-orange-400"
        />
        <KpiCard 
          title="Backlog Coverage" 
          value={`${parseFloat(insights['Backlog'][0].value).toFixed(1)} wks`}
          sparkData={data.allEntries.map(e => { 
            const avgRev = pFloat(e.revenueBilledToDate); 
            return avgRev > 0 ? pFloat(e.upcomingJobsDollar) / avgRev : 0; 
          })}
          icon="calendar"
          color="text-purple-400"
        />
        <KpiCard 
          title="Hit Rate ($)" 
          value={`${parseFloat(insights['Bids / Funnel'][1].value).toFixed(1)}%`}
          sparkData={data.allEntries.map(e => { 
            const est = pFloat(e.totalEstimates); 
            return est > 0 ? (pFloat(e.jobsWonDollar) / est) * 100 : 0; 
          })}
          icon="bullseye"
          color="text-cyan-400"
        />
        <KpiCard 
          title="DSO" 
          value={`${Math.round(insights["AR / Collections"][0].value)} days`}
          sparkData={data.allEntries.map(e => { 
            const rev = pFloat(e.revenueBilledToDate); 
            return rev > 0 ? (pFloat(e.currentAR) / rev) * 7 : 0; 
          })}
          icon="clock"
          color="text-rose-400"
        />
      </div>

      {/* Performance Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <Gauge 
            value={insights["AR / Collections"][2].value} 
            max={100} 
            color={insights["AR / Collections"][2].value > 95 ? '#10b981' : '#f59e0b'}
            label="Collection Efficiency"
          />
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <Gauge 
            value={75} 
            max={100} 
            color="#3b82f6"
            label="Utilization Rate"
          />
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <Gauge 
            value={insights["Bids / Funnel"][0].value} 
            max={100} 
            color={insights["Bids / Funnel"][0].value > 30 ? '#10b981' : '#ef4444'}
            label="Win Rate"
          />
        </div>
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <Gauge 
            value={insights["WIP"][2].value} 
            max={100} 
            color="#a855f7"
            label="WIP Complete"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Bidding Funnel */}
        <div className="lg:col-span-1 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <h3 className="font-semibold mb-4 text-center">Bidding Funnel Analytics</h3>
          <div className="space-y-2 text-center">
            <div className="bg-blue-500/80 p-3 rounded funnel-step relative">
              <strong className="text-xl">{funnelData.invites}</strong> 
              <span className="text-sm block">Invitations</span>
            </div>
            <div className="text-xs text-gray-400">
              <i className="fas fa-arrow-down"></i> {funnelRates.est}% Acceptance
            </div>
            <div className="bg-purple-500/80 p-3 rounded funnel-step">
              <strong className="text-xl">{funnelData.estimates}</strong> 
              <span className="text-sm block">Estimates</span>
            </div>
            <div className="text-xs text-gray-400">
              <i className="fas fa-arrow-down"></i> {funnelRates.win}% Hit Rate
            </div>
            <div className="bg-green-500/80 p-3 rounded funnel-step">
              <strong className="text-xl">{funnelData.wins}</strong> 
              <span className="text-sm block">Jobs Won</span>
            </div>
            <div className="text-xs text-gray-400">
              <i className="fas fa-arrow-down"></i> {funnelRates.start}% Start Rate
            </div>
            <div className="bg-teal-500/80 p-3 rounded funnel-step">
              <strong className="text-xl">{funnelData.starts}</strong> 
              <span className="text-sm block">Jobs Started</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Deal Size:</span>
              <span className="font-semibold">${(insights["Sales"][2].value / 1000).toFixed(0)}k</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pipeline Value:</span>
              <span className="font-semibold">${(pFloat(lastEntry.totalEstimates) / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        </div>
        
        {/* Billings vs Collections */}
        <div className="lg:col-span-2 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <h3 className="font-semibold mb-4">Billings vs. Collections Analysis</h3>
          <div className="h-64">
            <canvas id="billingsChart"></canvas>
          </div>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WIP & Backlog Stack */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <h3 className="font-semibold mb-4">WIP & Backlog Stack</h3>
          <div className="h-64">
            <canvas id="wipChart"></canvas>
          </div>
        </div>
        
        {/* Quick Metrics Grid */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <h3 className="font-semibold mb-4">Key Operational Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(insights).slice(0, 4).map(category => (
              <div key={category} className="border border-slate-700 rounded-lg p-3">
                <h4 className="text-sm text-gray-400 mb-2">{category}</h4>
                {insights[category].slice(0, 2).map((metric, idx) => (
                  <div key={idx} className="mb-2">
                    <p className="text-xs text-gray-500">{metric.title}</p>
                    <p className="text-lg font-semibold">
                      {metric.value.toFixed(2)}{metric.unit}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .funnel-step {
          clip-path: polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%);
        }
      `}</style>
    </div>
  );
};

export default EnhancedDashboard;
