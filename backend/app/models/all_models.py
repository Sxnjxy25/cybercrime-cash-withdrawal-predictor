import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="ANALYST") # SUPER_ADMIN, CYBER_COMMAND_OFFICER, INVESTIGATOR, ANALYST, DISTRICT_OFFICER, AUDITOR
    badge_id = Column(String(50), nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    complaint_number = Column(String(50), unique=True, index=True, nullable=False)
    source_portal = Column(String(100), default="NCCP Portal")
    complaint_timestamp = Column(DateTime, index=True, nullable=False)
    
    state = Column(String(100), index=True, nullable=False)
    district = Column(String(100), index=True, nullable=False)
    police_jurisdiction = Column(String(150), nullable=False)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)

    category = Column(String(100), index=True, nullable=False)
    financial_loss = Column(Float, default=0.0)
    channel = Column(String(100), nullable=False) # WhatsApp, Telegram, Phone Call, Phishing Web, SMS, Social Media
    payment_method = Column(String(100), nullable=False) # UPI, Bank Transfer, Credit Card, Crypto, Wallet
    modus_operandi_type = Column(String(100), nullable=False)
    narrative = Column(Text, nullable=False)

    upi_identifier = Column(String(100), nullable=True, index=True)
    mobile_identifier = Column(String(50), nullable=True, index=True)
    email_identifier = Column(String(100), nullable=True, index=True)
    bank_identifier = Column(String(100), nullable=True, index=True)
    domain_url = Column(String(200), nullable=True, index=True)
    social_identifier = Column(String(100), nullable=True, index=True)

    priority = Column(String(20), default="MEDIUM")
    status = Column(String(50), default="NEW")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class LocationRisk(Base):
    __tablename__ = "locations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    state = Column(String(100), index=True, nullable=False)
    district = Column(String(100), index=True, nullable=False)
    police_jurisdiction = Column(String(150), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    current_risk_score = Column(Float, default=0.0)
    forecast_risk_score = Column(Float, default=0.0)
    risk_band = Column(String(20), default="LOW") # LOW, MODERATE, HIGH, CRITICAL
    complaint_count = Column(Integer, default=0)
    dominant_category = Column(String(100), nullable=True)

class Entity(Base):
    __tablename__ = "entities"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    entity_type = Column(String(50), index=True, nullable=False) # UPI_ID, MOBILE_NUMBER, EMAIL, DOMAIN_URL, BANK_ACCOUNT, SOCIAL_HANDLE
    entity_value = Column(String(255), index=True, nullable=False)
    masked_value = Column(String(255), nullable=False)
    risk_score = Column(Float, default=0.0)
    total_complaints = Column(Integer, default=1)
    total_financial_loss = Column(Float, default=0.0)
    first_seen_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="UNDER_MONITORING")

class ThreatCluster(Base):
    __tablename__ = "threat_clusters"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    cluster_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    growth_rate_pct = Column(Float, default=0.0)
    baseline_vol = Column(Integer, default=0)
    current_vol = Column(Integer, default=0)
    anomaly_score = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)
    primary_state = Column(String(100), nullable=True)
    primary_district = Column(String(100), nullable=True)
    peak_hours = Column(String(50), default="18:00–22:00")
    status = Column(String(50), default="REQUIRES_REVIEW")
    intelligence_state = Column(String(50), default="CORRELATED") # OBSERVED, PREDICTED, CORRELATED, RECOMMENDED, CONFIRMED
    dna_metrics = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ThreatClusterMember(Base):
    __tablename__ = "threat_cluster_members"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    cluster_id = Column(String(36), ForeignKey("threat_clusters.id"), nullable=False)
    complaint_id = Column(String(36), ForeignKey("complaints.id"), nullable=False)
    similarity_score = Column(Float, default=0.85)

