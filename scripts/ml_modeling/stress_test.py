import sys
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, log_loss

# Add backend to path
backend_dir = Path("Terrasentinel_Backend").absolute()
sys.path.append(str(backend_dir))

from app.services.ml_inference import MLInferenceService

def test_overfitting():
    print("==================================================")
    print("TEST 1: OVERFITTING vs UNDERFITTING ANALYSIS")
    print("==================================================")
    
    # Load dataset
    df = pd.read_csv("data/processed/ml_ready_dataset.csv")
    y = df["Slide"]
    
    # Drop columns as per training logic
    cols_to_drop = ["Slide", "slide_id", "coordinate_valid", "date_available", "latitude", "longitude", "previous_landslides", "terrain_aspect"]
    cols_to_drop.extend(["cell_id", "state", "district", "history_date", "slide_name", "source", "history", "nh_sh_location"])
    cols_to_drop.extend([c for c in df.columns if c.startswith("movement_type_") or c.startswith("material_involved_")])
    cols_to_drop.extend([c for c in df.columns if "rainfall" in c or "moisture" in c or "ndvi" in c])
    existing_cols = [c for c in cols_to_drop if c in df.columns]
    
    # Feature Engineering
    df["aspect_sin"] = np.sin(np.radians(df["terrain_aspect"]))
    df["aspect_cos"] = np.cos(np.radians(df["terrain_aspect"]))
    
    X = df.drop(columns=existing_cols)
    
    # Reorder columns to exactly match model
    expected_cols = ['elevation_meters', 'soil_clay_0_5cm', 'soil_sand_0_5cm', 'terrain_slope', 'aspect_sin', 'aspect_cos']
    X = X[expected_cols]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    
    # Load model via XGBoost directly for raw metric evaluation
    from xgboost import XGBClassifier
    model = XGBClassifier()
    model.load_model("models/xgboost_risk_model.json")
    
    # Train metrics
    y_train_pred = model.predict(X_train)
    y_train_prob = model.predict_proba(X_train)[:, 1]
    train_acc = accuracy_score(y_train, y_train_pred)
    train_loss = log_loss(y_train, y_train_prob)
    
    # Test metrics
    y_test_pred = model.predict(X_test)
    y_test_prob = model.predict_proba(X_test)[:, 1]
    test_acc = accuracy_score(y_test, y_test_pred)
    test_loss = log_loss(y_test, y_test_prob)
    
    print(f"Training Accuracy: {train_acc:.4f}  |  Test Accuracy: {test_acc:.4f}")
    print(f"Training LogLoss:  {train_loss:.4f}  |  Test LogLoss:  {test_loss:.4f}")
    
    if train_acc - test_acc > 0.10:
        print("VERDICT: Model is severely OVERFITTING (memorizing training data).")
    elif train_acc < 0.70:
        print("VERDICT: Model is UNDERFITTING (too simple).")
    else:
        print("VERDICT: Model has excellent generalization. No severe overfitting detected.")


def stress_test_edge_cases():
    print("\n==================================================")
    print("TEST 2: BRUTAL EDGE CASE STRESS TESTING")
    print("==================================================")
    
    engine = MLInferenceService()
    
    test_cases = {
        "1. ALL ZEROS (Empty Plains)": {
            'latitude': 0.0, 'longitude': 0.0, 'rainfall_7d_mm': 0.0, 'elevation_meters': 0.0,
            'soil_clay_0_5cm': 0.0, 'soil_sand_0_5cm': 0.0, 'terrain_slope': 0.0, 'terrain_aspect': 0.0
        },
        "2. EXTREME CLIFF (90 Degree Slope)": {
            'latitude': 27.5, 'longitude': 88.5, 'rainfall_7d_mm': 100.0, 'elevation_meters': 2000.0,
            'soil_clay_0_5cm': 300.0, 'soil_sand_0_5cm': 300.0, 'terrain_slope': 90.0, 'terrain_aspect': 180.0
        },
        "3. DEATH VALLEY (Negative Elevation)": {
            'latitude': 27.5, 'longitude': 88.5, 'rainfall_7d_mm': 100.0, 'elevation_meters': -500.0,
            'soil_clay_0_5cm': 300.0, 'soil_sand_0_5cm': 300.0, 'terrain_slope': 10.0, 'terrain_aspect': 180.0
        },
        "4. BIBLICAL FLOOD (10,000mm Rain)": {
            'latitude': 27.5, 'longitude': 88.5, 'rainfall_7d_mm': 10000.0, 'elevation_meters': 1000.0,
            'soil_clay_0_5cm': 300.0, 'soil_sand_0_5cm': 300.0, 'terrain_slope': 10.0, 'terrain_aspect': 180.0
        },
        "5. MISSING DATA INJECTION (None values)": {
            'latitude': 27.5, 'longitude': 88.5, 'rainfall_7d_mm': None, 'elevation_meters': None,
            'soil_clay_0_5cm': 300.0, 'soil_sand_0_5cm': 300.0, 'terrain_slope': None, 'terrain_aspect': None
        },
        "6. TYPE CORRUPTION (Strings instead of Floats)": {
            'latitude': "27.5", 'longitude': "88.5", 'rainfall_7d_mm': "heavy_rain", 'elevation_meters': "high",
            'soil_clay_0_5cm': "300.0", 'soil_sand_0_5cm': 300.0, 'terrain_slope': "steep", 'terrain_aspect': 180.0
        }
    }
    
    for name, data in test_cases.items():
        print(f"\n--- {name} ---")
        try:
            res = engine.predict_risk(data)
            print(f"Status: SURVIVED. Risk Score: {res['risk_score']}/100")
            print(f"OOD Warning: {res['out_of_distribution']}")
            if res['out_of_distribution']:
                print(f"OOD Reasons: {res['ood_reasons']}")
            if res['confidence'] < 1.0:
                print(f"Confidence Dropped to: {res['confidence']*100}% due to data issues")
        except Exception as e:
            print(f"FATAL CRASH: {e}")

