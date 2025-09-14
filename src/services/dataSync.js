// Data Synchronization Service
import qboApi from './qboApi';
import { qboFieldMappings } from '../utils/qboMappings';

class DataSyncService {
  constructor() {
    this.syncInterval = null;
    this.lastSyncTime = null;
    this.syncStatus = 'idle';
  }

  // Map QBO accounts to BizGro fields
  mapAccountsToKPIs(accounts) {
    const mappedData = {};
    
    accounts.forEach(account => {
      const mapping = qboFieldMappings.accounts[account.Name];
      if (mapping) {
        mappedData[mapping.bizgroField] = {
          value: account.CurrentBalance,
          qboAccount: account.Name,
          accountType: account.AccountType,
          lastUpdated: new Date()
        };
      }
    });
    
    return mappedData;
  }

  // Calculate derived metrics
  calculateMetrics(data) {
    return {
      totalCash: (data.cashOnHand?.value || 0) + 
                 (data.cashInBank?.value || 0) + 
                 (data.savingsAccount?.value || 0),
      workingCapital: (data.currentAR?.value || 0) - 
                       (data.currentAP?.value || 0),
      netARPosition: (data.currentAR?.value || 0) - 
                      (data.retentionReceivables?.value || 0)
    };
  }

  // Sync all data from QBO
  async syncAllData() {
    this.syncStatus = 'syncing';
    
    try {
      // Authenticate if needed
      if (!qboApi.accessToken) {
        await qboApi.authenticate();
      }

      // Fetch all data in parallel
      const [accounts, plReport, arAging, customers, vendors, estimates] = await Promise.all([
        qboApi.getAccounts(),
        qboApi.getProfitAndLoss(this.getYTDStartDate(), new Date().toISOString().split('T')[0]),
        qboApi.getARAgingReport(),
        qboApi.getCustomers(),
        qboApi.getVendors(),
        qboApi.getEstimates()
      ]);

      // Map and process data
      const mappedAccounts = this.mapAccountsToKPIs(accounts);
      const metrics = this.calculateMetrics(mappedAccounts);
      
      // Process P&L data
      const plData = this.processPLReport(plReport);
      
      // Process customer/job data
      const jobMetrics = this.processJobData(customers, estimates);
      
      // Process vendor data
      const vendorMetrics = this.processVendorData(vendors);

      // Combine all data
      const syncedData = {
        ...mappedAccounts,
        ...metrics,
        ...plData,
        ...jobMetrics,
        ...vendorMetrics,
        lastSyncTime: new Date(),
        syncStatus: 'success'
      };

      this.lastSyncTime = new Date();
      this.syncStatus = 'success';
      
      return syncedData;
      
    } catch (error) {
      console.error('Data sync failed:', error);
      this.syncStatus = 'error';
      throw error;
    }
  }

  // Process P&L Report
  processPLReport(report) {
    // Extract key metrics from P&L report
    const income = this.extractReportValue(report, 'Total Income');
    const cogs = this.extractReportValue(report, 'Total Cost of Goods Sold');
    const expenses = this.extractReportValue(report, 'Total Expenses');
    
    return {
      totalIncome: income,
      totalCOGS: cogs,
      grossProfit: income - cogs,
      grossMargin: ((income - cogs) / income * 100).toFixed(2),
      netIncome: income - cogs - expenses,
      netMargin: ((income - cogs - expenses) / income * 100).toFixed(2)
    };
  }

  // Process Job/Customer Data
  processJobData(customers, estimates) {
    const activeJobs = customers.filter(c => c.Active && c.Job);
    const openEstimates = estimates.filter(e => e.TxnStatus === 'Accepted');
    
    return {
      totalActiveJobs: activeJobs.length,
      totalBacklog: openEstimates.reduce((sum, e) => sum + e.TotalAmt, 0),
      backlogCount: openEstimates.length,
      averageJobSize: activeJobs.length > 0 
        ? activeJobs.reduce((sum, j) => sum + (j.Balance || 0), 0) / activeJobs.length 
        : 0
    };
  }

  // Process Vendor Data
  processVendorData(vendors) {
    const contractors = vendors.filter(v => v.Vendor1099);
    
    return {
      totalContractors: contractors.length,
      contractor1099Count: contractors.length
    };
  }

  // Helper function to extract values from reports
  extractReportValue(report, rowName) {
    // Navigate through QBO report structure to find specific row
    // This is simplified - actual implementation would need to handle QBO report structure
    return 0; // Placeholder
  }

  // Get YTD start date
  getYTDStartDate() {
    const now = new Date();
    return `${now.getFullYear()}-01-01`;
  }

  // Start automatic sync
  startAutoSync(intervalMinutes = 30) {
    this.stopAutoSync(); // Clear any existing interval
    
    this.syncInterval = setInterval(() => {
      this.syncAllData();
    }, intervalMinutes * 60 * 1000);
  }

  // Stop automatic sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export default new DataSyncService();
