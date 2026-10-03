from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResumeResponse(BaseModel):
    id: int

    user_id: int

    original_filename: str

    stored_filename: str

    file_type: str

    extracted_text: str | None = None

    uploaded_at: datetime

    # AI Resume Analysis Score
    ai_score: float | None = None

    model_config = ConfigDict(
        from_attributes=True
    )