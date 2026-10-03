from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.resume import Resume
from app.models.user import User

from app.schemas.skill_gap import (
    SkillGapRequest,
    SkillGapResponse,
)

from app.services.skill_gap_service import (
    analyze_skill_gap,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/career-intelligence",
    tags=["Career Intelligence"],
)


# ============================================================
# SKILL GAP ANALYSIS
# ============================================================

@router.post(
    "/skill-gap",
    response_model=SkillGapResponse,
)
def skill_gap_analysis(
    request: SkillGapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # FIND RESUME
    # --------------------------------------------------------

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == request.resume_id,
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
    # CHECK RESUME TEXT
    # --------------------------------------------------------

    if not resume.extracted_text:

        raise HTTPException(
            status_code=400,
            detail=(
                "Resume does not contain "
                "extracted text."
            ),
        )

    # --------------------------------------------------------
    # VALIDATE JOB DESCRIPTION
    # --------------------------------------------------------

    job_description = (
        request.job_description.strip()
    )

    if len(job_description) < 20:

        raise HTTPException(
            status_code=400,
            detail=(
                "Job description must contain "
                "at least 20 characters."
            ),
        )

    # --------------------------------------------------------
    # RUN ANALYSIS
    # --------------------------------------------------------

    try:

        result = analyze_skill_gap(
            resume_text=resume.extracted_text,
            job_description=job_description,
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Skill gap analysis failed: "
                f"{error}"
            ),
        )

    # --------------------------------------------------------
    # RETURN RESULT
    # --------------------------------------------------------

    return {
        "resume_id": resume.id,

        "job_title": request.job_title,

        "match_score": result[
            "match_score"
        ],

        "matched_skills": result[
            "matched_skills"
        ],

        "missing_skills": result[
            "missing_skills"
        ],

        "strengths": result[
            "strengths"
        ],

        "skill_gaps": result[
            "skill_gaps"
        ],

        "recommendations": result[
            "recommendations"
        ],

        "project_recommendations": result[
            "project_recommendations"
        ],

        "summary": result[
            "summary"
        ],
    }