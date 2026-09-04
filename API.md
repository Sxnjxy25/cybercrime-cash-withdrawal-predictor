# CYBERPREDICT X — API Endpoint Reference

All endpoints are prefixed with `/api/v1` (except root `/` and system `/health`). Authentication is performed via HTTP Bearer JWT tokens.

---

## Endpoint Catalog

### System & Health
- `GET /health` — Returns system status (`status`, `database`, `ml_engine`, `version`).
- `GET /api/v1/health` — API health check endpoint.
- `GET /` — Root metadata and API docs URL link.

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/login` — Authenticates user credentials & returns JWT access token.
- `GET /api/v1/auth/me` — Returns current authenticated user profile & RBAC role.

### Dashboard (`/api/v1/dashboard`)
- `GET /api/v1/dashboard/summary` — Returns global risk score, KPI metrics, high-risk regions, active warnings, and latest threat events.

### Complaints (`/api/v1/complaints`)
- `GET /api/v1/complaints` — Returns paginated complaints data with PII data masking (`XXXXXXXX7821`).

### Analytics & Regional Risk (`/api/v1/analytics`)
- `GET /api/v1/analytics/trends` — Temporal trends and category breakdown.
- `GET /api/v1/analytics/regional-risk` — Jurisdiction-level current & forecast risk scores across India.

### Predictive Engine (`/api/v1/predictions` & `/api/v1/forecasts`)
- `GET /api/v1/predictions` — ML model predictions and threat probability scores.
- `GET /api/v1/forecasts?horizon=7d` — Time-series projections (24h, 7d, 30d).

### Anomaly & Clustering (`/api/v1/anomalies` & `/api/v1/threat-clusters`)
- `GET /api/v1/anomalies` — Isolation Forest anomaly detection results.
- `GET /api/v1/threat-clusters` — DBSCAN threat cluster signatures.

### Entity Intelligence (`/api/v1/entities`)
- `GET /api/v1/entities` — Correlated entity list (UPIs, phone numbers, IPs, emails).
- `GET /api/v1/entities/graph` — Node & edge graph representation for relationship visualization.

### Early Warnings (`/api/v1/early-warnings`)
- `GET /api/v1/early-warnings` — List active early warning alerts.
- `POST /api/v1/early-warnings/{id}/action` — Persists officer actions (`ACKNOWLEDGE`, `INVESTIGATE`, `DISMISS`, `ESCALATE`).

### Investigation Workspace (`/api/v1/investigations`)
- `GET /api/v1/investigations` — Active investigation case files.
- `POST /api/v1/investigations` — Creates a new investigation case file.

### Model Observatory & Security (`/api/v1/models` & `/api/v1/security`)
- `GET /api/v1/models` — Active ML models, drift metrics, and versioning status.
- `GET /api/v1/security/status` — Security compliance status.
- `GET /api/v1/audit-logs` — Audit log of system events and user actions.

### AI Copilot (`/api/v1/copilot`)
- `POST /api/v1/copilot/query` — AI Copilot endpoint returning context-grounded answers.

### Demo Mode (`/api/v1/demo`)
- `POST /api/v1/demo/simulate-emerging-threat` — Triggers signature emerging threat simulation scenario in database.
