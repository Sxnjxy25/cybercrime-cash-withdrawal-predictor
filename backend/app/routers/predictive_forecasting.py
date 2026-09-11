import random
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.database import get_db
from app.models.all_models import PredictiveForecast
from app.services.cashout_predictor_service import CashoutPredictorService

router = APIRouter(prefix="/predictive-forecasting", tags=["Predictive Forecasting Engine"])

class RunInferencePayload(BaseModel):
    amount: float = 75000.0
    bank_name: str = "State Bank of India"
    payment_method: str = "UPI"
    target_region: str = "West Bengal"
    latitude: Optional[float] = 22.5726
    longitude: Optional[float] = 88.3639
    complaint_id: Optional[str] = None

class ForecastActionPayload(BaseModel):
    action: str
    actioned_by: Optional[str] = "System Officer"
    notes: Optional[str] = None

def serialize_forecast(fc: PredictiveForecast) -> dict:
    return {
        "id": fc.id, "forecast_id": fc.forecast_id, "forecast_type": fc.forecast_type,
        "title": fc.title, "description": fc.description or "",
        "severity_level": fc.severity_level, "confidence_score": round(fc.confidence_score, 3),
        "predicted_at": fc.predicted_at.strftime("%Y-%m-%d %H:%M:%S") if fc.predicted_at else "",
        "valid_until": fc.valid_until.strftime("%Y-%m-%d %H:%M:%S") if fc.valid_until else "",
        "target_region": fc.target_region or "National", "target_district": fc.target_district or "",
        "target_lat": fc.target_lat, "target_lon": fc.target_lon,
        "predicted_amount_at_risk": fc.predicted_amount_at_risk,
        "attack_vector": fc.attack_vector or "UNKNOWN", "ml_model_version": fc.ml_model_version,
        "feature_importances": fc.feature_importances or  [],
        "hotspot_coordinates": fc.hotspot_coordinates or [],
        "recommended_actions": fc.recommended_actions or [],
        "status": fc.status, "actioned_by": fc.actioned_by or "",
        "actioned_at": fc.actioned_at.strftime("%Y-%m-%d %H:%M:%S") if fc.actioned_at else "",
        "created_at": fc.created_at.strftime("%Y-%m-%d %H:%M:%S") if fc.created_at else "",
    }