def test_spatial_leakage():
    print("\n==================================================")
    print("TEST 3: GEOGRAPHIC BLOCK HOLDOUT (SPATIAL LEAKAGE)")
    print("==================================================")
    
    df = pd.read_csv("data/processed/ml_ready_dataset.csv")
    
    # Define a massive spatial block for the test set (e.g., Longitude > 93)
    # This completely separates training mountains from test mountains geographically!
    train_df = df[df["longitude"] <= 93.0].copy()
    test_df = df[df["longitude"] > 93.0].copy()
    
    print(f"Training on Western Region (Lon <= 93): {len(train_df)} samples")
    print(f"Testing on Eastern Region  (Lon > 93):  {len(test_df)} samples")
    
    y_train = train_df["Slide"]
    y_test = test_df["Slide"]
    
    cols_to_drop = ["Slide", "slide_id", "coordinate_valid", "date_available", "latitude", "longitude", "previous_landslides", "terrain_aspect"]
    cols_to_drop.extend([c for c in df.columns if c.startswith("movement_type_") or c.startswith("material_involved_")])
    cols_to_drop.extend([c for c in df.columns if "rainfall" in c or "moisture" in c or "ndvi" in c])
    
    train_df["aspect_sin"] = np.sin(np.radians(train_df["terrain_aspect"]))
    train_df["aspect_cos"] = np.cos(np.radians(train_df["terrain_aspect"]))
    test_df["aspect_sin"] = np.sin(np.radians(test_df["terrain_aspect"]))
    test_df["aspect_cos"] = np.cos(np.radians(test_df["terrain_aspect"]))
    
    X_train = train_df.drop(columns=[c for c in cols_to_drop if c in train_df.columns])
    X_test = test_df.drop(columns=[c for c in cols_to_drop if c in test_df.columns])
    
    expected_cols = ['elevation_meters', 'soil_clay_0_5cm', 'soil_sand_0_5cm', 'terrain_slope', 'aspect_sin', 'aspect_cos']
    X_train = X_train[expected_cols]
    X_test = X_test[expected_cols]
    
    from xgboost import XGBClassifier
    # We train a brand new model just for this test so it hasn't seen the East!
    spatial_model = XGBClassifier(
        n_estimators=300, max_depth=6, learning_rate=0.05,
        subsample=0.8, colsample_bytree=0.8, eval_metric="logloss",
        random_state=42, scale_pos_weight=3.0, n_jobs=-1
    )
    spatial_model.fit(X_train, y_train)
    
    y_pred = spatial_model.predict(X_test)
    y_prob = spatial_model.predict_proba(X_test)[:, 1]
    
    from sklearn.metrics import roc_auc_score, f1_score, recall_score
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    print(f"Spatial Holdout Accuracy: {acc:.4f} (Random was 0.7963)")
    print(f"Spatial Holdout ROC-AUC:  {auc:.4f} (Random was 0.8713)")
    print(f"Spatial Holdout Recall:   {rec:.4f} (Random was 0.9543)")
    print(f"Spatial Holdout F1-Score: {f1:.4f} (Random was 0.8289)")
    
    if auc < 0.60:
        print("VERDICT: COLLAPSE DETECTED! The model was severely exploiting spatial leakage.")
    elif auc >= 0.80:
        print("VERDICT: INCREDIBLE! The model genuinely generalized the physics of landslides to entirely unseen geography!")
    else:
        print("VERDICT: Moderate drop. Spatial leakage was present but the core physics hold up.")

if __name__ == "__main__":
    test_overfitting()
    stress_test_edge_cases()
    test_spatial_leakage()
    test_overfitting()
    stress_test_edge_cases()
