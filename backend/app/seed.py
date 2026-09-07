import random
from datetime import datetime, timedelta
import uuid

from app.db.database import SessionLocal, engine, Base
from app.models.all_models import (
    User, Complaint, LocationRisk, Entity, ThreatCluster, ThreatClusterMember,
    Forecast, Anomaly, RiskScore, EarlyWarning, Investigation, InvestigationNote,
    Feedback, AuditLog, ModelMetric
)
from app.services.auth_service import get_password_hash
from app.services.pii_service import mask_pii

# Seed random generator deterministically for consistency
random.seed(42)

INDIAN_STATES_DISTRICTS = [
    {"state": "Delhi", "district": "New Delhi", "lat": 28.6139, "lng": 77.2090, "risk": 89.0, "dominant": "UPI Impersonation", "jurisdiction": "Special Cell Cyber Command, Delhi Police"},
    {"state": "Maharashtra", "district": "Mumbai", "lat": 19.0760, "lng": 72.8777, "risk": 84.0, "dominant": "Digital Arrest Scam", "jurisdiction": "BKC Cyber Police Station, Mumbai"},
    {"state": "Karnataka", "district": "Bengaluru Urban", "lat": 12.9716, "lng": 77.5946, "risk": 82.0, "dominant": "Investment Fraud & Phishing", "jurisdiction": "CID Cyber Crime Division, Bengaluru"},
    {"state": "Tamil Nadu", "district": "Chennai", "lat": 13.0827, "lng": 80.2707, "risk": 78.0, "dominant": "UPI Impersonation Ring", "jurisdiction": "Chennai Central Cyber Crime Police Station"},
    {"state": "Telangana", "district": "Hyderabad", "lat": 17.3850, "lng": 78.4867, "risk": 76.0, "dominant": "Courier & Customs Fraud", "jurisdiction": "Cyberabad Cyber Crime Unit, Hyderabad"},
    {"state": "Maharashtra", "district": "Pune", "lat": 18.5204, "lng": 73.8567, "risk": 71.0, "dominant": "Investment Scam", "jurisdiction": "Cyber Police Station, Pune City"},
    {"state": "West Bengal", "district": "Kolkata", "lat": 22.5726, "lng": 88.3639, "risk": 68.0, "dominant": "Instant Loan App Scam", "jurisdiction": "Lalbazar Cyber Crime PS, Kolkata"},
    {"state": "Rajasthan", "district": "Jaipur", "lat": 26.9124, "lng": 75.7873, "risk": 64.0, "dominant": "Job & Part-Time Scam", "jurisdiction": "Cyber Crime PS, Jaipur"},
    {"state": "Gujarat", "district": "Ahmedabad", "lat": 23.0225, "lng": 72.5714, "risk": 59.0, "dominant": "Fake Customer Support", "jurisdiction": "Cyber Crime Police Station, Ahmedabad"},
    {"state": "Tamil Nadu", "district": "Coimbatore", "lat": 11.0168, "lng": 76.9558, "risk": 55.0, "dominant": "Job Scam", "jurisdiction": "Cyber Crime Cell, Coimbatore"}
]

CATEGORIES = [
    "UPI Impersonation", "Digital Arrest Scam", "Phishing & Fake Banking",
    "Investment & Crypto Scam", "Job & Part-Time Scam", "Fake Customer Support",
    "Courier & Customs Fraud", "Instant Loan App Fraud", "Account Takeover / SIM Swap"
]

BANKS = [
    "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank",
    "Punjab National Bank", "Bank of Baroda", "Canara Bank", "Kotak Mahindra Bank"
]

CHANNELS = ["WhatsApp", "Telegram", "Phone Call", "Phishing Web", "SMS", "Social Media"]
PAYMENTS = ["UPI", "Bank Transfer", "Credit Card", "Wallet", "IMPS"]

