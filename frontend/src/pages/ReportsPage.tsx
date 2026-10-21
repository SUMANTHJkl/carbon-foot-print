import React from 'react';
import { useFilter } from '../context/FilterContext';
import { FileText, Download, FileSpreadsheet, BookOpen, ExternalLink, CheckCircle2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { fiscalYear, fuel, includeLignite } = useFilter();

  const handleDownloadPDF = () => {
    window.open(`/api/reports/pdf?fiscal_year=${fiscalYear}&fuel=${fuel}`, '_blank');
  };

  const handleDownloadPlantsCSV = () => {
    window.open(`/api/plants/export?fuel=${fuel}&fiscal_year=${fiscalYear}`, '_blank');
  };

  const bibtex = `@misc{coalcarbon_india_2026,
  title = {CoalCarbon India: Carbon Footprint Intelligence for India's Coal Thermal Power Stations},
  author = {Deep Climate Analytics and Systems Engineering Team},
  year = {2026},
  publisher = {CoalCarbon India Open Analytics Platform},
  url = {https://github.com/coalcarbon-india/platform}
}`;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-600" />
          <span>Research Reports & Data Export Center</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Generate publication-ready academic reports, export filtered observational datasets, and review academic provenance.
        </p>
      </div>

      {/* Download Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Download Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm mb-1">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Official Academic Analytics Report (PDF)</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Comprehensive downloadable PDF containing executive summaries, problem statement scope, governing formulas, state rankings, top emitting stations, decarbonization stages, and uncertainty quantification.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs space-y-1 font-mono text-slate-600">
              <div>Scope: <b>{fuel === 'ALL' ? 'Coal + Lignite Fleet' : 'Pure Coal Fleet'}</b></div>
              <div>Reporting Period: <b>FY {fiscalYear}</b></div>
              <div>Engine: <b>ReportLab 5.0 High-Resolution Document Generator</b></div>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF Report ({fiscalYear})</span>
          </button>
        </div>

        {/* CSV Export Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 font-bold text-sm mb-1">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <span>Plant Observational Dataset (CSV)</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Raw and cleaned station metrics for the active reporting period. Includes verified coordinates, capacity (MW), net generation (GWh), total emissions (tonnes), specific intensity (t/MWh), and PLF.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs space-y-1 font-mono text-slate-600">
              <div>Format: <b>Comma-Separated Values (.csv)</b></div>
              <div>Encoding: <b>UTF-8 with Standard Headers</b></div>
              <div>Grain: <b>Power Station Station-Level Total</b></div>
            </div>
          </div>

          <button
            onClick={handleDownloadPlantsCSV}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Filtered Plants CSV ({fiscalYear})</span>
          </button>
        </div>
      </div>

      {/* Academic Citation & BibTeX */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Academic Citation & Research Attribution</span>
        </h3>
        <p className="text-xs text-slate-500">
          When referencing calculations or figures from CoalCarbon India in academic publications, theses, or policy whitepapers, please use the following citation:
        </p>

        <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto">
          <pre>{bibtex}</pre>
        </div>
      </div>
    </div>
  );
};
