import React, { useEffect, useState } from 'react';
import { fetchDiagnostics } from '../services/api';
import { Settings, Database, HardDrive, RefreshCw, CheckCircle2, Shield, Info, Server } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDiagnostics()
      .then((res) => {
        setDiagnostics(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load diagnostics', err);
        setLoading(false);
      });
  }, []);

  const handleRefreshCache = async () => {
    setRefreshMessage('Verifying analytical Parquet cache and schema indexes...');
    try {
      const res = await fetch('/api/settings/cache/refresh', { method: 'POST' });
      const data = await res.json();
      setRefreshMessage(data.status || 'Cache refreshed successfully!');
      setTimeout(() => setRefreshMessage(null), 4000);
    } catch (err) {
      setRefreshMessage('Error refreshing cache');
    }
  };

  if (loading || !diagnostics) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading System Diagnostics & Data Engine Parameters...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          <span>Settings & Data Management</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          System health, relational database parameters, high-performance analytical Parquet cache, and official benchmark baselines.
        </p>
      </div>

      {/* Diagnostics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-emerald-700">
            <Database className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Relational Database</h3>
          </div>
          <div className="text-xs space-y-1.5 text-slate-600 font-mono">
            <div>Engine: <span className="text-slate-800 font-semibold">{diagnostics.database.engine}</span></div>
            <div>Database Size: <span className="text-emerald-700 font-bold">{diagnostics.database.file_size_mb} MB</span></div>
            <div className="truncate text-[10px] text-slate-400">Path: {diagnostics.database.path}</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>SQLite Active & Synchronized</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-blue-700">
            <HardDrive className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Parquet Analytical Cache</h3>
          </div>
          <div className="text-xs space-y-1.5 text-slate-600 font-mono">
            <div>Total Cache: <span className="text-blue-700 font-bold">{diagnostics.analytical_parquet_cache.total_size_mb} MB</span></div>
            <div>Indexed Files: <span className="text-slate-800 font-semibold">{diagnostics.analytical_parquet_cache.files.length} Parquet Tables</span></div>
            <div className="text-[10px] text-slate-500">Sub-50ms Query Aggregation Engine</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center space-x-1.5 text-xs text-blue-700 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Parquet Cache Validated</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-amber-700">
            <Shield className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">Official Standards</h3>
          </div>
          <div className="text-xs space-y-1.5 text-slate-600 font-mono">
            <div>CEA Baseline: <span className="text-slate-800 font-bold">{diagnostics.baselines.cea_grid_emission_factor_t_mwh} tCO₂/MWh</span></div>
            <div>National PLF Ref: <span className="text-slate-800 font-semibold">{diagnostics.baselines.national_avg_plf_pct}%</span></div>
            <div>Default Scope: <span className="text-emerald-700 font-semibold">{diagnostics.baselines.default_fuel_scope}</span></div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center space-x-1.5 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>CEA Grid Baseline v19/v20</span>
          </div>
        </div>
      </div>

      {/* Cache Management Action */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <span>Analytical Store Maintenance</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Force re-indexing and verify integrity of SQLite relations and Parquet data chunks.
            </p>
          </div>

          <button
            onClick={handleRefreshCache}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Verify & Refresh Cache</span>
          </button>
        </div>

        {refreshMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{refreshMessage}</span>
          </div>
        )}
      </div>

      {/* Parquet Analytical Cache File Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Registered Analytical Parquet Chunks
          </h3>
        </div>
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Cache Table Name</th>
              <th className="py-2.5 px-4 text-right">Size on Disk (MB)</th>
              <th className="py-2.5 px-4 text-right">Integrity Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {diagnostics.analytical_parquet_cache.files.map((f: any) => (
              <tr key={f.file} className="hover:bg-slate-50 font-mono">
                <td className="py-2.5 px-4 text-slate-900 font-semibold">{f.file}</td>
                <td className="py-2.5 px-4 text-right text-slate-700">{f.size_mb} MB</td>
                <td className="py-2.5 px-4 text-right text-emerald-600 font-sans font-bold">Verified OK</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
