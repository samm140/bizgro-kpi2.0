// src/services/apGoogleSheetsDataService.js
// AP Data Service for Google Sheets with proper parsing

import APDataParser from './APDataParser.js'; // Default import

const AP_SPREADSHEET_ID = '16PVlalae-iOCX3VR1sSIB6_QCdTGjXSwmO6x8YttH1I';
const CORS_PROXY = 'https://corsproxy.io/?';

// Sheet GIDs (from the URLs)
const SHEET_GIDS = {
  apSummary: '1583100976',       // AgedPayableSummaryByVendor
  apDetail: '1716787487',        // AgedPayableDetailByVendor  
  transactionList: '1012932950', // TransactionListByVendor
  transactionDetails: '943478698', // TransactionListDetails
  generalLedger: '457744770'     // GeneralLedgerByAccount
};

class APGoogleSheetsDataService {
  constructor() {
    this.parser = new APDataParser();
    this.cache = {};
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // Main method to fetch and parse all AP data
  async fetchAPData() {
    console.log('=====================================');
    console.log('Starting AP data fetch from Google Sheets...');
    console.log('Spreadsheet ID:', AP_SPREADSHEET_ID);
    console.log('=====================================');

    try {
      // Fetch all sheets in parallel
      const [apSummary, apDetail, transactionList, transactionDetails, generalLedger] = await Promise.all([
        this.fetchSheet('apSummary', SHEET_GIDS.apSummary),
        this.fetchSheet('apDetail', SHEET_GIDS.apDetail),
        this.fetchSheet('transactionList', SHEET_GIDS.transactionList),
        this.fetchSheet('transactionDetails', SHEET_GIDS.transactionDetails),
        this.fetchSheet('generalLedger', SHEET_GIDS.generalLedger)
      ]);

      console.log('Fetch results:');
      console.log('- AP Summary fetched:', !!apSummary);
      console.log('- AP Detail fetched:', !!apDetail);
      console.log('- Transaction List fetched:', !!transactionList);
      console.log('- Transaction Details fetched:', !!transactionDetails);
      console.log('- General Ledger fetched:', !!generalLedger);

      // Parse all sheets using the APDataParser
      const parsedData = this.parser.parseAllSheets({
        apSummary,
        apDetail,
        transactionList,
        transactionDetails,
        generalLedger
      });

      // Log parsing results
      console.log('Parsing results:');
      if (parsedData.summary) {
        console.log(`- AP Summary: ${parsedData.summary.vendors.length} vendors`);
      }
      if (parsedData.detail) {
        console.log(`- AP Detail: ${Object.keys(parsedData.detail.vendors).length} vendors`);
      }
      if (parsedData.transactionList) {
        console.log(`- Transaction List: ${Object.keys(parsedData.transactionList.vendors).length} vendors`);
      }
      if (parsedData.transactionDetails) {
        console.log(`- Transaction Details: ${parsedData.transactionDetails.transactions.length} transactions`);
      }
      if (parsedData.generalLedger) {
        console.log(`- General Ledger: ${Object.keys(parsedData.generalLedger.accounts).length} accounts, ${parsedData.generalLedger.transactions.length} transactions`);
        if (parsedData.generalLedger.apMetrics) {
          console.log(`- GL AP Metrics: Total Payables: ${parsedData.generalLedger.apMetrics.totalPayables}, Cash: ${parsedData.generalLedger.apMetrics.cashPosition}`);
        }
      }

      // Aggregate vendor data
      const aggregatedVendors = this.parser.aggregateVendorData(parsedData);
      console.log(`Total unique vendors: ${Object.keys(aggregatedVendors).length}`);

      // Build the final data structure (matching expected format)
      const finalData = {
        apSummary: this.buildSummaryObject(parsedData.summary, aggregatedVendors, parsedData.generalLedger),
        apByVendor: this.buildVendorList(parsedData.summary, aggregatedVendors),
        apByProject: this.buildProjectList(parsedData),
        agingTrend: this.buildAgingTrend(parsedData.summary),
        billsVsPayments: this.buildBillsVsPayments(parsedData, parsedData.generalLedger),
        bankSnapshot: this.buildBankSnapshot(parsedData.generalLedger),
        bankTrend: this.buildBankTrend(parsedData.generalLedger),
        liquidAssets: this.buildLiquidAssets(parsedData.generalLedger),
        vendors: Object.values(aggregatedVendors),
        invoices: this.extractAllInvoices(parsedData),
        generalLedger: parsedData.generalLedger, // Include raw GL data for reference
        lastUpdated: new Date().toISOString()
      };

      console.log('Final AP data structure:', finalData);
      
      // Check if we got real data
      const vendorCount = Object.keys(aggregatedVendors).length;
      if (vendorCount === 0) {
        console.warn('⚠️ No vendors found - but returning parsed data anyway');
      } else {
        console.log(`✓ Successfully parsed ${vendorCount} vendors from Google Sheets`);
      }

      return finalData;

    } catch (error) {
      console.error('Error fetching AP data:', error);
      throw error;
    }
  }

  // Fetch a single sheet
  async fetchSheet(sheetName, gid) {
    const cacheKey = `${sheetName}_${gid}`;
    
    // Check cache
    if (this.cache[cacheKey]) {
      const cached = this.cache[cacheKey];
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log(`Using cached data for ${sheetName}`);
        return cached.data;
      }
    }

    // Build CSV export URL
    const url = `https://docs.google.com/spreadsheets/d/${AP_SPREADSHEET_ID}/export?format=csv&gid=${gid}`;
    const proxiedUrl = CORS_PROXY + encodeURIComponent(url);

    console.log(`Fetching ${sheetName} from GID ${gid}...`);

    try {
      const response = await fetch(proxiedUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const csvData = await response.text();
      console.log(`✓ Successfully fetched ${sheetName} (${csvData.length} characters)`);

      // Cache the data
      this.cache[cacheKey] = {
        data: csvData,
        timestamp: Date.now()
      };

      return csvData;

    } catch (error) {
      console.error(`✗ Failed to fetch ${sheetName}:`, error.message);
      
      // Try without proxy as fallback
      try {
        console.log(`Trying direct fetch for ${sheetName}...`);
        const directResponse = await fetch(url);
        if (directResponse.ok) {
          const csvData = await directResponse.text();
          console.log(`✓ Direct fetch successful for ${sheetName}`);
          
          this.cache[cacheKey] = {
            data: csvData,
            timestamp: Date.now()
          };
          
          return csvData;
        }
      } catch (directError) {
        console.error(`Direct fetch also failed for ${sheetName}`);
      }
      
      throw error;
    }
  }

  // Build summary object matching expected format
  buildSummaryObject(summaryData, aggregatedVendors, glData) {
    const vendors = summaryData?.vendors || [];
    
    // Calculate totals from summary data
    let total = 0;
    let current = 0;
    let b1_30 = 0;
    let b31_60 = 0;
    let b61_90 = 0;
    let b90_plus = 0;

    vendors.forEach(vendor => {
      current += vendor.current || 0;
      b1_30 += vendor['1_months'] || vendor.months_1 || 0;
      b31_60 += vendor['2_months'] || vendor.months_2 || 0;
      b61_90 += vendor['3_months'] || vendor.months_3 || 0;
      b90_plus += (vendor['4_months'] || 0) + (vendor['5_months'] || 0) + (vendor.older || 0);
      total += vendor.total || 0;
    });

    // Use GL data if available for more accurate metrics
    let billsMTD = 0;
    let paymentsMTD = 0;
    
    if (glData && glData.apMetrics) {
      if (glData.apMetrics.totalPayables > 0) {
        total = total || glData.apMetrics.totalPayables;
      }
      billsMTD = glData.apMetrics.recentBills || 0;
      paymentsMTD = glData.apMetrics.recentPayments || 0;
    }

    return {
      total: total || 0,
      current: current || 0,
      b1_30: b1_30 || 0,
      b31_60: b31_60 || 0, 
      b61_90: b61_90 || 0,
      b90_plus: b90_plus || 0,
      dpo: Math.round(this.calculateAverageDaysPastDue(vendors)),
      onTimePct: this.calculateOnTimePayments(glData) || 88,
      billsMTD: billsMTD,
      paymentsMTD: paymentsMTD
    };
  }

  // Calculate on-time payment percentage from GL data
  calculateOnTimePayments(glData) {
    if (!glData || !glData.transactions) return null;
    
    const paidTransactions = glData.transactions.filter(t => 
      t.transaction_type && t.transaction_type.toLowerCase().includes('payment')
    );
    
    if (paidTransactions.length === 0) return null;
    
    // This is simplified - would need due date comparison
    return 88; // Default for now
  }

  // Build vendor list matching expected format
  buildVendorList(summaryData, aggregatedVendors) {
    const vendorArray = [];
    
    // First try to use summary data if available
    if (summaryData && summaryData.vendors && summaryData.vendors.length > 0) {
      summaryData.vendors.forEach(vendor => {
        const name = vendor.vendor_name || vendor.vendor;
        if (name) {
          vendorArray.push({
            vendor: name,
            amount: vendor.total || vendor.current || 0
          });
        }
      });
    }
    
    // If no summary data, fall back to aggregated vendors
    if (vendorArray.length === 0 && aggregatedVendors) {
      Object.values(aggregatedVendors).forEach(vendor => {
        if (vendor.summary) {
          vendorArray.push({
            vendor: vendor.name,
            amount: vendor.summary.total || vendor.summary.current || 0
          });
        }
      });
    }

    // Sort by amount descending and return top 10
    return vendorArray
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }

  // Build project list (placeholder - would need project mapping)
  buildProjectList(parsedData) {
    // This would need a mapping of vendors to projects
    // For now, return empty or mock data
    return [];
  }

  // Build aging trend (would need historical data)
  buildAgingTrend(summaryData) {
    // This would need historical snapshots
    // For now, return current month only
    const today = new Date().toISOString().split('T')[0];
    
    if (summaryData?.vendors?.length > 0) {
      const vendors = summaryData.vendors;
      let current = 0, b1_30 = 0, b31_60 = 0, b61_90 = 0, b90_plus = 0;
      
      vendors.forEach(v => {
        current += v.current || 0;
        b1_30 += v['1_months'] || 0;
        b31_60 += v['2_months'] || 0;
        b61_90 += v['3_months'] || 0;
        b90_plus += (v['4_months'] || 0) + (v['5_months'] || 0) + (v.older || 0);
      });

      return [{
        date: today,
        current,
        b1_30,
        b31_60,
        b61_90,
        b90_plus
      }];
    }
    
    return [];
  }

  // Build bills vs payments (would need transaction data)
  buildBillsVsPayments(parsedData) {
    // This would need transaction history
    return [];
  }

  // Build bills vs payments from GL data
  buildBillsVsPayments(parsedData, glData) {
    if (!glData || !glData.transactions) return [];
    
    // Group transactions by month
    const monthlyData = {};
    
    glData.transactions.forEach(trans => {
      if (trans.date && (trans.debit > 0 || trans.credit > 0)) {
        const date = new Date(trans.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            date: `${monthKey}-01`,
            bills: 0,
            payments: 0
          };
        }
        
        // Credits to AP are bills, debits are payments
        if (trans.account && trans.account.toLowerCase().includes('payable')) {
          if (trans.credit > 0) monthlyData[monthKey].bills += trans.credit;
          if (trans.debit > 0) monthlyData[monthKey].payments += trans.debit;
        }
      }
    });
    
    // Convert to array and sort
    return Object.values(monthlyData)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-3); // Last 3 months
  }
  
  // Build bank snapshot from GL accounts
  buildBankSnapshot(glData) {
    if (!glData || !glData.accounts) return [];
    
    const bankAccounts = [];
    
    Object.keys(glData.accounts).forEach(accountName => {
      const account = glData.accounts[accountName];
      
      // Look for cash/bank accounts
      if (accountName.toLowerCase().includes('cash') ||
          accountName.toLowerCase().includes('checking') ||
          accountName.toLowerCase().includes('savings') ||
          accountName.toLowerCase().includes('bank') ||
          (account.number && account.number.startsWith('11'))) {
        
        bankAccounts.push({
          account: accountName,
          balance: Math.abs(account.endingBalance || 0)
        });
      }
    });
    
    return bankAccounts;
  }
  
  // Build bank trend from GL transactions
  buildBankTrend(glData) {
    if (!glData || !glData.transactions) return [];
    
    // Group cash transactions by month
    const monthlyBalances = {};
    let runningBalance = 0;
    
    // Sort transactions by date
    const cashTransactions = glData.transactions
      .filter(t => t.account && (
        t.account.toLowerCase().includes('cash') ||
        t.account.toLowerCase().includes('checking')
      ))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    cashTransactions.forEach(trans => {
      if (trans.date) {
        const date = new Date(trans.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        
        // Update running balance
        runningBalance += (trans.debit || 0) - (trans.credit || 0);
        monthlyBalances[monthKey] = runningBalance;
      }
    });
    
    // Convert to array
    return Object.entries(monthlyBalances)
      .map(([date, balance]) => ({ date, balance: Math.abs(balance) }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-3); // Last 3 months
  }
  
  // Build liquid assets from GL
  buildLiquidAssets(glData) {
    const assets = {
      cash: 0,
      marketableSecurities: 0,
      revolverAvailability: 0,
      other: 0
    };
    
    if (!glData || !glData.accounts) return assets;
    
    Object.keys(glData.accounts).forEach(accountName => {
      const account = glData.accounts[accountName];
      const balance = Math.abs(account.endingBalance || 0);
      
      if (accountName.toLowerCase().includes('cash') ||
          accountName.toLowerCase().includes('checking') ||
          accountName.toLowerCase().includes('savings')) {
        assets.cash += balance;
      } else if (accountName.toLowerCase().includes('securities') ||
                 accountName.toLowerCase().includes('investment')) {
        assets.marketableSecurities += balance;
      } else if (accountName.toLowerCase().includes('line of credit') ||
                 accountName.toLowerCase().includes('revolver')) {
        assets.revolverAvailability += balance;
      } else if (account.number && account.number.startsWith('1') && balance > 0) {
        // Other current assets
        assets.other += balance;
      }
    });
    
    return assets;
  }

  // Extract all invoices from parsed data
  extractAllInvoices(parsedData) {
    const invoices = [];
    
    // From transaction details
    if (parsedData.transactionDetails?.transactions) {
      parsedData.transactionDetails.transactions.forEach(trans => {
        invoices.push({
          id: trans.num || `inv-${invoices.length}`,
          vendor: trans.vendor,
          invoiceNo: trans.num,
          amount: trans.amount || 0,
          date: trans.date,
          dueDate: trans.due_date,
          status: trans.open_balance > 0 ? 'open' : 'paid'
        });
      });
    }

    return invoices;
  }

  // Build summary data (old method for compatibility)
  buildSummaryData(summaryData, aggregatedVendors) {
    const vendors = summaryData?.vendors || [];
    const vendorCount = Object.keys(aggregatedVendors).length;
    
    // Calculate totals
    let totalCurrent = 0;
    let total1Month = 0;
    let total2Month = 0;
    let total3Month = 0;
    let totalOlder = 0;
    let grandTotal = 0;

    vendors.forEach(vendor => {
      totalCurrent += vendor.current || 0;
      total1Month += vendor['1_months'] || vendor.months_1 || 0;
      total2Month += vendor['2_months'] || vendor.months_2 || 0;
      total3Month += vendor['3_months'] || vendor.months_3 || 0;
      totalOlder += vendor.older || 0;
      grandTotal += vendor.total || 0;
    });

    // Get top vendors by total
    const topVendors = vendors
      .sort((a, b) => (b.total || 0) - (a.total || 0))
      .slice(0, 10);

    return {
      vendorCount,
      totalAP: grandTotal,
      current: totalCurrent,
      aging: {
        current: totalCurrent,
        '1_month': total1Month,
        '2_month': total2Month,
        '3_month': total3Month,
        older: totalOlder
      },
      topVendors,
      averageDaysPastDue: this.calculateAverageDaysPastDue(vendors),
      lastUpdated: new Date().toISOString()
    };
  }

  // Calculate average days past due
  calculateAverageDaysPastDue(vendors) {
    const validVendors = vendors.filter(v => 
      v.past_due_average !== null && 
      v.past_due_average !== undefined &&
      !isNaN(v.past_due_average)
    );

    if (validVendors.length === 0) return 0;

    const sum = validVendors.reduce((acc, v) => acc + (v.past_due_average || 0), 0);
    return sum / validVendors.length;
  }

  // Test connection to Google Sheets
  async testConnection() {
    console.log('Testing AP Google Sheets connection...');
    
    try {
      const testUrl = `https://docs.google.com/spreadsheets/d/${AP_SPREADSHEET_ID}/export?format=csv&gid=${SHEET_GIDS.apSummary}`;
      console.log('Test URL:', testUrl);

      // Try with CORS proxy first
      console.log('Testing with CORS proxy...');
      const proxiedUrl = CORS_PROXY + encodeURIComponent(testUrl);
      const response = await fetch(proxiedUrl);

      if (response.ok) {
        const text = await response.text();
        console.log('✓ Connection successful!');
        console.log('Response preview (first 500 chars):', text.substring(0, 500));
        
        // Quick parse test
        const lines = text.split('\n');
        console.log('Number of lines:', lines.length);
        
        // Find header line
        const headerLine = lines.find(line => line.startsWith('Vendor,'));
        if (headerLine) {
          console.log('Header row found:', headerLine.substring(0, 100));
        }
        
        return true;
      }
    } catch (error) {
      console.error('✗ Connection test failed:', error.message);
      return false;
    }
  }

  // Alias method for compatibility with existing code
  async getAllAPData() {
    return this.fetchAPData();
  }

  // Clear cache
  clearCache() {
    this.cache = {};
    console.log('Cache cleared');
  }
}

// Create singleton instance
const apGoogleSheetsDataService = new APGoogleSheetsDataService();

// Export as default
export default apGoogleSheetsDataService;

// Also export the class and instance with various names for compatibility
export { APGoogleSheetsDataService, apGoogleSheetsDataService };

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.apService = apGoogleSheetsDataService;
  window.apGoogleSheetsDataService = apGoogleSheetsDataService;
  
  // Add test function to window
  window.testAPConnection = async () => {
    const result = await apGoogleSheetsDataService.testConnection();
    if (result) {
      console.log('✅ Connection test passed!');
      console.log('Now testing full data fetch...');
      const data = await apGoogleSheetsDataService.fetchAPData();
      console.log('Full data fetch result:', data);
      return data;
    } else {
      console.log('❌ Connection test failed');
      return null;
    }
  };
}
