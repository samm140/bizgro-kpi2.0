// src/components/RoleSelector.jsx
// Temporary component for testing different roles

import React from 'react';
import { usePermissions } from '../services/rbac/PermissionProvider';
import { ROLES } from '../services/rbac/roleDefinitions';

const RoleSelector = () => {
  const { user, updateUserRole } = usePermissions();

  const handleRoleChange = (newRole) => {
    // Update the user in localStorage with new role
    const updatedUser = {
      ...user,
      role: newRole
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    updateUserRole(newRole);
    // Reload to see changes
    window.location.reload();
  };

  return (
    <div className="fixed top-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg z-50">
      <label className="text-white text-sm mb-2 block">Test Role Switcher:</label>
      <select 
        value={user?.role || ''} 
        onChange={(e) => handleRoleChange(e.target.value)}
        className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
      >
        <option value="">Select Role</option>
        {Object.values(ROLES).map(role => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>
      <p className="text-xs text-gray-400 mt-2">Current: {user?.role || 'None'}</p>
    </div>
  );
};

export default RoleSelector;
