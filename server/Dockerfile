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

# Copy application code
COPY . .

# Expose port (HuggingFace Spaces uses 7860)
EXPOSE 7860

# Run application (change port to 7860)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]