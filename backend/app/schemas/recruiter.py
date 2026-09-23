from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ============================================================
# RECRUITER CANDIDATE RESULT
# ============================================================

class RecruiterCandidateResponse(BaseModel):

    candidate_id: int

    full_name: str

    email: str

    resume_id: int

    resume_filename: str

    job_id: int

    job_title: str

    company_name: str | None

    match_score: float

    experience_match: float

    matched_skills: str | None

    missing_skills: str | None

    matched_keywords: str | None

    missing_keywords: str | None

    summary: str | None

    recommendations: str | None

    matched_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# RECRUITER CANDIDATE LIST
# ============================================================

class RecruiterCandidateListResponse(BaseModel):

    job_id: int

    job_title: str

    company_name: str | None

    total_candidates: int

    candidates: list[RecruiterCandidateResponse]