"""Rainfall observation endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas.common import PaginatedResponse
from app.schemas.rainfall import RainfallCreate, RainfallResponse, RainfallUpdate
from app.services.geo import geometry_to_geojson
from app.services.rainfall import RainfallService

router = APIRouter()


def _svc(session: AsyncSession = Depends(get_async_session)) -> RainfallService:
    return RainfallService(session)


def _enrich(obj) -> RainfallResponse:
    resp = RainfallResponse.model_validate(obj)
    resp.geometry = geometry_to_geojson(obj.geom)
    return resp


@router.post("/", response_model=RainfallResponse, status_code=status.HTTP_201_CREATED)
async def create_observation(
    data: RainfallCreate, svc: RainfallService = Depends(_svc)
) -> RainfallResponse:
    return _enrich(await svc.create(data))


@router.get("/", response_model=PaginatedResponse[RainfallResponse])
async def list_observations(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    svc: RainfallService = Depends(_svc),
) -> PaginatedResponse[RainfallResponse]:
    items, total = await svc.list(page=page, page_size=page_size)
    return PaginatedResponse(
        items=[_enrich(i) for i in items],
        page=page, page_size=page_size, total=total,
    )


@router.get("/nearby", response_model=list[RainfallResponse])
async def observations_nearby(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(25.0, gt=0),
    svc: RainfallService = Depends(_svc),
) -> list[RainfallResponse]:
    items = await svc.find_near(latitude, longitude, radius_km)
    return [_enrich(i) for i in items]


@router.get("/range", response_model=list[RainfallResponse])
async def observations_in_range(
    start: datetime = Query(...),
    end: datetime = Query(...),
    source: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(200, ge=1, le=1000),
    svc: RainfallService = Depends(_svc),
) -> list[RainfallResponse]:
    items = await svc.find_in_time_range(start, end, source=source, page=page, page_size=page_size)
    return [_enrich(i) for i in items]


@router.get("/{obs_id}", response_model=RainfallResponse)
async def get_observation(
    obs_id: uuid.UUID, svc: RainfallService = Depends(_svc)
) -> RainfallResponse:
    return _enrich(await svc.get(obs_id))


@router.patch("/{obs_id}", response_model=RainfallResponse)
async def update_observation(
    obs_id: uuid.UUID, data: RainfallUpdate, svc: RainfallService = Depends(_svc)
) -> RainfallResponse:
    return _enrich(await svc.update(obs_id, data))


@router.delete("/{obs_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def delete_observation(
    obs_id: uuid.UUID, svc: RainfallService = Depends(_svc)
) -> Response:
    await svc.delete(obs_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
