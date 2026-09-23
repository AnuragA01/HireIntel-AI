import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function CandidateJobMatches() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [jobs, setJobs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getErrorMessage = (data, fallback) => {
    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.msg || item?.message || "Invalid request."
        )
        .join(", ");
    }

    return fallback;
  };

  useEffect(() => {
    let cancelled = false;

    const loadMatches = async () => {
      const token = localStorage.getItem("hireintel_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        };

        const dashboardResponse = await fetch(
          `${API_BASE_URL}/dashboard/candidate`,
          {
            method: "GET",
            headers,
          }
        );

        const dashboardData =
          await dashboardResponse.json().catch(() => null);

        if (dashboardResponse.status === 401) {
          localStorage.removeItem("hireintel_token");
          navigate("/login", { replace: true });
          return;
        }

        if (!dashboardResponse.ok) {
          throw new Error(
            getErrorMessage(
              dashboardData,
              "Unable to load your AI job matches."
            )
          );
        }

        const dashboardMatches =
          dashboardData?.job_matches ||
          dashboardData?.matches ||
          [];

        const rawMatches = Array.isArray(dashboardMatches)
          ? dashboardMatches
          : [];

        /*
          A candidate can sometimes have more than one match
          record for the same-looking job. Keep the highest
          score for each job so the UI does not show duplicates.
        */
        const matchMap = new Map();

        rawMatches.forEach((match) => {
          const jobId = match?.job_id;

          if (!jobId) {
            return;
          }

          const key = String(jobId);
          const existing = matchMap.get(key);

          const currentScore = Number(
            match?.match_score ??
              match?.score ??
              match?.match_percentage ??
              0
          );

          const existingScore = Number(
            existing?.match_score ??
              existing?.score ??
              existing?.match_percentage ??
              0
          );

          if (
            !existing ||
            (Number.isFinite(currentScore) &&
              currentScore > existingScore)
          ) {
            matchMap.set(key, match);
          }
        });

        const normalizedMatches = Array.from(
          matchMap.values()
        ).sort((a, b) => {
          const scoreA = Number(
            a?.match_score ??
              a?.score ??
              a?.match_percentage ??
              0
          );

          const scoreB = Number(
            b?.match_score ??
              b?.score ??
              b?.match_percentage ??
              0
          );

          return scoreB - scoreA;
        });

        const uniqueJobIds = normalizedMatches
          .map((match) => match?.job_id)
          .filter(Boolean);

        const jobResults = await Promise.all(
          uniqueJobIds.map(async (jobId) => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/candidate/jobs/${jobId}`,
                {
                  method: "GET",
                  headers,
                }
              );

              if (!response.ok) {
                return [String(jobId), null];
              }

              const data = await response.json().catch(() => null);

              return [String(jobId), data];
            } catch {
              return [String(jobId), null];
            }
          })
        );

        if (cancelled) {
          return;
        }

        const jobMap = Object.fromEntries(jobResults);

        setJobs(jobMap);
        setMatches(normalizedMatches);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Job matches loading error:",
          requestError
        );

        setError(
          requestError?.message ||
            "Unable to connect to the HireIntel AI server."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMatches();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const getScore = (match) => {
    const score =
      match?.match_score ??
      match?.score ??
      match?.match_percentage ??
      0;

    const numericScore = Number(score);

    return Number.isFinite(numericScore)
      ? numericScore
      : 0;
  };

  const getJob = (match) =>
    jobs[String(match?.job_id)] || {};

  const getTitle = (match) => {
    const job = getJob(match);

    return (
      match?.job_title ||
      match?.title ||
      job?.job_title ||
      job?.title ||
      `Job #${match?.job_id || "N/A"}`
    );
  };

  const getCompany = (match) => {
    const job = getJob(match);

    return (
      match?.company_name ||
      match?.company ||
      job?.company_name ||
      job?.company ||
      "Company information unavailable"
    );
  };

  const getSkills = (match) => {
    const job = getJob(match);

    const skills =
      match?.required_skills ||
      match?.skills ||
      job?.required_skills ||
      job?.skills ||
      "";

    if (Array.isArray(skills)) {
      return skills;
    }

    if (typeof skills === "string") {
      return skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.loadingCard}>
          <div style={styles.logoIcon}>H</div>
          <h2>Analyzing Job Matches...</h2>
          <p style={styles.muted}>
            Loading opportunities matched to your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>H</div>
          <div style={styles.logoText}>
            HireIntel <span>AI</span>
          </div>
        </div>

        <div style={styles.sidebarSection}>
          <p style={styles.sidebarLabel}>CANDIDATE</p>

          <NavButton
            label="Dashboard"
            icon="▦"
            onClick={() => navigate("/candidate/dashboard")}
          />

          <NavButton
            label="Find Jobs"
            icon="⌕"
            onClick={() => navigate("/candidate/jobs")}
          />

          <NavButton
            label="My Resumes"
            icon="▤"
            onClick={() => navigate("/candidate/resumes")}
          />

          <NavButton
            label="Applications"
            icon="▣"
            onClick={() =>
              navigate("/candidate/applications")
            }
          />

          <NavButton
            label="Job Matches"
            icon="✦"
            active
          />

          <NavButton
            label="Profile"
            icon="♙"
            onClick={() => navigate("/candidate/profile")}
          />
        </div>

        <div style={styles.sidebarBottom}>
          <NavButton
            label="Settings"
            icon="⚙"
            onClick={() =>
              navigate("/candidate/settings")
            }
          />

          <button
            type="button"
            style={styles.logoutButton}
            onClick={() => {
              localStorage.removeItem("hireintel_token");
              navigate("/login", { replace: true });
            }}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>AI CAREER INTELLIGENCE</p>

            <h1 style={styles.title}>
              Job Matches
            </h1>

            <p style={styles.subtitle}>
              Discover jobs ranked using your resume and
              HireIntel AI matching analysis.
            </p>
          </div>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => navigate("/candidate/jobs")}
          >
            Find More Jobs →
          </button>
        </header>

        {error && (
          <div style={styles.errorBox}>
            <strong>Unable to load job matches</strong>
            <p>{error}</p>
            <button
              type="button"
              style={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!error && matches.length === 0 && (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>✦</div>
            <h2>No AI matches yet</h2>
            <p>
              Upload a resume and explore available jobs
              to generate job matching insights.
            </p>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => navigate("/candidate/jobs")}
            >
              Explore Jobs →
            </button>
          </div>
        )}

        {!error && matches.length > 0 && (
          <>
            <section style={styles.summaryGrid}>
              <SummaryCard
                icon="✦"
                label="AI Matches"
                value={matches.length}
              />

              <SummaryCard
                icon="◎"
                label="Highest Match"
                value={`${Math.max(
                  ...matches.map(getScore)
                ).toFixed(2)}%`}
              />

              <SummaryCard
                icon="▤"
                label="Resume Used"
                value={
                  matches[0]?.resume_id
                    ? `#${matches[0].resume_id}`
                    : "Current"
                }
              />

              <SummaryCard
                icon="⌕"
                label="Opportunities"
                value={matches.length}
              />
            </section>

            <section>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>
                    Recommended Opportunities
                  </h2>
                  <p style={styles.sectionText}>
                    Your current AI-powered job matches.
                  </p>
                </div>
              </div>

              <div style={styles.matchList}>
                {matches.map((match, index) => {
                  const score = getScore(match);
                  const skills = getSkills(match);
                  const job = getJob(match);

                  return (
                    <article
                      key={
                        match?.id ||
                        `${match?.job_id || "job"}-${index}`
                      }
                      style={styles.matchCard}
                    >
                      <div style={styles.matchTop}>
                        <div style={styles.jobIcon}>
                          💼
                        </div>

                        <div style={styles.jobInfo}>
                          <div style={styles.aiBadge}>
                            ✨ AI MATCH
                          </div>

                          <h3 style={styles.jobTitle}>
                            {getTitle(match)}
                          </h3>

                          <p style={styles.company}>
                            {getCompany(match)}
                          </p>

                          <div style={styles.metaRow}>
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
                                ◷ {job.experience_required}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={styles.scoreArea}>
                          <span style={styles.scoreLabel}>
                            AI Match
                          </span>
                          <strong style={styles.scoreValue}>
                            {score.toFixed(2)}%
                          </strong>
                        </div>
                      </div>

                      {skills.length > 0 && (
                        <div style={styles.skillsArea}>
                          <span style={styles.skillsLabel}>
                            Required Skills
                          </span>

                          <div style={styles.skillList}>
                            {skills.slice(0, 8).map(
                              (skill) => (
                                <span
                                  key={skill}
                                  style={styles.skillBadge}
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      <div style={styles.cardFooter}>
                        <span style={styles.matchNote}>
                          Match score based on available
                          resume and job information.
                        </span>

                        <div style={styles.actions}>
                          <button
                            type="button"
                            style={styles.viewButton}
                            disabled={!match?.job_id}
                            onClick={() => {
                              if (match?.job_id) {
                                navigate(
                                  `/candidate/jobs/${match.job_id}`
                                );
                              }
                            }}
                          >
                            View Job
                          </button>

                          <button
                            type="button"
                            style={styles.applyButton}
                            disabled={!match?.job_id}
                            onClick={() => {
                              if (match?.job_id) {
                                navigate(
                                  `/candidate/jobs/${match.job_id}/apply`
                                );
                              }
                            }}
                          >
                            Apply Now →
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}

        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>✦</div>

          <div>
            <h3 style={styles.infoTitle}>
              How HireIntel AI matching works
            </h3>

            <p style={styles.infoText}>
              HireIntel AI compares available resume and job
              information using skills, keywords, text similarity
              and experience-related signals. The resulting
              percentage is an AI matching score, not a hiring
              decision.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

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
        ...(active ? styles.activeNavItem : {}),
      }}
      onClick={onClick}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div style={styles.summaryCard}>
      <div style={styles.summaryIcon}>{icon}</div>

      <div>
        <span style={styles.summaryLabel}>
          {label}
        </span>
        <strong style={styles.summaryValue}>
          {value}
        </strong>
      </div>
    </div>
  );
}

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
    background: "#fff",
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
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800",
    flexShrink: 0,
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
    padding: "38px 45px 60px",
    minWidth: 0,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "28px",
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
    lineHeight: "1.6",
  },

  primaryButton: {
    border: "none",
    background: "#6657e8",
    color: "#fff",
    padding: "13px 20px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "35px",
  },

  summaryCard: {
    background: "#fff",
    border: "1px solid #e8eaf0",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  summaryIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#f0edff",
    color: "#6657e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  summaryLabel: {
    display: "block",
    color: "#858b99",
    fontSize: "12px",
    marginBottom: "4px",
  },

  summaryValue: {
    display: "block",
    fontSize: "24px",
  },

  sectionHeader: {
    marginBottom: "18px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "23px",
  },

  sectionText: {
    color: "#8a90a0",
    fontSize: "13px",
    marginTop: "7px",
  },

  matchList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  matchCard: {
    background: "#fff",
    border: "1px solid #e8eaf0",
    borderRadius: "18px",
    padding: "24px",
  },

  matchTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: "17px",
  },

  jobIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "15px",
    background: "#f0edff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
  },

  jobInfo: {
    flex: 1,
    minWidth: 0,
  },

  aiBadge: {
    display: "inline-block",
    background: "#f0edff",
    color: "#6657e8",
    borderRadius: "20px",
    padding: "6px 10px",
    fontSize: "10px",
    fontWeight: "800",
    marginBottom: "8px",
  },

  jobTitle: {
    margin: 0,
    fontSize: "20px",
  },

  company: {
    color: "#666e80",
    margin: "5px 0 0",
    fontSize: "14px",
  },

  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    color: "#8c92a0",
    fontSize: "11px",
    marginTop: "10px",
  },

  scoreArea: {
    minWidth: "115px",
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
    flexShrink: 0,
  },

  scoreLabel: {
    color: "#7f8695",
    fontSize: "11px",
    fontWeight: "600",
  },

  scoreValue: {
    color: "#6657e8",
    fontSize: "24px",
    lineHeight: "1.1",
    fontWeight: "800",
  },

  skillsArea: {
    borderTop: "1px solid #edf0f5",
    marginTop: "22px",
    paddingTop: "18px",
  },

  skillsLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: "700",
    color: "#777f90",
    marginBottom: "10px",
  },

  skillList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
  },

  skillBadge: {
    background: "#f0edff",
    color: "#6657e8",
    padding: "7px 10px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "700",
  },

  cardFooter: {
    borderTop: "1px solid #edf0f5",
    marginTop: "20px",
    paddingTop: "17px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  matchNote: {
    color: "#9298a5",
    fontSize: "11px",
  },

  actions: {
    display: "flex",
    gap: "9px",
  },

  viewButton: {
    border: "1px solid #ddd9f6",
    background: "#fff",
    color: "#6657e8",
    padding: "10px 15px",
    borderRadius: "9px",
    fontWeight: "700",
    cursor: "pointer",
  },

  applyButton: {
    border: "none",
    background: "#6657e8",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "9px",
    fontWeight: "700",
    cursor: "pointer",
  },

  emptyCard: {
    background: "#fff",
    border: "1px solid #e8eaf0",
    borderRadius: "20px",
    padding: "65px 30px",
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
    margin: "0 auto 20px",
    fontSize: "25px",
  },

  infoCard: {
    marginTop: "25px",
    background:
      "linear-gradient(135deg, #f4f1ff, #fff)",
    border: "1px solid #e2dcff",
    borderRadius: "18px",
    padding: "22px",
    display: "flex",
    gap: "16px",
  },

  infoIcon: {
    color: "#6657e8",
    fontSize: "22px",
  },

  infoTitle: {
    margin: 0,
    fontSize: "16px",
  },

  infoText: {
    margin: "7px 0 0",
    color: "#747b8c",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  errorBox: {
    background: "#fff0f0",
    border: "1px solid #ffd4d4",
    color: "#b42323",
    borderRadius: "14px",
    padding: "16px 20px",
    marginBottom: "20px",
  },

  retryButton: {
    border: "none",
    background: "#6657e8",
    color: "#fff",
    padding: "9px 14px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
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
    background: "#fff",
    border: "1px solid #e8eaf0",
    borderRadius: "20px",
    padding: "50px",
    textAlign: "center",
    width: "100%",
    maxWidth: "500px",
  },

  muted: {
    color: "#7d8392",
    lineHeight: "1.6",
  },
};

export default CandidateJobMatches;
