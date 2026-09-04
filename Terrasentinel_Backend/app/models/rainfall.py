"""
Rainfall observation model.
Stores point rainfall measurements from gauges, satellites, or numerical models.
"""

from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Float, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class RainfallObservation(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A single rainfall measurement at a geographic point."""

    __tablename__ = "rainfall_observations"

    # Observation time
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )

    # Coordinates (duplicate of geometry for convenience)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # Rainfall amount in millimetres
    rainfall_mm: Mapped[float] = mapped_column(Float, nullable=False)

    # Origin of data: IMD gauge, GPM satellite, WRF model, etc.
    source: Mapped[str | None] = mapped_column(String(256), nullable=True)

    # PostGIS Point geometry
    geometry: Mapped[object] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326),
        nullable=False,
    )

    __table_args__ = (
        Index("ix_rainfall_geometry", "geometry", postgresql_using="gist"),
    )

    def __repr__(self) -> str:
        return (
            f"<RainfallObservation id={self.id} "
            f"ts={self.timestamp} rainfall_mm={self.rainfall_mm}>"
        )
