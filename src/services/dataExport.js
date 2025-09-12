// Data Export Service
class DataExportService {
  convertToCSV(data, headers) {
    if (!data || data.length === 0) return '';
    
    const headerRow = headers ? headers.join(',') : Object.keys(data[0]).join(',');
    const dataRows = data.map(row => {
      const values = headers 
        ? headers.map(header => this.escapeCSVValue(row[header]))
        : Object.values(row).map(val => this.escapeCSVValue(val));
      return values.join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  }

  escapeCSVValue(value) {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    return stringValue;
  }

  downloadCSV(data, filename = 'export.csv', headers = null) {
    const csv = this.convertToCSV(data, headers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToExcel(data, filename = 'export.xlsx') {
    // Note: Full Excel export requires xlsx library
    console.log('Excel export would happen here:', filename);
    // For now, fall back to CSV
    this.downloadCSV(data, filename.replace('.xlsx', '.csv'));
  }

  exportDashboardData(dashboardData, format = 'csv') {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = 'BizGro_Dashboard_' + timestamp;

    const kpiData = [
      { Metric: 'Revenue YTD', Value: dashboardData.revenueYTD },
      { Metric: 'GPM Average', Value: dashboardData.gpmAverage },
      { Metric: 'Active Projects', Value: dashboardData.activeProjects },
      { Metric: 'Cash Position', Value: dashboardData.cashPosition }
    ];

    if (format === 'csv') {
      this.downloadCSV(kpiData, filename + '.csv');
    } else {
      this.exportToExcel(kpiData, filename + '.xlsx');
    }
  }
}

export const dataExportService = new DataExportService();
