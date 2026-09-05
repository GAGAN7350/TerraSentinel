import pandas as pd
import ee
from pathlib import Path
import concurrent.futures
from tqdm import tqdm

INPUT_CSV = Path("data/processed/gsi_ner_landslides_with_moisture.csv")
OUTPUT_CSV = Path("data/processed/gsi_ner_landslides_complete.csv")
PROJECT_ID = "sih2026-507714"

ee.Initialize(project=PROJECT_ID)

print("Loading dataset...")
df = pd.read_csv(INPUT_CSV)
valid_mask = df["coordinate_valid"] & df["date_available"]
df_valid = df[valid_mask].copy()

df['sentinel2_ndvi'] = None

print(f"Total records to process: {len(df_valid)}")

def add_ndvi(image):
    ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
    return image.addBands(ndvi)

def get_satellite(index, lat, lon, event_date_str):
    try:
        event_date = pd.to_datetime(event_date_str)
        start_date = (event_date - pd.Timedelta(days=30)).strftime('%Y-%m-%d')
        end_date = event_date.strftime('%Y-%m-%d')
        
        point = ee.Geometry.Point([lon, lat])
        
        collection = (ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
                      .filterBounds(point)
                      .filterDate(start_date, end_date)
                      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                      .map(add_ndvi))
        
        median_image = collection.median()
        ndvi_dict = median_image.select('NDVI').sample(point, scale=10).first()
        
        if ndvi_dict:
            ndvi_val = ndvi_dict.getInfo()['properties'].get('NDVI', None)
            return index, round(ndvi_val, 3) if ndvi_val is not None else None
    except Exception as e:
        pass
        
    return index, None

print("Starting HYPER-FAST multithreaded extraction for Sentinel-2 (50 parallel connections)...")

with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
    futures = {
        executor.submit(get_satellite, index, row['latitude'], row['longitude'], row['history_date']): index 
        for index, row in df_valid.iterrows()
    }
    
    for future in tqdm(concurrent.futures.as_completed(futures), total=len(futures), desc="Extracting Satellite"):
        index, ndvi_val = future.result()
        if ndvi_val is not None:
            df.at[index, 'sentinel2_ndvi'] = ndvi_val

df.to_csv(OUTPUT_CSV, index=False)
print(f"\n🎉 ALL DONE! Your ultimate finalized dataset is saved to {OUTPUT_CSV}")
