from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.application import Application
from app.models.job import Job
from app.models.resume import Resume
from app.models.job_match import JobMatch
from app.models.user import User

from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


# ============================================================
# ALLOWED APPLICATION STATUSES
# ============================================================

ALLOWED_STATUSES = {
    "Applied",
    "Shortlisted",
    "Interview",
    "Rejected",
    "Hired",
}


# ============================================================
# ROLE CHECKS
# ============================================================

def require_recruiter(current_user: User):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter access required.",
        )


def require_candidate(current_user: User):
    if current_user.role != "candidate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Candidate access required.",
        )


# ============================================================
# JOB OWNERSHIP CHECK
#
# Your Job model uses:
#
#     Job.user_id
#
# NOT:
#
#     Job.recruiter_id
# ============================================================

def get_recruiter_job(
    job_id: int,
    current_user: User,
    db: Session,
):
    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    if job.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to access this job.",
        )

    return job


# ============================================================
# 1. APPLY FOR JOB
# ============================================================

@router.post(
    "/job/{job_id}",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def apply_for_job(
    job_id: int,
    application_data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # --------------------------------------------------------
    # Candidate only
    # --------------------------------------------------------

    require_candidate(current_user)

    # --------------------------------------------------------
    # Find job
    # --------------------------------------------------------

    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    # --------------------------------------------------------
    # Find resume
    # --------------------------------------------------------

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == application_data.resume_id
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    # --------------------------------------------------------
    # Make sure resume belongs to candidate
    # --------------------------------------------------------

    if resume.candidate_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only apply using your own resume.",
        )

    # --------------------------------------------------------
    # Prevent duplicate application
    # --------------------------------------------------------

    existing_application = (
        db.query(Application)
        .filter(
            Application.candidate_id == current_user.id,
            Application.job_id == job_id,
        )
        .first()
    )

    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied for this job.",
        )

    # --------------------------------------------------------
    # Find latest AI job match
    # --------------------------------------------------------

    match_score = None

    job_match = (
        db.query(JobMatch)
        .filter(
            JobMatch.candidate_id == current_user.id,
            JobMatch.resume_id == application_data.resume_id,
            JobMatch.job_id == job_id,
        )
        .order_by(JobMatch.id.desc())
        .first()
    )

    if job_match and job_match.match_score is not None:

        # Keep the AI score as provided by the match system.
        match_score = float(job_match.match_score)

    # --------------------------------------------------------
    # Create application
    # --------------------------------------------------------

    application = Application(
        candidate_id=current_user.id,
        resume_id=application_data.resume_id,
        job_id=job_id,
        status="Applied",
        cover_letter=application_data.cover_letter,
        match_score=match_score,
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return application


# ============================================================
# 2. GET MY APPLICATIONS
# ============================================================

@router.get(
    "/my-applications",
    response_model=List[ApplicationResponse],
)
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    require_candidate(current_user)

    applications = (
        db.query(Application)
        .filter(
            Application.candidate_id == current_user.id
        )
        .order_by(
            Application.applied_at.desc()
        )
        .all()
    )

    return applications


# ============================================================
# 3. GET SINGLE APPLICATION
# ============================================================

@router.get(
    "/{application_id}",
    response_model=ApplicationResponse,
)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    application = (
        db.query(Application)
        .filter(
            Application.id == application_id
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        )

    # --------------------------------------------------------
    # Candidate
    # --------------------------------------------------------

    if current_user.role == "candidate":

        if application.candidate_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to view this application.",
            )

    # --------------------------------------------------------
    # Recruiter
    # --------------------------------------------------------

    elif current_user.role == "recruiter":

        job = (
            db.query(Job)
            .filter(
                Job.id == application.job_id
            )
            .first()
        )

        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found.",
            )

        # IMPORTANT:
        # Job uses user_id, not recruiter_id.

        if job.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to view this application.",
            )

    else:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to view this application.",
        )

    return application


# ============================================================
# 4. GET APPLICATIONS FOR RECRUITER JOB
# ============================================================

@router.get(
    "/job/{job_id}",
    response_model=List[ApplicationResponse],
)
def get_job_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # --------------------------------------------------------
    # Recruiter only
    # --------------------------------------------------------

    require_recruiter(current_user)

    # --------------------------------------------------------
    # Find job AND verify ownership
    # --------------------------------------------------------

    job = get_recruiter_job(
        job_id=job_id,
        current_user=current_user,
        db=db,
    )

    # --------------------------------------------------------
    # Get applications
    # --------------------------------------------------------

    applications = (
        db.query(Application)
        .filter(
            Application.job_id == job.id
        )
        .order_by(
            Application.applied_at.desc()
        )
        .all()
    )

    return applications


# ============================================================
# 5. GET ALL APPLICATIONS FOR RECRUITER
# ============================================================

@router.get(
    "/recruiter/all",
    response_model=List[ApplicationResponse],
)
def get_all_recruiter_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    require_recruiter(current_user)

    # --------------------------------------------------------
    # Get jobs belonging to this recruiter
    #
    # Job.user_id = current_user.id
    # --------------------------------------------------------

    recruiter_jobs = (
        db.query(Job.id)
        .filter(
            Job.user_id == current_user.id
        )
        .all()
    )

    job_ids = [
        job_id
        for (job_id,) in recruiter_jobs
    ]

    if not job_ids:
        return []

    # --------------------------------------------------------
    # Get applications for recruiter's jobs
    # --------------------------------------------------------

    applications = (
        db.query(Application)
        .filter(
            Application.job_id.in_(job_ids)
        )
        .order_by(
            Application.applied_at.desc()
        )
        .all()
    )

    return applications


# ============================================================
# 6. UPDATE APPLICATION STATUS
# ============================================================

@router.put(
    "/{application_id}/status",
    response_model=ApplicationResponse,
)
def update_application_status(
    application_id: int,
    status_data: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # --------------------------------------------------------
    # Recruiter only
    # --------------------------------------------------------

    require_recruiter(current_user)

    # --------------------------------------------------------
    # Validate status
    # --------------------------------------------------------

    new_status = status_data.status.strip()

    if new_status not in ALLOWED_STATUSES:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid application status. "
                "Allowed statuses: "
                "Applied, Shortlisted, Interview, "
                "Rejected, Hired."
            ),
        )

    # --------------------------------------------------------
    # Find application
    # --------------------------------------------------------

    application = (
        db.query(Application)
        .filter(
            Application.id == application_id
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        )

    # --------------------------------------------------------
    # Find job
    # --------------------------------------------------------

    job = (
        db.query(Job)
        .filter(
            Job.id == application.job_id
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    # --------------------------------------------------------
    # Verify recruiter owns the job
    #
    # IMPORTANT:
    # Job.user_id, NOT Job.recruiter_id
    # --------------------------------------------------------

    if job.user_id != current_user.id:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to update this application.",
        )

    # --------------------------------------------------------
    # Update status
    # --------------------------------------------------------

    application.status = new_status

    if status_data.recruiter_notes is not None:
        application.recruiter_notes = (
            status_data.recruiter_notes
        )

    db.commit()
    db.refresh(application)

    return application