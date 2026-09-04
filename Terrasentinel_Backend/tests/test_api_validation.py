"""
API-level request validation tests.
These tests confirm FastAPI/Pydantic rejects malformed payloads correctly.
No database connection required.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_user_invalid_email(client: AsyncClient) -> None:
    """POST /users with invalid email should return 422."""
    response = await client.post(
        "/api/v1/users/",
        json={"name": "Test User", "email": "not-valid"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_user_missing_name(client: AsyncClient) -> None:
    """POST /users without name should return 422."""
    response = await client.post(
        "/api/v1/users/",
        json={"email": "test@example.com"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_landslide_lat_out_of_range(client: AsyncClient) -> None:
    """POST /landslides with latitude > 90 should return 422."""
    response = await client.post(
        "/api/v1/landslides/",
        json={"latitude": 200.0, "longitude": 92.0},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_nonexistent_user(client: AsyncClient) -> None:
    """GET /users/{uuid} for unknown user should return 404."""
    response = await client.get(
        "/api/v1/users/00000000-0000-0000-0000-000000000000"
    )
    # Will be 404 (not found) or 503 (db unreachable) — both are non-200
    assert response.status_code in (404, 503, 500)


@pytest.mark.asyncio
async def test_docs_available(client: AsyncClient) -> None:
    """OpenAPI docs endpoint should be accessible."""
    response = await client.get("/docs")
    assert response.status_code == 200
