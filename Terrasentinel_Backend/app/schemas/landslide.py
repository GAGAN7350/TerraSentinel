"""Pydantic schemas for Landslide endpoints."""

from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.common import GeoJSONPoint, Latitude, Longitude


class LandslideCreate(BaseModel):
    source: str | None = Field(default=None, max_length=128)
    external_id: str | None = None
    state: str | None = Field(default=None, max_length=128)
    district: str | None = Field(default=None, max_length=128)
    subdivision: str | None = None
    village: str | None = None
    slide_name: str | None = None
    slide_no: str | None = None
    nh_sh_location: str | None = None
    latitude: Latitude
    longitude: Longitude
    occurrence_date: date | None = None
    material_involved: str | None = None
    movement_type: str | None = None
    history: str | None = None


class LandslideUpdate(BaseModel):
    state: str | None = None
    district: str | None = None
    occurrence_date: date | None = None
    material_involved: str | None = None
    movement_type: str | None = None
    history: str | None = None
    source: str | None = None


class LandslideResponse(BaseModel):
    id: uuid.UUID
    source: str | None
    external_id: str | None
    state: str | None
    district: str | None
    subdivision: str | None
    village: str | None
    slide_name: str | None
    slide_no: str | None
    nh_sh_location: str | None
    latitude: float
    longitude: float
    geometry: GeoJSONPoint | None = None
    occurrence_date: date | None
    material_involved: str | None
    movement_type: str | None
    history: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LandslideFilters(BaseModel):
    state: str | None = None
    district: str | None = None
    source: str | None = None
    date_from: date | None = None
    date_to: date | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=50, ge=1, le=500)
