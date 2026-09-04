"""Field report business logic service."""

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

    async def create(self, data: FieldReportCreate) -> FieldReport:
        report = FieldReport(
            user_id=data.user_id,
            latitude=data.latitude,
            longitude=data.longitude,
            geometry=make_point_wkt(data.longitude, data.latitude),
            description=data.description,
            media_url=data.media_url,
            report_time=data.report_time,
        )
        return await self.repo.create(report)

    async def get(self, report_id: uuid.UUID) -> FieldReport:
        obj = await self.repo.get(report_id)
        if not obj:
            raise NotFoundError(f"Field report '{report_id}' not found.")
        return obj

    async def list(
        self, skip: int = 0, limit: int = 50
    ) -> tuple[list[FieldReport], int]:
        items = await self.repo.list(skip=skip, limit=limit)
        total = await self.repo.count()
        return items, total

    async def update(
        self, report_id: uuid.UUID, data: FieldReportUpdate
    ) -> FieldReport:
        obj = await self.get(report_id)
        update_data = data.model_dump(exclude_unset=True)
        return await self.repo.update(obj, update_data)

    async def delete(self, report_id: uuid.UUID) -> None:
        obj = await self.get(report_id)
        await self.repo.delete(obj)
