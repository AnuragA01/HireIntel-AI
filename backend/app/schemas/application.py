from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ============================================================
# CREATE APPLICATION
# ============================================================

class ApplicationCreate(BaseModel):
    resume_id: int
    cover_letter: Optional[str] = None


# ============================================================
# UPDATE APPLICATION STATUS
# ============================================================

class ApplicationStatusUpdate(BaseModel):
    status: str
    recruiter_notes: Optional[str] = None


# ============================================================
# APPLICATION RESPONSE
# ============================================================

class ApplicationResponse(BaseModel):
    id: int

    candidate_id: int
    resume_id: int
    job_id: int

    status: str

    cover_letter: Optional[str] = None

    # AI matching can produce decimal values
    # Example: 51.97, 72.50, 86.35
    match_score: Optional[float] = None

    recruiter_notes: Optional[str] = None

    applied_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )