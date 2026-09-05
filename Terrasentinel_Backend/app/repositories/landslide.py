"""Repository for Landslide model — CRUD + geospatial queries."""

from __future__ import annotations

from datetime import date

from geoalchemy2.functions import ST_DWithin, ST_MakePoint, ST_SetSRID, ST_Within
from sqlalchemy import and_, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.landslide import Landslide
from app.repositories.base import BaseRepository


class LandslideRepository(BaseRepository[Landslide]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Landslide, session)

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
        filters = []
        if state:
            filters.append(Landslide.state == state)
        if district:
            filters.append(Landslide.district == district)
        if source:
            filters.append(Landslide.source == source)
        if date_from:
            filters.append(Landslide.occurrence_date >= date_from)
        if date_to:
            filters.append(Landslide.occurrence_date <= date_to)

        where = and_(*filters) if filters else True

        count_stmt = select(func.count()).select_from(Landslide).where(where)
        total = (await self.session.execute(count_stmt)).scalar_one()

        stmt = (
            select(Landslide)
            .where(where)
            .order_by(Landslide.occurrence_date.desc().nullslast())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        rows = (await self.session.execute(stmt)).scalars().all()
        return list(rows), total

    async def find_near(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 50.0,
        limit: int = 200,
    ) -> list[Landslide]:
        """Return landslides within radius_km of the coordinate (PostGIS)."""
        point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
        radius_m = radius_km * 1000
        stmt = (
            select(Landslide)
            .where(ST_DWithin(Landslide.geom, point, radius_m))
            .limit(limit)
        )
        return list((await self.session.execute(stmt)).scalars().all())

    async def find_in_bbox(
        self,
        min_lat: float,
        min_lon: float,
        max_lat: float,
        max_lon: float,
        limit: int = 500,
    ) -> list[Landslide]:
        """Return landslides inside the bounding box."""
        bbox = text(
            f"ST_MakeEnvelope({min_lon}, {min_lat}, {max_lon}, {max_lat}, 4326)"
        )
        stmt = (
            select(Landslide)
            .where(ST_Within(Landslide.geom, bbox))
            .limit(limit)
        )
        return list((await self.session.execute(stmt)).scalars().all())
