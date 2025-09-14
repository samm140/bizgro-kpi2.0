// src/components/portfolio/DiamondBackDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Radar } from 'recharts';
import { googleSheetsService } from '../../services/googleSheets';

const DiamondBackDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('3QCY');
  const [wipData, setWipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartsData, setChartsData] = useState(null);

  // Google Sheets configuration
  const DIAMONDBACK_SHEET_ID = import.meta.env.VITE_DIAMONDBACK_SHEET_ID;
  const WIP_RANGE = 'WIP!A1:Z100';
  const PL_RANGE = 'P&L!A1:Z100';
  const BS_RANGE = 'BalanceSheet!A1:Z100';

  useEffect(() => {
    fetchDiamondBackData();
  }, [selectedPeriod]);

  const fetchDiamondBackData = async () => {
    try {
      setLoading(true);
      
      if (DIAMONDBACK_SHEET_ID) {
        // Fetch from Google Sheets
        const [wipSheet, plSheet, bsSheet] = await Promise.all([
          googleSheetsService.getSheetData(DIAMONDBACK_SHEET_ID, WIP_RANGE),
          googleSheetsService.getSheetData(DIAMONDBACK_SHEET_ID, PL_RANGE),
          googleSheetsService.getSheetData(DIAMONDBACK_SHEET_ID, BS_RANGE)
        ]);
        
        // Process and set data
        const processedData = processSheetData(wipSheet, plSheet, bsSheet);
        setWipData(processedData);
        setChartsData(generateChartsData(processedData));
      } else {
        // Use mock data for demo
        setWipData(getMockData(selectedPeriod));
        setChartsData(generateChartsData(getMockData(selectedPeriod)));
      }
    } catch (error) {
      console.error('Error fetching DiamondBack data:', error);
      // Fallback to mock data
      setWipData(getMockData(selectedPeriod));
      setChartsData(generateChartsData(getMockData(selectedPeriod)));
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (period) => ({
    period: period,
    wip: {
      cyBilledToDate: 26400884.11,
      pyBilledToDate: 19179059.22,
      directCOGS: 5233002.86,
      unallocatedCOGS: 672684.04,
      priorOverbilling: 912542.26,
      priorUnderbilling: 785414.68,
      revenueEarned: 7756069.63,
      grossProfit: 2523066.77,
      grossMargin: 32.53
    },
    projects: [
      { name: 'Alpha Tower', estimated: 34405529, actual: 25099891, variance: -27.04, completion: 72.96 },
      { name: 'Bravo Complex', estimated: 52248601, actual: 39818053, variance: -23.79, completion: 76.21 },
      { name: 'Charlie Plaza', estimated: 2177000, actual: 1580000, variance: -27.41, completion: 72.59 }
    ],
    quarterly: {
      revenue: [6218032, 7421238, 7756069, 8100000],
      costs: [4153809, 5906948, 5233002, 5400000],
      grossProfit: [2064223, 1514290, 2523067, 2700000],
      quarters: ['1QCY', '2QCY', '3QCY', '4QCY (Projected)']
    },
    cashFlow: {
      operating: 1122158,
      investing: -445000,
      financing: -200000,
      netChange: 477158
    }
  });

  const generateChartsData = (data) => {
    if (!data) return null;
    
    return {
      // Gross Margin Trend Chart
      marginTrend: data.quarterly.quarters.map((q, i) => ({
        quarter: q,
        margin: ((data.quarterly.grossProfit[i] / data.quarterly.revenue[i]) * 100).toFixed(2),
        revenue: data.quarterly.revenue[i],
        profit: data.quarterly.grossProfit[i]
      })),
      
      // Project Performance Radar
      projectPerformance: data.projects.map(p => ({
        project: p.name,
        completion: p.completion,
        efficiency: 100 + p.variance, // Convert negative variance to efficiency score
        onBudget: p.variance > -10 ? 100 : 50
      })),
      
      // Cost Breakdown Donut
      costBreakdown: [
        { name: 'Direct Labor', value: data.wip.directCOGS * 0.45, color: '#3b82f6' },
        { name: 'Materials', value: data.wip.directCOGS * 0.35, color: '#10b981' },
        { name: 'Subcontractors', value: data.wip.directCOGS * 0.15, color: '#f59e0b' },
        { name: 'Overhead', value: data.wip.unallocatedCOGS, color: '#ef4444' }
      ],
      
      // Cash Flow Waterfall
      cashFlowWaterfall: [
        { name: 'Starting Cash', value: 1000000, cumulative: 1000000 },
        { name: 'Operating', value: data.cashFlow.operating, cumulative: 1000000 + data.cashFlow.operating },
        { name: 'Investing', value: data.cashFlow.investing, cumulative: 1000000 + data.cashFlow.operating + data.cashFlow.investing },
        { name: 'Financing', value: data.cashFlow.financing, cumulative: 1000000 + data.cashFlow.netChange },
        { name: 'Ending Cash', value: 0, cumulative: 1000000 + data.cashFlow.netChange }
      ]
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Company Info */}
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
          <div className="flex items-center space-x-4">
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
              onClick={fetchDiamondBackData}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <i className="fas fa-sync mr-2"></i>Refresh
            </button>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="border-b border-slate-700">
        <nav className="flex space-x-8">
          {['overview', 'wip', 'projects', 'cashflow', 'analysis'].map(view => (
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

      {/* Content Area */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* KPI Cards */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Revenue YTD</span>
              <i className="fas fa-chart-line text-green-400"></i>
            </div>
            <div className="text-2xl font-bold text-gray-200">
              ${(wipData?.wip.cyBilledToDate / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-green-400 mt-1">
              +37.7% vs PY
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Gross Margin</span>
              <i className="fas fa-percentage text-blue-400"></i>
            </div>
            <div className="text-2xl font-bold text-gray-200">
              {wipData?.wip.grossMargin.toFixed(1)}%
            </div>
            <div className="text-xs text-blue-400 mt-1">
              Target: 35%
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Active Projects</span>
              <i className="fas fa-hard-hat text-orange-400"></i>
            </div>
            <div className="text-2xl font-bold text-gray-200">
              {wipData?.projects.length || 0}
            </div>
            <div className="text-xs text-orange-400 mt-1">
              $88.8M Total Value
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Cash Position</span>
              <i className="fas fa-dollar-sign text-green-400"></i>
            </div>
            <div className="text-2xl font-bold text-gray-200">
              ${(wipData?.cashFlow.operating / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-green-400 mt-1">
              Healthy liquidity
            </div>
          </div>

          {/* Charts Grid */}
          <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Quarterly Performance</h3>
            <LineChart data={chartsData?.marginTrend} />
          </div>

          <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Cost Distribution</h3>
            <DoughnutChart data={chartsData?.costBreakdown} />
          </div>
        </div>
      )}

      {activeView === 'wip' && (
        <WIPReconciliationView data={wipData} />
      )}

      {activeView === 'projects' && (
        <ProjectAnalysisView projects={wipData?.projects} chartsData={chartsData} />
      )}

      {activeView === 'cashflow' && (
        <CashFlowView data={wipData?.cashFlow} chartData={chartsData?.cashFlowWaterfall} />
      )}

      {activeView === 'analysis' && (
        <FinancialAnalysisView data={wipData} />
      )}
    </div>
  );
};

// Chart Components
const LineChart = ({ data }) => {
  if (!data) return null;
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="quarter" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Line 
            type="monotone" 
            dataKey="margin" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            name="Gross Margin %"
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            name="Revenue"
            yAxisId="right"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

const DoughnutChart = ({ data }) => {
  if (!data) return null;
  
  return (
    <div className="h-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => `$${(value / 1000000).toFixed(2)}M`}
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Sub-view Components
const WIPReconciliationView = ({ data }) => {
  if (!data) return null;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-green-400">Revenue Recognition</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">CY Billed to Date</span>
            <span className="font-mono">${(data.wip.cyBilledToDate / 1000000).toFixed(2)}M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">PY Billed to Date</span>
            <span className="font-mono">${(data.wip.pyBilledToDate / 1000000).toFixed(2)}M</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-slate-700">
            <span className="text-gray-400 font-semibold">Revenue Earned</span>
            <span className="font-mono text-green-400">${(data.wip.revenueEarned / 1000000).toFixed(2)}M</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-orange-400">Cost Analysis</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Direct COGS</span>
            <span className="font-mono">${(data.wip.directCOGS / 1000000).toFixed(2)}M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Unallocated COGS</span>
            <span className="font-mono">${(data.wip.unallocatedCOGS / 1000000).toFixed(2)}M</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-slate-700">
            <span className="text-gray-400 font-semibold">Total COGS</span>
            <span className="font-mono text-orange-400">
              ${((data.wip.directCOGS + data.wip.unallocatedCOGS) / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-purple-400">Billing Status</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Overbilling</span>
            <span className="font-mono text-red-400">${(data.wip.priorOverbilling / 1000000).toFixed(2)}M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Underbilling</span>
            <span className="font-mono text-green-400">${(data.wip.priorUnderbilling / 1000000).toFixed(2)}M</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-slate-700">
            <span className="text-gray-400 font-semibold">Net Position</span>
            <span className="font-mono text-purple-400">
              ${((data.wip.priorUnderbilling - data.wip.priorOverbilling) / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="lg:col-span-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-800/30">
        <h3 className="text-xl font-semibold mb-4 text-blue-400">WIP Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-200">
              ${(data.wip.grossProfit / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-400 mt-1">Gross Profit</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-200">
              {data.wip.grossMargin.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400 mt-1">Gross Margin</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-200">
              ${(data.wip.revenueEarned / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-400 mt-1">Revenue Earned</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectAnalysisView = ({ projects, chartsData }) => {
  if (!projects) return null;
  
  return (
    <div className="space-y-6">
      {/* Project Table */}
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
                <th className="px-6 py-3 text-center">Health</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, idx) => (
                <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800/50">
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${project.completion}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400">{project.completion.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      project.variance > -5 ? 'bg-green-900/50 text-green-400' :
                      project.variance > -15 ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {project.variance > -5 ? 'On Track' :
                       project.variance > -15 ? 'At Risk' : 'Critical'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Performance Radar */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">Project Performance Matrix</h3>
        <RadarChart data={chartsData?.projectPerformance} />
      </div>
    </div>
  );
};

const CashFlowView = ({ data, chartData }) => {
  if (!data) return null;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-cyan-400">Cash Flow Statement</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Operating Activities</span>
              <span className={`font-mono ${data.operating > 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${(data.operating / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="text-xs text-gray-500 ml-4">
              • Collections from customers<br/>
              • Payments to suppliers and employees
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Investing Activities</span>
              <span className={`font-mono ${data.investing > 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${(data.investing / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="text-xs text-gray-500 ml-4">
              • Equipment purchases<br/>
              • Asset disposals
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Financing Activities</span>
              <span className={`font-mono ${data.financing > 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${(data.financing / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="text-xs text-gray-500 ml-4">
              • Loan proceeds/payments<br/>
              • Owner distributions
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-700">
            <div className="flex justify-between">
              <span className="text-gray-400 font-semibold">Net Change in Cash</span>
              <span className={`font-mono font-bold text-lg ${
                data.netChange > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${(data.netChange / 1000000).toFixed(2)}M
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-cyan-400">Cash Flow Waterfall</h3>
        <WaterfallChart data={chartData} />
      </div>
    </div>
  );
};

export default DiamondBackDashboard;
