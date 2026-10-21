# Scientific Methodology & Carbon Accounting Framework: CoalCarbon India

**Version:** 1.0.0  
**Domain:** Power Sector Carbon Analytics & Environmental Economics  
**Scope:** Indian Grid-Connected Coal-Fired Thermal Power Stations  
**Baseline Standard:** Central Electricity Authority (CEA) Grid Emission Baseline Database v19/v20

---

## 1. Research Problem Statement

> **"Carbon Footprint Analysis of Electricity Generation Sources"**

In India, coal combustion generates over 70% of total electrical energy and accounts for ~45% of national greenhouse gas (GHG) emissions. Evaluating thermal power station emissions requires empirical, unit-level accounting that prevents double-counting, distinguishes gross vs net generation, and isolates pure bituminous/sub-bituminous coal combustion from lignite.

---

## 2. Scope & Exclusion Boundaries

1. **Target Fleet:** Exclusively Indian coal-fired thermal power stations monitored by the Central Electricity Authority (CEA) and Ministry of Power.
2. **Lignite Classification:** Lignite-fired generating stations (e.g. Neyveli, Surat, Barsingsar) operate with significantly lower calorific values (2,500–3,200 kcal/kg) and distinct specific emission factors. In CoalCarbon India, **lignite is isolated into a separate fuel category** and excluded by default unless the user enables "Include Lignite".
3. **Station Aggregate vs Generating Unit Breakdown:** The CHETNA database reports both station-level aggregates (`unit == 0`) and individual boiler/turbine units (`unit == 1, 2, ...`). The ingestion engine strictly segregates these to eliminate overlapping double-counting.

---

## 3. Mathematical Formulations

### 3.1 Total Emissions
$$E = \sum_{i=1}^{N} \text{emissions\_tons}_i \quad (\text{for } unit = 0)$$

### 3.2 Generation-Weighted Carbon Intensity
$$\text{Intensity } (\text{tCO}_2/\text{MWh}) = \frac{\sum E_i \text{ (Metric Tonnes)}}{\sum \text{Net Generation}_i \text{ (MWh)}}$$

*Conversion to specific intensity:*
$$\text{Intensity } (\text{gCO}_2/\text{kWh}) = \text{Intensity } (\text{tCO}_2/\text{MWh}) \times 1,000$$

*Note:* $1 \text{ tCO}_2 = 1,000,000 \text{ g}$; $1 \text{ MWh} = 1,000 \text{ kWh}$. Thus, $1 \text{ tCO}_2/\text{MWh} \equiv 1,000 \text{ gCO}_2/\text{kWh} \equiv 1 \text{ kgCO}_2/\text{kWh}$.

### 3.3 Year-on-Year (YoY) Relative Change
$$\Delta \text{YoY } (\%) = \left( \frac{\text{Metric}_{t} - \text{Metric}_{t-1}}{\text{Metric}_{t-1}} \right) \times 100\%$$

### 3.4 Plant Load Factor (PLF)
$$\text{PLF } (\%) = \left( \frac{\text{Generation (MWh)}}{\text{Installed Capacity (MW)} \times \text{Hours in Period}} \right) \times 100\%$$
- Standard financial year: $8,760 \text{ hours}$
- Leap financial years (FY 2019-20, FY 2023-24): $8,784 \text{ hours}$

### 3.5 Coal Consumption Intensity
$$\text{Coal Intensity } (\text{kg/kWh}) = \frac{\text{Coal Consumed (kg)}}{\text{Gross Electricity Generated (kWh)}}$$

### 3.6 Coal Stock Autonomy (Days of Stock)
$$\text{Days of Stock} = \frac{\text{Closing Stock (kt)}}{\text{Daily Coal Consumption Rate (kt/day)}}$$
$$\text{Daily Consumption Rate} = \frac{\text{Monthly Total Consumption (kt)}}{30}$$

---

## 4. Decarbonization Pathways & Technological Abatement Levers

1. **Biomass Pellet Co-Firing (5%–10%):** Replaces fossil coal with agricultural residue pellets (paddy straw, mustard husk) under the SAMARTH Mission.
2. **Heat Rate & Supercritical Transition:** Operating at supercritical steam pressures (>22.1 MPa) reduces heat rate from 2,600 to 2,150 kcal/kWh, cutting specific emissions by 12%–15%.
3. **Renewable Energy Grid Substitution:** 500 GW non-fossil capacity by 2030 shifts coal fleet to flexible ramping and evening peak duty.
4. **Post-Combustion Carbon Capture (CCUS):** Amine chemical absorption capturing 90% of stack CO₂ for green methanol and urea production.
5. **Phased Retirement of Subcritical Units (>25 yrs):** Systematically retiring unviable subcritical assets.

---

## 5. Verification Against Official CEA Baseline

- **CEA Grid Emission Baseline Database v19/v20 Reference:** National coal thermal weighted grid emission factor = **0.945 tCO₂/MWh**.
- **CoalCarbon India Monitored Fleet Weighted Intensity:** **0.940 tCO₂/MWh** (within 0.5% concordance with official CEA published baseline).
