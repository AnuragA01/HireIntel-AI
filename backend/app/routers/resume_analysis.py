from datetime import datetime

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

from app.services.resume_analysis_service import (
    analyze_resume,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/resume-analysis",
    tags=["Resume Analysis"],
)


# ============================================================
# HELPER
# ============================================================

def convert_to_text(value):
    """
    Convert analysis values into database-friendly text.

    Supports:
    - list
    - string
    - None
    """

    if value is None:
        return ""

    if isinstance(value, list):
        return "\n".join(
            str(item).strip()
            for item in value
            if str(item).strip()
        )

    return str(value).strip()


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
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    # ========================================================
    # FIND RESUME
    # ========================================================

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

    # ========================================================
    # CHECK EXTRACTED TEXT
    # ========================================================

    if not resume.extracted_text:
        raise HTTPException(
            status_code=400,
            detail=(
                "Resume does not contain "
                "extracted text."
            ),
        )

    # ========================================================
    # RUN AI ANALYSIS
    # ========================================================

    try:

        analysis_result = analyze_resume(
            resume.extracted_text
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Resume analysis failed: {error}"
            ),
        )

    # ========================================================
    # CONVERT ANALYSIS DATA
    # ========================================================

    skills_text = convert_to_text(
        analysis_result.get("skills")
    )

    keywords_text = convert_to_text(
        analysis_result.get("keywords")
    )

    strengths_text = convert_to_text(
        analysis_result.get("strengths")
    )

    weaknesses_text = convert_to_text(
        analysis_result.get("weaknesses")
    )

    recommendations_text = convert_to_text(
        analysis_result.get("recommendations")
    )

    education_text = convert_to_text(
        analysis_result.get("education")
    )

    experience_text = convert_to_text(
        analysis_result.get("experience")
    )

    projects_text = convert_to_text(
        analysis_result.get("projects")
    )

    certifications_text = convert_to_text(
        analysis_result.get("certifications")
    )

    summary_text = convert_to_text(
        analysis_result.get("summary")
    )

    # ========================================================
    # GET EXISTING ANALYSIS
    # ========================================================

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

    # ========================================================
    # CREATE NEW ANALYSIS
    # ========================================================

    if analysis is None:

        analysis = ResumeAnalysis(
            resume_id=resume.id,

            user_id=current_user.id,

            skills=skills_text,

            education=education_text,

            experience=experience_text,

            projects=projects_text,

            certifications=certifications_text,

            keywords=keywords_text,

            summary=summary_text,

            strengths=strengths_text,

            weaknesses=weaknesses_text,

            recommendations=recommendations_text,

            resume_score=(
                analysis_result.get(
                    "resume_score"
                )
            ),

            analyzed_at=datetime.utcnow(),
        )

        db.add(analysis)

    # ========================================================
    # UPDATE EXISTING ANALYSIS
    # ========================================================

    else:

        analysis.skills = skills_text

        analysis.education = education_text

        analysis.experience = experience_text

        analysis.projects = projects_text

        analysis.certifications = (
            certifications_text
        )

        analysis.keywords = keywords_text

        analysis.summary = summary_text

        analysis.strengths = strengths_text

        analysis.weaknesses = weaknesses_text

        analysis.recommendations = (
            recommendations_text
        )

        analysis.resume_score = (
            analysis_result.get(
                "resume_score"
            )
        )

        # Update analysis timestamp
        analysis.analyzed_at = datetime.utcnow()

    # ========================================================
    # SAVE
    # ========================================================

    try:

        db.commit()

        db.refresh(analysis)

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Could not save resume analysis: "
                f"{error}"
            ),
        )

    # ========================================================
    # RETURN
    # ========================================================

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
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    # ========================================================
    # FIRST VERIFY RESUME BELONGS TO USER
    # ========================================================

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

    # ========================================================
    # GET LATEST ANALYSIS
    # ========================================================

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

    # ========================================================
    # RETURN ANALYSIS
    # ========================================================

    return analysis