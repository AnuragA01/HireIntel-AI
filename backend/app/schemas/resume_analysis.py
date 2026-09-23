from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResumeAnalysisResponse(BaseModel):

    id: int

    resume_id: int

    user_id: int

    skills: str | None

    education: str | None

    experience: str | None

    projects: str | None

    certifications: str | None

    keywords: str | None

    summary: str | None

    strengths: str | None

    weaknesses: str | None

    recommendations: str | None

    resume_score: float | None

    analyzed_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )