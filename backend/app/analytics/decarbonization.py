"""
Decarbonization Pathways and Emission Control Technologies: CoalCarbon India
Detailed models for emission control methods, multi-decade timelines, abatement pie charts, and policy milestones.
"""

from typing import Dict, Any, List

def get_emission_control_technologies() -> List[Dict[str, Any]]:
    return [
        {
            "id": "biomass_cofiring",
            "name": "Biomass Co-Firing (5% - 10%)",
            "category": "Immediate Operational Abatement",
            "abatement_potential_co2_pct": "5% - 10%",
            "primary_target": "Direct CO2 Emission Displacement & Agricultural Stubble Burning Prevention",
            "readiness_level": "Commercial / Mandatory (SAMARTH Mission)",
            "capex_requirement": "Low (₹0.05 - 0.15 Cr / MW for dedicated pellet milling)",
            "advantages": [
                "Direct replacement of fossil coal with carbon-neutral crop residues (paddy straw pellets)",
                "Drastically mitigates north-Indian winter agricultural stubble burning air pollution",
                "Requires minimal boiler retrofitting in existing pulverized coal boilers"
            ],
            "limitations_and_impacts": [
                "Biomass pellet supply chain bottlenecks and seasonal availability variations",
                "Potential boiler tube slagging and fouling if pellet alkali content is elevated"
            ],
            "regulatory_status": "Mandated by Ministry of Power (5% co-firing rising to 7%-10%)"
        },
        {
            "id": "supercritical_renovation",
            "name": "Supercritical & Ultra-Supercritical Transition",
            "category": "Thermal Efficiency Improvement",
            "abatement_potential_co2_pct": "10% - 15%",
            "primary_target": "Heat Rate Reduction & Specific Coal Consumption",
            "readiness_level": "Standard for New Build / Major Modernization",
            "capex_requirement": "Moderate to High (₹4.5 - 6.5 Cr / MW)",
            "advantages": [
                "Operates at steam pressures above thermodynamic critical point (22.1 MPa)",
                "Improves net thermal efficiency from ~32% (subcritical) to 40%–44% (supercritical)",
                "Lowers specific coal consumption from ~0.75 kg/kWh to ~0.55 kg/kWh"
            ],
            "limitations_and_impacts": [
                "Higher metallurgical requirements for high-temperature superheater tubes",
                "High upfront capital expenditure compared to basic maintenance"
            ],
            "regulatory_status": "Mandatory standard for all new coal thermal capacity in India"
        },
        {
            "id": "flue_gas_desulfurization",
            "name": "Flue Gas Desulfurization (FGD)",
            "category": "Air Quality & Criteria Pollutant Control",
            "abatement_potential_co2_pct": "Indirect (Increases aux consumption by 1%-1.5%)",
            "primary_target": "Sulfur Dioxide (SO2) Abatement (90% - 98% capture)",
            "readiness_level": "Commercial / Phased Compliance",
            "capex_requirement": "Moderate (₹0.40 - 0.70 Cr / MW)",
            "advantages": [
                "Near-total capture of hazardous SO2 emissions using limestone/wet scrubbing",
                "Generates synthetic byproduct gypsum utilized in domestic cement manufacturing",
                "Crucial for ambient health and prevention of secondary sulfate aerosols"
            ],
            "limitations_and_impacts": [
                "Increases station auxiliary power consumption by 1.0% to 1.5%, slightly increasing raw carbon intensity",
                "Significant limestone slurry consumption and wastewater handling requirements"
            ],
            "regulatory_status": "MoEFCC staggered implementation deadlines (2024–2026 by regional zone)"
        },
        {
            "id": "electrostatic_precipitators_esp",
            "name": "Advanced Electrostatic Precipitators (ESP) & Baghouses",
            "category": "Particulate Matter Abatement",
            "abatement_potential_co2_pct": "Zero direct CO2 (air quality focus)",
            "primary_target": "Particulate Matter (PM10 / PM2.5) >99.8% capture",
            "readiness_level": "Mature / Universal Standard",
            "capex_requirement": "Moderate (₹0.15 - 0.35 Cr / MW for revamping)",
            "advantages": [
                "Maintains particulate emissions below strict 30 mg/Nm³ ceiling",
                "Enables high-efficiency dry fly-ash collection for infrastructure and cement use",
                "High operational reliability and low maintenance pressure drop"
            ],
            "limitations_and_impacts": [
                "High electrical resistivity of high-ash Indian coal requires enlarged collection surface areas",
                "Periodic rapping electrode maintenance required"
            ],
            "regulatory_status": "Active CEA standard across all grid-connected thermal units"
        },
        {
            "id": "ccus_carbon_capture",
            "name": "Carbon Capture, Utilization & Storage (CCUS)",
            "category": "Deep Decarbonization Breakthrough",
            "abatement_potential_co2_pct": "85% - 95% of stack CO2",
            "primary_target": "Deep Industrial Flue-Gas Decarbonization",
            "readiness_level": "Pilot & Demonstration Scale (e.g. NTPC Vindhyachal 20 TPD pilot)",
            "capex_requirement": "Very High (₹8.0 - 14.0 Cr / MW)",
            "advantages": [
                "Only pathway enabling near-zero carbon baseload electricity from hydrocarbon fuel",
                "Captured CO2 converted into synthetic green methanol, urea, or permanent geological storage",
                "Preserves existing transmission and grid stability assets"
            ],
            "limitations_and_impacts": [
                "Heavy parasitic energy penalty (reduces net station electrical output by 20%–28%)",
                "High solvent regeneration cost and lack of dedicated cross-country CO2 pipeline infrastructure"
            ],
            "regulatory_status": "National CCUS Policy Roadmap under NITI Aayog"
        },
        {
            "id": "phased_retirement",
            "name": "Phased Decommissioning of Subcritical Units (>25 Years)",
            "category": "Fleet Rationalization & Clean Replacement",
            "abatement_potential_co2_pct": "100% of decommissioned capacity emissions",
            "primary_target": "Retiring High-Intensity Inefficient Thermal Assets",
            "readiness_level": "Active Policy Execution",
            "capex_requirement": "Net Negative (Avoids massive renovation & FGD capex)",
            "advantages": [
                "Eliminates oldest, least efficient generating units with intensities >1.20 tCO2/MWh",
                "Frees up land, grid interconnection, and cooling water for colocated solar/battery parks",
                "Directly reduces coal consumption demand without stranded asset risk"
            ],
            "limitations_and_impacts": [
                "Requires careful dispatch balancing to prevent local grid stability deficits",
                "Just-transition considerations for plant personnel and mining communities"
            ],
            "regulatory_status": "Over 10,000 MW of inefficient units retired under CEA guidelines"
        }
    ]

