from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.all_models import Entity, Complaint, User
try:
    from app.ml.entity_engine import entity_engine
except ImportError:
    entity_engine = None
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/entities", tags=["Entities & Graph"])

@router.get("")
def get_entities(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entities = db.query(Entity).order_by(Entity.risk_score.desc()).all()
    return entities

@router.get("/graph")
def get_entity_relationship_graph(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entities = db.query(Entity).all()
    complaints = db.query(Complaint).limit(30).all()

    e_dicts = [{"id": e.id, "entity_type": e.entity_type, "masked_value": e.masked_value, "risk_score": e.risk_score, "total_complaints": e.total_complaints} for e in entities]
    c_dicts = [{"id": c.id, "complaint_number": c.complaint_number, "category": c.category, "state": c.state, "upi_identifier": c.upi_identifier, "mobile_identifier": c.mobile_identifier} for c in complaints]

    if entity_engine is not None:
        graph_data = entity_engine.build_relationship_graph(c_dicts, e_dicts)
    else:
        graph_data = {"nodes": [], "edges": [], "communities": []}
    return graph_data

@router.get("/{id}")
def get_entity_by_id(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    e = db.query(Entity).filter(Entity.id == id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Entity not found")
    return e
