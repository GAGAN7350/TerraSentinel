"""
Rainfall observation model — supports IMD, IMERG, WRF and future providers.
"""

from __future__ import annotations

from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Float, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class RainfallObservation(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A single rainfall measurement at a geographic point."""

    __tablename__ = "rainfall_observations"

    # Data source: "IMD_GAUGE", "GPM_IMERG", "WRF_MODEL", etc.
    source: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)

    # Observation timestamp (UTC)
    observation_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )

    # Coordinates
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # PostGIS Point geometry
    geom: Mapped[object] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326), nullable=False
    )

    # Measurement
    rainfall_mm: Mapped[float] = mapped_column(Float, nullable=False)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Grid cell reference (for satellite/model data)
    cell_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    __table_args__ = (
        Index("ix_rainfall_geom", "geom", postgresql_using="gist"),
    )

    def __repr__(self) -> str:
        return (
            f"<RainfallObservation id={self.id} "
            f"time={self.observation_time} mm={self.rainfall_mm}>"
        )
