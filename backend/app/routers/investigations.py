from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.all_models import Investigation, InvestigationNote, AuditLog, User
from app.schemas.schemas import InvestigationCreate, InvestigationNoteCreate
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/investigations", tags=["Investigation Workspace"])

@router.get("")
def get_investigations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cases = db.query(Investigation).order_by(Investigation.created_at.desc()).all()
    return cases

@router.get("/{id}")
def get_investigation_by_id(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation case not found")
    
    notes = db.query(InvestigationNote).filter(InvestigationNote.investigation_id == id).order_by(InvestigationNote.created_at.desc()).all()
    
    return {
        "case": inv,
        "notes": notes
    }

@router.post("")
def create_investigation(inv_in: InvestigationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case_num = f"CASE-2026-{1000 + db.query(Investigation).count() + 1}"
    inv = Investigation(
        case_number=case_num,
        title=inv_in.title,
        warning_id=inv_in.warning_id,
        cluster_id=inv_in.cluster_id,
        risk_score=inv_in.risk_score,
        status="OPEN",
        assigned_to_id=current_user.id,
        lead_officer=inv_in.lead_officer or current_user.full_name,
        summary=inv_in.summary
    )
    db.add(inv)
    
    audit = AuditLog(
        username=current_user.username,
        role=current_user.role,
        action="INVESTIGATION_CREATED",
        resource=f"/investigations/{case_num}",
        details=f"Created investigation case {case_num}: {inv.title}",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()
    db.refresh(inv)
    return inv

@router.post("/{id}/notes")
def add_investigation_note(id: str, note_in: InvestigationNoteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation case not found")
    
    note = InvestigationNote(
        investigation_id=id,
        officer_name=current_user.full_name,
        note_text=note_in.note_text,
        is_sensitive=note_in.is_sensitive
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
