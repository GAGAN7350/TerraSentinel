"""Auth endpoint tests — validate HTTP behavior (no live DB needed for 422)."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_invalid_email_returns_422(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "not-an-email", "password": "secret123", "full_name": "Test"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_short_password_returns_422(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "a@b.com", "password": "short", "full_name": "Test"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_missing_fields_returns_422(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/register", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_missing_fields_returns_422(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/login", data={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_me_without_token_returns_401(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_with_invalid_token_returns_401(client: AsyncClient) -> None:
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert response.status_code == 401
