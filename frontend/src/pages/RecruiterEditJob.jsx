import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function getErrorMessage(
  data,
  fallback = "Something went wrong."
) {
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

  if (data?.detail) {
    return (
      data.detail?.message ||
      data.detail?.error ||
      JSON.stringify(data.detail)
    );
  }

  return fallback;
}

function RecruiterEditJob() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const [form, setForm] = useState({
    job_title: "",
    company_name: "",
    location: "",
    job_type: "Full Time",
    experience_required: "",
    required_skills: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ============================================================
     LOAD JOB
  ============================================================ */

  useEffect(() => {
    let cancelled = false;

    async function loadJob() {
      const token =
        localStorage.getItem("hireintel_token");

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      if (!jobId) {
        setError("Invalid job ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/recruiter/jobs/${jobId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
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
              "Unable to load job."
            )
          );
        }

        if (cancelled) {
          return;
        }

        setForm({
          job_title:
            data?.job_title ||
            data?.title ||
            "",

          company_name:
            data?.company_name ||
            data?.company ||
            "",

          location:
            data?.location || "",

          job_type:
            data?.job_type ||
            "Full Time",

          experience_required:
            data?.experience_required ||
            "",

          required_skills:
            Array.isArray(data?.required_skills)
              ? data.required_skills.join(", ")
              : data?.required_skills || "",

          description:
            data?.description || "",
        });
      } catch (loadError) {
        console.error(
          "Load job error:",
          loadError
        );

        if (!cancelled) {
          setError(
            loadError?.message ||
              "Unable to load job."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [jobId, navigate]);

  /* ============================================================
     HANDLE INPUT
  ============================================================ */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  /* ============================================================
     SAVE JOB
  ============================================================ */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const token =
      localStorage.getItem("hireintel_token");

    if (!token) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (!form.job_title.trim()) {
      setError("Please enter a job title.");
      return;
    }

    if (!form.company_name.trim()) {
      setError(
        "Please enter the company name."
      );
      return;
    }

    if (!form.location.trim()) {
      setError(
        "Please enter the job location."
      );
      return;
    }

    if (!form.experience_required.trim()) {
      setError(
        "Please enter the required experience."
      );
      return;
    }

    if (!form.required_skills.trim()) {
      setError(
        "Please enter the required skills."
      );
      return;
    }

    if (!form.description.trim()) {
      setError(
        "Please enter the job description."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/recruiter/jobs/${jobId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

            Accept:
              "application/json",
          },

          body: JSON.stringify({
            job_title:
              form.job_title.trim(),

            company_name:
              form.company_name.trim(),

            location:
              form.location.trim(),

            job_type:
              form.job_type,

            experience_required:
              form.experience_required.trim(),

            required_skills:
              form.required_skills.trim(),

            description:
              form.description.trim(),
          }),
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
            "Unable to update job."
          )
        );
      }

      setSuccess(
        "Job updated successfully!"
      );

      /* Go back to jobs page after saving */

      setTimeout(() => {
        navigate("/recruiter/jobs", {
          replace: true,
        });
      }, 1000);
    } catch (saveError) {
      console.error(
        "Update job error:",
        saveError
      );

      setError(
        saveError?.message ||
          "Unable to update job."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}>
            ⏳
          </div>

          <h2 style={styles.loadingTitle}>
            Loading Job
          </h2>

          <p style={styles.loadingText}>
            Please wait while we load the
            job details...
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div style={styles.header}>

          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/recruiter/jobs")
              }
              style={styles.backButton}
            >
              ← Back to Jobs
            </button>

            <h1 style={styles.title}>
              Edit Job
            </h1>

            <p style={styles.subtitle}>
              Update your job posting details
            </p>
          </div>

          <div style={styles.jobIdBadge}>
            Job ID: {jobId}
          </div>

        </div>

        {/* ======================================================
            ALERTS
        ====================================================== */}

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.alertIcon}>
              ⚠️
            </span>

            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successBox}>
            <span style={styles.alertIcon}>
              ✅
            </span>

            <span>{success}</span>
          </div>
        )}

        {/* ======================================================
            FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          style={styles.formCard}
        >

          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              💼
            </div>

            <div>
              <h2 style={styles.sectionTitle}>
                Job Information
              </h2>

              <p style={styles.sectionSubtitle}>
                Update the basic information
                about this position.
              </p>
            </div>
          </div>

          <div style={styles.grid}>

            {/* JOB TITLE */}

            <div style={styles.field}>
              <label style={styles.label}>
                Job Title
              </label>

              <input
                type="text"
                name="job_title"
                value={form.job_title}
                onChange={handleChange}
                placeholder="e.g. Java Backend Developer"
                style={styles.input}
              />
            </div>

            {/* COMPANY */}

            <div style={styles.field}>
              <label style={styles.label}>
                Company Name
              </label>

              <input
                type="text"
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                placeholder="e.g. NovaTech Solutions"
                style={styles.input}
              />
            </div>

            {/* LOCATION */}

            <div style={styles.field}>
              <label style={styles.label}>
                Location
              </label>

              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Pune"
                style={styles.input}
              />
            </div>

            {/* JOB TYPE */}

            <div style={styles.field}>
              <label style={styles.label}>
                Job Type
              </label>

              <select
                name="job_type"
                value={form.job_type}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="Full Time">
                  Full Time
                </option>

                <option value="Part Time">
                  Part Time
                </option>

                <option value="Internship">
                  Internship
                </option>

                <option value="Contract">
                  Contract
                </option>

                <option value="Remote">
                  Remote
                </option>
              </select>
            </div>

            {/* EXPERIENCE */}

            <div style={styles.field}>
              <label style={styles.label}>
                Experience Required
              </label>

              <input
                type="text"
                name="experience_required"
                value={
                  form.experience_required
                }
                onChange={handleChange}
                placeholder="e.g. 1-3 years"
                style={{
                  ...styles.input,
                  border:
                    "2px solid #2563eb",
                  background:
                    "#f8fbff",
                }}
              />

              <small
                style={styles.helperText}
              >
                Example: 0-2 years, 1-3
                years, 3-5 years
              </small>
            </div>

            {/* SKILLS */}

            <div style={styles.field}>
              <label style={styles.label}>
                Required Skills
              </label>

              <input
                type="text"
                name="required_skills"
                value={
                  form.required_skills
                }
                onChange={handleChange}
                placeholder="Java, Spring Boot, SQL, Git"
                style={styles.input}
              />

              <small
                style={styles.helperText}
              >
                Separate skills using commas.
              </small>
            </div>

          </div>

          {/* DESCRIPTION */}

          <div style={styles.field}>
            <label style={styles.label}>
              Job Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter the job description..."
              rows={8}
              style={styles.textarea}
            />
          </div>

          {/* ====================================================
              BUTTONS
          ==================================================== */}

          <div style={styles.actions}>

            <button
              type="button"
              onClick={() =>
                navigate("/recruiter/jobs")
              }
              style={styles.cancelButton}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={styles.saveButton}
              disabled={saving}
            >
              {saving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f5f7fb 0%, #eef3ff 100%)",
    padding: "40px 20px",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1050px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "28px",
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    padding: "0",
    marginBottom: "14px",
  },

  title: {
    margin: "0",
    fontSize: "34px",
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "15px",
  },

  jobIdBadge: {
    background: "#ffffff",
    border: "1px solid #dbe3f0",
    borderRadius: "12px",
    padding: "12px 16px",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "700",
    boxShadow:
      "0 4px 14px rgba(15, 23, 42, 0.06)",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    borderRadius: "12px",
    padding: "14px 16px",
    marginBottom: "18px",
    fontWeight: "600",
  },

  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#047857",
    borderRadius: "12px",
    padding: "14px 16px",
    marginBottom: "18px",
    fontWeight: "600",
  },

  alertIcon: {
    fontSize: "18px",
  },

  formCard: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "32px",
    boxShadow:
      "0 12px 40px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e5e7eb",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "28px",
    paddingBottom: "22px",
    borderBottom:
      "1px solid #e5e7eb",
  },

  sectionIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    fontSize: "23px",
  },

  sectionTitle: {
    margin: "0",
    color: "#111827",
    fontSize: "21px",
    fontWeight: "800",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "22px",
    marginBottom: "22px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "22px",
  },

  label: {
    color: "#1f2937",
    fontSize: "14px",
    fontWeight: "750",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "13px 14px",
    fontSize: "15px",
    color: "#111827",
    outline: "none",
    background: "#ffffff",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "14px",
    fontSize: "15px",
    color: "#111827",
    outline: "none",
    background: "#ffffff",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: "1.6",
  },

  helperText: {
    color: "#64748b",
    fontSize: "12px",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "10px",
    borderTop:
      "1px solid #e5e7eb",
  },

  cancelButton: {
    border:
      "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    borderRadius: "10px",
    padding: "13px 22px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },

  saveButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "13px 24px",
    fontSize: "15px",
    fontWeight: "750",
    cursor: "pointer",
    boxShadow:
      "0 6px 18px rgba(37, 99, 235, 0.25)",
  },

  centerPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f7fb",
    padding: "20px",
  },

  loadingCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "40px",
    textAlign: "center",
    boxShadow:
      "0 12px 35px rgba(15, 23, 42, 0.08)",
  },

  spinner: {
    fontSize: "34px",
    marginBottom: "12px",
  },

  loadingTitle: {
    margin: "0",
    color: "#111827",
  },

  loadingText: {
    color: "#6b7280",
    marginBottom: "0",
  },
};

export default RecruiterEditJob;