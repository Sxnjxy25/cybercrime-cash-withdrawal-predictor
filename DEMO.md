# CYBERPREDICT X — Signature Demo Scenario Guide

CYBERPREDICT X includes a deterministic synthetic **Demo Mode** designed for Hackathon / SIH presentations.

---

## Signature Demo Scenario: "Simulate Emerging Threat"

Clicking **`[ SIMULATE EMERGING THREAT ]`** in the top navigation bar executes an end-to-end predictive pipeline trigger (`POST /api/v1/demo/simulate-emerging-threat`).

### End-to-End Simulation Cascade:
1. **Complaints Spike**: Injects synthetic UPI impersonation complaints in Chennai & Coimbatore, Tamil Nadu.
2. **Regional Risk Escalation**: Escalates Chennai location risk score from `68.0` to `92.0` (`CRITICAL`).
3. **Cluster Expansion**: Threat Cluster `TC-IN-2026-1042` expands (+48 complaints, growth rate +68.4%, anomaly score 0.96).
4. **Early Warning Generated**: Automated Early Warning `#EW-1042` created (`SIMULATED: Emerging UPI Impersonation Spike`).
5. **Investigation Workspace**: Officers can convert Early Warning `#EW-1042` into an active Investigation Case File.
6. **Audit Trail**: Action logged in system audit trail.