def seed_database():
    print("Ensuring database schema...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Clear existing mock data cleanly
    print("Purging stale tables...")
    for model in [
        ThreatClusterMember, ThreatCluster, EarlyWarning, InvestigationNote,
        Investigation, Feedback, AuditLog, ModelMetric, Forecast, Anomaly,
        RiskScore, Entity, Complaint, LocationRisk, User
    ]:
        try:
            db.query(model).delete()
        except Exception as e:
            print(f"Notice on deleting {model.__tablename__}: {e}")
    db.commit()

    print("Seeding Users...")
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
            police_jurisdiction=loc["jurisdiction"],
            latitude=loc["lat"],
            longitude=loc["lng"],
            current_risk_score=loc["risk"],
            forecast_risk_score=min(99.0, loc["risk"] + round(random.uniform(2.0, 6.5), 1)),
            risk_band="CRITICAL" if loc["risk"] >= 76 else ("HIGH" if loc["risk"] >= 51 else "MODERATE"),
            complaint_count=random.randint(110, 480),
            dominant_category=loc["dominant"]
        )
        locations.append(l)
    db.add_all(locations)
    db.commit()

    print("Seeding Complaints (1,500 records)...")
    complaints = []
    now = datetime.utcnow()

    for i in range(1, 1501):
        loc = random.choice(INDIAN_STATES_DISTRICTS)
        cat = random.choice(CATEGORIES)
        bank = random.choice(BANKS)
        channel = random.choice(CHANNELS)
        payment = "UPI" if cat == "UPI Impersonation" else random.choice(PAYMENTS)

        # Concentrated cluster for UPI Impersonation in Delhi and Chennai
        if i % 4 == 0:
            cat = "UPI Impersonation"
            loc = INDIAN_STATES_DISTRICTS[0]  # Delhi
            payment = "UPI"
        elif i % 5 == 0:
            cat = "Digital Arrest Scam"
            loc = INDIAN_STATES_DISTRICTS[1]  # Mumbai
            payment = "Bank Transfer"

        timestamp = now - timedelta(
            days=random.randint(0, 30),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        fin_loss = round(random.uniform(5000, 280000), 2)
        mobile_num = f"98765{random.randint(10000, 99999)}"
        upi_id = f"refund.pay{random.randint(100, 999)}@ybl"
        account_no = f"3098{random.randint(10000000, 99999999)}"

        c = Complaint(
            complaint_number=f"NCCP-2026-{100000 + i}",
            source_portal="National Cybercrime Reporting Portal (NCCP)",
            complaint_timestamp=timestamp,
            state=loc["state"],
            district=loc["district"],
            police_jurisdiction=loc["jurisdiction"],
            location_lat=loc["lat"] + round(random.uniform(-0.04, 0.04), 4),
            location_lng=loc["lng"] + round(random.uniform(-0.04, 0.04), 4),
            category=cat,
            financial_loss=fin_loss,
            channel=channel,
            payment_method=payment,
            modus_operandi_type=cat,
            narrative=f"Victim reported fraud under {cat}. Suspect contacted via {channel} demanding urgent transfer to account {account_no} ({bank}). Defrauded sum of INR {fin_loss:,.0f} transferred via {payment}.",
            upi_identifier=mask_pii(upi_id, "UPI_ID"),
            mobile_identifier=mask_pii(mobile_num, "MOBILE_NUMBER"),
            email_identifier=mask_pii(f"alert.desk{random.randint(10,99)}@fastmail.com", "EMAIL"),
            bank_identifier=mask_pii(account_no, "BANK_ACCOUNT"),
            domain_url=f"https://secure-portal-{random.randint(100,999)}.net",
            social_identifier=f"@target_{random.randint(100,999)}",
            priority="HIGH" if fin_loss > 100000 else ("CRITICAL" if fin_loss > 200000 else "MEDIUM"),
            status="OPEN" if i % 2 == 0 else "IN_PROGRESS"
        )
        complaints.append(c)

        if len(complaints) >= 500:
            db.bulk_save_objects(complaints)
            db.commit()
            complaints = []

    if complaints:
        db.bulk_save_objects(complaints)
        db.commit()

    print("Seeding Entities & Mule Accounts...")
    entities = [
        Entity(entity_type="UPI_ID", entity_value="refund.fastpay882@ybl", masked_value=mask_pii("refund.fastpay882@ybl", "UPI_ID"), risk_score=94.5, total_complaints=48, total_financial_loss=1650000.0, status="HIGH_RISK_SUSPECT"),
        Entity(entity_type="MOBILE_NUMBER", entity_value="9876543210", masked_value=mask_pii("9876543210", "MOBILE_NUMBER"), risk_score=91.0, total_complaints=39, total_financial_loss=1350000.0, status="BLOCKED_TELECOM"),
        Entity(entity_type="BANK_ACCOUNT", entity_value="309812458921", masked_value=mask_pii("309812458921", "BANK_ACCOUNT"), risk_score=89.5, total_complaints=31, total_financial_loss=1980000.0, status="FREEZE_ORDERED"),
        Entity(entity_type="DOMAIN_URL", entity_value="https://secure-sbi-kyc-verify.xyz", masked_value="https://secure-sbi-kyc-verify.xyz", risk_score=96.0, total_complaints=62, total_financial_loss=2450000.0, status="TAKEDOWN_REQUESTED"),
        Entity(entity_type="EMAIL", entity_value="helpdesk-refund@customs-portal.org", masked_value=mask_pii("helpdesk-refund@customs-portal.org", "EMAIL"), risk_score=82.0, total_complaints=19, total_financial_loss=780000.0, status="UNDER_MONITORING")
    ]
    db.add_all(entities)
    db.commit()

    print("Seeding Threat Clusters...")
    tc1 = ThreatCluster(
        cluster_code="TC-IN-2026-1042",
        title="Interstate UPI Impersonation Syndicate",
        category="UPI Impersonation",
        growth_rate_pct=52.4,
        baseline_vol=120,
        current_vol=183,
        anomaly_score=0.92,
        risk_score=91.5,
        primary_state="Delhi",
        primary_district="New Delhi",
        peak_hours="17:00–22:00",
        status="REQUIRES_REVIEW",
        intelligence_state="CORRELATED",
        dna_metrics={
            "threat": "Interstate UPI Impersonation",
            "category": "Financial Fraud",
            "channel": "WhatsApp / SMS",
            "payment": "UPI",
            "region": "Delhi & NCR",
            "growth": "+52%",
            "cluster_size": 183,
            "peak_time": "17:00–22:00",
            "anomaly": 0.92,
            "confidence": "94%",
            "status": "ACTIVE_ESCORT"
        }
    )
    tc2 = ThreatCluster(
        cluster_code="TC-IN-2026-1088",
        title="Digital Arrest & Law Enforcement Impersonation Ring",
        category="Digital Arrest Scam",
        growth_rate_pct=38.6,
        baseline_vol=85,
        current_vol=118,
        anomaly_score=0.88,
        risk_score=86.0,
        primary_state="Maharashtra",
        primary_district="Mumbai",
        peak_hours="10:00–16:00",
        status="REQUIRES_REVIEW",
        intelligence_state="CORRELATED",
        dna_metrics={
            "threat": "Digital Arrest Scam Syndicate",
            "category": "High-Value Coercion",
            "channel": "Video Call / WhatsApp",
            "payment": "RTGS / Bank Transfer",
            "region": "Maharashtra / Mumbai",
            "growth": "+39%",
            "cluster_size": 118,
            "peak_time": "10:00–16:00",
            "anomaly": 0.88,
            "confidence": "91%",
            "status": "INVESTIGATION_ONGOING"
        }
    )
    db.add_all([tc1, tc2])
    db.commit()

    print("Seeding Forecasts...")
    forecasts = [
        Forecast(
            entity_level="NATIONAL",
            target_name="All India Cyber Financial Crime",
            forecast_horizon="7d",
            current_value=428.0,
            forecast_value=485.0,
            lower_bound=450.0,
            upper_bound=520.0,
            confidence_pct=88.5,
            model_version="v2.1-XGBoost-Crime"
        ),
        Forecast(
            entity_level="CATEGORY",
            target_name="UPI Impersonation",
            forecast_horizon="7d",
            current_value=175.0,
            forecast_value=215.0,
            lower_bound=195.0,
            upper_bound=235.0,
            confidence_pct=91.0,
            model_version="v2.1-XGBoost-Crime"
        )
    ]
    db.add_all(forecasts)
    db.commit()

    print("Seeding Anomalies...")
    anomalies = [
        Anomaly(
            anomaly_code="ANOM-2026-901",
            target_type="REGION",
            target_name="New Delhi",
            baseline_metric=120.0,
            observed_metric=183.0,
            anomaly_score=0.92,
            description="Spike in UPI impersonation collect requests during evening hours (17:00 - 22:00)."
        ),
        Anomaly(
            anomaly_code="ANOM-2026-902",
            target_type="CATEGORY",
            target_name="Digital Arrest Scam",
            baseline_metric=45.0,
            observed_metric=78.0,
            anomaly_score=0.86,
            description="Abnormal surge in high-value transfers flagged as fake customs/police clearance fees."
        )
    ]
    db.add_all(anomalies)
    db.commit()

    print("Seeding Model Observatory Metrics...")
    model_m = ModelMetric(
        model_name="XGBoost Cybercrime Cash-Out Risk Classifier",
        model_version="v1.0.0-XGBoost-Artifact",
        model_type="XGBClassifier",
        accuracy=0.948,
        precision=0.935,
        recall=0.941,
        f1_score=0.938,
        data_drift_score=0.024,
        feature_drift_score=0.019,
        training_sample_count=25000,
        data_quality_score=96.2,
        status="ACTIVE"
    )
    db.add(model_m)

    audit = AuditLog(
        username="superadmin",
        role="SUPER_ADMIN",
        action="DATABASE_SEED",
        resource="MOCK_DATA_ENGINE",
        details="Seeded operational mock cybercrime intelligence dataset with 1,500 complaints and multi-jurisdiction risk nodes.",
        status="SUCCESS"
    )
    db.add(audit)
    db.commit()
    db.close()
    print("Database Seeding Completed Successfully!")

if __name__ == "__main__":
    seed_database()
