"""Repository for RainfallObservation model."""

from datetime import datetime

from geoalchemy2.functions import ST_DWithin, ST_MakePoint, ST_SetSRID
from sqlalchemy import select
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
        radius_meters: float = 25_000,
        limit: int = 100,
    ) -> list[RainfallObservation]:
        """Return observations within *radius_meters* of the given point."""
        point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
        stmt = (
            select(RainfallObservation)
            .where(ST_DWithin(RainfallObservation.geometry, point, radius_meters))
            .order_by(RainfallObservation.timestamp.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def find_in_time_range(
        self,
        start: datetime,
        end: datetime,
        skip: int = 0,
        limit: int = 200,
    ) -> list[RainfallObservation]:
        """Return observations within a UTC time window."""
        stmt = (
            select(RainfallObservation)
            .where(
                RainfallObservation.timestamp >= start,
                RainfallObservation.timestamp <= end,
            )
            .order_by(RainfallObservation.timestamp.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
