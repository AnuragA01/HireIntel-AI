import re
from typing import List, Dict


# ============================================================
# COMMON TECHNICAL SKILLS
# ============================================================

COMMON_SKILLS = {
    # Programming
    "python",
    "java",
    "javascript",
    "typescript",
    "c",
    "c++",
    "c#",

    # Frontend
    "html",
    "css",
    "react",
    "react.js",
    "angular",
    "vue",

    # Backend
    "node",
    "node.js",
    "express",
    "express.js",
    "django",
    "flask",
    "fastapi",
    "spring",
    "spring boot",
    "php",
    "laravel",

    # Databases
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "oracle",
    "redis",

    # Version control
    "git",
    "github",
    "gitlab",

    # Cloud / DevOps
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "ec2",
    "s3",
    "lambda",
    "nginx",
    "jenkins",
    "terraform",

    # API / Security
    "rest",
    "rest api",
    "jwt",
    "oauth",

    # AI / Data
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "ai",
    "nlp",
    "pandas",
    "numpy",
    "scikit-learn",
    "tensorflow",
    "pytorch",

    # Analytics
    "power bi",
    "tableau",
    "excel",

    # Big Data
    "kafka",
    "hadoop",
    "spark",

    # Other
    "linux",
    "ci/cd",
    "rpa",
    "neuralflow",
    "agentix",
}


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text: str) -> str:
    """
    Normalize text so skill matching is more reliable.
    """

    if not text:
        return ""

    text = text.lower()

    # Normalize common technology names
    replacements = {
        "react.js": "react",
        "node.js": "node",
        "express.js": "express",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    # Keep useful characters
    text = re.sub(
        r"[^a-z0-9+#./ -]",
        " ",
        text,
    )

    # Remove extra spaces
    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


# ============================================================
# SKILL EXTRACTION
# ============================================================

def extract_skills(text: str) -> List[str]:
    """
    Extract known technical skills from text.
    """

    normalized = normalize_text(text)

    found_skills = []

    # Check longer skills first
    skills = sorted(
        COMMON_SKILLS,
        key=len,
        reverse=True,
    )

    for skill in skills:

        skill_normalized = normalize_text(skill)

        if not skill_normalized:
            continue

        # Word-boundary based matching
        pattern = (
            r"(?<![a-z0-9])"
            + re.escape(skill_normalized)
            + r"(?![a-z0-9])"
        )

        if re.search(
            pattern,
            normalized,
        ):
            if skill_normalized not in found_skills:
                found_skills.append(
                    skill_normalized
                )

    return sorted(set(found_skills))


# ============================================================
# KEYWORD EXTRACTION
# ============================================================

def extract_keywords(text: str) -> List[str]:
    """
    Extract relevant non-stop-word keywords.
    """

    normalized = normalize_text(text)

    words = normalized.split()

    stop_words = {
        "the",
        "and",
        "for",
        "with",
        "that",
        "this",
        "from",
        "are",
        "you",
        "your",
        "our",
        "will",
        "have",
        "has",
        "should",
        "good",
        "knowledge",
        "experience",
        "using",
        "into",
        "their",
        "they",
        "who",
        "job",
        "role",
        "candidate",
        "work",
        "working",
        "years",
        "year",
        "must",
        "about",
        "looking",
        "developer",
        "development",
        "software",
    }

    keywords = []

    for word in words:

        if len(word) < 4:
            continue

        if word in stop_words:
            continue

        if word not in keywords:
            keywords.append(word)

    return keywords[:40]


# ============================================================
# EXPERIENCE MATCH
# ============================================================

def calculate_experience_match(
    resume_text: str,
    job_description: str,
) -> float:
    """
    Estimate experience compatibility.
    """

    resume_year_matches = re.findall(
        r"(\d+(?:\.\d+)?)\s*\+?\s*years?",
        resume_text.lower(),
    )

    job_year_matches = re.findall(
        r"(\d+(?:\.\d+)?)\s*\+?\s*years?",
        job_description.lower(),
    )

    # No experience requirement
    if not job_year_matches:
        return 100.0

    required_years = float(
        job_year_matches[0]
    )

    # Candidate experience not detected
    if not resume_year_matches:
        return 50.0

    candidate_years = max(
        float(value)
        for value in resume_year_matches
    )

    if required_years <= 0:
        return 100.0

    if candidate_years >= required_years:
        return 100.0

    score = (
        candidate_years
        / required_years
        * 100
    )

    return round(
        min(score, 100.0),
        2,
    )


# ============================================================
# LEARNING PATHS
# ============================================================

LEARNING_PATHS = {

    "fastapi": [
        "Learn FastAPI fundamentals",
        "Build REST APIs using FastAPI",
        "Learn Pydantic request validation",
        "Connect FastAPI with MySQL",
        "Implement JWT authentication",
        "Build and deploy a FastAPI project",
    ],

    "docker": [
        "Learn Docker fundamentals",
        "Create Dockerfiles",
        "Learn Docker Compose",
        "Containerize a backend application",
        "Deploy a containerized application",
    ],

    "mysql": [
        "Learn SQL fundamentals",
        "Practice joins and subqueries",
        "Learn database normalization",
        "Learn indexes and constraints",
        "Connect MySQL with Python",
    ],

    "sql": [
        "Learn SQL fundamentals",
        "Practice filtering and sorting",
        "Learn INNER JOIN and OUTER JOIN",
        "Practice GROUP BY and aggregation",
        "Learn subqueries and CTEs",
    ],

    "git": [
        "Learn Git fundamentals",
        "Practice branches and merging",
        "Learn pull requests",
        "Practice resolving merge conflicts",
        "Use GitHub for collaboration",
    ],

    "python": [
        "Learn Python fundamentals",
        "Practice functions and modules",
        "Learn object-oriented programming",
        "Learn exception handling",
        "Build Python projects",
    ],

    "react": [
        "Learn React fundamentals",
        "Understand components and props",
        "Learn state and hooks",
        "Connect React with REST APIs",
        "Build a production React application",
    ],

    "javascript": [
        "Learn JavaScript fundamentals",
        "Practice ES6+",
        "Learn asynchronous JavaScript",
        "Work with APIs",
        "Build JavaScript projects",
    ],

    "aws": [
        "Learn AWS fundamentals",
        "Learn EC2 and S3",
        "Learn IAM",
        "Understand VPC fundamentals",
        "Deploy an application on AWS",
    ],

    "mongodb": [
        "Learn MongoDB fundamentals",
        "Practice CRUD operations",
        "Learn collections and documents",
        "Learn indexing",
        "Connect MongoDB with an application",
    ],
}


# ============================================================
# DEFAULT LEARNING PATH
# ============================================================

def get_learning_path(
    skill: str,
) -> List[str]:

    if skill in LEARNING_PATHS:
        return LEARNING_PATHS[skill]

    return [
        f"Learn {skill} fundamentals",
        f"Practice {skill} with hands-on exercises",
        f"Build a small project using {skill}",
        f"Integrate {skill} into a real application",
    ]


# ============================================================
# SKILL PRIORITY
# ============================================================

def get_skill_priority(
    skill: str,
) -> str:

    high_priority = {
        "fastapi",
        "docker",
        "kubernetes",
        "aws",
        "azure",
        "gcp",
        "react",
        "django",
        "flask",
        "spring boot",
        "machine learning",
        "deep learning",
    }

    if skill in high_priority:
        return "High"

    return "Medium"


# ============================================================
# MAIN SKILL GAP ANALYSIS
# ============================================================

def analyze_skill_gap(
    resume_text: str,
    job_description: str,
) -> Dict:

    # --------------------------------------------------------
    # Extract skills
    # --------------------------------------------------------

    resume_skills = set(
        extract_skills(resume_text)
    )

    job_skills = set(
        extract_skills(job_description)
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

    # --------------------------------------------------------
    # Skill score
    # --------------------------------------------------------

    if job_skills:

        skill_score = (
            len(matched_skills)
            / len(job_skills)
        ) * 100

    else:

        skill_score = 0.0

    # --------------------------------------------------------
    # Keyword score
    # --------------------------------------------------------

    resume_keywords = set(
        extract_keywords(resume_text)
    )

    job_keywords = set(
        extract_keywords(job_description)
    )

    matched_keywords = (
        resume_keywords
        .intersection(job_keywords)
    )

    if job_keywords:

        keyword_score = (
            len(matched_keywords)
            / len(job_keywords)
        ) * 100

    else:

        keyword_score = 0.0

    # --------------------------------------------------------
    # Experience score
    # --------------------------------------------------------

    experience_score = (
        calculate_experience_match(
            resume_text,
            job_description,
        )
    )

    # --------------------------------------------------------
    # Overall score
    # --------------------------------------------------------

    match_score = (
        skill_score * 0.55
        + keyword_score * 0.25
        + experience_score * 0.20
    )

    match_score = round(
        min(match_score, 100.0),
        2,
    )

    # --------------------------------------------------------
    # Strengths
    # --------------------------------------------------------

    strengths = []

    if matched_skills:

        strengths.append(
            "The resume contains "
            "job-relevant technical skills."
        )

    if skill_score >= 70:

        strengths.append(
            "The resume has good technical "
            "skill coverage for this role."
        )

    if experience_score >= 80:

        strengths.append(
            "The detected experience is "
            "well aligned with the requirement."
        )

    if matched_keywords:

        strengths.append(
            "The resume contains several "
            "relevant job-description keywords."
        )

    if not strengths:

        strengths.append(
            "The resume contains some "
            "relevant information for the role."
        )

    # --------------------------------------------------------
    # Skill gaps
    # --------------------------------------------------------

    skill_gaps = []

    for skill in missing_skills:

        priority = get_skill_priority(
            skill
        )

        reason = (
            f"{skill} appears in the job "
            "description but was not detected "
            "in the selected resume."
        )

        skill_gaps.append(
            {
                "skill": skill,
                "priority": priority,
                "reason": reason,
                "learning_path": get_learning_path(
                    skill
                ),
            }
        )

    # --------------------------------------------------------
    # Recommendations
    # --------------------------------------------------------

    recommendations = []

    if missing_skills:

        recommendations.append(
            "Develop the missing job-relevant "
            "skills identified in the analysis."
        )

        recommendations.append(
            "Only add a skill to your resume "
            "after you genuinely learn or use it."
        )

    if match_score < 70:

        recommendations.append(
            "Build practical projects that "
            "demonstrate the missing job requirements."
        )

    if experience_score < 80:

        recommendations.append(
            "Add measurable project, internship, "
            "or practical experience relevant to "
            "the target role."
        )

    if not recommendations:

        recommendations.append(
            "Continue strengthening the skills "
            "already aligned with the target role."
        )

    # --------------------------------------------------------
    # Project recommendations
    # --------------------------------------------------------

    project_recommendations = []

    if "fastapi" in missing_skills:

        project_recommendations.append(
            "Build a FastAPI + MySQL REST API "
            "with JWT authentication."
        )

    if "docker" in missing_skills:

        project_recommendations.append(
            "Dockerize a full-stack application "
            "using Docker Compose."
        )

    if "aws" in missing_skills:

        project_recommendations.append(
            "Deploy a backend application "
            "on AWS EC2."
        )

    if "react" in missing_skills:

        project_recommendations.append(
            "Build a React dashboard connected "
            "to a REST API."
        )

    if not project_recommendations:

        project_recommendations.append(
            "Build a project combining the "
            "most important skills required "
            "by the target job."
        )

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    total_job_skills = len(job_skills)

    matched_count = len(
        matched_skills
    )

    summary = (
        f"The resume has a "
        f"{match_score:.2f}% compatibility "
        f"score for this job. "
        f"{matched_count} of "
        f"{total_job_skills} identified "
        f"technical skills were matched."
    )

    if missing_skills:

        summary += (
            " The main skill gaps are: "
            + ", ".join(missing_skills)
            + "."
        )

    else:

        summary += (
            " No major technical skill gaps "
            "were detected."
        )

    # --------------------------------------------------------
    # Final response
    # --------------------------------------------------------

    return {
        "match_score": match_score,

        "matched_skills": matched_skills,

        "missing_skills": missing_skills,

        "strengths": strengths,

        "skill_gaps": skill_gaps,

        "recommendations": recommendations,

        "project_recommendations": (
            project_recommendations
        ),

        "summary": summary,
    }