@router.get("")
def get_forecasts(
    page: int = Query(1, ge=1), page_size: int = Query(15, ge=1, le=100),
    forecast_type: Optional[str] = None, severity_level: Optional[str] = None,
    status: Optional[str] = None, region: Optional[str] = None, db: Session = Depends(get_db)
):
    q = db.query(PredictiveForecast)
    if forecast_type: q = q.filter(PredictiveForecast.forecast_type == forecast_type.upper())
    if severity_level: q = q.filter(PredictiveForecast.severity_level == severity_level.upper())
    if status: q = q.filter(PredictiveForecast.status == status.upper())
    if region: q = q.filter(PredictiveForecast.target_region.ilike(f"%{region}%"))
    total = q.count()
    items = q.order_by(desc(PredictiveForecast.predicted_at)).offset((page-1)*page_size).limit(page_size).all()
    return {"total": total, "page": page, "page_size": page_size, "total_pages": max(1,-(-total//page_size)), "items": [serialize_forecast(f) for f in items]}

@router.get("/summary")
def get_forecast_summary(db: Session = Depends(get_db)):
    all_active = db.query(PredictiveForecast).filter(PredictiveForecast.status == "ACTIVE").all()
    n = len(all_active)
    avg_conf = round(sum(f.confidence_score for f in all_active)/n,3) if n else 0.0
    total_risk = sum(f.predicted_amount_at_risk for f in all_active)
    regions = len(set(f.target_region for f in all_active if f.target_region))
    critical = sum(1 for f in all_active if f.severity_level == "CRITICAL")
    return {"total_active_forecasts": n, "critical_forecasts": critical, "average_confidence_score": avg_conf,
        "regions_at_risk": regions, "total_amount_at_risk_inr": total_risk, "ml_model_version": "xgboost-v2.1-prod",
        "last_inference_run": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")}

@router.get("/hotspots/geo")
def get_forecast_hotspots(db: Session = Depends(get_db)):
    active = db.query(PredictiveForecast).filter(PredictiveForecast.status == "ACTIVE").all()
    hotspots = []
    for fc in active:
        if fc.hotspot_coordinates:
            for hs in fc.hotspot_coordinates:
                hs_item = {
                    "forecast_id": fc.forecast_id,
                    "forecast_type": fc.forecast_type,
                    "severity_level": fc.severity_level,
                    "title": fc.title,
                }
                if isinstance(hs, dict):
                    hs_item.update(hs)
                hotspots.append(hs_item)
    return {"count": len(hotspots), "hotspots": hotspots}

@router.post("/run-inference")
def run_forecast_inference(payload: RunInferencePayload, db: Session = Depends(get_db)):
    cid = payload.complaint_id or f"LIVE-{int(datetime.utcnow().timestamp())}"
    inp = {"complaint_id": cid, "amount": payload.amount, "defrauded_amount": payload.amount,
          "bank_name": payload.bank_name, "bank_affinity": payload.bank_name,
          "format": payload.payment_method, "payment_method": payload.payment_method,
          "latitude": payload.latitude or 22.5726, "longitude": payload.longitude or 88.3639}
    result = CashoutPredictorService.predict(inp)
    risk = result.get("risk_assessment", {})
    mule_prob = risk.get("mule_laundering_probability", 0.5)
    hotspots = result.get("forecasted_cashout_hotspots", [])
    xai = result.get("explainable_ai_rationale", [])
    severity = "CRITICAL" if mule_prob >= 0.80 else "HIGH" if mule_prob >= 0.60 else "MEDIUM" if mule_prob >= 0.40 else "LOW"
    pmt = payload.payment_method.upper()
    av = "UPI_SURGE" if ("UPI" in pmt or "IMPS" in pmt) else "ATM_CLUSTER" if ("ATM" in pmt or "CARD" in pmt) else "MULE_LAYERING"
    fc_new = PredictiveForecast(
        forecast_id=f"FCST-LIVE-{int(datetime.utcnow().timestamp())}", forecast_type="CASHOUT_HOTSPOT",
        title=f"Live XGBoost: {payload.target_region} Cashout Risk [{severity}]",
        description=f"Mule prob: {round(mule_prob*100,1)}%. Bank: {payload.bank_name}. Method: {payload.payment_method}.",
        severity_level=severity, confidence_score=mule_prob,
        predicted_at=datetime.utcnow(), valid_until=datetime.utcnow()+timedelta(hours=4),
        target_region=payload.target_region, target_lat=payload.latitude, target_lon=payload.longitude,
        predicted_amount_at_risk=payload.amount, attack_vector=av,
        ml_model_version=risk.get("engine", "xgboost-v2.1-prod"), feature_importances=xai,
        hotspot_coordinates=[{"lat":h["latitude"],"lon":h["longitude"],"risk_score":h["cashout_risk_score"],
            "atm_id":h["atm_id"],"atm_name":h.get("atm_name",""),"distance_km":h.get("distance_km"),
            "eta_mins":h.get("estimated_arrival_eta_mins"),"action_priority":h.get("action_priority")} for h in hotspots],
        recommended_actions=result.get("recommended_interventions",[]), status="ACTIVE")
    db.add(fc_new)
    db.commit()
    db.refresh(fc_new)
    return {"inference_result": serialize_forecast(fc_new), "raw_xgboost_output": {
        "mule_laundering_probability": mule_prob, "urgency_classification": risk.get("urgency_classification"),
        "binary_prediction": risk.get("binary_prediction"), "is_mule_layering_detected": risk.get("is_mule_layering_detected"),
        "forensic_signature": result.get("forensic_signature"), "inference_latency_ms": result.get("inference_latency_ms")}}

@router.patch("/{forecast_id_or_pk}/action")
def action_forecast(forecast_id_or_pk: str, payload: ForecastActionPayload, db: Session = Depends(get_db)):
    fc = db.query(PredictiveForecast).filter((PredictiveForecast.id == forecast_id_or_pk) | (PredictiveForecast.forecast_id == forecast_id_or_pk)).first()
    if not fc: raise HTTPException(status_code=404, detail="Forecast not found.")
    if payload.action.upper() not in {"ACTIONED", "SUPPRESSED", "ACTIVE"}: raise HTTPException(status_code=400, detail="Invalid action.")
    fc.status = payload.action.upper(); fc.actioned_by = payload.actioned_by; fc.actioned_at = datetime.utcnow(); fc.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "forecast_id": fc.forecast_id, "new_status": fc.status, "actioned_by": fc.actioned_by, "actioned_at": fc.actioned_at.strftime("%Y-%m-%d %H:%M:%S")}

@router.get("/{forecast_id_or_pk}")
def get_forecast_detail(forecast_id_or_pk: str, db: Session = Depends(get_db)):
    fc = db.query(PredictiveForecast).filter((PredictiveForecast.id == forecast_id_or_pk) | (PredictiveForecast.forecast_id == forecast_id_or_pk)).first()
    if not fc: raise HTTPException(status_code=404, detail="Forecast not found.")
    return serialize_forecast(fc)
