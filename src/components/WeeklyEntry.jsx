// File: src/components/WeeklyEntry.jsx
import React, { useState } from 'react';

const WeeklyEntry = ({ onSubmit }) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    weekEnding: '',
    revenueBilled: '',
    collections: '',
    gpmAccrual: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(formData);
    setSubmitting(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Weekly Financial Entry</h2>
      
      <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Week Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Week Ending Date</label>
                <input
                  type="date"
                  name="weekEnding"
                  value={formData.weekEnding}
                  onChange={handleChange}
                  required
                  className="form-input w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-400">Sales & Revenue</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Revenue Billed ($)</label>
                <input
                  type="number"
                  name="revenueBilled"
                  value={formData.revenueBilled}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="form-input w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Collections ($)</label>
                <input
                  type="number"
                  name="collections"
                  value={formData.collections}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="form-input w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">GPM %</label>
                <input
                  type="number"
                  step="0.01"
                  name="gpmAccrual"
                  value={formData.gpmAccrual}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="form-input w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-biz-primary hover:bg-blue-600 rounded-lg transition-colors font-semibold disabled:bg-slate-500 disabled:cursor-not-allowed flex items-center"
          >
            <span>{submitting ? 'Submitting...' : 'Submit to Sheets'}</span>
            {submitting && (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WeeklyEntry;
