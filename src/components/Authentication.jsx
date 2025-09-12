import React, { createContext, useState, useContext, useEffect } from 'react';

// Auth Context
const AuthContext = createContext(null);

// Mock auth service - replace with real API
const authService = {
  users: JSON.parse(localStorage.getItem('kpi2_users') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('kpi2_current_user') || 'null'),
  
  register: function(email, password, name, role = 'user') {
    if (this.users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }
    const user = {
      id: Date.now().toString(),
      email,
      password, // In production, hash this
      name,
      role,
      createdAt: new Date().toISOString()
    };
    this.users.push(user);
    localStorage.setItem('kpi2_users', JSON.stringify(this.users));
    return user;
  },
  
  login: function(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    this.currentUser = user;
    localStorage.setItem('kpi2_current_user', JSON.stringify(user));
    return user;
  },
  
  loginWithGoogle: function(googleUser) {
    // In production, verify the Google token with your backend
    let user = this.users.find(u => u.email === googleUser.email);
    if (!user) {
      user = {
        id: Date.now().toString(),
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        role: 'user',
        provider: 'google',
        createdAt: new Date().toISOString()
      };
      this.users.push(user);
      localStorage.setItem('kpi2_users', JSON.stringify(this.users));
    }
    this.currentUser = user;
    localStorage.setItem('kpi2_current_user', JSON.stringify(user));
    return user;
  },
  
  logout: function() {
    this.currentUser = null;
    localStorage.removeItem('kpi2_current_user');
  },
  
  getCurrentUser: function() {
    return this.currentUser;
  }
};

// Initialize demo user for KPI-2.0
if (!localStorage.getItem('kpi2_users')) {
  authService.register('demo@bizgropartners.com', 'kpi2024', 'Demo User', 'admin');
}

// Logo Component
const KPI2Logo = ({ size = 'normal' }) => {
  const sizeClasses = {
    small: 'h-8 w-auto',
    normal: 'h-12 w-auto',
    large: 'h-20 w-auto'
  };
  
  return (
    <div className={`${sizeClasses[size]} flex items-center`}>
      {/* If you have a logo image, replace this with: */}
      {/* <img src="/path-to-your-logo.png" alt="KPI-2.0" className={sizeClasses[size]} /> */}
      
      {/* For now, using a styled text logo */}
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-2 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <div className="text-xl font-bold text-gray-100">KPI-2.0</div>
          <div className="text-xs text-gray-400">Financial System</div>
        </div>
      </div>
    </div>
  );
};

// Google OAuth Button Component
const GoogleSignInButton = ({ onSuccess }) => {
  useEffect(() => {
    // Load Google Sign-In API
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          // Replace with your actual Google Client ID
          client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { 
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          }
        );
      }
    };
    
    return () => {
      const scriptTag = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (scriptTag) scriptTag.remove();
    };
  }, []);
  
  const handleGoogleResponse = (response) => {
    // Decode the JWT token
    const userData = JSON.parse(atob(response.credential.split('.')[1]));
    const googleUser = {
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      id: userData.sub
    };
    
    // Only allow bizgropartners.com domain
    if (googleUser.email.endsWith('@bizgropartners.com')) {
      authService.loginWithGoogle(googleUser);
      onSuccess(googleUser);
    } else {
      alert('Please use your @bizgropartners.com email address');
    }
  };
  
  return (
    <div>
      <div id="google-signin-button" className="w-full"></div>
      {/* Fallback button if Google API fails to load */}
      <button
        onClick={() => alert('Google Sign-In is being configured. Please use email/password for now.')}
        className="w-full mt-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
    </div>
  );
};

// Login Form Component
const LoginForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegistering) {
        if (!email.endsWith('@bizgropartners.com')) {
          setError('Please use a @bizgropartners.com email address');
          return;
        }
        authService.register(email, password, name);
        authService.login(email, password);
      } else {
        authService.login(email, password);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur rounded-xl shadow-2xl border border-slate-700 p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <KPI2Logo size="xlarge" />
            </div>
            <p className="text-gray-400 text-sm mt-4">
              {isRegistering ? 'Sign up for your financial dashboard' : 'Sign in to access your dashboard'}
            </p>
          </div>

          {/* Google Sign In */}
          <div className="mb-6">
            <GoogleSignInButton onSuccess={onSuccess} />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800/50 text-gray-400">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
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
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="John Doe"
                  required
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
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="you@bizgropartners.com"
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
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
          
          {/* Demo Account Info */}
          <div className="mt-6 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-xs text-gray-400 text-center">
              Demo Account: demo@bizgropartners.com / kpi2024
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-500">
          © 2025 BizGro Partners. All rights reserved.
        </div>
      </div>
    </div>
  );
};

// User Profile Component
const UserProfile = () => {
  const { user, logout } = useContext(AuthContext);
  
  return (
    <div className="space-y-3">
      {user?.picture && (
        <div className="flex justify-center">
          <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full" />
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-gray-200">{user?.name}</p>
        <p className="text-xs text-gray-400">{user?.email}</p>
        <p className="text-xs text-gray-500 mt-1">Role: {user?.role}</p>
        {user?.provider && (
          <p className="text-xs text-gray-500">Provider: {user?.provider}</p>
        )}
      </div>
      <button
        onClick={logout}
        className="w-full px-3 py-1 bg-red-900/50 hover:bg-red-900/70 text-red-400 rounded transition-colors text-sm"
      >
        Sign Out
      </button>
    </div>
  );
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(!!authService.getCurrentUser());

  const login = (email, password) => {
    try {
      const user = authService.login(email, password);
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    window.location.reload();
  };

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

export { AuthProvider, AuthContext, LoginForm, UserProfile, KPI2Logo };
