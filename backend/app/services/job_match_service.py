import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.resume_analysis_service import (
    SKILLS_DATABASE,
)


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text: str) -> str:
    """
    Convert text to lowercase and normalize whitespace.
    """

    if not text:
        return ""

    text = text.lower()

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


# ============================================================
# EXTRACT SKILLS
# ============================================================

def extract_skills_from_text(
    text: str,
) -> list[str]:
    """
    Extract known technical skills from text
    using the existing skills database.
    """

    normalized_text = normalize_text(
        text
    )

    found_skills = []

    for skill in SKILLS_DATABASE:

        normalized_skill = normalize_text(
            skill
        )

        pattern = (
            r"(?<![a-z0-9])"
            + re.escape(normalized_skill)
            + r"(?![a-z0-9])"
        )

        if re.search(
            pattern,
            normalized_text,
        ):
            found_skills.append(skill)

    return sorted(
        found_skills,
        key=str.lower,
    )


# ============================================================
# EXTRACT KEYWORDS
# ============================================================

def extract_keywords(
    text: str,
) -> list[str]:
    """
    Extract useful keywords while removing
    common stop words.
    """

    normalized_text = normalize_text(
        text
    )

    words = re.findall(
        r"\b[a-zA-Z][a-zA-Z0-9+#.]*\b",
        normalized_text,
    )

    stop_words = {
        "the",
        "and",
        "for",
        "with",
        "from",
        "that",
        "this",
        "are",
        "you",
        "your",
        "our",
        "will",
        "have",
        "has",
        "job",
        "work",
        "working",
        "looking",
        "using",
        "years",
        "year",
        "experience",
        "required",
        "developer",
        "development",
        "role",
        "candidate",
        "team",
        "skills",
        "skill",
        "must",
        "should",
        "need",
        "needs",
        "responsibilities",
        "responsibility",
    }

    keywords = []

    for word in words:

        if len(word) < 3:
            continue

        if word in stop_words:
            continue

        if word not in keywords:
            keywords.append(word)

    return keywords


# ============================================================
# SKILL SCORE
# ============================================================

def calculate_skill_score(
    required_skills: list[str],
    resume_skills: list[str],
) -> float:
    """
    Calculate percentage of required skills
    found in the resume.
    """

    if not required_skills:
        return 0.0

    required_set = {
        skill.lower()
        for skill in required_skills
    }

    resume_set = {
        skill.lower()
        for skill in resume_skills
    }

    matched = required_set.intersection(
        resume_set
    )

    score = (
        len(matched)
        / len(required_set)
    ) * 100

    return round(
        score,
        2,
    )


# ============================================================
# KEYWORD SCORE
# ============================================================

def calculate_keyword_score(
    job_keywords: list[str],
    resume_keywords: list[str],
) -> float:
    """
    Calculate percentage of job keywords
    found in the resume.
    """

    if not job_keywords:
        return 0.0

    job_set = set(
        job_keywords
    )

    resume_set = set(
        resume_keywords
    )

    matched = job_set.intersection(
        resume_set
    )

    score = (
        len(matched)
        / len(job_set)
    ) * 100

    return round(
        score,
        2,
    )


# ============================================================
# TF-IDF TEXT SIMILARITY
# ============================================================

def calculate_text_similarity(
    resume_text: str,
    job_text: str,
) -> float:
    """
    Calculate TF-IDF cosine similarity between
    resume and job description.
    """

    resume_text = normalize_text(
        resume_text
    )

    job_text = normalize_text(
        job_text
    )

    if not resume_text or not job_text:
        return 0.0

    documents = [
        resume_text,
        job_text,
    ]

    vectorizer = TfidfVectorizer(
        stop_words="english"
    )

    try:

        vectors = vectorizer.fit_transform(
            documents
        )

        similarity = cosine_similarity(
            vectors[0:1],
            vectors[1:2],
        )[0][0]

        return round(
            float(similarity * 100),
            2,
        )

    except ValueError:

        return 0.0


# ============================================================
# EXPERIENCE MATCH
# ============================================================

