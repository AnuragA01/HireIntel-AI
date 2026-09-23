from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.resume import Resume
from app.models.resume_analysis import ResumeAnalysis
from app.models.job import Job
from app.models.job_match import JobMatch

from app.schemas.candidate import (
    CandidateProfileResponse,
    CandidateResumeResponse,
    CandidateResumeAnalysisResponse,
    CandidateJobMatchResponse,
    CandidateDetailsResponse,
)


router = APIRouter(
    prefix="/candidate",
    tags=["Candidate Details"],
)


@router.get(
    "/{candidate_id}/job/{job_id}",
    response_model=CandidateDetailsResponse,
)
def get_candidate_details(
    candidate_id: int,
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # --------------------------------------------------------
    # Only recruiters can access candidate details
    # --------------------------------------------------------

    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can access candidate details.",
        )

    # --------------------------------------------------------
    # Verify that the job belongs to the recruiter
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
            status_code=404,
            detail="Job not found.",
        )

    # --------------------------------------------------------
    # Find candidate
    # --------------------------------------------------------

    candidate = (
        db.query(User)
        .filter(
            User.id == candidate_id,
            User.role == "candidate",
        )
        .first()
    )

    if candidate is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found.",
        )

    # --------------------------------------------------------
    # Find candidate's resume used for this job match
    # --------------------------------------------------------

    job_match = (
        db.query(JobMatch)
        .filter(
            JobMatch.job_id == job_id,
            JobMatch.user_id == candidate_id,
        )
        .order_by(JobMatch.created_at.desc())
        .first()
    )

    if job_match is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate has not been matched with this job.",
        )

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == job_match.resume_id,
            Resume.user_id == candidate_id,
        )
        .first()
    )

    if resume is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate resume not found.",
        )

    # --------------------------------------------------------
    # Find resume analysis
    # --------------------------------------------------------

    analysis = (
        db.query(ResumeAnalysis)
        .filter(
            ResumeAnalysis.resume_id == resume.id,
            ResumeAnalysis.user_id == candidate_id,
        )
        .order_by(ResumeAnalysis.analyzed_at.desc())
        .first()
    )

    # --------------------------------------------------------
    # Candidate profile
    # --------------------------------------------------------

    candidate_profile = CandidateProfileResponse(
        candidate_id=candidate.id,
        full_name=candidate.full_name,
        email=candidate.email,
        role=candidate.role,
    )

    # --------------------------------------------------------
    # Resume information
    # --------------------------------------------------------

    resume_response = CandidateResumeResponse(
        resume_id=resume.id,
        filename=resume.original_filename,
        file_type=resume.file_type,
        uploaded_at=resume.uploaded_at,
        resume_score=analysis.resume_score if analysis else None,
    )

    # --------------------------------------------------------
    # Resume analysis
    # --------------------------------------------------------

    analysis_response = None

    if analysis:
        analysis_response = CandidateResumeAnalysisResponse(
            skills=analysis.skills,
            education=analysis.education,
            experience=analysis.experience,
            projects=analysis.projects,
            certifications=analysis.certifications,
            keywords=analysis.keywords,
            summary=analysis.summary,
            strengths=analysis.strengths,
            weaknesses=analysis.weaknesses,
            recommendations=analysis.recommendations,
        )

    # --------------------------------------------------------
    # Job match information
    # --------------------------------------------------------

    job_match_response = CandidateJobMatchResponse(
        match_id=job_match.id,
        job_id=job.id,
        job_title=job.job_title,
        company_name=job.company_name,
        match_score=job_match.match_score or 0,
        experience_match=job_match.experience_match or 0,
        matched_skills=job_match.matched_skills,
        missing_skills=job_match.missing_skills,
        matched_keywords=job_match.matched_keywords,
        missing_keywords=job_match.missing_keywords,
        summary=job_match.summary,
        recommendations=job_match.recommendations,
        matched_at=job_match.created_at,
    )

    # --------------------------------------------------------
    # Final response
    # --------------------------------------------------------

    return CandidateDetailsResponse(
        candidate=candidate_profile,
        resume=resume_response,
        analysis=analysis_response,
        job_match=job_match_response,
    )