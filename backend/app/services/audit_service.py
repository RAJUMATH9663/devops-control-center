from typing import List, Optional
from sqlalchemy.orm import Session
import logging
from datetime import datetime

from app.models.settings import AuditLog

logger = logging.getLogger(__name__)

class AuditService:
    """
    Audit logging service for tracking administrative actions, deployments, and security events.
    """

    def record_event(
        self,
        db: Session,
        user_id: Optional[int],
        action: str,
        resource: str,
        details: Optional[dict] = None
    ) -> AuditLog:
        """
        Creates and persists an audit log entry.
        """
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            details=details or {},
            timestamp=datetime.utcnow()
        )
        try:
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)
            logger.info(f"Audit event recorded: [{action}] on {resource} by User #{user_id}")
            return log_entry
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to record audit event: {e}")
            raise

    def get_logs(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        action: Optional[str] = None
    ) -> List[AuditLog]:
        """
        Retrieves audit log history.
        """
        query = db.query(AuditLog)
        if action:
            query = query.filter(AuditLog.action == action)
        return query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

audit_service = AuditService()
