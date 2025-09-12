import React, { useState, useEffect } from 'react';

const HistoricalDataView = ({ data = [], onEdit, onDelete }) => {
  const [filteredData, setFilteredData] = useState(data);
  const [sortConfig, setSortConfig] = useState({ key: 'weekEndDate', direction: 'desc' });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    year: new Date().getFullYear()
  });

  useEffect(() => {
    let filtered = [...data];

    if (filters.startDate) {
      filtered = filtered.filter(row => 
        new Date(row.weekEndDate) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(row => 
        new Date(row.weekEndDate) <= new Date(filters.endDate)
      );
    }
    if (filters.year) {
      filtered = filtered.filter(row => 
        row.year === parseInt(filters.year)
      );
    }

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredData(filtered);
  }, [data, filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatCurrency = (value) => {
    if (!value) return '-';
    return '$' + parseFloat(value).toLocaleString('en-US');
  };

  const formatPercent = (value) => {
    if (!value) return '-';
    return parseFloat(value).toFixed(1) + '%';
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value})}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-gray-200"
            >
              <option value="">All</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-600">
                <th 
                  className="p-3 text-left text-xs font-semibold text-gray-400 uppercase cursor-pointer"
                  onClick={() => handleSort('weekEndDate')}
                >
                  Week Ending
                </th>
                <th 
                  className="p-3 text-left text-xs font-semibold text-gray-400 uppercase cursor-pointer"
                  onClick={() => handleSort('revenueBilled')}
                >
                  Revenue
                </th>
                <th 
                  className="p-3 text-left text-xs font-semibold text-gray-400 uppercase cursor-pointer"
                  onClick={() => handleSort('collections')}
                >
                  Collections
                </th>
                <th 
                  className="p-3 text-left text-xs font-semibold text-gray-400 uppercase cursor-pointer"
                  onClick={() => handleSort('gpmAccrual')}
                >
                  GPM %
                </th>
                <th className="p-3 text-center text-xs font-semibold text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/30">
                  <td className="p-3 text-sm text-gray-200">
                    {new Date(row.weekEndDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-sm text-gray-200">
                    {formatCurrency(row.revenueBilled)}
                  </td>
                  <td className="p-3 text-sm text-gray-200">
                    {formatCurrency(row.collections)}
                  </td>
                  <td className="p-3 text-sm text-gray-200">
                    {formatPercent(row.gpmAccrual)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onEdit && onEdit(row)}
                      className="px-2 py-1 bg-blue-900/50 hover:bg-blue-900/70 text-blue-400 rounded text-xs mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(row.id || index)}
                      className="px-2 py-1 bg-red-900/50 hover:bg-red-900/70 text-red-400 rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No data found</p>
        </div>
      )}
    </div>
  );
};

export default HistoricalDataView;
