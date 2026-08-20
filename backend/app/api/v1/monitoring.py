from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from app.api import deps
from app.models.user import User
import random

router = APIRouter()

@router.get("/metrics")
def get_monitoring_metrics(
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    return {
        "cpu_usage": round(random.uniform(20.0, 85.0), 1),
        "memory_usage": round(random.uniform(40.0, 95.0), 1),
        "active_connections": random.randint(150, 1500),
        "error_rate": round(random.uniform(0.01, 2.5), 2)
    }

@router.get("/alerts")
def get_monitoring_alerts(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"id": "ALR-001", "severity": "critical", "name": "High CPU Usage", "target": "prod-db-1", "started_at": "10 minutes ago"},
        {"id": "ALR-002", "severity": "warning", "name": "Disk Space Low", "target": "worker-node-3", "started_at": "2 hours ago"},
        {"id": "ALR-003", "severity": "info", "name": "Node Rebooted", "target": "worker-node-2", "started_at": "1 day ago"},
    ]

@router.get("/logs")
def get_monitoring_logs(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"timestamp": "2026-08-07T10:35:12Z", "level": "ERROR", "service": "payment-api", "message": "Database connection timeout"},
        {"timestamp": "2026-08-07T10:35:10Z", "level": "WARN", "service": "auth-service", "message": "Rate limit exceeded for IP 192.168.1.5"},
        {"timestamp": "2026-08-07T10:35:05Z", "level": "INFO", "service": "frontend-ui", "message": "User login successful"},
        {"timestamp": "2026-08-07T10:34:55Z", "level": "INFO", "service": "worker-queue", "message": "Processed 150 background jobs"},
        {"timestamp": "2026-08-07T10:34:40Z", "level": "DEBUG", "service": "payment-api", "message": "Payload validation passed"},
    ]
