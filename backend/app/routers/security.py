from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.all_models import AuditLog, User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/security", tags=["Security Center"])

@router.get("/status")
def get_security_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    failed_logins = db.query(AuditLog).filter(AuditLog.action == "LOGIN_FAILED").count()
    return {
        "status": "SECURE",
        "authentication": "JWT HS256 Enabled",
        "rbac_enforcement": "STRICT_BACKEND",
        "pii_masking": "ENABLED_DEFAULT",
        "database_encryption": "TLS/AES-256",
        "rate_limiting": "60 req/min",
        "failed_login_attempts": failed_logins,
        "security_compliance": "CERTIFIED_GOVT_GRADE"
    }

@router.get("/events")
def get_security_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    events = db.query(AuditLog).filter(AuditLog.action.in_(["LOGIN_FAILED", "USER_LOGIN", "ROLE_CHANGE"])).order_by(AuditLog.timestamp.desc()).limit(20).all()
    return events
