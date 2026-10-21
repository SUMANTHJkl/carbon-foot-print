"""
Statistical Analysis Module: CoalCarbon India
Pearson/Spearman correlations, intensity distributions, outlier detection, and concentration metrics.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from scipy import stats
from backend.app.core.config import PROCESSED_DATA_DIR

def get_annual_dataframe(fuel: str = "COAL", fiscal_year: Optional[str] = None) -> pd.DataFrame:
    parquet_path = PROCESSED_DATA_DIR / "annual_aggregates.parquet"
    if not parquet_path.exists():
        return pd.DataFrame()
    df = pd.read_parquet(parquet_path)
    if fuel != "ALL":
        df = df[df["fuel_type"] == fuel]
    if fiscal_year:
        df = df[df["fiscal_year"] == fiscal_year]
    return df

def calculate_correlations(fuel: str = "COAL", fiscal_year: str = "2023-24") -> Dict[str, Any]:
    df = get_annual_dataframe(fuel=fuel, fiscal_year=fiscal_year)
    if df.empty or len(df) < 5:
        return {"error": "Insufficient data for correlation analysis"}

    # Features of interest
    cols = ["installed_capacity_mw", "net_generation_gwh", "total_co2_tonnes", "emission_intensity_t_mwh", "plant_load_factor_pct"]
    valid_cols = [c for c in cols if c in df.columns]
    clean_df = df[valid_cols].dropna()

    if len(clean_df) < 5:
        return {"error": "Insufficient complete cases for correlation calculation"}

    pearson_corr = clean_df.corr(method="pearson").to_dict()
    spearman_corr = clean_df.corr(method="spearman").to_dict()

    # Specific key relationships with p-values
    p_gen_emiss, p_val_gen_emiss = stats.pearsonr(clean_df["net_generation_gwh"], clean_df["total_co2_tonnes"])
    s_cap_emiss, s_val_cap_emiss = stats.spearmanr(clean_df["installed_capacity_mw"], clean_df["total_co2_tonnes"])
    
    return {
        "fiscal_year": fiscal_year,
        "sample_size": len(clean_df),
        "pearson_matrix": pearson_corr,
        "spearman_matrix": spearman_corr,
        "highlights": [
            {
                "relationship": "Net Generation vs CO2 Emissions",
                "pearson_r": round(float(p_gen_emiss), 4),
                "p_value": float(f"{p_val_gen_emiss:.2e}"),
                "interpretation": "Strong direct linear correlation expected from thermodynamic coal combustion stoichiometry."
            },
            {
                "relationship": "Installed Capacity vs Total Emissions",
                "spearman_rho": round(float(s_cap_emiss), 4),
                "p_value": float(f"{s_val_cap_emiss:.2e}"),
                "interpretation": "High rank-order correlation; larger stations dominate national emissions volume."
            }
        ]
    }

def calculate_intensity_distribution(fuel: str = "COAL", fiscal_year: str = "2023-24") -> Dict[str, Any]:
    df = get_annual_dataframe(fuel=fuel, fiscal_year=fiscal_year)
    if df.empty:
        return {"error": "No data found"}

    intensities = df["emission_intensity_t_mwh"].dropna()
    # Filter realistic bounds (0.5 to 2.5 tCO2/MWh)
    valid_intensities = intensities[(intensities >= 0.5) & (intensities <= 2.5)]

    if len(valid_intensities) == 0:
        return {"error": "No valid emission intensity values"}

    mean_val = float(np.mean(valid_intensities))
    median_val = float(np.median(valid_intensities))
    std_val = float(np.std(valid_intensities))
    p25, p75, p95 = np.percentile(valid_intensities, [25, 75, 95])

    # Histogram bins (e.g. 0.7 to 1.5 in steps of 0.05)
    hist, bin_edges = np.histogram(valid_intensities, bins=12)
    bins_data = []
    for i in range(len(hist)):
        bins_data.append({
            "bin_start": round(float(bin_edges[i]), 3),
            "bin_end": round(float(bin_edges[i+1]), 3),
            "count": int(hist[i]),
            "label": f"{bin_edges[i]:.2f} - {bin_edges[i+1]:.2f}"
        })

    return {
        "fiscal_year": fiscal_year,
        "sample_count": len(valid_intensities),
        "mean": round(mean_val, 4),
        "median": round(median_val, 4),
        "std_dev": round(std_val, 4),
        "percentile_25": round(float(p25), 4),
        "percentile_75": round(float(p75), 4),
        "percentile_95": round(float(p95), 4),
        "skewness": round(float(stats.skew(valid_intensities)), 4),
        "distribution_bins": bins_data
    }

def detect_outliers(fuel: str = "COAL", fiscal_year: str = "2023-24") -> Dict[str, Any]:
    df = get_annual_dataframe(fuel=fuel, fiscal_year=fiscal_year)
    if df.empty:
        return {"outliers": []}

    clean = df.dropna(subset=["emission_intensity_t_mwh", "plant_name"]).copy()
    q25 = clean["emission_intensity_t_mwh"].quantile(0.25)
    q75 = clean["emission_intensity_t_mwh"].quantile(0.75)
    iqr = q75 - q25
    lower_bound = q25 - 1.5 * iqr
    upper_bound = q75 + 1.5 * iqr

    outliers = clean[
        (clean["emission_intensity_t_mwh"] < lower_bound) | 
        (clean["emission_intensity_t_mwh"] > upper_bound)
    ]

    outlier_list = []
    for _, r in outliers.iterrows():
        outlier_list.append({
            "plant_name": r["plant_name"],
            "state": r["state"],
            "capacity_mw": r["installed_capacity_mw"],
            "intensity_t_mwh": round(float(r["emission_intensity_t_mwh"]), 3),
            "total_emissions_mt": round(float(r["total_co2_tonnes"] / 1_000_000.0), 3) if r["total_co2_tonnes"] else None,
            "type": "High Intensity" if r["emission_intensity_t_mwh"] > upper_bound else "Low Intensity / Possible Reporting Issue",
            "iqr_boundary": round(float(upper_bound if r["emission_intensity_t_mwh"] > upper_bound else lower_bound), 3)
        })

    return {
        "fiscal_year": fiscal_year,
        "q25": round(float(q25), 3),
        "q75": round(float(q75), 3),
        "iqr": round(float(iqr), 3),
        "lower_bound": round(float(lower_bound), 3),
        "upper_bound": round(float(upper_bound), 3),
        "outlier_count": len(outlier_list),
        "outliers": outlier_list
    }

def calculate_emissions_concentration(fuel: str = "COAL", fiscal_year: str = "2023-24") -> Dict[str, Any]:
    df = get_annual_dataframe(fuel=fuel, fiscal_year=fiscal_year)
    if df.empty:
        return {}

    sorted_df = df.dropna(subset=["total_co2_tonnes"]).sort_values("total_co2_tonnes", ascending=False)
    total_emiss = sorted_df["total_co2_tonnes"].sum()
    if total_emiss <= 0:
        return {}

    sorted_df["cumulative_emiss"] = sorted_df["total_co2_tonnes"].cumsum()
    sorted_df["cumulative_emiss_pct"] = (sorted_df["cumulative_emiss"] / total_emiss) * 100.0
    sorted_df["plant_rank"] = range(1, len(sorted_df) + 1)
    sorted_df["cumulative_plant_pct"] = (sorted_df["plant_rank"] / len(sorted_df)) * 100.0

    top_10_share = sorted_df.iloc[:10]["total_co2_tonnes"].sum() / total_emiss * 100.0
    top_20_share = sorted_df.iloc[:20]["total_co2_tonnes"].sum() / total_emiss * 100.0

    # Decile curve
    curve_points = []
    for step in range(10, 101, 10):
        cutoff_idx = int(len(sorted_df) * (step / 100.0)) - 1
        cutoff_idx = max(0, min(cutoff_idx, len(sorted_df) - 1))
        curve_points.append({
            "plant_share_pct": step,
            "emissions_share_pct": round(float(sorted_df.iloc[cutoff_idx]["cumulative_emiss_pct"]), 2)
        })

    return {
        "fiscal_year": fiscal_year,
        "total_emissions_mt": round(float(total_emiss / 1_000_000.0), 2),
        "monitored_stations": len(sorted_df),
        "top_10_plants_share_pct": round(float(top_10_share), 2),
        "top_20_plants_share_pct": round(float(top_20_share), 2),
        "concentration_curve": curve_points
    }
