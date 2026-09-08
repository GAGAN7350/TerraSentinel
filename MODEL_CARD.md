# Model Card — TerraSentinel XGBoost Landslide Susceptibility Engine

## Model Details
- **Model Name**: TerraSentinel XGBoost Spatial Risk Classifier
- **Model Version**: `v1.2.0-xgboost`
- **Model Type**: Gradient Boosted Decision Trees (`xgboost.XGBClassifier`)
- **Developer**: TerraSentinel ML Engineering Team
- **License**: Open Source (SIH 2026 Project)

---

## Intended Use
- **Intended Purpose**: Estimation of static spatial landslide susceptibility across Northeast India (NER) based on terrain slope, elevation, soil composition, and aspect.
- **Backend Integration**: Consumed by `MLInferenceService` within FastAPI backend to compute 0–100 Risk Scores, Risk Levels (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`), and feature attribution explanations.
- **NOT Intended Use**: Primary automated emergency evacuation triggering without human geological verification or local telemetry confirmation.

---

## Factors & Feature Inputs
1. `elevation_meters`: Surface elevation in meters above sea level (SRTM 30m DEM).
2. `soil_clay_0_5cm`: Clay content in topsoil (0–5cm) in g/kg (ISRIC SoilGrids).
3. `soil_sand_0_5cm`: Sand content in topsoil (0–5cm) in g/kg (ISRIC SoilGrids).
4. `terrain_slope`: Terrain slope gradient in degrees ($0^\circ - 71^\circ$).
5. `terrain_aspect`: Compass direction of slope face in degrees ($0^\circ - 360^\circ$).

---

## Training & Validation Datasets
- **Training Dataset**: `data/processed/ml_ready_dataset.csv`
- **Positive Samples**: 10,631 records derived from GSI field-validated landslide records.
- **Negative Samples**: 10,000 spatially sampled background/negative locations ($\ge 2.0\text{ km}$ distance buffer).
- **Geographic Coverage**: All 8 Northeast India (NER) states (Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura).

---

## Performance & Multi-Dimensional Validation Metrics

| Validation Type | Accuracy | Precision | Recall | F1-Score | ROC-AUC | PR-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Random 80/20 Stratified Split** | **94.50%** | 90.98% | **99.15%** | 0.9489 | **0.9933** | **0.9931** |
| **Spatial Cell Isolation (`GroupKFold`)** | **94.29%** | 90.95% | **98.74%** | 0.9469 | **0.9928** | **0.9929** |
| **Spatial Block Holdout (Lat$\ge 26$, Lon$\ge 93$)** | **88.21%** | 85.89% | **85.24%** | 0.8557 | **0.9510** | **0.9414** |
| **Buffered Spatial Holdout (100km Buffer)** | **98.36%** | 98.50% | **99.62%** | 0.9906 | **0.9963** | **0.9994** |
| **Chronological Cutoff (May 2025)** | **91.84%** | 91.84% | **100.0%** | 0.9575 | **0.9782** | **0.9810** |
| **Brier Score (Calibration Metric)** | **0.0398** | — | — | — | — | — |

---

## Limitations & Operational Scope
1. **Static Susceptibility Baseline**: The XGBoost model evaluates static terrain susceptibility. Dynamic precipitation telemetry is scaled dynamically at the backend service API layer (`MLInferenceService`) as a **Dynamic Heuristic Risk Adjustment**.
2. **Confidence Semantics**: Backend confidence metric represents **Data Input Completeness** (`provided_inputs / total_expected_inputs`).
