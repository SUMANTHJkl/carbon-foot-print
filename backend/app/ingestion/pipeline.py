import os
import re
import json
import logging
import pandas as pd
import numpy as np
from pathlib import Path
from sqlalchemy.orm import Session

from backend.app.core.config import RAW_DATA_DIR, PROCESSED_DATA_DIR
from backend.app.core.db import engine, SessionLocal, Base
from backend.app.models.plants import Plant, AnnualAggregate, CoalStatement
from backend.app.ingestion.reconciliation import PlantReconciler, normalize_plant_name
from backend.app.analytics.engine import (
    calculate_weighted_emission_intensity,
    convert_intensity_t_mwh_to_g_kwh,
    calculate_plant_load_factor,
    calculate_stock_autonomy_days,
    get_hours_in_fiscal_year
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("IngestionPipeline")

def slugify(text: str) -> str:
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', str(text).strip().lower()).strip('-')
    return slug

def run_ingestion_pipeline(sample_daily: bool = False):
    """
    Executes end-to-end ingestion:
    1. Reads raw CSVs
    2. Reconciles plant nomenclature
    3. Normalizes units, coordinates, and scopes
    4. Populates SQLite database
    5. Generates fast analytical Parquet files
    """
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    inventory_path = RAW_DATA_DIR / "CHETNA_Power_Plants_inventory.csv"
    coal_path = RAW_DATA_DIR / "Coal_Table_1.i_1.csv"
    daily_path = RAW_DATA_DIR / "CHETNA_Power_Plants_daily.csv"

    if not inventory_path.exists():
        raise FileNotFoundError(f"Missing inventory file at {inventory_path}")
    if not coal_path.exists():
        raise FileNotFoundError(f"Missing coal statement file at {coal_path}")
    if not daily_path.exists():
        raise FileNotFoundError(f"Missing daily observations file at {daily_path}")

    logger.info("Step 1: Reading CHETNA Power Plants Inventory...")
    inv_df = pd.read_csv(inventory_path, low_memory=False)

    # Initialize reconciler
    reconciler = PlantReconciler()
    reconciler.load_aliases_from_inventory(inv_df)

    # Scope filtering: Coal and Lignite stations
    coal_inv = inv_df[inv_df['fuel1'].isin(['COAL', 'LIGN'])].copy()
    logger.info(f"Filtered {len(coal_inv)} coal/lignite unit-year inventory rows across 532 plants.")

    # Count generating units per plant (where unit > 0)
    unit_counts = (
        coal_inv[coal_inv['unit'] > 0]
        .groupby('plant_name')['unit']
        .nunique()
        .to_dict()
    )

    # Extract Unique Plants from station-level rows (unit == 0)
    station_inv = coal_inv[coal_inv['unit'] == 0].copy()
    latest_plant_info = station_inv.sort_values('fiscal_year').groupby('plant_name').last().reset_index()

    logger.info(f"Step 2: Inserting {len(latest_plant_info)} unique power plants into SQLite...")
    db.query(AnnualAggregate).delete()
    db.query(CoalStatement).delete()
    db.query(Plant).delete()
    db.commit()

    plant_records = []
    plants_to_db = []

    for _, row in latest_plant_info.iterrows():
        p_name = str(row['plant_name']).strip()
        p_id = slugify(p_name)
        state = str(row.get('state_id', 'Unknown')).strip().upper()
        zone = str(row.get('zone_name', 'Unknown')).strip()
        fuel_code = str(row.get('fuel1', 'COAL')).strip().upper()
        cap_mw = float(row.get('installed_capacity_mw', 0.0) or 0.0)
        monitored_mw = float(row.get('monitored_capacity_mw', 0.0) or cap_mw)
        lat = float(row.get('latitude', 0.0)) if pd.notnull(row.get('latitude')) else None
        lon = float(row.get('longitude', 0.0)) if pd.notnull(row.get('longitude')) else None
        tech = str(row.get('technology', 'Subcritical')) if pd.notnull(row.get('technology')) else 'Subcritical'
        start_yr = int(row['start_year']) if pd.notnull(row.get('start_year')) and row['start_year'] > 1900 else None
        retired_yr = int(row['retired_year']) if pd.notnull(row.get('retired_year')) and row['retired_year'] > 1900 else None
        u_count = unit_counts.get(p_name, 1)
        aliases_str = str(row.get('possible_names', '[]'))

        plant_obj = Plant(
            plant_id=p_id,
            plant_name=p_name,
            state=state,
            zone_name=zone,
            latitude=lat,
            longitude=lon,
            fuel_type=fuel_code,
            technology=tech,
            installed_capacity_mw=cap_mw,
            monitored_capacity_mw=monitored_mw,
            start_year=start_yr,
            retired_year=retired_yr,
            unit_count=max(u_count, 1),
            aliases=aliases_str
        )
        plants_to_db.append(plant_obj)
        plant_records.append({
            "plant_id": p_id,
            "plant_name": p_name,
            "state": state,
            "zone_name": zone,
            "latitude": lat,
            "longitude": lon,
            "fuel_type": fuel_code,
            "technology": tech,
            "installed_capacity_mw": cap_mw,
            "monitored_capacity_mw": monitored_mw,
            "start_year": start_yr,
            "retired_year": retired_yr,
            "unit_count": max(u_count, 1)
        })

    db.add_all(plants_to_db)
    db.commit()
    logger.info(f"Saved {len(plants_to_db)} plants to database.")

    # Step 3: Insert Annual Aggregates
    logger.info("Step 3: Processing Annual Aggregates...")
    annual_to_db = []
    annual_records = []

    for _, row in station_inv.iterrows():
        p_name = str(row['plant_name']).strip()
        p_id = slugify(p_name)
        state = str(row.get('state_id', 'Unknown')).strip().upper()
        zone = str(row.get('zone_name', 'Unknown')).strip()
        fy = str(row.get('fiscal_year', '2023-24')).strip()
        fuel_code = str(row.get('fuel1', 'COAL')).strip().upper()
        cap_mw = float(row.get('installed_capacity_mw', 0.0) or 0.0)
        
        # net generation in MU (Million Units = GWh)
        net_gen_mu = float(row.get('net_generation_mu', 0.0) or 0.0) if pd.notnull(row.get('net_generation_mu')) else None
        net_gen_mwh = (net_gen_mu * 1000.0) if net_gen_mu is not None and net_gen_mu > 0 else None
        
        # total co2 ton
        co2_ton = float(row.get('total_co2ton', 0.0)) if pd.notnull(row.get('total_co2ton')) else None
        
        # intensity
        intensity_t_mwh = None
        if co2_ton is not None and net_gen_mwh is not None and net_gen_mwh > 0:
            intensity_t_mwh = calculate_weighted_emission_intensity(co2_ton, net_gen_mwh)
        elif pd.notnull(row.get('emission_factor_ton_mwh')):
            intensity_t_mwh = float(row['emission_factor_ton_mwh'])
            
        intensity_g_kwh = convert_intensity_t_mwh_to_g_kwh(intensity_t_mwh)

        # PLF
        hours = get_hours_in_fiscal_year(fy)
        plf = calculate_plant_load_factor(net_gen_mwh, cap_mw, hours)

        aux_pct = float(row.get('auxilary_cons_pct_cal', 0.0)) if pd.notnull(row.get('auxilary_cons_pct_cal')) else None
        is_pred = bool(row.get('is_emission_factor_predicted', 0) == 1)
        lower_95 = float(row.get('lower_95_prediction_emission_factor_ton_mwh', 0.0)) if pd.notnull(row.get('lower_95_prediction_emission_factor_ton_mwh')) else None
        upper_95 = float(row.get('upper_95_prediction_emission_factor_ton_mwh', 0.0)) if pd.notnull(row.get('upper_95_prediction_emission_factor_ton_mwh')) else None
        coal_cons_t = float(row.get('fuel_1_consumption_if_coal_only_national_coal', 0.0)) if pd.notnull(row.get('fuel_1_consumption_if_coal_only_national_coal')) else None
        gcv = float(row.get('gcvkcal_kg_fuel_1_if_coal_only_national_coal', 0.0)) if pd.notnull(row.get('gcvkcal_kg_fuel_1_if_coal_only_national_coal')) else None

        agg_obj = AnnualAggregate(
            plant_id=p_id,
            plant_name=p_name,
            state=state,
            zone_name=zone,
            fiscal_year=fy,
            fuel_type=fuel_code,
            installed_capacity_mw=cap_mw,
            net_generation_gwh=net_gen_mu,
            total_co2_tonnes=co2_ton,
            emission_intensity_t_mwh=intensity_t_mwh,
            emission_intensity_g_kwh=intensity_g_kwh,
            plant_load_factor_pct=plf,
            auxiliary_consumption_pct=aux_pct,
            is_predicted=is_pred,
            lower_95_intensity=lower_95,
            upper_95_intensity=upper_95,
            fuel_consumption_coal_ton=coal_cons_t,
            fuel_gcv_kcal_kg=gcv
        )
        annual_to_db.append(agg_obj)
        annual_records.append({
            "plant_id": p_id,
            "plant_name": p_name,
            "state": state,
            "zone_name": zone,
            "fiscal_year": fy,
            "fuel_type": fuel_code,
            "installed_capacity_mw": cap_mw,
            "net_generation_gwh": net_gen_mu,
            "total_co2_tonnes": co2_ton,
            "emission_intensity_t_mwh": intensity_t_mwh,
            "emission_intensity_g_kwh": intensity_g_kwh,
            "plant_load_factor_pct": plf,
            "auxiliary_consumption_pct": aux_pct,
            "is_predicted": is_pred,
            "lower_95_intensity": lower_95,
            "upper_95_intensity": upper_95,
            "fuel_consumption_coal_ton": coal_cons_t,
            "fuel_gcv_kcal_kg": gcv
        })

    db.add_all(annual_to_db)
    db.commit()
    logger.info(f"Saved {len(annual_to_db)} annual aggregate records to database.")

    # Step 4: Process Coal Statement
    logger.info("Step 4: Processing Coal Statement...")
    coal_df = pd.read_csv(coal_path)
    # Filter out subtotal / total summary rows
    plant_coal_df = coal_df[
        (~coal_df['Sl. No.'].astype(str).str.contains('Total', case=False, na=False)) &
        (coal_df['Region'].str.strip() != 'All India')
    ].copy()

    coal_to_db = []
    coal_records = []

    for _, row in plant_coal_df.iterrows():
        raw_name = str(row['Name of TPS']).strip()
        matched_canonical = reconciler.match_plant(raw_name)
        canonical_id = slugify(matched_canonical) if matched_canonical else slugify(raw_name)
        region = str(row['Region']).strip()
        cap_mw = float(row.get('Installed Capacity (MW)', 0.0) or 0.0)
        r_cil = float(row.get('Receipt - CIL', 0.0) or 0.0)
        r_sccl = float(row.get('Receipt - SCCL', 0.0) or 0.0)
        r_cap = float(row.get('Receipt - Captive', 0.0) or 0.0)
        r_eauc = float(row.get('Receipt - E-Auction', 0.0) or 0.0)
        r_imp = float(row.get('Receipt - Import', 0.0) or 0.0)
        r_oth = float(row.get('Receipt - Others', 0.0) or 0.0)
        r_tot = float(row.get('Receipt - Total', 0.0) or 0.0)
        cons = float(row.get('Total Consumption', 0.0) or 0.0)
        stocks = float(row.get('Closing Stocks', 0.0) or 0.0)
        days_stock = calculate_stock_autonomy_days(stocks, cons, 30)

        coal_obj = CoalStatement(
            plant_name=matched_canonical or raw_name,
            canonical_plant_id=canonical_id,
            region=region,
            installed_capacity_mw=cap_mw,
            receipt_cil=r_cil,
            receipt_sccl=r_sccl,
            receipt_captive=r_cap,
            receipt_e_auction=r_eauc,
            receipt_import=r_imp,
            receipt_others=r_oth,
            receipt_total=r_tot,
            total_consumption=cons,
            closing_stocks=stocks,
            days_of_stock=days_stock,
            reporting_period="CEA Monthly Statement"
        )
        coal_to_db.append(coal_obj)
        coal_records.append({
            "plant_name": matched_canonical or raw_name,
            "canonical_plant_id": canonical_id,
            "region": region,
            "installed_capacity_mw": cap_mw,
            "receipt_cil": r_cil,
            "receipt_sccl": r_sccl,
            "receipt_captive": r_cap,
            "receipt_e_auction": r_eauc,
            "receipt_import": r_imp,
            "receipt_others": r_oth,
            "receipt_total": r_tot,
            "total_consumption": cons,
            "closing_stocks": stocks,
            "days_of_stock": days_stock,
            "reporting_period": "CEA Monthly Statement"
        })

    db.add_all(coal_to_db)
    db.commit()
    logger.info(f"Saved {len(coal_to_db)} coal statement records to database.")

    # Save to high-performance Parquet analytical cache
    pd.DataFrame(plant_records).to_parquet(PROCESSED_DATA_DIR / "plants.parquet", index=False)
    pd.DataFrame(annual_records).to_parquet(PROCESSED_DATA_DIR / "annual_aggregates.parquet", index=False)
    pd.DataFrame(coal_records).to_parquet(PROCESSED_DATA_DIR / "coal_statements.parquet", index=False)

    # Step 5: Process Daily Station-Level Data (filtering unit == 0 for coal/lignite)
    logger.info("Step 5: Processing daily station-level data in chunks...")
    daily_parquet_path = PROCESSED_DATA_DIR / "daily_station.parquet"
    
    # Set of valid coal/lignite plant names
    valid_plants = set(station_inv['plant_name'].str.strip().unique())
    daily_chunks = []
    
    chunk_iter = pd.read_csv(
        daily_path,
        chunksize=250000,
        low_memory=False,
        usecols=[
            'state', 'date', 'plant_name', 'unit', 'type', 'fiscal_year',
            'actual_GWh', 'net_generation', 'outage_flag', 'emissions_tons',
            'emissions_tons_lower_95', 'emissions_tons_upper_95',
            'capacity_factor', 'flag'
        ]
    )

    total_daily_rows = 0
    for i, chunk in enumerate(chunk_iter):
        # Critical rule: unit == 0 (station total) and matches coal/lignite plants
        filtered = chunk[(chunk['unit'] == 0) & (chunk['plant_name'].isin(valid_plants))].copy()
        if len(filtered) > 0:
            filtered['plant_id'] = filtered['plant_name'].apply(slugify)
            daily_chunks.append(filtered)
            total_daily_rows += len(filtered)
        if sample_daily and i >= 2:
            break

    logger.info(f"Filtered daily observations to {total_daily_rows:,} station-level rows.")
    if daily_chunks:
        daily_df = pd.concat(daily_chunks, ignore_index=True)
        daily_df['date'] = pd.to_datetime(daily_df['date'])
        daily_df.sort_values(by=['plant_name', 'date'], inplace=True)
        daily_df.to_parquet(daily_parquet_path, index=False)
        logger.info(f"Saved optimized daily dataset to {daily_parquet_path} ({os.path.getsize(daily_parquet_path)/(1024*1024):.2f} MB).")

    db.close()
    logger.info("Data Ingestion Pipeline completed successfully!")

if __name__ == "__main__":
    run_ingestion_pipeline()
