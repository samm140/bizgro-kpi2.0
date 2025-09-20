// src/services/rbac/PermissionProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PermissionManager, MODULES } from './roleDefinitions';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserPermissions = async () => {
      try {
        let storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        // ALWAYS ensure admin for development
        const adminUser = {
          name: storedUser.name || 'Demo Admin',
          role: 'Admin', // Force Admin role
          email: storedUser.email || 'admin@bizgropartners.com'
        };
        
        // Override any stored user with admin privileges
        localStorage.setItem('user', JSON.stringify(adminUser));
        const pm = new PermissionManager('Admin'); // Always use Admin role
        setUser(adminUser);
        setPermissions(pm);
        
      } catch (error) {
        console.error('Error loading user permissions:', error);
        // Set default admin on error
        const adminUser = {
          name: 'Demo Admin',
          role: 'Admin',
          email: 'admin@bizgropartners.com'
        };
        const pm = new PermissionManager('Admin');
        setUser(adminUser);
        setPermissions(pm);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserPermissions();
    
    // Re-check every 5 seconds to prevent Google User override
    const interval = setInterval(() => {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.name === 'Google User' || currentUser.role !== 'Admin') {
        const adminUser = {
          name: 'Demo Admin',
          role: 'Admin',
          email: 'admin@bizgropartners.com'
        };
        localStorage.setItem('user', JSON.stringify(adminUser));
        const pm = new PermissionManager('Admin');
        setUser(adminUser);
        setPermissions(pm);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const updateUserRole = (newRole) => {
    // For testing different roles - but default back to Admin
    const updatedUser = { ...user, role: newRole || 'Admin' };
    const pm = new PermissionManager(newRole || 'Admin');
    setUser(updatedUser);
    setPermissions(pm);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <PermissionContext.Provider value={{ user, permissions, updateUserRole, isLoading }}>
      {!isLoading ? children : <div>Loading permissions...</div>}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

// HOC for protecting components
export const withPermission = (Component, requiredModule, requiredAction = 'read') => {
  return (props) => {
    const { permissions } = usePermissions();
    
    if (!permissions || !permissions.hasPermission(requiredModule, requiredAction)) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <i className="fas fa-lock text-6xl text-red-400 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-200 mb-2">Access Denied</h2>
            <p className="text-gray-400">You don't have permission to access this feature.</p>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};
