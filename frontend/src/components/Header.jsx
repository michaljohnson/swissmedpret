import React from 'react';

export default function Header({ patientName = "Patient", caseNumber = "CASE-001" }) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SwissMedPreter</h1>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{patientName}</p>
          <p className="text-xs text-gray-500">Case: {caseNumber}</p>
        </div>
      </div>
    </header>
  );
}
