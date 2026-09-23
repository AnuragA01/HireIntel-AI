from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    Text,
    DateTime,
    ForeignKey,
    Float,
)

from app.core.database import Base


class ResumeAnalysis(Base):

    __tablename__ = "resume_analyses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    resume_id = Column(
        Integer,
        ForeignKey("resumes.id"),
        nullable=False,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # ========================================================
    # EXTRACTED INFORMATION
    # ========================================================

    skills = Column(
        Text,
        nullable=True
    )

    education = Column(
        Text,
        nullable=True
    )

    experience = Column(
        Text,
        nullable=True
    )

    projects = Column(
        Text,
        nullable=True
    )

    certifications = Column(
        Text,
        nullable=True
    )

    keywords = Column(
        Text,
        nullable=True
    )

    # ========================================================
    # AI ANALYSIS
    # ========================================================

    summary = Column(
        Text,
        nullable=True
    )

    strengths = Column(
        Text,
        nullable=True
    )

    weaknesses = Column(
        Text,
        nullable=True
    )

    recommendations = Column(
        Text,
        nullable=True
    )

    # ========================================================
    # RESUME SCORE
    # ========================================================

    resume_score = Column(
        Float,
        nullable=True
    )

    # ========================================================
    # TIMESTAMP
    # ========================================================

    analyzed_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )