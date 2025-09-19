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
      background: 'rgba(45, 49, 66, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 40,
    },
    navLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      fontSize: '14px',
      color: '#e0e0e0',
    },
    locationGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    weatherGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    timeGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
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
      background: 'transparent',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      color: '#e0e0e0',
    },
    navButtonHover: {
      background: 'rgba(255, 255, 255, 0.1)',
    },
    badge: {
      position: 'absolute',
      top: '6px',
      right: '6px',
      minWidth: '18px',
      height: '18px',
      background: '#ef4444',
      color: 'white',
      borderRadius: '9px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: 'bold',
      padding: '0 4px',
    },
    separator: {
      width: '1px',
      height: '24px',
      background: 'rgba(255, 255, 255, 0.1)',
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
    },
    dot: {
      width: '4px',
      height: '4px',
      background: '#e0e0e0',
      borderRadius: '1px',
    }
  };

  const [hoveredButton, setHoveredButton] = useState(null);
  const [hoveredApps, setHoveredApps] = useState(false);

  return (
    <header style={styles.header}>
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
              <Icon size={20} />
              {item.badge && (
                <span style={styles.badge}>{item.badge}</span>
              )}
            </button>
          );
        })}

        <div 
          style={{
            ...styles.appsGrid,
            ...(hoveredApps ? { background: 'rgba(255, 255, 255, 0.1)' } : {})
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