def get_decarbonization_timeline() -> List[Dict[str, Any]]:
    return [
        {
            "stage": 1,
            "period": "1990 – 2010",
            "title": "Fleet Expansion & Subcritical Baseload Era",
            "focus": "Electrification & Energy Security",
            "avg_emission_intensity_t_mwh": 1.15,
            "annual_emissions_mt": "180 – 650 Mt",
            "key_milestones": [
                "Massive expansion of state and central coal power stations to meet rapid economic growth",
                "Predominance of small subcritical units (210 MW and 500 MW classes)",
                "Basic particulate electrostatic precipitators (ESP) established as universal norm",
                "Low energy efficiency emphasis; primary driver was megawatt capacity addition"
            ]
        },
        {
            "stage": 2,
            "period": "2010 – 2020",
            "title": "Supercritical Transition & Efficiency Standards",
            "focus": "Heat Rate Improvement & PAT Scheme",
            "avg_emission_intensity_t_mwh": 1.02,
            "annual_emissions_mt": "650 – 950 Mt",
            "key_milestones": [
                "Introduction of Perform, Achieve and Trade (PAT) energy efficiency mechanism",
                "Policy mandate that all new commercial power projects must use Supercritical boilers (660 MW / 800 MW)",
                "MoEFCC gazetted landmark 2015 environmental standards capping SO2, NOx, and particulate matter",
                "Gradual retirement of obsolete 50 MW to 120 MW non-reheat units"
            ]
        },
        {
            "stage": 3,
            "period": "2020 – 2025",
            "title": "Pollution Control Mandates & Biomass Co-Firing",
            "focus": "Air Quality Norms & Environmental Retrofitting",
            "avg_emission_intensity_t_mwh": 0.94,
            "annual_emissions_mt": "950 – 1,120 Mt",
            "key_milestones": [
                "Nationwide rollout of SAMARTH Mission mandating 5% agricultural biomass pellet co-firing",
                "Flue Gas Desulfurization (FGD) installation progress across critical non-attainment air basins",
                "Stricter specific water consumption limit of 3.0 m³/MWh enforced for inland stations",
                "Rapid expansion of renewable generation beginning to moderate midday coal dispatch"
            ]
        },
        {
            "stage": 4,
            "period": "2025 – 2030",
            "title": "Flexibilization & Clean Substitution Scale-Up",
            "focus": "10% Co-Firing, Peak Load Shifting & Ultra-Supercritical",
            "avg_emission_intensity_t_mwh": 0.86,
            "annual_emissions_mt": "1,120 – 1,220 Mt (Approaching Peak)",
            "key_milestones": [
                "Scale-up of biomass co-firing to 7%–10% across major NTPC and state generating fleets",
                "Grid flexibilization retrofit enabling thermal plants to safely ramp down to 40% technical minimum",
                "Systematic decommissioning of subcritical plants exceeding 25-30 years of operating life",
                "Hybridization with Battery Energy Storage Systems (BESS) for evening peak support"
            ]
        },
        {
            "stage": 5,
            "period": "2030 – 2040",
            "title": "National Coal Emissions Peak & Commercial CCUS Pilots",
            "focus": "Peak Coal Trajectory & Baseload Transition",
            "avg_emission_intensity_t_mwh": 0.72,
            "annual_emissions_mt": "Peak ~1,250 Mt around 2032-2035, followed by decline",
            "key_milestones": [
                "National coal emissions peak between 2032 and 2035 as non-fossil capacity reaches 500+ GW",
                "Commissioning of multi-megawatt CCUS demonstration units converting flue gas to green chemicals",
                "Coal fleet shifts from baseload generation to flexible ramping and reliability reserves",
                "Zero new subcritical authorizations; unabated older coal stations systematically retired"
            ]
        },
        {
            "stage": 6,
            "period": "2040 – 2070",
            "title": "Deep Decarbonization to Net Zero 2070",
            "focus": "Complete Decarbonization & Strategic Reserve Role",
            "avg_emission_intensity_t_mwh": "< 0.25 (Fleet average with CCUS / Residual)",
            "annual_emissions_mt": "Rapid decline towards near-zero (< 100 Mt by 2060, Net Zero 2070)",
            "key_milestones": [
                "Retirement of remaining unabated coal thermal power stations",
                "Remaining strategic coal capacity fitted with >90% CCUS or co-fired with green ammonia/hydrogen",
                "Primary grid bulk electricity supplied by Solar, Wind, Pumped Storage, Nuclear, and Advanced Storage",
                "Achievement of India's Panchamrit commitment of Net Zero greenhouse gas emissions by 2070"
            ]
        }
    ]

