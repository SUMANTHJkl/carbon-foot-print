"""
AI Insights and Forecasting Engine: CoalCarbon India
Strict chronological train/test splits, regression benchmarks, time-series projection, and anomaly detection.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
from backend.app.core.config import PROCESSED_DATA_DIR

def load_daily_station_data(plant_id: Optional[str] = None) -> pd.DataFrame:
    daily_path = PROCESSED_DATA_DIR / "daily_station.parquet"
    if not daily_path.exists():
        return pd.DataFrame()
    df = pd.read_parquet(daily_path)
    if plant_id:
        df = df[df["plant_id"] == plant_id]
    return df

def train_generation_to_emissions_regression(fuel: str = "COAL") -> Dict[str, Any]:
    """
    Fits an empirical regression predicting emissions from net generation and capacity.
    Uses annual historical data across all monitored stations.
    """
    agg_path = PROCESSED_DATA_DIR / "annual_aggregates.parquet"
    if not agg_path.exists():
        return {"error": "Processed aggregates not found"}

    df = pd.read_parquet(agg_path)
    if fuel != "ALL":
        df = df[df["fuel_type"] == fuel]

    clean = df.dropna(subset=["net_generation_gwh", "installed_capacity_mw", "total_co2_tonnes", "fiscal_year"]).copy()
    clean = clean[(clean["net_generation_gwh"] > 0) & (clean["total_co2_tonnes"] > 0)]

    if len(clean) < 50:
        return {"error": "Insufficient records for regression"}

    # Chronological split: Train on <= 2022-23, Test on >= 2023-24
    train_mask = clean["fiscal_year"].isin(["2018-19", "2019-20", "2020-21", "2021-22", "2022-23"])
    test_mask = clean["fiscal_year"].isin(["2023-24", "2024-25"])

    train_df = clean[train_mask]
    test_df = clean[test_mask]

    if len(train_df) < 20 or len(test_df) < 10:
        # Fallback to random chronological 80/20 if fiscal year distribution differs
        idx = int(len(clean) * 0.8)
        train_df = clean.iloc[:idx]
        test_df = clean.iloc[idx:]

    X_train = train_df[["net_generation_gwh", "installed_capacity_mw"]]
    y_train = train_df["total_co2_tonnes"] / 1_000_000.0  # In Million Tonnes CO2

    X_test = test_df[["net_generation_gwh", "installed_capacity_mw"]]
    y_test = test_df["total_co2_tonnes"] / 1_000_000.0

    model = Ridge(alpha=1.0)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = root_mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    gen_coef = float(model.coef_[0])
    cap_coef = float(model.coef_[1])
    intercept = float(model.intercept_)

    # Scatter points for actual vs predicted in test set
    scatter_data = []
    for actual, pred, (_, r) in zip(y_test, y_pred, test_df.iterrows()):
        scatter_data.append({
            "plant_name": r["plant_name"],
            "fiscal_year": r["fiscal_year"],
            "generation_gwh": round(float(r["net_generation_gwh"]), 1),
            "actual_emissions_mt": round(float(actual), 2),
            "predicted_emissions_mt": round(float(pred), 2),
            "residual_mt": round(float(actual - pred), 2)
        })

    return {
        "model_type": "Ridge Regression (L2 Regularized)",
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "train_period": "FY 2018-19 to FY 2022-23",
        "test_period": "FY 2023-24 to FY 2024-25",
        "features": ["net_generation_gwh", "installed_capacity_mw"],
        "target": "total_co2_tonnes (Million Tonnes)",
        "metrics": {
            "r2_score": round(float(r2), 4),
            "mae_mt": round(float(mae), 3),
            "rmse_mt": round(float(rmse), 3)
        },
        "coefficients": {
            "generation_coef": round(gen_coef, 6),
            "capacity_coef": round(cap_coef, 6),
            "intercept": round(intercept, 4)
        },
        "test_scatter_sample": scatter_data[:25]
    }

def forecast_national_emissions_trend() -> Dict[str, Any]:
    """
    Produces evidence-based 3-year baseline trend projection from aggregate historical national emissions.
    """
    agg_path = PROCESSED_DATA_DIR / "annual_aggregates.parquet"
    if not agg_path.exists():
        return {"error": "Aggregates not found"}

    df = pd.read_parquet(agg_path)
    coal_df = df[df["fuel_type"] == "COAL"]

    annual = (
        coal_df.groupby("fiscal_year")
        .agg({
            "total_co2_tonnes": "sum",
            "net_generation_gwh": "sum",
            "installed_capacity_mw": "sum",
            "plant_name": "nunique"
        })
        .reset_index()
        .sort_values("fiscal_year")
    )

    # Convert to numeric year index for trend fit
    annual["year_idx"] = range(len(annual))
    annual["emissions_mt"] = annual["total_co2_tonnes"] / 1_000_000.0

    X = annual[["year_idx"]]
    y = annual["emissions_mt"]

    model = LinearRegression()
    model.fit(X, y)
    y_fitted = model.predict(X)

    historical_series = []
    for _, r in annual.iterrows():
        historical_series.append({
            "fiscal_year": r["fiscal_year"],
            "type": "Observed",
            "emissions_mt": round(float(r["emissions_mt"]), 2),
            "generation_gwh": round(float(r["net_generation_gwh"]), 1),
            "plant_count": int(r["plant_name"])
        })

    # Future 3-year projections
    last_year_num = int(annual.iloc[-1]["fiscal_year"][:4])
    last_idx = annual.iloc[-1]["year_idx"]
    future_series = []
    
    # Calculate historical residual standard deviation for prediction intervals
    residual_std = float(np.std(y - y_fitted))

    for step in range(1, 4):
        future_idx = last_idx + step
        fy_label = f"{last_year_num + step}-{str(last_year_num + step + 1)[-2:]}"
        pred_val = float(model.predict(pd.DataFrame([[future_idx]], columns=["year_idx"]))[0])
        future_series.append({
            "fiscal_year": fy_label,
            "type": "Baseline Trend Projection",
            "emissions_mt": round(pred_val, 2),
            "lower_95_mt": round(max(pred_val - 1.96 * residual_std, 0.0), 2),
            "upper_95_mt": round(pred_val + 1.96 * residual_std, 2)
        })

    return {
        "historical": historical_series,
        "projections": future_series,
        "trend_slope_mt_per_year": round(float(model.coef_[0]), 2),
        "methodology": "OLS trend regression on monitored national coal thermal historical series",
        "limitations": "Assumes historical capacity addition and dispatch trajectory without aggressive grid decarbonization policy interventions."
    }

def detect_daily_station_anomalies(plant_id: str) -> Dict[str, Any]:
    """
    Detects daily operational and emissions anomalies for a specific plant.
    """
    df = load_daily_station_data(plant_id=plant_id)
    if df.empty or len(df) < 30:
        return {"plant_id": plant_id, "anomalies": []}

    df = df.dropna(subset=["emissions_tons", "net_generation"]).copy()
    # Calculate daily intensity
    df["daily_intensity"] = df["emissions_tons"] / (df["net_generation"] * 1000.0)
    df = df[df["daily_intensity"] > 0]

    mean_int = df["daily_intensity"].mean()
    std_int = df["daily_intensity"].std()

    if std_int == 0 or np.isnan(std_int):
        return {"plant_id": plant_id, "anomalies": []}

    # Z-score > 2.5 or < -2.5
    df["z_score"] = (df["daily_intensity"] - mean_int) / std_int
    anomalies = df[abs(df["z_score"]) >= 2.5].sort_values("date", ascending=False)

    anomaly_records = []
    for _, r in anomalies.head(20).iterrows():
        anomaly_records.append({
            "date": str(r["date"])[:10],
            "emissions_tons": round(float(r["emissions_tons"]), 1),
            "net_generation_gwh": round(float(r["net_generation"]), 2),
            "daily_intensity_t_mwh": round(float(r["daily_intensity"]), 3),
            "z_score": round(float(r["z_score"]), 2),
            "alert": "Spike in Carbon Intensity" if r["z_score"] > 0 else "Unusually Low Intensity (Potential Reporting Lag)"
        })

    return {
        "plant_id": plant_id,
        "plant_name": df.iloc[0]["plant_name"],
        "total_analyzed_days": len(df),
        "mean_intensity_t_mwh": round(float(mean_int), 3),
        "anomaly_count": len(anomalies),
        "recent_anomalies": anomaly_records
    }
