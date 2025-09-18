import React, { useState, useEffect } from 'react';

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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavClick = (viewId) => {
    if (onNavigate) {
      onNavigate(viewId);
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
      progress: 101,
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      ),
      iconBg: 'bg-green-500/10'
    },
    {
      title: 'Cash Position',
      value: `$${(dashboardData.cashPosition / 1000000).toFixed(2)}M`,
      subtitle: 'DSO: 45 days • DPO: 38 days',
      progress: 75,
      icon: (
        <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
        </svg>
      ),
      iconBg: 'bg-cyan-500/10'
    },
    {
      title: 'Gross Margin',
      value: `${dashboardData.gpmAverage?.toFixed(1) || '34.1'}%`,
      change: '+4.1%',
      changeType: 'positive',
      target: 'Target: 30%',
      progress: 113,
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
        </svg>
      ),
      iconBg: 'bg-yellow-500/10'
    },
    {
      title: 'Backlog',
      value: `$${(dashboardData.backlog / 1000000).toFixed(1)}M`,
      change: '-18 mo.',
      changeType: 'negative',
      target: `Active: ${dashboardData.activeProjects || 23}`,
      progress: 60,
      icon: (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
      ),
      iconBg: 'bg-purple-500/10'
    }
  ] : [];

  const activities = dashboardData?.allEntries ? dashboardData.allEntries.slice(-4).reverse().map((entry, index) => ({
    type: index === 0 ? 'success' : index === 1 ? 'warning' : 'info',
    title: `Week ending ${entry.weekEnding} - Revenue: $${parseInt(entry.revenueBilledToDate).toLocaleString()}`,
    time: `${index + 1} week${index !== 0 ? 's' : ''} ago`
  })) : [
    { type: 'success', title: 'Weekly data entry completed', time: '2 hours ago' },
    { type: 'warning', title: 'QuickBooks sync completed', time: '5 hours ago' },
    { type: 'info', title: 'Variance alert: AR difference detected', time: '1 day ago' },
    { type: 'success', title: 'Demo Mode - Backend features disabled', time: 'Active' }
  ];

  const activityColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    info: 'bg-cyan-500'
  };

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
        .progress-fill {
          transition: width 1s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .stat-card {
          animation: slideIn 0.5s ease-out forwards;
        }
      `}</style>

      {/* Sidebar Navigation */}
      <div className={`sidebar fixed left-0 top-0 h-screen ${sidebarCollapsed ? 'w-20' : 'w-[280px]'} bg-gradient-to-b from-[#151923] to-[#0a0e1a] border-r border-gray-800 flex flex-col z-50 transition-all duration-300`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#00a3cc] rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">
              B
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-text">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">BizGro</h1>
                <p className="text-xs text-gray-500 mt-0.5">KPI 2.0 System</p>
              </div>
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#00a3cc] flex items-center justify-center font-semibold flex-shrink-0">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'DU'}
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-text flex-1">
                <div className="text-sm font-semibold">{user?.name || 'Demo User'}</div>
                <div className="text-xs text-gray-500">{user?.role || 'Administrator'}</div>
              </div>
            )}
          </div>

          {/* User Dropdown Menu */}
          {showProfile && !sidebarCollapsed && (
            <div className="absolute bottom-full left-6 right-6 mb-2 bg-[#1a1f2e] rounded-xl shadow-xl border border-gray-700 p-4">
              <div className="mb-4">
                <div className="text-sm font-semibold mb-2">User Settings</div>
                <label className="flex items-center justify-between cursor-pointer mb-3">
                  <span className="text-sm text-gray-400">Google Sheets Sync</span>
                  <input 
                    type="checkbox" 
                    checked={useGoogleSheets}
                    onChange={(e) => setUseGoogleSheets && setUseGoogleSheets(e.target.checked)}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-[#00d4ff] focus:ring-[#00d4ff]"
                  />
                </label>
              </div>
              
              <div className="space-y-2">
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
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Dashboard View when currentView is 'dashboard' */}
      {currentView === 'dashboard' && (
        <div className={`${sidebarCollapsed ? 'ml-20' : 'ml-[280px]'} min-h-screen transition-all duration-300 p-8`}>
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8 p-6 bg-[#1a1f2e] rounded-2xl border border-gray-800">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Executive Dashboard
            </h1>
            <div className="flex gap-3">
              <button 
                onClick={() => onExportDashboard && onExportDashboard('excel')}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#242938] text-gray-400 border border-gray-700 hover:bg-[#1a1f2e] hover:text-white transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Export Excel
              </button>
              <button 
                onClick={() => onExportDashboard && onExportDashboard('csv')}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#242938] text-gray-400 border border-gray-700 hover:bg-[#1a1f2e] hover:text-white transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                Export CSV
              </button>
              <button 
                onClick={() => setUseGoogleSheets && setUseGoogleSheets(!useGoogleSheets)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#00d4ff] to-[#00a3cc] text-[#0a0e1a] hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
                {useGoogleSheets ? 'Sheets Connected' : 'Connect Sheets'}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <div 
                key={index}
                className="stat-card bg-[#1a1f2e] border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-gray-400 text-sm font-medium">{stat.title}</div>
                  <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {stat.change && (
                    <span className={`px-2 py-0.5 rounded-md ${
                      stat.changeType === 'positive' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    } font-semibold`}>
                      {stat.change}
                    </span>
                  )}
                  <span className="text-gray-500">{stat.target || stat.subtitle}</span>
                </div>
                {stat.progress && (
                  <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="progress-fill h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                      style={{ width: 0 }}
                      data-width={`${Math.min(stat.progress, 100)}%`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-[#1a1f2e] border border-gray-800 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => handleNavClick('entry')}
                className="bg-[#242938] border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-[#0a0e1a] hover:border-cyan-500/50 hover:translate-x-1 transition-all flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Weekly Entry</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Submit weekly data</p>
                </div>
              </div>

              <div 
                onClick={() => handleNavClick('reports')}
                className="bg-[#242938] border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-[#0a0e1a] hover:border-cyan-500/50 hover:translate-x-1 transition-all flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v7m3-2h6"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Generate Report</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Weekly KPI summary</p>
                </div>
              </div>

              <div 
                onClick={() => handleNavClick('insights')}
                className="bg-[#242938] border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-[#0a0e1a] hover:border-cyan-500/50 hover:translate-x-1 transition-all flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">View Insights</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Analytics & trends</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-[#1a1f2e] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 hover:bg-[#242938] rounded-xl transition-all">
                  <div className={`w-2 h-2 rounded-full ${activityColors[activity.type]} mt-2 flex-shrink-0 ${
                    index < 3 ? 'animate-pulse' : ''
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-sm text-white">{activity.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideHeader;
