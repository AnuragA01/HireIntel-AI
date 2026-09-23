import fitz


# ============================================================
# PDF TEXT EXTRACTION
# ============================================================

def extract_text_from_pdf(file_path: str) -> str:

    text = ""

    document = fitz.open(file_path)

    try:

        for page in document:
            text += page.get_text()

    finally:

        document.close()

    return text.strip()


# ============================================================
# DOCX TEXT EXTRACTION
# ============================================================

def extract_text_from_docx(file_path: str) -> str:

    # Import python-docx only when DOCX processing
    # is actually requested.
    #
    # This prevents the lxml DLL issue from stopping
    # FastAPI from starting.

    try:

        from docx import Document

    except Exception as error:

        raise RuntimeError(
            "DOCX processing is currently unavailable on "
            "this Windows environment because python-docx/lxml "
            "could not be loaded. PDF resumes are supported."
        ) from error

    document = Document(file_path)

    paragraphs = []

    for paragraph in document.paragraphs:

        if paragraph.text.strip():

            paragraphs.append(
                paragraph.text.strip()
            )

    return "\n".join(paragraphs)


# ============================================================
# RESUME TEXT EXTRACTION
# ============================================================

def extract_resume_text(
    file_path: str,
    file_type: str,
) -> str:

    file_type = file_type.lower()

    if file_type == ".pdf":

        return extract_text_from_pdf(
            file_path
        )

    if file_type == ".docx":

        return extract_text_from_docx(
            file_path
        )

    raise ValueError(
        "Unsupported resume format. "
        "Only PDF and DOCX are supported."
    )