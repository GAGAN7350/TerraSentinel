"""User / auth business logic."""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationError, ConflictError, NotFoundError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserRegister, UserUpdate


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = UserRepository(session)

    async def register(self, data: UserRegister) -> User:
        if await self.repo.get_by_email(data.email):
            raise ConflictError(f"Email '{data.email}' is already registered.")
        user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            full_name=data.full_name,
            role=data.role,
        )
        return await self.repo.create(user)

    async def login(self, email: str, password: str) -> str:
        """Authenticate and return a JWT access token."""
        user = await self.repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise AuthenticationError("Invalid email or password.")
        if not user.is_active:
            raise AuthenticationError("Account is inactive.")
        return create_access_token(str(user.id), {"role": user.role.value})

    async def get(self, user_id: uuid.UUID) -> User:
        user = await self.repo.get(user_id)
        if not user:
            raise NotFoundError(f"User '{user_id}' not found.")
        return user

    async def list(self, page: int = 1, page_size: int = 50) -> tuple[list[User], int]:
        skip = (page - 1) * page_size
        users = await self.repo.list(skip=skip, limit=page_size)
        total = await self.repo.count()
        return users, total

    async def update(self, user_id: uuid.UUID, data: UserUpdate) -> User:
        user = await self.get(user_id)
        return await self.repo.update(user, data.model_dump(exclude_unset=True))
