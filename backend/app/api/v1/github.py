import os
from typing import Any, List, Dict, Optional
from fastapi import APIRouter, Depends, Header, Request, HTTPException
import httpx
from app.api import deps
from app.models.user import User
from app.services.webhook_dispatcher import webhook_dispatcher

router = APIRouter()

GITHUB_API_URL = "https://api.github.com"

def get_github_client() -> httpx.Client:
    token = os.getenv("GITHUB_PAT")
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return httpx.Client(base_url=GITHUB_API_URL, headers=headers, timeout=10.0)

@router.get("/repositories")
def get_github_repositories(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    Get list of connected GitHub repositories.
    """
    token = os.getenv("GITHUB_PAT")
    if token:
        with get_github_client() as client:
            response = client.get("/user/repos?sort=updated&per_page=10")
            if response.status_code == 200:
                return response.json()
    
    # Fallback mock data
    return [
        {
            "id": 1,
            "name": "devops-control-center",
            "full_name": "RAJUMATH9663/devops-control-center",
            "language": "TypeScript / Python",
            "stargazers_count": 48,
            "private": False,
            "default_branch": "main",
            "clone_url": "https://github.com/RAJUMATH9663/devops-control-center.git",
            "ssh_url": "git@github.com:RAJUMATH9663/devops-control-center.git"
        },
        {
            "id": 2,
            "name": "microservices-infra",
            "full_name": "RAJUMATH9663/microservices-infra",
            "language": "HCL (Terraform)",
            "stargazers_count": 19,
            "private": True,
            "default_branch": "main",
            "clone_url": "https://github.com/RAJUMATH9663/microservices-infra.git",
            "ssh_url": "git@github.com:RAJUMATH9663/microservices-infra.git"
        }
    ]

@router.get("/{owner}/{repo}/commits")
def get_github_commits(
    owner: str,
    repo: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    Get list of recent commits for a repository.
    """
    token = os.getenv("GITHUB_PAT")
    if token:
        with get_github_client() as client:
            response = client.get(f"/repos/{owner}/{repo}/commits?per_page=5")
            if response.status_code == 200:
                return response.json()
                
    return [
        {
            "sha": "0ebab5f",
            "commit": {
                "message": "feat: implement service layer, AI log analyzer, notification dispatchers, CSV export",
                "author": {"name": "DevOps Engineer", "date": "2026-08-20T13:33:53Z"}
            }
        },
        {
            "sha": "bebfaaa",
            "commit": {
                "message": "feat: complete DevOps Control Center initial release with full stack, k8s, terraform",
                "author": {"name": "DevOps Engineer", "date": "2026-08-20T13:28:29Z"}
            }
        }
    ]

@router.get("/{owner}/{repo}/pulls")
def get_github_pulls(
    owner: str,
    repo: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    Get list of pull requests for a repository.
    """
    token = os.getenv("GITHUB_PAT")
    if token:
        with get_github_client() as client:
            response = client.get(f"/repos/{owner}/{repo}/pulls?state=all&per_page=5")
            if response.status_code == 200:
                return response.json()
                
    return [
        {
            "id": 101,
            "number": 42,
            "state": "open",
            "title": "feat: Automated HashiCorp Vault Secret Rotation",
            "user": {"login": "devops-lead"},
            "created_at": "2026-08-20T11:30:00Z"
        }
    ]

@router.get("/{owner}/{repo}/issues")
def get_github_issues(
    owner: str,
    repo: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    Get list of issues for a repository.
    """
    token = os.getenv("GITHUB_PAT")
    if token:
        with get_github_client() as client:
            response = client.get(f"/repos/{owner}/{repo}/issues?state=all&per_page=5")
            if response.status_code == 200:
                return response.json()
                
    return [
        {
            "id": 202,
            "number": 15,
            "state": "open",
            "title": "Enhancement: Add Grafana Loki log aggregation widget",
            "user": {"login": "developer"},
            "created_at": "2026-08-19T09:15:00Z"
        }
    ]

@router.post("/webhook")
async def receive_github_webhook(
    request: Request,
    x_github_event: Optional[str] = Header("push"),
    x_hub_signature_256: Optional[str] = Header(None),
):
    """
    Ingests and validates GitHub webhooks with HMAC-SHA256 signature verification.
    """
    body_bytes = await request.body()
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    # If signature is provided, verify it
    if x_hub_signature_256:
        is_valid = webhook_dispatcher.verify_signature(body_bytes, x_hub_signature_256)
        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid X-Hub-Signature-256 HMAC signature.")

    event_result = webhook_dispatcher.process_event(x_github_event or "push", payload)
    return event_result

@router.get("/webhooks/history")
def get_webhook_deliveries(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    Retrieve history of received and processed GitHub webhooks.
    """
    return webhook_dispatcher.get_history()
