// src/services/googleSheetsDataService.js
// Service to fetch real data from Google Sheets tabs/

const SPREADSHEET_ID = '16PVlalae-iOCX3VR1sSIB6_QCdTGjXSwmO6x8YttH1I';
const API_KEY = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY || import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

// Sheet configurations with their GIDs and header row positions
const SHEET_CONFIGS = {
  agedReceivables: {
    name: 'AgedReceivablesSummaryByCustomer',
    gid: '98770792',
    headerRow: 5,
    range: 'A5:Z1000' // Adjust range as needed
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
    headerRow: 4, // This one starts at row 4
    range: 'A4:Z1000'
  }
};

class GoogleSheetsDataService {
  constructor() {
    this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // Initialize Google Sheets API client
  async initializeClient() {
    if (!API_KEY) {
      console.warn('Google Sheets API key not found. Using mock data.');
      return false;
    }

    try {
      // Load Google API client library if not already loaded
      if (!window.gapi) {
        await this.loadGoogleApiScript();
      }

      await new Promise((resolve) => {
        window.gapi.load('client', resolve);
      });

      await window.gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize Google Sheets client:', error);
      return false;
    }
  }

  // Load Google API script dynamically
  loadGoogleApiScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Generic method to fetch data from a sheet tab
  async fetchSheetData(sheetConfig) {
    const cacheKey = `${SPREADSHEET_ID}_${sheetConfig.name}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // Try using Google Sheets API
      if (window.gapi && window.gapi.client && window.gapi.client.sheets) {
        const response = await window.gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetConfig.name}!${sheetConfig.range}`,
        });

        const data = this.parseSheetData(response.result.values, sheetConfig.headerRow);
        
        // Cache the result
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });

        return data;
      } else {
        // Fallback to fetch API with public URL
        return await this.fetchViaPublicUrl(sheetConfig);
      }
    } catch (error) {
      console.error(`Error fetching ${sheetConfig.name}:`, error);
      
      // Try fallback method
      try {
        return await this.fetchViaPublicUrl(sheetConfig);
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
        return this.getMockData(sheetConfig.name);
      }
    }
  }

  // Fallback method using public CSV export
  async fetchViaPublicUrl(sheetConfig) {
    try {
      // Construct CSV export URL using GID
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${sheetConfig.gid}`;
      
      // Use a CORS proxy if needed
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const finalUrl = `${proxyUrl}${csvUrl}`;
      
      const response = await fetch(finalUrl, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      const data = this.parseCSV(text, sheetConfig.headerRow);
      
      // Cache the result
      const cacheKey = `${SPREADSHEET_ID}_${sheetConfig.name}`;
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Public URL fetch failed:', error);
      throw error;
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
    const lines = csvText.split('\n');
    if (lines.length <= headerRowIndex - 1) {
      return [];
    }

    // Adjust for 0-based index
    const headerIndex = headerRowIndex - 1;
    const headers = this.parseCSVLine(lines[headerIndex]);
    const dataLines = lines.slice(headerIndex + 1);

    return dataLines.map((line, index) => {
      const values = this.parseCSVLine(line);
      const obj = { _rowIndex: headerIndex + index + 2 };
      headers.forEach((header, i) => {
        obj[this.normalizeHeader(header)] = values[i] || '';
      });
      return obj;
    }).filter(row => {
      // Filter out empty rows
      return Object.values(row).some(val => val && val !== '' && val !== '_rowIndex');
    });
  }

  // Parse a single CSV line handling quotes
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
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
    return header
      .toString()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();
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

  // Process aged receivables data
  processAgedReceivables(rawData) {
    return rawData.map(row => ({
      customer: row.customer || row.name || '',
      current: this.parseNumber(row.current || row['030_days'] || 0),
      days30: this.parseNumber(row['3060_days'] || row.days_30 || 0),
      days60: this.parseNumber(row['6090_days'] || row.days_60 || 0),
      days90: this.parseNumber(row['90_days'] || row.over_90 || 0),
      total: this.parseNumber(row.total || 0),
      percentOfTotal: this.parseNumber(row.percent_of_total || 0),
      email: row.email || '',
      phone: row.phone || '',
      lastPayment: row.last_payment || '',
      creditLimit: this.parseNumber(row.credit_limit || 0)
    }));
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
      const account = row.account || row.description || '';
      const amount = this.parseNumber(row.amount || row.total || 0);

      // Identify sections based on account names
      if (account.toLowerCase().includes('revenue') || account.toLowerCase().includes('income')) {
        currentSection = 'revenue';
        if (amount !== 0) {
          processedData.revenue.push({
            account: account,
            amount: Math.abs(amount)
          });
          processedData.totalRevenue += Math.abs(amount);
        }
      } else if (account.toLowerCase().includes('expense') || account.toLowerCase().includes('cost')) {
        currentSection = 'expenses';
        if (amount !== 0) {
          processedData.expenses.push({
            account: account,
            amount: Math.abs(amount)
          });
          processedData.totalExpenses += Math.abs(amount);
        }
      }

      // Look for summary lines
      if (account.toLowerCase().includes('gross profit')) {
        processedData.grossProfit = amount;
      } else if (account.toLowerCase().includes('net income')) {
        processedData.netIncome = amount;
      } else if (account.toLowerCase().includes('operating income')) {
        processedData.operatingIncome = amount;
      }
    });

    // Calculate if not found in data
    if (processedData.netIncome === 0) {
      processedData.netIncome = processedData.totalRevenue - processedData.totalExpenses;
    }

    return processedData;
  }

  // Process transaction list data
  processTransactionList(rawData) {
    return rawData.map(row => ({
      date: row.date || '',
      type: row.transaction_type || row.type || '',
      number: row.num || row.number || '',
      name: row.name || row.vendor || row.customer || '',
      memo: row.memo || row.description || '',
      account: row.account || '',
      split: row.split || '',
      amount: this.parseNumber(row.amount || 0),
      balance: this.parseNumber(row.balance || 0),
      status: row.status || '',
      category: row.category || '',
      class: row.class || '',
      location: row.location || ''
    })).sort((a, b) => {
      // Sort by date descending (most recent first)
      return new Date(b.date) - new Date(a.date);
    });
  }

  // Parse number from string (handles currency formatting)
  parseNumber(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    // Remove currency symbols, commas, and parentheses (for negatives)
    const cleaned = value.toString()
      .replace(/[$,]/g, '')
      .replace(/[()]/g, '-')
      .trim();
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  // Get all data at once
  async getAllData() {
    try {
      // Initialize client first
      await this.initializeClient();

      // Fetch all data in parallel
      const [agedReceivables, profitLossAccrual, profitLossCash, transactionList] = await Promise.all([
        this.getAgedReceivables(),
        this.getProfitLossAccrual(),
        this.getProfitLossCash(),
        this.getTransactionList()
      ]);

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

  // Mock data fallback
  getMockData(type) {
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
  }

  // Set custom API key
  setApiKey(apiKey) {
    if (apiKey) {
      window.GOOGLE_SHEETS_API_KEY = apiKey;
      this.clearCache();
      return this.initializeClient();
    }
    return false;
  }
}

// Create singleton instance
const googleSheetsDataService = new GoogleSheetsDataService();

// Export for use in components
export { googleSheetsDataService, SPREADSHEET_ID, SHEET_CONFIGS };
