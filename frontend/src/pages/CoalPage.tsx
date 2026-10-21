import React, { useEffect, useState } from 'react';
import { fetchCoalAnalysis } from '../services/api';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ShieldCheck, Fuel, AlertCircle, Info, Truck } from 'lucide-react';

export const CoalPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoalAnalysis()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load coal analysis', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading CEA Coal Statement & Fuel Inventory...
      </div>
    );
  }

  // Convert receipts by source for Pie chart
  const sourceColors: { [key: string]: string } = {
    'Coal India Limited (CIL)': '#065f46',
    'Singareni Collieries (SCCL)': '#047857',
    'Captive Mines': '#10b981',
    'E-Auction': '#f59e0b',
    'Imported Coal': '#3b82f6',
    'Other Domestic': '#64748b',
  };

  const pieData = Object.entries(data.receipts_by_source).map(([name, val]) => ({
    name,
    value: val as number,
    color: sourceColors[name] || '#94a3b8',
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <span>Thermal Power Station Coal Statement & Fuel Inventory</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Empirical analysis of monthly coal receipts, supplier breakdown, utility consumption burn rates, and physical closing inventory stocks from the official CEA statement.
        </p>
      </div>

      {/* Snapshot Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <b>Dataset Reporting Period:</b> This supplementary analysis reflects the official <b>Central Electricity Authority (CEA) Monthly Coal Statement snapshot</b>. Total national coal consumption across monitored stations is <b>{data.total_consumption_kt.toLocaleString()} Thousand Tonnes (≈ {(data.total_consumption_kt / 1000).toFixed(2)} Million Tonnes)</b>.
        </div>
      </div>

      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="block text-[11px] text-slate-500 font-semibold uppercase">Monthly Consumption</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
            {(data.total_consumption_kt / 1000).toFixed(2)} <span className="text-xs text-slate-500 font-normal">Mt</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{data.total_consumption_kt.toLocaleString()} kt total</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="block text-[11px] text-slate-500 font-semibold uppercase">Total Coal Receipts</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
            {(data.total_receipts_kt / 1000).toFixed(2)} <span className="text-xs text-slate-500 font-normal">Mt</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{data.total_receipts_kt.toLocaleString()} kt total</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="block text-[11px] text-slate-500 font-semibold uppercase">Physical Closing Stock</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
            {(data.total_closing_stocks_kt / 1000).toFixed(2)} <span className="text-xs text-slate-500 font-normal">Mt</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{data.total_closing_stocks_kt.toLocaleString()} kt inventory</span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-sm">
          <span className="block text-[11px] text-emerald-800 font-semibold uppercase">Stock Autonomy</span>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-1 block">
            {data.national_days_of_stock} <span className="text-xs text-emerald-600 font-normal">Days</span>
          </span>
          <span className="text-[10px] text-emerald-600 font-mono">National Average Fuel Buffer</span>
        </div>
      </div>

      {/* Charts Row: Receipt Sources Pie + Regional Consumption Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 mb-1">Coal Receipts by Supply Source</h3>
          <p className="text-xs text-slate-500 mb-2">Breakdown of domestic linkages vs captive vs seaborne imports</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} kt`, 'Receipts']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 mb-1">Regional Coal Consumption vs Closing Stock</h3>
          <p className="text-xs text-slate-500 mb-2">Consumption burn volume vs ending stockpile (kt)</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.regional_breakdown} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="region" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} kt`, 'Volume']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="total_consumption" fill="#065f46" name="Consumption (kt)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="closing_stocks" fill="#3b82f6" name="Stock (kt)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Consumers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Top 10 Coal Consuming Power Stations
          </h3>
          <span className="text-xs text-slate-400 font-mono">Monthly Snapshot</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Station Name</th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3 text-right">Capacity (MW)</th>
                <th className="py-2.5 px-3 text-right">Consumption (kt)</th>
                <th className="py-2.5 px-3 text-right">Closing Stock (kt)</th>
                <th className="py-2.5 px-3 text-right">Stock Autonomy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.top_consumers.map((plant: any) => (
                <tr key={plant.plant_name} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{plant.plant_name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{plant.region}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium">{plant.installed_capacity_mw.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{plant.total_consumption.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">{plant.closing_stocks.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      plant.days_of_stock < 10 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {plant.days_of_stock ? `${plant.days_of_stock.toFixed(1)} Days` : 'N/A'}
                    </span>
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
