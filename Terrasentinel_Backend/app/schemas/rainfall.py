"""Pydantic schemas for Rainfall Observation endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import GeoJSONPoint, Latitude, Longitude


class RainfallCreate(BaseModel):
    source: str | None = Field(default=None, max_length=128)
    observation_time: datetime
    latitude: Latitude
    longitude: Longitude
    rainfall_mm: float = Field(..., ge=0.0)
    duration_minutes: int | None = Field(default=None, ge=0)
    cell_id: str | None = None


class RainfallUpdate(BaseModel):
    rainfall_mm: float | None = Field(default=None, ge=0.0)
    source: str | None = None


class RainfallResponse(BaseModel):
    id: uuid.UUID
    source: str | None
    observation_time: datetime
    latitude: float
    longitude: float
    rainfall_mm: float
    duration_minutes: int | None
    cell_id: str | None
    geometry: GeoJSONPoint | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
