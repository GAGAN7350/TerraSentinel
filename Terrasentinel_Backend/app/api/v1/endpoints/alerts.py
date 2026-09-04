"""Alert endpoints."""

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas.alert import AlertCreate, AlertResponse, AlertUpdate
from app.services.alert import AlertService

router = APIRouter()


def get_service(session: AsyncSession = Depends(get_async_session)) -> AlertService:
    return AlertService(session)


@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    data: AlertCreate,
    svc: AlertService = Depends(get_service),
) -> AlertResponse:
    obj = await svc.create(data)
    return AlertResponse.model_validate(obj)


@router.get("/", response_model=list[AlertResponse])
async def list_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    svc: AlertService = Depends(get_service),
) -> list[AlertResponse]:
    items, _ = await svc.list(skip=skip, limit=limit)
    return [AlertResponse.model_validate(i) for i in items]


@router.get("/active", response_model=list[AlertResponse])
async def list_active_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    svc: AlertService = Depends(get_service),
) -> list[AlertResponse]:
    """Return only currently active (unacknowledged) alerts."""
    items = await svc.find_active(skip=skip, limit=limit)
    return [AlertResponse.model_validate(i) for i in items]


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: uuid.UUID,
    svc: AlertService = Depends(get_service),
) -> AlertResponse:
    obj = await svc.get(alert_id)
    return AlertResponse.model_validate(obj)


@router.patch("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: uuid.UUID,
    data: AlertUpdate,
    svc: AlertService = Depends(get_service),
) -> AlertResponse:
    obj = await svc.update(alert_id, data)
    return AlertResponse.model_validate(obj)
