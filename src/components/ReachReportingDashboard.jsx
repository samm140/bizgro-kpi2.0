// src/components/ReachReport.jsx
// Working component using the exact embed code from Reach Reporting

import React, { useEffect, useState } from 'react';
import { getReportById } from '../config/reportsConfig';

// Hardcoded configurations as fallback for known reports
const KNOWN_REPORTS = {
  'cash-flow': {
    id: 'cash-flow',
    title: 'Cash Flow Management',
    embedId: '6Z0ZGAd~J8lKkXYz',
    shareUrl: 'https://reports.bizgropartners.com/embed/6Z0ZGAd~J8lKkXYz?theme=dark',
    dashboardId: '278961',
    height: 1000
  },
  'revenue-analysis': {
    id: 'revenue-analysis',
    title: 'Revenue Analysis Dashboard',
    embedId: 'TC3kWIS7rgHDjSs',
    shareUrl: 'https://reports.bizgropartners.com/embed/~TC3kWIS7rgHDjSs?theme=dark',
    dashboardId: '278962', // Update with actual ID if different
    height: 1000
  }
};

const ReachReport = ({ reportId }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Get report config from file or use hardcoded fallback
  let report = getReportById(reportId);
  
  // Fallback to known configuration if report not found or has placeholder
  if (!report || 
      !report.shareUrl || 
      report.shareUrl.includes('YOUR_') || 
      report.shareUrl.includes('_ID')) {
    console.warn(`Using fallback configuration for ${reportId}`);
    report = KNOWN_REPORTS[reportId];
  }
  
  // Additional validation for cash-flow specifically
  if (reportId === 'cash-flow' && report) {
    // Ensure we're using the correct embed URL for cash-flow
    if (!report.shareUrl.includes('6Z0ZGAd~J8lKkXYz')) {
      console.warn('Correcting cash-flow URL');
      report = {
        ...report,
        shareUrl: 'https://reports.bizgropartners.com/embed/6Z0ZGAd~J8lKkXYz?theme=dark',
        dashboardId: '278961',
        height: 1000
      };
    }
  }
  
  // Debug logging
  console.log(`Loading report: ${reportId}`, {
    embedId: report?.embedId,
    shareUrl: report?.shareUrl,
    dashboardId: report?.dashboardId
  });
  
  useEffect(() => {
    // Only add script once
    if (!window.rrSendScroll) {
      const script = document.createElement('script');
      script.innerHTML = `
        function rrSendScroll(){
          var iframes=document.getElementsByClassName("rr-embed");
          var de=document.documentElement;
          for(var i=0;i<iframes.length;i+=1){
            var box=iframes[i].getBoundingClientRect();
            var top=box.top+window.pageYOffset-de.clientTop;
            var message=JSON.stringify({
              channel:"rr",
              id:parseInt(iframes[i].getAttribute("data-rr-id"),10),
              scrollY:window.scrollY,
              offsetTop:top
            });
            try {
              iframes[i].contentWindow.postMessage(message,"*");
            } catch(e) {
              console.error('Error sending message to iframe:', e);
            }
          }
        }
        window.addEventListener("message",function(e){
          try{
            var d=JSON.parse(e.data);
            var c=d.channel;
            if(c==="rr"){
              var elem = document.getElementById("dashboard-"+d.id);
              if(elem) {
                elem.style.height=d.height+"px";
                rrSendScroll();
              }
            }
          }catch{}
        });
        window.addEventListener("scroll",rrSendScroll);
      `;
      document.head.appendChild(script);
      window.rrSendScroll = true; // Mark as initialized
    }
  }, []);
  
  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log(`Report ${reportId} loaded successfully`);
  };
  
  if (!report) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: '#94a3b8',
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '0.5rem',
        margin: '1rem'
      }}>
        <h3>Report Configuration Error</h3>
        <p>Report "{reportId}" not found or misconfigured.</p>
        <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
          Please check your reportsConfig.js file.
        </p>
      </div>
    );
  }
  
  // Use the dashboard ID from config or generate one
  const dashboardId = report.dashboardId || `dashboard-${Date.now()}`;
  
  // Ensure we have a valid URL
  const embedUrl = report.shareUrl || report.embedUrl || '';
  
  // Final validation
  if (!embedUrl || embedUrl.includes('YOUR_')) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: '#ef4444',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '0.5rem',
        margin: '1rem'
      }}>
        <h3>Invalid Embed URL</h3>
        <p>The embed URL for "{report.title}" contains placeholder values.</p>
        <p style={{ fontSize: '0.875rem', marginTop: '1rem', color: '#94a3b8' }}>
          Current URL: <code>{embedUrl}</code>
        </p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#94a3b8' }}>
          Please update your configuration with the correct embed ID.
        </p>
      </div>
    );
  }
  
  return (
    <div
      id={`dashboard-${dashboardId}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: `${report.height || 1000}px`,
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '0.5rem'
      }}
    >
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10
        }}>
          <div className="rr-loading">
            <div className="rr-loading-spinner"></div>
            <div className="rr-loading-text">Loading {report.title}...</div>
          </div>
        </div>
      )}
      <iframe
        src={embedUrl}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          display: isLoading ? 'none' : 'block'
        }}
        className="rr-embed"
        data-rr-id={dashboardId}
        onLoad={handleIframeLoad}
        title={report.title || 'Reach Report'}
      />
    </div>
  );
};

export default ReachReport;

// Usage example in your app
export const CashFlowDashboard = () => {
  return (
    <div className="dashboard-container">
      <h1>Cash Flow Management</h1>
      <ReachReport reportId="cash-flow" />
    </div>
  );
};

// Revenue Analysis Dashboard example
export const RevenueAnalysisDashboard = () => {
  return (
    <div className="dashboard-container">
      <h1>Revenue Analysis Dashboard</h1>
      <ReachReport reportId="revenue-analysis" />
    </div>
  );
};
