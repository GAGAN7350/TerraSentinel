# Model Card – TerraSentinel XGBoost Landslide Susceptibility Engine

## Model Details
- **Model Name**: TerraSentinel XGBoost Spatial Risk Classifier
- **Model Version**: `v2.0.0-xgboost-calibrated`
- **Model Type**: Gradient Boosted Decision Trees (`xgboost.XGBClassifier`) with TreeSHAP, OOD Guardrails & Platt Scaling Probability Calibration
- **Developer**: TerraSentinel ML Engineering Team
- **License**: Open Source (SIH 2026 Project)

---

## Intended Use
- **Intended Purpose**: Estimation of static spatial landslide susceptibility across Northeast India (NER) based on terrain slope, elevation, soil composition, and aspect.
- **Backend Integration**: Consumed by `MLInferenceService` within FastAPI backend to compute 0–100 Risk Scores, Risk Levels, raw probabilities, calibrated posterior probabilities, SHAP feature attributions, and Out-of-Distribution (OOD) guardrail checks.
- **NOT Intended Use**: Primary automated emergency evacuation triggering without human geological verification or local telemetry confirmation.

---

## Factors & Feature Inputs
1. `elevation_meters`: Surface elevation in meters above sea level (SRTM 30m DEM).
2. `soil_clay_0_5cm`: Clay content in topsoil (0–5cm) in g/kg (ISRIC SoilGrids).
3. `soil_sand_0_5cm`: Sand content in topsoil (0–5cm) in g/kg (ISRIC SoilGrids).
4. `terrain_slope`: Terrain slope gradient in degrees.
5. `aspect_sin`: Sine of terrain aspect angle.
6. `aspect_cos`: Cosine of terrain aspect angle.

---

## Performance Metrics (Tuned & Audited)

Following a rigorous spatial data audit, all synthetic data leakage was removed, and negative samples were extracted directly from Google Earth Engine. The model was then optimized via GridSearchCV for the `f1_score`.

### Random 80/20 Split Evaluation
*   **Accuracy:** `80.42%`
*   **ROC-AUC:** `0.8731`
*   **Precision:** `75.30%`
*   **Recall:** `92.49%`
*   **F1-Score:** `0.8302`

> **Note on Performance:** The model explicitly prioritizes landslide detection sensitivity (Recall) over raw Accuracy, utilizing a `scale_pos_weight` to aggressively penalize False Negatives (Paranoid Mode).

### Geographic Block Holdout (Spatial Leakage Test)
To prove the model learned universal physics and did not memorize spatial coordinates, it was trained exclusively on Western NER (Lon <= 93) and tested exclusively on Eastern NER (Lon > 93):
*   **Spatial Holdout ROC-AUC:** `0.7572`
*   **Spatial Holdout Recall:** `0.9624`
*   **Verdict:** Moderate expected drop in AUC, but Recall held strong at 96%, proving generalized physical terrain learning across entirely unseen geography.

---

## Explainability & SHAP Integration
- **Reliability Metrics**: Expected Calibration Error (ECE) minimized via Platt Scaling.
- **API Expository Field**: `calibrated_probability` exposed alongside `raw_probability`.
- **SHAP**: Log-odds values quantify individual feature contributions to prediction score.

---

## Limitations & Operational Scope
1. **Static Susceptibility Baseline**: The XGBoost model evaluates static terrain susceptibility. Dynamic precipitation telemetry is scaled dynamically at the backend service API layer as a **Dynamic Heuristic Risk Adjustment**.
2. **Confidence Semantics**: Backend confidence metric incorporates **Data Input Completeness** and **OOD Penalty**.
3. **OOD Guardrails**: Detects inputs outside Northeast India or outside training feature bounds.
