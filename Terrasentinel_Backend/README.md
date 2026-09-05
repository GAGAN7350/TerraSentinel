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

## API Endpoints (Phase 1 & Phase 2 Implemented)

Base URL: `http://localhost:8000/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health check (returns status, version, app name) |
| **Authentication & Users** | | |
| POST | `/auth/register` | Register new user account (ADMIN / OFFICER) |
| POST | `/auth/login` | Login with credentials to obtain OAuth2 JWT token |
| GET | `/auth/me` | Retrieve profile of authenticated user |
| GET | `/users/` | List users (paginated, requires token) |
| GET | `/users/{id}` | Get user by ID (requires token) |
| PATCH | `/users/{id}` | Update user profile (requires token) |
| **Landslides** | | |
| POST | `/landslides/` | Record a landslide event (GSI/NRSC/etc.) |
| GET | `/landslides/` | List events (paginated with filters: state, district, source, date_from, date_to) |
| GET | `/landslides/nearby` | Spatial proximity query (`latitude`, `longitude`, `radius_km`) |
| GET | `/landslides/bbox` | Bounding box spatial query (`min_lat`, `min_lon`, `max_lat`, `max_lon`) |
| GET | `/landslides/{id}` | Get landslide record by ID |
| PATCH | `/landslides/{id}` | Update landslide record |
| DELETE | `/landslides/{id}` | Delete landslide record |
| **Rainfall Observations** | | |
| POST | `/rainfall/` | Record a rainfall observation |
| GET | `/rainfall/` | List observations (paginated with filters) |
| GET | `/rainfall/nearby` | Spatial proximity query for observations |
| GET | `/rainfall/{id}` | Get observation by ID |
| **Risk Predictions (Storage Contract)** | | |
| POST | `/risk-predictions/` | Store risk prediction payload |
| GET | `/risk-predictions/` | List predictions (paginated) |
| GET | `/risk-predictions/nearby` | Proximity risk search |
| GET | `/risk-predictions/{id}` | Get prediction by ID |
| GET | `/risk-predictions/risk-map` | GeoJSON risk map features |
| **Alerts** | | |
| POST | `/alerts/` | Create an alert record |
| GET | `/alerts/` | List alerts (paginated with filters) |
| GET | `/alerts/{id}` | Get alert by ID |
| PATCH | `/alerts/{id}` | Update alert status |
| **Field Reports** | | |
| POST | `/field-reports/` | Submit a field report (requires authentication) |
| GET | `/field-reports/` | List field reports (paginated, requires token) |
| GET | `/field-reports/{id}` | Get field report by ID (requires token) |
| PATCH | `/field-reports/{id}` | Update field report (requires token) |
| DELETE | `/field-reports/{id}` | Delete field report (requires token) |

Interactive Swagger UI docs: `http://localhost:8000/docs`

---

## Seed Demo Data

Populate development database with realistic North-East India (NER) records:

```bash
python scripts/seed_demo_data.py
```

This creates demo users (`admin@terrasentinel.demo`, `officer@terrasentinel.demo`), landslide inventory records, rainfall observations, risk predictions, alerts, and field reports.

---

## Running Tests

```bash
# Run complete test suite (70 tests)
pytest

# Verbose output
pytest -v
```

---

## Development Workflow

1. Make code changes
2. If models changed: `alembic revision --autogenerate -m "your message"` then `alembic upgrade head`
3. Run `pytest` to verify all tests pass
4. Start the API locally: `python -m uvicorn app.main:app --reload`

---

## Future Components (Phase 3+)

- ML risk calculation & inference pipeline
- Automated ETL / ingestion pipelines (IMD, GPM IMERG, ISRO)
- Redis caching for spatial risk maps
- Event streaming (Kafka) for high-frequency sensor streams
- Celery / background worker tasks
- SMS / push notification service delivery
- Object storage integration for field report media attachments

