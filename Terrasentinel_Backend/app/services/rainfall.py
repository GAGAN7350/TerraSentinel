"""Rainfall observation business logic service."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.rainfall import RainfallObservation
from app.repositories.rainfall import RainfallRepository
from app.schemas.rainfall import RainfallCreate, RainfallUpdate
from app.services.geo import make_point_wkt


class RainfallService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = RainfallRepository(session)

    async def create(self, data: RainfallCreate) -> RainfallObservation:
        obj = RainfallObservation(
            source=data.source,
            observation_time=data.observation_time,
            latitude=data.latitude,
            longitude=data.longitude,
            geom=make_point_wkt(data.longitude, data.latitude),
            rainfall_mm=data.rainfall_mm,
            duration_minutes=data.duration_minutes,
            cell_id=data.cell_id,
        )
        return await self.repo.create(obj)

    async def get(self, obs_id: uuid.UUID) -> RainfallObservation:
        obj = await self.repo.get(obs_id)
        if not obj:
            raise NotFoundError(f"Rainfall observation '{obs_id}' not found.")
        return obj

    async def list(self, page: int = 1, page_size: int = 50) -> tuple[list[RainfallObservation], int]:
        skip = (page - 1) * page_size
        items = await self.repo.list(skip=skip, limit=page_size)
        total = await self.repo.count()
        return items, total

    async def update(self, obs_id: uuid.UUID, data: RainfallUpdate) -> RainfallObservation:
        obj = await self.get(obs_id)
        return await self.repo.update(obj, data.model_dump(exclude_unset=True))

    async def delete(self, obs_id: uuid.UUID) -> None:
        obj = await self.get(obs_id)
        await self.repo.delete(obj)

    async def find_near(
        self, latitude: float, longitude: float, radius_km: float
    ) -> list[RainfallObservation]:
        return await self.repo.find_near(latitude, longitude, radius_km)

    async def find_in_time_range(
        self,
        start: datetime,
        end: datetime,
        source: str | None = None,
        page: int = 1,
        page_size: int = 200,
    ) -> list[RainfallObservation]:
        return await self.repo.find_in_time_range(start, end, source=source, page=page, page_size=page_size)
