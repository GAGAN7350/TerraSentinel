"""
Alembic migration environment.
Uses the sync database URL from app settings so that credentials
are never hardcoded.
"""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlalchemy.ext.asyncio import AsyncEngine

# Import Base so Alembic can auto-detect model changes
from app.db.base import Base
import app.models  # noqa: F401 — registers all ORM models with metadata

from app.core.config import settings

# ------------------------------------------------------------------ #
# Alembic Config object
# ------------------------------------------------------------------ #
config = context.config

# Set the SQLAlchemy URL from app settings (overrides alembic.ini)
config.set_main_option("sqlalchemy.url", settings.sync_database_url)

# Logging setup
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# ------------------------------------------------------------------ #
# Migration runners
# ------------------------------------------------------------------ #


def run_migrations_offline() -> None:
    """Emit SQL without connecting — useful for reviewing generated SQL."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against a live database connection."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
