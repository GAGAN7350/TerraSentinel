"""Risk prediction service — storage contract for future ML service."""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.risk import RiskLevel, RiskPrediction
from app.repositories.risk import RiskRepository
from app.schemas.risk import RiskPredictionCreate
from app.services.geo import make_point_wkt


class RiskService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = RiskRepository(session)

    async def create(self, data: RiskPredictionCreate) -> RiskPrediction:
        obj = RiskPrediction(
            prediction_time=data.prediction_time,
            valid_until=data.valid_until,
            latitude=data.latitude,
            longitude=data.longitude,
            geom=make_point_wkt(data.longitude, data.latitude),
            risk_score=data.risk_score,
            risk_level=data.risk_level,
            confidence=data.confidence,
            trend=data.trend,
            model_version=data.model_version,
            explanation=data.explanation,
        )
        return await self.repo.create(obj)

    async def get(self, prediction_id: uuid.UUID) -> RiskPrediction:
        obj = await self.repo.get(prediction_id)
        if not obj:
            raise NotFoundError(f"Risk prediction '{prediction_id}' not found.")
        return obj

    async def list(self, page: int = 1, page_size: int = 50) -> tuple[list[RiskPrediction], int]:
        skip = (page - 1) * page_size
        items = await self.repo.list(skip=skip, limit=page_size)
        total = await self.repo.count()
        return items, total

    async def find_near(
        self, latitude: float, longitude: float, radius_km: float
    ) -> list[RiskPrediction]:
        return await self.repo.find_near(latitude, longitude, radius_km)

    async def find_by_risk_level(
        self, risk_level: RiskLevel, page: int = 1, page_size: int = 50
    ) -> list[RiskPrediction]:
        return await self.repo.find_by_risk_level(risk_level, page=page, page_size=page_size)
