"""Pydantic schemas for Alert endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.alert import AlertSeverity, AlertStatus
from app.schemas.common import GeoJSONPoint


class AlertCreate(BaseModel):
    alert_type: str | None = Field(default=None, max_length=64)
    severity: AlertSeverity
    title: str = Field(..., min_length=1, max_length=256)
    message: str = Field(..., min_length=1)
    state: str | None = None
    district: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    risk_prediction_id: uuid.UUID | None = None
    issued_at: datetime | None = None
    expires_at: datetime | None = None


class AlertUpdate(BaseModel):
    status: AlertStatus | None = None
    message: str | None = None
    expires_at: datetime | None = None


class AlertResponse(BaseModel):
    id: uuid.UUID
    alert_type: str | None
    severity: AlertSeverity
    title: str
    message: str
    state: str | None
    district: str | None
    latitude: float | None
    longitude: float | None
    geometry: GeoJSONPoint | None = None
    risk_prediction_id: uuid.UUID | None
    status: AlertStatus
    issued_at: datetime | None
    expires_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
