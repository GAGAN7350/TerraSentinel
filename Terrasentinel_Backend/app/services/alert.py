"""Alert business logic service."""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.repositories.alert import AlertRepository
from app.schemas.alert import AlertCreate, AlertUpdate
from app.services.geo import make_point_wkt


class AlertService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = AlertRepository(session)

    async def create(self, data: AlertCreate) -> Alert:
        geom = None
        if data.latitude is not None and data.longitude is not None:
            geom = make_point_wkt(data.longitude, data.latitude)
        obj = Alert(
            alert_type=data.alert_type,
            severity=data.severity,
            title=data.title,
            message=data.message,
            state=data.state,
            district=data.district,
            latitude=data.latitude,
            longitude=data.longitude,
            geom=geom,
            risk_prediction_id=data.risk_prediction_id,
            issued_at=data.issued_at,
            expires_at=data.expires_at,
        )
        return await self.repo.create(obj)

    async def get(self, alert_id: uuid.UUID) -> Alert:
        obj = await self.repo.get(alert_id)
        if not obj:
            raise NotFoundError(f"Alert '{alert_id}' not found.")
        return obj

    async def list_filtered(
        self,
        severity: AlertSeverity | None = None,
        status: AlertStatus | None = None,
        state: str | None = None,
        district: str | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> tuple[list[Alert], int]:
        return await self.repo.list_filtered(
            severity=severity,
            status=status,
            state=state,
            district=district,
            page=page,
            page_size=page_size,
        )

    async def update(self, alert_id: uuid.UUID, data: AlertUpdate) -> Alert:
        obj = await self.get(alert_id)
        return await self.repo.update(obj, data.model_dump(exclude_unset=True))
