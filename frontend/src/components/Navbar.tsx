import React from 'react';
import { useFilter } from '../context/FilterContext';
import { Download, Filter, Flame, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    fiscalYear,
    setFiscalYear,
    selectedState,
    setSelectedState,
    includeLignite,
    setIncludeLignite,
  } = useFilter();

  const fiscalYears = [
    '2024-25',
    '2023-24',
    '2022-23',
    '2021-22',
    '2020-21',
    '2019-20',
    '2018-19',
  ];

  const states = [
    'All States',
    'UTTAR PRADESH',
    'MADHYA PRADESH',
    'CHHATISGARH',
    'MAHARASHTRA',
    'ODISHA',
    'WEST BENGAL',
    'JHARKHAND',
    'GUJARAT',
    'TAMIL NADU',
    'ANDHRA PRADESH',
    'TELANGANA',
    'KARNATAKA',
    'RAJASTHAN',
    'HARYANA',
    'PUNJAB',
    'BIHAR',
    'ASSAM',
  ];

  const handleDownloadPDF = () => {
    window.open(`/api/reports/pdf?fiscal_year=${fiscalYear}&fuel=${includeLignite ? 'ALL' : 'COAL'}`, '_blank');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      {/* Title & Context */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Indian Coal Fleet Intelligence
          </span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="text-xs text-slate-500 font-medium hidden sm:inline-block">
          CEA Baseline Harmonized
        </div>
      </div>

      {/* Global Filter Controls */}
      <div className="flex items-center flex-wrap gap-3">
        {/* Reporting Period */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 px-2">FY:</span>
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="bg-white text-xs font-medium text-slate-800 rounded px-2.5 py-1 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {fiscalYears.map((fy) => (
              <option key={fy} value={fy}>
                {fy}
              </option>
            ))}
          </select>
        </div>

        {/* State Filter */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 px-2">State:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value === 'All States' ? '' : e.target.value)}
            className="bg-white text-xs font-medium text-slate-800 rounded px-2.5 py-1 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {states.map((st) => (
              <option key={st} value={st === 'All States' ? '' : st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Fuel Scope Toggle */}
        <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-200/70 transition-colors">
          <input
            type="checkbox"
            checked={includeLignite}
            onChange={(e) => setIncludeLignite(e.target.checked)}
            className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
          />
          <span>Include Lignite (4.4%)</span>
        </label>

        {/* Export Report Action */}
        <button
          onClick={handleDownloadPDF}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export PDF Report</span>
        </button>
      </div>
    </header>
  );
};
