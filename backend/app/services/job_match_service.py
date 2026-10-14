
"""
HireIntel AI - Resume and Job Matching Service

Responsibilities:
- Extract skills from resumes and job descriptions.
- Normalize skill names and common variations.
- Compare job keywords against resume keywords.
- Calculate TF-IDF text similarity.
- Estimate experience alignment.
- Generate actionable recommendations.

Public interface:
    match_resume_with_job(
        resume_text,
        job_description,
        required_skills_text=None,
    )

The response keys are kept compatible with the existing API.
"""

import re
from functools import lru_cache

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.resume_analysis_service import SKILLS_DATABASE


# ============================================================
# CONFIGURATION
# ============================================================

SKILL_WEIGHT = 0.50
KEYWORD_WEIGHT = 0.20
TEXT_SIMILARITY_WEIGHT = 0.30

# Common variations mapped to a consistent skill name.
SKILL_ALIASES = {
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "restful api": "REST APIs",
    "restful apis": "REST APIs",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "reactjs": "React",
    "react.js": "React",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "expressjs": "Express.js",
    "express.js": "Express.js",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "mysql": "MySQL",
    "amazon web services": "AWS",
    "amazon aws": "AWS",
    "google cloud platform": "Google Cloud",
    "gcp": "Google Cloud",
    "continuous integration": "CI/CD",
    "continuous deployment": "CI/CD",
    "continuous integration and continuous deployment": "CI/CD",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "artificial intelligence": "Artificial Intelligence",
    "ai": "Artificial Intelligence",
    "scikit learn": "scikit-learn",
    "sklearn": "scikit-learn",
    "c sharp": "C#",
    "c plus plus": "C++",
    "dotnet": ".NET",
    "asp net": "ASP.NET",
    "asp.net core": "ASP.NET Core",
    "power bi": "Power BI",
    "ms excel": "Excel",
}

STOP_WORDS = {
    "the", "and", "for", "with", "from", "that", "this",
    "are", "you", "your", "our", "will", "have", "has",
    "job", "work", "working", "looking", "using", "years",
    "year", "experience", "required", "developer",
    "development", "role", "candidate", "team", "skills",
    "skill", "must", "should", "need", "needs",
    "responsibilities", "responsibility", "ability",
    "strong", "good", "excellent", "including", "such",
    "within", "across", "about", "into", "their", "them",
    "they", "who", "what", "when", "where", "which",
    "will", "can", "may", "not", "all", "any", "each",
    "more", "less", "than", "also", "both", "per",
}


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text: str) -> str:
    """Normalize text for matching and comparison."""
    if not text:
        return ""

    text = str(text).lower()
    text = text.replace("\u2013", "-").replace("\u2014", "-")
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def normalize_skill(skill: str) -> str:
    """
    Normalize a skill name while preserving a readable
    canonical representation.
    """
    skill = str(skill or "").strip()

    if not skill:
        return ""

    key = normalize_text(skill)
    key = re.sub(r"\s+", " ", key).strip(" ,;:")

    if key in SKILL_ALIASES:
        return SKILL_ALIASES[key]

    # Otherwise preserve the original skill's spelling.
    return skill


def _skill_key(skill: str) -> str:
    """Return a normalized comparison key for a skill."""
    canonical = normalize_skill(skill)
    return normalize_text(canonical)


def _unique_skills(skills: list[str]) -> list[str]:
    """Remove duplicate skills while preserving their order."""
    results = []
    seen = set()

    for skill in skills:
        canonical = normalize_skill(skill)

        if not canonical:
            continue

        key = _skill_key(canonical)

        if key not in seen:
            seen.add(key)
            results.append(canonical)

    return results


# ============================================================
# SKILL DATABASE HELPERS
# ============================================================

@lru_cache(maxsize=1)
def _get_database_skills() -> tuple[str, ...]:
    """
    Read skills from SKILLS_DATABASE.

    Supports a list, tuple, set, dictionary, or nested
    dictionary/list structure.
    """
    collected = []

    def collect(value):
        if isinstance(value, str):
            value = value.strip()

            if value:
                collected.append(value)

        elif isinstance(value, dict):
            # Skill databases are commonly dictionaries whose
            # keys or values contain skill names.
            for key, item in value.items():
                if isinstance(key, str):
                    collected.append(key)

                collect(item)

        elif isinstance(value, (list, tuple, set)):
            for item in value:
                collect(item)

    collect(SKILLS_DATABASE)

    return tuple(_unique_skills(collected))


