"""
Risk prediction model — storage contract for the future ML service.
risk_score: 0–100, risk_level: LOW/MODERATE/HIGH/CRITICAL
"""

from __future__ import annotations

import enum
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Enum, Float, Index, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RiskTrend(str, enum.Enum):
    STABLE = "STABLE"
    INCREASING = "INCREASING"
    DECREASING = "DECREASING"


class RiskPrediction(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """ML-generated landslide risk score for a location (storage contract)."""

    __tablename__ = "risk_predictions"

    prediction_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    valid_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geom: Mapped[object] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326), nullable=False
    )

    # Score 0–100
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[RiskLevel] = mapped_column(
        Enum(RiskLevel, name="risk_level"), nullable=False
    )
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    trend: Mapped[RiskTrend | None] = mapped_column(
        Enum(RiskTrend, name="risk_trend"), nullable=True
    )
    model_version: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # Structured explainability JSON
    explanation: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    alerts: Mapped[list[Alert]] = relationship(  # noqa: F821
        back_populates="risk_prediction", lazy="select"
    )

    __table_args__ = (
        Index("ix_risk_predictions_geom", "geom", postgresql_using="gist"),
    )

    def __repr__(self) -> str:
        return (
            f"<RiskPrediction id={self.id} "
            f"level={self.risk_level} score={self.risk_score}>"
        )
