import React, { useState, useEffect } from 'react';
import { User, Shield, Lock, Settings, Activity, Save, X, Edit2, Trash2, Plus, Check, AlertCircle } from 'lucide-react';

// Mock data - replace with API calls
const mockUsers = [
  { id: 1, name: 'John Smith', email: 'john@bizgro.com', role: 'Admin', status: 'active', lastLogin: '2025-01-10 14:23', companies: ['all'] },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@bizgro.com', role: 'Executive', status: 'active', lastLogin: '2025-01-10 09:15', companies: ['all'] },
  { id: 3, name: 'Mike Chen', email: 'mike@bizgro.com', role: 'Financial', status: 'active', lastLogin: '2025-01-09 16:45', companies: ['DiamondBack', 'BlueStone'] },
  { id: 4, name: 'Emily Davis', email: 'emily@bizgro.com', role: 'Operational', status: 'active', lastLogin: '2025-01-10 11:30', projects: ['Project Alpha', 'Project Beta'] },
  { id: 5, name: 'Tom Wilson', email: 'tom@bizgro.com', role: 'Sales', status: 'inactive', lastLogin: '2025-01-05 10:00', customers: ['Customer A', 'Customer B'] },
  { id: 6, name: 'Investment Fund LLC', email: 'contact@investfund.com', role: 'Investor', status: 'active', lastLogin: '2025-01-08 13:00', companies: ['portfolio'] }
];

