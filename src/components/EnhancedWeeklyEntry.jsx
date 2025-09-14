import React, { useState, useCallback, useMemo } from 'react';

const EnhancedWeeklyEntry = ({ onSubmit, onCancel }) => {
  console.log('EnhancedWeeklyEntry component loaded!');
  
  const [formData, setFormData] = useState({
    weekEnding: new Date().toISOString().split('T')[0],
    // Accounting & Cash
    currentAR: '',
    retentionReceivables: '',
    overdueAR: '',
    currentAP: '',
    cashOnHand: '',
    cashInBank: '',
    // Sales & Revenue
    revenueBilledToDate: '',
    retention: '',
    collections: '',
    changeOrders: '',
    // Profitability & Costs
    grossProfitAccrual: '',
    cogsAccrual: '',
    grossWagesAccrual: '',
    // Bids & Funnel
    invitesExistingGC: '',
    invitesNewGC: '',
    newEstimatedJobs: '',
    totalEstimates: '',
    jobsWonNumber: '',
    jobsWonDollar: '',
    // Projects & Backlog
    jobsStartedNumber: '',
    jobsStartedDollar: '',
    jobsCompleted: '',
    upcomingJobsDollar: '',
    wipDollar: '',
    revLeftToBill: '',
    // Workforce
    fieldEmployees: '',
    supervisors: '',
    office: '',
    newHires: '',
    employeesFired: '',
    // Risk
    concentrationRisk: ''
  });

  const [expandedSections, setExpandedSections] = useState({
    accounting: true,
    sales: false,
    profitability: false,
    bids: false,
    projects: false,
    workforce: false,
    risk: false
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Use useCallback to prevent function recreation on every render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.weekEnding) errors.weekEnding = 'Week ending date is required';
    if (!formData.revenueBilledToDate) errors.revenueBilledToDate = 'Revenue is required';
    if (!formData.collections) errors.collections = 'Collections is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  }, [formData, validateForm, onSubmit]);

  // Memoize calculations to prevent unnecessary recalculation
  const quickMetrics = useMemo(() => {
    const pFloat = (val) => parseFloat(val) || 0;
    const cashTotal = pFloat(formData.cashInBank) + pFloat(formData.cashOnHand);
    const currentRatio = formData.currentAP ? 
      ((cashTotal + pFloat(formData.currentAR)) / pFloat(formData.currentAP)).toFixed(2) : 'N/A';
    const grossMargin = formData.revenueBilledToDate ? 
      ((pFloat(formData.grossProfitAccrual) / pFloat(formData.revenueBilledToDate)) * 100).toFixed(1) : 'N/A';
    
    return { cashTotal, currentRatio, grossMargin };
  }, [formData.cashInBank, formData.cashOnHand, formData.currentAR, formData.currentAP, 
      formData.grossProfitAccrual, formData.revenueBilledToDate]);

  // Define sections data outside of render to prevent recreation
  const sections = useMemo(() => [
    { 
      title: 'Accounting & Cash', 
      color: 'text-green-400',
      icon: '📊',
      sectionKey: 'accounting',
      fields: [
        { name: 'currentAR', label: 'Current AR', prefix: '$' },
        { name: 'retentionReceivables', label: 'Retention Receivables', prefix: '$' },
        { name: 'overdueAR', label: 'Overdue AR (>90 days)', prefix: '$' },
        { name: 'currentAP', label: 'Current AP', prefix: '$' },
        { name: 'cashOnHand', label: 'Cash on Hand (QB)', prefix: '$' },
        { name: 'cashInBank', label: 'Cash in Bank', prefix: '$' }
      ] 
    },
    { 
      title: 'Sales & Revenue', 
      color: 'text-orange-400',
      icon: '💰',
      sectionKey: 'sales',
      fields: [
        { name: 'revenueBilledToDate', label: 'Revenue Billed', prefix: '$', required: true },
        { name: 'retention', label: 'Retention', prefix: '$' },
        { name: 'collections', label: 'Collections (Deposits)', prefix: '$', required: true },
        { name: 'changeOrders', label: 'Change Orders', prefix: '$' }
      ] 
    },
    { 
      title: 'Profitability & Costs', 
      color: 'text-yellow-400',
      icon: '📈',
      sectionKey: 'profitability',
      fields: [
        { name: 'grossProfitAccrual', label: 'Gross Profit (Accrual)', prefix: '$' },
        { name: 'cogsAccrual', label: 'COGS (Accrual)', prefix: '$' },
        { name: 'grossWagesAccrual', label: 'Gross Wages (Accrual)', prefix: '$' }
      ] 
    },
    { 
      title: 'Bids & Funnel', 
      color: 'text-purple-400',
      icon: '🎯',
      sectionKey: 'bids',
      fields: [
        { name: 'invitesExistingGC', label: 'Invites - Existing GCs' },
        { name: 'invitesNewGC', label: 'Invites - New GCs' },
        { name: 'newEstimatedJobs', label: 'New Estimated Jobs #' },
        { name: 'totalEstimates', label: 'Total Estimates', prefix: '$' },
        { name: 'jobsWonNumber', label: 'Jobs Won #' },
        { name: 'jobsWonDollar', label: 'Jobs Won', prefix: '$' }
      ] 
    },
    { 
      title: 'Projects & Backlog', 
      color: 'text-cyan-400',
      icon: '🏗️',
      sectionKey: 'projects',
      fields: [
        { name: 'jobsStartedNumber', label: 'Jobs Started #' },
        { name: 'jobsStartedDollar', label: 'Jobs Started', prefix: '$' },
        { name: 'jobsCompleted', label: 'Jobs Completed #' },
        { name: 'upcomingJobsDollar', label: 'Upcoming Jobs / Backlog', prefix: '$' },
        { name: 'wipDollar', label: 'WIP', prefix: '$' },
        { name: 'revLeftToBill', label: 'Revenue Left to Bill', prefix: '$' }
      ] 
    },
    { 
      title: 'Workforce', 
      color: 'text-indigo-400',
      icon: '👥',
      sectionKey: 'workforce',
      fields: [
        { name: 'fieldEmployees', label: 'Field Employees' },
        { name: 'supervisors', label: 'Supervisors' },
        { name: 'office', label: 'Office' },
        { name: 'newHires', label: 'New Hires' },
        { name: 'employeesFired', label: 'Employees Fired/Lost' }
      ] 
    },
    {
      title: 'Risk Metrics',
      color: 'text-rose-400',
      icon: '⚠️',
      sectionKey: 'risk',
      fields: [
        { name: 'concentrationRisk', label: 'Top Customer Concentration %', type: 'number', step: '0.01', placeholder: '35' }
      ]
    }
  ], []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Weekly Financial Entry</h2>
            <p className="text-gray-400 text-sm">
              Complete all sections for comprehensive financial tracking and insights generation.
            </p>
          </div>
          {/* Quick Metrics Display */}
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
            <h4 className="text-xs text-gray-500 mb-2">Quick Calculations</h4>
            <div className="space-y-1">
              <div className="flex justify-between items-center gap-4">
                <span className="text-xs text-gray-400">Cash Total:</span>
                <span className="text-sm font-semibold text-green-400">
                  ${quickMetrics.cashTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-xs text-gray-400">Current Ratio:</span>
                <span className="text-sm font-semibold text-blue-400">
                  {quickMetrics.currentRatio}x
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-xs text-gray-400">Gross Margin:</span>
                <span className="text-sm font-semibold text-yellow-400">
                  {quickMetrics.grossMargin}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
        {/* Week Ending Date - Always Visible */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="weekEnding" className="block text-sm text-gray-400 mb-1">
                Week Ending Date <span className="text-rose-400">*</span>
              </label>
              <input 
                type="date" 
                id="weekEnding" 
                name="weekEnding"
                value={formData.weekEnding}
                onChange={handleChange}
                required
                className={`
                  form-input w-full px-3 py-2 bg-slate-900 border rounded-lg 
                  placeholder:text-gray-500 hover:border-slate-600 
                  focus:border-biz-primary focus:outline-none transition-colors
                  ${validationErrors.weekEnding ? 'border-rose-500' : 'border-slate-700'}
                `}
              />
              {validationErrors.weekEnding && (
                <p className="text-xs text-rose-400 mt-1">{validationErrors.weekEnding}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Form Progress</span>
            <span>{Object.values(formData).filter(v => v).length} / {Object.keys(formData).length} fields</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 mt-1">
            <div 
              className="bg-biz-primary h-2 rounded-full transition-all"
              style={{ width: `${(Object.values(formData).filter(v => v).length / Object.keys(formData).length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Form Sections */}
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.sectionKey} className="border border-slate-700 rounded-xl hover:border-slate-600 transition-colors">
              <button 
                type="button"
                onClick={() => toggleSection(section.sectionKey)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-800/30 transition-colors"
              >
                <h3 className={`text-lg font-semibold ${section.color} flex items-center gap-2`}>
                  {section.icon} {section.title}
                </h3>
                <i className={`fas transition-transform ${expandedSections[section.sectionKey] ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              </button>
              {expandedSections[section.sectionKey] && (
                <div className="p-4 border-t border-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                    {section.fields.map(field => (
                      <div key={field.name}>
                        <label htmlFor={field.name} className="block text-sm text-gray-400 mb-1">
                          {field.label} {field.required && <span className="text-rose-400">*</span>}
                        </label>
                        <div className="relative">
                          {field.prefix && (
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              {field.prefix}
                            </span>
                          )}
                          <input 
                            type={field.type || 'number'} 
                            id={field.name} 
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            step={field.step || 'any'} 
                            required={field.required}
                            className={`
                              form-input w-full px-3 py-2 bg-slate-900 border rounded-lg 
                              placeholder:text-gray-500 hover:border-slate-600 
                              focus:border-biz-primary focus:outline-none transition-colors
                              ${field.prefix ? 'pl-8' : ''}
                              ${validationErrors[field.name] ? 'border-rose-500' : 'border-slate-700'}
                            `}
                            placeholder={field.placeholder || '0'}
                          />
                        </div>
                        {validationErrors[field.name] && (
                          <p className="text-xs text-rose-400 mt-1">{validationErrors[field.name]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            * Required fields
          </div>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-biz-primary hover:bg-blue-600 rounded-lg transition-colors font-semibold flex items-center gap-2"
            >
              <i className="fas fa-save"></i>
              Submit Weekly Data
            </button>
          </div>
        </div>
      </form>
      
      {/* Help Text */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Pro tip: Use Tab to navigate between fields quickly
      </div>
    </div>
  );
};

export default EnhancedWeeklyEntry;
