from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from app.api import deps
from app.models.user import User
from app.services.ansible_service import ansible_service

router = APIRouter()

@router.get("/inventories")
def get_ansible_inventories(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    List Ansible host inventories.
    """
    return ansible_service.get_inventories()

@router.get("/playbooks")
def get_ansible_playbooks(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    List available Ansible playbooks.
    """
    return ansible_service.get_playbooks()

@router.get("/jobs")
def get_ansible_jobs(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    List past and current Ansible execution jobs.
    """
    return ansible_service.get_jobs()

@router.post("/playbooks/{id}/execute")
def execute_ansible_playbook(
    id: int,
    inventory_id: int = Query(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Execute an Ansible playbook against an inventory.
    """
    try:
        job = ansible_service.execute_playbook(id, inventory_id, current_user.email)
        return {"message": "Playbook execution started", "job": job}
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/jobs/{id}/logs")
def get_ansible_job_logs(
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Stream live execution logs for an Ansible job.
    """
    logs = ansible_service.get_job_logs(id)
    return {"job_id": id, "logs": logs}