def calculate_experience_match(
    resume_text: str,
    job_text: str,
) -> float:
    """
    Compare resume experience with job experience
    requirements.

    Handles:

    - Fresher
    - Student
    - Final-year student
    - Internship
    - Intern Developer
    - Entry-level
    - 0-1 years
    - 0-2 years
    - 1-3 years
    - 2+ years
    - Explicit experience such as 1 year
    """

    normalized_resume = normalize_text(
        resume_text
    )

    normalized_job = normalize_text(
        job_text
    )

    # --------------------------------------------------------
    # Detect fresher / entry-level indicators
    # --------------------------------------------------------

    fresher_indicators = [
        "fresher",
        "fresh graduate",
        "recent graduate",
        "entry level",
        "entry-level",
        "graduate",
        "student",
        "final year",
        "final-year",
    ]

    is_fresher = any(
        indicator in normalized_resume
        for indicator in fresher_indicators
    )

    # --------------------------------------------------------
    # Detect internship experience
    # --------------------------------------------------------

    internship_indicators = [
        "internship",
        "intern",
        "intern developer",
        "internship experience",
        "intern developer",
        "summer intern",
        "software intern",
        "developer intern",
    ]

    has_internship = any(
        indicator in normalized_resume
        for indicator in internship_indicators
    )

    # --------------------------------------------------------
    # Extract explicit experience from resume
    # --------------------------------------------------------

    resume_years = []

    experience_patterns = [
        r"(\d+(?:\.\d+)?)\+?\s*(?:years|year)",
        r"(\d+(?:\.\d+)?)\+?\s*(?:yrs|yr)",
    ]

    for pattern in experience_patterns:

        matches = re.findall(
            pattern,
            normalized_resume,
        )

        for value in matches:

            try:

                resume_years.append(
                    float(value)
                )

            except ValueError:
                pass

    # --------------------------------------------------------
    # Detect entry-level job
    # --------------------------------------------------------

    entry_level_indicators = [
        "fresher",
        "fresh graduate",
        "recent graduate",
        "entry level",
        "entry-level",
        "0-1",
        "0 - 1",
        "0 to 1",
        "0–1",
        "0-2",
        "0 - 2",
        "0 to 2",
        "0–2",
    ]

    entry_level_job = any(
        indicator in normalized_job
        for indicator in entry_level_indicators
    )

    # --------------------------------------------------------
    # Extract experience range from job
    # --------------------------------------------------------

    required_min_years = None
    required_max_years = None

    range_patterns = [
        r"(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(?:years|year|yrs|yr)",
        r"(\d+(?:\.\d+)?)\s+to\s+(\d+(?:\.\d+)?)\s*(?:years|year|yrs|yr)",
    ]

    for pattern in range_patterns:

        match = re.search(
            pattern,
            normalized_job,
        )

        if match:

            required_min_years = float(
                match.group(1)
            )

            required_max_years = float(
                match.group(2)
            )

            break

    # --------------------------------------------------------
    # Extract minimum experience
    #
    # Examples:
    # 2+ years
    # 2 years
    # --------------------------------------------------------

    if required_min_years is None:

        plus_match = re.search(
            r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years|year|yrs|yr)",
            normalized_job,
        )

        if plus_match:

            required_min_years = float(
                plus_match.group(1)
            )

    # --------------------------------------------------------
    # Fresher / internship + entry-level job
    #
    # This is especially important for your resume because
    # it contains:
    #
    # INTERNSHIP EXPERIENCE
    # Intern Developer
    #
    # and the job requires 0-2 years.
    # --------------------------------------------------------

    if (
        (is_fresher or has_internship)
        and entry_level_job
    ):

        return 100.0

    # --------------------------------------------------------
    # No explicit experience in resume
    # --------------------------------------------------------

    if not resume_years:

        if is_fresher:

            if entry_level_job:
                return 100.0

            return 50.0

        # Internship + entry-level job
        if has_internship:

            if entry_level_job:
                return 100.0

            return 60.0

        # Resume does not mention experience.
        # Give partial credit rather than assuming
        # zero experience.
        return 50.0

    # --------------------------------------------------------
    # Resume has explicit experience
    # --------------------------------------------------------

    resume_experience = max(
        resume_years
    )

    # --------------------------------------------------------
    # Job has no explicit requirement
    # --------------------------------------------------------

    if required_min_years is None:

        return 100.0

    # --------------------------------------------------------
    # Job has an experience range
    #
    # Example:
    # 0-2 years
    # --------------------------------------------------------

    if required_max_years is not None:

        # Experience falls inside required range
        if (
            resume_experience >= required_min_years
            and resume_experience <= required_max_years
        ):

            return 100.0

        # More experience than required
        if resume_experience > required_max_years:

            return 100.0

        # Less experience than required minimum
        if resume_experience < required_min_years:

            if required_min_years == 0:

                return 100.0

            percentage = (
                resume_experience
                / required_min_years
            ) * 100

            return round(
                min(percentage, 100),
                2,
            )

    # --------------------------------------------------------
    # Job has only a minimum requirement
    #
    # Example:
    # 2+ years
    # --------------------------------------------------------

    if resume_experience >= required_min_years:

        return 100.0

    if required_min_years == 0:

        return 100.0

    percentage = (
        resume_experience
        / required_min_years
    ) * 100

    return round(
        min(percentage, 100),
        2,
    )


# ============================================================
# RECOMMENDATIONS
# ============================================================

