from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ============================================================
# CREATE JOB
# ============================================================

class RecruiterJobCreate(BaseModel):

    job_title: str

    company_name: str | None = None

    location: str | None = None

    job_type: str | None = None

    description: str

    required_skills: str | None = None

    experience_required: str | None = None


# ============================================================
# UPDATE JOB
# ============================================================

class RecruiterJobUpdate(BaseModel):

    job_title: str | None = None

    company_name: str | None = None

    location: str | None = None

    job_type: str | None = None

    description: str | None = None

    required_skills: str | None = None

    experience_required: str | None = None


# ============================================================
# JOB RESPONSE
# ============================================================

class RecruiterJobResponse(BaseModel):

    id: int

    user_id: int

    job_title: str

    company_name: str | None

    location: str | None

    job_type: str | None

    description: str

    required_skills: str | None

    experience_required: str | None

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)