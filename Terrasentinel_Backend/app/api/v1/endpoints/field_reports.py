"""Field report endpoints — requires authentication."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.session import get_async_session
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.field_report import FieldReportCreate, FieldReportResponse, FieldReportUpdate
from app.services.field_report import FieldReportService
from app.services.geo import geometry_to_geojson

router = APIRouter()


def _svc(session: AsyncSession = Depends(get_async_session)) -> FieldReportService:
    return FieldReportService(session)


def _enrich(obj) -> FieldReportResponse:
    resp = FieldReportResponse.model_validate(obj)
    resp.geometry = geometry_to_geojson(obj.geom)
    return resp


@router.post("/", response_model=FieldReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    data: FieldReportCreate,
    current_user: User = Depends(get_current_user),
    svc: FieldReportService = Depends(_svc),
) -> FieldReportResponse:
    """Submit a field observation. Requires authentication."""
    return _enrich(await svc.create(data, user_id=current_user.id))


@router.get("/", response_model=PaginatedResponse[FieldReportResponse])
async def list_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    _: User = Depends(get_current_user),
    svc: FieldReportService = Depends(_svc),
) -> PaginatedResponse[FieldReportResponse]:
    items, total = await svc.list_filtered(page=page, page_size=page_size)
    return PaginatedResponse(
        items=[_enrich(i) for i in items],
        page=page, page_size=page_size, total=total,
    )


@router.get("/{report_id}", response_model=FieldReportResponse)
async def get_report(
    report_id: uuid.UUID,
    _: User = Depends(get_current_user),
    svc: FieldReportService = Depends(_svc),
) -> FieldReportResponse:
    return _enrich(await svc.get(report_id))


@router.patch("/{report_id}", response_model=FieldReportResponse)
async def update_report(
    report_id: uuid.UUID,
    data: FieldReportUpdate,
    _: User = Depends(get_current_user),
    svc: FieldReportService = Depends(_svc),
) -> FieldReportResponse:
    return _enrich(await svc.update(report_id, data))


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def delete_report(
    report_id: uuid.UUID,
    _: User = Depends(get_current_user),
    svc: FieldReportService = Depends(_svc),
) -> Response:
    await svc.delete(report_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
