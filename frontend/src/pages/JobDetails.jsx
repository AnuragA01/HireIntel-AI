import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [resumeId, setResumeId] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/candidate/jobs/${jobId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.detail || "Unable to load job details."
          );
        }

        const data = await response.json();

        setJob(data);
      } catch (err) {
        setError(
          err.message || "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId, navigate]);

  const handleApply = async (event) => {
    event.preventDefault();

    if (!resumeId) {
      setApplicationMessage(
        "Please enter your resume ID."
      );
      return;
    }

    try {
      setApplying(true);
      setApplicationMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/applications/job/${jobId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume_id: Number(resumeId),
            cover_letter: coverLetter,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to apply for this job."
        );
      }

      setApplicationMessage(
        "Application submitted successfully!"
      );

      setResumeId("");
      setCoverLetter("");
    } catch (err) {
      setApplicationMessage(
        err.message || "Application failed."
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>

          <h2>Loading Job Details...</h2>

          <p>
            HireIntel AI is preparing the opportunity details.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-box">
          {error}
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/candidate/jobs")
          }
        >
          ← Back to Jobs
        </button>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-container">
        <div className="empty-jobs">
          <h2>Job not found</h2>

          <button
            className="primary-button"
            onClick={() =>
              navigate("/candidate/jobs")
            }
          >
            View Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="find-jobs-page">

      {/* HEADER */}

      <div className="page-header">

        <div>
          <p className="page-label">
            JOB OPPORTUNITY
          </p>

          <h1>
            {job.job_title}
          </h1>

          <p className="page-description">
            {job.company_name || "Company"}
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            navigate("/candidate/jobs")
          }
        >
          ← Back to Jobs
        </button>

      </div>

      {/* JOB DETAILS */}

      <div className="job-details-layout">

        <div className="job-details-card">

          <div className="job-card-top">

            <div className="company-avatar">
              {job.company_name
                ? job.company_name
                    .charAt(0)
                    .toUpperCase()
                : "C"}
            </div>

            <div className="job-title-section">

              <h2>
                {job.job_title}
              </h2>

              <p className="company-name">
                {job.company_name ||
                  "Company"}
              </p>

            </div>

          </div>

          <div className="job-meta">

            <span>
              📍 {job.location ||
                "Location not specified"}
            </span>

            <span>
              💼 {job.job_type ||
                "Full Time"}
            </span>

            <span>
              🎯 {job.experience_required ||
                "Experience not specified"}
            </span>

          </div>

          <hr />

          <h3>
            Job Description
          </h3>

          <p className="job-description-large">
            {job.description}
          </p>

          {job.required_skills && (
            <>
              <h3>
                Required Skills
              </h3>

              <div className="skill-list">

                {job.required_skills
                  .split(",")
                  .map((skill) => {
                    const cleanSkill =
                      skill.trim();

                    if (!cleanSkill) {
                      return null;
                    }

                    return (
                      <span
                        className="skill-tag"
                        key={cleanSkill}
                      >
                        {cleanSkill}
                      </span>
                    );
                  })}

              </div>
            </>
          )}

        </div>

        {/* APPLICATION CARD */}

        <div className="application-card">

          <p className="page-label">
            APPLY NOW
          </p>

          <h2>
            Start your application
          </h2>

          <p>
            Submit your resume and a short
            cover letter for this opportunity.
          </p>

          <form onSubmit={handleApply}>

            <label>
              Resume ID
            </label>

            <input
              type="number"
              placeholder="Example: 1"
              value={resumeId}
              onChange={(event) =>
                setResumeId(event.target.value)
              }
              required
            />

            <label>
              Cover Letter
            </label>

            <textarea
              rows="6"
              placeholder="Write a short cover letter..."
              value={coverLetter}
              onChange={(event) =>
                setCoverLetter(event.target.value)
              }
            />

            {applicationMessage && (
              <div className="application-message">
                {applicationMessage}
              </div>
            )}

            <button
              type="submit"
              className="primary-button full-width"
              disabled={applying}
            >
              {applying
                ? "Submitting..."
                : "Submit Application →"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default JobDetails;