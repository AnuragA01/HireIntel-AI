from sqlalchemy.orm import Session

from app.models.job import Job


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
    db.commit()
    db.refresh(job)

    return job


def get_user_jobs(
    db: Session,
    user_id: int,
):
    return (
        db.query(Job)
        .filter(Job.user_id == user_id)
        .order_by(Job.created_at.desc())
        .all()
    )


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