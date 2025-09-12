// Export to Excel
dataExportService.exportDashboardData(dashboardData, 'excel');

// Export to CSV
dataExportService.exportDashboardData(dashboardData, 'csv');

// Export filtered data
dataExportService.exportFilteredData(
  historicalData,
  { year: 2025, startDate: '2025-01-01' },
  'excel'
);

// Generate comprehensive report
dataExportService.generateComprehensiveReport(
  historicalData,
  dashboardData
);
