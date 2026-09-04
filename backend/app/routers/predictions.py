from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.ml.risk_engine import risk_engine
from app.models.all_models import User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/predictions", tags=["Predictions & Risk Engine"])

@router.get("")
def get_predictions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Calculate live hybrid risk breakdown
    risk_data = risk_engine.calculate_risk_score(
        growth_pct=27.4,
        anomaly_score=0.91,
        cluster_expansion_rate=18.5,
        regional_density=0.82,
        historical_recurrence=0.65
    )
    
    return {
        "title": "National Cyber Crime Risk Assessment",
        "intelligence_state": "PREDICTED",
        "risk_summary": risk_data
    }
