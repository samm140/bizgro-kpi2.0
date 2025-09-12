cat > src/components/Authentication.jsx << 'EOF'
import React, { useState, useEffect } from 'react';

// Authentication Context
export const AuthContext = React.createContext(null);

// Mock authentication service
const authService = {
  users: JSON.parse(localStorage.getItem('bizgro_users') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('bizgro_current_user') || 'null'),
  
  register: function(email, password, name, role = 'user') {
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: Date.now().toString(),
      email,
      password: btoa(password),
      name,
      role,
      createdAt: new Date().toISOString()
    };
    
    this.users.push(newUser);
    localStorage.setItem('bizgro_users', JSON.stringify(this.users));
    return { ...newUser, password: undefined };
  },
  
  login: function(email, password) {
    const user = this.users.find(u => u.email === email && u.password === btoa(password));
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const sessionUser = { ...user, password: undefined };
    this.currentUser = sessionUser;
    localStorage.setItem('bizgro_current_user', JSON.stringify(sessionUser));
    return sessionUser;
  },
  
  logout: function() {
    this.currentUser = null;
    localStorage.removeItem('bizgro_current_user');
  },
  
  getCurrentUser: function() {
    return this.currentUser;
  }
};

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const user = authService.login(email, password);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, name, role) => {
    try {
      const user = authService.register(email, password, name, role);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Login Form Component
export function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState('');

  const { login, register } = React.useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (showRegister) {
      if (!name || !email || !password) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      const result = await register(email, password, name, 'user');
      if (result.success) {
        const loginResult = await login(email, password);
        if (loginResult.success) {
          onSuccess();
        } else {
          setError(loginResult.error);
        }
      } else {
        setError(result.error);
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-biz-darker px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-db-tan to-db-brown rounded-2xl mb-4">
              <span className="text-3xl font-bold text-slate-900">DB</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-100">DiamondBack Financial</h2>
            <p className="text-gray-400 mt-2">
              {showRegister ? 'Create your account' : 'Sign in to continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {showRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:border-biz-primary"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:border-biz-primary"
                placeholder="john@diamondback.com"
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
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:border-biz-primary"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-biz-primary hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : (showRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {showRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setShowRegister(!showRegister);
                  setError('');
                }}
                className="text-biz-primary hover:text-blue-400 font-medium"
              >
                {showRegister ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {!showRegister && (
            <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Demo Credentials:</p>
              <p className="text-xs text-gray-400">Email: demo@diamondback.com</p>
              <p className="text-xs text-gray-400">Password: demo123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// User Profile Component
export function UserProfile() {
  const { user, logout } = React.useContext(AuthContext);
  
  if (!user) return null;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-gray-400">Name</p>
        <p className="text-gray-200">{user.name}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400">Email</p>
        <p className="text-gray-200">{user.email}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400">Role</p>
        <p className="text-gray-200 capitalize">{user.role}</p>
      </div>
      <button
        onClick={logout}
        className="px-4 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-400 rounded transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}

// Initialize demo user
if (!localStorage.getItem('bizgro_users')) {
  authService.register('demo@diamondback.com', 'demo123', 'Demo User', 'admin');
}
EOF