def get_abatement_pie_analysis() -> List[Dict[str, Any]]:
    """
    Abatement wedge contributions to achieve long-term power sector decarbonization.
    """
    return [
        {
            "name": "Renewable Power Displacement (Solar & Wind)",
            "share_pct": 42.0,
            "abatement_potential_mt_yr": 504.0,
            "color": "#10b981",  # Emerald
            "description": "Direct displacement of thermal megawatt-hours by utility-scale solar PV and onshore wind farms."
        },
        {
            "name": "Retirement of Inefficient Subcritical Units (>25 yrs)",
            "share_pct": 18.5,
            "abatement_potential_mt_yr": 222.0,
            "color": "#3b82f6",  # Blue
            "description": "Decommissioning high-emission, subcritical units with heat rates above 2,600 kcal/kWh."
        },
        {
            "name": "Carbon Capture, Utilization & Storage (CCUS)",
            "share_pct": 16.5,
            "abatement_potential_mt_yr": 198.0,
            "color": "#8b5cf6",  # Purple
            "description": "Post-combustion capture on modern supercritical base assets for industrial utilization."
        },
        {
            "name": "Heat Rate & Supercritical Upgrades",
            "share_pct": 12.0,
            "abatement_potential_mt_yr": 144.0,
            "color": "#f59e0b",  # Amber
            "description": "Thermal thermodynamic efficiency gains from high-temperature metallurgical revamps and digital combustion control."
        },
        {
            "name": "Biomass Pellet Co-Firing (5% - 10%)",
            "share_pct": 8.0,
            "abatement_potential_mt_yr": 96.0,
            "color": "#065f46",  # Deep forest green
            "description": "Direct co-firing of agricultural residue pellets (paddy straw, mustard husk) under SAMARTH Mission."
        },
        {
            "name": "Grid Flexibilization & Storage Pairing",
            "share_pct": 3.0,
            "abatement_potential_mt_yr": 36.0,
            "color": "#6366f1",  # Indigo
            "description": "Reducing partial-load heat-rate penalties through BESS and pumped storage hybridization."
        }
    ]

