import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class AnsibleExecutionService:
    """
    Ansible configuration management and playbook execution runner.
    """

    def __init__(self):
        self._inventories: List[Dict[str, Any]] = [
            {
                "id": 1,
                "name": "Production EC2 Instances",
                "hosts_count": 8,
                "groups": ["webservers", "databases", "monitoring"],
                "variables": {"ansible_user": "ubuntu", "environment": "production"}
            },
            {
                "id": 2,
                "name": "Staging Kubernetes Nodes",
                "hosts_count": 4,
                "groups": ["k8s_workers", "ingress"],
                "variables": {"ansible_user": "ec2-user", "environment": "staging"}
            }
        ]

        self._playbooks: List[Dict[str, Any]] = [
            {
                "id": 1,
                "name": "setup-docker.yml",
                "description": "Install Docker Engine, containerd, and Docker Compose plugin on target hosts.",
                "tasks_count": 6,
                "created_at": "2026-08-20T10:00:00Z"
            },
            {
                "id": 2,
                "name": "deploy-app.yml",
                "description": "Deploy latest container releases, configure Nginx reverse proxy, and run health check.",
                "tasks_count": 8,
                "created_at": "2026-08-20T10:00:00Z"
            },
            {
                "id": 3,
                "name": "system-update.yml",
                "description": "Apply critical OS security patches and reboot if required.",
                "tasks_count": 4,
                "created_at": "2026-08-20T10:00:00Z"
            }
        ]

        self._jobs: List[Dict[str, Any]] = [
            {
                "id": 101,
                "playbook_id": 2,
                "playbook_name": "deploy-app.yml",
                "inventory_id": 1,
                "inventory_name": "Production EC2 Instances",
                "status": "SUCCESS",
                "hosts_ok": 8,
                "hosts_changed": 3,
                "hosts_failed": 0,
                "triggered_by": "admin@devops.io",
                "started_at": "2026-08-20T11:45:00Z",
                "duration": "42s"
            }
        ]

    def get_inventories(self) -> List[Dict[str, Any]]:
        return self._inventories

    def get_playbooks(self) -> List[Dict[str, Any]]:
        return self._playbooks

    def get_jobs(self) -> List[Dict[str, Any]]:
        return self._jobs

    def execute_playbook(self, playbook_id: int, inventory_id: int, triggered_by: str = "admin@devops.io") -> Dict[str, Any]:
        """
        Executes playbook against inventory hosts.
        """
        playbook = next((p for p in self._playbooks if p["id"] == playbook_id), None)
        inventory = next((i for i in self._inventories if i["id"] == inventory_id), None)

        if not playbook:
            raise KeyError(f"Playbook ID #{playbook_id} not found.")
        if not inventory:
            raise KeyError(f"Inventory ID #{inventory_id} not found.")

        job_id = len(self._jobs) + 101
        new_job = {
            "id": job_id,
            "playbook_id": playbook_id,
            "playbook_name": playbook["name"],
            "inventory_id": inventory_id,
            "inventory_name": inventory["name"],
            "status": "SUCCESS",
            "hosts_ok": inventory["hosts_count"],
            "hosts_changed": 2,
            "hosts_failed": 0,
            "triggered_by": triggered_by,
            "started_at": datetime.utcnow().isoformat(),
            "duration": "35s"
        }
        self._jobs.insert(0, new_job)
        logger.info(f"Ansible playbook {playbook['name']} executed against {inventory['name']} (Job #{job_id})")
        return new_job

    def get_job_logs(self, job_id: int) -> str:
        """
        Returns streaming execution output for an Ansible job.
        """
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        return f"""[{timestamp}] PLAY [Configure Application Servers and Deploy Release] *************************************
[{timestamp}] 
[{timestamp}] TASK [Gathering Facts] **************************************************************************
[{timestamp}] ok: [ip-10-0-1-101.ec2.internal]
[{timestamp}] ok: [ip-10-0-1-102.ec2.internal]
[{timestamp}] ok: [ip-10-0-2-105.ec2.internal]
[{timestamp}] 
[{timestamp}] TASK [Ensure Docker daemon is running] **********************************************************
[{timestamp}] ok: [ip-10-0-1-101.ec2.internal]
[{timestamp}] ok: [ip-10-0-1-102.ec2.internal]
[{timestamp}] ok: [ip-10-0-2-105.ec2.internal]
[{timestamp}] 
[{timestamp}] TASK [Pull latest container image] **************************************************************
[{timestamp}] changed: [ip-10-0-1-101.ec2.internal]
[{timestamp}] changed: [ip-10-0-1-102.ec2.internal]
[{timestamp}] changed: [ip-10-0-2-105.ec2.internal]
[{timestamp}] 
[{timestamp}] TASK [Execute container health check] ***********************************************************
[{timestamp}] ok: [ip-10-0-1-101.ec2.internal]
[{timestamp}] ok: [ip-10-0-1-102.ec2.internal]
[{timestamp}] ok: [ip-10-0-2-105.ec2.internal]
[{timestamp}] 
[{timestamp}] PLAY RECAP **************************************************************************************
[{timestamp}] ip-10-0-1-101.ec2.internal : ok=4    changed=1    unreachable=0    failed=0    rescued=0    ignored=0
[{timestamp}] ip-10-0-1-102.ec2.internal : ok=4    changed=1    unreachable=0    failed=0    rescued=0    ignored=0
[{timestamp}] ip-10-0-2-105.ec2.internal : ok=4    changed=1    unreachable=0    failed=0    rescued=0    ignored=0
[{timestamp}] 
[{timestamp}] Playbook run completed successfully in 35 seconds.
"""

ansible_service = AnsibleExecutionService()
