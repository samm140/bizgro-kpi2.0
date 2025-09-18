// Complete AP Data Parser for Google Sheets
// Handles all 4 tabs with their specific formats and quirks

class APDataParser {
  constructor() {
    console.log('APDataParser initialized');
  }

  // Main parsing method that handles all sheets
  parseAllSheets(sheetsData) {
    const result = {
      summary: null,
      detail: null,
      transactionList: null,
      transactionDetails: null,
      error: null
    };

    try {
      if (sheetsData.apSummary) {
        console.log('Parsing AP Summary...');
        result.summary = this.parseAPSummary(sheetsData.apSummary);
        console.log(`Parsed ${result.summary.vendors.length} vendors from summary`);
      }

      if (sheetsData.apDetail) {
        console.log('Parsing AP Detail...');
        result.detail = this.parseAPDetail(sheetsData.apDetail);
        console.log(`Parsed ${Object.keys(result.detail.vendors).length} vendors from detail`);
      }

      if (sheetsData.transactionList) {
        console.log('Parsing Transaction List...');
        result.transactionList = this.parseTransactionList(sheetsData.transactionList);
        console.log(`Parsed ${Object.keys(result.transactionList.vendors).length} vendors from transaction list`);
      }

      if (sheetsData.transactionDetails) {
        console.log('Parsing Transaction Details...');
        result.transactionDetails = this.parseTransactionDetails(sheetsData.transactionDetails);
        console.log(`Parsed ${result.transactionDetails.transactions.length} transactions from details`);
      }
    } catch (error) {
      console.error('Error parsing sheets:', error);
      result.error = error.message;
    }

    return result;
  }

  // Parse AgedPayableSummaryByVendor
  // Headers: Vendor, Current, 1 months, 2 months, 3 months, 4 months, 5 months, Older, Total, Past Due Average
  parseAPSummary(csvData) {
    console.log('Starting AP Summary parse...');
    const lines = csvData.split('\n');
    console.log(`Total lines in AP Summary: ${lines.length}`);
    
    // Find the header line by looking for "Vendor" at the start
    let headerLine = -1;
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      if (lines[i].startsWith('Vendor,')) {
        headerLine = i;
        console.log(`Found header line at index ${i}: ${lines[i].substring(0, 100)}`);
        break;
      }
    }
    
    if (headerLine === -1) {
      console.error('Could not find header line starting with "Vendor,"');
      return { vendors: [], totalRow: null, headers: [], error: 'Header not found' };
    }
    
    const headers = this.parseCSVLine(lines[headerLine]);
    console.log('Headers found:', headers);
    
    const vendors = [];
    let totalRow = null;
    
    // Parse data rows starting after header
    for (let i = headerLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      if (values.length < 2) continue; // Need at least vendor name and one value
      
      const vendorName = values[0];
      
      // Skip empty vendor names
      if (!vendorName || vendorName.trim() === '') continue;
      
      // Check if this is the total row
      if (vendorName.toLowerCase().includes('total')) {
        console.log('Found total row:', vendorName);
        totalRow = this.parseVendorRow(headers, values);
        continue;
      }
      
      // Parse regular vendor row
      const vendorData = this.parseVendorRow(headers, values);
      vendorData.vendor_name = vendorName; // Ensure vendor name is stored
      vendors.push(vendorData);
    }
    
    console.log(`Parsed ${vendors.length} vendors from AP Summary`);
    if (vendors.length > 0) {
      console.log('Sample vendor:', vendors[0]);
    }
    
