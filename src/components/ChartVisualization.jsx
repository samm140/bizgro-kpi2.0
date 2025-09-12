// Prepare data for charts
const chartData = {
  weeks: ['W31', 'W32', 'W33', 'W34', 'W35', 'W36'],
  weeklyRevenue: [60929, 574503, 227737, 167973, 8828, 593209],
  weeklyCollections: [206426, 151413, 337294, 323508, 259749, 527147],
  gpmTrend: [28.5, 26.3, 31.2, 29.8, 30.5, 47.42],
  gpmAverage: 34.08,
  // Optional advanced charts
  cashFlowData: {
    cashPosition: [1000000, 1100000, 1050000, 1200000, 1150000, 1300000],
    arBalance: [2100000, 2000000, 2150000, 2050000, 2200000, 2145000],
    apBalance: [800000, 850000, 820000, 870000, 840000, 845000]
  },
  backlogData: {
    backlog: [20000000, 20500000, 21000000, 21300000, 21500000, 21800000],
    jobsInProgress: [20, 21, 22, 23, 23, 23]
  }
};

// Render charts
<ChartVisualization data={chartData} />
