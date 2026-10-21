export interface DashboardMetrics {
  reporting_period: string;
  fuel_scope: string;
  state_scope: string;
  total_emissions_mt: number;
  total_generation_gwh: number;
  weighted_carbon_intensity_t_mwh: number | null;
  weighted_carbon_intensity_g_kwh: number | null;
  monitored_coal_plants: number;
  total_installed_capacity_gw: number;
  average_plant_load_factor_pct: number | null;
  yoy_emissions_change_pct: number | null;
  yoy_generation_change_pct: number | null;
  highest_emitting_state: {
    state: string;
    emissions_mt: number;
  };
  highest_emitting_plant: {
    plant_name: string;
    emissions_mt: number;
  };
  lowest_intensity_plant: {
    plant_name: string;
    intensity_t_mwh: number | null;
  };
  cea_baseline_benchmark_t_mwh: number;
  cea_intensity_variance_pct: number | null;
  is_partial_scope_notice: boolean;
}

export interface TrendPoint {
  fiscal_year: string;
  emissions_mt: number;
  generation_gwh: number;
  intensity_t_mwh: number | null;
}

export interface StateRankPoint {
  state: string;
  emissions_mt: number;
  generation_gwh: number;
  capacity_gw: number;
}

export interface TopPlantPoint {
  plant_name: string;
  state: string;
  capacity_mw: number;
  emissions_mt: number;
  intensity_t_mwh: number | null;
}

export interface DashboardCharts {
  annual_trend: TrendPoint[];
  state_emissions_ranking: StateRankPoint[];
  top_10_plants: TopPlantPoint[];
}

export interface PlantRecord {
  plant_id: string;
  plant_name: string;
  state: string;
  zone_name: string;
  fuel_type: string;
  technology: string;
  installed_capacity_mw: number;
  net_generation_gwh: number | null;
  total_co2_tonnes: number | null;
  total_co2_mt: number | null;
  emission_intensity_t_mwh: number | null;
  emission_intensity_g_kwh: number | null;
  plant_load_factor_pct: number | null;
  start_year: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface MapMarker {
  plant_id: string;
  plant_name: string;
  state: string;
  lat: number;
  lng: number;
  installed_capacity_mw: number;
  net_generation_gwh: number;
  total_co2_tonnes: number;
  total_co2_mt: number;
  intensity_t_mwh: number | null;
  technology: string;
}

export interface StateSummaryItem {
  state: string;
  installed_capacity_gw: number;
  plant_count: number;
  net_generation_gwh: number;
  total_emissions_mt: number;
  national_share_pct: number;
  weighted_intensity_t_mwh: number | null;
  mean_plant_intensity_t_mwh: number | null;
  median_plant_intensity_t_mwh: number | null;
}

export interface EmissionControlTech {
  id: string;
  name: string;
  category: string;
  abatement_potential_co2_pct: string;
  primary_target: string;
  readiness_level: string;
  capex_requirement: string;
  advantages: string[];
  limitations_and_impacts: string[];
  regulatory_status: string;
}

export interface DecarbonizationTimelineStage {
  stage: number;
  period: string;
  title: string;
  focus: string;
  avg_emission_intensity_t_mwh: number;
  annual_emissions_mt: string;
  key_milestones: string[];
}

export interface AbatementPieItem {
  name: string;
  share_pct: number;
  abatement_potential_mt_yr: number;
  color: string;
  description: string;
}

export interface MultiDecadeTimelinePoint {
  year: number;
  bau_emissions_mt: number;
  mitigated_emissions_mt: number;
  intensity_t_mwh: number;
  phase: string;
}
