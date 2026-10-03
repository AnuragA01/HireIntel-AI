import importlib
import uuid
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.resume import Resume
from app.models.user import User
from app.models.resume_analysis import ResumeAnalysis
from app.models.job import Job
from app.models.job_match import JobMatch

from app.schemas.resume import ResumeResponse

from app.services.resume_service import extract_resume_text
from app.services.resume_analysis_service import analyze_resume


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)


# ============================================================
# LOAD JOB MATCHING FUNCTION
# ============================================================

def get_match_resume_function():
    """
    Find match_resume_with_job() from the existing
    job matching service.

    This avoids depending on one exact filename.
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

    raise ImportError(
        "Could not find match_resume_with_job() "
        "in the job matching service."
    )


# ============================================================
# HELPER
# ============================================================

def list_to_text(value):
    """
    Convert lists into text for MySQL TEXT columns.
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
# UPLOAD RESUME
# ============================================================

@router.post(
    "/upload",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # ========================================================
    # CHECK FILENAME
    # ========================================================

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="Filename is required.",
        )

    # ========================================================
    # GET FILE EXTENSION
    # ========================================================

    extension = Path(
        file.filename
    ).suffix.lower()

    # ========================================================
    # ALLOWED FILE TYPES
    # ========================================================

    allowed_extensions = {
        ".pdf",
        ".docx",
    }

    if extension not in allowed_extensions:

        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed.",
        )

    # ========================================================
    # CREATE UPLOAD DIRECTORY
    # ========================================================

    upload_directory = Path("uploads")

    upload_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    # ========================================================
    # GENERATE UNIQUE FILENAME
    # ========================================================

    unique_filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    file_path = (
        upload_directory / unique_filename
    )

    # ========================================================
    # READ FILE
    # ========================================================

    contents = await file.read()

    if not contents:

        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    # ========================================================
    # MAXIMUM FILE SIZE
    # ========================================================

    max_file_size = 5 * 1024 * 1024

    if len(contents) > max_file_size:

        raise HTTPException(
            status_code=400,
            detail="File size must be less than 5 MB.",
        )

    # ========================================================
    # SAVE FILE
    # ========================================================

    try:

        with open(
            file_path,
            "wb",
        ) as output_file:

            output_file.write(contents)

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Could not save resume file: {error}",
        )

    # ========================================================
    # EXTRACT RESUME TEXT
    # ========================================================

    try:

        extracted_text = extract_resume_text(
            str(file_path),
            extension,
        )

    except Exception as error:

        if file_path.exists():

            try:
                file_path.unlink()
            except OSError:
                pass

        raise HTTPException(
            status_code=400,
            detail=f"Could not process resume: {error}",
        )

    # ========================================================
    # CHECK EXTRACTED TEXT
    # ========================================================

    if not extracted_text or not extracted_text.strip():

        if file_path.exists():

            try:
                file_path.unlink()
            except OSError:
                pass

        raise HTTPException(
            status_code=400,
            detail=(
                "Could not extract readable text "
                "from the resume."
            ),
        )

    # ========================================================
    # AI RESUME ANALYSIS
    # ========================================================

    try:

        analysis_data = analyze_resume(
            extracted_text
        )

    except Exception as error:

        if file_path.exists():

            try:
                file_path.unlink()
            except OSError:
                pass

        raise HTTPException(
            status_code=400,
            detail=f"Could not analyze resume: {error}",
        )

    # ========================================================
    # CREATE RESUME
    # ========================================================

    resume = Resume(
        user_id=current_user.id,
        original_filename=file.filename,
        stored_filename=unique_filename,
        file_path=str(file_path),
        file_type=extension,
        extracted_text=extracted_text,
    )

    # ========================================================
    # CREATE RESUME ANALYSIS
    # ========================================================

    resume_analysis = ResumeAnalysis(
        user_id=current_user.id,
        resume_id=None,

        skills=list_to_text(
            analysis_data.get("skills")
        ),

        education=(
            analysis_data.get("education")
            or ""
        ),

        experience=(
            analysis_data.get("experience")
            or ""
        ),

        projects=(
            analysis_data.get("projects")
            or ""
        ),

        certifications=(
            analysis_data.get("certifications")
            or ""
        ),

        keywords=list_to_text(
            analysis_data.get("keywords")
        ),

        summary=(
            analysis_data.get("summary")
            or ""
        ),

        strengths=list_to_text(
            analysis_data.get("strengths")
        ),

        weaknesses=list_to_text(
            analysis_data.get("weaknesses")
        ),

        recommendations=list_to_text(
            analysis_data.get("recommendations")
        ),

        resume_score=(
            analysis_data.get("resume_score")
        ),
    )

    # ========================================================
    # SAVE RESUME + ANALYSIS
    # ========================================================

    try:

        db.add(resume)

        # Generate Resume ID
        db.flush()

        resume_analysis.resume_id = resume.id

        db.add(resume_analysis)

        db.commit()

        db.refresh(resume)

        db.refresh(resume_analysis)

    except Exception as error:

        db.rollback()

        if file_path.exists():

            try:
                file_path.unlink()
            except OSError:
                pass

        raise HTTPException(
            status_code=500,
            detail=(
                "Could not save resume and analysis "
                f"to database: {error}"
            ),
        )

    # ========================================================
    # AUTOMATIC JOB MATCHING
    # ========================================================

    try:

        # Get matching function
        match_resume_with_job = (
            get_match_resume_function()
        )

        # Get all available jobs
        jobs = (
            db.query(Job)
            .all()
        )

        # ====================================================
        # PROCESS EACH JOB
        # ====================================================

        for job in jobs:

            # =================================================
            # MATCH RESUME WITH JOB
            # =================================================

            match_result = match_resume_with_job(
                resume_text=extracted_text,

                job_description=(
                    job.description or ""
                ),

                required_skills_text=(
                    job.required_skills or ""
                ),
            )

            # =================================================
            # FIND EXISTING MATCH
            # =================================================

            existing_match = (
                db.query(JobMatch)
                .filter(
                    JobMatch.resume_id == resume.id,
                    JobMatch.job_id == job.id,
                    JobMatch.user_id == current_user.id,
                )
                .first()
            )

            # =================================================
            # UPDATE EXISTING MATCH
            # =================================================

            if existing_match:

                existing_match.match_score = (
                    match_result.get(
                        "match_score"
                    )
                )

                existing_match.matched_skills = (
                    list_to_text(
                        match_result.get(
                            "matched_skills"
                        )
                    )
                )

                existing_match.missing_skills = (
                    list_to_text(
                        match_result.get(
                            "missing_skills"
                        )
                    )
                )

                existing_match.matched_keywords = (
                    list_to_text(
                        match_result.get(
                            "matched_keywords"
                        )
                    )
                )

                existing_match.missing_keywords = (
                    list_to_text(
                        match_result.get(
                            "missing_keywords"
                        )
                    )
                )

                existing_match.experience_match = (
                    match_result.get(
                        "experience_match"
                    )
                )

                existing_match.summary = (
                    match_result.get(
                        "summary"
                    )
                    or ""
                )

                existing_match.recommendations = (
                    list_to_text(
                        match_result.get(
                            "recommendations"
                        )
                    )
                )

            # =================================================
            # CREATE NEW MATCH
            # =================================================

            else:

                job_match = JobMatch(

                    resume_id=resume.id,

                    job_id=job.id,

                    user_id=current_user.id,

                    match_score=(
                        match_result.get(
                            "match_score"
                        )
                    ),

                    matched_skills=(
                        list_to_text(
                            match_result.get(
                                "matched_skills"
                            )
                        )
                    ),

                    missing_skills=(
                        list_to_text(
                            match_result.get(
                                "missing_skills"
                            )
                        )
                    ),

                    matched_keywords=(
                        list_to_text(
                            match_result.get(
                                "matched_keywords"
                            )
                        )
                    ),

                    missing_keywords=(
                        list_to_text(
                            match_result.get(
                                "missing_keywords"
                            )
                        )
                    ),

                    experience_match=(
                        match_result.get(
                            "experience_match"
                        )
                    ),

                    summary=(
                        match_result.get(
                            "summary"
                        )
                        or ""
                    ),

                    recommendations=(
                        list_to_text(
                            match_result.get(
                                "recommendations"
                            )
                        )
                    ),
                )

                db.add(job_match)

        # Save all matches
        db.commit()

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Resume uploaded successfully, "
                "but automatic job matching failed: "
                f"{error}"
            ),
        )

    # ========================================================
    # RETURN RESUME
    # ========================================================

    return {
        "id": resume.id,
        "user_id": resume.user_id,
        "original_filename": resume.original_filename,
        "stored_filename": resume.stored_filename,
        "file_type": resume.file_type,
        "extracted_text": resume.extracted_text,
        "uploaded_at": resume.uploaded_at,
        "ai_score": resume_analysis.resume_score,
    }


