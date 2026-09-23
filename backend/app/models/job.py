from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)

from app.core.database import Base


class Job(Base):

    __tablename__ = "jobs"

    # ========================================================
    # PRIMARY KEY
    # ========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ========================================================
    # USER
    # ========================================================

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # ========================================================
    # JOB INFORMATION
    # ========================================================

    job_title = Column(
        String(255),
        nullable=False
    )

    company_name = Column(
        String(255),
        nullable=True
    )

    location = Column(
        String(255),
        nullable=True
    )

    job_type = Column(
        String(100),
        nullable=True
    )

    # ========================================================
    # JOB DESCRIPTION
    # ========================================================

    description = Column(
        Text,
        nullable=False
    )

    required_skills = Column(
        Text,
        nullable=True
    )

    experience_required = Column(
        String(255),
        nullable=True
    )

    # ========================================================
    # TIMESTAMP
    # ========================================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )