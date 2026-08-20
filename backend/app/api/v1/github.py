import os
from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx
from app.api import deps
from app.models.user import User

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
            "name": "backend-core-service",
            "full_name": "acme-corp/backend-core-service",
            "language": "Python",
            "stargazers_count": 12,
            "private": True,
            "default_branch": "main",
            "clone_url": "https://github.com/acme-corp/backend-core-service.git",
            "ssh_url": "git@github.com:acme-corp/backend-core-service.git"
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
                
    # Fallback mock data
    return [
        {
            "sha": "a1b2c3d4",
            "commit": {
                "message": f"Update dependencies for {repo}",
                "author": {"name": "Alice Engineer", "date": "2026-08-07T10:00:00Z"}
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
                
    # Fallback mock data
    return [
        {
            "id": 101,
            "number": 42,
            "state": "open",
            "title": "Feature: Advanced Caching",
            "user": {"login": "bob-dev"},
            "created_at": "2026-08-06T14:30:00Z"
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
                
    # Fallback mock data
    return [
        {
            "id": 202,
            "number": 15,
            "state": "open",
            "title": "Bug: Memory leak in background worker",
            "user": {"login": "alice-eng"},
            "created_at": "2026-08-05T09:15:00Z"
        }
    ]

@router.post("/webhook")
def receive_github_webhook(
    payload: Dict[str, Any],
):
    """
    Receive GitHub webhook payload (simulated).
    """
    print(f"Received webhook: {payload.get('action', 'unknown')}")
    return {"status": "success", "message": "Webhook received"}
