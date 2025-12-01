# Chatbot Backend Dockerfile - Python Flask + ML Models
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for Prophet and sklearn
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create non-root user for security
RUN useradd -m -u 1001 python && \
    chown -R python:python /app

# Switch to non-root user
USER python

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5001/api/health')" || exit 1

# Start the application
CMD ["python", "main.py"]
