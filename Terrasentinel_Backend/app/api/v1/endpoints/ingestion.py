"""Data Ingestion Status Endpoint — Admin Protected Dataset Provenance & Ingestion Status."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import get_current_user
from app.models.user import User, UserRole

router = APIRouter()

REPORT_JSON = Path("data/processed/data_quality_report.json")


class IngestionStatusResponse(BaseModel):
    dataset_name: str
    status: str
    last_run: str
    processing_version: str
    total_records: int
    valid_coordinates: int
    rejected_coordinates: int
    missing_features_pct: dict[str, str]
    target_distribution: dict[str, int]


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensure endpoint is restricted strictly to ADMIN role."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to ADMIN users only.",
        )
    return current_user


@router.get("/status", response_model=IngestionStatusResponse)
async def get_ingestion_status(
    admin_user: User = Depends(require_admin),
) -> IngestionStatusResponse:
    """Retrieve data quality report and ingestion statistics (ADMIN only)."""
    # Locate report file
    rep_path = REPORT_JSON
    if not rep_path.exists():
        base = Path(__file__).resolve().parents[4]
        rep_path = base / "data" / "processed" / "data_quality_report.json"

    if not rep_path.exists():
        return IngestionStatusResponse(
            dataset_name="gsi_ner_landslides_complete",
            status="NOT_RUN",
            last_run="NEVER",
            processing_version="v3.0.0-phase3",
            total_records=0,
            valid_coordinates=0,
            rejected_coordinates=0,
            missing_features_pct={},
            target_distribution={},
        )

    try:
        with open(rep_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        return IngestionStatusResponse(
            dataset_name=data.get("dataset_name", "gsi_ner_landslides_complete"),
            status="COMPLETED",
            last_run=data.get("generated_at", "UNKNOWN"),
            processing_version=data.get("processing_version", "v3.0.0-phase3"),
            total_records=data.get("records", {}).get("total_rows", 0),
            valid_coordinates=data.get("records", {}).get("valid_coordinates", 0),
            rejected_coordinates=data.get("records", {}).get("rejected_coordinates", 0),
            missing_features_pct=data.get("missing_features_pct", {}),
            target_distribution=data.get("target_distribution", {}),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading ingestion report: {e}",
        )
