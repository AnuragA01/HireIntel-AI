from math import ceil

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.job import Job

from app.schemas.candidate_job import (
    CandidateJobResponse,
    CandidateJobListResponse,
)


router = APIRouter(
    prefix="/candidate/jobs",
    tags=["Candidate Jobs"],
)


# ============================================================
# GET AVAILABLE JOBS
# SEARCH + FILTER + PAGINATION
# ============================================================

@router.get(
    "",
    response_model=CandidateJobListResponse,
)
def get_available_jobs(
    search: str | None = Query(
        default=None,
        description="Search by job title, company, description, or skills",
    ),

    location: str | None = Query(
        default=None,
        description="Filter jobs by location",
    ),

    job_type: str | None = Query(
        default=None,
        description="Filter by job type",
    ),

    skills: str | None = Query(
        default=None,
        description="Filter by required skills. Example: Python,FastAPI",
    ),

    experience: str | None = Query(
        default=None,
        description="Filter by experience requirement",
    ),

    page: int = Query(
        default=1,
        ge=1,
        description="Page number",
    ),

    limit: int = Query(
        default=10,
        ge=1,
        le=100,
        description="Number of jobs per page",
    ),

    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Candidate authorization
    # --------------------------------------------------------

    if current_user.role != "candidate":
        raise HTTPException(
            status_code=403,
            detail="Only candidates can access available jobs.",
        )

    # --------------------------------------------------------
    # Base query
    # --------------------------------------------------------

    query = (
        db.query(Job)
        .filter(
            Job.user_id != current_user.id
        )
    )

    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                Job.job_title.ilike(search_value),
                Job.company_name.ilike(search_value),
                Job.description.ilike(search_value),
                Job.required_skills.ilike(search_value),
            )
        )

    # --------------------------------------------------------
    # LOCATION
    # --------------------------------------------------------

    if location:
        location_value = f"%{location.strip()}%"

        query = query.filter(
            Job.location.ilike(location_value)
        )

    # --------------------------------------------------------
    # JOB TYPE
    # --------------------------------------------------------

    if job_type:
        job_type_value = f"%{job_type.strip()}%"

        query = query.filter(
            Job.job_type.ilike(job_type_value)
        )

    # --------------------------------------------------------
    # EXPERIENCE
    # --------------------------------------------------------

    if experience:
        experience_value = f"%{experience.strip()}%"

        query = query.filter(
            Job.experience_required.ilike(
                experience_value
            )
        )

    # --------------------------------------------------------
    # SKILLS
    #
    # Example:
    # skills=Python,FastAPI
    #
    # Both skills must exist.
    # --------------------------------------------------------

    if skills:

        requested_skills = [
            skill.strip()
            for skill in skills.split(",")
            if skill.strip()
        ]

        for skill in requested_skills:

            skill_value = f"%{skill}%"

            query = query.filter(
                Job.required_skills.ilike(
                    skill_value
                )
            )

    # --------------------------------------------------------
    # TOTAL COUNT BEFORE PAGINATION
    # --------------------------------------------------------

    total_jobs = query.count()

    # --------------------------------------------------------
    # TOTAL PAGES
    # --------------------------------------------------------

    total_pages = (
        ceil(total_jobs / limit)
        if total_jobs > 0
        else 0
    )

    # --------------------------------------------------------
    # OFFSET
    # --------------------------------------------------------

    offset = (page - 1) * limit

    # --------------------------------------------------------
    # GET CURRENT PAGE
    # --------------------------------------------------------

    jobs = (
        query
        .order_by(
            Job.created_at.desc()
        )
        .offset(offset)
        .limit(limit)
        .all()
    )

    # --------------------------------------------------------
    # RETURN PAGINATED RESPONSE
    # --------------------------------------------------------

    return {
        "total_jobs": total_jobs,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "jobs": jobs,
    }


# ============================================================
# GET SINGLE AVAILABLE JOB
# ============================================================

@router.get(
    "/{job_id}",
    response_model=CandidateJobResponse,
)
def get_available_job(
    job_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Candidate authorization
    # --------------------------------------------------------

    if current_user.role != "candidate":
        raise HTTPException(
            status_code=403,
            detail="Only candidates can access job details.",
        )

    # --------------------------------------------------------
    # Find recruiter-created job
    # --------------------------------------------------------

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id != current_user.id,
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found.",
        )

    return job