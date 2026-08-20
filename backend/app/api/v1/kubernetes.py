from typing import Any, List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from app.api import deps
from app.models.user import User
from app.services.k8s_service import k8s_service

router = APIRouter()

class ScaleRequest(BaseModel):
    replicas: int
    namespace: Optional[str] = "devops-control-center"

@router.get("/namespaces")
def get_kubernetes_namespaces(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"name": "default", "status": "Active", "age": "120d"},
        {"name": "kube-system", "status": "Active", "age": "120d"},
        {"name": "devops-control-center", "status": "Active", "age": "45d"},
        {"name": "monitoring", "status": "Active", "age": "45d"},
        {"name": "ingress-nginx", "status": "Active", "age": "45d"},
    ]

@router.get("/deployments")
def get_kubernetes_deployments(
    namespace: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return k8s_service.get_deployments(namespace)

@router.get("/pods")
def get_kubernetes_pods(
    namespace: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return k8s_service.get_pods(namespace)

@router.get("/services")
def get_kubernetes_services(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"name": "devops-backend-svc", "namespace": "devops-control-center", "type": "ClusterIP", "cluster_ip": "10.96.0.10", "external_ip": "<none>", "ports": "8000/TCP"},
        {"name": "devops-frontend-svc", "namespace": "devops-control-center", "type": "LoadBalancer", "cluster_ip": "10.96.0.11", "external_ip": "34.120.45.67", "ports": "80:31234/TCP"},
        {"name": "devops-postgres-svc", "namespace": "devops-control-center", "type": "ClusterIP", "cluster_ip": "10.96.0.12", "external_ip": "<none>", "ports": "5432/TCP"},
    ]

@router.post("/deployments/{name}/scale")
def scale_kubernetes_deployment(
    name: str,
    request: ScaleRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Scale the number of running replicas for a Kubernetes deployment.
    """
    try:
        return k8s_service.scale_deployment(name, request.replicas, request.namespace or "devops-control-center")
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/pods/{name}/restart")
def restart_kubernetes_pod(
    name: str,
    namespace: str = Query("devops-control-center"),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Triggers a rolling restart of a pod.
    """
    try:
        return k8s_service.restart_pod(name, namespace)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/pods/{name}/logs")
def get_kubernetes_pod_logs(
    name: str,
    namespace: str = Query("devops-control-center"),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Retrieve live log output for a pod.
    """
    logs = k8s_service.get_pod_logs(name, namespace)
    return {"pod": name, "namespace": namespace, "logs": logs}