def _skill_pattern(skill: str):
    """
    Build a regex that recognizes a skill as a complete term.

    This avoids matching 'Java' inside 'JavaScript'.
    """
    escaped = re.escape(skill)

    # Treat whitespace and hyphens as interchangeable
    # separators for common skill-name variations.
    escaped = escaped.replace(r"\ ", r"[\s\-]+")

    return re.compile(
        rf"(?<!\w){escaped}(?!\w)",
        flags=re.IGNORECASE,
    )


def extract_skills_from_text(text: str) -> list[str]:
    """Extract recognized skills from a block of text."""
    if not text:
        return []

    normalized = normalize_text(text)
    found = []

    for skill in _get_database_skills():
        pattern = _skill_pattern(skill)

        if pattern.search(normalized):
            found.append(normalize_skill(skill))

    # Handle known aliases even if the alias is not listed
    # explicitly in SKILLS_DATABASE.
    for alias, canonical in SKILL_ALIASES.items():
        if _skill_pattern(alias).search(normalized):
            found.append(canonical)

    return _unique_skills(found)


# ============================================================
# KEYWORD EXTRACTION
# ============================================================

def extract_keywords(text: str) -> list[str]:
    """
    Extract useful, unique keywords.

    Keeps technical terms such as C++, C#, .NET, Node.js,
    REST APIs and CI/CD.
    """
    normalized = normalize_text(text)

    if not normalized:
        return []

    # Find words and common technical terms.
    tokens = re.findall(
        r"(?<!\w)[a-z][a-z0-9]*(?:[+#.][a-z0-9+#.]*)*",
        normalized,
    )

    keywords = []
    seen = set()

    for token in tokens:
        token = token.strip(".+#")

        if len(token) < 2:
            continue

        if token in STOP_WORDS:
            continue

        if token not in seen:
            seen.add(token)
            keywords.append(token)

    return keywords


# ============================================================
# SKILL SCORE
# ============================================================

def calculate_skill_score(
    required_skills: list[str],
    resume_skills: list[str],
) -> float:
    """Calculate the percentage of required skills found."""
    required = {
        _skill_key(skill)
        for skill in required_skills
        if _skill_key(skill)
    }

    resume = {
        _skill_key(skill)
        for skill in resume_skills
        if _skill_key(skill)
    }

    if not required:
        return 0.0

    matched = required.intersection(resume)

    return round(len(matched) / len(required) * 100, 2)


# ============================================================
# KEYWORD SCORE
# ============================================================

def calculate_keyword_score(
    job_keywords: list[str],
    resume_keywords: list[str],
) -> float:
    """Calculate the percentage of job keywords in the resume."""
    job_set = set(job_keywords)
    resume_set = set(resume_keywords)

    if not job_set:
        return 0.0

    matched = job_set.intersection(resume_set)

    return round(len(matched) / len(job_set) * 100, 2)


# ============================================================
# TEXT SIMILARITY
# ============================================================

def calculate_text_similarity(
    resume_text: str,
    job_text: str,
) -> float:
    """
    Calculate TF-IDF cosine similarity as a percentage.

    Returns zero when either text is empty or the vectorizer
    cannot calculate a meaningful comparison.
    """
    resume_text = normalize_text(resume_text)
    job_text = normalize_text(job_text)

    if not resume_text or not job_text:
        return 0.0

    try:
        vectorizer = TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            sublinear_tf=True,
        )

        vectors = vectorizer.fit_transform(
            [resume_text, job_text]
        )

        similarity = cosine_similarity(
            vectors[0:1],
            vectors[1:2],
        )[0][0]

        return round(float(similarity) * 100, 2)

    except (ValueError, TypeError):
        return 0.0


# ============================================================
# EXPERIENCE MATCHING
# ============================================================

def _extract_experience_years(text: str) -> list[float]:
    """
    Extract explicitly stated experience durations.

    Examples:
        2 years of experience
        1.5 years experience
        6 months of experience
        18 months of professional experience
    """
    normalized = normalize_text(text)
    years = []

    # Years: 1 year, 2.5 years, 3 yrs.
    year_pattern = re.compile(
        r"(?<![\w.])(\d+(?:\.\d+)?)\s*"
        r"(?:\+?\s*)?(?:years?|yrs?)(?!\w)",
        re.IGNORECASE,
    )

    for match in year_pattern.finditer(normalized):
        value = float(match.group(1))

        # Avoid interpreting an implausibly large number
        # as work experience.
        if 0 <= value <= 60:
            years.append(value)

    # Months: 6 months, 18 months.
    month_pattern = re.compile(
        r"(?<!\w)(\d+)\s*months?(?!\w)",
        re.IGNORECASE,
    )

    for match in month_pattern.finditer(normalized):
        value = int(match.group(1))

        if 0 <= value <= 720:
            years.append(value / 12)

    return years


def _extract_required_experience(job_text: str):
    """
    Extract the minimum and optional maximum experience
    from a job description.

    Returns:
        (minimum_years, maximum_years)

    A missing minimum means no reliable numeric requirement
    was found.
    """
    text = normalize_text(job_text)

    # Examples: 1-3 years, 1 to 3 years, 1–3 yrs.
    range_pattern = re.compile(
        r"(?<!\d)(\d+(?:\.\d+)?)\s*"
        r"(?:-|to)\s*"
        r"(\d+(?:\.\d+)?)\s*"
        r"(?:years?|yrs?)",
        re.IGNORECASE,
    )

    match = range_pattern.search(text)

    if match:
        minimum = float(match.group(1))
        maximum = float(match.group(2))

        if maximum >= minimum:
            return minimum, maximum

    # Examples: 2+ years, minimum 2 years, at least 2 years.
    minimum_patterns = [
        r"(?:at least|minimum of|min\.?)\s*"
        r"(\d+(?:\.\d+)?)\s*(?:\+?\s*)?(?:years?|yrs?)",

        r"(\d+(?:\.\d+)?)\s*\+\s*(?:years?|yrs?)",

        r"(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\s+"
        r"(?:of\s+)?(?:relevant\s+)?experience\s+"
        r"(?:required|minimum)",
    ]

    for pattern in minimum_patterns:
        match = re.search(pattern, text, re.IGNORECASE)

        if match:
            return float(match.group(1)), None

    # Examples: 2 years of experience required.
    ordinary_pattern = re.compile(
        r"(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\s+"
        r"(?:of\s+)?(?:relevant\s+)?experience",
        re.IGNORECASE,
    )

    match = ordinary_pattern.search(text)

    if match:
        return float(match.group(1)), None

    return None, None


def calculate_experience_match(
    resume_text: str,
    job_text: str,
) -> float:
    """
    Estimate experience alignment as a percentage.

    Important:
    - Explicit numeric experience is preferred.
    - Student/fresher wording alone does not prove zero
      work experience.
    - If experience cannot be determined, return 50 rather
      than assuming a perfect match.
    """
    resume = normalize_text(resume_text)
    job = normalize_text(job_text)

    required_min, required_max = _extract_required_experience(
        job
    )

    # If the job does not specify a numeric requirement,
    # do not penalize the candidate for unknown experience.
    if required_min is None:
        return 100.0

    experience_values = _extract_experience_years(resume)

    # Prefer an explicitly stated total experience duration.
    # The largest value is used as a simple approximation;
    # this is not a full employment-history calculator.
    if experience_values:
        actual_years = max(experience_values)

        if actual_years >= required_min:
            return 100.0

        if required_min <= 0:
            return 100.0

        return round(
            min(actual_years / required_min * 100, 100.0),
            2,
        )

    # No explicit number: use only cautious contextual clues.
    entry_level_job = bool(
        re.search(
            r"\b("
            r"entry[- ]level|fresher|freshers|"
            r"graduate role|junior role|internship|"
            r"interns? wanted|no experience required|"
            r"0\s*(?:-|to)\s*\d+\s*(?:years?|yrs?)"
            r")\b",
            job,
        )
    )

    fresher_resume = bool(
        re.search(
            r"\b("
            r"fresher|recent graduate|new graduate|"
            r"entry[- ]level candidate|"
            r"seeking first job|no professional experience"
            r")\b",
            resume,
        )
    )

    if required_min == 0:
        return 100.0

    if entry_level_job and fresher_resume:
        return 100.0

    # No explicit experience number means we cannot reliably
    # confirm whether the requirement is met.
    return 50.0


# ============================================================
# RECOMMENDATIONS
# ============================================================

def generate_recommendations(
    missing_skills: list[str],
    match_score: float,
    experience_match: float,
) -> list[str]:
    """Generate recommendations based on matching results."""
    recommendations = []

    if missing_skills:
        skills_text = ", ".join(missing_skills[:5])

        recommendations.append(
            f"Improve or add these skills: {skills_text}."
        )

    if experience_match < 50:
        recommendations.append(
            "Consider gaining more practical experience through "
            "projects, internships, or relevant work experience."
        )
    elif experience_match < 100:
        recommendations.append(
            "Make relevant employment dates, project durations, "
            "and practical experience clear on the resume."
        )

    if match_score < 50:
        recommendations.append(
            "The resume has limited alignment with this job. "
            "Tailor it to the required skills and responsibilities."
        )
    elif match_score < 75:
        recommendations.append(
            "The resume has moderate alignment. Adding relevant "
            "skills and project details may improve the match."
        )
    else:
        recommendations.append(
            "The resume has strong alignment with the selected job. "
            "Verify the candidate's skills and experience during "
            "the recruitment process."
        )

    if not recommendations:
        recommendations.append(
            "Review the resume and job requirements together "
            "to confirm the candidate's suitability."
        )

    return recommendations


# ============================================================
# MAIN RESUME-JOB MATCHING FUNCTION
# ============================================================

def match_resume_with_job(
    resume_text: str,
    job_description: str,
    required_skills_text: str | None = None,
) -> dict:
    """
    Compare a resume with a job description.

    Preserves the existing API response fields:
        match_score
        matched_skills
        missing_skills
        matched_keywords
        missing_keywords
        experience_match
        summary
        recommendations
    """
    resume_text = str(resume_text or "").strip()
    job_description = str(job_description or "").strip()
    required_skills_text = str(
        required_skills_text or ""
    ).strip()

    # Combine the job description and explicit skill field.
    job_text = " ".join(
        part
        for part in [job_description, required_skills_text]
        if part
    ).strip()

    # Do not create misleading scores for empty input.
    if not resume_text or not job_text:
        return {
            "match_score": 0.0,
            "matched_skills": [],
            "missing_skills": [],
            "matched_keywords": [],
            "missing_keywords": [],
            "experience_match": 50.0,
            "summary": (
                "A resume and a job description are both required "
                "to calculate a meaningful match."
            ),
            "recommendations": [
                "Provide extracted resume text and a job description "
                "before running the matching analysis."
            ],
        }

    # --------------------------------------------------------
    # SKILLS
    # --------------------------------------------------------

    resume_skills = extract_skills_from_text(resume_text)

    job_skills = extract_skills_from_text(job_text)

    resume_skill_keys = {
        _skill_key(skill)
        for skill in resume_skills
    }

    matched_skills = [
        skill
        for skill in job_skills
        if _skill_key(skill) in resume_skill_keys
    ]

    missing_skills = [
        skill
        for skill in job_skills
        if _skill_key(skill) not in resume_skill_keys
    ]

    # --------------------------------------------------------
    # KEYWORDS
    # --------------------------------------------------------

    resume_keywords = extract_keywords(resume_text)
    job_keywords = extract_keywords(job_text)

    resume_keyword_set = set(resume_keywords)

    matched_keywords = [
        keyword
        for keyword in job_keywords
        if keyword in resume_keyword_set
    ]

    missing_keywords = [
        keyword
        for keyword in job_keywords
        if keyword not in resume_keyword_set
    ]

    # --------------------------------------------------------
    # COMPONENT SCORES
    # --------------------------------------------------------

    skill_score = calculate_skill_score(
        job_skills,
        resume_skills,
    )

    keyword_score = calculate_keyword_score(
        job_keywords,
        resume_keywords,
    )

    text_similarity = calculate_text_similarity(
        resume_text,
        job_text,
    )

    experience_match = calculate_experience_match(
        resume_text,
        job_text,
    )

    # --------------------------------------------------------
    # FINAL MATCH SCORE
    # --------------------------------------------------------

    # Preserve the project's existing scoring weights.
    match_score = (
        skill_score * SKILL_WEIGHT
        + keyword_score * KEYWORD_WEIGHT
        + text_similarity * TEXT_SIMILARITY_WEIGHT
    )

    match_score = round(
        max(0.0, min(match_score, 100.0)),
        2,
    )

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    if job_skills:
        skill_summary = (
            f"The resume matches {len(matched_skills)} out of "
            f"{len(job_skills)} identified job skills."
        )
    else:
        skill_summary = (
            "No recognized technical skills were identified "
            "in the job description."
        )

    summary = (
        f"{skill_summary} "
        f"Skill alignment is {skill_score}%, "
        f"keyword alignment is {keyword_score}%, "
        f"and text similarity is {text_similarity}%. "
        f"Experience match is {experience_match}%. "
        f"The overall job match score is {match_score}%."
    )

    # --------------------------------------------------------
    # RECOMMENDATIONS
    # --------------------------------------------------------

    recommendations = generate_recommendations(
        missing_skills=missing_skills,
        match_score=match_score,
        experience_match=experience_match,
    )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

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
