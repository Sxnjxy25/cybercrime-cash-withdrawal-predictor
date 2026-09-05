from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.ml.forecast_engine import forecast_engine
from app.models.all_models import Complaint, User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/forecasts", tags=["Forecast Engine"])

@router.get("")
def get_forecasts(horizon: str = Query("7d", pattern="^(24h|7d|30d)$"), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch real historical daily complaint series from database
    daily_records = db.query(
        func.date(Complaint.complaint_timestamp).label("date_str"),
        func.count(Complaint.id).label("count")
    ).group_by(func.date(Complaint.complaint_timestamp)).order_by(func.date(Complaint.complaint_timestamp).asc()).all()

    if daily_records and len(daily_records) >= 3:
        historical_complaint_counts = [float(r[1]) for r in daily_records]
        historical_data = [{"date": str(r[0]), "val": float(r[1])} for r in daily_records]
    else:
        # Fallback to general baseline if complaints have not yet been accumulated
        total_count = db.query(Complaint).count()
        base_val = max(50.0, float(total_count) / 30.0) if total_count > 0 else 100.0
        historical_complaint_counts = [base_val * 0.9, base_val * 0.95, base_val, base_val * 1.05, base_val * 1.1]
        historical_data = [{"date": f"Day-{i+1}", "val": val} for i, val in enumerate(historical_complaint_counts)]

    forecast_data = forecast_engine.generate_forecast(historical_complaint_counts, horizon=horizon)
    
    return {
        "intelligence_state": "PREDICTED",
        "horizon": horizon,
        "forecast": forecast_data,
        "historical_data": historical_data
    }
