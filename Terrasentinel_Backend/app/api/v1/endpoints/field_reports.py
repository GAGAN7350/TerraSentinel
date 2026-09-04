"""Field report endpoints."""

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas.field_report import FieldReportCreate, FieldReportResponse, FieldReportUpdate
from app.services.field_report import FieldReportService
from app.services.geo import geometry_to_geojson

router = APIRouter()


def get_service(
    session: AsyncSession = Depends(get_async_session),
) -> FieldReportService:
    return FieldReportService(session)


def _enrich(obj) -> FieldReportResponse:
    resp = FieldReportResponse.model_validate(obj)
    resp.geometry = geometry_to_geojson(obj.geometry)
    return resp


@router.post("/", response_model=FieldReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    data: FieldReportCreate,
    svc: FieldReportService = Depends(get_service),
) -> FieldReportResponse:
    obj = await svc.create(data)
    return _enrich(obj)


@router.get("/", response_model=list[FieldReportResponse])
async def list_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    svc: FieldReportService = Depends(get_service),
) -> list[FieldReportResponse]:
    items, _ = await svc.list(skip=skip, limit=limit)
    return [_enrich(i) for i in items]


@router.get("/{report_id}", response_model=FieldReportResponse)
async def get_report(
    report_id: uuid.UUID,
    svc: FieldReportService = Depends(get_service),
) -> FieldReportResponse:
    obj = await svc.get(report_id)
    return _enrich(obj)


@router.patch("/{report_id}", response_model=FieldReportResponse)
async def update_report(
    report_id: uuid.UUID,
    data: FieldReportUpdate,
    svc: FieldReportService = Depends(get_service),
) -> FieldReportResponse:
    obj = await svc.update(report_id, data)
    return _enrich(obj)


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: uuid.UUID,
    svc: FieldReportService = Depends(get_service),
) -> None:
    await svc.delete(report_id)
