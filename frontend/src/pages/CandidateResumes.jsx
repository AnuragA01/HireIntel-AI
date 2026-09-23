import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

/*
  Fetch the candidate's resumes.

  This helper does not call React setState.
  That is important because calling a function that
  immediately calls setState from inside useEffect can
  trigger the React Hooks lint warning shown in VS Code.
*/
async function fetchMyResumes(token) {
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

  const data = await response.json().catch(() => null);

  return {
    response,
    data,
  };
}

function getErrorMessage(data, fallback) {
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

  return fallback;
}

function CandidateResumes() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
    Load resumes when the page opens.

    The async work happens inside the effect.
    There is no synchronous setState call caused by
    calling another state-changing function from the effect.
  */
  useEffect(() => {
    let cancelled = false;

    const loadResumes = async () => {
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
        const { response, data } =
          await fetchMyResumes(token);

        if (cancelled) {
          return;
        }

        if (response.status === 401) {
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
              "Unable to load your resumes."
            )
          );
        }

        setResumes(
          Array.isArray(data) ? data : []
        );
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Resume loading error:",
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

    loadResumes();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  /*
    Refresh the resume list after uploading.
    This function is NOT called directly by useEffect,
    so it can safely update loading/error state here.
  */
  const refreshResumes = async () => {
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

      const { response, data } =
        await fetchMyResumes(token);

      if (response.status === 401) {
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
            "Unable to load your resumes."
          )
        );
      }

      setResumes(
        Array.isArray(data) ? data : []
      );
    } catch (requestError) {
      console.error(
        "Resume refresh error:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to load your resumes."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    /*
      Clear the input so the user can select the same
      file again after a failed upload.
    */
    event.target.value = "";

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    const fileName =
      file.name.toLowerCase();

    const isPdf =
      fileName.endsWith(".pdf");

    const isDocx =
      fileName.endsWith(".docx");

    if (!isPdf && !isDocx) {
      setError(
        "Please upload a PDF or DOCX resume."
      );

      return;
    }

    /*
      PDF is the reliable format in the current
      Windows backend environment.

      DOCX parsing can fail because of the lxml
      DLL/Application Control issue encountered
      during this project.
    */
    if (isDocx) {
      setError(
        "For the current HireIntel AI setup, please upload a PDF resume. PDF parsing is enabled and reliable."
      );

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Resume file must be 10 MB or smaller."
      );

      return;
    }

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
      setUploading(true);
      setError("");

      const formData = new FormData();

      formData.append("file", file);

      /*
        Do NOT manually set Content-Type here.

        The browser automatically creates:
        multipart/form-data; boundary=...
      */
      const response = await fetch(
        `${API_BASE_URL}/resumes/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (response.status === 401) {
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
            "Resume upload failed."
          )
        );
      }

      setSuccess(
        "Resume uploaded successfully."
      );

      /*
        Reload the list after successful upload.
      */
      await refreshResumes();
    } catch (uploadError) {
      console.error(
        "Resume upload error:",
        uploadError
      );

      setError(
        uploadError?.message ||
          "Unable to upload the resume."
      );
    } finally {
      setUploading(false);
    }
  };

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

  const getScore = (resume) => {
    const score =
      resume?.resume_score ??
      resume?.score ??
      resume?.analysis_score ??
      resume?.ats_score;

    if (
      score === null ||
      score === undefined
    ) {
      return null;
    }

    const numericScore = Number(score);

    return Number.isFinite(numericScore)
      ? numericScore
      : null;
  };

  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.loadingCard}>
          <div style={styles.logoIcon}>
            H
          </div>

          <h2>
            Loading My Resumes...
          </h2>

          <p style={styles.muted}>
            Fetching your uploaded resumes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            H
          </div>

          <div style={styles.logoText}>
            HireIntel <span>AI</span>
          </div>
        </div>

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
              navigate("/candidate/jobs")
            }
          />

          <NavButton
            label="My Resumes"
            icon="▤"
            active
          />

          <NavButton
            label="Applications"
            icon="▣"
            onClick={() =>
              navigate(
                "/candidate/applications"
              )
            }
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

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>
              RESUME INTELLIGENCE
            </p>

            <h1 style={styles.title}>
              My Resumes
            </h1>

            <p style={styles.subtitle}>
              Manage your resumes and keep your
              career information ready for
              applications.
            </p>
          </div>

          <button
            type="button"
            style={{
              ...styles.primaryButton,
              ...(uploading
                ? styles.disabledButton
                : {}),
            }}
            disabled={uploading}
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            {uploading
              ? "Uploading..."
              : "＋ Upload Resume"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            style={{
              display: "none",
            }}
          />
        </header>

        {/* ERROR */}

        {error && (
          <div style={styles.errorBox}>
            <strong>
              Resume action failed
            </strong>

            <p>{error}</p>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div style={styles.successBox}>
            <strong>
              Success
            </strong>

            <p>{success}</p>
          </div>
        )}

        {/* =================================================
            UPLOAD AREA
        ================================================= */}

        <section style={styles.uploadCard}>
          <div style={styles.uploadIcon}>
            ↑
          </div>

          <div style={styles.uploadContent}>
            <h2 style={styles.cardTitle}>
              Upload a new resume
            </h2>

            <p style={styles.cardText}>
              Upload your latest resume in PDF
              format. HireIntel AI can use it for
              resume analysis and job matching.
            </p>

            <button
              type="button"
              style={{
                ...styles.secondaryButton,
                ...(uploading
                  ? styles.disabledButton
                  : {}),
              }}
              disabled={uploading}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              {uploading
                ? "Uploading..."
                : "Choose PDF Resume"}
            </button>

            <span style={styles.fileHint}>
              Maximum file size: 10 MB
            </span>
          </div>
        </section>

        {/* =================================================
            RESUME LIST
        ================================================= */}

        <section style={styles.resumeSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Uploaded Resumes
              </h2>

              <p style={styles.sectionText}>
                {resumes.length} resume
                {resumes.length !== 1
                  ? "s"
                  : ""}{" "}
                found.
              </p>
            </div>
          </div>

          {resumes.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>
                ▤
              </div>

              <h2>
                No resumes uploaded yet
              </h2>

              <p>
                Upload your resume to use it
                when applying for jobs.
              </p>

              <button
                type="button"
                style={styles.primaryButton}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                Upload Your Resume →
              </button>
            </div>
          ) : (
            <div style={styles.resumeList}>
              {resumes.map((resume) => {
                const score =
                  getScore(resume);

                return (
                  <article
                    key={resume?.id}
                    style={styles.resumeCard}
                  >
                    <div style={styles.fileIcon}>
                      PDF
                    </div>

                    <div style={styles.resumeInfo}>
                      <h3
                        style={
                          styles.resumeName
                        }
                      >
                        {resume?.filename ||
                          resume?.file_name ||
                          `Resume #${
                            resume?.id ||
                            "N/A"
                          }`}
                      </h3>

                      <div
                        style={
                          styles.metaRow
                        }
                      >
                        <span>
                          Resume ID:{" "}
                          {resume?.id ||
                            "N/A"}
                        </span>

                        <span>
                          Uploaded:{" "}
                          {formatDate(
                            resume?.created_at ||
                              resume?.uploaded_at ||
                              resume?.upload_date
                          )}
                        </span>
                      </div>
                    </div>

                    <div
                      style={
                        styles.analysisBox
                      }
                    >
                      <span
                        style={
                          styles.analysisLabel
                        }
                      >
                        AI Score
                      </span>

                      <strong
                        style={
                          styles.analysisScore
                        }
                      >
                        {score !== null
                          ? `${score}%`
                          : "—"}
                      </strong>
                    </div>

                    <div
                      style={{
                        ...styles.statusBadge,
                        background:
                          score !== null
                            ? "#eafaf0"
                            : "#f1f3f7",
                        color:
                          score !== null
                            ? "#17834b"
                            : "#666d7c",
                      }}
                    >
                      {score !== null
                        ? "Analyzed"
                        : "Uploaded"}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* =================================================
            INFORMATION CARD
        ================================================= */}

        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>
            ✦
          </div>

          <div>
            <h3 style={styles.infoTitle}>
              Resume Intelligence
            </h3>

            <p style={styles.infoText}>
              Your resume is used to calculate
              job matching insights and support
              the application workflow. Keep your
              resume updated with your latest
              skills, projects, education and
              experience.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   SIDEBAR BUTTON
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
    color: "#ffffff",
    padding:
      "13px 20px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  secondaryButton: {
    border:
      "1px solid #ddd9f6",
    background: "#ffffff",
    color: "#6657e8",
    padding:
      "11px 18px",
    borderRadius: "9px",
    fontWeight: "700",
    cursor: "pointer",
  },

  uploadCard: {
    background: "#ffffff",
    border:
      "1px dashed #cfc9f5",
    borderRadius: "18px",
    padding: "25px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "32px",
  },

  uploadIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "15px",
    background: "#f0edff",
    color: "#6657e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "800",
    flexShrink: 0,
  },

  uploadContent: {
    flex: 1,
  },

  cardTitle: {
    margin: 0,
    fontSize: "18px",
  },

  cardText: {
    color: "#7d8392",
    fontSize: "13px",
    lineHeight: "1.6",
    margin:
      "7px 0 14px",
  },

  fileHint: {
    color: "#9a9fac",
    fontSize: "11px",
    marginLeft: "12px",
  },

  resumeSection: {
    marginTop: "10px",
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

  resumeList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  resumeCard: {
    background: "#ffffff",
    border:
      "1px solid #e8eaf0",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "17px",
    flexWrap: "wrap",
  },

  fileIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "13px",
    background: "#fff0f0",
    color: "#c53f3f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "800",
    flexShrink: 0,
  },

  resumeInfo: {
    flex: 1,
    minWidth: "260px",
  },

  resumeName: {
    margin: 0,
    fontSize: "16px",
  },

  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "13px",
    color: "#969ba8",
    fontSize: "11px",
    marginTop: "8px",
  },

  analysisBox: {
    minWidth: "80px",
    textAlign: "center",
  },

  analysisLabel: {
    display: "block",
    color: "#9297a5",
    fontSize: "10px",
  },

  analysisScore: {
    display: "block",
    color: "#6657e8",
    fontSize: "20px",
    marginTop: "3px",
  },

  statusBadge: {
    padding:
      "7px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },

  emptyCard: {
    background: "#ffffff",
    border:
      "1px solid #e8eaf0",
    borderRadius: "20px",
    padding:
      "60px 30px",
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

  infoCard: {
    marginTop: "25px",
    background:
      "linear-gradient(135deg, #f4f1ff, #ffffff)",
    border:
      "1px solid #e2dcff",
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
    border:
      "1px solid #ffd4d4",
    color: "#b42323",
    borderRadius: "14px",
    padding:
      "16px 20px",
    marginBottom: "20px",
  },

  successBox: {
    background: "#eafaf0",
    border:
      "1px solid #ccefdc",
    color: "#177a46",
    borderRadius: "14px",
    padding:
      "16px 20px",
    marginBottom: "20px",
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

  muted: {
    color: "#7d8392",
    lineHeight: "1.6",
  },
};

export default CandidateResumes;
