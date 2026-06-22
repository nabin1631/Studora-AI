import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Dashboard() {
  const { user, logout } = useAuth();
  const { colors: c } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1
            style={{
              color: c.text,
              fontSize: "22px",
              fontWeight: "700",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <img
              src="/logo.png"
              alt="Studora AI"
              style={{ width: "44px", height: "44px", objectFit: "contain" }}
            />

            Welcome back, {user?.name}! 👋
          </h1>

          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              background: c.bgCard,
              border: `1px solid ${c.border}`,
              color: c.text,
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>

        <p
          style={{
            color: c.textMuted,
            fontSize: "14px",
            marginBottom: "24px"
          }}
        >
          Here's what's happening with your studies today.
        </p>


        <div
          style={{
            background: c.bgCard,
            border: `1px solid ${c.border}`,
            borderRadius: "14px",
            padding: "40px",
            textAlign: "center",
            color: c.textMuted,
          }}
        >
          More dashboard modules coming soon — AI Tutor, Notes, Planner, Quiz Arena, Analytics.
        </div>

      </div>
    </Layout>
  );
}

export default Dashboard;