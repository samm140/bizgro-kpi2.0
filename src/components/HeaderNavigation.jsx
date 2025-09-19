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
  Clock
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
    { separator: true },
    { icon: Calendar, title: 'Calendar' },
    { icon: Search, title: 'Search' },
    { icon: HelpCircle, title: 'Help' },
    { separator: true },
    { icon: Bookmark, title: 'Bookmarks' }
  ];

  const styles = {
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '50px',
      background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.98) 0%, rgba(45, 49, 66, 0.95) 100%)',
      backdropFilter: 'blur(10px)',
      borderBottom: '2px solid rgba(59, 130, 246, 0.3)', // More visible border
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 48, // Just below sidebar but above content
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', // Add shadow for visibility
    },
    navLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      fontSize: '14px',
      color: '#e0e0e0',
      marginLeft: '244px', // Account for sidebar width
    },
    locationGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#94a3b8', // Slightly brighter
    },
    weatherGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: '#fbbf24', // Yellow for weather
    },
    timeGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#60a5fa', // Blue for time
    },
    navRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    navButton: {
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      color: '#94a3b8',
    },
    navButtonHover: {
      background: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      color: '#e0e0e0',
    },
    badge: {
      position: 'absolute',
      top: '4px',
      right: '4px',
      minWidth: '16px',
      height: '16px',
      background: '#ef4444',
      color: 'white',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: 'bold',
      padding: '0 3px',
    },
    separator: {
      width: '1px',
      height: '24px',
      background: 'rgba(148, 163, 184, 0.2)',
    },
    appsGrid: {
      width: '36px',
      height: '36px',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2px',
      padding: '8px',
      cursor: 'pointer',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    appsGridHover: {
      background: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    dot: {
      width: '4px',
      height: '4px',
      background: '#94a3b8',
      borderRadius: '1px',
    }
  };

  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredApps, setHoveredApps] = useState(false);

  return (
    <header style={styles.header}>
      {/* Left Section - Location, Weather, Time */}
      <div style={styles.navLeft}>
        <div style={styles.locationGroup}>
          <MapPin size={16} />
          <span>Hasbrouck Heights, NJ</span>
        </div>
        
        <div style={styles.weatherGroup}>
          <Sun size={20} />
          <span>72°F</span>
        </div>
        
        <div style={styles.timeGroup}>
          <Clock size={16} />
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Right Section - Icons */}
      <div style={styles.navRight}>
        {navButtons.map((item, index) => {
          if (item.separator) {
            return <div key={`sep-${index}`} style={styles.separator} />;
          }
          
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
              <Icon size={18} />
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
          {[...Array(9)].map((_, i) => (
            <div key={i} style={styles.dot} />
          ))}
        </div>
      </div>
    </header>
  );
};

export default HeaderNavigation;
