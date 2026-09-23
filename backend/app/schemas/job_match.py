from datetime import datetime

from pydantic import BaseModel, ConfigDict


class JobMatchResponse(BaseModel):
    id: int
    resume_id: int
    job_id: int
    user_id: int

    match_score: float | None

    matched_skills: str | None
    missing_skills: str | None

    matched_keywords: str | None
    missing_keywords: str | None

    experience_match: float | None

    summary: str | None
    recommendations: str | None

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )