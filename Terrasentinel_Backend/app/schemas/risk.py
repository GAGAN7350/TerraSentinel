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
