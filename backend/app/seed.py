import random
from datetime import datetime, timedelta
from app.db.database import SessionLocal, engine, Base
from app.models.all_models import (
    User, Complaint, LocationRisk, Entity, ThreatCluster, ThreatClusterMember,
    Forecast, Anomaly, RiskScore, EarlyWarning, Investigation, InvestigationNote,
    Feedback, AuditLog, ModelMetric
)
from app.services.auth_service import get_password_hash
from app.services.pii_service import mask_pii

# Seed random generator deterministically
random.seed(42)

INDIAN_STATES_DISTRICTS = [
    {"state": "Tamil Nadu", "district": "Chennai", "lat": 13.0827, "lng": 80.2707, "risk": 78.0, "dominant": "UPI Impersonation"},
    {"state": "Tamil Nadu", "district": "Coimbatore", "lat": 11.0168, "lng": 76.9558, "risk": 62.0, "dominant": "Job Scam"},
    {"state": "Tamil Nadu", "district": "Madurai", "lat": 9.9252, "lng": 78.1198, "risk": 54.0, "dominant": "Phishing"},
    {"state": "Maharashtra", "district": "Mumbai", "lat": 19.0760, "lng": 72.8777, "risk": 84.0, "dominant": "Digital Arrest Scam"},
    {"state": "Maharashtra", "district": "Pune", "lat": 18.5204, "lng": 73.8567, "risk": 71.0, "dominant": "Investment Scam"},
    {"state": "Delhi", "district": "New Delhi", "lat": 28.6139, "lng": 77.2090, "risk": 89.0, "dominant": "UPI Fraud"},
    {"state": "Karnataka", "district": "Bengaluru Urban", "lat": 12.9716, "lng": 77.5946, "risk": 82.0, "dominant": "Phishing & Fake Banking"},
    {"state": "Telangana", "district": "Hyderabad", "lat": 17.3850, "lng": 78.4867, "risk": 76.0, "dominant": "Courier & Customs Fraud"},
    {"state": "West Bengal", "district": "Kolkata", "lat": 22.5726, "lng": 88.3639, "risk": 68.0, "dominant": "Instant Loan App Scam"},
    {"state": "Gujarat", "district": "Ahmedabad", "lat": 23.0225, "lng": 72.5714, "risk": 59.0, "dominant": "Fake Customer Support"}
]

CATEGORIES = [
    "UPI Impersonation", "Digital Arrest Scam", "Phishing & Fake Banking",
    "Investment & Crypto Scam", "Job & Part-Time Scam", "Fake Customer Support",
    "Romance & Sextortion", "Courier & Customs Fraud", "Instant Loan App Fraud", "Account Takeover / SIM Swap"
]

CHANNELS = ["WhatsApp", "Telegram", "Phone Call", "Phishing Web", "SMS", "Social Media", "Video Call"]
PAYMENTS = ["UPI", "Bank Transfer", "Credit Card", "Wallet", "Crypto"]

