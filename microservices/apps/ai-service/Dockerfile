# ============================================
# Dockerfile for AI Service (FastAPI + Python)
# Build context: microservices/apps/ai-service/
# ============================================

FROM python:3.11-slim AS production

WORKDIR /app

# OpenMP runtime for LightGBM/XGBoost; Python dependencies use binary wheels.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for layer caching
COPY requirements.txt constraints-cpu.txt ./
# Use PyTorch's CPU index only for Torch, then PyPI for the application packages.
RUN pip install --no-cache-dir --only-binary=:all: \
      --index-url https://download.pytorch.org/whl/cpu \
      -c constraints-cpu.txt torch \
    && pip install --no-cache-dir --only-binary=:all: \
      -c constraints-cpu.txt -r requirements.txt \
    && pip check

# Verify native imports and reject accidental GPU dependencies before publishing.
COPY verify_cpu_runtime.py .
RUN python verify_cpu_runtime.py

# Copy application code
COPY . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/docs')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
