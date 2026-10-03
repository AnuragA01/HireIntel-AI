# ============================================================
# SCHEMA EXPORTS
# ============================================================


# ============================================================
# AUTH SCHEMAS
# ============================================================

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    TokenResponse,
)


# ============================================================
# RESUME SCHEMAS
# ============================================================

from app.schemas.resume import (
    ResumeResponse,
)


# ============================================================
# RESUME ANALYSIS SCHEMAS
# ============================================================

from app.schemas.resume_analysis import (
    ResumeAnalysisResponse,
)


# ============================================================
# JOB SCHEMAS
# ============================================================

from app.schemas.job import (
    JobCreateRequest,
    JobResponse,
)


# ============================================================
# JOB MATCH SCHEMAS
# ============================================================

from app.schemas.job_match import (
    JobMatchResponse,
)


# ============================================================
# PUBLIC SCHEMAS
# ============================================================

__all__ = [
    # Auth
    "RegisterRequest",
    "LoginRequest",
    "UserResponse",
    "TokenResponse",

    # Resume
    "ResumeResponse",

    # Resume Analysis
    "ResumeAnalysisResponse",

    # Job
    "JobCreateRequest",
    "JobResponse",

    # Job Match
    "JobMatchResponse",
]