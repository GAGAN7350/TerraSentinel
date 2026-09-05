"""Repository for Alert model."""

from __future__ import annotations

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.repositories.base import BaseRepository


class AlertRepository(BaseRepository[Alert]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Alert, session)

    async def list_filtered(
        self,
        severity: AlertSeverity | None = None,
        status: AlertStatus | None = None,
        state: str | None = None,
        district: str | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> tuple[list[Alert], int]:
        from sqlalchemy import func
        filters = []
        if severity:
            filters.append(Alert.severity == severity)
        if status:
            filters.append(Alert.status == status)
        if state:
            filters.append(Alert.state == state)
        if district:
            filters.append(Alert.district == district)

        where = and_(*filters) if filters else True

        count_stmt = select(func.count()).select_from(Alert).where(where)
        total = (await self.session.execute(count_stmt)).scalar_one()

        stmt = (
            select(Alert)
            .where(where)
            .order_by(Alert.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        rows = (await self.session.execute(stmt)).scalars().all()
        return list(rows), total
