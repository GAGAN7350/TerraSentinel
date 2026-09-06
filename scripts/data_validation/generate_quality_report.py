"""Data Quality & Provenance Report Generator for TerraSentinel Phase 3."""

import json
from datetime import datetime, timezone
from pathlib import Path
import pandas as pd

DATASET_PATH = Path("data/processed/ml_ready_dataset.csv")
REPORT_JSON = Path("data/processed/data_quality_report.json")
REPORT_MD = Path("data/processed/data_quality_report.md")


def generate_quality_report() -> dict:
    """Generate detailed machine-readable data quality report."""
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)

    total_rows = len(df)
    valid_coords = int((df["latitude"].between(-90, 90) & df["longitude"].between(-180, 180)).sum()) if total_rows > 0 else 0

    state_counts = df["state"].value_counts().to_dict() if "state" in df.columns else {}

    # Temporal range
    if "history_date" in df.columns:
        dates = pd.to_datetime(df["history_date"], errors="coerce").dropna()
        earliest = str(dates.min().date()) if len(dates) > 0 else None
        latest = str(dates.max().date()) if len(dates) > 0 else None
    else:
        earliest, latest = None, None

    # Missing value percentages per feature
    missing_percentages = {}
    feature_cols = [
        "elevation_meters", "terrain_slope", "terrain_aspect",
        "soil_clay_0_5cm", "soil_sand_0_5cm", "rainfall_7d_mm", "soil_moisture_root_7d_avg"
    ]
    for col in feature_cols:
        if col in df.columns:
            missing_pct = round((df[col].isna().sum() / total_rows) * 100.0, 2) if total_rows > 0 else 0.0
            missing_percentages[col] = f"{missing_pct}%"
        else:
            missing_percentages[col] = "100.0% (Column Missing)"

    # Target class balance
    if "Slide" in df.columns:
        positives = int((df["Slide"] == 1).sum())
        negatives = int((df["Slide"] == 0).sum())
    else:
        positives, negatives = total_rows, 0

    report = {
        "dataset_name": "gsi_ner_landslides_complete",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "processing_version": "v3.0.0-phase3",
        "records": {
            "total_rows": total_rows,
            "valid_coordinates": valid_coords,
            "rejected_coordinates": total_rows - valid_coords,
        },
        "geographic_coverage": {
            "states_count": len(state_counts),
            "states_breakdown": state_counts,
            "min_latitude": float(df["latitude"].min()) if total_rows > 0 else None,
            "max_latitude": float(df["latitude"].max()) if total_rows > 0 else None,
            "min_longitude": float(df["longitude"].min()) if total_rows > 0 else None,
            "max_longitude": float(df["longitude"].max()) if total_rows > 0 else None,
        },
        "temporal_coverage": {
            "earliest_event": earliest,
            "latest_event": latest,
        },
        "missing_features_pct": missing_percentages,
        "target_distribution": {
            "positive_samples": positives,
            "negative_samples": negatives,
        },
    }

    # Save JSON report
    REPORT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(REPORT_JSON, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    # Print human-readable report summary
    print("\n" + "=" * 60)
    print("TERRASENTINEL PHASE 3 — DATA QUALITY REPORT")
    print("=" * 60)
    print(f"Dataset:              {report['dataset_name']}")
    print(f"Total Records:        {report['records']['total_rows']}")
    print(f"Valid Coordinates:    {report['records']['valid_coordinates']}")
    print(f"NER States Covered:   {report['geographic_coverage']['states_count']}")
    print(f"Date Range:           {earliest} to {latest}")
    print(f"Target Distribution:  {positives} Positives / {negatives} Negatives")
    print(f"Report saved to:      {REPORT_JSON}")
    print("=" * 60 + "\n")

    return report


if __name__ == "__main__":
    generate_quality_report()
