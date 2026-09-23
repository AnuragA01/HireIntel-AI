from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

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
# GET CURRENT USER PROFILE
# ============================================================

@router.get("/me")
def get_my_profile(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    # ========================================================
    # FIND USER
    # ========================================================

    user = (
        db.query(User)
        .filter(
            User.id == current_user.id
        )
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
    # GET LATEST RESUME
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

        latest_analysis = (
            db.query(ResumeAnalysis)
            .filter(
                ResumeAnalysis.resume_id
                == latest_resume.id,

                ResumeAnalysis.user_id
                == user.id,
            )
            .order_by(
                ResumeAnalysis.analyzed_at.desc()
            )
            .first()
        )

        if latest_analysis:

            latest_resume_score = (
                latest_analysis.resume_score
            )

            latest_resume_data = {

                "resume_id": (
                    latest_resume.id
                ),

                "filename": (
                    latest_resume.original_filename
                ),

                "file_type": (
                    latest_resume.file_type
                ),

                "uploaded_at": (
                    latest_resume.uploaded_at
                ),

                "resume_score": (
                    latest_analysis.resume_score
                ),
            }

    # ========================================================
    # GET BEST JOB MATCH
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

            "match_id": (
                best_match.id
            ),

            "job_id": (
                best_match.job_id
            ),

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

            "match_score": (
                best_match.match_score
            ),

            "experience_match": (
                best_match.experience_match
            ),
        }

    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {

        "profile": {

            "id": user.id,

            "full_name": (
                user.full_name
            ),

            "email": user.email,

            "role": user.role,
        },

        "statistics": {

            "total_resumes": (
                total_resumes
            ),

            "total_jobs": (
                total_jobs
            ),

            "total_matches": (
                total_matches
            ),

            "latest_resume_score": (
                latest_resume_score
            ),
        },

        "latest_resume": (
            latest_resume_data
        ),

        "best_job_match": (
            best_match_data
        ),
    }