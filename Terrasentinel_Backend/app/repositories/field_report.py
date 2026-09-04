"""Repository for FieldReport model."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.field_report import FieldReport, ReportStatus
from app.repositories.base import BaseRepository


class FieldReportRepository(BaseRepository[FieldReport]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(FieldReport, session)

    async def find_by_user(
        self,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 50,
    ) -> list[FieldReport]:
        """Return field reports submitted by a specific user."""
        stmt = (
            select(FieldReport)
            .where(FieldReport.user_id == user_id)
            .order_by(FieldReport.report_time.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def find_by_status(
        self,
        status: ReportStatus,
        skip: int = 0,
        limit: int = 50,
    ) -> list[FieldReport]:
        """Return field reports filtered by verification status."""
        stmt = (
            select(FieldReport)
            .where(FieldReport.status == status)
            .order_by(FieldReport.report_time.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
