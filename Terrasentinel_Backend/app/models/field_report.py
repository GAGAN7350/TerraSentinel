"""
Field report model — observations submitted by field officers.
report_type: CRACK/SLOPE_MOVEMENT/ROAD_BLOCKAGE/LANDSLIDE/OTHER
severity: LOW/MODERATE/HIGH/CRITICAL
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ReportType(str, enum.Enum):
    CRACK = "CRACK"
    SLOPE_MOVEMENT = "SLOPE_MOVEMENT"
    ROAD_BLOCKAGE = "ROAD_BLOCKAGE"
    LANDSLIDE = "LANDSLIDE"
    OTHER = "OTHER"


class ReportSeverity(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class FieldReport(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Ground-truth observation submitted by a field officer."""

    __tablename__ = "field_reports"

    submitted_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geom: Mapped[object] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326), nullable=False
    )

    state: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    district: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)

    report_type: Mapped[ReportType] = mapped_column(
        Enum(ReportType, name="report_type"), nullable=False, default=ReportType.OTHER
    )
    severity: Mapped[ReportSeverity] = mapped_column(
        Enum(ReportSeverity, name="report_severity"),
        nullable=False,
        default=ReportSeverity.LOW,
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )

    # Relationship
    submitted_by_user: Mapped[User | None] = relationship(  # noqa: F821
        back_populates="field_reports"
    )

    __table_args__ = (
        Index("ix_field_reports_geom", "geom", postgresql_using="gist"),
    )

    def __repr__(self) -> str:
        return f"<FieldReport id={self.id} type={self.report_type} severity={self.severity}>"
