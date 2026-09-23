import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function CandidateDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [applicationJobs, setApplicationJobs] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("hireintel_token");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };

        const [
          dashboardResponse,
          profileResponse,
          applicationsResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/dashboard/candidate`, {
            method: "GET",
            headers,
          }),

          fetch(`${API_BASE_URL}/profile/me`, {
            method: "GET",
            headers,
          }),

          fetch(
            `${API_BASE_URL}/applications/my-applications`,
            {
              method: "GET",
              headers,
            }
          ),
        ]);

        if (
          dashboardResponse.status === 401 ||
          profileResponse.status === 401 ||
          applicationsResponse.status === 401
        ) {
          localStorage.removeItem("hireintel_token");
          navigate("/login", { replace: true });
          return;
        }

        const dashboardData =
          await dashboardResponse.json().catch(() => null);

        const profileData =
          await profileResponse.json().catch(() => null);

        const applicationsData =
          await applicationsResponse.json().catch(() => []);

        if (!dashboardResponse.ok) {
          const message =
            typeof dashboardData?.detail === "string"
              ? dashboardData.detail
              : "Unable to load candidate dashboard.";

          throw new Error(message);
        }

        const realApplications = Array.isArray(
          applicationsData
        )
          ? applicationsData
          : [];

        /*
          The application API may provide only job_id.
          Fetch the corresponding candidate-visible job details
          so Recent Applications can show the real job title
          and company name.
        */
        const uniqueJobIds = [
          ...new Set(
            realApplications
              .map((application) => application?.job_id)
              .filter(Boolean)
          ),
        ];

        const jobResults = await Promise.all(
          uniqueJobIds.map(async (jobId) => {
            try {
              const jobResponse = await fetch(
                `${API_BASE_URL}/candidate/jobs/${jobId}`,
                {
                  method: "GET",
                  headers,
                }
              );

              if (!jobResponse.ok) {
                return [String(jobId), null];
              }

              const jobData = await jobResponse
                .json()
                .catch(() => null);

              return [String(jobId), jobData];
            } catch (jobError) {
              console.warn(
                `Could not load job ${jobId}:`,
                jobError
              );

              return [String(jobId), null];
            }
          })
        );

        const jobMap = Object.fromEntries(jobResults);

        const enrichedApplications =
          realApplications.map((application) => {
            const job =
              jobMap[String(application?.job_id)] ||
              {};

            return {
              ...application,
              job_title:
                application?.job_title ||
                application?.title ||
                job?.job_title ||
                job?.title ||
                null,
              company_name:
                application?.company_name ||
                application?.company ||
                job?.company_name ||
                job?.company ||
                null,
            };
          });

        setApplicationJobs(jobMap);

        const enrichedDashboard = {
          ...dashboardData,

          recent_applications:
            enrichedApplications.length > 0
              ? enrichedApplications
              : dashboardData?.recent_applications ||
                dashboardData?.applications ||
                [],

          applications_count:
            enrichedApplications.length > 0
              ? enrichedApplications.length
              : dashboardData?.applications_count ??
                dashboardData?.total_applications ??
                dashboardData?.application_count ??
                dashboardData?.stats?.applications ??
                0,

          shortlisted_count:
            realApplications.length > 0
              ? enrichedApplications.filter(
                  (application) =>
                    String(
                      application?.status || ""
                    ).toLowerCase() === "shortlisted"
                ).length
              : dashboardData?.shortlisted_count ??
                dashboardData?.shortlisted ??
                dashboardData?.stats?.shortlisted ??
                0,

          interview_count:
            realApplications.length > 0
              ? enrichedApplications.filter(
                  (application) =>
                    String(
                      application?.status || ""
                    ).toLowerCase() === "interview"
                ).length
              : dashboardData?.interview_count ??
                dashboardData?.interviews ??
                dashboardData?.stats?.interviews ??
                0,

          hired_count:
            realApplications.length > 0
              ? enrichedApplications.filter(
                  (application) =>
                    String(
                      application?.status || ""
                    ).toLowerCase() === "hired"
                ).length
              : dashboardData?.hired_count ??
                dashboardData?.hired ??
                dashboardData?.stats?.hired ??
                0,
        };

        const applicationScores =
          enrichedApplications
            .map((application) =>
              Number(application?.match_score)
            )
            .filter((score) => Number.isFinite(score));

        if (applicationScores.length > 0) {
          const average =
            applicationScores.reduce(
              (sum, score) => sum + score,
              0
            ) / applicationScores.length;

          enrichedDashboard.average_match_score =
            Math.round(average * 100) / 100;
        }

        setDashboard(enrichedDashboard);

        if (profileResponse.ok) {
          setProfile(profileData);
        }
      } catch (err) {
        console.error("Candidate dashboard error:", err);

        setError(
          err.message ||
            "Unable to connect to the HireIntel AI server."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate, token]);

  const logout = () => {
    localStorage.removeItem("hireintel_token");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>

          <h2 style={styles.loadingTitle}>
            Loading Candidate Dashboard...
          </h2>

          <p style={styles.muted}>
            Please wait while we load your career information.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>!</div>

          <h2>Unable to Load Dashboard</h2>

          <p style={styles.muted}>{error}</p>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
    Backend responses can use slightly different names.
    These helpers make the dashboard tolerant of those names.
  */

  const getValue = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return 0;
  };

  const candidateName =
    getValue(
      profile?.full_name,
      profile?.name,
      profile?.username,
      dashboard?.full_name,
      dashboard?.name,
      "Candidate"
    );

  const email =
    getValue(
      profile?.email,
      dashboard?.email,
      "candidate1@example.com"
    );

  const applicationsCount = getValue(
    dashboard?.applications_count,
    dashboard?.total_applications,
    dashboard?.application_count,
    dashboard?.stats?.applications,
    0
  );

  const shortlistedCount = getValue(
    dashboard?.shortlisted_count,
    dashboard?.shortlisted,
    dashboard?.stats?.shortlisted,
    0
  );

  const interviewCount = getValue(
    dashboard?.interview_count,
    dashboard?.interviews,
    dashboard?.stats?.interviews,
    0
  );

  const hiredCount = getValue(
    dashboard?.hired_count,
    dashboard?.hired,
    dashboard?.stats?.hired,
    0
  );

  const resumeCount = getValue(
    dashboard?.resume_count,
    dashboard?.resumes_count,
    dashboard?.total_resumes,
    0
  );

  const averageMatch = getValue(
    dashboard?.average_match_score,
    dashboard?.avg_match_score,
    dashboard?.match_score,
    dashboard?.stats?.average_match,
    0
  );

  const recentApplications =
    dashboard?.recent_applications ||
    dashboard?.applications ||
    [];

  const jobMatches =
    dashboard?.job_matches ||
    dashboard?.matches ||
    [];

  return (
    <div style={styles.page}>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside style={styles.sidebar}>

        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>H</div>

          <div style={styles.logoText}>
            HireIntel <span>AI</span>
          </div>
        </div>

        <div style={styles.sidebarSection}>
          <p style={styles.sidebarLabel}>
            CANDIDATE
          </p>

          <button
            type="button"
            style={{
              ...styles.navItem,
              ...styles.activeNavItem,
            }}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            type="button"
            style={styles.navItem}
            onClick={() =>
              navigate("/candidate/jobs")
            }
          >
            <span>⌕</span>
            Find Jobs
          </button>

          <button
            type="button"
            style={styles.navItem}
            onClick={() =>
              navigate("/candidate/resumes")
            }
          >
            <span>▤</span>
            My Resumes
          </button>

          <button
            type="button"
            style={styles.navItem}
            onClick={() =>
              navigate("/candidate/applications")
            }
          >
            <span>▣</span>
            Applications
          </button>

          <button
            type="button"
            style={styles.navItem}
            onClick={() =>
              navigate("/candidate/job-matches")
            }
          >
            <span>✦</span>
            Job Matches
          </button>

          <button
            type="button"
            style={styles.navItem}
            onClick={() =>
              navigate("/candidate/profile")
            }
          >
            <span>♙</span>
            Profile
          </button>
        </div>

        <div style={styles.sidebarBottom}>

          <button
            type="button"
            style={styles.navItem}
            onClick={() =>
              navigate("/candidate/settings")
            }
          >
            <span>⚙</span>
            Settings
          </button>

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


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main style={styles.main}>

        {/* TOP BAR */}

        <header style={styles.topbar}>

          <div>
            <p style={styles.welcomeText}>
              Welcome back
            </p>

            <h1 style={styles.pageTitle}>
              Candidate Dashboard
            </h1>

            <p style={styles.pageSubtitle}>
              Track your applications, discover jobs
              and manage your career profile.
            </p>
          </div>

          <div style={styles.profileArea}>

            <div style={styles.profileInfo}>
              <strong>{candidateName}</strong>
              <span>{email}</span>
            </div>

            <div style={styles.avatar}>
              {String(candidateName)
                .charAt(0)
                .toUpperCase()}
            </div>

          </div>

        </header>


        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <section style={styles.actionRow}>

          <button
            type="button"
            style={styles.primaryAction}
            onClick={() =>
              navigate("/candidate/jobs")
            }
          >
            <span>⌕</span>
            Find Jobs
          </button>

          <button
            type="button"
            style={styles.secondaryAction}
            onClick={() =>
              navigate("/candidate/resumes")
            }
          >
            <span>↑</span>
            Manage Resume
          </button>

          <button
            type="button"
            style={styles.secondaryAction}
            onClick={() =>
              navigate("/candidate/applications")
            }
          >
            <span>▣</span>
            My Applications
          </button>

        </section>


        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <section style={styles.statsGrid}>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              ▣
            </div>

            <div>
              <span style={styles.statLabel}>
                Applications
              </span>

              <strong style={styles.statValue}>
                {applicationsCount}
              </strong>

              <small style={styles.statDescription}>
                Total applications
              </small>
            </div>
          </div>


          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              ★
            </div>

            <div>
              <span style={styles.statLabel}>
                Shortlisted
              </span>

              <strong style={styles.statValue}>
                {shortlistedCount}
              </strong>

              <small style={styles.statDescription}>
                Applications shortlisted
              </small>
            </div>
          </div>


          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              ◎
            </div>

            <div>
              <span style={styles.statLabel}>
                Interviews
              </span>

              <strong style={styles.statValue}>
                {interviewCount}
              </strong>

              <small style={styles.statDescription}>
                Interview opportunities
              </small>
            </div>
          </div>


          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              ✦
            </div>

            <div>
              <span style={styles.statLabel}>
                AI Match
              </span>

              <strong style={styles.statValue}>
                {averageMatch}%
              </strong>

              <small style={styles.statDescription}>
                Average job match
              </small>
            </div>
          </div>

        </section>


        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <section style={styles.contentGrid}>

          {/* RECENT APPLICATIONS */}

          <div style={styles.panel}>

            <div style={styles.panelHeader}>

              <div>
                <h2 style={styles.panelTitle}>
                  Recent Applications
                </h2>

                <p style={styles.panelSubtitle}>
                  Track your latest job applications.
                </p>
              </div>

              <button
                type="button"
                style={styles.textButton}
                onClick={() =>
                  navigate("/candidate/applications")
                }
              >
                View All →
              </button>

            </div>


            {Array.isArray(recentApplications) &&
            recentApplications.length > 0 ? (

              <div style={styles.list}>

                {recentApplications
                  .slice(0, 5)
                  .map((application, index) => (

                    <div
                      key={
                        application.id ||
                        index
                      }
                      style={styles.applicationItem}
                    >

                      <div style={styles.applicationIcon}>
                        💼
                      </div>

                      <div style={styles.applicationInfo}>

                        <strong>
                          {application.job_title ||
                            application.title ||
                            applicationJobs[
                              String(application.job_id)
                            ]?.job_title ||
                            applicationJobs[
                              String(application.job_id)
                            ]?.title ||
                            `Job #${application.job_id ||
                              "N/A"}`}
                        </strong>

                        <span>
                          {application.company_name ||
                            application.company ||
                            applicationJobs[
                              String(application.job_id)
                            ]?.company_name ||
                            applicationJobs[
                              String(application.job_id)
                            ]?.company ||
                            "Company"}
                        </span>

                      </div>

                      <div
                        style={{
                          ...styles.statusBadge,
                          ...getStatusStyle(
                            application.status
                          ),
                        }}
                      >
                        {application.status ||
                          "Applied"}
                      </div>

                    </div>

                  ))}

              </div>

            ) : (

              <div style={styles.emptyState}>

                <div style={styles.emptyIcon}>
                  ▣
                </div>

                <h3>
                  No applications yet
                </h3>

                <p>
                  Start exploring jobs and submit
                  your first application.
                </p>

                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={() =>
                    navigate("/candidate/jobs")
                  }
                >
                  Find Jobs →
                </button>

              </div>

            )}

          </div>


          {/* JOB MATCHES */}

          <div style={styles.panel}>

            <div style={styles.panelHeader}>

              <div>
                <h2 style={styles.panelTitle}>
                  AI Job Matches
                </h2>

                <p style={styles.panelSubtitle}>
                  Opportunities matched to your profile.
                </p>
              </div>

              <button
                type="button"
                style={styles.textButton}
                onClick={() =>
                  navigate("/candidate/job-matches")
                }
              >
                View All →
              </button>

            </div>


            {Array.isArray(jobMatches) &&
            jobMatches.length > 0 ? (

              <div style={styles.list}>

                {jobMatches
                  .slice(0, 4)
                  .map((match, index) => {

                    const score =
                      match.match_score ??
                      match.score ??
                      match.match_percentage ??
                      0;

                    return (
                      <div
                        key={
                          match.id ||
                          index
                        }
                        style={styles.matchItem}
                      >

                        <div style={styles.matchInfo}>

                          <strong>
                            {match.job_title ||
                              match.title ||
                              `Job #${match.job_id ||
                                "N/A"}`}
                          </strong>

                          <span>
                            {match.company_name ||
                              match.company ||
                              "Company"}
                          </span>

                        </div>

                        <div style={styles.matchScore}>
                          {score}%
                        </div>

                      </div>
                    );
                  })}

              </div>

            ) : (

              <div style={styles.emptyState}>

                <div style={styles.emptyIcon}>
                  ✦
                </div>

                <h3>
                  No matches yet
                </h3>

                <p>
                  Upload a resume and explore
                  jobs to discover AI matches.
                </p>

                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={() =>
                    navigate("/candidate/jobs")
                  }
                >
                  Explore Jobs →
                </button>

              </div>

            )}

          </div>

        </section>


        {/* =====================================================
            PROFILE SUMMARY
        ===================================================== */}

        <section style={styles.profilePanel}>

          <div>

            <p style={styles.sectionLabel}>
              YOUR CAREER PROFILE
            </p>

            <h2 style={styles.profileTitle}>
              Build a stronger profile
            </h2>

            <p style={styles.profileDescription}>
              Keep your resume, skills and profile
              updated to improve your AI job matches.
            </p>

          </div>

          <div style={styles.profileStats}>

            <div>
              <strong>{resumeCount}</strong>
              <span>Resumes</span>
            </div>

            <div>
              <strong>{hiredCount}</strong>
              <span>Hired</span>
            </div>

          </div>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() =>
              navigate("/candidate/profile")
            }
          >
            View Profile →
          </button>

        </section>

      </main>

    </div>
  );
}


/* ============================================================
   STATUS STYLE
============================================================ */

function getStatusStyle(status) {

  const value =
    String(status || "Applied")
      .toLowerCase();

  if (value === "shortlisted") {
    return {
      background: "#eef2ff",
      color: "#5146d8",
    };
  }

  if (value === "interview") {
    return {
      background: "#fff5e6",
      color: "#b76a00",
    };
  }

  if (value === "hired") {
    return {
      background: "#eafaf0",
      color: "#17834b",
    };
  }

  if (value === "rejected") {
    return {
      background: "#fff0f0",
      color: "#c62828",
    };
  }

  return {
    background: "#f1f3f7",
    color: "#5e6475",
  };
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
    borderRight: "1px solid #e8eaf0",
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
    padding: "5px 10px 35px",
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
    borderTop: "1px solid #eeeeee",
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
    padding: "35px 45px 60px",
    minWidth: 0,
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "25px",
    marginBottom: "30px",
  },

  welcomeText: {
    color: "#6d5ce7",
    fontWeight: "700",
    fontSize: "13px",
    margin: "0 0 6px",
  },

  pageTitle: {
    fontSize: "32px",
    margin: 0,
    fontWeight: "800",
  },

  pageSubtitle: {
    color: "#7a8090",
    marginTop: "8px",
    fontSize: "14px",
  },

  profileArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  profileInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
  },

  profileInfoSpan: {
    color: "#9096a5",
  },

  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#6d5ce7",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "18px",
  },

  actionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "25px",
  },

  primaryAction: {
    border: "none",
    background: "#6657e8",
    color: "#ffffff",
    padding: "13px 20px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  secondaryAction: {
    border: "1px solid #dedfea",
    background: "#ffffff",
    color: "#4e5567",
    padding: "13px 20px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "25px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e8eaf0",
    borderRadius: "16px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  statIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#f0edff",
    color: "#6657e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  statLabel: {
    display: "block",
    fontSize: "12px",
    color: "#8a90a0",
    marginBottom: "5px",
  },

  statValue: {
    display: "block",
    fontSize: "27px",
    fontWeight: "800",
  },

  statDescription: {
    color: "#999eab",
    fontSize: "11px",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "22px",
  },

  panel: {
    background: "#ffffff",
    border: "1px solid #e8eaf0",
    borderRadius: "18px",
    padding: "25px",
    minHeight: "350px",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "20px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "800",
  },

  panelSubtitle: {
    color: "#9096a5",
    fontSize: "12px",
    marginTop: "5px",
  },

  textButton: {
    border: "none",
    background: "transparent",
    color: "#6657e8",
    fontWeight: "700",
    cursor: "pointer",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  applicationItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "13px",
    borderRadius: "12px",
    background: "#fafaff",
  },

  applicationIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#f0edff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  applicationInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  applicationInfoSpan: {
    color: "#8c92a1",
    fontSize: "12px",
  },

  statusBadge: {
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },

  matchItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    borderRadius: "12px",
    background: "#fafaff",
    marginBottom: "10px",
  },

  matchInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  matchScore: {
    color: "#6657e8",
    fontSize: "20px",
    fontWeight: "800",
  },

  emptyState: {
    textAlign: "center",
    padding: "35px 15px",
  },

  emptyIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "#f0edff",
    color: "#6657e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    fontSize: "22px",
  },

  primaryButton: {
    border: "none",
    background: "#6657e8",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "9px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "10px",
  },

  profilePanel: {
    marginTop: "22px",
    background:
      "linear-gradient(135deg, #ffffff, #f5f2ff)",
    border: "1px solid #e3dff9",
    borderRadius: "18px",
    padding: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    flexWrap: "wrap",
  },

  sectionLabel: {
    color: "#6657e8",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  profileTitle: {
    margin: "5px 0",
    fontSize: "23px",
  },

  profileDescription: {
    color: "#777d8c",
    maxWidth: "600px",
    lineHeight: "1.6",
    margin: 0,
  },

  profileStats: {
    display: "flex",
    gap: "30px",
  },

  profileStat: {
    display: "flex",
    flexDirection: "column",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#f7f8fc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
  },

  loadingCard: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "50px",
    textAlign: "center",
    maxWidth: "500px",
    width: "100%",
    border: "1px solid #e8eaf0",
  },

  spinner: {
    width: "45px",
    height: "45px",
    border: "4px solid #e8e6f7",
    borderTop: "4px solid #6657e8",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "spin 1s linear infinite",
  },

  loadingTitle: {
    marginBottom: "10px",
  },

  muted: {
    color: "#7d8392",
    lineHeight: "1.6",
  },

  errorCard: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "50px",
    textAlign: "center",
    maxWidth: "550px",
    width: "100%",
    border: "1px solid #e8eaf0",
  },

  errorIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
    background: "#fff0f0",
    color: "#d33b3b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    fontWeight: "800",
    fontSize: "22px",
  },

};
export default CandidateDashboard;