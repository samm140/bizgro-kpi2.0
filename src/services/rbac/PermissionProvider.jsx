// src/services/rbac/PermissionProvider.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PermissionManager } from './roleDefinitions';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    // Load user and permissions from storage or API
    const loadUserPermissions = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.role) {
        const pm = new PermissionManager(storedUser.role, storedUser.customPermissions);
        setUser(storedUser);
        setPermissions(pm);
      }
    };
    loadUserPermissions();
  }, []);

  const updateUserRole = (newRole) => {
    const updatedUser = { ...user, role: newRole };
    const pm = new PermissionManager(newRole);
    setUser(updatedUser);
    setPermissions(pm);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <PermissionContext.Provider value={{ user, permissions, updateUserRole }}>
      {children}
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
