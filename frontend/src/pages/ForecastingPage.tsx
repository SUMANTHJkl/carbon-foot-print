import React, { useEffect, useState } from 'react';
import { useFilter } from '../context/FilterContext';
import { fetchForecasting } from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Cpu, TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ForecastingPage: React.FC = () => {
  const { fuel } = useFilter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchForecasting(fuel)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load forecasting', err);
        setLoading(false);
      });
  }, [fuel]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Training empirical regression and projection models...
      </div>
    );
  }

  const { regression, trend } = data;

  // Combine historical and projection series for unified chart
  const combinedTrend = [
    ...(trend.historical || []).map((h: any) => ({
      fiscal_year: h.fiscal_year,
      observed: h.emissions_mt,
      projected: null,
      lower_95: null,
      upper_95: null,
    })),
    ...(trend.projections || []).map((p: any) => ({
      fiscal_year: p.fiscal_year,
      observed: null,
      projected: p.emissions_mt,
      lower_95: p.lower_95_mt,
      upper_95: p.upper_95_mt,
    })),
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Cpu className="w-6 h-6 text-emerald-600" />
          <span>AI Insights, Regression Modeling & Forecasting</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Empirical machine learning models trained with strict chronological train/test splits, residual error quantification, and multi-year trajectory projections without target leakage.
        </p>
      </div>

      {/* Model Performance Cards */}
      {regression.metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="block text-[11px] text-slate-500 uppercase font-semibold">Test Set R² Score</span>
            <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-1 block">
              {regression.metrics.r2_score}
            </span>
            <span className="text-[10px] text-slate-400">High Variance Explained</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="block text-[11px] text-slate-500 uppercase font-semibold">Mean Absolute Error (MAE)</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
              {regression.metrics.mae_mt} <span className="text-xs text-slate-500 font-normal">Mt</span>
            </span>
            <span className="text-[10px] text-slate-400">Average Residual Deviation</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="block text-[11px] text-slate-500 uppercase font-semibold">Root Mean Squared Error (RMSE)</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
              {regression.metrics.rmse_mt} <span className="text-xs text-slate-500 font-normal">Mt</span>
            </span>
            <span className="text-[10px] text-slate-400">Penalizes Extreme Outliers</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="block text-[11px] text-slate-600 uppercase font-semibold">Validation Protocol</span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">
              Chronological Split
            </span>
            <span className="text-[10px] text-slate-500">{regression.train_period} → {regression.test_period}</span>
          </div>
        </div>
      )}

      {/* Baseline Trend Projections with 95% Confidence Intervals */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-sm text-slate-800">
              National Coal Fleet Emissions Baseline Projection (3-Year Horizon)
            </h3>
            <p className="text-xs text-slate-500">
              Historical observed emissions vs econometric trend projection with 95% prediction confidence boundaries
            </p>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
            Trend Slope: +{trend.trend_slope_mt_per_year} Mt/year
          </span>
        </div>

        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedTrend} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="fiscal_year" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" unit=" Mt" domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="observed" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} name="Observed Historical (Mt)" connectNulls={false} />
              <Line type="monotone" dataKey="projected" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} name="Baseline Projection (Mt)" connectNulls={false} />
              <Line type="monotone" dataKey="upper_95" stroke="#94a3b8" strokeWidth={1} strokeDasharray="2 2" name="Upper 95% Bound" connectNulls={false} />
              <Line type="monotone" dataKey="lower_95" stroke="#94a3b8" strokeWidth={1} strokeDasharray="2 2" name="Lower 95% Bound" connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Test Sample Residual Table */}
      {regression.test_scatter_sample && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Holdout Test Set Residual Evaluation (Sample Stations)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Actual vs Model Prediction</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Station Name</th>
                  <th className="py-2.5 px-3">Fiscal Year</th>
                  <th className="py-2.5 px-3 text-right">Generation (GWh)</th>
                  <th className="py-2.5 px-3 text-right">Actual CO₂ (Mt)</th>
                  <th className="py-2.5 px-3 text-right">Predicted CO₂ (Mt)</th>
                  <th className="py-2.5 px-3 text-right">Residual Error (Mt)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regression.test_scatter_sample.slice(0, 8).map((r: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{r.plant_name}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{r.fiscal_year}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{r.generation_gwh.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{r.actual_emissions_mt}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-600">{r.predicted_emissions_mt}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        Math.abs(r.residual_mt) > 1.0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {r.residual_mt > 0 ? `+${r.residual_mt}` : r.residual_mt}
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
