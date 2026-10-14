
import re
import logging
from typing import Any

logger = logging.getLogger(__name__)

# Shared skills database used by resume analysis and job matching.
SKILLS_DATABASE = [
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "C",
    "C++",
    "C#",
    "SQL",
    "HTML",
    "CSS",
    "React",
    "React.js",
    "Node.js",
    "Express.js",
    "FastAPI",
    "Flask",
    "Django",
    "Spring Boot",
    "REST API",
    "REST APIs",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "SQLite",
    "Oracle",
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "Git",
    "GitHub",
    "Linux",
    "Machine Learning",
    "Deep Learning",
    "Artificial Intelligence",
    "Generative AI",
    "NLP",
    "Natural Language Processing",
    "Pandas",
    "NumPy",
    "Scikit-learn",
    "TensorFlow",
    "PyTorch",
    "Power BI",
    "Tableau",
    "Microsoft Excel",
    "Excel",
    "Data Analysis",
    "Data Visualization",
    "ETL",
    "Data Structures",
    "Algorithms",
    "Object-Oriented Programming",
    "OOP",
    "Agile",
    "Scrum",
    "CI/CD",
    "Jenkins",
    "Postman",
    "Selenium",
    "Testing",
    "Debugging",
    "Communication",
    "Problem Solving",
]



# ============================================================
# SKILLS AND KEYWORDS
# ============================================================

