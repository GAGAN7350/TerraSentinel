import concurrent.futures
from pathlib import Path
import time
import ee
import numpy as np
import pandas as pd
from tqdm import tqdm

INPUT_CSV = Path("data/processed/gsi_ner_landslides_complete.csv")
OUTPUT_CSV = Path("data/processed/gsi_ner_balanced.csv")
PROJECT_ID = "sih2026-507714"
NUM_NEGATIVE_SAMPLES = 10000

# Bounding box of North East India
LAT_MIN, LAT_MAX = 22.0, 29.5
LON_MIN, LON_MAX = 89.5, 97.5

print(f"Initializing Earth Engine with project: {PROJECT_ID}...")
ee.Initialize(project=PROJECT_ID, opt_url="https://earthengine-highvolume.googleapis.com")

print(f"Reading positive samples from {INPUT_CSV}...")
df_pos = pd.read_csv(INPUT_CSV)
df_pos['Slide'] = 1
print(f"Loaded {len(df_pos)} positive samples.")

print(f"Generating {NUM_NEGATIVE_SAMPLES} random negative coordinates in NE India...")
np.random.seed(42)
neg_lats = np.random.uniform(LAT_MIN, LAT_MAX, NUM_NEGATIVE_SAMPLES)
neg_lons = np.random.uniform(LON_MIN, LON_MAX, NUM_NEGATIVE_SAMPLES)

# Prepare Earth Engine Image layers
dem = ee.Image('USGS/SRTMGL1_003')
terrain = ee.Terrain.products(dem)
clay_img = ee.Image('projects/soilgrids-isric/clay_mean')
sand_img = ee.Image('projects/soilgrids-isric/sand_mean')

combined = (
    dem.rename('elevation_meters')
    .addBands(terrain.select(['slope', 'aspect'], ['terrain_slope', 'terrain_aspect']))
    .addBands(clay_img.select('clay_0-5cm_mean').rename('soil_clay_0_5cm'))
    .addBands(sand_img.select('sand_0-5cm_mean').rename('soil_sand_0_5cm'))
)

# Storage for extracted features
elevations = [None] * NUM_NEGATIVE_SAMPLES
slopes = [None] * NUM_NEGATIVE_SAMPLES
aspects = [None] * NUM_NEGATIVE_SAMPLES
clays = [None] * NUM_NEGATIVE_SAMPLES
sands = [None] * NUM_NEGATIVE_SAMPLES

def fetch_point(idx, lat, lon):
    try:
        pt = ee.Geometry.Point([float(lon), float(lat)])
        sample = combined.sample(pt, scale=30).first()
        if sample:
            props = sample.getInfo().get('properties', {})
            return (
                idx,
                props.get('elevation_meters'),
                round(props['terrain_slope'], 3) if props.get('terrain_slope') is not None else None,
                round(props['terrain_aspect'], 3) if props.get('terrain_aspect') is not None else None,
                props.get('soil_clay_0_5cm'),
                props.get('soil_sand_0_5cm')
            )
    except Exception:
        pass
    return idx, None, None, None, None, None

def fetch_batch(chunk):
    try:
        feats = [
            ee.Feature(ee.Geometry.Point([float(lon), float(lat)]), {'idx': idx})
            for idx, lat, lon in chunk
        ]
        fc = ee.FeatureCollection(feats)
        res = combined.sampleRegions(collection=fc, scale=30).getInfo()
        results = []
        for f in res.get('features', []):
            p = f.get('properties', {})
            idx = p.get('idx')
            elev = p.get('elevation_meters')
            slope = round(p['terrain_slope'], 3) if p.get('terrain_slope') is not None else None
            aspect = round(p['terrain_aspect'], 3) if p.get('terrain_aspect') is not None else None
            clay = p.get('soil_clay_0_5cm')
            sand = p.get('soil_sand_0_5cm')
            results.append((idx, elev, slope, aspect, clay, sand))
        return results
    except Exception as e:
        fallback_results = []
        for idx, lat, lon in chunk:
            fallback_results.append(fetch_point(idx, lat, lon))
        return fallback_results

BATCH_SIZE = 100
chunks = []
for i in range(0, NUM_NEGATIVE_SAMPLES, BATCH_SIZE):
    chunk = [
        (j, neg_lats[j], neg_lons[j])
        for j in range(i, min(i + BATCH_SIZE, NUM_NEGATIVE_SAMPLES))
    ]
    chunks.append(chunk)

print(f"Fetching terrain and soil features for {NUM_NEGATIVE_SAMPLES} points using ThreadPoolExecutor(max_workers=50)...")
with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
    futures = {executor.submit(fetch_batch, c): c for c in chunks}
    for future in tqdm(concurrent.futures.as_completed(futures), total=len(futures), desc="Extracting Negative Samples"):
        batch_results = future.result()
        for idx, elev, slope, aspect, clay, sand in batch_results:
            elevations[idx] = elev
            slopes[idx] = slope
            aspects[idx] = aspect
            clays[idx] = clay
            sands[idx] = sand

# Construct negative samples dataframe
max_slide_id = int(df_pos['slide_id'].max()) if 'slide_id' in df_pos.columns and len(df_pos) > 0 else 0
df_neg = pd.DataFrame({
    'slide_id': range(max_slide_id + 1, max_slide_id + 1 + NUM_NEGATIVE_SAMPLES),
    'latitude': neg_lats,
    'longitude': neg_lons,
    'coordinate_valid': True,
    'date_available': False,
    'elevation_meters': elevations,
    'terrain_slope': slopes,
    'terrain_aspect': aspects,
    'soil_clay_0_5cm': clays,
    'soil_sand_0_5cm': sands,
    'Slide': 0
})

print(f"\nExtracted {len(df_neg)} negative samples.")
print(f"Non-null counts in negative samples:\n{df_neg.notnull().sum()}")

print("\nCombining positive and negative samples...")
df_balanced = pd.concat([df_pos, df_neg], ignore_index=True)

OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
df_balanced.to_csv(OUTPUT_CSV, index=False)

print(f"\nSaved balanced dataset with {len(df_balanced)} rows to {OUTPUT_CSV}")
print(f"Class distribution:\n{df_balanced['Slide'].value_counts()}")