def seed_database():
    print("Re-creating Database Tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("Seeding Users & Roles...")
    hashed_pwd = get_password_hash("Password@123")
    
    users = [
        User(username="superadmin", email="admin@cyberpredictx.gov.in", full_name="Director General Admin", role="SUPER_ADMIN", hashed_password=hashed_pwd, badge_id="IND-CMD-001"),
        User(username="command_officer", email="command@cyberpredictx.gov.in", full_name="Commanding Officer Rao", role="CYBER_COMMAND_OFFICER", hashed_password=hashed_pwd, badge_id="IND-CMD-002"),
        User(username="investigator_1", email="investigator@cyberpredictx.gov.in", full_name="Insp. Rajesh Kumar", role="INVESTIGATOR", hashed_password=hashed_pwd, badge_id="IND-INV-104"),
        User(username="analyst_1", email="analyst@cyberpredictx.gov.in", full_name="Analyst Priya Sharma", role="ANALYST", hashed_password=hashed_pwd, badge_id="IND-ANL-208"),
        User(username="district_officer", email="district@cyberpredictx.gov.in", full_name="DSP A. Sundaram", role="DISTRICT_OFFICER", hashed_password=hashed_pwd, state="Tamil Nadu", district="Chennai", badge_id="TN-DIS-309"),
        User(username="auditor_1", email="auditor@cyberpredictx.gov.in", full_name="Auditor V. Nair", role="AUDITOR", hashed_password=hashed_pwd, badge_id="IND-AUD-501")
    ]
    db.add_all(users)
    db.commit()

    print("Seeding Location Risks...")
    locations = []
    for loc in INDIAN_STATES_DISTRICTS:
        l = LocationRisk(
            state=loc["state"],
            district=loc["district"],
            police_jurisdiction=f"{loc['district']} Central Police Station",
            latitude=loc["lat"],
            longitude=loc["lng"],
            current_risk_score=loc["risk"],
            forecast_risk_score=min(99.0, loc["risk"] + random.uniform(2.0, 8.0)),
            risk_band="CRITICAL" if loc["risk"] >= 76 else ("HIGH" if loc["risk"] >= 51 else "MODERATE"),
            complaint_count=random.randint(120, 580),
            dominant_category=loc["dominant"]
        )
        locations.append(l)
    db.add_all(locations)
    db.commit()

    print("Seeding Synthetic Complaints (10,000 records)...")
    complaints = []
    now = datetime.utcnow()
    
    for i in range(1, 10001):
        loc = random.choice(INDIAN_STATES_DISTRICTS)
        cat = random.choice(CATEGORIES)
        
        # Inject concentrated UPI Impersonation signature scenario pattern for Tamil Nadu & Delhi
        if i % 3 == 0:
            cat = "UPI Impersonation"
            loc = INDIAN_STATES_DISTRICTS[0]  # Chennai, Tamil Nadu

        timestamp = now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23), minutes=random.randint(0, 59))
        fin_loss = round(random.uniform(5000, 250000), 2)
        
        mobile_num = f"98765{random.randint(10000, 99999)}"
        upi_id = f"refund.pay{random.randint(100, 999)}@ybl"
        
        c = Complaint(
            complaint_number=f"NCCP-2026-{100000 + i}",
            source_portal="National Cybercrime Reporting Portal (NCCP)",
            complaint_timestamp=timestamp,
            state=loc["state"],
            district=loc["district"],
            police_jurisdiction=f"{loc['district']} Cyber Cell",
            location_lat=loc["lat"] + random.uniform(-0.05, 0.05),
            location_lng=loc["lng"] + random.uniform(-0.05, 0.05),
            category=cat,
            financial_loss=fin_loss,
            channel=random.choice(CHANNELS),
            payment_method="UPI" if cat == "UPI Impersonation" else random.choice(PAYMENTS),
            modus_operandi_type=cat,
            narrative=f"Victim reported fraud under {cat}. Suspect contacted via messaging claiming refund approval. Received fake QR collect request. Transferred INR {fin_loss:.0f} via UPI ID {upi_id} from phone number {mobile_num}.",
            upi_identifier=mask_pii(upi_id, "UPI"),
            mobile_identifier=mask_pii(mobile_num, "MOBILE"),
            email_identifier=mask_pii(f"helpdesk{random.randint(10,99)}@fastmail.com", "EMAIL"),
            bank_identifier=mask_pii(f"SBIN000{random.randint(1000,9999)}", "BANK"),
            domain_url=f"https://secure-verify-{random.randint(100,999)}.xyz",
            social_identifier=f"@cyber_target_{random.randint(100,999)}",
            priority="HIGH" if fin_loss > 100000 else "MEDIUM",
            status="OPEN"
        )
        complaints.append(c)
        if len(complaints) >= 2000:
            db.bulk_save_objects(complaints)
            db.commit()
            complaints = []
            
    if complaints:
        db.bulk_save_objects(complaints)
        db.commit()

    print("Seeding Entities & Relationships...")
    entities = [
        Entity(entity_type="UPI_ID", entity_value="refund.pay882@ybl", masked_value=mask_pii("refund.pay882@ybl", "UPI_ID"), risk_score=92.0, total_complaints=42, total_financial_loss=1450000.0, status="HIGH_RISK_SUSPECT"),
        Entity(entity_type="MOBILE_NUMBER", entity_value="9876543210", masked_value=mask_pii("9876543210", "MOBILE_NUMBER"), risk_score=89.0, total_complaints=38, total_financial_loss=1200000.0, status="BLOCKED_TELECOM"),
        Entity(entity_type="EMAIL", entity_value="support@cyber-help.org", masked_value=mask_pii("support@cyber-help.org", "EMAIL"), risk_score=84.0, total_complaints=24, total_financial_loss=850000.0, status="UNDER_MONITORING"),
        Entity(entity_type="DOMAIN_URL", entity_value="https://secure-verify-991.xyz", masked_value="https://secure-verify-991.xyz", risk_score=95.0, total_complaints=56, total_financial_loss=1920000.0, status="TAKEDOWN_REQUESTED")
    ]
    db.add_all(entities)
    db.commit()

    print("Seeding Signature Threat Cluster (UPI Impersonation Ring)...")
    tc = ThreatCluster(
        cluster_code="TC-IN-2026-1042",
        title="Potential UPI Impersonation & Refund Fraud Ring",
        category="UPI Impersonation",
        growth_rate_pct=47.2,
        baseline_vol=120,
        current_vol=176,
        anomaly_score=0.91,
        risk_score=88.5,
        primary_state="Tamil Nadu",
        primary_district="Chennai",
        peak_hours="18:00–22:00",
        status="REQUIRES_REVIEW",
        intelligence_state="CORRELATED",
        dna_metrics={
            "threat": "UPI Impersonation",
            "category": "Financial Fraud",
            "channel": "Messaging",
            "payment": "UPI",
            "region": "Tamil Nadu / Chennai",
            "growth": "+47%",
            "cluster_size": 176,
            "peak_time": "18:00–22:00",
            "anomaly": 0.91,
            "confidence": "86%",
            "status": "REQUIRES REVIEW"
        }
    )
    db.add(tc)
    db.commit()

    print("Seeding Early Warning #EW-1042...")
    ew = EarlyWarning(
        warning_code="EW-1042",
        severity="HIGH",
        threat_name="UPI Impersonation Threat Escalation",
        region="Chennai, Tamil Nadu",
        category="UPI Impersonation",
        signal_summary="Complaint activity increased 47% over 72 hours. Multiple victims targeted via QR Collect requests.",
        forecast_trend="HIGH → CRITICAL Escalation Expected",
        confidence_pct=86.0,
        status="PENDING_REVIEW"
    )
    db.add(ew)
    db.commit()

    print("Seeding Initial Investigation Case...")
    inv = Investigation(
        case_number="CASE-2026-8841",
        title="Investigation into Chennai UPI Impersonation Syndicate",
        warning_id=ew.id,
        cluster_id=tc.id,
        risk_score=88.5,
        status="OPEN",
        lead_officer="Insp. Rajesh Kumar",
        summary="Authorized investigation into multi-district UPI impersonation syndicate targeting digital bank customers across Tamil Nadu."
    )
    db.add(inv)
    db.commit()

    note = InvestigationNote(
        investigation_id=inv.id,
        officer_name="Insp. Rajesh Kumar",
        note_text="Correlated 74 complaints with common UPI handles and fraudulent QR codes. Issued notice to bank gateway for transaction hold.",
        is_sensitive=False
    )
    db.add(note)

    print("Seeding Model Observatory Metrics & Audit Logs...")
    model_m = ModelMetric(
        model_name="CyberPredict Hybrid Anomaly & Forecast Engine",
        model_version="v2.1-Hybrid-XAI",
        model_type="IsolationForest + Holt-Winters + DBSCAN",
        accuracy=0.912,
        precision=0.895,
        recall=0.884,
        f1_score=0.889,
        data_drift_score=0.038,
        feature_drift_score=0.029,
        training_sample_count=18500,
        data_quality_score=94.5,
        status="ACTIVE"
    )
    db.add(model_m)

    audit = AuditLog(
        username="superadmin",
        role="SUPER_ADMIN",
        action="SYSTEM_INIT",
        resource="DATABASE_SEED",
        details="Seeded initial synthetic cybercrime dataset and trained predictive ML models.",
        status="SUCCESS"
    )
    db.add(audit)

    db.commit()
    db.close()
    print("Database Seeding Completed Successfully!")

if __name__ == "__main__":
    seed_database()
