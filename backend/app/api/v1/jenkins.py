import os
import time
from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
import httpx
from app.api import deps
from app.models.user import User

router = APIRouter()

# Mock data store for builds (fallback)
MOCK_BUILDS = {
    "backend-core-pipeline": [
        {"build_number": 42, "status": "SUCCESS", "duration": "4m 12s", "timestamp": "2026-08-07T09:15:00Z"},
        {"build_number": 41, "status": "FAILURE", "duration": "1m 30s", "timestamp": "2026-08-06T16:20:00Z"},
        {"build_number": 40, "status": "SUCCESS", "duration": "4m 05s", "timestamp": "2026-08-05T11:00:00Z"},
    ]
}

def get_jenkins_client() -> httpx.Client:
    url = os.getenv("JENKINS_URL")
    user = os.getenv("JENKINS_USER")
    token = os.getenv("JENKINS_API_TOKEN")
    
    if url and user and token:
        return httpx.Client(base_url=url, auth=(user, token), timeout=10.0)
    return None

@router.get("/jobs")
def get_jenkins_jobs(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    client = get_jenkins_client()
    if client:
        try:
            res = client.get("/api/json?tree=jobs[name,url,color,lastBuild[number,timestamp]]")
            if res.status_code == 200:
                return res.json().get("jobs", [])
        except Exception:
            pass
            
    # Fallback
    jobs = []
    for job_name, builds in MOCK_BUILDS.items():
        latest = builds[0] if builds else None
        jobs.append({
            "name": job_name,
            "url": f"https://jenkins.acme.corp/job/{job_name}",
            "last_build_number": latest["build_number"] if latest else 0,
            "status": latest["status"] if latest else "UNKNOWN",
            "last_build_time": latest["timestamp"] if latest else None
        })
    return jobs

@router.get("/builds/{job_name}")
def get_jenkins_builds(
    job_name: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    if job_name not in MOCK_BUILDS:
        raise HTTPException(status_code=404, detail="Job not found")
    return MOCK_BUILDS[job_name]

@router.post("/build/{job_name}")
def trigger_jenkins_build(
    job_name: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    if job_name not in MOCK_BUILDS:
        raise HTTPException(status_code=404, detail="Job not found")
        
    latest_build_number = MOCK_BUILDS[job_name][0]["build_number"] if MOCK_BUILDS[job_name] else 0
    new_build = {
        "build_number": latest_build_number + 1,
        "status": "BUILDING",
        "duration": "0s",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    MOCK_BUILDS[job_name].insert(0, new_build)
    return {"message": "Build triggered successfully", "build": new_build}

@router.post("/cancel/{job_name}/{build_number}")
def cancel_jenkins_build(
    job_name: str,
    build_number: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    if job_name in MOCK_BUILDS:
        for build in MOCK_BUILDS[job_name]:
            if build["build_number"] == build_number and build["status"] == "BUILDING":
                build["status"] = "ABORTED"
                return {"message": f"Build #{build_number} cancelled."}
    raise HTTPException(status_code=400, detail="Cannot cancel build (not running or not found).")

@router.get("/logs/{job_name}/{build_number}")
def get_jenkins_logs(
    job_name: str,
    build_number: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, str]:
    # Mock log stream
    logs = f"""Started by user Admin
Building in workspace /var/lib/jenkins/workspace/{job_name}
[WS-CLEANUP] Deleting project workspace...
[WS-CLEANUP] done
Fetching changes from the remote Git repository...
Checking out Revision a1b2c3d4 (refs/remotes/origin/main)
Commit message: "Update dependencies"
[Pipeline] node
Running on Jenkins-Worker-1 in /var/lib/jenkins/workspace/{job_name}
[Pipeline] {{
[Pipeline] stage
[Pipeline] {{ (Build)
[Pipeline] sh
+ npm ci
added 142 packages, and audited 143 packages in 12s
[Pipeline] }}
[Pipeline] // stage
[Pipeline] stage
[Pipeline] {{ (Test)
[Pipeline] sh
+ npm run test
PASS src/App.test.tsx
[Pipeline] }}
[Pipeline] // stage
[Pipeline] stage
[Pipeline] {{ (Deploy)
[Pipeline] sh
+ kubectl apply -f k8s/deployment.yaml
deployment.apps/backend-core configured
[Pipeline] }}
[Pipeline] // stage
[Pipeline] }}
[Pipeline] // node
[Pipeline] End of Pipeline
Finished: SUCCESS
"""
    return {"logs": logs}
