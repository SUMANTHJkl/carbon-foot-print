import React, { useEffect, useState } from 'react';
import { useFilter } from '../context/FilterContext';
import { fetchEfficiencyAnalysis } from '../services/api';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Zap, Gauge, Flame, Award, Info, CheckCircle2 } from 'lucide-react';

export const EfficiencyPage: React.FC = () => {
  const { fiscalYear, fuel } = useFilter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchEfficiencyAnalysis(fiscalYear, fuel)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching efficiency analysis', err);
        setLoading(false);
      });
  }, [fiscalYear, fuel]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Computing thermodynamic heat rates, auxiliary consumption, and efficiency curves...
      </div>
    );
  }

  const { technology_breakdown, plf_distribution_bands, top_efficient_stations } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Gauge className="w-6 h-6 text-emerald-600" />
          <span>Thermal Efficiency & Plant Performance Analysis</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Thermodynamic heat rate evaluations, station auxiliary power consumption (APC), plant load factor (PLF) dispatch bands, and top-performing thermal assets ({fiscalYear}).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="block text-[11px] text-slate-500 uppercase font-semibold">Fleet Mean Auxiliary Power</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
            {data.fleet_average_auxiliary_pct}%
          </span>
          <span className="text-[10px] text-slate-400 font-mono">National CEA Benchmark: 6.5% – 8.5%</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="block text-[11px] text-slate-500 uppercase font-semibold">Fleet Median Auxiliary Power</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
            {data.fleet_median_auxiliary_pct}%
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Station Parasitic Load</span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-sm text-center">
          <span className="block text-[11px] text-emerald-800 uppercase font-semibold">Fleet Average PLF</span>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-1 block">
            {data.fleet_average_plf_pct}%
          </span>
          <span className="text-[10px] text-emerald-600 font-mono">Capacity Utilization Factor</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="block text-[11px] text-slate-500 uppercase font-semibold">Monitored Fleet</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
            {data.monitored_stations} <span className="text-xs text-slate-500 font-normal">Stations</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Active Telemetry Units</span>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technology Heat Rate & Auxiliary Consumption */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 mb-1">
            Auxiliary Consumption & Net Thermal Efficiency by Technology
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Subcritical vs Supercritical design parameters
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={technology_breakdown} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="technology" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#047857" unit="%" domain={[0, 12]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#3b82f6" unit="%" domain={[25, 45]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="mean_auxiliary_pct" fill="#047857" name="Auxiliary Consumption (%)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="net_efficiency_pct" fill="#3b82f6" name="Net Thermal Efficiency (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PLF Distribution Bands Pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 mb-1">
            Plant Load Factor (PLF) Operating Duty Bands
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Distribution of generating assets across baseload, cycling, and reserve categories
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={plf_distribution_bands}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="band"
                >
                  {plf_distribution_bands.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val} Stations (${item.payload.share_pct}%)`,
                    name
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 10 Most Efficient Coal Stations */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Top 10 Benchmark Energy-Efficient Thermal Power Stations (Capacity ≥ 500 MW)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Ranked by Lowest Carbon Intensity</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Station Name</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3">Tech</th>
                <th className="py-2.5 px-3 text-right">Capacity (MW)</th>
                <th className="py-2.5 px-3 text-right">Intensity (t/MWh)</th>
                <th className="py-2.5 px-3 text-right">Est. Heat Rate (kcal/kWh)</th>
                <th className="py-2.5 px-3 text-right">Thermal Efficiency (%)</th>
                <th className="py-2.5 px-3 text-right">Aux Power (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top_efficient_stations.map((plant: any, idx: number) => (
                <tr key={plant.plant_name} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{plant.plant_name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{plant.state}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                      {plant.technology}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{plant.capacity_mw.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                    {plant.carbon_intensity_t_mwh}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                    {plant.estimated_heat_rate_kcal_kwh.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-600">
                    {plant.thermal_efficiency_pct}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {plant.auxiliary_consumption_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
