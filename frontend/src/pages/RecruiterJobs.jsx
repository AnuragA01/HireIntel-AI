import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

/* ============================================================
   AUTH HELPERS
============================================================ */

function clearAuth() {
  [
    "hireintel_token",
    "hireintel_role",
    "hireintel_user_id",
    "hireintel_email",
  ].forEach((key) => {
    localStorage.removeItem(key);
  });
}


/* ============================================================
   ERROR MESSAGE HELPER
============================================================ */

function getErrorMessage(
  data,
  fallback = "Something went wrong."
) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map(
        (item) =>
          item?.msg ||
          item?.message ||
          String(item)
      )
      .join(", ");
  }

  if (data?.message) {
    return String(data.message);
  }

  if (data?.error) {
    return String(data.error);
  }

  return fallback;
}


/* ============================================================
   DATE FORMATTER
============================================================ */

function formatDate(value) {
  if (!value) {
    return "—";
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


/* ============================================================
   SKILL PARSER
============================================================ */

function splitSkills(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
      onClick={onClick}
      style={{
        ...styles.navButton,
        ...(active
          ? styles.navButtonActive
          : {}),
      }}
    >
      <span style={styles.navIcon}>
        {icon}
      </span>

      <span>{label}</span>
    </button>
  );
}


/* ============================================================
   RECRUITER JOBS
============================================================ */

function RecruiterJobs() {
  const navigate = useNavigate();

  /* ========================================================
     STATE
  ======================================================== */

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [deletingId, setDeletingId] =
    useState(null);

  const [search, setSearch] =
    useState("");


  /* ========================================================
     LOGOUT
  ======================================================== */

  const logout = useCallback(() => {
    clearAuth();

    navigate("/login", {
      replace: true,
    });
  }, [navigate]);


  /* ========================================================
     LOAD RECRUITER JOBS
  ======================================================== */

  const loadJobs = useCallback(
    async () => {
      const token =
        localStorage.getItem(
          "hireintel_token"
        );

      if (!token) {
        logout();
        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/recruiter/jobs`,
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

        /* ==========================================
           SESSION EXPIRED
        ========================================== */

        if (response.status === 401) {
          logout();
          return;
        }

        /* ==========================================
           SERVER ERROR
        ========================================== */

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              "Unable to load your jobs."
            )
          );
        }

        /* ==========================================
           SUCCESS
        ========================================== */

        const recruiterJobs =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.jobs)
            ? data.jobs
            : [];

        setJobs(recruiterJobs);

      } catch (requestError) {
        console.error(
          "Recruiter jobs loading error:",
          requestError
        );

        setError(
          requestError?.message ||
            "Unable to connect to the HireIntel AI server."
        );

      } finally {
        setLoading(false);
      }
    },
    [logout]
  );


  /* ========================================================
     INITIAL LOAD

     IMPORTANT:
     setTimeout prevents React's
     "setState synchronously within an effect"
     warning.
  ======================================================== */

  useEffect(() => {
    const timerId =
      window.setTimeout(() => {
        void loadJobs();
      }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadJobs]);


  /* ========================================================
     SEARCH / FILTER
  ======================================================== */

  const filteredJobs = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return jobs;
    }

    return jobs.filter((job) => {
      const searchableValues = [
        job?.job_title,
        job?.company_name,
        job?.location,
        job?.job_type,
        job?.experience_required,
        job?.required_skills,
        job?.description,
      ];

      return searchableValues
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        );
    });
  }, [jobs, search]);


  /* ========================================================
     DELETE JOB
  ======================================================== */

  async function handleDelete(job) {
    const jobId = job?.id;

    if (!jobId) {
      setError(
        "Job ID is missing. Unable to delete this job."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${
          job?.job_title ||
          "this job"
        }"? This will also remove its AI job matches.`
      );

    if (!confirmed) {
      return;
    }

    const token =
      localStorage.getItem(
        "hireintel_token"
      );

    if (!token) {
      logout();
      return;
    }

    setDeletingId(jobId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/recruiter/jobs/${jobId}`,
        {
          method: "DELETE",

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
          .catch(() => ({}));

      /* ==========================================
         SESSION EXPIRED
      ========================================== */

      if (response.status === 401) {
        logout();
        return;
      }

      /* ==========================================
         DELETE ERROR
      ========================================== */

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Unable to delete the job."
          )
        );
      }

      /* ==========================================
         REMOVE FROM UI
      ========================================== */

      setJobs((currentJobs) =>
        currentJobs.filter(
          (item) =>
            Number(item?.id) !==
            Number(jobId)
        )
      );

      setSuccess(
        "Job deleted successfully."
      );

    } catch (deleteError) {
      console.error(
        "Delete job error:",
        deleteError
      );

      setError(
        deleteError?.message ||
          "Unable to delete the job."
      );

    } finally {
      setDeletingId(null);
    }
  }


  /* ========================================================
     LOADING SCREEN
  ======================================================== */

  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.loadingCard}>

          <div style={styles.logoIcon}>
            H
          </div>

          <div style={styles.spinner} />

          <h2>
            Loading Your Jobs...
          </h2>

          <p style={styles.muted}>
            Fetching recruiter job postings.
          </p>

        </div>
      </div>
    );
  }


  /* ========================================================
     MAIN PAGE
  ======================================================== */

  return (
    <div style={styles.page}>

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside style={styles.sidebar}>

        <button
          type="button"
          style={styles.brandButton}
          onClick={() =>
            navigate(
              "/recruiter/dashboard"
            )
          }
        >

          <div style={styles.logoIcon}>
            H
          </div>

          <div style={styles.logoText}>
            HireIntel{" "}
            <span style={styles.logoTextSpan}>
              AI
            </span>
          </div>

        </button>


        <div style={styles.sidebarSection}>

          <p
            style={styles.sidebarLabel}
          >
            RECRUITER
          </p>

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
            active
          />

          <NavButton
            label="Post New Job"
            icon="＋"
            onClick={() =>
              navigate(
                "/recruiter/post-job"
              )
            }
          />

          <NavButton
            label="Applications"
            icon="◎"
            onClick={() =>
              navigate(
                "/recruiter/applications"
              )
            }
          />

          <NavButton
            label="AI Matches"
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

        </div>


        {/* SIDEBAR BOTTOM */}

        <div style={styles.sidebarBottom}>

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
            style={styles.logoutButton}
            onClick={logout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* ==================================================
          MAIN
      ================================================== */}

      <main style={styles.main}>

        {/* HEADER */}

        <header style={styles.header}>

          <div>

            <p
              style={styles.eyebrow}
            >
              RECRUITER JOB MANAGEMENT
            </p>

            <h1 style={styles.title}>
              My Jobs
            </h1>

            <p
              style={styles.subtitle}
            >
              Create, manage and monitor
              the opportunities published
              by your recruiter account.
            </p>

          </div>


          <button
            type="button"
            style={styles.primaryButton}
            onClick={() =>
              navigate(
                "/recruiter/post-job"
              )
            }
          >
            ＋ Post New Job
          </button>

        </header>


        {/* ERROR */}

        {error && (
          <div
            style={styles.alertError}
            role="alert"
          >

            <strong>
              Something went wrong
            </strong>

            <span>
              {error}
            </span>

            <button
              type="button"
              style={styles.retryButton}
              onClick={() =>
                void loadJobs()
              }
            >
              Retry
            </button>

          </div>
        )}


        {/* SUCCESS */}

        {success && (
          <div
            style={styles.alertSuccess}
            role="status"
          >
            ✓ {success}
          </div>
        )}


        {/* ==================================================
            STATISTICS
        ================================================== */}

        <section
          style={styles.statsGrid}
        >

          <StatCard
            icon="▣"
            label="Total Jobs"
            value={jobs.length}
          />

          <StatCard
            icon="◉"
            label="Active Postings"
            value={jobs.length}
          />

          <StatCard
            icon="✦"
            label="AI Matching Ready"
            value={jobs.length}
          />

          <StatCard
            icon="↗"
            label="Latest Posting"
            value={
              jobs.length > 0
                ? `#${jobs[0]?.id}`
                : "—"
            }
          />

        </section>


        {/* ==================================================
            SEARCH TOOLBAR
        ================================================== */}

        <section
          style={styles.toolbar}
        >

          <div>

            <p
              style={styles.cardEyebrow}
            >
              YOUR OPPORTUNITIES
            </p>

            <h2
              style={styles.sectionTitle}
            >
              Published Jobs
            </h2>

          </div>


          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search title, company, location or skill..."
            style={styles.searchInput}
          />

        </section>


        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {filteredJobs.length === 0 ? (

          <section
            style={styles.emptyCard}
          >

            <div
              style={styles.emptyIcon}
            >
              ▣
            </div>

            <h2>
              {jobs.length === 0
                ? "No jobs posted yet"
                : "No matching jobs"}
            </h2>

            <p style={styles.muted}>
              {jobs.length === 0
                ? "Create your first job posting to start receiving candidates and AI matching insights."
                : "Try a different search term."}
            </p>

            {jobs.length === 0 && (
              <button
                type="button"
                style={styles.primaryButton}
                onClick={() =>
                  navigate(
                    "/recruiter/post-job"
                  )
                }
              >
                Create Your First Job →
              </button>
            )}

          </section>

        ) : (

          /* ==================================================
             JOB LIST
          ================================================== */

          <section
            style={styles.jobList}
          >

            {filteredJobs.map(
              (job) => {

                const skills =
                  splitSkills(
                    job?.required_skills
                  );

                const isDeleting =
                  Number(
                    deletingId
                  ) ===
                  Number(job?.id);

                return (
                  <article
                    key={job.id}
                    style={styles.jobCard}
                  >

                    {/* JOB HEADER */}

                    <div
                      style={styles.jobTop}
                    >

                      <div
                        style={styles.jobIcon}
                      >
                        💼
                      </div>


                      <div
                        style={styles.jobInfo}
                      >

                        <div
                          style={styles.jobId}
                        >
                          JOB #{job.id}
                        </div>

                        <h2
                          style={styles.jobTitle}
                        >
                          {job.job_title ||
                            "Untitled Job"}
                        </h2>

                        <p
                          style={styles.company}
                        >
                          {job.company_name ||
                            "Company not specified"}
                        </p>

                      </div>


                      <span
                        style={
                          styles.activeBadge
                        }
                      >
                        ACTIVE
                      </span>

                    </div>


                    {/* ==================================================
                        JOB META
                    ================================================== */}

                    <div
                      style={styles.metaGrid}
                    >

                      <Meta
                        label="Location"
                        value={
                          job.location ||
                          "Not specified"
                        }
                        icon="📍"
                      />

                      <Meta
                        label="Job Type"
                        value={
                          job.job_type ||
                          "Not specified"
                        }
                        icon="💼"
                      />

                      <Meta
                        label="Experience"
                        value={
                          job.experience_required ||
                          "Not specified"
                        }
                        icon="◷"
                      />

                      <Meta
                        label="Created"
                        value={formatDate(
                          job.created_at
                        )}
                        icon="◫"
                      />

                    </div>


                    {/* ==================================================
                        DESCRIPTION
                    ================================================== */}

                    <div
                      style={
                        styles.descriptionBox
                      }
                    >

                      <span
                        style={styles.fieldLabel}
                      >
                        JOB DESCRIPTION
                      </span>

                      <p
                        style={
                          styles.descriptionText
                        }
                      >
                        {job.description ||
                          "No description available."}
                      </p>

                    </div>


                    {/* ==================================================
                        SKILLS
                    ================================================== */}

                    {skills.length > 0 && (
                      <div
                        style={
                          styles.skillsBox
                        }
                      >

                        <span
                          style={
                            styles.fieldLabel
                          }
                        >
                          REQUIRED SKILLS
                        </span>

                        <div
                          style={
                            styles.skillList
                          }
                        >

                          {skills.map(
                            (skill) => (
                              <span
                                key={skill}
                                style={
                                  styles.skillBadge
                                }
                              >
                                {skill}
                              </span>
                            )
                          )}

                        </div>

                      </div>
                    )}


                    {/* ==================================================
                        FOOTER ACTIONS
                    ================================================== */}

                    <div
                      style={
                        styles.cardFooter
                      }
                    >

                      <span
                        style={
                          styles.matchInfo
                        }
                      >
                        AI candidate matching
                        is generated from
                        uploaded candidate
                        resumes.
                      </span>


                      <div
                        style={styles.actions}
                      >

                        <button
                          type="button"
                          style={
                            styles.secondaryButton
                          }
                          onClick={() =>
                            navigate(
                              `/recruiter/matches?jobId=${job.id}`
                            )
                          }
                        >
                          ✦ AI Candidates
                        </button>


                        <button
                          type="button"
                          style={
                            styles.outlineButton
                          }
                          onClick={() =>
                            navigate(
                              `/recruiter/jobs/${job.id}/edit`
                            )
                          }
                        >
                          Edit
                        </button>


                        <button
                          type="button"
                          style={
                            styles.deleteButton
                          }
                          disabled={
                            isDeleting
                          }
                          onClick={() =>
                            void handleDelete(
                              job
                            )
                          }
                        >
                          {isDeleting
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </section>
        )}

      </main>

    </div>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div style={styles.statCard}>

      <div style={styles.statIcon}>
        {icon}
      </div>

      <span
        style={styles.statLabel}
      >
        {label}
      </span>

      <strong
        style={styles.statValue}
      >
        {value}
      </strong>

    </div>
  );
}


/* ============================================================
   META ITEM
============================================================ */

function Meta({
  icon,
  label,
  value,
}) {
  return (
    <div style={styles.metaItem}>

      <span style={styles.metaIcon}>
        {icon}
      </span>

      <div>

        <span
          style={styles.metaLabel}
        >
          {label}
        </span>

        <strong
          style={styles.metaValue}
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
    background: "#f6f8fc",
    color: "#17203a",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  sidebar: {
    width: "250px",
    minHeight: "100vh",
    background: "#11182b",
    color: "#fff",
    padding: "22px 16px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    alignSelf: "flex-start",
  },

  brandButton: {
    width: "100%",
    border: 0,
    background: "transparent",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "4px 7px 25px",
    cursor: "pointer",
    textAlign: "left",
  },

  logoIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg,#6d5ce7,#8b73f4)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "20px",
    flexShrink: 0,
  },

  logoText: {
    fontSize: "19px",
    fontWeight: "800",
  },

  logoTextSpan: {
    color: "#8b73f4",
  },

  sidebarSection: {
    flex: 1,
  },

  sidebarLabel: {
    fontSize: "10px",
    letterSpacing: "1.4px",
    color: "#8e95aa",
    fontWeight: "800",
    padding: "0 12px",
    margin: "4px 0 10px",
  },

  navButton: {
    width: "100%",
    border: 0,
    background: "transparent",
    color: "#b6bdd0",
    padding: "12px 13px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "left",
    marginBottom: "4px",
  },

  navIcon: {
    width: "22px",
    textAlign: "center",
  },

  navButtonActive: {
    background: "#2a254d",
    color: "#fff",
  },

  sidebarBottom: {
    borderTop:
      "1px solid #293047",
    paddingTop: "15px",
  },

  logoutButton: {
    width: "100%",
    border: 0,
    background: "transparent",
    color: "#ff8e8e",
    padding: "12px 13px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  main: {
    flex: 1,
    padding: "42px 42px 70px",
    minWidth: 0,
  },

  header: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "25px",
    flexWrap: "wrap",
  },

  eyebrow: {
    color: "#6652e8",
    fontSize: "11px",
    letterSpacing: "1.5px",
    fontWeight: "800",
    margin: "0 0 7px",
  },

  title: {
    margin: 0,
    color: "#172554",
    fontSize: "36px",
    fontWeight: "800",
    letterSpacing: "-1px",
  },

  subtitle: {
    color: "#68708a",
    margin: "9px 0 0",
    lineHeight: "1.7",
    maxWidth: "720px",
  },

  primaryButton: {
    border: 0,
    borderRadius: "11px",
    background:
      "linear-gradient(135deg,#6652e8,#4f46e5)",
    color: "#fff",
    padding: "13px 18px",
    fontWeight: "750",
    cursor: "pointer",
    boxShadow:
      "0 8px 18px rgba(79,70,229,.18)",
  },

  secondaryButton: {
    border: 0,
    borderRadius: "10px",
    background: "#eeeaff",
    color: "#5545d8",
    padding: "10px 13px",
    fontWeight: "750",
    cursor: "pointer",
  },

  outlineButton: {
    border:
      "1px solid #cbd5e1",
    borderRadius: "10px",
    background: "#fff",
    color: "#475569",
    padding: "10px 13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  deleteButton: {
    border:
      "1px solid #fecaca",
    borderRadius: "10px",
    background: "#fff5f5",
    color: "#c62828",
    padding: "10px 13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  statsGrid: {
    maxWidth: "1200px",
    margin: "0 auto 22px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(190px,1fr))",
    gap: "15px",
  },

  statCard: {
    background: "#fff",
    border:
      "1px solid #e7eaf0",
    borderRadius: "16px",
    padding: "18px",
    boxShadow:
      "0 5px 20px rgba(15,23,42,.04)",
  },

  statIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "#f0edff",
    color: "#6652e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "11px",
    fontWeight: "800",
  },

  statLabel: {
    display: "block",
    color: "#8a91a2",
    fontSize: "11px",
    fontWeight: "750",
    letterSpacing: ".6px",
  },

  statValue: {
    display: "block",
    color: "#172554",
    fontSize: "24px",
    marginTop: "4px",
  },

  toolbar: {
    maxWidth: "1200px",
    margin: "0 auto 18px",
    background: "#fff",
    border:
      "1px solid #e7eaf0",
    borderRadius: "16px",
    padding: "18px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  cardEyebrow: {
    margin: 0,
    color: "#6652e8",
    fontSize: "10px",
    letterSpacing: "1.2px",
    fontWeight: "800",
  },

  sectionTitle: {
    margin: "4px 0 0",
    color: "#172554",
    fontSize: "21px",
  },

  searchInput: {
    width: "min(430px,100%)",
    boxSizing: "border-box",
    padding: "12px 14px",
    border:
      "1px solid #d8dce5",
    borderRadius: "10px",
    outline: "none",
    fontSize: "14px",
  },

  jobList: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gap: "17px",
  },

  jobCard: {
    background: "#fff",
    border:
      "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "23px",
    boxShadow:
      "0 8px 25px rgba(15,23,42,.05)",
  },

  jobTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
  },

  jobIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    background: "#f0edff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  jobInfo: {
    flex: 1,
    minWidth: 0,
  },

  jobId: {
    color: "#6652e8",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  jobTitle: {
    margin: "4px 0 3px",
    color: "#172554",
    fontSize: "20px",
  },

  company: {
    margin: 0,
    color: "#64748b",
    fontWeight: "650",
  },

  activeBadge: {
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "20px",
    padding: "7px 10px",
    fontSize: "10px",
    fontWeight: "850",
  },

  metaGrid: {
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: "10px",
  },

  metaItem: {
    display: "flex",
    gap: "9px",
    padding: "11px",
    borderRadius: "10px",
    background: "#f8fafc",
  },

  metaIcon: {
    fontSize: "15px",
  },

  metaLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "700",
  },

  metaValue: {
    display: "block",
    color: "#334155",
    fontSize: "13px",
    marginTop: "2px",
  },

  descriptionBox: {
    marginTop: "17px",
    paddingTop: "17px",
    borderTop:
      "1px solid #edf0f4",
  },

  descriptionText: {
    color: "#475569",
    lineHeight: "1.65",
    margin: 0,
  },

  fieldLabel: {
    display: "block",
    color: "#8a91a2",
    fontSize: "10px",
    letterSpacing: ".8px",
    fontWeight: "800",
    marginBottom: "7px",
  },

  skillsBox: {
    marginTop: "14px",
  },

  skillList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
  },

  skillBadge: {
    padding: "7px 10px",
    borderRadius: "18px",
    background: "#eef2ff",
    color: "#4338ca",
    fontSize: "12px",
    fontWeight: "700",
  },

  cardFooter: {
    marginTop: "20px",
    paddingTop: "16px",
    borderTop:
      "1px solid #edf0f4",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  matchInfo: {
    color: "#94a3b8",
    fontSize: "11px",
    maxWidth: "420px",
    lineHeight: "1.5",
  },

  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  alertError: {
    maxWidth: "1200px",
    margin: "0 auto 18px",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "#fff1f2",
    border:
      "1px solid #fecdd3",
    color: "#be123c",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  alertSuccess: {
    maxWidth: "1200px",
    margin: "0 auto 18px",
    padding: "13px 16px",
    borderRadius: "12px",
    background: "#f0fdf4",
    border:
      "1px solid #bbf7d0",
    color: "#166534",
    fontWeight: "700",
  },

  retryButton: {
    border:
      "1px solid #fda4af",
    background: "#fff",
    color: "#be123c",
    borderRadius: "8px",
    padding: "7px 10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  emptyCard: {
    maxWidth: "760px",
    margin: "50px auto",
    background: "#fff",
    border:
      "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "55px 30px",
    textAlign: "center",
    boxShadow:
      "0 10px 35px rgba(15,23,42,.06)",
  },

  emptyIcon: {
    width: "62px",
    height: "62px",
    margin: "0 auto 18px",
    borderRadius: "18px",
    background: "#f0edff",
    color: "#6652e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "800",
  },

  muted: {
    color: "#7b8496",
    lineHeight: "1.65",
  },

  centerPage: {
    minHeight: "100vh",
    background: "#f6f8fc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
  },

  loadingCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "45px",
    textAlign: "center",
    boxShadow:
      "0 10px 35px rgba(15,23,42,.08)",
  },

  spinner: {
    width: "22px",
    height: "22px",
    border:
      "3px solid #dbeafe",
    borderTop:
      "3px solid #4f46e5",
    borderRadius: "50%",
    margin: "18px auto",
    animation:
      "hireintel-spin 1s linear infinite",
  },
};


/* ============================================================
   EXPORT
============================================================ */

export default RecruiterJobs;