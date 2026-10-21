import React, { useEffect, useState } from 'react';
import { useFilter } from '../context/FilterContext';
import { fetchPlants } from '../services/api';
import { PlantRecord } from '../types';
import { Search, Download, Factory, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { PlantDetailPage } from './PlantDetailPage';

export const PlantsPage: React.FC = () => {
  const { fiscalYear, fuel, selectedState, selectedPlantId, setSelectedPlantId } = useFilter();
  const [plants, setPlants] = useState<PlantRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [technology, setTechnology] = useState('');
  const [sortBy, setSortBy] = useState('total_co2_tonnes');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPlants({
      page,
      limit,
      search: search || undefined,
      state: selectedState || undefined,
      fuel,
      technology: technology || undefined,
      sort_by: sortBy,
      sort_dir: sortDir,
      fiscal_year: fiscalYear,
    })
      .then((res) => {
        setPlants(res.records);
        setTotalRecords(res.total_records);
        setTotalPages(res.total_pages);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching plants', err);
        setLoading(false);
      });
  }, [page, limit, search, selectedState, fuel, technology, sortBy, sortDir, fiscalYear]);

  // If a plant is selected for detail view, show PlantDetailPage
  if (selectedPlantId) {
    return <PlantDetailPage plantId={selectedPlantId} onBack={() => setSelectedPlantId(null)} />;
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    window.open(`/api/plants/export?fuel=${fuel}&fiscal_year=${fiscalYear}`, '_blank');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Factory className="w-6 h-6 text-emerald-600" />
            <span>Power Plant Explorer</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, benchmark, and inspect operational metrics across {totalRecords} monitored thermal stations.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Filtered (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search station or state..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={technology}
            onChange={(e) => {
              setTechnology(e.target.value);
              setPage(1);
            }}
            className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All Technologies</option>
            <option value="Subcritical">Subcritical</option>
            <option value="Supercritical">Supercritical</option>
            <option value="Ultra-supercritical">Ultra-supercritical</option>
          </select>

          <span className="text-xs text-slate-400 font-mono">
            {totalRecords} records found
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-3">Station Name</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Tech</th>
                <th
                  onClick={() => handleSort('installed_capacity_mw')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Capacity (MW)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('net_generation_gwh')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Gen (GWh)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('total_co2_tonnes')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>CO₂ (Mt)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('emission_intensity_t_mwh')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Intensity (t/MWh)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('plant_load_factor_pct')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>PLF (%)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading plant records...
                  </td>
                </tr>
              ) : plants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No matching thermal plants found.
                  </td>
                </tr>
              ) : (
                plants.map((plant) => (
                  <tr
                    key={plant.plant_id}
                    onClick={() => setSelectedPlantId(plant.plant_id)}
                    className="hover:bg-emerald-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="hover:text-emerald-700">{plant.plant_name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{plant.state}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {plant.technology || 'Subcritical'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-800">
                      {plant.installed_capacity_mw.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {plant.net_generation_gwh ? plant.net_generation_gwh.toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-red-600">
                      {plant.total_co2_mt !== null ? plant.total_co2_mt : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {plant.emission_intensity_t_mwh !== null ? (
                        <span
                          className={`px-1.5 py-0.5 rounded font-semibold text-[11px] ${
                            plant.emission_intensity_t_mwh > 1.05
                              ? 'bg-red-50 text-red-700'
                              : plant.emission_intensity_t_mwh < 0.90
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {plant.emission_intensity_t_mwh}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {plant.plant_load_factor_pct !== null ? `${plant.plant_load_factor_pct}%` : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalRecords)} of {totalRecords} plants
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-semibold text-slate-700">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
