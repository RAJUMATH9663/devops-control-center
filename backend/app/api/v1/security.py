from typing import Any, List, Dict, Optional
from fastapi import APIRouter, Depends, Query
from app.api import deps
from app.models.user import User
from app.services.security_scanner_service import security_scanner_service

router = APIRouter()

@router.get("/sonarqube/status")
def get_sonarqube_quality_gate(
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Get live SonarQube quality gate and SAST analysis status.
    """
    return security_scanner_service.get_sonarqube_status()

@router.post("/trivy/scan")
def trigger_trivy_scan(
    target: str = Query("repo"),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Execute Trivy vulnerability and misconfiguration scan.
    """
    return security_scanner_service.run_trivy_scan(target)

@router.get("/compliance")
def get_compliance_scorecard(
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Get CIS Benchmark, OWASP Top 10, and SOC2 compliance scorecard.
    """
    return security_scanner_service.get_compliance_score()

@router.get("/sast")
def get_sast_metrics(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"project": "devops-control-center-backend", "grade": "A", "bugs": 0, "vulnerabilities": 0, "code_smells": 3, "coverage": "94.2%", "last_scan": "2026-08-20T12:00:00Z"},
        {"project": "devops-control-center-frontend", "grade": "A", "bugs": 0, "vulnerabilities": 0, "code_smells": 5, "coverage": "91.8%", "last_scan": "2026-08-20T12:00:00Z"},
        {"project": "infrastructure-terraform", "grade": "A", "bugs": 0, "vulnerabilities": 0, "code_smells": 0, "coverage": "100%", "last_scan": "2026-08-20T12:00:00Z"},
    ]

@router.get("/images")
def get_image_scans(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"image": "devops-control-center-backend:1.0.0", "critical": 0, "high": 0, "medium": 1, "low": 2, "status": "Passed", "last_scan": "2026-08-20T12:00:00Z"},
        {"image": "devops-control-center-frontend:1.0.0", "critical": 0, "high": 0, "medium": 0, "low": 1, "status": "Passed", "last_scan": "2026-08-20T12:00:00Z"},
        {"image": "postgres:15-alpine", "critical": 0, "high": 0, "medium": 0, "low": 0, "status": "Passed", "last_scan": "2026-08-20T12:00:00Z"},
    ]

@router.get("/secrets")
def get_vault_secrets(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"engine": "kv-v2", "path": "secret/data/production/database", "version": 4, "created_at": "2026-08-20T08:00:00Z"},
        {"engine": "kv-v2", "path": "secret/data/production/api-keys", "version": 2, "created_at": "2026-08-20T08:00:00Z"},
        {"engine": "kv-v2", "path": "secret/data/production/jwt", "version": 1, "created_at": "2026-08-20T08:00:00Z"},
    ]

@router.post("/scan")
def trigger_security_scan(
    target: str = "all",
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    return {"message": f"Security scan triggered for target: {target}"}
