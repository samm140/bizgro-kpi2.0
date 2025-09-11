// File: src/components/WeeklyEntry.jsx
const weeklyEntryJsx = `import React, { useState } from 'react';

const WeeklyEntry = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    weekEnding: '',
    currentAR: '',
    retentionReceivables: '',
    currentAP: '',
    cashOnHand: '',
    cashInBank: '',
    revenueBilled: '',
    collections: '',
    grossProfit: '',
    gpmAccrual: '',
    invitationsExisting: '',
    invitationsNew: '',
    jobsWonCount: '',
    jobsWonAmount: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Weekly Financial Entry</h2>
      
      <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Week Info */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Week Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Week Ending</label>
                <input
                  type="date"
                  name="weekEnding"
                  value={formData.weekEnding}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-biz-primary focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Accounting Section */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Accounting</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Current AR</label>
                <input
                  type="number"
                  name="currentAR"
                  value={formData.currentAR}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-biz-primary focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Retention Receivables</label>
                <input
                  type="number"
                  name="retentionReceivables"
                  value={formData.retentionReceivables}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-biz-primary focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Cash on Hand</label>
                <input
                  type="number"
                  name="cashOnHand"
                  value={formData.cashOnHand}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-biz-primary focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Sales Section */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">Sales & Revenue</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Revenue Billed</label>
                <input
                  type="number"
                  name="revenueBilled"
                  value={formData.revenueBilled}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-biz-primary focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Collections</label>
                <input
                  type="number"
                  name="collections"
                  value={formData.collections}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-biz-primary focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">GPM %</label>
                <input
                  type="number"
                  name="gpmAccrual"
                  value={formData.gpmAccrual}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-biz-primary focus:outline-none"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-biz-primary hover:bg-blue-600 rounded-lg transition-colors font-semibold"
          >
            Submit to Sheets
          </button>
        </div>
      </form>
    </div>
  );
};

export default WeeklyEntry;`;
