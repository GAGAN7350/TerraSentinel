"""Alert endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.models.alert import AlertSeverity, AlertStatus
from app.schemas.alert import AlertCreate, AlertResponse, AlertUpdate
from app.schemas.common import PaginatedResponse
from app.services.alert import AlertService
from app.services.geo import geometry_to_geojson

router = APIRouter()


def _svc(session: AsyncSession = Depends(get_async_session)) -> AlertService:
    return AlertService(session)


def _enrich(obj) -> AlertResponse:
    resp = AlertResponse.model_validate(obj)
    resp.geometry = geometry_to_geojson(obj.geom)
    return resp


@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    data: AlertCreate, svc: AlertService = Depends(_svc)
) -> AlertResponse:
    return _enrich(await svc.create(data))


@router.get("/", response_model=PaginatedResponse[AlertResponse])
async def list_alerts(
    severity: AlertSeverity | None = Query(None),
    status_filter: AlertStatus | None = Query(None, alias="status"),
    state: str | None = Query(None),
    district: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    svc: AlertService = Depends(_svc),
) -> PaginatedResponse[AlertResponse]:
    items, total = await svc.list_filtered(
        severity=severity, status=status_filter,
        state=state, district=district,
        page=page, page_size=page_size,
    )
    return PaginatedResponse(
        items=[_enrich(i) for i in items],
        page=page, page_size=page_size, total=total,
    )


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: uuid.UUID, svc: AlertService = Depends(_svc)
) -> AlertResponse:
    return _enrich(await svc.get(alert_id))


@router.patch("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: uuid.UUID, data: AlertUpdate, svc: AlertService = Depends(_svc)
) -> AlertResponse:
    return _enrich(await svc.update(alert_id, data))
