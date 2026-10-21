# CoalCarbon India

> **Carbon Footprint Intelligence for India's Coal Thermal Power Stations**  
> *Measure. Compare. Decarbonize.*

---

## 1. Overview & Research Problem Statement

**CoalCarbon India** is an enterprise-grade full-stack climate analytics and intelligence platform built to address the research problem:

> **"Carbon Footprint Analysis of Electricity Generation Sources"**

The operational scope is exclusively focused on **Indian coal-fired thermal power stations**. Coal accounts for over 70% of India's grid electricity generation and ~45% of national greenhouse gas emissions. Lignite-fired stations are strictly classified into a segregated fuel category and excluded from default calculations unless explicitly enabled by the user.

---

## 2. Key Architecture & Technology Stack

- **Frontend:**
  - React 18.3 & TypeScript
  - Vite 5.4
  - Tailwind CSS 3.4 (locked to v3.4 for maximum stability)
  - Recharts (Time-series, Area, Bar, and Wedge Pie charts)
  - Leaflet & OpenStreetMap (Interactive plant map with verified coordinates)
  - Lucide React icons
  - Framer Motion
- **Backend:**
  - Python 3.11+ / 3.14
  - FastAPI with Pydantic validation & OpenAPI documentation
  - Pandas, NumPy, Scikit-learn, SciPy
  - SQLAlchemy ORM with SQLite relational storage
  - PyArrow Parquet analytical cache (sub-50ms queries over 3.25M records)
  - ReportLab (dynamic academic PDF research report generation)
- **Testing:**
  - Pytest test suite covering carbon accounting engine, unit conversions, and REST API integration (22 tests passing).

---

## 3. Empirical Datasets & Ingestion Audit

| Raw Dataset File | Records / Size | Reporting Grain | Description |
| :--- | :--- | :--- | :--- |
| `data/raw/CHETNA_Power_Plants_inventory.csv` | 10,704 rows (2.94 MB) | Plant-Unit-Fiscal Year | 532 unique stations across all fuels; 214 pure coal stations with verified coordinates. |
| `data/raw/CHETNA_Power_Plants_daily.csv` | 3,256,455 rows (285.95 MB) | Daily Generation & CO₂ | 7.5 years of daily observations (2018–2025). Filtered to 555,955 station-level records (`unit == 0`). |
| `data/raw/Coal_Table_1.i_1.csv` | 188 rows (13.32 KB) | Station Snapshot (kt) | CEA monthly thermal power coal stock & consumption statement across 182 individual stations. |

### Critical Ingestion Findings & Safeguards
1. **Station Aggregate vs Unit Level Double-Counting Guard:** In CHETNA, `unit == 0` represents the station total, while `unit > 0` represents individual generating units. The pipeline strictly filters on `unit == 0`, eliminating an otherwise catastrophic 200% double-counting artifact.
2. **Plant Name Reconciliation:** Synthesized alias resolution evaluated against `possible_names` JSON arrays matched **97.8%** of stations automatically, and 100.0% with a reviewed override dictionary.
3. **100% Verified Coordinates:** All 214 coal stations in the inventory possess verified survey coordinates; zero coordinates are synthetically generated.
4. **CEA Baseline Benchmark Concordance:** Monitored fleet weighted carbon intensity is **0.940 tCO₂/MWh**, achieving <0.5% variance with the official **Central Electricity Authority (CEA) CO₂ Baseline Database v19/v20 reference of 0.945 tCO₂/MWh**.

---

## 4. Main Working Pages & Capabilities

