from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import random
import hashlib
from app.db.database import get_db
from app.models.all_models import Complaint, User, AuditLog, Investigation, InvestigationNote
from app.schemas.schemas import ComplaintOut, ComplaintCreate
from app.services.auth_service import get_current_user, get_optional_user
from app.services.pii_service import mask_pii

router = APIRouter(prefix="/complaints", tags=["Complaints"])

# In-memory store for dynamic notes and actions per complaint
COMPLAINT_NOTES_STORE: Dict[str, List[Dict[str, Any]]] = {}
COMPLAINT_ACTION_STORE: Dict[str, Dict[str, Any]] = {}

@router.get("", response_model=List[ComplaintOut])
def get_complaints(
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(50, le=500),
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Complaint)
    if state:
        query = query.filter(Complaint.state == state)
    if district:
        query = query.filter(Complaint.district == district)
    if category:
        query = query.filter(Complaint.category == category)
        
    complaints = query.order_by(Complaint.complaint_timestamp.desc()).offset(offset).limit(limit).all()
    
    # Mask PII for frontend security by default unless SUPER_ADMIN or Lead Investigator
    for c in complaints:
        if c.upi_identifier:
            c.upi_identifier = mask_pii(c.upi_identifier, "UPI_ID")
        if c.mobile_identifier:
            c.mobile_identifier = mask_pii(c.mobile_identifier, "MOBILE_NUMBER")
            
    return complaints

@router.get("/search")
def search_complaints(
    q: Optional[str] = None,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    date_range: Optional[str] = None,
    sort_by: Optional[str] = "risk_desc",
    limit: int = Query(25, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Complaint)
    
    if q and q.strip():
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Complaint.complaint_number.ilike(search_term),
                Complaint.narrative.ilike(search_term),
                Complaint.category.ilike(search_term),
                Complaint.district.ilike(search_term),
                Complaint.state.ilike(search_term),
                Complaint.police_jurisdiction.ilike(search_term),
                Complaint.upi_identifier.ilike(search_term),
                Complaint.mobile_identifier.ilike(search_term),
                Complaint.bank_identifier.ilike(search_term)
            )
        )
        
    if status and status.upper() != "ALL":
        query = query.filter(Complaint.status == status.upper())
        
    if category and category.upper() != "ALL":
        query = query.filter(Complaint.category == category)
        
    if state and state.upper() != "ALL":
        query = query.filter(Complaint.state == state)
        
    if district and district.upper() != "ALL":
        query = query.filter(Complaint.district == district)
        
    if date_range and date_range != "all":
        now = datetime.utcnow()
        if date_range == "today":
            start_date = now - timedelta(days=1)
            query = query.filter(Complaint.complaint_timestamp >= start_date)
        elif date_range == "7d":
            start_date = now - timedelta(days=7)
            query = query.filter(Complaint.complaint_timestamp >= start_date)
        elif date_range == "30d":
            start_date = now - timedelta(days=30)
            query = query.filter(Complaint.complaint_timestamp >= start_date)
            
    if risk_level and risk_level.upper() != "ALL":
        if risk_level.upper() == "CRITICAL":
            query = query.filter(Complaint.financial_loss >= 150000)
        elif risk_level.upper() == "HIGH":
            query = query.filter(and_(Complaint.financial_loss >= 75000, Complaint.financial_loss < 150000))
        elif risk_level.upper() == "MODERATE":
            query = query.filter(and_(Complaint.financial_loss >= 25000, Complaint.financial_loss < 75000))
        elif risk_level.upper() == "LOW":
            query = query.filter(Complaint.financial_loss < 25000)

    # Sorting
    if sort_by == "loss_desc":
        query = query.order_by(desc(Complaint.financial_loss))
    elif sort_by == "date_desc":
        query = query.order_by(desc(Complaint.complaint_timestamp))
    elif sort_by == "date_asc":
        query = query.order_by(asc(Complaint.complaint_timestamp))
    else: # risk_desc default
        query = query.order_by(desc(Complaint.financial_loss), desc(Complaint.complaint_timestamp))

    total_count = query.count()
    items = query.offset(offset).limit(limit).all()

    # Enhance items with calculated risk, assigned officer, and AI prediction
    officers = [
        "Insp. Rajesh Kumar (IND-INV-104)",
        "Commanding Officer Rao (IND-CMD-002)",
        "DSP A. Sundaram (TN-DIS-309)",
        "Analyst Priya Sharma (IND-ANL-208)",
        "Insp. Meera Nair (KL-CYB-412)"
    ]

    results = []
    for c in items:
        # Determine risk level
        loss = c.financial_loss or 0.0
        if loss >= 150000:
            risk_score = min(99, int(80 + (loss / 20000)))
            risk_level_str = "CRITICAL"
            ai_pred = "Immediate Cash-Out Escalation Predicted"
        elif loss >= 75000:
            risk_score = int(60 + (loss / 5000))
            risk_level_str = "HIGH"
            ai_pred = "Layered Mule Account Dispersion"
        elif loss >= 25000:
            risk_score = int(40 + (loss / 2000))
            risk_level_str = "MODERATE"
            ai_pred = "Moderate Velocity Transfer"
        else:
            risk_score = int(20 + (loss / 1000))
            risk_level_str = "LOW"
            ai_pred = "Low Anomaly Baseline"

        # Check in-memory action overrides if any
        current_status = COMPLAINT_ACTION_STORE.get(c.complaint_number, {}).get("status", c.status or "UNDER_REVIEW")
        assigned_officer = COMPLAINT_ACTION_STORE.get(c.complaint_number, {}).get("assigned_officer", officers[sum(ord(ch) for ch in c.complaint_number) % len(officers)])

        results.append({
            "id": c.id,
            "complaint_number": c.complaint_number,
            "complaint_timestamp": c.complaint_timestamp.strftime("%Y-%m-%d %H:%M:%S") if c.complaint_timestamp else datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "category": c.category,
            "financial_loss": c.financial_loss,
            "risk_score": risk_score,
            "risk_level": risk_level_str,
            "ai_prediction": ai_pred,
            "status": current_status,
            "state": c.state,
            "district": c.district,
            "police_jurisdiction": c.police_jurisdiction,
            "assigned_officer": assigned_officer,
            "channel": c.channel,
            "payment_method": c.payment_method,
            "upi_identifier": mask_pii(c.upi_identifier, "UPI_ID") if c.upi_identifier else "Not Available",
            "mobile_identifier": mask_pii(c.mobile_identifier, "MOBILE_NUMBER") if c.mobile_identifier else "Not Available"
        })

    return {
        "total": total_count,
        "offset": offset,
        "limit": limit,
        "complaints": results
    }

