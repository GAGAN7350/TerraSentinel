"""
Landslide event model.
Records confirmed or suspected landslide incidents with spatial geometry.
"""

import uuid
from datetime import date, datetime

from geoalchemy2 import Geometry
from sqlalchemy import Date, Float, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Landslide(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A recorded landslide event in North-East India."""

    __tablename__ = "landslides"

    # External identifier from the originating data source
    external_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)

    # Administrative location
    state: Mapped[str | None] = mapped_column(String(128), nullable=True)
    district: Mapped[str | None] = mapped_column(String(128), nullable=True)

    # Coordinate columns (redundant with geometry but useful for non-spatial queries)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # Date of event
    event_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # PostGIS Point geometry (SRID 4326 — WGS 84)
    geometry: Mapped[object] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326),
        nullable=False,
    )

    # Data provenance
    source: Mapped[str | None] = mapped_column(String(256), nullable=True)

    # Arbitrary extra attributes (ISRO catalog fields, damage info, etc.)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)

    __table_args__ = (
        Index("ix_landslides_geometry", "geometry", postgresql_using="gist"),
    )

    def __repr__(self) -> str:
        return f"<Landslide id={self.id} lat={self.latitude} lon={self.longitude}>"
