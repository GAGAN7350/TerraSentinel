"""User / Field Officer CRUD endpoints."""

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.user import UserService

router = APIRouter()


def get_user_service(session: AsyncSession = Depends(get_async_session)) -> UserService:
    return UserService(session)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    svc: UserService = Depends(get_user_service),
) -> UserResponse:
    """Create a new system user."""
    user = await svc.create_user(data)
    return UserResponse.model_validate(user)


@router.get("/", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    svc: UserService = Depends(get_user_service),
) -> list[UserResponse]:
    """Return a paginated list of users."""
    users, _ = await svc.list_users(skip=skip, limit=limit)
    return [UserResponse.model_validate(u) for u in users]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    svc: UserService = Depends(get_user_service),
) -> UserResponse:
    """Retrieve a single user by ID."""
    user = await svc.get_user(user_id)
    return UserResponse.model_validate(user)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    svc: UserService = Depends(get_user_service),
) -> UserResponse:
    """Update mutable fields of a user."""
    user = await svc.update_user(user_id, data)
    return UserResponse.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: uuid.UUID,
    svc: UserService = Depends(get_user_service),
) -> None:
    """Delete a user by ID."""
    await svc.delete_user(user_id)
