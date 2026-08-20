from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from app.api import deps
from app.models.user import User
import time

router = APIRouter()

MOCK_RUNS = {
    "prod-aws-infrastructure": [
        {"id": "run-1234", "type": "apply", "status": "applied", "created_at": "2026-08-01T10:00:00Z"},
        {"id": "run-1233", "type": "plan", "status": "planned", "created_at": "2026-08-01T09:45:00Z"}
    ]
}

@router.get("/workspaces")
def get_terraform_workspaces(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"name": "prod-aws-infrastructure", "environment": "production", "provider": "AWS", "terraform_version": "1.5.0", "last_updated": "2026-08-01T10:00:00Z"},
        {"name": "staging-aws-infrastructure", "environment": "staging", "provider": "AWS", "terraform_version": "1.5.0", "last_updated": "2026-07-28T14:20:00Z"},
        {"name": "global-dns-cloudflare", "environment": "global", "provider": "Cloudflare", "terraform_version": "1.4.2", "last_updated": "2026-06-15T08:11:00Z"},
    ]

@router.get("/workspaces/{name}/runs")
def get_terraform_runs(
    name: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return MOCK_RUNS.get(name, [])

@router.post("/workspaces/{name}/plan")
def trigger_terraform_plan(
    name: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    if name not in MOCK_RUNS:
        MOCK_RUNS[name] = []
    
    new_run = {
        "id": f"run-{int(time.time())}",
        "type": "plan",
        "status": "planning",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    MOCK_RUNS[name].insert(0, new_run)
    return {"message": "Plan triggered successfully", "run": new_run}

@router.post("/workspaces/{name}/apply")
def trigger_terraform_apply(
    name: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    if name not in MOCK_RUNS:
        MOCK_RUNS[name] = []
        
    new_run = {
        "id": f"run-{int(time.time())}",
        "type": "apply",
        "status": "applying",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    MOCK_RUNS[name].insert(0, new_run)
    return {"message": "Apply triggered successfully", "run": new_run}
