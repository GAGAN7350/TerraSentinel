"""Pydantic schemas for Landslide event endpoints."""

import uuid
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, Field, model_validator

from app.schemas.common import GeoJSONPoint, Latitude, Longitude


class LandslideCreate(BaseModel):
    """Payload required to record a new landslide event."""

    external_id: str | None = None
    state: str | None = Field(default=None, max_length=128)
    district: str | None = Field(default=None, max_length=128)
    latitude: Latitude
    longitude: Longitude
    event_date: date | None = None
    source: str | None = Field(default=None, max_length=256)
    metadata_: dict[str, Any] | None = Field(default=None, alias="metadata")

    model_config = {"populate_by_name": True}


class LandslideUpdate(BaseModel):
    """Fields that can be patched on an existing landslide record."""

    state: str | None = None
    district: str | None = None
    event_date: date | None = None
    source: str | None = None
    metadata_: dict[str, Any] | None = Field(default=None, alias="metadata")

    model_config = {"populate_by_name": True}


class LandslideResponse(BaseModel):
    """Landslide representation returned by the API."""

    id: uuid.UUID
    external_id: str | None
    state: str | None
    district: str | None
    latitude: float
    longitude: float
    event_date: date | None
    source: str | None
    metadata: dict[str, Any] | None = Field(default=None, alias="metadata_")
    geometry: GeoJSONPoint | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}
