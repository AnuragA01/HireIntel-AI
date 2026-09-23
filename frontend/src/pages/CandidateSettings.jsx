import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CandidateSettings() {
  const navigate = useNavigate();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("hireintel_token");
    navigate("/login", { replace: true });
  };

  const handleSave = () => {
    alert("Settings saved successfully.");
  };

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logo}>H</div>
          <span>HireIntel AI</span>
        </div>

        <div style={styles.sidebarTitle}>CANDIDATE</div>

        <button
          type="button"
          style={styles.navItem}
          onClick={() => navigate("/candidate/dashboard")}
        >
          ▦ <span>Dashboard</span>
        </button>

        <button
          type="button"
          style={styles.navItem}
          onClick={() => navigate("/candidate/jobs")}
        >
          ⌕ <span>Find Jobs</span>
        </button>

        <button
          type="button"
          style={styles.navItem}
          onClick={() => navigate("/candidate/resumes")}
        >
          ▤ <span>My Resumes</span>
        </button>

        <button
          type="button"
          style={styles.navItem}
          onClick={() => navigate("/candidate/applications")}
        >
          ▣ <span>Applications</span>
        </button>

        <button
          type="button"
          style={styles.navItem}
          onClick={() => navigate("/candidate/job-matches")}
        >
          ✦ <span>Job Matches</span>
        </button>

        <button
          type="button"
          style={styles.navItem}
          onClick={() => navigate("/candidate/profile")}
        >
          ♟ <span>Profile</span>
        </button>

        <div style={styles.sidebarBottom}>
          <button type="button" style={styles.activeNavItem}>
            ⚙ <span>Settings</span>
          </button>

          <button
            type="button"
            style={styles.logoutItem}
            onClick={handleLogout}
          >
            ↪ <span>Logout</span>
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>ACCOUNT SETTINGS</div>
            <h1 style={styles.title}>Settings</h1>
            <p style={styles.subtitle}>
              Manage your HireIntel AI account and application preferences.
            </p>
          </div>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => navigate("/candidate/dashboard")}
          >
            ← Dashboard
          </button>
        </div>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.sectionLabel}>ACCOUNT</div>
              <h2 style={styles.sectionTitle}>Account Information</h2>
            </div>

            <div style={styles.iconBox}>♟</div>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.label}>Account Role</span>
              <strong>Candidate</strong>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.label}>Email Address</span>
              <strong>candidate1@example.com</strong>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.label}>Account Status</span>
              <strong style={styles.successText}>Active</strong>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.label}>Platform</span>
              <strong>HireIntel AI</strong>
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.sectionLabel}>NOTIFICATIONS</div>
              <h2 style={styles.sectionTitle}>Notification Preferences</h2>
            </div>

            <div style={styles.iconBox}>🔔</div>
          </div>

          <SettingRow
            title="Email Notifications"
            description="Receive important account and recruitment notifications."
            enabled={emailNotifications}
            onChange={() =>
              setEmailNotifications((current) => !current)
            }
          />

          <SettingRow
            title="Job Alerts"
            description="Receive alerts when new jobs match your profile."
            enabled={jobAlerts}
            onChange={() => setJobAlerts((current) => !current)}
          />

          <SettingRow
            title="Application Updates"
            description="Get notified when your application status changes."
            enabled={applicationUpdates}
            onChange={() =>
              setApplicationUpdates((current) => !current)
            }
          />
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.sectionLabel}>PREFERENCES</div>
              <h2 style={styles.sectionTitle}>Application Preferences</h2>
            </div>

            <div style={styles.iconBox}>✦</div>
          </div>

          <SettingRow
            title="Dark Mode"
            description="Use a darker interface for HireIntel AI."
            enabled={darkMode}
            onChange={() => setDarkMode((current) => !current)}
          />
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.sectionLabel}>SECURITY</div>
              <h2 style={styles.sectionTitle}>Account Security</h2>
            </div>

            <div style={styles.iconBox}>🔐</div>
          </div>

          <div style={styles.securityRow}>
            <div>
              <h3 style={styles.securityTitle}>Password</h3>
              <p style={styles.securityText}>
                Keep your account secure by using a strong password.
              </p>
            </div>

            <button
              type="button"
              style={styles.outlineButton}
              onClick={() =>
                alert(
                  "Password change functionality can be connected to the backend next."
                )
              }
            >
              Change Password
            </button>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.sectionLabel}>QUICK ACTIONS</div>
              <h2 style={styles.sectionTitle}>Manage Your Career</h2>
            </div>

            <div style={styles.iconBox}>⚡</div>
          </div>

          <div style={styles.actionGrid}>
            <button
              type="button"
              style={styles.actionButton}
              onClick={() => navigate("/candidate/profile")}
            >
              <strong>My Profile</strong>
              <span>Review your candidate information →</span>
            </button>

            <button
              type="button"
              style={styles.actionButton}
              onClick={() => navigate("/candidate/resumes")}
            >
              <strong>Manage Resumes</strong>
              <span>Upload and manage your resumes →</span>
            </button>

            <button
              type="button"
              style={styles.actionButton}
              onClick={() => navigate("/candidate/job-matches")}
            >
              <strong>AI Job Matches</strong>
              <span>Explore jobs matched to your resume →</span>
            </button>

            <button
              type="button"
              style={styles.actionButton}
              onClick={() => navigate("/candidate/applications")}
            >
              <strong>Applications</strong>
              <span>Track your recruitment progress →</span>
            </button>
          </div>
        </section>

        <div style={styles.bottomActions}>
          <button
            type="button"
            style={styles.saveButton}
            onClick={handleSave}
          >
            Save Preferences
          </button>

          <button
            type="button"
            style={styles.dangerButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}

