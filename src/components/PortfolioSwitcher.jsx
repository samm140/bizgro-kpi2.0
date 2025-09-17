// src/components/PortfolioSwitcher.jsx
// ============================================
import React from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';

const PortfolioSwitcher = () => {
  const { 
    currentPortfolio, 
    accessiblePortfolios, 
    switchPortfolio,
    loading 
  } = usePortfolio();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <i className="fas fa-spinner fa-spin text-gray-400"></i>
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!currentPortfolio) {
    return (
      <div className="text-red-400">
        No portfolio selected
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        className="bg-slate-800 border border-slate-600 text-gray-200 rounded-lg px-4 py-2 pr-10 appearance-none cursor-pointer hover:bg-slate-700 transition-colors"
        value={currentPortfolio.id}
        onChange={(e) => switchPortfolio(e.target.value)}
      >
        {accessiblePortfolios.map(portfolio => (
          <option key={portfolio.id} value={portfolio.id}>
            {portfolio.name} ({portfolio.permission})
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <i className="fas fa-chevron-down text-gray-400"></i>
      </div>
    </div>
  );
};

export default PortfolioSwitcher;
