from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    Float,
)

from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # CANDIDATE
    # ============================================================

    candidate_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # ============================================================
    # RESUME
    # ============================================================

    resume_id = Column(
        Integer,
        ForeignKey("resumes.id"),
        nullable=False,
        index=True,
    )

    # ============================================================
    # JOB
    # ============================================================

    job_id = Column(
        Integer,
        ForeignKey("jobs.id"),
        nullable=False,
        index=True,
    )

    # ============================================================
    # APPLICATION STATUS
    #
    # Possible values:
    #
    # Applied
    # Shortlisted
    # Interview
    # Rejected
    # Hired
    # ============================================================

    status = Column(
        String(50),
        nullable=False,
        default="Applied",
    )

    # ============================================================
    # COVER LETTER
    # ============================================================

    cover_letter = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # AI MATCH SCORE
    #
    # IMPORTANT:
    # This MUST be Float.
    #
    # Examples:
    # 51.97
    # 72.50
    # 86.35
    # ============================================================

    match_score = Column(
        Float,
        nullable=True,
    )

    # ============================================================
    # RECRUITER NOTES
    # ============================================================

    recruiter_notes = Column(
        Text,
        nullable=True,
    )

    # ============================================================
    # APPLICATION CREATED DATE
    # ============================================================

    applied_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # ============================================================
    # LAST UPDATED DATE
    # ============================================================

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )