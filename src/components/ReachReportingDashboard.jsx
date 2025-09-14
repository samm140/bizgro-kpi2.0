// src/components/ReachReportingDashboard.jsx
// Complete implementation with proper HTML structure and script

import React, { useEffect } from 'react';

const ReachReportingDashboard = ({ embedId = '6Z0ZGAd~J8lKkXYz', dashboardId = 0 }) => {
  
  useEffect(() => {
    // Add the Reach Reporting script to the page
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
    
    // Only add script if it doesn't exist
    if (!window.rrSendScroll) {
      document.head.appendChild(script);
    }
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  // The correct iframe structure that Reach Reporting expects
  return (
    <div 
      id={`dashboard-${dashboardId}`} 
      style={{ 
        width: '100%', 
        height: '800px',
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <iframe
        className="rr-embed"
        data-rr-id={dashboardId}
        src={`https://reports.bizgropartners.com/shared/${embedId}`}
        width="100%"
        height="100%"
        frameBorder="0"
        style={{
          border: 'none',
          background: 'transparent'
        }}
      />
    </div>
  );
};

// Alternative version that might work better
const ReachReportingEmbedAlternative = ({ embedId = '6Z0ZGAd~J8lKkXYz' }) => {
  
  useEffect(() => {
    // Initialize the RR script
    const initScript = () => {
      if (typeof window !== 'undefined' && !window.rrInitialized) {
        window.rrInitialized = true;
        
        window.rrSendScroll = function() {
          var iframes = document.getElementsByClassName("rr-embed");
          var de = document.documentElement;
          for (var i = 0; i < iframes.length; i += 1) {
            var box = iframes[i].getBoundingClientRect();
            var top = box.top + window.pageYOffset - de.clientTop;
            var message = JSON.stringify({
              channel: "rr",
              id: parseInt(iframes[i].getAttribute("data-rr-id"), 10),
              scrollY: window.scrollY,
              offsetTop: top
            });
            try {
              iframes[i].contentWindow.postMessage(message, "*");
            } catch(e) {}
          }
        };
        
        window.addEventListener("message", function(e) {
          try {
            var d = JSON.parse(e.data);
            var c = d.channel;
            if (c === "rr") {
              var elem = document.getElementById("dashboard-" + d.id);
              if (elem) {
                elem.style.height = d.height + "px";
                window.rrSendScroll();
              }
            }
          } catch(e) {}
        });
        
        window.addEventListener("scroll", window.rrSendScroll);
      }
    };
    
    initScript();
  }, []);

  // Try different URL patterns
  const embedUrls = [
    `https://reports.bizgropartners.com/shared/${embedId}`,
    `https://reports.bizgropartners.com/embed/${embedId}`,
    `https://reports.bizgropartners.com/public/shared/${embedId}`,
    `https://reports.bizgropartners.com/dashboard/shared/${embedId}`
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h3>Testing Different URL Formats:</h3>
      
      {embedUrls.map((url, index) => (
        <div key={index} style={{ marginBottom: '30px' }}>
          <p style={{ marginBottom: '10px', color: '#94a3b8' }}>
            Format {index + 1}: <code>{url}</code>
          </p>
          <div 
            id={`dashboard-${index}`} 
            style={{ 
              width: '100%', 
              minHeight: '600px',
              border: '1px solid #334155',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <iframe
              className="rr-embed"
              data-rr-id={index}
              src={url}
              width="100%"
              height="600"
              frameBorder="0"
              style={{ display: 'block' }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              allow="fullscreen"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Main App Component
const App = () => {
  const [testMode, setTestMode] = React.useState(false);
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#020617', 
      color: '#f3f4f6',
      padding: '2rem' 
    }}>
      <h1>Cash Flow Management Dashboard</h1>
      
      <button 
        onClick={() => setTestMode(!testMode)}
        style={{
          margin: '20px 0',
          padding: '10px 20px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {testMode ? 'Show Normal View' : 'Test Different URLs'}
      </button>
      
      {testMode ? (
        <ReachReportingEmbedAlternative embedId="6Z0ZGAd~J8lKkXYz" />
      ) : (
        <ReachReportingDashboard embedId="6Z0ZGAd~J8lKkXYz" dashboardId={0} />
      )}
    </div>
  );
};

export default App;

// Export individual components for use elsewhere
export { ReachReportingDashboard, ReachReportingEmbedAlternative };
