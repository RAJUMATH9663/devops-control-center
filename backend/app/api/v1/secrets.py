from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.services.vault_service import vault_service
from app.services.audit_service import audit_service

router = APIRouter()

class SecretCreateRequest(BaseModel):
    path: str
    data: Dict[str, Any]

class MaskTestRequest(BaseModel):
    text: str

class MaskTestResponse(BaseModel):
    original: str
    masked: str
    is_modified: bool

@router.get("/paths", response_model=List[str])
def list_secret_paths(
    current_user: User = Depends(deps.get_current_active_user),
) -> List[str]:
    """
    List all configured secret paths in HashiCorp Vault.
    """
    return vault_service.list_secret_paths()

@router.get("/view", response_model=Dict[str, Any])
def get_secret_metadata(
    path: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Retrieve secret metadata and keys from Vault with masked sensitive values.
    """
    secret = vault_service.get_secret(path)
    if not secret:
        raise HTTPException(status_code=404, detail=f"Secret at path '{path}' not found.")

    # Record access in audit log
    audit_service.record_event(
        db=db,
        user_id=current_user.id,
        action="SECRET_ACCESS",
        resource=path
    )

    # Return keys with masked values for security
    masked_payload = {}
    for k, v in secret.items():
        if isinstance(v, str):
            masked_payload[k] = "••••••••••••••••" if len(v) > 4 else "••••"
        else:
            masked_payload[k] = v

    return {"path": path, "keys": list(secret.keys()), "masked_data": masked_payload}

@router.post("/", response_model=Dict[str, Any])
def create_or_update_secret(
    request: SecretCreateRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Dict[str, Any]:
    """
    Store or update a secret in Vault.
    """
    success = vault_service.set_secret(request.path, request.data)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to store secret in Vault.")

    audit_service.record_event(
        db=db,
        user_id=current_user.id,
        action="SECRET_CREATE_OR_UPDATE",
        resource=request.path,
        details={"keys_updated": list(request.data.keys())}
    )

    return {"message": f"Secret successfully stored at {request.path}", "path": request.path}

@router.post("/mask-test", response_model=MaskTestResponse)
def test_secret_masking(
    request: MaskTestRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Test the automatic secret masking filter on raw text or log snippets.
    """
    masked = vault_service.mask_secrets(request.text)
    return {
        "original": request.text,
        "masked": masked,
        "is_modified": masked != request.text
    }

@router.get("/audit", response_model=List[Dict[str, Any]])
def get_audit_trail(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> List[Dict[str, Any]]:
    """
    Retrieve security audit trail.
    """
    logs = audit_service.get_logs(db=db, skip=skip, limit=limit)
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "resource": l.resource,
            "details": l.details,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None,
        }
        for l in logs
    ]
