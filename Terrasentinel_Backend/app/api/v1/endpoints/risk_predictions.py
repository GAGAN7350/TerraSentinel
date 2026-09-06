"""Risk prediction endpoints — storage contract, real-time ML inference & scenario simulator."""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.models.risk import RiskLevel
from app.schemas.common import PaginatedResponse
from app.schemas.risk import (
    RiskModelInfoResponse,
    RiskPredictionCreate,
    RiskPredictionResponse,
    RiskPredictionResult,
    RiskPredictRequest,
    RiskSimulationRequest,
)
from app.services.geo import geometry_to_geojson
from app.services.risk import RiskService

router = APIRouter()


def _svc(session: AsyncSession = Depends(get_async_session)) -> RiskService:
    return RiskService(session)


def _enrich(obj) -> RiskPredictionResponse:
    resp = RiskPredictionResponse.model_validate(obj)
    resp.geometry = geometry_to_geojson(obj.geom)
    return resp


@router.post("/predict", response_model=RiskPredictionResult, status_code=status.HTTP_200_OK)
async def predict_risk(
    data: RiskPredictRequest, svc: RiskService = Depends(_svc)
) -> RiskPredictionResult:
    """Execute real-time XGBoost ML risk prediction for given environmental & terrain features."""
    return await svc.predict_live(data)


@router.post("/simulate", response_model=RiskPredictionResult, status_code=status.HTTP_200_OK)
async def simulate_risk(
    data: RiskSimulationRequest, svc: RiskService = Depends(_svc)
) -> RiskPredictionResult:
    """Simulate 'what-if' environmental scenarios by modifying slope or rainfall parameters."""
    return await svc.simulate_scenario(data)


@router.get("/model-info", response_model=RiskModelInfoResponse)
async def get_model_info(svc: RiskService = Depends(_svc)) -> RiskModelInfoResponse:
    """Retrieve metadata, version, and feature requirements of the active ML inference model."""
    return svc.get_model_info()


@router.get("/health", response_model=dict[str, Any])
async def get_model_health(svc: RiskService = Depends(_svc)) -> dict[str, Any]:
    """Lightweight ML model health check endpoint."""
    return svc.ml_engine.get_health_status()


@router.post("/", response_model=RiskPredictionResponse, status_code=status.HTTP_201_CREATED)
async def create_prediction(
    data: RiskPredictionCreate, svc: RiskService = Depends(_svc)
) -> RiskPredictionResponse:
    """Store a pre-computed ML risk prediction."""
    return _enrich(await svc.create(data))


@router.get("/", response_model=PaginatedResponse[RiskPredictionResponse])
async def list_predictions(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    svc: RiskService = Depends(_svc),
) -> PaginatedResponse[RiskPredictionResponse]:
    items, total = await svc.list(page=page, page_size=page_size)
    return PaginatedResponse(
        items=[_enrich(i) for i in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/nearby", response_model=list[RiskPredictionResponse])
async def predictions_nearby(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(25.0, gt=0),
    svc: RiskService = Depends(_svc),
) -> list[RiskPredictionResponse]:
    items = await svc.find_near(latitude, longitude, radius_km)
    return [_enrich(i) for i in items]


@router.get("/risk-map", response_model=list[RiskPredictionResponse])
async def risk_map(
    risk_level: RiskLevel | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(200, ge=1, le=1000),
    svc: RiskService = Depends(_svc),
) -> list[RiskPredictionResponse]:
    """Return predictions for map rendering, optionally filtered by risk level."""
    if risk_level:
        items = await svc.find_by_risk_level(risk_level, page=page, page_size=page_size)
    else:
        items, _ = await svc.list(page=page, page_size=page_size)
    return [_enrich(i) for i in items]


@router.get("/{prediction_id}", response_model=RiskPredictionResponse)
async def get_prediction(
    prediction_id: uuid.UUID, svc: RiskService = Depends(_svc)
) -> RiskPredictionResponse:
    return _enrich(await svc.get(prediction_id))
