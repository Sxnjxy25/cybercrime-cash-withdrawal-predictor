# CYBERPREDICT X — AI-Powered Cybercrime Predictive Intelligence & Early-Warning Platform

> **"DETECT THE PATTERN. PREDICT THE THREAT. ACT EARLY."**

CYBERPREDICT X is an India-focused predictive cybercrime intelligence platform designed for Smart India Hackathon (SIH). It transforms authorized cybercrime complaint data into predictive, explainable, and actionable decision-support intelligence for authorized cybercrime response teams.

---

## 🌟 Key Features

1. **Predictive Cyber Risk Map**: Interactive India map visualizing district-level risk scores, anomaly hotspots, and complaint density.
2. **What Happens Next? Forecast Engine**: Holt-Winters time-series predictive modeling forecasting cybercrime volume over 24h, 7d, and 30d horizons with confidence bounds.
3. **Threat DNA**: Signature pattern visualizer summarizing emerging syndicate characteristics (Category, Channel, Payment Vector, Region, Growth Rate, Peak Time, Anomaly Score).
4. **Entity Relationship Intelligence Graph**: Interactive NetworkX & React Flow graph topology correlating UPI IDs, Mobile Numbers, Email Addresses, Domain URLs, and Bank Accounts.
5. **Early Warning Engine**: Automated trigger alerts with operational lifecycle actions (`ACKNOWLEDGE`, `ASSIGN`, `INVESTIGATE`, `DISMISS`).
6. **Explainable AI (XAI)**: SHAP-inspired multi-factor attribution breakdown ("WHY THIS RISK?") quantifying Growth, Regional Concentration, Anomaly Score, Cluster Expansion, and Historical Recurrence.
7. **Human-in-the-Loop Investigation Workspace**: Case file management, officer notes, evidence tracking, and feedback logging.
8. **AI Copilot**: Direct database RAG query engine answering high-level officer questions with 100% factual accuracy and zero paid API dependency.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+

### Running Backend (FastAPI + ML Stack)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m app.seed     # Seed 1,000 synthetic complaints & initial models
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`

### Running Frontend (Next.js 14 Command Center)
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
- Command Center UI: `http://localhost:3000`

---

## 🛡️ Responsible AI Boundary
The platform predicts cybercrime trends, spatial-temporal anomalies, threat clusters, and risk scores. Outputs are strictly decision-support signals tagged as `OBSERVED`, `PREDICTED`, `CORRELATED`, `RECOMMENDED`, or `CONFIRMED`. The platform does NOT assert individual criminal guilt or identity.
