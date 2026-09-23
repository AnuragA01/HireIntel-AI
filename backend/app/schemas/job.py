from datetime import datetime

from pydantic import BaseModel, ConfigDict


class JobCreateRequest(BaseModel):
    job_title: str
    company_name: str | None = None
    location: str | None = None
    job_type: str | None = None
    description: str
    required_skills: str | None = None
    experience_required: str | None = None


class JobResponse(BaseModel):
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

    model_config = ConfigDict(
        from_attributes=True
    )