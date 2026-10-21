import React, { useEffect, useState } from 'react';
import { useFilter } from '../context/FilterContext';
import { fetchDashboardCharts, fetchDashboardMetrics } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Layers, Zap, Info } from 'lucide-react';

export const NationalPage: React.FC = () => {
  const { fiscalYear, fuel } = useFilter();
  const [charts, setCharts] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDashboardCharts(fiscalYear, fuel),
      fetchDashboardMetrics(fiscalYear, fuel),
    ])
      .then(([c, m]) => {
        setCharts(c);
        setMetrics(m);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching national data', err);
        setLoading(false);
      });
  }, [fiscalYear, fuel]);

  if (loading || !charts || !metrics) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Compiling National Emissions Inventory...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          <span>National Emissions & Generation Inventory</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          National multi-year trends, year-on-year variations, specific carbon intensity evolution, and state generation contributions across India's coal power sector.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="block text-[11px] text-slate-500 font-semibold uppercase">National Carbon Output</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
            {metrics.total_emissions_mt} <span className="text-xs font-normal text-slate-500">Million Tonnes</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">FY {metrics.reporting_period}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="block text-[11px] text-slate-500 font-semibold uppercase">Total Net Generation</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
            {metrics.total_generation_gwh.toLocaleString()} <span className="text-xs font-normal text-slate-500">GWh</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Sent out to National Grid</span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-sm text-center">
          <span className="block text-[11px] text-emerald-800 font-semibold uppercase">Weighted Intensity</span>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-1 block">
            {metrics.weighted_carbon_intensity_t_mwh} <span className="text-xs font-normal text-emerald-600">t/MWh</span>
          </span>
          <span className="text-[10px] text-emerald-600 font-mono">{metrics.weighted_carbon_intensity_g_kwh} gCO₂/kWh</span>
        </div>
      </div>

      {/* Multi-Year National Trend Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-sm text-slate-800 mb-1">
          Historical Evolution of Generation vs Emissions (FY 2018–2025)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tracking national decarbonization progress and specific emission intensity changes
        </p>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.annual_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="emissNat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="fiscal_year" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" unit=" Mt" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="emissions_mt" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#emissNat)" name="CO₂ Emissions (Mt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Generation vs Intensity dual trend */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-sm text-slate-800 mb-1">
          Specific Carbon Intensity Trajectory (tCO₂/MWh)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Annual weighted intensity progression compared with CEA reference baseline
        </p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.annual_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="fiscal_year" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis domain={[0.8, 1.1]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${val} tCO₂/MWh`, 'Carbon Intensity']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="intensity_t_mwh" stroke="#d97706" strokeWidth={2.5} dot={{ r: 4 }} name="Fleet Intensity (t/MWh)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
