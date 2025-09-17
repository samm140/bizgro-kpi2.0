// src/hooks/usePortfolioData.js
import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';

// Helper function to convert values to numbers
const toNum = (v) => {
  if (v === undefined || v === null) return 0;
  if (typeof v === 'number') return v;
  const cleaned = String(v).replace(/[\$,%\s]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

// Custom hook for fetching portfolio-specific data
export const usePortfolioData = (dataType) => {
  const { currentPortfolio } = usePortfolio();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchData = useCallback(async () => {
    if (!currentPortfolio) {
      setLoading(false);
      setError('No portfolio selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const sheetConfig = currentPortfolio.sheets?.[dataType];
      if (!sheetConfig) {
        throw new Error(`No sheet configuration for ${dataType}`);
      }

      const proxyUrl = 'https://corsproxy.io/?';
      const directUrl = `https://docs.google.com/spreadsheets/d/${sheetConfig.spreadsheetId}/export?format=csv&gid=${sheetConfig.gid}`;
      const csvUrl = proxyUrl + encodeURIComponent(directUrl);

      console.log(`Fetching ${dataType} data for portfolio ${currentPortfolio.id}`);

      const response = await fetch(csvUrl, {
        cache: 'no-store',
        headers: { 'Accept': 'text/csv' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const csvText = await response.text();
      
      // Parse based on data type
      let parsedData;
      switch(dataType) {
        case 'wip':
          parsedData = parseWIPData(csvText);
          break;
        case 'ar':
          parsedData = parseARData(csvText);
          break;
        case 'cashflow':
          parsedData = parseCashflowData(csvText);
          break;
        case 'financial':
          parsedData = parseFinancialData(csvText);
          break;
        default:
          parsedData = parseGenericCSV(csvText);
      }

      setData(parsedData);
      setLastFetch(new Date());
      setLoading(false);
    } catch (err) {
      console.error(`Error fetching ${dataType} data:`, err);
      setError(err.message);
      setData(null);
      setLoading(false);
    }
  }, [currentPortfolio, dataType]);

  useEffect(() => {
    fetchData();

    // Listen for portfolio switch events
    const handlePortfolioSwitch = (event) => {
      console.log('Portfolio switched, refetching data');
      fetchData();
    };

    window.addEventListener('portfolio-switched', handlePortfolioSwitch);
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('portfolio-switched', handlePortfolioSwitch);
      clearInterval(interval);
    };
  }, [fetchData]);

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData,
    lastFetch,
    portfolioId: currentPortfolio?.id
  };
};

// Parse WIP (Work in Progress) data
const parseWIPData = (csvText) => {
  try {
    // Manual CSV parsing to handle quotes and special characters
    const rows = [];
    let i = 0, field = '', inQuotes = false, row = [];
    
    while (i < csvText.length) {
      const char = csvText[i];
      
      if (char === '"') {
        if (inQuotes && csvText[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(field.trim());
        field = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (field.length || row.length) {
          row.push(field.trim());
          rows.push(row);
          row = [];
          field = '';
        }
      } else {
        field += char;
      }
      i += 1;
    }
    if (field.length || row.length) {
      row.push(field.trim());
      rows.push(row);
    }

    if (rows.length < 3) {
      throw new Error('Insufficient data in WIP sheet');
    }

    // Row 1 contains totals (skip)
    // Row 2 contains headers
    const headers = rows[1] || [];
    
    // Extract project data (columns A-N)
    const projectHeaders = headers.slice(0, 14);
    const dataRows = rows.slice(2).filter(r => r.some(c => c && c.length));

    const projects = dataRows.map(row => {
      const obj = {};
      projectHeaders.forEach((header, idx) => {
        obj[header] = row[idx] || '';
      });
      return obj;
    });

    // Extract summary metrics from columns P-T
    const summaryMetrics = {};
    if (rows[0] && rows[0].length > 19) {
      // P & Q pair
      const labelP = rows[0][15];
      const valueQ = toNum(rows[0][16]);
      if (labelP) summaryMetrics[labelP] = valueQ;
      
      // S & T pair  
      const labelS = rows[0][18];
      const valueT = toNum(rows[0][19]);
      if (labelS) summaryMetrics[labelS] = valueT;
    }

    // Calculate portfolio metrics
    const portfolioMetrics = calculateWIPMetrics(projects);

    return {
      projects,
      summaryMetrics,
      portfolioMetrics,
      rawData: rows,
      headers: projectHeaders
    };
  } catch (err) {
    console.error('Error parsing WIP data:', err);
    return {
      projects: [],
      summaryMetrics: {},
      portfolioMetrics: {},
      error: err.message
    };
  }
};

// Calculate WIP portfolio metrics
const calculateWIPMetrics = (projects) => {
  const totalContract = projects.reduce((sum, p) => sum + toNum(p['Total Contract']), 0);
  const earnedToDate = projects.reduce((sum, p) => sum + toNum(p['Revenue Earned to Date']), 0);
  const billedToDate = projects.reduce((sum, p) => sum + toNum(p['Revenue Billed to Date']), 0);
  const actualCosts = projects.reduce((sum, p) => sum + toNum(p['Job Costs to Date'] || p['Actual Costs To Date']), 0);
  const estimatedCosts = projects.reduce((sum, p) => sum + toNum(p['Estimated Costs']), 0);

  const overbilled = projects.reduce((sum, p) => {
    const btd = toNum(p['Revenue Billed to Date']);
    const ret = toNum(p['Revenue Earned to Date']);
    return sum + Math.max(btd - ret, 0);
  }, 0);

  const underbilled = projects.reduce((sum, p) => {
    const btd = toNum(p['Revenue Billed to Date']);
    const ret = toNum(p['Revenue Earned to Date']);
    return sum + Math.max(ret - btd, 0);
  }, 0);

  const profitToDate = earnedToDate - actualCosts;
  const marginToDate = earnedToDate > 0 ? (profitToDate / earnedToDate) * 100 : 0;
  const estimatedProfit = totalContract - estimatedCosts;
  const estimatedMargin = totalContract > 0 ? (estimatedProfit / totalContract) * 100 : 0;
  const backlogRemaining = totalContract - earnedToDate;
  const netOverUnder = overbilled - underbilled;

  const projectsInProgress = projects.filter((p) => {
    const pct = toNum(p['% Complete']);
    return pct > 0 && pct < 100;
  }).length;

  return {
    totalContract,
    earnedToDate,
    billedToDate,
    actualCosts,
    estimatedCosts,
    overbilled,
    underbilled,
    profitToDate,
    marginToDate,
    estimatedProfit,
    estimatedMargin,
    backlogRemaining,
    netOverUnder,
    projectsInProgress,
    totalProjects: projects.length,
  };
};

// Parse AR (Accounts Receivable) data
const parseARData = (csvText) => {
  try {
    // Parse CSV
    const rows = [];
    let i = 0, field = '', inQuotes = false, row = [];
    
    while (i < csvText.length) {
      const char = csvText[i];
      
      if (char === '"') {
        if (inQuotes && csvText[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(field.trim());
        field = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (field.length || row.length) {
          row.push(field.trim());
          rows.push(row);
          row = [];
          field = '';
        }
      } else {
        field += char;
      }
      i += 1;
    }
    if (field.length || row.length) {
      row.push(field.trim());
      rows.push(row);
    }

    if (rows.length < 2) {
      throw new Error('Insufficient data in AR sheet');
    }

    // Expected structure: Customer/Project | Current | 1-30 | 31-60 | 61-90 | 90+ | Total
    const headers = rows[0];
    const dataRows = rows.slice(1).filter(r => r.some(c => c && c.length));

    // Parse AR data by project
    const arByProject = [];
    const customerMap = {};
    let totalCurrent = 0;
    let total1_30 = 0;
    let total31_60 = 0;
    let total61_90 = 0;
    let total90_plus = 0;

    dataRows.forEach(row => {
      const projectName = row[0] || '';
      const current = toNum(row[1]);
      const b1_30 = toNum(row[2]);
      const b31_60 = toNum(row[3]);
      const b61_90 = toNum(row[4]);
      const b90_plus = toNum(row[5]);
      const total = toNum(row[6]) || (current + b1_30 + b31_60 + b61_90 + b90_plus);

      if (projectName && total > 0) {
        arByProject.push({
          project: projectName,
          amount: total,
          current,
          b1_30,
          b31_60,
          b61_90,
          b90_plus
        });

        // Extract customer from project name (before dash or use whole name)
        const customer = projectName.split('–')[0]?.trim() || 
                        projectName.split('-')[0]?.trim() || 
                        projectName;
        
        if (!customerMap[customer]) {
          customerMap[customer] = { 
            customer, 
            amount: 0, 
            current: 0, 
            aged: 0,
            projects: []
          };
        }
        customerMap[customer].amount += total;
        customerMap[customer].current += current;
        customerMap[customer].aged += (b1_30 + b31_60 + b61_90 + b90_plus);
        customerMap[customer].projects.push(projectName);

        totalCurrent += current;
        total1_30 += b1_30;
        total31_60 += b31_60;
        total61_90 += b61_90;
        total90_plus += b90_plus;
      }
    });

    const totalAR = totalCurrent + total1_30 + total31_60 + total61_90 + total90_plus;
    const arByCustomer = Object.values(customerMap);

    // Calculate metrics
    const dso = totalAR > 0 ? Math.round((totalAR / (totalAR / 54))) : 54; // Simplified DSO
    const cei = totalCurrent > 0 ? Math.round((totalCurrent / totalAR) * 100) : 0;
    const pastDuePercent = totalAR > 0 ? ((total31_60 + total61_90 + total90_plus) / totalAR * 100) : 0;

    // Generate trend data (mock for now, would come from historical data)
    const agingTrend = generateAgingTrend({
      current: totalCurrent,
      b1_30: total1_30,
      b31_60: total31_60,
      b61_90: total61_90,
      b90_plus: total90_plus
    });

    return {
      arSummary: {
        total: totalAR,
        current: totalCurrent,
        b1_30: total1_30,
        b31_60: total31_60,
        b61_90: total61_90,
        b90_plus: total90_plus,
        dso: dso,
        cei: cei,
        pastDuePercent: pastDuePercent,
        billingsMTD: totalAR * 0.38, // Estimate - would come from actual data
        collectionsMTD: totalCurrent * 0.82, // Estimate - would come from actual data
      },
      arByProject,
      arByCustomer,
      agingTrend,
      rawData: rows,
      headers
    };
  } catch (err) {
    console.error('Error parsing AR data:', err);
    return {
      arSummary: {},
      arByProject: [],
      arByCustomer: [],
      agingTrend: [],
      error: err.message
    };
  }
};

// Generate aging trend (mock data for demonstration)
const generateAgingTrend = (currentData) => {
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep'];
  return months.map((month, i) => ({
    month,
    date: `2025-${String(5 + i).padStart(2, '0')}-01`,
    current: currentData.current * (0.6 + i * 0.1),
    b1_30: currentData.b1_30 * (0.9 + i * 0.02),
    b31_60: currentData.b31_60 * (0.95 + i * 0.01),
    b61_90: currentData.b61_90 * (1.05 - i * 0.01),
    b90_plus: currentData.b90_plus * (1.1 - i * 0.02),
  }));
};

// Parse Cashflow data
const parseCashflowData = (csvText) => {
  try {
    const data = parseGenericCSV(csvText);
    
    // Transform to expected cashflow structure
    const bankAccounts = [];
    const liquidAssets = {};
    let totalCash = 0;

    data.forEach(row => {
      if (row['Account Type'] === 'Bank') {
        const balance = toNum(row['Balance']);
        bankAccounts.push({
          account: row['Account Name'],
          balance: balance,
          type: row['Account Subtype'] || 'operating'
        });
        totalCash += balance;
      } else if (row['Account Type'] === 'Liquid Asset') {
        liquidAssets[row['Account Name']] = toNum(row['Balance']);
      }
    });

    return {
      bankAccounts,
      liquidAssets,
      totalCash,
      totalLiquid: totalCash + Object.values(liquidAssets).reduce((a, b) => a + b, 0)
    };
  } catch (err) {
    console.error('Error parsing cashflow data:', err);
    return {
      bankAccounts: [],
      liquidAssets: {},
      totalCash: 0,
      error: err.message
    };
  }
};

// Parse Financial data
const parseFinancialData = (csvText) => {
  try {
    const data = parseGenericCSV(csvText);
    
    // Transform to expected financial structure
    const incomeStatement = {};
    const balanceSheet = {};
    const metrics = {};

    data.forEach(row => {
      const category = row['Category'] || '';
      const account = row['Account'] || '';
      const value = toNum(row['Value']);

      if (category === 'Income Statement') {
        incomeStatement[account] = value;
      } else if (category === 'Balance Sheet') {
        balanceSheet[account] = value;
      } else if (category === 'Metrics') {
        metrics[account] = value;
      }
    });

    return {
      incomeStatement,
      balanceSheet,
      metrics,
      rawData: data
    };
  } catch (err) {
    console.error('Error parsing financial data:', err);
    return {
      incomeStatement: {},
      balanceSheet: {},
      metrics: {},
      error: err.message
    };
  }
};

// Generic CSV parser
const parseGenericCSV = (csvText) => {
  try {
    const rows = [];
    let i = 0, field = '', inQuotes = false, row = [];
    
    while (i < csvText.length) {
      const char = csvText[i];
      
      if (char === '"') {
        if (inQuotes && csvText[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(field.trim());
        field = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (field.length || row.length) {
          row.push(field.trim());
          rows.push(row);
          row = [];
          field = '';
        }
      } else {
        field += char;
      }
      i += 1;
    }
    if (field.length || row.length) {
      row.push(field.trim());
      rows.push(row);
    }

    if (rows.length < 1) return [];

    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    return data;
  } catch (err) {
    console.error('Error parsing generic CSV:', err);
    return [];
  }
};

// Export individual parsers for testing
export {
  parseWIPData,
  parseARData,
  parseCashflowData,
  parseFinancialData,
  parseGenericCSV,
  calculateWIPMetrics
};