def generate_recommendations(
    missing_skills: list[str],
    match_score: float,
    experience_match: float,
) -> list[str]:
    """
    Generate recommendations based on
    missing skills, match score and experience.
    """

    recommendations = []

    # --------------------------------------------------------
    # Missing skills
    # --------------------------------------------------------

    if missing_skills:

        skills_text = ", ".join(
            missing_skills[:5]
        )

        recommendations.append(
            f"Improve or add these skills: "
            f"{skills_text}."
        )

    # --------------------------------------------------------
    # Experience
    # --------------------------------------------------------

    if experience_match < 50:

        recommendations.append(
            "Consider gaining more practical "
            "experience through projects, internships, "
            "or relevant work experience."
        )

    # --------------------------------------------------------
    # Overall score
    # --------------------------------------------------------

    if match_score < 50:

        recommendations.append(
            "The resume has limited alignment with "
            "the selected job. Tailor the resume "
            "toward the job requirements."
        )

    elif match_score < 75:

        recommendations.append(
            "The resume has moderate alignment. "
            "Adding missing technical skills and "
            "relevant project experience may improve "
            "the match."
        )

    else:

        recommendations.append(
            "The resume has strong alignment with "
            "the selected job."
        )

    return recommendations


# ============================================================
# MAIN RESUME-JOB MATCHING FUNCTION
# ============================================================

def match_resume_with_job(
    resume_text: str,
    job_description: str,
    required_skills_text: str | None = None,
):
    """
    Compare a resume with a job description.

    Returns:

    - Match score
    - Matched skills
    - Missing skills
    - Matched keywords
    - Missing keywords
    - Experience match
    - Summary
    - Recommendations
    """

    # ========================================================
    # RESUME SKILLS
    # ========================================================

    resume_skills = extract_skills_from_text(
        resume_text
    )

    # ========================================================
    # JOB SKILLS
    # ========================================================

    job_skills = extract_skills_from_text(
        job_description
    )

    # Add skills from required_skills field
    if required_skills_text:

        additional_skills = (
            extract_skills_from_text(
                required_skills_text
            )
        )

        for skill in additional_skills:

            if skill not in job_skills:

                job_skills.append(
                    skill
                )

    job_skills = sorted(
        set(job_skills),
        key=str.lower,
    )

    # ========================================================
    # MATCHED SKILLS
    # ========================================================

    resume_skill_set = {
        skill.lower()
        for skill in resume_skills
    }

    matched_skills = [
        skill
        for skill in job_skills
        if skill.lower()
        in resume_skill_set
    ]

    # ========================================================
    # MISSING SKILLS
    # ========================================================

    missing_skills = [
        skill
        for skill in job_skills
        if skill.lower()
        not in resume_skill_set
    ]

    # ========================================================
    # RESUME KEYWORDS
    # ========================================================

    resume_keywords = extract_keywords(
        resume_text
    )

    # ========================================================
    # JOB TEXT
    # ========================================================

    job_text = (
        job_description
        + " "
        + (required_skills_text or "")
    )

    # ========================================================
    # JOB KEYWORDS
    # ========================================================

    job_keywords = extract_keywords(
        job_text
    )

    # ========================================================
    # MATCHED KEYWORDS
    # ========================================================

    matched_keywords = [
        keyword
        for keyword in job_keywords
        if keyword in resume_keywords
    ]

    # ========================================================
    # MISSING KEYWORDS
    # ========================================================

    missing_keywords = [
        keyword
        for keyword in job_keywords
        if keyword not in resume_keywords
    ]

    # ========================================================
    # CALCULATE SKILL SCORE
    # ========================================================

    skill_score = calculate_skill_score(
        job_skills,
        resume_skills,
    )

    # ========================================================
    # CALCULATE KEYWORD SCORE
    # ========================================================

    keyword_score = calculate_keyword_score(
        job_keywords,
        resume_keywords,
    )

    # ========================================================
    # CALCULATE TF-IDF TEXT SIMILARITY
    # ========================================================

    text_similarity = calculate_text_similarity(
        resume_text,
        job_text,
    )

    # ========================================================
    # CALCULATE EXPERIENCE MATCH
    # ========================================================

    experience_match = calculate_experience_match(
        resume_text,
        job_text,
    )

    # ========================================================
    # FINAL MATCH SCORE
    # ========================================================
    #
    # Skill Match       = 50%
    # Keyword Match     = 20%
    # Text Similarity   = 30%
    #
    # Experience match is reported separately.
    # ========================================================

    match_score = (
        (skill_score * 0.50)
        + (keyword_score * 0.20)
        + (text_similarity * 0.30)
    )

    match_score = round(
        match_score,
        2,
    )

    # ========================================================
    # SUMMARY
    # ========================================================

    summary = (
        f"The resume matches "
        f"{len(matched_skills)} out of "
        f"{len(job_skills)} identified required skills. "
        f"Skill alignment is {skill_score}%, "
        f"keyword alignment is {keyword_score}%, "
        f"and text similarity is {text_similarity}%. "
        f"Experience match is {experience_match}%. "
        f"The overall job match score is "
        f"{match_score}%."
    )

    # ========================================================
    # RECOMMENDATIONS
    # ========================================================

    recommendations = generate_recommendations(
        missing_skills,
        match_score,
        experience_match,
    )

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "experience_match": experience_match,
        "summary": summary,
        "recommendations": recommendations,
    }