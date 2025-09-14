// QuickBooks Online API Service
import axios from 'axios';

const QBO_BASE_URL = process.env.REACT_APP_QBO_API_URL || 'https://api.intuit.com';
const COMPANY_ID = process.env.REACT_APP_QBO_COMPANY_ID;

class QBOApiService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.realmId = null;
  }

  // OAuth 2.0 Authentication
  async authenticate() {
    try {
      const response = await axios.post('/api/qbo/auth', {
        client_id: process.env.REACT_APP_QBO_CLIENT_ID,
        client_secret: process.env.REACT_APP_QBO_CLIENT_SECRET,
        redirect_uri: process.env.REACT_APP_QBO_REDIRECT_URI,
        grant_type: 'authorization_code'
      });
      
      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.realmId = response.data.realmId;
      
      return response.data;
    } catch (error) {
      console.error('QBO Authentication failed:', error);
      throw error;
    }
  }

  // Refresh Access Token
  async refreshAccessToken() {
    try {
      const response = await axios.post('/api/qbo/refresh', {
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token'
      });
      
      this.accessToken = response.data.access_token;
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  // Get Accounts
  async getAccounts() {
    const url = `${QBO_BASE_URL}/v3/company/${this.realmId}/query`;
    const query = "SELECT * FROM Account WHERE Active = true";
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        },
        params: { query }
      });
      
      return response.data.QueryResponse.Account;
    } catch (error) {
      if (error.response?.status === 401) {
        await this.refreshAccessToken();
        return this.getAccounts();
      }
      throw error;
    }
  }

  // Get Profit & Loss Report
  async getProfitAndLoss(startDate, endDate) {
    const url = `${QBO_BASE_URL}/v3/company/${this.realmId}/reports/ProfitAndLoss`;
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        },
        params: {
          start_date: startDate,
          end_date: endDate,
          summarize_column_by: 'Total'
        }
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await this.refreshAccessToken();
        return this.getProfitAndLoss(startDate, endDate);
      }
      throw error;
    }
  }

  // Get AR Aging Report
  async getARAgingReport() {
    const url = `${QBO_BASE_URL}/v3/company/${this.realmId}/reports/AgedReceivables`;
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await this.refreshAccessToken();
        return this.getARAgingReport();
      }
      throw error;
    }
  }

  // Get Customers (Jobs)
  async getCustomers() {
    const url = `${QBO_BASE_URL}/v3/company/${this.realmId}/query`;
    const query = "SELECT * FROM Customer WHERE Active = true";
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        },
        params: { query }
      });
      
      return response.data.QueryResponse.Customer;
    } catch (error) {
      if (error.response?.status === 401) {
        await this.refreshAccessToken();
        return this.getCustomers();
      }
      throw error;
    }
  }

  // Get Vendors (Contractors)
  async getVendors() {
    const url = `${QBO_BASE_URL}/v3/company/${this.realmId}/query`;
    const query = "SELECT * FROM Vendor WHERE Active = true AND Vendor1099 = true";
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        },
        params: { query }
      });
      
      return response.data.QueryResponse.Vendor;
    } catch (error) {
      if (error.response?.status === 401) {
        await this.refreshAccessToken();
        return this.getVendors();
      }
      throw error;
    }
  }

  // Get Invoices
  async getInvoices(startDate, endDate) {
    const url = `${QBO_BASE_URL}/v3/company/${this.realmId}/query`;
    const query = `SELECT * FROM Invoice WHERE TxnDate >= '${startDate}' AND TxnDate <= '${endDate}'`;
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        },
        params: { query }
      });
      
      return response.data.QueryResponse.Invoice;
    } catch (error) {
      if (error.response?.status === 401) {
        await this.refreshAccessToken();
        return this.getInvoices(startDate, endDate);
      }
      throw error;
    }
  }

  // Get Estimates (for Backlog)
  async getEstimates() {
    const url = `${QBO_BASE_URL}/v3/company/${this.realmId}/query`;
    const query = "SELECT * FROM Estimate WHERE Active = true";
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        },
        params: { query }
      });
      
      return response.data.QueryResponse.Estimate;
    } catch (error) {
      if (error.response?.status === 401) {
        await this.refreshAccessToken();
        return this.getEstimates();
      }
      throw error;
    }
  }
}

export default new QBOApiService();
