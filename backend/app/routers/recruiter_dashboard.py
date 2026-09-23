from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.job import Job
from app.models.job_match import JobMatch
from app.models.resume import Resume


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/dashboard",
    tags=["Recruiter Dashboard"],
)


# ============================================================
# RECRUITER DASHBOARD
# ============================================================

@router.get("/recruiter")
def recruiter_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # Check recruiter role
    # --------------------------------------------------------

    if current_user.role != "recruiter":

        raise HTTPException(
            status_code=403,
            detail="Recruiter access required.",
        )

    # --------------------------------------------------------
    # Get recruiter's jobs
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Job statistics
    # --------------------------------------------------------

    total_jobs = len(jobs)

    # --------------------------------------------------------
    # Get job IDs
    # --------------------------------------------------------

    job_ids = [
        job.id
        for job in jobs
    ]

    # --------------------------------------------------------
    # Get matches
    # --------------------------------------------------------

    matches = []

    if job_ids:

        matches = (
            db.query(JobMatch)
            .filter(
                JobMatch.job_id.in_(job_ids)
            )
            .order_by(
                JobMatch.match_score.desc()
            )
            .all()
        )

    # --------------------------------------------------------
    # Match statistics
    # --------------------------------------------------------

    total_matches = len(matches)

    high_matches = len(
        [
            match
            for match in matches
            if match.match_score >= 70
        ]
    )

    medium_matches = len(
        [
            match
            for match in matches
            if 50 <= match.match_score < 70
        ]
    )

    low_matches = len(
        [
            match
            for match in matches
            if match.match_score < 50
        ]
    )

    # --------------------------------------------------------
    # Unique candidates
    # --------------------------------------------------------

    candidate_ids = {
        match.user_id
        for match in matches
    }

    total_candidates = len(
        candidate_ids
    )

    # --------------------------------------------------------
    # Top matches
    # --------------------------------------------------------

    top_matches = []

    for match in matches[:10]:

        resume = (
            db.query(Resume)
            .filter(
                Resume.id == match.resume_id
            )
            .first()
        )

        candidate = (
            db.query(User)
            .filter(
                User.id == match.user_id
            )
            .first()
        )

        job = (
            db.query(Job)
            .filter(
                Job.id == match.job_id
            )
            .first()
        )

        top_matches.append(
            {
                "match_id": match.id,
                "candidate_id": (
                    candidate.id
                    if candidate
                    else None
                ),
                "candidate_name": (
                    candidate.full_name
                    if candidate
                    else None
                ),
                "candidate_email": (
                    candidate.email
                    if candidate
                    else None
                ),
                "resume_id": match.resume_id,
                "resume_filename": (
                    resume.original_filename
                    if resume
                    else None
                ),
                "job_id": match.job_id,
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
                "match_score": match.match_score,
                "experience_match": (
                    match.experience_match
                ),
                "matched_skills": (
                    match.matched_skills
                ),
                "missing_skills": (
                    match.missing_skills
                ),
            }
        )

    # --------------------------------------------------------
    # Jobs
    # --------------------------------------------------------

    jobs_data = []

    for job in jobs:

        job_matches = [
            match
            for match in matches
            if match.job_id == job.id
        ]

        average_score = 0

        if job_matches:

            average_score = round(
                sum(
                    match.match_score
                    for match in job_matches
                )
                / len(job_matches),
                2,
            )

        jobs_data.append(
            {
                "job_id": job.id,
                "job_title": job.job_title,
                "company_name": job.company_name,
                "location": job.location,
                "job_type": job.job_type,
                "experience_required": (
                    job.experience_required
                ),
                "total_matches": len(
                    job_matches
                ),
                "average_match_score": (
                    average_score
                ),
                "created_at": job.created_at,
            }
        )

    # --------------------------------------------------------
    # Final response
    # --------------------------------------------------------

    return {
        "recruiter": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role,
        },

        "statistics": {
            "total_jobs": total_jobs,
            "total_candidates": total_candidates,
            "total_matches": total_matches,
            "high_matches": high_matches,
            "medium_matches": medium_matches,
            "low_matches": low_matches,
        },

        "jobs": jobs_data,

        "top_matches": top_matches,
    }