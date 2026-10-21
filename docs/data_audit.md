# Data Audit Report: CoalCarbon India

**Date of Audit:** October 2026  
**Analyst Role:** Lead Climate Data Scientist & Systems Architect  
**Project:** CoalCarbon India — Carbon Footprint Intelligence for India's Coal Thermal Power Stations  
**Scope:** Exclusively Indian Coal-Fired Thermal Power Stations (with separate, toggleable Lignite classification)

---

## 1. Executive Summary

This audit establishes the empirical ground truth for all datasets supplied to the CoalCarbon India platform. Before writing application logic or calculations, each dataset was rigorously examined down to raw bytes, row schemas, column distributions, edge cases, and cross-dataset join feasibility.

### Key Datasets Inspected
1. `data/raw/CHETNA_Power_Plants_inventory.csv` (2.94 MB, 10,704 rows, 40 columns)
2. `data/raw/CHETNA_Power_Plants_daily.csv` (285.95 MB, 3,256,455 rows, 16 columns)
3. `data/raw/Coal_Table_1.i_1.csv` (13.32 KB, 188 rows, 13 columns)

---

## 2. Dataset 1: CHETNA Power Plants Inventory

### 2.1 Schema & Metadata
- **File:** `CHETNA_Power_Plants_inventory.csv`
- **File Size:** 3,081,692 bytes (2.94 MB)
- **Total Records:** 10,704 rows (plant-unit-fiscal-year grain)
- **Unique Plants:** 532 unique plant stations across all energy sources (214 pure Coal stations)
- **Temporal Range:** Fiscal Years 2018-19 to 2025-26 (8 fiscal years)
- **Columns (40):**
  - Identifiers: `zone_name`, `type`, `state_id`, `fiscal_year`, `plant_name`, `unit`, `possible_names`
  - Geographic: `latitude`, `longitude` (100% complete for coal stations)
  - Technical: `unit_status`, `start_year`, `retired_year`, `fuel_gem`, `technology`, `fuel1`, `fuel2`, `installed_capacity_mw`, `monitored_capacity_mw`
  - Performance: `net_generation_mu` (Million Units = GWh), `auxilary_cons_pct_cal`
  - Fuel Consumption: `fuel_1_consumption_if_coal_only_national_coal`, `fuel_1_consumption_only_for_imported_coal`, `fuel_2_consumption`, `gcvkcal_kg_fuel_1_if_coal_only_national_coal`, `gcvkcal_kg_fuel_1_only_for_imported_coal`, `gcvkcal_kg_fuel_2`
  - Carbon & Emissions: `co2ton_fuel_1`, `co2ton_fuel_2`, `co2_fuel2_pct`, `total_co2ton`, `emission_factor_ton_mwh`
  - ML & Uncertainty: `is_emission_factor_predicted`, `daily_agg_gross_GWh`, `lower_95_prediction_emission_factor_ton_mwh`, `upper_95_prediction_emission_factor_ton_mwh`, `emission_factor_ton_mwh_knn_q05`, `emission_factor_ton_mwh_knn_q25`, `emission_factor_ton_mwh_knn_q75`, `emission_factor_ton_mwh_knn_q95`, `emission_factor_ton_mwh_knn_mean`

### 2.2 Fuel & Technology Distribution
- `fuel1` breakdown:
  - `COAL`: 7,384 records (~69.0%)
  - `HYDRO`: 1,912 records (~17.9%)
  - `GAS`: 544 records (~5.1%)
  - `LIGN` (Lignite): 472 records (~4.4%)
  - `NUCLEAR`: 288 records (~2.7%)
  - `DISL`: 80 records (~0.7%)
  - `NAPT`: 24 records (~0.2%)
- **Critical Scope Rule:** CoalCarbon India isolates `fuel1 == 'COAL'` by default. Lignite (`LIGN`) is classified as a distinct fuel subtype and excluded from baseline calculations unless the user switches on the "Include Lignite" filter.

