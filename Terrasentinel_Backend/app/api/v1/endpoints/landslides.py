"""Landslide CRUD + geospatial endpoints."""

from __future__ import annotations

import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas.common import GeoJSONFeature, GeoJSONFeatureCollection, GeoJSONPoint, PaginatedResponse
from app.schemas.landslide import LandslideCreate, LandslideResponse, LandslideUpdate
from app.services.geo import geometry_to_geojson
from app.services.landslide import LandslideService

router = APIRouter()


def _svc(session: AsyncSession = Depends(get_async_session)) -> LandslideService:
    return LandslideService(session)


def _enrich(obj) -> LandslideResponse:
    resp = LandslideResponse.model_validate(obj)
    resp.geometry = geometry_to_geojson(obj.geom)
    return resp


def _to_feature(obj) -> GeoJSONFeature:
    resp = _enrich(obj)
    return GeoJSONFeature(
        geometry=resp.geometry,
        properties={
            "id": str(resp.id),
            "state": resp.state,
            "district": resp.district,
            "slide_name": resp.slide_name,
            "occurrence_date": str(resp.occurrence_date) if resp.occurrence_date else None,
            "source": resp.source,
        },
    )


@router.post("/", response_model=LandslideResponse, status_code=status.HTTP_201_CREATED)
async def create_landslide(
    data: LandslideCreate, svc: LandslideService = Depends(_svc)
) -> LandslideResponse:
    return _enrich(await svc.create(data))


@router.get("/", response_model=PaginatedResponse[LandslideResponse])
async def list_landslides(
    state: str | None = Query(None),
    district: str | None = Query(None),
    source: str | None = Query(None),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    svc: LandslideService = Depends(_svc),
) -> PaginatedResponse[LandslideResponse]:
    items, total = await svc.list_filtered(
        state=state, district=district, source=source,
        date_from=date_from, date_to=date_to,
        page=page, page_size=page_size,
    )
    return PaginatedResponse(
        items=[_enrich(i) for i in items],
        page=page, page_size=page_size, total=total,
    )


@router.get("/nearby", response_model=GeoJSONFeatureCollection)
async def landslides_nearby(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(10.0, gt=0),
    svc: LandslideService = Depends(_svc),
) -> GeoJSONFeatureCollection:
    """Return landslides within radius_km as a GeoJSON FeatureCollection."""
    items = await svc.find_near(latitude, longitude, radius_km)
    return GeoJSONFeatureCollection(features=[_to_feature(i) for i in items])


@router.get("/bbox", response_model=GeoJSONFeatureCollection)
async def landslides_bbox(
    min_lat: float = Query(...),
    min_lon: float = Query(...),
    max_lat: float = Query(...),
    max_lon: float = Query(...),
    svc: LandslideService = Depends(_svc),
) -> GeoJSONFeatureCollection:
    """Return landslides inside a bounding box as GeoJSON."""
    items = await svc.find_in_bbox(min_lat, min_lon, max_lat, max_lon)
    return GeoJSONFeatureCollection(features=[_to_feature(i) for i in items])


@router.get("/{landslide_id}", response_model=LandslideResponse)
async def get_landslide(
    landslide_id: uuid.UUID, svc: LandslideService = Depends(_svc)
) -> LandslideResponse:
    return _enrich(await svc.get(landslide_id))


@router.patch("/{landslide_id}", response_model=LandslideResponse)
async def update_landslide(
    landslide_id: uuid.UUID, data: LandslideUpdate, svc: LandslideService = Depends(_svc)
) -> LandslideResponse:
    return _enrich(await svc.update(landslide_id, data))


@router.delete("/{landslide_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def delete_landslide(
    landslide_id: uuid.UUID, svc: LandslideService = Depends(_svc)
) -> Response:
    await svc.delete(landslide_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
