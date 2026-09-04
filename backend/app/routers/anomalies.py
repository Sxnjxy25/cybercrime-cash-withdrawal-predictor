from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import pandas as pd
from app.db.database import get_db
from app.models.all_models import Complaint, User
from app.ml.anomaly_engine import anomaly_engine
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/anomalies", tags=["Anomaly Engine"])

@router.get("")
def get_anomalies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    complaints = db.query(Complaint).limit(300).all()
    c_dicts = [{
        "id": c.id,
        "state": c.state,
        "district": c.district,
        "category": c.category,
        "financial_loss": c.financial_loss,
        "narrative": c.narrative
    } for c in complaints]

    df = pd.DataFrame(c_dicts)
    detected = anomaly_engine.detect_spikes_and_anomalies(df)
    
    return {
        "intelligence_state": "OBSERVED",
        "total_anomalies_detected": len(detected),
        "anomalies": detected
    }
