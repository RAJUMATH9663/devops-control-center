import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class KubernetesClusterService:
    """
    Kubernetes cluster management service for deployments, pods, scaling, and logs.
    """

    def __init__(self):
        # In-memory simulated cluster state
        self._deployments = [
            {"id": "dep-001", "name": "devops-backend", "namespace": "devops-control-center", "replicas": 2, "available": 2, "image": "devops/backend:latest", "status": "Running"},
            {"id": "dep-002", "name": "devops-frontend", "namespace": "devops-control-center", "replicas": 2, "available": 2, "image": "devops/frontend:latest", "status": "Running"},
            {"id": "dep-003", "name": "devops-postgres", "namespace": "devops-control-center", "replicas": 1, "available": 1, "image": "postgres:15-alpine", "status": "Running"},
        ]
        self._pods = [
            {"id": "pod-001", "name": "devops-backend-7c598d9f4-k8w2q", "namespace": "devops-control-center", "deployment": "devops-backend", "status": "Running", "restarts": 0, "node": "ip-10-0-1-102.ec2.internal", "age": "2d"},
            {"id": "pod-002", "name": "devops-backend-7c598d9f4-x9p1z", "namespace": "devops-control-center", "deployment": "devops-backend", "status": "Running", "restarts": 0, "node": "ip-10-0-2-105.ec2.internal", "age": "2d"},
            {"id": "pod-003", "name": "devops-frontend-6b47c88b-m2n4v", "namespace": "devops-control-center", "deployment": "devops-frontend", "status": "Running", "restarts": 0, "node": "ip-10-0-1-102.ec2.internal", "age": "2d"},
            {"id": "pod-004", "name": "devops-frontend-6b47c88b-t7q8p", "namespace": "devops-control-center", "deployment": "devops-frontend", "status": "Running", "restarts": 0, "node": "ip-10-0-2-105.ec2.internal", "age": "2d"},
            {"id": "pod-005", "name": "devops-postgres-0", "namespace": "devops-control-center", "deployment": "devops-postgres", "status": "Running", "restarts": 0, "node": "ip-10-0-1-102.ec2.internal", "age": "5d"},
        ]

    def get_namespaces(self) -> List[str]:
        return ["default", "kube-system", "devops-control-center", "monitoring", "ingress-nginx"]

    def get_deployments(self, namespace: Optional[str] = None) -> List[Dict[str, Any]]:
        if namespace:
            return [d for d in self._deployments if d["namespace"] == namespace]
        return self._deployments

    def get_pods(self, namespace: Optional[str] = None) -> List[Dict[str, Any]]:
        if namespace:
            return [p for p in self._pods if p["namespace"] == namespace]
        return self._pods

    def scale_deployment(self, name: str, replicas: int, namespace: str = "devops-control-center") -> Dict[str, Any]:
        """
        Scales the number of replicas for a deployment.
        """
        if replicas < 0 or replicas > 20:
            raise ValueError("Replicas must be between 0 and 20")

        for dep in self._deployments:
            if dep["name"] == name and dep["namespace"] == namespace:
                old_replicas = dep["replicas"]
                dep["replicas"] = replicas
                dep["available"] = replicas
                logger.info(f"Scaled deployment {name} in {namespace} from {old_replicas} to {replicas}")
                return {
                    "deployment": name,
                    "namespace": namespace,
                    "previous_replicas": old_replicas,
                    "current_replicas": replicas,
                    "status": "Scaled"
                }

        raise KeyError(f"Deployment '{name}' in namespace '{namespace}' not found.")

    def restart_pod(self, name: str, namespace: str = "devops-control-center") -> Dict[str, Any]:
        """
        Triggers a restart of the specified pod.
        """
        for pod in self._pods:
            if pod["name"] == name and pod["namespace"] == namespace:
                pod["restarts"] += 1
                pod["age"] = "10s"
                logger.info(f"Pod {name} in {namespace} restarted.")
                return {
                    "pod": name,
                    "namespace": namespace,
                    "restarts": pod["restarts"],
                    "status": "Restarted"
                }

        raise KeyError(f"Pod '{name}' in namespace '{namespace}' not found.")

    def get_pod_logs(self, name: str, namespace: str = "devops-control-center") -> str:
        """
        Returns live logs for a pod.
        """
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        return f"""[{timestamp} INFO] [k8s-pod: {name}] Application worker listening on 0.0.0.0:8000
[{timestamp} INFO] [k8s-pod: {name}] Health check probe GET /api/v1/health responded 200 OK (latency: 1.2ms)
[{timestamp} INFO] [k8s-pod: {name}] Database connection pool initialized with 10 connections.
[{timestamp} INFO] [k8s-pod: {name}] Prometheus metrics exporter active at /metrics.
[{timestamp} INFO] [k8s-pod: {name}] Ready to handle ingress requests.
"""

k8s_service = KubernetesClusterService()
