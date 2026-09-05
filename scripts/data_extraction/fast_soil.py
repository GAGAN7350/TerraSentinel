import pandas as pd
import ee
from pathlib import Path
import concurrent.futures
from tqdm import tqdm

INPUT_CSV = Path("data/processed/gsi_ner_landslides_final.csv")
OUTPUT_CSV = Path("data/processed/gsi_ner_landslides_with_soil.csv")
PROJECT_ID = "sih2026-507714"

ee.Initialize(project=PROJECT_ID)

print("Loading dataset...")
df = pd.read_csv(INPUT_CSV)
valid_mask = df["coordinate_valid"]
df_valid = df[valid_mask].copy()

# Initialize columns
df['soil_clay_0_5cm'] = None
df['soil_sand_0_5cm'] = None

print(f"Total records to process: {len(df_valid)}")

clay_img = ee.Image("projects/soilgrids-isric/clay_mean")
sand_img = ee.Image("projects/soilgrids-isric/sand_mean")

def get_soil(index, lat, lon):
    try:
        point = ee.Geometry.Point([lon, lat])
        clay_val = clay_img.select('clay_0-5cm_mean').sample(point, scale=250).first()
        sand_val = sand_img.select('sand_0-5cm_mean').sample(point, scale=250).first()
        
        clay_num = clay_val.getInfo()['properties'].get('clay_0-5cm_mean', None) if clay_val else None
        sand_num = sand_val.getInfo()['properties'].get('sand_0-5cm_mean', None) if sand_val else None
        
        return index, clay_num, sand_num
    except Exception as e:
        return index, None, None

print("Starting HYPER-FAST multithreaded extraction (using 50 parallel connections)...")

# Use ThreadPoolExecutor to run 50 requests at the exact same time
with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
    futures = {
        executor.submit(get_soil, index, row['latitude'], row['longitude']): index 
        for index, row in df_valid.iterrows()
    }
    
    # Progress bar
    for future in tqdm(concurrent.futures.as_completed(futures), total=len(futures), desc="Extracting Soil"):
        index, clay_num, sand_num = future.result()
        if clay_num is not None:
            df.at[index, 'soil_clay_0_5cm'] = clay_num
            df.at[index, 'soil_sand_0_5cm'] = sand_num

df.to_csv(OUTPUT_CSV, index=False)
print(f"\nDONE! Saved full dataset to {OUTPUT_CSV}")
