// Add to your existing googleSheets.js file

export const googleSheetsService = {
  // ... existing code ...

  // Add DiamondBack specific methods
  async getDiamondBackData(sheetId, period = '3QCY') {
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
    if (!data || !data.values) return null;
    
    const values = data.values;
    return {
      cyBilledToDate: parseFloat(values[1]?.[1]) || 0,
      pyBilledToDate: parseFloat(values[1]?.[2]) || 0,
      directCOGS: parseFloat(values[1]?.[3]) || 0,
      unallocatedCOGS: parseFloat(values[1]?.[4]) || 0,
      priorOverbilling: parseFloat(values[1]?.[5]) || 0,
      priorUnderbilling: parseFloat(values[1]?.[6]) || 0
    };
  },

  parseProjectsData(data) {
    // Parse projects data
    if (!data || !data.values) return [];
    
    const values = data.values.slice(1); // Skip header row
    return values.map(row => ({
      name: row[0],
      estimated: parseFloat(row[1]) || 0,
      actual: parseFloat(row[2]) || 0,
      variance: parseFloat(row[3]) || 0,
      completion: parseFloat(row[4]) || 0
    }));
  },

  parseCashFlowData(data) {
    // Parse cash flow data
    if (!data || !data.values) return null;
    
    const values = data.values[1]; // Get first data row
    return {
      operating: parseFloat(values?.[1]) || 0,
      investing: parseFloat(values?.[2]) || 0,
      financing: parseFloat(values?.[3]) || 0,
      netChange: parseFloat(values?.[4]) || 0
    };
  },

  parsePLData(data) {
    // Parse P&L data
    if (!data || !data.values) return null;
    
    const values = data.values[1];
    return {
      totalIncome: parseFloat(values?.[1]) || 0,
      totalCOGS: parseFloat(values?.[2]) || 0,
      grossProfit: parseFloat(values?.[3]) || 0,
      totalExpenses: parseFloat(values?.[4]) || 0,
      netOperatingIncome: parseFloat(values?.[5]) || 0
    };
  },

  parseBalanceSheetData(data) {
    // Parse balance sheet data
    if (!data || !data.values) return null;
    
    const values = data.values[1];
    return {
      bankAccounts: parseFloat(values?.[1]) || 0,
      accountsReceivable: parseFloat(values?.[2]) || 0,
      totalCurrentAssets: parseFloat(values?.[3]) || 0,
      totalCurrentLiabilities: parseFloat(values?.[4]) || 0,
      totalLiabilities: parseFloat(values?.[5]) || 0
    };
  },

  // ... rest of existing code ...
};
