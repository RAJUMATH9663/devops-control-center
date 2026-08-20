from typing import Any, List, Dict
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.deployment import Deployment
from app.services.reports_service import reports_service

router = APIRouter()

@router.get("/dora")
def get_dora_metrics(
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Get DORA metrics breakdown and maturity classification.
    """
    return reports_service.generate_dora_metrics()

@router.get("/export/deployments")
def export_deployments_csv(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Response:
    """
    Export all deployments history as a downloadable CSV file.
    """
    deployments = db.query(Deployment).all()
    dep_dicts = [
        {
            "id": d.id,
            "pipeline_id": d.pipeline_id,
            "environment": d.environment,
            "status": d.status,
            "triggered_by": d.triggered_by,
            "timestamp": d.timestamp,
        }
        for d in deployments
    ]
    csv_content = reports_service.generate_deployments_csv(dep_dicts)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=deployments_report.csv"}
    )

@router.get("/ai-insights")
def get_ai_insights(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"id": 1, "type": "cost", "title": "Idle EKS Cluster Detected", "message": "The staging-aws-infrastructure cluster has had < 5% CPU utilization for 48 hours. Consider downscaling to save $120/mo.", "severity": "medium"},
        {"id": 2, "type": "security", "title": "Critical Trivy Vuln", "message": "devops/frontend:latest has a new CRITICAL CVE. I recommend triggering a rebuild with updated base images.", "severity": "high"},
        {"id": 3, "type": "performance", "title": "Database Optimization", "message": "Postgres CPU spikes correlating with missing indices on the `audit_logs` table. Running `CREATE INDEX` will improve dashboard load times by 40%.", "severity": "low"},
    ]
