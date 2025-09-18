// Enhanced parsing logic for AP Google Sheets data

class APDataParser {
  // Parse AgedPayableSummaryByVendor
  parseAPSummary(csvData) {
    const lines = csvData.split('\n');
    
    // Skip first 4 rows to get to headers
    // Line 0: "Aged Payables Summary By Vendor"
    // Line 1: Company name
    // Line 2: Date
    // Line 3: "Aging by Due Date"
    // Line 4: Headers
    // Line 5+: Data
    
    const headerLine = 4;
    const headers = this.parseCSVLine(lines[headerLine]);
    
    const vendors = [];
    let totalRow = null;
    
    for (let i = headerLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      if (values.length < headers.length) continue;
      
      const vendor = values[0]; // First column is vendor name
      
      // Check if this is the total row
      if (vendor && vendor.toLowerCase().includes('total')) {
        totalRow = this.parseVendorRow(headers, values);
        continue;
      }
      
      // Parse regular vendor row
      if (vendor && vendor.trim()) {
        vendors.push(this.parseVendorRow(headers, values));
      }
    }
    
    return { vendors, totalRow, headers };
  }
  
  // Parse AgedPayableDetailByVendor
  parseAPDetail(csvData) {
    const lines = csvData.split('\n');
    const headerLine = this.findHeaderLine(lines, ['Due Date', 'Transaction Type']);
    
    if (headerLine === -1) {
      console.error('Could not find header line in AP Detail');
      return { vendors: {} };
    }
    
    const headers = this.parseCSVLine(lines[headerLine]);
    const vendors = {};
    let currentVendor = null;
    
    for (let i = headerLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      if (values.length === 0) continue;
      
      const firstCell = values[0];
      
      // Check if this is a vendor name (not a date)
      if (this.isVendorName(firstCell)) {
        // Remove hyperlink if present
        currentVendor = this.cleanVendorName(firstCell);
        vendors[currentVendor] = {
          name: currentVendor,
          transactions: [],
          total: null
        };
      }
      // Check if this is a total row
      else if (firstCell && firstCell.toLowerCase().includes('total') && currentVendor) {
        vendors[currentVendor].total = this.parseTransactionRow(headers, values);
      }
      // Otherwise it's a transaction row
      else if (currentVendor && this.isDate(firstCell)) {
        vendors[currentVendor].transactions.push(
          this.parseTransactionRow(headers, values)
        );
      }
    }
    
    return { vendors, headers };
  }
  
  // Parse TransactionListByVendor
  parseTransactionList(csvData) {
    const lines = csvData.split('\n');
    const headerLine = this.findHeaderLine(lines, ['Transaction Type', 'Due Date', 'Amount']);
    
    if (headerLine === -1) {
      console.error('Could not find header line in Transaction List');
      return { vendors: {} };
    }
    
    const headers = this.parseCSVLine(lines[headerLine]);
    const vendors = {};
    let currentVendor = null;
    
    for (let i = headerLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      if (values.length === 0) continue;
      
      const firstCell = values[0];
      
      // Check if this is a vendor name
      if (this.isVendorName(firstCell)) {
        currentVendor = this.cleanVendorName(firstCell);
        vendors[currentVendor] = {
          name: currentVendor,
          transactions: []
        };
      }
      // Otherwise it's a transaction row
      else if (currentVendor && this.isDate(firstCell)) {
        vendors[currentVendor].transactions.push(
          this.parseTransactionRow(headers, values)
        );
      }
    }
    
    return { vendors, headers };
  }
  
  // Parse TransactionListDetails (easier - has vendor column)
  parseTransactionDetails(csvData) {
    const lines = csvData.split('\n');
    const headerLine = this.findHeaderLine(lines, ['Vendor', 'Transaction Type', 'Amount']);
    
    if (headerLine === -1) {
      console.error('Could not find header line in Transaction Details');
      return { transactions: [] };
    }
    
    const headers = this.parseCSVLine(lines[headerLine]);
    const vendorIndex = headers.indexOf('Vendor');
    const transactions = [];
    
    for (let i = headerLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = this.parseCSVLine(line);
      if (values.length < headers.length) continue;
      
      const transaction = this.parseTransactionRow(headers, values);
      if (transaction.vendor) {
        transactions.push(transaction);
      }
    }
    
    // Group by vendor
    const vendorGroups = {};
    transactions.forEach(trans => {
      const vendor = trans.vendor;
      if (!vendorGroups[vendor]) {
        vendorGroups[vendor] = [];
      }
      vendorGroups[vendor].push(trans);
    });
    
    return { transactions, vendorGroups, headers };
  }
  
  // Helper functions
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
  
  findHeaderLine(lines, requiredHeaders) {
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i];
      const hasAllHeaders = requiredHeaders.every(header => 
        line.includes(header)
      );
      if (hasAllHeaders) {
        return i;
      }
    }
    return -1;
  }
  
  isDate(str) {
    if (!str) return false;
    // Check for date patterns like MM/DD/YYYY or MM-DD-YYYY
    const datePattern = /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/;
    return datePattern.test(str);
  }
  
  isVendorName(str) {
    if (!str) return false;
    // Not a date, not empty, not "Total"
    return !this.isDate(str) && 
           str.trim() !== '' && 
           !str.toLowerCase().includes('total');
  }
  
  cleanVendorName(name) {
    // Remove hyperlink formatting if present
    // Hyperlinks might appear as =HYPERLINK("url", "name")
    if (name.includes('HYPERLINK')) {
      const match = name.match(/\"([^\"]+)\"[^\"]$/);
      if (match) {
        return match[1];
      }
    }
    return name.trim();
  }
  
  parseVendorRow(headers, values) {
    const row = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      row[this.normalizeHeader(header)] = this.parseValue(value);
    });
    return row;
  }
  
  parseTransactionRow(headers, values) {
    const row = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      row[this.normalizeHeader(header)] = this.parseValue(value);
    });
    return row;
  }
  
  normalizeHeader(header) {
    return header
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }
  
  parseValue(value) {
    if (!value) return null;
    
    // Remove quotes
    value = value.replace(/^"|"$/g, '');
    
    // Parse currency
    if (value.includes('$')) {
      return parseFloat(value.replace(/[$,]/g, '')) || 0;
    }
    
    // Parse percentage
    if (value.includes('%')) {
      return parseFloat(value.replace(/%/g, '')) / 100;
    }
    
    // Parse number
    const num = parseFloat(value.replace(/,/g, ''));
    if (!isNaN(num) && value.match(/^[\d,.-]+$/)) {
      return num;
    }
    
    return value;
  }
}

// Export for use in your service
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APDataParser;
} else if (typeof window !== 'undefined') {
  window.APDataParser = APDataParser;
}
