from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/sast")
def get_sast_metrics(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"project": "backend-core-service", "grade": "A", "bugs": 2, "vulnerabilities": 0, "code_smells": 14, "coverage": "87.5%", "last_scan": "2026-08-07T08:00:00Z"},
        {"project": "frontend-dashboard-ui", "grade": "B", "bugs": 1, "vulnerabilities": 1, "code_smells": 42, "coverage": "72.1%", "last_scan": "2026-08-06T15:30:00Z"},
        {"project": "payment-gateway", "grade": "A", "bugs": 0, "vulnerabilities": 0, "code_smells": 5, "coverage": "95.0%", "last_scan": "2026-08-07T09:15:00Z"},
    ]

@router.get("/images")
def get_image_scans(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"image": "devops/backend:latest", "critical": 0, "high": 2, "medium": 15, "low": 42, "status": "Passed", "last_scan": "2026-08-07T08:05:00Z"},
        {"image": "devops/frontend:latest", "critical": 1, "high": 5, "medium": 8, "low": 20, "status": "Failed", "last_scan": "2026-08-06T15:35:00Z"},
        {"image": "postgres:15", "critical": 0, "high": 0, "medium": 3, "low": 12, "status": "Passed", "last_scan": "2026-08-01T10:00:00Z"},
    ]

@router.get("/secrets")
def get_vault_secrets(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"engine": "kv-v2", "path": "secret/data/production/db-credentials", "version": 4, "created_at": "2026-07-15T09:00:00Z"},
        {"engine": "kv-v2", "path": "secret/data/production/api-keys", "version": 12, "created_at": "2026-08-01T14:20:00Z"},
        {"engine": "pki", "path": "pki/issue/internal-certs", "version": 1, "created_at": "2026-01-10T11:00:00Z"},
    ]

@router.post("/scan")
def trigger_security_scan(
    target: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    return {"message": f"Security scan triggered for target: {target}"}
