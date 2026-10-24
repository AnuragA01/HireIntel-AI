
import pymupdf


# ============================================================
# PDF TEXT EXTRACTION
# ============================================================

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from every page of a PDF resume.
    """
    text = ""

    # Use pymupdf instead of the deprecated fitz API.
    document = pymupdf.open(file_path)

    try:
        for page in document:
            text += page.get_text() + "\n"
    finally:
        document.close()

    return text.strip()


# ============================================================
# DOCX TEXT EXTRACTION
# ============================================================

def extract_text_from_docx(file_path: str) -> str:
    """
    Extract text from a DOCX resume.
    Import python-docx only when needed.
    """
    try:
        from docx import Document

    except Exception as error:
        raise RuntimeError(
            "DOCX processing is currently unavailable because "
            "python-docx or lxml could not be loaded. "
            "Please check the python-docx and lxml installations."
        ) from error

    document = Document(file_path)

    paragraphs = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            paragraphs.append(paragraph.text.strip())

    return "\n".join(paragraphs)


# ============================================================
# RESUME TEXT EXTRACTION
# ============================================================

def extract_resume_text(
    file_path: str,
    file_type: str,
) -> str:
    """
    Extract text from supported PDF and DOCX resumes.
    """
    file_type = file_type.lower().strip()

    if file_type == ".pdf":
        return extract_text_from_pdf(file_path)

    if file_type == ".docx":
        return extract_text_from_docx(file_path)

    raise ValueError(
        "Unsupported resume format. "
        "Only PDF and DOCX are supported."
    )
