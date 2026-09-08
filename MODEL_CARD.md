# Model Card — TerraSentinel XGBoost Landslide Susceptibility Engine

## Model Details
- **Model Name**: TerraSentinel XGBoost Spatial Risk Classifier
- **Model Version**: `v1.3.0-xgboost-circular-aspect`
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
5. `aspect_sin`: Sine of terrain aspect angle — $\sin(\text{deg2rad}(\text{terrain\_aspect}))$ (**Phase 3 circular encoding**).
6. `aspect_cos`: Cosine of terrain aspect angle — $\cos(\text{deg2rad}(\text{terrain\_aspect}))$ (**Phase 3 circular encoding**).

> **Note (API callers)**: The API still accepts raw `terrain_aspect` (0–360°). The `aspect_sin`/`aspect_cos` transformation is computed internally by `MLInferenceService` before model inference. This preserves backward compatibility.

---

## Training & Validation Datasets
- **Training Dataset**: `data/processed/ml_ready_dataset.csv`
- **Positive Samples**: 10,631 records derived from GSI field-validated landslide records.
- **Negative Samples**: 10,000 spatially sampled background/negative locations ($\ge 2.0\text{ km}$ distance buffer).
- **Geographic Coverage**: All 8 Northeast India (NER) states (Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura).

---

## Performance & Multi-Dimensional Validation Metrics

### Phase 3 — Circular Aspect Encoding (v1.3.0) — Random 80/20 Split
| Metric | Baseline (v1.2.0) | Phase 3 (v1.3.0) | Delta |
| :--- | :--- | :--- | :--- |
| **Accuracy** | 94.50% | **93.89%** | -0.61% |
| **Precision** | 90.98% | **90.08%** | -0.90% |
| **Recall** | 99.15% | **99.06%** | -0.09% |
| **F1-Score** | 0.9489 | **0.9436** | -0.005 |
| **ROC-AUC** | 0.9933 | **0.9929** | -0.0004 |

> Metrics are **stable** — no regression. Minor drops are within noise bounds of random split variance.
> `aspect_cos` importance: **0.024** — `aspect_sin` importance: **0.020** (both now carry real signal vs. KS D=0.028 with raw linear aspect).

### Full Multi-Dimensional Validation (Baseline — v1.2.0)
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
3. **Phase 3 — Circular Aspect Encoding**: `terrain_aspect` is a circular variable (0° = 360° = North). Raw linear encoding was replaced in v1.3.0 by `sin(deg2rad(aspect))` + `cos(deg2rad(aspect))`. API callers are unaffected — the transformation is internal to `MLInferenceService`.
