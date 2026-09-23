from datetime import datetime

from pydantic import BaseModel


# ============================================================
# CANDIDATE PROFILE
# ============================================================

class CandidateProfileResponse(BaseModel):

    candidate_id: int

    full_name: str

    email: str

    role: str


# ============================================================
# RESUME INFORMATION
# ============================================================

class CandidateResumeResponse(BaseModel):

    resume_id: int

    filename: str

    file_type: str

    uploaded_at: datetime

    resume_score: float | None


# ============================================================
# RESUME ANALYSIS
# ============================================================

class CandidateResumeAnalysisResponse(BaseModel):

    skills: str | None

    education: str | None

    experience: str | None

    projects: str | None

    certifications: str | None

    keywords: str | None

    summary: str | None

    strengths: str | None

    weaknesses: str | None

    recommendations: str | None


# ============================================================
# JOB MATCH
# ============================================================

class CandidateJobMatchResponse(BaseModel):

    match_id: int

    job_id: int

    job_title: str

    company_name: str | None

    match_score: float

    experience_match: float

    matched_skills: str | None

    missing_skills: str | None

    matched_keywords: str | None

    missing_keywords: str | None

    summary: str | None

    recommendations: str | None

    matched_at: datetime


# ============================================================
# COMPLETE CANDIDATE DETAILS
# ============================================================

class CandidateDetailsResponse(BaseModel):

    candidate: CandidateProfileResponse

    resume: CandidateResumeResponse | None

    analysis: CandidateResumeAnalysisResponse | None

    job_match: CandidateJobMatchResponse | None