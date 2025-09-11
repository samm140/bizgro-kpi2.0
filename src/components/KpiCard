// File: src/components/KpiCard.jsx
import React from 'react';

const KpiCard = ({ title, value, icon, iconColor, trendText, trendColor, footerText }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trendText && <p className={`${trendColor} text-xs mt-2`}>{trendText}</p>}
          {footerText && <p className="text-gray-400 text-xs mt-2">{footerText}</p>}
        </div>
        <i className={`fas ${icon} ${iconColor} text-xl`}></i>
      </div>
    </div>
  );
};

export default KpiCard;
