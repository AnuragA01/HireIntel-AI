from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # FULL NAME
    # ============================================================

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    # ============================================================
    # EMAIL
    # ============================================================

    email: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        index=True,
        nullable=False,
    )

    # ============================================================
    # PASSWORD
    # ============================================================

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # ============================================================
    # ROLE
    # candidate / recruiter
    # ============================================================

    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="candidate",
    )

    # ============================================================
    # ACTIVE STATUS
    # ============================================================

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # ============================================================
    # PHONE
    # ============================================================

    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    # ============================================================
    # LOCATION
    # ============================================================

    location: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    # ============================================================
    # EDUCATION
    # ============================================================

    education: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    # ============================================================
    # EXPERIENCE
    # ============================================================

    experience: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    # ============================================================
    # SKILLS
    # Example:
    # Python, Java, React, SQL, FastAPI
    # ============================================================

    skills: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # ============================================================
    # PROFESSIONAL BIO
    # ============================================================

    bio: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # ============================================================
    # CREATED DATE
    # ============================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )