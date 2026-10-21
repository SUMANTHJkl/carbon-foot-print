# Data Dictionary: CoalCarbon India

**Version:** 1.0.0  
**Scope:** Exclusively Indian Coal-Fired Thermal Power Stations (Lignite classified separately)

---

## 1. Dataset: CHETNA Power Plants Inventory (`CHETNA_Power_Plants_inventory.csv`)

| Field Name | Type | Unit | Description | Transformations / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `zone_name` | String | - | Grid/Power Region (Northern, Western, Southern, Eastern, North Eastern) | Canonicalized to standard regional names. |
| `type` | String | - | Broad station category: THERMAL, HYDRO, THER (GT), NUCLEAR, THER (DG) | Stripped of whitespace. |
| `state_id` | String | - | Indian State / UT name | Normalized uppercase state name. |
| `fiscal_year` | String | - | Indian Financial Year (e.g., '2018-19' to '2025-26', Apr 1 to Mar 31) | Canonical financial year format `YYYY-YY`. |
| `plant_name` | String | - | Station Name | Primary join key across inventory, daily, and coal datasets. |
| `unit` | Integer | - | Generation unit index | `0` = Station-level aggregate; `1..N` = individual generating unit. |
| `possible_names` | String (JSON list) | - | Historical aliases and alternate spellings | Evaluated to resolve cross-dataset plant name variations. |
| `latitude` | Float | Decimal Degrees (WGS84) | Verified station latitude | Verified against survey records; 100% complete for coal stations. |
| `longitude` | Float | Decimal Degrees (WGS84) | Verified station longitude | Verified against survey records; 100% complete for coal stations. |
| `unit_status` | String | - | Operating status: operating, retired, planned | Default filter: `operating`. |
| `start_year` | Integer | Year | Year of commissioning | Used for station age analysis. |
| `retired_year` | Float | Year | Year of decommissioning (if applicable) | Null for operating stations. |
| `fuel_gem` | String | - | Global Energy Monitor fuel taxonomy | e.g., 'coal', 'natural gas'. |
| `technology` | String | - | Boiler/Turbine technology | Subcritical, Supercritical, Ultra-supercritical, Circulating Fluidized Bed. |
| `fuel1` | String | - | Primary fuel code: COAL, LIGN, GAS, HYDRO, NUCLEAR, DISL, NAPT | Filtered to `COAL` by default. `LIGN` isolated under toggle. |
| `fuel2` | String | - | Secondary fuel code (e.g. secondary support fuel) | Usually fuel oil or empty. |
| `installed_capacity_mw` | Float | Megawatts (MW) | Total nameplate electrical capacity | Used for PLF calculations and capacity rankings. |
| `monitored_capacity_mw` | Float | Megawatts (MW) | Capacity monitored by CEA dispatch centers | CEA monitored rating. |
| `net_generation_mu` | Float | Million Units (MU) = GWh | Net electricity injected into grid | $1\text{ MU} = 1\text{ GWh} = 1,000\text{ MWh}$. |
| `fuel_1_consumption_if_coal_only_national_coal` | Float | Metric Tonnes (t) / Thousand Tonnes | Domestic coal consumed | Primary fuel burn volume. |
| `fuel_1_consumption_only_for_imported_coal` | Float | Metric Tonnes (t) | Imported coal consumed | Blended coal consumption volume. |
| `gcvkcal_kg_fuel_1_if_coal_only_national_coal` | Float | kcal/kg | Gross Calorific Value of domestic coal | Thermal quality indicator (Grade G1 to G17). |
| `co2ton_fuel_1` | Float | Metric Tonnes ($\text{tCO}_2$) | Annual CO₂ emissions from primary fuel | Computed using fuel chemistry and carbon mass balance. |
| `total_co2ton` | Float | Metric Tonnes ($\text{tCO}_2$) | Total annual CO₂ emissions | Primary emissions metric for annual aggregation. |
| `emission_factor_ton_mwh` | Float | $\text{tCO}_2\text{/MWh}$ | Specific carbon intensity | Tonnes of CO₂ per net MWh generated. Equal to $\text{kgCO}_2\text{/kWh}$. |
| `auxilary_cons_pct_cal` | Float | Percentage (%) | Auxiliary power consumption within station | Typically 6%–10% in subcritical coal plants. |
| `is_emission_factor_predicted` | Float | Binary (0/1) | Whether emission factor was estimated by ML | $0 = \text{Reported from fuel mass balance}$; $1 = \text{Predicted by ML}$. |
| `daily_agg_gross_GWh` | Float | GWh | Annual sum of gross generation from daily data | Consistency check against net generation. |
| `lower_95_prediction_emission_factor_ton_mwh` | Float | $\text{tCO}_2\text{/MWh}$ | Lower 95% confidence interval for intensity | Uncertainty quantification bound. |
| `upper_95_prediction_emission_factor_ton_mwh` | Float | $\text{tCO}_2\text{/MWh}$ | Upper 95% confidence interval for intensity | Uncertainty quantification bound. |

---

## 2. Dataset: CHETNA Daily Observations (`CHETNA_Power_Plants_daily.csv`)

| Field Name | Type | Unit | Description | Transformations / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `state` | String | - | Indian State / UT | Capitalized state identifier. |
| `date` | Date (YYYY-MM-DD) | Day | Observation date | Parsed as ISO 8601 date. |
| `plant_name` | String | - | Power Station Name | Join key to inventory. |
| `unit` | Integer | - | Unit identifier | `0` = Station Total; `>0` = Generating Unit. Default queries filter `unit == 0`. |
| `type` | String | - | Generation category | THERMAL, HYDRO, etc. |
| `fiscal_year` | String | - | Financial year (`2018-19` to `2025-26`) | Derived from observation date (April 1 to March 31). |
| `actual_GWh` | Float | GWh | Gross electricity generated on this date | $1\text{ GWh} = 1,000\text{ MWh}$. |
| `net_generation` | Float | GWh | Net electricity sent out on this date | Net generation after auxiliary consumption. |
| `outage_flag` | Integer | Binary (0/1) | Unit offline / outage indicator | $1 = \text{Offline / Outage}$; $0 = \text{Generating}$. |
| `emissions_tons` | Float | Metric Tonnes ($\text{tCO}_2$) | Daily CO₂ emissions | Daily carbon footprint. |
| `emissions_tons_lower_95` | Float | Metric Tonnes ($\text{tCO}_2$) | 95% Lower confidence bound | Uncertainty boundary. |
| `emissions_tons_upper_95` | Float | Metric Tonnes ($\text{tCO}_2$) | 95% Upper confidence bound | Uncertainty boundary. |
| `emissions_tons_knn_q05` | Float | Metric Tonnes ($\text{tCO}_2$) | 5th percentile KNN prediction | Robust outlier / non-parametric lower bound. |
| `emissions_tons_knn_q95` | Float | Metric Tonnes ($\text{tCO}_2$) | 95th percentile KNN prediction | Robust outlier / non-parametric upper bound. |
| `capacity_factor` | Float | Fraction (0.0 to 1.0) | Daily plant load factor | $\frac{\text{actual\_GWh} \times 1000}{\text{Capacity (MW)} \times 24}$. |
| `flag` | String | - | Data provenance flag | 'S' (Standard reported), 'SC' (Special case), null. |

---

## 3. Dataset: Coal Statement (`Coal_Table_1.i_1.csv`)

| Field Name | Type | Unit | Description | Transformations / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `Sl. No.` | String | - | Serial number or "Total" | Filter out rows containing "Total" for plant-level aggregations. |
| `Region` | String | - | Power Region (Northern, Western, Southern, Eastern, North Eastern, All India) | Exclude 'All India' row from regional groupings. |
| `Name of TPS` | String | - | Thermal Power Station Name | Reconciled with canonical `plant_name` using alias dictionary. |
| `Installed Capacity (MW)` | Float | Megawatts (MW) | Station installed capacity | Validated against CEA inventory. |
| `Receipt - CIL` | Float | Thousand Tonnes (kt) | Receipts from Coal India Limited | Domestic primary supplier. |
| `Receipt - SCCL` | Float | Thousand Tonnes (kt) | Receipts from Singareni Collieries | Southern regional domestic supplier. |
| `Receipt - Captive` | Float | Thousand Tonnes (kt) | Receipts from captive dedicated coal blocks | Directly owned mining supply. |
| `Receipt - E-Auction` | Float | Thousand Tonnes (kt) | Coal procured via spot e-auctions | Open-market supplementary procurement. |
| `Receipt - Import` | Float | Thousand Tonnes (kt) | Imported coal receipts | Seaborne coal (mostly Indonesia, Australia, South Africa). |
| `Receipt - Others` | Float | Thousand Tonnes (kt) | Other domestic sources / washery coal | Residual supply channels. |
| `Receipt - Total` | Float | Thousand Tonnes (kt) | Total receipts across all sources | Sum of all receipt categories. |
| `Total Consumption` | Float | Thousand Tonnes (kt) | Actual coal consumed in reporting month | Used for monthly coal consumption and stock burn rate. |
| `Closing Stocks` | Float | Thousand Tonnes (kt) | Physical coal inventory at month end | Used for fuel autonomy and days-of-stock metrics. |
