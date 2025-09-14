// src/components/reports/BizGroReports.jsx
import React, { useState, useEffect, useRef } from 'react';

const BizGroReports = () => {
  const [activeCategory, setActiveCategory] = useState('financial');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const embedContainerRef = useRef(null);

  // Report configurations organized by category
  const reportCategories = {
    financial: {
      name: 'Financial Analytics',
      icon: 'fas fa-chart-line',
      color: 'from-blue-600 to-blue-700',
      reports: [
        {
          id: 'revenue-analysis',
          title: 'Revenue Analysis Dashboard',
          description: 'Comprehensive revenue trends, YoY comparisons, and forecasting',
          embedId: 'TC3kWIS7rgHDjSs',
          height: 1000,
          tags: ['Revenue', 'Trends', 'YTD']
        },
        {
          id: 'cash-flow',
          title: 'Cash Flow Management',
          description: 'Real-time cash position, collections, and liquidity metrics',
          embedId: 'YOUR_CASHFLOW_ID',
          height: 800,
          tags: ['Cash', 'Collections', 'Liquidity']
        },
        {
          id: 'profitability',
          title: 'Profitability Metrics',
          description: 'Gross margin analysis, EBITDA tracking, and cost management',
          embedId: 'YOUR_PROFIT_ID',
          height: 900,
          tags: ['Margins', 'EBITDA', 'Costs']
        }
      ]
    },
    operational: {
      name: 'Operational Insights',
      icon: 'fas fa-cogs',
      color: 'from-green-600 to-green-700',
      reports: [
        {
          id: 'project-performance',
          title: 'Project Performance',
          description: 'Active project tracking, completion rates, and variance analysis',
          embedId: 'YOUR_PROJECT_ID',
          height: 850,
          tags: ['Projects', 'WIP', 'Completion']
        },
        {
          id: 'workforce-analytics',
          title: 'Workforce Analytics',
          description: 'Employee metrics, productivity tracking, and resource allocation',
          embedId: 'YOUR_WORKFORCE_ID',
          height: 750,
          tags: ['HR', 'Productivity', 'Resources']
        }
      ]
    },
    executive: {
      name: 'Executive Dashboards',
      icon: 'fas fa-briefcase',
      color: 'from-purple-600 to-purple-700',
      reports: [
        {
          id: 'kpi-summary',
          title: 'Executive KPI Summary',
          description: 'High-level KPIs, strategic metrics, and performance indicators',
          embedId: 'YOUR_KPI_ID',
          height: 1200,
          tags: ['KPIs', 'Strategic', 'Summary']
        },
        {
          id: 'board-report',
          title: 'Board Meeting Dashboard',
          description: 'Quarterly performance, YTD results, and strategic initiatives',
          embedId: 'YOUR_BOARD_ID',
          height: 1100,
          tags: ['Quarterly', 'Board', 'Strategic']
        }
      ]
    },
    portfolio: {
      name: 'Portfolio Companies',
      icon: 'fas fa-building',
      color: 'from-amber-600 to-amber-700',
      reports: [
        {
          id: 'portfolio-overview',
          title: 'Portfolio Overview',
          description: 'Consolidated view of all portfolio company performance',
          embedId: 'YOUR_PORTFOLIO_ID',
          height: 950,
          tags: ['Portfolio', 'Consolidated', 'Multi-Company']
        },
        {
          id: 'comparative-analysis',
          title: 'Comparative Analysis',
          description: 'Cross-company performance comparisons and benchmarking',
          embedId: 'YOUR_COMPARE_ID',
          height: 800,
          tags: ['Comparison', 'Benchmarking', 'Analysis']
        }
      ]
    }
  };

  // Initialize Reach Reporting scroll handler
  useEffect(() => {
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
            var element = document.getElementById("dashboard-"+d.id);
            if(element) {
              element.style.height=d.height+"px";
              rrSendScroll();
            }
          }
        }catch{}
      });
      
      window.addEventListener("scroll",rrSendScroll);
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      embedContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Render embedded dashboard
  const renderEmbedded = (report) => {
    const embedUrl = `https://reports.bizgropartners.com/embed/~${report.embedId}?theme=dark`;
    const dashboardId = `dashboard-${report.embedId}`;
    
    return (
      <div 
        id={dashboardId}
        className="relative overflow-hidden transition-all duration-300"
        style={{ height: `${report.height}px` }}
        ref={embedContainerRef}
      >
        <iframe 
          src={embedUrl}
          className="rr-embed absolute top-0 left-0 w-full h-full border-0"
          data-rr-id={report.embedId}
          title={report.title}
          loading="lazy"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <i className="fas fa-chart-bar mr-3"></i>
              BizGro Reports
            </h1>
            <p className="text-indigo-100 mt-2">
              Powered by Reach Reporting • Real-time Analytics & Insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://reports.bizgropartners.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
            >
              <i className="fas fa-external-link-alt mr-2"></i>
              Full Portal
            </a>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(reportCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => {
              setActiveCategory(key);
              setSelectedReport(null);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
              activeCategory === key
                ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
            }`}
          >
            <i className={`${category.icon} mr-2`}></i>
            {category.name}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      {!selectedReport ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {reportCategories[activeCategory].reports.map((report) => (
            <div
              key={report.id}
              className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer transform hover:scale-102 hover:shadow-xl"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200">
                  {report.title}
                </h3>
                <button className="text-blue-400 hover:text-blue-300">
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">
                {report.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {report.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-700 rounded text-xs text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Selected Report View */
        <div className="space-y-4">
          {/* Report Header */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <i className="fas fa-arrow-left text-gray-300"></i>
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-200">
                    {selectedReport.title}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {selectedReport.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  title="Toggle Fullscreen"
                >
                  <i className={`fas fa-${isFullscreen ? 'compress' : 'expand'} text-gray-300`}></i>
                </button>
                <a
                  href={`https://reports.bizgropartners.com/shared/~${selectedReport.embedId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  title="Open in New Tab"
                >
                  <i className="fas fa-external-link-alt text-gray-300"></i>
                </a>
                <button
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  title="Refresh"
                  onClick={() => {
                    const temp = selectedReport;
                    setSelectedReport(null);
                    setTimeout(() => setSelectedReport(temp), 100);
                  }}
                >
                  <i className="fas fa-sync text-gray-300"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Embedded Report */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
            {renderEmbedded(selectedReport)}
          </div>

          {/* Related Reports */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              Related Reports
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportCategories[activeCategory].reports
                .filter(r => r.id !== selectedReport.id)
                .map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left"
                  >
                    <h4 className="font-medium text-gray-200 text-sm">
                      {report.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      View Report →
                    </p>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BizGroReports;
