import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  MessageCircle, 
  User, 
  Heart, 
  Calendar, 
  Search, 
  HelpCircle, 
  Bookmark,
  MapPin,
  Sun,
  Clock,
  Grid3x3
} from 'lucide-react';

const HeaderNavigation = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const navButtons = [
    { icon: Bell, title: 'Notifications', badge: notifications },
    { icon: MessageCircle, title: 'Messages' },
    { icon: User, title: 'Profile' },
    { icon: Heart, title: 'Favorites' },
    { icon: Calendar, title: 'Calendar' },
    { icon: Search, title: 'Search' },
    { icon: HelpCircle, title: 'Help' },
    { icon: Bookmark, title: 'Bookmarks' }
  ];

  const styles = {
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '40px', // Slimmer header
      background: 'rgba(30, 41, 59, 0.98)', // Dark slate background
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(71, 85, 105, 0.3)', // Subtle border
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      zIndex: 49,
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      fontSize: '13px',
      marginLeft: '250px', // Account for sidebar
    },
    locationGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: '#94a3b8',
    },
    weatherGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: '#fbbf24',
    },
    timeGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: '#94a3b8',
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    navButton: {
      width: '32px',
      height: '32px',
      borderRadius: '6px',
      background: 'transparent',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      color: '#94a3b8',
    },
    navButtonHover: {
      background: 'rgba(71, 85, 105, 0.3)',
      color: '#e2e8f0',
    },
    badge: {
      position: 'absolute',
      top: '5px',
      right: '5px',
      minWidth: '14px',
      height: '14px',
      background: '#ef4444',
      color: 'white',
      borderRadius: '7px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '9px',
      fontWeight: 'bold',
    },
    appsGrid: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      color: '#94a3b8',
    },
    appsGridHover: {
      background: 'rgba(71, 85, 105, 0.3)',
      color: '#e2e8f0',
    }
  };

  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredApps, setHoveredApps] = useState(false);

  return (
    <header style={styles.header}>
      {/* Left Section - Location, Weather, Time */}
      <div style={styles.leftSection}>
        <div style={styles.locationGroup}>
          <MapPin size={14} />
          <span>Hasbrouck Heights, NJ</span>
        </div>
        
        <div style={styles.weatherGroup}>
          <Sun size={16} />
          <span>72°F</span>
        </div>
        
        <div style={styles.timeGroup}>
          <Clock size={14} />
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Right Section - Icons */}
      <div style={styles.rightSection}>
        {navButtons.map((item, index) => {
          const Icon = item.icon;
          const isHovered = hoveredButton === index;
          
          return (
            <button
              key={index}
              style={{
                ...styles.navButton,
                ...(isHovered ? styles.navButtonHover : {})
              }}
              onMouseEnter={() => setHoveredButton(index)}
              onMouseLeave={() => setHoveredButton(null)}
              title={item.title}
            >
              <Icon size={16} />
              {item.badge && (
                <span style={styles.badge}>{item.badge}</span>
              )}
            </button>
          );
        })}

        {/* Apps Grid */}
        <div 
          style={{
            ...styles.appsGrid,
            ...(hoveredApps ? styles.appsGridHover : {})
          }}
          onMouseEnter={() => setHoveredApps(true)}
          onMouseLeave={() => setHoveredApps(false)}
          title="Apps"
        >
          <Grid3x3 size={16} />
        </div>
      </div>
    </header>
  );
};

export default HeaderNavigation;
