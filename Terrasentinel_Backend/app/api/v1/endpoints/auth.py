"""
Authentication endpoints.

POST /api/v1/auth/register  — create account
POST /api/v1/auth/login     — get JWT token
GET  /api/v1/auth/me        — current user info (requires token)
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.session import get_async_session
from app.models.user import User
from app.schemas.user import TokenResponse, UserRegister, UserResponse
from app.services.user import UserService

router = APIRouter()


def _svc(session: AsyncSession = Depends(get_async_session)) -> UserService:
    return UserService(session)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(data: UserRegister, svc: UserService = Depends(_svc)) -> UserResponse:
    """Create a new user account (ADMIN or OFFICER)."""
    user = await svc.register(data)
    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive JWT token",
)
async def login(
    form: OAuth2PasswordRequestForm = Depends(),
    svc: UserService = Depends(_svc),
) -> TokenResponse:
    """
    Authenticate with email + password (OAuth2 password flow).
    Returns a JWT bearer token.
    """
    token = await svc.login(form.username, form.password)
    return TokenResponse(access_token=token)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
async def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Return the profile of the currently authenticated user."""
    return UserResponse.model_validate(current_user)
