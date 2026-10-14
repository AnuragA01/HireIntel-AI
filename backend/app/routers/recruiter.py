
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
from app.models.job import Job
from app.models.job_match import JobMatch
from app.models.resume import Resume

from app.schemas.recruiter import (
    RecruiterCandidateResponse,
    RecruiterCandidateListResponse,
)

from app.schemas.recruiter_job import (
    RecruiterJobCreate,
    RecruiterJobUpdate,
    RecruiterJobResponse,
)


router = APIRouter(
    prefix="/recruiter",
    tags=["Recruiter"],
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def normalize_text(value):
    """Normalize text for duplicate job comparison."""
    if value is None:
        return ""

    return " ".join(str(value).strip().lower().split())


def normalize_skills(value):
    """Normalize comma-separated skills for comparison."""
    if not value:
        return ""

    skills = {
        skill.strip().lower()
        for skill in str(value).split(",")
        if skill.strip()
    }

    return ", ".join(sorted(skills))


def safe_percentage(value):
    """Convert a score to a number between 0 and 100."""
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 0.0

    if number != number:
        return 0.0

    return min(max(number, 0.0), 100.0)


def numeric_score(match):
    """Return a sortable match score."""
    try:
        score = float(match.match_score)
    except (TypeError, ValueError):
        return -1.0

    if score != score:
        return -1.0

    return score


# ============================================================
# CREATE JOB
# ============================================================

@router.post(
    "/jobs",
    response_model=RecruiterJobResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job(
    job_data: RecruiterJobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters can create jobs.",
        )

    new_job_title = normalize_text(job_data.job_title)
    new_company_name = normalize_text(job_data.company_name)
    new_location = normalize_text(job_data.location)
    new_job_type = normalize_text(job_data.job_type)
    new_experience = normalize_text(job_data.experience_required)
    new_skills = normalize_skills(job_data.required_skills)

    existing_jobs = (
        db.query(Job)
        .filter(Job.user_id == current_user.id)
        .all()
    )

    for existing_job in existing_jobs:
        same_job = (
            normalize_text(existing_job.job_title) == new_job_title
            and normalize_text(existing_job.company_name)
            == new_company_name
            and normalize_text(existing_job.location)
            == new_location
            and normalize_text(existing_job.job_type)
            == new_job_type
            and normalize_text(existing_job.experience_required)
            == new_experience
            and normalize_skills(existing_job.required_skills)
            == new_skills
        )

        if same_job:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A job with the same details already exists. "
                    f"Existing Job ID: {existing_job.id}"
                ),
            )

    job = Job(
        user_id=current_user.id,
        job_title=job_data.job_title,
        company_name=job_data.company_name,
        location=job_data.location,
        job_type=job_data.job_type,
        description=job_data.description,
        required_skills=job_data.required_skills,
        experience_required=job_data.experience_required,
    )

    try:
        db.add(job)
        db.commit()
        db.refresh(job)
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not create job: {error}",
        )

    return job


# ============================================================
# GET MY JOBS
# ============================================================

@router.get(
    "/jobs",
    response_model=list[RecruiterJobResponse],
)
def get_my_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters can access recruiter jobs.",
        )

    return (
        db.query(Job)
        .filter(Job.user_id == current_user.id)
        .order_by(Job.created_at.desc())
        .all()
    )


# ============================================================
# GET SINGLE JOB
# ============================================================

@router.get(
    "/jobs/{job_id}",
    response_model=RecruiterJobResponse,
)
def get_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters can access recruiter jobs.",
        )

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    return job


# ============================================================
# UPDATE JOB
# ============================================================

@router.put(
    "/jobs/{job_id}",
    response_model=RecruiterJobResponse,
)
def update_job(
    job_id: int,
    job_data: RecruiterJobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters can update jobs.",
        )

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    update_data = job_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(job, field, value)

    try:
        db.commit()
        db.refresh(job)
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not update job: {error}",
        )

    return job


# ============================================================
# DELETE JOB
# ============================================================

@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters can delete jobs.",
        )

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    try:
        deleted_matches = (
            db.query(JobMatch)
            .filter(JobMatch.job_id == job.id)
            .delete(synchronize_session=False)
        )

        db.delete(job)
        db.commit()

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not delete job: {error}",
        )

    return {
        "message": "Job deleted successfully.",
        "job_id": job_id,
        "deleted_matches": deleted_matches,
    }


# ============================================================
# GET RANKED CANDIDATES — DUPLICATES FIXED
# ============================================================

@router.get(
    "/jobs/{job_id}/candidates",
    response_model=RecruiterCandidateListResponse,
)
def get_ranked_candidates(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only recruiters can access candidate rankings.
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters can access candidate rankings.",
        )

    # Verify that the job belongs to this recruiter.
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    # Retrieve match records for this job.
    matches = (
        db.query(JobMatch)
        .filter(JobMatch.job_id == job_id)
        .all()
    )

    # Highest score first. This ensures the first valid record
    # for each candidate is their highest-scoring match.
    matches.sort(
        key=numeric_score,
        reverse=True,
    )

    candidates = []

    # IMPORTANT:
    # Store candidate IDs, NOT (candidate ID, resume ID).
    # A candidate with multiple resumes will appear only once.
    seen_candidate_ids = set()

    for match in matches:
        # Find the resume associated with this match.
        resume = (
            db.query(Resume)
            .filter(Resume.id == match.resume_id)
            .first()
        )

        if resume is None:
            continue

        # Find the candidate associated with this match.
        candidate = (
            db.query(User)
            .filter(
                User.id == match.user_id,
                User.role == "candidate",
            )
            .first()
        )

        if candidate is None:
            continue

        # FIX: skip this candidate if already included.
        if candidate.id in seen_candidate_ids:
            continue

        # Mark the candidate only after finding valid records.
        seen_candidate_ids.add(candidate.id)

        # Safely normalize the scores.
        match_score = safe_percentage(match.match_score)
        experience_match = safe_percentage(
            match.experience_match
        )

        # Build the existing response schema.
        candidate_result = RecruiterCandidateResponse(
            candidate_id=candidate.id,
            full_name=candidate.full_name or "Candidate",
            email=candidate.email or "",
            resume_id=resume.id,
            resume_filename=resume.original_filename or "",
            job_id=job.id,
            job_title=job.job_title or "",
            company_name=job.company_name or "",
            match_score=match_score,
            experience_match=experience_match,
            matched_skills=match.matched_skills or "",
            missing_skills=match.missing_skills or "",
            matched_keywords=match.matched_keywords or "",
            missing_keywords=match.missing_keywords or "",
            summary=match.summary or "",
            recommendations=match.recommendations or "",
            matched_at=match.created_at,
        )

        candidates.append(candidate_result)

    # Keep the final response sorted by highest match score.
    candidates.sort(
        key=lambda candidate: float(
            candidate.match_score or 0
        ),
        reverse=True,
    )

    return RecruiterCandidateListResponse(
        job_id=job.id,
        job_title=job.job_title or "",
        company_name=job.company_name or "",
        total_candidates=len(candidates),
        candidates=candidates,
    )
