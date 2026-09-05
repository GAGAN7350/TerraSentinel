"""Settings / configuration tests."""

from __future__ import annotations

import pytest

from app.core.config import settings


def test_settings_load() -> None:
    assert settings is not None


def test_app_name() -> None:
    assert settings.APP_NAME == "TerraSentinel"


def test_cors_origins_is_list() -> None:
    assert isinstance(settings.CORS_ORIGINS, list)
    assert len(settings.CORS_ORIGINS) > 0


def test_async_database_url_has_asyncpg() -> None:
    assert "asyncpg" in settings.async_database_url


def test_sync_database_url_has_psycopg2() -> None:
    assert "psycopg2" in settings.sync_database_url


def test_secret_key_present() -> None:
    assert settings.SECRET_KEY
    assert len(settings.SECRET_KEY) > 0


def test_access_token_expire_minutes_positive() -> None:
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES > 0
