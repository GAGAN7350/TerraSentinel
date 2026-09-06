"""Risk prediction service — real-time XGBoost ML inference & storage contract."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.risk import RiskLevel, RiskPrediction
from app.repositories.risk import RiskRepository
from app.schemas.risk import (
    RiskModelInfoResponse,
    RiskPredictionCreate,
    RiskPredictionResult,
    RiskPredictRequest,
    RiskSimulationRequest,
)
from app.services.geo import make_point_wkt
from app.services.ml_inference import MLInferenceService


class RiskService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = RiskRepository(session)
        self.ml_engine = MLInferenceService()

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

    async def predict_live(self, data: RiskPredictRequest) -> RiskPredictionResult:
        features = data.model_dump(exclude={"store_in_db"})
        res = self.ml_engine.predict_risk(features)

        now = datetime.now(timezone.utc)
        saved_id = None

        if data.store_in_db:
            prediction_create = RiskPredictionCreate(
                prediction_time=now,
                latitude=data.latitude,
                longitude=data.longitude,
                risk_score=res["risk_score"],
                risk_level=res["risk_level"],
                confidence=res["confidence"],
                trend=res["trend"],
                model_version=res["model_version"],
                explanation=res["explanation"],
            )
            obj = await self.create(prediction_create)
            saved_id = obj.id

            # Alert policy: Automatically issue ACTIVE CRITICAL Alert record if score >= 75.0
            if res["risk_level"] == RiskLevel.CRITICAL or res["risk_score"] >= 75.0:
                drivers = res.get("explanation", {}).get("primary_drivers", [])
                driver_text = ", ".join(drivers) if drivers else "Steep slope and high precipitation"

                alert_obj = Alert(
                    alert_type="LANDSLIDE_CRITICAL_RISK",
                    severity=AlertSeverity.CRITICAL,
                    title=f"CRITICAL Landslide Risk Warning ({res['risk_score']:.1f}/100)",
                    message=f"Automated ML evaluation flagged CRITICAL risk score ({res['risk_score']:.1f}/100) at ({data.latitude:.4f}, {data.longitude:.4f}). Primary drivers: {driver_text}.",
                    latitude=data.latitude,
                    longitude=data.longitude,
                    geom=make_point_wkt(data.longitude, data.latitude),
                    risk_prediction_id=obj.id,
                    status=AlertStatus.ACTIVE,
                    issued_at=now,
                )
                self.session.add(alert_obj)
                await self.session.commit()

        return RiskPredictionResult(
            prediction_time=now,
            latitude=data.latitude,
            longitude=data.longitude,
            risk_score=res["risk_score"],
            risk_level=res["risk_level"],
            confidence=res["confidence"],
            trend=res["trend"],
            model_version=res["model_version"],
            explanation=res["explanation"],
            saved_record_id=saved_id,
        )

    async def simulate_scenario(self, data: RiskSimulationRequest) -> RiskPredictionResult:
        modified_slope = max(0.0, min(90.0, data.terrain_slope + data.slope_delta_deg))
        modified_rain = max(0.0, data.rainfall_7d_mm * data.rainfall_multiplier)

        features = {
            "latitude": data.latitude,
            "longitude": data.longitude,
            "terrain_slope": modified_slope,
            "terrain_aspect": data.terrain_aspect,
            "elevation_meters": data.elevation_meters,
            "soil_clay_0_5cm": data.soil_clay_0_5cm,
            "soil_sand_0_5cm": data.soil_sand_0_5cm,
            "rainfall_7d_mm": modified_rain,
        }

        res = self.ml_engine.predict_risk(features)
        now = datetime.now(timezone.utc)

        # Mark explanation payload explicitly as a simulation
        explanation = res["explanation"]
        explanation["simulation"] = True
        explanation["simulation_inputs"] = {
            "slope_delta_deg": data.slope_delta_deg,
            "rainfall_multiplier": data.rainfall_multiplier,
            "modified_slope": modified_slope,
            "modified_rain": modified_rain,
        }

        return RiskPredictionResult(
            prediction_time=now,
            latitude=data.latitude,
            longitude=data.longitude,
            risk_score=res["risk_score"],
            risk_level=res["risk_level"],
            confidence=res["confidence"],
            trend=res["trend"],
            model_version=res["model_version"],
            explanation=explanation,
            saved_record_id=None,
        )

    def get_model_info(self) -> RiskModelInfoResponse:
        return RiskModelInfoResponse(
            model_version=self.ml_engine.model_version,
            model_loaded=self.ml_engine.model_loaded,
            feature_names=self.ml_engine.feature_names,
            total_features=len(self.ml_engine.feature_names),
        )

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
