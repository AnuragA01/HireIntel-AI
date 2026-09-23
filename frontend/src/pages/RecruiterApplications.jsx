import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

/* =========================================================
   HELPERS
========================================================= */

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

        return item?.msg || item?.message || "Invalid request.";
      })
      .join(", ");
  }

  if (data?.detail && typeof data.detail === "object") {
    return (
      data.detail.message ||
      data.detail.error ||
      JSON.stringify(data.detail)
    );
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  return fallback;
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/* =========================================================
   JOB HELPERS
========================================================= */

function getJobId(job) {
  return (
    job?.id ??
    job?.job_id ??
    job?.job?.id ??
    job?.job?.job_id ??
    null
  );
}

function getJobTitle(job, jobId) {
  return (
    job?.job_title ||
    job?.title ||
    job?.job?.job_title ||
    job?.job?.title ||
    `Job #${jobId}`
  );
}

function getCompanyName(job) {
  return (
    job?.company_name ||
    job?.company ||
    job?.job?.company_name ||
    job?.job?.company ||
    "Company"
  );
}

function getJobLocation(job) {
  return (
    job?.location ||
    job?.job_location ||
    job?.job?.location ||
    ""
  );
}

/* =========================================================
   NORMALIZE JOB RESPONSE
========================================================= */

function normalizeJobs(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const possibleArrays = [
    data.jobs,
    data.my_jobs,
    data.posted_jobs,
    data.recruiter_jobs,
    data.data?.jobs,
    data.data?.my_jobs,
    data.data?.posted_jobs,
    data.result,
    data.results,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

/* =========================================================
   NORMALIZE APPLICATION RESPONSE
========================================================= */

function normalizeApplications(data) {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data !== "object") {
    return [];
  }

  const possibleArrays = [
    data.applications,
    data.data?.applications,
    data.data,
    data.results,
    data.items,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  if (
    data.id !== undefined ||
    data.application_id !== undefined
  ) {
    return [data];
  }

  return [];
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   STATUS STYLE
========================================================= */

function getStatusStyle(status) {
  switch (String(status || "Applied").toLowerCase()) {
    case "shortlisted":
      return {
        background: "#eeeaff",
        color: "#5f4eea",
      };

    case "interview":
      return {
        background: "#fff3dc",
        color: "#b56a00",
      };

    case "hired":
      return {
        background: "#e8f8ef",
        color: "#16834b",
      };

    case "rejected":
      return {
        background: "#ffeaea",
        color: "#c62828",
      };

    default:
      return {
        background: "#f1f3f7",
        color: "#555b6e",
      };
  }
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ label, value, icon }) {
  return (
    <div className="recruiter-stat-card">
      <div className="recruiter-stat-icon">
        {icon}
      </div>

      <div>
        <div className="recruiter-stat-label">
          {label}
        </div>

        <div className="recruiter-stat-value">
          {value}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   NAV BUTTON
========================================================= */

function NavButton({
  label,
  icon,
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`recruiter-nav-button ${
        active ? "active" : ""
      }`}
    >
      <span className="recruiter-nav-icon">
        {icon}
      </span>

      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   APPLICATION CARD
========================================================= */

function ApplicationCard({
  application,
  updatingId,
  onUpdateStatus,
}) {
  const applicationId =
    application?.id ??
    application?.application_id;

  const status =
    application?.status || "Applied";

  const score =
    application?.match_score ??
    application?.ai_match_score ??
    null;

  const candidateId =
    application?.candidate_id ??
    application?.user_id ??
    "—";

  const resumeId =
    application?.resume_id ?? "—";

  const coverLetter =
    application?.cover_letter ||
    "No cover letter provided.";

  const recruiterNotes =
    application?.recruiter_notes || "";

  const jobId =
    application?.job_id ??
    application?.job?.id ??
    "—";

  const jobTitle =
    application?.job_title ||
    application?.job?.job_title ||
    application?.job?.title ||
    `Job #${jobId}`;

  const company =
    application?.company_name ||
    application?.job?.company_name ||
    application?.company ||
    "Company";

  const location =
    application?.job_location ||
    application?.location ||
    application?.job?.location ||
    "";

  const statusStyle =
    getStatusStyle(status);

  const statuses = [
    "Applied",
    "Shortlisted",
    "Interview",
    "Rejected",
    "Hired",
  ];

  return (
    <div className="application-card">

      {/* HEADER */}

      <div className="application-header">
        <div>
          <div className="application-number">
            APPLICATION #{applicationId ?? "—"}
          </div>

          <h2 className="application-job-title">
            {jobTitle}
          </h2>

          <p className="application-company">
            {company}
            {location ? ` • ${location}` : ""}
          </p>
        </div>

        <div
          className="application-status"
          style={{
            background: statusStyle.background,
            color: statusStyle.color,
          }}
        >
          {status}
        </div>
      </div>

      <div className="application-divider" />

      {/* DETAILS */}

      <div className="application-details">

        <div>
          <div className="detail-label">
            Application ID
          </div>

          <div className="detail-value">
            {applicationId ?? "—"}
          </div>
        </div>

        <div>
          <div className="detail-label">
            Candidate ID
          </div>

          <div className="detail-value">
            {candidateId}
          </div>
        </div>

        <div>
          <div className="detail-label">
            Resume ID
          </div>

          <div className="detail-value">
            {resumeId}
          </div>
        </div>

        <div>
          <div className="detail-label">
            Job ID
          </div>

          <div className="detail-value">
            {jobId}
          </div>
        </div>

        <div>
          <div className="detail-label">
            AI Match Score
          </div>

          <div className="detail-score">
            {score !== null &&
            score !== undefined &&
            !Number.isNaN(Number(score))
              ? `${Number(score).toFixed(2)}%`
              : "—"}
          </div>
        </div>

        <div>
          <div className="detail-label">
            Applied At
          </div>

          <div className="detail-value">
            {formatDate(application?.applied_at)}
          </div>
        </div>

        <div>
          <div className="detail-label">
            Last Updated
          </div>

          <div className="detail-value">
            {formatDate(application?.updated_at)}
          </div>
        </div>

      </div>

      {/* COVER LETTER */}

      <div className="cover-letter-box">
        <div className="section-title">
          Cover Letter
        </div>

        <p className="cover-letter-text">
          {coverLetter}
        </p>
      </div>

      {/* RECRUITER NOTES */}

      {recruiterNotes && (
        <div className="recruiter-notes-box">
          <div className="section-title">
            Recruiter Notes
          </div>

          <p className="cover-letter-text">
            {recruiterNotes}
          </p>
        </div>
      )}

      {/* STATUS */}

      <div className="status-section">
        <h3 className="status-title">
          Update Application Status
        </h3>

        <div className="status-buttons">

          {statuses.map((item) => {
            const isActive =
              String(status).toLowerCase() ===
              item.toLowerCase();

            const isUpdating =
              Number(updatingId) ===
              Number(applicationId);

            return (
              <button
                key={item}
                type="button"
                disabled={
                  isUpdating || isActive
                }
                onClick={() =>
                  onUpdateStatus(
                    applicationId,
                    item
                  )
                }
                className={`status-button ${
                  isActive ? "selected" : ""
                }`}
              >
                {isUpdating && !isActive
                  ? "Updating..."
                  : item}
              </button>
            );
          })}

        </div>
      </div>

    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RecruiterApplications() {

  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);

  const [applications, setApplications] =
    useState([]);

  const [selectedJobId, setSelectedJobId] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [warning, setWarning] =
    useState("");

  /* =========================================================
     LOAD APPLICATIONS
  ========================================================= */

  const loadApplications = useCallback(
    async (showLoader = false) => {

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

      if (showLoader) {
        setLoading(true);
      }

      setError("");
      setWarning("");

      try {

        /* =====================================================
           STEP 1: GET RECRUITER DASHBOARD
        ===================================================== */

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
          await readJson(
            dashboardResponse
          );

        if (
          dashboardResponse.status === 401
        ) {
          localStorage.removeItem(
            "hireintel_token"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (!dashboardResponse.ok) {
          throw new Error(
            getErrorMessage(
              dashboardData,
              "Unable to load recruiter dashboard."
            )
          );
        }

        const recruiterJobs =
          normalizeJobs(
            dashboardData
          );

        /* =====================================================
           STEP 2: GET APPLICATIONS FOR EVERY JOB
        ===================================================== */

        const results =
          await Promise.all(
            recruiterJobs.map(
              async (job) => {

                const jobId =
                  getJobId(job);

                if (!jobId) {
                  return {
                    applications: [],
                    failed: true,
                  };
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
                    await readJson(
                      response
                    );

                  if (
                    response.status === 401
                  ) {
                    return {
                      applications: [],
                      unauthorized: true,
                    };
                  }

                  if (!response.ok) {
                    return {
                      applications: [],
                      failed: true,
                      message:
                        getErrorMessage(
                          data,
                          `Unable to load applications for Job #${jobId}.`
                        ),
                    };
                  }

                  const normalized =
                    normalizeApplications(
                      data
                    );

                  const enriched =
                    normalized.map(
                      (application) => ({
                        ...application,

                        job_id:
                          application?.job_id ??
                          jobId,

                        job_title:
                          application?.job_title ||
                          application?.job?.job_title ||
                          getJobTitle(
                            job,
                            jobId
                          ),

                        company_name:
                          application?.company_name ||
                          application?.job?.company_name ||
                          getCompanyName(
                            job
                          ),

                        job_location:
                          application?.job_location ||
                          application?.location ||
                          application?.job?.location ||
                          getJobLocation(
                            job
                          ),
                      })
                    );

                  return {
                    applications:
                      enriched,
                    failed: false,
                  };

                } catch (requestError) {

                  console.error(
                    "Application request error:",
                    requestError
                  );

                  return {
                    applications: [],
                    failed: true,
                  };
                }
              }
            )
          );

        /* =====================================================
           AUTH FAILURE
        ===================================================== */

        const unauthorized =
          results.some(
            (result) =>
              result.unauthorized
          );

        if (unauthorized) {

          localStorage.removeItem(
            "hireintel_token"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        /* =====================================================
           COMBINE APPLICATIONS
        ===================================================== */

        const failed =
          results.some(
            (result) =>
              result.failed
          );

        const allApplications =
          results.flatMap(
            (result) =>
              result.applications
          );

        setJobs(recruiterJobs);

        setApplications(
          allApplications
        );

        if (failed) {
          setWarning(
            "Some application data could not be loaded. Please refresh and try again."
          );
        }

      } catch (requestError) {

        console.error(
          "Recruiter applications error:",
          requestError
        );

        setError(
          requestError?.message ||
          "Unable to connect to HireIntel AI server."
        );

      } finally {

        setLoading(false);
        setRefreshing(false);

      }
    },
    [navigate]
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    const timer = setTimeout(() => {
      loadApplications(true);
    }, 0);

    return () => {
      clearTimeout(timer);
    };

  }, [loadApplications]);

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = () => {

    setRefreshing(true);

    loadApplications(false);
  };

  /* =========================================================
     UPDATE APPLICATION STATUS
  ========================================================= */

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

      if (!applicationId) {
        setError(
          "Application ID is missing."
        );

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

              body: JSON.stringify({
                status: newStatus,

                recruiter_notes:
                  `Application status updated to ${newStatus}.`,
              }),
            }
          );

        const data =
          await readJson(
            response
          );

        if (
          response.status === 401
        ) {

          localStorage.removeItem(
            "hireintel_token"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              "Unable to update application status."
            )
          );
        }

        const updatedApplication =
          data?.application ||
          data;

        setApplications(
          (current) =>
            current.map(
              (application) => {

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
                    updatedApplication?.status ||
                    newStatus,

                  recruiter_notes:
                    updatedApplication?.recruiter_notes ??
                    application.recruiter_notes,

                  updated_at:
                    updatedApplication?.updated_at ??
                    application.updated_at,
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
          requestError?.message ||
          "Unable to update application."
        );

      } finally {

        setUpdatingId(null);
      }
    };

  /* =========================================================
     FILTER APPLICATIONS
  ========================================================= */

  const filteredApplications =
    useMemo(() => {

      if (
        selectedJobId === "all"
      ) {
        return applications;
      }

      return applications.filter(
        (application) =>
          Number(
            application?.job_id
          ) ===
          Number(
            selectedJobId
          )
      );

    }, [
      applications,
      selectedJobId,
    ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalApplications =
    applications.length;

  const shortlistedCount =
    applications.filter(
      (application) =>
        String(
          application?.status || ""
        ).toLowerCase() ===
        "shortlisted"
    ).length;

  const interviewCount =
    applications.filter(
      (application) =>
        String(
          application?.status || ""
        ).toLowerCase() ===
        "interview"
    ).length;

  const hiredCount =
    applications.filter(
      (application) =>
        String(
          application?.status || ""
        ).toLowerCase() ===
        "hired"
    ).length;

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="recruiter-loading">

        <div className="loading-card">

          <div className="loading-logo">
            H
          </div>

          <h2>
            Loading Applications...
          </h2>

          <p>
            Fetching candidate applications.
          </p>

          <div className="loading-spinner" />

        </div>

      </div>
    );
  }

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <div className="recruiter-applications-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="recruiter-sidebar">

        <div className="recruiter-logo-container">

          <div className="recruiter-logo-icon">
            H
          </div>

          <div className="recruiter-logo-text">
            HireIntel <span>AI</span>
          </div>

        </div>

        <div className="recruiter-sidebar-label">
          RECRUITER
        </div>

        <NavButton
          label="Dashboard"
          icon="▦"
          onClick={() =>
            navigate(
              "/recruiter/dashboard"
            )
          }
        />

        <NavButton
          label="My Jobs"
          icon="▣"
          onClick={() =>
            navigate(
              "/recruiter/jobs"
            )
          }
        />

        <NavButton
          label="Post Job"
          icon="+"
          onClick={() =>
            navigate(
              "/recruiter/post-job"
            )
          }
        />

        <NavButton
          label="Applications"
          icon="▤"
          active
        />

        <NavButton
          label="Candidate Matches"
          icon="✦"
          onClick={() =>
            navigate(
              "/recruiter/matches"
            )
          }
        />

        <NavButton
          label="Profile"
          icon="♙"
          onClick={() =>
            navigate(
              "/recruiter/profile"
            )
          }
        />

        <div className="recruiter-sidebar-bottom">

          <NavButton
            label="Settings"
            icon="⚙"
            onClick={() =>
              navigate(
                "/recruiter/settings"
              )
            }
          />

          <button
            type="button"
            className="recruiter-logout"
            onClick={() => {

              localStorage.removeItem(
                "hireintel_token"
              );

              navigate(
                "/login",
                {
                  replace: true,
                }
              );
            }}
          >
            <span className="recruiter-nav-icon">
              ↪
            </span>

            Logout
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="recruiter-main">

        {/* HEADER */}

        <div className="recruiter-header">

          <div>

            <div className="recruiter-eyebrow">
              RECRUITMENT
            </div>

            <h1 className="recruiter-page-title">
              Candidate Applications
            </h1>

            <p className="recruiter-page-subtitle">
              Review candidates and manage their
              application status.
            </p>

          </div>

          <div className="recruiter-header-actions">

            <button
              type="button"
              className="recruiter-secondary-button"
              onClick={() =>
                navigate(
                  "/recruiter/dashboard"
                )
              }
            >
              ← Dashboard
            </button>

            <button
              type="button"
              className="recruiter-primary-button"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="recruiter-error">

            <strong>
              Error:
            </strong>{" "}

            {error}

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>

          </div>
        )}

        {/* WARNING */}

        {warning && (
          <div className="recruiter-warning">
            {warning}
          </div>
        )}

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <div className="recruiter-stats">

          <StatCard
            label="Total Jobs"
            value={jobs.length}
            icon="▣"
          />

          <StatCard
            label="Total Applications"
            value={totalApplications}
            icon="▤"
          />

          <StatCard
            label="Shortlisted"
            value={shortlistedCount}
            icon="★"
          />

          <StatCard
            label="Interviews"
            value={interviewCount}
            icon="◎"
          />

          <StatCard
            label="Hired"
            value={hiredCount}
            icon="✓"
          />

        </div>

        {/* ===================================================
            FILTER
        =================================================== */}

        <section className="recruiter-filter">

          <label htmlFor="jobFilter">
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
          >

            <option value="all">
              All Jobs
            </option>

            {jobs.map((job) => {

              const jobId =
                getJobId(job);

              return (
                <option
                  key={jobId}
                  value={jobId}
                >
                  {getJobTitle(
                    job,
                    jobId
                  )}
                  {" — "}
                  {getCompanyName(job)}
                </option>
              );
            })}

          </select>

        </section>

        {/* ===================================================
            APPLICATIONS
        =================================================== */}

        {filteredApplications.length === 0 ? (

          <section className="recruiter-empty">

            <div className="empty-icon">
              📋
            </div>

            <h2>
              No Applications Found
            </h2>

            <p>
              {applications.length === 0
                ? "Applications submitted by candidates will appear here."
                : "No applications match the selected job."}
            </p>

            {applications.length === 0 && (
              <button
                type="button"
                className="recruiter-primary-button"
                onClick={handleRefresh}
              >
                ↻ Check Again
              </button>
            )}

          </section>

        ) : (

          <section>

            {filteredApplications.map(
              (application) => (
                <ApplicationCard
                  key={
                    application.id ??
                    application.application_id
                  }
                  application={application}
                  updatingId={updatingId}
                  onUpdateStatus={
                    updateApplicationStatus
                  }
                />
              )
            )}

          </section>

        )}

      </main>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .recruiter-applications-page {
          min-height: 100vh;
          background: #f7f8fc;
          color: #17213d;
          font-family: Inter, Arial, sans-serif;
          display: flex;
        }

        .recruiter-sidebar {
          width: 280px;
          min-height: 100vh;
          background: #ffffff;
          border-right: 1px solid #e5e7ef;
          padding: 24px 18px;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          align-self: flex-start;
        }

        .recruiter-logo-container {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 4px 12px 32px;
        }

        .recruiter-logo-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: linear-gradient(
            135deg,
            #7259f2,
            #6549e8
          );
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 800;
        }

        .recruiter-logo-text {
          font-size: 23px;
          font-weight: 800;
          color: #111a35;
        }

        .recruiter-logo-text span {
          color: #6652e8;
        }

        .recruiter-sidebar-label {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #8b91a6;
          padding: 0 14px 14px;
        }

        .recruiter-nav-button {
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          font-size: 15px;
          text-align: left;
          background: transparent;
          color: #33415c;
          font-weight: 600;
        }

        .recruiter-nav-button:hover {
          background: #f5f3ff;
        }

        .recruiter-nav-button.active {
          background: #eeeaff;
          color: #5f4eea;
          font-weight: 700;
        }

        .recruiter-nav-icon {
          width: 20px;
          display: inline-flex;
          justify-content: center;
          font-size: 17px;
        }

        .recruiter-sidebar-bottom {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid #eceef4;
        }

        .recruiter-logout {
          width: 100%;
          border: none;
          background: transparent;
          color: #ef4444;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
        }

        .recruiter-main {
          flex: 1;
          padding: 46px 58px 70px;
          max-width: 1600px;
          width: 100%;
        }

        .recruiter-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 30px;
          margin-bottom: 38px;
        }

        .recruiter-eyebrow {
          color: #6652e8;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 1.4px;
          margin-bottom: 12px;
        }

        .recruiter-page-title {
          margin: 0;
          font-size: 42px;
          line-height: 1.1;
          font-weight: 800;
          color: #17213d;
        }

        .recruiter-page-subtitle {
          margin: 14px 0 0;
          color: #70809e;
          font-size: 17px;
        }

        .recruiter-header-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .recruiter-primary-button {
          border: none;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            #6d55ed,
            #6547e5
          );
          color: white;
          padding: 13px 22px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .recruiter-primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .recruiter-secondary-button {
          border: 1px solid #dddfea;
          border-radius: 12px;
          background: white;
          color: #5f4eea;
          padding: 13px 22px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .recruiter-error {
          position: relative;
          background: #fff0f0;
          border: 1px solid #ffcaca;
          color: #b42318;
          border-radius: 12px;
          padding: 15px 45px 15px 18px;
          margin-bottom: 20px;
        }

        .recruiter-error button {
          position: absolute;
          right: 12px;
          top: 7px;
          border: none;
          background: transparent;
          color: #b42318;
          font-size: 24px;
          cursor: pointer;
        }

        .recruiter-warning {
          background: #fff8e7;
          border: 1px solid #f3d486;
          color: #986000;
          border-radius: 12px;
          padding: 15px 18px;
          margin-bottom: 20px;
        }

        .recruiter-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 32px;
        }

        @media (min-width: 1550px) {
          .recruiter-stats {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }

        .recruiter-stat-card {
          background: white;
          border: 1px solid #e7e9f0;
          border-radius: 18px;
          padding: 24px;
          min-height: 120px;
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .recruiter-stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 15px;
          background: #f0edff;
          color: #6652e8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .recruiter-stat-label {
          color: #78849f;
          font-size: 14px;
        }

        .recruiter-stat-value {
          margin-top: 7px;
          font-size: 30px;
          font-weight: 800;
          color: #111a35;
        }

        .recruiter-filter {
          background: white;
          border: 1px solid #e7e9f0;
          border-radius: 18px;
          padding: 24px;
          margin-bottom: 28px;
        }

        .recruiter-filter label {
          display: block;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .recruiter-filter select {
          width: 100%;
          height: 52px;
          border: 1px solid #dcdfe8;
          border-radius: 12px;
          background: white;
          padding: 0 15px;
          font-size: 15px;
          color: #17213d;
        }

        .application-card {
          background: white;
          border: 1px solid #e5e7ef;
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 10px 35px rgba(20,30,60,0.04);
          transition: transform .18s ease, box-shadow .18s ease;
        }

        .application-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(20,30,60,0.07);
        }

        .application-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 30px;
        }

        .application-number {
          color: #6652e8;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: .7px;
          margin-bottom: 14px;
        }

        .application-job-title {
          margin: 0;
          font-size: 27px;
          color: #111a35;
        }

        .application-company {
          margin: 9px 0 0;
          color: #6d7b99;
          font-size: 16px;
        }

        .application-status {
          border-radius: 999px;
          padding: 10px 17px;
          font-weight: 700;
          font-size: 14px;
          white-space: nowrap;
        }

        .application-divider {
          height: 1px;
          background: #eceef3;
          margin: 28px 0;
        }

        .application-details {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 28px;
        }

        .detail-label {
          color: #7b87a0;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .detail-value {
          color: #17213d;
          font-size: 16px;
          font-weight: 700;
        }

        .detail-score {
          color: #6652e8;
          font-size: 20px;
          font-weight: 800;
        }

        .cover-letter-box,
        .recruiter-notes-box {
          border-radius: 16px;
          padding: 22px;
          margin-bottom: 18px;
        }

        .cover-letter-box {
          background: #f7f6ff;
        }

        .recruiter-notes-box {
          background: #fffaf0;
          border: 1px solid #f3e3b7;
        }

        .section-title {
          font-size: 16px;
          font-weight: 800;
          color: #17213d;
          margin-bottom: 10px;
        }

        .cover-letter-text {
          margin: 0;
          color: #53627e;
          font-size: 15px;
          line-height: 1.7;
        }

        .status-section {
          margin-top: 28px;
        }

        .status-title {
          font-size: 17px;
          margin: 0 0 14px;
          color: #17213d;
        }

        .status-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .status-button {
          border: 1px solid #d9dce5;
          background: white;
          color: #33415c;
          border-radius: 10px;
          padding: 11px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .status-button:hover:not(:disabled) {
          border-color: #6652e8;
          color: #6652e8;
        }

        .status-button.selected {
          background: #6652e8;
          color: white;
          border-color: #6652e8;
        }

        .status-button:disabled {
          cursor: default;
          opacity: 0.85;
        }

        .recruiter-empty {
          background: white;
          border: 1px solid #e7e9f0;
          border-radius: 24px;
          min-height: 340px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .recruiter-empty h2 {
          margin: 0 0 10px;
          color: #111a35;
          font-size: 25px;
        }

        .recruiter-empty p {
          color: #73819e;
          font-size: 16px;
          margin-bottom: 25px;
        }

        .recruiter-loading {
          min-height: 100vh;
          background: #f7f8fc;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
        }

        .loading-card {
          background: white;
          border-radius: 22px;
          padding: 45px;
          text-align: center;
          box-shadow: 0 15px 50px rgba(20,30,60,.08);
        }

        .loading-logo {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          background: linear-gradient(
            135deg,
            #7259f2,
            #6549e8
          );
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 800;
          margin: 0 auto 20px;
        }

        .loading-card p {
          color: #7a86a0;
        }

        .loading-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #e6e2ff;
          border-top-color: #6652e8;
          border-radius: 50%;
          margin: 20px auto 0;
          animation: recruiterSpin .8s linear infinite;
        }

        @keyframes recruiterSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1350px) {

          .recruiter-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .application-details {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .recruiter-main {
            padding: 38px 32px 60px;
          }
        }

        @media (max-width: 800px) {

          .recruiter-sidebar {
            display: none;
          }

          .recruiter-main {
            padding: 30px 18px;
          }

          .recruiter-header {
            flex-direction: column;
          }

          .recruiter-stats {
            grid-template-columns: 1fr;
          }

          .application-details {
            grid-template-columns: 1fr;
          }

          .application-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(20,30,60,0.07);
        }

        .application-header {
            flex-direction: column;
          }
        }

      `}</style>

    </div>
  );
}