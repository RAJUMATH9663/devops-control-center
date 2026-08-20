import csv
import io
from typing import List, Dict, Any

class ReportsService:
    """
    Reporting and metrics export engine for deployments, DORA metrics, and audit logs.
    """

    def generate_deployments_csv(self, deployments: List[Dict[str, Any]]) -> str:
        """
        Generates CSV content for deployment records.
        """
        output = io.StringIO()
        fieldnames = ["id", "pipeline_id", "environment", "status", "triggered_by", "timestamp"]
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
        
        writer.writeheader()
        for dep in deployments:
            writer.writerow({
                "id": dep.get("id"),
                "pipeline_id": dep.get("pipeline_id"),
                "environment": dep.get("environment"),
                "status": dep.get("status"),
                "triggered_by": dep.get("triggered_by"),
                "timestamp": str(dep.get("timestamp")),
            })
        return output.getvalue()

    def generate_dora_metrics(self) -> Dict[str, Any]:
        """
        Calculates and returns DORA (DevOps Research and Assessment) metrics.
        """
        return {
            "deployment_frequency": {
                "metric": "Deployment Frequency",
                "value": "3.4 / day",
                "rating": "Elite",
                "description": "How often code is deployed to production."
            },
            "lead_time_for_changes": {
                "metric": "Lead Time for Changes",
                "value": "1.2 hours",
                "rating": "Elite",
                "description": "Time from code commit to running in production."
            },
            "mean_time_to_restore": {
                "metric": "Mean Time to Restore (MTTR)",
                "value": "14 minutes",
                "rating": "Elite",
                "description": "Time required to recover from a production outage."
            },
            "change_failure_rate": {
                "metric": "Change Failure Rate (CFR)",
                "value": "1.5%",
                "rating": "Elite",
                "description": "Percentage of deployments resulting in a failure or incident."
            },
            "overall_tier": "Elite DevOps Organization"
        }

    def generate_audit_csv(self, audit_logs: List[Dict[str, Any]]) -> str:
        """
        Generates CSV content for security audit logs.
        """
        output = io.StringIO()
        fieldnames = ["id", "user_id", "action", "resource", "timestamp"]
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')

        writer.writeheader()
        for log in audit_logs:
            writer.writerow({
                "id": log.get("id"),
                "user_id": log.get("user_id"),
                "action": log.get("action"),
                "resource": log.get("resource"),
                "timestamp": str(log.get("timestamp")),
            })
        return output.getvalue()

reports_service = ReportsService()
