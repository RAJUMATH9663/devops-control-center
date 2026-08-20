from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.init_db import init_db
from app.api.v1 import auth, projects, deployments, github, jenkins, docker, kubernetes, terraform, ansible, monitoring, security, notifications, reports, ai, websockets, secrets

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()
        logger.info("Database initialized successfully on startup.")
    except Exception as e:
        logger.warning(f"Database initialization skipped or deferred on startup: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Includes Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(projects.router, prefix=f"{settings.API_V1_STR}/projects", tags=["projects"])
app.include_router(deployments.router, prefix=f"{settings.API_V1_STR}/deployments", tags=["deployments"])
app.include_router(github.router, prefix=f"{settings.API_V1_STR}/github", tags=["github"])
app.include_router(jenkins.router, prefix=f"{settings.API_V1_STR}/jenkins", tags=["jenkins"])
app.include_router(docker.router, prefix=f"{settings.API_V1_STR}/docker", tags=["docker"])
app.include_router(kubernetes.router, prefix=f"{settings.API_V1_STR}/kubernetes", tags=["kubernetes"])
app.include_router(terraform.router, prefix=f"{settings.API_V1_STR}/terraform", tags=["terraform"])
app.include_router(ansible.router, prefix=f"{settings.API_V1_STR}/ansible", tags=["ansible"])
app.include_router(monitoring.router, prefix=f"{settings.API_V1_STR}/monitoring", tags=["monitoring"])
app.include_router(security.router, prefix=f"{settings.API_V1_STR}/security", tags=["security"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])
app.include_router(secrets.router, prefix=f"{settings.API_V1_STR}/secrets", tags=["secrets"])
app.include_router(websockets.router, prefix="/ws", tags=["websockets"])

@app.get("/")
def root():
    return {"message": "Welcome to DevOps Control Center API"}

@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    return {"status": "healthy", "service": "DevOps Control Center API", "version": "1.0.0"}
