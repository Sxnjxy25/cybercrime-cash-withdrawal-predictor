from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# 1. System & Health Endpoints
def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["platform"] == "CYBERPREDICT X"
    assert response.json()["status"] == "ONLINE"

def test_health_endpoints():
    r1 = client.get("/health")
    assert r1.status_code == 200
    assert r1.json()["status"] == "healthy"
    assert r1.json()["database"] == "connected"
    assert r1.json()["ml_engine"] == "ready"

    r2 = client.get("/api/v1/health")
    assert r2.status_code == 200
    assert r2.json()["status"] == "healthy"

# 2. Authentication & Security JWT Rejection
def test_auth_login_success():
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "superadmin", "password": "Password@123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "SUPER_ADMIN"

def test_auth_invalid_credentials():
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "superadmin", "password": "WrongPassword"}
    )
    assert response.status_code == 401

def test_unauthenticated_request_rejection():
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 401

def test_invalid_jwt_token_rejection():
    headers = {"Authorization": "Bearer invalid_token_xyz_123"}
    response = client.get("/api/v1/dashboard/summary", headers=headers)
    assert response.status_code == 401

# Helper function to obtain token for specific username
def get_auth_header_for_user(username="superadmin"):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": "Password@123"}
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# 3. Strict RBAC Role Testing across Roles (SUPER_ADMIN, AUDITOR, ANALYST, INVESTIGATOR, etc.)
def test_rbac_role_enforcement():
    # SUPER_ADMIN -> 200 OK
    admin_headers = get_auth_header_for_user("superadmin")
    r_admin = client.get("/api/v1/audit-logs", headers=admin_headers)
    assert r_admin.status_code == 200

    # AUDITOR -> 200 OK
    auditor_headers = get_auth_header_for_user("auditor_1")
    r_auditor = client.get("/api/v1/audit-logs", headers=auditor_headers)
    assert r_auditor.status_code == 200

    # ANALYST (Unauthorized role for audit logs) -> 403 FORBIDDEN
    analyst_headers = get_auth_header_for_user("analyst_1")
    r_analyst = client.get("/api/v1/audit-logs", headers=analyst_headers)
    assert r_analyst.status_code == 403
    assert "does not have sufficient permissions" in r_analyst.json()["detail"]

