import sys
import random
from datetime import datetime
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

unique_cnum = f"2026{random.randint(10000000, 99999999)}"

# 1. Citizen submits complaint (unauthenticated)
payload = {
    "complaint_number": unique_cnum,
    "source_portal": "Citizen Quick Portal",
    "complaint_timestamp": datetime.utcnow().isoformat(),
    "state": "Maharashtra",
    "district": "Mumbai City",
    "police_jurisdiction": "Cyber Crime Police Station Bandra",
    "location_lat": 19.0760,
    "location_lng": 72.8777,
    "category": "UPI / QR Code Phishing Fraud",
    "financial_loss": 85000.0,
    "channel": "MOBILE_APP",
    "payment_method": "UPI",
    "modus_operandi_type": "MULE_LAYERED_CASHOUT",
    "narrative": "Victim scanned fraudulent QR code sent via WhatsApp, funds debited to suspect mule account.",
    "upi_identifier": "mule.cybercrime@okaxis",
    "mobile_identifier": "+919876543210"
}
res = client.post("/api/v1/complaints", json=payload)
print("POST /complaints status:", res.status_code)
assert res.status_code == 200 or res.status_code == 201, res.text
complaint_code = res.json()["complaint_number"]
print("Created complaint_code:", complaint_code)

# 2. Citizen track complaint (unauthenticated)
res = client.get(f"/api/v1/complaints/track/{complaint_code}")
print("GET /complaints/track status:", res.status_code)
assert res.status_code == 200, res.text
assert res.json()["complaint_code"] == complaint_code
print("Track info:", res.json())

# 3. Admin Login
res = client.post("/api/v1/auth/login", json={"username": "superadmin", "password": "Password@123"})
token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 4. Admin inspect complaint (returns full report + top-level map & hotspot coordinates)
res = client.get(f"/api/v1/complaints/admin-inspect/{complaint_code}", headers=headers)
print("GET admin-inspect status:", res.status_code)
assert res.status_code == 200, res.text
cdata = res.json()
print("Admin inspect keys returned:", list(cdata.keys())[:10])
assert "forecasted_atm_hotspots" in cdata, "Missing forecasted_atm_hotspots"
assert "location" in cdata, "Missing top-level location"
assert "financial_loss" in cdata, "Missing top-level financial_loss"
print("Hotspots returned:", len(cdata["forecasted_atm_hotspots"]))

# 5. Freeze action via complaint action endpoint
res = client.post(f"/api/v1/complaints/{complaint_code}/action", headers=headers, json={"action_type": "FREEZE_ACCOUNT"})
print("POST action FREEZE status:", res.status_code)
assert res.status_code == 200, res.text
print("Action response:", res.json()["message"])

# 6. Citizen withdraws complaint (unauthenticated)
withdraw_res = client.post("/api/v1/complaints/withdraw", json={
    "complaint_code": complaint_code,
    "withdrawal_reason": "Funds recovered directly from bank"
})
print("POST withdraw status:", withdraw_res.status_code)
assert withdraw_res.status_code == 200, withdraw_res.text
assert withdraw_res.json()["withdrawal_status"] == "WITHDRAWN_AND_CLOSED"

print("\nALL CITIZEN AND ADMIN COMPLAINT FLOWS VERIFIED 100% WORKING!")
