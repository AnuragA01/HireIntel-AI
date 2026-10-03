from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.resume import Resume
from app.models.resume_analysis import ResumeAnalysis
from app.models.job import Job
from app.models.job_match import JobMatch


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/profile",
    tags=["Candidate Profile"],
)


# ============================================================
# PROFILE UPDATE SCHEMA
# ============================================================

class ProfileUpdate(BaseModel):
    """
    Fields that can be updated by the logged-in user.

    Email, role, password and account status are intentionally
    not included here.
    """

    full_name: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    phone: Optional[str] = Field(
        default=None,
        max_length=20,
    )

    location: Optional[str] = Field(
        default=None,
        max_length=150,
    )

    education: Optional[str] = Field(
        default=None,
        max_length=200,
    )

    experience: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    skills: Optional[str] = Field(
        default=None,
    )

    bio: Optional[str] = Field(
        default=None,
    )


# ============================================================
# GET CURRENT USER PROFILE
# ============================================================

@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return the currently logged-in user's profile,
    statistics, latest resume and best job match.
    """

    # ========================================================
    # FIND USER
    # ========================================================

    user = (
        db.query(User)
        .filter(User.id == current_user.id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # ========================================================
    # COUNT RESUMES
    # ========================================================

    total_resumes = (
        db.query(Resume)
        .filter(
            Resume.user_id == user.id
        )
        .count()
    )

    # ========================================================
    # COUNT JOBS
    # ========================================================

    total_jobs = (
        db.query(Job)
        .filter(
            Job.user_id == user.id
        )
        .count()
    )

    # ========================================================
    # COUNT JOB MATCHES
    # ========================================================

    total_matches = (
        db.query(JobMatch)
        .filter(
            JobMatch.user_id == user.id
        )
        .count()
    )

    # ========================================================
    # LATEST RESUME
    # ========================================================

    latest_resume = (
        db.query(Resume)
        .filter(
            Resume.user_id == user.id
        )
        .order_by(
            Resume.uploaded_at.desc()
        )
        .first()
    )

    latest_resume_data = None
    latest_resume_score = None

    if latest_resume:

        # ====================================================
        # LATEST RESUME ANALYSIS
        # ====================================================

        latest_analysis = (
            db.query(ResumeAnalysis)
            .filter(
                ResumeAnalysis.resume_id == latest_resume.id,
                ResumeAnalysis.user_id == user.id,
            )
            .order_by(
                ResumeAnalysis.analyzed_at.desc()
            )
            .first()
        )

        # ====================================================
        # RESUME DATA
        # ====================================================

        latest_resume_data = {
            "resume_id": latest_resume.id,
            "filename": latest_resume.original_filename,
            "file_type": latest_resume.file_type,
            "uploaded_at": latest_resume.uploaded_at,
            "resume_score": (
                latest_analysis.resume_score
                if latest_analysis
                else None
            ),
        }

        if latest_analysis:
            latest_resume_score = (
                latest_analysis.resume_score
            )

    # ========================================================
    # BEST JOB MATCH
    # ========================================================

    best_match = (
        db.query(JobMatch)
        .filter(
            JobMatch.user_id == user.id
        )
        .order_by(
            JobMatch.match_score.desc()
        )
        .first()
    )

    best_match_data = None

    if best_match:

        job = (
            db.query(Job)
            .filter(
                Job.id == best_match.job_id
            )
            .first()
        )

        best_match_data = {
            "match_id": best_match.id,

            "job_id": best_match.job_id,

            "job_title": (
                job.job_title
                if job
                else None
            ),

            "company_name": (
                job.company_name
                if job
                else None
            ),

            "match_score": best_match.match_score,

            "experience_match": (
                best_match.experience_match
            ),
        }

    # ========================================================
    # PROFILE RESPONSE
    # ========================================================

    return {
        "profile": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,

            # NEW PROFILE FIELDS
            "phone": user.phone,
            "location": user.location,
            "education": user.education,
            "experience": user.experience,
            "skills": user.skills,
            "bio": user.bio,
        },

        "statistics": {
            "total_resumes": total_resumes,
            "total_jobs": total_jobs,
            "total_matches": total_matches,
            "latest_resume_score": latest_resume_score,
        },

        "latest_resume": latest_resume_data,

        "best_job_match": best_match_data,
    }


# ============================================================
# UPDATE CURRENT USER PROFILE
# ============================================================

@router.put("/me")
def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update the profile of the currently logged-in user.

    Email, password, role and account status cannot be changed
    through this endpoint.
    """

    # ========================================================
    # FIND USER
    # ========================================================

    user = (
        db.query(User)
        .filter(User.id == current_user.id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # ========================================================
    # UPDATE ONLY PROVIDED FIELDS
    # ========================================================

    update_data = profile_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():

        # ----------------------------------------------------
        # Clean string values
        # ----------------------------------------------------

        if isinstance(value, str):
            value = value.strip()

        # ----------------------------------------------------
        # Full name validation
        # ----------------------------------------------------

        if field == "full_name":

            if value is not None and value == "":
                raise HTTPException(
                    status_code=400,
                    detail="Full name cannot be empty.",
                )

        # ----------------------------------------------------
        # Phone validation
        # ----------------------------------------------------

        if field == "phone":

            if value is not None and value != "":
                cleaned_phone = (
                    value.replace(" ", "")
                    .replace("-", "")
                )

                if not cleaned_phone.replace("+", "").isdigit():
                    raise HTTPException(
                        status_code=400,
                        detail="Please enter a valid phone number.",
                    )

        # ----------------------------------------------------
        # Skills
        # ----------------------------------------------------

        if field == "skills":

            if value is not None:
                value = value.strip()

        # ----------------------------------------------------
        # Update model
        # ----------------------------------------------------

        setattr(
            user,
            field,
            value,
        )

    # ========================================================
    # SAVE CHANGES
    # ========================================================

    db.commit()
    db.refresh(user)

    # ========================================================
    # RETURN UPDATED PROFILE
    # ========================================================

    return {
        "message": "Profile updated successfully.",

        "profile": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,

            "phone": user.phone,
            "location": user.location,
            "education": user.education,
            "experience": user.experience,
            "skills": user.skills,
            "bio": user.bio,
        },
    }