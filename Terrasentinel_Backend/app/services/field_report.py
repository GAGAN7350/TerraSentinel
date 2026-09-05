"""Field report business logic service."""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.field_report import FieldReport
from app.repositories.field_report import FieldReportRepository
from app.schemas.field_report import FieldReportCreate, FieldReportUpdate
from app.services.geo import make_point_wkt


class FieldReportService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = FieldReportRepository(session)

    async def create(self, data: FieldReportCreate, user_id: uuid.UUID) -> FieldReport:
        obj = FieldReport(
            submitted_by=user_id,
            latitude=data.latitude,
            longitude=data.longitude,
            geom=make_point_wkt(data.longitude, data.latitude),
            state=data.state,
            district=data.district,
            report_type=data.report_type,
            severity=data.severity,
            description=data.description,
            observed_at=data.observed_at,
        )
        return await self.repo.create(obj)

    async def get(self, report_id: uuid.UUID) -> FieldReport:
        obj = await self.repo.get(report_id)
        if not obj:
            raise NotFoundError(f"Field report '{report_id}' not found.")
        return obj

    async def list_filtered(
        self,
        submitted_by: uuid.UUID | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> tuple[list[FieldReport], int]:
        return await self.repo.list_filtered(
            submitted_by=submitted_by, page=page, page_size=page_size
        )

    async def update(self, report_id: uuid.UUID, data: FieldReportUpdate) -> FieldReport:
        obj = await self.get(report_id)
        return await self.repo.update(obj, data.model_dump(exclude_unset=True))

    async def delete(self, report_id: uuid.UUID) -> None:
        obj = await self.get(report_id)
        await self.repo.delete(obj)
