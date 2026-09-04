"""Risk prediction endpoints."""

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.models.risk import RiskLevel
from app.schemas.risk import RiskPredictionCreate, RiskPredictionResponse
from app.services.geo import geometry_to_geojson
from app.services.risk import RiskService

router = APIRouter()


def get_service(session: AsyncSession = Depends(get_async_session)) -> RiskService:
    return RiskService(session)


def _enrich(obj) -> RiskPredictionResponse:
    resp = RiskPredictionResponse.model_validate(obj)
    resp.geometry = geometry_to_geojson(obj.geometry)
    return resp


@router.post("/", response_model=RiskPredictionResponse, status_code=status.HTTP_201_CREATED)
async def create_prediction(
    data: RiskPredictionCreate,
    svc: RiskService = Depends(get_service),
) -> RiskPredictionResponse:
    """Store a pre-computed risk prediction from the ML service."""
    obj = await svc.create(data)
    return _enrich(obj)


@router.get("/", response_model=list[RiskPredictionResponse])
async def list_predictions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    svc: RiskService = Depends(get_service),
) -> list[RiskPredictionResponse]:
    items, _ = await svc.list(skip=skip, limit=limit)
    return [_enrich(i) for i in items]


@router.get("/near", response_model=list[RiskPredictionResponse])
async def predictions_near(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_meters: float = Query(25_000, ge=1),
    svc: RiskService = Depends(get_service),
) -> list[RiskPredictionResponse]:
    """Return risk predictions near a coordinate."""
    items = await svc.find_near(latitude, longitude, radius_meters)
    return [_enrich(i) for i in items]


@router.get("/level/{risk_level}", response_model=list[RiskPredictionResponse])
async def predictions_by_level(
    risk_level: RiskLevel,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    svc: RiskService = Depends(get_service),
) -> list[RiskPredictionResponse]:
    """Return predictions filtered by risk level."""
    items = await svc.find_by_risk_level(risk_level, skip=skip, limit=limit)
    return [_enrich(i) for i in items]


@router.post("/trigger", status_code=status.HTTP_202_ACCEPTED)
async def trigger_ml_prediction(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    svc: RiskService = Depends(get_service),
) -> dict:
    """
    Placeholder: trigger an ML inference job for a location.
    Returns a job reference once the ML service is connected.
    """
    return await svc.trigger_prediction(latitude, longitude)


@router.get("/{prediction_id}", response_model=RiskPredictionResponse)
async def get_prediction(
    prediction_id: uuid.UUID,
    svc: RiskService = Depends(get_service),
) -> RiskPredictionResponse:
    obj = await svc.get(prediction_id)
    return _enrich(obj)
