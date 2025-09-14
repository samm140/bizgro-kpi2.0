// services/environment.js - Environment Detection and Feature Flags

export const environment = {
  // Detect if running on GitHub Pages or locally
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  isGitHubPages: window.location.hostname.includes('github.io'),
  
  // API URLs
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // Feature flags
  features: {
    // QBO features only work in local development with backend running
    qboIntegration: import.meta.env.DEV && !window.location.hostname.includes('github.io'),
    googleSheets: true,  // This can work on GitHub Pages
    dataExport: true,    // This works on GitHub Pages
    authentication: true, // Local storage auth works on GitHub Pages
  },
  
  // Get feature status
  isFeatureEnabled(feature) {
    return this.features[feature] || false;
  },
  
  // Check if backend is available
  async checkBackendConnection() {
    if (this.isGitHubPages) {
      return false;
    }
    
    try {
      const response = await fetch('/api/health', { 
        method: 'GET',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      console.log('Backend not available - QBO features disabled');
      return false;
    }
  }
};

export default environment;
