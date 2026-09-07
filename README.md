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
## 🛡️ Responsible AI Boundary
The platform predicts cybercrime trends, spatial-temporal anomalies, threat clusters, and risk scores. Outputs are strictly decision-support signals tagged as `OBSERVED`, `PREDICTED`, `CORRELATED`, `RECOMMENDED`, or `CONFIRMED`. The platform does NOT assert individual criminal guilt or identity.
## Language used
## Backend Technology Stack

The CYBERPREDICT X backend is designed as a secure, scalable, API-driven predictive intelligence layer for cybercrime complaint analysis and cash-withdrawal hotspot forecasting.

### Core Backend

* **Python** — Primary backend programming language
* **FastAPI** — High-performance REST API framework
* **Pydantic** — Request validation, data modelling, and API schema enforcement
* **SQLAlchemy** — ORM and database interaction layer
* **PostgreSQL + PostGIS** — Relational and geospatial data storage for production-scale deployment
* **SQLite** — Lightweight local development and testing database

### Data & Streaming

* **Pandas** — Data processing and analytical transformations
* **NumPy** — Numerical computation and feature engineering
* **Apache Kafka** — Real-time complaint and transaction data ingestion pipeline

### Machine Learning & Predictive Analytics

* **XGBoost / LightGBM** — Predictive risk modelling and cash-out hotspot forecasting
* **ST-DBSCAN** — Spatio-temporal clustering for identifying geographically and temporally related cybercrime activity
* **KDE (Kernel Density Estimation)** — GIS-based risk density and hotspot analysis
* **NetworkX / Graph Analytics** — Relationship and mule-account network analysis
* **GNN-based Graph Intelligence** — Graph-based analysis of suspicious account relationships and transaction networks
* **SHAP** — Explainable AI for interpreting prediction and risk-model outputs


## Frontend Technology Stack

CYBERPREDICT X uses a modern, responsive and intelligence-focused frontend architecture designed for real-time cybercrime monitoring, predictive analytics visualization, geospatial intelligence and law-enforcement workflows.

### Core Frontend

* **Next.js** — React-based framework for building the application and application routing
* **TypeScript** — Type-safe frontend development
* **React** — Component-based user interface architecture
* **Next.js App Router** — Application routing and page structure
* **Tailwind CSS** — Utility-first styling and responsive design
* **shadcn/ui** — Reusable and accessible UI components
* **Lucide Icons** — Consistent interface iconography

### Data Visualization & Intelligence UI

* **Recharts** — Interactive analytical charts and predictive data visualization
* **Leaflet** — Interactive geospatial visualization
* **OpenStreetMap** — Map data and geographic visualization
* **React Flow** — Entity relationship and intelligence graph visualization
* **Three.js** — 3D visualization and immersive intelligence interfaces
* **React Three Fiber** — React integration for Three.js-based 3D components
* **Framer Motion** — UI transitions, micro-interactions and motion-based visualization

