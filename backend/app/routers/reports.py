from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.all_models import Complaint, ThreatCluster, EarlyWarning, LocationRisk, User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/intelligence-summary")
def get_intelligence_summary_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_c = db.query(Complaint).count()
    top_cluster = db.query(ThreatCluster).order_by(ThreatCluster.risk_score.desc()).first()
    top_location = db.query(LocationRisk).order_by(LocationRisk.current_risk_score.desc()).first()
    warnings = db.query(EarlyWarning).all()

    return {
        "report_title": "NATIONAL CYBERCRIME PREDICTIVE INTELLIGENCE REPORT",
        "generated_by": current_user.full_name,
        "classification": "CONFIDENTIAL // FOR AUTHORISED OFFICERS ONLY",
        "summary": {
            "total_complaints_analyzed": total_c,
            "highest_risk_district": top_location.district if top_location else "Chennai",
            "top_threat_cluster": top_cluster.title if top_cluster else "UPI Impersonation Syndicate",
            "active_early_warnings": len(warnings)
        },
        "recommendation": "Deploy targeted cyber crime response units to high-risk zones and issue public advisory regarding UPI QR collect request scams."
    }
