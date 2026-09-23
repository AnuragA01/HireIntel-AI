from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text


from app.core.config import settings
from app.core.database import Base, engine


# ============================================================
# DATABASE MODELS
# ============================================================

from app.models.user import User
from app.models.resume import Resume
from app.models.resume_analysis import ResumeAnalysis
from app.models.job import Job
from app.models.job_match import JobMatch
from app.models.application import Application


# ============================================================
# API ROUTERS
# ============================================================

from app.routers.auth import router as auth_router

from app.routers.resume import router as resume_router

from app.routers.resume_analysis import (
    router as resume_analysis_router
)

from app.routers.job import (
    router as job_router
)

from app.routers.job_match import (
    router as job_match_router
)

from app.routers.dashboard import (
    router as dashboard_router
)

from app.routers.profile import (
    router as profile_router
)

from app.routers.recruiter_dashboard import (
    router as recruiter_dashboard_router
)

# Recruiter candidate ranking
from app.routers.recruiter import (
    router as recruiter_router
)

# Candidate details for recruiters
from app.routers.candidate import (
    router as candidate_router
)

# Candidate job discovery
from app.routers.candidate_jobs import (
    router as candidate_jobs_router
)

# Job applications
from app.routers.application import (
    router as application_router
)


# ============================================================
# HIREINTEL AI APPLICATION
# ============================================================

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Recruitment & Career Intelligence Platform",
    version="1.0.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

Base.metadata.create_all(
    bind=engine
)


# ============================================================
# REGISTER API ROUTERS
# ============================================================

app.include_router(
    auth_router
)

app.include_router(
    resume_router
)

app.include_router(
    resume_analysis_router
)

app.include_router(
    job_router
)

app.include_router(
    job_match_router
)

app.include_router(
    dashboard_router
)

app.include_router(
    profile_router
)

app.include_router(
    recruiter_dashboard_router
)

# Recruiter candidate ranking
app.include_router(
    recruiter_router
)

# Candidate details
app.include_router(
    candidate_router
)

# Candidate job discovery
app.include_router(
    candidate_jobs_router
)

# Job applications
app.include_router(
    application_router
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "application": "HireIntel AI",
        "message": "AI-Powered Recruitment & Career Intelligence Platform",
        "status": "running",
        "version": "1.0.0",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "application": "HireIntel AI",
    }


# ============================================================
# DATABASE TEST
# ============================================================

@app.get("/database-test")
def database_test():

    try:

        with engine.connect() as connection:

            result = connection.execute(
                text("SELECT 1")
            )

            value = result.scalar()

        return {
            "database": "connected",
            "result": value,
        }

    except Exception as error:

        return {
            "database": "connection_failed",
            "error": str(error),
        }