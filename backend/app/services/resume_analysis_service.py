import re


# ============================================================
# COMMON SKILLS DATABASE
# ============================================================

SKILLS_DATABASE = [

    # Programming Languages
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "C",
    "C++",
    "C#",
    "PHP",
    "Go",
    "Kotlin",
    "Swift",

    # Web Development
    "HTML",
    "CSS",
    "React",
    "React.js",
    "Node.js",
    "Express.js",
    "Django",
    "Flask",
    "FastAPI",
    "Bootstrap",

    # Databases
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "SQL",
    "Oracle",
    "Redis",

    # Cloud
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",

    # Data / AI
    "Machine Learning",
    "Deep Learning",
    "Artificial Intelligence",
    "Data Science",
    "Data Analytics",
    "Pandas",
    "NumPy",
    "Scikit-learn",
    "Power BI",
    "TensorFlow",
    "PyTorch",

    # Tools
    "Git",
    "GitHub",
    "VS Code",

    # Automation
    "RPA",
    "NeuralFlow",
    "Neural AgentiX",

    # Other
    "REST API",
    "REST APIs",
    "JWT",
    "Linux",
]


# ============================================================
# SKILL EXTRACTION
# ============================================================

def extract_skills(text: str) -> list[str]:

    found_skills = []

    text_lower = text.lower()

    for skill in SKILLS_DATABASE:

        if skill.lower() in text_lower:

            if skill not in found_skills:

                found_skills.append(skill)

    return found_skills


# ============================================================
# SECTION EXTRACTION
# ============================================================

def extract_section(
    text: str,
    section_names: list[str]
) -> str:

    lines = text.splitlines()

    start_index = None

    for index, line in enumerate(lines):

        cleaned_line = line.strip().lower()

        # Remove common punctuation
        cleaned_line = re.sub(
            r"[:\-|]+$",
            "",
            cleaned_line
        ).strip()

        for section_name in section_names:

            if cleaned_line == section_name.lower():

                start_index = index + 1
                break

        if start_index is not None:
            break

    if start_index is None:

        return ""

    section_lines = []

    common_sections = [
        "summary",
        "objective",
        "skills",
        "technical skills",
        "education",
        "experience",
        "work experience",
        "professional experience",
        "employment",
        "employment history",
        "projects",
        "project",
        "certifications",
        "certificates",
        "achievements",
        "internships",
        "internship",
        "contact",
        "profile",
        "about",
    ]

    for line in lines[start_index:]:

        cleaned_line = line.strip().lower()

        cleaned_line = re.sub(
            r"[:\-|]+$",
            "",
            cleaned_line
        ).strip()

        if cleaned_line in common_sections:

            break

        if line.strip():

            section_lines.append(
                line.strip()
            )

    return "\n".join(section_lines)


# ============================================================
# EDUCATION EXTRACTION
# ============================================================

def extract_education(text: str) -> str:

    education_keywords = [

        "B.Tech",
        "B.E",
        "Bachelor",
        "M.Tech",
        "M.E",
        "Master",
        "MCA",
        "BCA",
        "B.Sc",
        "M.Sc",
        "Computer Science",
        "Engineering",
        "University",
        "College",
        "Institute",
        "Diploma",
        "HSC",
        "SSC",
    ]

    lines = text.splitlines()

    education_lines = []

    for line in lines:

        cleaned_line = line.strip()

        if not cleaned_line:
            continue

        for keyword in education_keywords:

            if keyword.lower() in cleaned_line.lower():

                if cleaned_line not in education_lines:

                    education_lines.append(
                        cleaned_line
                    )

                break

    return "\n".join(
        education_lines
    )


# ============================================================
# EXPERIENCE EXTRACTION
# ============================================================

