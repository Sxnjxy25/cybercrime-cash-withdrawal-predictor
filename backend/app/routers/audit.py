from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.all_models import AuditLog, User
from app.services.auth_service import get_current_user, RequireRole

router = APIRouter(prefix="/audit-logs", tags=["Audit Trail"])

@router.get("", dependencies=[Depends(RequireRole(["SUPER_ADMIN", "AUDITOR"]))])
def get_audit_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return logs
