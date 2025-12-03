# Add to your Dockerfile (before COPY . .)
FROM python:3.10.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download SentenceTransformer model during build
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2', cache_folder='/app/models_cache')"

# Force cache bust - change timestamp to force rebuild
RUN echo "Build timestamp: 2025-12-03T13:31:00Z"

# Copy application code
COPY . .

# Expose port (HuggingFace Spaces uses 7860)
EXPOSE 7860

# Run application (change port to 7860)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]