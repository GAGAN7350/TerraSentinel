import pandas as pd
import ee
from pathlib import Path

# ============================================================
# CONFIG
# ============================================================
INPUT_CSV = Path("data/processed/gsi_ner_landslides_with_moisture.csv")
OUTPUT_CSV = Path("data/processed/gsi_ner_landslides_complete.csv")

PROJECT_ID = "sih2026-507714" # The project ID you just registered!

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
# LOAD DATA
# ============================================================
print(f"Loading data from {INPUT_CSV}...")
df = pd.read_csv(INPUT_CSV)

valid_mask = df["coordinate_valid"] & df["date_available"]
df_valid = df[valid_mask].copy()
df_invalid = df[~valid_mask].copy()

df_valid['history_date'] = pd.to_datetime(df_valid['history_date'])

# New column for Normalized Difference Vegetation Index (NDVI)
df_valid['sentinel2_ndvi'] = None

# ============================================================
# FETCH SATELLITE DATA (Sentinel-2)
# ============================================================
print("\nFetching Sentinel-2 Satellite data from Google Earth Engine...")
print("Note: Processing first 10 records for demonstration.")

# Function to calculate NDVI from Sentinel-2
def add_ndvi(image):
    ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
    return image.addBands(ndvi)

for index, row in df_valid.iterrows():
    lat = row['latitude']
    lon = row['longitude']
    event_date = row['history_date']
    
    # We look at the 30 days BEFORE the landslide to get a clear cloud-free image
    start_date = (event_date - pd.Timedelta(days=30)).strftime('%Y-%m-%d')
    end_date = event_date.strftime('%Y-%m-%d')
    
    point = ee.Geometry.Point([lon, lat])
    
    try:
        # Get Sentinel-2 Image Collection, filter by location, date, and cloud cover
        collection = (ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
                      .filterBounds(point)
                      .filterDate(start_date, end_date)
                      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                      .map(add_ndvi))
        
        # Get the median image over that month to reduce noise/clouds
        median_image = collection.median()
        
        # Sample the NDVI at the exact point
        ndvi_dict = median_image.select('NDVI').sample(point, scale=10).first()
        
        if ndvi_dict:
            ndvi_val = ndvi_dict.getInfo()['properties'].get('NDVI', None)
            if ndvi_val is not None:
                df_valid.at[index, 'sentinel2_ndvi'] = round(ndvi_val, 3)
                print(f"Success: {row['slide_id']} -> NDVI (Vegetation): {ndvi_val:.3f}")
            else:
                print(f"No valid NDVI data for slide {row['slide_id']}")
        else:
            print(f"No cloud-free imagery found for slide {row['slide_id']}")
            
    except Exception as e:
        print(f"Failed to fetch satellite data for slide {row['slide_id']}: {e}")

# ============================================================
# SAVE FINAL DATASET
# ============================================================
df_final = pd.concat([df_valid, df_invalid])
df_final.to_csv(OUTPUT_CSV, index=False)
print(f"\nSaved COMPLETE dataset to {OUTPUT_CSV}")
