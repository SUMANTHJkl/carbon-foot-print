import pytest
import math
from backend.app.analytics.engine import (
    calculate_weighted_emission_intensity,
    convert_intensity_t_mwh_to_g_kwh,
    calculate_year_on_year_change,
    calculate_plant_contribution,
    calculate_plant_load_factor,
    calculate_coal_consumption_intensity,
    calculate_stock_autonomy_days,
    get_hours_in_fiscal_year
)
from backend.app.ingestion.reconciliation import PlantReconciler, normalize_plant_name

def test_weighted_emission_intensity_standard():
    # 1,000,000 tonnes CO2 from 1,000,000 MWh = 1.0 tCO2/MWh
    intensity = calculate_weighted_emission_intensity(1_000_000, 1_000_000)
    assert intensity == 1.0

def test_weighted_emission_intensity_zero_generation():
    # Division by zero should safely return None
    assert calculate_weighted_emission_intensity(1000, 0) is None
    assert calculate_weighted_emission_intensity(1000, -50) is None
    assert calculate_weighted_emission_intensity(1000, None) is None

def test_weighted_emission_intensity_negative_or_none():
    assert calculate_weighted_emission_intensity(None, 1000) is None
    assert calculate_weighted_emission_intensity(-100, 1000) is None

def test_intensity_unit_conversion():
    # 0.95 tCO2/MWh = 950 gCO2/kWh
    assert convert_intensity_t_mwh_to_g_kwh(0.95) == 950.0
    assert convert_intensity_t_mwh_to_g_kwh(None) is None
    assert convert_intensity_t_mwh_to_g_kwh(-0.5) is None

def test_year_on_year_change():
    # Increase from 100 to 110 = +10%
    assert calculate_year_on_year_change(110, 100) == 10.0
    # Decrease from 100 to 80 = -20%
    assert calculate_year_on_year_change(80, 100) == -20.0
    # Zero or negative previous value returns None
    assert calculate_year_on_year_change(100, 0) is None
    assert calculate_year_on_year_change(100, -10) is None
    assert calculate_year_on_year_change(100, None) is None

def test_plant_contribution():
    # 25 Mt out of 100 Mt = 25%
    assert calculate_plant_contribution(25, 100) == 25.0
    assert calculate_plant_contribution(None, 100) is None
    assert calculate_plant_contribution(25, 0) is None
    assert calculate_plant_contribution(25, None) is None

def test_plant_load_factor_standard_and_leap():
    # 1000 MW running at full capacity for 8760 hours (non-leap year)
    gen_mwh = 1000 * 8760
    assert calculate_plant_load_factor(gen_mwh, 1000, 8760) == 100.0

    # 1000 MW running half capacity
    assert calculate_plant_load_factor(gen_mwh / 2, 1000, 8760) == 50.0

    # Zero or negative handling
    assert calculate_plant_load_factor(0, 1000, 8760) == 0.0
    assert calculate_plant_load_factor(100, 0, 8760) is None
    assert calculate_plant_load_factor(100, None, 8760) is None

    # Leap year hours
    assert get_hours_in_fiscal_year("2023-24") == 8784.0
    assert get_hours_in_fiscal_year("2022-23") == 8760.0

def test_coal_consumption_intensity():
    # 700,000 kg coal for 1,000,000 kWh = 0.70 kg/kWh
    assert calculate_coal_consumption_intensity(700_000, 1_000_000) == 0.70
    assert calculate_coal_consumption_intensity(700_000, 0) is None
    assert calculate_coal_consumption_intensity(None, 1_000_000) is None

def test_stock_autonomy_days():
    # 300 kt closing stock, 300 kt consumption in 30 days -> 30 days of stock
    assert calculate_stock_autonomy_days(300, 300, 30) == 30.0
    assert calculate_stock_autonomy_days(0, 300, 30) == 0.0
    assert calculate_stock_autonomy_days(300, 0, 30) == 0.0

def test_plant_reconciliation_exact_and_overrides():
    reconciler = PlantReconciler()
    # Test normalization
    assert normalize_plant_name("  Vindhyachal   STPS ") == "VINDHYACHAL STPS"
    
    # Load manual overrides
    reconciler.alias_to_canonical = {
        "CHANDRAPUR (MAHARASHTRA) STPS": "CHANDRAPUR STPS",
        "KAWAI TPS": "KAWAI TPS"
    }
    assert reconciler.match_plant("CHANDRAPUR (MAHARASHTRA) STPS") == "CHANDRAPUR STPS"
    assert reconciler.match_plant("KAWAI TPS") == "KAWAI TPS"
