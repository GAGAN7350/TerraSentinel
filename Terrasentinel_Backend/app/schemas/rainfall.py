"""Pydantic schemas for Rainfall Observation endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import GeoJSONPoint, Latitude, Longitude


class RainfallCreate(BaseModel):
    """Payload required to record a new rainfall observation."""

    timestamp: datetime
    latitude: Latitude
    longitude: Longitude
    rainfall_mm: float = Field(..., ge=0.0, description="Rainfall amount in millimetres")
    source: str | None = Field(default=None, max_length=256)


class RainfallUpdate(BaseModel):
    """Mutable fields of a rainfall observation."""

    rainfall_mm: float | None = Field(default=None, ge=0.0)
    source: str | None = None


class RainfallResponse(BaseModel):
    """Rainfall observation representation returned by the API."""

    id: uuid.UUID
    timestamp: datetime
    latitude: float
    longitude: float
    rainfall_mm: float
    source: str | None
    geometry: GeoJSONPoint | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
