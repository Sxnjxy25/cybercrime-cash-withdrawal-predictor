from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.all_models import Complaint, LocationRisk, User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/trends")
def get_analytics_trends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Group complaints by Category
    category_data = db.query(
        Complaint.category,
        func.count(Complaint.id).label("count"),
        func.sum(Complaint.financial_loss).label("loss")
    ).group_by(Complaint.category).all()

    # Group complaints by Channel
    channel_data = db.query(
        Complaint.channel,
        func.count(Complaint.id).label("count")
    ).group_by(Complaint.channel).all()

    # Time trend dynamically calculated from live complaints in database
    daily_rows = db.query(
        func.date(Complaint.complaint_timestamp).label("date_str"),
        func.count(Complaint.id).label("count")
    ).group_by(func.date(Complaint.complaint_timestamp)).order_by(func.date(Complaint.complaint_timestamp).asc()).all()

    time_series = []
    if daily_rows:
        counts = [float(r[1]) for r in daily_rows]
        mean_count = sum(counts) / len(counts) if counts else 100.0
        
        # Calculate moving average & anomaly indicators on real data
        for i, (date_val, count_val) in enumerate(daily_rows):
            cnt = int(count_val)
            # Rolling forecast baseline
            if i == 0:
                forecast_val = round(float(cnt) * 0.98)
            else:
                prev_counts = [float(r[1]) for r in daily_rows[max(0, i-3):i]]
                forecast_val = round(sum(prev_counts) / len(prev_counts) * 1.02)
            
            # Real anomaly if observed is > 1.2x mean and positive surge
            is_anomaly = 1 if (cnt > mean_count * 1.2 and cnt > forecast_val) else 0
            
            time_series.append({
                "date": str(date_val),
                "observed": cnt,
                "forecast": forecast_val,
                "anomaly": is_anomaly
            })
    else:
        # Fallback if database is currently empty
        time_series = []

    return {
        "category_distribution": [
            {"category": row[0], "count": row[1], "financial_loss": float(row[2] or 0.0)} for row in category_data
        ],
        "channel_distribution": [
            {"channel": row[0], "count": row[1]} for row in channel_data
        ],
        "time_series_trend": time_series
    }

@router.get("/regional-risk")
def get_regional_risk(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    locations = db.query(LocationRisk).all()
    return [
        {
            "id": loc.id,
            "state": loc.state,
            "district": loc.district,
            "police_jurisdiction": loc.police_jurisdiction,
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "current_risk_score": loc.current_risk_score,
            "forecast_risk_score": loc.forecast_risk_score,
            "risk_band": loc.risk_band,
            "complaint_count": loc.complaint_count,
            "dominant_category": loc.dominant_category
        } for loc in locations
    ]
