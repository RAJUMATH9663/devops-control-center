from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/")
def get_notifications(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    return [
        {"id": 1, "type": "alert", "message": "High CPU usage on prod-db-1", "time": "5m ago", "read": False},
        {"id": 2, "type": "success", "message": "Deployment backend-api successful", "time": "1h ago", "read": False},
        {"id": 3, "type": "info", "message": "New security scan available for devops/frontend", "time": "2h ago", "read": True},
    ]

@router.post("/channels")
def add_notification_channel(
    channel_type: str,
    target: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    return {"message": f"Successfully configured {channel_type} notifications to {target}"}
