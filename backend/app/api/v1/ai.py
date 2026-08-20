from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.api import deps
from app.models.user import User
from app.services.ai_service import ai_service

router = APIRouter()

class LogAnalysisRequest(BaseModel):
    log_text: str
    context: Optional[str] = "general"

class LogAnalysisResponse(BaseModel):
    status: str
    summary: str
    root_cause: str
    severity: str
    suggested_fixes: List[str]
    fix_commands: List[str]
    confidence: str

@router.post("/analyze-logs", response_model=LogAnalysisResponse)
def analyze_logs(
    request: LogAnalysisRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    AI-powered log analysis: parses raw logs and returns root cause diagnosis and fix commands.
    """
    return ai_service.analyze_logs(request.log_text, request.context or "general")

@router.get("/recommendations")
def get_ai_recommendations(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    Get AI-driven cost, security, and performance recommendations for infrastructure.
    """
    return ai_service.get_recommendations()
