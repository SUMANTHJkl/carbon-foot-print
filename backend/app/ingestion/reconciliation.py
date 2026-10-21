import ast
import re
from typing import Dict, List, Optional, Set

# Explicit manual overrides for reviewed plant names
MANUAL_OVERRIDES: Dict[str, str] = {
    "CHANDRAPUR (MAHARASHTRA) STPS": "CHANDRAPUR STPS",
    "NTPL TUTICORIN TPP": "TUTICORIN TPP",
    "TORANGALLU TPS (SBU-I)": "TORANGALLU (JSW)",
    "TORANGALLU TPS (SBU-II)": "TORANGALLU (JSW)",
    "GH TPS (LEH.MOH.)": "GURU HARGOBIND TPS",
    "ROSA TPP PH-I": "ROSA TPP",
    "SURATGARH STPS": "SURATGARH TPS",
    "ADANI POWER LIMITED KAWAI TPP": "KAWAI TPS",
    "ADANI POWER LIMITED MUNDRA TPP - III": "MUNDRA TPP",
    "ADANI POWER LIMITED MUNDRA TPP - I & II": "MUNDRA TPP",
    "ADANI POWER LIMITED RAIGARH TPP": "RAIGARH TPP",
    "ADANI POWER LIMITED RAIPUR TPP": "RAIPUR TPP",
    "ADANI POWER LIMITED TIRODA TPP": "TIRODA TPS",
    "ADANI POWER LIMITED UDUPI TPP": "UDUPI TPP"
}

def normalize_plant_name(name: str) -> str:
    """Normalize whitespace, uppercase, and common abbreviations for matching."""
    if not name:
        return ""
    clean = re.sub(r'\s+', ' ', str(name)).strip().upper()
    return clean

class PlantReconciler:
    def __init__(self):
        # Maps canonical normalized name -> primary plant name
        self.alias_to_canonical: Dict[str, str] = {}
        self.canonical_plants: Set[str] = set()

    def load_aliases_from_inventory(self, inventory_df) -> None:
        """Populate alias map using plant_name and possible_names from inventory."""
        unique_plants = inventory_df[['plant_name', 'possible_names']].drop_duplicates()
        for _, row in unique_plants.iterrows():
            canonical = str(row['plant_name']).strip()
            self.canonical_plants.add(canonical)
            norm_canonical = normalize_plant_name(canonical)
            self.alias_to_canonical[norm_canonical] = canonical

            raw_aliases = row.get('possible_names')
            if raw_aliases and isinstance(raw_aliases, str):
                try:
                    aliases = ast.literal_eval(raw_aliases)
                    if isinstance(aliases, list):
                        for a in aliases:
                            self.alias_to_canonical[normalize_plant_name(a)] = canonical
                except (ValueError, SyntaxError):
                    pass

        # Apply reviewed manual overrides
        for alias, target in MANUAL_OVERRIDES.items():
            self.alias_to_canonical[normalize_plant_name(alias)] = target

    def match_plant(self, query_name: str) -> Optional[str]:
        """Resolve any variant name to its canonical plant_name."""
        norm_query = normalize_plant_name(query_name)
        if norm_query in self.alias_to_canonical:
            return self.alias_to_canonical[norm_query]

        # Try stripping trailing TPP / TPS / STPS / STPP
        stripped = re.sub(r'\s+(TPP|TPS|STPS|STPP|Ph-\w+|Phase-\w+|EXP)$', '', norm_query, flags=re.IGNORECASE).strip()
        if stripped in self.alias_to_canonical:
            return self.alias_to_canonical[stripped]

        # Partial substring match against canonical plants
        for norm_alias, canonical in self.alias_to_canonical.items():
            if norm_query in norm_alias or norm_alias in norm_query:
                return canonical

        return None
