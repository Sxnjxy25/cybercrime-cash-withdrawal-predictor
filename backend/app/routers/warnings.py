from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.all_models import EarlyWarning, AuditLog, User
from app.schemas.schemas import EarlyWarningAction
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/early-warnings", tags=["Early Warnings Engine"])

@router.get("")
def get_early_warnings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    warnings = db.query(EarlyWarning).order_by(EarlyWarning.created_at.desc()).all()
    return warnings

@router.post("/{id}/action")
def update_warning_action(id: str, action_data: EarlyWarningAction, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    w = db.query(EarlyWarning).filter(EarlyWarning.id == id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Warning not found")
    
    if action_data.action == "ACKNOWLEDGE":
        w.status = "ACKNOWLEDGED"
    elif action_data.action == "ASSIGN":
        w.status = "ASSIGNED"
        w.assigned_officer_id = action_data.officer_id or current_user.id
    elif action_data.action == "DISMISS":
        w.status = "DISMISSED"
    elif action_data.action == "INVESTIGATE":
        w.status = "INVESTIGATED"

    audit = AuditLog(
        username=current_user.username,
        role=current_user.role,
        action=f"WARNING_{action_data.action}",
        resource=f"/early-warnings/{w.warning_code}",
        details=f"Officer perform action {action_data.action} on warning {w.warning_code}.",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()
    db.refresh(w)
    return w
