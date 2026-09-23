from statistics import mean

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
    prefix="/dashboard",
    tags=["Candidate Dashboard"],
)


# ============================================================
# CANDIDATE DASHBOARD
# ============================================================

@router.get("/candidate")
def get_candidate_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # ========================================================
    # GET USER
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
    # GET RESUMES
    # ========================================================

    resumes = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user.id
        )
        .order_by(
            Resume.uploaded_at.desc()
        )
        .all()
    )

    # ========================================================
    # GET RESUME ANALYSES
    # ========================================================

    resume_data = []

    resume_scores = []

    for resume in resumes:

        analysis = (
            db.query(ResumeAnalysis)
            .filter(
                ResumeAnalysis.resume_id == resume.id,
                ResumeAnalysis.user_id == current_user.id,
            )
            .order_by(
                ResumeAnalysis.analyzed_at.desc()
            )
            .first()
        )

        if analysis and analysis.resume_score is not None:
            resume_scores.append(
                float(analysis.resume_score)
            )

        resume_data.append(
            {
                "resume_id": resume.id,

                "filename": (
                    resume.original_filename
                ),

                "file_type": (
                    resume.file_type
                ),

                "uploaded_at": (
                    resume.uploaded_at
                ),

                "analysis": (
                    {
                        "score": analysis.resume_score,
                        "skills": analysis.skills,
                        "education": analysis.education,
                        "experience": analysis.experience,
                        "projects": analysis.projects,
                        "certifications": analysis.certifications,
                        "keywords": analysis.keywords,
                        "summary": analysis.summary,
                        "strengths": analysis.strengths,
                        "weaknesses": analysis.weaknesses,
                        "recommendations": analysis.recommendations,
                    }
                    if analysis
                    else None
                ),
            }
        )

    # ========================================================
    # GET JOBS
    # ========================================================

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

    job_data = []

    for job in jobs:

        job_data.append(
            {
                "job_id": job.id,

                "job_title": job.job_title,

                "company_name": job.company_name,

                "location": job.location,

                "job_type": job.job_type,

                "required_skills": (
                    job.required_skills
                ),

                "experience_required": (
                    job.experience_required
                ),

                "created_at": job.created_at,
            }
        )

    # ========================================================
    # GET JOB MATCHES
    # ========================================================

    matches = (
        db.query(JobMatch)
        .filter(
            JobMatch.user_id == current_user.id
        )
        .order_by(
            JobMatch.created_at.desc()
        )
        .all()
    )

    match_data = []

    match_scores = []

    experience_scores = []

    for match in matches:

        if match.match_score is not None:
            match_scores.append(
                float(match.match_score)
            )

        if match.experience_match is not None:
            experience_scores.append(
                float(match.experience_match)
            )

        job = (
            db.query(Job)
            .filter(
                Job.id == match.job_id
            )
            .first()
        )

        resume = (
            db.query(Resume)
            .filter(
                Resume.id == match.resume_id
            )
            .first()
        )

        match_data.append(
            {
                "match_id": match.id,

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

                "match_score": (
                    match.match_score
                ),

                "experience_match": (
                    match.experience_match
                ),

                "matched_skills": (
                    match.matched_skills
                ),

                "missing_skills": (
                    match.missing_skills
                ),

                "matched_keywords": (
                    match.matched_keywords
                ),

                "missing_keywords": (
                    match.missing_keywords
                ),

                "summary": match.summary,

                "recommendations": (
                    match.recommendations
                ),

                "created_at": match.created_at,
            }
        )

    # ========================================================
    # DASHBOARD COUNTS
    # ========================================================

    total_resumes = len(resumes)

    total_jobs = len(jobs)

    total_matches = len(matches)

    analyzed_resumes = sum(
        1
        for data in resume_data
        if data["analysis"] is not None
    )

    # ========================================================
    # STATISTICS
    # ========================================================

    average_resume_score = (
        round(
            mean(resume_scores),
            2
        )
        if resume_scores
        else 0
    )

    average_match_score = (
        round(
            mean(match_scores),
            2
        )
        if match_scores
        else 0
    )

    average_experience_match = (
        round(
            mean(experience_scores),
            2
        )
        if experience_scores
        else 0
    )

    best_match_score = (
        round(
            max(match_scores),
            2
        )
        if match_scores
        else 0
    )

    # ========================================================
    # BEST MATCH
    # ========================================================

    best_match = None

    if matches:

        best_match_record = max(
            matches,
            key=lambda item: (
                item.match_score
                if item.match_score is not None
                else 0
            ),
        )

        best_job = (
            db.query(Job)
            .filter(
                Job.id == best_match_record.job_id
            )
            .first()
        )

        best_match = {
            "match_id": (
                best_match_record.id
            ),

            "resume_id": (
                best_match_record.resume_id
            ),

            "job_id": (
                best_match_record.job_id
            ),

            "job_title": (
                best_job.job_title
                if best_job
                else None
            ),

            "company_name": (
                best_job.company_name
                if best_job
                else None
            ),

            "match_score": (
                best_match_record.match_score
            ),

            "experience_match": (
                best_match_record.experience_match
            ),
        }

    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {

        "candidate": {

            "id": user.id,

            "full_name": user.full_name,

            "email": user.email,

            "role": user.role,
        },

        "summary": {

            "total_resumes": total_resumes,

            "analyzed_resumes": analyzed_resumes,

            "total_jobs": total_jobs,

            "total_matches": total_matches,

            "average_resume_score": (
                average_resume_score
            ),

            "average_match_score": (
                average_match_score
            ),

            "best_match_score": (
                best_match_score
            ),

            "average_experience_match": (
                average_experience_match
            ),
        },

        "best_match": best_match,

        "resumes": resume_data,

        "jobs": job_data,

        "matches": match_data,
    }