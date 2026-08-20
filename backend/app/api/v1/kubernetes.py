from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/namespaces")
def get_kubernetes_namespaces(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"name": "default", "status": "Active", "age": "120d"},
        {"name": "kube-system", "status": "Active", "age": "120d"},
        {"name": "production", "status": "Active", "age": "45d"},
        {"name": "staging", "status": "Active", "age": "45d"},
    ]

@router.get("/deployments")
def get_kubernetes_deployments(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"name": "backend-api", "namespace": "production", "ready": "3/3", "up_to_date": "3", "available": "3", "age": "12d"},
        {"name": "frontend-ui", "namespace": "production", "ready": "2/2", "up_to_date": "2", "available": "2", "age": "12d"},
        {"name": "redis-cache", "namespace": "production", "ready": "1/1", "up_to_date": "1", "available": "1", "age": "40d"},
    ]

@router.get("/pods")
def get_kubernetes_pods(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"name": "backend-api-7c98d6-xk4p", "namespace": "production", "ready": "1/1", "status": "Running", "restarts": "0", "age": "2d"},
        {"name": "backend-api-7c98d6-yt2m", "namespace": "production", "ready": "1/1", "status": "Running", "restarts": "0", "age": "2d"},
        {"name": "backend-api-7c98d6-zw9l", "namespace": "production", "ready": "1/1", "status": "Running", "restarts": "1", "age": "2d"},
        {"name": "frontend-ui-5f4c8b-abc1", "namespace": "production", "ready": "1/1", "status": "Running", "restarts": "0", "age": "1d"},
    ]

@router.get("/services")
def get_kubernetes_services(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"name": "backend-svc", "namespace": "production", "type": "ClusterIP", "cluster_ip": "10.96.0.10", "external_ip": "<none>", "ports": "8000/TCP"},
        {"name": "frontend-svc", "namespace": "production", "type": "LoadBalancer", "cluster_ip": "10.96.0.11", "external_ip": "34.120.45.67", "ports": "80:31234/TCP"},
    ]

@router.post("/deployments/{name}/scale")
def scale_kubernetes_deployment(
    name: str,
    replicas: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    return {"message": f"Deployment {name} scaled to {replicas} replicas."}

@router.post("/pods/{name}/restart")
def restart_kubernetes_pod(
    name: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    return {"message": f"Pod {name} deleted. ReplicaSet will recreate it."}
