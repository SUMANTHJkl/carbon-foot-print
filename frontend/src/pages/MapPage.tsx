import React, { useEffect, useState, useRef } from 'react';
import { useFilter } from '../context/FilterContext';
import { fetchMapPlants } from '../services/api';
import { MapMarker } from '../types';
import L from 'leaflet';
import { MapPin, Search, Filter, Factory, Flame, Layers } from 'lucide-react';

export const MapPage: React.FC = () => {
  const { fiscalYear, fuel, selectedState, setSelectedPlantId, setActiveTab } = useFilter();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [filteredMarkers, setFilteredMarkers] = useState<MapMarker[]>([]);
  const [search, setSearch] = useState('');
  const [colorMode, setColorMode] = useState<'emissions' | 'intensity'>('emissions');
  const [selectedStation, setSelectedStation] = useState<MapMarker | null>(null);
  const [loading, setLoading] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchMapPlants(fiscalYear, fuel)
      .then((res) => {
        setMarkers(res.markers);
        setFilteredMarkers(res.markers);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching map markers', err);
        setLoading(false);
      });
  }, [fiscalYear, fuel]);

  // Apply state filter and search
  useEffect(() => {
    let result = markers;
    if (selectedState) {
      result = result.filter((m) => m.state === selectedState.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) => m.plant_name.toLowerCase().includes(q) || m.state.toLowerCase().includes(q)
      );
    }
    setFilteredMarkers(result);
  }, [selectedState, search, markers]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.8, 80.0], // Center of India
        zoom: 5,
        minZoom: 4,
        maxZoom: 12,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const markersGroup = markersLayerRef.current;
    if (!markersGroup) return;

    markersGroup.clearLayers();

    filteredMarkers.forEach((m) => {
      // Determine marker color and size based on emissions or intensity
      let color = '#059669'; // Green default
      let radius = 6;

      if (colorMode === 'emissions') {
        if (m.total_co2_mt > 12) {
          color = '#dc2626'; // Red for heavy emitters
          radius = 11;
        } else if (m.total_co2_mt > 6) {
          color = '#f59e0b'; // Amber
          radius = 8.5;
        } else {
          color = '#10b981'; // Emerald
          radius = 6;
        }
      } else {
        // Intensity mode
        if (m.intensity_t_mwh && m.intensity_t_mwh > 1.05) {
          color = '#dc2626';
          radius = 9;
        } else if (m.intensity_t_mwh && m.intensity_t_mwh > 0.95) {
          color = '#f59e0b';
          radius = 7.5;
        } else {
          color = '#10b981';
          radius = 6.5;
        }
      }

      const circle = L.circleMarker([m.lat, m.lng], {
        radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.85,
      });

      // HTML Popup
      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; min-width: 180px;">
          <h4 style="font-weight: 700; margin: 0 0 4px 0; color: #0f172a; font-size: 13px;">${m.plant_name}</h4>
          <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px;">${m.state} • ${m.technology}</p>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; line-height: 1.5;">
            <div><b>Capacity:</b> ${m.installed_capacity_mw.toLocaleString()} MW</div>
            <div><b>CO₂ Emissions:</b> ${m.total_co2_mt} Mt</div>
            <div><b>Intensity:</b> ${m.intensity_t_mwh ? `${m.intensity_t_mwh} t/MWh` : 'N/A'}</div>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);
      circle.on('click', () => {
        setSelectedStation(m);
      });

      markersGroup.addLayer(circle);
    });
  }, [filteredMarkers, colorMode]);

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-600" />
            <span>Interactive India Power Plant Map</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Geographic distribution of {filteredMarkers.length} verified coal power stations plotted with survey-verified coordinates.
          </p>
        </div>

        {/* Legend / Color Mode Toggle */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start md:self-auto">
          <span className="font-semibold text-slate-600 px-2">Color by:</span>
          <button
            onClick={() => setColorMode('emissions')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              colorMode === 'emissions' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500'
            }`}
          >
            Emissions Volume (Mt)
          </button>
          <button
            onClick={() => setColorMode('intensity')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              colorMode === 'intensity' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500'
            }`}
          >
            Carbon Intensity (t/MWh)
          </button>
        </div>
      </div>

      {/* Main Map + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Canvas (3 Columns) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-2 shadow-sm relative h-[620px] flex flex-col">
          <div ref={mapContainerRef} className="w-full flex-1 rounded-lg overflow-hidden" />

          {/* Map Overlay Legend */}
          <div className="absolute bottom-5 left-5 z-20 bg-white/95 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-lg text-[11px] space-y-1.5">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
              {colorMode === 'emissions' ? 'Annual Emissions Scale' : 'Carbon Intensity Scale'}
            </span>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>{colorMode === 'emissions' ? '< 6 Mt (Lower footprint)' : '< 0.95 t/MWh (Efficient)'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>{colorMode === 'emissions' ? '6 – 12 Mt (Moderate)' : '0.95 – 1.05 t/MWh (Baseline)'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              <span>{colorMode === 'emissions' ? '> 12 Mt (Heavy Emitter)' : '> 1.05 t/MWh (High Intensity)'}</span>
            </div>
          </div>
        </div>

        {/* Companion Plant List Sidebar (1 Column) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col h-[620px]">
          <div className="mb-3">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Companion Station List</h3>
            <div className="relative mt-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter stations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
            {filteredMarkers.map((m) => (
              <div
                key={m.plant_id}
                onClick={() => {
                  setSelectedStation(m);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([m.lat, m.lng], 8);
                  }
                }}
                className={`pt-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedStation?.plant_id === m.plant_id ? 'bg-emerald-50 border border-emerald-300' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 truncate max-w-[170px]">{m.plant_name}</span>
                  <span className="font-mono text-red-600 font-bold text-[11px]">{m.total_co2_mt} Mt</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>{m.state}</span>
                  <span className="font-mono">{m.installed_capacity_mw.toLocaleString()} MW</span>
                </div>
                {selectedStation?.plant_id === m.plant_id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlantId(m.plant_id);
                      setActiveTab('plants');
                    }}
                    className="w-full mt-2 text-center py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                  >
                    View Station Details
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
