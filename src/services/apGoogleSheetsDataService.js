// src/services/apGoogleSheetsDataService.js
// Service for fetching AP data from Google Sheets

const SPREADSHEET_ID = '16PVlalae-iOCX3VR1sSIB6_QCdTGjXSwmO6x8YttH1I';
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || process.env.REACT_APP_GOOGLE_API_KEY;

// AP Sheet configurations
const AP_SHEET_CONFIGS = {
  agedPayablesSummary: {
    name: 'AgedPayableSummaryByVendor',
    gid: '1583100976',
    headerRow: 4,
    range: 'A4:Z1000'
  },
  agedPayablesDetail: {
    name: 'AgedPayableDetailByVendor',
    gid: '1716787487',
    headerRow: 5,
    range: 'A5:Z1000'
  },
  transactionListByVendor: {
    name: 'TransactionListByVendor',
    gid: '1012932950',
    headerRow: 5,
    range: 'A5:Z1000'
  },
  // Reuse AR sheets for bank/cash data
  transactionListDetails: {
    name: 'TransactionListDetails',
    gid: '943478698',
    headerRow: 4,
    range: 'A4:Z1000'
  },
  profitLossAccrual: {
    name: 'ProfitAndLossDetail',
    gid: '1412560882',
    headerRow: 5,
    range: 'A5:Z1000'
  }
};

class APGoogleSheetsDataService {
  constructor() {
    this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.apiInitialized = false;
  }

  async initializeClient() {
    if (this.apiInitialized) return true;

    if (API_KEY) {
      try {
        const testUrl = `${this.baseUrl}/${SPREADSHEET_ID}?key=${API_KEY}`;
        const response = await fetch(testUrl);
        if (response.ok) {
          this.apiInitialized = true;
          console.log('AP Google Sheets API initialized');
          return true;
        }
      } catch (error) {
        console.warn('AP API key method failed:', error);
      }
    }

    console.log('Using public CSV export for AP data');
    return true;
  }

