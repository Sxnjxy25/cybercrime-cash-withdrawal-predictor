from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.all_models import ModelMetric, User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/models", tags=["Model Observatory"])

@router.get("")
def get_model_observatory(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    models = db.query(ModelMetric).all()
    return {
        "models": models,
        "drift_summary": {
            "overall_status": "HEALTHY",
            "data_drift": 0.038,
            "feature_drift": 0.029,
            "quality_score": 94.5,
            "retraining_recommended": False
        }
    }
