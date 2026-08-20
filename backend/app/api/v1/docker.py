from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/containers")
def get_docker_containers(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"id": "a1b2c3d4", "name": "backend-api", "image": "devops/backend:latest", "status": "running", "ports": "8000:8000", "created": "2026-08-01T00:00:00Z"},
        {"id": "e5f6g7h8", "name": "frontend-ui", "image": "devops/frontend:latest", "status": "running", "ports": "3000:80", "created": "2026-08-01T00:00:00Z"},
        {"id": "i9j0k1l2", "name": "postgres-db", "image": "postgres:15", "status": "exited", "ports": "5432:5432", "created": "2026-08-01T00:00:00Z"},
    ]

@router.get("/images")
def get_docker_images(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"id": "img1", "repository": "devops/backend", "tag": "latest", "size": "150MB", "created": "2 days ago"},
        {"id": "img2", "repository": "devops/frontend", "tag": "latest", "size": "45MB", "created": "2 days ago"},
        {"id": "img3", "repository": "postgres", "tag": "15", "size": "379MB", "created": "2 weeks ago"},
    ]

@router.get("/volumes")
def get_docker_volumes(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"name": "postgres_data", "driver": "local", "size": "2.1GB", "in_use": True},
        {"name": "redis_data", "driver": "local", "size": "0B", "in_use": False},
    ]

@router.get("/networks")
def get_docker_networks(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"id": "net1", "name": "devops_network", "driver": "bridge", "scope": "local"},
        {"id": "net2", "name": "host", "driver": "host", "scope": "local"},
        {"id": "net3", "name": "none", "driver": "null", "scope": "local"},
    ]

@router.post("/containers/{id}/restart")
def restart_docker_container(
    id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    return {"message": f"Container {id} restarted."}

@router.delete("/images/{id}")
def delete_docker_image(
    id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    return {"message": f"Image {id} deleted."}

@router.get("/containers/{id}/logs")
def get_docker_container_logs(
    id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, str]:
    logs = f"""[INFO] Starting container {id}
[INFO] Booting worker with pid: 1
[INFO] Application startup complete.
[WARN] Deprecation warning: engine initialization
[INFO] 127.0.0.1 - - [07/Aug/2026:10:00:00] "GET /api/v1/health HTTP/1.1" 200 -
"""
    return {"logs": logs}
