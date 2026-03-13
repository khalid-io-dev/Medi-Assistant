# CliniQ - Medical Assistant API

A FastAPI-based medical assistant application using RAG (Retrieval Augmented Generation) with LangChain, ChromaDB/Ollama for healthcare question answering.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Running with Docker](#running-with-docker)
- [Running with Docker Compose](#running-with-docker-compose)
- [Testing](#testing)
- [Deployment to Azure](#deployment-to-azure)
- [API Documentation](#api-documentation)
- [Monitoring](#monitoring)

## Prerequisites

- Python 3.10+
- Docker & Docker Compose
- Azure CLI (for deployment)
- Terraform (for infrastructure)
- PostgreSQL (for local development)
- Ollama (for local LLM) or Ngrok tunnel (for production)

## Project Structure

```
BackEnd/
├── app/                    # Application code
│   ├── api/               # API endpoints
│   ├── core/              # Core configurations
│   ├── mlops/             # MLOps utilities
│   ├── models/            # Database models
│   ├── repositories/       # Data access layer
│   ├── schemas/           # Pydantic schemas
│   ├── security/          # Security utilities
│   ├── services/           # Business logic
│   └── utils/             # Utility functions
├── data/                   # Data files (PDFs)
├── monitoring/             # Monitoring configs
├── tests/                  # Unit tests
├── terraform/              # Infrastructure code
├── .env.example           # Environment template
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose config
└── requirements.txt       # Python dependencies
```

## Installation

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd Medi-Assistant/BackEnd

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=11520

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=CliniQ

# Qdrant (local development)
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_URL=http://localhost:6333

# ChromaDB (production)
CHROMA_DB_PATH=/chroma_data

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

## Running Locally

### Option 1: With Local Ollama

1. **Install and start Ollama:**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Start Ollama service
   ollama serve
   
   # Pull required models (in another terminal)
   ollama pull llama3.1
   ollama pull nomic-embed-text
   ```

2. **Start the database:**
   ```bash
   # Using Docker
   docker run -d -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=CliniQ -p 5432:5432 postgres:15-alpine
   ```

3. **Start Qdrant (vector database):**
   ```bash
   docker run -d -p 6333:6333 qdrant/qdrant:latest
   ```

4. **Run the application:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Option 2: With Ngrok (Production-like)

If you want to test with the Ngrok endpoint:

1. **Set Ngrok URL in .env:**
   ```env
   NGROK_OLLAMA_URL=https://your-ngrok-url.ngrok-free.dev
   OLLAMA_MODEL=thirdeyeai/DeepSeek-R1-Distill-Qwen-7B-uncensored:Q8_0
   ```

2. **Run the application:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Running with Docker

### Build the Docker Image

```bash
docker build -t cliniq:latest .
```

### Run the Container

```bash
docker run -d \
  --name cliniq \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://postgres:password@host:5432/CliniQ \
  -e QDRANT_URL=http://host:6333 \
  -e OLLAMA_BASE_URL=http://host:11434 \
  -v /path/to/data:/chroma_data \
  cliniq:latest
```

## Running with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services:
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432
- Qdrant: localhost:6333
- Ollama: localhost:11434
- MLflow: http://localhost:5000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

## Testing

### Run All Tests

```bash
pytest -v
```

### Run Specific Tests

```bash
# API tests
pytest tests/api/ -v

# Service tests
pytest tests/services/ -v

# Repository tests
pytest tests/repositories/ -v
```

### Run with Coverage

```bash
pytest --cov=app --cov-report=html
```

## Deployment to Azure

### Prerequisites

1. **Azure CLI:**
   ```bash
   az login
   az account set --subscription="YOUR-SUBSCRIPTION-ID"
   ```

2. **Terraform:**
   ```bash
   # Install Terraform (if not installed)
   brew install terraform  # macOS
   # or choco install terraform -y  # Windows
   ```

### Step 1: Deploy Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -out=tfplan

# Apply deployment
terraform apply tfplan
```

### Step 2: Build and Push Docker Image

```bash
# Build image
docker build -t cliniq:latest .

# Tag for Azure Container Registry
docker tag cliniq:latest cliniqregistry.azurecr.io/cliniq:latest

# Login to Azure
az acr login --name cliniqregistry

# Push to ACR
docker push cliniqregistry.azurecr.io/cliniq:latest
```

### Step 3: Deploy Container App

```bash
# Update container app with new image
az containerapp update \
  --name cliniq-api \
  --resource-group cliniq-rg \
  --image cliniqregistry.azurecr.io/cliniq:latest
```

### Step 4: Configure Environment Variables

```bash
# Set environment variables in Container App
az containerapp update \
  --name cliniq-api \
  --resource-group cliniq-rg \
  --set-env-vars \
    DATABASE_URL="postgresql://user:password@server:5432/db" \
    NGROK_OLLAMA_URL="https://your-ngrok-url.ngrok-free.dev" \
    CHROMA_DB_PATH="/chroma_data"
```

## API Documentation

Once the application is running, visit:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

### Available Endpoints

- `POST /api/v1/chat/` - Ask a medical question
- `GET /api/v1/chat/history/{user_id}` - Get user chat history
- `GET /api/v1/chat/stats` - Get user statistics
- `POST /api/v1/documents/upload` - Upload medical documents
- `GET /api/v1/documents/` - List uploaded documents
- `GET /health` - Health check

## Monitoring

### Prometheus Metrics

Access metrics at: http://localhost:8000/metrics

### Grafana Dashboards

Access at: http://localhost:3000 (admin/admin)

### OpenTelemetry

Traces are exported to console by default. To configure Azure Monitor:

```python
# In app/telemetry.py
from opentelemetry.exporter.azure_monitor import AzureMonitorTraceExporter

exporter = AzureMonitorTraceExporter(
    connection_string="your-connection-string"
)
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(exporter)
)
```

## Troubleshooting

### Common Issues

1. **Database Connection Error:**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env

2. **Ollama Connection Error:**
   - Ensure Ollama is running: `ollama serve`
   - Check OLLAMA_BASE_URL in .env
   - For production, verify Ngrok tunnel is active

3. **Vector Store Error:**
   - For Qdrant: Ensure Qdrant container is running
   - For ChromaDB: Check CHROMA_DB_PATH is accessible

4. **Port Already in Use:**
   - Kill process on port: `lsof -ti:8000 | xargs kill -9`

## License

MIT License
