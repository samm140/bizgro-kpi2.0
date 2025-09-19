import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Production OAuth Configuration - Uncomment when ready to use
/*
// Google OAuth Configuration
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = window.location.origin + '/auth/google/callback';
const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${GOOGLE_CLIENT_ID}&` +
  `redirect_uri=${GOOGLE_REDIRECT_URI}&` +
  `response_type=code&` +
  `scope=openid profile email&` +
  `access_type=offline&` +
  `prompt=consent`;

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.bizgro.io';

// API Functions
const loginWithGoogle = async (authCode) => {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: authCode }),
  });
  
  if (!response.ok) {
    throw new Error('Google authentication failed');
  }
  
  return response.json();
};

const loginWithCredentials = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    throw new Error('Invalid credentials');
  }
  
  return response.json();
};
*/

const Authentication = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Production API call - uncomment when API is ready
      /*
      const userData = await loginWithCredentials(email, password);
      
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(userData.user));
        localStorage.setItem('token', userData.token);
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        sessionStorage.setItem('user', JSON.stringify(userData.user));
        sessionStorage.setItem('token', userData.token);
        sessionStorage.setItem('isAuthenticated', 'true');
      }
      
      if (onSuccess) {
        onSuccess(userData.user);
      } else {
        window.location.href = '/';
      }
      */
      
      // Demo mode - remove when API is ready
      setTimeout(() => {
        if (email === 'demo@bizgro.io' && password === 'demo123') {
          const user = {
            email: 'demo@bizgro.io',
            name: 'Demo User',
            role: 'admin',
            provider: 'credentials'
          };
          
          if (rememberMe) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('isAuthenticated', 'true');
          } else {
            sessionStorage.setItem('user', JSON.stringify(user));
            sessionStorage.setItem('isAuthenticated', 'true');
          }
          
          if (onSuccess) {
            onSuccess(user);
          } else {
            window.location.href = '/';
          }
        } else {
          setError('Invalid email or password');
          setIsLoading(false);
        }
      }, 1000);
    } catch (err) {
      setError(err.message || 'An error occurred during login');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Production Google OAuth - uncomment when configured
      /*
      // Option 1: Redirect to Google OAuth
      window.location.href = GOOGLE_AUTH_URL;
      
      // Option 2: Use Google Sign-In JavaScript API
      const auth2 = window.gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn();
      const profile = googleUser.getBasicProfile();
      const authResponse = googleUser.getAuthResponse();
      
      const userData = await loginWithGoogle(authResponse.code);
      
      localStorage.setItem('user', JSON.stringify({
        ...userData.user,
        picture: profile.getImageUrl(),
        provider: 'google'
      }));
      localStorage.setItem('token', userData.token);
      localStorage.setItem('isAuthenticated', 'true');
      
      if (onSuccess) {
        onSuccess(userData.user);
      } else {
        window.location.href = '/';
      }
      */
      
      // Demo mode - simulating Google OAuth
      setTimeout(() => {
        const googleUser = {
          email: 'user@gmail.com',
          name: 'Google User',
          role: 'user',
          provider: 'google',
          // In production, this would come from Google
          picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
        };
        
        localStorage.setItem('user', JSON.stringify(googleUser));
        localStorage.setItem('isAuthenticated', 'true');
        
        if (onSuccess) {
          onSuccess(googleUser);
        } else {
          window.location.href = '/';
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@bizgro.io');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <img 
              src="bizgro-cube.png" 
              alt="BizGro Logo"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                `;
              }}
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-white mb-2">
          KPI 2.0 Financial System
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Sign in to access your dashboard
        </p>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800/50 text-gray-400">Or continue with</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors pr-12"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-300">Remember me</span>
            </label>
            <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        {/* Use Demo Credentials Button */}
        <button
          onClick={fillDemoCredentials}
          disabled={isLoading}
          className="w-full mt-4 bg-gray-700/50 text-gray-300 py-2 px-4 rounded-lg font-medium hover:bg-gray-700 hover:text-white transition-colors duration-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Use Demo Credentials
        </button>
      </div>
    </div>
  );
};

export default Authentication;
