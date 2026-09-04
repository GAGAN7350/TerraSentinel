"""
Alert model.
Represents warnings dispatched to officers / the public based on risk predictions.
"""

import enum
import uuid

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class AlertSeverity(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    WATCH = "watch"
    EMERGENCY = "emergency"


class AlertStatus(str, enum.Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"


class Alert(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A landslide alert issued based on a risk prediction."""

    __tablename__ = "alerts"

    risk_prediction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("risk_predictions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    severity: Mapped[AlertSeverity] = mapped_column(
        Enum(AlertSeverity, name="alert_severity"), nullable=False
    )

    message: Mapped[str] = mapped_column(Text, nullable=False)

    status: Mapped[AlertStatus] = mapped_column(
        Enum(AlertStatus, name="alert_status"),
        nullable=False,
        default=AlertStatus.ACTIVE,
    )

    # Notification channel placeholder (email, SMS, push, etc.)
    channel: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # Relationship
    risk_prediction: Mapped["RiskPrediction"] = relationship(  # noqa: F821
        back_populates="alerts"
    )

    def __repr__(self) -> str:
        return f"<Alert id={self.id} severity={self.severity} status={self.status}>"
