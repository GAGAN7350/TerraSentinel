"""Repository for FieldReport model."""

from __future__ import annotations

import uuid

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.field_report import FieldReport
from app.repositories.base import BaseRepository


class FieldReportRepository(BaseRepository[FieldReport]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(FieldReport, session)

    async def list_filtered(
        self,
        submitted_by: uuid.UUID | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> tuple[list[FieldReport], int]:
        filters = []
        if submitted_by:
            filters.append(FieldReport.submitted_by == submitted_by)
        where = and_(*filters) if filters else True

        count_stmt = select(func.count()).select_from(FieldReport).where(where)
        total = (await self.session.execute(count_stmt)).scalar_one()

        stmt = (
            select(FieldReport)
            .where(where)
            .order_by(FieldReport.observed_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        rows = (await self.session.execute(stmt)).scalars().all()
        return list(rows), total
