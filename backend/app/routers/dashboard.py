from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.all_models import Complaint, LocationRisk, ThreatCluster, EarlyWarning, Anomaly, Forecast, User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_complaints = db.query(Complaint).count()
    total_loss = db.query(func.sum(Complaint.financial_loss)).scalar() or 0.0
    
    active_warnings = db.query(EarlyWarning).filter(EarlyWarning.status == "PENDING_REVIEW").all()
    active_clusters = db.query(ThreatCluster).all()
    top_high_risk_locs = db.query(LocationRisk).order_by(LocationRisk.current_risk_score.desc()).limit(5).all()
    
    latest_anomaly = db.query(Anomaly).order_by(Anomaly.detected_at.desc()).first()
    latest_forecast = db.query(Forecast).order_by(Forecast.created_at.desc()).first()

    return {
        "global_risk": {
            "score": 78.0,
            "band": "HIGH",
            "trend": "+4.2%",
            "confidence": 88.0,
            "data_quality": 94.5
        },
        "kpi_metrics": {
            "total_complaints": total_complaints,
            "total_financial_loss": round(total_loss, 2),
            "active_early_warnings": len(active_warnings),
            "detected_threat_clusters": len(active_clusters),
            "monitored_jurisdictions": 10
        },
        "top_high_risk_regions": [
            {
                "state": loc.state,
                "district": loc.district,
                "risk_score": loc.current_risk_score,
                "risk_band": loc.risk_band,
                "dominant_category": loc.dominant_category,
                "complaints": loc.complaint_count
            } for loc in top_high_risk_locs
        ],
        "emerging_threat": {
            "name": "UPI Impersonation Fraud Ring",
            "growth": "+47%",
            "affected_region": "Chennai, Tamil Nadu",
            "anomaly_score": 0.91,
            "intelligence_state": "CORRELATED"
        },
        "latest_forecast": {
            "current_vol": latest_forecast.current_value if latest_forecast else 428.0,
            "forecast_vol": latest_forecast.forecast_value if latest_forecast else 547.0,
            "lower_bound": latest_forecast.lower_bound if latest_forecast else 505.0,
            "upper_bound": latest_forecast.upper_bound if latest_forecast else 590.0,
            "confidence": 86.0
        },
        "active_warnings": [
            {
                "id": w.id,
                "warning_code": w.warning_code,
                "severity": w.severity,
                "threat_name": w.threat_name,
                "region": w.region,
                "signal_summary": w.signal_summary,
                "status": w.status
            } for w in active_warnings
        ]
    }
