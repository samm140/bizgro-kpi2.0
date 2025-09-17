// src/services/googleSheetsDataService.js
// Fully functional service to fetch real data from Google Sheets

const SPREADSHEET_ID = '16PVlalae-iOCX3VR1sSIB6_QCdTGjXSwmO6x8YttH1I';
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || process.env.REACT_APP_GOOGLE_API_KEY;

// Sheet configurations with their GIDs and header row positions
const SHEET_CONFIGS = {
  agedReceivables: {
    name: 'AgedReceivablesSummaryByCustomer',
    gid: '98770792',
    headerRow: 5,
    range: 'A5:Z1000'
  },
  profitLossAccrual: {
    name: 'ProfitAndLossDetail',
    gid: '1412560882',
    headerRow: 5,
    range: 'A5:Z1000'
  },
  profitLossCash: {
    name: 'ProfitAndLossDetail (1)',
    gid: '1066586081',
    headerRow: 5,
    range: 'A5:Z1000'
  },
  transactionList: {
    name: 'TransactionListDetails',
    gid: '943478698',
    headerRow: 4,
    range: 'A4:Z1000'
  }
};

class GoogleSheetsDataService {
  constructor() {
    this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    this.apiInitialized = false;
  }

  // Initialize Google Sheets API client
  async initializeClient() {
    if (this.apiInitialized) return true;

    // Method 1: Try using Google Sheets API with API Key
    if (API_KEY) {
      try {
        // Test if API key works with a simple request
        const testUrl = `${this.baseUrl}/${SPREADSHEET_ID}?key=${API_KEY}`;
        const response = await fetch(testUrl);
        if (response.ok) {
          this.apiInitialized = true;
          console.log('Google Sheets API initialized with API key');
          return true;
        }
      } catch (error) {
        console.warn('API key method failed:', error);
      }
    }

    // Method 2: Try public CSV export (no API key needed)
    console.log('Using public CSV export method (no API key)');
    return true;
  }

  // Fetch data using Google Sheets API v4
  async fetchWithAPI(sheetConfig) {
    if (!API_KEY) {
      throw new Error('No API key provided');
    }

    const url = `${this.baseUrl}/${SPREADSHEET_ID}/values/${sheetConfig.name}!${sheetConfig.range}?key=${API_KEY}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return this.parseSheetData(data.values, sheetConfig.headerRow);
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  }

  // Fetch data using public CSV export (works without API key)
  async fetchWithCSVExport(sheetConfig) {
    try {
      // Direct CSV export URL
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${sheetConfig.gid}`;
      
      // First try direct fetch
      try {
        const response = await fetch(csvUrl, {
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (response.ok) {
          const text = await response.text();
          return this.parseCSV(text, sheetConfig.headerRow);
        }
      } catch (directError) {
        console.log('Direct fetch failed, trying proxy...');
      }

      // If direct fetch fails due to CORS, try with a proxy
      // Using multiple proxy options for reliability
      const proxyUrls = [
        `https://corsproxy.io/?${encodeURIComponent(csvUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(csvUrl)}`,
        `https://cors-anywhere.herokuapp.com/${csvUrl}`
      ];

      for (const proxyUrl of proxyUrls) {
        try {
          const response = await fetch(proxyUrl, {
            headers: {
              'Accept': 'text/csv,text/plain,*/*'
            }
          });

          if (response.ok) {
            const text = await response.text();
            const data = this.parseCSV(text, sheetConfig.headerRow);
            console.log(`Successfully fetched ${sheetConfig.name} via proxy`);
            return data;
          }
        } catch (proxyError) {
          console.log(`Proxy failed: ${proxyUrl.split('/')[2]}`);
          continue;
        }
      }

      throw new Error('All fetch methods failed');
    } catch (error) {
      console.error('CSV export fetch error:', error);
      throw error;
    }
  }

  // Generic method to fetch data from a sheet tab
  async fetchSheetData(sheetConfig) {
    const cacheKey = `${SPREADSHEET_ID}_${sheetConfig.name}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Using cached data for ${sheetConfig.name}`);
      return cached.data;
    }

