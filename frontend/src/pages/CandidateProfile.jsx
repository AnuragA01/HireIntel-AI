import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function CandidateProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      const token = localStorage.getItem("hireintel_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/profile/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json().catch(() => null);

        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          localStorage.removeItem("hireintel_token");
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok) {
          let message = "Unable to load your profile.";

          if (typeof data?.detail === "string") {
            message = data.detail;
          } else if (Array.isArray(data?.detail)) {
            message = data.detail
              .map((item) => item?.msg || "Invalid request.")
              .join(", ");
          }

          throw new Error(message);
        }

        setProfile(data || {});
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        console.error("Profile loading error:", requestError);

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

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

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

    return "";
  };

  const name = getValue(
    profile?.full_name,
    profile?.name,
    profile?.username,
    "Candidate"
  );

  const email = getValue(
    profile?.email,
    "candidate1@example.com"
  );

  const role = getValue(
    profile?.role,
    "candidate"
  );

  const userId = getValue(
    profile?.id,
    profile?.user_id,
    "—"
  );

  const phone = getValue(
    profile?.phone,
    profile?.phone_number,
    "Not added"
  );

  const location = getValue(
    profile?.location,
    profile?.city,
    profile?.address,
    "Not added"
  );

  const education = getValue(
    profile?.education,
    profile?.degree,
    profile?.qualification,
    "Not added"
  );

  const experience = getValue(
    profile?.experience,
    profile?.experience_years,
    "Not added"
  );

  const skillsValue = getValue(
    profile?.skills,
    profile?.technical_skills,
    []
  );

  const skills = Array.isArray(skillsValue)
    ? skillsValue
    : typeof skillsValue === "string"
      ? skillsValue
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

  const bio = getValue(
    profile?.bio,
    profile?.summary,
    profile?.about,
    "Add your professional summary to make your profile more informative."
  );

  const initials = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C";

  const logout = () => {
    localStorage.removeItem("hireintel_token");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.loadingCard}>
          <div style={styles.logoIcon}>H</div>
          <h2>Loading Your Profile...</h2>
          <p style={styles.muted}>
            Fetching your candidate information.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>!</div>
          <h2>Unable to Load Profile</h2>
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
            onClick={() =>
              navigate("/candidate/dashboard")
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
            onClick={() =>
              navigate("/candidate/resumes")
            }
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
            onClick={() =>
              navigate("/candidate/job-matches")
            }
          />

          <NavButton
            label="Profile"
            icon="♙"
            active
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
            onClick={logout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>
              CANDIDATE PROFILE
            </p>

            <h1 style={styles.title}>
              My Profile
            </h1>

            <p style={styles.subtitle}>
              Manage and review the information used
              across your HireIntel AI career journey.
            </p>
          </div>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() =>
              navigate("/candidate/resumes")
            }
          >
            Manage Resume →
          </button>
        </header>

        <section style={styles.profileHero}>
          <div style={styles.avatar}>
            {initials}
          </div>

          <div style={styles.heroInfo}>
            <h2>{name}</h2>

            <p>{email}</p>

            <div style={styles.heroTags}>
              <span style={styles.roleBadge}>
                {String(role).toUpperCase()}
              </span>

              <span style={styles.idBadge}>
                User ID: {userId}
              </span>
            </div>
          </div>
        </section>

        <section style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <p style={styles.cardEyebrow}>
                  PERSONAL INFORMATION
                </p>

                <h2 style={styles.cardTitle}>
                  Contact Details
                </h2>
              </div>

              <div style={styles.cardIcon}>
                ♙
              </div>
            </div>

            <InfoRow
              label="Full Name"
              value={name}
            />

            <InfoRow
              label="Email"
              value={email}
            />

            <InfoRow
              label="Phone"
              value={phone}
            />

            <InfoRow
              label="Location"
              value={location}
            />
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <p style={styles.cardEyebrow}>
                  CAREER INFORMATION
                </p>

                <h2 style={styles.cardTitle}>
                  Professional Details
                </h2>
              </div>

              <div style={styles.cardIcon}>
                ✦
              </div>
            </div>

            <InfoRow
              label="Education"
              value={education}
            />

            <InfoRow
              label="Experience"
              value={experience}
            />

            <InfoRow
              label="Account Role"
              value={role}
            />

            <InfoRow
              label="Candidate ID"
              value={userId}
            />
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.cardEyebrow}>
                PROFESSIONAL SUMMARY
              </p>

              <h2 style={styles.cardTitle}>
                About Me
              </h2>
            </div>

            <div style={styles.cardIcon}>
              ✎
            </div>
          </div>

          <p style={styles.bio}>
            {bio}
          </p>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.cardEyebrow}>
                TECHNICAL PROFILE
              </p>

              <h2 style={styles.cardTitle}>
                Skills
              </h2>
            </div>

            <div style={styles.cardIcon}>
              #
            </div>
          </div>

          {skills.length > 0 ? (
            <div style={styles.skillList}>
              {skills.map((skill) => (
                <span
                  key={String(skill)}
                  style={styles.skillBadge}
                >
                  {String(skill)}
                </span>
              ))}
            </div>
          ) : (
            <div style={styles.emptySkills}>
              <span>✦</span>
              <div>
                <strong>No skills listed yet</strong>
                <p>
                  Your resume skills can be used to
                  improve AI job matching.
                </p>
              </div>
            </div>
          )}
        </section>

        <section style={styles.insightCard}>
          <div style={styles.insightIcon}>
            ✦
          </div>

          <div style={styles.insightContent}>
            <p style={styles.insightLabel}>
              HIREINTEL AI
            </p>

            <h3>
              Keep your career profile updated
            </h3>

            <p>
              Your profile and resume information
              support job discovery, application
              tracking and AI matching. Keep your
              latest education, skills and experience
              available for better career insights.
            </p>
          </div>

          <button
            type="button"
            style={styles.outlineButton}
            onClick={() =>
              navigate("/candidate/job-matches")
            }
          >
            View Job Matches
          </button>
        </section>
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

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>
        {label}
      </span>

      <strong style={styles.infoValue}>
        {String(value)}
      </strong>
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
    marginBottom: "25px",
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
    padding: "13px 20px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  outlineButton: {
    border: "1px solid #dcd7f8",
    background: "#ffffff",
    color: "#6657e8",
    padding: "11px 16px",
    borderRadius: "9px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  profileHero: {
    background:
      "linear-gradient(135deg, #f0edff, #ffffff)",
    border: "1px solid #e2dcff",
    borderRadius: "20px",
    padding: "30px",
    display: "flex",
    alignItems: "center",
    gap: "22px",
    marginBottom: "22px",
  },

  avatar: {
    width: "78px",
    height: "78px",
    borderRadius: "22px",
    background:
      "linear-gradient(135deg, #6657e8, #8b73f1)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
    fontWeight: "800",
    flexShrink: 0,
  },

  heroInfo: {
    flex: 1,
  },


  heroTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
  },

  roleBadge: {
    background: "#6657e8",
    color: "#fff",
    borderRadius: "20px",
    padding: "6px 10px",
    fontSize: "10px",
    fontWeight: "800",
  },

  idBadge: {
    background: "#ffffff",
    color: "#747b8c",
    border: "1px solid #e0dced",
    borderRadius: "20px",
    padding: "6px 10px",
    fontSize: "10px",
    fontWeight: "700",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e8eaf0",
    borderRadius: "18px",
    padding: "25px",
    marginBottom: "20px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "18px",
  },

  cardEyebrow: {
    color: "#6657e8",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1px",
    margin: "0 0 5px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
  },

  cardIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "11px",
    background: "#f0edff",
    color: "#6657e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "14px 0",
    borderBottom: "1px solid #eef0f4",
  },

  infoLabel: {
    color: "#8b91a0",
    fontSize: "12px",
  },

  infoValue: {
    textAlign: "right",
    fontSize: "13px",
    maxWidth: "65%",
    overflowWrap: "anywhere",
  },

  bio: {
    color: "#697182",
    fontSize: "14px",
    lineHeight: "1.8",
    margin: 0,
  },

  skillList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  skillBadge: {
    background: "#f0edff",
    color: "#6657e8",
    padding: "8px 12px",
    borderRadius: "9px",
    fontSize: "12px",
    fontWeight: "700",
  },

  emptySkills: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#f8f7fc",
    borderRadius: "12px",
    padding: "16px",
    color: "#777f90",
  },

  insightCard: {
    background:
      "linear-gradient(135deg, #f4f1ff, #ffffff)",
    border: "1px solid #e2dcff",
    borderRadius: "18px",
    padding: "23px",
    display: "flex",
    alignItems: "center",
    gap: "17px",
  },

  insightIcon: {
    color: "#6657e8",
    fontSize: "25px",
  },

  insightContent: {
    flex: 1,
  },

  insightLabel: {
    color: "#6657e8",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1px",
    margin: "0 0 5px",
  },


  insightText: {
    color: "#747b8c",
    fontSize: "13px",
    lineHeight: "1.6",
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

  errorCard: {
    background: "#fff",
    border: "1px solid #ffd7d7",
    borderRadius: "20px",
    padding: "45px",
    textAlign: "center",
    width: "100%",
    maxWidth: "500px",
  },

  errorIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "#fff0f0",
    color: "#c53f3f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 18px",
    fontWeight: "800",
  },

  muted: {
    color: "#7d8392",
    lineHeight: "1.6",
  },
};

export default CandidateProfile;
