import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck, CheckCircle2, Flame, Layers } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-600" />
          <span>Methodology, Mathematical Formulations & Data Sources</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Scientific documentation of carbon accounting equations, empirical data sources, scope boundaries, and verification against official government benchmarks.
        </p>
      </div>

      {/* Problem Statement & Scope */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Academic Research Framework
        </span>
        <h2 className="text-lg font-bold text-slate-900">
          Problem Statement: "Carbon Footprint Analysis of Electricity Generation Sources"
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          This platform executes an empirical carbon footprint intelligence architecture exclusively focused on Indian coal-fired thermal power stations. While coal represents the primary fuel for baseload grid reliability in India (generating ~72% of total electricity), it accounts for the largest fraction of national power sector greenhouse gas emissions. Lignite-fired stations are strictly classified into a segregated fuel category and excluded from default calculations unless explicitly selected.
        </p>
      </div>

      {/* Governing Equations Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Flame className="w-4 h-4 text-emerald-600" />
          <span>Core Carbon Accounting Formulations</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono space-y-1.5">
            <span className="font-bold text-slate-800 text-[11px] block font-sans uppercase">
              1. Generation-Weighted Carbon Intensity
            </span>
            <div className="text-emerald-800 font-bold text-sm">
              Intensity (tCO₂/MWh) = Σ CO₂ (tonnes) / Σ Net Gen (MWh)
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Equal to kgCO₂/kWh. Divides aggregate carbon emissions by total net electricity injected into the grid.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono space-y-1.5">
            <span className="font-bold text-slate-800 text-[11px] block font-sans uppercase">
              2. Intensity Metric Unit Conversion
            </span>
            <div className="text-emerald-800 font-bold text-sm">
              Intensity (gCO₂/kWh) = Intensity (tCO₂/MWh) × 1,000
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              1 tCO₂ = 10⁶ g; 1 MWh = 10³ kWh. Exactly equivalent conversion.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono space-y-1.5">
            <span className="font-bold text-slate-800 text-[11px] block font-sans uppercase">
              3. Plant Load Factor (PLF)
            </span>
            <div className="text-emerald-800 font-bold text-sm">
              PLF (%) = (Gen MWh / (Capacity MW × Hours in Period)) × 100%
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Hours in period = 8,760 hours (non-leap year) or 8,784 hours (leap year FY 2019-20, FY 2023-24).
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono space-y-1.5">
            <span className="font-bold text-slate-800 text-[11px] block font-sans uppercase">
              4. Coal Consumption Intensity
            </span>
            <div className="text-emerald-800 font-bold text-sm">
              Coal Intensity (kg/kWh) = Coal Consumed (kg) / Gen (kWh)
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Specific fuel burn rate. Standard subcritical Indian stations average 0.65 to 0.75 kg/kWh.
            </p>
          </div>
        </div>
      </div>

      {/* Official Data Sources Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Primary Data Sources & Official Institutional Repositories
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Dataset / Repository</th>
                <th className="py-3 px-3">Institution / Publisher</th>
                <th className="py-3 px-3">Role in Platform</th>
                <th className="py-3 px-3 text-center">Reference Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-semibold text-slate-800">CHETNA Power Plants Database</td>
                <td className="py-3 px-3 text-slate-600">Zenodo Open Research Repository</td>
                <td className="py-3 px-3 text-slate-600">High-resolution inventory & 3.25M daily observation records</td>
                <td className="py-3 px-3 text-center">
                  <a
                    href="https://zenodo.org/records/19709141"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-800 font-semibold"
                  >
                    Zenodo <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-semibold text-slate-800">CEA CO₂ Baseline Database v19/v20</td>
                <td className="py-3 px-3 text-slate-600">Central Electricity Authority (CEA)</td>
                <td className="py-3 px-3 text-slate-600">Official grid emission factor reference (0.945 tCO₂/MWh benchmark)</td>
                <td className="py-3 px-3 text-center">
                  <a
                    href="https://cea.nic.in/monthly-annual-environmental-data-format-for-thermal-power-stations/?lang=en"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-800 font-semibold"
                  >
                    CEA Portal <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-semibold text-slate-800">Coal Statement for Thermal Stations</td>
                <td className="py-3 px-3 text-slate-600">Ministry of Power / data.gov.in</td>
                <td className="py-3 px-3 text-slate-600">Receipts by supplier (CIL/SCCL/Imports) & physical stocks</td>
                <td className="py-3 px-3 text-center">
                  <a
                    href="https://data.gov.in/catalog/coal-statement-thermal-power-stations"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-800 font-semibold"
                  >
                    data.gov.in <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-semibold text-slate-800">National Electricity Plan Statistics</td>
                <td className="py-3 px-3 text-slate-600">Press Information Bureau (PIB)</td>
                <td className="py-3 px-3 text-slate-600">Installed capacity & generation verification statistics</td>
                <td className="py-3 px-3 text-center">
                  <a
                    href="https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=2036984&lang=2&reg=48"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-800 font-semibold"
                  >
                    PIB Release <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
