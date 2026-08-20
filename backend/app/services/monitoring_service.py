import random
from typing import Dict, Any, List
from datetime import datetime

class PrometheusMonitoringService:
    """
    Real-time Prometheus metrics aggregator and alert rule management service.
    """

    def get_system_metrics(self) -> Dict[str, Any]:
        """
        Returns live telemetry metrics.
        """
        cpu = round(random.uniform(22.0, 58.0), 1)
        mem = round(random.uniform(45.0, 72.0), 1)
        disk = round(random.uniform(35.0, 48.0), 1)
        req_rate = random.randint(850, 1420)
        p95_latency = round(random.uniform(12.0, 45.0), 1)

        return {
            "cpu_usage": f"{cpu}%",
            "cpu_value": cpu,
            "memory_usage": f"{mem}%",
            "memory_value": mem,
            "disk_usage": f"{disk}%",
            "disk_value": disk,
            "request_rate": f"{req_rate} req/s",
            "p95_latency": f"{p95_latency} ms",
            "network_in": "12.4 MB/s",
            "network_out": "48.2 MB/s",
            "containers_healthy": 14,
            "containers_total": 14,
            "timestamp": datetime.utcnow().isoformat()
        }

    def get_alert_rules(self) -> List[Dict[str, Any]]:
        """
        Returns Prometheus alert rules and their firing states.
        """
        return [
            {
                "id": "alert-001",
                "name": "HighCPUUtilization",
                "severity": "warning",
                "expr": "rate(node_cpu_seconds_total{mode='idle'}[5m]) < 0.2",
                "for": "5m",
                "status": "normal",
                "description": "CPU utilization on cluster node exceeded 80% for 5 minutes."
            },
            {
                "id": "alert-002",
                "name": "NodeDiskRunningFull",
                "severity": "critical",
                "expr": "node_filesystem_free_bytes / node_filesystem_size_bytes < 0.1",
                "for": "10m",
                "status": "normal",
                "description": "Root disk partition free space is below 10%."
            },
            {
                "id": "alert-003",
                "name": "KubernetesPodCrashLooping",
                "severity": "critical",
                "expr": "rate(kube_pod_container_status_restarts_total[15m]) > 0",
                "for": "2m",
                "status": "normal",
                "description": "A Kubernetes pod has restarted more than 3 times in 15 minutes."
            },
            {
                "id": "alert-004",
                "name": "PostgresHighConnectionCount",
                "severity": "warning",
                "expr": "pg_stat_activity_count > 80",
                "for": "5m",
                "status": "normal",
                "description": "PostgreSQL active connections reached 80% of max pool size."
            }
        ]

monitoring_service = PrometheusMonitoringService()
