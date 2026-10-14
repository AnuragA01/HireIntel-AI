import {

  useCallback,

  useEffect,

  useMemo,

  useState,

} from "react";

import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

/* =========================================================

   AUTH HELPERS

========================================================= */

function getToken() {

  return localStorage.getItem("hireintel_token");

}

function clearAuth() {

  localStorage.removeItem("hireintel_token");

  localStorage.removeItem("hireintel_role");

  localStorage.removeItem("hireintel_user_id");

  localStorage.removeItem("hireintel_email");

}

/* =========================================================

   API HELPERS

========================================================= */

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

  if (data?.message) {

    return String(data.message);

  }

  if (data?.error) {

    return String(data.error);

  }

  return fallback;

}

async function parseResponse(response) {

  const text = await response.text();

  if (!text) {

    return {};

  }

  try {

    return JSON.parse(text);

  } catch {

    return {

      message: text,

    };

  }

}

/* =========================================================

   RESUME NORMALIZATION

========================================================= */

function normalizeResumes(data) {

  const list = Array.isArray(data)

    ? data

    : Array.isArray(data?.resumes)

      ? data.resumes

      : [];

  return list.map((resume) => {

    const possibleScores = [

      resume?.ai_score,

      resume?.resume_score,

      resume?.score,

      resume?.analysis_score,

      resume?.analysis?.score,

      resume?.analysis?.resume_score,

    ];

    let score = null;

    for (const value of possibleScores) {

      if (

        value !== null &&

        value !== undefined &&

        value !== ""

      ) {

        const number = Number(value);

        if (Number.isFinite(number)) {

          score = Math.max(

            0,

            Math.min(100, number)

          );

          break;

        }

      }

    }

    return {

      ...resume,

      ai_score: score,

    };

  });

}

/* =========================================================

   DATE FORMAT

========================================================= */

