"""Master Dataset Processing Script — Assembles spatial grid cells, temporal guards, and model-ready features."""

import sys
from pathlib import Path
import pandas as pd

# Add Terrasentinel_Backend to sys.path so we can import app modules
backend_path = Path(__file__).resolve().parents[2] / "Terrasentinel_Backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.services.data.grid import SpatialGrid
from app.services.data.validator import DataValidator, NER_STATES
from app.services.data.model_input import FeatureAssemblyService

GSI_INPUT = Path("data/processed/gsi_ner_landslides_complete.csv")
MASTER_OUTPUT = Path("data/processed/ml_ready_dataset.csv")


def compute_previous_landslides_feature(df: pd.DataFrame) -> pd.Series:
    """Compute count of historical landslides in same spatial cell occurring strictly BEFORE date T.
    
    Prevents post-event data leakage by excluding current event T and any future events.
    """
    df_sorted = df.sort_values(by="history_date").reset_index(drop=True)
    prev_counts = []

    for idx, row in df_sorted.iterrows():
        cell_id = row["cell_id"]
        current_date = row["history_date"]

        if pd.isna(current_date):
            prev_counts.append(0)
            continue

        # Count prior landslides in same cell strictly before current_date
        prior_slides = df_sorted[
            (df_sorted["cell_id"] == cell_id) &
            (df_sorted["history_date"] < current_date) &
            (df_sorted["Slide"] == 1)
        ]
        prev_counts.append(len(prior_slides))

    df_sorted["previous_landslides"] = prev_counts
    # Re-sort back to original index
    df_result = df_sorted.sort_index()
    return df_result["previous_landslides"]


def build_master_dataset() -> pd.DataFrame:
    """Build model-ready dataset with spatial alignment, temporal guards, and feature assembly."""
    print("Building TerraSentinel Master ML Dataset...")
    grid = SpatialGrid(resolution_deg=0.05)
    assembly = FeatureAssemblyService()

    if not GSI_INPUT.exists():
        raise FileNotFoundError(f"Required input dataset not found: {GSI_INPUT}")

    df_gsi = pd.read_csv(GSI_INPUT)
    print(f"Loaded {len(df_gsi)} raw GSI positive records.")

    # 1. Clean & validate coordinates and dates
    df_valid, stats = DataValidator.clean_and_validate_dataset(df_gsi)
    print(f"Validated records: {stats['valid_rows']} valid, {stats['rejected_rows']} rejected.")

    # Filter to NER states
    df_valid = DataValidator.filter_ner_records(df_valid)

    # 2. Assign spatial cell IDs
    df_valid["cell_id"] = [
        grid.get_cell_id(lat, lon)
        for lat, lon in zip(df_valid["latitude"], df_valid["longitude"])
    ]

    # Ensure Target label is set for positives
    df_valid["Slide"] = 1
    df_valid["history_date"] = pd.to_datetime(df_valid["history_date"], errors="coerce")

    # 3. Compute previous_landslides without leakage
    df_valid["previous_landslides"] = compute_previous_landslides_feature(df_valid)

    # 4. Fill required model features from existing dataset or realistic fallback
    for col in assembly.feature_names:
        if col not in df_valid.columns:
            print(f"Initializing missing feature '{col}' with default baseline...")
            df_valid[col] = 0.0

    # Ensure deterministic column ordering matching models/model_features.json
    final_cols = [
        "slide_id",
        "cell_id",
        "latitude",
        "longitude",
        "state",
        "district",
        "history_date",
        "previous_landslides",
        "Slide",
    ] + assembly.feature_names

    # Retain extra environmental columns if present in dataset
    extra_cols = [
        c for c in [
            "rainfall_7d_mm", "rainfall_15d_mm", "rainfall_30d_mm",
            "soil_moisture_root_7d_avg", "soil_moisture_prof_7d_avg", "sentinel2_ndvi"
        ] if c in df_valid.columns and c not in final_cols
    ]

    master_df = df_valid[final_cols + extra_cols].copy()

    # Save to data/processed/ml_ready_dataset.csv
    MASTER_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    master_df.to_csv(MASTER_OUTPUT, index=False)
    print(f"Successfully generated master dataset with {len(master_df)} records -> {MASTER_OUTPUT}")

    return master_df


if __name__ == "__main__":
    build_master_dataset()
