import pandas as pd
import numpy as np
from pathlib import Path
from xgboost import XGBClassifier
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.metrics import classification_report, make_scorer, f1_score

def tune_model():
    print("--- Loading Dataset for Hyperparameter Tuning ---")
    df = pd.read_csv("data/processed/ml_ready_dataset.csv")
    
    # Drop leakage columns as usual
    cols_to_drop = ["Slide", "slide_id", "coordinate_valid", "date_available", "latitude", "longitude", "previous_landslides", "terrain_aspect"]
    cols_to_drop.extend([c for c in df.columns if c.startswith("movement_type_") or c.startswith("material_involved_")])
    cols_to_drop.extend([c for c in df.columns if "rainfall" in c or "moisture" in c or "ndvi" in c])
    
    # Feature Engineering
    df["aspect_sin"] = np.sin(np.radians(df["terrain_aspect"]))
    df["aspect_cos"] = np.cos(np.radians(df["terrain_aspect"]))
    
    existing_cols = [c for c in cols_to_drop if c in df.columns]
    X = df.drop(columns=existing_cols)
    
    expected_cols = ['elevation_meters', 'soil_clay_0_5cm', 'soil_sand_0_5cm', 'terrain_slope', 'aspect_sin', 'aspect_cos']
    X = X[expected_cols]
    y = df["Slide"]
    
    print(f"Features: {X.columns.tolist()}")
    
    # Define a focused, realistic grid search space
    # (We keep it tight so it completes within a few minutes)
    param_grid = {
        'max_depth': [4, 6, 8],
        'learning_rate': [0.01, 0.05, 0.1],
        'subsample': [0.7, 0.8, 1.0],
        'colsample_bytree': [0.7, 0.8, 1.0],
        'min_child_weight': [1, 3, 5],
        'scale_pos_weight': [2.0, 3.0, 4.0] # We keep this high to maintain the "Paranoid Mode" Recall
    }
    
    base_model = XGBClassifier(n_estimators=150, eval_metric="logloss", random_state=42, n_jobs=-1)
    
    # We use StratifiedKFold to ensure balanced class distributions in each fold
    cv_strategy = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    # We optimize for F1-score (which balances Precision and Recall) instead of raw Accuracy
    f1_scorer = make_scorer(f1_score)
    
    import joblib
    import contextlib
    from tqdm.auto import tqdm

    @contextlib.contextmanager
    def tqdm_joblib(tqdm_object):
        """Context manager to patch joblib to report into tqdm progress bar given as argument"""
        class TqdmBatchCompletionCallback(joblib.parallel.BatchCompletionCallBack):
            def __call__(self, *args, **kwargs):
                tqdm_object.update(n=self.batch_size)
                return super().__call__(*args, **kwargs)

        old_batch_callback = joblib.parallel.BatchCompletionCallBack
        joblib.parallel.BatchCompletionCallBack = TqdmBatchCompletionCallback
        try:
            yield tqdm_object
        finally:
            joblib.parallel.BatchCompletionCallBack = old_batch_callback

    print(f"\n--- Starting GridSearchCV with 5-Fold CV ---")
    
    grid_search = GridSearchCV(
        estimator=base_model,
        param_grid=param_grid,
        scoring=f1_scorer,
        cv=cv_strategy,
        verbose=0,
        n_jobs=-1
    )
    
    total_fits = len(grid_search.param_grid.get('max_depth', [])) * \
                 len(grid_search.param_grid.get('learning_rate', [])) * \
                 len(grid_search.param_grid.get('subsample', [])) * \
                 len(grid_search.param_grid.get('colsample_bytree', [])) * \
                 len(grid_search.param_grid.get('min_child_weight', [])) * \
                 len(grid_search.param_grid.get('scale_pos_weight', [])) * 5

    with tqdm_joblib(tqdm(desc="Tuning XGBoost", total=total_fits)):
        grid_search.fit(X, y)
    
    print("\n==================================================")
    print("🏆 GRID SEARCH RESULTS")
    print("==================================================")
    print(f"Best F1 Score: {grid_search.best_score_:.4f}")
    print(f"Best Parameters:")
    for k, v in grid_search.best_params_.items():
        print(f"  {k}: {v}")
        
    print("\nTo use these parameters, update train_xgboost.py with these exact values and run it!")

if __name__ == "__main__":
    tune_model()