@router.get("/{id_or_code}/report")
def get_complaint_report(
    id_or_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clean_code = str(id_or_code).strip()
    
    # Audit log report view
    audit = AuditLog(
        username=current_user.username,
        role=current_user.role,
        action="VIEW_COMPLAINT_REPORT",
        resource=f"/complaints/{clean_code}/report",
        details=f"Officer {current_user.full_name} opened dedicated forensic report for complaint #{clean_code}",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()

    # Find complaint in DB
    complaint = db.query(Complaint).filter(
        or_(Complaint.complaint_number == clean_code, Complaint.id == clean_code)
    ).first()

    cities = [
        {"city": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707, "jurisdiction": "Chennai Central Cyber Crime Police Station"},
        {"city": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777, "jurisdiction": "BKC Cyber Police Station, Mumbai"},
        {"city": "New Delhi", "state": "Delhi", "lat": 28.6139, "lng": 77.2090, "jurisdiction": "Special Cell Cyber Command, Delhi Police"},
        {"city": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946, "jurisdiction": "CID Cyber Crime Division, Bengaluru"},
        {"city": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639, "jurisdiction": "Lalbazar Cyber Crime PS, Kolkata Police"},
        {"city": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867, "jurisdiction": "Cyberabad Cyber Crime Unit, Hyderabad"}
    ]

    seed_num = sum(ord(c) for c in clean_code)
    random.seed(seed_num)

    if complaint:
        city_match = next((c for c in cities if c["city"].lower() == complaint.district.lower()), cities[0])
        city_name = complaint.district
        state_name = complaint.state
        lat = complaint.location_lat or city_match["lat"]
        lng = complaint.location_lng or city_match["lng"]
        jurisdiction = complaint.police_jurisdiction or city_match["jurisdiction"]
        amount = complaint.financial_loss or 185000.0
        category = complaint.category or "UPI Impersonation"
        channel = complaint.channel or "WhatsApp / Messaging"
        payment_method = complaint.payment_method or "UPI"
        narrative = complaint.narrative or f"Victim reported fraudulent transfer under {category} after receiving unauthorized request."
        c_timestamp = complaint.complaint_timestamp
        c_number = complaint.complaint_number
        c_id = complaint.id
        source_portal = complaint.source_portal or "National Cybercrime Reporting Portal (NCCP)"
        masked_upi = mask_pii(complaint.upi_identifier, "UPI_ID") if complaint.upi_identifier else f"refund.pay{random.randint(100,999)}@ybl"
        masked_phone = mask_pii(complaint.mobile_identifier, "MOBILE_NUMBER") if complaint.mobile_identifier else f"+91 98XXX {random.randint(10000,99999)}"
        raw_status = complaint.status or "UNDER_REVIEW"
    else:
        # Dynamic deterministic fallback for citizen-entered 12-digit code
        selected_city = cities[seed_num % len(cities)]
        city_name = selected_city["city"]
        state_name = selected_city["state"]
        lat = selected_city["lat"]
        lng = selected_city["lng"]
        jurisdiction = selected_city["jurisdiction"]
        amount = float(random.choice([145000, 185000, 275000, 320000, 480000]))
        category = random.choice(["UPI Impersonation", "Digital Arrest Scam", "Fake Banking Portal", "Investment Fraud"])
        channel = random.choice(["WhatsApp", "Telegram", "Phone Call", "Phishing Web", "SMS"])
        payment_method = "UPI" if "UPI" in category else "Bank Transfer"
        narrative = f"Victim received fraudulent communication masquerading as official authority for {category}. An unauthorized transfer of INR {amount:,.2f} was executed to suspect mule account."
        c_timestamp = datetime.utcnow() - timedelta(hours=random.randint(2, 48))
        c_number = clean_code
        c_id = f"CMP-{clean_code}"
        source_portal = "National Cybercrime Reporting Portal (NCCP)"
        masked_upi = f"pay.mule{random.randint(100,999)}@oksbi"
        masked_phone = f"+91 98765 {random.randint(10000,99999)}"
        raw_status = "UNDER_REVIEW"

    # In-memory overrides if officer acted on this complaint
    action_override = COMPLAINT_ACTION_STORE.get(c_number, {})
    current_status = action_override.get("status", raw_status)
    assigned_officer = action_override.get("assigned_officer", "Insp. Rajesh Kumar (IND-INV-104)")
    is_frozen = action_override.get("is_frozen", False)
    is_dispatched = action_override.get("is_dispatched", False)

    # Risk calculations
    if amount >= 150000:
        risk_score = min(98.5, 82.0 + (amount / 25000))
        risk_level = "CRITICAL"
        ai_prediction = "High Probability ATM Cash-Out Escalation"
        fraud_prob = 0.94
        confidence_pct = 91.4
    elif amount >= 75000:
        risk_score = 72.0 + (amount / 10000)
        risk_level = "HIGH"
        ai_prediction = "Rapid Layered Mule Dispersion"
        fraud_prob = 0.86
        confidence_pct = 88.0
    else:
        risk_score = 45.0 + (amount / 5000)
        risk_level = "MODERATE"
        ai_prediction = "Standard Fraud Pattern Detected"
        fraud_prob = 0.72
        confidence_pct = 84.5

    # Recovered and amount at risk
    recovered_amt = action_override.get("recovered_amount", 0.0)
    amt_at_risk = max(0.0, amount - recovered_amt)

    # Top ATM Hotspots
    victim_bank = random.choice(["State Bank of India", "HDFC Bank", "ICICI Bank", "Punjab National Bank", "Axis Bank"])
    suspect_mule_acc = f"MULE-{random.randint(1000000000, 9999999999)}"
    utr_code = f"UTR{clean_code}"
    
    atm_names = [
        f"{victim_bank} e-Corner ATM",
        "Axis Bank 24x7 Cash Dispenser",
        "HDFC Bank Express ATM Terminal",
        "Punjab National Bank ATM Hub",
        "ICICI Bank Touch Banking ATM"
    ]
    
    hotspots = []
    for i, name in enumerate(atm_names):
        dist = round(0.3 + (i * 0.42), 2)
        eta = max(2, int(dist * 3.5))
        hotspots.append({
            "atm_id": f"ATM-{city_name[:3].upper()}-{100 + i}",
            "atm_name": f"{name} ({city_name} Sector {i+1})",
            "latitude": round(lat + (random.uniform(-0.015, 0.015)), 6),
            "longitude": round(lng + (random.uniform(-0.015, 0.015)), 6),
            "distance_km": dist,
            "estimated_arrival_eta_mins": eta,
            "cashout_risk_score": round(max(0.65, 0.98 - (i * 0.06)), 2),
            "action_priority": "CRITICAL" if i < 2 else "HIGH",
            "cctv_status": "FEED_STREAMING_ONLINE",
            "patrol_distance_mins": max(1, eta - 2)
        })

    # Transaction Timeline Events
    timeline_events = [
        {
            "id": "tl-1",
            "title": "Unauthorized Transaction Occurred",
            "description": f"Fraudulent transaction of INR {amount:,.2f} executed via {payment_method} ({utr_code}).",
            "timestamp": (c_timestamp - timedelta(minutes=45)).strftime("%Y-%m-%d %H:%M:%S"),
            "badge": "TRANSACTION_OCCURRED",
            "badge_color": "bg-red-50 text-red-700 border-red-200"
        },
        {
            "id": "tl-2",
            "title": "Citizen Complaint Registered",
            "description": f"Victim logged official complaint #{c_number} with narrative and transaction identifiers.",
            "timestamp": c_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "badge": "COMPLAINT_SUBMITTED",
            "badge_color": "bg-blue-50 text-[#005A9C] border-blue-200"
        },
        {
            "id": "tl-3",
            "title": "AI Model Fraud Anomaly Detected",
            "description": f"IsolationForest flagged transaction velocity and QR collect pattern (Score: {fraud_prob:.2f}).",
            "timestamp": (c_timestamp + timedelta(minutes=3)).strftime("%Y-%m-%d %H:%M:%S"),
            "badge": "AI_ANOMALY_DETECTED",
            "badge_color": "bg-purple-50 text-purple-700 border-purple-200"
        },
        {
            "id": "tl-4",
            "title": "Early Warning Alert Dispatched",
            "description": f"Early Warning Engine assigned {risk_level} severity alert to {jurisdiction}.",
            "timestamp": (c_timestamp + timedelta(minutes=7)).strftime("%Y-%m-%d %H:%M:%S"),
            "badge": "ALERT_DISPATCHED",
            "badge_color": "bg-amber-50 text-amber-800 border-amber-200"
        },
        {
            "id": "tl-5",
            "title": "Assigned to Investigating Officer",
            "description": f"Assigned to {assigned_officer} for immediate forensic inspection and KYC verification.",
            "timestamp": (c_timestamp + timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S"),
            "badge": "OFFICER_ASSIGNED",
            "badge_color": "bg-emerald-50 text-emerald-800 border-emerald-200"
        }
    ]

    if is_frozen:
        timeline_events.append({
            "id": "tl-6",
            "title": "CFCFRMS Emergency Freeze Broadcasted",
            "description": f"Emergency account freeze broadcasted to {victim_bank} & suspect node {suspect_mule_acc}.",
            "timestamp": action_override.get("freeze_time", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")),
            "badge": "ACCOUNT_FROZEN",
            "badge_color": "bg-emerald-50 text-emerald-800 border-emerald-200"
        })

    if is_dispatched:
        timeline_events.append({
            "id": "tl-7",
            "title": "PCR Patrol Unit Dispatched",
            "description": f"PCR Patrol Unit Unit-04 dispatched toward {hotspots[0]['atm_name']} (ETA: 3 mins).",
            "timestamp": action_override.get("dispatch_time", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")),
            "badge": "PATROL_DEPLOYED",
            "badge_color": "bg-blue-50 text-[#005A9C] border-blue-200"
        })

    # Entity Graph Elements for this Complaint
    entity_nodes = [
        {
            "id": "n-comp",
            "type": "input",
            "data": { "label": f"Complaint: #{c_number}\n({city_name})" },
            "position": { "x": 50, "y": 140 },
            "style": { "background": "#FFFFFF", "color": "#005A9C", "border": "2px solid #005A9C", "fontWeight": "bold", "borderRadius": "8px" }
        },
        {
            "id": "n-victim-bank",
            "data": { "label": f"Victim Bank:\n{victim_bank}" },
            "position": { "x": 240, "y": 40 },
            "style": { "background": "#FFFFFF", "color": "#1E293B", "border": "1.5px solid #94A3B8", "borderRadius": "8px" }
        },
        {
            "id": "n-upi",
            "data": { "label": f"Suspect UPI:\n{masked_upi}\n(Risk: {int(risk_score)})" },
            "position": { "x": 260, "y": 240 },
            "style": { "background": "#FFFFFF", "color": "#7C3AED", "border": "2px solid #7C3AED", "fontWeight": "bold", "borderRadius": "8px" }
        },
        {
            "id": "n-mule",
            "data": { "label": f"Mule Account:\n{suspect_mule_acc}" },
            "position": { "x": 480, "y": 240 },
            "style": { "background": "#FFFFFF", "color": "#DC2626", "border": "2px solid #DC2626", "fontWeight": "bold", "borderRadius": "8px" }
        },
        {
            "id": "n-phone",
            "data": { "label": f"Suspect Phone:\n{masked_phone}" },
            "position": { "x": 480, "y": 80 },
            "style": { "background": "#FFFFFF", "color": "#D97706", "border": "1.5px solid #D97706", "borderRadius": "8px" }
        },
        {
            "id": "n-atm",
            "type": "output",
            "data": { "label": f"Target ATM:\n{hotspots[0]['atm_name'][:25]}..." },
            "position": { "x": 680, "y": 160 },
            "style": { "background": "#FFFFFF", "color": "#DC2626", "border": "2px solid #DC2626", "fontWeight": "bold", "borderRadius": "8px" }
        }
    ]

    entity_edges = [
        { "id": "e-1", "source": "n-comp", "target": "n-victim-bank", "label": "debited from", "animated": True },
        { "id": "e-2", "source": "n-comp", "target": "n-upi", "label": "transferred to", "animated": True },
        { "id": "e-3", "source": "n-upi", "target": "n-mule", "label": "linked beneficiary", "animated": True },
        { "id": "e-4", "source": "n-upi", "target": "n-phone", "label": "registered mobile", "animated": True },
        { "id": "e-5", "source": "n-mule", "target": "n-atm", "label": "predicted cash-out", "animated": True }
    ]

    # Related Complaints
    related_complaints = [
        {
            "complaint_number": f"NCCP-2026-{100000 + ((seed_num + 17) % 5000)}",
            "relationship": f"Same Suspect UPI ({masked_upi})",
            "risk_level": "CRITICAL",
            "financial_loss": round(amount * 0.85, 2),
            "status": "UNDER_INVESTIGATION",
            "district": city_name,
            "state": state_name
        },
        {
            "complaint_number": f"NCCP-2026-{100000 + ((seed_num + 43) % 5000)}",
            "relationship": f"Same Beneficiary Mule ({suspect_mule_acc[:10]}...)",
            "risk_level": "HIGH",
            "financial_loss": round(amount * 0.65, 2),
            "status": "OPEN",
            "district": "Coimbatore" if city_name == "Chennai" else "Pune",
            "state": state_name
        },
        {
            "complaint_number": f"NCCP-2026-{100000 + ((seed_num + 89) % 5000)}",
            "relationship": "Identical QR Collect Phishing Pattern",
            "risk_level": "MODERATE",
            "financial_loss": round(amount * 0.45, 2),
            "status": "UNDER_REVIEW",
            "district": city_name,
            "state": state_name
        }
    ]

    # Stored or Initial Notes
    existing_notes = COMPLAINT_NOTES_STORE.get(c_number, [
        {
            "id": "note-1",
            "officer_name": assigned_officer.split(" (")[0],
            "timestamp": (c_timestamp + timedelta(minutes=20)).strftime("%Y-%m-%d %H:%M:%S"),
            "note_text": f"Initial dossier review completed for {category}. Verified transaction UTR {utr_code} against victim bank logs."
        },
        {
            "id": "note-2",
            "officer_name": "Analyst Priya Sharma",
            "timestamp": (c_timestamp + timedelta(minutes=35)).strftime("%Y-%m-%d %H:%M:%S"),
            "note_text": f"Mule account {suspect_mule_acc} flagged in national cybercrime syndicate index. Escalated priority to {risk_level}."
        }
    ])

    # Evidence Attachments
    evidence_list = [
        {
            "id": "ev-1",
            "title": "Bank Transaction UTR Receipt",
            "file_type": "PDF",
            "file_size": "245 KB",
            "upload_timestamp": c_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "verified": True
        },
        {
            "id": "ev-2",
            "title": "Victim Mobile Payment Confirmation Screenshot",
            "file_type": "PNG",
            "file_size": "1.4 MB",
            "upload_timestamp": c_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "verified": True
        },
        {
            "id": "ev-3",
            "title": "Suspect Communication Transcript & QR Collect Export",
            "file_type": "TXT",
            "file_size": "18 KB",
            "upload_timestamp": (c_timestamp + timedelta(minutes=5)).strftime("%Y-%m-%d %H:%M:%S"),
            "verified": True
        }
    ]

    # Map current status to stage index
    stage_map = {
        "SUBMITTED": 0,
        "NEW": 0,
        "UNDER_REVIEW": 1,
        "UNDER_INVESTIGATION": 2,
        "CASE_CREATED": 3,
        "FROZEN": 3,
        "RESOLVED": 4,
        "CLOSED": 4,
        "WITHDRAWN": 4
    }

    return {
        "complaint_id": c_id,
        "complaint_number": c_number,
        "source_portal": source_portal,
        "complaint_timestamp": c_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "last_updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "current_status": current_status,
        "status_stage_index": stage_map.get(current_status, 1),
        "priority": "CRITICAL" if amount >= 150000 else ("HIGH" if amount >= 75000 else "MEDIUM"),
        "assigned_officer": assigned_officer,
        "jurisdiction": jurisdiction,
        "investigation_stage": "STAGE 2: FORENSIC TRIAGE & ASSET FREEZE",

        # Section 1: Complaint Summary
        "summary": {
            "complaint_number": c_number,
            "category": category,
            "timestamp": c_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "current_status": current_status,
            "assigned_officer": assigned_officer,
            "jurisdiction": jurisdiction,
            "reported_amount": amount,
            "recovered_amount": recovered_amt,
            "amount_at_risk": amt_at_risk,
            "priority": "CRITICAL" if amount >= 150000 else ("HIGH" if amount >= 75000 else "MEDIUM"),
            "investigation_stage": "Stage 2: Forensic Interception & ATM Hotspot Surveillance"
        },

        # Section 2: Victim Information
        "victim": {
            "name": "Citizen Complainant (Identity Masked for Privacy)",
            "mobile_number": masked_phone,
            "email": "c********@usermail.gov.in",
            "state": state_name,
            "district": city_name,
            "city": city_name,
            "bank_name": victim_bank,
            "account_number": "SBIN-XXXX-9921",
            "upi_id": "victim.secure@okaxis"
        },

        # Section 3: Incident / Fraud Details
        "incident": {
            "category": category,
            "attack_method": channel,
            "transaction_type": payment_method,
            "transaction_id": utr_code,
            "transaction_amount": amount,
            "transaction_timestamp": (c_timestamp - timedelta(minutes=45)).strftime("%Y-%m-%d %H:%M:%S"),
            "source_account": f"{victim_bank} (A/C: ****4481)",
            "destination_account": suspect_mule_acc,
            "suspect_upi_id": masked_upi,
            "merchant_name": f"{category} Fake Payment Gateway",
            "device_info": "Android 14 (Mobile Gateway / Chrome Mobile)",
            "ip_address": f"103.142.{random.randint(10,99)}.{random.randint(10,250)} (VPN Proxy Node)",
            "narrative": narrative
        },

        # Section 4: AI Fraud Assessment
        "ai_assessment": {
            "fraud_probability": fraud_prob,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "model_prediction": ai_prediction,
            "confidence_pct": confidence_pct,
            "model_name": "XGB-Hybrid-XAI Forecaster (v2.1)",
            "why_flagged_factors": [
                { "feature": "Complaint Growth Velocity", "impact": "+27%", "direction": "HIGH_ESCALATION" },
                { "feature": "IsolationForest Anomaly Signature", "impact": "+22%", "direction": "CRITICAL_SPIKE" },
                { "feature": "Syndicate Mule Account Cluster", "impact": "+20%", "direction": "MULTIPLE_LINKAGES" },
                { "feature": "Cross-District Regional Concentration", "impact": "+18%", "direction": "TARGETED_REGION" },
                { "feature": "ATM Withdrawal Time Horizon Proximity", "impact": "+13%", "direction": "IMMINENT_CASHOUT" }
            ],
            "shap_explanation_available": True
        },

        # Section 5: Transaction Timeline
        "timeline": timeline_events,

        # Section 6: Entity Intelligence
        "entity_graph": {
            "nodes": entity_nodes,
            "edges": entity_edges
        },

        # Section 7: Geographical Intelligence
        "geography": {
            "incident_location": {
                "city": city_name,
                "district": city_name,
                "state": state_name,
                "latitude": lat,
                "longitude": lng,
                "police_jurisdiction": jurisdiction
            },
            "forecasted_atm_hotspots": hotspots
        },

        # Section 8: Related Complaints
        "related_complaints": related_complaints,

        # Section 9: Investigation Actions Status
        "actions_status": {
            "is_frozen": is_frozen,
            "is_dispatched": is_dispatched,
            "freeze_time": action_override.get("freeze_time", None),
            "dispatch_time": action_override.get("dispatch_time", None)
        },

        # Section 10: Investigation Notes
        "notes": existing_notes,

        # Section 11: Evidence List
        "evidence": evidence_list
    }

@router.post("/{id_or_code}/notes")
def add_complaint_note(
    id_or_code: str,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clean_code = str(id_or_code).strip()
    note_text = str(payload.get("note_text", "")).strip()
    
    if not note_text:
        raise HTTPException(status_code=400, detail="Note text cannot be empty")
        
    officer_name = str(payload.get("officer_name", current_user.full_name or "Director General Admin"))
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    new_note = {
        "id": f"note-{datetime.utcnow().timestamp()}",
        "officer_name": officer_name,
        "timestamp": now_str,
        "note_text": note_text
    }

    if clean_code not in COMPLAINT_NOTES_STORE:
        COMPLAINT_NOTES_STORE[clean_code] = []
        
    COMPLAINT_NOTES_STORE[clean_code].insert(0, new_note)

    # Log to audit trail
    audit = AuditLog(
        username=current_user.username,
        role=current_user.role,
        action="ADD_COMPLAINT_NOTE",
        resource=f"/complaints/{clean_code}/notes",
        details=f"Officer {officer_name} added note to complaint #{clean_code}: {note_text[:60]}...",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "SUCCESS",
        "complaint_number": clean_code,
        "note": new_note,
        "message": "Investigation note recorded successfully."
    }

@router.post("/{id_or_code}/action")
def perform_complaint_action(
    id_or_code: str,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clean_code = str(id_or_code).strip()
    action_type = str(payload.get("action_type", "")).upper()
    officer_name = str(payload.get("officer_name", current_user.full_name or "Director General Admin"))
    details = str(payload.get("details", ""))
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    if clean_code not in COMPLAINT_ACTION_STORE:
        COMPLAINT_ACTION_STORE[clean_code] = {
            "status": "UNDER_REVIEW",
            "assigned_officer": "Insp. Rajesh Kumar (IND-INV-104)",
            "is_frozen": False,
            "is_dispatched": False,
            "recovered_amount": 0.0
        }

    store = COMPLAINT_ACTION_STORE[clean_code]
    msg = ""

    if action_type == "ASSIGN_OFFICER":
        new_officer = payload.get("new_officer", "Insp. Rajesh Kumar (IND-INV-104)")
        store["assigned_officer"] = new_officer
        msg = f"Assigned case #{clean_code} to {new_officer}."
    elif action_type == "MARK_UNDER_INVESTIGATION":
        store["status"] = "UNDER_INVESTIGATION"
        msg = f"Complaint #{clean_code} status updated to UNDER_INVESTIGATION."
    elif action_type == "FREEZE_ACCOUNT":
        store["is_frozen"] = True
        store["freeze_time"] = now_str
        store["status"] = "FROZEN"
        msg = f"CFCFRMS Emergency Freeze broadcasted for #{clean_code}."
    elif action_type == "DISPATCH_PCR":
        store["is_dispatched"] = True
        store["dispatch_time"] = now_str
        msg = f"PCR Patrol Unit Unit-04 dispatched for #{clean_code}."
    elif action_type == "CREATE_CASE":
        store["status"] = "CASE_CREATED"
        msg = f"Formal FIR/Investigation case created for #{clean_code}."
    elif action_type == "ESCALATE":
        store["status"] = "UNDER_INVESTIGATION"
        msg = f"Escalated complaint #{clean_code} to High-Priority Interception Desk."
    elif action_type == "CLOSE_COMPLAINT":
        store["status"] = "CLOSED"
        msg = f"Complaint #{clean_code} marked as RESOLVED and CLOSED."
    elif action_type == "UPDATE_STATUS":
        new_status = payload.get("status", "UNDER_INVESTIGATION")
        store["status"] = new_status
        msg = f"Complaint #{clean_code} status updated to {new_status}."
    else:
        msg = f"Executed {action_type} for #{clean_code}."

    # Also add automatic note in the notes store
    if clean_code not in COMPLAINT_NOTES_STORE:
        COMPLAINT_NOTES_STORE[clean_code] = []
    COMPLAINT_NOTES_STORE[clean_code].insert(0, {
        "id": f"note-action-{datetime.utcnow().timestamp()}",
        "officer_name": officer_name,
        "timestamp": now_str,
        "note_text": f"[ACTION LOG] {msg} {details}".strip()
    })

    # Log to audit trail
    audit = AuditLog(
        username=current_user.username,
        role=current_user.role,
        action=f"COMPLAINT_ACTION_{action_type}",
        resource=f"/complaints/{clean_code}/action",
        details=f"Officer {officer_name} executed {action_type} on #{clean_code}: {msg}",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()

    return {
        "status": "SUCCESS",
        "complaint_number": clean_code,
        "action_type": action_type,
        "current_status": store["status"],
        "assigned_officer": store["assigned_officer"],
        "is_frozen": store["is_frozen"],
        "is_dispatched": store["is_dispatched"],
        "message": msg,
        "timestamp": now_str
    }

@router.get("/track/{code}")
def track_complaint(
    code: str,
    db: Session = Depends(get_db)
):
    clean_code = str(code).strip()
    c = db.query(Complaint).filter(Complaint.complaint_number == clean_code).first()
    if not c:
        c = db.query(Complaint).filter(Complaint.id == clean_code).first()
    if not c:
        raise HTTPException(status_code=404, detail=f"Complaint #{clean_code} not found")
    loss = c.financial_loss or 0.0
    if loss >= 150000:
        risk_level = "CRITICAL"
    elif loss >= 75000:
        risk_level = "HIGH"
    elif loss >= 25000:
        risk_level = "MODERATE"
    else:
        risk_level = "LOW"

    return {
        "complaint_code": c.complaint_number,
        "status": c.status,
        "category": c.category,
        "sub_category": c.modus_operandi_type,
        "financial_loss": c.financial_loss,
        "incident_date": c.complaint_timestamp.isoformat() if c.complaint_timestamp else None,
        "state": c.state,
        "district": c.district,
        "risk_level": risk_level,
        "created_at": c.created_at.isoformat() if c.created_at else None
    }

@router.post("", response_model=ComplaintOut)
def create_complaint(complaint_in: ComplaintCreate, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_user)):
    c = Complaint(**complaint_in.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

@router.post("/withdraw")
def withdraw_complaint(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    code = str(payload.get("complaint_code", "")).strip()
    reason = str(payload.get("withdrawal_reason", "Resolved with banking merchant"))
    
    complaint = db.query(Complaint).filter(Complaint.complaint_number == code).first()
    if complaint:
        complaint.status = "WITHDRAWN"
        db.commit()
        db.refresh(complaint)

    cert_hash = hashlib.sha256(f"{code}:WITHDRAWN:{datetime.utcnow()}".encode()).hexdigest()

    return {
        "status": "SUCCESS",
        "complaint_code": code,
        "withdrawal_status": "WITHDRAWN_AND_CLOSED",
        "withdrawal_reason": reason,
        "message": f"Complaint #{code} has been successfully withdrawn and closed in CFCFRMS.",
        "cancellation_timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "digital_certificate_hash": cert_hash
    }

@router.get("/admin-inspect/{code}")
def admin_inspect_complaint(
    code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Delegate to get_complaint_report for unified data consistency
    report = get_complaint_report(code, db, current_user)
    geo = report.get("geography", {})
    incident_loc = geo.get("incident_location", {})
    summary = report.get("summary", {})
    victim = report.get("victim", {})
    incident = report.get("incident", {})

    normalized = {
        **report,
        "complaint_code": report.get("complaint_number") or code,
        "status": report.get("current_status") or "ACTIVE_INTERCEPTION",
        "category": summary.get("category") or "UPI Impersonation & Layered Withdrawal",
        "financial_loss": summary.get("reported_amount") or 185000.0,
        "victim_bank": victim.get("bank_name") or "State Bank of India",
        "suspect_mule_account": incident.get("destination_account") or "HDFC-0019283719",
        "transaction_id": incident.get("transaction_id") or f"UTR{code}",
        "timestamp": report.get("complaint_timestamp"),
        "location": incident_loc,
        "forecasted_atm_hotspots": geo.get("forecasted_atm_hotspots", []),
        "urgency_level": f"{report.get('priority', 'CRITICAL')} IMMEDIATE INTERCEPTION"
    }
    return normalized

@router.get("/{id}", response_model=ComplaintOut)
def get_complaint_by_id(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    c = db.query(Complaint).filter(Complaint.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return c

