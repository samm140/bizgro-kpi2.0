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
  transactionDetails: '943478698' // TransactionListDetails
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
      const [apSummary, apDetail, transactionList, transactionDetails] = await Promise.all([
        this.fetchSheet('apSummary', SHEET_GIDS.apSummary),
        this.fetchSheet('apDetail', SHEET_GIDS.apDetail),
        this.fetchSheet('transactionList', SHEET_GIDS.transactionList),
        this.fetchSheet('transactionDetails', SHEET_GIDS.transactionDetails)
      ]);

      console.log('Fetch results:');
      console.log('- AP Summary fetched:', !!apSummary);
      console.log('- AP Detail fetched:', !!apDetail);
      console.log('- Transaction List fetched:', !!transactionList);
      console.log('- Transaction Details fetched:', !!transactionDetails);

      // Parse all sheets using the APDataParser
      const parsedData = this.parser.parseAllSheets({
        apSummary,
        apDetail,
        transactionList,
        transactionDetails
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

      // Aggregate vendor data
      const aggregatedVendors = this.parser.aggregateVendorData(parsedData);
      console.log(`Total unique vendors: ${Object.keys(aggregatedVendors).length}`);

      // Build the final data structure
      const finalData = {
        summary: this.buildSummaryData(parsedData.summary, aggregatedVendors),
        vendors: aggregatedVendors,
        details: parsedData,
        rawData: {
          apSummary: parsedData.summary,
          apDetail: parsedData.detail,
          transactionList: parsedData.transactionList,
          transactionDetails: parsedData.transactionDetails
        },
        fetchedAt: new Date().toISOString()
      };

      console.log('Final AP data structure:', finalData);
      
      // Check if we got real data
      if (finalData.summary.vendorCount === 0) {
        console.warn('⚠️ No vendors found - check parser logic');
        // Don't fall back to mock data - return what we have
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

  // Build summary statistics from parsed data
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

  // Clear cache
  clearCache() {
    this.cache = {};
    console.log('Cache cleared');
  }
}

// Create singleton instance
const apService = new APGoogleSheetsDataService();

// Export for use in the app
export default apService;

// Also export class for testing
export { APGoogleSheetsDataService };

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.apService = apService;
  
  // Add test function to window
  window.testAPConnection = async () => {
    const result = await apService.testConnection();
    if (result) {
      console.log('✅ Connection test passed!');
      console.log('Now testing full data fetch...');
      const data = await apService.fetchAPData();
      console.log('Full data fetch result:', data);
      return data;
    } else {
      console.log('❌ Connection test failed');
      return null;
    }
  };
}
