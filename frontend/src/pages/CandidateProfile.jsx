import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

function CandidateProfile() {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    location: "",
    education: "",
    experience: "",
    skills: "",
    bio: "",
  });

  // ============================================================
  // LOAD PROFILE
  // ============================================================

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

        // ======================================================
        // UNAUTHORIZED
        // ======================================================

        if (response.status === 401) {
          localStorage.removeItem("hireintel_token");
          navigate("/login", { replace: true });
          return;
        }

        // ======================================================
        // API ERROR
        // ======================================================

        if (!response.ok) {
          let message = "Unable to load your profile.";

          if (typeof data?.detail === "string") {
            message = data.detail;
          } else if (Array.isArray(data?.detail)) {
            message = data.detail
              .map(
                (item) =>
                  item?.msg || "Invalid request."
              )
              .join(", ");
          }

          throw new Error(message);
        }

        // ======================================================
        // IMPORTANT
        //
        // Backend response structure:
        //
        // {
        //   profile: {...},
        //   statistics: {...},
        //   latest_resume: {...},
        //   best_job_match: {...}
        // }
        // ======================================================

        setProfileData(data || {});
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Profile loading error:",
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

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // ============================================================
  // SAFE VALUE HELPER
  // ============================================================

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

  // ============================================================
  // BACKEND DATA
  // ============================================================

  const userProfile = profileData?.profile || {};

  const statistics =
    profileData?.statistics || {};

  const latestResume =
    profileData?.latest_resume || null;

  const bestJobMatch =
    profileData?.best_job_match || null;

  // ============================================================
  // USER INFORMATION
  // ============================================================

  const name = getValue(
    userProfile.full_name,
    "Candidate"
  );

  const email = getValue(
    userProfile.email,
    "Not available"
  );

  const role = getValue(
    userProfile.role,
    "candidate"
  );

  const userId = getValue(
    userProfile.id,
    "—"
  );

  const isActive =
    userProfile.is_active === false
      ? false
      : true;

  // ============================================================
  // PROFILE INFORMATION
  // ============================================================

  const phone = getValue(
    userProfile.phone,
    "Not added"
  );

  const location = getValue(
    userProfile.location,
    "Not added"
  );

  const education = getValue(
    userProfile.education,
    "Not added"
  );

  const experience = getValue(
    userProfile.experience,
    "Not added"
  );

  const skillsValue = getValue(
    userProfile.skills,
    ""
  );

  const skills =
    Array.isArray(skillsValue)
      ? skillsValue
      : typeof skillsValue === "string"
        ? skillsValue
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [];

  const bio = getValue(
    userProfile.bio,
    "Add a professional summary to tell recruiters about your background and career goals."
  );

  // ============================================================
  // INITIALS
  // ============================================================

  const initials =
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]?.toUpperCase()
      )
      .join("") || "C";

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalResumes = getValue(
    statistics.total_resumes,
    0
  );

  const totalJobs = getValue(
    statistics.total_jobs,
    0
  );

  const totalMatches = getValue(
    statistics.total_matches,
    0
  );

  const latestResumeScore = getValue(
    statistics.latest_resume_score,
    latestResume?.resume_score,
    "Not analyzed"
  );

  // ============================================================
  // EDIT PROFILE
  // ============================================================

  const openEditProfile = () => {
    setFormData({
      full_name: userProfile.full_name || "",
      phone: userProfile.phone || "",
      location: userProfile.location || "",
      education: userProfile.education || "",
      experience: userProfile.experience || "",
      skills: userProfile.skills || "",
      bio: userProfile.bio || "",
    });

    setSaveMessage("");
    setError("");
    setIsEditing(true);
  };

  const closeEditProfile = () => {
    if (!saving) {
      setIsEditing(false);
      setSaveMessage("");
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("hireintel_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (!formData.full_name.trim()) {
      setSaveMessage("Full name is required.");
      return;
    }

    try {
      setSaving(true);
      setSaveMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/profile/me`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            full_name: formData.full_name.trim(),
            phone: formData.phone.trim(),
            location: formData.location.trim(),
            education: formData.education.trim(),
            experience: formData.experience.trim(),
            skills: formData.skills.trim(),
            bio: formData.bio.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        localStorage.removeItem("hireintel_token");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        let message = "Unable to update your profile.";

        if (typeof data?.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data?.detail)) {
          message = data.detail
            .map(
              (item) =>
                item?.msg || "Invalid request."
            )
            .join(", ");
        }

        throw new Error(message);
      }

      const updatedProfile =
        data?.profile || {
          ...userProfile,
          ...formData,
        };

      setProfileData((previous) => ({
        ...(previous || {}),
        profile: updatedProfile,
      }));

      setSaveMessage(
        "Profile updated successfully."
      );

      setTimeout(() => {
        setIsEditing(false);
        setSaveMessage("");
      }, 900);
    } catch (requestError) {
      console.error(
        "Profile update error:",
        requestError
      );

      setSaveMessage(
        requestError?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    localStorage.removeItem(
      "hireintel_token"
    );

    navigate("/login", {
      replace: true,
    });
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.loadingCard}>
          <div style={styles.logoIcon}>
            H
          </div>

          <h2>
            Loading Your Profile...
          </h2>

          <p style={styles.muted}>
            Fetching your candidate information.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div style={styles.centerPage}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>
            !
          </div>

          <h2>
            Unable to Load Profile
          </h2>

          <p style={styles.muted}>
            {error}
          </p>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div style={styles.page}>

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

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
            onClick={() =>
              navigate(
                "/candidate/resumes"
              )
            }
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
            active
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
            onClick={logout}
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
              CANDIDATE PROFILE
            </p>

            <h1 style={styles.title}>
              My Profile
            </h1>

            <p style={styles.subtitle}>
              Manage and review the information
              used across your HireIntel AI
              career journey.
            </p>

          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              style={styles.outlineButton}
              onClick={openEditProfile}
            >
              ✎ Edit Profile
            </button>

            <button
              type="button"
              style={styles.primaryButton}
              onClick={() =>
                navigate(
                  "/candidate/resumes"
                )
              }
            >
              Manage Resume →
            </button>
          </div>

        </header>

        {/* ====================================================
            PROFILE HERO
        ==================================================== */}

        <section style={styles.profileHero}>

          <div style={styles.avatar}>
            {initials}
          </div>

          <div style={styles.heroInfo}>

            <div style={styles.heroTopRow}>
              <div>
                <h2 style={styles.heroName}>
                  {name}
                </h2>

                <p style={styles.heroEmail}>
                  {email}
                </p>
              </div>

              <button
                type="button"
                style={styles.heroEditButton}
                onClick={openEditProfile}
              >
                Edit
              </button>
            </div>

            <div style={styles.heroTags}>

              <span style={styles.roleBadge}>
                {String(role).toUpperCase()}
              </span>

              <span style={styles.idBadge}>
                User ID: {userId}
              </span>

              <span
                style={
                  isActive
                    ? styles.activeBadge
                    : styles.inactiveBadge
                }
              >
                {isActive
                  ? "ACTIVE"
                  : "INACTIVE"}
              </span>

            </div>

          </div>
        </section>

        {/* ====================================================
            STATISTICS
        ==================================================== */}

        <section style={styles.statsGrid}>

          <StatCard
            label="Total Resumes"
            value={totalResumes}
            icon="▤"
          />

          <StatCard
            label="Job Matches"
            value={totalMatches}
            icon="✦"
          />

          <StatCard
            label="Jobs"
            value={totalJobs}
            icon="▣"
          />

          <StatCard
            label="Resume Score"
            value={
              latestResumeScore ===
              "Not analyzed"
                ? "—"
                : `${latestResumeScore}%`
            }
            icon="◎"
          />

        </section>

        {/* ====================================================
            INFORMATION GRID
        ==================================================== */}

        <section style={styles.grid}>

          {/* PERSONAL INFORMATION */}

          <div style={styles.card}>

            <div style={styles.cardHeader}>

              <div>

                <p
                  style={
                    styles.cardEyebrow
                  }
                >
                  PERSONAL INFORMATION
                </p>

                <h2
                  style={styles.cardTitle}
                >
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

          {/* CAREER INFORMATION */}

          <div style={styles.card}>

            <div style={styles.cardHeader}>

              <div>

                <p
                  style={
                    styles.cardEyebrow
                  }
                >
                  CAREER INFORMATION
                </p>

                <h2
                  style={styles.cardTitle}
                >
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

        {/* ====================================================
            LATEST RESUME
        ==================================================== */}

        <section style={styles.card}>

          <div style={styles.cardHeader}>

            <div>

              <p
                style={
                  styles.cardEyebrow
                }
              >
                RESUME INFORMATION
              </p>

              <h2
                style={styles.cardTitle}
              >
                Latest Resume
              </h2>

            </div>

            <div style={styles.cardIcon}>
              📄
            </div>

          </div>

          {latestResume ? (

            <div style={styles.resumeBox}>

              <div style={styles.resumeIcon}>
                📄
              </div>

              <div
                style={styles.resumeInfo}
              >

                <strong>
                  {latestResume.filename ||
                    "Resume"}
                </strong>

                <span>
                  Resume ID:{" "}
                  {latestResume.resume_id ??
                    "—"}
                </span>

                <span>
                  File Type:{" "}
                  {latestResume.file_type ||
                    "—"}
                </span>

              </div>

              <div
                style={styles.resumeScore}
              >

                <span>
                  Resume Score
                </span>

                <strong>
                  {latestResumeScore ===
                  "Not analyzed"
                    ? "Not analyzed"
                    : `${latestResumeScore}%`}
                </strong>

              </div>

            </div>

          ) : (

            <div style={styles.emptyBox}>

              <strong>
                No resume uploaded
              </strong>

              <p>
                Upload a resume to enable
                resume analysis and AI job
                matching.
              </p>

              <button
                type="button"
                style={styles.outlineButton}
                onClick={() =>
                  navigate(
                    "/candidate/resumes"
                  )
                }
              >
                Upload Resume
              </button>

            </div>

          )}

        </section>

        {/* ====================================================
            BEST JOB MATCH
        ==================================================== */}

        <section style={styles.card}>

          <div style={styles.cardHeader}>

            <div>

              <p
                style={
                  styles.cardEyebrow
                }
              >
                AI CAREER INTELLIGENCE
              </p>

              <h2
                style={styles.cardTitle}
              >
                Best Job Match
              </h2>

            </div>

            <div style={styles.cardIcon}>
              ✦
            </div>

          </div>

          {bestJobMatch ? (

            <div style={styles.matchBox}>

              <div>

                <p
                  style={
                    styles.matchCompany
                  }
                >
                  {bestJobMatch.company_name ||
                    "Company"}
                </p>

                <h3
                  style={
                    styles.matchTitle
                  }
                >
                  {bestJobMatch.job_title ||
                    "Job"}
                </h3>

                <p
                  style={
                    styles.matchId
                  }
                >
                  Job ID:{" "}
                  {bestJobMatch.job_id ??
                    "—"}
                </p>

              </div>

              <div
                style={styles.matchScore}
              >

                <span>
                  AI Match
                </span>

                <strong>
                  {bestJobMatch.match_score !=
                  null
                    ? `${Number(
                        bestJobMatch.match_score
                      ).toFixed(2)}%`
                    : "—"}
                </strong>

              </div>

              <div
                style={
                  styles.experienceScore
                }
              >

                <span>
                  Experience Match
                </span>

                <strong>
                  {bestJobMatch.experience_match !=
                  null
                    ? `${Number(
                        bestJobMatch.experience_match
                      ).toFixed(0)}%`
                    : "—"}
                </strong>

              </div>

              <button
                type="button"
                style={styles.outlineButton}
                onClick={() =>
                  navigate(
                    `/candidate/jobs/${bestJobMatch.job_id}`
                  )
                }
              >
                View Job
              </button>

            </div>

          ) : (

            <div style={styles.emptyBox}>

              <strong>
                No job matches yet
              </strong>

              <p>
                Upload and analyze your resume
                to generate AI-powered job
                matches.
              </p>

              <button
                type="button"
                style={styles.outlineButton}
                onClick={() =>
                  navigate(
                    "/candidate/jobs"
                  )
                }
              >
                Find Jobs
              </button>

            </div>

          )}

        </section>

        {/* ====================================================
            PROFESSIONAL SUMMARY
        ==================================================== */}

        <section style={styles.card}>

          <div style={styles.cardHeader}>

            <div>

              <p
                style={
                  styles.cardEyebrow
                }
              >
                PROFESSIONAL SUMMARY
              </p>

              <h2
                style={styles.cardTitle}
              >
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

        {/* ====================================================
            SKILLS
        ==================================================== */}

        <section style={styles.card}>

          <div style={styles.cardHeader}>

            <div>

              <p
                style={
                  styles.cardEyebrow
                }
              >
                TECHNICAL PROFILE
              </p>

              <h2
                style={styles.cardTitle}
              >
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

                <strong>
                  No profile skills added yet
                </strong>

                <p>
                  Your resume skills are
                  already used by HireIntel AI
                  for job matching.
                </p>

              </div>

            </div>

          )}

        </section>

        {/* ====================================================
            FINAL INSIGHT
        ==================================================== */}

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

            <p style={styles.insightText}>
              Your profile, resume and AI
              matching information work
              together to support job
              discovery and application
              tracking.
            </p>

          </div>

          <button
            type="button"
            style={styles.outlineButton}
            onClick={() =>
              navigate(
                "/candidate/job-matches"
              )
            }
          >
            View Job Matches
          </button>

        </section>

        {/* ====================================================
            EDIT PROFILE MODAL
        ==================================================== */}

        {isEditing && (
          <div
            style={styles.modalOverlay}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeEditProfile();
              }
            }}
          >
            <div style={styles.modalCard}>
              <div style={styles.modalHeader}>
                <div>
                  <p style={styles.cardEyebrow}>
                    ACCOUNT SETTINGS
                  </p>

                  <h2 style={styles.modalTitle}>
                    Edit Profile
                  </h2>

                  <p style={styles.modalSubtitle}>
                    Keep your candidate information updated for recruiters and HireIntel AI matching.
                  </p>
                </div>

                <button
                  type="button"
                  style={styles.closeButton}
                  onClick={closeEditProfile}
                  disabled={saving}
                >
                  ×
                </button>
              </div>

              <form onSubmit={saveProfile}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Full Name *
                    </label>
                    <input
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleFormChange}
                      style={styles.formInput}
                      placeholder="Enter your full name"
                      maxLength={100}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Email
                    </label>
                    <input
                      value={email}
                      style={styles.formInputDisabled}
                      disabled
                    />
                    <small style={styles.formHint}>
                      Email is managed by your account.
                    </small>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Phone
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      style={styles.formInput}
                      placeholder="+91 9876543210"
                      maxLength={20}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Location
                    </label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleFormChange}
                      style={styles.formInput}
                      placeholder="Bangalore, Karnataka"
                      maxLength={150}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Education
                    </label>
                    <input
                      name="education"
                      value={formData.education}
                      onChange={handleFormChange}
                      style={styles.formInput}
                      placeholder="B.Tech Computer Science Engineering"
                      maxLength={200}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Experience
                    </label>
                    <input
                      name="experience"
                      value={formData.experience}
                      onChange={handleFormChange}
                      style={styles.formInput}
                      placeholder="Fresher / 0-1 years"
                      maxLength={100}
                    />
                  </div>

                  <div style={styles.formGroupFull}>
                    <label style={styles.formLabel}>
                      Skills
                    </label>
                    <input
                      name="skills"
                      value={formData.skills}
                      onChange={handleFormChange}
                      style={styles.formInput}
                      placeholder="Python, Java, React.js, Node.js, SQL, MySQL, FastAPI, Git"
                    />
                    <small style={styles.formHint}>
                      Separate skills with commas.
                    </small>
                  </div>

                  <div style={styles.formGroupFull}>
                    <label style={styles.formLabel}>
                      Professional Summary
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleFormChange}
                      style={styles.formTextarea}
                      placeholder="Write a short professional summary."
                      rows={5}
                    />
                  </div>
                </div>

                {saveMessage && (
                  <div
                    style={
                      saveMessage.includes("successfully")
                        ? styles.successMessage
                        : styles.formError
                    }
                  >
                    {saveMessage}
                  </div>
                )}

                <div style={styles.modalFooter}>
                  <button
                    type="button"
                    style={styles.cancelButton}
                    onClick={closeEditProfile}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ============================================================
// NAV BUTTON
// ============================================================

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

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>

      <span style={styles.infoLabel}>
        {label}
      </span>

      <strong style={styles.infoValue}>
        {String(value ?? "—")}
      </strong>

    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  icon,
}) {
  return (
    <div style={styles.statCard}>

      <div style={styles.statIcon}>
        {icon}
      </div>

      <div>

        <p style={styles.statLabel}>
          {label}
        </p>

        <strong style={styles.statValue}>
          {value}
        </strong>

      </div>

    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

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
    border:
      "1px solid #dcd7f8",
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
    border:
      "1px solid #e2dcff",
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

  heroName: {
    margin: "0 0 6px",
    fontSize: "25px",
  },

  heroEmail: {
    margin: 0,
    color: "#747b8c",
    fontSize: "14px",
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
    border:
      "1px solid #e0dced",
    borderRadius: "20px",
    padding: "6px 10px",
    fontSize: "10px",
    fontWeight: "700",
  },

  activeBadge: {
    background: "#e9f9ef",
    color: "#21894e",
    borderRadius: "20px",
    padding: "6px 10px",
    fontSize: "10px",
    fontWeight: "800",
  },

  inactiveBadge: {
    background: "#fff0f0",
    color: "#c53f3f",
    borderRadius: "20px",
    padding: "6px 10px",
    fontSize: "10px",
    fontWeight: "800",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "22px",
  },

  statCard: {
    background: "#ffffff",
    border:
      "1px solid #e8eaf0",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  statIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "13px",
    background: "#f0edff",
    color: "#6657e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "18px",
  },

  statLabel: {
    margin: "0 0 5px",
    color: "#858b9b",
    fontSize: "12px",
  },

  statValue: {
    fontSize: "24px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#ffffff",
    border:
      "1px solid #e8eaf0",
    borderRadius: "18px",
    padding: "25px",
    marginBottom: "20px",
  },

  cardHeader: {
    display: "flex",
    justifyContent:
      "space-between",
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
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "14px 0",
    borderBottom:
      "1px solid #eef0f4",
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

  resumeBox: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px",
    background: "#f8f7fc",
    borderRadius: "14px",
  },

  resumeIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#f0edff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  resumeInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },

  resumeInfoStrong: {
    fontSize: "14px",
  },

  resumeInfoSpan: {
    fontSize: "12px",
    color: "#818899",
  },

  resumeScore: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "4px",
  },

  resumeScoreSpan: {
    fontSize: "11px",
    color: "#858b9b",
  },

  resumeScoreStrong: {
    color: "#6657e8",
    fontSize: "20px",
  },

  emptyBox: {
    background: "#f8f7fc",
    borderRadius: "14px",
    padding: "25px",
  },

  emptyBoxP: {
    color: "#747b8c",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  matchBox: {
    background:
      "linear-gradient(135deg, #f5f2ff, #ffffff)",
    border:
      "1px solid #e2dcff",
    borderRadius: "14px",
    padding: "20px",
    display: "grid",
    gridTemplateColumns:
      "1fr auto auto auto",
    alignItems: "center",
    gap: "25px",
  },

  matchCompany: {
    margin: "0 0 4px",
    color: "#7b8292",
    fontSize: "12px",
  },

  matchTitle: {
    margin: 0,
    fontSize: "20px",
  },

  matchId: {
    margin: "5px 0 0",
    color: "#858b9b",
    fontSize: "11px",
  },

  matchScore: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  experienceScore: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
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
    border:
      "1px solid #e2dcff",
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
    margin: 0,
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  heroTopRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
  },

  heroEditButton: {
    border: "1px solid #dcd7f8",
    background: "#ffffff",
    color: "#6657e8",
    padding: "8px 14px",
    borderRadius: "9px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(20, 24, 38, 0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: 1000,
    overflowY: "auto",
    boxSizing: "border-box",
  },

  modalCard: {
    width: "100%",
    maxWidth: "820px",
    maxHeight: "92vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "22px",
    padding: "28px",
    boxSizing: "border-box",
    boxShadow: "0 24px 80px rgba(28, 32, 48, 0.22)",
  },

  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "24px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "26px",
    fontWeight: "800",
  },

  modalSubtitle: {
    margin: "8px 0 0",
    color: "#747b8c",
    fontSize: "13px",
    lineHeight: "1.6",
    maxWidth: "620px",
  },

  closeButton: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    border: "1px solid #e4e6ec",
    background: "#ffffff",
    color: "#5f6676",
    fontSize: "24px",
    lineHeight: 1,
    cursor: "pointer",
    flexShrink: 0,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  formGroupFull: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    gridColumn: "1 / -1",
  },

  formLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#41495a",
  },

  formInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dfe2ea",
    borderRadius: "10px",
    padding: "12px 13px",
    fontSize: "13px",
    color: "#172033",
    background: "#ffffff",
    outline: "none",
  },

  formInputDisabled: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #e8eaf0",
    borderRadius: "10px",
    padding: "12px 13px",
    fontSize: "13px",
    color: "#858b9b",
    background: "#f7f8fb",
    outline: "none",
  },

  formTextarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dfe2ea",
    borderRadius: "10px",
    padding: "12px 13px",
    fontSize: "13px",
    color: "#172033",
    background: "#ffffff",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: "1.6",
  },

  formHint: {
    color: "#8a91a0",
    fontSize: "11px",
  },

  successMessage: {
    marginTop: "18px",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "#eaf8ef",
    color: "#21894e",
    fontSize: "13px",
    fontWeight: "700",
  },

  formError: {
    marginTop: "18px",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "#fff1f1",
    color: "#c53f3f",
    fontSize: "13px",
    fontWeight: "700",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "24px",
    paddingTop: "18px",
    borderTop: "1px solid #eef0f4",
  },

  cancelButton: {
    border: "1px solid #dfe2ea",
    background: "#ffffff",
    color: "#5f6676",
    padding: "12px 18px",
    borderRadius: "10px",
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
    border:
      "1px solid #e8eaf0",
    borderRadius: "20px",
    padding: "50px",
    textAlign: "center",
    width: "100%",
    maxWidth: "500px",
  },

  errorCard: {
    background: "#fff",
    border:
      "1px solid #ffd7d7",
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