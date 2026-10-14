import re
from typing import Any


SKILL_KEYWORDS = [
    "python",
    "java",
    "javascript",
    "typescript",
    "c++",
    "c#",
    "react",
    "react.js",
    "node.js",
    "express.js",
    "fastapi",
    "django",
    "flask",
    "html",
    "css",
    "bootstrap",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "git",
    "github",
    "docker",
    "aws",
    "power bi",
    "tableau",
    "excel",
    "pandas",
    "numpy",
    "machine learning",
    "deep learning",
    "data analysis",
    "data science",
    "rest api",
    "spring boot",
    "php",
    "communication",
    "problem solving",
]


SECTION_ALIASES = {
    "education": [
        "education",
        "academic background",
        "educational qualifications",
    ],
    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "internship",
        "internships",
    ],
    "projects": [
        "projects",
        "academic projects",
        "personal projects",
        "project experience",
    ],
    "certifications": [
        "certifications",
        "certificates",
        "licenses and certifications",
    ],
}

ALL_SECTION_HEADINGS = [
    heading
    for headings in SECTION_ALIASES.values()
    for heading in headings
] + [
    "summary",
    "professional summary",
    "career objective",
    "objective",
    "technical skills",
    "skills",
    "achievements",
    "awards",
    "languages",
    "interests",
    "publications",
    "responsibilities",
]


def _clean_text(value: Any) -> str:
    """Normalize extracted resume text."""
    if value is None:
        return ""

    text = str(value).replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    return text.strip()


def _find_section(text: str, aliases: list[str]) -> str:
    """Extract a section from plain-text resume content."""
    headings = sorted(
        set(ALL_SECTION_HEADINGS),
        key=len,
        reverse=True,
    )

    heading_pattern = "|".join(
        re.escape(heading)
        for heading in headings
    )

    alias_pattern = "|".join(
        re.escape(alias)
        for alias in sorted(aliases, key=len, reverse=True)
    )

    pattern = (
        rf"(?ims)^[ \t]*(?:{alias_pattern})"
        rf"[ \t]*:?[ \t]*\n?"
        rf"(.*?)"
        rf"(?=^[ \t]*(?:{heading_pattern})"
        rf"[ \t]*:?[ \t]*(?:\n|$)|\Z)"
    )

    match = re.search(pattern, text)

    if not match:
        return ""

    return match.group(1).strip()


def _extract_skills(text: str) -> list[str]:
    """Find recognized skills in the resume."""
    lower_text = text.lower()
    found = []

    for skill in SKILL_KEYWORDS:
        pattern = (
            r"(?<![a-z0-9+#.])"
            + re.escape(skill.lower())
            + r"(?![a-z0-9+#.])"
        )

        if re.search(pattern, lower_text):
            found.append(skill)

    return found


def _extract_keywords(
    text: str,
    skills: list[str],
) -> list[str]:
    """Extract skills and additional resume keywords."""
    keywords = list(skills)

    common_keywords = [
        "internship",
        "project",
        "teamwork",
        "leadership",
        "development",
        "testing",
        "deployment",
        "automation",
        "database",
        "problem solving",
        "communication",
        "analysis",
        "design",
    ]

    lower_text = text.lower()

    for keyword in common_keywords:
        if keyword in lower_text and keyword not in keywords:
            keywords.append(keyword)

    return keywords


def _build_feedback(
    text: str,
    skills: list[str],
    education: str,
    experience: str,
    projects: str,
    certifications: str,
) -> tuple[list[str], list[str], list[str]]:
    """Generate basic resume feedback."""
    strengths = []
    weaknesses = []
    recommendations = []

    if skills:
        strengths.append(
            f"Detected {len(skills)} recognized skills."
        )
    else:
        weaknesses.append(
            "No recognized skills were detected."
        )
        recommendations.append(
            "Add a skills section relevant to your target job."
        )

    if education:
        strengths.append("Education details were detected.")
    else:
        weaknesses.append(
            "An education section was not detected."
        )
        recommendations.append(
            "Add your degree, college, graduation year, and academic details."
        )

    if projects:
        strengths.append("Project details were detected.")
    else:
        weaknesses.append(
            "A projects section was not detected."
        )
        recommendations.append(
            "Include projects, technologies used, and your contributions."
        )

    if experience:
        strengths.append(
            "Experience or internship details were detected."
        )
    else:
        weaknesses.append(
            "Experience or internship details were not detected."
        )
        recommendations.append(
            "Include relevant internships, training, or work experience if available."
        )

    if certifications:
        strengths.append("Certification details were detected.")
    else:
        recommendations.append(
            "Add relevant certifications if you have completed any."
        )

    if len(text.split()) < 150:
        weaknesses.append(
            "The extracted resume text is relatively short."
        )
        recommendations.append(
            "Check whether all text was extracted from the uploaded resume."
        )

    recommendations.append(
        "Tailor your resume to each job description and proofread it carefully."
    )

    return strengths, weaknesses, recommendations


def _calculate_score(
    text: str,
    skills: list[str],
    education: str,
    experience: str,
    projects: str,
    certifications: str,
) -> int:
    """Calculate an indicative score, not a validated ATS score."""
    score = 40

    if skills:
        score += 15
    if education:
        score += 10
    if experience:
        score += 10
    if projects:
        score += 10
    if certifications:
        score += 5
    if len(text.split()) >= 150:
        score += 10

    return min(score, 100)


def analyze_resume(resume_text: str) -> dict:
    """Analyze resume text and return all required analysis fields."""
    text = _clean_text(resume_text)

    if not text:
        raise ValueError(
            "Resume text is empty. Upload a resume with readable text."
        )

    skills = _extract_skills(text)

    education = _find_section(
        text,
        SECTION_ALIASES["education"],
    )
    experience = _find_section(
        text,
        SECTION_ALIASES["experience"],
    )
    projects = _find_section(
        text,
        SECTION_ALIASES["projects"],
    )
    certifications = _find_section(
        text,
        SECTION_ALIASES["certifications"],
    )

    keywords = _extract_keywords(text, skills)

    strengths, weaknesses, recommendations = _build_feedback(
        text=text,
        skills=skills,
        education=education,
        experience=experience,
        projects=projects,
        certifications=certifications,
    )

    resume_score = _calculate_score(
        text=text,
        skills=skills,
        education=education,
        experience=experience,
        projects=projects,
        certifications=certifications,
    )

    summary = (
        f"The resume contains approximately {len(text.split())} words. "
        f"{len(skills)} recognized skills were detected."
    )

    return {
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
