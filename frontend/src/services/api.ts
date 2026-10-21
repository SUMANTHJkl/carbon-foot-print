import {
  DashboardMetrics,
  DashboardCharts,
  PlantRecord,
  MapMarker,
  StateSummaryItem,
  EmissionControlTech,
  DecarbonizationTimelineStage,
  AbatementPieItem,
  MultiDecadeTimelinePoint
} from '../types';

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchMetadata() {
  const res = await fetch(`${API_BASE}/metadata`);
  return res.json();
}

export async function fetchDashboardMetrics(fiscalYear = '2023-24', fuel = 'COAL', state?: string): Promise<DashboardMetrics> {
  let url = `${API_BASE}/dashboard/metrics?fiscal_year=${fiscalYear}&fuel=${fuel}`;
  if (state) url += `&state=${encodeURIComponent(state)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function fetchDashboardCharts(fiscalYear = '2023-24', fuel = 'COAL'): Promise<DashboardCharts> {
  const res = await fetch(`${API_BASE}/dashboard/charts?fiscal_year=${fiscalYear}&fuel=${fuel}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard charts');
  return res.json();
}

export async function fetchPlants(params: {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  fuel?: string;
  technology?: string;
  sort_by?: string;
  sort_dir?: string;
  fiscal_year?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.state) searchParams.set('state', params.state);
  if (params.fuel) searchParams.set('fuel', params.fuel);
  if (params.technology) searchParams.set('technology', params.technology);
  if (params.sort_by) searchParams.set('sort_by', params.sort_by);
  if (params.sort_dir) searchParams.set('sort_dir', params.sort_dir);
  if (params.fiscal_year) searchParams.set('fiscal_year', params.fiscal_year);

  const res = await fetch(`${API_BASE}/plants?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch plants');
  return res.json();
}

export async function fetchPlantDetail(plantId: string) {
  const res = await fetch(`${API_BASE}/plants/${plantId}`);
  if (!res.ok) throw new Error('Failed to fetch plant detail');
  return res.json();
}

export async function fetchMapPlants(fiscalYear = '2023-24', fuel = 'COAL'): Promise<{ total_markers: number; markers: MapMarker[] }> {
  const res = await fetch(`${API_BASE}/map/plants?fiscal_year=${fiscalYear}&fuel=${fuel}`);
  if (!res.ok) throw new Error('Failed to fetch map plants');
  return res.json();
}

export async function fetchStates(fiscalYear = '2023-24', fuel = 'COAL'): Promise<{ total_states: number; states: StateSummaryItem[] }> {
  const res = await fetch(`${API_BASE}/states?fiscal_year=${fiscalYear}&fuel=${fuel}`);
  if (!res.ok) throw new Error('Failed to fetch states');
  return res.json();
}

export async function fetchTimeseries(plantId?: string, limit = 180) {
  let url = `${API_BASE}/timeseries?limit=${limit}`;
  if (plantId) url += `&plant_id=${plantId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch timeseries');
  return res.json();
}

export async function fetchCoalAnalysis() {
  const res = await fetch(`${API_BASE}/coal/analysis`);
  if (!res.ok) throw new Error('Failed to fetch coal analysis');
  return res.json();
}

export async function fetchStatistics(fuel = 'COAL', fiscalYear = '2023-24') {
  const [corr, dist, outliers, conc] = await Promise.all([
    fetch(`${API_BASE}/statistics/correlations?fuel=${fuel}&fiscal_year=${fiscalYear}`).then(r => r.json()),
    fetch(`${API_BASE}/statistics/distribution?fuel=${fuel}&fiscal_year=${fiscalYear}`).then(r => r.json()),
    fetch(`${API_BASE}/statistics/outliers?fuel=${fuel}&fiscal_year=${fiscalYear}`).then(r => r.json()),
    fetch(`${API_BASE}/statistics/concentration?fuel=${fuel}&fiscal_year=${fiscalYear}`).then(r => r.json()),
  ]);
  return { correlations: corr, distribution: dist, outliers, concentration: conc };
}

export async function fetchForecasting(fuel = 'COAL') {
  const [regression, trend] = await Promise.all([
    fetch(`${API_BASE}/forecasting/regression?fuel=${fuel}`).then(r => r.json()),
    fetch(`${API_BASE}/forecasting/trend`).then(r => r.json()),
  ]);
  return { regression, trend };
}

export async function runSimulation(payload: {
  scope_type: string;
  target_id?: string;
  baseline_year: string;
  intensity_reduction_pct: number;
  generation_reduction_pct: number;
  replacement_source: string;
  custom_replacement_factor?: number;
}) {
  const res = await fetch(`${API_BASE}/simulator/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Simulation failed');
  return res.json();
}

export async function fetchDecarbonizationData(): Promise<{
  technologies: EmissionControlTech[];
  timeline: DecarbonizationTimelineStage[];
  abatementPie: AbatementPieItem[];
  timelineGraph: MultiDecadeTimelinePoint[];
}> {
  const [tech, time, pie, graph] = await Promise.all([
    fetch(`${API_BASE}/decarbonization/technologies`).then(r => r.json()),
    fetch(`${API_BASE}/decarbonization/timeline`).then(r => r.json()),
    fetch(`${API_BASE}/decarbonization/abatement-pie`).then(r => r.json()),
    fetch(`${API_BASE}/decarbonization/timeline-graph`).then(r => r.json()),
  ]);
  return { technologies: tech, timeline: time, abatementPie: pie, timelineGraph: graph };
}

export async function fetchEfficiencyAnalysis(fiscalYear = '2023-24', fuel = 'COAL') {
  const res = await fetch(`${API_BASE}/efficiency/analysis?fiscal_year=${fiscalYear}&fuel=${fuel}`);
  if (!res.ok) throw new Error('Failed to fetch efficiency metrics');
  return res.json();
}

export async function uploadDataset(formData: FormData) {
  const res = await fetch(`${API_BASE}/explorer/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload and validate file');
  return res.json();
}

export async function fetchDiagnostics() {
  const res = await fetch(`${API_BASE}/settings/diagnostics`);
  if (!res.ok) throw new Error('Failed to fetch system diagnostics');
  return res.json();
}

