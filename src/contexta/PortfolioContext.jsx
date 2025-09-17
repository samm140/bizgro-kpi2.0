// src/contexts/PortfolioContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Portfolio Context for managing multi-company data
const PortfolioContext = createContext();

// Custom hook for using portfolio context
export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
};
