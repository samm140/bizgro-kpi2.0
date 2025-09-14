// src/components/portfolio/DiamondBackDashboard.jsx
import React, { useState } from 'react';

const DiamondBackDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('3QCY');

  // Mock data for demonstration
  const mockData = {
    revenue: 26400884.11,
    grossMargin: 32.53,
    projects: 3,
    cashPosition: 1122158
  };

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
              <p className="text-sm text-gray-400">Commercial Construction Specialist</p>
            </div>
          </div>
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
              ${(mockData.revenue / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-green-400 mt-1">+37.7% vs PY</div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Gross Margin</span>
              <i className="fas fa-percentage text-blue-400"></i>
            </div>
            <div className="text-2xl font-bold text-gray-200">
              {mockData.grossMargin.toFixed(1)}%
            </div>
            <div className="text-xs text-blue-400 mt-1">Target: 35%</div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Active Projects</span>
              <i className="fas fa-hard-hat text-orange-400"></i>
            </div>
            <div className="text-2xl font-bold text-gray-200">{mockData.projects}</div>
            <div className="text-xs text-orange-400 mt-1">$88.8M Total Value</div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Cash Position</span>
              <i className="fas fa-dollar-sign text-green-400"></i>
            </div>
            <div className="text-2xl font-bold text-gray-200">
              ${(mockData.cashPosition / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-green-400 mt-1">Healthy liquidity</div>
          </div>
        </div>
      )}

      {activeView === 'wip' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Revenue Recognition</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">CY Billed to Date</span>
                <span className="font-mono">$26.4M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">PY Billed to Date</span>
                <span className="font-mono">$19.2M</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-700">
                <span className="text-gray-400 font-semibold">Revenue Earned</span>
                <span className="font-mono text-green-400">$7.8M</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">Cost Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Direct COGS</span>
                <span className="font-mono">$5.2M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Unallocated COGS</span>
                <span className="font-mono">$0.7M</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-700">
                <span className="text-gray-400 font-semibold">Total COGS</span>
                <span className="font-mono text-orange-400">$5.9M</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-purple-400">Billing Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Overbilling</span>
                <span className="font-mono text-red-400">$0.9M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Underbilling</span>
                <span className="font-mono text-green-400">$0.8M</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-700">
                <span className="text-gray-400 font-semibold">Net Position</span>
                <span className="font-mono text-purple-400">-$0.1M</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'projects' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Active Projects</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-400 uppercase bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left">Project</th>
                  <th className="px-6 py-3 text-right">Estimated</th>
                  <th className="px-6 py-3 text-right">Actual</th>
                  <th className="px-6 py-3 text-right">Completion</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700">
                  <td className="px-6 py-4 font-medium text-gray-200">Alpha Tower</td>
                  <td className="px-6 py-4 text-right font-mono">$34.4M</td>
                  <td className="px-6 py-4 text-right font-mono">$25.1M</td>
                  <td className="px-6 py-4 text-right">73%</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-6 py-4 font-medium text-gray-200">Bravo Complex</td>
                  <td className="px-6 py-4 text-right font-mono">$52.2M</td>
                  <td className="px-6 py-4 text-right font-mono">$39.8M</td>
                  <td className="px-6 py-4 text-right">76%</td>
                </tr>
                <tr className="border-b border-slate-700">
                  <td className="px-6 py-4 font-medium text-gray-200">Charlie Plaza</td>
                  <td className="px-6 py-4 text-right font-mono">$2.2M</td>
                  <td className="px-6 py-4 text-right font-mono">$1.6M</td>
                  <td className="px-6 py-4 text-right">73%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'cashflow' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-cyan-400">Cash Flow Statement</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Operating Activities</span>
              <span className="font-mono text-green-400">$1.1M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Investing Activities</span>
              <span className="font-mono text-red-400">-$0.4M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Financing Activities</span>
              <span className="font-mono text-red-400">-$0.2M</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-slate-700">
              <span className="text-gray-400 font-semibold">Net Change in Cash</span>
              <span className="font-mono font-bold text-lg text-green-400">$0.5M</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiamondBackDashboard;