class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    entity_level = Column(String(50), nullable=False) # NATIONAL, STATE, DISTRICT, CATEGORY
    target_name = Column(String(100), nullable=False)
    forecast_horizon = Column(String(20), nullable=False) # 24h, 7d, 30d
    current_value = Column(Float, nullable=False)
    forecast_value = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=False)
    upper_bound = Column(Float, nullable=False)
    confidence_pct = Column(Float, default=85.0)
    model_version = Column(String(50), default="v1.2.0-XGB-HW")
    created_at = Column(DateTime, default=datetime.utcnow)

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    anomaly_code = Column(String(50), unique=True, nullable=False)
    target_type = Column(String(50), nullable=False) # REGION, CATEGORY, ENTITY, PAYMENT
    target_name = Column(String(100), nullable=False)
    baseline_metric = Column(Float, nullable=False)
    observed_metric = Column(Float, nullable=False)
    anomaly_score = Column(Float, nullable=False) # 0.0 to 1.0
    description = Column(Text, nullable=False)
    detected_at = Column(DateTime, default=datetime.utcnow)

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    target_type = Column(String(50), nullable=False) # GLOBAL, STATE, DISTRICT, CATEGORY, ENTITY
    target_name = Column(String(100), nullable=False)
    overall_score = Column(Float, nullable=False) # 0 to 100
    risk_band = Column(String(20), nullable=False) # LOW, MODERATE, HIGH, CRITICAL
    factor_growth = Column(Float, default=0.0)
    factor_anomaly = Column(Float, default=0.0)
    factor_cluster = Column(Float, default=0.0)
    factor_regional = Column(Float, default=0.0)
    factor_historical = Column(Float, default=0.0)
    confidence_pct = Column(Float, default=85.0)
    model_version = Column(String(50), default="v2.1-Hybrid-XAI")
    calculated_at = Column(DateTime, default=datetime.utcnow)

class EarlyWarning(Base):
    __tablename__ = "early_warnings"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    warning_code = Column(String(50), unique=True, index=True, nullable=False)
    severity = Column(String(20), nullable=False) # LOW, MODERATE, HIGH, CRITICAL
    threat_name = Column(String(200), nullable=False)
    region = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    signal_summary = Column(Text, nullable=False)
    forecast_trend = Column(String(100), nullable=False)
    confidence_pct = Column(Float, default=85.0)
    status = Column(String(50), default="PENDING_REVIEW") # PENDING_REVIEW, ACKNOWLEDGED, ASSIGNED, INVESTIGATED, DISMISSED
    assigned_officer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    case_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    warning_id = Column(String(36), ForeignKey("early_warnings.id"), nullable=True)
    cluster_id = Column(String(36), ForeignKey("threat_clusters.id"), nullable=True)
    risk_score = Column(Float, default=75.0)
    status = Column(String(50), default="OPEN") # OPEN, UNDER_INVESTIGATION, ESCALATED, CLOSED, ARCHIVED
    assigned_to_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    lead_officer = Column(String(100), nullable=False)
    summary = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class InvestigationNote(Base):
    __tablename__ = "investigation_notes"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id"), nullable=False)
    officer_name = Column(String(100), nullable=False)
    note_text = Column(Text, nullable=False)
    is_sensitive = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    target_type = Column(String(50), nullable=False) # PREDICTION, CLUSTER, ANOMALY, WARNING, RISK_SCORE
    target_id = Column(String(36), nullable=False)
    officer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    officer_name = Column(String(100), nullable=False)
    officer_decision = Column(String(50), nullable=False) # CONFIRMED, DISMISSED, ADJUSTED
    feedback_text = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    username = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    resource = Column(String(200), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), default="127.0.0.1")
    status = Column(String(20), default="SUCCESS")

class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(50), nullable=False)
    model_type = Column(String(100), nullable=False) # IsolationForest, Holt-Winters, XGBoost, DBSCAN
    accuracy = Column(Float, default=0.89)
    precision = Column(Float, default=0.87)
    recall = Column(Float, default=0.85)
    f1_score = Column(Float, default=0.86)
    data_drift_score = Column(Float, default=0.04)
    feature_drift_score = Column(Float, default=0.03)
    training_sample_count = Column(Integer, default=12500)
    data_quality_score = Column(Float, default=94.5)
    status = Column(String(20), default="ACTIVE") # ACTIVE, TESTING, ARCHIVED
    updated_at = Column(DateTime, default=datetime.utcnow)

