from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.resume import Resume
from app.models.job import Job
from app.models.job_match import JobMatch

from app.schemas.job_match import JobMatchResponse

from app.services.job_match_service import (
    match_resume_with_job,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/job-matches",
    tags=["Job Matching"],
)


# ============================================================
# ROLE CHECK
# ============================================================

def require_candidate(
    current_user: User,
):
    if current_user.role != "candidate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only candidates can create "
                "resume-job matches."
            ),
        )


# ============================================================
# TEXT HELPER
# ============================================================

def list_to_text(
    value,
):
    """
    Convert list data into database text.
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
# FIND RESUME
# ============================================================

def get_candidate_resume(
    db: Session,
    resume_id: int,
    current_user: User,
):
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    if not resume.extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Resume does not contain extracted text."
            ),
        )

    return resume


# ============================================================
# FIND JOB
# ============================================================

def get_job(
    db: Session,
    job_id: int,
):
    """
    Find a job.

    Candidates are allowed to match their resume
    against recruiter-created jobs.
    """

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    return job


# ============================================================
# RUN AI MATCHING
# ============================================================

def calculate_match(
    resume: Resume,
    job: Job,
):
    """
    Run the project's AI matching service.
    """

    job_description = (
        f"{job.description or ''} "
        f"{job.experience_required or ''}"
    ).strip()

    try:

        result = match_resume_with_job(
            resume_text=resume.extracted_text,
            job_description=job_description,
            required_skills_text=(
                job.required_skills
                or ""
            ),
        )

    except Exception as error:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                f"Job matching failed: {error}"
            ),
        )

    if not isinstance(
        result,
        dict,
    ):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "AI matching service returned "
                "an invalid response."
            ),
        )

    # --------------------------------------------------------
    # VALIDATE MATCH SCORE
    # --------------------------------------------------------

    score = result.get(
        "match_score"
    )

    if score is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "AI matching service did not "
                "return a match score."
            ),
        )

    try:

        score = float(
            score
        )

    except (
        TypeError,
        ValueError,
    ):

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "AI matching service returned "
                "an invalid match score."
            ),
        )

    # --------------------------------------------------------
    # KEEP SCORE BETWEEN 0 AND 100
    # --------------------------------------------------------

    score = max(
        0.0,
        min(
            score,
            100.0,
        ),
    )

    result["match_score"] = round(
        score,
        2,
    )

    return result


# ============================================================
# APPLY RESULT TO JOB MATCH
# ============================================================

def fill_job_match(
    job_match: JobMatch,
    result: dict,
):
    """
    Put AI matching result into JobMatch model.
    """

    job_match.match_score = round(
        float(
            result["match_score"]
        ),
        2,
    )

    job_match.matched_skills = (
        list_to_text(
            result.get(
                "matched_skills"
            )
        )
    )

    job_match.missing_skills = (
        list_to_text(
            result.get(
                "missing_skills"
            )
        )
    )

    job_match.matched_keywords = (
        list_to_text(
            result.get(
                "matched_keywords"
            )
        )
    )

    job_match.missing_keywords = (
        list_to_text(
            result.get(
                "missing_keywords"
            )
        )
    )

    job_match.experience_match = (
        result.get(
            "experience_match"
        )
    )

    job_match.summary = (
        result.get(
            "summary"
        )
        or ""
    )

    job_match.recommendations = (
        list_to_text(
            result.get(
                "recommendations"
            )
        )
    )

    return job_match


# ============================================================
# CREATE / UPDATE JOB MATCH
# ============================================================

@router.post(
    "/resume/{resume_id}/job/{job_id}",
    response_model=JobMatchResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job_match(
    resume_id: int,
    job_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    # ========================================================
    # CANDIDATE ONLY
    # ========================================================

    require_candidate(
        current_user
    )

    # ========================================================
    # FIND RESUME
    # ========================================================

    resume = get_candidate_resume(
        db=db,
        resume_id=resume_id,
        current_user=current_user,
    )

    # ========================================================
    # FIND JOB
    # ========================================================

    job = get_job(
        db=db,
        job_id=job_id,
    )

    # ========================================================
    # RUN AI MATCHING
    # ========================================================

    result = calculate_match(
        resume=resume,
        job=job,
    )

    # ========================================================
    # FIND EXISTING MATCH
    # ========================================================

    existing_match = (
        db.query(JobMatch)
        .filter(
            JobMatch.resume_id
            == resume_id,

            JobMatch.job_id
            == job_id,

            JobMatch.user_id
            == current_user.id,
        )
        .order_by(
            JobMatch.id.desc()
        )
        .first()
    )

    # ========================================================
    # UPDATE EXISTING MATCH
    # ========================================================

    if existing_match:

        fill_job_match(
            job_match=existing_match,
            result=result,
        )

        try:

            db.commit()

            db.refresh(
                existing_match
            )

        except Exception as error:

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Could not update job match: "
                    f"{error}"
                ),
            )

        return existing_match

    # ========================================================
    # CREATE NEW MATCH
    # ========================================================

    new_match = JobMatch(

        resume_id=resume_id,

        job_id=job_id,

        user_id=current_user.id,

        match_score=round(
            float(
                result["match_score"]
            ),
            2,
        ),

        matched_skills=(
            list_to_text(
                result.get(
                    "matched_skills"
                )
            )
        ),

        missing_skills=(
            list_to_text(
                result.get(
                    "missing_skills"
                )
            )
        ),

        matched_keywords=(
            list_to_text(
                result.get(
                    "matched_keywords"
                )
            )
        ),

        missing_keywords=(
            list_to_text(
                result.get(
                    "missing_keywords"
                )
            )
        ),

        experience_match=(
            result.get(
                "experience_match"
            )
        ),

        summary=(
            result.get(
                "summary"
            )
            or ""
        ),

        recommendations=(
            list_to_text(
                result.get(
                    "recommendations"
                )
            )
        ),
    )

    try:

        db.add(
            new_match
        )

        db.commit()

        db.refresh(
            new_match
        )

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not create job match: "
                f"{error}"
            ),
        )

    return new_match


# ============================================================
# GET SINGLE JOB MATCH
# ============================================================

@router.get(
    "/resume/{resume_id}/job/{job_id}",
    response_model=JobMatchResponse,
)
def get_job_match(
    resume_id: int,
    job_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    # ========================================================
    # VERIFY RESUME OWNERSHIP
    # ========================================================

    resume = get_candidate_resume(
        db=db,
        resume_id=resume_id,
        current_user=current_user,
    )

    # ========================================================
    # VERIFY JOB EXISTS
    # ========================================================

    job = get_job(
        db=db,
        job_id=job_id,
    )

    # ========================================================
    # FIND MATCH
    # ========================================================

    match = (
        db.query(JobMatch)
        .filter(
            JobMatch.resume_id
            == resume_id,

            JobMatch.job_id
            == job_id,

            JobMatch.user_id
            == current_user.id,
        )
        .order_by(
            JobMatch.id.desc()
        )
        .first()
    )

    # ========================================================
    # IF MATCH DOES NOT EXIST
    # ========================================================

    if match is None:

        result = calculate_match(
            resume=resume,
            job=job,
        )

        match = JobMatch(
            resume_id=resume_id,
            job_id=job_id,
            user_id=current_user.id,
        )

        fill_job_match(
            job_match=match,
            result=result,
        )

        try:

            db.add(
                match
            )

            db.commit()

            db.refresh(
                match
            )

        except Exception as error:

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Could not create job match: "
                    f"{error}"
                ),
            )

        return match

    # ========================================================
    # REPAIR NULL / INVALID SCORE
    # ========================================================

    needs_refresh = False

    if match.match_score is None:

        needs_refresh = True

    else:

        try:

            score = float(
                match.match_score
            )

            if not (
                0.0
                <= score
                <= 100.0
            ):
                needs_refresh = True

        except (
            TypeError,
            ValueError,
        ):
            needs_refresh = True

    if needs_refresh:

        result = calculate_match(
            resume=resume,
            job=job,
        )

        fill_job_match(
            job_match=match,
            result=result,
        )

        try:

            db.commit()

            db.refresh(
                match
            )

        except Exception as error:

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Could not repair job match: "
                    f"{error}"
                ),
            )

    return match


# ============================================================
# GET ALL MATCHES FOR A RESUME
# ============================================================

@router.get(
    "/resume/{resume_id}",
    response_model=list[JobMatchResponse],
)
def get_resume_job_matches(
    resume_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    # ========================================================
    # VERIFY RESUME OWNERSHIP
    # ========================================================

    resume = get_candidate_resume(
        db=db,
        resume_id=resume_id,
        current_user=current_user,
    )

    # ========================================================
    # GET MATCHES
    # ========================================================

    matches = (
        db.query(JobMatch)
        .filter(
            JobMatch.resume_id
            == resume.id,

            JobMatch.user_id
            == current_user.id,
        )
        .order_by(
            JobMatch.created_at.desc()
        )
        .all()
    )

    # ========================================================
    # REPAIR OLD NULL SCORES
    # ========================================================

    changed = False

    for match in matches:

        needs_refresh = False

        if match.match_score is None:

            needs_refresh = True

        else:

            try:

                score = float(
                    match.match_score
                )

                if not (
                    0.0
                    <= score
                    <= 100.0
                ):
                    needs_refresh = True

            except (
                TypeError,
                ValueError,
            ):
                needs_refresh = True

        if not needs_refresh:
            continue

        job = (
            db.query(Job)
            .filter(
                Job.id
                == match.job_id
            )
            .first()
        )

        if not job:
            continue

        try:

            result = calculate_match(
                resume=resume,
                job=job,
            )

            fill_job_match(
                job_match=match,
                result=result,
            )

            changed = True

        except HTTPException:
            continue

        except Exception:
            continue

    # ========================================================
    # SAVE REPAIRED MATCHES
    # ========================================================

    if changed:

        try:

            db.commit()

            for match in matches:
                db.refresh(
                    match
                )

        except Exception as error:

            db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Could not update job matches: "
                    f"{error}"
                ),
            )

    return matches