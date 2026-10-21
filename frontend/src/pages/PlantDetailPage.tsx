import React, { useEffect, useState } from 'react';
import { fetchPlantDetail } from '../services/api';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ArrowLeft, Factory, MapPin, Zap, Flame, Shield, Calendar, Layers, ExternalLink } from 'lucide-react';

interface PlantDetailPageProps {
  plantId: string;
  onBack: () => void;
}

export const PlantDetailPage: React.FC<PlantDetailPageProps> = ({ plantId, onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPlantDetail(plantId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching plant detail', err);
        setLoading(false);
      });
  }, [plantId]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading station telemetry and historical metrics...
      </div>
    );
  }

  const { metadata, historical_metrics, coal_statement, peer_comparisons } = data;
  const latestMetric = historical_metrics.length > 0 ? historical_metrics[historical_metrics.length - 1] : null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Plant Explorer</span>
      </button>

      {/* Station Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{metadata.fuel_type} Thermal Power Station • {metadata.technology || 'Subcritical'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {metadata.plant_name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {metadata.state} ({metadata.zone_name} Region)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                {metadata.unit_count} Generating Units
              </span>
              {metadata.start_year && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Commissioned: {metadata.start_year}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Capacity</span>
              <span className="text-base font-extrabold font-mono text-slate-800">
                {metadata.installed_capacity_mw.toLocaleString()} MW
              </span>
            </div>
            {metadata.latitude && metadata.longitude && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Coordinates</span>
                <span className="text-xs font-mono font-semibold text-slate-700">
                  {metadata.latitude.toFixed(4)}°N, {metadata.longitude.toFixed(4)}°E
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Latest KPIs */}
        {latestMetric && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-[11px] text-slate-500">Annual CO₂ Emissions</span>
              <span className="text-xl font-extrabold text-red-600 font-mono">
                {latestMetric.total_co2_mt} Mt
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-[11px] text-slate-500">Net Electricity</span>
              <span className="text-xl font-extrabold text-slate-800 font-mono">
                {latestMetric.net_generation_gwh ? latestMetric.net_generation_gwh.toLocaleString() : 'N/A'} GWh
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-[11px] text-slate-500">Carbon Intensity</span>
              <span className="text-xl font-extrabold text-emerald-700 font-mono">
                {latestMetric.emission_intensity_t_mwh || 'N/A'} <span className="text-xs">t/MWh</span>
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-[11px] text-slate-500">Plant Load Factor</span>
              <span className="text-xl font-extrabold text-slate-800 font-mono">
                {latestMetric.plant_load_factor_pct ? `${latestMetric.plant_load_factor_pct}%` : 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Historical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Emissions & Generation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 mb-1">Historical Generation & Emissions</h3>
          <p className="text-xs text-slate-500 mb-4">Multi-year trend across reporting fiscal years</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historical_metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="fiscal_year" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="total_co2_mt" stroke="#dc2626" fill="#fee2e2" name="CO₂ Emissions (Mt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carbon Intensity Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 mb-1">Specific Carbon Intensity Trend</h3>
          <p className="text-xs text-slate-500 mb-4">Specific emission factor (tCO₂/MWh) vs national baseline</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historical_metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="fiscal_year" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} tCO₂/MWh`, 'Intensity']}
                />
                <Line type="monotone" dataKey="emission_intensity_t_mwh" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} name="Intensity (t/MWh)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Coal Consumption Statement Details */}
      {coal_statement && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>CEA Coal Statement & Supply Snapshot</span>
              </h3>
              <p className="text-xs text-slate-500">
                Monthly receipts by supply channel, actual fuel consumption, and physical closing stock
              </p>
            </div>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Thousand Tonnes (kt)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-[11px] text-slate-500">Monthly Consumption</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {coal_statement.total_consumption.toLocaleString()} kt
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-[11px] text-slate-500">Total Coal Receipts</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {coal_statement.receipt_total.toLocaleString()} kt
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-[11px] text-slate-500">Closing Physical Stock</span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {coal_statement.closing_stocks.toLocaleString()} kt
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-[11px] text-slate-500">Stock Autonomy</span>
              <span className="text-base font-bold text-emerald-700 font-mono">
                {coal_statement.days_of_stock ? `${coal_statement.days_of_stock.toFixed(1)} Days` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Comparable Peer Benchmarks */}
      {peer_comparisons && peer_comparisons.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 mb-1">Comparable Peer Stations (Same Capacity Class)</h3>
          <p className="text-xs text-slate-500 mb-3">Benchmarked against thermal stations with ±30% capacity</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Peer Station</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3 text-right">Capacity (MW)</th>
                  <th className="py-2.5 px-3 text-right">Intensity (t/MWh)</th>
                  <th className="py-2.5 px-3 text-right">CO₂ (Mt)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {peer_comparisons.map((peer: any) => (
                  <tr key={peer.plant_name} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{peer.plant_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{peer.state}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{peer.capacity_mw.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">{peer.intensity_t_mwh}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{peer.emissions_mt}</td>
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