const AdminConsole = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  // Role configurations
  const roles = ['Admin', 'Executive', 'Financial', 'Operational', 'Sales', 'Investor'];
  
  const roleColors = {
    Admin: 'bg-red-500',
    Executive: 'bg-purple-500',
    Financial: 'bg-green-500',
    Operational: 'bg-blue-500',
    Sales: 'bg-orange-500',
    Investor: 'bg-indigo-500'
  };

  const permissionModules = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'wip', name: 'Work in Progress', icon: '🔨' },
    { id: 'weeklyEntry', name: 'Weekly Entry', icon: '📅' },
    { id: 'reports', name: 'Reports', icon: '📈' },
    { id: 'ar', name: 'Accounts Receivable', icon: '💵' },
    { id: 'ap', name: 'Accounts Payable', icon: '💳' },
    { id: 'userMgmt', name: 'User Management', icon: '👥' }
  ];

  const permissionActions = ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Export'];

  // State for role permissions
  const [rolePermissions, setRolePermissions] = useState({
    Admin: {
      dashboard: ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Export'],
      wip: ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Export'],
      weeklyEntry: ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Export'],
      reports: ['Create', 'Read', 'Update', 'Delete', 'Export'],
      ar: ['Create', 'Read', 'Update', 'Delete', 'Approve'],
      ap: ['Create', 'Read', 'Update', 'Delete', 'Approve'],
      userMgmt: ['Create', 'Read', 'Update', 'Delete']
    },
    Executive: {
      dashboard: ['Read'],
      wip: ['Read'],
      weeklyEntry: ['Read', 'Approve'],
      reports: ['Read', 'Export'],
      ar: ['Read'],
      ap: ['Read'],
      userMgmt: []
    },
    Financial: {
      dashboard: ['Read'],
      wip: ['Read', 'Update', 'Approve'],
      weeklyEntry: ['Create', 'Read', 'Update'],
      reports: ['Create', 'Read', 'Export'],
      ar: ['Create', 'Read', 'Update', 'Delete'],
      ap: ['Create', 'Read', 'Update', 'Delete', 'Approve'],
      userMgmt: []
    },
    Operational: {
      dashboard: ['Read'],
      wip: ['Create', 'Read', 'Update'],
      weeklyEntry: ['Create', 'Read', 'Update'],
      reports: ['Read'],
      ar: ['Read'],
      ap: ['Read'],
      userMgmt: []
    },
    Sales: {
      dashboard: ['Read'],
      wip: ['Read'],
      weeklyEntry: [],
      reports: ['Read'],
      ar: [],
      ap: [],
      userMgmt: []
    },
    Investor: {
      dashboard: ['Read'],
      wip: ['Read'],
      weeklyEntry: [],
      reports: ['Read'],
      ar: [],
      ap: [],
      userMgmt: []
    }
  });

  const [selectedRole, setSelectedRole] = useState('Admin');

  const handlePermissionToggle = (role, module, action) => {
    setRolePermissions(prev => {
      const newPermissions = { ...prev };
      if (!newPermissions[role][module]) {
        newPermissions[role][module] = [];
      }
      
      const modulePerms = [...newPermissions[role][module]];
      const actionIndex = modulePerms.indexOf(action);
      
      if (actionIndex > -1) {
        modulePerms.splice(actionIndex, 1);
      } else {
        modulePerms.push(action);
      }
      
      newPermissions[role][module] = modulePerms;
      return newPermissions;
    });
  };

  const UserCard = ({ user }) => (
    <div className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition-colors cursor-pointer"
         onClick={() => setSelectedUser(user)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center mr-3">
            <User size={20} className="text-gray-300" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">{user.name}</h3>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs text-white ${roleColors[user.role]}`}>
            {user.role}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            user.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'
          }`}>
            {user.status}
          </span>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        Last login: {user.lastLogin}
      </div>
    </div>
  );

  const PermissionMatrix = ({ role }) => (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">
        Permissions for {role} Role
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-gray-400">Module</th>
              {permissionActions.map(action => (
                <th key={action} className="text-center py-3 px-4 text-gray-400 text-sm">
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionModules.map(module => (
              <tr key={module.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <span className="mr-2">{module.icon}</span>
                    <span className="text-gray-300">{module.name}</span>
                  </div>
                </td>
                {permissionActions.map(action => (
                  <td key={action} className="text-center py-3 px-4">
                    <button
                      onClick={() => handlePermissionToggle(role, module.id, action)}
                      className={`w-8 h-8 rounded-lg transition-colors ${
                        rolePermissions[role][module.id]?.includes(action)
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-slate-600 hover:bg-slate-500'
                      }`}
                      disabled={role === 'Admin'} // Admin has all permissions
                    >
                      {rolePermissions[role][module.id]?.includes(action) && (
                        <Check size={16} className="text-white mx-auto" />
                      )}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {role !== 'Admin' && (
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center">
            <Save size={16} className="mr-2" />
            Save Permissions
          </button>
        </div>
      )}
    </div>
  );

  const UserDetailPanel = ({ user, onClose }) => {
    if (!user) return null;
    
    return (
      <div className="fixed right-0 top-0 h-full w-96 bg-slate-900 shadow-2xl z-50 overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-200">User Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mr-4">
              <User size={32} className="text-gray-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200">{user.name}</h3>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Role</span>
              <span className={`px-3 py-1 rounded text-white ${roleColors[user.role]}`}>
                {user.role}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className={`px-3 py-1 rounded text-white ${
                user.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
              }`}>
                {user.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Login</span>
              <span className="text-gray-300">{user.lastLogin}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Access Scope</h3>
          <div className="space-y-3">
            {user.companies && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Companies</p>
                <div className="flex flex-wrap gap-2">
                  {user.companies.map(company => (
                    <span key={company} className="px-3 py-1 bg-slate-700 rounded text-gray-300 text-sm">
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {user.projects && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Projects</p>
                <div className="flex flex-wrap gap-2">
                  {user.projects.map(project => (
                    <span key={project} className="px-3 py-1 bg-slate-700 rounded text-gray-300 text-sm">
                      {project}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {user.customers && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Customers</p>
                <div className="flex flex-wrap gap-2">
                  {user.customers.map(customer => (
                    <span key={customer} className="px-3 py-1 bg-slate-700 rounded text-gray-300 text-sm">
                      {customer}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-700">
          <div className="flex space-x-3">
            <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center">
              <Edit2 size={16} className="mr-2" />
              Edit User
            </button>
            <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center">
              <Trash2 size={16} className="mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <Shield className="mr-3" />
          Admin Console
        </h1>
        <p className="text-gray-400">Manage users, roles, and system permissions</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          <User size={18} className="inline mr-2" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'roles'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          <Lock size={18} className="inline mr-2" />
          Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          <Activity size={18} className="inline mr-2" />
          Audit Log
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          <Settings size={18} className="inline mr-2" />
          Settings
        </button>
      </div>

      {/* Content */}
      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search users..."
                className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg">
                <option>All Roles</option>
                {roles.map(role => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </div>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center">
              <Plus size={18} className="mr-2" />
              Add User
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {users.map(user => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div>
          <div className="mb-6">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          
          <PermissionMatrix role={selectedRole} />
          
          <div className="mt-6 bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Role Configuration</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Data Scope</label>
                <select className="w-full px-4 py-2 bg-slate-700 text-gray-300 rounded-lg">
                  <option>Global - All Data</option>
                  <option>Company - Assigned Companies</option>
                  <option>Project - Assigned Projects</option>
                  <option>Customer - Assigned Customers</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Approval Limit</label>
                <input
                  type="text"
                  placeholder="$0 for no limit"
                  className="w-full px-4 py-2 bg-slate-700 text-gray-300 rounded-lg"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Feature Access</label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center text-gray-300">
                    <input type="checkbox" className="mr-2" />
                    Sensitive Data
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="checkbox" className="mr-2" />
                    Export Rights
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="checkbox" className="mr-2" />
                    Bulk Operations
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="checkbox" className="mr-2" />
                    API Access
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="checkbox" className="mr-2" />
                    Custom Reports
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="checkbox" className="mr-2" />
                    Data Retention
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { user: 'John Smith', action: 'Updated user permissions', target: 'Mike Chen', time: '2 hours ago', type: 'warning' },
              { user: 'Sarah Johnson', action: 'Approved weekly entry', target: 'Week 2, 2025', time: '3 hours ago', type: 'success' },
              { user: 'Mike Chen', action: 'Exported financial report', target: 'Q4 2024', time: '5 hours ago', type: 'info' },
              { user: 'System', action: 'Auto-disabled inactive user', target: 'Tom Wilson', time: '1 day ago', type: 'error' },
            ].map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    log.type === 'success' ? 'bg-green-500' :
                    log.type === 'warning' ? 'bg-yellow-500' :
                    log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-gray-300">
                      <span className="font-medium">{log.user}</span> {log.action}
                    </p>
                    <p className="text-sm text-gray-500">{log.target}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Security Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Require 2FA for all users</span>
                <input type="checkbox" className="toggle" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Auto-lock inactive sessions</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Enable SSO</span>
                <input type="checkbox" className="toggle" />
              </label>
              <div>
                <label className="block text-gray-300 mb-2">Session timeout (minutes)</label>
                <input type="number" defaultValue="30" className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg w-32" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Data Retention</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Audit log retention</label>
                <select className="w-full px-4 py-2 bg-slate-700 text-gray-300 rounded-lg">
                  <option>90 days</option>
                  <option>180 days</option>
                  <option>1 year</option>
                  <option>Forever</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Deleted data retention</label>
                <select className="w-full px-4 py-2 bg-slate-700 text-gray-300 rounded-lg">
                  <option>30 days</option>
                  <option>60 days</option>
                  <option>90 days</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Panel */}
      {selectedUser && (
        <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

export default AdminConsole;
