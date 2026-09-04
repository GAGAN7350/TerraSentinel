"""
Risk prediction service.
Business logic for storing and querying ML predictions.
The ML inference pipeline is NOT implemented here — this service
provides the interface the ML worker will write to.
"""

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
        """
        Persist a risk prediction produced by the ML service.
        In the future this will also trigger alert generation via a background task.
        """
        prediction = RiskPrediction(
            geometry=make_point_wkt(data.longitude, data.latitude),
            risk_score=data.risk_score,
            risk_level=data.risk_level,
            confidence=data.confidence,
            model_version=data.model_version,
            prediction_time=data.prediction_time,
            contributing_factors=data.contributing_factors,
        )
        return await self.repo.create(prediction)

    async def get(self, prediction_id: uuid.UUID) -> RiskPrediction:
        obj = await self.repo.get(prediction_id)
        if not obj:
            raise NotFoundError(f"Risk prediction '{prediction_id}' not found.")
        return obj

    async def list(
        self, skip: int = 0, limit: int = 50
    ) -> tuple[list[RiskPrediction], int]:
        items = await self.repo.list(skip=skip, limit=limit)
        total = await self.repo.count()
        return items, total

    async def find_near(
        self,
        latitude: float,
        longitude: float,
        radius_meters: float = 25_000,
    ) -> list[RiskPrediction]:
        return await self.repo.find_near(latitude, longitude, radius_meters)

    async def find_by_risk_level(
        self,
        risk_level: RiskLevel,
        skip: int = 0,
        limit: int = 50,
    ) -> list[RiskPrediction]:
        return await self.repo.find_by_risk_level(risk_level, skip=skip, limit=limit)

    # ------------------------------------------------------------------
    # Placeholder: ML inference interface
    # ------------------------------------------------------------------

    async def trigger_prediction(
        self,
        latitude: float,
        longitude: float,
    ) -> dict:
        """
        Placeholder for triggering an ML prediction at a given location.
        In production this will dispatch a task to the ML inference service
        (via Celery/Kafka) and return a job reference.
        """
        return {
            "status": "not_implemented",
            "message": (
                "ML inference service not yet connected. "
                "POST to /api/v1/risk to store pre-computed predictions."
            ),
            "latitude": latitude,
            "longitude": longitude,
        }
