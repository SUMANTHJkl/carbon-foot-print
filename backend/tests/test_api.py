import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "CoalCarbon India"
    assert data["database_ready"] is True
    assert data["processed_store_ready"] is True

def test_metadata_endpoint():
    res = client.get("/api/metadata")
    assert res.status_code == 200
    data = res.json()
    assert len(data["datasets"]) == 3
    assert "2023-24" in data["available_fiscal_years"]

def test_dashboard_metrics():
    res = client.get("/api/dashboard/metrics?fiscal_year=2023-24&fuel=COAL")
    assert res.status_code == 200
    data = res.json()
    assert data["total_emissions_mt"] > 0
    assert data["monitored_coal_plants"] > 100
    assert data["weighted_carbon_intensity_t_mwh"] is not None
    assert 0.7 < data["weighted_carbon_intensity_t_mwh"] < 1.3

def test_dashboard_charts():
    res = client.get("/api/dashboard/charts?fiscal_year=2023-24&fuel=COAL")
    assert res.status_code == 200
    data = res.json()
    assert len(data["annual_trend"]) > 0
    assert len(data["state_emissions_ranking"]) > 0
    assert len(data["top_10_plants"]) == 10

def test_plants_pagination_and_search():
    res = client.get("/api/plants?page=1&limit=10&fuel=COAL&fiscal_year=2023-24")
    assert res.status_code == 200
    data = res.json()
    assert len(data["records"]) == 10
    assert data["total_records"] > 100

    # Search by plant name
    search_res = client.get("/api/plants?search=Vindhyachal")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert any("VINDHYACHAL" in r["plant_name"] for r in search_data["records"])

def test_map_plants():
    res = client.get("/api/map/plants?fiscal_year=2023-24&fuel=COAL")
    assert res.status_code == 200
    data = res.json()
    assert data["total_markers"] > 100
    first_marker = data["markers"][0]
    assert "lat" in first_marker and "lng" in first_marker
    assert first_marker["lat"] is not None

def test_state_summary():
    res = client.get("/api/states?fiscal_year=2023-24&fuel=COAL")
    assert res.status_code == 200
    data = res.json()
    assert data["total_states"] > 10
    top_state = data["states"][0]
    assert top_state["total_emissions_mt"] > 0
    assert top_state["weighted_intensity_t_mwh"] is not None

def test_coal_analysis():
    res = client.get("/api/coal/analysis")
    assert res.status_code == 200
    data = res.json()
    assert data["total_consumption_kt"] > 0
    assert "Coal India Limited (CIL)" in data["receipts_by_source"]
    assert len(data["regional_breakdown"]) > 0

def test_statistics_endpoints():
    corr_res = client.get("/api/statistics/correlations?fuel=COAL&fiscal_year=2023-24")
    assert corr_res.status_code == 200
    assert "pearson_matrix" in corr_res.json()

    dist_res = client.get("/api/statistics/distribution?fuel=COAL&fiscal_year=2023-24")
    assert dist_res.status_code == 200
    assert "distribution_bins" in dist_res.json()

    outlier_res = client.get("/api/statistics/outliers?fuel=COAL&fiscal_year=2023-24")
    assert outlier_res.status_code == 200
    assert "outliers" in outlier_res.json()

def test_forecasting_regression_and_trend():
    reg_res = client.get("/api/forecasting/regression?fuel=COAL")
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert "metrics" in reg_data
    assert reg_data["metrics"]["r2_score"] > 0.8  # Strong fit for net gen -> emissions

    trend_res = client.get("/api/forecasting/trend")
    assert trend_res.status_code == 200
    trend_data = trend_res.json()
    assert len(trend_data["historical"]) > 0
    assert len(trend_data["projections"]) == 3

def test_decarbonization_endpoints():
    tech_res = client.get("/api/decarbonization/technologies")
    assert tech_res.status_code == 200
    assert len(tech_res.json()) >= 6

    pie_res = client.get("/api/decarbonization/abatement-pie")
    assert pie_res.status_code == 200
    pie_data = pie_res.json()
    total_share = sum(item["share_pct"] for item in pie_data)
    assert abs(total_share - 100.0) < 0.1

    timeline_res = client.get("/api/decarbonization/timeline-graph")
    assert timeline_res.status_code == 200
    assert len(timeline_res.json()) > 10

def test_simulation_run():
    payload = {
        "scope_type": "national",
        "baseline_year": "2023-24",
        "intensity_reduction_pct": 5.0,
        "generation_reduction_pct": 10.0,
        "replacement_source": "solar_wind_hybrid"
    }
    res = client.post("/api/simulator/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["scenario"]["avoided_emissions_mt"] > 0
    assert data["scenario"]["avoided_emissions_percentage"] > 10.0