def extract_experience(text: str) -> str:

    # --------------------------------------------------------
    # STEP 1
    # Try normal resume experience sections
    # --------------------------------------------------------

    section = extract_section(
        text,
        [
            "experience",
            "work experience",
            "professional experience",
            "employment",
            "employment history",
            "internship",
            "internships",
            "work history",
            "career history",
        ]
    )

    if section.strip():

        return section.strip()

    # --------------------------------------------------------
    # STEP 2
    # Fallback for resumes where experience heading
    # is missing or badly extracted from PDF
    # --------------------------------------------------------

    lines = text.splitlines()

    experience_lines = []

    experience_keywords = [

        # Experience
        "experience",
        "work experience",
        "professional experience",
        "employment",

        # Internship
        "intern",
        "internship",
        "internships",

        # Job roles
        "developer",
        "engineer",
        "software engineer",
        "software developer",
        "full stack developer",
        "frontend developer",
        "backend developer",
        "automation engineer",
        "rpa engineer",

        # Work-related terms
        "worked",
        "working",
        "responsible for",
        "developed",
        "implemented",
        "designed",
        "built",
        "automated",
        "deployed",
        "contributed",

        # Companies / organizations
        "company",
        "organization",
        "technologies",
        "technology",
    ]

    for line in lines:

        cleaned_line = line.strip()

        if not cleaned_line:
            continue

        line_lower = cleaned_line.lower()

        # Ignore obvious headings
        if line_lower in [
            "skills",
            "technical skills",
            "education",
            "projects",
            "certifications",
            "achievements",
            "contact",
            "profile",
            "summary",
            "objective",
        ]:
            continue

        if any(
            keyword in line_lower
            for keyword in experience_keywords
        ):

            if cleaned_line not in experience_lines:

                experience_lines.append(
                    cleaned_line
                )

    # --------------------------------------------------------
    # STEP 3
    # Return detected experience
    # --------------------------------------------------------

    if experience_lines:

        return "\n".join(
            experience_lines[:25]
        )

    return ""


# ============================================================
# PROJECT EXTRACTION
# ============================================================

def extract_projects(text: str) -> str:

    section = extract_section(
        text,
        [
            "projects",
            "project",
            "academic projects",
            "personal projects",
            "academic project",
            "personal project",
        ]
    )

    return section


# ============================================================
# CERTIFICATION EXTRACTION
# ============================================================

def extract_certifications(text: str) -> str:

    section = extract_section(
        text,
        [
            "certifications",
            "certificates",
            "certification",
            "certifications and courses",
            "courses",
        ]
    )

    return section


# ============================================================
# KEYWORD EXTRACTION
# ============================================================

def extract_keywords(
    text: str,
    skills: list[str]
) -> list[str]:

    keywords = []

    important_terms = [

        "developer",
        "software",
        "full stack",
        "backend",
        "frontend",
        "database",
        "cloud",
        "automation",
        "API",
        "AI",
        "machine learning",
        "web development",
        "RPA",
        "internship",
        "deployment",
        "authentication",
        "REST",
        "Docker",
        "AWS",
        "Git",
        "GitHub",
        "JWT",
    ]

    text_lower = text.lower()

    for keyword in important_terms:

        if keyword.lower() in text_lower:

            if keyword not in keywords:

                keywords.append(keyword)

    for skill in skills:

        if skill not in keywords:

            keywords.append(skill)

    return keywords


# ============================================================
# SUMMARY GENERATION
# ============================================================

def generate_summary(
    text: str,
    skills: list[str]
) -> str:

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    if not lines:

        return "No resume content available."

    skill_text = ", ".join(
        skills[:10]
    )

    if skill_text:

        return (
            "Resume analysis identified the candidate's "
            f"technical profile with skills including "
            f"{skill_text}."
        )

    return (
        "Resume content was successfully extracted "
        "and analyzed."
    )


# ============================================================
# STRENGTH ANALYSIS
# ============================================================

def generate_strengths(
    text: str,
    skills: list[str]
) -> list[str]:

    strengths = []

    if len(skills) >= 5:

        strengths.append(
            "Strong technical skill coverage"
        )

    if "Python" in skills:

        strengths.append(
            "Python development experience"
        )

    if "React" in skills or "React.js" in skills:

        strengths.append(
            "Frontend development experience"
        )

    if "Node.js" in skills:

        strengths.append(
            "Backend development experience"
        )

    if "AWS" in skills:

        strengths.append(
            "Cloud computing exposure"
        )

    if "Docker" in skills:

        strengths.append(
            "Containerization knowledge"
        )

    if "RPA" in skills:

        strengths.append(
            "Automation experience"
        )

    if "GitHub" in skills:

        strengths.append(
            "Version control and GitHub experience"
        )

    if not strengths:

        strengths.append(
            "Resume contains relevant professional information"
        )

    return strengths


