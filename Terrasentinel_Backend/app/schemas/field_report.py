"""Pydantic schemas for Field Report endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.field_report import ReportSeverity, ReportType
from app.schemas.common import GeoJSONPoint, Latitude, Longitude


class FieldReportCreate(BaseModel):
    latitude: Latitude
    longitude: Longitude
    state: str | None = None
    district: str | None = None
    report_type: ReportType = ReportType.OTHER
    severity: ReportSeverity = ReportSeverity.LOW
    description: str | None = None
    observed_at: datetime


class FieldReportUpdate(BaseModel):
    description: str | None = None
    report_type: ReportType | None = None
    severity: ReportSeverity | None = None


class FieldReportResponse(BaseModel):
    id: uuid.UUID
    submitted_by: uuid.UUID | None
    latitude: float
    longitude: float
    geometry: GeoJSONPoint | None = None
    state: str | None
    district: str | None
    report_type: ReportType
    severity: ReportSeverity
    description: str | None
    observed_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
