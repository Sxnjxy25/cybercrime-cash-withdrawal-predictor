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

    # Time trend (mocked rolling historical dates for visualization)
    time_series = [
        {"date": "2026-08-28", "observed": 310, "forecast": 305, "anomaly": 0},
        {"date": "2026-08-29", "observed": 340, "forecast": 320, "anomaly": 0},
        {"date": "2026-08-30", "observed": 380, "forecast": 350, "anomaly": 0},
        {"date": "2026-08-31", "observed": 410, "forecast": 390, "anomaly": 0},
        {"date": "2026-09-01", "observed": 428, "forecast": 420, "anomaly": 0},
        {"date": "2026-09-02", "observed": 490, "forecast": 450, "anomaly": 1},
        {"date": "2026-09-03", "observed": 520, "forecast": 480, "anomaly": 1},
        {"date": "2026-09-04", "observed": 547, "forecast": 510, "anomaly": 1}
    ]

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
