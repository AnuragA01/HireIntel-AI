from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.job import Job


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def normalize_text(value):
    """
    Normalize text for duplicate comparison.
    """
    if value is None:
        return ""

    return " ".join(
        str(value).strip().lower().split()
    )


def normalize_skills(value):
    """
    Normalize comma-separated skills.

    Skill order does not matter.

    Example:

        Python, SQL, FastAPI

    and:

        FastAPI, Python, SQL

    become the same normalized value.
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

def create_job(
    db: Session,
    user_id: int,
    job_title: str,
    company_name: str | None,
    location: str | None,
    job_type: str | None,
    description: str,
    required_skills: str | None,
    experience_required: str | None,
):

    # --------------------------------------------------------
    # Normalize new job data
    # --------------------------------------------------------

    new_job_title = normalize_text(
        job_title
    )

    new_company_name = normalize_text(
        company_name
    )

    new_location = normalize_text(
        location
    )

    new_job_type = normalize_text(
        job_type
    )

    new_experience = normalize_text(
        experience_required
    )

    new_skills = normalize_skills(
        required_skills
    )

    # --------------------------------------------------------
    # Check existing jobs created by this user
    # --------------------------------------------------------

    existing_jobs = (
        db.query(Job)
        .filter(
            Job.user_id == user_id
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
        # Duplicate found
        #
        # Description is intentionally ignored.
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
        user_id=user_id,
        job_title=job_title,
        company_name=company_name,
        location=location,
        job_type=job_type,
        description=description,
        required_skills=required_skills,
        experience_required=experience_required,
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
# GET USER JOBS
# ============================================================

def get_user_jobs(
    db: Session,
    user_id: int,
):
    return (
        db.query(Job)
        .filter(
            Job.user_id == user_id
        )
        .order_by(
            Job.created_at.desc()
        )
        .all()
    )


# ============================================================
# GET JOB BY ID
# ============================================================

def get_job_by_id(
    db: Session,
    job_id: int,
    user_id: int,
):
    return (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == user_id,
        )
        .first()
    )