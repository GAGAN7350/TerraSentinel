FROM python:3.12-slim

# --- system dependencies ---
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# --- working directory ---
WORKDIR /app

# --- Python dependencies ---
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Application source ---
COPY . .

# --- Non-root user for security ---
RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser:appuser /app
USER appuser

# --- Expose port ---
EXPOSE 8000

# --- Start command ---
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
