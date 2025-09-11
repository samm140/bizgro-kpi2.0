// File: src/services/mockApi.js
const mockApiJs = `// Mock API for GitHub Pages
class MockApi {
  constructor() {
    this.initData();
  }

  initData() {
    if (!localStorage.getItem('bizgro_kpi_data')) {
      localStorage.setItem('bizgro_kpi_data', JSON.stringify({
        entries: [],
        dashboard: {
          revenueYTD: 14204274,
          gpmAverage: 34.08,
          activeProjects: 23,
          cashPosition: 1044957,
          weeks: ['W31', 'W32', 'W33', 'W34', 'W35', 'W36'],
          weeklyRevenue: [60929, 574503, 227737, 167973, 8828, 593209],
          weeklyCollections: [206426, 151413, 337294, 323508, 259749, 527147],
          gpmTrend: [28.5, 26.3, 31.2, 29.8, 30.5, 47.42]
        }
      }));
    }
  }

  async getDashboardData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem('bizgro_kpi_data'));
        resolve(data.dashboard);
      }, 300);
    });
  }

  async submitWeeklyData(formData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem('bizgro_kpi_data'));
        const entry = {
          ...formData,
          id: Date.now(),
          timestamp: new Date().toISOString()
        };
        data.entries.push(entry);
        
        // Update dashboard with new data
        if (formData.revenueBilled) {
          data.dashboard.weeklyRevenue.push(parseFloat(formData.revenueBilled));
          data.dashboard.weeklyRevenue.shift();
        }
        if (formData.collections) {
          data.dashboard.weeklyCollections.push(parseFloat(formData.collections));
          data.dashboard.weeklyCollections.shift();
        }
        if (formData.gpmAccrual) {
          data.dashboard.gpmTrend.push(parseFloat(formData.gpmAccrual));
          data.dashboard.gpmTrend.shift();
        }
        
        localStorage.setItem('bizgro_kpi_data', JSON.stringify(data));
        resolve({ success: true, entry });
      }, 500);
    });
  }
}

export const mockApi = new MockApi();`;
