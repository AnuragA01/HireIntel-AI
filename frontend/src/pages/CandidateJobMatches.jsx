
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
            : item?.msg || "Invalid request."
        )
        .join(", ");
    }

    return fallback;
  };

  const getScore = (match) => {
    const score =
      match?.match_score ??
      match?.score ??
      match?.match_percentage ??
      0;

    const numericScore = Number(score);

    return Number.isFinite(numericScore) ? numericScore : 0;
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

        const response = await fetch(
          `${API_BASE_URL}/dashboard/candidate`,
          {
            method: "GET",
            headers,
          }
        );

        const dashboardData = await response
          .json()
          .catch(() => null);

        if (response.status === 401) {
          localStorage.removeItem("hireintel_token");
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              dashboardData,
              "Unable to load your job matches."
            )
          );
        }

        const rawMatches =
          dashboardData?.job_matches ??
          dashboardData?.matches ??
          [];

        if (!Array.isArray(rawMatches)) {
          throw new Error(
            "The dashboard API returned an invalid matches list."
          );
        }

        /*
         * STEP 1:
         * Group matches by job_id.
         *
         * If a job has several match records, retain only
         * the record with the highest match score.
         *
         * This does not delete any backend records.
         */
        const bestMatchByJob = new Map();

        rawMatches.forEach((match) => {
          const jobId = match?.job_id;

          if (
            jobId === null ||
            jobId === undefined ||
            String(jobId).trim() === ""
          ) {
            return;
          }

          const key = String(jobId);
          const existingMatch = bestMatchByJob.get(key);

          if (
            !existingMatch ||
            getScore(match) > getScore(existingMatch)
          ) {
            bestMatchByJob.set(key, match);
          }
        });

        /*
         * STEP 2:
         * Convert the map to an array and sort by score.
         * Every job now appears only once.
         */
        const uniqueMatches = Array.from(
          bestMatchByJob.values()
        ).sort((a, b) => getScore(b) - getScore(a));

        /*
         * STEP 3:
         * Fetch details for each distinct job.
         */
        const uniqueJobIds = [
          ...new Set(
            uniqueMatches.map((match) =>
              String(match.job_id)
            )
          ),
        ];

        const jobResults = await Promise.all(
          uniqueJobIds.map(async (jobId) => {
            try {
              const jobResponse = await fetch(
                `${API_BASE_URL}/jobs/${jobId}`,
                {
                  method: "GET",
                  headers,
                }
              );

              if (!jobResponse.ok) {
                console.warn(
                  `Unable to load job ${jobId}:`,
                  jobResponse.status
                );

                return [jobId, null];
              }

              const jobData = await jobResponse
                .json()
                .catch(() => null);

              return [jobId, jobData];
            } catch (err) {
              console.error(
                `Error fetching job ${jobId}:`,
                err
              );

              return [jobId, null];
            }
          })
        );

        if (cancelled) return;

        setJobs(Object.fromEntries(jobResults));
        setMatches(uniqueMatches);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load job matches:", err);

        setError(
          err?.message ||
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

  const getJob = (match) =>
    jobs[String(match?.job_id)] || {};

  const getTitle = (match) => {
    const job = getJob(match);

    return (
      match?.job_title ||
      match?.title ||
      job?.job_title ||
      job?.title ||
      `Job #${match?.job_id ?? "N/A"}`
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

    const value =
      match?.required_skills ||
      match?.skills ||
      job?.required_skills ||
      job?.skills ||
      [];

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      return value
        .split(/[,;\n]+/)
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingLogo}>H</div>
        <h2>Loading Your Job Matches...</h2>
        <p style={styles.muted}>
          Finding the best opportunities for your profile.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>H</div>
          <div style={styles.logoText}>
            HireIntel AI
          </div>
        </div>

        <p style={styles.sidebarLabel}>CANDIDATE</p>

        <NavButton
          icon="▦"
          label="Dashboard"
          onClick={() =>
            navigate("/candidate/dashboard")
          }
        />

        <NavButton
          icon="⌕"
          label="Find Jobs"
          onClick={() => navigate("/candidate/jobs")}
        />

        <NavButton
          icon="▤"
          label="My Resumes"
          onClick={() => navigate("/candidate/resumes")}
        />

        <NavButton
          icon="▣"
          label="Applications"
          onClick={() =>
            navigate("/candidate/applications")
          }
        />

        <NavButton
          icon="✦"
          label="Job Matches"
          active
        />

        <NavButton
          icon="♙"
          label="Profile"
          onClick={() =>
            navigate("/candidate/profile")
          }
        />

        <div style={styles.sidebarBottom}>
          <button
            type="button"
            style={styles.logoutButton}
            onClick={() => {
              localStorage.removeItem("hireintel_token");
              navigate("/login", { replace: true });
            }}
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>
              AI CAREER INTELLIGENCE
            </p>

            <h1 style={styles.pageTitle}>Job Matches</h1>

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
              style={styles.primaryButton}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!error && (
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
                value={
                  matches.length
                    ? `${Math.max(
                        ...matches.map(getScore)
                      ).toFixed(2)}%`
                    : "0.00%"
                }
              />

              <SummaryCard
                icon="▤"
                label="Resume Used"
                value={
                  matches[0]?.resume_id
                    ? `#${matches[0].resume_id}`
                    : "—"
                }
              />

              <SummaryCard
                icon="⌕"
                label="Opportunities"
                value={matches.length}
              />
            </section>

            <section>
              <h2 style={styles.sectionTitle}>
                Recommended Opportunities
              </h2>

              <p style={styles.sectionSubtitle}>
                Your highest-scoring match for each job.
              </p>

              {matches.length === 0 ? (
                <div style={styles.emptyCard}>
                  <div style={styles.emptyIcon}>✦</div>
                  <h2>No job matches yet</h2>
                  <p style={styles.muted}>
                    Explore jobs and use your resume to
                    discover suitable opportunities.
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
              ) : (
                <div style={styles.matchList}>
                  {matches.map((match) => {
                    const score = getScore(match);
                    const skills = getSkills(match);
                    const job = getJob(match);

                    return (
                      <article
                        key={String(match.job_id)}
                        style={styles.matchCard}
                      >
                        <div style={styles.matchTop}>
                          <div style={styles.jobIcon}>
                            💼
                          </div>

                          <div style={styles.jobInfo}>
                            <span style={styles.aiBadge}>
                              ✨ AI MATCH
                            </span>

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
                            <p style={styles.skillsLabel}>
                              Required Skills
                            </p>

                            <div style={styles.skillList}>
                              {skills.slice(0, 8).map(
                                (skill, index) => (
                                  <span
                                    key={`${skill}-${index}`}
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
                          <p style={styles.matchNote}>
                            Match score based on available
                            resume and job information.
                          </p>

                          <div style={styles.actions}>
                            <button
                              type="button"
                              style={styles.viewButton}
                              onClick={() =>
                                navigate(
                                  `/candidate/jobs/${match.job_id}`
                                )
                              }
                            >
                              View Job
                            </button>

                            <button
                              type="button"
                              style={styles.applyButton}
                              onClick={() =>
                                navigate(
                                  `/candidate/jobs/${match.job_id}/apply`
                                )
                              }
                            >
                              Apply Now →
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section style={styles.infoCard}>
              <div style={styles.infoIcon}>✦</div>

              <div>
                <h3 style={styles.infoTitle}>
                  How HireIntel AI matching works
                </h3>

                <p style={styles.infoText}>
                  HireIntel AI compares resume and job
                  information using skills, keywords,
                  text similarity and experience-related
                  signals. Each job displays its highest
                  available match score. This score is
                  informational and is not a hiring decision.
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function NavButton({
  icon,
  label,
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.navItem,
        ...(active ? styles.activeNavItem : {}),
      }}
    >
      <span style={styles.navIcon}>{icon}</span>
      {label}
    </button>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div style={styles.summaryCard}>
      <div style={styles.summaryIcon}>{icon}</div>

      <div>
        <span style={styles.summaryLabel}>{label}</span>
        <strong style={styles.summaryValue}>{value}</strong>
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
    fontFamily: "Inter, Arial, sans-serif",
  },

  sidebar: {
    width: "250px",
    minWidth: "220px",
    minHeight: "100vh",
    background: "#fff",
    borderRight: "1px solid #e8eaf0",
    display: "flex",
    flexDirection: "column",
    padding: "28px 18px",
    boxSizing: "border-box",
    position: "sticky",
    top: 0,
    alignSelf: "flex-start",
  },

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "5px 10px 38px",
  },

  logoIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#705cf0",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    fontWeight: "800",
  },

  logoText: {
    fontSize: "20px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  sidebarLabel: {
    color: "#a0a5b5",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1px",
    padding: "0 12px",
    marginBottom: "10px",
  },

  navItem: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#5e6678",
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

  navIcon: {
    width: "14px",
    textAlign: "center",
  },

  sidebarBottom: {
    marginTop: "auto",
    paddingTop: "25px",
  },

  logoutButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#d05252",
    padding: "13px 14px",
    borderRadius: "10px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  main: {
    flex: 1,
    minWidth: 0,
    padding: "38px 45px 60px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
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

  pageTitle: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "800",
  },

  subtitle: {
    color: "#7a8090",
    marginTop: "10px",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  primaryButton: {
    border: "none",
    background: "#6657e8",
    color: "#fff",
    padding: "13px 19px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "36px",
  },

  summaryCard: {
    background: "#fff",
    border: "1px solid #e8eaf0",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },

  summaryIcon: {
    width: "49px",
    height: "49px",
    flexShrink: 0,
    borderRadius: "14px",
    background: "#f0edff",
    color: "#6657e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
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
    color: "#111827",
  },

  sectionTitle: {
    margin: "0 0 7px",
    fontSize: "23px",
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#858b99",
    fontSize: "13px",
    marginBottom: "20px",
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
    fontWeight: "750",
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
    fontSize: "27px",
    lineHeight: "1.1",
    fontWeight: "800",
  },

  skillsArea: {
    borderTop: "1px solid #edf0f5",
    marginTop: "22px",
    paddingTop: "18px",
  },

  skillsLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#777f90",
    margin: "0 0 10px",
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
    marginTop: "22px",
    paddingTop: "17px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  matchNote: {
    color: "#9298a5",
    fontSize: "11px",
    margin: 0,
  },

  actions: {
    display: "flex",
    gap: "9px",
    flexWrap: "wrap",
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
    borderRadius: "18px",
    padding: "55px 25px",
    textAlign: "center",
  },

  emptyIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#f0edff",
    color: "#6657e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 18px",
    fontSize: "25px",
  },

  infoCard: {
    marginTop: "25px",
    background: "linear-gradient(135deg, #f4f1ff, #fff)",
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
    lineHeight: "1.7",
  },

  errorBox: {
    background: "#fff0f0",
    border: "1px solid #ffd4d4",
    color: "#b42323",
    borderRadius: "14px",
    padding: "18px 20px",
    marginBottom: "22px",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#f7f8fc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "25px",
    textAlign: "center",
    fontFamily: "Inter, Arial, sans-serif",
  },

  loadingLogo: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "#705cf0",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "800",
  },

  muted: {
    color: "#7d8392",
    lineHeight: "1.7",
  },
};

export default CandidateJobMatches;