SKILL_ALIASES = {
    "Python": ["python"],
    "Java": ["java"],
    "JavaScript": ["javascript", "js"],
    "TypeScript": ["typescript"],
    "C": ["programming language c"],
    "C++": ["c++"],
    "C#": ["c#"],
    "SQL": ["sql", "structured query language"],
    "HTML": ["html"],
    "CSS": ["css"],
    "React.js": ["react.js", "reactjs", "react"],
    "Node.js": ["node.js", "nodejs"],
    "Express.js": ["express.js", "expressjs"],
    "FastAPI": ["fastapi", "fast api"],
    "Django": ["django"],
    "Flask": ["flask"],
    "REST API": ["rest api", "restful api", "rest apis"],
    "MySQL": ["mysql"],
    "PostgreSQL": ["postgresql", "postgres"],
    "MongoDB": ["mongodb", "mongo db"],
    "SQLite": ["sqlite"],
    "SQLAlchemy": ["sqlalchemy"],
    "Git": ["git"],
    "GitHub": ["github"],
    "Docker": ["docker"],
    "Kubernetes": ["kubernetes"],
    "AWS": ["aws", "amazon web services"],
    "Microsoft Azure": ["azure", "microsoft azure"],
    "Google Cloud": ["google cloud", "gcp"],
    "Linux": ["linux"],
    "Power BI": ["power bi"],
    "Tableau": ["tableau"],
    "Microsoft Excel": ["microsoft excel", "ms excel", "excel"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "Machine Learning": ["machine learning"],
    "Deep Learning": ["deep learning"],
    "Natural Language Processing": ["natural language processing", "nlp"],
    "Generative AI": ["generative ai", "genai"],
    "OpenCV": ["opencv"],
    "TensorFlow": ["tensorflow"],
    "PyTorch": ["pytorch"],
    "Scikit-learn": ["scikit-learn", "sklearn"],
    "Data Analysis": ["data analysis", "data analytics"],
    "Data Visualization": ["data visualization"],
    "Object-Oriented Programming": [
        "object-oriented programming",
        "oops",
        "oop",
    ],
    "Problem Solving": ["problem solving"],
    "Agile": ["agile"],
    "Jira": ["jira"],
    "JWT Authentication": ["jwt", "json web token", "json web tokens"],
    "OAuth": ["oauth"],
    "Spring Boot": ["spring boot"],
    "Java Servlets": ["servlet", "servlets"],
    "PHP": ["php"],
    "Bootstrap": ["bootstrap"],
    "Vite": ["vite"],
    "Jupyter Notebook": ["jupyter notebook"],
}

SECTION_ALIASES = {
    "summary": {
        "summary",
        "professional summary",
        "profile",
        "professional profile",
        "career objective",
        "objective",
        "about me",
    },
    "skills": {
        "skills",
        "technical skills",
        "core skills",
        "key skills",
        "technical expertise",
        "technologies",
        "technology stack",
    },
    "education": {
        "education",
        "educational qualifications",
        "academic qualifications",
        "academic background",
    },
    "experience": {
        "experience",
        "work experience",
        "professional experience",
        "employment history",
        "internship",
        "internships",
    },
    "projects": {
        "projects",
        "academic projects",
        "personal projects",
        "project experience",
        "key projects",
    },
    "certifications": {
        "certifications",
        "certificates",
        "licenses and certifications",
        "courses",
        "courses and certifications",
    },
    "achievements": {
        "achievements",
        "awards",
        "accomplishments",
        "honors",
    },
}

STOP_WORDS = {
    "the", "and", "for", "with", "from", "this", "that", "have",
    "has", "had", "was", "were", "are", "you", "your", "our",
    "their", "they", "them", "will", "would", "could", "should",
    "can", "not", "but", "all", "any", "into", "about", "over",
    "under", "using", "used", "use", "based", "which", "who",
    "what", "when", "where", "how", "its", "also", "more",
    "than", "then", "such", "other", "each", "per", "very",
    "able", "responsible", "responsibilities", "role", "roles",
    "work", "worked", "working", "experience", "project",
    "projects", "resume", "candidate", "student", "team",
    "teams", "including", "etc", "through", "within",
}

ACTION_VERBS = {
    "built", "developed", "designed", "implemented", "created",
    "automated", "analyzed", "improved", "optimized", "deployed",
    "managed", "tested", "integrated", "delivered", "configured",
    "maintained", "reduced", "increased", "led", "processed",
}


# ============================================================
# GENERAL HELPERS
# ============================================================

def normalize_heading(line: str) -> str:
    """Normalize a possible resume section heading safely."""
    if not isinstance(line, str):
        return ""

    cleaned = line.strip().lower()
    cleaned = re.sub(r"^[\s#*`_\\\-|:]+", "", cleaned)
    cleaned = re.sub(r"[\s#*`_\\\-|:]+$", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)

    return cleaned.strip()


def normalize_text(text: str) -> str:
    """Normalize whitespace without removing meaningful content."""
    text = text.replace("\x00", " ")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_section(text: str, section_name: str) -> str:
    """Return text belonging to a recognized resume section."""
    lines = text.splitlines()
    aliases = SECTION_ALIASES.get(section_name, set())

    start_index = None
    content = []

    for index, line in enumerate(lines):
        heading = normalize_heading(line)

        # Headings like "TECHNICAL SKILLS:" are supported.
        heading_without_colon = heading.rstrip(":").strip()

        if start_index is None:
            if (
                heading in aliases
                or heading_without_colon in aliases
            ):
                start_index = index + 1
            continue

        # Stop when another known section begins.
        if any(
            heading_without_colon in known_aliases
            for known_aliases in SECTION_ALIASES.values()
        ):
            break

        content.append(line)

    return "\n".join(content).strip()


def _has_term(text: str, term: str) -> bool:
    """Match a skill phrase without matching arbitrary substrings."""
    pattern = r"(?<![a-z0-9])" + re.escape(term.lower()) + r"(?![a-z0-9])"
    return re.search(pattern, text.lower()) is not None


def _unique(items: list[str]) -> list[str]:
    """Deduplicate strings while preserving their order."""
    result = []
    seen = set()

    for item in items:
        cleaned = str(item).strip()
        key = cleaned.casefold()

        if cleaned and key not in seen:
            result.append(cleaned)
            seen.add(key)

    return result


def _clean_lines(text: str) -> list[str]:
    """Return useful, cleaned non-empty resume lines."""
    result = []

    for line in text.splitlines():
        cleaned = re.sub(r"^\s*(?:[-*•▪◦]+|\d+[.)])\s*", "", line)
        cleaned = cleaned.strip()

        if cleaned:
            result.append(cleaned)

    return result


# ============================================================
# SKILLS AND KEYWORDS
# ============================================================

def extract_skills(text: str) -> list[str]:
    """Extract recognized technical skills from the resume."""
    normalized = text.lower()
    found = []

    for canonical_name, aliases in SKILL_ALIASES.items():
        for alias in aliases:
            if _has_term(normalized, alias):
                found.append(canonical_name)
                break

    return _unique(found)


def extract_keywords(text: str, skills: list[str]) -> list[str]:
    """Extract useful technical terms and avoid generic filler words."""
    normalized = text.lower()
    keywords = list(skills)

    # Common job-search and technical keywords.
    useful_phrases = [
        "full stack development",
        "frontend development",
        "backend development",
        "web development",
        "software development",
        "database design",
        "data structures",
        "algorithms",
        "cloud computing",
        "responsive design",
        "API integration",
        "authentication",
        "authorization",
        "data cleaning",
        "data visualization",
        "version control",
        "unit testing",
        "integration testing",
        "continuous integration",
        "continuous deployment",
        "requirements analysis",
        "report generation",
        "automation",
        "debugging",
        "deployment",
    ]

    for phrase in useful_phrases:
        if _has_term(normalized, phrase):
            keywords.append(phrase.title())

    return _unique(keywords)[:40]


# ============================================================
# SECTION EXTRACTION
# ============================================================

def extract_education(text: str) -> str:
    section = extract_section(text, "education")

    if section:
        return section

    # Conservative fallback: use only lines with education evidence.
    education_terms = (
        "b.tech", "bachelor", "master", "m.tech", "b.e.",
        "b.sc", "m.sc", "bca", "mca", "diploma", "university",
        "college", "cgpa", "gpa", "graduation", "degree",
        "higher secondary", "12th standard", "10th standard",
    )

    lines = _clean_lines(text)
    matches = [
        line for line in lines
        if any(term in line.lower() for term in education_terms)
    ]

    return "\n".join(matches[:8])


def extract_experience(text: str) -> str:
    section = extract_section(text, "experience")

    if section:
        return section

    lines = _clean_lines(text)
    experience_terms = (
        "intern", "employment", "developer", "engineer",
        "analyst", "worked at", "company", "professional experience",
    )

    matches = [
        line for line in lines
        if any(term in line.lower() for term in experience_terms)
    ]

    return "\n".join(matches[:10])


def extract_projects(text: str) -> str:
    section = extract_section(text, "projects")

    if section:
        return section

    lines = _clean_lines(text)
    project_terms = (
        "project", "developed a", "built a", "designed a",
        "implemented a", "github.com",
    )

    matches = [
        line for line in lines
        if any(term in line.lower() for term in project_terms)
    ]

    return "\n".join(matches[:12])


def extract_certifications(text: str) -> str:
    section = extract_section(text, "certifications")

    if section:
        return section

    lines = _clean_lines(text)
    terms = (
        "certification", "certified", "certificate",
        "credential", "course completion",
    )

    matches = [
        line for line in lines
        if any(term in line.lower() for term in terms)
    ]

    return "\n".join(matches[:8])


# ============================================================
# PROFESSIONAL SUMMARY
# ============================================================

def _infer_candidate_level(
    experience: str,
    education: str,
    text: str,
) -> str:
    """Infer a cautious career level from explicit resume evidence."""
    lower = text.lower()

    if re.search(r"\b(senior|lead|principal)\b", lower):
        return "experienced professional"

    if re.search(r"\b(0|1|2)\s*\+?\s*years?\b", lower):
        if any(word in lower for word in ("intern", "student", "fresher")):
            return "early-career candidate"

    if experience and len(experience.splitlines()) >= 2:
        return "professional"

    if any(
        word in (education + " " + text).lower()
        for word in ("student", "pursuing", "final year", "fresher")
    ):
        return "early-career candidate"

    if experience:
        return "candidate with relevant experience"

    return "candidate"


def generate_professional_summary(
    text: str,
    skills: list[str],
    education: str,
    experience: str,
    projects: str,
) -> str:
    """Build a concise summary from information actually found."""
    lines = _clean_lines(text)

    # Reuse an existing summary only if it looks like real prose.
    existing = extract_section(text, "summary")
    if existing:
        existing_lines = _clean_lines(existing)
        candidate_summary = " ".join(existing_lines)

        if (
            len(candidate_summary.split()) >= 12
            and len(candidate_summary.split()) <= 65
        ):
            return candidate_summary

    level = _infer_candidate_level(experience, education, text)
    skill_text = ", ".join(skills[:5])

    project_lines = _clean_lines(projects)
    project_evidence = ""

    if project_lines:
        project_evidence = project_lines[0][:180]

    education_lines = _clean_lines(education)
    education_evidence = ""

    if education_lines:
        education_evidence = education_lines[0][:150]

    # Avoid inventing a degree, job title, or years of experience.
    parts = []

    if skill_text:
        parts.append(
            f"{level.capitalize()} with knowledge of {skill_text}"
        )
    else:
        parts.append(
            f"Motivated {level} seeking to apply technical and problem-solving skills"
        )

    if project_evidence:
        parts.append(
            f"with project experience including {project_evidence}"
        )
    elif experience:
        first_experience = _clean_lines(experience)
        if first_experience:
            parts.append(
                f"with experience described as {first_experience[0][:160]}"
            )

    if education_evidence:
        parts.append(f"Education includes {education_evidence}")

    summary = ". ".join(parts).strip()

    if summary and not summary.endswith("."):
        summary += "."

    return summary


# ============================================================
# STRENGTHS AND RECOMMENDATIONS
# ============================================================

def extract_strengths(
    text: str,
    skills: list[str],
    education: str,
    experience: str,
    projects: str,
    certifications: str,
) -> list[str]:
    strengths = []

    if len(skills) >= 5:
        strengths.append(
            f"Demonstrates a range of technical skills ({len(skills)} recognized skills)."
        )
    elif skills:
        strengths.append(
            f"Includes identifiable technical skills: {', '.join(skills[:5])}."
        )

    if projects:
        strengths.append(
            "Project information is present and can help demonstrate practical work."
        )

    if experience:
        strengths.append(
            "Experience or internship information is present."
        )

    if education:
        strengths.append(
            "Education information is present."
        )

    if certifications:
        strengths.append(
            "Certification or course information is present."
        )

    if re.search(r"\b\d+(?:\.\d+)?\s*%", text):
        strengths.append(
            "The resume contains at least one percentage-based result or metric."
        )

    if not strengths:
        strengths.append(
            "The resume text was extracted. Add clearly labeled sections and specific achievements to make it more useful."
        )

    return strengths


def extract_weaknesses(
    text: str,
    skills: list[str],
    education: str,
    experience: str,
    projects: str,
    certifications: str,
) -> list[str]:
    weaknesses = []

    if len(text.split()) < 100:
        weaknesses.append(
            "The extracted resume is short. Verify that the complete resume text was extracted."
        )

    if not extract_section(text, "summary"):
        weaknesses.append(
            "No clearly labeled professional summary or objective section was found."
        )

    if not skills:
        weaknesses.append(
            "No recognized technical skills were found. Add a clearly labeled Skills section."
        )

    if not education:
        weaknesses.append(
            "Education details were not confidently identified."
        )

    if not experience:
        weaknesses.append(
            "Work experience or internship details were not confidently identified."
        )

    if not projects:
        weaknesses.append(
            "Project details were not confidently identified."
        )

    if not certifications:
        weaknesses.append(
            "No certifications were identified. Include relevant certifications if you have them."
        )

    if not re.search(r"\b\d+(?:\.\d+)?\s*(?:%|percent|users|records|hours|days)\b", text, re.I):
        weaknesses.append(
            "Few measurable outcomes were detected. Add truthful metrics where possible."
        )

    return weaknesses


def generate_recommendations(weaknesses: list[str]) -> list[str]:
    recommendations = []

    mapping = [
        (
            "short",
            "Verify that the full resume was extracted and include relevant project, experience, and achievement details.",
        ),
        (
            "summary",
            "Add a concise 2–4 sentence professional summary tailored to the role you want.",
        ),
        (
            "skills",
            "Add a clearly labeled Skills section containing relevant tools, technologies, and programming languages you can use.",
        ),
        (
            "education",
            "Use a clear Education heading and list the degree, institution, and graduation year.",
        ),
        (
            "experience",
            "Describe internships and employment with role, organization, dates, and contributions.",
        ),
        (
            "project",
            "Describe 2–4 relevant projects with the problem, your contribution, technologies, and outcome.",
        ),
        (
            "certification",
            "List relevant certifications only if completed, including the issuing organization.",
        ),
        (
            "metric",
            "Add truthful measurable results where available, such as processing time reduced or records handled.",
        ),
    ]

    for weakness in weaknesses:
        lower = weakness.lower()

        for key, recommendation in mapping:
            if key in lower and recommendation not in recommendations:
                recommendations.append(recommendation)

    if not recommendations:
        recommendations.append(
            "Tailor the resume to each target role and review it for accuracy, clarity, and consistent formatting."
        )

    return recommendations


# ============================================================
# RESUME SCORE
# ============================================================

def calculate_resume_score(
    text: str,
    skills: list[str],
    education: str,
    experience: str,
    projects: str,
    certifications: str,
) -> float:
    """
    Calculate an indicative completeness and presentation score.

    This is not a validated ATS score. It uses explicit checks and
    does not award a perfect score merely because text was extracted.
    """
    score = 0.0
    word_count = len(text.split())

    # Section completeness: 40 points.
    score += 8 if extract_section(text, "summary") else 0
    score += 8 if skills else 0
    score += 6 if education else 0
    score += 6 if experience else 0
    score += 8 if projects else 0
    score += 4 if certifications else 0

    # Skills evidence: up to 15 points.
    score += min(len(skills), 10) * 1.5

    # Resume detail and completeness: up to 15 points.
    if word_count >= 350:
        score += 15
    elif word_count >= 250:
        score += 12
    elif word_count >= 150:
        score += 9
    elif word_count >= 100:
        score += 6
    elif word_count >= 50:
        score += 3

    # Evidence of impact and action-oriented descriptions: 15 points.
    if re.search(r"\b\d+(?:\.\d+)?\s*(?:%|percent|users|records|hours|days)\b", text, re.I):
        score += 7

    action_count = sum(
        1 for line in _clean_lines(text)
        if any(
            re.search(r"\b" + re.escape(verb) + r"\b", line.lower())
            for verb in ACTION_VERBS
        )
    )
    score += min(action_count, 4) * 2

    # Basic contact information: 10 points.
    if re.search(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b", text):
        score += 5

    if re.search(r"(?:\+?\d[\d\s().-]{7,}\d)", text):
        score += 5

    # Readability: up to 5 points.
    lines = _clean_lines(text)
    if len(lines) >= 8:
        score += 2

    if len(text) >= 500:
        score += 1

    if any(
        normalize_heading(line).rstrip(":") in {
            alias
            for aliases in SECTION_ALIASES.values()
            for alias in aliases
        }
        for line in text.splitlines()
    ):
        score += 2

    return round(min(100.0, max(0.0, score)), 1)


# ============================================================
# MAIN SERVICE FUNCTION
# ============================================================

def analyze_resume(extracted_text: str) -> dict[str, Any]:
    """
    Analyze extracted resume text.

    Return keys compatible with the existing resume_analysis router:
    skills, education, experience, projects, certifications, keywords,
    summary, strengths, weaknesses, recommendations, resume_score.
    """
    if not isinstance(extracted_text, str):
        raise ValueError("Resume text must be a string.")

    text = normalize_text(extracted_text)

    if not text:
        raise ValueError("Resume text is empty.")

    skills = extract_skills(text)
    keywords = extract_keywords(text, skills)

    education = extract_education(text)
    experience = extract_experience(text)
    projects = extract_projects(text)
    certifications = extract_certifications(text)

    summary = generate_professional_summary(
        text=text,
        skills=skills,
        education=education,
        experience=experience,
        projects=projects,
    )

    strengths = extract_strengths(
        text=text,
        skills=skills,
        education=education,
        experience=experience,
        projects=projects,
        certifications=certifications,
    )

    weaknesses = extract_weaknesses(
        text=text,
        skills=skills,
        education=education,
        experience=experience,
        projects=projects,
        certifications=certifications,
    )

    recommendations = generate_recommendations(weaknesses)

    resume_score = calculate_resume_score(
        text=text,
        skills=skills,
        education=education,
        experience=experience,
        projects=projects,
        certifications=certifications,
    )

    result = {
        "skills": skills,
        "education": education,
        "experience": experience,
        "projects": projects,
        "certifications": certifications,
        "keywords": keywords,
        "summary": summary,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "resume_score": resume_score,
    }

    logger.info(
        "Resume analysis completed: words=%s skills=%s score=%s",
        len(text.split()),
        len(skills),
        resume_score,
    )

    return result
