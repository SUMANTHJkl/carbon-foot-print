import React, { useEffect, useState } from 'react';
import { fetchTimeseries } from '../services/api';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { LineChart as ChartIcon, Calendar, Zap, AlertTriangle } from 'lucide-react';

export const TimeseriesPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [limit, setLimit] = useState(180);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTimeseries(undefined, limit)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching timeseries', err);
        setLoading(false);
      });
  }, [limit]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Querying daily station-level time series...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ChartIcon className="w-6 h-6 text-emerald-600" />
            <span>Daily Time-Series & Dispatch Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            High-resolution daily operational generation and CO₂ emissions tracking synthesized across 555,000+ station-level observation records.
          </p>
        </div>

        {/* Time window selector */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start md:self-auto">
          <span className="font-semibold text-slate-500 px-2">Window:</span>
          {[60, 180, 365].map((w) => (
            <button
              key={w}
              onClick={() => setLimit(w)}
              className={`px-3 py-1 rounded font-medium transition-all ${
                limit === w ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Last {w} Days
            </button>
          ))}
        </div>
      </div>

      {/* Daily Emissions Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-sm text-slate-800">
              National Daily CO₂ Emissions ({limit} Days Window)
            </h3>
            <p className="text-xs text-slate-500">Daily aggregate carbon output in Million Tonnes CO₂</p>
          </div>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {data.points_count} Daily Records
          </span>
        </div>

        <div className="h-72 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="emissDaily" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#047857" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#047857" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#64748b" interval={Math.floor(limit / 8)} />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" unit=" Mt" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${val} Mt CO₂`, 'Daily Emissions']}
              />
              <Area type="monotone" dataKey="emissions_mt" stroke="#047857" strokeWidth={2} fillOpacity={1} fill="url(#emissDaily)" name="Daily CO₂" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Generation Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-sm text-slate-800">
              National Daily Grid Net Generation (GWh)
            </h3>
            <p className="text-xs text-slate-500">Aggregate daily generation dispatch from monitored thermal fleet</p>
          </div>
        </div>

        <div className="h-64 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#64748b" interval={Math.floor(limit / 8)} />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" unit=" GWh" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toLocaleString()} GWh`, 'Daily Generation']}
              />
              <Line type="monotone" dataKey="generation_gwh" stroke="#2563eb" strokeWidth={2} dot={false} name="Daily Generation" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
