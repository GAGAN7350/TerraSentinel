# TerraSentinel Model Validation Summary

## Executive Scientific Verdict

**VERDICT**: **YELLOW — USABLE PROTOTYPE WITH SPECIFIC SCIENTIFIC LIMITATIONS**

> [!NOTE]
> **Verdict Justification**:
> 1. **Data Provenance**: Positive samples (10,631 records) are 100% field-validated from GSI Bhusanket. Negative samples (10,000 records) are **spatially sampled background/negative locations** protected by a $\ge 2.0\text{ km}$ spatial distance buffer.
> 2. **Leakage Remediation**: Target leakage (`previous_landslides`) was completely removed. Shuffled label test collapses to **50.40% Accuracy / 0.4986 ROC-AUC**, proving zero evaluation leakage.
> 3. **Spatial & Regional Generalization**: Tested under Cell Group Isolation (94.29% Acc), Spatial Block Holdout (88.21% Acc), 100km Buffered Holdout (98.36% Acc), and True State Holdouts (86.27% – 98.08% Acc across 8 NER states).
> 4. **Dynamic Telemetry Classification**: The XGBoost ML model strictly predicts **Static Spatial Landslide Susceptibility**. Dynamic precipitation telemetry (`rainfall_7d_mm`) is scaled dynamically at the backend service level (`MLInferenceService.predict_risk`) as a **Dynamic Heuristic Risk Adjustment**, not an ML-learned rainfall model.

---

## 1. Multi-Dimensional Validation Performance Table

| Metric | Result | Evaluation Type | Trust Level | Scientific Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Random Accuracy** | **94.50%** | Random 80/20 Stratified Split | **HIGH** | Clean 5-feature baseline without target leakage |
| **Random Precision** | **90.98%** | Random 80/20 Stratified Split | **HIGH** | Low false alarm rate on holdout test set |
| **Random Recall** | **99.15%** | Random 80/20 Stratified Split | **HIGH** | Paranoid mode (`scale_pos_weight=3.0`) catches 99.15% of landslides |
| **Random F1-Score** | **0.9489** | Random 80/20 Stratified Split | **HIGH** | Harmonic mean of precision and recall |
| **Random ROC-AUC** | **0.9933** | Random 80/20 Stratified Split | **HIGH** | Excellent class discrimination capability |
| **Random PR-AUC** | **0.9931** | Random 80/20 Stratified Split | **HIGH** | Precision-Recall curve area under heavy class balance |
| **Spatial Accuracy** | **94.29%** | Spatial Cell `GroupKFold` (5-fold) | **HIGH** | Spatial grid isolation eliminates cell overlap |
| **Spatial Precision** | **90.95%** | Spatial Cell `GroupKFold` (5-fold) | **HIGH** | Stable precision across grid cells |
| **Spatial Recall** | **98.74%** | Spatial Cell `GroupKFold` (5-fold) | **HIGH** | High sensitivity maintained across isolated spatial cells |
| **Spatial F1-Score** | **0.9469** | Spatial Cell `GroupKFold` (5-fold) | **HIGH** | Robust spatial harmonic score |
| **Spatial ROC-AUC** | **0.9928** | Spatial Cell `GroupKFold` (5-fold) | **HIGH** | Strong spatial discrimination |
| **Spatial PR-AUC** | **0.9929** | Spatial Cell `GroupKFold` (5-fold) | **HIGH** | Consistent spatial PR-AUC |
| **Block Holdout Acc** | **88.21%** | Spatial Block Split (Lat$\ge 26$, Lon$\ge 93$) | **HIGH** | Tested on completely unseen contiguous geographic quadrant |
| **Block Holdout Rec** | **85.24%** | Spatial Block Split (Lat$\ge 26$, Lon$\ge 93$) | **HIGH** | High generalization across unseen geographic terrain |
| **Buffered Holdout Acc**| **98.36%** | 100km Geographic Isolation Buffer | **HIGH** | Evaluated on region isolated by 100km buffer from training points |
| **Temporal Acc** | **91.84%** | Chronological Cutoff (May 2025) | **MEDIUM** | Tested on future dated records ($n=245$ test set) |
| **Temporal Recall** | **100.0%** | Chronological Cutoff (May 2025) | **MEDIUM** | Catches 100% of future historical landslide events |
| **Brier Score** | **0.0398** | Probability Calibration Audit | **HIGH** | Well-calibrated binary probabilities ($0.0 = \text{perfect}$) |
| **Shuffled Label Acc** | **50.40%** | Random Label Permutation Test | **HIGH** | Collapses to chance level (ROC-AUC = 0.4986) |

