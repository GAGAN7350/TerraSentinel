import pandas as pd
import requests
from pathlib import Path
import concurrent.futures
from tqdm import tqdm
from datetime import timedelta

INPUT_CSV = Path("data/processed/gsi_ner_landslides_with_soil.csv")
OUTPUT_CSV = Path("data/processed/gsi_ner_landslides_with_moisture.csv")
BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

print("Loading dataset...")
df = pd.read_csv(INPUT_CSV)
valid_mask = df["coordinate_valid"] & df["date_available"]
df_valid = df[valid_mask].copy()

df['soil_moisture_root_7d_avg'] = None
df['soil_moisture_prof_7d_avg'] = None

print(f"Total records to process: {len(df_valid)}")

def get_moisture(index, lat, lon, event_date_str):
    try:
        event_date = pd.to_datetime(event_date_str)
        start_date = event_date - timedelta(days=7)
        
        params = {
            "latitude": lat,
            "longitude": lon,
            "start": start_date.strftime("%Y%m%d"),
            "end": event_date.strftime("%Y%m%d"),
            "parameters": "GWETROOT,GWETPROF",
            "community": "ag",
            "format": "json"
        }
        
        # NASA API can be strict, so a small timeout is good
        response = requests.get(BASE_URL, params=params, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            root_data = data['properties']['parameter']['GWETROOT']
            prof_data = data['properties']['parameter']['GWETPROF']
            
            root_vals = [v for v in root_data.values() if v != -999.0]
            prof_vals = [v for v in prof_data.values() if v != -999.0]
            
            root_avg = round(sum(root_vals) / len(root_vals), 3) if root_vals else 0
            prof_avg = round(sum(prof_vals) / len(prof_vals), 3) if prof_vals else 0
            
            return index, root_avg, prof_avg
    except Exception as e:
        pass
        
    return index, None, None

print("Starting FAST multithreaded extraction for NASA Moisture (15 parallel connections)...")

# We use 15 workers instead of 50 to avoid getting banned by NASA's rate limits
with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
    futures = {
        executor.submit(get_moisture, index, row['latitude'], row['longitude'], row['history_date']): index 
        for index, row in df_valid.iterrows()
    }
    
    for future in tqdm(concurrent.futures.as_completed(futures), total=len(futures), desc="Extracting Moisture"):
        index, root, prof = future.result()
        if root is not None:
            df.at[index, 'soil_moisture_root_7d_avg'] = root
            df.at[index, 'soil_moisture_prof_7d_avg'] = prof

df.to_csv(OUTPUT_CSV, index=False)
print(f"\nDONE! Saved moisture dataset to {OUTPUT_CSV}")
