from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ============================================================
# CANDIDATE JOB RESPONSE
# ============================================================

class CandidateJobResponse(BaseModel):

    id: int
    job_title: str
    company_name: str | None
    location: str | None
    job_type: str | None
    description: str
    required_skills: str | None
    experience_required: str | None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# CANDIDATE JOB LIST RESPONSE
# ============================================================

class CandidateJobListResponse(BaseModel):

    total_jobs: int
    page: int
    limit: int
    total_pages: int
    jobs: list[CandidateJobResponse]