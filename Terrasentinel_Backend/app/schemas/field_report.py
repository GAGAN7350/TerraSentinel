"""Pydantic schemas for Field Report endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.field_report import ReportStatus
from app.schemas.common import GeoJSONPoint, Latitude, Longitude


class FieldReportCreate(BaseModel):
    """Payload submitted by a field officer."""

    user_id: uuid.UUID | None = None
    latitude: Latitude
    longitude: Longitude
    description: str | None = None
    media_url: str | None = Field(default=None, max_length=2048)
    report_time: datetime


class FieldReportUpdate(BaseModel):
    """Fields that can be updated on an existing field report."""

    description: str | None = None
    media_url: str | None = None
    status: ReportStatus | None = None


class FieldReportResponse(BaseModel):
    """Field report representation returned by the API."""

    id: uuid.UUID
    user_id: uuid.UUID | None
    latitude: float
    longitude: float
    geometry: GeoJSONPoint | None = None
    description: str | None
    media_url: str | None
    report_time: datetime
    status: ReportStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
