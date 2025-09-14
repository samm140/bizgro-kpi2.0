// src/services/environment.js
// Environment detection and configuration service for GitHub Pages compatibility

class EnvironmentService {
  constructor() {
    this.backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this._isGitHubPages = null;
    this._backendAvailable = null;
  }

  /**
   * Check if the app is running on GitHub Pages
   * @returns {boolean}
   */
  isGitHubPages() {
    // Cache the result
    if (this._isGitHubPages !== null) {
      return this._isGitHubPages;
    }

    // Check various indicators that we're on GitHub Pages
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname;
    
    this._isGitHubPages = (
      // GitHub Pages domain patterns
      hostname.includes('.github.io') ||
      // Custom domain with github pages (check for common patterns)
      (hostname.includes('github') && hostname.includes('pages')) ||
      // Check if we're serving from a subdirectory (common in GitHub Pages)
      (pathname.includes('/bizgro-kpi') && hostname !== 'localhost') ||
      // Environment variable override
      import.meta.env.VITE_GITHUB_PAGES === 'true'
    );

    return this._isGitHubPages;
  }

  /**
   * Check if we're in development mode
   * @returns {boolean}
   */
  isDevelopment() {
    return (
      import.meta.env.MODE === 'development' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );
  }

  /**
   * Check if we're in production mode
   * @returns {boolean}
   */
  isProduction() {
    return import.meta.env.MODE === 'production' && !this.isGitHubPages();
  }

  /**
   * Get the appropriate API base URL
   * @returns {string}
   */
  getApiUrl() {
    // If on GitHub Pages, return null (no backend)
    if (this.isGitHubPages()) {
      return null;
    }
    
    // Use environment variable or default
    return this.backendUrl;
  }

  /**
   * Check if backend connection is available
   * @returns {Promise<boolean>}
   */
  async checkBackendConnection() {
    // If we already know we're on GitHub Pages, skip the check
    if (this.isGitHubPages()) {
      this._backendAvailable = false;
      return false;
    }

    // If we've already checked, return cached result
    if (this._backendAvailable !== null) {
      return this._backendAvailable;
    }

    try {
      // Try to ping the backend health endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${this.backendUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
      });
      
      clearTimeout(timeoutId);
      
      this._backendAvailable = response.ok;
      return this._backendAvailable;
    } catch (error) {
      console.log('Backend connection check failed:', error.message);
      this._backendAvailable = false;
      return false;
    }
  }

  /**
   * Get storage prefix based on environment
   * @returns {string}
   */
  getStoragePrefix() {
    if (this.isGitHubPages()) {
      return 'bizgro_demo_';
    }
    return 'bizgro_';
  }

  /**
   * Check if a feature should be enabled
   * @param {string} feature - Feature name
   * @returns {boolean}
   */
  isFeatureEnabled(feature) {
    const backendRequiredFeatures = [
      'qbo_sync',
      'google_sheets',
      'email_reports',
      'data_export_api',
      'real_time_sync'
    ];

    // If feature requires backend and we're on GitHub Pages, disable it
    if (backendRequiredFeatures.includes(feature) && this.isGitHubPages()) {
      return false;
    }

    // Check environment variables for feature flags
    const envFlag = `VITE_FEATURE_${feature.toUpperCase()}`;
    if (import.meta.env[envFlag] !== undefined) {
      return import.meta.env[envFlag] === 'true';
    }

    // Default to enabled for non-backend features
    return !backendRequiredFeatures.includes(feature);
  }

  /**
   * Get environment info for debugging
   * @returns {object}
   */
  getEnvironmentInfo() {
    return {
      mode: import.meta.env.MODE,
      isGitHubPages: this.isGitHubPages(),
      isDevelopment: this.isDevelopment(),
      isProduction: this.isProduction(),
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      apiUrl: this.getApiUrl(),
      backendAvailable: this._backendAvailable,
      features: {
        qbo_sync: this.isFeatureEnabled('qbo_sync'),
        google_sheets: this.isFeatureEnabled('google_sheets'),
        email_reports: this.isFeatureEnabled('email_reports'),
      }
    };
  }

  /**
   * Log environment information (for debugging)
   */
  logEnvironment() {
    const info = this.getEnvironmentInfo();
    console.group('🌍 Environment Configuration');
    console.log('Mode:', info.mode);
    console.log('GitHub Pages:', info.isGitHubPages);
    console.log('Development:', info.isDevelopment);
    console.log('Production:', info.isProduction);
    console.log('API URL:', info.apiUrl || 'Not available');
    console.log('Backend Available:', info.backendAvailable ?? 'Not checked');
    console.log('Features:', info.features);
    console.groupEnd();
  }
}

// Create and export a singleton instance
const environment = new EnvironmentService();

// Log environment on initialization (can be disabled in production)
if (import.meta.env.MODE === 'development') {
  environment.logEnvironment();
}

export default environment;
