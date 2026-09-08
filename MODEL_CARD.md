# Model Card — TerraSentinel XGBoost Landslide Susceptibility Engine

## Model Details
- **Model Name**: TerraSentinel XGBoost Spatial Risk Classifier
- **Model Version**: `v1.5.0-xgboost-ood-guardrails`
- **Model Type**: Gradient Boosted Decision Trees (`xgboost.XGBClassifier`) with exact TreeSHAP & OOD Guardrails
- **Developer**: TerraSentinel ML Engineering Team
- **License**: Open Source (SIH 2026 Project)

---

## Intended Use
- **Intended Purpose**: Estimation of static spatial landslide susceptibility across Northeast India (NER) based on terrain slope, elevation, soil composition, and aspect.
- **Backend Integration**: Consumed by `MLInferenceService` within FastAPI backend to compute 0–100 Risk Scores, Risk Levels (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`), raw probabilities, SHAP feature attributions, and Out-of-Distribution (OOD) guardrail checks.
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

## Explainability & SHAP Integration (Phase 6 — v1.4.0)
- **Method**: Exact TreeSHAP (`shap.TreeExplainer`) integrated directly into `MLInferenceService`.
- **Explainability Output**: Each risk prediction includes:
  - `shap_values`: Exact log-odds contribution per feature (`elevation_meters`, `soil_clay_0_5cm`, `soil_sand_0_5cm`, `terrain_slope`, `aspect_sin`, `aspect_cos`).
  - `shap_base_value`: Expected log-odds baseline (1.2249).
  - `explainability_method`: `"TreeSHAP (exact log-odds attribution)"`.
  - `primary_drivers`: Ranked human-readable driver list derived directly from top absolute SHAP values.

---

## Out-of-Distribution (OOD) Guardrails (Phase 7 — v1.5.0)
- **Domain Envelope**: Derived from training set distributions (`models/input_domain_bounds.json`).
- **OOD Evaluation**:
  - **Geographic Boundary**: Validates coordinates against the 8 NER states bounding box ($21.5^\circ - 29.5^\circ\text{N}$, $87.5^\circ - 97.5^\circ\text{E}$).
  - **Physical Limits**: Enforces feature ranges (e.g. elevation $16 - 4166\text{m}$, slope $0 - 71^\circ$).
  - **Statistical Outliers**: Detects features exceeding $3.5\sigma$ Z-score envelope.
- **Output Signals**:
  - `out_of_distribution`: `True` if any domain boundary or outlier threshold is violated.
  - `ood_reasons`: Detailed list of domain violations.
  - `confidence`: Dynamically penalized when input is marked OOD.

---

## Limitations & Operational Scope
1. **Static Susceptibility Baseline**: The XGBoost model evaluates static terrain susceptibility. Dynamic precipitation telemetry is scaled dynamically at the backend service API layer (`MLInferenceService`) as a **Dynamic Heuristic Risk Adjustment**.
2. **Confidence Semantics**: Backend confidence metric incorporates **Data Input Completeness** and **OOD Penalty**.
3. **Phase 3 — Circular Aspect Encoding**: `terrain_aspect` is a circular variable (0° = 360° = North). Raw linear encoding was replaced in v1.3.0 by `sin(deg2rad(aspect))` + `cos(deg2rad(aspect))`.
4. **Phase 6 — SHAP Explainability**: SHAP log-odds values quantify individual feature contributions to prediction score. Positive log-odds increase landslide susceptibility; negative log-odds decrease susceptibility.
5. **Phase 7 — OOD Guardrails**: Detects inputs outside Northeast India or outside training feature bounds to prevent silent model failure.
