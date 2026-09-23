from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResumeResponse(BaseModel):

    id: int

    user_id: int

    original_filename: str

    stored_filename: str

    file_type: str

    extracted_text: str | None

    uploaded_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )