// src/services/diamondbackSheets.js
export const diamondbackSheetsService = {
  // Sheet structure for DiamondBack Masonry
  SHEET_STRUCTURE: {
    WIP: {
      headers: ['Period', 'CY_Billed', 'PY_Billed', 'Direct_COGS', 'Unallocated_COGS', 'Overbilling', 'Underbilling'],
      range: 'WIP!A1:G100'
    },
    PROJECTS: {
      headers: ['Project_Name', 'Estimated_Cost', 'Q1PY', 'Q2PY', 'Q3PY', 'Q4PY', 'Q1CY', 'Q2CY', 'Q3CY'],
      range: 'Projects!A1:I100'
    },
    CASHFLOW: {
      headers: ['Period', 'Operating', 'Investing', 'Financing', 'Beginning_Cash', 'Ending_Cash'],
      range: 'CashFlow!A1:F100'
    }
  },

  // Mock data for demo mode
  getMockData: (period = '3QCY') => ({
    period: period,
    wip: {
      cyBilledToDate: 26400884.11,
      pyBilledToDate: 19179059.22,
      directCOGS: 5233002.86,
      unallocatedCOGS: 672684.04,
      priorOverbilling: 912542.26,
      priorUnderbilling: 785414.68,
      revenueEarned: 7756069.63,
      grossProfit: 2523066.77,
      grossMargin: 32.53
    },
    projects: [
      { name: 'Alpha Tower', estimated: 34405529, actual: 25099891, variance: -27.04, completion: 72.96 },
      { name: 'Bravo Complex', estimated: 52248601, actual: 39818053, variance: -23.79, completion: 76.21 },
      { name: 'Charlie Plaza', estimated: 2177000, actual: 1580000, variance: -27.41, completion: 72.59 }
    ],
    quarterly: {
      revenue: [6218032, 7421238, 7756069, 8100000],
      costs: [4153809, 5906948, 5233002, 5400000],
      grossProfit: [2064223, 1514290, 2523067, 2700000],
      quarters: ['1QCY', '2QCY', '3QCY', '4QCY (Projected)']
    },
    cashFlow: {
      operating: 1122158,
      investing: -445000,
      financing: -200000,
      netChange: 477158
    },
    pl: {
      totalIncome: 7421238,
      totalCOGS: 5906948,
      grossProfit: 1514290,
      totalExpenses: 636763,
      netOperatingIncome: 877527
    },
    bs: {
      bankAccounts: 1122158,
      accountsReceivable: 1355853,
      totalCurrentAssets: 3416748,
      totalCurrentLiabilities: 1155729,
      totalLiabilities: 7899327
    }
  }),

  // Fetch data from Google Sheets
  async fetchFromSheets(sheetId, range) {
    if (!sheetId || import.meta.env.VITE_GITHUB_PAGES === 'true') {
      // Return mock data if no sheet ID or on GitHub Pages
      return this.getMockData();
    }

    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${import.meta.env.VITE_GOOGLE_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch sheet data');
      
      const data = await response.json();
      return this.parseSheetData(data.values);
    } catch (error) {
      console.error('Error fetching DiamondBack data:', error);
      return this.getMockData();
    }
  },

  // Parse raw sheet data into structured format
  parseSheetData(values) {
    if (!values || values.length < 2) return this.getMockData();
    
    // Assuming first row is headers, rest is data
    const headers = values[0];
    const data = values.slice(1);
    
    // Transform to our data structure
    // This is a simplified example - adjust based on your actual sheet structure
    return {
      wip: {
        cyBilledToDate: parseFloat(data[0]?.[1]) || 0,
        pyBilledToDate: parseFloat(data[0]?.[2]) || 0,
        directCOGS: parseFloat(data[0]?.[3]) || 0,
        unallocatedCOGS: parseFloat(data[0]?.[4]) || 0,
        // ... add more fields
      },
      // ... add other sections
    };
  },

  // Save data back to sheets (requires authentication)
  async saveToSheets(sheetId, range, data) {
    // This would require OAuth authentication
    console.log('Saving to sheets:', { sheetId, range, data });
    // Implementation depends on your auth setup
    return { success: true, message: 'Data saved (mock)' };
  }
};

export default diamondbackSheetsService;
