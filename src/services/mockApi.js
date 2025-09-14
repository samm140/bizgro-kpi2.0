// Mock API service to simulate backend operations
export const mockApi = {
  initData: () => {
    // Initialize existing dashboard data
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
    
    // Initialize enhanced metrics data
    if (!localStorage.getItem('bizgro_enhanced_metrics')) {
      localStorage.setItem('bizgro_enhanced_metrics', JSON.stringify({
        currentWeek: {
          weekEnding: new Date().toISOString().split('T')[0],
          // Accounting & Cash
          currentAR: 145000,
          retentionReceivables: 23000,
          overdueAR: 12000,
          currentAP: 67000,
          cashOnHand: 45000,
          cashInBank: 999957,
          // Sales & Revenue  
          revenueBilledToDate: 593209,
          retention: 29660,
          collections: 527147,
          changeOrders: 22000,
          // Profitability
          grossProfitAccrual: 281300,
          cogsAccrual: 311909,
          grossWagesAccrual: 67000,
          // Bids & Funnel
          invitesExistingGC: 8,
          invitesNewGC: 3,
          newEstimatedJobs: 5,
          totalEstimates: 450000,
          jobsWonNumber: 2,
          jobsWonDollar: 125000,
          // Projects & Backlog
          jobsStartedNumber: 3,
          jobsStartedDollar: 185000,
          jobsCompleted: 1,
          upcomingJobsDollar: 890000,
          wipDollar: 425000,
          revLeftToBill: 315000,
          // Workforce
          fieldEmployees: 22,
          supervisors: 4,
          office: 3,
          newHires: 1,
          employeesFired: 0,
          // Risk
          concentrationRisk: 35
        },
        historicalWeeks: []
      }));
    }
    
    // Initialize user profile
    if (!localStorage.getItem('bizgro_user_profile')) {
      localStorage.setItem('bizgro_user_profile', JSON.stringify({
        username: 'demo',
        name: 'Demo User',
        email: 'demo@bizgro.com',
        company: 'Demo Construction Co.',
        role: 'admin'
      }));
    }
  },

  getDashboardData: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem('bizgro_kpi_data_preview'));
        const enhancedData = JSON.parse(localStorage.getItem('bizgro_enhanced_metrics'));
        
        // Merge basic and enhanced data for comprehensive dashboard
        const mergedData = {
          ...data,
          // Add enhanced summary metrics
          summary: {
            totalRevenue: data.revenueYTD,
            ytdRevenue: data.revenueYTD,
            totalBacklog: enhancedData.currentWeek.upcomingJobsDollar || 890000,
            cashPosition: data.cashPosition,
            currentRatio: ((data.cashPosition + (enhancedData.currentWeek.currentAR || 145000)) / 
                          (enhancedData.currentWeek.currentAP || 67000)).toFixed(2),
            quickRatio: 2.12,
            grossMargin: data.gpmAverage,
            netMargin: 12,
            dso: 42,
            dpo: 38,
            workingCapital: 245000,
            burnRate: 125000
          },
          // Add key metrics for cards
          keyMetrics: [
            { 
              id: 'cash-position',
              title: 'Cash Position',
              value: data.cashPosition,
              change: 8.3,
              trend: 'up',
              sparkline: data.weeklyCollections.slice(-5)
            },
            {
              id: 'revenue-ytd',
              title: 'Revenue YTD',
              value: data.revenueYTD,
              change: 12.5,
              trend: 'up',
              sparkline: data.weeklyRevenue
            },
            {
              id: 'gpm-average',
              title: 'GPM Average',
              value: data.gpmAverage,
              change: 2.5,
              trend: 'up',
              unit: '%',
              sparkline: data.gpmTrend
            },
            {
              id: 'active-projects',
              title: 'Active Projects',
              value: data.activeProjects,
              change: 4.3,
              trend: 'up',
              unit: '#',
              sparkline: [21, 22, 22, 23, 23]
            }
          ],
          // Add alerts
          alerts: [
            {
              id: 1,
              type: 'success',
              title: 'Strong Collections',
              message: 'Last week collections exceeded target by 15%',
              timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: 2,
              type: 'warning',
              title: 'AR Aging',
              message: 'Review accounts over 90 days',
              timestamp: new Date(Date.now() - 7200000).toISOString()
            }
          ],
          // Add current week data from enhanced metrics
          currentWeek: enhancedData.currentWeek
        };
        
        resolve(mergedData);
      }, 300);
    });
  },

  submitWeeklyData: (formData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Update basic dashboard data (existing logic)
        const data = JSON.parse(localStorage.getItem('bizgro_kpi_data_preview'));
        
        const updateMetric = (array, value) => {
          const numValue = parseFloat(value);
          if (!isNaN(numValue) && value.trim() !== '') {
            array.push(numValue);
            array.shift();
          }
        };
        
        // Update basic metrics
        updateMetric(data.weeklyRevenue, formData.revenueBilledToDate || formData.revenueBilled);
        updateMetric(data.weeklyCollections, formData.collections);
        updateMetric(data.gpmTrend, formData.grossProfitAccrual || formData.gpmAccrual);
        
        // Update week labels
        const lastWeekLabel = data.weeks[data.weeks.length - 1];
        const lastWeekNum = parseInt(lastWeekLabel.replace('W', ''));
        data.weeks.push(`W${lastWeekNum + 1}`);
        data.weeks.shift();
        
        // Update cash position based on collections
        if (formData.cashInBank) {
          data.cashPosition = parseFloat(formData.cashInBank) + parseFloat(formData.cashOnHand || 0);
        }
        
        // Save updated basic data
        localStorage.setItem('bizgro_kpi_data_preview', JSON.stringify(data));
        
        // Update enhanced metrics
        const enhancedData = JSON.parse(localStorage.getItem('bizgro_enhanced_metrics'));
        
        // Archive current week to history
        enhancedData.historicalWeeks.push({
          ...enhancedData.currentWeek,
          submittedAt: new Date().toISOString()
        });
        
        // Keep only last 12 weeks of history
        if (enhancedData.historicalWeeks.length > 12) {
          enhancedData.historicalWeeks.shift();
        }
        
        // Update current week with new data
        enhancedData.currentWeek = {
          ...enhancedData.currentWeek,
          ...formData,
          weekEnding: formData.weekEnding || new Date().toISOString().split('T')[0]
        };
        
        // Save updated enhanced data
        localStorage.setItem('bizgro_enhanced_metrics', JSON.stringify(enhancedData));
        
        resolve({ success: true, message: 'Weekly data saved successfully' });
      }, 500);
    });
  },

  // New methods for enhanced components
  getWeeklyData: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const enhancedData = JSON.parse(localStorage.getItem('bizgro_enhanced_metrics'));
        const basicData = JSON.parse(localStorage.getItem('bizgro_kpi_data_preview'));
        
        resolve({
          success: true,
          data: {
            currentWeek: enhancedData.currentWeek,
            trends: {
              revenue: { 
                change: ((basicData.weeklyRevenue[5] - basicData.weeklyRevenue[4]) / 
                        basicData.weeklyRevenue[4] * 100).toFixed(1), 
                direction: basicData.weeklyRevenue[5] > basicData.weeklyRevenue[4] ? 'up' : 'down' 
              },
              cash: { 
                change: 8.3, 
                direction: 'up' 
              },
              ar: { 
                change: -5.2, 
                direction: 'down' 
              },
              backlog: { 
                change: 22.0, 
                direction: 'up' 
              }
            },
            historicalWeeks: enhancedData.historicalWeeks
          }
        });
      }, 200);
    });
  },

  getHistoricalData: (metric, period) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const basicData = JSON.parse(localStorage.getItem('bizgro_kpi_data_preview'));
        const weeks = period === '3m' ? 12 : period === '6m' ? 24 : 52;
        const data = [];
        
        // Generate historical data based on existing patterns
        for (let i = weeks; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - (i * 7));
          
          let value;
          if (metric === 'revenue') {
            const avgRevenue = basicData.weeklyRevenue.reduce((a, b) => a + b, 0) / basicData.weeklyRevenue.length;
            value = avgRevenue + (Math.random() - 0.5) * 100000;
          } else if (metric === 'collections') {
            const avgCollections = basicData.weeklyCollections.reduce((a, b) => a + b, 0) / basicData.weeklyCollections.length;
            value = avgCollections + (Math.random() - 0.5) * 50000;
          } else {
            value = Math.random() * 100000 + 50000;
          }
          
          data.push({
            date: date.toISOString().split('T')[0],
            value: value,
            metric: metric
          });
        }
        
        resolve({
          success: true,
          data: data
        });
      }, 200);
    });
  },

  generateInsights: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const basicData = JSON.parse(localStorage.getItem('bizgro_kpi_data_preview'));
        const enhancedData = JSON.parse(localStorage.getItem('bizgro_enhanced_metrics'));
        
        const insights = [];
        
        // Generate dynamic insights based on actual data
        if (basicData.gpmAverage > 30) {
          insights.push({
            id: 1,
            category: 'Profitability',
            type: 'positive',
            title: 'Strong Gross Margins',
            description: `GPM averaging ${basicData.gpmAverage.toFixed(1)}% - above industry benchmark`,
            impact: 'high',
            recommendation: 'Maintain pricing discipline while scaling operations'
          });
        }
        
        if (enhancedData.currentWeek.concentrationRisk > 30) {
          insights.push({
            id: 2,
            category: 'Risk',
            type: 'warning',
            title: 'Customer Concentration Risk',
            description: `Top customer represents ${enhancedData.currentWeek.concentrationRisk}% of revenue`,
            impact: 'medium',
            recommendation: 'Diversify client base to reduce dependency'
          });
        }
        
        // Add collection performance insight
        const avgCollections = basicData.weeklyCollections.reduce((a, b) => a + b, 0) / basicData.weeklyCollections.length;
        const lastCollection = basicData.weeklyCollections[basicData.weeklyCollections.length - 1];
        if (lastCollection > avgCollections * 1.1) {
          insights.push({
            id: 3,
            category: 'Cash Flow',
            type: 'positive',
            title: 'Excellent Collections',
            description: 'Recent collections exceeded average by ' + 
                        ((lastCollection / avgCollections - 1) * 100).toFixed(0) + '%',
            impact: 'high',
            recommendation: 'Consider offering early payment discounts to maintain momentum'
          });
        }
        
        resolve({
          success: true,
          insights: insights
        });
      }, 800);
    });
  },

  // Authentication
  login: (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username && password) {
          const userProfile = JSON.parse(localStorage.getItem('bizgro_user_profile'));
          resolve({
            success: true,
            user: userProfile,
            token: 'mock-jwt-token-' + Date.now()
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  },

  // Export functionality
  exportData: (format, dateRange) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Mock export: ${format} format for`, dateRange);
        resolve({
          success: true,
          message: `Data exported as ${format}`,
          downloadUrl: '#'
        });
      }, 300);
    });
  }
};

// Initialize data on load
mockApi.initData();

export default mockApi;
