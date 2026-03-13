from fastapi import FastAPI
from app.core.config import settings
from app.api import documents, chat, user, admin
from app.core.database import init_db
from app.services.vector_store import create_qdrant_collection
from prometheus_fastapi_instrumentator import Instrumentator
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from app.telemetry import tracer
from contextlib import asynccontextmanager
from fastapi import Request
from app.utils.metrics import API_REQUEST_TOTAL
from fastapi.middleware.cors import CORSMiddleware

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    try:
        create_qdrant_collection()
    except Exception as e:
        print(f"Error initializing Qdrant: {e}")
        
    yield
    

# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
# Middleware pour incrémenter le compteur sur chaque requête
@app.middleware("http")
async def count_requests(request: Request, call_next):
    response = await call_next(request)

    endpoint = request.url.path
    status = str(response.status_code)

    if endpoint != "/metrics":
        API_REQUEST_TOTAL.labels(
            status=status,
            endpoint=endpoint
        ).inc()

    return response

# Instrumentator pour exposer les metrics existantes (CPU, RAM, HTTP Latency)
instrumentator = Instrumentator().instrument(app).expose(app)

# OpenTelemetry instrumentation
FastAPIInstrumentor.instrument_app(app)
# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
@app.get("/")
async def root():
    return {"message": "CliniQ API is running", "environment": settings.ENVIRONMENT}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# !::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
app.include_router(user.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
