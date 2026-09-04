from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.all_models import ThreatCluster, User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/threat-clusters", tags=["Threat Clusters"])

@router.get("")
def get_threat_clusters(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    clusters = db.query(ThreatCluster).order_by(ThreatCluster.risk_score.desc()).all()
    return [
        {
            "id": c.id,
            "cluster_code": c.cluster_code,
            "title": c.title,
            "category": c.category,
            "growth_rate_pct": c.growth_rate_pct,
            "baseline_vol": c.baseline_vol,
            "current_vol": c.current_vol,
            "anomaly_score": c.anomaly_score,
            "risk_score": c.risk_score,
            "primary_state": c.primary_state,
            "primary_district": c.primary_district,
            "peak_hours": c.peak_hours,
            "status": c.status,
            "intelligence_state": c.intelligence_state,
            "dna_metrics": c.dna_metrics
        } for c in clusters
    ]

@router.get("/{id}")
def get_threat_cluster_by_id(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    c = db.query(ThreatCluster).filter(ThreatCluster.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Threat cluster not found")
    return c
