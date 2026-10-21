"""
Carbon Accounting Engine: CoalCarbon India
Strict, validated formulas for carbon footprints, intensities, PLF, and coal metrics.
"""

from typing import Optional, Dict, Any, List, Union
import math

def calculate_weighted_emission_intensity(
    total_emissions_tonnes: float,
    total_net_generation_mwh: float
) -> Optional[float]:
    """
    Intensity (tCO2/MWh) = Total CO2 (tonnes) / Total net generation (MWh).
    Returns None if generation <= 0 or invalid.
    """
    if total_net_generation_mwh is None or total_net_generation_mwh <= 0:
        return None
    if total_emissions_tonnes is None or total_emissions_tonnes < 0:
        return None
    return float(total_emissions_tonnes / total_net_generation_mwh)

def convert_intensity_t_mwh_to_g_kwh(intensity_t_mwh: Optional[float]) -> Optional[float]:
    """
    Intensity (gCO2/kWh) = Intensity (tCO2/MWh) * 1,000.
    1 tCO2 = 1,000,000 g; 1 MWh = 1,000 kWh -> 1 tCO2/MWh = 1,000 gCO2/kWh = 1 kgCO2/kWh.
    """
    if intensity_t_mwh is None or math.isnan(intensity_t_mwh) or intensity_t_mwh < 0:
        return None
    return float(intensity_t_mwh * 1000.0)

def calculate_year_on_year_change(
    current_val: Optional[float],
    previous_val: Optional[float]
) -> Optional[float]:
    """
    Change (%) = ((Current - Previous) / Previous) * 100
    Returns None if previous value is 0, None, or negative.
    """
    if current_val is None or previous_val is None:
        return None
    if previous_val <= 0:
        return None
    return float(((current_val - previous_val) / previous_val) * 100.0)

def calculate_plant_contribution(
    plant_val: Optional[float],
    total_val: Optional[float]
) -> Optional[float]:
    """
    Contribution (%) = (Plant emissions / Total emissions) * 100
    """
    if plant_val is None or total_val is None or total_val <= 0:
        return None
    if plant_val < 0:
        return 0.0
    return float((plant_val / total_val) * 100.0)

def calculate_plant_load_factor(
    gross_or_net_generation_mwh: Optional[float],
    installed_capacity_mw: Optional[float],
    hours_in_period: float = 8760.0
) -> Optional[float]:
    """
    PLF (%) = (Generation MWh / (Capacity MW * Hours in period)) * 100
    Standard non-leap financial year: 365 * 24 = 8760 hours.
    Leap financial year (e.g., 2019-20, 2023-24): 366 * 24 = 8784 hours.
    """
    if gross_or_net_generation_mwh is None or installed_capacity_mw is None:
        return None
    if installed_capacity_mw <= 0 or hours_in_period <= 0:
        return None
    if gross_or_net_generation_mwh < 0:
        return 0.0
    
    max_theoretical_mwh = installed_capacity_mw * hours_in_period
    plf = (gross_or_net_generation_mwh / max_theoretical_mwh) * 100.0
    # Cap at theoretical 100% or realistic ceiling if slight reporting skew
    return float(min(plf, 105.0))

def calculate_coal_consumption_intensity(
    coal_consumed_kg: Optional[float],
    electricity_generated_kwh: Optional[float]
) -> Optional[float]:
    """
    Coal intensity (kg/kWh) = Coal consumed in kg / Electricity generated in kWh.
    Typical Indian subcritical coal station: 0.60 to 0.75 kg/kWh.
    Supercritical station: 0.50 to 0.62 kg/kWh.
    """
    if coal_consumed_kg is None or electricity_generated_kwh is None:
        return None
    if electricity_generated_kwh <= 0 or coal_consumed_kg <= 0:
        return None
    return float(coal_consumed_kg / electricity_generated_kwh)

def calculate_stock_autonomy_days(
    closing_stock_kt: Optional[float],
    monthly_consumption_kt: Optional[float],
    days_in_month: int = 30
) -> Optional[float]:
    """
    Stock autonomy (Days of stock) = (Closing stock kt / Daily consumption kt/day)
    """
    if closing_stock_kt is None or monthly_consumption_kt is None:
        return None
    if monthly_consumption_kt <= 0 or closing_stock_kt < 0:
        return 0.0
    daily_consumption = monthly_consumption_kt / days_in_month
    return float(closing_stock_kt / daily_consumption)

def get_hours_in_fiscal_year(fiscal_year: str) -> float:
    """
    Returns total operating hours in an Indian fiscal year (Apr 1 to Mar 31).
    Leap years: 2019-20 (Feb 2020), 2023-24 (Feb 2024), 2027-28.
    """
    leap_fy = {"2019-20", "2023-24", "2027-28"}
    if fiscal_year in leap_fy:
        return 366.0 * 24.0  # 8784 hours
    return 365.0 * 24.0  # 8760 hours
