from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.resume import Resume
from app.models.job import Job
from app.models.job_match import JobMatch

from app.schemas.job_match import JobMatchResponse

from app.services.job_match_service import (
    match_resume_with_job,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/job-matches",
    tags=["Job Matching"],
)


# ============================================================
# CREATE / UPDATE JOB MATCH
# ============================================================

@router.post(
    "/resume/{resume_id}/job/{job_id}",
    response_model=JobMatchResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job_match(
    resume_id: int,
    job_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    # ========================================================
    # ONLY CANDIDATES CAN CREATE MATCHES
    # ========================================================

    if current_user.role != "candidate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only candidates can match resumes with jobs.",
        )

    # ========================================================
    # FIND RESUME
    # ========================================================

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if resume is None:

        raise HTTPException(
            status_code=404,
            detail="Resume not found.",
        )

    # ========================================================
    # CHECK RESUME TEXT
    # ========================================================

    if not resume.extracted_text:

        raise HTTPException(
            status_code=400,
            detail="Resume does not contain extracted text.",
        )

    # ========================================================
    # FIND JOB
    #
    # IMPORTANT:
    # The job belongs to the recruiter.
    # Therefore we MUST NOT check:
    #
    # Job.user_id == current_user.id
    #
    # The candidate is allowed to match their resume
    # against a recruiter-created job.
    # ========================================================

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
        )
        .first()
    )

    if job is None:

        raise HTTPException(
            status_code=404,
            detail="Job not found.",
        )

    # ========================================================
    # RUN MATCHING ALGORITHM
    # ========================================================

    try:

        job_description_for_matching = (
            f"{job.description} "
            f"{job.experience_required or ''}"
        )

        result = match_resume_with_job(
            resume_text=resume.extracted_text,
            job_description=job_description_for_matching,
            required_skills_text=job.required_skills,
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Job matching failed: {error}",
        )

    # ========================================================
    # CONVERT LISTS TO DATABASE TEXT
    # ========================================================

    matched_skills_text = ", ".join(
        result["matched_skills"]
    )

    missing_skills_text = ", ".join(
        result["missing_skills"]
    )

    matched_keywords_text = ", ".join(
        result["matched_keywords"]
    )

    missing_keywords_text = ", ".join(
        result["missing_keywords"]
    )

    recommendations_text = "\n".join(
        result["recommendations"]
    )

    # ========================================================
    # FIND EXISTING MATCH
    # ========================================================

    existing_match = (
        db.query(JobMatch)
        .filter(
            JobMatch.resume_id == resume_id,
            JobMatch.job_id == job_id,
            JobMatch.user_id == current_user.id,
        )
        .first()
    )

    # ========================================================
    # UPDATE EXISTING MATCH
    # ========================================================

    if existing_match:

        existing_match.match_score = (
            result["match_score"]
        )

        existing_match.matched_skills = (
            matched_skills_text
        )

        existing_match.missing_skills = (
            missing_skills_text
        )

        existing_match.matched_keywords = (
            matched_keywords_text
        )

        existing_match.missing_keywords = (
            missing_keywords_text
        )

        existing_match.experience_match = (
            result["experience_match"]
        )

        existing_match.summary = (
            result["summary"]
        )

        existing_match.recommendations = (
            recommendations_text
        )

        existing_match.created_at = (
            datetime.utcnow()
        )

        db.commit()

        db.refresh(
            existing_match
        )

        return existing_match

    # ========================================================
    # CREATE NEW MATCH
    # ========================================================

    new_match = JobMatch(

        resume_id=resume_id,

        job_id=job_id,

        # Candidate who submitted the resume
        user_id=current_user.id,

        match_score=result[
            "match_score"
        ],

        matched_skills=(
            matched_skills_text
        ),

        missing_skills=(
            missing_skills_text
        ),

        matched_keywords=(
            matched_keywords_text
        ),

        missing_keywords=(
            missing_keywords_text
        ),

        experience_match=result[
            "experience_match"
        ],

        summary=result[
            "summary"
        ],

        recommendations=(
            recommendations_text
        ),
    )

    db.add(
        new_match
    )

    db.commit()

    db.refresh(
        new_match
    )

    return new_match


# ============================================================
# GET SINGLE JOB MATCH
# ============================================================

@router.get(
    "/resume/{resume_id}/job/{job_id}",
    response_model=JobMatchResponse,
)
def get_job_match(
    resume_id: int,
    job_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    match = (
        db.query(JobMatch)
        .filter(
            JobMatch.resume_id == resume_id,
            JobMatch.job_id == job_id,
            JobMatch.user_id == current_user.id,
        )
        .first()
    )

    if match is None:

        raise HTTPException(
            status_code=404,
            detail="Job match not found.",
        )

    return match


# ============================================================
# GET ALL MATCHES FOR A RESUME
# ============================================================

@router.get(
    "/resume/{resume_id}",
    response_model=list[JobMatchResponse],
)
def get_resume_job_matches(
    resume_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    # ========================================================
    # VERIFY RESUME OWNERSHIP
    # ========================================================

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if resume is None:

        raise HTTPException(
            status_code=404,
            detail="Resume not found.",
        )

    # ========================================================
    # GET ALL MATCHES
    # ========================================================

    matches = (
        db.query(JobMatch)
        .filter(
            JobMatch.resume_id == resume_id,
            JobMatch.user_id == current_user.id,
        )
        .order_by(
            JobMatch.created_at.desc()
        )
        .all()
    )

    return matches