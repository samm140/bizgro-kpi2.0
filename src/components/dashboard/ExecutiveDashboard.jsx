import React from 'react';
import AgendaPanels from './AgendaPanels';
import { Calendar } from 'lucide-react';

export default function ExecutiveDashboard({ data }) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-5">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-200">Meeting Agendas</h3>
        </div>
        <p className="text-base text-gray-400">
          Standard agendas for KPI calls and board meetings. All calls are recorded with AI notetaker for documentation.
        </p>
      </div>
      
      {/* Agenda Panels */}
      <AgendaPanels />
    </div>
  );
}
