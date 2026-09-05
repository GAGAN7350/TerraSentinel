"""User management endpoints (admin operations)."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.session import get_async_session
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.user import UserResponse, UserUpdate
from app.services.user import UserService

router = APIRouter()


def _svc(session: AsyncSession = Depends(get_async_session)) -> UserService:
    return UserService(session)


@router.get("/", response_model=PaginatedResponse[UserResponse])
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    svc: UserService = Depends(_svc),
    _: User = Depends(get_current_user),
) -> PaginatedResponse[UserResponse]:
    users, total = await svc.list(page=page, page_size=page_size)
    return PaginatedResponse(
        items=[UserResponse.model_validate(u) for u in users],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    svc: UserService = Depends(_svc),
    _: User = Depends(get_current_user),
) -> UserResponse:
    user = await svc.get(user_id)
    return UserResponse.model_validate(user)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    svc: UserService = Depends(_svc),
    _: User = Depends(get_current_user),
) -> UserResponse:
    user = await svc.update(user_id, data)
    return UserResponse.model_validate(user)
