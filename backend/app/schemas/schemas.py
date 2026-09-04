from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any, Dict
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    role: str = "ANALYST"
    badge_id: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None

class UserOut(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    badge_id: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

# Complaint Schemas
class ComplaintCreate(BaseModel):
    complaint_number: str
    source_portal: Optional[str] = "NCCP Portal"
    complaint_timestamp: datetime
    state: str
    district: str
    police_jurisdiction: str
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    category: str
    financial_loss: float = 0.0
    channel: str
    payment_method: str
    modus_operandi_type: str
    narrative: str
    upi_identifier: Optional[str] = None
    mobile_identifier: Optional[str] = None
    email_identifier: Optional[str] = None
    bank_identifier: Optional[str] = None
    domain_url: Optional[str] = None
    social_identifier: Optional[str] = None
    priority: Optional[str] = "MEDIUM"

class ComplaintOut(BaseModel):
    id: str
    complaint_number: str
    source_portal: str
    complaint_timestamp: datetime
    state: str
    district: str
    police_jurisdiction: str
    location_lat: Optional[float]
    location_lng: Optional[float]
    category: str
    financial_loss: float
    channel: str
    payment_method: str
    modus_operandi_type: str
    narrative: str
    upi_identifier: Optional[str]
    mobile_identifier: Optional[str]
    email_identifier: Optional[str]
    bank_identifier: Optional[str]
    domain_url: Optional[str]
    social_identifier: Optional[str]
    priority: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Warning Schemas
class EarlyWarningAction(BaseModel):
    action: str  # ACKNOWLEDGE, ASSIGN, INVESTIGATE, DISMISS
    officer_id: Optional[str] = None
    notes: Optional[str] = None

# Investigation Schemas
class InvestigationCreate(BaseModel):
    title: str
    warning_id: Optional[str] = None
    cluster_id: Optional[str] = None
    risk_score: float = 75.0
    lead_officer: str
    summary: str

class InvestigationNoteCreate(BaseModel):
    note_text: str
    is_sensitive: bool = False

# Feedback Schemas
class FeedbackCreate(BaseModel):
    target_type: str
    target_id: str
    officer_decision: str
    feedback_text: Optional[str] = None

# Copilot Schemas
class CopilotQuery(BaseModel):
    question: str

class CopilotResponse(BaseModel):
    answer: str
    evidence: List[Dict[str, Any]]
    metrics: Dict[str, Any]
    drill_down_actions: List[Dict[str, Any]]
