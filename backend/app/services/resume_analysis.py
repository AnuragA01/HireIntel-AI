from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.resume import Resume
from app.models.resume_analysis import ResumeAnalysis
from app.models.user import User

from app.schemas.resume_analysis import ResumeAnalysisResponse

from app.services.resume_analysis_service import analyze_resume


router = APIRouter(
    prefix="/resume-analysis",
    tags=["Resume Analysis"],
)


# ============================================================
# ANALYZE RESUME
# ============================================================

@router.post(
    "/{resume_id}",
    response_model=ResumeAnalysisResponse,
    status_code=status.HTTP_201_CREATED,
)
def analyze_resume_endpoint(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # Find resume belonging to current user
    # --------------------------------------------------------

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if resume is None:

        raise HTTPException(
            status_code=404,
            detail="Resume not found.",
        )

    # --------------------------------------------------------
    # Check extracted text
    # --------------------------------------------------------

    if not resume.extracted_text:

        raise HTTPException(
            status_code=400,
            detail="Resume does not contain extracted text.",
        )

    # --------------------------------------------------------
    # Run resume analysis
    # --------------------------------------------------------

    try:

        analysis_result = analyze_resume(
            resume.extracted_text
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Resume analysis failed: {error}",
        )

    # --------------------------------------------------------
    # Convert lists into database-friendly text
    # --------------------------------------------------------

    skills_text = ", ".join(
        analysis_result["skills"]
    )

    keywords_text = ", ".join(
        analysis_result["keywords"]
    )

    strengths_text = "\n".join(
        analysis_result["strengths"]
    )

    weaknesses_text = "\n".join(
        analysis_result["weaknesses"]
    )

    recommendations_text = "\n".join(
        analysis_result["recommendations"]
    )

    # --------------------------------------------------------
    # Create analysis record
    # --------------------------------------------------------

    analysis = ResumeAnalysis(
        resume_id=resume.id,
        user_id=current_user.id,

        skills=skills_text,

        education=analysis_result["education"],

        experience=analysis_result["experience"],

        projects=analysis_result["projects"],

        certifications=analysis_result["certifications"],

        keywords=keywords_text,

        summary=analysis_result["summary"],

        strengths=strengths_text,

        weaknesses=weaknesses_text,

        recommendations=recommendations_text,

        resume_score=analysis_result["resume_score"],
    )

    db.add(analysis)

    db.commit()

    db.refresh(analysis)

    return analysis


# ============================================================
# GET MY RESUME ANALYSIS
# ============================================================

@router.get(
    "/{resume_id}",
    response_model=ResumeAnalysisResponse,
)
def get_resume_analysis(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    analysis = (
        db.query(ResumeAnalysis)
        .filter(
            ResumeAnalysis.resume_id == resume_id,
            ResumeAnalysis.user_id == current_user.id,
        )
        .order_by(
            ResumeAnalysis.analyzed_at.desc()
        )
        .first()
    )

    if analysis is None:

        raise HTTPException(
            status_code=404,
            detail="Resume analysis not found.",
        )

    return analysis 