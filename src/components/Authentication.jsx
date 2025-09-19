// src/components/Authentication.jsx
// Enhanced Authentication Component with Google OAuth

import React, { createContext, useContext, useState, useEffect } from 'react';
import googleAuthService from '../services/googleAuth';
import config from '../config';

// Auth Context
export const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize Google OAuth
        await googleAuthService.init();
        
        // Check for existing session
        const currentUser = googleAuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          
          // Set up token refresh interval
          const refreshInterval = setInterval(() => {
            googleAuthService.refreshToken();
          }, 30 * 60 * 1000); // Refresh every 30 minutes
          
          return () => clearInterval(refreshInterval);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Google Sign In
  const googleSignIn = async () => {
    try {
      setLoading(true);
      const userData = await googleAuthService.signIn();
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { 
        success: false, 
        error: error.message || config.errors.auth.googleSignInFailed 
      };
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Sign In (Demo mode)
  const emailSignIn = async (email, password) => {
    setLoading(true);
    
    // Check demo credentials
    if (config.auth.demo.enabled && 
        email === config.auth.demo.email && 
        password === config.auth.demo.password) {
      
      const demoUser = {
        id: 'demo-user',
        email: email,
        name: 'Demo User',
        picture: null,
        role: 'Administrator',
        provider: 'email'
      };
      
      // Store in localStorage
      localStorage.setItem(config.auth.session.storagePrefix + 'user', JSON.stringify(demoUser));
      
      setUser(demoUser);
      setIsAuthenticated(true);
      setLoading(false);
      
      return { success: true, user: demoUser };
    }
    
    setLoading(false);
    return { 
      success: false, 
      error: config.errors.auth.invalidCredentials 
    };
  };

  // Sign Out
  const logout = async () => {
    try {
      await googleAuthService.signOut();
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear all localStorage items with our prefix
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(config.auth.session.storagePrefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    googleSignIn,
    emailSignIn,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Login Form Component
export const LoginForm = ({ onSuccess }) => {
  const { googleSignIn, emailSignIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    const result = await googleSignIn();
    if (result.success) {
      onSuccess && onSuccess(result.user);
    } else {
      setError(result.error);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await emailSignIn(email, password);
    if (result.success) {
      onSuccess && onSuccess(result.user);
    } else {
      setError(result.error);
    }
  };

  useEffect(() => {
    // Render Google Sign-In button
    if (!loading) {
      googleAuthService.renderButton('google-signin-button');
    }
  }, [loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={`/${config.app.logo}`} 
            alt={config.app.company} 
            className="h-16 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-white">{config.app.fullName}</h2>
          <p className="text-gray-400 text-sm mt-2">Sign in to your account</p>
        </div>

        {/* Google Sign-In Button */}
        <div className="mb-6">
          <div id="google-signin-button" className="flex justify-center"></div>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-800 text-gray-400">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder={config.auth.demo.enabled ? config.auth.demo.email : "your@bizgropartners.com"}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder={config.auth.demo.enabled ? "Demo: " + config.auth.demo.password : "••••••••"}
              required
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-500"
                defaultChecked={config.auth.session.rememberMe}
              />
              <span className="ml-2 text-sm text-gray-400">Remember me</span>
            </label>
            <a href="#" className="text-sm text-cyan-500 hover:text-cyan-400">
              Forgot password?
            </a>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        {/* Demo Mode Notice */}
        {config.auth.demo.enabled && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-900/50 rounded-lg">
            <p className="text-blue-400 text-sm text-center">
              <strong>Demo Mode:</strong> Use {config.auth.demo.email} / {config.auth.demo.password}
            </p>
          </div>
        )}

        {/* Sign Up Link */}
        <p className="text-center text-gray-400 text-sm mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-cyan-500 hover:text-cyan-400 font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          {config.app.copyright}
        </p>
      </div>
    </div>
  );
};

// User Profile Component
export const UserProfile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-4">
      <div className="flex items-center space-x-3">
        {user.picture ? (
          <img 
            src={user.picture} 
            alt={user.name} 
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold">
            {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-white">{user.name || 'User'}</p>
          <p className="text-xs text-gray-400">{user.email}</p>
          {user.provider && (
            <p className="text-xs text-cyan-500">via {user.provider}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default {
  AuthProvider,
  AuthContext,
  useAuth,
  LoginForm,
  UserProfile
};
