"""
Authentication and security utilities.

- Password hashing via bcrypt (passlib)
- JWT access token creation and verification (python-jose)
- FastAPI dependency: get_current_user
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import AuthenticationError
from app.db.session import get_async_session

# ------------------------------------------------------------------ #
# Password hashing
# ------------------------------------------------------------------ #

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Return bcrypt hash of a plaintext password."""
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if *plain* matches *hashed*."""
    return _pwd_context.verify(plain, hashed)


# ------------------------------------------------------------------ #
# JWT tokens
# ------------------------------------------------------------------ #

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def create_access_token(subject: str, extra: dict[str, Any] | None = None) -> str:
    """Create a signed JWT access token.

    Args:
        subject: typically the user's UUID as a string.
        extra: additional claims to embed.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and verify a JWT access token.

    Raises AuthenticationError on any failure.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError as exc:
        raise AuthenticationError("Invalid or expired token.") from exc


# ------------------------------------------------------------------ #
# FastAPI dependency
# ------------------------------------------------------------------ #

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_async_session),
):
    """
    Dependency that resolves the current authenticated User from the JWT.
    Import the User model here (lazy import avoids circular imports).
    """
    from app.repositories.user import UserRepository

    payload = decode_access_token(token)
    user_id: str | None = payload.get("sub")
    if not user_id:
        raise AuthenticationError("Token missing subject.")

    import uuid
    repo = UserRepository(session)
    user = await repo.get(uuid.UUID(user_id))
    if not user or not user.is_active:
        raise AuthenticationError("User not found or inactive.")
    return user
