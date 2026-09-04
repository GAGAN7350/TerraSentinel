# TerraSentinel Backend

**AI-powered Landslide Early Warning and Risk Intelligence System — North-East India**

---

## Overview

TerraSentinel is a geospatial risk intelligence platform designed to monitor landslide hazards across North-East India. This repository contains the backend API service — a modular monolith built on FastAPI and PostgreSQL/PostGIS that serves as the data backbone for dashboards, mobile field apps, and future ML inference pipelines.

---

## Architecture

```
External Data Sources (IMD, ISRO, GPM, DEM, etc.)
        │
        ▼  [future: ETL / Ingestion workers]
        │
        ▼  [future: Kafka event streams]
        │
        ▼  [future: ML Inference Service]
        │
  PostgreSQL + PostGIS  ←──────────────────────────────┐
        │                                               │
        ▼  [future: Redis Cache]                        │
        │                                               │
  FastAPI Backend API ──────────────────────────────────┘
        │
        ├── Web Dashboard
        └── Mobile Field App
```

### Folder Structure

```
Terrasentinel_Backend/
├── app/
│   ├── main.py              # FastAPI app factory
│   ├── api/
│   │   └── v1/
│   │       ├── router.py    # Master v1 router
│   │       └── endpoints/   # One file per domain
│   ├── core/
│   │   ├── config.py        # Settings (pydantic-settings)
│   │   └── exceptions.py    # Custom errors + handlers
│   ├── db/
│   │   ├── base.py          # DeclarativeBase + mixins
│   │   └── session.py       # Async engine + session factory
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic request/response schemas
│   ├── repositories/        # Data access layer (repository pattern)
│   └── services/            # Business logic layer
├── alembic/                 # Database migrations
├── tests/                   # pytest test suite
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── README.md
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Default | Description |
|---|---|---|
| `ENVIRONMENT` | `development` | `development` / `staging` / `production` |
| `DEBUG` | `true` | Enable SQLAlchemy query logging |
| `POSTGRES_HOST` | `localhost` | DB hostname (use `db` inside Docker) |
| `POSTGRES_PORT` | `5432` | DB port |
| `POSTGRES_USER` | `terrasentinel` | DB username |
| `POSTGRES_PASSWORD` | `terrasentinel_dev` | DB password |
| `POSTGRES_DB` | `terrasentinel` | Database name |
| `CORS_ORIGINS` | `http://localhost:3000,...` | Comma-separated allowed origins |
| `SECRET_KEY` | — | Replace with `openssl rand -hex 32` in production |

---

## Docker Commands

### Start services

```bash
docker-compose up -d
```

### Stop services

```bash
docker-compose down
```

### Destroy including volumes (destructive — removes all data)

```bash
docker-compose down -v
```

### View logs

```bash
docker-compose logs -f api
docker-compose logs -f db
```

---

## Migration Commands

All Alembic commands run from the `Terrasentinel_Backend/` directory.

### Generate a new migration

```bash
alembic revision --autogenerate -m "describe your change"
```

### Apply all pending migrations

```bash
alembic upgrade head
```

### Roll back one migration

```bash
alembic downgrade -1
```

### Show migration history

```bash
alembic history
```

---

## Setup Instructions

### Option A — Docker (recommended)

```bash
# 1. Copy and configure environment
cp .env.example .env

# 2. Start PostgreSQL + PostGIS
docker-compose up -d db

# 3. Install Python dependencies locally (for migrations and tests)
pip install -r requirements.txt

# 4. Run migrations
alembic upgrade head

# 5. Start the API
docker-compose up -d api

# 6. Verify
curl http://localhost:8000/api/v1/health
```

### Option B — Local development

```bash
# 1. Start only the database
docker-compose up -d db

# 2. Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate      # Linux/Mac
.venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment file
cp .env.example .env

# 5. Run migrations
alembic upgrade head

# 6. Start the API
uvicorn app.main:app --reload --port 8000
```

---

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service and database health check |
| **Users** | | |
| POST | `/users/` | Create a user |
| GET | `/users/` | List users (paginated) |
| GET | `/users/{id}` | Get user by ID |
| PATCH | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |
| **Landslides** | | |
| POST | `/landslides/` | Record a landslide event |
| GET | `/landslides/` | List events (paginated) |
| GET | `/landslides/near?lat=&lon=&radius_meters=` | Proximity search |
| GET | `/landslides/bbox?min_lon=&min_lat=&max_lon=&max_lat=` | Bounding box query |
| GET | `/landslides/{id}` | Get event by ID |
| PATCH | `/landslides/{id}` | Update event |
| DELETE | `/landslides/{id}` | Delete event |
| **Rainfall** | | |
| POST | `/rainfall/` | Record an observation |
| GET | `/rainfall/` | List observations (paginated) |
| GET | `/rainfall/near?lat=&lon=&radius_meters=` | Proximity search |
| GET | `/rainfall/range?start=&end=` | Time-range query |
| GET | `/rainfall/{id}` | Get observation by ID |
| PATCH | `/rainfall/{id}` | Update observation |
| DELETE | `/rainfall/{id}` | Delete observation |
| **Risk Predictions** | | |
| POST | `/risk/` | Store ML prediction |
| GET | `/risk/` | List predictions (paginated) |
| GET | `/risk/near?lat=&lon=&radius_meters=` | Proximity search |
| GET | `/risk/level/{risk_level}` | Filter by risk level |
| POST | `/risk/trigger?lat=&lon=` | Trigger ML job (placeholder) |
| GET | `/risk/{id}` | Get prediction by ID |
| **Alerts** | | |
| POST | `/alerts/` | Create an alert |
| GET | `/alerts/` | List alerts (paginated) |
| GET | `/alerts/active` | Active alerts only |
| GET | `/alerts/{id}` | Get alert by ID |
| PATCH | `/alerts/{id}` | Update alert status |
| **Field Reports** | | |
| POST | `/field-reports/` | Submit a field report |
| GET | `/field-reports/` | List reports (paginated) |
| GET | `/field-reports/{id}` | Get report by ID |
| PATCH | `/field-reports/{id}` | Update report |
| DELETE | `/field-reports/{id}` | Delete report |

Interactive docs: `http://localhost:8000/docs`

---

## Running Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=app --cov-report=term-missing

# Specific file
pytest tests/test_health.py -v
```

---

## Development Workflow

1. Make code changes
2. If models changed: `alembic revision --autogenerate -m "your message"` then `alembic upgrade head`
3. Run `pytest` to verify nothing is broken
4. Restart the API if running locally: `uvicorn app.main:app --reload`

---

## Future Components (not yet implemented)

- Authentication / RBAC (JWT)
- Redis caching for risk map data
- Background task queue (Celery / ARQ)
- Kafka event streaming for high-volume ingestion
- ML inference service integration
- IMD/ISRO/GPM data ingestion pipelines
- WebSocket / SSE live alert updates
- Object storage for field report media
- Audit logging
- Prometheus metrics / OpenTelemetry tracing
