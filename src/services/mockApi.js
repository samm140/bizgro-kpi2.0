// File: src/services/mockApi.js
class MockApi {
  constructor() {
    this.initData();
  }

  initData() {
    if (!localStorage.getItem('bizgro_kpi_data_preview')) {
      localStorage.setItem('bizgro_kpi_data_preview', JSON.stringify({
        revenueYTD: 14204274,
        gpmAverage: 34.08,
        activeProjects: 23,
        cashPosition: 1044957,
        weeks: ['W31', 'W32', 'W33', 'W34', 'W35', 'W36'],
        weeklyRevenue: [60929, 574503, 227737, 167973, 8828, 593209],
        weeklyCollections: [206426, 151413, 337294, 323508, 259749, 527147],
        gpmTrend: [28.5, 26.3, 31.2, 29.8, 30.5, 47.42]
      }));
    }
  }

  getDashboardData() {
    return new Promise(resolve => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem('bizgro_kpi_data_preview'));
        resolve(data);
      }, 300);
    });
  }

  submitWeeklyData(formData) {
    return new Promise(resolve => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem('bizgro_kpi_data_preview'));
        
        const updateMetric = (array, value) => {
          const numValue = parseFloat(value);
          if (!isNaN(numValue) && value.trim() !== '') {
            array.push(numValue);
            array.shift();
          }
        };

        updateMetric(data.weeklyRevenue, formData.revenueBilled);
        updateMetric(data.weeklyCollections, formData.collections);
        updateMetric(data.gpmTrend, formData.gpmAccrual);

        // Update week labels
        const lastWeekLabel = data.weeks[data.weeks.length - 1];
        const lastWeekNum = parseInt(lastWeekLabel.replace('W', ''));
        data.weeks.push(`W${lastWeekNum + 1}`);
        data.weeks.shift();

        localStorage.setItem('bizgro_kpi_data_preview', JSON.stringify(data));
        resolve({ success: true });
      }, 500);
    });
  }
}

export const mockApi = new MockApi();
