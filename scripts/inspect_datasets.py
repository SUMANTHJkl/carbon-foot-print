import os
import pandas as pd
import numpy as np

RAW_DIR = "data/raw"

def inspect_file(filename):
    filepath = os.path.join(RAW_DIR, filename)
    print("=" * 80)
    print(f"FILE: {filename}")
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    
    filesize_mb = os.path.getsize(filepath) / (1024 * 1024)
    print(f"File Size: {filesize_mb:.2f} MB ({os.path.getsize(filepath):,} bytes)")
    
    # Read first few lines for header and sample
    df_sample = pd.read_csv(filepath, nrows=5)
    print("\nColumns:", list(df_sample.columns))
    print("\nSample Data (first 3 rows):")
    print(df_sample.head(3).to_dict(orient="records"))
    
    # For smaller files or chunked reading
    if filesize_mb < 20:
        df = pd.read_csv(filepath)
        print(f"\nTotal Rows: {len(df):,}, Columns: {len(df.columns)}")
        print("\nData Types:")
        print(df.dtypes)
        print("\nMissing Values:")
        print(df.isnull().sum())
        
        # Check specific columns if present
        for col in ['Fuel', 'Fuel_Type', 'State', 'Region', 'Plant_Name', 'Name of TPS', 'Plant', 'Date', 'year', 'Year']:
            if col in df.columns:
                unique_vals = df[col].dropna().unique()
                print(f"\nUnique values in '{col}' ({len(unique_vals)} total):")
                print(unique_vals[:15])
    else:
        # Large file (like daily ~300MB)
        print("\nLarge file detected. Reading chunks for summary statistics...")
        row_count = 0
        columns = None
        dtypes = None
        min_date = None
        max_date = None
        unique_plants = set()
        null_counts = {}
        sample_chunk = None
        
        for i, chunk in enumerate(pd.read_csv(filepath, chunksize=100000, low_memory=False)):
            if i == 0:
                columns = list(chunk.columns)
                dtypes = chunk.dtypes
                null_counts = {c: 0 for c in columns}
                sample_chunk = chunk.head(2)
            row_count += len(chunk)
            for c in columns:
                null_counts[c] += chunk[c].isnull().sum()
            
            # Check date col
            for date_col in ['Date', 'date', 'Timestamp', 'Day']:
                if date_col in chunk.columns:
                    c_dates = pd.to_datetime(chunk[date_col].dropna(), errors='coerce')
                    c_min, c_max = c_dates.min(), c_dates.max()
                    if min_date is None or c_min < min_date:
                        min_date = c_min
                    if max_date is None or c_max > max_date:
                        max_date = c_max
            
            # Check plant col
            for p_col in ['Plant_Name', 'Plant', 'plant_id', 'Plant_ID', 'ID']:
                if p_col in chunk.columns:
                    unique_plants.update(chunk[p_col].dropna().unique())
                    
        print(f"\nTotal Rows: {row_count:,}, Columns: {len(columns)}")
        print("\nData Types (from first chunk):")
        print(dtypes)
        print("\nNull Counts:")
        for c, n in null_counts.items():
            print(f"  {c}: {n:,} ({n/row_count*100:.2f}%)")
        if min_date and max_date:
            print(f"\nDate Range: {min_date} to {max_date}")
        if unique_plants:
            print(f"\nUnique plants count: {len(unique_plants)}")
            print("Sample plants:", list(unique_plants)[:10])

if __name__ == "__main__":
    for f in ["CHETNA_Power_Plants_inventory.csv", "Coal_Table_1.i_1.csv", "CHETNA_Power_Plants_daily.csv"]:
        raw_path = Path("data/raw") / f
        target = raw_path if raw_path.exists() else Path(f)
        if target.exists():
            inspect_file(str(target))
        else:
            print(f"File not found: {f}")

