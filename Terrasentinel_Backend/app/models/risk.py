"""
Risk prediction model.
Stores ML-generated landslide risk predictions for geographic areas/points.
The ML service will write records here; the API reads them.
"""

import enum
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Enum, Float, Index, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"
    CRITICAL = "critical"


class RiskPrediction(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """ML-generated landslide risk score for a location."""

    __tablename__ = "risk_predictions"

    # Spatial location of the prediction
    geometry: Mapped[object] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326),
        nullable=False,
    )

    # Score 0–1
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)

    # Categorical label
    risk_level: Mapped[RiskLevel] = mapped_column(
        Enum(RiskLevel, name="risk_level"), nullable=False
    )

    # ML model confidence 0–1
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Model version for reproducibility
    model_version: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # When this prediction was generated
    prediction_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )

    # Feature importance or input factors (for explainability)
    contributing_factors: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Back-ref to alerts triggered by this prediction
    alerts: Mapped[list["Alert"]] = relationship(  # noqa: F821
        back_populates="risk_prediction", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_risk_predictions_geometry", "geometry", postgresql_using="gist"),
    )

    def __repr__(self) -> str:
        return (
            f"<RiskPrediction id={self.id} "
            f"risk_level={self.risk_level} score={self.risk_score}>"
        )
