"""Pydantic schemas for Alert endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.alert import AlertSeverity, AlertStatus


class AlertCreate(BaseModel):
    """Payload to create a new alert linked to a risk prediction."""

    risk_prediction_id: uuid.UUID
    severity: AlertSeverity
    message: str = Field(..., min_length=1)
    channel: str | None = Field(default=None, max_length=64)


class AlertUpdate(BaseModel):
    """Mutable fields of an alert (primarily status transitions)."""

    status: AlertStatus | None = None
    message: str | None = None


class AlertResponse(BaseModel):
    """Alert representation returned by the API."""

    id: uuid.UUID
    risk_prediction_id: uuid.UUID
    severity: AlertSeverity
    message: str
    status: AlertStatus
    channel: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
