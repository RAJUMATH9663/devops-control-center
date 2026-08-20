from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from app.api import deps
from app.models.user import User
import time

router = APIRouter()

MOCK_JOBS = []

@router.get("/inventories")
def get_ansible_inventories(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"id": 1, "name": "Production Web Servers", "hosts": 12, "source": "aws_ec2"},
        {"name": "Staging DB Cluster", "hosts": 3, "source": "static"},
        {"name": "Global Load Balancers", "hosts": 2, "source": "gcp_compute"},
    ]

@router.get("/playbooks")
def get_ansible_playbooks(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"id": 101, "name": "Update OS Packages", "description": "Runs apt/yum update and upgrade on all hosts."},
        {"id": 102, "name": "Deploy Nginx Config", "description": "Pushes latest nginx.conf and reloads service."},
        {"id": 103, "name": "Rotate SSH Keys", "description": "Rotates authorized_keys for service accounts."},
    ]

@router.get("/jobs")
def get_ansible_jobs(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return MOCK_JOBS

@router.post("/playbooks/{id}/execute")
def execute_ansible_playbook(
    id: int,
    inventory_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    new_job = {
        "id": f"job-{int(time.time())}",
        "playbook_id": id,
        "inventory_id": inventory_id,
        "status": "running",
        "started_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    MOCK_JOBS.insert(0, new_job)
    return {"message": "Playbook execution started", "job": new_job}
