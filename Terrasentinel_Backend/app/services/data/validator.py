"""Data Validation Module — Coordinate, Date, NER State Filtering & Duplicate Guard."""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)

NER_STATES = {
    "Arunachal Pradesh",
    "Assam",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Sikkim",
    "Tripura",
}

# Geographically plausible bounding box for North East India
NER_BOUNDS = {
    "min_lat": 21.0,
    "max_lat": 30.0,
    "min_lon": 88.0,
    "max_lon": 98.0,
}


class DataValidator:
    """Validates geospatial coordinates, dates, state boundaries, and record uniqueness."""

    @staticmethod
    def validate_coordinate(
        latitude: float | None, longitude: float | None, state: str | None = None
    ) -> dict[str, Any]:
        """Validate single coordinate pair for global bounds and regional plausibility."""
        if latitude is None or longitude is None:
            return {"valid": False, "reason": "MISSING_COORDINATES"}

        try:
            lat = float(latitude)
            lon = float(longitude)
        except (ValueError, TypeError):
            return {"valid": False, "reason": "NON_NUMERIC_COORDINATES"}

        if not (-90.0 <= lat <= 90.0):
            return {"valid": False, "reason": "LATITUDE_OUT_OF_RANGE"}

        if not (-180.0 <= lon <= 180.0):
            return {"valid": False, "reason": "LONGITUDE_OUT_OF_RANGE"}

        if state and isinstance(state, str) and state.strip() in NER_STATES:
            if not (NER_BOUNDS["min_lat"] <= lat <= NER_BOUNDS["max_lat"]):
                return {"valid": False, "reason": "LATITUDE_OUTSIDE_NER_BOUNDS"}
            if not (NER_BOUNDS["min_lon"] <= lon <= NER_BOUNDS["max_lon"]):
                return {"valid": False, "reason": "LONGITUDE_OUTSIDE_NER_BOUNDS"}

        return {"valid": True, "latitude": lat, "longitude": lon, "reason": "OK"}

    @staticmethod
    def validate_date(date_val: Any) -> datetime | None:
        """Attempt to parse date value into datetime, returning None if invalid."""
        if pd.isna(date_val) or date_val is None:
            return None

        if isinstance(date_val, datetime):
            return date_val

        try:
            parsed = pd.to_datetime(date_val, errors="coerce", dayfirst=True)
            if pd.notna(parsed):
                return parsed.to_pydatetime()
        except Exception:
            pass

        return None

    @staticmethod
    def filter_ner_records(df: pd.DataFrame) -> pd.DataFrame:
        """Filter dataset to strictly include records belonging to the 8 NER states."""
        if "state" not in df.columns:
            logger.warning("No 'state' column found in DataFrame for NER filtering.")
            return df

        cleaned_state = df["state"].astype(str).str.strip()
        filtered_df = df[cleaned_state.isin(NER_STATES)].copy()
        logger.info(f"NER Filter: {len(filtered_df)} / {len(df)} records retained.")
        return filtered_df

    @staticmethod
    def clean_and_validate_dataset(df: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, int]]:
        """Validate entire DataFrame, returning cleaned dataset and quality stats."""
        total_rows = len(df)
        stats = {
            "total_rows": total_rows,
            "rejected_rows": 0,
            "missing_coordinates": 0,
            "invalid_coordinates": 0,
            "missing_dates": 0,
            "duplicates_removed": 0,
            "valid_rows": 0,
        }

        if df.empty:
            return df, stats

        df_work = df.copy()

        # Coordinate Validation
        coord_results = [
            DataValidator.validate_coordinate(
                row.get("latitude"), row.get("longitude"), row.get("state")
            )
            for _, row in df_work.iterrows()
        ]

        df_work["coordinate_valid"] = [r["valid"] for r in coord_results]
        df_work["coord_reject_reason"] = [r["reason"] for r in coord_results]

        missing_coords = sum(1 for r in coord_results if r["reason"] == "MISSING_COORDINATES")
        invalid_coords = sum(1 for r in coord_results if not r["valid"] and r["reason"] != "MISSING_COORDINATES")

        stats["missing_coordinates"] = missing_coords
        stats["invalid_coordinates"] = invalid_coords

        # Date Validation
        if "history" in df_work.columns or "history_date" in df_work.columns:
            date_col = "history_date" if "history_date" in df_work.columns else "history"
            df_work["parsed_date"] = df_work[date_col].apply(DataValidator.validate_date)
            df_work["date_available"] = df_work["parsed_date"].notna()
            stats["missing_dates"] = int((~df_work["date_available"]).sum())
        else:
            df_work["date_available"] = False
            stats["missing_dates"] = total_rows

        # Filter valid coordinates
        df_valid = df_work[df_work["coordinate_valid"]].copy()

        # Deduplication
        dedup_subset = [c for c in ["state", "district", "slide_name", "latitude", "longitude", "parsed_date"] if c in df_valid.columns]
        if dedup_subset:
            before_dedup = len(df_valid)
            df_valid = df_valid.drop_duplicates(subset=dedup_subset, keep="first").copy()
            stats["duplicates_removed"] = before_dedup - len(df_valid)

        stats["valid_rows"] = len(df_valid)
        stats["rejected_rows"] = total_rows - len(df_valid)

        return df_valid, stats
