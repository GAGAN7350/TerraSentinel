"""Landslide business logic service."""

from __future__ import annotations

import uuid
from datetime import date

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
        obj = Landslide(
            source=data.source,
            external_id=data.external_id,
            state=data.state,
            district=data.district,
            subdivision=data.subdivision,
            village=data.village,
            slide_name=data.slide_name,
            slide_no=data.slide_no,
            nh_sh_location=data.nh_sh_location,
            latitude=data.latitude,
            longitude=data.longitude,
            geom=make_point_wkt(data.longitude, data.latitude),
            occurrence_date=data.occurrence_date,
            material_involved=data.material_involved,
            movement_type=data.movement_type,
            history=data.history,
        )
        return await self.repo.create(obj)

    async def get(self, landslide_id: uuid.UUID) -> Landslide:
        obj = await self.repo.get(landslide_id)
        if not obj:
            raise NotFoundError(f"Landslide '{landslide_id}' not found.")
        return obj

    async def list_filtered(
        self,
        state: str | None = None,
        district: str | None = None,
        source: str | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> tuple[list[Landslide], int]:
        return await self.repo.list_filtered(
            state=state,
            district=district,
            source=source,
            date_from=date_from,
            date_to=date_to,
            page=page,
            page_size=page_size,
        )

    async def update(self, landslide_id: uuid.UUID, data: LandslideUpdate) -> Landslide:
        obj = await self.get(landslide_id)
        return await self.repo.update(obj, data.model_dump(exclude_unset=True))

    async def delete(self, landslide_id: uuid.UUID) -> None:
        obj = await self.get(landslide_id)
        await self.repo.delete(obj)

    async def find_near(
        self, latitude: float, longitude: float, radius_km: float
    ) -> list[Landslide]:
        return await self.repo.find_near(latitude, longitude, radius_km)

    async def find_in_bbox(
        self, min_lat: float, min_lon: float, max_lat: float, max_lon: float
    ) -> list[Landslide]:
        return await self.repo.find_in_bbox(min_lat, min_lon, max_lat, max_lon)
