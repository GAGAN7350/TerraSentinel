"""Landslide event endpoints."""

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas.landslide import LandslideCreate, LandslideResponse, LandslideUpdate
from app.services.geo import geometry_to_geojson
from app.services.landslide import LandslideService

router = APIRouter()


def get_service(session: AsyncSession = Depends(get_async_session)) -> LandslideService:
    return LandslideService(session)


def _enrich(obj) -> LandslideResponse:
    """Attach GeoJSON geometry to response schema."""
    resp = LandslideResponse.model_validate(obj)
    resp.geometry = geometry_to_geojson(obj.geometry)
    return resp


@router.post("/", response_model=LandslideResponse, status_code=status.HTTP_201_CREATED)
async def create_landslide(
    data: LandslideCreate,
    svc: LandslideService = Depends(get_service),
) -> LandslideResponse:
    obj = await svc.create(data)
    return _enrich(obj)


@router.get("/", response_model=list[LandslideResponse])
async def list_landslides(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    svc: LandslideService = Depends(get_service),
) -> list[LandslideResponse]:
    items, _ = await svc.list(skip=skip, limit=limit)
    return [_enrich(i) for i in items]


@router.get("/near", response_model=list[LandslideResponse])
async def landslides_near(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_meters: float = Query(50_000, ge=1),
    svc: LandslideService = Depends(get_service),
) -> list[LandslideResponse]:
    """Return landslides within a given radius of a coordinate."""
    items = await svc.find_near(latitude, longitude, radius_meters)
    return [_enrich(i) for i in items]


@router.get("/bbox", response_model=list[LandslideResponse])
async def landslides_in_bbox(
    min_lon: float = Query(...),
    min_lat: float = Query(...),
    max_lon: float = Query(...),
    max_lat: float = Query(...),
    svc: LandslideService = Depends(get_service),
) -> list[LandslideResponse]:
    """Return landslides within a bounding box."""
    items = await svc.find_in_bbox(min_lon, min_lat, max_lon, max_lat)
    return [_enrich(i) for i in items]


@router.get("/{landslide_id}", response_model=LandslideResponse)
async def get_landslide(
    landslide_id: uuid.UUID,
    svc: LandslideService = Depends(get_service),
) -> LandslideResponse:
    obj = await svc.get(landslide_id)
    return _enrich(obj)


@router.patch("/{landslide_id}", response_model=LandslideResponse)
async def update_landslide(
    landslide_id: uuid.UUID,
    data: LandslideUpdate,
    svc: LandslideService = Depends(get_service),
) -> LandslideResponse:
    obj = await svc.update(landslide_id, data)
    return _enrich(obj)


@router.delete("/{landslide_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_landslide(
    landslide_id: uuid.UUID,
    svc: LandslideService = Depends(get_service),
) -> None:
    await svc.delete(landslide_id)
