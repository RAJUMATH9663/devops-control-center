from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from app.api import deps
from app.models.user import User
from app.services.terraform_service import terraform_service

router = APIRouter()

@router.get("/workspaces")
def get_terraform_workspaces(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    Get list of Terraform workspaces.
    """
    return terraform_service.get_workspaces()

@router.get("/workspaces/{name}/runs")
def get_terraform_runs(
    name: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    Get run history for a Terraform workspace.
    """
    return terraform_service.get_runs(name)

@router.post("/workspaces/{name}/plan")
def trigger_terraform_plan(
    name: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Run `terraform plan` on the target workspace.
    """
    run = terraform_service.trigger_plan(name, current_user.email)
    return {"message": "Plan generated successfully", "run": run}

@router.post("/workspaces/{name}/apply")
def trigger_terraform_apply(
    name: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Run `terraform apply` on the target workspace.
    """
    run = terraform_service.trigger_apply(name, current_user.email)
    return {"message": "Apply executed successfully", "run": run}

@router.get("/workspaces/{name}/state")
def get_terraform_state(
    name: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Inspect workspace state outputs.
    """
    return terraform_service.get_state(name)

@router.get("/runs/{run_id}/logs")
def get_terraform_run_logs(
    run_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Get console output for a Terraform plan or apply run.
    """
    logs = terraform_service.get_run_logs(run_id)
    return {"run_id": run_id, "logs": logs}