    return { vendors, totalRow, headers };
  }
  
  // Parse AgedPayableDetailByVendor
  // Headers: Date, Due Date, Num, Transaction Type, Terms, Current, 1 months, 2 months, 3 months, 4 months, 5 months, Older, Memo/Description
  // Note: "Date" column contains both dates AND vendor names
  parseAPDetail(csvData) {
    console.log('Starting AP Detail parse...');
    const lines = csvData.split('\n');
    
    // Find header line containing "Due Date" and "Transaction Type"
    let headerLine = -1;
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      if (lines[i].includes('Due Date') && lines[i].includes('Transaction Type')) {
        headerLine = i;
        console.log(`Found header line at index ${i}`);
        break;
      }
    }
    
    if (headerLine === -1) {
      console.error('Could not find header line in AP Detail');
      return { vendors: {}, headers: [], error: 'Header not found' };
    }
    
    const headers = this.parseCSVLine(lines[headerLine]);
    console.log('Headers found:', headers);
    
    const vendors = {};
    let currentVendor = null;
    
    for (let i = headerLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      if (values.length === 0) continue;
      
      const firstCell = values[0];
      if (!firstCell) continue;
      
      // Check if this is a vendor name (not a date, not total, not empty)
      if (this.isVendorName(firstCell) && !firstCell.toLowerCase().includes('total')) {
        // This is a vendor header row
        currentVendor = this.cleanVendorName(firstCell);
        console.log(`Found vendor: ${currentVendor}`);
        vendors[currentVendor] = {
          name: currentVendor,
          transactions: [],
          total: null
        };
      }
      // Check if this is a total row for current vendor
      else if (currentVendor && firstCell.toLowerCase().includes('total')) {
        console.log(`Found total for vendor: ${currentVendor}`);
        vendors[currentVendor].total = this.parseTransactionRow(headers, values);
      }
      // Otherwise it's a transaction row (starts with date)
      else if (currentVendor && this.isDate(firstCell)) {
        const transaction = this.parseTransactionRow(headers, values);
        transaction.vendor = currentVendor;
        vendors[currentVendor].transactions.push(transaction);
      }
    }
    
    console.log(`Parsed ${Object.keys(vendors).length} vendors from AP Detail`);
    return { vendors, headers };
  }
  
  // Parse TransactionListByVendor
  // Headers: Date, Transaction Type, Num, Posting, Create Date, Created By, Last Modified By, Memo/Description, Account, Split, Terms, Due Date, A/P Paid, Clr, Check Printed, Amount, Open Balance
  // Note: "Date" column contains both dates AND vendor names
  parseTransactionList(csvData) {
    console.log('Starting Transaction List parse...');
    const lines = csvData.split('\n');
    
    // Find header line
    let headerLine = -1;
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      if (lines[i].includes('Transaction Type') && 
          lines[i].includes('Due Date') && 
          lines[i].includes('Amount')) {
        headerLine = i;
        console.log(`Found header line at index ${i}`);
        break;
      }
    }
    
    if (headerLine === -1) {
      console.error('Could not find header line in Transaction List');
      return { vendors: {}, headers: [], error: 'Header not found' };
    }
    
    const headers = this.parseCSVLine(lines[headerLine]);
    console.log('Headers found:', headers);
    
    const vendors = {};
    let currentVendor = null;
    
    for (let i = headerLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      if (values.length === 0) continue;
      
      const firstCell = values[0];
      if (!firstCell) continue;
      
      // Check if this is a vendor name
      if (this.isVendorName(firstCell) && !firstCell.toLowerCase().includes('total')) {
        currentVendor = this.cleanVendorName(firstCell);
        console.log(`Found vendor in transaction list: ${currentVendor}`);
        vendors[currentVendor] = {
          name: currentVendor,
          transactions: []
        };
      }
      // Otherwise it's a transaction row
      else if (currentVendor && this.isDate(firstCell)) {
        const transaction = this.parseTransactionRow(headers, values);
        transaction.vendor = currentVendor;
        transaction.date = firstCell;
        vendors[currentVendor].transactions.push(transaction);
      }
    }
    
    console.log(`Parsed ${Object.keys(vendors).length} vendors from Transaction List`);
    return { vendors, headers };
  }
  
  // Parse TransactionListDetails
  // Headers: Date, Transaction Type, Num, Adj, Posting, Created, Name, Customer, Vendor, Class, Product/Service, Memo/Description, Qty, Rate, Account, Payment Method, Clr, Amount, Open Balance, Taxable, Online Banking, Debit, Credit
  // This sheet has a proper "Vendor" column
  parseTransactionDetails(csvData) {
    console.log('Starting Transaction Details parse...');
    const lines = csvData.split('\n');
    
    // Find header line
    let headerLine = -1;
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      if (lines[i].includes('Vendor') && 
          lines[i].includes('Transaction Type') && 
          lines[i].includes('Amount')) {
        headerLine = i;
        console.log(`Found header line at index ${i}`);
        break;
      }
    }
    
    if (headerLine === -1) {
      console.error('Could not find header line in Transaction Details');
      return { transactions: [], vendorGroups: {}, headers: [], error: 'Header not found' };
    }
    
    const headers = this.parseCSVLine(lines[headerLine]);
    console.log('Headers found:', headers);
    
    const vendorIndex = headers.findIndex(h => h === 'Vendor' || h.toLowerCase() === 'vendor');
    if (vendorIndex === -1) {
      console.error('Could not find Vendor column in headers');
      return { transactions: [], vendorGroups: {}, headers, error: 'Vendor column not found' };
    }
    
    const transactions = [];
    
    for (let i = headerLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      if (values.length < headers.length) continue;
      
      const transaction = this.parseTransactionRow(headers, values);
      
      // Ensure vendor field exists
      if (!transaction.vendor && vendorIndex >= 0) {
        transaction.vendor = values[vendorIndex];
      }
      
      if (transaction.vendor && transaction.vendor.trim()) {
        transactions.push(transaction);
      }
    }
    
    // Group transactions by vendor
    const vendorGroups = {};
    transactions.forEach(trans => {
      const vendor = trans.vendor;
      if (!vendorGroups[vendor]) {
        vendorGroups[vendor] = [];
      }
      vendorGroups[vendor].push(trans);
    });
    
    console.log(`Parsed ${transactions.length} transactions from Transaction Details`);
    console.log(`Grouped into ${Object.keys(vendorGroups).length} vendors`);
    
    return { transactions, vendorGroups, headers };
  }
  
  // Helper function to parse CSV line with proper quote handling
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
          i++; // Skip next quote
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
  
  // Check if a string is a date
  isDate(str) {
    if (!str || typeof str !== 'string') return false;
    // Check for date patterns like MM/DD/YYYY, MM-DD-YYYY, or MM/DD/YY
    const datePattern = /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/;
    return datePattern.test(str.trim());
  }
  
  // Check if a string is a vendor name (not a date)
  isVendorName(str) {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    
    // Not a vendor if it's empty or a date
    if (!trimmed || this.isDate(trimmed)) return false;
    
    // Not a vendor if it's just numbers or currency
    if (/^[\d\s\$\.,\-]+$/.test(trimmed)) return false;
    
    // Must contain at least one letter
    return /[a-zA-Z]/.test(trimmed);
  }
  
  // Clean vendor name (remove hyperlink formatting if present)
  cleanVendorName(name) {
    if (!name) return '';
    
    // Remove Excel hyperlink formula if present
    // Format: =HYPERLINK("url", "display text")
    if (name.includes('HYPERLINK')) {
      // Extract the display text (second parameter)
      const match = name.match(/HYPERLINK\s*\([^,]+,\s*"([^"]+)"\s*\)/);
      if (match && match[1]) {
        return match[1].trim();
      }
      // Fallback: try to extract any quoted text after comma
      const fallbackMatch = name.match(/,\s*"([^"]+)"/);
      if (fallbackMatch && fallbackMatch[1]) {
        return fallbackMatch[1].trim();
      }
    }
    
    return name.trim();
  }
  
  // Parse a vendor row from the summary
  parseVendorRow(headers, values) {
    const row = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      const normalizedHeader = this.normalizeHeader(header);
      row[normalizedHeader] = this.parseValue(value);
    });
    return row;
  }
  
  // Parse a transaction row
  parseTransactionRow(headers, values) {
    const row = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      const normalizedHeader = this.normalizeHeader(header);
      row[normalizedHeader] = this.parseValue(value);
    });
    return row;
  }
  
  // Normalize header names for consistency
  normalizeHeader(header) {
    if (!header) return '';
    return header
      .toLowerCase()
      .replace(/\//g, '_')      // Replace slashes
      .replace(/\s+/g, '_')      // Replace spaces
      .replace(/[^a-z0-9_]/g, '') // Remove special chars
      .replace(/_+/g, '_')       // Collapse multiple underscores
      .replace(/^_|_$/g, '');    // Remove leading/trailing underscores
  }
  
  // Parse values (currency, percentages, numbers, etc.)
  parseValue(value) {
    if (!value || value === '') return null;
    
    // Remove quotes if present
    if (typeof value === 'string') {
      value = value.replace(/^["']|["']$/g, '').trim();
    }
    
    // Check for currency
    if (typeof value === 'string' && value.includes('$')) {
      // Remove $ and commas, handle parentheses for negatives
      const cleanValue = value
        .replace(/\$/g, '')
        .replace(/,/g, '')
        .replace(/\(([0-9.]+)\)/, '-$1'); // Convert (123) to -123
      return parseFloat(cleanValue) || 0;
    }
    
    // Check for percentage
    if (typeof value === 'string' && value.includes('%')) {
      return parseFloat(value.replace(/%/g, '')) / 100;
    }
    
    // Check for plain number (including negative)
    if (typeof value === 'string') {
      const cleanValue = value.replace(/,/g, '');
      if (/^-?\d+\.?\d*$/.test(cleanValue)) {
        return parseFloat(cleanValue);
      }
    }
    
    // Return as string if not numeric
    return value;
  }
  
  // Aggregate vendor data from all sources
  aggregateVendorData(parsedData) {
    const aggregated = {};
    
    // Start with summary data
    if (parsedData.summary && parsedData.summary.vendors) {
      parsedData.summary.vendors.forEach(vendor => {
        const name = vendor.vendor_name || vendor.vendor;
        if (name) {
          aggregated[name] = {
            name: name,
            summary: vendor,
            detail: null,
            transactions: [],
            transactionDetails: []
          };
        }
      });
    }
    
    // Add detail data
    if (parsedData.detail && parsedData.detail.vendors) {
      Object.keys(parsedData.detail.vendors).forEach(vendorName => {
        if (!aggregated[vendorName]) {
          aggregated[vendorName] = {
            name: vendorName,
            summary: null,
            detail: null,
            transactions: [],
            transactionDetails: []
          };
        }
        aggregated[vendorName].detail = parsedData.detail.vendors[vendorName];
      });
    }
    
    // Add transaction list data
    if (parsedData.transactionList && parsedData.transactionList.vendors) {
      Object.keys(parsedData.transactionList.vendors).forEach(vendorName => {
        if (!aggregated[vendorName]) {
          aggregated[vendorName] = {
            name: vendorName,
            summary: null,
            detail: null,
            transactions: [],
            transactionDetails: []
          };
        }
        aggregated[vendorName].transactions = parsedData.transactionList.vendors[vendorName].transactions || [];
      });
    }
    
    // Add transaction details data
    if (parsedData.transactionDetails && parsedData.transactionDetails.vendorGroups) {
      Object.keys(parsedData.transactionDetails.vendorGroups).forEach(vendorName => {
        if (!aggregated[vendorName]) {
          aggregated[vendorName] = {
            name: vendorName,
            summary: null,
            detail: null,
            transactions: [],
            transactionDetails: []
          };
        }
        aggregated[vendorName].transactionDetails = parsedData.transactionDetails.vendorGroups[vendorName] || [];
      });
    }
    
    return aggregated;
  }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APDataParser;
} else if (typeof window !== 'undefined') {
  window.APDataParser = APDataParser;
}

// Test function for debugging
function testAPDataParser() {
  const parser = new APDataParser();
  
  // Test with sample data
  const sampleSummary = `Aged Payables Summary By Vendor,,,,,,,,,
Diamondback Masonry Holdings LLC,,,,,,,,,
As of 17 September 2025,,,,,,,,,
Aging by Due Date,,,,,,,,,
Vendor,Current,1 months,2 months,3 months,4 months,5 months,Older,Total,Past Due Average
Acme Brick Company,"$74,555.34",$0.00,$0.00,$0.00,$0.00,$0.00,$0.00,"$74,555.34",-23.33
"ACTION GYPSUM SUPPLY, LP","$4,894.13",$0.00,$0.00,$0.00,$0.00,$0.00,$0.00,"$4,894.13",-26.4
Total,"$79,449.47",$0.00,$0.00,$0.00,$0.00,$0.00,$0.00,"$79,449.47",-24.86`;

  const result = parser.parseAPSummary(sampleSummary);
  console.log('Test parse result:', result);
  console.log('Vendors found:', result.vendors.length);
  console.log('First vendor:', result.vendors[0]);
  
  return result;
}

// Make test function available globally in browser
if (typeof window !== 'undefined') {
  window.testAPDataParser = testAPDataParser;
}
