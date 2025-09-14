// src/components/portfolio/DiamondBackDashboard.jsx
import React, { useState, useEffect } from 'react';
import { googleSheetsService } from '../../services/googleSheets';
import { diamondbackSheetsService } from '../../services/diamondbackSheets';

const DiamondBackDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('3QCY');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const sheetId = import.meta.env.VITE_DIAMONDBACK_SHEET_ID;
      
      let fetchedData;
      if (sheetId && import.meta.env.VITE_GITHUB_PAGES !== 'true') {
        // Try to fetch from Google Sheets
        fetchedData = await googleSheetsService.getDiamondBackData(sheetId, selectedPeriod);
      } else {
        // Use mock data
        fetchedData = diamondbackSheetsService.getMockData(selectedPeriod);
      }
      
      setData(fetchedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data
      setData(diamondbackSheetsService.getMockData(selectedPeriod));
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading DiamondBack data...</p>
        </div>
      </div>
    );
  }

  // If no data, show error state
  if (!data) {
    return (
      <div className="bg-red-900/20 rounded-xl p-6 border border-red-800/30">
        <p className="text-red-400">Error loading data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-xl p-6 border border-amber-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold">
              <span className="text-yellow-600">D</span>
              <span className="text-amber-700">B</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-200">DiamondBack Masonry</h2>
              <p className="text-sm text-gray-400">NAICS 238140 - Masonry Contractors</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm"
            >
              <option value="1QCY">Q1 2024</option>
              <option value="2QCY">Q2 2024</option>
              <option value="3QCY">Q3 2024</option>
              <option value="4QCY">Q4 2024</option>
            </select>
            <button 
              onClick={fetchData}
              className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <i className="fas fa-sync mr-2"></i>Refresh
            </button>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="border-b border-slate-700">
        <nav className="flex space-x-8">
          {['overview', 'wip', 'projects', 'cashflow'].map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`py-3 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeView === view 
                  ? 'border-blue-500 text-blue-500' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {view === 'wip' ? 'WIP Reconciliation' : view}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Revenue YTD</span>
              <i className="fas fa-chart-line text-green-400"></i>
            </div>
            <div className="text-2xl font-bold text-gray-200">
              ${(data.wip?.cyBilledToDate / 1000000 || 0).toFixed(1)}M
            </div>
            <div className="text-xs text-green-400 mt-1">
              +{((data.wip?.cyBilledToDate - data.wip?.pyBilledToDate) / data.wip?.pyBilledToDate * 100 || 0).toFixed(1)}% vs PY
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Gross Margin</span>
              <i className="fas fa-percentage text-blue-400"></i>
            </div>
            <div className="text-2xl font-bold text-gray-200">
              {(data.wip?.grossMargin || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-blue-400 mt-1">Target: 35%</div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Active Projects</span>
              <i className="fas fa-hard-hat text-orange-400"></i>
            </div>
            <div className="text-2xl font-bold text-gray-200">{data.projects?.length || 0}</div>
            <div className="text-xs text-orange-400 mt-1">
              ${(data.projects?.reduce((sum, p) => sum + p.estimated, 0) / 1000000 || 0).toFixed(1)}M Total Value
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Cash Position</span>
              <i className="fas fa-dollar-sign text-green-400"></i>
            </div>
            <div className="text-2xl font-bold text-gray-200">
              ${(data.cashFlow?.operating / 1000000 || 0).toFixed(1)}M
            </div>
            <div className="text-xs text-green-400 mt-1">Healthy liquidity</div>
          </div>
        </div>
      )}

      {activeView === 'wip' && data.wip && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Revenue Recognition</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">CY Billed to Date</span>
                <span className="font-mono">${(data.wip.cyBilledToDate / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">PY Billed to Date</span>
                <span className="font-mono">${(data.wip.pyBilledToDate / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-700">
                <span className="text-gray-400 font-semibold">Revenue Earned</span>
                <span className="font-mono text-green-400">
                  ${(data.wip.revenueEarned / 1000000 || 0).toFixed(1)}M
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">Cost Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Direct COGS</span>
                <span className="font-mono">${(data.wip.directCOGS / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Unallocated COGS</span>
                <span className="font-mono">${(data.wip.unallocatedCOGS / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-700">
                <span className="text-gray-400 font-semibold">Total COGS</span>
                <span className="font-mono text-orange-400">
                  ${((data.wip.directCOGS + data.wip.unallocatedCOGS) / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-purple-400">Billing Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Overbilling</span>
                <span className="font-mono text-red-400">
                  ${(data.wip.priorOverbilling / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Underbilling</span>
                <span className="font-mono text-green-400">
                  ${(data.wip.priorUnderbilling / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-700">
                <span className="text-gray-400 font-semibold">Net Position</span>
                <span className="font-mono text-purple-400">
                  ${((data.wip.priorUnderbilling - data.wip.priorOverbilling) / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'projects' && data.projects && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Active Projects</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-400 uppercase bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left">Project</th>
                  <th className="px-6 py-3 text-right">Estimated</th>
                  <th className="px-6 py-3 text-right">Actual</th>
                  <th className="px-6 py-3 text-right">Variance</th>
                  <th className="px-6 py-3 text-right">Completion</th>
                </tr>
              </thead>
              <tbody>
                {data.projects.map((project, index) => (
                  <tr key={index} className="border-b border-slate-700">
                    <td className="px-6 py-4 font-medium text-gray-200">{project.name}</td>
                    <td className="px-6 py-4 text-right font-mono">
                      ${(project.estimated / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      ${(project.actual / 1000000).toFixed(1)}M
                    </td>
                    <td className={`px-6 py-4 text-right font-mono ${
                      project.variance < 0 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {project.variance.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-right">{project.completion.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'cashflow' && data.cashFlow && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-cyan-400">Cash Flow Statement</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Operating Activities</span>
              <span className={`font-mono ${data.cashFlow.operating > 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${(Math.abs(data.cashFlow.operating) / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Investing Activities</span>
              <span className={`font-mono ${data.cashFlow.investing > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.cashFlow.investing < 0 ? '-' : ''}${(Math.abs(data.cashFlow.investing) / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Financing Activities</span>
              <span className={`font-mono ${data.cashFlow.financing > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.cashFlow.financing < 0 ? '-' : ''}${(Math.abs(data.cashFlow.financing) / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between pt-4 border-t border-slate-700">
              <span className="text-gray-400 font-semibold">Net Change in Cash</span>
              <span className={`font-mono font-bold text-lg ${
                data.cashFlow.netChange > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {data.cashFlow.netChange < 0 ? '-' : ''}${(Math.abs(data.cashFlow.netChange) / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiamondBackDashboard;
