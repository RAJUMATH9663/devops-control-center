from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from app.api import deps
from app.models.user import User
import random

router = APIRouter()

@router.get("/dora")
def get_dora_metrics(
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    return {
        "deployment_frequency": "Multiple per day",
        "lead_time_for_changes": "1.2 hours",
        "mean_time_to_restore": "15 minutes",
        "change_failure_rate": f"{round(random.uniform(0.5, 4.0), 1)}%",
        "status": "Elite"
    }

@router.get("/ai-insights")
def get_ai_insights(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"id": 1, "type": "cost", "title": "Idle EKS Cluster Detected", "message": "The staging-aws-infrastructure cluster has had < 5% CPU utilization for 48 hours. Consider downscaling to save $120/mo.", "severity": "medium"},
        {"id": 2, "type": "security", "title": "Critical Trivy Vuln", "message": "devops/frontend:latest has a new CRITICAL CVE. I recommend triggering a rebuild with updated base images.", "severity": "high"},
        {"id": 3, "type": "performance", "title": "Database Optimization", "message": "Postgres CPU spikes correlating with missing indices on the `audit_logs` table. Running `CREATE INDEX` will improve dashboard load times by 40%.", "severity": "low"},
    ]
