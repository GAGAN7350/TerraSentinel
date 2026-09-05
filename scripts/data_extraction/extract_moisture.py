import pandas as pd
import requests
import time
from pathlib import Path
from datetime import timedelta

# ============================================================
# CONFIG
# ============================================================
INPUT_CSV = Path("data/processed/gsi_ner_landslides_with_soil.csv")
OUTPUT_CSV = Path("data/processed/gsi_ner_landslides_with_moisture.csv")

# NASA POWER API endpoint
BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

# ============================================================
# LOAD DATA
# ============================================================
print(f"Loading data from {INPUT_CSV}...")
df = pd.read_csv(INPUT_CSV)

valid_mask = df["coordinate_valid"] & df["date_available"]
df_valid = df[valid_mask].copy()
df_invalid = df[~valid_mask].copy()

df_valid['history_date'] = pd.to_datetime(df_valid['history_date'])

# New columns for Soil Moisture (Root Zone and Profile)
df_valid['soil_moisture_root_7d_avg'] = None
df_valid['soil_moisture_prof_7d_avg'] = None

# ============================================================
# FETCH SOIL MOISTURE DATA
# ============================================================
print("\nFetching Soil Moisture data from NASA POWER API...")
print("Note: Processing first 10 records for demonstration.")

for index, row in df_valid.iterrows():
    lat = row['latitude']
    lon = row['longitude']
    event_date = row['history_date']
    
    # We want moisture for the 7 days prior to the landslide
    start_date = event_date - timedelta(days=7)
    end_date = event_date
    
    params = {
        "latitude": lat,
        "longitude": lon,
        "start": start_date.strftime("%Y%m%d"),
        "end": end_date.strftime("%Y%m%d"),
        "parameters": "GWETROOT,GWETPROF", # Root Zone and Profile Soil Moisture
        "community": "ag",
        "format": "json"
    }
    
    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            root_data = data['properties']['parameter']['GWETROOT']
            prof_data = data['properties']['parameter']['GWETPROF']
            
            # Calculate averages, ignoring -999.0 (missing data)
            root_vals = [v for v in root_data.values() if v != -999.0]
            prof_vals = [v for v in prof_data.values() if v != -999.0]
            
            root_avg = sum(root_vals) / len(root_vals) if root_vals else 0
            prof_avg = sum(prof_vals) / len(prof_vals) if prof_vals else 0
            
            df_valid.at[index, 'soil_moisture_root_7d_avg'] = round(root_avg, 3)
            df_valid.at[index, 'soil_moisture_prof_7d_avg'] = round(prof_avg, 3)
            
            print(f"Success: {row['slide_id']} -> Root Moisture: {root_avg:.2f}, Profile Moisture: {prof_avg:.2f}")
            
        else:
            print(f"Error for slide {row['slide_id']}: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"Failed to fetch for slide {row['slide_id']}: {e}")
        
    time.sleep(0.5) # Rate limiting

# ============================================================
# SAVE DATASET
# ============================================================
df_final = pd.concat([df_valid, df_invalid])
df_final.to_csv(OUTPUT_CSV, index=False)
print(f"\nSaved updated dataset to {OUTPUT_CSV}")
