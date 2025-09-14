// src/components/ReachReport.jsx
// Working component using the exact embed code from Reach Reporting

import React, { useEffect } from 'react';
import { getReportById } from '../config/reportsConfig';

const ReachReport = ({ reportId }) => {
  // Get report config
  const report = getReportById(reportId);
  
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
            iframes[i].contentWindow.postMessage(message,"*");
          }
        }
        window.addEventListener("message",function(e){
          try{
            var d=JSON.parse(e.data);
            var c=d.channel;
            if(c==="rr"){
              document.getElementById("dashboard-"+d.id).style.height=d.height+"px";
              rrSendScroll();
            }
          }catch{}
        });
        window.addEventListener("scroll",rrSendScroll);
      `;
      document.head.appendChild(script);
    }
  }, []);

  if (!report) {
    return <div>Report not found</div>;
  }

  // Use the dashboard ID from config or default to the one from Reach Reporting
  const dashboardId = report.dashboardId || '278961';
  
  return (
    <div
      id={`dashboard-${dashboardId}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: `${report.height || 1000}px`
      }}
    >
      <iframe
        src={report.shareUrl} // This now uses the correct embed URL with theme
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        className="rr-embed"
        data-rr-id={dashboardId}
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
