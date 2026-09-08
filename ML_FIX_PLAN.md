# TerraSentinel ML Fix Plan

## Categorized Fix Matrix

### P0 — Completed Immediate Remediation
- [x] **Remove Target Leakage Column (`previous_landslides`)**: Excluded `previous_landslides` from ML training features in `scripts/ml_modeling/train_xgboost.py` and `scripts/data_processing/build_master_dataset.py`.
- [x] **Fix Negative Sample Fallback Slope Range**: Modified `scripts/feature_engineering/01_negative_sampling.py` to generate negative fallback slopes across the full $1.0^\circ - 45.0^\circ$ terrain distribution rather than capping at $15.0^\circ$.
- [x] **Re-Train XGBoost ML Model**: Re-trained model on clean 5-feature dataset (`models/model_features.json`). Re-trained weights saved to `models/xgboost_risk_model.json`.

### P1 — SIH Technical Demonstration Requirements
- [x] **Synchronize Backend Inference Service**: Updated `Terrasentinel_Backend/app/services/ml_inference.py` to blend static XGBoost spatial susceptibility with dynamic precipitation telemetry (`rainfall_7d_mm`).
- [x] **Synchronize Feature Assembly Contract**: Updated `Terrasentinel_Backend/app/services/data/model_input.py` to maintain exact 5-feature ordering matching `model_features.json`.
- [x] **Audit Backend Test Suite**: Verified 100% pass rate across all 99 pytest unit/integration tests (`pytest Terrasentinel_Backend/tests`).

### P2 — Recommended Model & Data Enhancements
- [ ] **Google Earth Engine (GEE) Batch Extraction**: Run remote GEE terrain extraction script with API authentication to replace fallback negative soil values with exact SoilGrids points.
- [ ] **Aspect Circular Encoding**: Convert `terrain_aspect` ($0^\circ - 360^\circ$) to sine/cosine circular features ($\sin(\text{aspect})$, $\cos(\text{aspect})$) to eliminate boundary discontinuity at $0^\circ / 360^\circ$.

### P3 — Future ML Research Directions (Post-SIH)
- [ ] **Spatio-Temporal Rainfall Dataset Matching**: Acquire gridded ERA5-Land or IMD 0.25-degree daily historical precipitation rasters to pair exact historical dates ($T-7\text{d}$ to $T$) for both landslide and non-landslide samples.
- [ ] **Probability Calibration**: Apply Isotonic Regression or Platt Scaling to calibrate XGBoost output probabilities into strict statistical frequency estimates.
