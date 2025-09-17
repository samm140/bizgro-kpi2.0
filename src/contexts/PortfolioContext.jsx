// src/contexts/PortfolioContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Portfolio Context for managing multi-company data
const PortfolioContext = createContext();

// Custom hook for using portfolio context
export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
};

// Portfolio configuration - can be moved to external config
export const PORTFOLIOS = {
  'diamondback-001': {
    id: 'diamondback-001',
    name: 'DiamondBack Construction',
    industry: 'Construction',
    sheets: {
      wip: {
        spreadsheetId: '1cJk9quQv9naXoQaVWBC4ueo0RwDfJ_RgK_ZObjrt7VM',
        gid: '1032119441'
      },
      ar: {
        spreadsheetId: '16PVlalae-iOCX3VR1sSIB6_QCdTGjXSwmO6x8YttH1I',
        gid: '943478698'
      }
    },
    settings: {
      fiscalYearEnd: '12-31',
      currency: 'USD',
      timezone: 'America/New_York'
    }
  },
  'construction-002': {
    id: 'construction-002',
    name: 'ABC Contractors',
    industry: 'Construction',
    sheets: {
      wip: {
        spreadsheetId: 'YOUR_SHEET_ID',
        gid: 'YOUR_GID'
      },
      ar: {
        spreadsheetId: 'YOUR_SHEET_ID',
        gid: 'YOUR_GID'
      }
    },
    settings: {
      fiscalYearEnd: '06-30',
      currency: 'USD',
      timezone: 'America/Los_Angeles'
    }
  },
  'manufacturing-001': {
    id: 'manufacturing-001',
    name: 'XYZ Manufacturing',
    industry: 'Manufacturing',
    sheets: {
      wip: {
        spreadsheetId: 'YOUR_SHEET_ID',
        gid: 'YOUR_GID'
      },
      ar: {
        spreadsheetId: 'YOUR_SHEET_ID',
        gid: 'YOUR_GID'
      }
    },
    settings: {
      fiscalYearEnd: '09-30',
      currency: 'USD',
      timezone: 'America/Chicago'
    }
  }
};

// Permission levels
export const PERMISSION_LEVELS = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
  ADMIN: 'admin',
  OWNER: 'owner'
};

// User permissions mapping (would come from auth/backend)
const USER_PERMISSIONS = {
  'user-001': {
    portfolios: {
      'diamondback-001': PERMISSION_LEVELS.OWNER,
      'construction-002': PERMISSION_LEVELS.VIEWER,
    }
  },
  'user-002': {
    portfolios: {
      'diamondback-001': PERMISSION_LEVELS.EDITOR,
      'manufacturing-001': PERMISSION_LEVELS.ADMIN,
    }
  }
};

export const PortfolioProvider = ({ children }) => {
  const [currentPortfolioId, setCurrentPortfolioId] = useState('diamondback-001');
  const [userPermissions, setUserPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate fetching user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        // In production, fetch from API
        // const response = await fetch('/api/user/permissions');
        // const data = await response.json();
        
        // For now, use mock data
        const currentUserId = 'user-001'; // Would come from auth
        const permissions = USER_PERMISSIONS[currentUserId] || {};
        
        setUserPermissions(permissions.portfolios || {});
        
        // Set first available portfolio as default
        const availablePortfolios = Object.keys(permissions.portfolios || {});
        if (availablePortfolios.length > 0 && !permissions.portfolios[currentPortfolioId]) {
          setCurrentPortfolioId(availablePortfolios[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load portfolio permissions');
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Get current portfolio config
  const getCurrentPortfolio = () => {
    return PORTFOLIOS[currentPortfolioId] || null;
  };

  // Get all accessible portfolios for current user
  const getAccessiblePortfolios = () => {
    return Object.keys(userPermissions)
      .filter(id => PORTFOLIOS[id])
      .map(id => ({
        ...PORTFOLIOS[id],
        permission: userPermissions[id]
      }));
  };

  // Check if user has specific permission for current portfolio
  const hasPermission = (requiredLevel) => {
    const userLevel = userPermissions[currentPortfolioId];
    if (!userLevel) return false;

    const levels = Object.values(PERMISSION_LEVELS);
    const userLevelIndex = levels.indexOf(userLevel);
    const requiredLevelIndex = levels.indexOf(requiredLevel);

    return userLevelIndex >= requiredLevelIndex;
  };

  // Switch portfolio
  const switchPortfolio = (portfolioId) => {
    if (userPermissions[portfolioId]) {
      setCurrentPortfolioId(portfolioId);
      // Trigger data refresh in child components
      window.dispatchEvent(new CustomEvent('portfolio-switched', { detail: { portfolioId } }));
    } else {
      console.error('No permission for portfolio:', portfolioId);
    }
  };

  const value = {
    currentPortfolioId,
    currentPortfolio: getCurrentPortfolio(),
    accessiblePortfolios: getAccessiblePortfolios(),
    userPermissions,
    hasPermission,
    switchPortfolio,
    loading,
    error,
    isOwner: hasPermission(PERMISSION_LEVELS.OWNER),
    isAdmin: hasPermission(PERMISSION_LEVELS.ADMIN),
    isEditor: hasPermission(PERMISSION_LEVELS.EDITOR),
    isViewer: hasPermission(PERMISSION_LEVELS.VIEWER),
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};
