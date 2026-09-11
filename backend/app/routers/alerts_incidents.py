import asyncio
import json
import random
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.db.database import get_db
from app.models.all_models import TelemetryIncident, AuditLog, User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/alerts-incidents", tags=["Automated System Telemetry & Incidents"])

class TriageUpdatePayload(BaseModel):
    status: str
    notes: Optional[str] = None
    assigned_to: Optional[str] = None

def serialize_incident(inc: TelemetryIncident) -> dict:
    return {
        "id": inc.id,
        "incident_code": inc.incident_code,
        "title": inc.title,
        "severity": inc.severity,
        "source_type": inc.source_type,
        "source_tool": inc.source_tool,
        "timestamp": inc.timestamp.strftime("%Y-%m-%d %H:%M:%S") if inc.timestamp else datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "triage_status": inc.triage_status,
        "target_host": inc.target_host or "UNKNOWN-HOST",
        "target_ip": inc.target_ip or "0.0.0.0",
        "source_ip": inc.source_ip or "0.0.0.0",
        "mitre_tactic": inc.mitre_tactic or "Execution",
        "mitre_technique": inc.mitre_technique or "T1059 - Command & Scripting Interpreter",
        "detection_rule": inc.detection_rule,
        "event_count": inc.event_count,
        "confidence_score": round(inc.confidence_score, 2),
        "raw_payload": inc.raw_payload or {},
        "analyst_notes": inc.analyst_notes or "",
        "assigned_to": inc.assigned_to or "Unassigned",
        "created_at": inc.created_at.strftime("%Y-%m-%d %H:%M:%S") if inc.created_at else "",
        "updated_at": inc.updated_at.strftime("%Y-%m-%d %H:%M:%S") if inc.updated_at else ""
    }

