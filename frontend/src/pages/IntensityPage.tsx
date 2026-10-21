import React, { useEffect, useState } from 'react';
import { useFilter } from '../context/FilterContext';
import { fetchStatistics } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Flame, ShieldCheck, TrendingDown, Info, Award } from 'lucide-react';

export const IntensityPage: React.FC = () => {
  const { fiscalYear, fuel } = useFilter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchStatistics(fuel, fiscalYear)
      .then((res) => {
        setStats(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load intensity statistics', err);
        setLoading(false);
      });
  }, [fiscalYear, fuel]);

  if (loading || !stats) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Computing empirical carbon intensity distributions...
      </div>
    );
  }

  const { distribution } = stats;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Flame className="w-6 h-6 text-emerald-600" />
          <span>Carbon Intensity Analysis & Benchmarking</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Detailed specific carbon intensity evaluation (tCO₂/MWh and gCO₂/kWh) harmonized against Central Electricity Authority (CEA) official baseline standards.
        </p>
      </div>

      {/* Benchmark Reference Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="block text-[11px] text-slate-500 font-semibold uppercase">Sample Fleet Mean</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
            {distribution.mean} <span className="text-xs text-slate-500 font-normal">tCO₂/MWh</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{distribution.mean * 1000} g/kWh</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="block text-[11px] text-slate-500 font-semibold uppercase">Fleet Median</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
            {distribution.median} <span className="text-xs text-slate-500 font-normal">tCO₂/MWh</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{distribution.median * 1000} g/kWh</span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-sm text-center">
          <span className="block text-[11px] text-emerald-800 font-semibold uppercase flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            CEA Baseline Standard
          </span>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-1 block">
            0.945 <span className="text-xs text-emerald-600 font-normal">tCO₂/MWh</span>
          </span>
          <span className="text-[10px] text-emerald-600 font-mono">945 gCO₂/kWh National Grid</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="block text-[11px] text-slate-500 font-semibold uppercase">Interquartile Range</span>
          <span className="text-2xl font-extrabold text-slate-800 font-mono mt-1 block">
            {distribution.percentile_25} – {distribution.percentile_75}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">25th to 75th percentile</span>
        </div>
      </div>

      {/* Distribution Histogram Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-sm text-slate-800">
              Fleet Carbon Intensity Frequency Distribution ({fiscalYear})
            </h3>
            <p className="text-xs text-slate-500">
              Frequency histogram of specific emission factors across monitored power stations
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            N = {distribution.sample_count} Stations
          </span>
        </div>

        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution.distribution_bins} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${val} Stations`, 'Count']}
              />
              <ReferenceLine x="0.90 - 0.96" stroke="#059669" strokeDasharray="3 3" label={{ value: 'CEA 0.945', fill: '#059669', fontSize: 10, position: 'top' }} />
              <Bar dataKey="count" fill="#047857" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Technology Efficiency & Emission Factor Standards */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Technology Comparison & Design Heat Rate Benchmarks</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Subcritical Steam Cycle</h4>
            <p className="text-slate-500 mb-2">Standard Indian fleet build (210 MW & 500 MW)</p>
            <div className="space-y-1 font-mono text-slate-700">
              <div>Design Heat Rate: <b>2,450 – 2,650 kcal/kWh</b></div>
              <div>Net Efficiency: <b>31% – 34%</b></div>
              <div>Average Intensity: <b className="text-red-600">0.98 – 1.15 tCO₂/MWh</b></div>
            </div>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
            <h4 className="font-bold text-emerald-900 mb-1">Supercritical Technology</h4>
            <p className="text-emerald-700 mb-2">Modern baseline fleet (660 MW units)</p>
            <div className="space-y-1 font-mono text-emerald-900">
              <div>Design Heat Rate: <b>2,150 – 2,280 kcal/kWh</b></div>
              <div>Net Efficiency: <b>38% – 41%</b></div>
              <div>Average Intensity: <b className="text-emerald-700">0.82 – 0.92 tCO₂/MWh</b></div>
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200">
            <h4 className="font-bold text-blue-900 mb-1">Ultra-Supercritical (USC)</h4>
            <p className="text-blue-700 mb-2">State-of-the-art expansion (800 MW units)</p>
            <div className="space-y-1 font-mono text-blue-900">
              <div>Design Heat Rate: <b>2,050 – 2,120 kcal/kWh</b></div>
              <div>Net Efficiency: <b>42% – 44%</b></div>
              <div>Average Intensity: <b className="text-blue-700">0.76 – 0.84 tCO₂/MWh</b></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
