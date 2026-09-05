import pandas as pd
import requests
import time
from pathlib import Path
import numpy as np

# ============================================================
# CONFIG
# ============================================================
# We'll use the dataset we just created with rainfall to keep adding features
INPUT_CSV = Path("data/processed/gsi_ner_landslides_with_rainfall.csv")
OUTPUT_CSV = Path("data/processed/gsi_ner_landslides_final.csv")

# Open-Meteo Elevation API endpoint
BASE_URL = "https://api.open-meteo.com/v1/elevation"
BATCH_SIZE = 100  # API allows batching multiple coordinates

# ============================================================
# LOAD DATA
# ============================================================
print(f"Loading data from {INPUT_CSV}...")
df = pd.read_csv(INPUT_CSV)

# We need valid coordinates for terrain extraction
valid_mask = df["coordinate_valid"]
df_valid = df[valid_mask].copy()
df_invalid = df[~valid_mask].copy()

print(f"Total records: {len(df)}")
print(f"Records with valid coordinates (can fetch terrain): {len(df_valid)}")

df_valid['elevation_meters'] = np.nan

# ============================================================
# FETCH ELEVATION DATA (BATCHED)
# ============================================================
print("\nFetching elevation data from Open-Meteo API...")

# Split into batches of 100
batches = [df_valid.iloc[i:i + BATCH_SIZE] for i in range(0, len(df_valid), BATCH_SIZE)]

processed_count = 0

for i, batch in enumerate(batches):
    # Prepare latitude and longitude lists for the batch
    lats = batch['latitude'].astype(str).tolist()
    lons = batch['longitude'].astype(str).tolist()
    
    # Comma-separated strings for the API
    params = {
        "latitude": ",".join(lats),
        "longitude": ",".join(lons)
    }
    
    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            elevations = data.get("elevation", [])
            
            # Assign elevations back to the dataframe slice
            if len(elevations) == len(batch):
                df_valid.loc[batch.index, 'elevation_meters'] = elevations
                processed_count += len(elevations)
                print(f"Processed batch {i+1}/{len(batches)} (got {len(elevations)} elevations)")
            else:
                print(f"Warning: Mismatch in batch {i+1} length.")
        else:
            print(f"Error for batch {i+1}: HTTP {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"Failed to fetch batch {i+1}: {e}")
        
    # Rate limit: max 10,000 API calls per day for free tier, delay slightly
    time.sleep(1)

print(f"\nSuccessfully fetched elevation for {processed_count} records.")

# ============================================================
# SAVE DATASET
# ============================================================
# Recombine valid and invalid records
df_final = pd.concat([df_valid, df_invalid])

# Save the updated dataset
df_final.to_csv(OUTPUT_CSV, index=False)
print(f"Saved updated dataset to {OUTPUT_CSV}")
