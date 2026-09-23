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

from app.schemas.job import (
    JobCreateRequest,
    JobResponse,
)

from app.services.job_service import (
    create_job,
    get_user_jobs,
    get_job_by_id,
)


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"],
)


# ============================================================
# CREATE JOB
# ============================================================

@router.post(
    "",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job_endpoint(
    job_data: JobCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    job = create_job(
        db=db,
        user_id=current_user.id,
        job_title=job_data.job_title,
        company_name=job_data.company_name,
        location=job_data.location,
        job_type=job_data.job_type,
        description=job_data.description,
        required_skills=job_data.required_skills,
        experience_required=job_data.experience_required,
    )

    return job


# ============================================================
# GET MY JOBS
# ============================================================

@router.get(
    "/my-jobs",
    response_model=list[JobResponse],
)
def get_my_jobs_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    jobs = get_user_jobs(
        db=db,
        user_id=current_user.id,
    )

    return jobs


# ============================================================
# GET JOB BY ID
# ============================================================

@router.get(
    "/{job_id}",
    response_model=JobResponse,
)
def get_job_endpoint(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    job = get_job_by_id(
        db=db,
        job_id=job_id,
        user_id=current_user.id,
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found.",
        )

    return job