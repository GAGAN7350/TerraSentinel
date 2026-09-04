"""Rainfall observation endpoints."""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas.rainfall import RainfallCreate, RainfallResponse, RainfallUpdate
from app.services.geo import geometry_to_geojson
from app.services.rainfall import RainfallService

router = APIRouter()


def get_service(session: AsyncSession = Depends(get_async_session)) -> RainfallService:
    return RainfallService(session)


def _enrich(obj) -> RainfallResponse:
    resp = RainfallResponse.model_validate(obj)
    resp.geometry = geometry_to_geojson(obj.geometry)
    return resp


@router.post("/", response_model=RainfallResponse, status_code=status.HTTP_201_CREATED)
async def create_observation(
    data: RainfallCreate,
    svc: RainfallService = Depends(get_service),
) -> RainfallResponse:
    obj = await svc.create(data)
    return _enrich(obj)


@router.get("/", response_model=list[RainfallResponse])
async def list_observations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    svc: RainfallService = Depends(get_service),
) -> list[RainfallResponse]:
    items, _ = await svc.list(skip=skip, limit=limit)
    return [_enrich(i) for i in items]


@router.get("/near", response_model=list[RainfallResponse])
async def observations_near(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_meters: float = Query(25_000, ge=1),
    svc: RainfallService = Depends(get_service),
) -> list[RainfallResponse]:
    """Return observations within a radius of a coordinate."""
    items = await svc.find_near(latitude, longitude, radius_meters)
    return [_enrich(i) for i in items]


@router.get("/range", response_model=list[RainfallResponse])
async def observations_in_range(
    start: datetime = Query(...),
    end: datetime = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=1000),
    svc: RainfallService = Depends(get_service),
) -> list[RainfallResponse]:
    """Return observations within a UTC time range."""
    items = await svc.find_in_time_range(start, end, skip=skip, limit=limit)
    return [_enrich(i) for i in items]


@router.get("/{obs_id}", response_model=RainfallResponse)
async def get_observation(
    obs_id: uuid.UUID,
    svc: RainfallService = Depends(get_service),
) -> RainfallResponse:
    obj = await svc.get(obs_id)
    return _enrich(obj)


@router.patch("/{obs_id}", response_model=RainfallResponse)
async def update_observation(
    obs_id: uuid.UUID,
    data: RainfallUpdate,
    svc: RainfallService = Depends(get_service),
) -> RainfallResponse:
    obj = await svc.update(obs_id, data)
    return _enrich(obj)


@router.delete("/{obs_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_observation(
    obs_id: uuid.UUID,
    svc: RainfallService = Depends(get_service),
) -> None:
    await svc.delete(obs_id)