class TelemetryIncident(Base):
    __tablename__ = "telemetry_incidents"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    incident_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. INC-2026-9812 / ALT-EDR-4891
    title = Column(String(255), nullable=False)
    severity = Column(String(20), index=True, default="CRITICAL") # CRITICAL, HIGH, MEDIUM, LOW, INFORMATIONAL
    source_type = Column(String(50), index=True, default="SIEM") # EDR, SIEM, FIREWALL, NDR, IAM, CLOUD_TRAIL
    source_tool = Column(String(100), default="Splunk Enterprise") # CrowdStrike Falcon, Palo Alto NGFW, etc.
    timestamp = Column(DateTime, index=True, default=datetime.utcnow)
    triage_status = Column(String(50), index=True, default="NEW") # NEW, TRIAGED, ESCALATED, CONTAINED, RESOLVED, SUPPRESSED
    target_host = Column(String(150), index=True, nullable=True) # e.g. DC-PROD-01.BANK.IN
    target_ip = Column(String(50), index=True, nullable=True) # e.g. 10.240.12.89
    source_ip = Column(String(50), index=True, nullable=True) # e.g. 185.220.101.5
    mitre_tactic = Column(String(100), nullable=True) # Credential Access, Lateral Movement, etc.
    mitre_technique = Column(String(150), nullable=True) # T1003.001 - LSASS Memory, etc.
    detection_rule = Column(String(200), nullable=False) # EDR-MIMIKATZ-IN-MEMORY, etc.
    event_count = Column(Integer, default=1) # Aggregated raw telemetry events
    confidence_score = Column(Float, default=0.95) # 0.0 to 1.0
    raw_payload = Column(JSON, nullable=True) # Raw sensor metadata/process execution
    analyst_notes = Column(Text, nullable=True)
    assigned_to = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PredictiveForecast(Base):
    __tablename__ = "predictive_forecasts"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    forecast_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g. FCST-2026-001
    forecast_type = Column(String(80), index=True, nullable=False)  # CASHOUT_HOTSPOT, ATTACK_VECTOR, GEOGRAPHIC_TARGETING, ANOMALY_SURGE, MULE_NETWORK_EXPANSION
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    severity_level = Column(String(20), index=True, default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    confidence_score = Column(Float, default=0.75)  # 0.0–1.0 from XGBoost predict_proba
    predicted_at = Column(DateTime, index=True, default=datetime.utcnow)  # When the forecast was generated
    valid_until = Column(DateTime, nullable=True)  # Forecast expiry timestamp
    target_region = Column(String(150), index=True, nullable=True)  # e.g. Maharashtra, West Bengal
    target_district = Column(String(150), nullable=True)
    target_lat = Column(Float, nullable=True)   # Geographic centroid latitude
    target_lon = Column(Float, nullable=True)   # Geographic centroid longitude
    predicted_amount_at_risk = Column(Float, default=0.0)  # ₹ exposure estimate
    attack_vector = Column(String(80), nullable=True)  # UPI_SURGE, ATM_CLUSTER, PHISHING_WAVE, SIM_SWAP, MULE_LAYERING
    ml_model_version = Column(String(80), default="xgboost-v2.1-prod")
    feature_importances = Column(JSON, nullable=True)  # XAI weights: [{"factor": "Amount", "weight": 0.35}]
    hotspot_coordinates = Column(JSON, nullable=True)  # [{"lat": 19.07, "lon": 72.87, "risk_score": 0.91, "atm_id": "ATM-019-1"}]
    recommended_actions = Column(JSON, nullable=True)  # ["Freeze account at SBI", "Deploy patrol..."]
    status = Column(String(30), index=True, default="ACTIVE")  # ACTIVE, EXPIRED, ACTIONED, SUPPRESSED
    actioned_by = Column(String(100), nullable=True)
    actioned_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
