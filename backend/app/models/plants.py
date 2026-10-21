from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.core.db import Base

class Plant(Base):
    __tablename__ = "plants"

    plant_id = Column(String(100), primary_key=True, index=True)
    plant_name = Column(String(200), unique=True, nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    zone_name = Column(String(50), nullable=False, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    fuel_type = Column(String(50), nullable=False, index=True)  # COAL or LIGN
    technology = Column(String(100), nullable=True)
    installed_capacity_mw = Column(Float, nullable=False)
    monitored_capacity_mw = Column(Float, nullable=True)
    start_year = Column(Integer, nullable=True)
    retired_year = Column(Integer, nullable=True)
    unit_count = Column(Integer, default=1)
    aliases = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    annual_metrics = relationship("AnnualAggregate", back_populates="plant", cascade="all, delete-orphan")

class AnnualAggregate(Base):
    __tablename__ = "annual_aggregates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plant_id = Column(String(100), ForeignKey("plants.plant_id"), nullable=False, index=True)
    plant_name = Column(String(200), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    zone_name = Column(String(50), nullable=False)
    fiscal_year = Column(String(20), nullable=False, index=True)
    fuel_type = Column(String(50), nullable=False, index=True)
    installed_capacity_mw = Column(Float, nullable=False)
    net_generation_gwh = Column(Float, nullable=True)
    total_co2_tonnes = Column(Float, nullable=True)
    emission_intensity_t_mwh = Column(Float, nullable=True)
    emission_intensity_g_kwh = Column(Float, nullable=True)
    plant_load_factor_pct = Column(Float, nullable=True)
    auxiliary_consumption_pct = Column(Float, nullable=True)
    is_predicted = Column(Boolean, default=False)
    lower_95_intensity = Column(Float, nullable=True)
    upper_95_intensity = Column(Float, nullable=True)
    fuel_consumption_coal_ton = Column(Float, nullable=True)
    fuel_gcv_kcal_kg = Column(Float, nullable=True)

    plant = relationship("Plant", back_populates="annual_metrics")

class CoalStatement(Base):
    __tablename__ = "coal_statements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plant_name = Column(String(200), nullable=False, index=True)
    canonical_plant_id = Column(String(100), nullable=True, index=True)
    region = Column(String(50), nullable=False, index=True)
    installed_capacity_mw = Column(Float, nullable=False)
    receipt_cil = Column(Float, default=0.0)
    receipt_sccl = Column(Float, default=0.0)
    receipt_captive = Column(Float, default=0.0)
    receipt_e_auction = Column(Float, default=0.0)
    receipt_import = Column(Float, default=0.0)
    receipt_others = Column(Float, default=0.0)
    receipt_total = Column(Float, default=0.0)
    total_consumption = Column(Float, default=0.0)
    closing_stocks = Column(Float, default=0.0)
    days_of_stock = Column(Float, nullable=True)
    reporting_period = Column(String(100), default="CEA Monthly Statement")

class DecarbonizationScenario(Base):
    __tablename__ = "decarbonization_scenarios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    scope_type = Column(String(50), nullable=False)  # national, state, plant
    target_id = Column(String(100), nullable=True)
    baseline_year = Column(String(20), nullable=False)
    intensity_reduction_pct = Column(Float, default=0.0)
    generation_reduction_pct = Column(Float, default=0.0)
    replacement_source = Column(String(100), nullable=True)
    replacement_emission_factor = Column(Float, default=0.0)
    baseline_emissions_mt = Column(Float, nullable=False)
    scenario_emissions_mt = Column(Float, nullable=False)
    avoided_emissions_mt = Column(Float, nullable=False)
    reduction_percentage = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
