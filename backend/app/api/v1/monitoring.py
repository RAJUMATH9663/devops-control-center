from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from app.api import deps
from app.models.user import User
from app.services.monitoring_service import monitoring_service

router = APIRouter()

@router.get("/metrics")
def get_monitoring_metrics(
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Get live Prometheus metrics and system resource telemetry.
    """
    return monitoring_service.get_system_metrics()

@router.get("/alerts")
def get_monitoring_alerts(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    Get configured Prometheus alert rules and their firing states.
    """
    return monitoring_service.get_alert_rules()

@router.get("/logs")
def get_monitoring_logs(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"timestamp": "2026-08-20T12:35:12Z", "level": "ERROR", "service": "payment-api", "message": "Database connection timeout"},
        {"timestamp": "2026-08-20T12:35:10Z", "level": "WARN", "service": "auth-service", "message": "Rate limit exceeded for IP 192.168.1.5"},
        {"timestamp": "2026-08-20T12:35:05Z", "level": "INFO", "service": "frontend-ui", "message": "User login successful"},
        {"timestamp": "2026-08-20T12:34:55Z", "level": "INFO", "service": "worker-queue", "message": "Processed 150 background jobs"},
        {"timestamp": "2026-08-20T12:34:40Z", "level": "DEBUG", "service": "payment-api", "message": "Payload validation passed"},
    ]
