import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./ApplyJob.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("hireintel_token");

  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // AUTH CHECK
  // =========================================================

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  // =========================================================
  // LOAD JOB AND RESUMES
  // =========================================================

  useEffect(() => {
    if (!token || !jobId) {
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };

        // ---------------------------------------------------
        // GET JOB
        // ---------------------------------------------------

        const jobResponse = await fetch(
          `${API_BASE_URL}/candidate/jobs/${jobId}`,
          {
            method: "GET",
            headers,
          }
        );

        if (jobResponse.status === 401) {
          localStorage.removeItem("hireintel_token");

          if (!cancelled) {
            navigate("/login", {
              replace: true,
            });
          }

          return;
        }

        const jobData = await jobResponse
          .json()
          .catch(() => ({}));

        if (!jobResponse.ok) {
          throw new Error(
            typeof jobData.detail === "string"
              ? jobData.detail
              : "Job not found."
          );
        }

        // ---------------------------------------------------
        // GET RESUMES
        // ---------------------------------------------------

        const resumeResponse = await fetch(
          `${API_BASE_URL}/resumes/my-resumes`,
          {
            method: "GET",
            headers,
          }
        );

        if (resumeResponse.status === 401) {
          localStorage.removeItem("hireintel_token");

          if (!cancelled) {
            navigate("/login", {
              replace: true,
            });
          }

          return;
        }

        const resumeData = await resumeResponse
          .json()
          .catch(() => []);

        if (!resumeResponse.ok) {
          throw new Error(
            typeof resumeData.detail === "string"
              ? resumeData.detail
              : "Could not load resumes."
          );
        }

        if (cancelled) {
          return;
        }

        const resumeList = Array.isArray(resumeData)
          ? resumeData
          : [];

        setJob(jobData);
        setResumes(resumeList);

        if (resumeList.length > 0) {
          setSelectedResume(
            String(resumeList[0].id)
          );
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Application page error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load application page."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [token, jobId, navigate]);

  // =========================================================
  // SUBMIT APPLICATION
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedResume) {
      setError(
        "Please select a resume before applying."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

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
            resume_id: Number(selectedResume),
            cover_letter:
              coverLetter.trim() || null,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem(
          "hireintel_token"
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to submit application."
        );
      }

      setSuccess(
        "Application submitted successfully!"
      );

      setTimeout(() => {
        navigate("/candidate/applications");
      }, 1200);
    } catch (err) {
      console.error(
        "Application submission error:",
        err
      );

      setError(
        err?.message ||
          "Failed to submit application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // MISSING JOB ID
  // =========================================================

  if (!jobId) {
    return (
      <div className="apply-job-page">
        <div className="apply-error-card">

          <div className="error-icon">
            !
          </div>

          <h1>
            Invalid Job
          </h1>

          <p>
            Job ID is missing from the URL.
          </p>

          <Link
            to="/candidate/jobs"
            className="apply-back-button"
          >
            ← Back to Jobs
          </Link>

        </div>
      </div>
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="apply-job-page">

        <div className="apply-loading-card">

          <div className="apply-spinner"></div>

          <h2>
            Loading Application
          </h2>

          <p>
            Preparing your application...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !job) {
    return (
      <div className="apply-job-page">

        <div className="apply-error-card">

          <div className="error-icon">
            !
          </div>

          <h1>
            Job not found
          </h1>

          <p>
            {error}
          </p>

          <Link
            to="/candidate/jobs"
            className="apply-back-button"
          >
            ← Back to Jobs
          </Link>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="apply-job-page">

      {/* HEADER */}

      <header className="apply-header">

        <div>

          <div className="apply-label">
            CAREER OPPORTUNITY
          </div>

          <h1>
            Apply for Job
          </h1>

          <p>
            Complete your application and
            take the next step in your career.
          </p>

        </div>

        <Link
          to="/candidate/jobs"
          className="apply-back-link"
        >
          ← Back to Jobs
        </Link>

      </header>


      {/* CONTENT */}

      <main className="apply-container">

        {/* JOB DETAILS */}

        <section className="application-job-card">

          <div className="ai-application-badge">
            ✨ AI-Powered Recruitment
          </div>

          <h2>
            {job?.job_title}
          </h2>

          <p className="application-company">
            {job?.company_name ||
              "Company not specified"}
          </p>

          <div className="application-meta">

            {job?.location && (
              <span>
                📍 {job.location}
              </span>
            )}

            {job?.job_type && (
              <span>
                💼 {job.job_type}
              </span>
            )}

            {job?.experience_required && (
              <span>
                🎯 {job.experience_required}
              </span>
            )}

          </div>


          {/* DESCRIPTION */}

          {job?.description && (
            <div className="application-description">

              <h3>
                Job Description
              </h3>

              <p>
                {job.description}
              </p>

            </div>
          )}


          {/* SKILLS */}

          {job?.required_skills && (
            <div className="application-skills">

              <h3>
                Required Skills
              </h3>

              <div className="application-skill-list">

                {job.required_skills
                  .split(",")
                  .map((skill, index) => (
                    <span
                      key={index}
                      className="application-skill"
                    >
                      {skill.trim()}
                    </span>
                  ))}

              </div>

            </div>
          )}

        </section>


        {/* APPLICATION FORM */}

        <section className="application-form-card">

          <div className="form-heading">

            <div className="form-number">
              01
            </div>

            <div>

              <h2>
                Submit Your Application
              </h2>

              <p>
                Select your resume and
                optionally add a cover letter.
              </p>

            </div>

          </div>


          {/* ERROR */}

          {error && (
            <div className="application-error">
              {error}
            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div className="application-success">
              {success}
            </div>
          )}


          <form
            onSubmit={handleSubmit}
            className="application-form"
          >

            {/* RESUME */}

            <div className="form-group">

              <label htmlFor="resume">
                Select Resume
              </label>

              {resumes.length === 0 ? (

                <div className="no-resume-message">

                  <p>
                    You don't have any uploaded
                    resumes yet.
                  </p>

                  <Link
                    to="/candidate/resumes"
                    className="upload-resume-link"
                  >
                    Upload Resume
                  </Link>

                </div>

              ) : (

                <select
                  id="resume"
                  value={selectedResume}
                  onChange={(event) =>
                    setSelectedResume(
                      event.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select a resume
                  </option>

                  {resumes.map((resume) => (
                    <option
                      key={resume.id}
                      value={resume.id}
                    >
                      {resume.original_filename}
                    </option>
                  ))}

                </select>

              )}

            </div>


            {/* COVER LETTER */}

            <div className="form-group">

              <label htmlFor="coverLetter">
                Cover Letter
                <span>
                  Optional
                </span>
              </label>

              <textarea
                id="coverLetter"
                rows="8"
                placeholder="Write a short message explaining why you are interested in this position..."
                value={coverLetter}
                onChange={(event) =>
                  setCoverLetter(
                    event.target.value
                  )
                }
              />

            </div>


            {/* BUTTONS */}

            <div className="application-submit-area">

              <Link
                to="/candidate/jobs"
                className="cancel-application-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="submit-application-button"
                disabled={
                  submitting ||
                  resumes.length === 0
                }
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Application →"}
              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  );
}

export default ApplyJob;