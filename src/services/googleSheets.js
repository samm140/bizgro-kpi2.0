// At the top of googleSheets.js, add this import:
import { diamondbackSheetsService } from './diamondbackSheets';

// Then add these methods to your googleSheetsService object:
export const googleSheetsService = {
  // ... existing methods ...

  async getDiamondBackData(sheetId, period = '3QCY') {
    // If no sheet ID or on GitHub Pages, return mock data
    if (!sheetId || import.meta.env.VITE_GITHUB_PAGES === 'true') {
      return diamondbackSheetsService.getMockData(period);
    }

    // Try to fetch real data from Google Sheets
    const ranges = [
      'WIP!A1:Z100',
      'Projects!A1:Z100',
      'CashFlow!A1:Z100',
      'P&L!A1:Z100',
      'BalanceSheet!A1:Z100'
    ];

    try {
      const promises = ranges.map(range => 
        this.getSheetData(sheetId, range)
      );
      
      const results = await Promise.all(promises);
      
      return {
        wip: this.parseWIPData(results[0]),
        projects: this.parseProjectsData(results[1]),
        cashFlow: this.parseCashFlowData(results[2]),
        pl: this.parsePLData(results[3]),
        bs: this.parseBalanceSheetData(results[4])
      };
    } catch (error) {
      console.error('Error fetching DiamondBack data:', error);
      // Return mock data as fallback
      return diamondbackSheetsService.getMockData(period);
    }
  },

  parseWIPData(data) {
    // Parse WIP reconciliation data
    if (!data || !data.values) {
      return {
        cyBilledToDate: 26400884.11,
        pyBilledToDate: 19179059.22,
        directCOGS: 5233002.86,
        unallocatedCOGS: 672684.04,
        priorOverbilling: 912542.26,
        priorUnderbilling: 785414.68,
        revenueEarned: 7756069.63,
        grossProfit: 2523066.77,
        grossMargin: 32.53
      };
    }
    
    const values = data.values;
    return {
      cyBilledToDate: parseFloat(values[1]?.[1]) || 26400884.11,
      pyBilledToDate: parseFloat(values[1]?.[2]) || 19179059.22,
      directCOGS: parseFloat(values[1]?.[3]) || 5233002.86,
      unallocatedCOGS: parseFloat(values[1]?.[4]) || 672684.04,
      priorOverbilling: parseFloat(values[1]?.[5]) || 912542.26,
      priorUnderbilling: parseFloat(values[1]?.[6]) || 785414.68,
      revenueEarned: parseFloat(values[1]?.[7]) || 7756069.63,
      grossProfit: parseFloat(values[1]?.[8]) || 2523066.77,
      grossMargin: parseFloat(values[1]?.[9]) || 32.53
    };
  },

  parseProjectsData(data) {
    // Parse projects data
    if (!data || !data.values || data.values.length <= 1) {
      return [
        { name: 'Alpha Tower', estimated: 34405529, actual: 25099891, variance: -27.04, completion: 72.96 },
        { name: 'Bravo Complex', estimated: 52248601, actual: 39818053, variance: -23.79, completion: 76.21 },
        { name: 'Charlie Plaza', estimated: 2177000, actual: 1580000, variance: -27.41, completion: 72.59 }
      ];
    }
    
    const values = data.values.slice(1); // Skip header row
    return values.map(row => ({
      name: row[0] || 'Unknown Project',
      estimated: parseFloat(row[1]) || 0,
      actual: parseFloat(row[2]) || 0,
      variance: parseFloat(row[3]) || 0,
      completion: parseFloat(row[4]) || 0
    }));
  },

  parseCashFlowData(data) {
    // Parse cash flow data
    if (!data || !data.values || data.values.length < 2) {
      return {
        operating: 1122158,
        investing: -445000,
        financing: -200000,
        netChange: 477158
      };
    }
    
    const values = data.values[1]; // Get first data row
    return {
      operating: parseFloat(values?.[1]) || 1122158,
      investing: parseFloat(values?.[2]) || -445000,
      financing: parseFloat(values?.[3]) || -200000,
      netChange: parseFloat(values?.[4]) || 477158
    };
  },

  parsePLData(data) {
    // Parse P&L data
    if (!data || !data.values || data.values.length < 2) {
      return {
        totalIncome: 7421238,
        totalCOGS: 5906948,
        grossProfit: 1514290,
        totalExpenses: 636763,
        netOperatingIncome: 877527
      };
    }
    
    const values = data.values[1];
    return {
      totalIncome: parseFloat(values?.[1]) || 7421238,
      totalCOGS: parseFloat(values?.[2]) || 5906948,
      grossProfit: parseFloat(values?.[3]) || 1514290,
      totalExpenses: parseFloat(values?.[4]) || 636763,
      netOperatingIncome: parseFloat(values?.[5]) || 877527
    };
  },

  parseBalanceSheetData(data) {
    // Parse balance sheet data
    if (!data || !data.values || data.values.length < 2) {
      return {
        bankAccounts: 1122158,
        accountsReceivable: 1355853,
        totalCurrentAssets: 3416748,
        totalCurrentLiabilities: 1155729,
        totalLiabilities: 7899327
      };
    }
    
    const values = data.values[1];
    return {
      bankAccounts: parseFloat(values?.[1]) || 1122158,
      accountsReceivable: parseFloat(values?.[2]) || 1355853,
      totalCurrentAssets: parseFloat(values?.[3]) || 3416748,
      totalCurrentLiabilities: parseFloat(values?.[4]) || 1155729,
      totalLiabilities: parseFloat(values?.[5]) || 7899327
    };
  },

  // ... rest of existing code ...
};
