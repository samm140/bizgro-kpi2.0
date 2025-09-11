// File: src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-biz-primary mx-auto mb-4"></div>
        <p>Loading Dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