# ============================================================
# WEAKNESS ANALYSIS
# ============================================================

def generate_weaknesses(
    text: str,
    skills: list[str]
) -> list[str]:

    weaknesses = []

    text_lower = text.lower()

    if len(skills) < 5:

        weaknesses.append(
            "Limited number of clearly identified technical skills"
        )

    if "linkedin" not in text_lower:

        weaknesses.append(
            "LinkedIn profile is not clearly mentioned"
        )

    if "github" not in text_lower:

        weaknesses.append(
            "GitHub profile is not clearly mentioned"
        )

    if "achievement" not in text_lower:

        weaknesses.append(
            "Achievements are not clearly highlighted"
        )

    if not weaknesses:

        weaknesses.append(
            "Consider adding measurable achievements "
            "and quantified results"
        )

    return weaknesses


# ============================================================
# RECOMMENDATIONS
# ============================================================

def generate_recommendations(
    text: str,
    skills: list[str]
) -> list[str]:

    recommendations = []

    text_lower = text.lower()

    if "github" not in text_lower:

        recommendations.append(
            "Add a GitHub profile link with relevant projects"
        )

    if "linkedin" not in text_lower:

        recommendations.append(
            "Add a professional LinkedIn profile link"
        )

    recommendations.append(
        "Use measurable results when describing projects "
        "and work experience"
    )

    recommendations.append(
        "Tailor technical keywords to the target job description"
    )

    if len(skills) < 8:

        recommendations.append(
            "Add relevant technical skills supported by "
            "projects or practical experience"
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
    projects: str
) -> float:

    score = 0

    # --------------------------------------------------------
    # Skills
    # --------------------------------------------------------

    if len(skills) >= 10:

        score += 25

    elif len(skills) >= 5:

        score += 20

    elif len(skills) >= 3:

        score += 15

    elif len(skills) >= 1:

        score += 10

    # --------------------------------------------------------
    # Education
    # --------------------------------------------------------

    if education:

        score += 20

    # --------------------------------------------------------
    # Experience
    # --------------------------------------------------------

    if experience:

        score += 20

    # --------------------------------------------------------
    # Projects
    # --------------------------------------------------------

    if projects:

        score += 20

    # --------------------------------------------------------
    # Resume Content
    # --------------------------------------------------------

    if len(text) > 1500:

        score += 15

    elif len(text) > 800:

        score += 10

    elif len(text) > 300:

        score += 5

    return min(
        float(score),
        100.0
    )


# ============================================================
# COMPLETE RESUME ANALYSIS
# ============================================================

def analyze_resume(text: str) -> dict:

    if not text or not text.strip():

        raise ValueError(
            "Resume text is empty."
        )

    # --------------------------------------------------------
    # Extract resume information
    # --------------------------------------------------------

    skills = extract_skills(text)

    education = extract_education(text)

    experience = extract_experience(text)

    projects = extract_projects(text)

    certifications = extract_certifications(text)

    keywords = extract_keywords(
        text,
        skills
    )

    # --------------------------------------------------------
    # Generate analysis
    # --------------------------------------------------------

    summary = generate_summary(
        text,
        skills
    )

    strengths = generate_strengths(
        text,
        skills
    )

    weaknesses = generate_weaknesses(
        text,
        skills
    )

    recommendations = generate_recommendations(
        text,
        skills
    )

    # --------------------------------------------------------
    # Calculate score
    # --------------------------------------------------------

    resume_score = calculate_resume_score(
        text,
        skills,
        education,
        experience,
        projects
    )

    # --------------------------------------------------------
    # Return complete result
    # --------------------------------------------------------

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