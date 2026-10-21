import React, { useState, useEffect } from 'react';
import { runSimulation } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Sliders, Zap, Shield, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  const [scopeType, setScopeType] = useState('national');
  const [baselineYear, setBaselineYear] = useState('2023-24');
  const [intensityReductionPct, setIntensityReductionPct] = useState(5.0);
  const [generationReductionPct, setGenerationReductionPct] = useState(10.0);
  const [replacementSource, setReplacementSource] = useState('solar_wind_hybrid');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = () => {
    setLoading(true);
    runSimulation({
      scope_type: scopeType,
      baseline_year: baselineYear,
      intensity_reduction_pct: intensityReductionPct,
      generation_reduction_pct: generationReductionPct,
      replacement_source: replacementSource,
    })
      .then((res) => {
        setResult(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Simulation error', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    handleSimulate();
  }, [scopeType, baselineYear, intensityReductionPct, generationReductionPct, replacementSource]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-emerald-600" />
          <span>Carbon Reduction Scenario Simulator</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Simulate hypothetical policy scenarios, efficiency retrofits (biomass co-firing, heat rate upgrades), and clean power substitution with explicit lifecycle accounting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column (1 Column) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Scenario Parameters
            </h3>
            <button
              onClick={() => {
                setIntensityReductionPct(5.0);
                setGenerationReductionPct(10.0);
                setReplacementSource('solar_wind_hybrid');
              }}
              className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Scope</label>
            <select
              value={scopeType}
              onChange={(e) => setScopeType(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="national">All India Monitored Coal Fleet</option>
            </select>
          </div>

          {/* Intensity Reduction Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Thermal Intensity Improvement</span>
              <span className="font-mono font-bold text-emerald-600">{intensityReductionPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={intensityReductionPct}
              onChange={(e) => setIntensityReductionPct(parseFloat(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Simulates 5%–10% biomass co-firing or boiler heat rate reduction
            </span>
          </div>

          {/* Coal Generation Reduction Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Coal Generation Substituted</span>
              <span className="font-mono font-bold text-blue-600">{generationReductionPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={generationReductionPct}
              onChange={(e) => setGenerationReductionPct(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Percentage of baseline coal generation replaced by clean power
            </span>
          </div>

          {/* Replacement Source */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Replacement Electricity Source
            </label>
            <select
              value={replacementSource}
              onChange={(e) => setReplacementSource(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="solar_wind_hybrid">Solar & Wind Hybrid (28 gCO₂/kWh)</option>
              <option value="solar_pv">Solar PV Utility Scale (41 gCO₂/kWh)</option>
              <option value="onshore_wind">Onshore Wind (15 gCO₂/kWh)</option>
              <option value="nuclear">Nuclear Power (12 gCO₂/kWh)</option>
              <option value="hydro">Hydro Power (24 gCO₂/kWh)</option>
              <option value="zero_emission">Zero Emission / Theoretical (0 gCO₂/kWh)</option>
            </select>
          </div>
        </div>

        {/* Results Column (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {result && !result.error && (
            <>
              {/* Executive Outcome Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <span className="block text-[11px] font-semibold text-emerald-800 uppercase">
                    Avoided CO₂ Emissions
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-1 block">
                    {result.scenario.avoided_emissions_mt} <span className="text-xs">Mt CO₂</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-800 font-mono">
                    {result.scenario.avoided_emissions_percentage}% Reduction
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                  <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                    New System Intensity
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                    {result.scenario.new_system_intensity_t_mwh} <span className="text-xs">t/MWh</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {result.scenario.new_system_intensity_g_kwh} gCO₂/kWh
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                  <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                    Clean Energy Dispatched
                  </span>
                  <span className="text-2xl font-extrabold text-blue-600 font-mono mt-1 block">
                    {result.scenario.replaced_generation_gwh.toLocaleString()} <span className="text-xs">GWh</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {(result.scenario.replaced_generation_gwh / 1000).toFixed(1)} TWh Clean Power
                  </span>
                </div>
              </div>

              {/* Comparison Bar Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-1">
                  Baseline vs Scenario Emissions Comparison
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Visualizing avoided carbon footprint and replacement source lifecycle emissions (Mt CO₂)
                </p>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.comparison_chart} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#64748b" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#64748b" unit=" Mt" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="coal_emissions_mt" stackId="a" fill="#dc2626" name="Coal Emissions (Mt)" />
                      <Bar dataKey="replacement_emissions_mt" stackId="a" fill="#3b82f6" name="Replacement Source Lifecycle (Mt)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Assumptions & Provenance Box */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-600 space-y-1.5">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Simulation Accounting Assumptions
                </h4>
                {result.assumptions_and_provenance.map((note: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
