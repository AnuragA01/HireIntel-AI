import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecruiterDashboard.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function RecruiterDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      const token = localStorage.getItem("hireintel_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/dashboard/recruiter`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => null);

        if (response.status === 401) {
          localStorage.removeItem("hireintel_token");
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          let message = "Unable to load recruiter dashboard.";

          if (typeof data?.detail === "string") {
            message = data.detail;
          } else if (Array.isArray(data?.detail)) {
            message = data.detail
              .map((item) => item?.msg || "Invalid request.")
              .join(", ");
          }

          if (!cancelled) {
            setError(message);
          }

          return;
        }

        if (!cancelled) {
          setDashboard(data);
        }
      } catch (requestError) {
        console.error(
          "Recruiter dashboard error:",
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

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("hireintel_token");
    navigate("/login", { replace: true });
  };

  const goToJobs = () => {
    navigate("/recruiter/jobs");
  };

  const goToApplications = () => {
    navigate("/recruiter/applications");
  };

  const goToMatches = () => {
    navigate("/recruiter/matches");
  };

  const goToPostJob = () => {
    navigate("/recruiter/post-job");
  };

  const goToProfile = () => {
    navigate("/recruiter/profile");
  };

  const goToSettings = () => {
    navigate("/recruiter/settings");
  };

  if (loading) {
    return (
      <div className="recruiter-page">
        <aside className="recruiter-sidebar">
          <div className="brand">
            <div className="brand-logo">H</div>
            <span>HireIntel AI</span>
          </div>

          <div className="sidebar-section-title">
            RECRUITER
          </div>

          <div className="sidebar-loading">
            Loading dashboard...
          </div>
        </aside>

        <main className="recruiter-main">
          <div className="dashboard-loading-card">
            <div className="loading-spinner"></div>

            <h2>
              Loading Recruiter Dashboard
            </h2>

            <p>
              Fetching your jobs, candidates and AI
              matching insights...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recruiter-page">
        <aside className="recruiter-sidebar">
          <div className="brand">
            <div className="brand-logo">H</div>
            <span>HireIntel AI</span>
          </div>
        </aside>

        <main className="recruiter-main">
          <div className="dashboard-error-card">
            <div className="error-icon">!</div>

            <h2>
              Unable to Load Dashboard
            </h2>

            <p>{error}</p>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  const recruiter = dashboard?.recruiter || {};
  const statistics = dashboard?.statistics || {};

  const jobs = Array.isArray(dashboard?.jobs)
    ? dashboard.jobs
    : [];

  const totalJobs = Number(
    statistics.total_jobs || 0
  );

  const totalCandidates = Number(
    statistics.total_candidates || 0
  );

  const totalMatches = Number(
    statistics.total_matches || 0
  );

  const highMatches = Number(
    statistics.high_matches || 0
  );

  const mediumMatches = Number(
    statistics.medium_matches || 0
  );

  const lowMatches = Number(
    statistics.low_matches || 0
  );

  const averageMatch =
    jobs.length > 0
      ? jobs.reduce(
          (total, job) =>
            total +
            Number(
              job.average_match_score || 0
            ),
          0
        ) / jobs.length
      : 0;

  const recruiterName =
    recruiter.full_name || "Recruiter";

  const recruiterEmail =
    recruiter.email || "recruiter@example.com";

  const recruiterInitial =
    recruiterName.charAt(0).toUpperCase();

  return (
    <div className="recruiter-page">

      {/* ================================
          SIDEBAR
      ================================= */}

      <aside className="recruiter-sidebar">

        <div className="brand">
          <div className="brand-logo">
            H
          </div>

          <span>
            HireIntel AI
          </span>
        </div>

        <div className="sidebar-section-title">
          RECRUITER
        </div>

        <nav className="sidebar-nav">

          <button
            type="button"
            className="sidebar-link active"
            onClick={() =>
              navigate("/recruiter/dashboard")
            }
          >
            <span className="nav-icon">
              ▦
            </span>

            Dashboard
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={goToJobs}
          >
            <span className="nav-icon">
              ▣
            </span>

            My Jobs
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={goToPostJob}
          >
            <span className="nav-icon">
              ＋
            </span>

            Post Job
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={goToApplications}
          >
            <span className="nav-icon">
              ▤
            </span>

            Applications
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={goToMatches}
          >
            <span className="nav-icon">
              ✦
            </span>

            Candidate Matches
          </button>

          <button
            type="button"
            className="sidebar-link"
            onClick={goToProfile}
          >
            <span className="nav-icon">
              ♙
            </span>

            Profile
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button
            type="button"
            className="sidebar-link"
            onClick={goToSettings}
          >
            <span className="nav-icon">
              ⚙
            </span>

            Settings
          </button>

          <button
            type="button"
            className="sidebar-link logout-link"
            onClick={logout}
          >
            <span className="nav-icon">
              ↪
            </span>

            Logout
          </button>

        </div>

      </aside>

      {/* ================================
          MAIN CONTENT
      ================================= */}

      <main className="recruiter-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <div className="welcome-text">
              Welcome back
            </div>

            <h1>
              Recruiter Dashboard
            </h1>

            <p>
              Manage your jobs, discover candidates
              and make smarter hiring decisions
              with AI.
            </p>

          </div>

          <div className="recruiter-user">

            <div className="recruiter-user-info">

              <strong>
                {recruiterName}
              </strong>

              <span>
                {recruiterEmail}
              </span>

            </div>

            <div className="recruiter-avatar">
              {recruiterInitial}
            </div>

          </div>

        </header>

        {/* QUICK ACTIONS */}

        <section className="quick-actions">

          <button
            type="button"
            className="primary-button"
            onClick={goToPostJob}
          >
            ＋ Post New Job
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={goToJobs}
          >
            ▣ Manage Jobs
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={goToApplications}
          >
            ▤ View Applications
          </button>

        </section>

        {/* STATISTICS */}

        <section className="statistics-grid">

          <div className="stat-card">

            <div className="stat-icon">
              ▣
            </div>

            <div className="stat-content">

              <span className="stat-label">
                Active Jobs
              </span>

              <strong>
                {totalJobs}
              </strong>

              <small>
                Jobs posted by you
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ♙
            </div>

            <div className="stat-content">

              <span className="stat-label">
                Candidates
              </span>

              <strong>
                {totalCandidates}
              </strong>

              <small>
                Candidates matched
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ✦
            </div>

            <div className="stat-content">

              <span className="stat-label">
                AI Matches
              </span>

              <strong>
                {totalMatches}
              </strong>

              <small>
                Resume-job matches
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon">
              ◎
            </div>

            <div className="stat-content">

              <span className="stat-label">
                Avg. Match
              </span>

              <strong>
                {averageMatch.toFixed(2)}%
              </strong>

              <small>
                AI matching score
              </small>

            </div>

          </div>

        </section>

        {/* DASHBOARD GRID */}

        <section className="dashboard-grid">

          {/* MY JOBS */}

          <div className="dashboard-card jobs-card">

            <div className="card-header">

              <div>

                <span className="card-eyebrow">
                  RECRUITMENT
                </span>

                <h2>
                  My Jobs
                </h2>

                <p>
                  Your currently posted
                  opportunities.
                </p>

              </div>

              <button
                type="button"
                className="text-button"
                onClick={goToJobs}
              >
                View All →
              </button>

            </div>

            {jobs.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  ▣
                </div>

                <h3>
                  No jobs posted yet
                </h3>

                <p>
                  Create your first job and
                  start finding candidates.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={goToPostJob}
                >
                  Post a Job →
                </button>

              </div>

            ) : (

              <div className="jobs-list">

                {jobs.map((job) => (

                  <div
                    className="job-item"
                    key={job.job_id}
                  >

                    <div className="job-icon">
                      💼
                    </div>

                    <div className="job-info">

                      <h3>
                        {job.job_title ||
                          "Untitled Job"}
                      </h3>

                      <p>
                        {job.company_name ||
                          "Company"}
                      </p>

                      <div className="job-meta">

                        <span>
                          📍{" "}
                          {job.location ||
                            "Location not specified"}
                        </span>

                        <span>
                          💼{" "}
                          {job.job_type ||
                            "Job type"}
                        </span>

                        <span>
                          ◷{" "}
                          {job.experience_required ||
                            "Experience"}
                        </span>

                      </div>

                    </div>

                    <div className="job-match">

                      <span>
                        AI Match
                      </span>

                      <strong>
                        {Number(
                          job.average_match_score ||
                            0
                        ).toFixed(2)}
                        %
                      </strong>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* AI INSIGHTS */}

          <div className="dashboard-card insights-card">

            <div className="card-header">

              <div>

                <span className="card-eyebrow">
                  AI INTELLIGENCE
                </span>

                <h2>
                  Candidate Insights
                </h2>

                <p>
                  AI-powered candidate
                  matching summary.
                </p>

              </div>

              <div className="ai-badge">
                ✦ AI
              </div>

            </div>

            <div className="match-summary">

              <div className="match-summary-number">
                {averageMatch.toFixed(2)}%
              </div>

              <span>
                Average Match Score
              </span>

            </div>

            <div className="match-breakdown">

              <div className="breakdown-row">

                <div>
                  <span className="breakdown-dot high"></span>

                  <span>
                    High Matches
                  </span>
                </div>

                <strong>
                  {highMatches}
                </strong>

              </div>

              <div className="breakdown-row">

                <div>
                  <span className="breakdown-dot medium"></span>

                  <span>
                    Medium Matches
                  </span>
                </div>

                <strong>
                  {mediumMatches}
                </strong>

              </div>

              <div className="breakdown-row">

                <div>
                  <span className="breakdown-dot low"></span>

                  <span>
                    Low Matches
                  </span>
                </div>

                <strong>
                  {lowMatches}
                </strong>

              </div>

            </div>

            <button
              type="button"
              className="full-width-button"
              onClick={goToMatches}
            >
              View Candidate Matches →
            </button>

          </div>

        </section>

        {/* HIRING OVERVIEW */}

        <section className="dashboard-card candidate-summary-card">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                TALENT DISCOVERY
              </span>

              <h2>
                Hiring Overview
              </h2>

              <p>
                Monitor your recruitment
                pipeline and AI matching
                activity.
              </p>

            </div>

          </div>

          <div className="overview-grid">

            <div className="overview-item">

              <div className="overview-icon">
                ♙
              </div>

              <div>
                <strong>
                  {totalCandidates}
                </strong>

                <span>
                  Candidates
                </span>
              </div>

            </div>

            <div className="overview-item">

              <div className="overview-icon">
                ✦
              </div>

              <div>
                <strong>
                  {totalMatches}
                </strong>

                <span>
                  AI Matches
                </span>
              </div>

            </div>

            <div className="overview-item">

              <div className="overview-icon">
                ★
              </div>

              <div>
                <strong>
                  {highMatches}
                </strong>

                <span>
                  High Matches
                </span>
              </div>

            </div>

            <div className="overview-item">

              <div className="overview-icon">
                %
              </div>

              <div>

                <strong>
                  {averageMatch.toFixed(2)}%
                </strong>

                <span>
                  Average Score
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* FOOTER */}

        <footer className="recruiter-footer">

          <span>
            HireIntel AI • Recruitment
            Intelligence Platform
          </span>

          <span>
            Logged in as{" "}
            {recruiterEmail}
          </span>

        </footer>

      </main>

    </div>
  );
}

export default RecruiterDashboard;