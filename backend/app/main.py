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
# ROUTERS
# ============================================================

from app.routers.auth import router as auth_router

from app.routers.resume import router as resume_router

from app.routers.resume_analysis import (
    router as resume_analysis_router
)

from app.routers.job import router as job_router

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

from app.routers.recruiter import (
    router as recruiter_router
)

from app.routers.candidate import (
    router as candidate_router
)

from app.routers.candidate_jobs import (
    router as candidate_jobs_router
)

from app.routers.application import (
    router as application_router
)

from app.routers.career_intelligence import (
    router as career_intelligence_router
)

# ------------------------------------------------------------
# NEW: AI SKILL GAP ROUTER
# ------------------------------------------------------------

from app.routers.skill_gap import (
    router as skill_gap_router
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AI-Powered Recruitment & "
        "Career Intelligence Platform"
    ),
    version="1.0.0",
)


# ============================================================
# CORS
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
# DATABASE TABLE CREATION
# ============================================================

Base.metadata.create_all(
    bind=engine
)


# ============================================================
# REGISTER ROUTERS
# ============================================================

# Authentication
app.include_router(
    auth_router
)

# Resume management
app.include_router(
    resume_router
)

# Resume AI analysis
app.include_router(
    resume_analysis_router
)

# Jobs
app.include_router(
    job_router
)

# Resume ↔ Job matching
app.include_router(
    job_match_router
)

# Candidate dashboard
app.include_router(
    dashboard_router
)

# Candidate profile
app.include_router(
    profile_router
)

# Recruiter dashboard
app.include_router(
    recruiter_dashboard_router
)

# Recruiter functionality
app.include_router(
    recruiter_router
)

# Candidate functionality
app.include_router(
    candidate_router
)

# Candidate jobs
app.include_router(
    candidate_jobs_router
)

# Applications
app.include_router(
    application_router
)

# Career Intelligence
app.include_router(
    career_intelligence_router
)

# AI Skill Gap Analysis
app.include_router(
    skill_gap_router
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "application": "HireIntel AI",

        "message": (
            "AI-Powered Recruitment & "
            "Career Intelligence Platform"
        ),

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