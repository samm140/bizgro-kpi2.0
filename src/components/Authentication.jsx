// src/components/Authentication.jsx
// Fixed Authentication Component with Working Demo Login

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import config from '../config';

// Initialize demo user immediately
const DEMO_USER = {
  id: 'demo-001',
  email: 'demo@bizgropartners.com',
  password: 'kpi2024',
  name: 'Demo User',
  role: 'Administrator',
  createdAt: new Date().toISOString()
};

// Ensure demo user exists in localStorage
const initializeDemoUser = () => {
  const storageKey = 'kpi2_users';
  let users = [];
  
  try {
    const existingUsers = localStorage.getItem(storageKey);
    if (existingUsers) {
      users = JSON.parse(existingUsers);
    }
  } catch (e) {
    console.error('Error parsing users:', e);
  }
  
  // Check if demo user already exists
  const demoExists = users.some(u => u.email === DEMO_USER.email);
  
  if (!demoExists) {
    users.push(DEMO_USER);
    localStorage.setItem(storageKey, JSON.stringify(users));
    console.log('Demo user created:', DEMO_USER.email);
  }
  
  return users;
};

// Initialize on load
const initialUsers = initializeDemoUser();

// Auth Context
const AuthContext = createContext(null);

// Auth Service
const authService = {
  users: initialUsers,
  
  login: function(email, password) {
    console.log('Login attempt:', { email, password });
    
    // Always refresh users from localStorage
    this.users = JSON.parse(localStorage.getItem('kpi2_users') || '[]');
    
    // Check for user
    const user = this.users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Store current user
    localStorage.setItem('kpi2_current_user', JSON.stringify(user));
    console.log('Login successful:', user);
    return user;
  },
  
  logout: function() {
    localStorage.removeItem('kpi2_current_user');
    console.log('User logged out');
  },
  
  getCurrentUser: function() {
    try {
      const userStr = localStorage.getItem('kpi2_current_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error getting current user:', e);
      return null;
    }
  },
  
  register: function(email, password, name) {
    this.users = JSON.parse(localStorage.getItem('kpi2_users') || '[]');
    
    if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists');
    }
    
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role: 'User',
      createdAt: new Date().toISOString()
    };
    
    this.users.push(newUser);
    localStorage.setItem('kpi2_users', JSON.stringify(this.users));
    console.log('User registered:', newUser);
    return newUser;
  }
};

// Login Form Component
export const LoginForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('demo@bizgropartners.com');
  const [password, setPassword] = useState('kpi2024');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      let user;
      
      if (isRegistering) {
        if (!name.trim()) {
          throw new Error('Please enter your name');
        }
        user = authService.register(email, password, name);
        user = authService.login(email, password);
      } else {
        user = authService.login(email, password);
      }
      
      // Small delay to show loading state
      setTimeout(() => {
        setIsLoading(false);
        if (onSuccess) {
          onSuccess(user);
        } else {
          // Fallback: reload the page if onSuccess is not provided
          window.location.reload();
        }
      }, 500);
      
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-[#0a0e1a] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur rounded-xl shadow-2xl border border-slate-700 p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/bizgro-kpi2.0-logo.png" 
                alt="BizGro KPI 2.0" 
                className="h-16 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="text-3xl font-bold">
                      <span style="color: #3b82f6;">Biz</span><span style="color: #10b981;">Gro</span>
                      <span class="text-sm text-gray-400 ml-2">KPI 2.0</span>
                    </div>
                  `;
                }}
              />
            </div>
            <h2 className="text-2xl font-bold text-white">KPI 2.0 Financial System</h2>
            <p className="text-gray-400 text-sm mt-2">
              {isRegistering ? 'Create your account' : 'Sign in to access your dashboard'}
            </p>
          </div>

          {/* Demo Account Notice */}
          {!isRegistering && (
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
              <p className="text-sm text-blue-400 text-center font-medium">
                Demo Account Available
              </p>
              <p className="text-xs text-blue-300 text-center mt-1">
                Email: demo@bizgropartners.com<br/>
                Password: kpi2024
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="John Doe"
                  required={isRegistering}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                if (!isRegistering) {
                  setEmail('');
                  setPassword('');
                } else {
                  setEmail('demo@bizgropartners.com');
                  setPassword('kpi2024');
                }
              }}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-500">
          © 2025 BizGro Partners, Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
};

// User Profile Component
export const UserProfile = () => {
  const { user, logout } = useContext(AuthContext);
  
  if (!user) return null;
  
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-200">{user.name}</p>
        <p className="text-xs text-gray-400">{user.email}</p>
        <p className="text-xs text-gray-500 mt-1">Role: {user.role}</p>
      </div>
    </div>
  );
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!authService.getCurrentUser());

  const login = useCallback((email, password) => {
    const loggedInUser = authService.login(email, password);
    setUser(loggedInUser);
    setIsAuthenticated(true);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext, LoginForm, UserProfile, KPI2Logo, useAuth };
