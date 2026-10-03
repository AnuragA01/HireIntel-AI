from pydantic import BaseModel, Field


# ============================================================
# JOB DESCRIPTION MATCH REQUEST
# ============================================================

class JobDescriptionMatchRequest(BaseModel):

    resume_id: int = Field(
        ...,
        description="ID of the candidate resume to analyze",
    )

    job_title: str | None = Field(
        default=None,
        max_length=255,
        description="Optional job title",
    )

    job_description: str = Field(
        ...,
        min_length=20,
        description="Job description to compare against the resume",
    )


# ============================================================
# JOB DESCRIPTION MATCH RESPONSE
# ============================================================

class JobDescriptionMatchResponse(BaseModel):

    resume_id: int

    job_title: str | None

    match_score: float

    match_label: str | None = None

    matched_skills: list[str]

    missing_skills: list[str]

    matched_keywords: list[str]

    missing_keywords: list[str]

    experience_match: float

    summary: str

    recommendations: list[str]

    score_breakdown: dict[str, float] = Field(
        default_factory=dict
    )