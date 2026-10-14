import { useEffect, useState } from "react";

import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import FindJobs from "./pages/FindJobs";

import CandidateDashboard from "./pages/CandidateDashboard";
import CandidateApplications from "./pages/CandidateApplications";
import CandidateResumes from "./pages/CandidateResumes";
import CandidateJobMatches from "./pages/CandidateJobMatches";
import CandidateProfile from "./pages/CandidateProfile";
import CandidateSettings from "./pages/CandidateSettings";
import CareerIntelligence from "./pages/CareerIntelligence";

import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterCandidateMatches from "./pages/RecruiterCandidateMatches";

import RecruiterJobs from "./pages/RecruiterJobs";
import RecruiterPostJob from "./pages/RecruiterPostJob";


const API_BASE_URL = "http://127.0.0.1:8000";


/* ============================================================
   HELPER
============================================================ */

function getErrorMessage(data, fallback = "Something went wrong.") {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return (
          item?.msg ||
          item?.message ||
          "Invalid request."
        );
      })
      .join(", ");
  }

  if (data?.detail) {
    return (
      data.detail?.message ||
      data.detail?.error ||
      JSON.stringify(data.detail)
    );
  }

  return fallback;
}


/* ============================================================
   HOME PAGE
============================================================ */

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="app">

      {/* NAVBAR */}

      <header className="navbar">

        <div
          className="logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <div className="logo-icon">
            H
          </div>

          <span>
            HireIntel <strong>AI</strong>
          </span>
        </div>


        <nav className="nav-links">
          <a href="#features">
            Features
          </a>

          <a href="#how-it-works">
            How It Works
          </a>

          <a href="#about">
            About
          </a>
        </nav>


        <div className="nav-actions">

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate("/login")}
          >
            Login
          </button>


          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/login")}
          >
            Get Started
          </button>

        </div>

      </header>


      {/* HERO */}

      <main>

        <section className="hero-section">

          <div className="hero-content">

            <div className="hero-badge">
              ✨ AI-Powered Recruitment Platform
            </div>


            <h1>
              Hire Smarter.
              <br />
              <span>
                Build Better Teams.
              </span>
            </h1>


            <p className="hero-description">
              HireIntel AI combines resume intelligence,
              smart job matching, candidate insights,
              and application tracking into one modern
              recruitment platform.
            </p>


            <div className="hero-buttons">

              <button
                type="button"
                className="btn btn-primary btn-large"
                onClick={() => navigate("/login")}
              >
                Explore Platform →
              </button>


              <a
                href="#how-it-works"
                className="btn btn-outline btn-large"
              >
                How It Works
              </a>

            </div>


            <div className="hero-stats">

              <div>
                <strong>AI</strong>
                <span>
                  Resume Intelligence
                </span>
              </div>


              <div>
                <strong>Smart</strong>
                <span>
                  Job Matching
                </span>
              </div>


              <div>
                <strong>360°</strong>
                <span>
                  Recruitment Insights
                </span>
              </div>

            </div>

          </div>


          {/* DASHBOARD PREVIEW */}

          <div className="hero-dashboard">

            <div className="dashboard-window">

              <div className="window-header">

                <div className="window-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="window-title">
                  HireIntel AI Dashboard
                </div>

              </div>


              <div className="dashboard-content">

                <aside className="dashboard-sidebar">

                  <div className="sidebar-logo">
                    H
                  </div>

                  <div className="sidebar-item active">
                    ▦
                  </div>

                  <div className="sidebar-item">
                    ♙
                  </div>

                  <div className="sidebar-item">
                    💼
                  </div>

                  <div className="sidebar-item">
                    ◎
                  </div>

                </aside>


                <div className="dashboard-main">

                  <div className="dashboard-heading">

                    <div>

                      <small>
                        Welcome back
                      </small>

                      <h3>
                        Recruitment Overview
                      </h3>

                    </div>


                    <div className="profile-circle">
                      A
                    </div>

                  </div>


                  <div className="dashboard-cards">

                    <div className="mini-card">
                      <span>
                        Applications
                      </span>

                      <strong>
                        128
                      </strong>

                      <small>
                        ↗ +18% this month
                      </small>
                    </div>


                    <div className="mini-card">
                      <span>
                        Shortlisted
                      </span>

                      <strong>
                        42
                      </strong>

                      <small>
                        ↗ +12% this month
                      </small>
                    </div>


                    <div className="mini-card">
                      <span>
                        Avg. Match
                      </span>

                      <strong>
                        86%
                      </strong>

                      <small>
                        ◉ AI Match Score
                      </small>
                    </div>

                  </div>


                  <div className="match-card">

                    <div className="match-header">

                      <div>

                        <small>
                          Top Candidate Match
                        </small>

                        <h4>
                          Python Developer
                        </h4>

                      </div>


                      <div className="match-score">
                        92%
                      </div>

                    </div>


                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>


                    <div className="skills">

                      <span>
                        Python
                      </span>

                      <span>
                        FastAPI
                      </span>

                      <span>
                        SQL
                      </span>

                      <span>
                        React
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* FEATURES */}

        <section
          id="features"
          className="features-section"
        >

          <div className="section-heading">

            <span>
              POWERFUL FEATURES
            </span>

            <h2>
              Everything you need for{" "}
              <strong>
                smarter recruitment.
              </strong>
            </h2>

            <p>
              HireIntel AI brings resume intelligence,
              job matching, candidate insights, and
              application management together.
            </p>

          </div>


          <div className="feature-grid">

            <div className="feature-card">

              <div className="feature-icon">
                ✦
              </div>

              <h3>
                AI Resume Analysis
              </h3>

              <p>
                Analyze resumes, extract skills,
                identify strengths and weaknesses,
                and generate useful recommendations.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                ◎
              </div>

              <h3>
                Smart Job Matching
              </h3>

              <p>
                Compare candidate profiles with
                job requirements and generate
                intelligent match scores.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                ♙
              </div>

              <h3>
                Candidate Intelligence
              </h3>

              <p>
                Help recruiters understand candidate
                skills, experience and matching insights.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                ◉
              </div>

              <h3>
                Application Tracking
              </h3>

              <p>
                Track applications from Applied to
                Shortlisted, Interview, Rejected or Hired.
              </p>

            </div>

          </div>

        </section>


        {/* HOW IT WORKS */}

        <section
          id="how-it-works"
          className="workflow-section"
        >

          <div className="section-heading">

            <span>
              HOW IT WORKS
            </span>

            <h2>
              From resume to{" "}
              <strong>
                opportunity.
              </strong>
            </h2>

            <p>
              A simple workflow designed for candidates
              and recruiters.
            </p>

          </div>


          <div className="workflow-grid">

            <div className="workflow-step">

              <div className="step-number">
                01
              </div>

              <h3>
                Upload Resume
              </h3>

              <p>
                Candidates upload their resume and
                HireIntel AI extracts important information.
              </p>

            </div>


            <div className="workflow-step">

              <div className="step-number">
                02
              </div>

              <h3>
                AI Analysis
              </h3>

              <p>
                The platform analyzes skills, experience,
                education, projects and keywords.
              </p>

            </div>


            <div className="workflow-step">

              <div className="step-number">
                03
              </div>

              <h3>
                Smart Matching
              </h3>

              <p>
                Candidate profiles are compared against
                available job requirements.
              </p>

            </div>


            <div className="workflow-step">

              <div className="step-number">
                04
              </div>

              <h3>
                Track Applications
              </h3>

              <p>
                Candidates and recruiters can track
                application progress.
              </p>

            </div>

          </div>

        </section>


        {/* ABOUT */}

        <section
          id="about"
          className="about-section"
        >

          <div className="about-content">

            <span>
              ABOUT HIREINTEL AI
            </span>

            <h2>
              Recruitment powered by{" "}
              <strong>
                intelligence.
              </strong>
            </h2>

            <p>
              HireIntel AI is an AI-powered recruitment
              and career intelligence platform designed
              to simplify the connection between candidates
              and recruiters.
            </p>


            <div className="about-points">

              <div>
                ✓ Resume intelligence
              </div>

              <div>
                ✓ AI-powered job matching
              </div>

              <div>
                ✓ Candidate insights
              </div>

              <div>
                ✓ Application tracking
              </div>

              <div>
                ✓ Recruiter candidate ranking
              </div>

              <div>
                ✓ Role-based dashboards
              </div>

            </div>

          </div>

        </section>


        {/* CTA */}

        <section className="cta-section">

          <div className="cta-content">

            <span>
              READY TO GET STARTED?
            </span>

            <h2>
              Build your next career opportunity
              with HireIntel AI.
            </h2>

            <p>
              Discover smarter recruitment,
              better matching and data-driven
              career insights.
            </p>


            <button
              type="button"
              className="btn btn-primary btn-large"
              onClick={() => navigate("/login")}
            >
              Get Started →
            </button>

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="footer">

        <div className="logo">

          <div className="logo-icon">
            H
          </div>

          <span>
            HireIntel <strong>AI</strong>
          </span>

        </div>


        <p>
          AI-Powered Recruitment & Career Intelligence Platform
        </p>


        <span className="copyright">
          © 2026 HireIntel AI
        </span>

      </footer>

    </div>
  );
}


