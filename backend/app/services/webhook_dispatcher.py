import hmac
import hashlib
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class GitHubWebhookDispatcher:
    """
    Handles GitHub Webhook events (push, pull_request, release) with HMAC-SHA256
    signature verification and automated CI/CD pipeline triggers.
    """

    def __init__(self, secret: str = "devops-github-webhook-secret-key-12345"):
        self.secret = secret
        self.delivery_history: List[Dict[str, Any]] = []

    def verify_signature(self, payload_body: bytes, signature_header: Optional[str]) -> bool:
        """
        Verifies HMAC-SHA256 signature in X-Hub-Signature-256 header.
        """
        if not signature_header:
            logger.warning("Missing X-Hub-Signature-256 header")
            return False

        if not signature_header.startswith("sha256="):
            return False

        expected_hash = signature_header.split("sha256=")[1]
        calculated_mac = hmac.new(
            self.secret.encode("utf-8"),
            payload_body,
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(calculated_mac, expected_hash)

    def process_event(self, event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes webhook event and routes actions.
        """
        delivery_id = f"del_{int(datetime.utcnow().timestamp())}_{len(self.delivery_history) + 1}"
        repo_name = payload.get("repository", {}).get("full_name", "unknown/repo")
        sender = payload.get("sender", {}).get("login", "unknown_user")

        event_summary = {
            "id": delivery_id,
            "event": event_type,
            "repository": repo_name,
            "sender": sender,
            "status": "PROCESSED",
            "timestamp": datetime.utcnow().isoformat(),
            "actions_triggered": []
        }

        if event_type == "push":
            ref = payload.get("ref", "refs/heads/main")
            branch = ref.replace("refs/heads/", "")
            commit_hash = payload.get("after", "head")[:7]
            commit_msg = payload.get("head_commit", {}).get("message", "Commit")

            logger.info(f"GitHub push on {repo_name} ({branch}) by {sender}: {commit_hash} - {commit_msg}")
            event_summary["actions_triggered"].append(f"Triggered CI/CD Pipeline for branch '{branch}' (commit {commit_hash})")
            event_summary["actions_triggered"].append("Scheduled Trivy container vulnerability scan")

        elif event_type == "pull_request":
            action = payload.get("action", "opened")
            pr_number = payload.get("number", 0)
            pr_title = payload.get("pull_request", {}).get("title", "")

            logger.info(f"GitHub pull request #{pr_number} [{action}] on {repo_name}: {pr_title}")
            event_summary["actions_triggered"].append(f"Triggered PR Validation Tests for PR #{pr_number}")
            event_summary["actions_triggered"].append("Triggered SonarQube SAST Quality Gate")

        elif event_type == "release":
            action = payload.get("action", "published")
            tag = payload.get("release", {}).get("tag_name", "v1.0.0")

            logger.info(f"GitHub release {tag} [{action}] on {repo_name}")
            event_summary["actions_triggered"].append(f"Triggered Production Deployment Workflow for release '{tag}'")

        else:
            event_summary["actions_triggered"].append(f"Logged event '{event_type}'")

        self.delivery_history.insert(0, event_summary)
        # Keep last 50 deliveries
        if len(self.delivery_history) > 50:
            self.delivery_history.pop()

        return event_summary

    def get_history(self) -> List[Dict[str, Any]]:
        return self.delivery_history

webhook_dispatcher = GitHubWebhookDispatcher()