### 2.3 Station Aggregate (`unit == 0`) vs Unit Breakdowns (`unit > 0`)
- **Crucial Finding:** For every power station, `unit == 0` designates the **Station-Level Aggregate**.
- `unit == 1, 2, ...` designate individual boiler/turbine generation units.
- **Verification:** For Damodaram Sanjeevaiah TPS in FY 2018-19:
  - Unit 1 Generation = 3,039.68 MU; Unit 1 CO₂ = 3,516,539.43 tonnes
  - Unit 2 Generation = 3,429.86 MU; Unit 2 CO₂ = 3,706,733.11 tonnes
  - Unit 0 (Station) Generation = 6,469.54 MU (exact sum: 3,039.68 + 3,429.86)
  - Unit 0 (Station) CO₂ = 7,223,272.54 tonnes (exact sum: 3,516,539.43 + 3,706,733.11)
- **Engine Rule:** All station-level queries and aggregations must strictly filter on `unit == 0` or compute `SUM(units)` exclusively when `unit > 0`. Blending `unit == 0` with `unit > 0` causes an exact 200% double-counting artifact.

---

## 3. Dataset 2: CHETNA Daily Power Plant Observations

### 3.1 Schema & Metadata
- **File:** `CHETNA_Power_Plants_daily.csv`
- **File Size:** 299,835,329 bytes (285.95 MB)
- **Total Records:** 3,256,455 rows
- **Date Range:** April 1, 2018 to October 4, 2025 (2,744 consecutive days, 7.5 years)
- **Columns (16):**
  - `state` (string)
  - `date` (YYYY-MM-DD string)
  - `plant_name` (string)
  - `unit` (integer; 0 = plant total, >0 = unit)
  - `type` (string: THERMAL, HYDRO, etc.)
  - `fiscal_year` (string: e.g. '2018-19')
  - `actual_GWh` (float; gross generation in GWh)
  - `net_generation` (float; net generation in GWh)
  - `outage_flag` (integer binary: 0 or 1)
  - `emissions_tons` (float; daily CO₂ emissions in metric tonnes)
  - `emissions_tons_lower_95` (integer; 95% lower prediction limit)
  - `emissions_tons_upper_95` (integer; 95% upper prediction limit)
  - `emissions_tons_knn_q05` (float; 5th percentile KNN prediction)
  - `emissions_tons_knn_q95` (float; 95th percentile KNN prediction)
  - `capacity_factor` (float; plant load / capacity factor)
  - `flag` (string; reporting flag, e.g., 'S', 'SC', null)

### 3.2 Data Quality & Null Profile
- Missing dates or plant names: 0 (0.00%)
- Missing generation (`actual_GWh`, `net_generation`): 7,454 rows (0.23%)
- Missing emissions (`emissions_tons`): 349,837 rows (10.74%)
  - *Provenance:* In cases of zero generation or offline units, emissions are zero or suppressed.
  - Where actual measured fuel receipts were unavailable in primary CEA logs, CHETNA models provide KNN and 95% prediction intervals.
- `unit == 0` record count: 1,351,150 rows.

---

## 4. Dataset 3: Supplementary Coal Statement

### 4.1 Schema & Metadata
- **File:** `Coal_Table_1.i_1.csv`
- **File Size:** 13,641 bytes (13.32 KB)
- **Total Records:** 188 rows (182 individual thermal power stations + 6 subtotal/total rows)
- **Reporting Period:** Monthly snapshot statement (Thermal Power Station Coal Stock & Consumption Statement from Central Electricity Authority / Ministry of Power)
- **Columns (13):**
  - `Sl. No.` (string, numeric or "Total")
  - `Region` (Northern, Western, Southern, Eastern, North Eastern, All India)
  - `Name of TPS` (Thermal Power Station name)
  - `Installed Capacity (MW)`
  - `Receipt - CIL` (Coal India Limited receipts)
  - `Receipt - SCCL` (Singareni Collieries receipts)
  - `Receipt - Captive` (Captive coal mine receipts)
  - `Receipt - E-Auction` (Coal procured via auction)
  - `Receipt - Import` (Imported coal receipts)
  - `Receipt - Others` (Other domestic coal)
  - `Receipt - Total` (Sum of all receipts)
  - `Total Consumption` (Actual coal consumed in reporting period)
  - `Closing Stocks` (Coal remaining in inventory at period end)

