from typing import List
import importlib

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.application import Application
from app.models.job import Job
from app.models.resume import Resume
from app.models.job_match import JobMatch
from app.models.user import User

from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


# ============================================================
# ALLOWED APPLICATION STATUSES
# ============================================================

ALLOWED_STATUSES = {
    "Applied",
    "Shortlisted",
    "Interview",
    "Rejected",
    "Hired",
}


# ============================================================
# ROLE CHECKS
# ============================================================

def require_recruiter(current_user: User):
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter access required.",
        )


def require_candidate(current_user: User):
    if current_user.role != "candidate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Candidate access required.",
        )


# ============================================================
# JOB OWNERSHIP CHECK
# ============================================================

def get_recruiter_job(
    job_id: int,
    current_user: User,
    db: Session,
):
    """
    Return a recruiter-owned job.
    """

    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    if job.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to access this job.",
        )

    return job


# ============================================================
# GET AI MATCHING FUNCTION
# ============================================================

def get_match_resume_function():
    """
    Find the project's existing resume-job matching function.
    """

    possible_modules = [
        "app.services.job_match_service",
        "app.services.job_matching",
        "app.services.job_match",
        "app.services.job_matching_service",
    ]

    for module_name in possible_modules:

        try:
            module = importlib.import_module(
                module_name
            )

            match_function = getattr(
                module,
                "match_resume_with_job",
                None,
            )

            if match_function is not None:
                return match_function

        except (
            ImportError,
            ModuleNotFoundError,
        ):
            continue

    return None


# ============================================================
# TEXT HELPER
# ============================================================

def list_to_text(value):
    """
    Convert lists or values into database-friendly text.
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
# CALCULATE AI MATCH
# ============================================================

def calculate_job_match(
    resume: Resume,
    job: Job,
):
    """
    Run the project's AI matching service.

    Returns a dictionary containing:
        match_score
        matched_skills
        missing_skills
        matched_keywords
        missing_keywords
        experience_match
        summary
        recommendations
    """

    match_resume_with_job = (
        get_match_resume_function()
    )

    if match_resume_with_job is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "AI job matching service could not be found."
            ),
        )

    # --------------------------------------------------------
    # RESUME TEXT
    # --------------------------------------------------------

    resume_text = (
        resume.extracted_text
        or ""
    )

    if not resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Resume does not contain extracted text. "
                "Please upload or reprocess the resume."
            ),
        )

    # --------------------------------------------------------
    # JOB DATA
    # --------------------------------------------------------

    job_description = (
        job.description
        or ""
    )

    required_skills = (
        job.required_skills
        or ""
    )

    # Include experience requirement
    complete_job_description = (
        f"{job_description} "
        f"{job.experience_required or ''}"
    ).strip()

    # --------------------------------------------------------
    # RUN AI MATCHING
    # --------------------------------------------------------

    try:

        result = match_resume_with_job(
            resume_text=resume_text,
            job_description=complete_job_description,
            required_skills_text=required_skills,
        )

    except Exception as error:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                f"Job matching failed: {error}"
            ),
        )

    # --------------------------------------------------------
    # VALIDATE RESULT
    # --------------------------------------------------------

    if not isinstance(result, dict):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "AI matching service returned an invalid result."
            ),
        )

    match_score = result.get(
        "match_score"
    )

    if match_score is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "AI matching completed but did not return "
                "a match score."
            ),
        )

    # --------------------------------------------------------
    # VALIDATE SCORE
    # --------------------------------------------------------

    try:

        match_score = float(
            match_score
        )

    except (
        TypeError,
        ValueError,
    ):

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "AI matching returned an invalid match score."
            ),
        )

    # Keep score between 0 and 100
    match_score = max(
        0.0,
        min(
            match_score,
            100.0,
        ),
    )

    result["match_score"] = round(
        match_score,
        2,
    )

    return result


# ============================================================
# UPDATE JOB MATCH RECORD
# ============================================================

def update_job_match_record(
    job_match: JobMatch,
    result: dict,
):
    """
    Update an existing JobMatch record.
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
# GET / CREATE / REPAIR AI JOB MATCH
# ============================================================

