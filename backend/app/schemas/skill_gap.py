from pydantic import BaseModel, Field


# ============================================================
# SKILL GAP REQUEST
# ============================================================

class SkillGapRequest(BaseModel):
    resume_id: int = Field(
        ...,
        description="ID of the candidate resume",
    )

    job_title: str | None = Field(
        default=None,
        max_length=255,
        description="Optional target job title",
    )

    job_description: str = Field(
        ...,
        min_length=20,
        description="Complete job description",
    )


# ============================================================
# INDIVIDUAL SKILL GAP
# ============================================================

class SkillGapItem(BaseModel):
    skill: str
    priority: str
    reason: str
    learning_path: list[str]


# ============================================================
# SKILL GAP RESPONSE
# ============================================================

class SkillGapResponse(BaseModel):
    resume_id: int
    job_title: str | None

    match_score: float

    matched_skills: list[str]

    missing_skills: list[str]

    strengths: list[str]

    skill_gaps: list[SkillGapItem]

    recommendations: list[str]

    project_recommendations: list[str]

    summary: str