### 4.2 Unit Validation & Accounting Logic
- **Measurement Units:** **Thousand Tonnes (kt)**.
  - National Total Consumption = 73,474.42 kt (= 73.47 Million Tonnes).
  - Total Monitored Capacity = 207,775.5 MW (= 207.78 GW).
  - Closing Stock All-India = 39,440.35 kt (= 39.44 Million Tonnes).
- **Subtotal Row Hazard:** Rows 39, 112, 147, 185, 187, and 188 contain aggregate rows (`Northern Total`, `Western Total`, `Southern Total`, `Eastern Total`, `North Eastern Total`, `Total All India`).
  - *Validation Rule:* Filter `WHERE "Sl. No." NOT LIKE '%Total%' AND "Region" != 'All India'` before aggregating.

---

## 5. Cross-Dataset Join & Plant Reconciliation

### 5.1 Name Matching Results
- Out of 182 individual coal power stations in `Coal_Table_1.i_1.csv`:
  - Direct exact string match with `CHETNA_Power_Plants_inventory.csv`: **156 plants (85.7%)**
  - Match using CHETNA `possible_names` alias dictionary: **178 plants (97.8%)**
  - Residual non-matching variants: **4 plants (2.2%)**, resolved via explicit mapping:
    - `"CHANDRAPUR (MAHARASHTRA) STPS"` $\rightarrow$ `"CHANDRAPUR STPS"`
    - `"NTPL TUTICORIN TPP"` $\rightarrow$ `"TUTICORIN TPP"`
    - `"TORANGALLU TPS (SBU-I)"` $\rightarrow$ `"TORANGALLU (JSW)"`
    - `"TORANGALLU TPS (SBU-II)"` $\rightarrow$ `"TORANGALLU (JSW)"`
- **Reconciliation Success Rate:** **100.0%** verified.

### 5.2 Coordinates & Geospatial Integrity
- Total pure coal stations: 214 stations.
- Verified latitude/longitude coordinates present in inventory: **214 (100.0%)**.
- Zero coordinates are synthetically generated or imputed.

---

## 6. Calculation Reliability Matrix

| Analytical Metric | Formula / Basis | Supported & Reliable? | Limitations / Scope |
| :--- | :--- | :--- | :--- |
| **Total Emissions** | $\sum \text{emissions\_tons}$ ($unit=0$) | Yes | High fidelity across 2018–2025. |
| **Net Generation** | $\sum \text{net\_generation}$ ($unit=0$) in MU/GWh | Yes | Reported in MU (Million Units = GWh). |
| **Generation-Weighted Carbon Intensity** | $\frac{\sum \text{CO}_2 \text{ (tonnes)}}{\sum \text{Net Generation (MWh)}}$ | Yes | Expressed in $\text{tCO}_2\text{/MWh}$ and $\text{gCO}_2\text{/kWh}$. |
| **Plant Load Factor (PLF)** | $\frac{\text{Gross GWh} \times 1000}{\text{Capacity (MW)} \times \text{Hours}} \times 100\%$ | Yes | Calculated at annual or monthly interval. |
| **Coal Consumption Intensity** | $\frac{\text{Coal Consumed (kg)}}{\text{Gross Electricity (kWh)}}$ | Yes (period-specific) | Available for stations overlapping with the coal statement reporting period. |
| **Coal Stock Autonomy (Days)** | $\frac{\text{Closing Stock}}{\text{Average Daily Consumption}}$ | Yes | Computed directly from coal inventory snapshot. |
| **Uncertainty Bounds** | KNN Quantiles (q05, q95) & 95% Pred Intervals | Yes | Pre-calculated by CHETNA ML framework. |

---

## 7. Audit Conclusion & Architectural Directives

1. **Immutable Raw Data:** `data/raw/` remains untouched.
2. **Processed Engine Layer:** Fast parquet representations in `data/processed/` for lightning-fast aggregation over the 3.25M daily rows, coupled with SQLite/PostgreSQL for relational queries.
3. **Strict Aggregation Guard:** All default queries apply `fuel1 == 'COAL'` and `unit == 0`.
4. **Transparent Provenance:** Display exact reporting periods, formula provenance, and dataset sources on every chart and card.
