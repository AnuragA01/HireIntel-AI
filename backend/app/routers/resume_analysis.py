
import logging
import math
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.resume import Resume
from app.models.resume_analysis import ResumeAnalysis
from app.models.user import User
from app.schemas.resume_analysis import ResumeAnalysisResponse
from app.services.resume_analysis_service import analyze_resume


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/resume-analysis",
    tags=["Resume Analysis"],
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def _to_text(value: Any, field_name: str) -> str:
    """Convert supported analysis values into database text."""

    if value is None:
        return ""

    if isinstance(value, str):
        return value.strip()

    if isinstance(value, (list, tuple, set)):
        return "\n".join(
            str(item).strip()
            for item in value
            if item is not None and str(item).strip()
        )

    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return str(value)

    raise ValueError(
        f"Invalid type for '{field_name}': "
        f"{type(value).__name__}"
    )


def _validate_analysis_result(result: Any) -> dict:
    """Validate the return value from the analysis service."""

    if not isinstance(result, dict):
        raise ValueError(
            "analyze_resume() must return a dictionary."
        )

    required_fields = (
        "skills",
        "education",
        "experience",
        "projects",
        "certifications",
        "keywords",
        "summary",
        "strengths",
        "weaknesses",
        "recommendations",
        "resume_score",
    )

    missing_fields = [
        field for field in required_fields
        if field not in result
    ]

    if missing_fields:
        raise ValueError(
            "Analysis service is missing fields: "
            + ", ".join(missing_fields)
        )

    score = result["resume_score"]

    if isinstance(score, bool):
        raise ValueError("resume_score cannot be a boolean.")

    try:
        score = float(score)
    except (TypeError, ValueError) as exc:
        raise ValueError(
            "resume_score must be numeric."
        ) from exc

    if not math.isfinite(score) or not 0 <= score <= 100:
        raise ValueError(
            "resume_score must be between 0 and 100."
        )

    validated = dict(result)
    validated["resume_score"] = score

    # Verify that every field can be normalized before saving.
    text_fields = (
        "skills",
        "education",
        "experience",
        "projects",
        "certifications",
        "keywords",
        "summary",
        "strengths",
        "weaknesses",
        "recommendations",
    )

    for field in text_fields:
        _to_text(validated[field], field)

    return validated


def _get_user_resume(
    resume_id: int,
    user_id: int,
    db: Session,
) -> Resume:
    """Retrieve a resume owned by the logged-in user."""

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == user_id,
        )
        .first()
    )

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found for the current user.",
        )

    return resume


# ============================================================
# POST: ANALYZE RESUME
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
    resume = _get_user_resume(
        resume_id=resume_id,
        user_id=current_user.id,
        db=db,
    )

    extracted_text = resume.extracted_text

    if not isinstance(extracted_text, str) or not extracted_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No extracted text was found for this resume. "
                "Check the upload and text-extraction process."
            ),
        )

    # Step 1: Analyze and validate the extracted text.
    try:
        result = analyze_resume(extracted_text)
        result = _validate_analysis_result(result)

    except Exception as exc:
        logger.exception(
            "Resume analysis service failed: resume_id=%s, user_id=%s",
            resume_id,
            current_user.id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Resume analysis service failed "
                f"({type(exc).__name__}). "
                "Check the backend terminal for the traceback."
            ),
        ) from exc

    # Step 2: Create and save the database record.
    try:
        analysis = ResumeAnalysis(
            resume_id=resume.id,
            user_id=current_user.id,
            skills=_to_text(result["skills"], "skills"),
            education=_to_text(result["education"], "education"),
            experience=_to_text(result["experience"], "experience"),
            projects=_to_text(result["projects"], "projects"),
            certifications=_to_text(
                result["certifications"], "certifications"
            ),
            keywords=_to_text(result["keywords"], "keywords"),
            summary=_to_text(result["summary"], "summary"),
            strengths=_to_text(result["strengths"], "strengths"),
            weaknesses=_to_text(result["weaknesses"], "weaknesses"),
            recommendations=_to_text(
                result["recommendations"], "recommendations"
            ),
            resume_score=result["resume_score"],
        )

        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        logger.info(
            "Resume analysis saved: resume_id=%s, analysis_id=%s, score=%s",
            resume.id,
            analysis.id,
            analysis.resume_score,
        )

        return analysis

    except SQLAlchemyError as exc:
        db.rollback()

        logger.exception(
            "Database error saving resume analysis: resume_id=%s",
            resume_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Database error while saving resume analysis. "
                "See the backend terminal for details."
            ),
        ) from exc

    except Exception as exc:
        db.rollback()

        logger.exception(
            "Unexpected error saving resume analysis: resume_id=%s",
            resume_id,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unexpected error while saving resume analysis "
                f"({type(exc).__name__}). "
                "See the backend terminal for details."
            ),
        ) from exc


# ============================================================
# GET: LATEST RESUME ANALYSIS
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
    # Confirm ownership before returning saved analysis.
    _get_user_resume(
        resume_id=resume_id,
        user_id=current_user.id,
        db=db,
    )

    analysis = (
        db.query(ResumeAnalysis)
        .filter(
            ResumeAnalysis.resume_id == resume_id,
            ResumeAnalysis.user_id == current_user.id,
        )
        .order_by(
            ResumeAnalysis.analyzed_at.desc(),
            ResumeAnalysis.id.desc(),
        )
        .first()
    )

    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "No analysis exists for this resume. "
                "Run resume analysis first."
            ),
        )

    return analysis
