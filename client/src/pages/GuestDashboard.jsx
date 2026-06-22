import { useNavigate } from "react-router-dom";
import { useGuest } from "../context/GuestContext";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import AuthModal from "../components/AuthModal";

const FEATURES = [
  { icon: "🤖", title: "AI Tutor", desc: "Ask any study question and get instant, detailed explanations from your personal AI tutor.", color: "#7C6CF0" },
  { icon: "📝", title: "Smart Notes", desc: "Create rich-text notes with formatting, highlights, checklists, and subject organization.", color: "#06B6D4" },
  { icon: "📄", title: "PDF AI", desc: "Upload any PDF and ask questions about it. Summarize chapters, extract key points instantly.", color: "#10B981" },
  { icon: "📅", title: "Study Planner", desc: "Plan your study sessions, set deadlines, track progress with a smart daily planner.", color: "#F59E0B" },
  { icon: "🎮", title: "Quiz Arena", desc: "Test your knowledge with AI-generated quizzes. Earn points, badges, and climb leaderboards.", color: "#EF4444" },
  { icon: "📊", title: "Analytics", desc: "Track your study hours, quiz scores, and weak areas. Get AI-powered improvement tips.", color: "#8B5CF6" },
];

function GuestDashboard() {
  const { colors: c } = useTheme();
  const { promptAuth } = useGuest();
  const navigate = useNavigate();

  return (
    <Layout isGuest>
      <AuthModal />
      <style>{`
        .feature-card {
          background: ${c.bgCard}; border: 1px solid ${c.border}; border-radius: 16px;
          padding: 20px; cursor: pointer; transition: all .2s;
        }
        .feature-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
        .try-btn {
          padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all .15s; border: none;
          background: ${c.bg}; color: ${c.textSecondary}; border: 1px solid ${c.border};
        }
        .try-btn:hover { background: ${c.accent}; color: #fff; border-color: ${c.accent}; }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Hero section */}
        <div style={{
          background: `linear-gradient(135deg, ${c.accent}15, #33C9E815)`,
          border: `1px solid ${c.accent}25`,
          borderRadius: "20px", padding: "36px 32px",
          marginBottom: "28px", textAlign: "center",
        }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🧠</div>
          <h1 style={{ color: c.text, fontSize: "26px", fontWeight: "800", margin: "0 0 10px", letterSpacing: "-.02em" }}>
            Welcome to STUDORA AI
          </h1>
          <p style={{ color: c.textMuted, fontSize: "15px", margin: "0 0 24px", lineHeight: "1.6", maxWidth: "500px", marginLeft: "auto", marginRight: "auto" }}>
            Your personal AI-powered study companion. Smart notes, AI tutor, quizzes, planner — everything you need to study smarter.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/signup")}
              style={{
                padding: "12px 28px", background: `linear-gradient(135deg, ${c.accent}, #5B4FE0)`,
                color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px",
                fontWeight: "600", cursor: "pointer", boxShadow: `0 4px 16px ${c.accent}44`,
              }}
            >
              🚀 Get started free
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "12px 28px", background: c.bgCard, color: c.text,
                border: `1px solid ${c.border}`, borderRadius: "10px", fontSize: "14px",
                fontWeight: "600", cursor: "pointer",
              }}
            >
              Login
            </button>
          </div>
        </div>

        {/* Features grid */}
        <h2 style={{ color: c.text, fontSize: "16px", fontWeight: "700", margin: "0 0 16px" }}>
          Everything you need to study smarter
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px", marginBottom: "28px" }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card" onClick={promptAuth}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "10px", background: `${f.color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: c.text }}>{f.title}</h3>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: "13px", color: c.textMuted, lineHeight: "1.6" }}>{f.desc}</p>
              <button className="try-btn" onClick={(e) => { e.stopPropagation(); promptAuth(); }}>
                Try it →
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{
          background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: "16px",
          padding: "24px", textAlign: "center",
        }}>
          <p style={{ color: c.text, fontSize: "15px", fontWeight: "600", margin: "0 0 6px" }}>
            Ready to study smarter?
          </p>
          <p style={{ color: c.textMuted, fontSize: "13px", margin: "0 0 16px" }}>
            Join thousands of students already using STUDORA AI
          </p>
          <button
            onClick={() => navigate("/signup")}
            style={{
              padding: "11px 28px", background: `linear-gradient(135deg, ${c.accent}, #5B4FE0)`,
              color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px",
              fontWeight: "600", cursor: "pointer",
            }}
          >
            Create free account →
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default GuestDashboard;