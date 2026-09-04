"""Pydantic schemas for Risk Prediction endpoints."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models.risk import RiskLevel
from app.schemas.common import GeoJSONPoint


class RiskPredictionCreate(BaseModel):
    """
    Payload to store a risk prediction result produced by the ML service.
    ML workers write to this endpoint; the API reads predictions.
    """

    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    risk_score: float = Field(..., ge=0.0, le=1.0)
    risk_level: RiskLevel
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    model_version: str | None = Field(default=None, max_length=64)
    prediction_time: datetime
    contributing_factors: dict[str, Any] | None = None


class RiskPredictionResponse(BaseModel):
    """Risk prediction representation returned by the API."""

    id: uuid.UUID
    geometry: GeoJSONPoint | None = None
    risk_score: float
    risk_level: RiskLevel
    confidence: float | None
    model_version: str | None
    prediction_time: datetime
    contributing_factors: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