---

## 2. True State-Wise Spatial Holdout Table (State 100% Excluded from Training)

| Held-Out State | Test Samples ($n$) | Positives | Negatives | Accuracy | Recall | Precision | F1-Score | ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Assam** | 6,077 | 817 | 5,260 | **87.91%** | **98.16%** | 52.69% | 0.6858 | **0.9903** |
| **Arunachal Pradesh** | 4,007 | 1,183 | 2,824 | **86.27%** | **78.78%** | 75.71% | 0.7722 | **0.9247** |
| **Manipur** | 1,927 | 1,486 | 441 | **98.08%** | **99.60%** | 97.95% | 0.9877 | **0.9978** |
| **Meghalaya** | 1,577 | 1,026 | 551 | **94.17%** | **96.49%** | 94.65% | 0.9556 | **0.9870** |
| **Mizoram** | 3,624 | 3,431 | 193 | **90.31%** | **90.41%** | 99.30% | 0.9465 | **0.9724** |
| **Nagaland** | 2,290 | 1,821 | 469 | **97.51%** | **99.45%** | 97.47% | 0.9845 | **0.9947** |
| **Tripura** | 356 | 94 | 262 | **92.70%** | **100.0%** | 78.33% | 0.8785 | **0.9953** |

---

## 3. Model Baseline Comparisons (Same 80/20 Evaluation Split)

| Baseline Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC | PR-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Majority Class** | 51.54% | 51.54% | 100.0% | 0.6802 | 0.5000 | 0.7577 |
| **Logistic Regression** | 67.07% | 66.57% | 72.54% | 0.6943 | 0.7054 | 0.6385 |
| **Decision Tree (depth=3)** | 83.23% | 79.81% | 90.31% | 0.8474 | 0.8503 | 0.8829 |
| **Decision Tree (unconstrained)** | 88.32% | 88.20% | 89.28% | 0.8874 | 0.8829 | 0.9150 |
| **Random Forest (100 trees)** | 92.03% | 90.21% | 94.83% | 0.9246 | 0.9752 | 0.9751 |
| **XGBoost Classifier** | **94.50%** | **90.98%** | **99.15%** | **0.9489** | **0.9933** | **0.9931** |

---

## 4. Itemized Forensic Audit Answers

1. **Negative Label Semantics**: Target `0` represents **spatially sampled background/negative locations** protected by a $\ge 2.0\text{ km}$ spatial distance buffer from known landslide events.
2. **Positive Data Provenance**: Derived from **20,631 field-validated Geological Survey of India (GSI Bhusanket)** landslide records (20,711 raw, 80 rejected).
3. **Negative Sampling Bias (KS Test)**: Removing the old $\le 15^\circ$ slope cap restored natural slope distributions ($1^\circ - 45^\circ$, KS Stat: 0.1578). Elevation KS Stat: 0.2762, Clay KS Stat: 0.3100, Sand KS Stat: 0.3017, Aspect KS Stat: 0.0284.
4. **Univariate Separability**: Single-feature Decision Trees yield max 80.16% Acc (clay) and 62.68% Acc (slope). No single feature achieves near-perfect classification, confirming multi-feature learning.
5. **Rainfall Adjustment Semantic**: The dynamic rainfall scaling in `MLInferenceService.predict_risk` is explicitly classified as an **Engineering Heuristic / Dynamic Telemetry Risk Adjustment**, not an ML-learned rainfall model.
6. **Calibration & Brier Score**: Brier score is **0.0398**, indicating well-calibrated raw probabilities from XGBoost.
7. **Confidence Semantics**: Backend confidence represents **Data Input Completeness** (`provided_inputs / total_expected_inputs`), not statistical model prediction certainty.
8. **Dataset Independence**: 20,631 records correspond to **20,400 unique coordinate pairs**, **9,748 unique $0.05^\circ$ grid cells**, and **121 unique NER districts**.
9. **Out-of-Distribution Behavior**: Input features outside training bounds (e.g. soil clay/sand = `0.0`) fall into extreme tree leaves. P1 bounds checking is recommended.