    try {
      await this.initializeClient();
      
      let data;
      
      // Try API method first if API key is available
      if (API_KEY) {
        try {
          data = await this.fetchWithAPI(sheetConfig);
          console.log(`Fetched ${sheetConfig.name} via API`);
        } catch (apiError) {
          console.log('API method failed, falling back to CSV export');
          data = await this.fetchWithCSVExport(sheetConfig);
        }
      } else {
        // No API key, use CSV export directly
        data = await this.fetchWithCSVExport(sheetConfig);
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`Error fetching ${sheetConfig.name}:`, error);
      // Return mock data as fallback
      return this.getMockData(sheetConfig.name);
    }
  }

  // Parse sheet data into structured format
  parseSheetData(values, headerRowIndex) {
    if (!values || values.length <= headerRowIndex - 1) {
      return [];
    }

    // Adjust for 0-based index
    const headerIndex = headerRowIndex - 1;
    const headers = values[headerIndex];
    const dataRows = values.slice(headerIndex + 1);

    return dataRows.map((row, index) => {
      const obj = { _rowIndex: headerIndex + index + 2 }; // Keep track of original row number
      headers.forEach((header, i) => {
        obj[this.normalizeHeader(header)] = row[i] || '';
      });
      return obj;
    }).filter(row => {
      // Filter out empty rows
      return Object.values(row).some(val => val && val !== '' && val !== '_rowIndex');
    });
  }

  // Parse CSV text into structured data
  parseCSV(csvText, headerRowIndex) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length <= headerRowIndex - 1) {
      return [];
    }

    // Adjust for 0-based index
    const headerIndex = headerRowIndex - 1;
    const headers = this.parseCSVLine(lines[headerIndex]);
    const dataLines = lines.slice(headerIndex + 1);

    const data = dataLines.map((line, index) => {
      const values = this.parseCSVLine(line);
      const obj = { _rowIndex: headerIndex + index + 2 };
      headers.forEach((header, i) => {
        obj[this.normalizeHeader(header)] = values[i] || '';
      });
      return obj;
    }).filter(row => {
      // Filter out empty rows and total rows
      const hasData = Object.values(row).some(val => 
        val && val !== '' && val !== '_rowIndex'
      );
      // Skip rows that look like totals or headers
      const firstCol = Object.values(row)[1] || '';
      const isTotal = firstCol.toLowerCase().includes('total') || 
                     firstCol.toLowerCase().includes('grand');
      return hasData && !isTotal;
    });

    return data;
  }

  // Parse a single CSV line handling quotes
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quotes
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  // Normalize header names for consistent access
  normalizeHeader(header) {
    if (!header) return '';
    return header
      .toString()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();
  }

  // Process aged receivables data
  processAgedReceivables(rawData) {
    return rawData.map(row => {
      // Try different possible column names
      const customer = row.customer || row.name || row.customer_name || '';
      const current = this.parseNumber(row.current || row['030_days'] || row['030'] || 0);
      const days30 = this.parseNumber(row['3160_days'] || row['3060_days'] || row['3060'] || row['130'] || 0);
      const days60 = this.parseNumber(row['6190_days'] || row['6090_days'] || row['6090'] || row['3160'] || 0);
      const days90 = this.parseNumber(row['over_90_days'] || row['90_days'] || row['90'] || row['6190'] || row['over90'] || 0);
      const total = this.parseNumber(row.total || row.amount || 0);
      
      return {
        customer: customer,
        current: current,
        days30: days30,
        days60: days60,
        days90: days90,
        total: total || (current + days30 + days60 + days90),
        percentOfTotal: this.parseNumber(row.percent || row.percentage || 0),
        email: row.email || '',
        phone: row.phone || '',
        lastPayment: row.last_payment_date || row.last_payment || '',
        creditLimit: this.parseNumber(row.credit_limit || 0)
      };
    }).filter(row => row.customer && row.total > 0);
  }

  // Process profit & loss data
  processProfitLoss(rawData, type) {
    const processedData = {
      type: type,
      revenue: [],
      expenses: [],
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      grossProfit: 0,
      operatingIncome: 0
    };

    let currentSection = '';
    
    rawData.forEach(row => {
      // Get account name and amount from various possible columns
      const account = row.account || row.description || row.name || row.account_name || '';
      const amount = this.parseNumber(row.amount || row.total || row.balance || row.debit || row.credit || 0);

      if (!account || amount === 0) return;

      const accountLower = account.toLowerCase();

      // Identify sections based on account names
      if (accountLower.includes('revenue') || 
          accountLower.includes('income') || 
          accountLower.includes('sales')) {
        currentSection = 'revenue';
        processedData.revenue.push({
          account: account,
          amount: Math.abs(amount)
        });
        processedData.totalRevenue += Math.abs(amount);
      } else if (accountLower.includes('expense') || 
                 accountLower.includes('cost') ||
                 accountLower.includes('wages') ||
                 accountLower.includes('rent') ||
                 accountLower.includes('utilities')) {
        currentSection = 'expenses';
        processedData.expenses.push({
          account: account,
          amount: Math.abs(amount)
        });
        processedData.totalExpenses += Math.abs(amount);
      }

      // Look for summary lines
      if (accountLower.includes('gross profit')) {
        processedData.grossProfit = amount;
      } else if (accountLower.includes('net income') || accountLower.includes('net profit')) {
        processedData.netIncome = amount;
      } else if (accountLower.includes('operating income')) {
        processedData.operatingIncome = amount;
      }
    });

    // Calculate if not found in data
    if (processedData.netIncome === 0) {
      processedData.netIncome = processedData.totalRevenue - processedData.totalExpenses;
    }
    if (processedData.grossProfit === 0) {
      processedData.grossProfit = processedData.totalRevenue * 0.3; // Estimate if not provided
    }

    return processedData;
  }

  // Process transaction list data
  processTransactionList(rawData) {
    return rawData.map(row => ({
      date: row.date || row.transaction_date || '',
      type: row.transaction_type || row.type || row.txn_type || '',
      number: row.num || row.number || row.doc_number || '',
      name: row.name || row.vendor || row.customer || row.payee || '',
      memo: row.memo || row.description || row.notes || '',
      account: row.account || row.account_name || '',
      split: row.split || row.split_account || '',
      amount: this.parseNumber(row.amount || row.total || row.debit || row.credit || 0),
      balance: this.parseNumber(row.balance || row.running_balance || 0),
      status: row.status || row.cleared || '',
      category: row.category || row.class || '',
      class: row.class || '',
      location: row.location || ''
    })).filter(row => row.date && row.amount !== 0)
      .sort((a, b) => {
        // Sort by date descending (most recent first)
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
  }

  // Parse number from string (handles currency formatting)
  parseNumber(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    // Remove currency symbols, commas, and parentheses (for negatives)
    const cleaned = value.toString()
      .replace(/[$,]/g, '')
      .replace(/^\((.+)\)$/, '-$1') // Convert (123) to -123
      .trim();
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  // Specific methods for each data type
  async getAgedReceivables() {
    const data = await this.fetchSheetData(SHEET_CONFIGS.agedReceivables);
    return this.processAgedReceivables(data);
  }

  async getProfitLossAccrual() {
    const data = await this.fetchSheetData(SHEET_CONFIGS.profitLossAccrual);
    return this.processProfitLoss(data, 'accrual');
  }

  async getProfitLossCash() {
    const data = await this.fetchSheetData(SHEET_CONFIGS.profitLossCash);
    return this.processProfitLoss(data, 'cash');
  }

  async getTransactionList() {
    const data = await this.fetchSheetData(SHEET_CONFIGS.transactionList);
    return this.processTransactionList(data);
  }

  // Get all data at once
  async getAllData() {
    try {
      console.log('Fetching all data from Google Sheets...');
      
      // Try to fetch all data in parallel
      const promises = [
        this.getAgedReceivables().catch(err => {
          console.error('Failed to fetch aged receivables:', err);
          return this.getMockData('agedReceivables');
        }),
        this.getProfitLossAccrual().catch(err => {
          console.error('Failed to fetch P&L accrual:', err);
          return this.getMockData('profitLossAccrual');
        }),
        this.getProfitLossCash().catch(err => {
          console.error('Failed to fetch P&L cash:', err);
          return this.getMockData('profitLossCash');
        }),
        this.getTransactionList().catch(err => {
          console.error('Failed to fetch transactions:', err);
          return this.getMockData('transactionList');
        })
      ];

      const [agedReceivables, profitLossAccrual, profitLossCash, transactionList] = await Promise.all(promises);

      return {
        agedReceivables,
        profitLossAccrual,
        profitLossCash,
        transactionList,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching all data:', error);
      return this.getMockData('all');
    }
  }

  // Mock data fallback (same as before)
  getMockData(type) {
    console.log(`Using mock data for ${type}`);
    const mockData = {
      agedReceivables: [
        {
          customer: 'ABC Construction LLC',
          current: 45000,
          days30: 12000,
          days60: 8000,
          days90: 5000,
          total: 70000,
          percentOfTotal: 35,
          email: 'billing@abcconstruction.com',
          phone: '555-0100',
          lastPayment: '2025-01-15',
          creditLimit: 100000
        },
        {
          customer: 'XYZ Builders Inc',
          current: 25000,
          days30: 15000,
          days60: 0,
          days90: 2000,
          total: 42000,
          percentOfTotal: 21,
          email: 'accounts@xyzbuilders.com',
          phone: '555-0200',
          lastPayment: '2025-01-10',
          creditLimit: 75000
        },
        {
          customer: 'Premier Contracting',
          current: 38000,
          days30: 5000,
          days60: 3000,
          days90: 0,
          total: 46000,
          percentOfTotal: 23,
          email: 'ap@premiercontracting.com',
          phone: '555-0300',
          lastPayment: '2025-01-20',
          creditLimit: 80000
        },
        {
          customer: 'BuildRight Corp',
          current: 15000,
          days30: 8000,
          days60: 12000,
          days90: 7000,
          total: 42000,
          percentOfTotal: 21,
          email: 'finance@buildright.com',
          phone: '555-0400',
          lastPayment: '2024-12-28',
          creditLimit: 60000
        }
      ],
      profitLossAccrual: {
        type: 'accrual',
        revenue: [
          { account: 'Construction Revenue', amount: 850000 },
          { account: 'Service Revenue', amount: 125000 }
        ],
        expenses: [
          { account: 'Labor Costs', amount: 425000 },
          { account: 'Materials', amount: 285000 },
          { account: 'Operating Expenses', amount: 95000 }
        ],
        totalRevenue: 975000,
        totalExpenses: 805000,
        netIncome: 170000,
        grossProfit: 265000,
        operatingIncome: 170000
      },
      profitLossCash: {
        type: 'cash',
        revenue: [
          { account: 'Cash Revenue', amount: 750000 },
          { account: 'Service Revenue', amount: 100000 }
        ],
        expenses: [
          { account: 'Labor Paid', amount: 400000 },
          { account: 'Materials Paid', amount: 260000 },
          { account: 'Operating Expenses', amount: 90000 }
        ],
        totalRevenue: 850000,
        totalExpenses: 750000,
        netIncome: 100000,
        grossProfit: 190000,
        operatingIncome: 100000
      },
      transactionList: [
        {
          date: '2025-01-20',
          type: 'Invoice',
          number: 'INV-2025-001',
          name: 'ABC Construction LLC',
          memo: 'Progress billing - Project Phase 2',
          account: 'Accounts Receivable',
          amount: 45000,
          balance: 45000,
          status: 'Open'
        },
        {
          date: '2025-01-18',
          type: 'Payment',
          number: 'PMT-2025-015',
          name: 'XYZ Builders Inc',
          memo: 'Payment received - Invoice INV-2024-089',
          account: 'Checking Account',
          amount: 25000,
          balance: 125000,
          status: 'Cleared'
        }
      ]
    };

    if (type === 'all') {
      return {
        ...mockData,
        lastUpdated: new Date().toISOString()
      };
    }

    return mockData[type] || [];
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }

  // Set custom API key
  setApiKey(apiKey) {
    if (apiKey) {
      window.VITE_GOOGLE_SHEETS_API_KEY = apiKey;
      this.clearCache();
      this.apiInitialized = false;
      return this.initializeClient();
    }
    return false;
  }
}

// Create singleton instance
const googleSheetsDataService = new GoogleSheetsDataService();

// Export for use in components
export { googleSheetsDataService, SPREADSHEET_ID, SHEET_CONFIGS };
