import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Briefcase, 
  BarChart3, 
  PieChart, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Clock, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Shield,
  Settings,
  CreditCard
} from 'lucide-react';
import { usePermissions } from './services/rbac/PermissionProvider';

const SideHeader = ({ onLogout, onCollapsedChange, onNavigate, currentView }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Get permissions from context
  const { permissions, user } = usePermissions();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Notify parent of collapse state changes
  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
  }, [isCollapsed, onCollapsedChange]);

  // Map icon names to components
  const iconMap = {
    'home': Home,
    'briefcase': Briefcase,
    'dollar-sign': DollarSign,
    'credit-card': CreditCard,
    'file-text': FileText,
    'trending-up': TrendingUp,
    'calendar': Calendar,
    'clock': Clock,
    'bar-chart': BarChart3,
    'chart-pie': PieChart,
    'shield': Shield,
    'settings': Settings
  };

  // Get navigation items based on permissions
  const navigationItems = permissions ? permissions.getNavigationItems() : [];

  // Build menu structure from navigation items
  const menuItems = [
    { 
      category: 'MAIN', 
      items: navigationItems.filter(item => 
        ['Dashboard', 'Work in Progress', 'Receivables', 'Payables'].includes(item.name)
      ).map(item => ({
        name: item.name,
        icon: iconMap[item.icon] || Home,
        view: item.view,
        badge: item.badge
      }))
    },
    { 
      category: 'ANALYTICS', 
      items: navigationItems.filter(item => 
        ['FP&A Reports', 'CFO Analysis', 'Insights', 'Weekly Entry', 'Historical', 'Ratio Glossary'].includes(item.name)
      ).map(item => ({
        name: item.name,
        icon: iconMap[item.icon] || FileText,
        view: item.view,
        badge: item.badge
      }))
    }
  ];

  // Add admin section if user has permission
  const adminItems = navigationItems.filter(item => 
    ['Admin Console', 'Settings'].includes(item.name)
  );
  
  if (adminItems.length > 0) {
    menuItems.push({
      category: 'ADMINISTRATION',
      items: adminItems.map(item => ({
        name: item.name,
        icon: iconMap[item.icon] || Shield,
        view: item.view
      }))
    });
  }

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('isAuthenticated');
    
    // Call the onLogout prop if provided
    if (onLogout) {
      onLogout();
    } else {
      // Force reload to trigger auth check in App.js
      window.location.href = '/';
    }
  };

  const handleMenuClick = (item) => {
    if (onNavigate) {
      onNavigate(item.view);
    }
  };

  // Get user avatar with role badge
  const getUserAvatar = () => {
    const roleColors = {
      Admin: 'bg-red-500',
      Executive: 'bg-purple-500',
      Financial: 'bg-green-500',
      Operational: 'bg-blue-500',
      Sales: 'bg-orange-500',
      Investor: 'bg-indigo-500'
    };

    return (
      <div className="relative">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
          {user?.name ? user.name.substring(0, 2).toUpperCase() : 'DU'}
        </div>
        {user?.role && (
          <div className={`absolute -top-1 -right-1 w-3 h-3 ${roleColors[user.role] || 'bg-gray-500'} rounded-full border border-gray-900`}></div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-800 transition-all duration-300 z-50 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-center px-4 border-b border-gray-800 relative">
          {isCollapsed ? (
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="bizgro-cube.png" 
                alt="BizGro" 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-blue-500 font-bold text-2xl">B</span>';
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <img 
                src="bizgro-kpi2.0-logo.png" 
                alt="BizGro KPI 2.0 System" 
                className="h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-white font-semibold text-lg">BizGro KPI 2.0</span>';
                }}
              />
            </div>
          )}
          
          {/* Circular Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute ${isCollapsed ? '-right-3' : '-right-3'} top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 z-10`}
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              {!isCollapsed && (
                <div className="px-4 mb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    {section.category}
                  </span>
                </div>
              )}
              
              {section.items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center px-4 py-3 text-left transition-all duration-200 relative group ${
                    currentView === item.view
                      ? 'bg-blue-600/10 text-blue-500 border-r-2 border-blue-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 font-medium">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto bg-cyan-500 text-gray-900 text-xs px-2 py-0.5 rounded-full font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.name}
                      {item.badge && (
                        <span className="ml-2 bg-cyan-500 text-gray-900 text-xs px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* User Section at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800">
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center px-4 py-4 hover:bg-gray-800/50 transition-colors"
            >
              {getUserAvatar()}
              
              {!isCollapsed && (
                <>
                  <div className="ml-3 text-left flex-1">
                    <div className="text-sm font-medium text-white">
                      {user?.name || 'Demo User'}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <span>{user?.email || 'demo@bizgropartners.com'}</span>
                      {user?.role && (
                        <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded text-xs">
                          {user.role}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </>
              )}
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className={`absolute bottom-full left-0 right-0 mb-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden ${
                isCollapsed ? 'left-full ml-1 w-48' : ''
              }`}>
                {/* Show user role and permissions summary */}
                {!isCollapsed && user?.role && (
                  <div className="px-4 py-3 border-b border-gray-700">
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm text-gray-300 font-medium">{user.role}</p>
                  </div>
                )}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <LogOut size={16} />
                  <span className="ml-2">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideHeader;
