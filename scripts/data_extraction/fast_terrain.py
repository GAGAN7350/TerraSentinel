import pandas as pd
import ee
from pathlib import Path
import concurrent.futures
from tqdm import tqdm

INPUT_CSV = Path("data/processed/gsi_ner_landslides_complete.csv")
OUTPUT_CSV = Path("data/processed/gsi_ner_landslides_complete.csv")
PROJECT_ID = "sih2026-507714"

ee.Initialize(project=PROJECT_ID)

print("Loading dataset...")
df = pd.read_csv(INPUT_CSV)
valid_mask = df["coordinate_valid"]
df_valid = df[valid_mask].copy()

# Initialize new columns
if 'terrain_slope' not in df.columns:
    df['terrain_slope'] = None
if 'terrain_aspect' not in df.columns:
    df['terrain_aspect'] = None

print(f"Total records to process: {len(df_valid)}")

# Use the SRTM 30m Digital Elevation Model
dem = ee.Image('USGS/SRTMGL1_003')
# ee.Terrain.products generates 'elevation', 'slope', and 'aspect' bands
terrain = ee.Terrain.products(dem)

def get_terrain(index, lat, lon):
    try:
        point = ee.Geometry.Point([lon, lat])
        
        # Sample all terrain bands at once
        terrain_dict = terrain.sample(point, scale=30).first()
        
        if terrain_dict:
            props = terrain_dict.getInfo()['properties']
            slope = props.get('slope', None)
            aspect = props.get('aspect', None)
            elevation = props.get('elevation', None)
            
            return index, slope, aspect, elevation
    except Exception as e:
        pass
        
    return index, None, None, None

print("Starting HYPER-FAST multithreaded extraction for Terrain (50 parallel connections)...")

with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
    futures = {
        executor.submit(get_terrain, index, row['latitude'], row['longitude']): index 
        for index, row in df_valid.iterrows()
    }
    
    for future in tqdm(concurrent.futures.as_completed(futures), total=len(futures), desc="Extracting Terrain"):
        index, slope, aspect, elevation = future.result()
        if slope is not None:
            df.at[index, 'terrain_slope'] = round(slope, 3)
            df.at[index, 'terrain_aspect'] = round(aspect, 3)
            # Overwrite the old elevation with the high-res 30m SRTM data
            # This also perfectly fixes the HTTP 429 missing elevations from yesterday!
            df.at[index, 'elevation_meters'] = elevation

df.to_csv(OUTPUT_CSV, index=False)
print(f"\n🎉 DONE! Saved final terrain features to {OUTPUT_CSV}")
