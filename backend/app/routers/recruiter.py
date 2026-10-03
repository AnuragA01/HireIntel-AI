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
    """
    Normalize normal text for duplicate comparison.

    Examples:

        "Python Developer"
        "python developer"
        "  Python Developer  "

    all become:

        "python developer"
    """
    if value is None:
        return ""

    return " ".join(
        str(value).strip().lower().split()
    )


def normalize_skills(value):
    """
    Normalize comma-separated skills.

    Example:

        Python, SQL, FastAPI

    and:

        FastAPI, Python, SQL

    are treated as the same skill set.
    """
    if not value:
        return ""

    skills = [
        skill.strip().lower()
        for skill in str(value).split(",")
        if skill.strip()
    ]

    return ", ".join(
        sorted(set(skills))
    )


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

    # --------------------------------------------------------
    # Only recruiters can create jobs
    # --------------------------------------------------------

    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters can create jobs.",
        )

    # --------------------------------------------------------
    # Normalize new job data
    # --------------------------------------------------------

    new_job_title = normalize_text(
        job_data.job_title
    )

    new_company_name = normalize_text(
        job_data.company_name
    )

    new_location = normalize_text(
        job_data.location
    )

    new_job_type = normalize_text(
        job_data.job_type
    )

    new_experience = normalize_text(
        job_data.experience_required
    )

    new_skills = normalize_skills(
        job_data.required_skills
    )

    # --------------------------------------------------------
    # Check existing jobs created by this recruiter
    # --------------------------------------------------------

    existing_jobs = (
        db.query(Job)
        .filter(
            Job.user_id == current_user.id
        )
        .all()
    )

    for existing_job in existing_jobs:

        same_job_title = (
            normalize_text(existing_job.job_title)
            == new_job_title
        )

        same_company = (
            normalize_text(existing_job.company_name)
            == new_company_name
        )

        same_location = (
            normalize_text(existing_job.location)
            == new_location
        )

        same_job_type = (
            normalize_text(existing_job.job_type)
            == new_job_type
        )

        same_experience = (
            normalize_text(
                existing_job.experience_required
            )
            == new_experience
        )

        same_skills = (
            normalize_skills(
                existing_job.required_skills
            )
            == new_skills
        )

        # ----------------------------------------------------
        # Duplicate job found
        #
        # Description is intentionally NOT compared.
        # ----------------------------------------------------

        if (
            same_job_title
            and same_company
            and same_location
            and same_job_type
            and same_experience
            and same_skills
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A job with the same details already "
                    f"exists. Existing Job ID: {existing_job.id}"
                ),
            )

    # --------------------------------------------------------
    # Create new job
    # --------------------------------------------------------

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

    db.add(job)

    try:
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

    jobs = (
        db.query(Job)
        .filter(
            Job.user_id == current_user.id
        )
        .order_by(
            Job.created_at.desc()
        )
        .all()
    )

    return jobs


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

    update_data = job_data.model_dump(
        exclude_unset=True
    )

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

@router.delete(
    "/jobs/{job_id}",
)
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

    # --------------------------------------------------------
    # Delete job matches first
    # --------------------------------------------------------

    deleted_matches = (
        db.query(JobMatch)
        .filter(
            JobMatch.job_id == job.id
        )
        .delete(
            synchronize_session=False
        )
    )

    # --------------------------------------------------------
    # Delete job
    # --------------------------------------------------------

    db.delete(job)

    try:
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
# GET RANKED CANDIDATES
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

    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiters can access candidate rankings.",
        )

    # --------------------------------------------------------
    # Verify job belongs to recruiter
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Get matches sorted by highest score
    # --------------------------------------------------------

    matches = (
        db.query(JobMatch)
        .filter(
            JobMatch.job_id == job_id
        )
        .order_by(
            JobMatch.match_score.desc()
        )
        .all()
    )

    candidates = []

    for match in matches:

        # ----------------------------------------------------
        # Find resume
        # ----------------------------------------------------

        resume = (
            db.query(Resume)
            .filter(
                Resume.id == match.resume_id
            )
            .first()
        )

        if resume is None:
            continue

        # ----------------------------------------------------
        # Find candidate
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # Build candidate result
        # ----------------------------------------------------

        candidate_result = RecruiterCandidateResponse(
            candidate_id=candidate.id,
            full_name=candidate.full_name,
            email=candidate.email,
            resume_id=resume.id,
            resume_filename=resume.original_filename,
            job_id=job.id,
            job_title=job.job_title,
            company_name=job.company_name,
            match_score=match.match_score or 0,
            experience_match=match.experience_match or 0,
            matched_skills=match.matched_skills,
            missing_skills=match.missing_skills,
            matched_keywords=match.matched_keywords,
            missing_keywords=match.missing_keywords,
            summary=match.summary,
            recommendations=match.recommendations,
            matched_at=match.created_at,
        )

        candidates.append(
            candidate_result
        )

    # --------------------------------------------------------
    # Return ranked candidates
    # --------------------------------------------------------

    return RecruiterCandidateListResponse(
        job_id=job.id,
        job_title=job.job_title,
        company_name=job.company_name,
        total_candidates=len(candidates),
        candidates=candidates,
    )