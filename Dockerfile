FROM python:3.12-slim

WORKDIR /app

# Install system dependencies.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code.
COPY prompt_crafting/ ./prompt_crafting/
COPY alembic.ini .

# Create log directory.
RUN mkdir -p /app/logs/executions

EXPOSE 8000

CMD ["uvicorn", "prompt_crafting.main:app", "--host", "0.0.0.0", "--port", "8000"]
