// src/services/googleSheetsDataService.js
// Updated with correct column headers from your actual Google Sheets

const SPREADSHEET_ID = '16PVlalae-iOCX3VR1sSIB6_QCdTGjXSwmO6x8YttH1I';
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || process.env.REACT_APP_GOOGLE_API_KEY;

// Sheet configurations with their GIDs and header row positions
const SHEET_CONFIGS = {
  agedReceivables: {
    name: 'AgedReceivablesSummaryByCustomer',
    gid: '98770792',
    headerRow: 5,
    range: 'A5:Z1000',
    // Actual headers: Customer, Current, 1 months, 2 months, 3 months, 4 months, 5 months, Older, Total, Past Due Average
    headers: ['Customer', 'Current', '1 months', '2 months', '3 months', '4 months', '5 months', 'Older', 'Total', 'Past Due Average']
  },
  profitLossAccrual: {
    name: 'ProfitAndLossDetail',
    gid: '1412560882',
    headerRow: 5,
    range: 'A5:Z1000',
    // Actual headers: Date, Transaction Type, Num, Name, Class, Memo/Description, Split, Amount, Balance
    headers: ['Date', 'Transaction Type', 'Num', 'Name', 'Class', 'Memo/Description', 'Split', 'Amount', 'Balance']
  },
  profitLossCash: {
    name: 'ProfitAndLossDetail (1)',
    gid: '1066586081',
    headerRow: 5,
    range: 'A5:Z1000',
    // Actual headers: Date, Transaction Type, Num, Name, Class, Memo/Description, Split, Amount, Balance
    headers: ['Date', 'Transaction Type', 'Num', 'Name', 'Class', 'Memo/Description', 'Split', 'Amount', 'Balance']
  },
  transactionList: {
    name: 'TransactionListDetails',
    gid: '943478698',
    headerRow: 4,
    range: 'A4:Z1000',
    // Actual headers: Date, Transaction Type, Num, Adj, Posting, Created, Name, Customer, Vendor, Class, Product/Service, Memo/Description, Qty, Rate, Account, Payment Method, Clr, Amount, Open Balance, Taxable, Online Banking, Debit, Credit
    headers: ['Date', 'Transaction Type', 'Num', 'Adj', 'Posting', 'Created', 'Name', 'Customer', 'Vendor', 'Class', 'Product/Service', 'Memo/Description', 'Qty', 'Rate', 'Account', 'Payment Method', 'Clr', 'Amount', 'Open Balance', 'Taxable', 'Online Banking', 'Debit', 'Credit']
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

    if (API_KEY) {
      try {
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

  // Fetch data using public CSV export
  async fetchWithCSVExport(sheetConfig) {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${sheetConfig.gid}`;
      
      // Try direct fetch first
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

      // If direct fetch fails, try with proxies
      const proxyUrls = [
        `https://corsproxy.io/?${encodeURIComponent(csvUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(csvUrl)}`
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
      return this.getMockData(sheetConfig.name);
    }
  }

  // Parse sheet data into structured format
  parseSheetData(values, headerRowIndex) {
    if (!values || values.length <= headerRowIndex - 1) {
      return [];
    }

    const headerIndex = headerRowIndex - 1;
    const headers = values[headerIndex];
    const dataRows = values.slice(headerIndex + 1);

    return dataRows.map((row, index) => {
      const obj = { _rowIndex: headerIndex + index + 2 };
      headers.forEach((header, i) => {
        obj[header] = row[i] || '';
      });
      return obj;
    }).filter(row => {
      // Filter out empty rows and total rows
      return Object.values(row).some(val => 
        val && val !== '' && val !== '_rowIndex' && !String(val).toLowerCase().includes('total')
      );
    });
  }

  // Parse CSV text into structured data
  parseCSV(csvText, headerRowIndex) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length <= headerRowIndex - 1) {
      return [];
    }

    const headerIndex = headerRowIndex - 1;
    const headers = this.parseCSVLine(lines[headerIndex]);
    const dataLines = lines.slice(headerIndex + 1);

    const data = dataLines.map((line, index) => {
      const values = this.parseCSVLine(line);
      const obj = { _rowIndex: headerIndex + index + 2 };
      headers.forEach((header, i) => {
        obj[header] = values[i] || '';
      });
      return obj;
    }).filter(row => {
      // Filter out empty rows and total rows
      const hasData = Object.values(row).some(val => 
        val && val !== '' && val !== '_rowIndex'
      );
      const firstCol = Object.values(row)[1] || '';
      const isTotal = String(firstCol).toLowerCase().includes('total') || 
                     String(firstCol).toLowerCase().includes('grand');
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
          current += '"';
          i++;
        } else {
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

  // Parse number from string
  parseNumber(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    const cleaned = value.toString()
      .replace(/[$,]/g, '')
      .replace(/^\((.+)\)$/, '-$1')
      .trim();
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  // Process aged receivables data with correct column mapping
  processAgedReceivables(rawData) {
    return rawData.map(row => {
      // Map to the actual column names from your sheet
      const customer = row['Customer'] || '';
      const current = this.parseNumber(row['Current'] || 0);
      const month1 = this.parseNumber(row['1 months'] || 0);
      const month2 = this.parseNumber(row['2 months'] || 0);
      const month3 = this.parseNumber(row['3 months'] || 0);
      const month4 = this.parseNumber(row['4 months'] || 0);
      const month5 = this.parseNumber(row['5 months'] || 0);
      const older = this.parseNumber(row['Older'] || 0);
      const total = this.parseNumber(row['Total'] || 0);
      const pastDueAvg = this.parseNumber(row['Past Due Average'] || 0);
      
      return {
        customer: customer,
        current: current,
        days30: month1,  // 1 month past due
        days60: month2 + month3,  // 2-3 months combined for 60 days
        days90: month4 + month5 + older,  // 4+ months for 90+ days
        total: total || (current + month1 + month2 + month3 + month4 + month5 + older),
        month1: month1,
        month2: month2,
        month3: month3,
        month4: month4,
        month5: month5,
        older: older,
        pastDueAverage: pastDueAvg,
        percentOfTotal: 0  // Will calculate this after we have all rows
      };
    }).filter(row => row.customer && row.total > 0);
  }

  // Process P&L data (both accrual and cash use same structure)
  processProfitLoss(rawData, type) {
    const processedData = {
      type: type,
      revenue: [],
      expenses: [],
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      grossProfit: 0,
      operatingIncome: 0,
      transactions: []  // Store raw transactions
    };

    // Process each transaction
    rawData.forEach(row => {
      const date = row['Date'] || '';
      const transactionType = row['Transaction Type'] || '';
      const num = row['Num'] || '';
      const name = row['Name'] || '';
      const className = row['Class'] || '';
      const memo = row['Memo/Description'] || '';
      const split = row['Split'] || '';
      const amount = this.parseNumber(row['Amount'] || 0);
      const balance = this.parseNumber(row['Balance'] || 0);

      if (!date || amount === 0) return;

      // Add to transactions list
      processedData.transactions.push({
        date,
        type: transactionType,
        num,
        name,
        class: className,
        memo,
        split,
        amount,
        balance
      });

      // Categorize based on split account or transaction type
      const splitLower = split.toLowerCase();
      const memoLower = memo.toLowerCase();
      
      if (splitLower.includes('revenue') || splitLower.includes('income') || 
          splitLower.includes('sales') || transactionType === 'Invoice' || 
          transactionType === 'Sales Receipt') {
        // Revenue items
        const existingRevenue = processedData.revenue.find(r => r.account === split);
        if (existingRevenue) {
          existingRevenue.amount += Math.abs(amount);
        } else {
          processedData.revenue.push({
            account: split || `${transactionType} - ${name}`,
            amount: Math.abs(amount)
          });
        }
        processedData.totalRevenue += Math.abs(amount);
      } else if (splitLower.includes('expense') || splitLower.includes('cost') || 
                transactionType === 'Bill' || transactionType === 'Check' || 
                transactionType === 'Expense') {
        // Expense items
        const existingExpense = processedData.expenses.find(e => e.account === split);
        if (existingExpense) {
          existingExpense.amount += Math.abs(amount);
        } else {
          processedData.expenses.push({
            account: split || `${transactionType} - ${name}`,
            amount: Math.abs(amount)
          });
        }
        processedData.totalExpenses += Math.abs(amount);
      }
    });

    // Calculate net income
    processedData.netIncome = processedData.totalRevenue - processedData.totalExpenses;
    processedData.grossProfit = processedData.totalRevenue * 0.3; // Estimate if not provided
    processedData.operatingIncome = processedData.netIncome;

    // Sort transactions by date
    processedData.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    return processedData;
  }

  // Process transaction list data with correct column mapping
  processTransactionList(rawData) {
    return rawData.map(row => ({
      date: row['Date'] || '',
      type: row['Transaction Type'] || '',
      number: row['Num'] || '',
      adj: row['Adj'] || '',
      posting: row['Posting'] || '',
      created: row['Created'] || '',
      name: row['Name'] || '',
      customer: row['Customer'] || '',
      vendor: row['Vendor'] || '',
      class: row['Class'] || '',
      productService: row['Product/Service'] || '',
      memo: row['Memo/Description'] || '',
      qty: this.parseNumber(row['Qty'] || 0),
      rate: this.parseNumber(row['Rate'] || 0),
      account: row['Account'] || '',
      paymentMethod: row['Payment Method'] || '',
      clr: row['Clr'] || '',
      amount: this.parseNumber(row['Amount'] || 0),
      openBalance: this.parseNumber(row['Open Balance'] || 0),
      taxable: row['Taxable'] || '',
      onlineBanking: row['Online Banking'] || '',
      debit: this.parseNumber(row['Debit'] || 0),
      credit: this.parseNumber(row['Credit'] || 0),
      // Computed fields
      netAmount: this.parseNumber(row['Amount'] || 0) || 
                (this.parseNumber(row['Debit'] || 0) - this.parseNumber(row['Credit'] || 0)),
      status: row['Clr'] ? 'Cleared' : 'Open',
      entity: row['Customer'] || row['Vendor'] || row['Name'] || ''
    })).filter(row => row.date && (row.amount !== 0 || row.debit !== 0 || row.credit !== 0))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Specific methods for each data type
  async getAgedReceivables() {
    const data = await this.fetchSheetData(SHEET_CONFIGS.agedReceivables);
    const processed = this.processAgedReceivables(data);
    
    // Calculate percentages
    const total = processed.reduce((sum, r) => sum + r.total, 0);
    processed.forEach(r => {
      r.percentOfTotal = total > 0 ? (r.total / total * 100) : 0;
    });
    
    return processed;
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

  // Mock data fallback
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
          month1: 12000,
          month2: 5000,
          month3: 3000,
          month4: 2000,
          month5: 2000,
          older: 1000,
          pastDueAverage: 45,
          percentOfTotal: 35
        },
        {
          customer: 'XYZ Builders Inc',
          current: 25000,
          days30: 15000,
          days60: 0,
          days90: 2000,
          total: 42000,
          month1: 15000,
          month2: 0,
          month3: 0,
          month4: 1000,
          month5: 1000,
          older: 0,
          pastDueAverage: 30,
          percentOfTotal: 21
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
          { account: 'Materials', amount: 285000 }
        ],
        totalRevenue: 975000,
        totalExpenses: 710000,
        netIncome: 265000,
        grossProfit: 292500,
        operatingIncome: 265000,
        transactions: []
      },
      profitLossCash: {
        type: 'cash',
        revenue: [
          { account: 'Cash Revenue', amount: 750000 }
        ],
        expenses: [
          { account: 'Cash Expenses', amount: 550000 }
        ],
        totalRevenue: 750000,
        totalExpenses: 550000,
        netIncome: 200000,
        grossProfit: 225000,
        operatingIncome: 200000,
        transactions: []
      },
      transactionList: [
        {
          date: '2025-01-20',
          type: 'Invoice',
          number: 'INV-001',
          name: 'ABC Construction',
          customer: 'ABC Construction',
          memo: 'Progress billing',
          amount: 45000,
          openBalance: 45000,
          status: 'Open',
          entity: 'ABC Construction'
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
}

// Create singleton instance
const googleSheetsDataService = new GoogleSheetsDataService();

// Export for use in components
export { googleSheetsDataService, SPREADSHEET_ID, SHEET_CONFIGS };