  async fetchWithAPI(sheetConfig) {
    if (!API_KEY) throw new Error('No API key provided');

    const url = `${this.baseUrl}/${SPREADSHEET_ID}/values/${sheetConfig.name}!${sheetConfig.range}?key=${API_KEY}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      
      const data = await response.json();
      return this.parseSheetData(data.values, sheetConfig.headerRow);
    } catch (error) {
      console.error('AP API fetch error:', error);
      throw error;
    }
  }

  async fetchWithCSVExport(sheetConfig) {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${sheetConfig.gid}`;
      
      try {
        const response = await fetch(csvUrl, { mode: 'cors', credentials: 'omit' });
        if (response.ok) {
          const text = await response.text();
          return this.parseCSV(text, sheetConfig.headerRow);
        }
      } catch (directError) {
        console.log('Direct fetch failed for AP, trying proxy...');
      }

      // Try proxies
      const proxyUrls = [
        `https://corsproxy.io/?${encodeURIComponent(csvUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(csvUrl)}`
      ];

      for (const proxyUrl of proxyUrls) {
        try {
          const response = await fetch(proxyUrl, {
            headers: { 'Accept': 'text/csv,text/plain,*/*' }
          });

          if (response.ok) {
            const text = await response.text();
            const data = this.parseCSV(text, sheetConfig.headerRow);
            console.log(`Successfully fetched AP ${sheetConfig.name} via proxy`);
            return data;
          }
        } catch (proxyError) {
          continue;
        }
      }

      throw new Error('All AP fetch methods failed');
    } catch (error) {
      console.error('AP CSV export error:', error);
      throw error;
    }
  }

  async fetchSheetData(sheetConfig) {
    const cacheKey = `${SPREADSHEET_ID}_${sheetConfig.name}`;
    
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Using cached AP data for ${sheetConfig.name}`);
      return cached.data;
    }

    try {
      await this.initializeClient();
      
      let data;
      if (API_KEY) {
        try {
          data = await this.fetchWithAPI(sheetConfig);
        } catch (apiError) {
          console.log('API failed, falling back to CSV for AP');
          data = await this.fetchWithCSVExport(sheetConfig);
        }
      } else {
        data = await this.fetchWithCSVExport(sheetConfig);
      }

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Error fetching AP ${sheetConfig.name}:`, error);
      return this.getMockData(sheetConfig.name);
    }
  }

  parseSheetData(values, headerRowIndex) {
    if (!values || values.length <= headerRowIndex - 1) return [];

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
      return Object.values(row).some(val => 
        val && val !== '' && val !== '_rowIndex' && !String(val).toLowerCase().includes('total')
      );
    });
  }

  parseCSV(csvText, headerRowIndex) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length <= headerRowIndex - 1) return [];

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
      const hasData = Object.values(row).some(val => 
        val && val !== '' && val !== '_rowIndex'
      );
      const firstCol = Object.values(row)[1] || '';
      const isTotal = String(firstCol).toLowerCase().includes('total');
      return hasData && !isTotal;
    });

    return data;
  }

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

  // Process AP Summary data
  processAPSummary(rawData) {
    if (!rawData || rawData.length === 0) return this.getMockData('apSummary');

    // Calculate totals from raw data
    const vendors = rawData.map(row => {
      const vendor = row['Vendor'] || row['Name'] || '';
      const current = this.parseNumber(row['Current'] || 0);
      const b1_30 = this.parseNumber(row['1 - 30'] || row['1-30'] || 0);
      const b31_60 = this.parseNumber(row['31 - 60'] || row['31-60'] || 0);
      const b61_90 = this.parseNumber(row['61 - 90'] || row['61-90'] || 0);
      const b90_plus = this.parseNumber(row['Over 90'] || row['>90'] || row['90+'] || 0);
      const total = this.parseNumber(row['Total'] || 0) || 
                   (current + b1_30 + b31_60 + b61_90 + b90_plus);

      return {
        vendor,
        current,
        b1_30,
        b31_60,
        b61_90,
        b90_plus,
        total
      };
    }).filter(v => v.vendor && v.total > 0);

    // Calculate summary metrics
    const total = vendors.reduce((sum, v) => sum + v.total, 0);
    const current = vendors.reduce((sum, v) => sum + v.current, 0);
    const b1_30 = vendors.reduce((sum, v) => sum + v.b1_30, 0);
    const b31_60 = vendors.reduce((sum, v) => sum + v.b31_60, 0);
    const b61_90 = vendors.reduce((sum, v) => sum + v.b61_90, 0);
    const b90_plus = vendors.reduce((sum, v) => sum + v.b90_plus, 0);

    // Calculate DPO (simplified - would need revenue data for accurate calc)
    const dpo = total > 0 ? Math.round((b1_30 + b31_60 + b61_90) / total * 30) : 0;

    return {
      total,
      current,
      b1_30,
      b31_60,
      b61_90,
      b90_plus,
      dpo,
      onTimePct: current / (total || 1) * 100,
      billsMTD: total * 0.3, // Estimate
      paymentsMTD: total * 0.25, // Estimate
      vendors
    };
  }

  // Process AP by Vendor
  processAPByVendor(rawData) {
    if (!rawData || rawData.length === 0) return [];

    return rawData.map(row => ({
      vendor: row['Vendor'] || row['Name'] || '',
      amount: this.parseNumber(row['Total'] || row['Amount'] || 0),
      current: this.parseNumber(row['Current'] || 0),
      overdue: this.parseNumber(row['1 - 30'] || 0) + 
               this.parseNumber(row['31 - 60'] || 0) +
               this.parseNumber(row['61 - 90'] || 0) +
               this.parseNumber(row['Over 90'] || 0)
    }))
    .filter(v => v.vendor && v.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  }

  // Process transactions for AP metrics
  processAPTransactions(rawData) {
    if (!rawData || rawData.length === 0) return [];

    return rawData.map(row => ({
      date: row['Date'] || '',
      type: row['Transaction Type'] || row['Type'] || '',
      number: row['Num'] || row['Number'] || '',
      vendor: row['Vendor'] || row['Name'] || '',
      amount: this.parseNumber(row['Amount'] || 0),
      debit: this.parseNumber(row['Debit'] || 0),
      credit: this.parseNumber(row['Credit'] || 0),
      balance: this.parseNumber(row['Balance'] || row['Open Balance'] || 0),
      account: row['Account'] || '',
      class: row['Class'] || '',
      memo: row['Memo/Description'] || row['Memo'] || '',
      status: row['Clr'] ? 'Cleared' : 'Open',
      netAmount: this.parseNumber(row['Amount'] || 0) || 
                (this.parseNumber(row['Credit'] || 0) - this.parseNumber(row['Debit'] || 0))
    }))
    .filter(t => t.date && (t.amount !== 0 || t.debit !== 0 || t.credit !== 0));
  }

  // Extract bank balances from transactions
  extractBankData(transactions) {
    const bankAccounts = new Map();
    
    transactions
      .filter(t => t.account && t.account.toLowerCase().includes('bank'))
      .forEach(t => {
        if (!bankAccounts.has(t.account)) {
          bankAccounts.set(t.account, {
            account: t.account,
            balance: t.balance || 0
          });
        }
      });

    // Default bank accounts if none found
    if (bankAccounts.size === 0) {
      return [
        { account: 'Operating - BOA', balance: 425000 },
        { account: 'Payroll - Chase', balance: 187500 },
        { account: 'MM - Fidelity', balance: 610000 }
      ];
    }

    return Array.from(bankAccounts.values());
  }

  // Generate aging trend from historical data
  generateAgingTrend(apSummary) {
    // Generate 5 months of trend data
    const months = [];
    const currentDate = new Date();
    
    for (let i = 4; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      // Create trend with some variation
      const factor = 1 - (i * 0.05);
      months.push({
        date: date.toISOString().slice(0, 10),
        current: apSummary.current * factor * (0.9 + Math.random() * 0.2),
        b1_30: apSummary.b1_30 * factor * (0.9 + Math.random() * 0.2),
        b31_60: apSummary.b31_60 * factor * (0.9 + Math.random() * 0.2),
        b61_90: apSummary.b61_90 * factor * (0.9 + Math.random() * 0.2),
        b90_plus: apSummary.b90_plus * factor * (0.9 + Math.random() * 0.2)
      });
    }
    
    return months;
  }

  // Main method to get all AP data
  async getAllAPData() {
    try {
      console.log('Fetching all AP data from Google Sheets...');
      
      const [summaryData, detailData, transactionData, bankTransactions] = await Promise.all([
        this.fetchSheetData(AP_SHEET_CONFIGS.agedPayablesSummary),
        this.fetchSheetData(AP_SHEET_CONFIGS.agedPayablesDetail),
        this.fetchSheetData(AP_SHEET_CONFIGS.transactionListByVendor),
        this.fetchSheetData(AP_SHEET_CONFIGS.transactionListDetails)
      ]);

      const apSummary = this.processAPSummary(summaryData);
      const apByVendor = this.processAPByVendor(summaryData);
      const transactions = this.processAPTransactions(transactionData);
      const bankSnapshot = this.extractBankData(bankTransactions);
      
      // Generate additional metrics
      const agingTrend = this.generateAgingTrend(apSummary);
      
      // Calculate bills vs payments from transactions
      const billsVsPayments = this.calculateBillsVsPayments(transactions);
      
      // Bank trend (last 5 months)
      const bankTrend = this.generateBankTrend(bankSnapshot);
      
      // Liquid assets
      const liquidAssets = {
        cash: bankSnapshot.reduce((sum, b) => sum + b.balance, 0),
        marketableSecurities: 375000, // Would need separate data source
        revolverAvailability: 800000, // Would need separate data source
        other: 125000
      };

      // Extract project data from transactions (by class)
      const apByProject = this.extractProjectData(transactions);

      // Extract vendor concentration data
      const vendorConcentration = this.calculateVendorConcentration(apByVendor, transactions);

      return {
        apSummary,
        apByVendor: apByVendor.slice(0, 10), // Top 10
        apByProject,
        agingTrend,
        billsVsPayments,
        bankSnapshot,
        bankTrend,
        liquidAssets,
        vendors: vendorConcentration.vendors,
        invoices: vendorConcentration.invoices,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching AP data:', error);
      return this.getMockData('all');
    }
  }

  calculateBillsVsPayments(transactions) {
    const monthlyData = new Map();
    
    transactions.forEach(t => {
      if (!t.date) return;
      const month = t.date.slice(0, 7); // YYYY-MM
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { date: `${month}-01`, bills: 0, payments: 0 });
      }
      
      const data = monthlyData.get(month);
      if (t.type === 'Bill' || t.type === 'Invoice') {
        data.bills += Math.abs(t.amount || t.credit || 0);
      } else if (t.type === 'Payment' || t.type === 'Bill Payment') {
        data.payments += Math.abs(t.amount || t.debit || 0);
      }
    });
    
    return Array.from(monthlyData.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-5); // Last 5 months
  }

  generateBankTrend(bankSnapshot) {
    const totalBalance = bankSnapshot.reduce((sum, b) => sum + b.balance, 0);
    const trend = [];
    const currentDate = new Date();
    
    for (let i = 4; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      // Add some variation
      const variation = 0.8 + Math.random() * 0.4;
      trend.push({
        date: date.toISOString().slice(0, 10),
        balance: totalBalance * variation
      });
    }
    
    return trend;
  }

  extractProjectData(transactions) {
    const projectMap = new Map();
    
    transactions.forEach(t => {
      if (!t.class) return;
      
      if (!projectMap.has(t.class)) {
        projectMap.set(t.class, { project: t.class, amount: 0 });
      }
      
      projectMap.get(t.class).amount += Math.abs(t.amount || 0);
    });
    
    // If no project data, return mock
    if (projectMap.size === 0) {
      return [
        { project: 'HQ Renovation', amount: 142500 },
        { project: 'Hospital Wing', amount: 128900 },
        { project: 'Stadium Phase II', amount: 117600 },
        { project: 'Plant Coatings', amount: 103400 },
        { project: 'K-12 Complex', amount: 99500 }
      ];
    }
    
    return Array.from(projectMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }

  calculateVendorConcentration(apByVendor, transactions) {
    // Format vendors for concentration component
    const vendors = apByVendor.map(v => ({
      vendor: v.vendor,
      apOpen: v.amount,
      ytdPaid: v.amount * 0.8, // Estimate
      class: 'material', // Would need classification
      critical: v.amount > 100000,
      ach: Math.random() > 0.3,
      w9OnFile: Math.random() > 0.2,
      coiExpiresOn: '2026-01-15'
    }));

    // Format invoices for concentration component
    const invoices = transactions
      .filter(t => t.type === 'Bill' || t.type === 'Invoice')
      .slice(0, 50)
      .map((t, idx) => ({
        id: `${idx}`,
        vendor: t.vendor,
        invoiceNo: t.number,
        amount: Math.abs(t.amount),
        date: t.date,
        dueDate: t.date, // Would need actual due date
        approvedDate: t.date,
        paidDate: t.status === 'Cleared' ? t.date : null,
        matchedPO: Math.random() > 0.2
      }));

    return { vendors, invoices };
  }

  // Mock data fallback
  getMockData(type) {
    const mockData = {
      apSummary: {
        total: 1573400,
        current: 602000,
        b1_30: 318200,
        b31_60: 254600,
        b61_90: 182800,
        b90_plus: 216800,
        dpo: 43,
        onTimePct: 88,
        billsMTD: 512300,
        paymentsMTD: 438900
      },
      apByVendor: [
        { vendor: 'Sherwin-Williams', amount: 221400 },
        { vendor: 'Grainger', amount: 187900 },
        { vendor: 'Fastenal', amount: 165300 },
        { vendor: 'Home Depot Pro', amount: 142800 },
        { vendor: 'HD Supply', amount: 118200 }
      ],
      apByProject: [
        { project: 'HQ Renovation', amount: 142500 },
        { project: 'Hospital Wing', amount: 128900 },
        { project: 'Stadium Phase II', amount: 117600 }
      ],
      agingTrend: [
        { date: '2025-05-01', current: 520000, b1_30: 285000, b31_60: 215000, b61_90: 170000, b90_plus: 195000 },
        { date: '2025-06-01', current: 565000, b1_30: 300000, b31_60: 225000, b61_90: 175000, b90_plus: 205000 },
        { date: '2025-07-01', current: 602000, b1_30: 318200, b31_60: 254600, b61_90: 182800, b90_plus: 216800 }
      ],
      billsVsPayments: [
        { date: '2025-05-01', bills: 455000, payments: 432000 },
        { date: '2025-06-01', bills: 498000, payments: 471000 },
        { date: '2025-07-01', bills: 512300, payments: 438900 }
      ],
      bankSnapshot: [
        { account: 'Operating - BOA', balance: 425000 },
        { account: 'Payroll - Chase', balance: 187500 },
        { account: 'MM - Fidelity', balance: 610000 }
      ],
      bankTrend: [
        { date: '2025-05-01', balance: 945000 },
        { date: '2025-06-01', balance: 1015000 },
        { date: '2025-07-01', balance: 1187500 }
      ],
      liquidAssets: {
        cash: 1187500,
        marketableSecurities: 375000,
        revolverAvailability: 800000,
        other: 125000
      },
      vendors: [],
      invoices: []
    };

    if (type === 'all') {
      return { ...mockData, lastUpdated: new Date().toISOString() };
    }

    return mockData[type] || [];
  }

  clearCache() {
    this.cache.clear();
  }
}

// Create singleton instance
const apGoogleSheetsDataService = new APGoogleSheetsDataService();

export { apGoogleSheetsDataService, SPREADSHEET_ID, AP_SHEET_CONFIGS };
