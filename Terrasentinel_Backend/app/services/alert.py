"""Alert business logic service."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.alert import Alert
from app.repositories.alert import AlertRepository
from app.schemas.alert import AlertCreate, AlertUpdate


class AlertService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = AlertRepository(session)

    async def create(self, data: AlertCreate) -> Alert:
        alert = Alert(
            risk_prediction_id=data.risk_prediction_id,
            severity=data.severity,
            message=data.message,
            channel=data.channel,
        )
        return await self.repo.create(alert)

    async def get(self, alert_id: uuid.UUID) -> Alert:
        obj = await self.repo.get(alert_id)
        if not obj:
            raise NotFoundError(f"Alert '{alert_id}' not found.")
        return obj

    async def list(self, skip: int = 0, limit: int = 50) -> tuple[list[Alert], int]:
        items = await self.repo.list(skip=skip, limit=limit)
        total = await self.repo.count()
        return items, total

    async def update(self, alert_id: uuid.UUID, data: AlertUpdate) -> Alert:
        obj = await self.get(alert_id)
        update_data = data.model_dump(exclude_unset=True)
        return await self.repo.update(obj, update_data)

    async def find_active(self, skip: int = 0, limit: int = 50) -> list[Alert]:
        return await self.repo.find_active(skip=skip, limit=limit)
