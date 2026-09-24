import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

/* ============================================================
   ERROR MESSAGE HELPER
============================================================ */

const getErrorMessage = (data) => {
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

  if (
    data?.detail &&
    typeof data.detail === "object"
  ) {
    return (
      data.detail.message ||
      data.detail.error ||
      JSON.stringify(data.detail)
    );
  }

  return "Unable to load your applications.";
};

/* ============================================================
   CANDIDATE APPLICATIONS
============================================================ */

function CandidateApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================================
     LOAD APPLICATIONS
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadApplications = async () => {
      const token = localStorage.getItem(
        "hireintel_token"
      );

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      try {
        setLoading(true);
        setError("");

        /* ====================================================
           GET CANDIDATE APPLICATIONS
        ==================================================== */

        const response = await fetch(
          `${API_BASE_URL}/applications/my-applications`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data =
          await response.json().catch(() => null);

        /* ====================================================
           TOKEN EXPIRED
        ==================================================== */

        if (response.status === 401) {
          localStorage.removeItem(
            "hireintel_token"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        /* ====================================================
           API ERROR
        ==================================================== */

        if (!response.ok) {
          throw new Error(
            getErrorMessage(data)
          );
        }

        /* ====================================================
           APPLICATION LIST
        ==================================================== */

        const applicationList =
          Array.isArray(data)
            ? data
            : [];

        if (cancelled) {
          return;
        }

        setApplications(applicationList);

        /* ====================================================
           GET JOB DETAILS
           
           Application API may return only job_id.
           We fetch each job to show:
           - Job title
           - Company
           - Location
        ==================================================== */

        const uniqueJobIds = [
          ...new Set(
            applicationList
              .map(
                (application) =>
                  application?.job_id
              )
              .filter(Boolean)
          ),
        ];

        const jobEntries =
          await Promise.all(
            uniqueJobIds.map(
              async (jobId) => {
                try {
                  const jobResponse =
                    await fetch(
                      `${API_BASE_URL}/candidate/jobs/${jobId}`,
                      {
                        method: "GET",
                        headers: {
                          Authorization: `Bearer ${token}`,
                          Accept:
                            "application/json",
                        },
                      }
                    );

                  if (
                    jobResponse.status ===
                    401
                  ) {
                    localStorage.removeItem(
                      "hireintel_token"
                    );

                    navigate("/login", {
                      replace: true,
                    });

                    return [
                      String(jobId),
                      null,
                    ];
                  }

                  if (
                    !jobResponse.ok
                  ) {
                    return [
                      String(jobId),
                      null,
                    ];
                  }

                  const jobData =
                    await jobResponse
                      .json()
                      .catch(
                        () => null
                      );

                  return [
                    String(jobId),
                    jobData,
                  ];
                } catch (jobError) {
                  console.error(
                    `Unable to load job ${jobId}:`,
                    jobError
                  );

                  return [
                    String(jobId),
                    null,
                  ];
                }
              }
            )
          );

        if (!cancelled) {
          setJobs(
            Object.fromEntries(
              jobEntries
            )
          );
        }
      } catch (requestError) {
        console.error(
          "Candidate applications error:",
          requestError
        );

        if (!cancelled) {
          setError(
            requestError?.message ||
              "Unable to connect to the HireIntel AI server."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  /* ==========================================================
     DATE FORMAT
  ========================================================== */

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* ==========================================================
     STATUS STYLE
  ========================================================== */

  const getStatusStyle = (status) => {
    switch (
      String(
        status || "Applied"
      ).toLowerCase()
    ) {
      case "shortlisted":
        return {
          background: "#eef2ff",
          color: "#5146d8",
        };

      case "interview":
        return {
          background: "#fff5e6",
          color: "#b76a00",
        };

      case "hired":
        return {
          background: "#eafaf0",
          color: "#17834b",
        };

      case "rejected":
        return {
          background: "#fff0f0",
          color: "#c62828",
        };

      default:
        return {
          background: "#f1f3f7",
          color: "#5e6475",
        };
    }
  };

  /* ==========================================================
     STATUS COUNT
  ========================================================== */

  const countStatus = (status) => {
    return applications.filter(
      (application) =>
        String(
          application?.status || ""
        ).toLowerCase() === status
    ).length;
  };

  /* ==========================================================
     LOADING PAGE
  ========================================================== */

  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            H
          </div>

          <h2>
            Loading Applications...
          </h2>

          <p style={styles.muted}>
            Fetching your submitted
            applications.
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     MAIN PAGE
  ========================================================== */

  return (
    <div style={styles.page}>

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside style={styles.sidebar}>

        {/* LOGO */}

        <div style={styles.logoContainer}>

          <div style={styles.logoIcon}>
            H
          </div>

          <div style={styles.logoText}>
            HireIntel{" "}
            <span>AI</span>
          </div>

        </div>

        {/* NAVIGATION */}

        <div style={styles.sidebarSection}>

          <p style={styles.sidebarLabel}>
            CANDIDATE
          </p>

          <NavButton
            label="Dashboard"
            icon="▦"
            onClick={() =>
              navigate(
                "/candidate/dashboard"
              )
            }
          />

          <NavButton
            label="Find Jobs"
            icon="⌕"
            onClick={() =>
              navigate(
                "/candidate/jobs"
              )
            }
          />

          <NavButton
            label="My Resumes"
            icon="▤"
            onClick={() =>
              navigate(
                "/candidate/resumes"
              )
            }
          />

          <NavButton
            label="Applications"
            icon="▣"
            active
          />

          <NavButton
            label="Job Matches"
            icon="✦"
            onClick={() =>
              navigate(
                "/candidate/job-matches"
              )
            }
          />

          <NavButton
            label="Profile"
            icon="♙"
            onClick={() =>
              navigate(
                "/candidate/profile"
              )
            }
          />

        </div>

        {/* BOTTOM */}

        <div style={styles.sidebarBottom}>

          <NavButton
            label="Settings"
            icon="⚙"
            onClick={() =>
              navigate(
                "/candidate/settings"
              )
            }
          />

          <button
            type="button"
            style={styles.logoutButton}
            onClick={() => {
              localStorage.removeItem(
                "hireintel_token"
              );

              navigate("/login", {
                replace: true,
              });
            }}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main style={styles.main}>

        {/* HEADER */}

        <header style={styles.header}>

          <div>

            <p style={styles.eyebrow}>
              CAREER ACTIVITY
            </p>

            <h1 style={styles.title}>
              My Applications
            </h1>

            <p style={styles.subtitle}>
              Track your submitted
              applications and recruitment
              progress.
            </p>

          </div>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() =>
              navigate(
                "/candidate/jobs"
              )
            }
          >
            Find More Jobs →
          </button>

        </header>

        {/* ERROR */}

        {error && (
          <div style={styles.errorBox}>

            <strong>
              Unable to load applications
            </strong>

            <p>
              {error}
            </p>

            <button
              type="button"
              style={styles.retryButton}
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>
        )}

        {!error && (
          <>

            {/* ==================================================
                SUMMARY CARDS
            ================================================== */}

            <section
              style={styles.summaryGrid}
            >

              <SummaryCard
                icon="▣"
                label="Total Applications"
                value={
                  applications.length
                }
              />

              <SummaryCard
                icon="★"
                label="Shortlisted"
                value={countStatus(
                  "shortlisted"
                )}
              />

              <SummaryCard
                icon="◎"
                label="Interviews"
                value={countStatus(
                  "interview"
                )}
              />

              <SummaryCard
                icon="✓"
                label="Hired"
                value={countStatus(
                  "hired"
                )}
              />

            </section>

            {/* ==================================================
                NO APPLICATIONS
            ================================================== */}

            {applications.length ===
            0 ? (

              <div
                style={
                  styles.emptyCard
                }
              >

                <div
                  style={
                    styles.emptyIcon
                  }
                >
                  ▣
                </div>

                <h2>
                  No applications yet
                </h2>

                <p>
                  You haven't applied to
                  any jobs yet. Explore
                  available opportunities
                  and submit your first
                  application.
                </p>

                <button
                  type="button"
                  style={
                    styles.primaryButton
                  }
                  onClick={() =>
                    navigate(
                      "/candidate/jobs"
                    )
                  }
                >
                  Browse Jobs →
                </button>

              </div>

            ) : (

              /* =================================================
                 APPLICATION LIST
              ================================================= */

              <section>

                <div
                  style={
                    styles.sectionHeader
                  }
                >

                  <div>

                    <h2
                      style={
                        styles.sectionTitle
                      }
                    >
                      Submitted Applications
                    </h2>

                    <p
                      style={
                        styles.sectionText
                      }
                    >
                      {applications.length}{" "}
                      application
                      {applications.length !==
                      1
                        ? "s"
                        : ""}{" "}
                      found.
                    </p>

                  </div>

                </div>

                <div
                  style={
                    styles.applicationList
                  }
                >

                  {applications.map(
                    (application) => {

                      const job =
                        jobs[
                          String(
                            application?.job_id
                          )
                        ] || {};

                      const title =
                        application?.job_title ||
                        application?.title ||
                        job?.job_title ||
                        job?.title ||
                        `Job #${
                          application?.job_id ||
                          "N/A"
                        }`;

                      const company =
                        application?.company_name ||
                        application?.company ||
                        job?.company_name ||
                        job?.company ||
                        "Company information unavailable";

                      const location =
                        application?.location ||
                        job?.location ||
                        "Location not available";

                      const score =
                        application?.match_score;

                      const status =
                        application?.status ||
                        "Applied";

                      return (
                        <article
                          key={
                            application?.id
                          }
                          style={
                            styles.applicationCard
                          }
                        >

                          {/* JOB ICON */}

                          <div
                            style={
                              styles.jobIcon
                            }
                          >
                            💼
                          </div>

                          {/* JOB DETAILS */}

                          <div
                            style={
                              styles.jobInfo
                            }
                          >

                            <h3
                              style={
                                styles.jobTitle
                              }
                            >
                              {title}
                            </h3>

                            <p
                              style={
                                styles.company
                              }
                            >
                              {company}
                            </p>

                            <div
                              style={
                                styles.location
                              }
                            >
                              📍 {location}
                            </div>

                            <div
                              style={
                                styles.metaRow
                              }
                            >

                              <span>
                                Application ID:{" "}
                                {application?.id ||
                                  "N/A"}
                              </span>

                              <span>
                                Job ID:{" "}
                                {application?.job_id ||
                                  "N/A"}
                              </span>

                              <span>
                                Resume ID:{" "}
                                {application?.resume_id ||
                                  "N/A"}
                              </span>

                              <span>
                                Applied:{" "}
                                {formatDate(
                                  application?.applied_at
                                )}
                              </span>

                            </div>

                          </div>

                          {/* MATCH SCORE */}

                          <div
                            style={
                              styles.scoreBox
                            }
                          >

                            <span>
                              AI Match
                            </span>

                            <strong>
                              {score !==
                                null &&
                              score !==
                                undefined
                                ? `${Number(
                                    score
                                  ).toFixed(
                                    2
                                  )}%`
                                : "N/A"}
                            </strong>

                          </div>

                          {/* STATUS */}

                          <div
                            style={{
                              ...styles.statusBadge,
                              ...getStatusStyle(
                                status
                              ),
                            }}
                          >
                            {status}
                          </div>

                          {/* VIEW JOB */}

                          <button
                            type="button"
                            style={
                              styles.viewButton
                            }
                            disabled={
                              !application?.job_id
                            }
                            onClick={() => {

                              if (
                                application?.job_id
                              ) {
                                navigate(
                                  `/candidate/jobs/${application.job_id}`
                                );
                              }

                            }}
                          >
                            View Job
                          </button>

                        </article>
                      );
                    }
                  )}

                </div>

              </section>
            )}

          </>
        )}

      </main>

    </div>
  );
}

/* ============================================================
   NAV BUTTON
============================================================ */

function NavButton({
  label,
  icon,
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      style={{
        ...styles.navItem,
        ...(active
          ? styles.activeNavItem
          : {}),
      }}
      onClick={onClick}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  icon,
  label,
  value,
}) {
  return (
    <div style={styles.summaryCard}>

      <div style={styles.summaryIcon}>
        {icon}
      </div>

      <div>

        <span
          style={
            styles.summaryLabel
          }
        >
          {label}
        </span>

        <strong
          style={
            styles.summaryValue
          }
        >
          {value}
        </strong>

      </div>

    </div>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = {

  page: {
    minHeight: "100vh",
    display: "flex",
    background: "#f7f8fc",
    color: "#172033",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
  },

  sidebar: {
    width: "250px",
    minHeight: "100vh",
    background: "#ffffff",
    borderRight:
      "1px solid #e8eaf0",
    display: "flex",
    flexDirection: "column",
    padding: "28px 18px",
    boxSizing: "border-box",
    position: "sticky",
    top: 0,
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding:
      "5px 10px 35px",
  },

  logoIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #6d5ce7, #8a72f2)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800",
  },

  logoText: {
    fontSize: "20px",
    fontWeight: "800",
  },

  sidebarSection: {
    flex: 1,
  },

  sidebarLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#a0a5b5",
    letterSpacing: "1px",
    padding: "0 12px",
    marginBottom: "10px",
  },

  navItem: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#646b7c",
    padding: "13px 14px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",
    marginBottom: "5px",
  },

  activeNavItem: {
    background: "#f0edff",
    color: "#6354e8",
  },

  sidebarBottom: {
    borderTop:
      "1px solid #eeeeee",
    paddingTop: "18px",
  },

  logoutButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#d05252",
    padding: "13px 14px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",
  },

  main: {
    flex: 1,
    padding:
      "38px 45px 60px",
    minWidth: 0,
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "30px",
  },

  eyebrow: {
    color: "#6657e8",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1px",
    margin: "0 0 8px",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "800",
  },

  subtitle: {
    color: "#7a8090",
    marginTop: "8px",
    fontSize: "14px",
  },

  primaryButton: {
    border: "none",
    background: "#6657e8",
    color: "#ffffff",
    padding: "13px 20px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "30px",
  },

  summaryCard: {
    background: "#ffffff",
    border:
      "1px solid #e8eaf0",
    borderRadius: "16px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  summaryIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#f0edff",
    color: "#6657e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  summaryLabel: {
    display: "block",
    color: "#8a90a0",
    fontSize: "12px",
  },

  summaryValue: {
    display: "block",
    fontSize: "26px",
    marginTop: "4px",
  },

  sectionHeader: {
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
  },

  sectionText: {
    color: "#8a90a0",
    fontSize: "13px",
    marginTop: "7px",
  },

  applicationList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  applicationCard: {
    background: "#ffffff",
    border:
      "1px solid #e8eaf0",
    borderRadius: "18px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    flexWrap: "wrap",
  },

  jobIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "13px",
    background: "#f0edff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  jobInfo: {
    flex: 1,
    minWidth: "250px",
  },

  jobTitle: {
    margin: 0,
    fontSize: "18px",
  },

  company: {
    color: "#6d7383",
    margin: "5px 0",
  },

  location: {
    color: "#777e90",
    fontSize: "12px",
    marginBottom: "8px",
  },

  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    color: "#969ba8",
    fontSize: "11px",
  },

  scoreBox: {
    minWidth: "90px",
    textAlign: "center",
  },

  statusBadge: {
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },

  viewButton: {
    border:
      "1px solid #ddd9f6",
    background: "#ffffff",
    color: "#6657e8",
    padding: "10px 15px",
    borderRadius: "9px",
    fontWeight: "700",
    cursor: "pointer",
  },

  emptyCard: {
    background: "#ffffff",
    border:
      "1px solid #e8eaf0",
    borderRadius: "20px",
    padding: "70px 30px",
    textAlign: "center",
  },

  emptyIcon: {
    width: "65px",
    height: "65px",
    borderRadius: "50%",
    background: "#f0edff",
    color: "#6657e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin:
      "0 auto 20px",
    fontSize: "25px",
  },

  errorBox: {
    background: "#fff0f0",
    border:
      "1px solid #ffd4d4",
    color: "#b42323",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "25px",
  },

  retryButton: {
    border: "none",
    background: "#c62828",
    color: "#ffffff",
    padding: "9px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
  },

  centerPage: {
    minHeight: "100vh",
    background: "#f7f8fc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
  },

  loadingCard: {
    background: "#ffffff",
    border:
      "1px solid #e8eaf0",
    borderRadius: "20px",
    padding: "50px",
    textAlign: "center",
    width: "100%",
    maxWidth: "500px",
  },

  loadingIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "14px",
    background: "#6657e8",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin:
      "0 auto 20px",
    fontSize: "22px",
    fontWeight: "800",
  },

  muted: {
    color: "#7d8392",
    lineHeight: "1.6",
  },
};

export default CandidateApplications;