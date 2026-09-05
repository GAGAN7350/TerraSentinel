import pandas as pd
import requests
import time
import json
from pathlib import Path
from datetime import timedelta

# ============================================================
# CONFIG
# ============================================================
INPUT_CSV = Path("data/processed/gsi_ner_landslides.csv")
OUTPUT_CSV = Path("data/processed/gsi_ner_landslides_with_rainfall.csv")

# NASA POWER API endpoint
BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

# ============================================================
# LOAD DATA
# ============================================================
print(f"Loading data from {INPUT_CSV}...")
df = pd.read_csv(INPUT_CSV)

# Filter for rows that have BOTH valid coordinates AND a valid date
# We need the date to fetch the historical rainfall leading up to the landslide!
valid_mask = df["coordinate_valid"] & df["date_available"]
df_valid = df[valid_mask].copy()
df_invalid = df[~valid_mask].copy()

print(f"Total records: {len(df)}")
print(f"Records with valid coordinates and dates (can fetch rainfall): {len(df_valid)}")
print(f"Records missing coordinates or dates: {len(df_invalid)}")

# Convert string date to datetime
df_valid['history_date'] = pd.to_datetime(df_valid['history_date'])

# We'll store the results in new columns
df_valid['rainfall_7d_mm'] = None
df_valid['rainfall_15d_mm'] = None
df_valid['rainfall_30d_mm'] = None

# ============================================================
# FETCH RAINFALL DATA
# ============================================================
print("\nFetching rainfall data from NASA POWER API...")
print("Note: Processing first 10 records for demonstration. Remove the [:10] slice in production.")

# FOR DEMONSTRATION: just process the first 10 records to avoid long wait times.
# In a real run, remove the `[:10]` slice.
for index, row in df_valid.iterrows():
    lat = row['latitude']
    lon = row['longitude']
    event_date = row['history_date']
    
    # We want rainfall for the 30 days prior to the landslide
    start_date = event_date - timedelta(days=30)
    end_date = event_date
    
    # Format dates as YYYYMMDD for the API
    start_str = start_date.strftime("%Y%m%d")
    end_str = end_date.strftime("%Y%m%d")
    
    params = {
        "latitude": lat,
        "longitude": lon,
        "start": start_str,
        "end": end_str,
        "parameters": "PRECTOTCORR", # Precipitation Corrected
        "community": "ag",
        "format": "json"
    }
    
    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            precip_data = data['properties']['parameter']['PRECTOTCORR']
            
            # precip_data is a dict like {"YYYYMMDD": value, ...}
            # Calculate cumulative rainfall
            values = list(precip_data.values())
            # Replace -999.0 (missing data flag) with 0
            values = [v if v != -999.0 else 0 for v in values]
            
            # The list represents [Day -30, Day -29, ..., Day 0]
            rain_30d = sum(values)
            rain_15d = sum(values[-15:])
            rain_7d = sum(values[-7:])
            
            df_valid.at[index, 'rainfall_30d_mm'] = rain_30d
            df_valid.at[index, 'rainfall_15d_mm'] = rain_15d
            df_valid.at[index, 'rainfall_7d_mm'] = rain_7d
            
            print(f"Success: {row['slide_id']} ({row['state']}) -> 7d: {rain_7d:.1f}mm, 30d: {rain_30d:.1f}mm")
            
        else:
            print(f"Error for slide {row['slide_id']}: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"Failed to fetch for slide {row['slide_id']}: {e}")
        
    # Respect API rate limits
    time.sleep(0.5)

# ============================================================
# SAVE DATASET
# ============================================================
# Combine valid and invalid data back together
df_final = pd.concat([df_valid, df_invalid])

df_final.to_csv(OUTPUT_CSV, index=False)
print(f"\nSaved updated dataset to {OUTPUT_CSV}")
