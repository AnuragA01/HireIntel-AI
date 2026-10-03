from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.resume import Resume
from app.models.user import User

from app.schemas.career_intelligence import (
    JobDescriptionMatchRequest,
    JobDescriptionMatchResponse,
)

from app.services.career_intelligence_service import (
    match_resume_with_job_description,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/career-intelligence",
    tags=["Career Intelligence"],
)


# ============================================================
# JOB DESCRIPTION MATCH
# ============================================================

@router.post(
    "/match-job-description",
    response_model=JobDescriptionMatchResponse,
)
def match_job_description(

    request: JobDescriptionMatchRequest,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),
):

    # ========================================================
    # FIND RESUME
    # ========================================================

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == request.resume_id,

            Resume.user_id ==
            current_user.id,
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
    # CLEAN JOB DESCRIPTION
    # ========================================================

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

    # ========================================================
    # RUN AI MATCHING
    # ========================================================

    try:

        result = (
            match_resume_with_job_description(
                resume_text=
                    resume.extracted_text,

                job_description=
                    job_description,
            )
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Job description matching failed: "
                f"{error}"
            ),
        )

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "resume_id":
            resume.id,

        "job_title":
            request.job_title,

        "match_score":
            result[
                "match_score"
            ],

        "match_label":
            result.get(
                "match_label"
            ),

        "matched_skills":
            result[
                "matched_skills"
            ],

        "missing_skills":
            result[
                "missing_skills"
            ],

        "matched_keywords":
            result[
                "matched_keywords"
            ],

        "missing_keywords":
            result[
                "missing_keywords"
            ],

        "experience_match":
            result[
                "experience_match"
            ],

        "summary":
            result[
                "summary"
            ],

        "recommendations":
            result[
                "recommendations"
            ],

        "score_breakdown":
            result.get(
                "score_breakdown",
                {},
            ),
    }