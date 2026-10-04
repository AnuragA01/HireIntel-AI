import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

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

function RecruiterPostJob() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    job_title: "",
    company_name: "",
    location: "",
    job_type: "Full Time",
    experience_required: "",
    required_skills: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

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
      setError("Please enter the company name.");
      return;
    }

    if (!form.location.trim()) {
      setError("Please enter the job location.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter the job description.");
      return;
    }

    if (!form.required_skills.trim()) {
      setError("Please enter the required skills.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/recruiter/jobs`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },

          body: JSON.stringify({
            job_title: form.job_title.trim(),
            company_name: form.company_name.trim(),
            location: form.location.trim(),
            job_type: form.job_type,
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
        localStorage.removeItem("hireintel_token");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Unable to create the job."
          )
        );
      }

      setSuccess(
        `Job created successfully. Job ID: ${
          data?.id ?? "N/A"
        }`
      );

      setForm({
        job_title: "",
        company_name: "",
        location: "",
        job_type: "Full Time",
        experience_required: "",
        required_skills: "",
        description: "",
      });
    } catch (submitError) {
      setError(
        submitError?.message ||
          "Unable to create the job."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>
              RECRUITER
            </p>

            <h1 style={styles.title}>
              Post a New Job
            </h1>

            <p style={styles.subtitle}>
              Create a professional job opportunity
              and let HireIntel AI match candidates
              against it.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/recruiter/jobs")
            }
            style={styles.secondaryButton}
          >
            ← My Jobs
          </button>
        </header>

        {/* FORM CARD */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.cardEyebrow}>
                JOB CREATION
              </p>

              <h2 style={styles.cardTitle}>
                Job Information
              </h2>

              <p style={styles.cardDescription}>
                Provide accurate details so the
                AI matching engine can rank
                candidates effectively.
              </p>
            </div>

            <div style={styles.iconBox}>
              +
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <strong>Unable to create job</strong>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={styles.successBox}>
              <strong>Job Created Successfully</strong>
              <span>{success}</span>

              <button
                type="button"
                onClick={() =>
                  navigate("/recruiter/jobs")
                }
                style={styles.successButton}
              >
                View My Jobs →
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* JOB TITLE */}
            <div style={styles.field}>
              <label style={styles.label}>
                Job Title *
              </label>

              <input
                name="job_title"
                value={form.job_title}
                onChange={handleChange}
                placeholder="e.g. Python Developer"
                style={styles.input}
              />
            </div>

            {/* COMPANY + LOCATION */}
            <div style={styles.gridTwo}>

              <div style={styles.field}>
                <label style={styles.label}>
                  Company Name *
                </label>

                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  placeholder="e.g. ABC Technologies"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Location *
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Bangalore"
                  style={styles.input}
                />
              </div>

            </div>

            {/* JOB TYPE + EXPERIENCE */}
            <div style={styles.gridTwo}>

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

                  <option value="Hybrid">
                    Hybrid
                  </option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Experience Required
                </label>

                <input
                  name="experience_required"
                  value={
                    form.experience_required
                  }
                  onChange={handleChange}
                  placeholder="e.g. 0-2 years"
                  style={styles.input}
                />
              </div>

            </div>

            {/* SKILLS */}
            <div style={styles.field}>
              <label style={styles.label}>
                Required Skills *
              </label>

              <input
                name="required_skills"
                value={form.required_skills}
                onChange={handleChange}
                placeholder="Python, FastAPI, SQL, MySQL, Git, REST API"
                style={styles.input}
              />

              <p style={styles.helpText}>
                Separate skills using commas.
                These skills will be used by
                the AI candidate matching engine.
              </p>
            </div>

            {/* DESCRIPTION */}
            <div style={styles.field}>
              <div style={styles.labelRow}>
                <label style={styles.label}>
                  Job Description *
                </label>

                <span style={styles.counter}>
                  {form.description.length} characters
                </span>
              </div>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, requirements and expectations..."
                rows={11}
                style={styles.textarea}
              />
            </div>

            {/* ACTIONS */}
            <div style={styles.actions}>
              <button
                type="button"
                onClick={() =>
                  navigate("/recruiter/jobs")
                }
                style={styles.cancelButton}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.primaryButton,
                  opacity: submitting
                    ? 0.7
                    : 1,
                }}
              >
                {submitting
                  ? "Creating Job..."
                  : "✨ Create Job"}
              </button>
            </div>

          </form>
        </section>

        {/* AI INFO */}
        <section style={styles.infoCard}>
          <div style={styles.infoIcon}>
            ✦
          </div>

          <div>
            <h3 style={styles.infoTitle}>
              AI Candidate Matching
            </h3>

            <p style={styles.infoText}>
              Once the job is created, HireIntel AI
              can compare candidate resumes against
              the job requirements and rank candidates
              by match score.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg,#f8fafc,#eef2ff)",
    padding: "40px 20px 70px",
    color: "#172554",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  eyebrow: {
    margin: 0,
    color: "#6652e8",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.5px",
  },

  title: {
    margin: "6px 0 0",
    fontSize: "36px",
    fontWeight: "800",
  },

  subtitle: {
    maxWidth: "700px",
    margin: "9px 0 0",
    color: "#64748b",
    lineHeight: "1.7",
  },

  secondaryButton: {
    padding: "12px 18px",
    borderRadius: "11px",
    border: "1px solid #c7d2fe",
    background: "#ffffff",
    color: "#4f46e5",
    fontWeight: "750",
    cursor: "pointer",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "32px",
    boxShadow:
      "0 15px 40px rgba(15,23,42,0.07)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "28px",
  },

  cardEyebrow: {
    margin: 0,
    color: "#6652e8",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.2px",
  },

  cardTitle: {
    margin: "5px 0",
    fontSize: "23px",
  },

  cardDescription: {
    margin: 0,
    color: "#64748b",
  },

  iconBox: {
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    background: "#f0edff",
    color: "#6652e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "700",
  },

  field: {
    marginBottom: "21px",
  },

  gridTwo: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(280px,1fr))",
    gap: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "700",
  },

  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  counter: {
    color: "#94a3b8",
    fontSize: "12px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    borderRadius: "11px",
    border: "1px solid #cbd5e1",
    color: "#1e293b",
    background: "#ffffff",
    fontSize: "14px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px",
    borderRadius: "11px",
    border: "1px solid #cbd5e1",
    color: "#1e293b",
    fontSize: "14px",
    fontFamily: "inherit",
    lineHeight: "1.7",
    resize: "vertical",
    outline: "none",
  },

  helpText: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },

  errorBox: {
    padding: "14px",
    borderRadius: "11px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "20px",
  },

  successBox: {
    padding: "14px",
    borderRadius: "11px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "20px",
  },

  successButton: {
    alignSelf: "flex-start",
    marginTop: "5px",
    border: 0,
    background: "transparent",
    color: "#166534",
    fontWeight: "800",
    cursor: "pointer",
    padding: 0,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "28px",
    flexWrap: "wrap",
  },

  cancelButton: {
    padding: "13px 22px",
    borderRadius: "11px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#475569",
    fontWeight: "700",
    cursor: "pointer",
  },

  primaryButton: {
    padding: "13px 24px",
    borderRadius: "11px",
    border: 0,
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#ffffff",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow:
      "0 8px 18px rgba(37,99,235,0.25)",
  },

  infoCard: {
    marginTop: "20px",
    padding: "20px",
    borderRadius: "15px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
  },

  infoIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  infoTitle: {
    margin: 0,
    fontSize: "16px",
  },

  infoText: {
    margin: "5px 0 0",
    color: "#64748b",
    lineHeight: "1.6",
    fontSize: "13px",
  },
};

export default RecruiterPostJob;