"""Landslide business logic service."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.landslide import Landslide
from app.repositories.landslide import LandslideRepository
from app.schemas.landslide import LandslideCreate, LandslideUpdate
from app.services.geo import make_point_wkt


class LandslideService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = LandslideRepository(session)

    async def create(self, data: LandslideCreate) -> Landslide:
        landslide = Landslide(
            external_id=data.external_id,
            state=data.state,
            district=data.district,
            latitude=data.latitude,
            longitude=data.longitude,
            event_date=data.event_date,
            source=data.source,
            metadata_=data.metadata_,
            geometry=make_point_wkt(data.longitude, data.latitude),
        )
        return await self.repo.create(landslide)

    async def get(self, landslide_id: uuid.UUID) -> Landslide:
        obj = await self.repo.get(landslide_id)
        if not obj:
            raise NotFoundError(f"Landslide '{landslide_id}' not found.")
        return obj

    async def list(self, skip: int = 0, limit: int = 50) -> tuple[list[Landslide], int]:
        items = await self.repo.list(skip=skip, limit=limit)
        total = await self.repo.count()
        return items, total

    async def update(self, landslide_id: uuid.UUID, data: LandslideUpdate) -> Landslide:
        obj = await self.get(landslide_id)
        update_data = data.model_dump(exclude_unset=True, by_alias=False)
        return await self.repo.update(obj, update_data)

    async def delete(self, landslide_id: uuid.UUID) -> None:
        obj = await self.get(landslide_id)
        await self.repo.delete(obj)

    async def find_near(
        self,
        latitude: float,
        longitude: float,
        radius_meters: float = 50_000,
    ) -> list[Landslide]:
        return await self.repo.find_near(latitude, longitude, radius_meters)

    async def find_in_bbox(
        self,
        min_lon: float,
        min_lat: float,
        max_lon: float,
        max_lat: float,
    ) -> list[Landslide]:
        return await self.repo.find_in_bbox(min_lon, min_lat, max_lon, max_lat)
