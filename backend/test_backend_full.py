import sys
import os

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_full_backend_audit():
    print("=== CYBERPREDICT X BACKEND FULL AUDIT ===")
    
    # 1. Health Check
    res = client.get("/health")
    assert res.status_code == 200, f"/health failed: {res.status_code}"
    print("[PASS] GET /health ->", res.json())
    
    res = client.get("/api/v1/health")
    assert res.status_code == 200, f"/api/v1/health failed: {res.status_code}"
    print("[PASS] GET /api/v1/health ->", res.json())
    
    # 2. Root Endpoint
    res = client.get("/")
    assert res.status_code == 200
    print("[PASS] GET / ->", res.json()["platform"])
    
    # 3. Auth Login
    res = client.post("/api/v1/auth/login", json={"username": "superadmin", "password": "Password@123"})
    assert res.status_code == 200, f"Login failed: {res.status_code} - {res.text}"
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] POST /api/v1/auth/login -> User:", res.json()["user"]["username"], "| Role:", res.json()["user"]["role"])
    
    # 4. Auth Current User
    res = client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/auth/me -> Username:", res.json()["username"])
    
    # 5. Dashboard Summary
    res = client.get("/api/v1/dashboard/summary", headers=headers)
    assert res.status_code == 200
    metrics = res.json()["kpi_metrics"]
    risk = res.json()["global_risk"]
    print("[PASS] GET /api/v1/dashboard/summary -> Total Complaints:", metrics["total_complaints"], "| Global Risk Score:", risk["score"])

    
    # 6. Complaints List
    res = client.get("/api/v1/complaints", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/complaints -> Records returned:", len(res.json()))
    
    # 7. Analytics Trends
    res = client.get("/api/v1/analytics/trends", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/analytics/trends -> OK")
    
    # 8. Regional Risk
    res = client.get("/api/v1/analytics/regional-risk", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/analytics/regional-risk -> Locations:", len(res.json()))
    
    # 9. Predictions
    res = client.get("/api/v1/predictions", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/predictions -> OK")
    
    # 10. Forecasts
    res = client.get("/api/v1/forecasts?horizon=7d", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/forecasts -> Horizon:", res.json()["horizon"], "| Forecast Points:", len(res.json()["forecast"]))
    
    # 11. Anomalies
    res = client.get("/api/v1/anomalies", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/anomalies -> Detected:", len(res.json()))
    
    # 12. Threat Clusters
    res = client.get("/api/v1/threat-clusters", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/threat-clusters -> Clusters:", len(res.json()))
    
    # 13. Entities & Graph
    res = client.get("/api/v1/entities", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/entities -> Count:", len(res.json()))
    
    res = client.get("/api/v1/entities/graph", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/entities/graph -> Nodes:", len(res.json()["nodes"]), "| Edges:", len(res.json()["edges"]))
    
    # 14. Early Warnings
    res = client.get("/api/v1/early-warnings", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/early-warnings -> Count:", len(res.json()))
    
    # 15. Investigations
    res = client.get("/api/v1/investigations", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/investigations -> Count:", len(res.json()))
    
    # 16. Model Observatory
    res = client.get("/api/v1/models", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/models -> Active Models:", len(res.json()["models"]))

    
    # 17. Security & Audit
    res = client.get("/api/v1/security/status", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/security/status -> Status:", res.json()["status"])
    
    res = client.get("/api/v1/audit-logs", headers=headers)
    assert res.status_code == 200
    print("[PASS] GET /api/v1/audit-logs -> Logs count:", len(res.json()))
    
    # 18. AI Copilot
    res = client.post("/api/v1/copilot/query", headers=headers, json={"question": "What are top emerging threats in Mumbai?"})
    assert res.status_code == 200
    print("[PASS] POST /api/v1/copilot/query -> Answer length:", len(res.json()["answer"]))
    
    # 19. Demo Mode Trigger
    res = client.post("/api/v1/demo/simulate-emerging-threat", headers=headers)
    assert res.status_code == 200
    print("[PASS] POST /api/v1/demo/simulate-emerging-threat -> Status:", res.json()["status"], "| Threat Code:", res.json()["simulated_threat"]["warning_code"])

    # 20. Demo Reset
    res = client.post("/api/v1/demo/reset-demo", headers=headers)
    assert res.status_code == 200
    print("[PASS] POST /api/v1/demo/reset-demo -> Status:", res.json()["status"])
    
    print("\nALL 20 BACKEND ENDPOINT AUDITS PASSED WITH ZERO ERRORS!")

if __name__ == "__main__":
    run_full_backend_audit()
