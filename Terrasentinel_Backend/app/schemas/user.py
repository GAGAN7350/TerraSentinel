"""Pydantic schemas for User / Field Officer endpoints."""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserCreate(BaseModel):
    """Payload required to create a new user."""

    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    role: UserRole = UserRole.VIEWER


class UserUpdate(BaseModel):
    """Fields that can be updated on an existing user."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    role: UserRole | None = None


class UserResponse(BaseModel):
    """User representation returned by the API — no password/internal fields."""

    id: uuid.UUID
    name: str
    email: str
    role: UserRole
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
