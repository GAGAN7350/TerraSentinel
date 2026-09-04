"""Repository for RiskPrediction model."""

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
        radius_meters: float = 25_000,
        limit: int = 50,
    ) -> list[RiskPrediction]:
        """Return predictions within *radius_meters* of the given coordinate."""
        point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
        stmt = (
            select(RiskPrediction)
            .where(ST_DWithin(RiskPrediction.geometry, point, radius_meters))
            .order_by(RiskPrediction.prediction_time.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def find_by_risk_level(
        self,
        risk_level: RiskLevel,
        skip: int = 0,
        limit: int = 50,
    ) -> list[RiskPrediction]:
        """Return predictions filtered by risk level."""
        stmt = (
            select(RiskPrediction)
            .where(RiskPrediction.risk_level == risk_level)
            .order_by(RiskPrediction.prediction_time.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
