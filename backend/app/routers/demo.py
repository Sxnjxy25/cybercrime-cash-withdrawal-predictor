import random
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.all_models import ThreatCluster, EarlyWarning, LocationRisk, Complaint, AuditLog, User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/demo", tags=["Demo Mode & Signature Scenario"])

@router.post("/simulate-emerging-threat")
def simulate_emerging_threat(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Signature Demo Scenario: Triggers live UPI Impersonation threat spike simulation.
    Visually escalates complaint volume, anomaly score, cluster growth, risk map, and generates Early Warning.
    """
    # 1. Update location risk for Chennai
    tn_loc = db.query(LocationRisk).filter(LocationRisk.district == "Chennai").first()
    if tn_loc:
        tn_loc.current_risk_score = 92.0
        tn_loc.forecast_risk_score = 96.5
        tn_loc.risk_band = "CRITICAL"
        tn_loc.complaint_count += 48
    
    # 2. Update threat cluster growth
    cluster = db.query(ThreatCluster).filter(ThreatCluster.cluster_code == "TC-IN-2026-1042").first()
    if cluster:
        cluster.current_vol += 48
        cluster.growth_rate_pct = 68.4
        cluster.anomaly_score = 0.96
        cluster.risk_score = 94.0
        cluster.status = "CRITICAL_ESCALATION"

    # 3. Create signature Early Warning
    code = f"EW-{random.randint(2000, 9999)}"
    ew = EarlyWarning(
        warning_code=code,
        severity="CRITICAL",
        threat_name="SIMULATED: Emerging UPI Impersonation Spike",
        region="Chennai & Coimbatore, Tamil Nadu",
        category="UPI Impersonation",
        signal_summary="DEMO MODE TRIGGERED: Complaint activity spiked +68.4% above baseline in 24h. 48 new linked complaints detected.",
        forecast_trend="CRITICAL ESCALATION EXPECTED IN 24-72H",
        confidence_pct=94.0,
        status="PENDING_REVIEW"
    )
    db.add(ew)

    audit = AuditLog(
        username=current_user.username,
        role=current_user.role,
        action="DEMO_THREAT_SIMULATION",
        resource="/api/v1/demo/simulate-emerging-threat",
        details="Triggered live emerging threat simulation scenario for SIH presentation.",
        status="SUCCESS"
    )
    db.add(audit)

    db.commit()

    return {
        "status": "SIMULATION_SUCCESSFUL",
        "demo_mode": True,
        "simulated_threat": {
            "warning_code": code,
            "threat": "UPI Impersonation Spike",
            "growth_rate": "+68.4%",
            "new_complaints": 48,
            "new_risk_score": 94.0,
            "severity": "CRITICAL"
        }
    }

@router.post("/reset-demo")
def reset_demo(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Resets the demo state back to baseline for repeated SIH presentations.
    """
    tn_loc = db.query(LocationRisk).filter(LocationRisk.district == "Chennai").first()
    if tn_loc:
        tn_loc.current_risk_score = 78.0
        tn_loc.forecast_risk_score = 84.0
        tn_loc.risk_band = "HIGH"
        tn_loc.complaint_count = 132

    cluster = db.query(ThreatCluster).filter(ThreatCluster.cluster_code == "TC-IN-2026-1042").first()
    if cluster:
        cluster.current_vol = 74
        cluster.growth_rate_pct = 38.0
        cluster.anomaly_score = 0.91
        cluster.risk_score = 84.0
        cluster.status = "ACTIVE_MONITORING"

    # Remove extra simulated warnings
    db.query(EarlyWarning).filter(EarlyWarning.threat_name.startswith("SIMULATED:")).delete(synchronize_session=False)

    audit = AuditLog(
        username=current_user.username,
        role=current_user.role,
        action="DEMO_RESET",
        resource="/api/v1/demo/reset-demo",
        details="Reset demo state back to deterministic baseline.",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "RESET_SUCCESSFUL",
        "demo_mode": True,
        "message": "Demo state successfully reset to deterministic baseline."
    }
