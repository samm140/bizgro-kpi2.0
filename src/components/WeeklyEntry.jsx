import React, { useState, useEffect } from 'react';
import { useMetrics } from './MetricsContext';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  DollarSign, Users, Briefcase, FileText, RefreshCw,
  Calendar, BarChart3, Activity, Database, Link,
  Download, History, Eye, EyeOff, ChevronLeft, ChevronRight
} from 'lucide-react';

const EnhancedWeeklyEntry = ({ onSubmit, onCancel }) => {
  const { updateWeeklyData } = useMetrics();
  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState('entry'); // 'entry', 'history', 'variance'
  const [historicalEntries, setHistoricalEntries] = useState([]);
  const [qboSyncStatus, setQboSyncStatus] = useState('disconnected');
  const [showComparison, setShowComparison] = useState(false);
  const [lastWeekData, setLastWeekData] = useState(null);
  
  const [formData, setFormData] = useState({
    weekEnding: '',
    // Accounting fields (matching DB schema)
    currentAR: '',
    retentionReceivables: '',
    currentAP: '',
    cashOnHand: '',
    cashInBank: '',
    locDrawn: '',
    savingsAccount: '',
    // Sales fields
    revenueBilledNet: '',
    retention: '',
    collections: '',
    grossProfitAccrual: '',
    gpmAccrual: '',
    cogsAccrual: '',
    grossWagesAccrual: '',
    changeOrders: '',
    // Job fields
    jobsWonAmount: '',
    jobsWonCount: '',
    jobsStartedAmount: '',
    jobsStartedCount: '',
    jobsCompleted: '',
    backlogAmount: '',
    backlogCount: '',
    wipAmount: '',
    wipCount: '',
    revLeftToBill: '',
    // Bid fields
    invitesExistingGC: '',
    invitesNewGC: '',
    newEstimatedJobs: '',
    totalEstimates: '',
    // Employee fields
    fieldW2Count: '',
    subsCount: '',
    fieldW2Amount: '',
    subsAmount: '',
    workersCompMod: '',
    supervisors: '',
    office: '',
    newHires: '',
    employeesFired: '',
    // Risk Metrics
    concentrationRisk: '',
    locLimit: '',
    overdueAR: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [varianceData, setVarianceData] = useState({});

  const steps = [
    {
      title: 'Week Information',
      icon: Calendar,
      fields: ['weekEnding'],
      description: 'Select the week ending date for this entry'
    },
    {
      title: 'Financial Position',
      icon: DollarSign,
      fields: ['currentAR', 'retentionReceivables', 'currentAP', 'cashInBank', 'cashOnHand', 'savingsAccount', 'overdueAR'],
      description: 'Current assets, liabilities, and cash positions'
    },
    {
      title: 'Revenue & Profitability',
      icon: TrendingUp,
      fields: ['revenueBilledNet', 'grossProfitAccrual', 'gpmAccrual', 'cogsAccrual', 'grossWagesAccrual', 'collections', 'retention', 'changeOrders'],
      description: 'Revenue recognition and profit metrics'
    },
    {
      title: 'Sales & Pipeline',
      icon: Activity,
      fields: ['invitesExistingGC', 'invitesNewGC', 'newEstimatedJobs', 'totalEstimates'],
      description: 'Bidding activity and pipeline metrics'
    },
    {
      title: 'Jobs & Projects',
      icon: Briefcase,
      fields: ['jobsWonAmount', 'jobsWonCount', 'jobsStartedAmount', 'jobsStartedCount', 'jobsCompleted', 'backlogAmount', 'backlogCount', 'wipAmount', 'wipCount', 'revLeftToBill'],
      description: 'Project status and backlog management'
    },
    {
      title: 'Workforce',
      icon: Users,
      fields: ['fieldW2Count', 'subsCount', 'fieldW2Amount', 'subsAmount', 'workersCompMod', 'supervisors', 'office', 'newHires', 'employeesFired'],
      description: 'Employee and contractor metrics'
    },
    {
      title: 'Risk & Credit',
      icon: AlertTriangle,
      fields: ['concentrationRisk', 'locDrawn', 'locLimit'],
      description: 'Risk metrics and credit utilization'
    }
  ];

  // Load historical data on mount
  useEffect(() => {
    loadHistoricalData();
    loadLastWeekData();
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('weeklyEntryDraft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Error loading saved draft:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('weeklyEntryDraft', JSON.stringify(formData));
  }, [formData]);

  const loadHistoricalData = () => {
    const entries = JSON.parse(localStorage.getItem('weekly_entries_history') || '[]');
    setHistoricalEntries(entries.sort((a, b) => new Date(b.weekEnding) - new Date(a.weekEnding)));
  };

  const loadLastWeekData = () => {
    const entries = JSON.parse(localStorage.getItem('weekly_entries_history') || '[]');
    if (entries.length > 0) {
      const sorted = entries.sort((a, b) => new Date(b.weekEnding) - new Date(a.weekEnding));
      setLastWeekData(sorted[0]);
    }
  };

  const calculateVariance = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getVarianceColor = (variance) => {
    if (!variance) return 'text-gray-400';
    const v = parseFloat(variance);
    if (Math.abs(v) <= 5) return 'text-green-400';
    if (Math.abs(v) <= 15) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Calculate GPM if we have revenue and gross profit
    if (name === 'grossProfitAccrual' || name === 'revenueBilledNet') {
      const revenue = name === 'revenueBilledNet' ? processedValue : formData.revenueBilledNet;
      const grossProfit = name === 'grossProfitAccrual' ? processedValue : formData.grossProfitAccrual;
      
      if (revenue && grossProfit) {
        const gpm = ((grossProfit / revenue) * 100).toFixed(2);
        setFormData(prev => ({
          ...prev,
          gpmAccrual: gpm
        }));
      }
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = (stepIndex) => {
    const stepFields = steps[stepIndex].fields;
    const newErrors = {};
    
    stepFields.forEach(field => {
      if (field === 'weekEnding' && !formData[field]) {
        newErrors[field] = 'Week ending date is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save to history
      const entries = JSON.parse(localStorage.getItem('weekly_entries_history') || '[]');
      const newEntry = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        createdBy: 'current_user' // In real app, get from auth context
      };
      entries.push(newEntry);
      localStorage.setItem('weekly_entries_history', JSON.stringify(entries));

      // Log sync if connected
      if (qboSyncStatus === 'synced') {
        const syncLog = JSON.parse(localStorage.getItem('qbo_sync_log') || '[]');
        syncLog.push({
          syncDate: new Date().toISOString(),
          syncType: 'manual',
          status: 'success',
          recordsSynced: Object.keys(formData).length
        });
        localStorage.setItem('qbo_sync_log', JSON.stringify(syncLog));
      }

      // Call parent onSubmit
      await onSubmit(newEntry);
      
      // Update metrics context
      const mockUpdatedData = {
        revenueYTD: 14204274 + parseFloat(formData.revenueBilledNet || 0),
        priorYearRevenue: 12680000,
        gpmAverage: parseFloat(formData.gpmAccrual || 34.08),
        activeProjects: parseFloat(formData.wipCount || 23),
        cashPosition: parseFloat(formData.cashInBank || 0) + parseFloat(formData.cashOnHand || 0) + parseFloat(formData.savingsAccount || 0),
        backlog: parseFloat(formData.backlogAmount || 21800000),
        currentAR: parseFloat(formData.currentAR || 0),
        currentAP: parseFloat(formData.currentAP || 0),
        allEntries: entries
      };
      
      updateWeeklyData(mockUpdatedData);
      
      // Clear draft
      localStorage.removeItem('weeklyEntryDraft');
      
      // Reset form
      setFormData({
        weekEnding: '',
        currentAR: '',
        retentionReceivables: '',
        currentAP: '',
        cashOnHand: '',
        cashInBank: '',
        locDrawn: '',
        savingsAccount: '',
        revenueBilledNet: '',
        retention: '',
        collections: '',
        grossProfitAccrual: '',
        gpmAccrual: '',
        cogsAccrual: '',
        grossWagesAccrual: '',
        changeOrders: '',
        jobsWonAmount: '',
        jobsWonCount: '',
        jobsStartedAmount: '',
        jobsStartedCount: '',
        jobsCompleted: '',
        backlogAmount: '',
        backlogCount: '',
        wipAmount: '',
        wipCount: '',
        revLeftToBill: '',
        invitesExistingGC: '',
        invitesNewGC: '',
        newEstimatedJobs: '',
        totalEstimates: '',
        fieldW2Count: '',
        subsCount: '',
        fieldW2Amount: '',
        subsAmount: '',
        workersCompMod: '',
        supervisors: '',
        office: '',
        newHires: '',
        employeesFired: '',
        concentrationRisk: '',
        locLimit: '',
        overdueAR: ''
      });
      
      setCurrentStep(0);
      loadHistoricalData();
      
    } catch (error) {
      console.error('Error submitting weekly data:', error);
      alert('Error submitting data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProgress = () => {
    const totalFields = Object.keys(formData).length - 1; // Exclude weekEnding
    const filledFields = Object.values(formData).filter(value => value !== '').length - 1;
    return Math.round((filledFields / totalFields) * 100);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(historicalEntries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `weekly_entries_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getFieldLabel = (fieldName) => {
    const labels = {
      weekEnding: 'Week Ending Date',
      currentAR: 'Current AR',
      retentionReceivables: 'Retention Receivables',
      currentAP: 'Current AP',
      cashInBank: 'Cash in Bank',
      cashOnHand: 'Cash on Hand',
      savingsAccount: 'Savings Account',
      overdueAR: 'Overdue AR (>60 days)',
      revenueBilledNet: 'Revenue Billed (Net)',
      grossProfitAccrual: 'Gross Profit',
      gpmAccrual: 'GP Margin %',
      cogsAccrual: 'COGS',
      grossWagesAccrual: 'Gross Wages',
      collections: 'Collections',
      retention: 'Retention',
      changeOrders: 'Change Orders',
      invitesExistingGC: 'Invites - Existing GC',
      invitesNewGC: 'Invites - New GC',
      newEstimatedJobs: 'New Estimates (#)',
      totalEstimates: 'Total Estimates ($)',
      jobsWonAmount: 'Jobs Won ($)',
      jobsWonCount: 'Jobs Won (#)',
      jobsStartedAmount: 'Jobs Started ($)',
      jobsStartedCount: 'Jobs Started (#)',
      jobsCompleted: 'Jobs Completed (#)',
      backlogAmount: 'Backlog ($)',
      backlogCount: 'Backlog (#)',
      wipAmount: 'WIP ($)',
      wipCount: 'WIP (#)',
      revLeftToBill: 'Revenue Left to Bill',
      fieldW2Count: 'Field W2 Employees',
      subsCount: 'Subcontractors',
      fieldW2Amount: 'Field W2 Cost',
      subsAmount: 'Subcontractor Cost',
      workersCompMod: 'Workers Comp Mod',
      supervisors: 'Supervisors',
      office: 'Office Staff',
      newHires: 'New Hires',
      employeesFired: 'Terminated',
      concentrationRisk: 'Customer Concentration %',
      locDrawn: 'LOC Drawn',
      locLimit: 'LOC Limit'
    };
    return labels[fieldName] || fieldName;
  };

  const getFieldType = (fieldName) => {
    if (fieldName === 'weekEnding') return 'date';
    if (fieldName === 'gpmAccrual' || fieldName === 'concentrationRisk' || fieldName === 'workersCompMod') return 'number';
    if (fieldName.includes('Count') || fieldName.includes('Number') || 
        fieldName === 'supervisors' || fieldName === 'office' ||
        fieldName === 'newHires' || fieldName === 'employeesFired' ||
        fieldName === 'jobsCompleted' || fieldName.includes('GC')) {
      return 'number';
    }
    return 'number';
  };

  const getFieldStep = (fieldName) => {
    if (fieldName === 'gpmAccrual' || fieldName === 'concentrationRisk') return '0.01';
    if (fieldName === 'workersCompMod') return '0.01';
    if (fieldName.includes('Count') || fieldName.includes('Number') || 
        fieldName === 'supervisors' || fieldName === 'office' ||
        fieldName === 'newHires' || fieldName === 'employeesFired' ||
        fieldName === 'jobsCompleted' || fieldName.includes('GC')) {
      return '1';
    }
    return '0.01';
  };

  const currentStepData = steps[currentStep];

  // View Mode: Entry Form
  if (viewMode === 'entry') {
    return (
      <div className="max-w-7xl mx-auto">
        {/* Header with View Toggle */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-200">Weekly Financial Entry</h2>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('entry')}
                  className={`px-3 py-1 rounded transition-colors ${
                    viewMode === 'entry' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Entry
                </button>
                <button
                  onClick={() => setViewMode('history')}
                  className={`px-3 py-1 rounded transition-colors ${
                    viewMode === 'history' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  History
                </button>
                <button
                  onClick={() => setViewMode('variance')}
                  className={`px-3 py-1 rounded transition-colors ${
                    viewMode === 'variance' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Variance
                </button>
              </div>
              
              {/* QBO Status */}
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                ${qboSyncStatus === 'synced' ? 'bg-green-900/50 text-green-400' : 
                  qboSyncStatus === 'syncing' ? 'bg-blue-900/50 text-blue-400' :
                  'bg-gray-700 text-gray-400'}`}>
                <Database className="w-3 h-3" />
                <span className="capitalize">{qboSyncStatus}</span>
              </div>
              
              <span className="text-sm text-gray-400">{calculateProgress()}% Complete</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* Step Indicator with Icons */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div 
                  className={`relative group cursor-pointer`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
                    ${index === currentStep ? 'bg-blue-600 text-white scale-110' : 
                      index < currentStep ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                    {index < currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-slate-900 text-xs text-gray-300 px-2 py-1 rounded whitespace-nowrap">
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${index < currentStep ? 'bg-green-600' : 'bg-gray-700'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-200">
                    Step {currentStep + 1}: {currentStepData.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{currentStepData.description}</p>
                </div>
                {showComparison && lastWeekData && (
                  <button
                    type="button"
                    onClick={() => setShowComparison(!showComparison)}
                    className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg text-sm flex items-center gap-2"
                  >
                    {showComparison ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showComparison ? 'Hide' : 'Show'} Comparison
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentStepData.fields.map(field => {
                const lastValue = lastWeekData?.[field];
                const currentValue = formData[field];
                const variance = currentValue && lastValue ? calculateVariance(currentValue, lastValue) : null;
                
                return (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {getFieldLabel(field)}
                      {field === 'weekEnding' && <span className="text-red-400 ml-1">*</span>}
                      {field === 'gpmAccrual' && formData.gpmAccrual && (
                        <span className="ml-2 text-xs text-blue-400">
                          (Auto-calculated)
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={getFieldType(field)}
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        step={getFieldStep(field)}
                        readOnly={field === 'gpmAccrual' && formData.grossProfitAccrual && formData.revenueBilledNet}
                        className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors
                          ${errors[field] ? 'border-red-500' : 'border-slate-600'}
                          ${field === 'gpmAccrual' && formData.gpmAccrual ? 'bg-slate-800' : ''}`}
                        placeholder={field === 'concentrationRisk' ? '0-100' : field === 'gpmAccrual' ? '0.00%' : '0.00'}
                      />
                      
                      {/* Comparison Indicator */}
                      {showComparison && lastValue !== undefined && currentValue && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            vs {typeof lastValue === 'number' ? lastValue.toLocaleString() : lastValue}
                          </span>
                          {variance && (
                            <span className={`text-xs font-medium ${getVarianceColor(variance)}`}>
                              {parseFloat(variance) > 0 ? '+' : ''}{variance}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {errors[field] && (
                      <p className="mt-1 text-sm text-red-400">{errors[field]}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-400 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              <div className="flex gap-3">
                {lastWeekData && (
                  <button
                    type="button"
                    onClick={() => setShowComparison(!showComparison)}
                    className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors"
                  >
                    {showComparison ? 'Hide' : 'Show'} Last Week
                  </button>
                )}
                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Entry
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Enhanced Quick Stats Preview */}
        {(formData.revenueBilledNet || formData.collections || formData.cashInBank) && (
          <div className="mt-6 bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-200">Entry Preview</h4>
              <span className="text-sm text-gray-400">
                Week Ending: {formData.weekEnding ? new Date(formData.weekEnding).toLocaleDateString() : 'Not set'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {formData.revenueBilledNet && (
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Revenue</div>
                  <div className="text-lg font-bold text-green-400">
                    ${(parseFloat(formData.revenueBilledNet) / 1000).toFixed(0)}k
                  </div>
                </div>
              )}
              {formData.collections && (
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Collections</div>
                  <div className="text-lg font-bold text-blue-400">
                    ${(parseFloat(formData.collections) / 1000).toFixed(0)}k
                  </div>
                </div>
              )}
              {formData.gpmAccrual && (
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">GP Margin</div>
                  <div className="text-lg font-bold text-purple-400">
                    {formData.gpmAccrual}%
                  </div>
                </div>
              )}
              {formData.currentAR && formData.currentAP && (
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Current Ratio</div>
                  <div className="text-lg font-bold text-orange-400">
                    {(parseFloat(formData.currentAR) / parseFloat(formData.currentAP)).toFixed(2)}x
                  </div>
                </div>
              )}
              {(formData.cashInBank || formData.cashOnHand || formData.savingsAccount) && (
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Total Cash</div>
                  <div className="text-lg font-bold text-cyan-400">
                    ${((parseFloat(formData.cashInBank || 0) + parseFloat(formData.cashOnHand || 0) + parseFloat(formData.savingsAccount || 0)) / 1000).toFixed(0)}k
                  </div>
                </div>
              )}
              {formData.backlogAmount && (
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Backlog</div>
                  <div className="text-lg font-bold text-amber-400">
                    ${(parseFloat(formData.backlogAmount) / 1000000).toFixed(1)}M
                  </div>
                </div>
              )}
            </div>
            
            {/* Key Ratios */}
            {(formData.locDrawn && formData.locLimit) && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">LOC Utilization</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min((parseFloat(formData.locDrawn) / parseFloat(formData.locLimit)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-200">
                        {((parseFloat(formData.locDrawn) / parseFloat(formData.locLimit)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  {formData.overdueAR && formData.currentAR && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">AR Quality</span>
                      <span className={`text-sm font-medium ${
                        (parseFloat(formData.overdueAR) / parseFloat(formData.currentAR)) > 0.2 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {(100 - (parseFloat(formData.overdueAR) / parseFloat(formData.currentAR)) * 100).toFixed(0)}% Current
                      </span>
                    </div>
                  )}
                  
                  {formData.concentrationRisk && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Concentration Risk</span>
                      <span className={`text-sm font-medium ${
                        parseFloat(formData.concentrationRisk) > 30 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {formData.concentrationRisk}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // View Mode: Historical Data
  if (viewMode === 'history') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-200">Historical Entries</h2>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('entry')}
                  className={`px-3 py-1 rounded transition-colors ${
                    viewMode === 'entry' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Entry
                </button>
                <button
                  onClick={() => setViewMode('history')}
                  className={`px-3 py-1 rounded transition-colors ${
                    viewMode === 'history' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  History
                </button>
                <button
                  onClick={() => setViewMode('variance')}
                  className={`px-3 py-1 rounded transition-colors ${
                    viewMode === 'variance' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Variance
                </button>
              </div>
              
              <button
                onClick={exportData}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {historicalEntries.length > 0 ? (
          <div className="space-y-4">
            {historicalEntries.map((entry, index) => (
              <div key={entry.id} className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">
                      Week Ending: {new Date(entry.weekEnding).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Submitted: {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-900/30 text-green-400 text-sm rounded-full">
                    Entry #{historicalEntries.length - index}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Revenue</div>
                    <div className="text-sm font-medium text-gray-200">
                      ${(parseFloat(entry.revenueBilledNet || 0) / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Collections</div>
                    <div className="text-sm font-medium text-gray-200">
                      ${(parseFloat(entry.collections || 0) / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">GP Margin</div>
                    <div className="text-sm font-medium text-gray-200">
                      {entry.gpmAccrual || 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Cash Position</div>
                    <div className="text-sm font-medium text-gray-200">
                      ${((parseFloat(entry.cashInBank || 0) + parseFloat(entry.cashOnHand || 0) + parseFloat(entry.savingsAccount || 0)) / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Jobs Won</div>
                    <div className="text-sm font-medium text-gray-200">
                      {entry.jobsWonCount || 0} / ${(parseFloat(entry.jobsWonAmount || 0) / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Backlog</div>
                    <div className="text-sm font-medium text-gray-200">
                      ${(parseFloat(entry.backlogAmount || 0) / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-12 border border-slate-700 text-center">
            <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No historical entries found</p>
            <button
              onClick={() => setViewMode('entry')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create First Entry
            </button>
          </div>
        )}
      </div>
    );
  }

  // View Mode: Variance Analysis
  if (viewMode === 'variance') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-200">Variance Analysis</h2>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('entry')}
                  className={`px-3 py-1 rounded transition-colors ${
                    viewMode === 'entry' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Entry
                </button>
                <button
                  onClick={() => setViewMode('history')}
                  className={`px-3 py-1 rounded transition-colors ${
                    viewMode === 'history' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  History
                </button>
                <button
                  onClick={() => setViewMode('variance')}
                  className={`px-3 py-1 rounded transition-colors ${
                    viewMode === 'variance' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Variance
                </button>
              </div>
            </div>
          </div>
        </div>

        {historicalEntries.length >= 2 ? (
          <div className="space-y-6">
            {/* Week-over-Week Comparison */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Week-over-Week Variance</h3>
              <div className="space-y-3">
                {['revenueBilledNet', 'collections', 'grossProfitAccrual', 'currentAR', 'cashInBank'].map(field => {
                  const current = historicalEntries[0][field];
                  const previous = historicalEntries[1][field];
                  const variance = calculateVariance(current, previous);
                  
                  return (
                    <div key={field} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <span className="text-sm text-gray-400">{getFieldLabel(field)}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-300">
                          ${(parseFloat(previous || 0) / 1000).toFixed(0)}k → ${(parseFloat(current || 0) / 1000).toFixed(0)}k
                        </span>
                        {variance && (
                          <span className={`text-sm font-medium ${getVarianceColor(variance)}`}>
                            {parseFloat(variance) > 0 ? '+' : ''}{variance}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trend Analysis */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">4-Week Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['revenueBilledNet', 'gpmAccrual', 'collections'].map(field => {
                  const last4Weeks = historicalEntries.slice(0, 4).reverse();
                  const values = last4Weeks.map(e => parseFloat(e[field] || 0));
                  const avg = values.reduce((a, b) => a + b, 0) / values.length;
                  const trend = values[values.length - 1] > values[0] ? 'up' : 'down';
                  
                  return (
                    <div key={field} className="bg-slate-900/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">{getFieldLabel(field)}</span>
                        {trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        4-Week Avg: {field === 'gpmAccrual' ? `${avg.toFixed(1)}%` : `$${(avg / 1000).toFixed(0)}k`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-12 border border-slate-700 text-center">
            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Need at least 2 entries for variance analysis</p>
            <button
              onClick={() => setViewMode('entry')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add More Entries
            </button>
          </div>
        )}
      </div>
    );
  }
};

export default EnhancedWeeklyEntry;