1. **Overview Dashboard:** 10 executive KPI metric cards with formula provenance tooltips, multi-year national emissions trend, top 10 emitting states ranking, and top 10 emitting stations table.
2. **National Emissions:** Generation vs emissions evolution, specific intensity trajectory, and financial-year comparison.
3. **Plant Explorer:** Searchable, sortable table across all 214 monitored stations with capacity, generation, emissions, intensity, PLF, pagination, and CSV export.
4. **Plant Detail View:** Complete station dossier with metadata, historical generation & emissions area charts, intensity trend, CEA coal statement snapshot, and peer group benchmarks.
5. **Interactive India Map:** Full-screen Leaflet map displaying verified station coordinates with emissions-based and intensity-based dynamic color coding and rich popups.
6. **State-Wise Analysis:** Complete state rankings, national share percentages, and critical methodology notes distinguishing emissions volume from carbon intensity.
7. **Carbon Intensity Deep Dive:** Frequency distribution histogram, technology benchmarks (Subcritical vs Supercritical vs Ultra-supercritical), and CEA grid comparison.
8. **Time-Series Analysis:** 60, 180, and 365-day high-resolution daily operational tracking.
9. **Decarbonization Roadmap & Emissions Control Engine:**
   - 6 Technological Abatement Levers (Biomass Co-firing 5%-10%, Supercritical Upgrades, FGD, Advanced ESP, CCUS, and Phased Retirement)
   - 100% Wedge Abatement Pie Chart
   - Multi-Decade National Trajectory Graph (1995 to 2070 Net Zero)
   - Chronological Policy Stages (1990 to 2070)
10. **Coal Statement & Fuel Supply:** Supplier breakdown (CIL, SCCL, Captive, E-Auction, Imports), consumption vs physical stocks, and stock autonomy days.
11. **Statistical Analysis:** Pearson and Spearman correlation matrices, Lorenz concentration curve, and IQR outlier detection.
12. **AI Forecasting & ML:** L2-regularized Ridge regression predicting emissions from generation ($R^2 > 0.90$), 3-year baseline trend projections with 95% confidence intervals, and daily station anomaly detection.
13. **Carbon Reduction Simulator:** Interactive scenario modeling with sliders for thermal intensity improvement % and coal generation replacement %, explicit clean source lifecycle factors, and baseline vs scenario comparison.
14. **Data Explorer & Audit:** Raw dataset inventory, schema documentation, and supplementary CSV/Excel import workflow.
15. **Research Reports & Export:** One-click dynamic PDF research report generation using ReportLab and CSV exports.
16. **Methodology & Sources:** Mathematical formulations, input variables, units, and official institutional references.

---

## 5. Quickstart & Installation Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Step 1: Install Backend Dependencies
```bash
python -m pip install -r requirements.txt
```

### Step 2: Run Data Ingestion & Cache Generation
```bash
# Sets PYTHONPATH and runs the automated pipeline to populate SQLite and generate Parquet caches
$env:PYTHONPATH="."  # On Windows PowerShell
python -m backend.app.ingestion.pipeline
```

### Step 3: Run Backend Tests
```bash
$env:PYTHONPATH="."
python -m pytest backend/tests/
```
*(All 22 unit and API integration tests will run and pass).*

### Step 4: Install Frontend Dependencies & Build
```bash
cd frontend
npm install
npm run build
cd ..
```

### Step 5: Launch the Application

**Option A: Unified Server (FastAPI serves both API and React frontend)**
```bash
$env:PYTHONPATH="."
python -m backend.app.main
```
Open **`http://localhost:8000`** in your browser.

**Option B: Full-Stack Dev Mode (FastAPI + Vite Hot Reload)**
- Backend terminal:
  ```bash
  $env:PYTHONPATH="."
  python -m uvicorn backend.app.main:app --port 8000 --reload
  ```
- Frontend terminal:
  ```bash
  cd frontend
  npm run dev
  ```
Open **`http://localhost:5173`** in your browser.

---

## 6. Local URLs & API Documentation

- **Web Application:** `http://localhost:8000/` (or `http://localhost:5173/` in dev mode)
- **Interactive Swagger API Documentation:** `http://localhost:8000/api/docs`
- **ReDoc API Documentation:** `http://localhost:8000/api/redoc`
- **Health Check Endpoint:** `http://localhost:8000/api/health`
- **PDF Report Download Endpoint:** `http://localhost:8000/api/reports/pdf?fiscal_year=2023-24`

---

## 7. License & Academic Attribution

This platform is developed for academic climate research and public emissions transparency based on official Central Electricity Authority (CEA) and CHETNA open scientific data.
