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
from app.models.job_match import JobMatch

from app.schemas.resume import ResumeResponse

from app.services.resume_service import extract_resume_text


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)


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

    # --------------------------------------------------------
    # Check filename
    # --------------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required.",
        )

    # --------------------------------------------------------
    # Get extension
    # --------------------------------------------------------

    extension = Path(
        file.filename
    ).suffix.lower()

    # --------------------------------------------------------
    # Allowed extensions
    # --------------------------------------------------------

    allowed_extensions = {
        ".pdf",
        ".docx",
    }

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed.",
        )

    # --------------------------------------------------------
    # Create uploads directory
    # --------------------------------------------------------

    upload_directory = Path("uploads")

    upload_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    # --------------------------------------------------------
    # Generate unique filename
    # --------------------------------------------------------

    unique_filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    file_path = (
        upload_directory / unique_filename
    )

    # --------------------------------------------------------
    # Read file
    # --------------------------------------------------------

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    # --------------------------------------------------------
    # Maximum file size: 5 MB
    # --------------------------------------------------------

    max_file_size = 5 * 1024 * 1024

    if len(contents) > max_file_size:
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 5 MB.",
        )

    # --------------------------------------------------------
    # Save file
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Extract resume text
    # --------------------------------------------------------

    try:

        extracted_text = extract_resume_text(
            str(file_path),
            extension,
        )

    except Exception as error:

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=400,
            detail=f"Could not process resume: {error}",
        )

    # --------------------------------------------------------
    # Create database record
    # --------------------------------------------------------

    resume = Resume(
        user_id=current_user.id,
        original_filename=file.filename,
        stored_filename=unique_filename,
        file_path=str(file_path),
        file_type=extension,
        extracted_text=extracted_text,
    )

    # --------------------------------------------------------
    # Save to database
    # --------------------------------------------------------

    try:

        db.add(resume)

        db.commit()

        db.refresh(resume)

    except Exception as error:

        db.rollback()

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Could not save resume to database: {error}",
        )

    return resume


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

    return resumes


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
    # Save file path before deleting database record
    # --------------------------------------------------------

    file_path = Path(
        resume.file_path
    )

    # --------------------------------------------------------
    # Delete resume analyses
    # --------------------------------------------------------

    db.query(
        ResumeAnalysis
    ).filter(
        ResumeAnalysis.resume_id == resume.id,
        ResumeAnalysis.user_id == current_user.id,
    ).delete(
        synchronize_session=False
    )

    # --------------------------------------------------------
    # Delete job matches
    # --------------------------------------------------------

    db.query(
        JobMatch
    ).filter(
        JobMatch.resume_id == resume.id,
        JobMatch.user_id == current_user.id,
    ).delete(
        synchronize_session=False
    )

    # --------------------------------------------------------
    # Delete resume database record
    # --------------------------------------------------------

    db.delete(resume)

    try:

        db.commit()

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not delete resume: {error}",
        )

    # --------------------------------------------------------
    # Delete physical file
    # --------------------------------------------------------

    file_deleted = False

    if file_path.exists():

        try:

            file_path.unlink()

            file_deleted = True

        except OSError:
            file_deleted = False

    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

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

    return resume