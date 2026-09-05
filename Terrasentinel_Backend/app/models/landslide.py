"""
Landslide event model — full GSI/NRSC field set per spec.
"""

from __future__ import annotations

from datetime import date

from geoalchemy2 import Geometry
from sqlalchemy import Date, Float, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Landslide(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A recorded landslide event — GSI Bhusanket, NRSC, or other source."""

    __tablename__ = "landslides"

    # Data source identifier — e.g. "GSI_BHUSANKET", "NRSC"
    source: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)

    # External identifier from originating dataset
    external_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)

    # Administrative location
    state: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    district: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    subdivision: Mapped[str | None] = mapped_column(String(128), nullable=True)
    village: Mapped[str | None] = mapped_column(String(128), nullable=True)

    # Naming
    slide_name: Mapped[str | None] = mapped_column(String(256), nullable=True)
    slide_no: Mapped[str | None] = mapped_column(String(64), nullable=True)
    nh_sh_location: Mapped[str | None] = mapped_column(String(256), nullable=True)

    # Coordinates (redundant with geom for convenience)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # PostGIS Point geometry (SRID 4326)
    geom: Mapped[object] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326), nullable=False
    )

    # Event date
    occurrence_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)

    # Classification
    material_involved: Mapped[str | None] = mapped_column(String(256), nullable=True)
    movement_type: Mapped[str | None] = mapped_column(String(128), nullable=True)
    history: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        Index("ix_landslides_geom", "geom", postgresql_using="gist"),
    )

    def __repr__(self) -> str:
        return f"<Landslide id={self.id} lat={self.latitude} lon={self.longitude}>"
