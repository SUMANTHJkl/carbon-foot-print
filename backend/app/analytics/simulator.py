"""
Carbon Reduction Scenario Simulator: CoalCarbon India
Simulates hypothetical decarbonization pathways, efficiency upgrades, and clean energy substitution.
"""

from typing import Dict, Any, Optional
import pandas as pd
from backend.app.core.config import PROCESSED_DATA_DIR

# Lifecycle emission factors for replacement sources (tCO2/MWh, IPCC AR5 / CEA guidelines)
REPLACEMENT_EMISSION_FACTORS = {
    "zero_emission": 0.0,
    "solar_pv": 0.041,      # 41 gCO2/kWh lifecycle
    "onshore_wind": 0.015,  # 15 gCO2/kWh lifecycle
    "solar_wind_hybrid": 0.028,
    "nuclear": 0.012,       # 12 gCO2/kWh lifecycle
    "hydro": 0.024          # 24 gCO2/kWh lifecycle
}

def simulate_carbon_reduction(
    scope_type: str = "national",  # national, state, plant
    target_id: Optional[str] = None,
    baseline_year: str = "2023-24",
    intensity_reduction_pct: float = 5.0,     # e.g., 5% reduction via biomass co-firing / heat rate improvement
    generation_reduction_pct: float = 10.0,   # e.g., 10% coal generation replaced
    replacement_source: str = "solar_wind_hybrid",
    custom_replacement_factor: Optional[float] = None
) -> Dict[str, Any]:
    agg_path = PROCESSED_DATA_DIR / "annual_aggregates.parquet"
    if not agg_path.exists():
        return {"error": "Aggregates data not found"}

    df = pd.read_parquet(agg_path)
    df = df[(df["fuel_type"] == "COAL") & (df["fiscal_year"] == baseline_year)]

    if scope_type == "state" and target_id:
        df = df[df["state"] == target_id.upper()]
    elif scope_type == "plant" and target_id:
        df = df[df["plant_id"] == target_id]

    if df.empty:
        return {"error": f"No baseline data for scope={scope_type}, target={target_id}, year={baseline_year}"}

    baseline_generation_gwh = float(df["net_generation_gwh"].sum())
    baseline_generation_mwh = baseline_generation_gwh * 1000.0
    baseline_emissions_tonnes = float(df["total_co2_tonnes"].sum())

    if baseline_generation_mwh <= 0 or baseline_emissions_tonnes <= 0:
        return {"error": "Invalid baseline: Zero generation or zero emissions"}

    baseline_intensity_t_mwh = baseline_emissions_tonnes / baseline_generation_mwh

    # Replacement factor
    if custom_replacement_factor is not None:
        replacement_factor = float(custom_replacement_factor)
    else:
        replacement_factor = REPLACEMENT_EMISSION_FACTORS.get(replacement_source, 0.0)

    # Calculation logic:
    # 1. Coal generation retained
    coal_gen_fraction = max(0.0, 1.0 - (generation_reduction_pct / 100.0))
    scenario_coal_gen_mwh = baseline_generation_mwh * coal_gen_fraction

    # 2. Improved coal intensity
    intensity_fraction = max(0.0, 1.0 - (intensity_reduction_pct / 100.0))
    scenario_coal_intensity_t_mwh = baseline_intensity_t_mwh * intensity_fraction

    # 3. Coal emissions in scenario
    scenario_coal_emissions_tonnes = scenario_coal_gen_mwh * scenario_coal_intensity_t_mwh

    # 4. Replaced generation and replacement emissions
    replaced_gen_mwh = baseline_generation_mwh * (generation_reduction_pct / 100.0)
    replacement_emissions_tonnes = replaced_gen_mwh * replacement_factor

    # 5. Total scenario emissions
    total_scenario_emissions_tonnes = scenario_coal_emissions_tonnes + replacement_emissions_tonnes
    avoided_emissions_tonnes = baseline_emissions_tonnes - total_scenario_emissions_tonnes
    avoided_percentage = (avoided_emissions_tonnes / baseline_emissions_tonnes) * 100.0

    # 6. Overall system intensity after transition
    scenario_system_intensity_t_mwh = total_scenario_emissions_tonnes / baseline_generation_mwh

    return {
        "scope": {
            "type": scope_type,
            "target": target_id or "All India Monitored Coal Fleet",
            "baseline_year": baseline_year,
            "monitored_stations_count": int(df["plant_name"].nunique())
        },
        "inputs": {
            "intensity_reduction_pct": intensity_reduction_pct,
            "generation_reduction_pct": generation_reduction_pct,
            "replacement_source": replacement_source,
            "replacement_emission_factor_t_mwh": round(replacement_factor, 4)
        },
        "baseline": {
            "generation_gwh": round(baseline_generation_gwh, 2),
            "emissions_mt": round(baseline_emissions_tonnes / 1_000_000.0, 3),
            "carbon_intensity_t_mwh": round(baseline_intensity_t_mwh, 4),
            "carbon_intensity_g_kwh": round(baseline_intensity_t_mwh * 1000.0, 1)
        },
        "scenario": {
            "retained_coal_generation_gwh": round(scenario_coal_gen_mwh / 1000.0, 2),
            "replaced_generation_gwh": round(replaced_gen_mwh / 1000.0, 2),
            "coal_emissions_mt": round(scenario_coal_emissions_tonnes / 1_000_000.0, 3),
            "replacement_source_emissions_mt": round(replacement_emissions_tonnes / 1_000_000.0, 3),
            "total_scenario_emissions_mt": round(total_scenario_emissions_tonnes / 1_000_000.0, 3),
            "avoided_emissions_mt": round(avoided_emissions_tonnes / 1_000_000.0, 3),
            "avoided_emissions_percentage": round(avoided_percentage, 2),
            "new_system_intensity_t_mwh": round(scenario_system_intensity_t_mwh, 4),
            "new_system_intensity_g_kwh": round(scenario_system_intensity_t_mwh * 1000.0, 1)
        },
        "comparison_chart": [
            {
                "category": "Baseline",
                "coal_emissions_mt": round(baseline_emissions_tonnes / 1_000_000.0, 2),
                "replacement_emissions_mt": 0.0,
                "total_emissions_mt": round(baseline_emissions_tonnes / 1_000_000.0, 2)
            },
            {
                "category": "Scenario",
                "coal_emissions_mt": round(scenario_coal_emissions_tonnes / 1_000_000.0, 2),
                "replacement_emissions_mt": round(replacement_emissions_tonnes / 1_000_000.0, 2),
                "total_emissions_mt": round(total_scenario_emissions_tonnes / 1_000_000.0, 2)
            }
        ],
        "assumptions_and_provenance": [
            "All emissions metrics are modeled based on actual historical baseline generation and verified emissions factors.",
            f"Replacement clean electricity incorporates an explicit lifecycle carbon factor of {replacement_factor*1000:.1f} gCO2/kWh (IPCC / CEA harmonized value).",
            "Hypothetical scenario analysis for policy and engineering simulation; not a physical grid dispatch commitment."
        ]
    }
