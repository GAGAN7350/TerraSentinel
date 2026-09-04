"""Repository for Landslide model — includes geospatial query helpers."""

from geoalchemy2.functions import ST_DWithin, ST_MakePoint, ST_SetSRID, ST_Within
from geoalchemy2.shape import to_shape
from sqlalchemy import and_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.landslide import Landslide
from app.repositories.base import BaseRepository


class LandslideRepository(BaseRepository[Landslide]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Landslide, session)

    async def find_near(
        self,
        latitude: float,
        longitude: float,
        radius_meters: float = 50_000,
        limit: int = 50,
    ) -> list[Landslide]:
        """Return landslides within *radius_meters* of the given coordinate."""
        point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
        stmt = (
            select(Landslide)
            .where(ST_DWithin(Landslide.geometry, point, radius_meters))
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def find_in_bbox(
        self,
        min_lon: float,
        min_lat: float,
        max_lon: float,
        max_lat: float,
        limit: int = 200,
    ) -> list[Landslide]:
        """Return landslides whose geometry falls inside the given bounding box."""
        bbox = text(
            f"ST_MakeEnvelope({min_lon}, {min_lat}, {max_lon}, {max_lat}, 4326)"
        )
        stmt = (
            select(Landslide)
            .where(ST_Within(Landslide.geometry, bbox))
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
