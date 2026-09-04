# CYBERPREDICT X — System Architecture & Design

CYBERPREDICT X is an AI-powered predictive cybercrime intelligence & early-warning platform for SIH. It sits as a predictive layer over authorized cybercrime complaint data.

---

## 1. System Pipeline Architecture

```text
AUTHORISED COMPLAINTS
        ↓
ANALYTICS ENGINE (Pandas / NumPy / Regional Risk Calculation)
        ↓
ANOMALY DETECTION (Isolation Forest & Rolling Baseline)
        ↓
THREAT CLUSTERING (DBSCAN & Modus Operandi Pattern Matching)
        ↓
ENTITY CORRELATION (Graph & Relationship Mapping)
        ↓
TIME-SERIES FORECASTING (Statsmodels 24h / 7d / 30d Projections)
        ↓
EXPLAINABLE RISK ENGINE (SHAP Factors & Risk Score 0–100)
        ↓
EARLY WARNING ENGINE (Automated Alert Escalation)
        ↓
HUMAN INVESTIGATION WORKSPACE (Officer Case Management)
        ↓
AUDIT TRAIL & FEEDBACK LOOP
```

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 14.2.15 (App Router, Server & Client Components)
- **UI Logic**: React 18.3.1
- **Styling**: Vanilla CSS with Tailwind v4 & Obsidian Intelligence Design System (`--bg-obsidian`, `--accent-crimson`, `--accent-violet`, `--accent-amber`, `--text-ivory`)
- **Animations**: Framer Motion 11.15.0
- **Tactical Maps**: Leaflet 1.9.4 & React-Leaflet 4.2.1
- **Entity Correlation**: ReactFlow 11.11.4
- **Charts**: Recharts 2.15.0

### Backend
- **Framework**: FastAPI 0.110+
- **ASGI Server**: Uvicorn
- **ORM / Database**: SQLAlchemy 2.0 with SQLite (`cyberpredictx.db`) and PostgreSQL support
- **Security & Auth**: PyJWT, Passlib (bcrypt), FastAPI OAuth2 Password Bearer
- **ML / Data Science**: Pandas, NumPy, Scikit-Learn (Isolation Forest, DBSCAN), Statsmodels (Forecasting), NetworkX

---

## 3. Visual System Tokens (Obsidian Intelligence)

- **Obsidian Dark Background**: `#090909`, `#0D0D0F`, `#121214`, `#171719`
- **Crimson Critical Accent**: `#FF304F`, `#E51C46`, `#C9183E`
- **Violet AI / Prediction Accent**: `#8B5CF6`, `#A855F7`, `#C026D3`
- **Amber Warning Accent**: `#F59E0B`, `#FBBF24`, `#D97706`
- **Warm Ivory Text & Neutral Borders**: `#F5F2EA`, `#D6D1C7`, `#A6A19A`, `#242428`
