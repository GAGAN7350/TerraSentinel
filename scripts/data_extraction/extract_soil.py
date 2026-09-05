import pandas as pd
import ee
from pathlib import Path
import os

# ============================================================
# CONFIG
# ============================================================
INPUT_CSV = Path("data/processed/gsi_ner_landslides_final.csv")
OUTPUT_CSV = Path("data/processed/gsi_ner_landslides_with_soil.csv")
PROJECT_ID = "sih2026-507714"

# ============================================================
# GOOGLE EARTH ENGINE AUTHENTICATION
# ============================================================
try:
    ee.Initialize(project=PROJECT_ID)
except Exception as e:
    print("Earth Engine not initialized. Authenticating now...")
    ee.Authenticate()
    ee.Initialize(project=PROJECT_ID)

# ============================================================
# LOAD DATA & SETUP RESUME LOGIC
# ============================================================
print(f"Loading data from {INPUT_CSV}...")
df = pd.read_csv(INPUT_CSV)
valid_mask = df["coordinate_valid"]
df_valid = df[valid_mask].copy()
df_invalid = df[~valid_mask].copy()

# If output already exists, load it to resume progress!
if OUTPUT_CSV.exists():
    print("Found existing progress! Resuming...")
    df_existing = pd.read_csv(OUTPUT_CSV)
    
    # Merge existing soil data into our dataframe
    if 'soil_clay_0_5cm' in df_existing.columns:
        df['soil_clay_0_5cm'] = df_existing['soil_clay_0_5cm']
        df['soil_sand_0_5cm'] = df_existing['soil_sand_0_5cm']
    else:
        df['soil_clay_0_5cm'] = None
        df['soil_sand_0_5cm'] = None
else:
    df['soil_clay_0_5cm'] = None
    df['soil_sand_0_5cm'] = None

df_valid = df[valid_mask].copy()

# ============================================================
# FETCH SOIL DATA (ISRIC SoilGrids)
# ============================================================
print("\nFetching Soil data from Google Earth Engine (ISRIC SoilGrids)...")
clay_img = ee.Image("projects/soilgrids-isric/clay_mean")
sand_img = ee.Image("projects/soilgrids-isric/sand_mean")

save_counter = 0

for index, row in df_valid.iterrows():
    # Skip if we already have data for this row (Resume logic)
    if pd.notna(row.get('soil_clay_0_5cm')):
        continue

    lat = row['latitude']
    lon = row['longitude']
    
    point = ee.Geometry.Point([lon, lat])
    
    try:
        clay_val = clay_img.select('clay_0-5cm_mean').sample(point, scale=250).first()
        sand_val = sand_img.select('sand_0-5cm_mean').sample(point, scale=250).first()
        
        clay_num = clay_val.getInfo()['properties'].get('clay_0-5cm_mean', None) if clay_val else None
        sand_num = sand_val.getInfo()['properties'].get('sand_0-5cm_mean', None) if sand_val else None
        
        df.at[index, 'soil_clay_0_5cm'] = clay_num
        df.at[index, 'soil_sand_0_5cm'] = sand_num
        
        print(f"Success: {row['slide_id']} -> Clay: {clay_num}, Sand: {sand_num}")
        
    except Exception as e:
        print(f"Failed for slide {row['slide_id']}: {e}")

    # SAVE CHECKPOINT EVERY 50 ROWS
    save_counter += 1
    if save_counter % 50 == 0:
        df.to_csv(OUTPUT_CSV, index=False)
        print("...Checkpoint Saved...")

# Final Save
df.to_csv(OUTPUT_CSV, index=False)
print(f"\nSaved COMPLETE dataset to {OUTPUT_CSV}")