function SettingRow({ title, description, enabled, onChange }) {
  return (
    <div style={styles.settingRow}>
      <div>
        <h3 style={styles.settingTitle}>{title}</h3>
        <p style={styles.settingDescription}>{description}</p>
      </div>

      <button
        type="button"
        onClick={onChange}
        style={{
          ...styles.toggle,
          background: enabled ? "#6652e8" : "#d8dbea",
        }}
        aria-label={`Toggle ${title}`}
      >
        <span
          style={{
            ...styles.toggleCircle,
            transform: enabled
              ? "translateX(22px)"
              : "translateX(2px)",
          }}
        />
      </button>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background: "#f7f8fc",
    color: "#11182b",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  sidebar: {
    width: "265px",
    minHeight: "100vh",
    background: "#ffffff",
    borderRight: "1px solid #e7e8f0",
    padding: "32px 20px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "24px",
    fontWeight: "800",
    marginBottom: "60px",
    color: "#11182b",
  },

  logo: {
    width: "48px",
    height: "48px",
    borderRadius: "15px",
    background: "#7057e8",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    fontWeight: "800",
  },

  sidebarTitle: {
    color: "#8990a5",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    marginBottom: "16px",
    paddingLeft: "12px",
  },

  navItem: {
    border: "none",
    background: "transparent",
    padding: "15px 14px",
    marginBottom: "6px",
    borderRadius: "12px",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    textAlign: "left",
    color: "#53607a",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },

  activeNavItem: {
    border: "none",
    background: "#eeeaff",
    color: "#6652e8",
    padding: "15px 14px",
    marginBottom: "8px",
    borderRadius: "12px",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    textAlign: "left",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    width: "100%",
  },

  sidebarBottom: {
    marginTop: "auto",
    borderTop: "1px solid #ececf2",
    paddingTop: "25px",
  },

  logoutItem: {
    border: "none",
    background: "transparent",
    color: "#e04b4b",
    padding: "15px 14px",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
  },

  main: {
    marginLeft: "265px",
    width: "calc(100% - 265px)",
    padding: "55px 48px",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "35px",
    gap: "25px",
  },

  eyebrow: {
    color: "#6652e8",
    fontSize: "14px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    marginBottom: "10px",
  },

  title: {
    fontSize: "42px",
    margin: 0,
    fontWeight: "800",
  },

  subtitle: {
    color: "#68728a",
    fontSize: "17px",
    marginTop: "12px",
  },

  primaryButton: {
    border: "none",
    background: "#6652e8",
    color: "#ffffff",
    padding: "15px 23px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e6ef",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "22px",
    boxSizing: "border-box",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  sectionLabel: {
    color: "#6652e8",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1.4px",
    marginBottom: "7px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "24px",
  },

  iconBox: {
    width: "42px",
    height: "42px",
    borderRadius: "13px",
    background: "#f0edff",
    color: "#6652e8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 30px",
  },

  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "19px 0",
    borderBottom: "1px solid #ececf2",
    gap: "20px",
  },

  label: {
    color: "#7c8498",
  },

  successText: {
    color: "#159447",
  },

  settingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "30px",
    padding: "20px 0",
    borderTop: "1px solid #ececf2",
  },

  settingTitle: {
    margin: "0 0 6px",
    fontSize: "17px",
  },

  settingDescription: {
    margin: 0,
    color: "#7a8398",
    fontSize: "14px",
  },

  toggle: {
    width: "48px",
    height: "27px",
    border: "none",
    borderRadius: "20px",
    padding: 0,
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 0.2s",
  },

  toggleCircle: {
    display: "block",
    width: "23px",
    height: "23px",
    marginTop: "2px",
    borderRadius: "50%",
    background: "#ffffff",
    transition: "transform 0.2s",
  },

  securityRow: {
    borderTop: "1px solid #ececf2",
    paddingTop: "22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  securityTitle: {
    margin: "0 0 7px",
  },

  securityText: {
    margin: 0,
    color: "#7a8398",
  },

  outlineButton: {
    background: "#ffffff",
    border: "1px solid #dcd9f5",
    color: "#6652e8",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },

  actionButton: {
    border: "1px solid #e5e5ef",
    background: "#fafaff",
    borderRadius: "14px",
    padding: "20px",
    textAlign: "left",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    color: "#11182b",
  },

  bottomActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "40px",
  },

  saveButton: {
    border: "none",
    background: "#6652e8",
    color: "#ffffff",
    padding: "15px 25px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  dangerButton: {
    border: "1px solid #f0caca",
    background: "#fff7f7",
    color: "#dc4242",
    padding: "15px 25px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default CandidateSettings;
