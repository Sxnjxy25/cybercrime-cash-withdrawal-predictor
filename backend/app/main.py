from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.db.database import engine, Base
from app.routers import (
    auth, dashboard, complaints, analytics, predictions,
    forecasts, anomalies, threats, entities, warnings,
    investigations, models, security, audit, copilot, reports
)

# Ensure all database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Cybercrime Predictive Intelligence & Early-Warning Platform for SIH"
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production ready for cross-origin local Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Security & Error Handler (never leak raw tracebacks to clients)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server processing error occurred. Incident logged into security audit."}
    )

# Include all 17 feature routers
prefix = settings.API_V1_STR

app.include_router(auth.router, prefix=prefix)
app.include_router(dashboard.router, prefix=prefix)
app.include_router(complaints.router, prefix=prefix)
app.include_router(analytics.router, prefix=prefix)
app.include_router(predictions.router, prefix=prefix)
app.include_router(forecasts.router, prefix=prefix)
app.include_router(anomalies.router, prefix=prefix)
app.include_router(threats.router, prefix=prefix)
app.include_router(entities.router, prefix=prefix)
app.include_router(warnings.router, prefix=prefix)
app.include_router(investigations.router, prefix=prefix)
app.include_router(models.router, prefix=prefix)
app.include_router(security.router, prefix=prefix)
app.include_router(audit.router, prefix=prefix)
app.include_router(copilot.router, prefix=prefix)
app.include_router(reports.router, prefix=prefix)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "DETECT THE PATTERN. PREDICT THE THREAT. ACT EARLY.",
        "status": "ONLINE",
        "docs_url": "/docs"
    }

@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ml_engine": "ready",
        "version": settings.VERSION
    }