# 4. Router Endpoints Acceptance Verification
def test_dashboard_summary():
    headers = get_auth_header_for_user("superadmin")
    response = client.get("/api/v1/dashboard/summary", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "global_risk" in data
    assert "kpi_metrics" in data
    assert "top_high_risk_regions" in data
    assert data["kpi_metrics"]["total_complaints"] >= 1000

def test_complaints_endpoint():
    headers = get_auth_header_for_user("superadmin")
    response = client.get("/api/v1/complaints?limit=100", headers=headers)
    assert response.status_code == 200
    complaints = response.json()
    assert isinstance(complaints, list)
    assert len(complaints) > 0
    # Verify PII masking on identifiers
    first_c = complaints[0]
    has_pii_mask = ("XXXX" in (first_c.get("upi_identifier") or "")) or \
                   ("XXXX" in (first_c.get("mobile_identifier") or "")) or \
                   ("XXXX" in (first_c.get("bank_identifier") or ""))
    assert has_pii_mask, "PII Masking verification check passed."

def test_analytics_and_regional_risk():
    headers = get_auth_header_for_user("superadmin")
    r1 = client.get("/api/v1/analytics/trends", headers=headers)
    assert r1.status_code == 200
    
    r2 = client.get("/api/v1/analytics/regional-risk", headers=headers)
    assert r2.status_code == 200
    assert len(r2.json()) > 0

def test_predictions_and_forecasts():
    headers = get_auth_header_for_user("superadmin")
    r1 = client.get("/api/v1/predictions", headers=headers)
    assert r1.status_code == 200

    for horizon in ["24h", "7d", "30d"]:
        r2 = client.get(f"/api/v1/forecasts?horizon={horizon}", headers=headers)
        assert r2.status_code == 200
        assert r2.json()["horizon"] == horizon
        assert "forecast" in r2.json()

def test_anomalies_and_threat_clusters():
    headers = get_auth_header_for_user("superadmin")
    r1 = client.get("/api/v1/anomalies", headers=headers)
    assert r1.status_code == 200

    r2 = client.get("/api/v1/threat-clusters", headers=headers)
    assert r2.status_code == 200

def test_entities_and_graph():
    headers = get_auth_header_for_user("superadmin")
    r1 = client.get("/api/v1/entities", headers=headers)
    assert r1.status_code == 200

    r2 = client.get("/api/v1/entities/graph", headers=headers)
    assert r2.status_code == 200
    assert "nodes" in r2.json()
    assert "edges" in r2.json()

def test_early_warnings_and_actions():
    headers = get_auth_header_for_user("superadmin")
    r1 = client.get("/api/v1/early-warnings", headers=headers)
    assert r1.status_code == 200
    warnings = r1.json()
    assert len(warnings) > 0
    warning_id = warnings[0]["id"]

    r2 = client.post(f"/api/v1/early-warnings/{warning_id}/action", json={"action": "ACKNOWLEDGE"}, headers=headers)
    assert r2.status_code == 200
    assert r2.json()["status"] == "ACKNOWLEDGED"

def test_investigation_creation_and_audit():
    headers = get_auth_header_for_user("investigator_1")
    payload = {
        "title": "Acceptance Test Investigation",
        "risk_score": 88.5,
        "lead_officer": "Insp. Rajesh Kumar",
        "summary": "Created during automated acceptance testing."
    }
    r1 = client.post("/api/v1/investigations", json=payload, headers=headers)
    assert r1.status_code == 200
    assert r1.json()["case_number"].startswith("CASE-")

    r2 = client.get("/api/v1/investigations", headers=headers)
    assert r2.status_code == 200
    assert any(inv["title"] == "Acceptance Test Investigation" for inv in r2.json())

    # Audit log check using authorized role
    auditor_headers = get_auth_header_for_user("auditor_1")
    r3 = client.get("/api/v1/audit-logs", headers=auditor_headers)
    assert r3.status_code == 200
    assert len(r3.json()) > 0

def test_models_security_copilot():
    headers = get_auth_header_for_user("superadmin")
    r1 = client.get("/api/v1/models", headers=headers)
    assert r1.status_code == 200

    r2 = client.get("/api/v1/security/status", headers=headers)
    assert r2.status_code == 200

    r3 = client.get("/api/v1/security/events", headers=headers)
    assert r3.status_code == 200

    r4 = client.post("/api/v1/copilot/query", json={"question": "Why is Chennai high risk?"}, headers=headers)
    assert r4.status_code == 200
    assert "answer" in r4.json()

# 5. End-to-End Simulation Lifecycle Verification
def test_emerging_threat_simulation_lifecycle():
    headers = get_auth_header_for_user("superadmin")
    auditor_headers = get_auth_header_for_user("auditor_1")

    # Step A: Get initial warning count & audit log count BEFORE simulation
    ew_before = len(client.get("/api/v1/early-warnings", headers=headers).json())
    audit_before = len(client.get("/api/v1/audit-logs", headers=auditor_headers).json())

    # Step B: Trigger emerging threat simulation
    sim_res = client.post("/api/v1/demo/simulate-emerging-threat", headers=headers)
    assert sim_res.status_code == 200
    assert sim_res.json()["status"] == "SIMULATION_SUCCESSFUL"
    assert sim_res.json()["simulated_threat"]["severity"] == "CRITICAL"

    # Step C: Verify state transition AFTER simulation
    ew_after = len(client.get("/api/v1/early-warnings", headers=headers).json())
    audit_after = len(client.get("/api/v1/audit-logs", headers=auditor_headers).json())
    
    assert ew_after > ew_before, f"Expected Early Warnings count to increase: {ew_before} -> {ew_after}"
    assert audit_after > audit_before, f"Expected Audit Logs count to increase: {audit_before} -> {audit_after}"
