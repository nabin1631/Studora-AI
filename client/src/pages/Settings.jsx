import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";

function Settings() {
  const { user, logout } = useAuth();
  const { mode, toggleTheme, colors: c } = useTheme();

  return (
    <Layout>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <h1 style={{ color: c.text, fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
          Settings
        </h1>

        {/* Profile card */}
        <div style={{
          background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: "14px",
          padding: "20px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "16px",
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: `linear-gradient(135deg, ${c.accent}, ${c.accentSecondary})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "22px", fontWeight: "600", flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p style={{ margin: "0 0 2px", color: c.text, fontSize: "16px", fontWeight: "600" }}>
              {user?.name || "User"}
            </p>
            <p style={{ margin: 0, color: c.textMuted, fontSize: "13px" }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Appearance */}
        <div style={{
          background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: "14px",
          padding: "18px 20px", marginBottom: "16px",
        }}>
          <h3 style={{ color: c.text, fontSize: "14px", fontWeight: "600", margin: "0 0 12px" }}>
            Appearance
          </h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: "0 0 2px", color: c.text, fontSize: "13px", fontWeight: "500" }}>Theme</p>
              <p style={{ margin: 0, color: c.textMuted, fontSize: "12px" }}>
                Currently using {mode === "dark" ? "Dark" : "Light"} mode
              </p>
            </div>
            <button onClick={toggleTheme} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "9px 16px", background: c.bg, border: `1px solid ${c.border}`,
              borderRadius: "10px", color: c.textSecondary, fontSize: "13px",
              fontWeight: "500", cursor: "pointer",
            }}>
              {mode === "dark" ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
            </button>
          </div>
        </div>

        {/* Security */}
        <div style={{
          background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: "14px",
          padding: "18px 20px", marginBottom: "16px",
        }}>
          <h3 style={{ color: c.text, fontSize: "14px", fontWeight: "600", margin: "0 0 12px" }}>
            Security
          </h3>
          <button style={{
            padding: "9px 16px", background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: "10px", color: c.textSecondary, fontSize: "13px",
            fontWeight: "500", cursor: "pointer",
          }}>
            Change Password
          </button>
        </div>

        {/* Logout */}
        <button onClick={logout} style={{
          width: "100%", padding: "12px", background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px",
          color: "#EF4444", fontSize: "14px", fontWeight: "600", cursor: "pointer",
        }}>
          ⏻ Logout
        </button>
      </div>
    </Layout>
  );
}

export default Settings;