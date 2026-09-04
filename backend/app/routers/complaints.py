from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.db.database import get_db
from app.models.all_models import Complaint, User
from app.schemas.schemas import ComplaintOut, ComplaintCreate
from app.services.auth_service import get_current_user
from app.services.pii_service import mask_pii

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.get("", response_model=List[ComplaintOut])
def get_complaints(
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(50, le=500),
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Complaint)
    if state:
        query = query.filter(Complaint.state == state)
    if district:
        query = query.filter(Complaint.district == district)
    if category:
        query = query.filter(Complaint.category == category)
        
    complaints = query.order_by(Complaint.complaint_timestamp.desc()).offset(offset).limit(limit).all()
    
    # Mask PII for frontend security by default unless SUPER_ADMIN or Lead Investigator
    for c in complaints:
        if c.upi_identifier:
            c.upi_identifier = mask_pii(c.upi_identifier, "UPI_ID")
        if c.mobile_identifier:
            c.mobile_identifier = mask_pii(c.mobile_identifier, "MOBILE_NUMBER")
            
    return complaints

@router.get("/{id}", response_model=ComplaintOut)
def get_complaint_by_id(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    c = db.query(Complaint).filter(Complaint.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return c

@router.post("", response_model=ComplaintOut)
def create_complaint(complaint_in: ComplaintCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    c = Complaint(**complaint_in.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c
