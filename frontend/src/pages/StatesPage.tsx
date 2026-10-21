import React, { useEffect, useState } from 'react';
import { useFilter } from '../context/FilterContext';
import { fetchStates } from '../services/api';
import { StateSummaryItem } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Map, TrendingDown, ArrowUpDown, Info } from 'lucide-react';

export const StatesPage: React.FC = () => {
  const { fiscalYear, fuel, setSelectedState, setActiveTab } = useFilter();
  const [states, setStates] = useState<StateSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchStates(fiscalYear, fuel)
      .then((res) => {
        setStates(res.states);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching state summary', err);
        setLoading(false);
      });
  }, [fiscalYear, fuel]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Calculating state-level aggregates...
      </div>
    );
  }

  const topStatesChart = states.slice(0, 10).map((s) => ({
    state: s.state,
    emissions_mt: s.total_emissions_mt,
    intensity_t_mwh: s.weighted_intensity_t_mwh || 0,
    generation_gwh: s.net_generation_gwh,
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Map className="w-6 h-6 text-emerald-600" />
          <span>State-Wise Thermal Power & Emissions Analysis</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Regional aggregation of installed capacity, thermal generation, gross carbon footprints, and generation-weighted emission intensity across Indian States ({fiscalYear}).
        </p>
      </div>

      {/* Cautionary Methodological Alert */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 flex items-start space-x-2">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <b>Accounting Note on Regional Efficiency:</b> States with high aggregate emissions (e.g. Uttar Pradesh, Madhya Pradesh, Chhattisgarh) host large mine-mouth super thermal power stations that export bulk baseload power to other states. A high emission volume reflects electricity production, whereas <b>weighted carbon intensity (tCO₂/MWh)</b> measures thermodynamic generation efficiency.
        </div>
      </div>

      {/* Chart: Top 10 States Comparison */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-sm text-slate-800 mb-1">
          Top 10 States: Total Emissions (Mt) vs Weighted Carbon Intensity (tCO₂/MWh)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Comparing absolute volume against environmental efficiency
        </p>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topStatesChart} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="state" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" stroke="#64748b" interval={0} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#047857" unit=" Mt" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#d97706" domain={[0.7, 1.3]} unit=" t" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="emissions_mt" fill="#047857" name="CO₂ Emissions (Mt)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="intensity_t_mwh" fill="#f59e0b" name="Intensity (tCO₂/MWh)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* State Aggregates Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Complete State Carbon Accounting Table ({fiscalYear})
          </h3>
          <span className="text-xs text-slate-500 font-mono">{states.length} States Monitored</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">State / UT</th>
                <th className="py-3 px-3 text-right">Stations</th>
                <th className="py-3 px-3 text-right">Capacity (GW)</th>
                <th className="py-3 px-3 text-right">Net Gen (GWh)</th>
                <th className="py-3 px-3 text-right">CO₂ (Mt)</th>
                <th className="py-3 px-3 text-right">National Share (%)</th>
                <th className="py-3 px-3 text-right">Weighted Intensity (t/MWh)</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {states.map((s) => (
                <tr key={s.state} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">{s.state}</td>
                  <td className="py-3 px-3 text-right font-mono">{s.plant_count}</td>
                  <td className="py-3 px-3 text-right font-mono">{s.installed_capacity_gw}</td>
                  <td className="py-3 px-3 text-right font-mono">{s.net_generation_gwh.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-red-600">{s.total_emissions_mt}</td>
                  <td className="py-3 px-3 text-right font-mono">{s.national_share_pct}%</td>
                  <td className="py-3 px-3 text-right font-mono">
                    {s.weighted_intensity_t_mwh ? (
                      <span className={`px-1.5 py-0.5 rounded font-semibold text-[11px] ${
                        s.weighted_intensity_t_mwh > 1.05 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {s.weighted_intensity_t_mwh}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => {
                        setSelectedState(s.state);
                        setActiveTab('plants');
                      }}
                      className="text-[11px] text-emerald-600 hover:text-emerald-800 font-semibold"
                    >
                      Filter Plants
                    </button>
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
