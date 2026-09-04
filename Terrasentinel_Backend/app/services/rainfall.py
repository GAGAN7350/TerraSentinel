"""Rainfall observation business logic service."""

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
        obs = RainfallObservation(
            timestamp=data.timestamp,
            latitude=data.latitude,
            longitude=data.longitude,
            rainfall_mm=data.rainfall_mm,
            source=data.source,
            geometry=make_point_wkt(data.longitude, data.latitude),
        )
        return await self.repo.create(obs)

    async def get(self, obs_id: uuid.UUID) -> RainfallObservation:
        obj = await self.repo.get(obs_id)
        if not obj:
            raise NotFoundError(f"Rainfall observation '{obs_id}' not found.")
        return obj

    async def list(
        self, skip: int = 0, limit: int = 50
    ) -> tuple[list[RainfallObservation], int]:
        items = await self.repo.list(skip=skip, limit=limit)
        total = await self.repo.count()
        return items, total

    async def update(
        self, obs_id: uuid.UUID, data: RainfallUpdate
    ) -> RainfallObservation:
        obj = await self.get(obs_id)
        update_data = data.model_dump(exclude_unset=True)
        return await self.repo.update(obj, update_data)

    async def delete(self, obs_id: uuid.UUID) -> None:
        obj = await self.get(obs_id)
        await self.repo.delete(obj)

    async def find_near(
        self,
        latitude: float,
        longitude: float,
        radius_meters: float = 25_000,
    ) -> list[RainfallObservation]:
        return await self.repo.find_near(latitude, longitude, radius_meters)

    async def find_in_time_range(
        self,
        start: datetime,
        end: datetime,
        skip: int = 0,
        limit: int = 200,
    ) -> list[RainfallObservation]:
        return await self.repo.find_in_time_range(start, end, skip=skip, limit=limit)
