# TerraSentinel Datasets

This folder contains the datasets used to train the TerraSentinel Landslide Risk ML Model, as well as the intermediate processed files.

## Dataset Architecture

The project relies on a fusion of ground-truth landslide records and external geospatial/environmental variables. Our extraction pipeline programmatically builds the dataset by querying public APIs for specific coordinates and timestamps.

```
                 TERRASENTINEL DATA
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
 LANDSLIDES          RAINFALL          TERRAIN
 GSI/NRSC             GPM/IMD          DEM
       │                │                │
       │                │          ┌─────┴─────┐
       │                │          │           │
       │                │        Slope      Elevation
       │                │        Aspect      Curvature
       │                │
       ├────────────────┼──────────────────────┐
       │                │                      │
       ▼                ▼                      ▼
     SOIL           SATELLITE              SOIL MOISTURE
 SoilGrids        Sentinel-2               Sensors/etc.
```

### 1. Landslide Inventory (Ground Truth)
* **Source:** Geological Survey of India (GSI) Bhusanket Reports.
* **Description:** Historical landslide events specifically filtered for the 8 North Eastern Region (NER) states.
* **Script:** `extract_gsi.py` (Parses original PDF reports).

### 2. Rainfall & Precipitation
* **Source:** NASA POWER API (Prediction Of Worldwide Energy Resources).
* **Description:** Daily cumulative rainfall (`PRECTOTCORR`) calculated for 7, 15, and 30 days prior to the landslide event to capture antecedent moisture conditions.
* **Script:** `extract_rainfall.py`.

### 3. Terrain & Topography
* **Source:** Open-Meteo Elevation API / SRTM DEM.
* **Description:** Provides the exact elevation in meters for the landslide coordinates. (Future iterations will include Slope and Aspect derived from a local DEM).
* **Script:** `extract_terrain.py`.

### 4. Soil Properties
* **Source:** ISRIC SoilGrids (via Google Earth Engine).
* **Description:** Captures the structural composition of the soil at the event location. Specifically extracts **Sand** and **Clay** fractions at 0-5cm depths.
* **Script:** `extract_soil.py`.

### 5. Soil Moisture
* **Source:** NASA POWER API.
* **Description:** Extracts the **Root Zone** (`GWETROOT`) and **Profile** (`GWETPROF`) soil moisture fractions averaged over the 7 days prior to the landslide, indicating soil saturation levels.
* **Script:** `extract_moisture.py`.

### 6. Satellite Imagery (Vegetation Index)
* **Source:** Sentinel-2 (via Google Earth Engine).
* **Description:** Calculates the Normalized Difference Vegetation Index (NDVI) for the month prior to the landslide. Low NDVI can indicate barren land or deforestation, which increases landslide vulnerability. 
* **Script:** `extract_satellite.py`.

---

## How to Build the Dataset

You do not need to run the extraction scripts one-by-one. We have bundled the entire pipeline into a single master script.

### Prerequisites
1. Ensure your Python environment is set up: `pip install -r Terrasentinel_Backend/requirements.txt`.
2. Authenticate Google Earth Engine (`earthengine authenticate`).

### Running the Pipeline
Run the following command from the **root of the repository**:

```bash
python scripts/data_extraction/run_all.py
```

This will sequentially execute all the extraction modules, building the dataset feature-by-feature. It processes the GSI data, queries the NASA and Open-Meteo APIs (respecting rate limits), and interfaces with Google Earth Engine.

### Outputs
* `data/raw/` - Contains the raw PDF reports and initial bulk extractions.
* `data/processed/` - Contains the final output file `gsi_ner_landslides_complete.csv` which is fed directly into the ML models.
