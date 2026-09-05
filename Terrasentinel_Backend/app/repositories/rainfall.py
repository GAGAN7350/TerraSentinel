"""Repository for RainfallObservation model."""

from __future__ import annotations

from datetime import datetime

from geoalchemy2.functions import ST_DWithin, ST_MakePoint, ST_SetSRID
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.rainfall import RainfallObservation
from app.repositories.base import BaseRepository


class RainfallRepository(BaseRepository[RainfallObservation]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(RainfallObservation, session)

    async def find_near(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 25.0,
        limit: int = 100,
    ) -> list[RainfallObservation]:
        point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
        stmt = (
            select(RainfallObservation)
            .where(ST_DWithin(RainfallObservation.geom, point, radius_km * 1000))
            .order_by(RainfallObservation.observation_time.desc())
            .limit(limit)
        )
        return list((await self.session.execute(stmt)).scalars().all())

    async def find_in_time_range(
        self,
        start: datetime,
        end: datetime,
        source: str | None = None,
        page: int = 1,
        page_size: int = 200,
    ) -> list[RainfallObservation]:
        filters = [
            RainfallObservation.observation_time >= start,
            RainfallObservation.observation_time <= end,
        ]
        if source:
            filters.append(RainfallObservation.source == source)
        stmt = (
            select(RainfallObservation)
            .where(and_(*filters))
            .order_by(RainfallObservation.observation_time.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list((await self.session.execute(stmt)).scalars().all())