def get_or_create_job_match(
    db: Session,
    current_user: User,
    resume: Resume,
    job: Job,
):
    """
    Get an existing JobMatch.

    If the existing match has a valid score,
    return it.

    If the existing match has NULL/invalid score,
    recalculate the AI match and repair it.

    If no match exists,
    create a new JobMatch.
    """

    # --------------------------------------------------------
    # FIND EXISTING MATCH
    # --------------------------------------------------------

    existing_match = (
        db.query(JobMatch)
        .filter(
            JobMatch.user_id == current_user.id,
            JobMatch.resume_id == resume.id,
            JobMatch.job_id == job.id,
        )
        .order_by(
            JobMatch.id.desc()
        )
        .first()
    )

    # --------------------------------------------------------
    # EXISTING MATCH
    # --------------------------------------------------------

    if existing_match:

        # ----------------------------------------------------
        # CHECK WHETHER SCORE IS VALID
        # ----------------------------------------------------

        if existing_match.match_score is not None:

            try:

                existing_score = float(
                    existing_match.match_score
                )

                if (
                    0.0
                    <= existing_score
                    <= 100.0
                ):
                    return existing_match

            except (
                TypeError,
                ValueError,
            ):
                pass

        # ----------------------------------------------------
        # SCORE IS NULL OR INVALID
        # RECALCULATE AI MATCH
        # ----------------------------------------------------

        result = calculate_job_match(
            resume=resume,
            job=job,
        )

        update_job_match_record(
            existing_match,
            result,
        )

        db.flush()

        return existing_match

    # --------------------------------------------------------
    # NO EXISTING MATCH
    # CREATE NEW MATCH
    # --------------------------------------------------------

    result = calculate_job_match(
        resume=resume,
        job=job,
    )

    new_match = JobMatch(
        resume_id=resume.id,
        job_id=job.id,
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

    db.add(
        new_match
    )

    db.flush()

    return new_match


# ============================================================
# 1. APPLY FOR JOB
# ============================================================

@router.post(
    "/job/{job_id}",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def apply_for_job(
    job_id: int,
    application_data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Candidate applies for a job.

    AI match is guaranteed before the application
    is created.
    """

    # --------------------------------------------------------
    # CANDIDATE ONLY
    # --------------------------------------------------------

    require_candidate(
        current_user
    )

    # --------------------------------------------------------
    # FIND JOB
    # --------------------------------------------------------

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    # --------------------------------------------------------
    # FIND RESUME
    # --------------------------------------------------------

    resume = (
        db.query(Resume)
        .filter(
            Resume.id
            == application_data.resume_id
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    # --------------------------------------------------------
    # VERIFY RESUME OWNERSHIP
    # --------------------------------------------------------

    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You can only apply using your own resume."
            ),
        )

    # --------------------------------------------------------
    # CHECK RESUME TEXT
    # --------------------------------------------------------

    if not resume.extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Selected resume does not contain "
                "extractable text. Please upload or "
                "reprocess the resume."
            ),
        )

    # --------------------------------------------------------
    # PREVENT DUPLICATE APPLICATION
    # --------------------------------------------------------

    existing_application = (
        db.query(Application)
        .filter(
            Application.candidate_id
            == current_user.id,

            Application.job_id
            == job_id,
        )
        .first()
    )

    if existing_application:

        # ----------------------------------------------------
        # IMPORTANT:
        # Repair missing score before returning duplicate
        # ----------------------------------------------------

        if existing_application.match_score is None:

            try:

                job_match = get_or_create_job_match(
                    db=db,
                    current_user=current_user,
                    resume=resume,
                    job=job,
                )

                if (
                    job_match
                    and job_match.match_score is not None
                ):

                    existing_application.match_score = round(
                        float(
                            job_match.match_score
                        ),
                        2,
                    )

                    db.commit()

                    db.refresh(
                        existing_application
                    )

            except Exception as error:

                db.rollback()

                print(
                    "Could not repair existing "
                    "application score:",
                    error,
                )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "You have already applied for this job."
            ),
        )

    # --------------------------------------------------------
    # GET / CREATE / REPAIR AI MATCH
    # --------------------------------------------------------

    try:

        job_match = get_or_create_job_match(
            db=db,
            current_user=current_user,
            resume=resume,
            job=job,
        )

        if (
            job_match is None
            or job_match.match_score is None
        ):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Unable to generate AI job match."
                ),
            )

        match_score = round(
            float(
                job_match.match_score
            ),
            2,
        )

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not generate AI job match: "
                f"{error}"
            ),
        )

    # --------------------------------------------------------
    # CREATE APPLICATION
    # --------------------------------------------------------

    application = Application(
        candidate_id=current_user.id,

        resume_id=(
            application_data.resume_id
        ),

        job_id=job_id,

        status="Applied",

        cover_letter=(
            application_data.cover_letter
        ),

        match_score=match_score,
    )

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    try:

        db.add(
            application
        )

        db.commit()

        db.refresh(
            application
        )

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not create application: "
                f"{error}"
            ),
        )

    return application


# ============================================================
# 2. GET MY APPLICATIONS
# ============================================================

@router.get(
    "/my-applications",
    response_model=List[ApplicationResponse],
)
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    """
    Return all applications belonging to the candidate.

    IMPORTANT:
    Existing applications with NULL match_score are
    automatically repaired here.
    """

    require_candidate(
        current_user
    )

    # --------------------------------------------------------
    # GET APPLICATIONS
    # --------------------------------------------------------

    applications = (
        db.query(Application)
        .filter(
            Application.candidate_id
            == current_user.id
        )
        .order_by(
            Application.applied_at.desc()
        )
        .all()
    )

    # --------------------------------------------------------
    # REPAIR MISSING AI MATCH SCORES
    # --------------------------------------------------------

    changed = False

    for application in applications:

        # Already has a score
        if application.match_score is not None:
            continue

        # ----------------------------------------------------
        # FIND RESUME
        # ----------------------------------------------------

        resume = (
            db.query(Resume)
            .filter(
                Resume.id
                == application.resume_id,

                Resume.user_id
                == current_user.id,
            )
            .first()
        )

        if not resume:
            continue

        # ----------------------------------------------------
        # FIND JOB
        # ----------------------------------------------------

        job = (
            db.query(Job)
            .filter(
                Job.id
                == application.job_id
            )
            .first()
        )

        if not job:
            continue

        # ----------------------------------------------------
        # CALCULATE / REPAIR MATCH
        # ----------------------------------------------------

        try:

            job_match = get_or_create_job_match(
                db=db,
                current_user=current_user,
                resume=resume,
                job=job,
            )

            if (
                job_match
                and job_match.match_score is not None
            ):

                application.match_score = round(
                    float(
                        job_match.match_score
                    ),
                    2,
                )

                changed = True

                print(
                    f"Repaired Application "
                    f"{application.id}: "
                    f"{application.match_score}%"
                )

        except Exception as error:

            print(
                f"Could not calculate match score "
                f"for Application {application.id}: "
                f"{error}"
            )

            continue

    # --------------------------------------------------------
    # SAVE REPAIRED APPLICATIONS
    # --------------------------------------------------------

    if changed:

        try:

            db.commit()

            for application in applications:
                db.refresh(
                    application
                )

        except Exception as error:

            db.rollback()

            print(
                "Could not save repaired "
                f"application scores: {error}"
            )

    # --------------------------------------------------------
    # RETURN APPLICATIONS
    # --------------------------------------------------------

    return applications


# ============================================================
# 3. GET SINGLE APPLICATION
# ============================================================

@router.get(
    "/{application_id}",
    response_model=ApplicationResponse,
)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    application = (
        db.query(Application)
        .filter(
            Application.id
            == application_id
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        )

    # ========================================================
    # CANDIDATE
    # ========================================================

    if current_user.role == "candidate":

        if (
            application.candidate_id
            != current_user.id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You are not allowed "
                    "to view this application."
                ),
            )

        # ----------------------------------------------------
        # FIND RESUME
        # ----------------------------------------------------

        resume = (
            db.query(Resume)
            .filter(
                Resume.id
                == application.resume_id,

                Resume.user_id
                == current_user.id,
            )
            .first()
        )

        # ----------------------------------------------------
        # FIND JOB
        # ----------------------------------------------------

        job = (
            db.query(Job)
            .filter(
                Job.id
                == application.job_id
            )
            .first()
        )

        # ----------------------------------------------------
        # REPAIR MISSING SCORE
        # ----------------------------------------------------

        if (
            resume
            and job
            and application.match_score is None
        ):

            try:

                job_match = get_or_create_job_match(
                    db=db,
                    current_user=current_user,
                    resume=resume,
                    job=job,
                )

                if (
                    job_match
                    and job_match.match_score is not None
                ):

                    application.match_score = round(
                        float(
                            job_match.match_score
                        ),
                        2,
                    )

                    db.commit()

                    db.refresh(
                        application
                    )

            except Exception as error:

                db.rollback()

                print(
                    "Could not repair "
                    "application match score:",
                    error,
                )

    # ========================================================
    # RECRUITER
    # ========================================================

    elif current_user.role == "recruiter":

        job = (
            db.query(Job)
            .filter(
                Job.id
                == application.job_id
            )
            .first()
        )

        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found.",
            )

        if (
            job.user_id
            != current_user.id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You are not allowed "
                    "to view this application."
                ),
            )

    else:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not allowed "
                "to view this application."
            ),
        )

    return application


# ============================================================
# 4. GET APPLICATIONS FOR RECRUITER JOB
# ============================================================

@router.get(
    "/job/{job_id}",
    response_model=List[ApplicationResponse],
)
def get_job_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    require_recruiter(
        current_user
    )

    # --------------------------------------------------------
    # VERIFY RECRUITER OWNS JOB
    # --------------------------------------------------------

    job = get_recruiter_job(
        job_id=job_id,
        current_user=current_user,
        db=db,
    )

    # --------------------------------------------------------
    # GET APPLICATIONS
    # --------------------------------------------------------

    applications = (
        db.query(Application)
        .filter(
            Application.job_id
            == job.id
        )
        .order_by(
            Application.applied_at.desc()
        )
        .all()
    )

    return applications


# ============================================================
# 5. GET ALL APPLICATIONS FOR RECRUITER
# ============================================================

@router.get(
    "/recruiter/all",
    response_model=List[ApplicationResponse],
)
def get_all_recruiter_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    require_recruiter(
        current_user
    )

    # --------------------------------------------------------
    # GET RECRUITER JOB IDS
    # --------------------------------------------------------

    recruiter_jobs = (
        db.query(Job.id)
        .filter(
            Job.user_id
            == current_user.id
        )
        .all()
    )

    job_ids = [
        job_id
        for (job_id,) in recruiter_jobs
    ]

    if not job_ids:
        return []

    # --------------------------------------------------------
    # GET APPLICATIONS
    # --------------------------------------------------------

    applications = (
        db.query(Application)
        .filter(
            Application.job_id.in_(
                job_ids
            )
        )
        .order_by(
            Application.applied_at.desc()
        )
        .all()
    )

    return applications


# ============================================================
# 6. UPDATE APPLICATION STATUS
# ============================================================

@router.put(
    "/{application_id}/status",
    response_model=ApplicationResponse,
)
def update_application_status(
    application_id: int,
    status_data: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    ),
):
    require_recruiter(
        current_user
    )

    # --------------------------------------------------------
    # VALIDATE STATUS
    # --------------------------------------------------------

    new_status = (
        status_data.status.strip()
    )

    if new_status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid application status. "
                "Allowed statuses: "
                "Applied, Shortlisted, Interview, "
                "Rejected, Hired."
            ),
        )

    # --------------------------------------------------------
    # FIND APPLICATION
    # --------------------------------------------------------

    application = (
        db.query(Application)
        .filter(
            Application.id
            == application_id
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        )

    # --------------------------------------------------------
    # FIND JOB
    # --------------------------------------------------------

    job = (
        db.query(Job)
        .filter(
            Job.id
            == application.job_id
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    # --------------------------------------------------------
    # VERIFY RECRUITER OWNS JOB
    # --------------------------------------------------------

    if (
        job.user_id
        != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You are not allowed "
                "to update this application."
            ),
        )

    # --------------------------------------------------------
    # UPDATE STATUS
    # --------------------------------------------------------

    application.status = new_status

    if (
        status_data.recruiter_notes
        is not None
    ):
        application.recruiter_notes = (
            status_data.recruiter_notes
        )

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    try:

        db.commit()

        db.refresh(
            application
        )

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Could not update application: "
                f"{error}"
            ),
        )

    return application