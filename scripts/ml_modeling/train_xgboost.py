import json
import math
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    roc_auc_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)
from xgboost import XGBClassifier

DATA_PATH = Path("data/processed/ml_ready_dataset.csv")
MODELS_DIR = Path("models")
MODEL_OUTPUT_PATH = MODELS_DIR / "xgboost_risk_model.json"

def main():
    print(f"--- Step 1: Loading Dataset from {DATA_PATH} ---")
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")
    
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded dataset successfully. Shape: {df.shape}")

    # --- Phase 3: Circular Aspect Encoding ---
    # terrain_aspect is a CIRCULAR variable (0° == 360° == North).
    # Raw linear encoding destroys this geometry. We replace it with sin/cos projections.
    print("\n--- Phase 3: Computing circular aspect encoding (sin/cos) ---")
    df["aspect_sin"] = np.sin(np.deg2rad(df["terrain_aspect"]))
    df["aspect_cos"] = np.cos(np.deg2rad(df["terrain_aspect"]))
    print(f"  aspect_sin range: [{df['aspect_sin'].min():.4f}, {df['aspect_sin'].max():.4f}]")
    print(f"  aspect_cos range: [{df['aspect_cos'].min():.4f}, {df['aspect_cos'].max():.4f}]")

    print("\n--- Step 2: Preparing Features (X) and Target (y) ---")
    if "Slide" not in df.columns:
        raise ValueError("Target column 'Slide' not found in dataset!")

    y = df["Slide"]
    
    # Columns to explicitly drop from features (metadata and text columns)
    cols_to_drop = [
        "Slide", "slide_id", "cell_id", "state", "district", "history_date",
        "coordinate_valid", "date_available"
    ]
    
    # We must also drop ALL movement_type and material_involved columns because they are DATA LEAKAGE.
    leaky_cols = [c for c in df.columns if c.startswith("movement_type_") or c.startswith("material_involved_")]
    cols_to_drop.extend(leaky_cols)
    
    # Drop Latitude and Longitude to prevent the model from just memorizing the map.
    # We want it to learn the physics (Slope + Rain), not just the coordinates!
    cols_to_drop.extend(["latitude", "longitude"])

    # Drop raw terrain_aspect — replaced by aspect_sin and aspect_cos (Phase 3 circular encoding).
    # Raw 0-360° linear representation is geometrically incorrect for a circular variable.
    cols_to_drop.append("terrain_aspect")
    
    # DROP TEMPORAL FEATURES (Rainfall, Moisture, NDVI)
    # The negative samples didn't have dates, so their rainfall was imputed using the median of the landslides!
    # This confused the model. We will drop them to create a pure Spatial Susceptibility Model based on Terrain/Soil.
    temporal_cols = [c for c in df.columns if "rainfall" in c or "moisture" in c or "ndvi" in c]
    cols_to_drop.extend(temporal_cols)
    
    existing_cols_to_drop = [c for c in cols_to_drop if c in df.columns]
    print(f"Dropping columns: {existing_cols_to_drop}")
    
    X = df.drop(columns=existing_cols_to_drop)
    print(f"Features shape: {X.shape}, Target shape: {y.shape}")
    print(f"Class distribution:\n{y.value_counts()}")

    print("\n--- Step 3: Splitting Data into Train/Test Sets (80/20) ---")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train samples: {len(X_train)} | Test samples: {len(X_test)}")

    # --- Phase 4: Explicit Median Imputation (train-set only) ---
    # PROBLEM: 271 NaN soil values are 100% in the positive class (GSI historical data gap).
    # XGBoost natively routes NaN samples to a learned default branch, silently using
    # missingness as an implicit class signal (audit: 99.74% prob on all 271 NaN rows).
    # This is opaque and unauditable. We replace it with explicit, transparent imputation.
    #
    # STRATEGY: Median imputation fitted on X_train only.
    # - Scientifically neutral: does not encode class information into imputed values.
    # - Train-only fitting: prevents test-set leakage.
    # - Saved to models/imputation_params.json: makes inference reproducible and auditable.
    #
    # REJECTED: Missingness indicator features (would bias inference: NaN at runtime
    # means 'user did not supply data', NOT 'this is a landslide site').
    print("\n--- Phase 4: Explicit Median Imputation (fitted on train set only) ---")
    soil_cols_with_nan = [c for c in ["soil_clay_0_5cm", "soil_sand_0_5cm"] if c in X_train.columns]

    imputation_params = {}
    for col in soil_cols_with_nan:
        train_nan_count = X_train[col].isnull().sum()
        test_nan_count  = X_test[col].isnull().sum()
        train_median    = float(X_train[col].median())
        imputation_params[col] = {"strategy": "median", "value": train_median}
        print(f"  {col}: train NaN={train_nan_count}, test NaN={test_nan_count}, train_median={train_median:.2f}")
        X_train[col] = X_train[col].fillna(train_median)
        X_test[col]  = X_test[col].fillna(train_median)

    # Verify no NaNs remain
    remaining_nan_train = X_train.isnull().sum().sum()
    remaining_nan_test  = X_test.isnull().sum().sum()
    print(f"  Remaining NaN after imputation — train: {remaining_nan_train}, test: {remaining_nan_test}")
    assert remaining_nan_train == 0, "NaN remains in X_train after imputation!"
    assert remaining_nan_test  == 0, "NaN remains in X_test after imputation!"

    print("\n--- Step 4: Training XGBClassifier (Paranoid Mode for High Recall) ---")
    print(f"  Final feature set ({len(X.columns)}): {list(X.columns)}")
    print(f"  NaN count in X_train: {X_train.isnull().sum().sum()} (must be 0)")
    model = XGBClassifier(
        n_estimators=300,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.7,
        colsample_bytree=1.0,
        min_child_weight=1,
        eval_metric="logloss",
        random_state=42,
        scale_pos_weight=2.0,  # Optimized for balanced F1-score
        n_jobs=-1
    )
    
    model.fit(
        X_train, 
        y_train, 
        eval_set=[(X_train, y_train), (X_test, y_test)], 
        verbose=50
    )
    print("Model training complete.")

    print("\n--- Step 5: Model Evaluation on Test Set ---")
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_prob)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    print(f"Test Accuracy:       {acc:.4f} ({acc * 100:.2f}%)")
    print(f"Test ROC-AUC:        {roc_auc:.4f}")
    print(f"Test Precision:      {prec:.4f}")
    print(f"Test Recall:         {rec:.4f}")
    print(f"Test F1-Score:       {f1:.4f}")
    print("\nConfusion Matrix:")
    print(cm)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, digits=4))

    # Feature importances
    feature_importances = pd.Series(model.feature_importances_, index=X.columns)
    top_features = feature_importances.sort_values(ascending=False).head(15)
    print(f"\nTop {len(top_features)} Most Important Features:")
    for feat, val in top_features.items():
        print(f"  - {feat}: {val:.4f}")

    print(f"\n--- Step 6: Saving Model to {MODEL_OUTPUT_PATH} ---")
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model.save_model(str(MODEL_OUTPUT_PATH))
    print(f"Model saved successfully to {MODEL_OUTPUT_PATH}")

    # Also save feature list for downstream inference
    feature_metadata_path = MODELS_DIR / "model_features.json"
    with open(feature_metadata_path, "w") as f:
        json.dump(list(X.columns), f, indent=2)
    print(f"Feature names saved to {feature_metadata_path}")
    print(f"  Model features: {list(X.columns)}")

    # Save imputation parameters for inference reproducibility.
    # The inference layer MUST apply the same imputation before calling the model.
    imputation_path = MODELS_DIR / "imputation_params.json"
    with open(imputation_path, "w") as f:
        json.dump(imputation_params, f, indent=2)
    print(f"Imputation params saved to {imputation_path}")
    print(f"  {imputation_params}")

    return {
        "accuracy": acc,
        "roc_auc": roc_auc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1
    }

if __name__ == "__main__":
    main()
