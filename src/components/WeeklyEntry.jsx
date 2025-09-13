import React, { useState, useEffect } from 'react';
import { useMetrics } from './MetricsContext';

const EnhancedWeeklyEntry = ({ onSubmit, onCancel }) => {
  const { updateWeeklyData } = useMetrics();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    weekEnding: '',
    // Financial Position
    currentAR: '',
    retentionReceivables: '',
    currentAP: '',
    cashInBank: '',
    cashOnHand: '',
    overdueAR: '',
    // Revenue & Profitability
    revenueBilledToDate: '',
    grossProfitAccrual: '',
    cogsAccrual: '',
    grossWagesAccrual: '',
    collections: '',
    retention: '',
    changeOrders: '',
    // Sales & Pipeline
    invitesExistingGC: '',
    invitesNewGC: '',
    newEstimatedJobs: '',
    totalEstimates: '',
    jobsWonNumber: '',
    jobsWonDollar: '',
    // Project Management
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
    // Risk Metrics
    concentrationRisk: '',
    locDrawn: '',
    locLimit: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    {
      title: 'Week Information',
      fields: ['weekEnding']
    },
    {
      title: 'Financial Position',
      fields: ['currentAR', 'retentionReceivables', 'currentAP', 'cashInBank', 'cashOnHand', 'overdueAR']
    },
    {
      title: 'Revenue & Profitability',
      fields: ['revenueBilledToDate', 'grossProfitAccrual', 'cogsAccrual', 'grossWagesAccrual', 'collections', 'retention', 'changeOrders']
    },
    {
      title: 'Sales & Pipeline',
      fields: ['invitesExistingGC', 'invitesNewGC', 'newEstimatedJobs', 'totalEstimates', 'jobsWonNumber', 'jobsWonDollar']
    },
    {
      title: 'Project Management',
      fields: ['jobsStartedNumber', 'jobsStartedDollar', 'jobsCompleted', 'upcomingJobsDollar', 'wipDollar', 'revLeftToBill']
    },
    {
      title: 'Workforce',
      fields: ['fieldEmployees', 'supervisors', 'office', 'newHires', 'employeesFired']
    },
    {
      title: 'Risk & Review',
      fields: ['concentrationRisk', 'locDrawn', 'locLimit']
    }
  ];

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

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
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
      // Add more validation as needed
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
      // Call the parent onSubmit function
      await onSubmit(formData);
      
      // Update context with new data
      // Mock API call - in real app, this would fetch updated data from server
      const mockUpdatedData = {
        revenueYTD: 14204274,
        priorYearRevenue: 12680000,
        gpmAverage: 34.08,
        activeProjects: 23,
        cashPosition: 1044957,
        weeks: ['W31', 'W32', 'W33', 'W34', 'W35', 'W36'],
        weeklyRevenue: [60929, 574503, 227737, 167973, 8828, parseFloat(formData.revenueBilledToDate || 0)],
        weeklyCollections: [206426, 151413, 337294, 323508, 259749, parseFloat(formData.collections || 0)],
        gpmTrend: [28.5, 26.3, 31.2, 29.8, 30.5, parseFloat(formData.grossProfitAccrual || 0) / parseFloat(formData.revenueBilledToDate || 1) * 100],
        currentAR: parseFloat(formData.currentAR || 0),
        currentAP: parseFloat(formData.currentAP || 0),
        cashOnHand: parseFloat(formData.cashOnHand || 0),
        backlog: 21800000,
        allEntries: [
          ...JSON.parse(localStorage.getItem('bizgro_kpi_data') || '{}').allEntries || [],
          formData
        ]
      };
      
      // Update the metrics context
      updateWeeklyData(mockUpdatedData);
      
      // Clear the draft
      localStorage.removeItem('weeklyEntryDraft');
      
      // Reset form
      setFormData({
        weekEnding: '',
        currentAR: '',
        retentionReceivables: '',
        currentAP: '',
        cashInBank: '',
        cashOnHand: '',
        overdueAR: '',
        revenueBilledToDate: '',
        grossProfitAccrual: '',
        cogsAccrual: '',
        grossWagesAccrual: '',
        collections: '',
        retention: '',
        changeOrders: '',
        invitesExistingGC: '',
        invitesNewGC: '',
        newEstimatedJobs: '',
        totalEstimates: '',
        jobsWonNumber: '',
        jobsWonDollar: '',
        jobsStartedNumber: '',
        jobsStartedDollar: '',
        jobsCompleted: '',
        upcomingJobsDollar: '',
        wipDollar: '',
        revLeftToBill: '',
        fieldEmployees: '',
        supervisors: '',
        office: '',
        newHires: '',
        employeesFired: '',
        concentrationRisk: '',
        locDrawn: '',
        locLimit: ''
      });
      
      setCurrentStep(0);
    } catch (error) {
      console.error('Error submitting weekly data:', error);
      alert('Error submitting data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProgress = () => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(value => value !== '').length;
    return Math.round((filledFields / totalFields) * 100);
  };

  const getFieldLabel = (fieldName) => {
    const labels = {
      weekEnding: 'Week Ending Date',
      currentAR: 'Current AR $',
      retentionReceivables: 'Retention Receivables',
      currentAP: 'Current AP $',
      cashInBank: 'Cash in Bank',
      cashOnHand: 'Cash on Hand (QuickBooks)',
      overdueAR: 'Overdue AR (>60 days)',
      revenueBilledToDate: 'Revenue Billed to Date',
      grossProfitAccrual: 'Gross Profit Accrual',
      cogsAccrual: 'COGS Accrual',
      grossWagesAccrual: 'Gross Wages Accrual',
      collections: 'Collections',
      retention: 'Retention',
      changeOrders: 'Change Orders',
      invitesExistingGC: 'Invites from Existing GC',
      invitesNewGC: 'Invites from New GC',
      newEstimatedJobs: 'New Estimated Jobs',
      totalEstimates: 'Total Estimates $',
      jobsWonNumber: 'Jobs Won #',
      jobsWonDollar: 'Jobs Won $',
      jobsStartedNumber: 'Jobs Started #',
      jobsStartedDollar: 'Jobs Started $',
      jobsCompleted: 'Jobs Completed',
      upcomingJobsDollar: 'Upcoming Jobs $',
      wipDollar: 'WIP $',
      revLeftToBill: 'Rev Left to Bill on Jobs in WIP',
      fieldEmployees: 'Field Employees',
      supervisors: 'Supervisors',
      office: 'Office Staff',
      newHires: 'New Hires',
      employeesFired: 'Employees Terminated',
      concentrationRisk: 'Customer Concentration %',
      locDrawn: 'LOC Drawn',
      locLimit: 'LOC Limit'
    };
    return labels[fieldName] || fieldName;
  };

  const getFieldType = (fieldName) => {
    if (fieldName === 'weekEnding') return 'date';
    if (fieldName === 'concentrationRisk') return 'number';
    if (fieldName.includes('Number') || fieldName.includes('Employees') || 
        fieldName.includes('Hires') || fieldName.includes('Fired') ||
        fieldName.includes('supervisors') || fieldName.includes('office') ||
        fieldName.includes('Completed') || fieldName.includes('GC')) {
      return 'number';
    }
    return 'number';
  };

  const getFieldStep = (fieldName) => {
    if (fieldName === 'concentrationRisk') return '1';
    if (fieldName.includes('Number') || fieldName.includes('Employees') || 
        fieldName.includes('supervisors') || fieldName.includes('office')) {
      return '1';
    }
    return '0.01';
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-200">Weekly Financial Entry</h2>
          <span className="text-sm text-gray-400">{calculateProgress()}% Complete</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors cursor-pointer
                ${index === currentStep ? 'bg-blue-600 text-white' : 
                  index < currentStep ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
              onClick={() => setCurrentStep(index)}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${index < currentStep ? 'bg-green-600' : 'bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-semibold mb-6 text-gray-200">
            Step {currentStep + 1}: {currentStepData.title}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentStepData.fields.map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {getFieldLabel(field)}
                  {field === 'weekEnding' && <span className="text-red-400">*</span>}
                </label>
                <input
                  type={getFieldType(field)}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  step={getFieldStep(field)}
                  className={`w-full px-4 py-2 bg-slate-900 border rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors
                    ${errors[field] ? 'border-red-500' : 'border-slate-600'}`}
                  placeholder={field === 'concentrationRisk' ? '0-100' : '0.00'}
                />
                {errors[field] && (
                  <p className="mt-1 text-sm text-red-400">{errors[field]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
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
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Next
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
                      <i className="fas fa-check mr-2"></i>
                      Submit Entry
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Quick Stats Preview */}
      {formData.revenueBilledToDate && formData.collections && (
        <div className="mt-6 bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Quick Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.revenueBilledToDate && (
              <div>
                <div className="text-xs text-gray-500">Revenue</div>
                <div className="text-lg font-bold text-green-400">
                  ${(parseFloat(formData.revenueBilledToDate) / 1000).toFixed(0)}k
                </div>
              </div>
            )}
            {formData.collections && (
              <div>
                <div className="text-xs text-gray-500">Collections</div>
                <div className="text-lg font-bold text-blue-400">
                  ${(parseFloat(formData.collections) / 1000).toFixed(0)}k
                </div>
              </div>
            )}
            {formData.grossProfitAccrual && formData.revenueBilledToDate && (
              <div>
                <div className="text-xs text-gray-500">GP Margin</div>
                <div className="text-lg font-bold text-purple-400">
                  {((parseFloat(formData.grossProfitAccrual) / parseFloat(formData.revenueBilledToDate)) * 100).toFixed(1)}%
                </div>
              </div>
            )}
            {formData.currentAR && formData.currentAP && (
              <div>
                <div className="text-xs text-gray-500">Current Ratio</div>
                <div className="text-lg font-bold text-orange-400">
                  {(parseFloat(formData.currentAR) / parseFloat(formData.currentAP)).toFixed(2)}x
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyEntry;
