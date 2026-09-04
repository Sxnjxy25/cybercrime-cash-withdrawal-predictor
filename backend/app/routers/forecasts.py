from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.ml.forecast_engine import forecast_engine
from app.models.all_models import User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/forecasts", tags=["Forecast Engine"])

@router.get("")
def get_forecasts(horizon: str = Query("7d", pattern="^(24h|7d|30d)$"), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    historical_complaint_counts = [310.0, 340.0, 380.0, 410.0, 428.0, 490.0, 520.0, 547.0]
    forecast_data = forecast_engine.generate_forecast(historical_complaint_counts, horizon=horizon)
    
    return {
        "intelligence_state": "PREDICTED",
        "horizon": horizon,
        "forecast": forecast_data,
        "historical_data": [
            {"date": "2026-08-28", "val": 310.0},
            {"date": "2026-08-29", "val": 340.0},
            {"date": "2026-08-30", "val": 380.0},
            {"date": "2026-08-31", "val": 410.0},
            {"date": "2026-09-01", "val": 428.0},
            {"date": "2026-09-02", "val": 490.0},
            {"date": "2026-09-03", "val": 520.0},
            {"date": "2026-09-04", "val": 547.0}
        ]
    }
