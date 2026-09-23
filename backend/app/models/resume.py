from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey

from app.core.database import Base


class Resume(Base):

    __tablename__ = "resumes"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    original_filename = Column(
        String(255),
        nullable=False
    )

    stored_filename = Column(
        String(255),
        nullable=False
    )

    file_path = Column(
        String(500),
        nullable=False
    )

    file_type = Column(
        String(20),
        nullable=False
    )

    extracted_text = Column(
        Text,
        nullable=True
    )

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )