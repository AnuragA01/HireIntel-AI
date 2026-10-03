import re
from collections import Counter
from typing import Any

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ============================================================
# CANONICAL SKILLS
# ============================================================

SKILL_ALIASES = {
    "Python": ["python", "python3"],
    "Java": ["java"],
    "JavaScript": ["javascript", "js"],
    "TypeScript": ["typescript", "ts"],

    "C++": ["c++", "cpp"],
    "C#": ["c#", "c sharp"],

    "HTML": ["html", "html5"],
    "CSS": ["css", "css3"],

    "React": [
        "react",
        "react.js",
        "reactjs",
    ],

    "Angular": [
        "angular",
        "angular.js",
        "angularjs",
    ],

    "Vue": [
        "vue",
        "vue.js",
        "vuejs",
    ],

    "Node.js": [
        "node.js",
        "nodejs",
        "node js",
    ],

    "Express.js": [
        "express.js",
        "expressjs",
        "express js",
    ],

    "Django": ["django"],
    "Flask": ["flask"],

    "FastAPI": [
        "fastapi",
        "fast api",
    ],

    "Spring Boot": [
        "spring boot",
        "springboot",
    ],

    "PHP": ["php"],
    "Laravel": ["laravel"],

    "SQL": ["sql"],

    "MySQL": [
        "mysql",
    ],

    "PostgreSQL": [
        "postgresql",
        "postgres",
    ],

    "MongoDB": [
        "mongodb",
        "mongo db",
    ],

    "Oracle": ["oracle"],
    "Redis": ["redis"],

    "Git": ["git"],
    "GitHub": ["github"],
    "GitLab": ["gitlab"],

    "Docker": ["docker"],

    "Kubernetes": [
        "kubernetes",
        "k8s",
    ],

    "AWS": [
        "aws",
        "amazon web services",
    ],

    "Azure": [
        "azure",
        "microsoft azure",
    ],

    "GCP": [
        "gcp",
        "google cloud",
        "google cloud platform",
    ],

    "EC2": [
        "ec2",
        "amazon ec2",
    ],

    "S3": [
        "s3",
        "amazon s3",
    ],

    "Lambda": [
        "lambda",
        "aws lambda",
    ],

    "REST API": [
        "rest api",
        "rest apis",
        "restful api",
        "restful apis",
    ],

    "GraphQL": ["graphql"],

    "JWT": [
        "jwt",
        "json web token",
        "json web tokens",
    ],

    "OAuth": [
        "oauth",
        "oauth2",
        "oauth 2.0",
    ],

    "Machine Learning": [
        "machine learning",
        "ml",
    ],

    "Deep Learning": [
        "deep learning",
        "dl",
    ],

    "Artificial Intelligence": [
        "artificial intelligence",
        "ai",
    ],

    "NLP": [
        "nlp",
        "natural language processing",
    ],

    "Pandas": ["pandas"],
    "NumPy": ["numpy"],

    "Scikit-learn": [
        "scikit-learn",
        "sklearn",
    ],

    "TensorFlow": ["tensorflow"],
    "PyTorch": ["pytorch"],

    "Power BI": ["power bi"],
    "Tableau": ["tableau"],

    "Excel": [
        "excel",
        "microsoft excel",
    ],

    "RPA": [
        "rpa",
        "robotic process automation",
    ],

    "Linux": ["linux"],
    "Nginx": ["nginx"],
    "Jenkins": ["jenkins"],

    "CI/CD": [
        "ci/cd",
        "cicd",
        "continuous integration",
        "continuous delivery",
    ],

    "Terraform": ["terraform"],

    "Kafka": [
        "kafka",
        "apache kafka",
    ],

    "Hadoop": ["hadoop"],

    "Spark": [
        "spark",
        "apache spark",
    ],
}


# ============================================================
# GENERIC TERMS TO IGNORE
# ============================================================

GENERIC_TECH_TERMS = {
    "api",
    "apis",
}


# ============================================================
# RECRUITMENT / ENGLISH STOP WORDS
# ============================================================

STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "have",
    "in",
    "into",
    "is",
    "it",
    "its",
    "of",
    "on",
    "or",
    "our",
    "that",
    "the",
    "their",
    "this",
    "to",
    "with",
    "will",
    "we",
    "you",
    "your",
    "who",
    "they",
    "them",
    "these",
    "those",
    "than",
    "then",
    "there",
    "here",
    "about",
    "also",
    "can",
    "could",
    "would",
    "should",
    "must",
    "may",
    "might",

    "looking",
    "seeking",
    "need",
    "needed",

    "candidate",
    "candidates",
    "applicant",
    "applicants",

    "role",
    "position",
    "job",
    "work",
    "working",

    "team",
    "teams",

    "company",
    "organization",

    "responsibilities",
    "responsibility",

    "requirements",
    "requirement",

    "preferred",
    "plus",

    "good",
    "strong",
    "excellent",

    "knowledge",
    "understanding",
    "understand",

    "experience",
    "experiences",

    "years",
    "year",

    "skills",
    "skill",

    "using",
    "use",
    "used",

    "based",
    "related",

    "etc",

    "including",
    "include",

    "within",
    "through",
    "across",

    "provide",
    "providing",

    "develop",
    "developing",
    "development",

    "software",

    "technology",
    "technologies",

    "practices",
}


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text: str) -> str:

    text = str(text or "").lower()

    text = text.replace(
        "\u2013",
        "-"
    )

    text = text.replace(
        "\u2014",
        "-"
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


# ============================================================
# ALIAS REGEX
# ============================================================

def _alias_pattern(alias: str) -> str:

    alias = normalize_text(alias)

    escaped = re.escape(alias)

    escaped = escaped.replace(
        r"\ ",
        r"\s+"
    )

    return (
        rf"(?<![a-z0-9])"
        rf"{escaped}"
        rf"(?![a-z0-9])"
    )


# ============================================================
# CHECK ALIAS
# ============================================================

def contains_alias(
    text: str,
    alias: str
) -> bool:

    normalized = normalize_text(
        text
    )

    return (
        re.search(
            _alias_pattern(alias),
            normalized,
            flags=re.IGNORECASE,
        )
        is not None
    )


# ============================================================
# EXTRACT CANONICAL SKILLS
# ============================================================

def extract_skills(
    text: str
) -> list[str]:

    normalized = normalize_text(
        text
    )

    found = []

    ordered_skills = sorted(
        SKILL_ALIASES.items(),
        key=lambda item:
            max(
                len(alias)
                for alias in item[1]
            ),
        reverse=True,
    )

    for canonical, aliases in ordered_skills:

        if (
            canonical.lower()
            in GENERIC_TECH_TERMS
        ):
            continue

        matched = any(
            contains_alias(
                normalized,
                alias
            )
            for alias in aliases
        )

        if matched:
            found.append(
                canonical
            )

    return found


# ============================================================
# GET SKILL SPANS
# ============================================================

def _skill_alias_spans(
    text: str
) -> list[tuple[int, int]]:

    normalized = normalize_text(
        text
    )

    spans = []

    for aliases in SKILL_ALIASES.values():

        for alias in aliases:

            for match in re.finditer(
                _alias_pattern(alias),
                normalized,
                flags=re.IGNORECASE,
            ):

                spans.append(
                    match.span()
                )

    return spans


# ============================================================
# EXTRACT MEANINGFUL JOB KEYWORDS
# ============================================================

def extract_keywords(
    text: str
) -> list[str]:

    normalized = normalize_text(
        text
    )

    protected_spans = (
        _skill_alias_spans(
            normalized
        )
    )

    def is_protected(
        index: int
    ) -> bool:

        return any(
            start <= index < end
            for start, end
            in protected_spans
        )

    matches = re.finditer(
        r"[a-z][a-z0-9+#./-]{2,}",
        normalized,
    )

    words = []

    for match in matches:

        token = match.group(
            0
        ).strip(
            ".,;:!?()[]{}"
        )

        if not token:
            continue

        if is_protected(
            match.start()
        ):
            continue

        if token in STOP_WORDS:
            continue

        if token in GENERIC_TECH_TERMS:
            continue

        if len(token) < 3:
            continue

        if not re.search(
            r"[a-z]",
            token
        ):
            continue

        words.append(
            token
        )

    counts = Counter(
        words
    )

    keywords = sorted(
        counts.keys(),
        key=lambda word:
            (
                -counts[word],
                word,
            ),
    )

    return keywords[:30]


# ============================================================
# KEYWORD MATCHING
# ============================================================

def keyword_match(
    resume_text: str,
    job_keywords: list[str],
) -> tuple[list[str], list[str]]:

    resume_normalized = normalize_text(
        resume_text
    )

    matched = []
    missing = []

    for keyword in job_keywords:

        pattern = (
            rf"(?<![a-z0-9])"
            rf"{re.escape(keyword)}"
            rf"(?![a-z0-9])"
        )

        if re.search(
            pattern,
            resume_normalized,
            flags=re.IGNORECASE,
        ):

            matched.append(
                keyword
            )

        else:

            missing.append(
                keyword
            )

    return (
        matched,
        missing,
    )


# ============================================================
# EXPERIENCE EXTRACTION
# ============================================================

def extract_experience_years(
    text: str
) -> float | None:

    normalized = normalize_text(
        text
    )

    matches = re.findall(
        r"(?<!\d)"
        r"(\d+(?:\.\d+)?)"
        r"\s*\+?\s*"
        r"(?:years?|yrs?)\b",
        normalized,
    )

    values = [
        float(value)
        for value in matches
    ]

    if not values:
        return None

    return max(values)


# ============================================================
# JOB EXPERIENCE REQUIREMENT
# ============================================================

def extract_job_experience_requirement(
    text: str,
) -> tuple[
    float | None,
    float | None
]:

    normalized = normalize_text(
        text
    )

    # Example:
    # 0-2 years
    # 1 to 3 years

    range_match = re.search(
        r"(\d+(?:\.\d+)?)"
        r"\s*(?:-|to)\s*"
        r"(\d+(?:\.\d+)?)"
        r"\s*(?:years?|yrs?)",
        normalized,
    )

    if range_match:

        return (
            float(
                range_match.group(1)
            ),
            float(
                range_match.group(2)
            ),
        )

    # Example:
    # 3+ years

    plus_match = re.search(
        r"(\d+(?:\.\d+)?)"
        r"\s*\+"
        r"\s*(?:years?|yrs?)",
        normalized,
    )

    if plus_match:

        minimum = float(
            plus_match.group(1)
        )

        return (
            minimum,
            None,
        )

    # Example:
    # at least 3 years

    minimum_match = re.search(
        r"(?:at\s+least|minimum|min\.?)"
        r"\s*(\d+(?:\.\d+)?)"
        r"\s*(?:years?|yrs?)",
        normalized,
    )

    if minimum_match:

        minimum = float(
            minimum_match.group(1)
        )

        return (
            minimum,
            None,
        )

    # Example:
    # 2 years experience

    simple_match = re.search(
        r"(\d+(?:\.\d+)?)"
        r"\s*(?:years?|yrs?)"
        r"\s*(?:of\s+)?experience",
        normalized,
    )

    if simple_match:

        years = float(
            simple_match.group(1)
        )

        return (
            years,
            years,
        )

    return (
        None,
        None,
    )


# ============================================================
# EXPERIENCE MATCH SCORE
# ============================================================

def calculate_experience_match(
    resume_text: str,
    job_description: str,
) -> float:

    required_min, required_max = (
        extract_job_experience_requirement(
            job_description
        )
    )

    # No requirement found.
    if (
        required_min is None
        and required_max is None
    ):
        return 100.0

    resume_years = (
        extract_experience_years(
            resume_text
        )
    )

    # Resume doesn't explicitly state years.
    if resume_years is None:
        return 50.0

    # Candidate meets minimum requirement.
    if (
        required_min is not None
        and resume_years >= required_min
    ):
        return 100.0

    # Candidate is below minimum.
    if (
        required_min is not None
        and resume_years < required_min
    ):

        if required_min == 0:
            return 100.0

        return round(
            min(
                100.0,
                (
                    resume_years
                    / required_min
                )
                * 100,
            ),
            2,
        )

    return 100.0


# ============================================================
# TF-IDF TEXT SIMILARITY
# ============================================================

def calculate_text_similarity(
    resume_text: str,
    job_description: str,
) -> float:

    resume = normalize_text(
        resume_text
    )

    job = normalize_text(
        job_description
    )

    if not resume or not job:
        return 0.0

    try:

        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=800,
        )

        matrix = (
            vectorizer.fit_transform(
                [
                    resume,
                    job,
                ]
            )
        )

        similarity = (
            cosine_similarity(
                matrix[0:1],
                matrix[1:2],
            )[0][0]
        )

        return round(
            float(similarity)
            * 100,
            2,
        )

    except ValueError:

        return 0.0


# ============================================================
# SCORE LABEL
# ============================================================

def score_label(
    score: float
) -> str:

    if score >= 80:
        return "Excellent Match"

    if score >= 65:
        return "Good Match"

    if score >= 50:
        return "Moderate Match"

    return "Low Match"


# ============================================================
# RECOMMENDATIONS
# ============================================================

def generate_recommendations(
    missing_skills: list[str],
    missing_keywords: list[str],
    experience_match: float,
) -> list[str]:

    recommendations = []

    if missing_skills:

        skills = ", ".join(
            missing_skills[:5]
        )

        recommendations.append(
            "Prioritize learning or "
            "strengthening these job-specific "
            f"skills: {skills}."
        )

    if missing_keywords:

        keywords = ", ".join(
            missing_keywords[:5]
        )

        recommendations.append(
            "If these concepts genuinely "
            "reflect your experience, consider "
            "highlighting them in relevant "
            f"resume sections: {keywords}."
        )

    if experience_match < 70:

        recommendations.append(
            "Your detected experience does not "
            "fully align with the stated "
            "requirement. Add relevant projects, "
            "internships, or professional "
            "experience where applicable."
        )

    if not recommendations:

        recommendations.append(
            "Your resume is well aligned with "
            "the analyzed role. Keep your "
            "skills and project descriptions "
            "specific and measurable."
        )

    return recommendations[:5]


# ============================================================
# MAIN AI MATCHING ENGINE
# ============================================================

def match_resume_with_job_description(
    resume_text: str,
    job_description: str,
) -> dict[str, Any]:

    resume_text = str(
        resume_text or ""
    )

    job_description = str(
        job_description or ""
    )

    if not resume_text.strip():

        raise ValueError(
            "Resume text is empty."
        )

    if not job_description.strip():

        raise ValueError(
            "Job description is empty."
        )

    # ========================================================
    # 1. SKILLS
    # ========================================================

    resume_skills = set(
        extract_skills(
            resume_text
        )
    )

    job_skills = set(
        extract_skills(
            job_description
        )
    )

    matched_skills = sorted(
        resume_skills.intersection(
            job_skills
        )
    )

    missing_skills = sorted(
        job_skills.difference(
            resume_skills
        )
    )

    if job_skills:

        skill_score = (
            len(matched_skills)
            / len(job_skills)
        ) * 100

    else:

        skill_score = 0.0

    # ========================================================
    # 2. KEYWORDS
    # ========================================================

    job_keywords = extract_keywords(
        job_description
    )

    matched_keywords, missing_keywords = (
        keyword_match(
            resume_text,
            job_keywords,
        )
    )

    if job_keywords:

        keyword_score = (
            len(matched_keywords)
            / len(job_keywords)
        ) * 100

    else:

        keyword_score = 0.0

    # ========================================================
    # 3. TEXT SIMILARITY
    # ========================================================

    similarity_score = (
        calculate_text_similarity(
            resume_text,
            job_description,
        )
    )

    # ========================================================
    # 4. EXPERIENCE
    # ========================================================

    experience_match = (
        calculate_experience_match(
            resume_text,
            job_description,
        )
    )

    # ========================================================
    # 5. SCORE BREAKDOWN
    #
    # Skills       = 40%
    # Keywords     = 20%
    # Similarity   = 25%
    # Experience   = 15%
    # ========================================================

    score_breakdown = {

        "skills": round(
            skill_score,
            2,
        ),

        "keywords": round(
            keyword_score,
            2,
        ),

        "text_similarity": round(
            similarity_score,
            2,
        ),

        "experience": round(
            experience_match,
            2,
        ),
    }

    # ========================================================
    # 6. FINAL SCORE
    # ========================================================

    overall_score = (

        (skill_score * 0.40)

        + (
            keyword_score
            * 0.20
        )

        + (
            similarity_score
            * 0.25
        )

        + (
            experience_match
            * 0.15
        )
    )

    overall_score = round(
        min(
            100.0,
            max(
                0.0,
                overall_score,
            ),
        ),
        2,
    )

    # ========================================================
    # 7. SUMMARY
    # ========================================================

    if job_skills:

        skill_summary = (
            f"{len(matched_skills)} of "
            f"{len(job_skills)} identified "
            "technical skills"
        )

    else:

        skill_summary = (
            "No standardized technical "
            "skills were identified"
        )

    summary = (
        f"The resume matches "
        f"{skill_summary} from the job "
        f"description. The overall job "
        f"compatibility score is "
        f"{overall_score:.2f}% "
        f"({score_label(overall_score)})."
    )

    # ========================================================
    # 8. RECOMMENDATIONS
    # ========================================================

    recommendations = (
        generate_recommendations(
            missing_skills,
            missing_keywords,
            experience_match,
        )
    )

    # ========================================================
    # 9. FINAL RESPONSE
    # ========================================================

    return {

        "match_score":
            overall_score,

        "matched_skills":
            matched_skills,

        "missing_skills":
            missing_skills,

        "matched_keywords":
            matched_keywords,

        "missing_keywords":
            missing_keywords,

        "experience_match":
            round(
                experience_match,
                2,
            ),

        "summary":
            summary,

        "recommendations":
            recommendations,

        "score_breakdown":
            score_breakdown,

        "match_label":
            score_label(
                overall_score
            ),
    }