def get_multi_decade_timeline_graph() -> List[Dict[str, Any]]:
    """
    Empirical historical and modeled pathway data from 1995 to 2070.
    """
    return [
        {"year": 1995, "bau_emissions_mt": 210, "mitigated_emissions_mt": 210, "intensity_t_mwh": 1.18, "phase": "Historical"},
        {"year": 2000, "bau_emissions_mt": 315, "mitigated_emissions_mt": 315, "intensity_t_mwh": 1.14, "phase": "Historical"},
        {"year": 2005, "bau_emissions_mt": 440, "mitigated_emissions_mt": 440, "intensity_t_mwh": 1.10, "phase": "Historical"},
        {"year": 2010, "bau_emissions_mt": 620, "mitigated_emissions_mt": 620, "intensity_t_mwh": 1.05, "phase": "Historical"},
        {"year": 2015, "bau_emissions_mt": 845, "mitigated_emissions_mt": 845, "intensity_t_mwh": 0.99, "phase": "Historical"},
        {"year": 2020, "bau_emissions_mt": 960, "mitigated_emissions_mt": 945, "intensity_t_mwh": 0.96, "phase": "Historical"},
        {"year": 2024, "bau_emissions_mt": 1130, "mitigated_emissions_mt": 1080, "intensity_t_mwh": 0.93, "phase": "Observed / Current"},
        {"year": 2028, "bau_emissions_mt": 1260, "mitigated_emissions_mt": 1140, "intensity_t_mwh": 0.88, "phase": "Targeted Pathway"},
        {"year": 2032, "bau_emissions_mt": 1390, "mitigated_emissions_mt": 1180, "intensity_t_mwh": 0.81, "phase": "Targeted Pathway (Peak Coal)"},
        {"year": 2036, "bau_emissions_mt": 1510, "mitigated_emissions_mt": 1100, "intensity_t_mwh": 0.74, "phase": "Targeted Pathway"},
        {"year": 2040, "bau_emissions_mt": 1640, "mitigated_emissions_mt": 920, "intensity_t_mwh": 0.65, "phase": "Targeted Pathway"},
        {"year": 2045, "bau_emissions_mt": 1780, "mitigated_emissions_mt": 680, "intensity_t_mwh": 0.52, "phase": "Targeted Pathway"},
        {"year": 2050, "bau_emissions_mt": 1910, "mitigated_emissions_mt": 420, "intensity_t_mwh": 0.38, "phase": "Targeted Pathway"},
        {"year": 2055, "bau_emissions_mt": 2020, "mitigated_emissions_mt": 240, "intensity_t_mwh": 0.25, "phase": "Targeted Pathway"},
        {"year": 2060, "bau_emissions_mt": 2100, "mitigated_emissions_mt": 110, "intensity_t_mwh": 0.15, "phase": "Targeted Pathway"},
        {"year": 2065, "bau_emissions_mt": 2160, "mitigated_emissions_mt": 45, "intensity_t_mwh": 0.08, "phase": "Targeted Pathway"},
        {"year": 2070, "bau_emissions_mt": 2210, "mitigated_emissions_mt": 0, "intensity_t_mwh": 0.0, "phase": "Net Zero Milestone"}
    ]
