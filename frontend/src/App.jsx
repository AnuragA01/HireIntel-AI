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

import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterCandidateMatches from "./pages/RecruiterCandidateMatches";


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
  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedJobId, setSelectedJobId] =
    useState("all");

  const [updatingId, setUpdatingId] =
    useState(null);


  useEffect(() => {
    let cancelled = false;

    const loadApplications = async () => {
      const token = localStorage.getItem("hireintel_token");

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      try {
        /* GET RECRUITER DASHBOARD */

        const dashboardResponse = await fetch(
          `${API_BASE_URL}/dashboard/recruiter`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const dashboardData = await dashboardResponse
          .json()
          .catch(() => null);

        if (dashboardResponse.status === 401) {
          localStorage.removeItem("hireintel_token");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (!dashboardResponse.ok) {
          throw new Error(
            getErrorMessage(
              dashboardData,
              "Unable to load recruiter jobs."
            )
          );
        }

        const recruiterJobs = Array.isArray(dashboardData?.jobs)
          ? dashboardData.jobs
          : [];

        if (cancelled) {
          return;
        }

        setJobs(recruiterJobs);

        /* GET APPLICATIONS FOR EACH JOB */

        const allApplications = [];

        for (const job of recruiterJobs) {
          if (cancelled) {
            return;
          }

          const jobId = job?.job_id ?? job?.id;

          if (!jobId) {
            continue;
          }

          try {
            const response = await fetch(
              `${API_BASE_URL}/applications/job/${jobId}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              }
            );

            const data = await response.json().catch(() => []);

            if (response.status === 401) {
              localStorage.removeItem("hireintel_token");

              navigate("/login", {
                replace: true,
              });

              return;
            }

            if (response.ok && Array.isArray(data)) {
              data.forEach((application) => {
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
                    job?.location || "",
                });
              });
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

        setApplications(allApplications);
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

    const timerId = window.setTimeout(() => {
      loadApplications();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [navigate]);

  /* UPDATE STATUS */

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

              body: JSON.stringify({
                status: newStatus,

                recruiter_notes:
                  `Application status updated to ${newStatus}.`,
              }),
            }
          );


        const data =
          await response.json()
            .catch(() => null);


        if (response.status === 401) {

          localStorage.removeItem(
            "hireintel_token"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }


        if (!response.ok) {

          setError(
            getErrorMessage(
              data,
              "Unable to update application status."
            )
          );

          return;
        }


        /* UPDATE UI WITHOUT REFRESH */

        setApplications(
          (currentApplications) =>
            currentApplications.map(
              (application) =>
                Number(application.id) ===
                Number(applicationId)
                  ? {
                      ...application,

                      status:
                        data?.status ||
                        newStatus,
                    }
                  : application
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

        setUpdatingId(null);

      }

    };


  const filteredApplications =
    selectedJobId === "all"
      ? applications
      : applications.filter(
          (application) =>
            Number(application.job_id) ===
            Number(selectedJobId)
        );


  const getStatusClass = (status) => {

    switch (
      String(status || "")
        .toLowerCase()
    ) {

      case "shortlisted":
        return "status-shortlisted";

      case "interview":
        return "status-interview";

      case "hired":
        return "status-hired";

      case "rejected":
        return "status-rejected";

      default:
        return "status-applied";

    }

  };


  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f7f8fc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >

        <div
          style={{
            textAlign: "center",
          }}
        >

          <h2>
            Loading Applications...
          </h2>

          <p>
            Fetching candidate applications.
          </p>

        </div>

      </div>
    );

  }


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fc",
        padding: "40px 30px",
      }}
    >

      <div
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
        }}
      >

        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "30px",
          }}
        >

          <div>

            <p
              style={{
                color: "#6652e8",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              RECRUITMENT
            </p>


            <h1>
              Candidate Applications
            </h1>


            <p
              style={{
                color: "#68708a",
                marginTop: "8px",
              }}
            >
              Review candidates and manage
              their application status.
            </p>

          </div>


          <button
            type="button"
            className="btn btn-outline"
            onClick={() =>
              navigate("/recruiter/dashboard")
            }
          >
            ← Dashboard
          </button>

        </div>


        {/* ERROR */}

        {error && (
          <div
            style={{
              background: "#fff0f0",
              color: "#d93025",
              padding: "15px 18px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}


        {/* SUMMARY */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "25px",
          }}
        >

          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "25px",
            }}
          >

            <small>
              Total Jobs
            </small>

            <h2>
              {jobs.length}
            </h2>

          </div>


          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "25px",
            }}
          >

            <small>
              Total Applications
            </small>

            <h2>
              {applications.length}
            </h2>

          </div>


          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "25px",
            }}
          >

            <small>
              Shortlisted
            </small>

            <h2>
              {
                applications.filter(
                  (application) =>
                    String(
                      application.status
                    ).toLowerCase() ===
                    "shortlisted"
                ).length
              }
            </h2>

          </div>


          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "25px",
            }}
          >

            <small>
              Interviews
            </small>

            <h2>
              {
                applications.filter(
                  (application) =>
                    String(
                      application.status
                    ).toLowerCase() ===
                    "interview"
                ).length
              }
            </h2>

          </div>

        </div>


        {/* FILTER */}

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "20px",
            marginBottom: "25px",
          }}
        >

          <label
            htmlFor="jobFilter"
            style={{
              fontWeight: "700",
              display: "block",
              marginBottom: "10px",
            }}
          >
            Filter by Job
          </label>


          <select
            id="jobFilter"
            value={selectedJobId}
            onChange={(event) =>
              setSelectedJobId(
                event.target.value
              )
            }
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "13px",
              borderRadius: "10px",
              border: "1px solid #ddd",
            }}
          >

            <option value="all">
              All Jobs
            </option>


            {jobs.map((job) => {

              const jobId =
                job.job_id ?? job.id;

              return (
                <option
                  key={jobId}
                  value={jobId}
                >
                  {job.job_title ||
                    job.title ||
                    `Job #${jobId}`}
                </option>
              );

            })}

          </select>

        </div>


        {/* APPLICATION LIST */}

        {filteredApplications.length === 0 ? (

          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "60px 30px",
              textAlign: "center",
            }}
          >

            <div
              style={{
                fontSize: "45px",
                marginBottom: "15px",
              }}
            >
              📋
            </div>


            <h2>
              No Applications Found
            </h2>


            <p
              style={{
                color: "#68708a",
                marginTop: "10px",
              }}
            >
              Applications submitted by candidates
              will appear here.
            </p>

          </div>

        ) : (

          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >

            {filteredApplications.map(
              (application) => (

                <div
                  key={application.id}
                  style={{
                    background: "#fff",
                    borderRadius: "20px",
                    padding: "28px",
                    boxShadow:
                      "0 5px 20px rgba(40,40,80,0.05)",
                  }}
                >

                  {/* APPLICATION HEADER */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "20px",
                    }}
                  >

                    <div>

                      <p
                        style={{
                          color: "#6652e8",
                          fontWeight: "700",
                          marginBottom: "7px",
                        }}
                      >
                        APPLICATION #{application.id}
                      </p>


                      <h2
                        style={{
                          marginBottom: "8px",
                        }}
                      >
                        {application.job_title}
                      </h2>


                      <p
                        style={{
                          color: "#68708a",
                        }}
                      >
                        {application.company_name}

                        {application.job_location
                          ? ` • ${application.job_location}`
                          : ""}
                      </p>

                    </div>


                    <span
                      className={
                        getStatusClass(
                          application.status
                        )
                      }
                      style={{
                        padding:
                          "8px 15px",
                        borderRadius:
                          "20px",
                        fontWeight:
                          "700",
                        background:
                          "#f0edff",
                        color:
                          "#5e4ee5",
                      }}
                    >
                      {application.status ||
                        "Applied"}
                    </span>

                  </div>


                  {/* DETAILS */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "15px",
                      marginTop: "25px",
                      paddingTop: "20px",
                      borderTop:
                        "1px solid #eee",
                    }}
                  >

                    <div>

                      <small>
                        Candidate ID
                      </small>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "5px",
                        }}
                      >
                        {application.candidate_id}
                      </strong>

                    </div>


                    <div>

                      <small>
                        Resume ID
                      </small>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "5px",
                        }}
                      >
                        {application.resume_id}
                      </strong>

                    </div>


                    <div>

                      <small>
                        AI Match Score
                      </small>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "5px",
                          color: "#6652e8",
                        }}
                      >
                        {application.match_score !==
                          null &&
                        application.match_score !==
                          undefined
                          ? `${application.match_score}%`
                          : "Not available"}
                      </strong>

                    </div>


                    <div>

                      <small>
                        Applied At
                      </small>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "5px",
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


                  {/* COVER LETTER */}

                  {application.cover_letter && (

                    <div
                      style={{
                        marginTop: "22px",
                        padding: "18px",
                        background: "#f8f7ff",
                        borderRadius: "12px",
                      }}
                    >

                      <strong>
                        Cover Letter
                      </strong>


                      <p
                        style={{
                          marginTop: "8px",
                          lineHeight: "1.7",
                          whiteSpace:
                            "pre-line",
                        }}
                      >
                        {application.cover_letter}
                      </p>

                    </div>

                  )}


                  {/* STATUS CONTROLS */}

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginTop: "25px",
                    }}
                  >

                    <strong
                      style={{
                        width: "100%",
                        marginBottom: "5px",
                      }}
                    >
                      Update Status
                    </strong>


                    {[
                      "Applied",
                      "Shortlisted",
                      "Interview",
                      "Rejected",
                      "Hired",
                    ].map((status) => (

                      <button
                        key={status}
                        type="button"
                        disabled={
                          updatingId ===
                          application.id
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
                            "1px solid #ddd",
                          background:
                            application.status ===
                            status
                              ? "#6652e8"
                              : "#fff",
                          color:
                            application.status ===
                            status
                              ? "#fff"
                              : "#333",
                          cursor:
                            "pointer",
                        }}
                      >
                        {status}
                      </button>

                    ))}

                  </div>

                </div>

              )
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
  const [error, setError] = useState("");

  useEffect(() => {

    let cancelled = false;

    const loadAnalysis = async () => {

      const token = localStorage.getItem("hireintel_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      if (!resumeId || !Number.isInteger(Number(resumeId)) || Number(resumeId) <= 0) {
        setError("Invalid resume ID.");
        setLoading(false);
        return;
      }

      try {

        const response = await fetch(
          `${API_BASE_URL}/resume-analysis/${resumeId}`,
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
              "Unable to load resume analysis."
            )
          );
          return;
        }

        if (!cancelled) {
          setAnalysis(data);
          setError("");
        }

      } catch (requestError) {

        console.error("Resume analysis error:", requestError);

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
      loadAnalysis();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };

  }, [resumeId, navigate]);

  const splitItems = (value) => {
    if (!value) {
      return [];
    }

    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const lineItems = (value) => {
    if (!value) {
      return [];
    }

    return String(value)
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const score =
    analysis?.resume_score !== null &&
    analysis?.resume_score !== undefined
      ? Number(analysis.resume_score)
      : null;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f7f8fc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              border: "5px solid #e8e5ff",
              borderTopColor: "#6652e8",
              margin: "0 auto 20px",
              animation: "hireintel-spin 0.9s linear infinite",
            }}
          />
          <h2 style={{ marginBottom: "8px" }}>
            Loading Resume Intelligence...
          </h2>
          <p style={{ color: "#68708a" }}>
            Fetching AI analysis for Resume #{resumeId}.
          </p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f7f8fc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "650px",
            background: "#fff",
            borderRadius: "22px",
            padding: "45px",
            textAlign: "center",
            boxShadow: "0 10px 35px rgba(40,40,80,0.07)",
          }}
        >
          <div style={{ fontSize: "42px", marginBottom: "15px" }}>
            ⚠️
          </div>
          <h1>Analysis Not Available</h1>
          <p
            style={{
              color: "#68708a",
              marginTop: "12px",
              lineHeight: "1.7",
            }}
          >
            {error || "No analysis was found for this resume."}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: "25px" }}
            onClick={() => navigate("/candidate/resumes")}
          >
            ← Back to My Resumes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fc",
        padding: "45px 20px 70px",
      }}
    >
      <style>{`
        @keyframes hireintel-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          <div>
            <p
              style={{
                color: "#6652e8",
                fontWeight: "800",
                letterSpacing: "0.08em",
                marginBottom: "8px",
              }}
            >
              AI RESUME INTELLIGENCE
            </p>
            <h1 style={{ margin: 0 }}>
              Resume Analysis
            </h1>
            <p
              style={{
                color: "#68708a",
                marginTop: "8px",
              }}
            >
              Detailed AI analysis for Resume #{resumeId}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate("/candidate/resumes")}
          >
            ← My Resumes
          </button>
        </div>

        {/* SCORE */}
        <div
          style={{
            background: "linear-gradient(135deg, #6652e8, #7c6af0)",
            color: "#fff",
            borderRadius: "24px",
            padding: "35px",
            marginBottom: "22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "30px",
            flexWrap: "wrap",
            boxShadow: "0 15px 35px rgba(102,82,232,0.18)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "700",
                opacity: 0.85,
                marginBottom: "8px",
              }}
            >
              OVERALL RESUME SCORE
            </div>
            <h2 style={{ margin: 0, fontSize: "24px" }}>
              AI-powered resume evaluation
            </h2>
            <p
              style={{
                margin: "8px 0 0",
                opacity: 0.85,
              }}
            >
              Based on the extracted resume information.
            </p>
          </div>

          <div
            style={{
              minWidth: "135px",
              textAlign: "center",
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "20px",
              padding: "18px 22px",
            }}
          >
            <div
              style={{
                fontSize: "44px",
                lineHeight: 1,
                fontWeight: "900",
              }}
            >
              {score !== null && Number.isFinite(score)
                ? `${score}%`
                : "—"}
            </div>
            <div
              style={{
                marginTop: "7px",
                fontSize: "13px",
                fontWeight: "700",
                opacity: 0.85,
              }}
            >
              Resume Score
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <section
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "22px",
            boxShadow: "0 5px 20px rgba(40,40,80,0.04)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Professional Summary</h2>
          <p
            style={{
              color: "#59627a",
              lineHeight: "1.8",
              whiteSpace: "pre-line",
              marginBottom: 0,
            }}
          >
            {analysis.summary || "No summary available."}
          </p>
        </section>

        {/* SKILLS + KEYWORDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "22px",
            marginBottom: "22px",
          }}
        >
          <section
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "30px",
              boxShadow: "0 5px 20px rgba(40,40,80,0.04)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Skills</h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "9px",
              }}
            >
              {splitItems(analysis.skills).length > 0 ? (
                splitItems(analysis.skills).map((skill) => (
                  <span
                    key={skill}
                    style={{
                      padding: "9px 13px",
                      borderRadius: "20px",
                      background: "#f0edff",
                      color: "#5e4ee5",
                      fontWeight: "700",
                      fontSize: "14px",
                    }}
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span style={{ color: "#8b91a5" }}>
                  No skills extracted.
                </span>
              )}
            </div>
          </section>

          <section
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "30px",
              boxShadow: "0 5px 20px rgba(40,40,80,0.04)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Keywords</h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "9px",
              }}
            >
              {splitItems(analysis.keywords).length > 0 ? (
                splitItems(analysis.keywords).map((keyword) => (
                  <span
                    key={keyword}
                    style={{
                      padding: "9px 13px",
                      borderRadius: "20px",
                      background: "#eef8f4",
                      color: "#137a55",
                      fontWeight: "700",
                      fontSize: "14px",
                    }}
                  >
                    {keyword}
                  </span>
                ))
              ) : (
                <span style={{ color: "#8b91a5" }}>
                  No keywords extracted.
                </span>
              )}
            </div>
          </section>
        </div>

        {/* EDUCATION / EXPERIENCE / PROJECTS / CERTIFICATIONS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "22px",
            marginBottom: "22px",
          }}
        >
          {[
            ["Education", analysis.education],
            ["Experience", analysis.experience],
            ["Projects", analysis.projects],
            ["Certifications", analysis.certifications],
          ].map(([title, value]) => (
            <section
              key={title}
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "30px",
                boxShadow: "0 5px 20px rgba(40,40,80,0.04)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>{title}</h2>
              <p
                style={{
                  color: "#59627a",
                  lineHeight: "1.8",
                  whiteSpace: "pre-line",
                  margin: 0,
                }}
              >
                {value || `No ${title.toLowerCase()} information available.`}
              </p>
            </section>
          ))}
        </div>

        {/* STRENGTHS / WEAKNESSES */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "22px",
            marginBottom: "22px",
          }}
        >
          <section
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "30px",
              border: "1px solid #e2f3ea",
              boxShadow: "0 5px 20px rgba(40,40,80,0.04)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Strengths</h2>
            {lineItems(analysis.strengths).length > 0 ? (
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "22px",
                  color: "#42506a",
                  lineHeight: "1.8",
                }}
              >
                {lineItems(analysis.strengths).map((item, index) => (
                  <li key={`${item}-${index}`} style={{ marginBottom: "8px" }}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#8b91a5" }}>No strengths available.</p>
            )}
          </section>

          <section
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "30px",
              border: "1px solid #f4e6e6",
              boxShadow: "0 5px 20px rgba(40,40,80,0.04)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Areas to Improve</h2>
            {lineItems(analysis.weaknesses).length > 0 ? (
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "22px",
                  color: "#42506a",
                  lineHeight: "1.8",
                }}
              >
                {lineItems(analysis.weaknesses).map((item, index) => (
                  <li key={`${item}-${index}`} style={{ marginBottom: "8px" }}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#8b91a5" }}>
                No improvement areas available.
              </p>
            )}
          </section>
        </div>

        {/* RECOMMENDATIONS */}
        <section
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 5px 20px rgba(40,40,80,0.04)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>AI Recommendations</h2>
          {lineItems(analysis.recommendations).length > 0 ? (
            <div style={{ display: "grid", gap: "12px" }}>
              {lineItems(analysis.recommendations).map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  style={{
                    padding: "15px 17px",
                    borderRadius: "12px",
                    background: "#f8f7ff",
                    color: "#46506a",
                    lineHeight: "1.7",
                  }}
                >
                  <strong style={{ color: "#6652e8", marginRight: "8px" }}>
                    {index + 1}.
                  </strong>
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#8b91a5" }}>
              No recommendations available.
            </p>
          )}
        </section>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "30px",
          }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/candidate/resumes")}
          >
            ← Back to My Resumes
          </button>
        </div>

      </div>
    </div>
  );
}


/* ============================================================
   ROUTER
============================================================ */

function App() {

  return (
    <Routes>

      {/* HOME */}

      <Route
        path="/"
        element={<HomePage />}
      />


      {/* LOGIN */}

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


      {/* THIS WAS MISSING — NOW FIXED */}

      <Route
        path="/recruiter/applications"
        element={<RecruiterApplications />}
      />


      <Route
        path="/recruiter/jobs"
        element={
          <RecruiterPlaceholder
            title="My Jobs"
            description="Manage the jobs posted by your recruiter account."
          />
        }
      />


      <Route
        path="/recruiter/post-job"
        element={
          <RecruiterPlaceholder
            title="Post New Job"
            description="Create and publish a new job opportunity for candidates."
          />
        }
      />


      <Route
        path="/recruiter/matches"
        element={<RecruiterCandidateMatches />}
      />


      <Route
        path="/recruiter/profile"
        element={
          <RecruiterPlaceholder
            title="Recruiter Profile"
            description="View and manage your recruiter profile."
          />
        }
      />


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
        element={<CandidateDashboard />}
      />


      {/* ======================================================
          CANDIDATE JOBS
      ====================================================== */}

      <Route
        path="/candidate/jobs"
        element={<FindJobs />}
      />


      <Route
        path="/candidate/jobs/:jobId"
        element={<CandidateJobDetails />}
      />


      <Route
        path="/candidate/jobs/:jobId/apply"
        element={<CandidateJobDetails />}
      />


      {/* ======================================================
          CANDIDATE APPLICATIONS
      ====================================================== */}

      <Route
        path="/candidate/applications"
        element={<CandidateApplications />}
      />


      {/* ======================================================
          CANDIDATE JOB MATCHES
      ====================================================== */}

      <Route
        path="/candidate/job-matches"
        element={<CandidateJobMatches />}
      />


      {/* ======================================================
          CANDIDATE RESUMES
      ====================================================== */}

      <Route
        path="/candidate/resumes"
        element={<CandidateResumes />}
      />


      {/* ======================================================
          CANDIDATE RESUME ANALYSIS
      ====================================================== */}

      <Route
        path="/candidate/resume-analysis/:resumeId"
        element={<ResumeAnalysisPage />}
      />


      {/* ======================================================
          CANDIDATE PROFILE
      ====================================================== */}

      <Route
        path="/candidate/profile"
        element={<CandidateProfile />}
      />


      {/* ======================================================
          CANDIDATE SETTINGS
      ====================================================== */}

      <Route
        path="/candidate/settings"
        element={<CandidateSettings />}
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