# ============================================================
# GET MY RESUMES
# ============================================================

@router.get(
    "/my-resumes",
    response_model=list[ResumeResponse],
)
def get_my_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

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

    response = []

    for resume in resumes:

        # ====================================================
        # GET LATEST AI ANALYSIS
        # ====================================================

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

        response.append(
            {
                "id": resume.id,
                "user_id": resume.user_id,
                "original_filename": resume.original_filename,
                "stored_filename": resume.stored_filename,
                "file_type": resume.file_type,
                "extracted_text": resume.extracted_text,
                "uploaded_at": resume.uploaded_at,

                "ai_score": (
                    analysis.resume_score
                    if analysis
                    else None
                ),
            }
        )

    return response


# ============================================================
# DELETE MY RESUME
# ============================================================

@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_200_OK,
)
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
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
    # SAVE FILE PATH
    # ========================================================

    file_path = Path(
        resume.file_path
    )

    # ========================================================
    # DELETE RESUME ANALYSIS
    # ========================================================

    db.query(
        ResumeAnalysis
    ).filter(
        ResumeAnalysis.resume_id == resume.id,
        ResumeAnalysis.user_id == current_user.id,
    ).delete(
        synchronize_session=False
    )

    # ========================================================
    # DELETE JOB MATCHES
    # ========================================================

    db.query(
        JobMatch
    ).filter(
        JobMatch.resume_id == resume.id,
        JobMatch.user_id == current_user.id,
    ).delete(
        synchronize_session=False
    )

    # ========================================================
    # DELETE RESUME
    # ========================================================

    db.delete(resume)

    try:

        db.commit()

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not delete resume: {error}",
        )

    # ========================================================
    # DELETE PHYSICAL FILE
    # ========================================================

    file_deleted = False

    if file_path.exists():

        try:

            file_path.unlink()

            file_deleted = True

        except OSError:

            file_deleted = False

    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "message": "Resume deleted successfully.",
        "resume_id": resume_id,
        "database_record_deleted": True,
        "file_deleted": file_deleted,
    }


# ============================================================
# GET SINGLE RESUME
# ============================================================

@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
)
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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
            status_code=404,
            detail="Resume not found.",
        )

    # ========================================================
    # GET LATEST ANALYSIS
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
    # RESPONSE
    # ========================================================

    return {
        "id": resume.id,
        "user_id": resume.user_id,
        "original_filename": resume.original_filename,
        "stored_filename": resume.stored_filename,
        "file_type": resume.file_type,
        "extracted_text": resume.extracted_text,
        "uploaded_at": resume.uploaded_at,

        "ai_score": (
            analysis.resume_score
            if analysis
            else None
        ),
    }