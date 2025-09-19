import React, { useState, useEffect } from 'react';
import config from './config';

const SideHeader = ({ 
  currentView = 'dashboard', 
  onNavigate, 
  user, 
  dashboardData,
  onExportDashboard,
  useGoogleSheets,
  setUseGoogleSheets,
  logout 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  const [userPreferences, setUserPreferences] = useState({
    theme: 'dark',
    notifications: true,
    emailDigest: 'weekly',
    autoRefresh: true,
    compactView: false,
    showTooltips: true,
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
    currency: 'USD'
  });

  useEffect(() => {
    // Animate progress bars on mount
    const timer = setTimeout(() => {
      const progressBars = document.querySelectorAll('.progress-fill');
      progressBars.forEach(bar => {
        const width = bar.getAttribute('data-width');
        if (width) {
          bar.style.width = width;
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [dashboardData]);

  // Load user preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem(`${config.auth.session.storagePrefix}preferences`);
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavClick = (viewId) => {
    if (onNavigate) {
      onNavigate(viewId);
    }
  };

  const savePreferences = () => {
    localStorage.setItem(`${config.auth.session.storagePrefix}preferences`, JSON.stringify(userPreferences));
    // Show success toast/notification
    alert('Settings saved successfully!');
  };

  // Get user avatar - supports Google OAuth profile picture
  const getUserAvatar = () => {
    if (user?.picture) {
      return (
        <img 
          src={user.picture} 
          alt={user.name || 'User'} 
          className="w-10 h-10 rounded-xl object-cover"
        />
      );
    } else {
      // Get initials from user name or email
      const initials = user?.name 
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : user?.email 
          ? user.email.substring(0, 2).toUpperCase()
          : 'SM';
      
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#00a3cc] flex items-center justify-center font-semibold flex-shrink-0">
          {initials}
        </div>
      );
    }
  };

  const navItems = {
    main: [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        icon: (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
        )
      },
      { 
        id: 'portfolio', 
        label: 'Portfolio', 
        icon: (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
        )
      },
      { 
        id: 'ar-dashboard', 
        label: 'AR Dashboard', 
        icon: (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        )
      },
      { 
        id: 'ap-dashboard', 
        label: 'AP Dashboard', 
        icon: (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        )
      }
    ],
    analytics: [
      { 
        id: 'reports', 
        label: 'Reports', 
        icon: (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v7m3-2h6"/>
          </svg>
        )
      },
      { 
        id: 'insights', 
        label: 'Insights', 
        icon: (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
        )
      },
      { 
        id: 'entry', 
        label: 'Weekly Entry', 
        badge: 'New',
        icon: (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        )
      },
      { 
        id: 'historical', 
        label: 'Historical', 
        icon: (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        )
      },
      { 
        id: 'metrics', 
        label: 'Metrics', 
        icon: (
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
          </svg>
        )
      }
    ]
  };

  // Get stats data from dashboardData prop
  const statsData = dashboardData ? [
    {
      title: 'Revenue',
      value: `$${(dashboardData.revenueYTD / 1000000).toFixed(2)}M`,
      change: '+10.1%',
      changeType: 'positive',
      target: 'Target: $14M',
      progress: 101
    },
    {
      title: 'Cash Position',
      value: `$${(dashboardData.cashPosition / 1000000).toFixed(2)}M`,
      subtitle: 'DSO: 45 days • DPO: 38 days',
      progress: 75
    },
    {
      title: 'Gross Margin',
      value: `${dashboardData.gpmAverage?.toFixed(1) || '34.1'}%`,
      change: '+4.1%',
      changeType: 'positive',
      target: 'Target: 30%',
      progress: 113
    },
    {
      title: 'Backlog',
      value: `$${(dashboardData.backlog / 1000000).toFixed(1)}M`,
      change: '-18 mo.',
      changeType: 'negative',
      target: `Active: ${dashboardData.activeProjects || 23}`,
      progress: 60
    }
  ] : [];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <style jsx>{`
        .sidebar-text {
          transition: opacity 0.3s, transform 0.3s;
        }
        .sidebar.collapsed .sidebar-text {
          opacity: 0;
          transform: translateX(-10px);
        }
        .nav-item {
          transition: all 0.3s;
        }
        .nav-item:hover {
          background: #242938;
        }
        .nav-item.active {
          background: #1a1f2e;
        }
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background: #00d4ff;
          box-shadow: 0 0 10px #00d4ff;
        }
      `}</style>

      {/* Logo in Top Right Corner */}
      <div className="fixed top-4 right-4 z-40">
        <img 
          src="/bizgro-kpi2.0-logo.png" 
          alt="BizGro Partners" 
          className="h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Sidebar Navigation */}
      <div className={`sidebar fixed left-0 top-0 h-screen ${sidebarCollapsed ? 'w-20' : 'w-[280px]'} bg-gradient-to-b from-[#151923] to-[#0a0e1a] border-r border-gray-800 flex flex-col z-50 transition-all duration-300`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {sidebarCollapsed ? (
              <img 
                src="/bizgro-cube.png" 
                alt="BizGro Cube" 
                className="w-10 h-10 object-contain"
              />
            ) : (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#00a3cc] rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                  B
                </div>
                <div className="sidebar-text">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{config.app.company.split(' ')[0]}</h1>
                  <p className="text-xs text-gray-500 mt-0.5">{config.app.name} System</p>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={toggleSidebar}
            className={`${sidebarCollapsed ? 'absolute -right-4' : ''} w-8 h-8 bg-[#1a1f2e] border border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#242938] hover:text-[#00d4ff] transform hover:scale-105 transition-all`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {/* Main Section */}
          <div className="mb-8">
            {!sidebarCollapsed && (
              <div className="px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</div>
            )}
            {navItems.main.map(item => (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
                className={`nav-item relative flex items-center px-6 py-3 gap-4 cursor-pointer ${
                  currentView === item.id ? 'active text-[#00d4ff]' : 'text-gray-400 hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className={currentView === item.id ? 'text-[#00d4ff]' : ''}>{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="sidebar-text text-sm font-medium">{item.label}</span>
                )}
              </a>
            ))}
          </div>

          {/* Analytics Section */}
          <div>
            {!sidebarCollapsed && (
              <div className="px-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Analytics</div>
            )}
            {navItems.analytics.map(item => (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
                className={`nav-item relative flex items-center px-6 py-3 gap-4 cursor-pointer ${
                  currentView === item.id ? 'active text-[#00d4ff]' : 'text-gray-400 hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                {item.icon}
                {!sidebarCollapsed && (
                  <>
                    <span className="sidebar-text text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="sidebar-text ml-auto bg-[#00d4ff] text-[#0a0e1a] px-2 py-0.5 rounded-full text-xs font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </a>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="relative">
          <div 
            className="p-6 border-t border-gray-800 flex items-center gap-3 cursor-pointer hover:bg-[#242938] transition-colors"
            onClick={() => setShowProfile(!showProfile)}
          >
            {getUserAvatar()}
            {!sidebarCollapsed && (
              <div className="sidebar-text flex-1">
                <div className="text-sm font-semibold">{user?.name || 'Demo User'}</div>
                <div className="text-xs text-gray-500">{user?.email || user?.role || 'Administrator'}</div>
              </div>
            )}
          </div>

          {/* User Dropdown Menu */}
          {showProfile && !sidebarCollapsed && (
            <div className="absolute bottom-full left-6 right-6 mb-2 bg-[#1a1f2e] rounded-xl shadow-xl border border-gray-700 overflow-hidden">
              <div className="p-4">
                {/* User Info Section */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700">
                  {getUserAvatar()}
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{user?.name || 'Demo User'}</div>
                    <div className="text-xs text-gray-500">{user?.email || 'demo@bizgropartners.com'}</div>
                    {user?.provider && (
                      <div className="text-xs text-cyan-500 mt-1">via {user.provider}</div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setShowProfile(false);
                    }}
                    className="w-full px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors text-sm flex items-center gap-2 text-left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Settings
                  </button>

                  <button
                    onClick={() => onExportDashboard && onExportDashboard('excel')}
                    className="w-full px-3 py-2 bg-green-900/50 hover:bg-green-900/70 text-green-400 rounded-lg transition-colors text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Export Excel
                  </button>
                  
                  <button
                    onClick={() => onExportDashboard && onExportDashboard('csv')}
                    className="w-full px-3 py-2 bg-blue-900/50 hover:bg-blue-900/70 text-blue-400 rounded-lg transition-colors text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    Export CSV
                  </button>
                  
                  {logout && (
                    <button
                      onClick={logout}
                      className="w-full px-3 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-400 rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1a1f2e] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700">
            {/* Settings Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Settings Content */}
            <div className="flex h-[calc(90vh-120px)]">
              {/* Settings Sidebar */}
              <div className="w-64 border-r border-gray-700 p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveSettingsTab('profile')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeSettingsTab === 'profile' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 text-gray-400'
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveSettingsTab('preferences')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeSettingsTab === 'preferences' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 text-gray-400'
                    }`}
                  >
                    Preferences
                  </button>
                  <button
                    onClick={() => setActiveSettingsTab('notifications')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeSettingsTab === 'notifications' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 text-gray-400'
                    }`}
                  >
                    Notifications
                  </button>
                  <button
                    onClick={() => setActiveSettingsTab('integrations')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeSettingsTab === 'integrations' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 text-gray-400'
                    }`}
                  >
                    Integrations
                  </button>
                  <button
                    onClick={() => setActiveSettingsTab('security')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeSettingsTab === 'security' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 text-gray-400'
                    }`}
                  >
                    Security
                  </button>
                  <button
                    onClick={() => setActiveSettingsTab('about')}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeSettingsTab === 'about' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 text-gray-400'
                    }`}
                  >
                    About
                  </button>
                </nav>
              </div>

              {/* Settings Main Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeSettingsTab === 'profile' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                    
                    <div className="flex items-center gap-4">
                      {user?.picture ? (
                        <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#00a3cc] flex items-center justify-center text-2xl font-bold">
                          {user?.name?.substring(0, 2).toUpperCase() || 'SM'}
                        </div>
                      )}
                      <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors text-sm">
                        Change Avatar
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input 
                          type="text" 
                          value={user?.name || 'Demo User'} 
                          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none"
                          readOnly={user?.provider === 'google'}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input 
                          type="email" 
                          value={user?.email || 'demo@bizgropartners.com'} 
                          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none"
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Role</label>
                        <input 
                          type="text" 
                          value={user?.role || 'Administrator'} 
                          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none"
                          readOnly
                        />
                      </div>

                      {user?.provider && (
                        <div className="p-4 bg-gray-800/50 rounded-lg">
                          <p className="text-sm text-gray-400">
                            Signed in with {user.provider === 'google' ? 'Google' : user.provider}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'preferences' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Theme</label>
                        <select 
                          value={userPreferences.theme}
                          onChange={(e) => setUserPreferences({...userPreferences, theme: e.target.value})}
                          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="dark">Dark</option>
                          <option value="light">Light</option>
                          <option value="auto">System</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Date Format</label>
                        <select 
                          value={userPreferences.dateFormat}
                          onChange={(e) => setUserPreferences({...userPreferences, dateFormat: e.target.value})}
                          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Timezone</label>
                        <select 
                          value={userPreferences.timezone}
                          onChange={(e) => setUserPreferences({...userPreferences, timezone: e.target.value})}
                          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Currency</label>
                        <select 
                          value={userPreferences.currency}
                          onChange={(e) => setUserPreferences({...userPreferences, currency: e.target.value})}
                          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Auto-refresh Dashboard</label>
                        <input 
                          type="checkbox" 
                          checked={userPreferences.autoRefresh}
                          onChange={(e) => setUserPreferences({...userPreferences, autoRefresh: e.target.checked})}
                          className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Compact View</label>
                        <input 
                          type="checkbox" 
                          checked={userPreferences.compactView}
                          onChange={(e) => setUserPreferences({...userPreferences, compactView: e.target.checked})}
                          className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Show Tooltips</label>
                        <input 
                          type="checkbox" 
                          checked={userPreferences.showTooltips}
                          onChange={(e) => setUserPreferences({...userPreferences, showTooltips: e.target.checked})}
                          className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-400">Receive email updates about your account</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={userPreferences.notifications}
                          onChange={(e) => setUserPreferences({...userPreferences, notifications: e.target.checked})}
                          className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Email Digest Frequency</label>
                        <select 
                          value={userPreferences.emailDigest}
                          onChange={(e) => setUserPreferences({...userPreferences, emailDigest: e.target.value})}
                          className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="never">Never</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <p className="font-medium">Notification Types</p>
                        {['Weekly Reports', 'System Updates', 'Data Alerts', 'Account Changes'].map(type => (
                          <div key={type} className="flex items-center justify-between">
                            <label className="text-sm">{type}</label>
                            <input 
                              type="checkbox" 
                              defaultChecked
                              className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-4">Integrations</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            G
                          </div>
                          <div>
                            <p className="font-medium">Google Sheets</p>
                            <p className="text-sm text-gray-400">Sync data with Google Sheets</p>
                          </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={useGoogleSheets}
                          onChange={(e) => setUseGoogleSheets && setUseGoogleSheets(e.target.checked)}
                          className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="p-4 bg-gray-800/50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            QB
                          </div>
                          <div>
                            <p className="font-medium">QuickBooks</p>
                            <p className="text-sm text-gray-400">Connect to QuickBooks Online</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors text-sm">
                          Connect
                        </button>
                      </div>

                      <div className="p-4 bg-gray-800/50 rounded-lg flex items-center justify-between opacity-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            S
                          </div>
                          <div>
                            <p className="font-medium">Slack</p>
                            <p className="text-sm text-gray-400">Send notifications to Slack</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">Coming Soon</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'security' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-4">Security</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-400 mb-3">Add an extra layer of security to your account</p>
                        <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors text-sm">
                          Enable 2FA
                        </button>
                      </div>

                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="font-medium mb-2">Active Sessions</h4>
                        <p className="text-sm text-gray-400 mb-3">Manage your active sessions across devices</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                            <div>
                              <p className="text-sm">Current Session</p>
                              <p className="text-xs text-gray-500">Chrome on Windows • New Jersey, US</p>
                            </div>
                            <span className="text-xs text-green-500">Active</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="font-medium mb-2">Password</h4>
                        <p className="text-sm text-gray-400 mb-3">Last changed 30 days ago</p>
                        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'about' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-4">About</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <img src={`/${config.app.logo}`} alt={config.app.company} className="h-12" />
                          <div>
                            <h4 className="font-bold text-lg">{config.app.fullName}</h4>
                            <p className="text-sm text-gray-400">{config.app.company}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Version</span>
                            <span>2.0.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Environment</span>
                            <span>{process.env.NODE_ENV}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Build Date</span>
                            <span>Sept 2025</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <h4 className="font-medium mb-2">Support</h4>
                        <div className="space-y-2 text-sm">
                          <a href="#" className="block text-cyan-500 hover:text-cyan-400">Documentation</a>
                          <a href="#" className="block text-cyan-500 hover:text-cyan-400">Contact Support</a>
                          <a href="#" className="block text-cyan-500 hover:text-cyan-400">Report an Issue</a>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 text-center">
                        {config.app.copyright}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Settings Footer */}
            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePreferences}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideHeader;
