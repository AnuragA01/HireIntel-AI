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
# ANALYZE / RE-ANALYZE RESUME
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
    # FIND RESUME
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
    # CHECK EXTRACTED TEXT
    # --------------------------------------------------------

    if not resume.extracted_text:

        raise HTTPException(
            status_code=400,
            detail="Resume does not contain extracted text.",
        )

    # --------------------------------------------------------
    # RUN ANALYSIS
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
    # CONVERT LISTS TO TEXT
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
    # CHECK FOR EXISTING ANALYSIS
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # CREATE NEW ANALYSIS
    # --------------------------------------------------------

    if analysis is None:

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

    # --------------------------------------------------------
    # UPDATE EXISTING ANALYSIS
    # --------------------------------------------------------

    else:

        analysis.skills = skills_text

        analysis.education = (
            analysis_result["education"]
        )

        analysis.experience = (
            analysis_result["experience"]
        )

        analysis.projects = (
            analysis_result["projects"]
        )

        analysis.certifications = (
            analysis_result["certifications"]
        )

        analysis.keywords = keywords_text

        analysis.summary = (
            analysis_result["summary"]
        )

        analysis.strengths = strengths_text

        analysis.weaknesses = weaknesses_text

        analysis.recommendations = (
            recommendations_text
        )

        analysis.resume_score = (
            analysis_result["resume_score"]
        )

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    db.commit()

    db.refresh(analysis)

    return analysis


# ============================================================
# GET RESUME ANALYSIS
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