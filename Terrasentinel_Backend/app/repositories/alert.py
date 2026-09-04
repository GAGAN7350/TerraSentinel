"""Repository for Alert model."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert, AlertStatus
from app.repositories.base import BaseRepository


class AlertRepository(BaseRepository[Alert]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Alert, session)

    async def find_by_prediction(self, risk_prediction_id: uuid.UUID) -> list[Alert]:
        """Return all alerts linked to a specific risk prediction."""
        stmt = (
            select(Alert)
            .where(Alert.risk_prediction_id == risk_prediction_id)
            .order_by(Alert.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def find_active(self, skip: int = 0, limit: int = 50) -> list[Alert]:
        """Return currently active alerts."""
        stmt = (
            select(Alert)
            .where(Alert.status == AlertStatus.ACTIVE)
            .order_by(Alert.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
