# CYBERPREDICT X — Project Directory Structure

```text
SIH/
├── backend/
│   ├── app/
│   │   ├── config.py              # Application settings & environment configuration
│   │   ├── main.py                # FastAPI entrypoint, middleware, CORS, routers & exception handlers
│   │   ├── seed.py                # Database seed script (1,000 synthetic complaints, entities, warnings)
│   │   ├── db/
│   │   │   └── database.py        # SQLAlchemy engine, SessionLocal & Base
│   │   ├── ml/
│   │   │   ├── anomaly_engine.py  # Isolation Forest anomaly detection engine
│   │   │   ├── clustering_engine.py# DBSCAN threat clustering engine
│   │   │   ├── forecast_engine.py # Time-series forecasting engine
│   │   │   ├── modus_operandi_engine.py # Pattern matching engine
│   │   │   ├── risk_engine.py     # Risk score calculation & SHAP factors
│   │   │   └── shap_explainer.py  # Explainable AI engine
│   │   ├── models/
│   │   │   └── all_models.py      # SQLAlchemy database models
│   │   ├── routers/               # 17 FastAPI feature routers
│   │   ├── schemas/               # Pydantic schemas & response models
│   │   └── services/              # Auth & business logic services
│   ├── tests/
│   │   └── test_api.py            # Pytest API integration test suite
│   ├── test_backend_full.py       # Comprehensive 22-endpoint audit script
│   ├── requirements.txt           # Python dependencies
│   └── cyberpredictx.db           # SQLite database
├── frontend/
│   ├── app/
│   │   ├── globals.css            # Obsidian Intelligence CSS variables & dark map styles
│   │   ├── layout.tsx             # Root layout & platform metadata
│   │   └── page.tsx               # Flagship Command Center page
│   ├── components/                # Modular tactical visual components
│   ├── lib/
│   │   └── api.ts                 # Centralized API client (derived from NEXT_PUBLIC_API_URL)
│   ├── .env.local                 # Frontend environment configuration
│   ├── package.json               # Node.js dependencies & scripts
│   └── tsconfig.json              # TypeScript compiler configuration
├── pyrightconfig.json             # Pyright static analyzer configuration
└── .vscode/                       # Workspace editor settings
```