/* ============================================================
   CANDIDATE JOB DETAILS
============================================================ */

function CandidateJobDetails() {

  const navigate = useNavigate();
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [resumesLoading, setResumesLoading] = useState(true);

  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {

    let cancelled = false;

    const loadData = async () => {

      const token = localStorage.getItem("hireintel_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      if (!jobId) {
        setError("Job ID is missing.");
        setLoading(false);
        setResumesLoading(false);
        return;
      }

      try {

        // --------------------------------------------------------
        // LOAD JOB
        // --------------------------------------------------------

        const jobResponse = await fetch(
          `${API_BASE_URL}/candidate/jobs/${jobId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const jobData = await jobResponse.json().catch(() => null);

        if (jobResponse.status === 401) {
          localStorage.removeItem("hireintel_token");
          localStorage.removeItem("hireintel_role");
          localStorage.removeItem("hireintel_user_id");
          localStorage.removeItem("hireintel_email");
          navigate("/login", { replace: true });
          return;
        }

        if (!jobResponse.ok) {
          setError(
            getErrorMessage(
              jobData,
              "Unable to load this job."
            )
          );
          return;
        }

        if (!cancelled) {
          setJob(jobData);
        }

        // --------------------------------------------------------
        // LOAD RESUMES
        // Backend returns newest resumes first.
        // The first resume is selected automatically.
        // --------------------------------------------------------

        try {

          setResumesLoading(true);

          const resumesResponse = await fetch(
            `${API_BASE_URL}/resumes/my-resumes`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

          const resumesData = await resumesResponse
            .json()
            .catch(() => []);

          if (resumesResponse.status === 401) {
            localStorage.removeItem("hireintel_token");
            localStorage.removeItem("hireintel_role");
            localStorage.removeItem("hireintel_user_id");
            localStorage.removeItem("hireintel_email");
            navigate("/login", { replace: true });
            return;
          }

          if (!resumesResponse.ok) {
            throw new Error(
              getErrorMessage(
                resumesData,
                "Unable to load your resumes."
              )
            );
          }

          const resumeList = Array.isArray(resumesData)
            ? resumesData
            : [];

          if (!cancelled) {
            setResumes(resumeList);

            if (resumeList.length > 0) {
              setResumeId(String(resumeList[0].id));
            } else {
              setResumeId("");
            }
          }

        } catch (resumeError) {

          console.warn(
            "Resume loading failed:",
            resumeError
          );

          if (!cancelled) {
            setResumes([]);
            setResumeId("");
          }

        } finally {

          if (!cancelled) {
            setResumesLoading(false);
          }

        }

        // --------------------------------------------------------
        // CHECK EXISTING APPLICATION
        // --------------------------------------------------------

        try {

          const applicationsResponse = await fetch(
            `${API_BASE_URL}/applications/my-applications`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

          const applicationsData = await applicationsResponse
            .json()
            .catch(() => []);

          if (
            applicationsResponse.status === 401
          ) {
            localStorage.removeItem("hireintel_token");
            localStorage.removeItem("hireintel_role");
            localStorage.removeItem("hireintel_user_id");
            localStorage.removeItem("hireintel_email");
            navigate("/login", { replace: true });
            return;
          }

          if (
            applicationsResponse.ok &&
            Array.isArray(applicationsData)
          ) {

            const existingApplication =
              applicationsData.find(
                (application) =>
                  Number(application.job_id) === Number(jobId)
              );

            if (existingApplication && !cancelled) {
              setAlreadyApplied(true);
              setApplicationSuccess(existingApplication);
            }
          }

        } catch (applicationError) {

          console.warn(
            "Application check failed:",
            applicationError
          );

        }

      } catch (requestError) {

        console.error(
          "Job details error:",
          requestError
        );

        if (!cancelled) {
          setError(
            "Unable to connect to the HireIntel AI server."
          );
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timerId = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };

  }, [jobId, navigate]);

  // ------------------------------------------------------------
  // APPLY FOR JOB
  // ------------------------------------------------------------

  const applyForJob = async (event) => {

    event.preventDefault();

    const token = localStorage.getItem("hireintel_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (alreadyApplied) {
      setError("You have already applied for this job.");
      return;
    }

    if (!resumeId) {
      setError("Please upload a resume before applying.");
      return;
    }

    const numericResumeId = Number(resumeId);

    if (
      !Number.isInteger(numericResumeId) ||
      numericResumeId <= 0
    ) {
      setError("Please select a valid resume.");
      return;
    }

    setApplying(true);
    setError("");
    setApplicationSuccess(null);

    try {

      const response = await fetch(
        `${API_BASE_URL}/applications/job/${jobId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume_id: numericResumeId,
            cover_letter: coverLetter.trim() || null,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        localStorage.removeItem("hireintel_token");
        localStorage.removeItem("hireintel_role");
        localStorage.removeItem("hireintel_user_id");
        localStorage.removeItem("hireintel_email");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        setError(
          getErrorMessage(
            data,
            "Application failed."
          )
        );
        return;
      }

      setApplicationSuccess(data);
      setAlreadyApplied(true);

    } catch (requestError) {

      console.error(
        "Application error:",
        requestError
      );

      setError(
        "Unable to connect to the HireIntel AI server."
      );

    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f8fc",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Loading job...</h2>
          <p>Please wait while we load the job details.</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f8fc",
          padding: "30px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "700px",
            background: "#fff",
            borderRadius: "20px",
            padding: "50px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "30px", marginBottom: "20px" }}>
            ⚠
          </div>

          <h1>Job not found</h1>

          <p style={{ color: "#68708a", marginTop: "15px" }}>
            {error}
          </p>

          <p style={{ color: "#8b91a5", marginTop: "10px" }}>
            Job ID: {jobId || "Missing"}
          </p>

          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: "25px" }}
            onClick={() => navigate("/candidate/jobs")}
          >
            ← Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fc",
        padding: "50px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            gap: "20px",
          }}
        >
          <div>
            <p style={{ color: "#6652e8", fontWeight: "700" }}>
              CAREER OPPORTUNITY
            </p>

            <h1>{job.job_title}</h1>

            <p>{job.company_name || "Company"}</p>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate("/candidate/jobs")}
          >
            ← Back to Jobs
          </button>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "40px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "25px",
              marginBottom: "30px",
            }}
          >
            <span>📍 {job.location || "Location not specified"}</span>
            <span>💼 {job.job_type || "Job type not specified"}</span>
            <span>
              🧑‍💻 {job.experience_required || "Experience not specified"}
            </span>
          </div>

          <h2>Job Description</h2>

          <p
            style={{
              lineHeight: "1.8",
              whiteSpace: "pre-line",
              marginTop: "15px",
            }}
          >
            {job.description || "No job description provided."}
          </p>

          <h2 style={{ marginTop: "35px" }}>Required Skills</h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            {(job.required_skills || "")
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
              .map((skill) => (
                <span
                  key={skill}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "20px",
                    background: "#f0edff",
                    color: "#5e4ee5",
                    fontWeight: "600",
                  }}
                >
                  {skill}
                </span>
              ))}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "40px",
          }}
        >
          <h2>Apply for this position</h2>

          {error && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                background: "#fff0f0",
                color: "#d93025",
                marginTop: "20px",
              }}
            >
              {error}
            </div>
          )}

          {applicationSuccess ? (
            <div
              style={{
                padding: "25px",
                borderRadius: "15px",
                background: "#effaf3",
                marginTop: "20px",
              }}
            >
              <h3>✓ Application submitted</h3>

              <p>You have already applied for this job.</p>

              <p>Application ID: {applicationSuccess.id}</p>
              <p>Resume ID: {applicationSuccess.resume_id}</p>
              <p>
                Match Score: {applicationSuccess.match_score ?? "—"}%
              </p>
              <p>Status: {applicationSuccess.status || "Applied"}</p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate("/candidate/applications")}
                >
                  View My Applications
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate("/candidate/jobs")}
                >
                  Browse More Jobs
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={applyForJob}
              style={{ marginTop: "25px" }}
            >
              <label>
                <strong>Select Resume</strong>
              </label>

              {resumesLoading && (
                <p
                  style={{
                    color: "#68708a",
                    marginTop: "10px",
                  }}
                >
                  Loading your resumes...
                </p>
              )}

              {!resumesLoading && resumes.length === 0 && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "16px",
                    borderRadius: "10px",
                    background: "#fff7e6",
                    color: "#8a5a00",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    No resume found. Please upload a resume before applying.
                  </p>

                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ marginTop: "12px" }}
                    onClick={() => navigate("/candidate/resumes")}
                  >
                    Upload Resume
                  </button>
                </div>
              )}

              {!resumesLoading && resumes.length > 0 && (
                <>
                  <select
                    value={resumeId}
                    onChange={(event) => setResumeId(event.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "14px",
                      marginTop: "8px",
                      marginBottom: "10px",
                      boxSizing: "border-box",
                      borderRadius: "10px",
                      border: "1px solid #dfe3ee",
                      background: "#fff",
                      fontSize: "15px",
                    }}
                  >
                    {resumes.map((resume) => (
                      <option
                        key={resume.id}
                        value={String(resume.id)}
                      >
                        Resume #{resume.id} — {resume.original_filename || "Uploaded Resume"}
                      </option>
                    ))}
                  </select>

                  <p
                    style={{
                      color: "#68708a",
                      fontSize: "13px",
                      marginTop: "6px",
                      marginBottom: "20px",
                    }}
                  >
                    The latest uploaded resume is selected automatically.
                    You can choose another resume if needed.
                  </p>
                </>
              )}

              <label>
                <strong>Cover Letter</strong>
              </label>

              <textarea
                value={coverLetter}
                onChange={(event) => setCoverLetter(event.target.value)}
                placeholder="Write a short cover letter..."
                rows={7}
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "8px",
                  marginBottom: "20px",
                  boxSizing: "border-box",
                }}
              />

              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={
                  applying ||
                  resumesLoading ||
                  resumes.length === 0
                }
              >
                {applying
                  ? "Submitting Application..."
                  : "Apply Now →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
function RecruiterApplications() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedJobId, setSelectedJobId] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchText, setSearchText] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  // ============================================================
  // LOAD RECRUITER APPLICATIONS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadApplications = async () => {
      const token =
        localStorage.getItem("hireintel_token");

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      try {
        setLoading(true);
        setError("");

        // --------------------------------------------------------
        // LOAD RECRUITER DASHBOARD
        // --------------------------------------------------------

        const dashboardResponse =
          await fetch(
            `${API_BASE_URL}/dashboard/recruiter`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",
              },
            }
          );

        const dashboardData =
          await dashboardResponse
            .json()
            .catch(() => null);

        // --------------------------------------------------------
        // TOKEN EXPIRED
        // --------------------------------------------------------

        if (
          dashboardResponse.status ===
          401
        ) {
          localStorage.removeItem(
            "hireintel_token"
          );

          localStorage.removeItem(
            "hireintel_role"
          );

          localStorage.removeItem(
            "hireintel_user_id"
          );

          localStorage.removeItem(
            "hireintel_email"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        // --------------------------------------------------------
        // DASHBOARD ERROR
        // --------------------------------------------------------

        if (
          !dashboardResponse.ok
        ) {
          throw new Error(
            getErrorMessage(
              dashboardData,
              "Unable to load recruiter jobs."
            )
          );
        }

        const recruiterJobs =
          Array.isArray(
            dashboardData?.jobs
          )
            ? dashboardData.jobs
            : [];

        if (cancelled) {
          return;
        }

        setJobs(
          recruiterJobs
        );

        // --------------------------------------------------------
        // LOAD APPLICATIONS FOR EVERY JOB
        // --------------------------------------------------------

        const allApplications = [];

        for (
          const job of recruiterJobs
        ) {
          if (cancelled) {
            return;
          }

          const jobId =
            job?.job_id ??
            job?.id;

          if (!jobId) {
            continue;
          }

          try {
            const response =
              await fetch(
                `${API_BASE_URL}/applications/job/${jobId}`,
                {
                  method: "GET",

                  headers: {
                    Authorization:
                      `Bearer ${token}`,

                    Accept:
                      "application/json",
                  },
                }
              );

            const data =
              await response
                .json()
                .catch(() => []);

            // ----------------------------------------------------
            // TOKEN EXPIRED
            // ----------------------------------------------------

            if (
              response.status ===
              401
            ) {
              localStorage.removeItem(
                "hireintel_token"
              );

              localStorage.removeItem(
                "hireintel_role"
              );

              localStorage.removeItem(
                "hireintel_user_id"
              );

              localStorage.removeItem(
                "hireintel_email"
              );

              navigate("/login", {
                replace: true,
              });

              return;
            }

            // ----------------------------------------------------
            // APPLICATION DATA
            // ----------------------------------------------------

            if (
              response.ok &&
              Array.isArray(data)
            ) {
              data.forEach(
                (application) => {
                  allApplications.push({
                    ...application,

                    job_title:
                      job?.job_title ||
                      job?.title ||
                      "Job",

                    company_name:
                      job?.company_name ||
                      job?.company ||
                      "Company",

                    job_location:
                      job?.location ||
                      "",
                  });
                }
              );
            }
          } catch (jobError) {
            console.warn(
              `Could not load applications for job ${jobId}:`,
              jobError
            );
          }
        }

        if (cancelled) {
          return;
        }

        // --------------------------------------------------------
        // SORT APPLICATIONS BY MATCH SCORE
        // --------------------------------------------------------

        allApplications.sort(
          (a, b) => {
            const scoreA =
              a.match_score !==
                null &&
              a.match_score !==
                undefined &&
              a.match_score !==
                ""
                ? Number(
                    a.match_score
                  )
                : -1;

            const scoreB =
              b.match_score !==
                null &&
              b.match_score !==
                undefined &&
              b.match_score !==
                ""
                ? Number(
                    b.match_score
                  )
                : -1;

            return (
              (Number.isFinite(
                scoreB
              )
                ? scoreB
                : -1) -
              (Number.isFinite(
                scoreA
              )
                ? scoreA
                : -1)
            );
          }
        );

        setApplications(
          allApplications
        );

        setError("");
      } catch (requestError) {
        console.error(
          "Recruiter applications error:",
          requestError
        );

        if (!cancelled) {
          setError(
            requestError?.message ||
              "Unable to load applications."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timerId =
      window.setTimeout(
        () => {
          loadApplications();
        },
        0
      );

    return () => {
      cancelled = true;

      window.clearTimeout(
        timerId
      );
    };
  }, [navigate]);

  // ============================================================
  // UPDATE APPLICATION STATUS
  // ============================================================

  const updateApplicationStatus =
    async (
      applicationId,
      newStatus
    ) => {
      const token =
        localStorage.getItem(
          "hireintel_token"
        );

      if (!token) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      setUpdatingId(
        applicationId
      );

      setError("");

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/applications/${applicationId}/status`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  status:
                    newStatus,

                  recruiter_notes:
                    `Application status updated to ${newStatus}.`,
                }),
            }
          );

        const data =
          await response
            .json()
            .catch(() => null);

        // --------------------------------------------------------
        // TOKEN EXPIRED
        // --------------------------------------------------------

        if (
          response.status ===
          401
        ) {
          localStorage.removeItem(
            "hireintel_token"
          );

          localStorage.removeItem(
            "hireintel_role"
          );

          localStorage.removeItem(
            "hireintel_user_id"
          );

          localStorage.removeItem(
            "hireintel_email"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        // --------------------------------------------------------
        // UPDATE FAILED
        // --------------------------------------------------------

        if (
          !response.ok
        ) {
          setError(
            getErrorMessage(
              data,
              "Unable to update application status."
            )
          );

          return;
        }

        // --------------------------------------------------------
        // UPDATE FRONTEND IMMEDIATELY
        // --------------------------------------------------------

        setApplications(
          (
            currentApplications
          ) =>
            currentApplications.map(
              (
                application
              ) => {
                if (
                  Number(
                    application.id
                  ) !==
                  Number(
                    applicationId
                  )
                ) {
                  return application;
                }

                return {
                  ...application,

                  status:
                    data?.status ||
                    newStatus,

                  recruiter_notes:
                    data?.recruiter_notes ||
                    application.recruiter_notes,
                };
              }
            )
        );
      } catch (requestError) {
        console.error(
          "Status update error:",
          requestError
        );

        setError(
          "Unable to connect to the HireIntel AI server."
        );
      } finally {
        setUpdatingId(
          null
        );
      }
    };

  // ============================================================
  // FILTER APPLICATIONS
  // ============================================================

  const filteredApplications =
    applications.filter(
      (application) => {
        // --------------------------------------------------------
        // JOB FILTER
        // --------------------------------------------------------

        const matchesJob =
          selectedJobId ===
            "all" ||
          Number(
            application.job_id
          ) ===
            Number(
              selectedJobId
            );

        // --------------------------------------------------------
        // STATUS FILTER
        // --------------------------------------------------------

        const currentStatus =
          String(
            application.status ||
              "Applied"
          ).toLowerCase();

        const matchesStatus =
          selectedStatus ===
            "all" ||
          currentStatus ===
            selectedStatus.toLowerCase();

        // --------------------------------------------------------
        // SEARCH FILTER
        // --------------------------------------------------------

        const search =
          searchText
            .trim()
            .toLowerCase();

        if (!search) {
          return (
            matchesJob &&
            matchesStatus
          );
        }

        const searchableText = [
          application.id,
          application.job_id,
          application.candidate_id,
          application.resume_id,
          application.job_title,
          application.company_name,
          application.job_location,
          application.status,
          application.cover_letter,
        ]
          .filter(
            (value) =>
              value !==
                null &&
              value !==
                undefined
          )
          .join(" ")
          .toLowerCase();

        return (
          matchesJob &&
          matchesStatus &&
          searchableText.includes(
            search
          )
        );
      }
    );

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalApplications =
    applications.length;

  const shortlistedCount =
    applications.filter(
      (application) =>
        String(
          application.status ||
            "Applied"
        ).toLowerCase() ===
        "shortlisted"
    ).length;

  const interviewCount =
    applications.filter(
      (application) =>
        String(
          application.status ||
            "Applied"
        ).toLowerCase() ===
        "interview"
    ).length;

  const hiredCount =
    applications.filter(
      (application) =>
        String(
          application.status ||
            "Applied"
        ).toLowerCase() ===
        "hired"
    ).length;

  const rejectedCount =
    applications.filter(
      (application) =>
        String(
          application.status ||
            "Applied"
        ).toLowerCase() ===
        "rejected"
    ).length;

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusStyle =
    (status) => {
      const value =
        String(
          status ||
            "Applied"
        ).toLowerCase();

      if (
        value ===
        "shortlisted"
      ) {
        return {
          background:
            "#eeeaff",

          color:
            "#6652e8",
        };
      }

      if (
        value ===
        "interview"
      ) {
        return {
          background:
            "#eaf4ff",

          color:
            "#1976d2",
        };
      }

      if (
        value ===
        "hired"
      ) {
        return {
          background:
            "#e9f8ef",

          color:
            "#168447",
        };
      }

      if (
        value ===
        "rejected"
      ) {
        return {
          background:
            "#fff0f0",

          color:
            "#d93025",
        };
      }

      return {
        background:
          "#f2f3f7",

        color:
          "#555b70",
      };
    };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight:
            "100vh",

          background:
            "#f7f8fc",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          padding:
            "30px",
        }}
      >
        <div
          style={{
            background:
              "#fff",

            borderRadius:
              "20px",

            padding:
              "45px",

            textAlign:
              "center",

            boxShadow:
              "0 10px 35px rgba(40,40,80,0.07)",
          }}
        >
          <div
            style={{
              width:
                "50px",

              height:
                "50px",

              borderRadius:
                "50%",

              border:
                "5px solid #e8e5ff",

              borderTopColor:
                "#6652e8",

              margin:
                "0 auto 20px",

              animation:
                "hireintel-applications-spin 0.9s linear infinite",
            }}
          />

          <h2>
            Loading Applications...
          </h2>

          <p
            style={{
              color:
                "#68708a",
            }}
          >
            Fetching candidate
            applications.
          </p>
        </div>

        <style>
          {`
            @keyframes hireintel-applications-spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div
      style={{
        minHeight:
          "100vh",

        background:
          "#f7f8fc",

        padding:
          "40px 25px 70px",
      }}
    >
      <div
        style={{
          maxWidth:
            "1250px",

          margin:
            "0 auto",
        }}
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            flexWrap:
              "wrap",

            gap:
              "20px",

            marginBottom:
              "30px",
          }}
        >
          <div>
            <p
              style={{
                color:
                  "#6652e8",

                fontWeight:
                  "800",

                letterSpacing:
                  "0.08em",

                marginBottom:
                  "8px",
              }}
            >
              RECRUITER PORTAL
            </p>

            <h1
              style={{
                margin:
                  0,
              }}
            >
              Candidate Applications
            </h1>

            <p
              style={{
                color:
                  "#68708a",

                marginTop:
                  "10px",

                lineHeight:
                  "1.6",
              }}
            >
              Review candidates,
              compare AI match
              scores and manage
              applications.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() =>
              navigate(
                "/recruiter/dashboard"
              )
            }
          >
            ← Dashboard
          </button>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div
            style={{
              background:
                "#fff0f0",

              color:
                "#d93025",

              border:
                "1px solid #ffd4d4",

              padding:
                "15px 18px",

              borderRadius:
                "12px",

              marginBottom:
                "20px",
            }}
          >
            {error}
          </div>
        )}

        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",

            gap:
              "18px",

            marginBottom:
              "25px",
          }}
        >
          {/* TOTAL JOBS */}

          <div
            style={{
              background:
                "#fff",

              borderRadius:
                "18px",

              padding:
                "24px",

              boxShadow:
                "0 5px 20px rgba(40,40,80,0.04)",
            }}
          >
            <small
              style={{
                color:
                  "#68708a",
              }}
            >
              Total Jobs
            </small>

            <h2
              style={{
                margin:
                  "10px 0 0",
              }}
            >
              {jobs.length}
            </h2>
          </div>

          {/* TOTAL APPLICATIONS */}

          <div
            style={{
              background:
                "#fff",

              borderRadius:
                "18px",

              padding:
                "24px",

              boxShadow:
                "0 5px 20px rgba(40,40,80,0.04)",
            }}
          >
            <small
              style={{
                color:
                  "#68708a",
              }}
            >
              Total Applications
            </small>

            <h2
              style={{
                margin:
                  "10px 0 0",
              }}
            >
              {totalApplications}
            </h2>
          </div>

          {/* SHORTLISTED */}

          <div
            style={{
              background:
                "#fff",

              borderRadius:
                "18px",

              padding:
                "24px",

              boxShadow:
                "0 5px 20px rgba(40,40,80,0.04)",
            }}
          >
            <small
              style={{
                color:
                  "#68708a",
              }}
            >
              Shortlisted
            </small>

            <h2
              style={{
                margin:
                  "10px 0 0",

                color:
                  "#6652e8",
              }}
            >
              {shortlistedCount}
            </h2>
          </div>

          {/* INTERVIEWS */}

          <div
            style={{
              background:
                "#fff",

              borderRadius:
                "18px",

              padding:
                "24px",

              boxShadow:
                "0 5px 20px rgba(40,40,80,0.04)",
            }}
          >
            <small
              style={{
                color:
                  "#68708a",
              }}
            >
              Interviews
            </small>

            <h2
              style={{
                margin:
                  "10px 0 0",
              }}
            >
              {interviewCount}
            </h2>
          </div>

          {/* REJECTED */}

          <div
            style={{
              background:
                "#fff",

              borderRadius:
                "18px",

              padding:
                "24px",

              boxShadow:
                "0 5px 20px rgba(40,40,80,0.04)",
            }}
          >
            <small
              style={{
                color:
                  "#68708a",
              }}
            >
              Rejected
            </small>

            <h2
              style={{
                margin:
                  "10px 0 0",

                color:
                  "#d93025",
              }}
            >
              {rejectedCount}
            </h2>
          </div>

          {/* HIRED */}

          <div
            style={{
              background:
                "#fff",

              borderRadius:
                "18px",

              padding:
                "24px",

              boxShadow:
                "0 5px 20px rgba(40,40,80,0.04)",
            }}
          >
            <small
              style={{
                color:
                  "#68708a",
              }}
            >
              Hired
            </small>

            <h2
              style={{
                margin:
                  "10px 0 0",

                color:
                  "#168447",
              }}
            >
              {hiredCount}
            </h2>
          </div>
        </div>

        {/* ======================================================
            SEARCH & FILTER
        ====================================================== */}

        <div
          style={{
            background:
              "#fff",

            borderRadius:
              "18px",

            padding:
              "22px",

            marginBottom:
              "25px",

            boxShadow:
              "0 5px 20px rgba(40,40,80,0.04)",
          }}
        >
          <h3
            style={{
              marginTop:
                0,

              marginBottom:
                "18px",
            }}
          >
            Search & Filter
          </h3>

          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",

              gap:
                "15px",
            }}
          >
            {/* SEARCH */}

            <div>
              <label
                style={{
                  display:
                    "block",

                  fontWeight:
                    "700",

                  marginBottom:
                    "8px",
                }}
              >
                Search
              </label>

              <input
                type="text"
                value={
                  searchText
                }
                onChange={(
                  event
                ) =>
                  setSearchText(
                    event.target
                      .value
                  )
                }
                placeholder="Search job, candidate ID, resume ID..."
                style={{
                  width:
                    "100%",

                  padding:
                    "13px",

                  borderRadius:
                    "10px",

                  border:
                    "1px solid #dfe3ee",

                  boxSizing:
                    "border-box",

                  fontSize:
                    "14px",
                }}
              />
            </div>

            {/* JOB FILTER */}

            <div>
              <label
                style={{
                  display:
                    "block",

                  fontWeight:
                    "700",

                  marginBottom:
                    "8px",
                }}
              >
                Filter by Job
              </label>

              <select
                value={
                  selectedJobId
                }
                onChange={(
                  event
                ) =>
                  setSelectedJobId(
                    event.target
                      .value
                  )
                }
                style={{
                  width:
                    "100%",

                  padding:
                    "13px",

                  borderRadius:
                    "10px",

                  border:
                    "1px solid #dfe3ee",

                  background:
                    "#fff",

                  boxSizing:
                    "border-box",
                }}
              >
                <option value="all">
                  All Jobs
                </option>

                {jobs.map(
                  (job) => {
                    const jobId =
                      job?.job_id ??
                      job?.id;

                    return (
                      <option
                        key={
                          jobId
                        }
                        value={
                          jobId
                        }
                      >
                        {job?.job_title ||
                          job?.title ||
                          `Job #${jobId}`}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            {/* STATUS FILTER */}

            <div>
              <label
                style={{
                  display:
                    "block",

                  fontWeight:
                    "700",

                  marginBottom:
                    "8px",
                }}
              >
                Filter by Status
              </label>

              <select
                value={
                  selectedStatus
                }
                onChange={(
                  event
                ) =>
                  setSelectedStatus(
                    event.target
                      .value
                  )
                }
                style={{
                  width:
                    "100%",

                  padding:
                    "13px",

                  borderRadius:
                    "10px",

                  border:
                    "1px solid #dfe3ee",

                  background:
                    "#fff",

                  boxSizing:
                    "border-box",
                }}
              >
                <option value="all">
                  All Statuses
                </option>

                <option value="Applied">
                  Applied
                </option>

                <option value="Shortlisted">
                  Shortlisted
                </option>

                <option value="Interview">
                  Interview
                </option>

                <option value="Rejected">
                  Rejected
                </option>

                <option value="Hired">
                  Hired
                </option>
              </select>
            </div>
          </div>

          <p
            style={{
              color:
                "#68708a",

              margin:
                "15px 0 0",

              fontSize:
                "14px",
            }}
          >
            Showing{" "}
            <strong>
              {
                filteredApplications.length
              }
            </strong>{" "}
            of{" "}
            <strong>
              {
                applications.length
              }
            </strong>{" "}
            applications
          </p>
        </div>

        {/* ======================================================
            APPLICATION LIST
        ====================================================== */}

        {filteredApplications.length ===
        0 ? (
          <div
            style={{
              background:
                "#fff",

              borderRadius:
                "20px",

              padding:
                "70px 30px",

              textAlign:
                "center",

              boxShadow:
                "0 5px 20px rgba(40,40,80,0.04)",
            }}
          >
            <div
              style={{
                fontSize:
                  "50px",

                marginBottom:
                  "15px",
              }}
            >
              📋
            </div>

            <h2>
              No Applications Found
            </h2>

            <p
              style={{
                color:
                  "#68708a",

                marginTop:
                  "10px",
              }}
            >
              No applications match
              your current filters.
            </p>
          </div>
        ) : (
          <div
            style={{
              display:
                "grid",

              gap:
                "20px",
            }}
          >
            {filteredApplications.map(
              (
                application
              ) => {
                // ------------------------------------------------
                // MATCH SCORE
                // ------------------------------------------------

                const rawScore =
                  application.match_score;

                const numericScore =
                  rawScore !==
                    null &&
                  rawScore !==
                    undefined &&
                  rawScore !==
                    ""
                    ? Number(
                        rawScore
                      )
                    : null;

                const safeScore =
                  numericScore !==
                    null &&
                  Number.isFinite(
                    numericScore
                  )
                    ? Math.min(
                        Math.max(
                          numericScore,
                          0
                        ),
                        100
                      )
                    : null;

                // ------------------------------------------------
                // STATUS
                // ------------------------------------------------

                const displayStatus =
                  application.status ||
                  "Applied";

                const statusStyle =
                  getStatusStyle(
                    displayStatus
                  );

                const isUpdating =
                  updatingId ===
                  application.id;

                return (
                  <div
                    key={
                      application.id
                    }
                    style={{
                      background:
                        "#fff",

                      borderRadius:
                        "20px",

                      padding:
                        "28px",

                      boxShadow:
                        "0 5px 20px rgba(40,40,80,0.05)",
                    }}
                  >
                    {/* ==========================================
                        HEADER
                    ========================================== */}

                    <div
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "flex-start",

                        flexWrap:
                          "wrap",

                        gap:
                          "20px",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            color:
                              "#6652e8",

                            fontWeight:
                              "800",

                            margin:
                              "0 0 7px",

                            fontSize:
                              "13px",

                            letterSpacing:
                              "0.05em",
                          }}
                        >
                          APPLICATION #
                          {
                            application.id
                          }
                        </p>

                        <h2
                          style={{
                            margin:
                              "0 0 8px",
                          }}
                        >
                          {application.job_title ||
                            `Job #${application.job_id}`}
                        </h2>

                        <p
                          style={{
                            color:
                              "#68708a",

                            margin:
                              0,
                          }}
                        >
                          {application.company_name ||
                            "Company"}

                          {application.job_location
                            ? ` • ${application.job_location}`
                            : ""}
                        </p>
                      </div>

                      {/* STATUS BADGE */}

                      <span
                        style={{
                          ...statusStyle,

                          padding:
                            "8px 15px",

                          borderRadius:
                            "20px",

                          fontWeight:
                            "700",

                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {
                          displayStatus
                        }
                      </span>
                    </div>

                    {/* ==========================================
                        DETAILS
                    ========================================== */}

                    <div
                      style={{
                        display:
                          "grid",

                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(170px, 1fr))",

                        gap:
                          "15px",

                        marginTop:
                          "25px",

                        paddingTop:
                          "20px",

                        borderTop:
                          "1px solid #eee",
                      }}
                    >
                      {/* CANDIDATE ID */}

                      <div>
                        <small
                          style={{
                            color:
                              "#68708a",
                          }}
                        >
                          Candidate ID
                        </small>

                        <strong
                          style={{
                            display:
                              "block",

                            marginTop:
                              "5px",
                          }}
                        >
                          {
                            application.candidate_id ??
                            "—"
                          }
                        </strong>
                      </div>

                      {/* RESUME ID */}

                      <div>
                        <small
                          style={{
                            color:
                              "#68708a",
                          }}
                        >
                          Resume ID
                        </small>

                        <strong
                          style={{
                            display:
                              "block",

                            marginTop:
                              "5px",
                          }}
                        >
                          {
                            application.resume_id ??
                            "—"
                          }
                        </strong>
                      </div>

                      {/* JOB ID */}

                      <div>
                        <small
                          style={{
                            color:
                              "#68708a",
                          }}
                        >
                          Job ID
                        </small>

                        <strong
                          style={{
                            display:
                              "block",

                            marginTop:
                              "5px",
                          }}
                        >
                          {
                            application.job_id ??
                            "—"
                          }
                        </strong>
                      </div>

                      {/* MATCH SCORE */}

                      <div>
                        <small
                          style={{
                            color:
                              "#68708a",
                          }}
                        >
                          AI Match Score
                        </small>

                        <strong
                          style={{
                            display:
                              "block",

                            marginTop:
                              "5px",

                            color:
                              safeScore !==
                              null
                                ? "#6652e8"
                                : "#999",

                            fontSize:
                              "18px",
                          }}
                        >
                          {safeScore !==
                          null
                            ? `${safeScore}%`
                            : "Not available"}
                        </strong>
                      </div>

                      {/* APPLIED DATE */}

                      <div>
                        <small
                          style={{
                            color:
                              "#68708a",
                          }}
                        >
                          Applied At
                        </small>

                        <strong
                          style={{
                            display:
                              "block",

                            marginTop:
                              "5px",
                          }}
                        >
                          {application.applied_at
                            ? new Date(
                                application.applied_at
                              ).toLocaleDateString()
                            : "—"}
                        </strong>
                      </div>
                    </div>

                    {/* ==========================================
                        AI MATCH SCORE
                    ========================================== */}

                    {safeScore !==
                      null && (
                      <div
                        style={{
                          marginTop:
                            "22px",

                          padding:
                            "18px",

                          background:
                            "#f8f7ff",

                          borderRadius:
                            "12px",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",

                            justifyContent:
                              "space-between",

                            alignItems:
                              "center",

                            marginBottom:
                              "9px",
                          }}
                        >
                          <strong>
                            AI Candidate Match
                          </strong>

                          <strong
                            style={{
                              color:
                                "#6652e8",
                            }}
                          >
                            {safeScore}%
                          </strong>
                        </div>

                        <div
                          style={{
                            width:
                              "100%",

                            height:
                              "9px",

                            background:
                              "#e5e1ff",

                            borderRadius:
                              "20px",

                            overflow:
                              "hidden",
                          }}
                        >
                          <div
                            style={{
                              width:
                                `${safeScore}%`,

                              height:
                                "100%",

                              background:
                                "#6652e8",

                              borderRadius:
                                "20px",

                              transition:
                                "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* ==========================================
                        NO MATCH SCORE
                    ========================================== */}

                    {safeScore ===
                      null && (
                      <div
                        style={{
                          marginTop:
                            "22px",

                          padding:
                            "16px 18px",

                          background:
                            "#fff8e8",

                          border:
                            "1px solid #f3dfae",

                          borderRadius:
                            "12px",

                          color:
                            "#806000",
                        }}
                      >
                        <strong>
                          AI Match Score
                        </strong>

                        <p
                          style={{
                            margin:
                              "6px 0 0",

                            fontSize:
                              "14px",
                          }}
                        >
                          Match score is
                          not available
                          for this
                          application
                          yet.
                        </p>
                      </div>
                    )}

                    {/* ==========================================
                        COVER LETTER
                    ========================================== */}

                    {application.cover_letter && (
                      <div
                        style={{
                          marginTop:
                            "22px",

                          padding:
                            "18px",

                          background:
                            "#f8f7ff",

                          borderRadius:
                            "12px",
                        }}
                      >
                        <strong>
                          Cover Letter
                        </strong>

                        <p
                          style={{
                            marginTop:
                              "8px",

                            lineHeight:
                              "1.7",

                            whiteSpace:
                              "pre-line",

                            color:
                              "#46506a",

                            marginBottom:
                              0,
                          }}
                        >
                          {
                            application.cover_letter
                          }
                        </p>
                      </div>
                    )}

                    {/* ==========================================
                        STATUS CONTROLS
                    ========================================== */}

                    <div
                      style={{
                        marginTop:
                          "25px",

                        paddingTop:
                          "20px",

                        borderTop:
                          "1px solid #eee",
                      }}
                    >
                      <strong>
                        Update Application Status
                      </strong>

                      <div
                        style={{
                          display:
                            "flex",

                          flexWrap:
                            "wrap",

                          gap:
                            "10px",

                          marginTop:
                            "12px",
                        }}
                      >
                        {[
                          "Applied",
                          "Shortlisted",
                          "Interview",
                          "Rejected",
                          "Hired",
                        ].map(
                          (
                            status
                          ) => {
                            const isActive =
                              String(
                                displayStatus
                              ).toLowerCase() ===
                              status.toLowerCase();

                            return (
                              <button
                                key={
                                  status
                                }
                                type="button"
                                disabled={
                                  isUpdating
                                }
                                onClick={() =>
                                  updateApplicationStatus(
                                    application.id,
                                    status
                                  )
                                }
                                style={{
                                  padding:
                                    "9px 15px",

                                  borderRadius:
                                    "9px",

                                  border:
                                    isActive
                                      ? "1px solid #6652e8"
                                      : "1px solid #ddd",

                                  background:
                                    isActive
                                      ? "#6652e8"
                                      : "#fff",

                                  color:
                                    isActive
                                      ? "#fff"
                                      : "#333",

                                  cursor:
                                    isUpdating
                                      ? "not-allowed"
                                      : "pointer",

                                  opacity:
                                    isUpdating
                                      ? 0.6
                                      : 1,

                                  fontWeight:
                                    isActive
                                      ? "700"
                                      : "500",

                                  transition:
                                    "all 0.2s ease",
                                }}
                              >
                                {isUpdating &&
                                isActive
                                  ? "Updating..."
                                  : status}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   SIMPLE RECRUITER PAGES
============================================================ */

function RecruiterPlaceholder({
  title,
  description,
}) {

  const navigate = useNavigate();


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fc",
        padding: "50px 25px",
      }}
    >

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "20px",
          padding: "50px",
          textAlign: "center",
        }}
      >

        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "20px",
            background: "#eeeaff",
            color: "#6652e8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "30px",
            fontWeight: "800",
          }}
        >
          H
        </div>


        <h1>
          {title}
        </h1>


        <p
          style={{
            color: "#68708a",
            marginTop: "15px",
            lineHeight: "1.7",
          }}
        >
          {description}
        </p>


        <button
          type="button"
          className="btn btn-primary"
          style={{
            marginTop: "25px",
          }}
          onClick={() =>
            navigate("/recruiter/dashboard")
          }
        >
          ← Back to Recruiter Dashboard
        </button>

      </div>

    </div>
  );
}


/* ============================================================
   RESUME ANALYSIS PAGE
============================================================ */

function ResumeAnalysisPage() {
  const navigate = useNavigate();
  const { resumeId } = useParams();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearSessionAndLogin = () => {
    localStorage.removeItem("hireintel_token");
    localStorage.removeItem("hireintel_role");
    localStorage.removeItem("hireintel_user_id");
    localStorage.removeItem("hireintel_email");
    navigate("/login", { replace: true });
  };

  const requestAnalysis = async (method) => {
    const token = localStorage.getItem("hireintel_token");
    if (!token) {
      clearSessionAndLogin();
      throw new Error("Please log in to continue.");
    }

    const id = Number(resumeId);
    if (!resumeId || !Number.isInteger(id) || id <= 0) {
      throw new Error("Invalid resume ID.");
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}/resume-analysis/${id}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch {
      throw new Error(
        "Unable to connect to the HireIntel AI server. Make sure the FastAPI backend is running on port 8000."
      );
    }

    const data = await response.json().catch(() => null);
    if (response.status === 401) {
      clearSessionAndLogin();
      throw new Error("Your session has expired. Please log in again.");
    }
    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          method === "POST"
            ? "Unable to analyze this resume."
            : "Unable to load resume analysis."
        )
      );
    }
    return data;
  };

  useEffect(() => {
    let cancelled = false;

    async function loadAnalysis() {
      setLoading(true);
      setError("");
      try {
        const data = await requestAnalysis("GET");
        if (!cancelled) setAnalysis(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load resume analysis.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAnalysis();
    return () => {
      cancelled = true;
    };
    // Loading is intentionally triggered when the route's resume ID changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, navigate]);

  const handleReanalyze = async () => {
    setReanalyzing(true);
    setError("");
    setSuccess("");
    try {
      const data = await requestAnalysis("POST");
      setAnalysis(data);
      setSuccess("Resume analysis completed successfully.");
    } catch (err) {
      setError(err.message || "Unable to analyze this resume.");
    } finally {
      setReanalyzing(false);
    }
  };

  const asItems = (value, separator = ",") => {
    if (value === null || value === undefined || value === "") return [];
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string" || typeof item === "number") return String(item).trim();
          if (item && typeof item === "object") return String(item.name || item.title || item.skill || JSON.stringify(item));
          return "";
        })
        .filter(Boolean);
    }
    return String(value).split(separator).map((item) => item.trim()).filter(Boolean);
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "22px",
    boxShadow: "0 5px 20px rgba(40,40,80,0.04)",
  };

  const score =
    analysis?.resume_score !== null &&
    analysis?.resume_score !== undefined &&
    Number.isFinite(Number(analysis.resume_score))
      ? Number(analysis.resume_score)
      : null;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f8fc", display: "flex", alignItems: "center", justifyContent: "center", padding: "30px" }}>
        <div style={{ textAlign: "center" }}>
          <h2>Loading Resume Intelligence...</h2>
          <p style={{ color: "#68708a" }}>Fetching analysis for Resume #{resumeId}.</p>
        </div>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7f8fc", display: "flex", alignItems: "center", justifyContent: "center", padding: "30px" }}>
        <div style={{ width: "100%", maxWidth: "650px", background: "#fff", borderRadius: "22px", padding: "40px", textAlign: "center", boxShadow: "0 10px 35px rgba(40,40,80,0.07)" }}>
          <div style={{ fontSize: "42px", marginBottom: "15px" }}>⚠️</div>
          <h1>Analysis Not Available</h1>
          <p style={{ color: "#a12828", marginTop: "12px", lineHeight: "1.7" }}>{error}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginTop: "24px" }}>
            <button type="button" className="btn btn-primary" onClick={() => navigate("/candidate/resumes")}>← Back to My Resumes</button>
            <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fc", padding: "45px 20px 70px" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap", marginBottom: "25px" }}>
          <div>
            <p style={{ color: "#6652e8", fontWeight: "800", letterSpacing: "0.08em", marginBottom: "8px" }}>AI RESUME INTELLIGENCE</p>
            <h1 style={{ margin: 0 }}>Resume Analysis</h1>
            <p style={{ color: "#68708a", marginTop: "8px" }}>Detailed analysis for Resume #{resumeId}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/candidate/resumes")}>← My Resumes</button>
            <button type="button" className="btn btn-primary" disabled={reanalyzing} onClick={handleReanalyze}>
              {reanalyzing ? "Analyzing..." : "Reanalyze Resume"}
            </button>
          </div>
        </div>

        {error && <div role="alert" style={{ padding: "14px 16px", background: "#fff0f0", border: "1px solid #ffcaca", color: "#a12828", borderRadius: "10px", marginBottom: "18px" }}>{error}</div>}
        {success && <div role="status" style={{ padding: "14px 16px", background: "#ecfdf3", border: "1px solid #b7ebc9", color: "#176b3a", borderRadius: "10px", marginBottom: "18px" }}>{success}</div>}

        {analysis && <>
          <section style={{ background: "linear-gradient(135deg, #6652e8, #7c6af0)", color: "#fff", borderRadius: "24px", padding: "35px", marginBottom: "22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "30px", flexWrap: "wrap", boxShadow: "0 15px 35px rgba(102,82,232,0.18)" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", opacity: 0.85, marginBottom: "8px" }}>OVERALL RESUME SCORE</div>
              <h2 style={{ margin: 0, fontSize: "24px" }}>AI-powered resume evaluation</h2>
              <p style={{ margin: "8px 0 0", opacity: 0.85 }}>Based on the extracted resume information.</p>
            </div>
            <div style={{ minWidth: "135px", textAlign: "center", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "20px", padding: "18px 22px" }}>
              <div style={{ fontSize: "44px", lineHeight: 1, fontWeight: "900" }}>{score !== null ? `${score}%` : "—"}</div>
              <div style={{ marginTop: "7px", fontSize: "13px", fontWeight: "700", opacity: 0.85 }}>Resume Score</div>
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Professional Summary</h2>
            <p style={{ color: "#59627a", lineHeight: "1.8", whiteSpace: "pre-line", marginBottom: 0 }}>{analysis.summary || "No summary available."}</p>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "22px", marginBottom: "22px" }}>
            {[["Skills", analysis.skills, ","], ["Keywords", analysis.keywords, ","]].map(([title, value, separator]) => (
              <section key={title} style={{ ...cardStyle, marginBottom: 0 }}>
                <h2 style={{ marginTop: 0 }}>{title}</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "9px" }}>
                  {asItems(value, separator).length ? asItems(value, separator).map((item, index) => (
                    <span key={`${title}-${index}`} style={{ padding: "9px 13px", borderRadius: "20px", background: title === "Skills" ? "#f0edff" : "#eef8f4", color: title === "Skills" ? "#5e4ee5" : "#137a55", fontWeight: "700", fontSize: "14px" }}>{item}</span>
                  )) : <span style={{ color: "#8b91a5" }}>No {title.toLowerCase()} available.</span>}
                </div>
              </section>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "22px", marginBottom: "22px" }}>
            {[["Education", analysis.education], ["Experience", analysis.experience], ["Projects", analysis.projects], ["Certifications", analysis.certifications]].map(([title, value]) => (
              <section key={title} style={{ ...cardStyle, marginBottom: 0 }}>
                <h2 style={{ marginTop: 0 }}>{title}</h2>
                <p style={{ color: "#59627a", lineHeight: "1.8", whiteSpace: "pre-line", margin: 0 }}>{Array.isArray(value) ? value.join("\n") : value || `No ${title.toLowerCase()} information available.`}</p>
              </section>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "22px", marginBottom: "22px" }}>
            {[["Strengths", analysis.strengths], ["Areas to Improve", analysis.weaknesses]].map(([title, value]) => (
              <section key={title} style={{ ...cardStyle, marginBottom: 0 }}>
                <h2 style={{ marginTop: 0 }}>{title}</h2>
                {asItems(value, "\n").length ? <ul style={{ margin: 0, paddingLeft: "22px", color: "#42506a", lineHeight: "1.8" }}>{asItems(value, "\n").map((item, index) => <li key={`${title}-${index}`} style={{ marginBottom: "8px" }}>{item}</li>)}</ul> : <p style={{ color: "#8b91a5" }}>No information available.</p>}
              </section>
            ))}
          </div>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>AI Recommendations</h2>
            {asItems(analysis.recommendations, "\n").length ? <ol style={{ color: "#46506a", lineHeight: "1.8", paddingLeft: "22px" }}>{asItems(analysis.recommendations, "\n").map((item, index) => <li key={`recommendation-${index}`} style={{ marginBottom: "8px" }}>{item}</li>)}</ol> : <p style={{ color: "#8b91a5" }}>No recommendations available.</p>}
          </section>

          <p style={{ color: "#85899b", fontSize: "12px", lineHeight: "1.6", marginTop: "20px" }}>This resume score is an indicative application score, not a guarantee of ATS compatibility or job selection.</p>
        </>}

        <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/candidate/resumes")}>← Back to My Resumes</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   RECRUITER EDIT JOB
============================================================ */

function RecruiterEditJob() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const [form, setForm] = useState({
    job_title: "",
    company_name: "",
    location: "",
    job_type: "",
    experience_required: "",
    required_skills: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadJob = async () => {
      const token = localStorage.getItem("hireintel_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      if (!jobId) {
        setError("Job ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/recruiter/jobs/${jobId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json().catch(() => null);

        if (response.status === 401) {
          localStorage.removeItem("hireintel_token");
          localStorage.removeItem("hireintel_role");
          localStorage.removeItem("hireintel_user_id");
          localStorage.removeItem("hireintel_email");

          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          setError(
            getErrorMessage(
              data,
              "Unable to load the job."
            )
          );
          return;
        }

        if (!cancelled) {
          setForm({
            job_title: data?.job_title || "",
            company_name: data?.company_name || "",
            location: data?.location || "",
            job_type: data?.job_type || "",
            experience_required:
              data?.experience_required || "",
            required_skills: Array.isArray(
              data?.required_skills
            )
              ? data.required_skills.join(", ")
              : data?.required_skills || "",
            description: data?.description || "",
          });
        }
      } catch (requestError) {
        console.error(
          "Load recruiter job error:",
          requestError
        );

        if (!cancelled) {
          setError(
            "Unable to connect to the HireIntel AI server."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [jobId, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("hireintel_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (!form.job_title.trim()) {
      setError("Job title is required.");
      return;
    }

    if (!form.company_name.trim()) {
      setError("Company name is required.");
      return;
    }

    if (!form.location.trim()) {
      setError("Location is required.");
      return;
    }

    if (!form.job_type.trim()) {
      setError("Job type is required.");
      return;
    }

    if (!form.experience_required.trim()) {
      setError("Experience required is required.");
      return;
    }

    if (!form.required_skills.trim()) {
      setError("Required skills are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/recruiter/jobs/${jobId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_title: form.job_title.trim(),
            company_name: form.company_name.trim(),
            location: form.location.trim(),
            job_type: form.job_type.trim(),
            experience_required:
              form.experience_required.trim(),
            required_skills:
              form.required_skills.trim(),
            description: form.description.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        localStorage.removeItem("hireintel_token");
        localStorage.removeItem("hireintel_role");
        localStorage.removeItem("hireintel_user_id");
        localStorage.removeItem("hireintel_email");

        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        setError(
          getErrorMessage(
            data,
            "Unable to update the job."
          )
        );
        return;
      }

      setSuccess("Job updated successfully.");

      setTimeout(() => {
        navigate("/recruiter/jobs");
      }, 1000);
    } catch (requestError) {
      console.error(
        "Update recruiter job error:",
        requestError
      );

      setError(
        "Unable to connect to the HireIntel AI server."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f7fb",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow:
              "0 10px 35px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              marginBottom: "12px",
            }}
          >
            ⏳
          </div>

          <h3>Loading Job...</h3>

          <p style={{ color: "#777" }}>
            Please wait.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f7fb",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "25px" }}>
          <button
            type="button"
            onClick={() =>
              navigate("/recruiter/jobs")
            }
            style={{
              border: "none",
              background: "transparent",
              color: "#6652e8",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              padding: 0,
              marginBottom: "15px",
            }}
          >
            ← Back to My Jobs
          </button>

          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "32px",
              color: "#20243a",
            }}
          >
            Edit Job
          </h1>

          <p
            style={{
              margin: 0,
              color: "#777",
            }}
          >
            Update the details of your job posting.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "35px",
            boxShadow:
              "0 10px 35px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              background: "#f4f1ff",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "25px",
              color: "#6652e8",
              fontWeight: "600",
            }}
          >
            Job ID: #{jobId}
          </div>

          {error && (
            <div
              style={{
                background: "#fff1f1",
                border: "1px solid #ffcaca",
                color: "#c62828",
                padding: "14px 16px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              ❌ {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: "#effaf3",
                border: "1px solid #b9e8c8",
                color: "#1f7a3d",
                padding: "14px 16px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={editFieldStyle}>
              <label style={editLabelStyle}>
                Job Title *
              </label>

              <input
                type="text"
                name="job_title"
                value={form.job_title}
                onChange={handleChange}
                placeholder="e.g. Java Backend Developer"
                style={editInputStyle}
              />
            </div>

            <div style={editFieldStyle}>
              <label style={editLabelStyle}>
                Company Name *
              </label>

              <input
                type="text"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                placeholder="e.g. NovaTech Solutions"
                style={editInputStyle}
              />
            </div>

            <div style={editFieldStyle}>
              <label style={editLabelStyle}>
                Location *
              </label>

              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Pune"
                style={editInputStyle}
              />
            </div>

            <div style={editFieldStyle}>
              <label style={editLabelStyle}>
                Job Type *
              </label>

              <select
                name="job_type"
                value={form.job_type}
                onChange={handleChange}
                style={editInputStyle}
              >
                <option value="">
                  Select Job Type
                </option>

                <option value="Full Time">
                  Full Time
                </option>

                <option value="Part Time">
                  Part Time
                </option>

                <option value="Internship">
                  Internship
                </option>

                <option value="Contract">
                  Contract
                </option>

                <option value="Remote">
                  Remote
                </option>
              </select>
            </div>

            <div
              style={{
                ...editFieldStyle,
                background: "#faf9ff",
                padding: "20px",
                borderRadius: "14px",
                border: "2px solid #e5defe",
              }}
            >
              <label
                style={{
                  ...editLabelStyle,
                  color: "#6652e8",
                }}
              >
                Experience Required *
              </label>

              <input
                type="text"
                name="experience_required"
                value={form.experience_required}
                onChange={handleChange}
                placeholder="e.g. 1-3 years"
                style={{
                  ...editInputStyle,
                  border: "2px solid #d8cdfd",
                }}
              />

              <small
                style={{
                  display: "block",
                  marginTop: "8px",
                  color: "#777",
                }}
              >
                Example: 0-2 years, 1-3 years,
                3-5 years, Fresher
              </small>
            </div>

            <div style={editFieldStyle}>
              <label style={editLabelStyle}>
                Required Skills *
              </label>

              <input
                type="text"
                name="required_skills"
                value={form.required_skills}
                onChange={handleChange}
                placeholder="Java, Spring Boot, Hibernate, REST API, PostgreSQL"
                style={editInputStyle}
              />

              <small
                style={{
                  display: "block",
                  marginTop: "8px",
                  color: "#777",
                }}
              >
                Separate skills using commas.
              </small>
            </div>

            <div style={editFieldStyle}>
              <label style={editLabelStyle}>
                Job Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter the job description..."
                rows={7}
                style={{
                  ...editInputStyle,
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "30px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  navigate("/recruiter/jobs")
                }
                disabled={saving}
                className="btn btn-outline"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const editFieldStyle = {
  marginBottom: "22px",
};

const editLabelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: "700",
  color: "#30354d",
};

const editInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 15px",
  borderRadius: "10px",
  border: "1px solid #dcdfea",
  background: "#fff",
  color: "#20243a",
  fontSize: "15px",
};

/* ============================================================
   ROUTER
============================================================ */

function App() {
  return (
    <Routes>

      {/* ======================================================
          HOME
      ====================================================== */}

      <Route
        path="/"
        element={<HomePage />}
      />


      {/* ======================================================
          LOGIN
      ====================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* ======================================================
          RECRUITER ROUTES
      ====================================================== */}

      <Route
        path="/recruiter/dashboard"
        element={<RecruiterDashboard />}
      />


      <Route
        path="/recruiter/applications"
        element={<RecruiterApplications />}
      />


      {/* ======================================================
    RECRUITER JOBS
====================================================== */}

<Route
  path="/recruiter/jobs"
  element={
    <RecruiterJobs />
  }
/>


{/* ======================================================
    EDIT RECRUITER JOB
====================================================== */}

<Route
  path="/recruiter/jobs/:jobId/edit"
  element={
    <RecruiterEditJob />
  }
/>


{/* ======================================================
    POST NEW JOB
====================================================== */}

<Route
  path="/recruiter/post-job"
  element={
    <RecruiterPostJob />
  }
/>


      {/* ======================================================
          RECRUITER MATCHES
      ====================================================== */}

      <Route
        path="/recruiter/matches"
        element={
          <RecruiterCandidateMatches />
        }
      />


      {/* ======================================================
          RECRUITER PROFILE
      ====================================================== */}

      <Route
        path="/recruiter/profile"
        element={
          <RecruiterPlaceholder
            title="Recruiter Profile"
            description="View and manage your recruiter profile."
          />
        }
      />


      {/* ======================================================
          RECRUITER SETTINGS
      ====================================================== */}

      <Route
        path="/recruiter/settings"
        element={
          <RecruiterPlaceholder
            title="Recruiter Settings"
            description="Manage your recruiter account and application preferences."
          />
        }
      />


      {/* ======================================================
          CANDIDATE DASHBOARD
      ====================================================== */}

      <Route
        path="/candidate/dashboard"
        element={
          <CandidateDashboard />
        }
      />


      {/* ======================================================
          CANDIDATE JOBS
      ====================================================== */}

      <Route
        path="/candidate/jobs"
        element={
          <FindJobs />
        }
      />


      <Route
        path="/candidate/jobs/:jobId"
        element={
          <CandidateJobDetails />
        }
      />


      <Route
        path="/candidate/jobs/:jobId/apply"
        element={
          <CandidateJobDetails />
        }
      />


      {/* ======================================================
          CANDIDATE APPLICATIONS
      ====================================================== */}

      <Route
        path="/candidate/applications"
        element={
          <CandidateApplications />
        }
      />


      {/* ======================================================
          CANDIDATE JOB MATCHES
      ====================================================== */}

      <Route
        path="/candidate/job-matches"
        element={
          <CandidateJobMatches />
        }
      />


      {/* ======================================================
          CANDIDATE RESUMES
      ====================================================== */}

      <Route
        path="/candidate/resumes"
        element={
          <CandidateResumes />
        }
      />


      {/* ======================================================
          CANDIDATE RESUME ANALYSIS
      ====================================================== */}

      <Route
        path="/candidate/resume-analysis/:resumeId"
        element={
          <ResumeAnalysisPage />
        }
      />


      {/* ======================================================
          CANDIDATE CAREER INTELLIGENCE
      ====================================================== */}

      <Route
        path="/candidate/career-intelligence"
        element={
          <CareerIntelligence />
        }
      />


      {/* ======================================================
          CANDIDATE PROFILE
      ====================================================== */}

      <Route
        path="/candidate/profile"
        element={
          <CandidateProfile />
        }
      />


      {/* ======================================================
          CANDIDATE SETTINGS
      ====================================================== */}

      <Route
        path="/candidate/settings"
        element={
          <CandidateSettings />
        }
      />


      {/* ======================================================
          FALLBACK
      ====================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}


export default App;