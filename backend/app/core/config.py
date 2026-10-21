import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
SAMPLES_DATA_DIR = DATA_DIR / "samples"
DOCS_DIR = BASE_DIR / "docs"

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR}/coalcarbon.db")
SECRET_KEY = os.getenv("SECRET_KEY", "coalcarbon-india-production-secret-key-2026")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Default Scopes
DEFAULT_FUEL = "COAL"
INCLUDE_LIGNITE_DEFAULT = False
DEFAULT_FISCAL_YEAR = "2023-24"

# Official CEA Grid Emission Baseline Reference (CO2 Baseline Database v19/v20)
CEA_BASELINE_INTENSITY_WEIGHTED = 0.945  # tCO2/MWh for All-India Coal Thermal
CEA_ALL_INDIA_PLF_AVG = 64.2  # % national average PLF
