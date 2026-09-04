"""
Field report model.
Submitted by field officers documenting on-ground observations.
"""

import enum
import uuid

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ReportStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class FieldReport(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Ground-truth report submitted by a field officer."""

    __tablename__ = "field_reports"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    geometry: Mapped[object] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Placeholder — actual upload handled via object storage in future
    media_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    report_time: Mapped[object] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )

    status: Mapped[ReportStatus] = mapped_column(
        Enum(ReportStatus, name="report_status"),
        nullable=False,
        default=ReportStatus.PENDING,
    )

    # Relationship
    user: Mapped["User"] = relationship(back_populates="field_reports")  # noqa: F821

    __table_args__ = (
        Index("ix_field_reports_geometry", "geometry", postgresql_using="gist"),
    )

    def __repr__(self) -> str:
        return f"<FieldReport id={self.id} status={self.status}>"
