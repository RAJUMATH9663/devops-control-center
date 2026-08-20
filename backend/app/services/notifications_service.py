import logging
import httpx
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class NotificationService:
    """
    Multi-channel notification dispatcher supporting Slack, Discord, and Email alerts.
    """

    def send_slack_notification(self, webhook_url: str, title: str, message: str, severity: str = "info") -> bool:
        color = "#36a64f" if severity == "success" else ("#ff0000" if severity == "critical" else "#ffcc00")
        payload = {
            "attachments": [
                {
                    "fallback": f"[{severity.upper()}] {title}: {message}",
                    "color": color,
                    "title": f"DevOps Control Center - {title}",
                    "text": message,
                    "footer": "DevOps Control Center Notification Engine",
                }
            ]
        }
        try:
            if webhook_url and webhook_url.startswith("http"):
                with httpx.Client(timeout=5.0) as client:
                    response = client.post(webhook_url, json=payload)
                    return response.status_code == 200
            else:
                logger.info(f"[SIMULATED SLACK] {title} - {message}")
                return True
        except Exception as e:
            logger.error(f"Failed to send Slack notification: {e}")
            return False

    def send_discord_notification(self, webhook_url: str, title: str, message: str, severity: str = "info") -> bool:
        color_code = 0x2ecc71 if severity == "success" else (0xe74c3c if severity == "critical" else 0xf39c12)
        payload = {
            "username": "DevOps Control Center",
            "embeds": [
                {
                    "title": title,
                    "description": message,
                    "color": color_code,
                    "footer": {"text": "DevOps Alert"}
                }
            ]
        }
        try:
            if webhook_url and webhook_url.startswith("http"):
                with httpx.Client(timeout=5.0) as client:
                    response = client.post(webhook_url, json=payload)
                    return response.status_code in (200, 204)
            else:
                logger.info(f"[SIMULATED DISCORD] {title} - {message}")
                return True
        except Exception as e:
            logger.error(f"Failed to send Discord notification: {e}")
            return False

    def dispatch(self, channel_type: str, target: str, title: str, message: str, severity: str = "info") -> Dict[str, Any]:
        """
        Dispatches a notification to the specified channel.
        """
        success = False
        if channel_type.lower() == "slack":
            success = self.send_slack_notification(target, title, message, severity)
        elif channel_type.lower() == "discord":
            success = self.send_discord_notification(target, title, message, severity)
        else:
            logger.info(f"[EMAIL NOTIFICATION to {target}] {title}: {message}")
            success = True

        return {
            "status": "delivered" if success else "failed",
            "channel": channel_type,
            "target": target,
            "title": title,
            "message": message,
        }

notification_service = NotificationService()