@router.get("")
def get_telemetry_incidents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    severity: Optional[str] = None,
    source_type: Optional[str] = None,
    triage_status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Fetch and paginate machine-generated system telemetry incidents with multi-facet filtering.
    """
    query = db.query(TelemetryIncident)

    if severity and severity.upper() != "ALL":
        query = query.filter(TelemetryIncident.severity == severity.upper())

    if source_type and source_type.upper() != "ALL":
        query = query.filter(TelemetryIncident.source_type == source_type.upper())

    if triage_status and triage_status.upper() != "ALL":
        query = query.filter(TelemetryIncident.triage_status == triage_status.upper())

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                TelemetryIncident.incident_code.ilike(term),
                TelemetryIncident.title.ilike(term),
                TelemetryIncident.target_host.ilike(term),
                TelemetryIncident.target_ip.ilike(term),
                TelemetryIncident.source_ip.ilike(term),
                TelemetryIncident.detection_rule.ilike(term),
                TelemetryIncident.mitre_technique.ilike(term),
                TelemetryIncident.mitre_tactic.ilike(term)
            )
        )

    total_count = query.count()
    items = query.order_by(desc(TelemetryIncident.timestamp)).offset((page - 1) * page_size).limit(page_size).all()

    # Fast summary stats for HUD
    all_q = db.query(TelemetryIncident)
    crit_count = all_q.filter(TelemetryIncident.severity == "CRITICAL").count()
    high_count = all_q.filter(TelemetryIncident.severity == "HIGH").count()
    active_triage = all_q.filter(TelemetryIncident.triage_status.in_(["NEW", "TRIAGED"])).count()
    contained_count = all_q.filter(TelemetryIncident.triage_status == "CONTAINED").count()
    resolved_count = all_q.filter(TelemetryIncident.triage_status == "RESOLVED").count()

    total_pages = (total_count + page_size - 1) // page_size if page_size > 0 else 1

    return {
        "items": [serialize_incident(inc) for inc in items],
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "summary": {
            "total_incidents": all_q.count(),
            "critical_count": crit_count,
            "critical_badge": "99+ CRIT" if crit_count >= 99 else f"{crit_count} CRIT",
            "high_count": high_count,
            "active_triage_count": active_triage,
            "contained_count": contained_count,
            "resolved_count": resolved_count,
            "ingestion_rate_eps": 2400 + random.randint(50, 480)
        }
    }

@router.get("/summary")
def get_telemetry_summary(db: Session = Depends(get_db)):
    """
    Returns high-level KPI metrics for the Alerts & Incidents Telemetry Command HUD.
    """
    total = db.query(TelemetryIncident).count()
    crit_count = db.query(TelemetryIncident).filter(TelemetryIncident.severity == "CRITICAL").count()
    high_count = db.query(TelemetryIncident).filter(TelemetryIncident.severity == "HIGH").count()
    new_count = db.query(TelemetryIncident).filter(TelemetryIncident.triage_status == "NEW").count()
    triaged_count = db.query(TelemetryIncident).filter(TelemetryIncident.triage_status == "TRIAGED").count()
    contained_count = db.query(TelemetryIncident).filter(TelemetryIncident.triage_status == "CONTAINED").count()
    resolved_count = db.query(TelemetryIncident).filter(TelemetryIncident.triage_status == "RESOLVED").count()

    # Source breakdown
    sources = {
        "EDR": db.query(TelemetryIncident).filter(TelemetryIncident.source_type == "EDR").count(),
        "SIEM": db.query(TelemetryIncident).filter(TelemetryIncident.source_type == "SIEM").count(),
        "FIREWALL": db.query(TelemetryIncident).filter(TelemetryIncident.source_type == "FIREWALL").count(),
        "NDR": db.query(TelemetryIncident).filter(TelemetryIncident.source_type == "NDR").count(),
        "IAM": db.query(TelemetryIncident).filter(TelemetryIncident.source_type == "IAM").count()
    }

    return {
        "critical_count": crit_count,
        "critical_badge": "99+ CRIT" if crit_count >= 99 else f"{crit_count} CRIT",
        "high_count": high_count,
        "total_incidents": total,
        "active_triage_queue": new_count + triaged_count,
        "contained_count": contained_count,
        "resolved_count": resolved_count,
        "mean_time_to_detect_mins": 3.4,
        "mean_time_to_respond_mins": 11.8,
        "ingestion_rate_eps": 2840,
        "total_events_today": 2458910 + (total * 420),
        "sensor_health": {
            "online_sensors": 48,
            "total_sensors": 48,
            "status": "ALL_HEALTHY"
        },
        "sources": sources
    }

@router.get("/stream")
async def stream_telemetry_events(request: Request, db: Session = Depends(get_db)):
    """
    Server-Sent Events (SSE) stream broadcasting live telemetry heartbeats and incident alerts.
    """
    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break

                # Stream telemetry metrics tick
                tick_data = {
                    "type": "TELEMETRY_HEARTBEAT",
                    "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
                    "ingestion_rate_eps": 2400 + random.randint(100, 600),
                    "active_sensors": 48,
                    "buffer_utilization": f"{random.randint(12, 28)}%"
                }
                yield f"data: {json.dumps(tick_data)}\n\n"

                await asyncio.sleep(3.0)
        except asyncio.CancelledError:
            pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.get("/{id_or_code}")
def get_incident_detail(id_or_code: str, db: Session = Depends(get_db)):
    """
    Retrieve deep forensic telemetry detail for a single machine-generated incident.
    """
    inc = db.query(TelemetryIncident).filter(
        or_(TelemetryIncident.id == id_or_code, TelemetryIncident.incident_code == id_or_code)
    ).first()

    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {id_or_code} not found")

    data = serialize_incident(inc)

    # Forensic enrichment
    data["forensic_context"] = {
        "mitre_matrix_phase": inc.mitre_tactic or "Credential Access",
        "detection_confidence": f"{int(inc.confidence_score * 100)}%",
        "automated_containment_recommended": inc.severity in ["CRITICAL", "HIGH"],
        "recommended_action": "Isolate host from subnet & block source IP on Palo Alto Edge Firewall" if inc.severity == "CRITICAL" else "Enforce credential rotation & inspect memory dump",
        "process_tree": inc.raw_payload.get("process_tree") if inc.raw_payload else [
            {"process": "services.exe", "pid": 680, "user": "NT AUTHORITY\\SYSTEM"},
            {"process": "lsass.exe", "pid": 712, "user": "NT AUTHORITY\\SYSTEM", "flagged": True},
            {"process": "powershell.exe -enc ...", "pid": 4192, "user": "BANK\\admin_svc", "flagged": True}
        ]
    }

    return data

@router.patch("/{id_or_code}/triage")
def update_incident_triage(
    id_or_code: str,
    payload: TriageUpdatePayload,
    db: Session = Depends(get_db)
):
    """
    Update triage status (CONTAINED, ESCALATED, RESOLVED, SUPPRESSED) with analyst remarks.
    """
    inc = db.query(TelemetryIncident).filter(
        or_(TelemetryIncident.id == id_or_code, TelemetryIncident.incident_code == id_or_code)
    ).first()

    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {id_or_code} not found")

    valid_statuses = ["NEW", "TRIAGED", "ESCALATED", "CONTAINED", "RESOLVED", "SUPPRESSED"]
    new_status = payload.status.upper()
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    inc.triage_status = new_status
    if payload.notes:
        inc.analyst_notes = payload.notes
    if payload.assigned_to:
        inc.assigned_to = payload.assigned_to
    inc.updated_at = datetime.utcnow()

    # Log to AuditLog
    try:
        audit = AuditLog(
            username=payload.assigned_to or "SecOps Officer",
            role="CYBER_COMMAND_OFFICER",
            action=f"TRIAGE_INCIDENT_{new_status}",
            resource=f"TelemetryIncident:{inc.incident_code}",
            details=f"Status set to {new_status}. Notes: {payload.notes or 'N/A'}"
        )
        db.add(audit)
    except Exception:
        pass

    db.commit()
    db.refresh(inc)

    return {
        "success": True,
        "message": f"Incident {inc.incident_code} successfully updated to {new_status}.",
        "incident": serialize_incident(inc)
    }

@router.post("/simulate")
def simulate_telemetry_burst(db: Session = Depends(get_db)):
    """
    Simulate incoming real-time machine telemetry alerts from SIEM, EDR, and Firewalls.
    """
    burst_templates = [
        {
            "title": "Cobalt Strike Beacon Ingress Detected on Edge Proxy",
            "severity": "CRITICAL",
            "source_type": "FIREWALL",
            "source_tool": "Palo Alto NGFW-PA5200",
            "target_host": "PROXY-DMZ-02.BANK.IN",
            "target_ip": "10.240.1.15",
            "source_ip": f"185.220.{random.randint(100, 250)}.{random.randint(1, 254)}",
            "mitre_tactic": "Command and Control",
            "mitre_technique": "T1071.001 - Web Protocols (C2 Beaconing)",
            "detection_rule": "SIG-FW-C2-MALICIOUS-HEURISTIC-BURST",
            "event_count": random.randint(300, 1800),
            "confidence_score": 0.98,
            "raw_payload": {
                "sensor": "Palo Alto PAN-OS 11.1",
                "app": "ssl-beaconing",
                "bytes_out": 419200,
                "threat_id": "92184 (Suspicious TLS JARM Match)"
            }
        },
        {
            "title": "Mimikatz LSASS Memory Read Attempt Blocked",
            "severity": "CRITICAL",
            "source_type": "EDR",
            "source_tool": "CrowdStrike Falcon",
            "target_host": "DC-PRIMARY-01.BANK.IN",
            "target_ip": "10.240.10.5",
            "source_ip": "10.240.12.88",
            "mitre_tactic": "Credential Access",
            "mitre_technique": "T1003.001 - OS Credential Dumping: LSASS Memory",
            "detection_rule": "CS-RULE-CREDENTIAL-DUMP-LSASS",
            "event_count": 14,
            "confidence_score": 0.99,
            "raw_payload": {
                "agent_id": "CS-AGT-90124",
                "process": "C:\\Windows\\Temp\\procdump.exe",
                "command_line": "procdump.exe -ma lsass.exe lsass.dmp",
                "mitigation": "Process Terminated & Host Token Locked"
            }
        },
        {
            "title": "Abnormal Mule Account Bulk API Query Rate (1,200 req/min)",
            "severity": "CRITICAL",
            "source_type": "SIEM",
            "source_tool": "Splunk Enterprise SIEM",
            "target_host": "API-UPI-GATEWAY-01",
            "target_ip": "10.240.50.21",
            "source_ip": f"103.142.{random.randint(10, 99)}.{random.randint(1, 254)}",
            "mitre_tactic": "Exfiltration",
            "mitre_technique": "T1567 - Exfiltration Over Web Service",
            "detection_rule": "SIEM-UPI-VELOCITY-OUTLIER-FLAG",
            "event_count": random.randint(1200, 3500),
            "confidence_score": 0.96,
            "raw_payload": {
                "endpoint": "/api/v2/settlement/mule-inquiry",
                "http_status": 429,
                "user_agent": "Python-requests/2.31.0"
            }
        }
    ]

    new_incidents = []
    for t in burst_templates:
        code = f"INC-2026-{random.randint(10000, 99999)}"
        inc = TelemetryIncident(
            incident_code=code,
            title=t["title"],
            severity=t["severity"],
            source_type=t["source_type"],
            source_tool=t["source_tool"],
            timestamp=datetime.utcnow(),
            triage_status="NEW",
            target_host=t["target_host"],
            target_ip=t["target_ip"],
            source_ip=t["source_ip"],
            mitre_tactic=t["mitre_tactic"],
            mitre_technique=t["mitre_technique"],
            detection_rule=t["detection_rule"],
            event_count=t["event_count"],
            confidence_score=t["confidence_score"],
            raw_payload=t["raw_payload"],
            analyst_notes="Automated synthetic alert generated during live telemetry simulation.",
            assigned_to="Unassigned"
        )
        db.add(inc)
        new_incidents.append(inc)

    db.commit()

    return {
        "success": True,
        "message": f"Injected {len(new_incidents)} high-velocity telemetry alerts into the live SOC pipeline.",
        "simulated_incidents": [serialize_incident(inc) for inc in new_incidents]
    }
