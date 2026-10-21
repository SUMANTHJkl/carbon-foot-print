import React, { useEffect, useState } from 'react';
import { useFilter } from '../context/FilterContext';
import { fetchStatistics } from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const StatisticsPage: React.FC = () => {
  const { fiscalYear, fuel } = useFilter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchStatistics(fuel, fiscalYear)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching statistics', err);
        setLoading(false);
      });
  }, [fiscalYear, fuel]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Computing statistical correlations, concentrations, and outlier metrics...
      </div>
    );
  }

  const { correlations, concentration, outliers } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
          <span>Statistical Analysis & Correlation Engine</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Bivariate parametric and non-parametric correlations, Lorenz emissions concentration, and statistical outlier triage across monitored stations ({fiscalYear}).
        </p>
      </div>

      {/* Methodological Guidance Alert */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex items-start space-x-2">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <b>Academic Rigor Note:</b> Correlation indicates statistical association, not unilateral causality. Statistical outliers are candidates for empirical inspection (e.g. partial reporting periods, atypical fuel blends) rather than presumed measurement malfeasance.
        </div>
      </div>

      {/* Correlation Highlights */}
      {correlations.highlights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {correlations.highlights.map((h: any, idx: number) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Key Relationship {idx + 1}
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-2">{h.relationship}</h3>
              <div className="flex items-center space-x-4 my-2">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Coefficient</span>
                  <span className="text-xl font-extrabold font-mono text-emerald-700">
                    {h.pearson_r !== undefined ? `r = ${h.pearson_r}` : `ρ = ${h.spearman_rho}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">p-value</span>
                  <span className="text-xs font-mono font-bold text-slate-700">{h.p_value}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">{h.interpretation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Emissions Concentration (Lorenz Curve) */}
      {concentration.concentration_curve && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                Cumulative Emissions Concentration Curve (Lorenz Analysis)
              </h3>
              <p className="text-xs text-slate-500">
                Evaluating carbon output skew across cumulative deciles of generating stations
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded border border-emerald-200">
                Top 10% Plants: <b>{concentration.top_10_plants_share_pct}% of CO₂</b>
              </span>
            </div>
          </div>

          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={concentration.concentration_curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="plant_share_pct" tick={{ fontSize: 10 }} stroke="#64748b" unit="%" />
                <YAxis tick={{ fontSize: 10 }} stroke="#64748b" unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}% of National CO₂`, 'Cumulative Share']}
                />
                <Line type="monotone" dataKey="emissions_share_pct" stroke="#047857" strokeWidth={2.5} dot={{ r: 4 }} name="Cumulative Emissions %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Robust Outlier Detection Table */}
      {outliers.outliers && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                IQR Statistical Outlier Detection ({outliers.outlier_count} Candidates Flagged)
              </h3>
              <p className="text-[11px] text-slate-400">
                Stations with carbon intensity outside 1.5× Interquartile Range ({outliers.lower_bound} to {outliers.upper_bound} tCO₂/MWh)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Station Name</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3 text-right">Capacity (MW)</th>
                  <th className="py-2.5 px-3 text-right">Intensity (t/MWh)</th>
                  <th className="py-2.5 px-3 text-right">CO₂ (Mt)</th>
                  <th className="py-2.5 px-3">Triage Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {outliers.outliers.map((o: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{o.plant_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{o.state}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{o.capacity_mw.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">{o.intensity_t_mwh}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{o.total_emissions_mt ? `${o.total_emissions_mt} Mt` : 'N/A'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        o.type.includes('High') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {o.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
