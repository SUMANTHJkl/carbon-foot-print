import React, { useEffect, useState } from 'react';
import { useFilter } from '../context/FilterContext';
import { fetchDashboardMetrics, fetchDashboardCharts } from '../services/api';
import { DashboardMetrics, DashboardCharts } from '../types';
import { MetricCard } from '../components/MetricCard';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { AlertTriangle, Factory, Zap, ShieldCheck, Flame, TrendingDown, ArrowRight } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { fiscalYear, fuel, selectedState, setActiveTab, setSelectedPlantId } = useFilter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchDashboardMetrics(fiscalYear, fuel, selectedState || undefined),
      fetchDashboardCharts(fiscalYear, fuel),
    ])
      .then(([m, c]) => {
        if (isMounted) {
          setMetrics(m);
          setCharts(c);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Error loading dashboard');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fiscalYear, fuel, selectedState]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-xl"></div>
          <div className="h-80 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-red-200 m-6">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Failed to load analytics</h3>
        <p className="text-sm text-slate-500 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            Overview Dashboard
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              {metrics.reporting_period}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Empirical carbon accounting across India's monitored coal thermal generation fleet.
          </p>
        </div>

        {/* Scope Pill */}
        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Scope: <b>{fuel === 'ALL' ? 'Coal + Lignite' : 'Pure Coal (Exclusive)'}</b></span>
          {selectedState && <span>• State: <b>{selectedState}</b></span>}
        </div>
      </div>

      {/* Scope Notice if applicable */}
      {selectedState && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <b>State Filter Active:</b> Results filtered to <b>{selectedState}</b>. Does not represent the complete national inventory.
          </span>
        </div>
      )}

      {/* Primary KPI Grid (10 Executive Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total CO₂ Emissions"
          value={metrics.total_emissions_mt}
          unit="Million Tonnes"
          yoyChange={metrics.yoy_emissions_change_pct}
          yoyIsReductionGood={true}
          provenance="Formula: E = Σ plant emissions (tonnes) where unit == 0 (station aggregate). Source: CHETNA daily logs."
          period={metrics.reporting_period}
        />
        <MetricCard
          title="Net Electricity Generation"
          value={metrics.total_generation_gwh.toLocaleString()}
          unit="GWh (MU)"
          yoyChange={metrics.yoy_generation_change_pct}
          yoyIsReductionGood={false}
          provenance="Net electrical energy sent out to the grid after station auxiliary consumption."
          period={metrics.reporting_period}
        />
        <MetricCard
          title="Weighted Carbon Intensity"
          value={metrics.weighted_carbon_intensity_t_mwh || 'N/A'}
          unit="tCO₂/MWh"
          benchmark={`CEA Ref: 0.945 (${metrics.cea_intensity_variance_pct ? `${metrics.cea_intensity_variance_pct > 0 ? '+' : ''}${metrics.cea_intensity_variance_pct}%` : 'Match'})`}
          provenance="Intensity = Total CO₂ (tonnes) / Net Generation (MWh). Equal to kgCO₂/kWh."
          period={metrics.reporting_period}
        />
        <MetricCard
          title="Monitored Coal Stations"
          value={metrics.monitored_coal_plants}
          unit="Stations"
          benchmark={`${metrics.total_installed_capacity_gw} GW Monitored`}
          provenance="Verified operational thermal power stations with active generation and emissions telemetry."
          period={metrics.reporting_period}
        />
        <MetricCard
          title="Average Plant Load Factor"
          value={metrics.average_plant_load_factor_pct ? `${metrics.average_plant_load_factor_pct}%` : 'N/A'}
          benchmark="National Baseline: 64.2%"
          provenance="PLF = Generation MWh / (Capacity MW × Hours in Fiscal Year) × 100%."
          period={metrics.reporting_period}
        />
        <MetricCard
          title="Highest-Emitting State"
          value={metrics.highest_emitting_state.state}
          benchmark={`${metrics.highest_emitting_state.emissions_mt} Mt CO₂`}
          provenance="State with largest aggregate thermal carbon emissions in selected scope."
          period={metrics.reporting_period}
        />
        <MetricCard
          title="Highest-Emitting Station"
          value={metrics.highest_emitting_plant.plant_name}
          benchmark={`${metrics.highest_emitting_plant.emissions_mt} Mt CO₂`}
          provenance="Single thermal power station with highest absolute annual CO₂ volume."
          period={metrics.reporting_period}
        />
        <MetricCard
          title="Lowest-Intensity Plant"
          value={metrics.lowest_intensity_plant.plant_name}
          benchmark={`${metrics.lowest_intensity_plant.intensity_t_mwh} tCO₂/MWh`}
          provenance="Lowest specific carbon intensity among comparable stations (>=500 MW capacity)."
          period={metrics.reporting_period}
        />
      </div>

      {/* Visual Analytics Grid */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: National Multi-Year Emissions & Generation Trend */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  National Emissions & Generation Trend (FY 2018–2025)
                </h3>
                <p className="text-xs text-slate-500">
                  Historical progression of carbon output (Mt) vs net grid generation (GWh)
                </p>
              </div>
              <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Annual Time-Series
              </span>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.annual_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emissGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fiscal_year" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any, name: string) => [
                      name === 'emissions_mt' ? `${val} Mt CO₂` : `${Number(val).toLocaleString()} GWh`,
                      name === 'emissions_mt' ? 'CO₂ Emissions' : 'Net Generation'
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="emissions_mt"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#emissGrad)"
                    name="emissions_mt"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Top 10 Emitting States Ranking */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  Top 10 State Emissions Ranking ({metrics.reporting_period})
                </h3>
                <p className="text-xs text-slate-500">
                  State-level thermal emissions concentration (Million Tonnes CO₂)
                </p>
              </div>
              <button
                onClick={() => setActiveTab('states')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                View all states <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.state_emissions_ranking} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" unit=" Mt" />
                  <YAxis dataKey="state" type="category" tick={{ fontSize: 10 }} stroke="#64748b" width={95} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} Million Tonnes CO₂`, 'Emissions']}
                  />
                  <Bar dataKey="emissions_mt" fill="#047857" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Top 10 Emitting Coal Power Plants Table */}
      {charts && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                Top 10 Emitting Coal Power Stations ({metrics.reporting_period})
              </h3>
              <p className="text-xs text-slate-500">
                Single-station carbon footprints, installed capacity, and specific carbon intensity
              </p>
            </div>
            <button
              onClick={() => setActiveTab('plants')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              Explore all plants <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Station Name</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3 text-right">Capacity (MW)</th>
                  <th className="py-2.5 px-3 text-right">CO₂ Emissions (Mt)</th>
                  <th className="py-2.5 px-3 text-right">Intensity (tCO₂/MWh)</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {charts.top_10_plants.map((plant, idx) => (
                  <tr key={plant.plant_name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{plant.plant_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{plant.state}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">{plant.capacity_mw.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-red-600">{plant.emissions_mt}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {plant.intensity_t_mwh ? (
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          plant.intensity_t_mwh > 1.05 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {plant.intensity_t_mwh}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          // slugify and navigate
                          const slug = plant.plant_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                          setSelectedPlantId(slug);
                          setActiveTab('plants');
                        }}
                        className="text-[11px] text-emerald-600 hover:text-emerald-800 font-semibold"
                      >
                        Details
                      </button>
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
