// 1. First, make sure Chart.js is installed:
npm install chart.js

// 2. In your main dashboard component:
import React, { useState } from 'react';
import FinancialChartsView from './FinancialChartsView';

export default function App() {
  // Sample data structure
  const sampleData = {
    allEntries: [
      {
        WeekEndingDate: "2024-01-07",
        CurrentAR: 420000,
        CurrentAP: 350000,
        CashBank: 800000,
        CashOnHand: 42500,
        RevenueBilled: 215000,
        Collections: 198500,
        GrossProfitAccrual: 92000,
        COGSAccrual: 123000,
        FieldEmployees: 45,
        Supervisors: 8,
        Office: 12,
        JobsWonNumber: 3,
        JobsWonDollar: 820000,
        // Add more fields as needed
      }
    ]
  };

  return (
    <div>
      <FinancialChartsView data={sampleData} />
    </div>
  );
}
