// src/services/googleAuth.js
// Google OAuth Service for KPI 2.0 System

import config from '../config';

/**
 * Google OAuth Service
 * Handles authentication with Google OAuth 2.0
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project or select existing
 * 3. Enable Google+ API
 * 4. Create OAuth 2.0 credentials
 * 5. Add authorized JavaScript origins (your domain)
 * 6. Add authorized redirect URIs
 * 7. Copy Client ID and add to .env file as REACT_APP_GOOGLE_CLIENT_ID
 */

class GoogleAuthService {
  constructor() {
    this.isInitialized = false;
    this.auth2 = null;
    this.mockMode = true; // SET TO FALSE WHEN YOU HAVE REAL CREDENTIALS
    
    // Mock user for development - Remove in production
    this.mockUser = {
      id: '123456789',
      email: 'john.smith@bizgropartners.com',
      name: 'John Smith',
      picture: 'https://ui-avatars.com/api/?name=John+Smith&background=00d4ff&color=fff',
      given_name: 'John',
      family_name: 'Smith',
      locale: 'en',
      verified_email: true,
      provider: 'google'
    };
  }

  /**
   * Initialize Google OAuth
   * Loads the Google API script and initializes auth2
   */
  async init() {
    // MOCK MODE - Remove when implementing real OAuth
    if (this.mockMode) {
      console.log('🔐 Google OAuth in MOCK mode - Set mockMode to false when ready');
      this.isInitialized = true;
      return Promise.resolve();
    }

    /* UNCOMMENT WHEN READY TO USE REAL GOOGLE OAUTH
    return new Promise((resolve, reject) => {
      // Load Google API script
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/platform.js';
      script.onload = () => {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: config.auth.google.clientId,
            cookiepolicy: 'single_host_origin',
            scope: 'profile email',
            hosted_domain: config.auth.google.allowedDomains[0] // Restrict to company domain
          }).then((auth2) => {
            this.auth2 = auth2;
            this.isInitialized = true;
            console.log('✅ Google OAuth initialized');
            resolve();
          }).catch((error) => {
            console.error('❌ Google OAuth initialization failed:', error);
            reject(error);
          });
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
    */
  }

  /**
   * Sign in with Google
   * Opens Google sign-in popup and returns user data
   */
  async signIn() {
    // MOCK MODE - Remove when implementing real OAuth
    if (this.mockMode) {
      console.log('🔐 Mock Google Sign-In');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store mock user in localStorage
      const userData = {
        ...this.mockUser,
        token: 'mock-jwt-token-' + Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      
      localStorage.setItem(config.auth.session.storagePrefix + 'user', JSON.stringify(userData));
      localStorage.setItem(config.auth.session.storagePrefix + 'token', userData.token);
      
      return userData;
    }

    /* UNCOMMENT WHEN READY TO USE REAL GOOGLE OAUTH
    if (!this.isInitialized) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      this.auth2.signIn().then((googleUser) => {
        const profile = googleUser.getBasicProfile();
        const authResponse = googleUser.getAuthResponse();
        
        const userData = {
          id: profile.getId(),
          email: profile.getEmail(),
          name: profile.getName(),
          picture: profile.getImageUrl(),
          given_name: profile.getGivenName(),
          family_name: profile.getFamilyName(),
          token: authResponse.id_token,
          expiresAt: authResponse.expires_at,
          provider: 'google'
        };

        // Validate domain
        const emailDomain = userData.email.split('@')[1];
        if (!config.auth.google.allowedDomains.includes(emailDomain)) {
          reject(new Error(config.errors.auth.domainNotAllowed));
          return;
        }

        // Store user data
        localStorage.setItem(config.auth.session.storagePrefix + 'user', JSON.stringify(userData));
        localStorage.setItem(config.auth.session.storagePrefix + 'token', userData.token);
        
        console.log('✅ Google Sign-In successful');
        resolve(userData);
      }).catch((error) => {
        console.error('❌ Google Sign-In failed:', error);
        reject(error);
      });
    });
    */
  }

  /**
   * Sign out from Google
   * Clears session and revokes Google authentication
   */
  async signOut() {
    // Clear localStorage
    localStorage.removeItem(config.auth.session.storagePrefix + 'user');
    localStorage.removeItem(config.auth.session.storagePrefix + 'token');
    
    // MOCK MODE
    if (this.mockMode) {
      console.log('🔐 Mock Google Sign-Out');
      return Promise.resolve();
    }

    /* UNCOMMENT WHEN READY TO USE REAL GOOGLE OAUTH
    if (this.auth2) {
      await this.auth2.signOut();
      console.log('✅ Google Sign-Out successful');
    }
    */
  }

  /**
   * Get current user
   * Returns the currently signed-in user or null
   */
  getCurrentUser() {
    const userString = localStorage.getItem(config.auth.session.storagePrefix + 'user');
    if (!userString) return null;

    try {
      const user = JSON.parse(userString);
      
      // Check if token is expired
      if (user.expiresAt && user.expiresAt < Date.now()) {
        this.signOut();
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Check if user is signed in
   */
  isSignedIn() {
    return this.getCurrentUser() !== null;
  }

  /**
   * Refresh token
   * Refreshes the Google OAuth token before expiry
   */
  async refreshToken() {
    // MOCK MODE
    if (this.mockMode) {
      console.log('🔐 Mock token refresh');
      const user = this.getCurrentUser();
      if (user) {
        user.expiresAt = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem(config.auth.session.storagePrefix + 'user', JSON.stringify(user));
      }
      return Promise.resolve();
    }

    /* UNCOMMENT WHEN READY TO USE REAL GOOGLE OAUTH
    if (!this.auth2) return;

    const googleUser = this.auth2.currentUser.get();
    if (googleUser && googleUser.isSignedIn()) {
      try {
        const authResponse = await googleUser.reloadAuthResponse();
        
        // Update stored token
        const user = this.getCurrentUser();
        if (user) {
          user.token = authResponse.id_token;
          user.expiresAt = authResponse.expires_at;
          localStorage.setItem(config.auth.session.storagePrefix + 'user', JSON.stringify(user));
          localStorage.setItem(config.auth.session.storagePrefix + 'token', user.token);
        }
        
        console.log('✅ Token refreshed successfully');
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
        throw error;
      }
    }
    */
  }

  /**
   * Render Google Sign-In button
   * Creates a styled Google Sign-In button in the specified element
   */
  renderButton(elementId, options = {}) {
    // MOCK MODE
    if (this.mockMode) {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = `
          <button 
            onclick="window.googleAuthService.signIn()" 
            class="flex items-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-lg hover:shadow-lg transition-all"
            style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign in with Google (Demo)</span>
          </button>
        `;
      }
      return;
    }

    /* UNCOMMENT WHEN READY TO USE REAL GOOGLE OAUTH
    if (!this.isInitialized) {
      this.init().then(() => {
        this.renderButton(elementId, options);
      });
      return;
    }

    window.gapi.signin2.render(elementId, {
      scope: 'profile email',
      width: options.width || 240,
      height: options.height || 50,
      longtitle: options.longtitle || true,
      theme: options.theme || 'dark',
      onsuccess: options.onSuccess || ((googleUser) => {
        this.handleGoogleSignIn(googleUser);
      }),
      onfailure: options.onFailure || ((error) => {
        console.error('Google Sign-In failed:', error);
      })
    });
    */
  }
}

// Create singleton instance
const googleAuthService = new GoogleAuthService();

// Make it available globally for button onclick
if (typeof window !== 'undefined') {
  window.googleAuthService = googleAuthService;
}

export default googleAuthService;
