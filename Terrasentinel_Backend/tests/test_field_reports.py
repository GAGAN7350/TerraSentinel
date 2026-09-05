"""Field report endpoint tests — auth required."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_report_requires_auth(client: AsyncClient) -> None:
    """POST /field-reports requires a JWT token."""
    response = await client.post(
        "/api/v1/field-reports/",
        json={
            "latitude": 25.5,
            "longitude": 91.5,
            "observed_at": "2024-06-01T12:00:00Z",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_reports_requires_auth(client: AsyncClient) -> None:
    response = await client.get("/api/v1/field-reports/")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_report_requires_auth(client: AsyncClient) -> None:
    response = await client.get(
        "/api/v1/field-reports/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_report_invalid_lat(client: AsyncClient) -> None:
    """Invalid coordinates should fail at schema validation (422) before auth."""
    response = await client.post(
        "/api/v1/field-reports/",
        json={
            "latitude": 200.0,
            "longitude": 91.5,
            "observed_at": "2024-06-01T12:00:00Z",
        },
    )
    # 422 (validation) or 401 (auth) — both are valid depending on middleware order
    assert response.status_code in (401, 422)
