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

  // Initialize sheets with proper structure
  async initializeSheets(spreadsheetId) {
    try {
      // This would use the Google Sheets API to create the structure
      // For now, return a template structure
      return {
        success: true,
        message: 'Sheets initialized successfully',
        structure: this.SHEET_STRUCTURE
      };
    } catch (error) {
      console.error('Error initializing sheets:', error);
      throw error;
    }
  },

  // Sync data from QuickBooks to Sheets
  async syncFromQuickBooks(qboData, spreadsheetId) {
    try {
      // Transform QBO data to sheet format
      const wipData = this.transformQBOToWIP(qboData);
      const projectData = this.transformQBOToProjects(qboData);
      
      // Update sheets
      await this.updateSheet(spreadsheetId, 'WIP', wipData);
      await this.updateSheet(spreadsheetId, 'Projects', projectData);
      
      return { success: true, synced: new Date().toISOString() };
    } catch (error) {
      console.error('Error syncing from QuickBooks:', error);
      throw error;
    }
  },

  transformQBOToWIP(qboData) {
    // Transform QuickBooks data to WIP format
    return {
      cyBilledToDate: qboData.revenue?.total || 0,
      pyBilledToDate: qboData.revenue?.priorYear || 0,
      directCOGS: qboData.costs?.direct || 0,
      unallocatedCOGS: qboData.costs?.overhead || 0,
      overbilling: qboData.billing?.over || 0,
      underbilling: qboData.billing?.under || 0
    };
  },

  transformQBOToProjects(qboData) {
    // Transform QuickBooks project data
    return qboData.projects?.map(p => ({
      name: p.name,
      estimated: p.budget,
      actual: p.actual,
      variance: ((p.actual - p.budget) / p.budget) * 100,
      completion: (p.actual / p.budget) * 100
    })) || [];
  }
};
