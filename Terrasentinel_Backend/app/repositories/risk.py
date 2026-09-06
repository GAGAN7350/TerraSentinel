"""Repository for RiskPrediction model."""

from __future__ import annotations

from geoalchemy2.functions import ST_DWithin, ST_MakePoint, ST_SetSRID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.risk import RiskLevel, RiskPrediction
from app.repositories.base import BaseRepository


class RiskRepository(BaseRepository[RiskPrediction]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(RiskPrediction, session)

    async def find_near(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 25.0,
        limit: int = 50,
    ) -> list[RiskPrediction]:
        from geoalchemy2.types import Geography
        from sqlalchemy import cast
        point = cast(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326), Geography)
        stmt = (
            select(RiskPrediction)
            .where(
                ST_DWithin(
                    cast(RiskPrediction.geom, Geography), point, radius_km * 1000
                )
            )
            .order_by(RiskPrediction.prediction_time.desc())
            .limit(limit)
        )
        return list((await self.session.execute(stmt)).scalars().all())

    async def find_by_risk_level(
        self, risk_level: RiskLevel, page: int = 1, page_size: int = 50
    ) -> list[RiskPrediction]:
        stmt = (
            select(RiskPrediction)
            .where(RiskPrediction.risk_level == risk_level)
            .order_by(RiskPrediction.prediction_time.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list((await self.session.execute(stmt)).scalars().all())
