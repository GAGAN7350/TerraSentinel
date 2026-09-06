"""Pydantic schemas for Risk Prediction endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models.risk import RiskLevel, RiskTrend
from app.schemas.common import GeoJSONPoint


class RiskPredictionCreate(BaseModel):
    prediction_time: datetime
    valid_until: datetime | None = None
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    risk_score: float = Field(..., ge=0.0, le=100.0)
    risk_level: RiskLevel
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    trend: RiskTrend | None = None
    model_version: str | None = Field(default=None, max_length=64)
    explanation: dict[str, Any] | None = None


class RiskPredictionResponse(BaseModel):
    id: uuid.UUID
    prediction_time: datetime
    valid_until: datetime | None
    latitude: float
    longitude: float
    geometry: GeoJSONPoint | None = None
    risk_score: float
    risk_level: RiskLevel
    confidence: float | None
    trend: RiskTrend | None
    model_version: str | None
    explanation: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RiskPredictRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    terrain_slope: float = Field(default=0.0, ge=0.0, le=90.0)
    terrain_aspect: float = Field(default=0.0, ge=0.0, le=360.0)
    elevation_meters: float = Field(default=0.0, ge=-500.0, le=9000.0)
    soil_clay_0_5cm: float = Field(default=0.0, ge=0.0)
    soil_sand_0_5cm: float = Field(default=0.0, ge=0.0)
    rainfall_7d_mm: float = Field(default=0.0, ge=0.0)
    rainfall_15d_mm: float = Field(default=0.0, ge=0.0)
    rainfall_30d_mm: float = Field(default=0.0, ge=0.0)
    soil_moisture_root_7d_avg: float = Field(default=0.0, ge=0.0, le=1.0)
    soil_moisture_prof_7d_avg: float = Field(default=0.0, ge=0.0, le=1.0)
    sentinel2_ndvi: float = Field(default=0.0, ge=-1.0, le=1.0)
    store_in_db: bool = Field(default=False, description="Persist prediction to PostGIS DB")


class RiskSimulationRequest(BaseModel):
    latitude: float = Field(default=27.33, ge=-90.0, le=90.0)
    longitude: float = Field(default=88.61, ge=-180.0, le=180.0)
    terrain_slope: float = Field(default=25.0, ge=0.0, le=90.0)
    terrain_aspect: float = Field(default=180.0, ge=0.0, le=360.0)
    elevation_meters: float = Field(default=1200.0, ge=-500.0, le=9000.0)
    soil_clay_0_5cm: float = Field(default=250.0, ge=0.0)
    soil_sand_0_5cm: float = Field(default=350.0, ge=0.0)
    rainfall_7d_mm: float = Field(default=120.0, ge=0.0)
    slope_delta_deg: float = Field(default=0.0, description="Additive slope change in degrees")
    rainfall_multiplier: float = Field(default=1.0, ge=0.0, description="Precipitation multiplier (e.g. 1.5 = +50%)")


class RiskPredictionResult(BaseModel):
    prediction_time: datetime
    latitude: float
    longitude: float
    risk_score: float
    risk_level: RiskLevel
    confidence: float
    trend: RiskTrend
    model_version: str
    explanation: dict[str, Any]
    saved_record_id: uuid.UUID | None = None


class RiskModelInfoResponse(BaseModel):
    model_version: str
    model_loaded: bool
    feature_names: list[str]
    total_features: int