function formatDate(value) {

  if (!value) {

    return "—";

  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {

    return "—";

  }

  return date.toLocaleDateString("en-IN", {

    day: "2-digit",

    month: "short",

    year: "numeric",

  });

}

/* =========================================================

   SCORE HELPERS

========================================================= */

function getScoreColor(score) {

  if (!Number.isFinite(score)) {

    return "#8b91a5";

  }

  if (score >= 80) {

    return "#198754";

  }

  if (score >= 60) {

    return "#6652e8";

  }

  return "#d97706";

}

function getScoreBackground(score) {

  if (!Number.isFinite(score)) {

    return "#f1f3f7";

  }

  if (score >= 80) {

    return "#effaf3";

  }

  if (score >= 60) {

    return "#eeeaff";

  }

  return "#fff7e6";

}

function ScoreBadge({ score }) {

  return (

    <span

      style={{

        ...styles.scoreBadge,

        color: getScoreColor(score),

        background: getScoreBackground(score),

      }}

    >

      {Number.isFinite(score)

        ? `${score.toFixed(0)}%`

        : "—"}

    </span>

  );

}

/* =========================================================

   MAIN COMPONENT

========================================================= */

function CandidateResumes() {

  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] =

    useState(false);

  const [deletingId, setDeletingId] =

    useState(null);

  const [reanalyzingId, setReanalyzingId] =

    useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] =

    useState("");

  /* =======================================================

     AUTH FAILURE

  ======================================================= */

  const handleAuthFailure = useCallback(() => {

    clearAuth();

    navigate("/login", {

      replace: true,

    });

  }, [navigate]);

  /* =======================================================

     FETCH RESUMES

  ======================================================= */

  const fetchResumes = useCallback(

    async () => {

      const token = getToken();

      if (!token) {

        throw new Error(

          "AUTHENTICATION_REQUIRED"

        );

      }

      const response = await fetch(

        `${API_BASE_URL}/resumes/my-resumes`,

        {

          method: "GET",

          headers: {

            Authorization: `Bearer ${token}`,

            Accept: "application/json",

          },

        }

      );

      const data =

        await parseResponse(response);

      if (response.status === 401) {

        throw new Error(

          "AUTHENTICATION_REQUIRED"

        );

      }

      if (!response.ok) {

        throw new Error(

          getErrorMessage(

            data,

            "Unable to load your resumes."

          )

        );

      }

      return normalizeResumes(data);

    },

    []

  );

  /* =======================================================

     INITIAL LOAD

     IMPORTANT:

     There is NO loadResumes function here.

     This removes the unused-variable error.

  ======================================================= */

  useEffect(() => {

    let cancelled = false;

    const initialize = async () => {

      try {

        const list = await fetchResumes();

        if (cancelled) {

          return;

        }

        setResumes(list);

        setError("");

      } catch (err) {

        if (cancelled) {

          return;

        }

        console.error(

          "Initial resume loading error:",

          err

        );

        if (

          err?.message ===

          "AUTHENTICATION_REQUIRED"

        ) {

          handleAuthFailure();

          return;

        }

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

    initialize();

    return () => {

      cancelled = true;

    };

  }, [

    fetchResumes,

    handleAuthFailure,

  ]);

  /* =======================================================

     SORT RESUMES

  ======================================================= */

  const sortedResumes = useMemo(() => {

    return [...resumes].sort((a, b) => {

      const aTime = new Date(

        a?.uploaded_at || 0

      ).getTime();

      const bTime = new Date(

        b?.uploaded_at || 0

      ).getTime();

      if (bTime !== aTime) {

        return bTime - aTime;

      }

      return (

        Number(b?.id || 0) -

        Number(a?.id || 0)

      );

    });

  }, [resumes]);

  const latestResume =

    sortedResumes[0] || null;

  const latestScore =

    latestResume?.ai_score !== null &&

    latestResume?.ai_score !== undefined

      ? Number(latestResume.ai_score)

      : null;

  /* =======================================================

     UPLOAD RESUME

  ======================================================= */

  const handleUpload = async (event) => {

    const file =

      event.target.files?.[0] || null;

    // Allow selecting the same file again

    event.target.value = "";

    setError("");

    setSuccess("");

    if (!file) {

      return;

    }

    const token = getToken();

    if (!token) {

      handleAuthFailure();

      return;

    }

    /* PDF VALIDATION */

    if (

      !file.name

        .toLowerCase()

        .endsWith(".pdf")

    ) {

      setError(

        "Only PDF resumes are supported."

      );

      return;

    }

    /* FILE SIZE VALIDATION */

    const maxSize =

      10 * 1024 * 1024;

    if (file.size > maxSize) {

      setError(

        "Resume file size must be 10 MB or less."

      );

      return;

    }

    const formData = new FormData();

    formData.append("file", file);

    try {

      setUploading(true);

      const response = await fetch(

        `${API_BASE_URL}/resumes/upload`,

        {

          method: "POST",

          headers: {

            Authorization: `Bearer ${token}`,

          },

          body: formData,

        }

      );

      const data =

        await parseResponse(response);

      if (response.status === 401) {

        handleAuthFailure();

        return;

      }

      if (!response.ok) {

        throw new Error(

          getErrorMessage(

            data,

            "Resume upload failed."

          )

        );

      }

      setSuccess(

        "Resume uploaded successfully."

      );

      const updatedResumes =

        await fetchResumes();

      setResumes(updatedResumes);

    } catch (err) {

      console.error(

        "Resume upload error:",

        err

      );

      if (

        err?.message ===

        "AUTHENTICATION_REQUIRED"

      ) {

        handleAuthFailure();

        return;

      }

      setError(

        err?.message ||

          "Unable to upload resume."

      );

    } finally {

      setUploading(false);

    }

  };

  /* =======================================================

     DELETE RESUME

  ======================================================= */

  const handleDelete = async (

    resumeId

  ) => {

    const token = getToken();

    if (!token) {

      handleAuthFailure();

      return;

    }

    const confirmed =

      window.confirm(

        `Are you sure you want to delete Resume #${resumeId}?`

      );

    if (!confirmed) {

      return;

    }

    try {

      setDeletingId(resumeId);

      setError("");

      setSuccess("");

      const response = await fetch(

        `${API_BASE_URL}/resumes/${resumeId}`,

        {

          method: "DELETE",

          headers: {

            Authorization: `Bearer ${token}`,

            Accept: "application/json",

          },

        }

      );

      const data =

        await parseResponse(response);

      if (response.status === 401) {

        handleAuthFailure();

        return;

      }

      if (!response.ok) {

        throw new Error(

          getErrorMessage(

            data,

            "Unable to delete resume."

          )

        );

      }

      setResumes((current) =>

        current.filter(

          (resume) =>

            Number(resume.id) !==

            Number(resumeId)

        )

      );

      setSuccess(

        `Resume #${resumeId} deleted successfully.`

      );

    } catch (err) {

      console.error(

        "Delete resume error:",

        err

      );

      setError(

        err?.message ||

          "Unable to delete resume."

      );

    } finally {

      setDeletingId(null);

    }

  };

  /* =======================================================

     RE-ANALYZE RESUME

  ======================================================= */

  const handleReanalyze = async (

    resumeId

  ) => {

    const token = getToken();

    if (!token) {

      handleAuthFailure();

      return;

    }

    try {

      setReanalyzingId(resumeId);

      setError("");

      setSuccess("");

      const response = await fetch(

        `${API_BASE_URL}/resume-analysis/${resumeId}`,

        {

          method: "POST",

          headers: {

            Authorization: `Bearer ${token}`,

            Accept: "application/json",

          },

        }

      );

      const data =

        await parseResponse(response);

      if (response.status === 401) {

        handleAuthFailure();

        return;

      }

      if (!response.ok) {

        throw new Error(

          getErrorMessage(

            data,

            "Resume analysis failed."

          )

        );

      }

      const updatedResumes =

        await fetchResumes();

      setResumes(updatedResumes);

      setSuccess(

        `Resume #${resumeId} analyzed successfully.`

      );

    } catch (err) {

      console.error(

        "Resume analysis error:",

        err

      );

      setError(

        err?.message ||

          "Unable to analyze resume."

      );

    } finally {

      setReanalyzingId(null);

    }

  };

  /* =======================================================

     NAVIGATION

  ======================================================= */

  const openResumeAnalysis = (

    resumeId

  ) => {

    navigate(

      `/candidate/resume-analysis/${resumeId}`

    );

  };

  const openCareerIntelligence = (

    resumeId

  ) => {

    navigate(

      `/candidate/career-intelligence?resumeId=${encodeURIComponent(

        resumeId

      )}`

    );

  };

  /* =======================================================

     LOADING SCREEN

  ======================================================= */

  if (loading) {

    return (

      <div style={styles.loadingPage}>

        <div style={styles.loadingCard}>

          <div style={styles.loadingIcon}>

            ✦

          </div>

          <h2 style={styles.loadingTitle}>

            Loading Resumes...

          </h2>

          <p style={styles.loadingText}>

            Fetching your resumes and AI

            scores.

          </p>

          <div style={styles.spinner} />

        </div>

      </div>

    );

  }

  /* =======================================================

     MAIN PAGE

  ======================================================= */

  return (

    <div style={styles.page}>

      <main style={styles.container}>

        {/* HEADER */}

        <header style={styles.header}>

          <div>

            <p style={styles.eyebrow}>

              AI CAREER INTELLIGENCE

            </p>

            <h1 style={styles.title}>

              My Resumes

            </h1>

            <p style={styles.subtitle}>

              Manage your resumes, review AI

              analysis and compare your profile

              with job descriptions.

            </p>

          </div>

          <button

            type="button"

            onClick={() =>

              navigate(

                "/candidate/dashboard"

              )

            }

            style={styles.dashboardButton}

          >

            ← Dashboard

          </button>

        </header>

        {/* ERROR */}

        {error && (

          <div

            style={styles.errorAlert}

            role="alert"

          >

            <strong>

              Something went wrong

            </strong>

            <span>{error}</span>

          </div>

        )}

        {/* SUCCESS */}

        {success && (

          <div

            style={styles.successAlert}

            role="status"

          >

            <strong>Success</strong>

            <span>{success}</span>

          </div>

        )}

        {/* UPLOAD CARD */}

        <section style={styles.uploadCard}>

          <div style={styles.uploadIcon}>

            ↑

          </div>

          <div style={styles.uploadContent}>

            <p style={styles.cardEyebrow}>

              RESUME MANAGEMENT

            </p>

            <h2 style={styles.cardTitle}>

              Upload a new resume

            </h2>

            <p style={styles.mutedText}>

              Upload your latest resume in PDF

              format. HireIntel AI will analyze

              it and use the result for

              intelligent job matching.

            </p>

            <div style={styles.uploadRow}>

              <label

                htmlFor="resume-upload"

                style={{

                  ...styles.primaryButton,

                  ...(uploading

                    ? styles.disabledButton

                    : {}),

                }}

              >

                {uploading

                  ? "Uploading..."

                  : "Choose PDF Resume"}

              </label>

              <input

                id="resume-upload"

                type="file"

                accept=".pdf,application/pdf"

                onChange={handleUpload}

                disabled={uploading}

                style={{

                  display: "none",

                }}

              />

              <span style={styles.fileHint}>

                Maximum file size: 10 MB

              </span>

            </div>

          </div>

        </section>

        {/* STATISTICS */}

        <section style={styles.overviewGrid}>

          <div style={styles.statCard}>

            <span style={styles.statLabel}>

              TOTAL RESUMES

            </span>

            <strong style={styles.statValue}>

              {resumes.length}

            </strong>

          </div>

          <div style={styles.statCard}>

            <span style={styles.statLabel}>

              LATEST RESUME

            </span>

            <strong style={styles.statValue}>

              {latestResume

                ? `#${latestResume.id}`

                : "—"}

            </strong>

          </div>

          <div style={styles.statCard}>

            <span style={styles.statLabel}>

              LATEST AI SCORE

            </span>

            <strong

              style={{

                ...styles.statValue,

                color:

                  latestScore === null

                    ? "#17203a"

                    : getScoreColor(

                        latestScore

                      ),

              }}

            >

              {latestScore === null

                ? "—"

                : `${latestScore.toFixed(0)}%`}

            </strong>

          </div>

        </section>

        {/* RESUME LIST */}

        <section>

          <div style={styles.sectionHeader}>

            <div>

              <p style={styles.cardEyebrow}>

                YOUR FILES

              </p>

              <h2 style={styles.sectionTitle}>

                Uploaded Resumes

              </h2>

              <p

                style={

                  styles.sectionSubtitle

                }

              >

                {resumes.length}{" "}

                {resumes.length === 1

                  ? "resume"

                  : "resumes"}{" "}

                found.

              </p>

            </div>

          </div>

          {/* EMPTY STATE */}

          {resumes.length === 0 ? (

            <section

              style={styles.emptyCard}

            >

              <div style={styles.emptyIcon}>

                📄

              </div>

              <h2 style={styles.emptyTitle}>

                No resumes uploaded

              </h2>

              <p style={styles.mutedText}>

                Upload your resume to enable

                AI resume analysis and job

                matching.

              </p>

            </section>

          ) : (

            <div style={styles.resumeList}>

              {sortedResumes.map(

                (resume, index) => {

                  const score =
                    resume?.ai_score !== null &&
                    resume?.ai_score !== undefined &&
                    resume?.ai_score !== "" &&
                    Number.isFinite(Number(resume.ai_score))
                      ? Math.max(0, Math.min(100, Number(resume.ai_score)))
                      : null;

                  const deleting =

                    deletingId ===

                    resume.id;

                  const reanalyzing =

                    reanalyzingId ===

                    resume.id;

                  const busy =

                    deleting ||

                    reanalyzing;

                  return (

                    <article

                      key={resume.id}

                      style={

                        styles.resumeCard

                      }

                    >

                      {/* RESUME HEADER */}

                      <div

                        style={

                          styles.resumeTop

                        }

                      >

                        <div

                          style={

                            styles.pdfIcon

                          }

                        >

                          PDF

                        </div>

                        <div

                          style={

                            styles.resumeMainInfo

                          }

                        >

                          <div

                            style={

                              styles.resumeTitleRow

                            }

                          >

                            <h3

                              style={

                                styles.resumeTitle

                              }

                            >

                              Resume #

                              {resume.id}

                            </h3>

                            {index === 0 && (

                              <span

                                style={

                                  styles.latestBadge

                                }

                              >

                                LATEST

                              </span>

                            )}

                          </div>

                          <div

                            style={

                              styles.metaRow

                            }

                          >

                            <span>

                              Resume ID:{" "}

                              {resume.id}

                            </span>

                            <span>

                              Uploaded:{" "}

                              {formatDate(

                                resume.uploaded_at

                              )}

                            </span>

                          </div>

                          <p

                            style={

                              styles.fileName

                            }

                          >

                            {resume.original_filename ||

                              resume.filename ||

                              "Uploaded Resume"}

                          </p>

                        </div>

                        {/* SCORE */}

                        <div

                          style={

                            styles.scoreArea

                          }

                        >

                          <span

                            style={

                              styles.scoreLabel

                            }

                          >

                            AI SCORE

                          </span>

                          <ScoreBadge

                            score={score}

                          />

                        </div>

                      </div>

                      <div

                        style={styles.divider}

                      />

                      {/* ACTION HEADER */}

                      <div

                        style={

                          styles.actionHeader

                        }

                      >

                        <span

                          style={

                            styles.actionTitle

                          }

                        >

                          Resume Actions

                        </span>

                        <span

                          style={

                            styles.actionHint

                          }

                        >

                          Choose an action

                        </span>

                      </div>

                      {/* ACTION BUTTONS */}

                      <div

                        style={

                          styles.actionGrid

                        }

                      >

                        {/* VIEW AI ANALYSIS */}

                        <button

                          type="button"

                          onClick={() =>

                            openResumeAnalysis(

                              resume.id

                            )

                          }

                          disabled={busy}

                          style={{

                            ...styles.actionButton,

                            ...styles.analysisButton,

                            ...(busy

                              ? styles.disabledButton

                              : {}),

                          }}

                        >

                          <span

                            style={

                              styles.actionIcon

                            }

                          >

                            ✦

                          </span>

                          <span

                            style={

                              styles.actionText

                            }

                          >

                            <strong>

                              View AI Analysis

                            </strong>

                            <small>

                              See resume score

                              and insights

                            </small>

                          </span>

                          <span

                            style={

                              styles.arrow

                            }

                          >

                            →

                          </span>

                        </button>

                        {/* ANALYZE JOB MATCH */}

                        <button

                          type="button"

                          onClick={() =>

                            openCareerIntelligence(

                              resume.id

                            )

                          }

                          disabled={busy}

                          style={{

                            ...styles.actionButton,

                            ...styles.matchButton,

                            ...(busy

                              ? styles.disabledButton

                              : {}),

                          }}

                        >

                          <span

                            style={

                              styles.actionIcon

                            }

                          >

                            ◎

                          </span>

                          <span

                            style={

                              styles.actionText

                            }

                          >

                            <strong>

                              Analyze Job Match

                            </strong>

                            <small>

                              Compare this resume

                              with a job

                            </small>

                          </span>

                          <span

                            style={

                              styles.arrow

                            }

                          >

                            →

                          </span>

                        </button>

                        {/* RE-ANALYZE */}

                        <button

                          type="button"

                          onClick={() =>

                            handleReanalyze(

                              resume.id

                            )

                          }

                          disabled={busy}

                          style={{

                            ...styles.secondaryButton,

                            ...(busy

                              ? styles.disabledButton

                              : {}),

                          }}

                        >

                          {reanalyzing

                            ? "Re-analyzing..."

                            : "↻ Re-analyze"}

                        </button>

                        {/* DELETE */}

                        <button

                          type="button"

                          onClick={() =>

                            handleDelete(

                              resume.id

                            )

                          }

                          disabled={busy}

                          style={{

                            ...styles.deleteButton,

                            ...(busy

                              ? styles.disabledButton

                              : {}),

                          }}

                        >

                          {deleting

                            ? "Deleting..."

                            : "Delete"}

                        </button>

                      </div>

                    </article>

                  );

                }

              )}

            </div>

          )}

        </section>

        {/* INFORMATION CARD */}

        <section style={styles.infoCard}>

          <div style={styles.infoIcon}>

            ✦

          </div>

          <div>

            <p style={styles.cardEyebrow}>

              RESUME INTELLIGENCE

            </p>

            <h2 style={styles.infoTitle}>

              How HireIntel AI uses your resume

            </h2>

            <p style={styles.mutedText}>

              Your resume is analyzed for

              skills, education, experience,

              projects, certifications and

              keywords. These insights power

              resume scoring and intelligent

              job matching.

            </p>

          </div>

        </section>

      </main>

    </div>

  );

}

/* =========================================================

   STYLES

========================================================= */

const styles = {

  page: {

    minHeight: "100vh",

    background: "#f7f8fc",

    color: "#17203a",

    fontFamily:

      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  },

  container: {

    width: "100%",

    maxWidth: "1250px",

    margin: "0 auto",

    padding: "40px 30px 60px",

    boxSizing: "border-box",

  },

  header: {

    display: "flex",

    justifyContent: "space-between",

    alignItems: "flex-start",

    flexWrap: "wrap",

    gap: "20px",

    marginBottom: "30px",

  },

  eyebrow: {

    margin: "0 0 8px",

    color: "#6652e8",

    fontWeight: 800,

    fontSize: "13px",

    letterSpacing: "1px",

  },

  title: {

    margin: 0,

    fontSize: "38px",

    fontWeight: 800,

  },

  subtitle: {

    margin: "10px 0 0",

    color: "#68708a",

    fontSize: "16px",

    lineHeight: 1.6,

    maxWidth: "760px",

  },

  dashboardButton: {

    border: "1px solid #d9ddec",

    borderRadius: "11px",

    background: "#fff",

    color: "#303952",

    padding: "11px 17px",

    fontWeight: 700,

    cursor: "pointer",

  },

  errorAlert: {

    display: "flex",

    flexDirection: "column",

    gap: "5px",

    background: "#fff0f0",

    border: "1px solid #ffd2d2",

    color: "#c62828",

    padding: "15px 18px",

    borderRadius: "12px",

    marginBottom: "20px",

  },

  successAlert: {

    display: "flex",

    flexDirection: "column",

    gap: "5px",

    background: "#effaf3",

    border: "1px solid #ccebd8",

    color: "#247a46",

    padding: "15px 18px",

    borderRadius: "12px",

    marginBottom: "20px",

  },

  uploadCard: {

    display: "flex",

    alignItems: "center",

    gap: "22px",

    background: "#fff",

    borderRadius: "22px",

    padding: "32px",

    marginBottom: "25px",

    border: "1px dashed #cfc8ff",

    boxShadow:

      "0 8px 25px rgba(40,40,80,0.04)",

  },

  uploadIcon: {

    width: "64px",

    height: "64px",

    borderRadius: "18px",

    background: "#eeeaff",

    color: "#6652e8",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "30px",

    fontWeight: 800,

    flexShrink: 0,

  },

  uploadContent: {

    flex: 1,

  },

  cardEyebrow: {

    margin: 0,

    color: "#7d8498",

    fontWeight: 800,

    fontSize: "11px",

    letterSpacing: "1.2px",

  },

  cardTitle: {

    margin: "6px 0 7px",

    fontSize: "21px",

  },

  mutedText: {

    color: "#68708a",

    lineHeight: 1.65,

    margin: 0,

  },

  uploadRow: {

    display: "flex",

    alignItems: "center",

    gap: "15px",

    flexWrap: "wrap",

    marginTop: "18px",

  },

  primaryButton: {

    display: "inline-flex",

    alignItems: "center",

    justifyContent: "center",

    borderRadius: "10px",

    padding: "11px 16px",

    background: "#6652e8",

    color: "#fff",

    fontWeight: 700,

    cursor: "pointer",

  },

  fileHint: {

    color: "#8b91a5",

    fontSize: "13px",

  },

  disabledButton: {

    opacity: 0.55,

    cursor: "not-allowed",

  },

  overviewGrid: {

    display: "grid",

    gridTemplateColumns:

      "repeat(3, minmax(0, 1fr))",

    gap: "15px",

    marginBottom: "30px",

  },

  statCard: {

    background: "#fff",

    border: "1px solid #e7eaf2",

    borderRadius: "16px",

    padding: "20px",

  },

  statLabel: {

    display: "block",

    color: "#7d8498",

    fontSize: "10px",

    fontWeight: 800,

    letterSpacing: "1.2px",

  },

  statValue: {

    display: "block",

    marginTop: "7px",

    fontSize: "26px",

    fontWeight: 800,

  },

  sectionHeader: {

    display: "flex",

    justifyContent: "space-between",

    marginBottom: "18px",

  },

  sectionTitle: {

    margin: "5px 0 0",

    fontSize: "27px",

  },

  sectionSubtitle: {

    margin: "7px 0 0",

    color: "#8b91a5",

  },

  emptyCard: {

    background: "#fff",

    borderRadius: "20px",

    padding: "60px 30px",

    textAlign: "center",

    border: "1px solid #edf0f5",

  },

  emptyIcon: {

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

  },

  emptyTitle: {

    margin: 0,

  },

  resumeList: {

    display: "grid",

    gap: "18px",

  },

  resumeCard: {

    background: "#fff",

    borderRadius: "20px",

    padding: "25px 28px",

    boxShadow:

      "0 6px 20px rgba(40,40,80,0.04)",

    border: "1px solid #edf0f5",

  },

  resumeTop: {

    display: "flex",

    alignItems: "center",

    gap: "18px",

    flexWrap: "wrap",

  },

  pdfIcon: {

    width: "58px",

    height: "58px",

    borderRadius: "16px",

    background: "#fff0f0",

    color: "#d63c3c",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontWeight: 800,

    fontSize: "13px",

    flexShrink: 0,

  },

  resumeMainInfo: {

    flex: 1,

    minWidth: "260px",

  },

  resumeTitleRow: {

    display: "flex",

    alignItems: "center",

    gap: "10px",

    flexWrap: "wrap",

  },

  resumeTitle: {

    margin: 0,

    fontSize: "20px",

  },

  latestBadge: {

    background: "#eeeaff",

    color: "#6652e8",

    padding: "5px 10px",

    borderRadius: "20px",

    fontSize: "11px",

    fontWeight: 800,

  },

  metaRow: {

    display: "flex",

    gap: "15px",

    flexWrap: "wrap",

    marginTop: "7px",

    color: "#8b91a5",

    fontSize: "13px",

  },

  fileName: {

    margin: "8px 0 0",

    color: "#68708a",

    fontSize: "13px",

    overflow: "hidden",

    textOverflow: "ellipsis",

    whiteSpace: "nowrap",

  },

  scoreArea: {

    minWidth: "100px",

    textAlign: "center",

  },

  scoreLabel: {

    display: "block",

    color: "#8b91a5",

    fontSize: "10px",

    fontWeight: 800,

    letterSpacing: "1px",

    marginBottom: "6px",

  },

  scoreBadge: {

    display: "inline-block",

    padding: "9px 13px",

    borderRadius: "20px",

    fontWeight: 800,

    fontSize: "14px",

  },

  divider: {

    height: "1px",

    background: "#edf0f5",

    margin: "20px 0 16px",

  },

  actionHeader: {

    display: "flex",

    justifyContent: "space-between",

    gap: "12px",

    flexWrap: "wrap",

    alignItems: "center",

    marginBottom: "12px",

  },

  actionTitle: {

    fontWeight: 800,

    fontSize: "13px",

    color: "#303952",

  },

  actionHint: {

    color: "#8b91a5",

    fontSize: "12px",

  },

  actionGrid: {

    display: "grid",

    gridTemplateColumns:

      "repeat(2, minmax(0, 1fr))",

    gap: "10px",

  },

  actionButton: {

    border: "none",

    borderRadius: "12px",

    padding: "13px 14px",

    display: "flex",

    alignItems: "center",

    gap: "11px",

    textAlign: "left",

    cursor: "pointer",

    minWidth: 0,

  },

  analysisButton: {

    background: "#6652e8",

    color: "#fff",

  },

  matchButton: {

    background: "#17203a",

    color: "#fff",

  },

  actionIcon: {

    width: "32px",

    height: "32px",

    borderRadius: "9px",

    background:

      "rgba(255,255,255,.15)",

    display: "grid",

    placeItems: "center",

    flexShrink: 0,

    fontSize: "16px",

  },

  actionText: {

    display: "flex",

    flexDirection: "column",

    gap: "3px",

    minWidth: 0,

  },

  arrow: {

    marginLeft: "auto",

    fontSize: "18px",

  },

  secondaryButton: {

    border: "1px solid #d9ddec",

    borderRadius: "10px",

    padding: "11px 14px",

    background: "#fff",

    color: "#424b64",

    fontWeight: 700,

    cursor: "pointer",

  },

  deleteButton: {

    border: "1px solid #f0d2d2",

    borderRadius: "10px",

    padding: "11px 14px",

    background: "#fff",

    color: "#d93025",

    fontWeight: 700,

    cursor: "pointer",

  },

  infoCard: {

    marginTop: "30px",

    display: "flex",

    gap: "15px",

    alignItems: "flex-start",

    background:

      "linear-gradient(135deg, #f7f4ff, #ffffff)",

    border: "1px solid #ded8ff",

    borderRadius: "20px",

    padding: "28px",

  },

  infoIcon: {

    width: "45px",

    height: "45px",

    borderRadius: "14px",

    background: "#eeeaff",

    color: "#6652e8",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "20px",

    flexShrink: 0,

  },

  infoTitle: {

    margin: 0,

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

    background: "#fff",

    borderRadius: "20px",

    padding: "45px",

    textAlign: "center",

    boxShadow:

      "0 10px 30px rgba(40,40,80,0.06)",

  },

  loadingIcon: {

    width: "55px",

    height: "55px",

    borderRadius: "15px",

    background: "#eeeaff",

    color: "#6652e8",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    margin: "0 auto 18px",

    fontSize: "24px",

  },

  loadingTitle: {

    margin: 0,

  },

  loadingText: {

    color: "#68708a",

    marginTop: "10px",

  },

  spinner: {

    width: "28px",

    height: "28px",

    borderRadius: "50%",

    border: "3px solid #e2e4ed",

    borderTopColor: "#6652e8",

    animation:

      "hireintel-spin .8s linear infinite",

    margin: "18px auto 0",

  },

};

export default CandidateResumes;