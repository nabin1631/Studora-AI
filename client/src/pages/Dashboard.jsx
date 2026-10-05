import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import api from "../services/api";

// Animated number counter hook
function useCounter(target, duration = 800) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!started || target === 0) { setCount(target); return; }
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, started, duration]);
  return { count, start: () => setStarted(true) };
}

// KPI Stat Card Component
function StatCard({ label, target, icon, color, onClick, delay = 0 }) {
  const { count, start } = useCounter(typeof target === "number" ? target : 0, 800);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(start, delay); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay, start]);
  return (
    <div ref={ref} onClick={onClick} className="kpi-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: "10px",
          background: `${color}12`,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px"
        }}>
          {icon}
        </div>
      </div>
      <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#0F172A", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {typeof target === "number" ? count : target ?? "0"}
      </p>
      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748B", fontWeight: "500" }}>
        {label}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { mode } = useTheme();
  const navigate = useNavigate();
  const isDark = mode === "dark";
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [greetingIcon, setGreetingIcon] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) { setGreeting("Good morning"); setGreetingIcon("☀️"); }
    else if (h < 17) { setGreeting("Good afternoon"); setGreetingIcon("🌤️"); }
    else { setGreeting("Good evening"); setGreetingIcon("🌙"); }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/stats");
      setStats(res.data.stats);
    } catch { 
      console.error("Failed to fetch stats"); 
    } finally { 
      setLoading(false); 
    }
  };

  const PRIORITY_COLORS = { low: "#10B981", medium: "#F59E0B", high: "#EF4444" };
  const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  // Progress Data Calculations
  const taskProgress = stats?.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const todayCompleted = stats?.todayCompletedCount ?? 0;
  const todayTotal = stats?.todayTasksCount ?? 0;
  const todayProgress = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  // Donut SVG Calculations
  const RING_R = 48;
  const RING_CIRC = 2 * Math.PI * RING_R;
  const strokeOffset = RING_CIRC - (RING_CIRC * taskProgress) / 100;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr), today = new Date(), tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    [d, today, tomorrow].forEach(x => x.setHours(0,0,0,0));
    if (d.getTime() === today.getTime()) return "Today";
    if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const QUICK_ACTIONS = [
    { icon: "📝", label: "New Note", desc: "Rich-text editor", path: "/notes", color: "#2563EB" },
    { icon: "📅", label: "Add Task", desc: "Study planner", path: "/planner", color: "#6366F1" },
    { icon: "🤖", label: "AI Tutor", desc: "Ask anything", path: "/ai-tutor", color: "#10B981" },
    { icon: "🎮", label: "Quiz Arena", desc: "Test knowledge", path: "/quiz-arena", color: "#EF4444" },
    { icon: "📄", label: "PDF AI", desc: "Chat with PDF", path: "/pdf-ai", color: "#F59E0B" },
    { icon: "📊", label: "Analytics", desc: "Track progress", path: "/analytics", color: "#8B5CF6" },
  ];

  return (
    <Layout>
      <style>{`
        /* Global box-sizing guard */
        .dash-container,
        .dash-container * {
          box-sizing: border-box;
        }

        /* Prevent Grid Child Overflow */
        .kpi-grid > *,
        .middle-grid > *,
        .bottom-grid > * {
          min-width: 0;
        }

        /* Container Rules */
        .dash-container {
          width: 100%;
          max-width: 1140px;
          margin: 0 auto;
          box-sizing: border-box;
          background-color: ${isDark ? "transparent" : "#F6F8FC"};
          padding: 8px 0 32px;
        }

        /* Dash Card Base */
        .dash-card {
          background: ${isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"};
          border-radius: 18px;
          padding: 24px;
          position: relative;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease;
        }

        /* KPI Grid Base */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .kpi-card {
          background: ${isDark ? "rgba(255,255,255,0.03)" : "#FFFFFF"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"};
          border-radius: 14px;
          padding: 18px 20px;
          cursor: pointer;
          position: relative;
          min-width: 0;
          transition: all 0.2s ease;
        }

        .dash-card:hover, .kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.06), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
          border-color: #6366F1;
        }

        /* Header Actions */
        .header-actions {
          display: flex;
          gap: 10px;
        }

        /* Mini Stats */
        .mini-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 18px;
          align-items: center;
        }

        .mini-stat-badge {
          min-width: 0;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
          background: ${isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"};
          padding: 4px 10px;
          border-radius: 20px;
        }

        /* Middle Grid Layout */
        .middle-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 16px;
          margin-bottom: 16px;
        }

        /* Progress Section Inside Study Progress */
        .progress-main {
          display: grid;
          grid-template-columns: 116px minmax(0, 1fr);
          gap: 20px;
          align-items: center;
          margin-bottom: 24px;
        }

        .progress-details {
          min-width: 0;
          width: 100%;
        }

        /* Study Summary Cards */
        .study-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        /* Quick Actions Grid */
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .quick-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"};
          background: ${isDark ? "rgba(255,255,255,0.02)" : "#FFFFFF"};
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
        }

        .quick-btn:hover {
          border-color: #6366F1;
          transform: translateY(-1px);
          background: ${isDark ? "rgba(99,102,241,0.08)" : "#F8FAFC"};
        }

        /* Recent Notes Rows */
        .recent-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
          margin-bottom: 4px;
          min-width: 0;
        }

        .recent-row:hover {
          background: ${isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9"};
        }

        .recent-row-content {
          min-width: 0;
          flex: 1;
        }

        .recent-row-title,
        .recent-row-description {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .recent-row-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          flex-shrink: 0;
        }

        /* Bottom Grid Layout */
        .bottom-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 16px;
          align-items: start;
        }

        .upcoming-tasks-card {
          height: fit-content;
          align-self: start;
        }

        /* Upcoming Task Items */
        .task-card-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 6px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          background: ${isDark ? "rgba(255,255,255,0.02)" : "#FFFFFF"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#EEF2F6"};
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.2s ease, 
                      background-color 0.2s ease, 
                      box-shadow 0.2s ease;
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
        }

        .task-card-item:hover {
          transform: translateY(-2px);
          background: ${isDark ? "rgba(99, 102, 241, 0.08)" : "#F5F8FF"};
          border-color: ${isDark ? "rgba(99, 102, 241, 0.4)" : "#C7D2FE"};
          box-shadow: 0 6px 16px -4px rgba(99, 102, 241, 0.12);
        }

        .task-card-item::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.06), transparent 40%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .task-card-item:hover::before {
          opacity: 1;
        }

        .task-card-item:hover .task-arrow {
          transform: translateX(4px);
          color: #6366F1;
        }

        .task-card-item:active {
          transform: scale(0.99) translateY(0);
        }

        .task-content {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-left: 4px;
          min-width: 0;
          flex: 1;
        }

        .task-text {
          min-width: 0;
          flex: 1;
        }

        .task-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .task-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .view-btn {
          background: none; border: none; color: #6366F1;
          font-size: 13px; font-weight: 600; cursor: pointer;
          padding: 4px 8px; border-radius: 6px; transition: background 0.15s;
        }

        .view-btn:hover { background: rgba(99,102,241,0.08); }

        .skeleton {
          background: ${isDark ? "rgba(255,255,255,0.05)" : "#E2E8F0"};
          border-radius: 8px;
        }

        /* ── TABLET BREAKPOINT (601px - 867px) ── */
        @media (max-width: 867px) {
          .dash-container {
            padding: 8px 16px 32px;
          }

          .kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .middle-grid {
            grid-template-columns: 1fr;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ── MOBILE BREAKPOINT (381px - 600px) ── */
        @media (max-width: 600px) {
          .dash-container {
            padding: 8px 12px 28px;
          }

          .dash-card {
            padding: 18px;
            border-radius: 16px;
          }

          .dashboard-title {
            font-size: 22px;
            line-height: 1.25;
          }

          .header-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .header-actions button {
            width: 100%;
          }

          .kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .kpi-card {
            padding: 15px 14px;
            min-width: 0;
          }

          .progress-main {
            grid-template-columns: 1fr;
            justify-items: center;
            gap: 18px;
          }

          .progress-details {
            width: 100%;
          }

          .study-summary {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
          }

          .quick-actions-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .task-priority {
            display: none;
          }
        }

        /* ── SMALL PHONES BREAKPOINT (<= 380px) ── */
        @media (max-width: 380px) {
          .dash-container {
            padding-left: 10px;
            padding-right: 10px;
          }

          .dash-card {
            padding: 15px;
          }

          .header-actions {
            grid-template-columns: 1fr;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .study-summary {
            grid-template-columns: 1fr;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ── MOBILE TOUCH HOVER DISABLE ── */
        @media (hover: none) {
          .dash-card:hover,
          .kpi-card:hover,
          .task-card-item:hover,
          .quick-btn:hover {
            transform: none;
          }
        }
      `}</style>
      <div className="dash-container">
        {/* ── 1. COMPACT WORKSPACE HEADER ── */}
        <div className="dashboard-header" style={{ marginBottom: "20px", padding: "4px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <span style={{ fontSize: "16px" }}>{greetingIcon}</span>
            <span style={{ color: "#64748B", fontSize: "13px", fontWeight: "600" }}>{greeting}</span>
          </div>
          <h1 className="dashboard-title" style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: "24px", fontWeight: "800", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Welcome back, {user?.name || "Student"}! 👋
          </h1>
          <p style={{ color: "#64748B", fontSize: "13px", margin: "0 0 16px", lineHeight: "1.5" }}>
            {loading ? "Fetching latest statistics..." : 
              `You have ${stats?.pendingTasks || 0} pending task${stats?.pendingTasks !== 1 ? "s" : ""} and ${stats?.totalNotes || 0} notes saved.`
            }
          </p>
          {/* Mini Inline Stats Badges */}
          {stats && (
            <div className="mini-stats">
              {[
                { label: "Notes", val: stats.totalNotes, color: "#2563EB" },
                { label: "Done", val: stats.completedTasks, color: "#10B981" },
                { label: "Pending", val: stats.pendingTasks, color: "#F59E0B" },
                { label: "This Week", val: stats.notesThisWeek, color: "#6366F1" },
              ].map((s) => (
                <div key={s.label} className="mini-stat-badge">
                  <span style={{ color: s.color, fontSize: "13px", fontWeight: "700" }}>{s.val}</span>
                  <span style={{ color: "#64748B", fontSize: "11px", fontWeight: "500" }}>{s.label}</span>
                </div>
              ))}
            </div>
          )}
          {/* Action Header Buttons */}
          <div className="header-actions">
            <button
              onClick={() => navigate("/notes")}
              style={{
                padding: "8px 16px",
                background: "#6366F1",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(99,102,241,0.2)",
                transition: "background 0.15s ease"
              }}
            >
              📝 New Note
            </button>
            <button
              onClick={() => navigate("/quiz-arena")}
              style={{
                padding: "8px 16px",
                background: isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
                color: isDark ? "#F8FAFC" : "#0F172A",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0"}`,
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              🎮 Take a Quiz
            </button>
          </div>
        </div>
        {/* ── 2. KPI METRIC CARDS ── */}
        <div className="kpi-grid">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "14px" }} />)
          ) : (
            <>
              <StatCard
                label="Total Notes"
                target={stats?.totalNotes ?? 0}
                icon="📝"
                color="#2563EB"
                onClick={() => navigate("/notes")}
                delay={0}
              />
              <StatCard
                label="Notes This Week"
                target={stats?.notesThisWeek ?? 0}
                icon="✨"
                color="#6366F1"
                onClick={() => navigate("/notes")}
                delay={40}
              />
              <StatCard
                label="Tasks Completed"
                target={stats?.completedTasks ?? 0}
                icon="✅"
                color="#10B981"
                onClick={() => navigate("/planner")}
                delay={80}
              />
              <StatCard
                label="Pending Tasks"
                target={stats?.pendingTasks ?? 0}
                icon="⏳"
                color="#F59E0B"
                onClick={() => navigate("/planner")}
                delay={120}
              />
            </>
          )}
        </div>
        {/* ── 3. MIDDLE ROW: STUDY PROGRESS + QUICK ACTIONS ── */}
        <div className="middle-grid">
          
          {/* Study Progress Card */}
          <div className="dash-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>📊</span>
                <h3 style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: "16px", fontWeight: "700", margin: 0 }}>
                  Study Progress
                </h3>
              </div>
              <button className="view-btn" onClick={() => navigate("/analytics")}>
                Analytics →
              </button>
            </div>
            <div className="progress-main">
              <div style={{ position: "relative", width: 116, height: 116, flexShrink: 0 }}>
                <svg
                  width="116"
                  height="116"
                  viewBox="0 0 116 116"
                  style={{ transform: "rotate(-90deg)", overflow: "visible" }}
                >
                  <circle
                    cx="58"
                    cy="58"
                    r={RING_R}
                    fill="none"
                    stroke={isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9"}
                    strokeWidth="10"
                  />
                  <circle
                    cx="58"
                    cy="58"
                    r={RING_R}
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="10"
                    strokeDasharray={RING_CIRC}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
                  />
                </svg>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column"
                }}>
                  <span style={{ fontSize: "20px", fontWeight: "800", color: "#6366F1", lineHeight: 1 }}>
                    {taskProgress}%
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: "#94A3B8", letterSpacing: "0.05em", marginTop: "3px" }}>
                    TASKS
                  </span>
                </div>
              </div>
              <div className="progress-details" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: isDark ? "#94A3B8" : "#64748B" }}>Overall tasks</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#6366F1" }}>{taskProgress}%</span>
                  </div>
                  <div style={{ height: "8px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9", overflow: "hidden" }}>
                    <div style={{ width: `${taskProgress}%`, height: "100%", background: "#6366F1", borderRadius: "10px", transition: "width 0.8s ease" }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: isDark ? "#94A3B8" : "#64748B" }}>Today's tasks</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#10B981" }}>{todayCompleted}/{todayTotal}</span>
                  </div>
                  <div style={{ height: "8px", borderRadius: "10px", background: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9", overflow: "hidden" }}>
                    <div style={{ width: `${todayProgress}%`, height: "100%", background: "#10B981", borderRadius: "10px", transition: "width 0.8s ease" }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="study-summary">
              <div onClick={() => navigate("/planner")} style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9"}`, borderRadius: "12px", padding: "12px", textAlign: "center", cursor: "pointer" }}>
                <p style={{ margin: "0 0 2px 0", fontSize: "22px", fontWeight: "800", color: "#10B981", lineHeight: 1.1 }}>{stats?.completedTasks ?? 0}</p>
                <span style={{ fontSize: "12px", fontWeight: "600", color: isDark ? "#94A3B8" : "#64748B" }}>Done</span>
              </div>
              <div onClick={() => navigate("/planner")} style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9"}`, borderRadius: "12px", padding: "12px", textAlign: "center", cursor: "pointer" }}>
                <p style={{ margin: "0 0 2px 0", fontSize: "22px", fontWeight: "800", color: "#EAB308", lineHeight: 1.1 }}>{stats?.pendingTasks ?? 0}</p>
                <span style={{ fontSize: "12px", fontWeight: "600", color: isDark ? "#94A3B8" : "#64748B" }}>Pending</span>
              </div>
              <div onClick={() => navigate("/notes")} style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9"}`, borderRadius: "12px", padding: "12px", textAlign: "center", cursor: "pointer" }}>
                <p style={{ margin: "0 0 2px 0", fontSize: "22px", fontWeight: "800", color: "#6366F1", lineHeight: 1.1 }}>{stats?.totalNotes ?? 0}</p>
                <span style={{ fontSize: "12px", fontWeight: "600", color: isDark ? "#94A3B8" : "#64748B" }}>Notes</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="dash-card">
            <h3 style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: "16px", fontWeight: "700", margin: "0 0 16px" }}>⚡ Quick Actions</h3>
            <div className="quick-actions-grid">
              {QUICK_ACTIONS.map((a) => (
                <button key={a.label} className="quick-btn" onClick={() => navigate(a.path)}>
                  <div style={{ width: 34, height: 34, borderRadius: "8px", background: `${a.color}12`, color: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0 }}>
                    {a.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", color: isDark ? "#F8FAFC" : "#0F172A" }}>{a.label}</p>
                    <p style={{ margin: 0, fontSize: "10px", color: "#64748B" }}>{a.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. BOTTOM GRID ── */}
        <div className="bottom-grid">
          {/* Recent Notes Section */}
          <div className="dash-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: "15px", fontWeight: "700", margin: 0 }}>📝 Recent Notes</h3>
              <button className="view-btn" onClick={() => navigate("/notes")}>View all →</button>
            </div>
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <div className="skeleton" style={{ width: 32, height: 32, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 12, marginBottom: 4, width: "60%" }} />
                    <div className="skeleton" style={{ height: 10, width: "40%" }} />
                  </div>
                </div>
              ))
            ) : !stats?.recentNotes?.length ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ color: "#64748B", fontSize: "12px", margin: "0 0 8px" }}>No notes saved yet.</p>
                <button onClick={() => navigate("/notes")} className="view-btn">Create first note →</button>
              </div>
            ) : (
              stats.recentNotes.map(note => (
                <div key={note._id} className="recent-row" onClick={() => navigate("/notes")}>
                  <div style={{ width: 32, height: 32, borderRadius: "8px", background: "rgba(37,99,235,0.08)", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
                    📝
                  </div>
                  <div className="recent-row-content">
                    <p className="recent-row-title" style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: isDark ? "#F8FAFC" : "#0F172A" }}>{note.title}</p>
                    <p className="recent-row-description" style={{ margin: 0, fontSize: "11px", color: "#64748B" }}>{stripHtml(note.content) || "No content"}</p>
                  </div>
                  <div className="recent-row-meta">
                    <span style={{ fontSize: "10px", color: "#2563EB", background: "rgba(37,99,235,0.08)", padding: "1px 6px", borderRadius: "10px", fontWeight: "600" }}>{note.subject}</span>
                    <span style={{ fontSize: "10px", color: "#64748B" }}>{new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 🎯 OPTIMIZED COMPACT UPCOMING TASKS SECTION */}
          <div className="dash-card upcoming-tasks-card">
            {/* Reduced Header Container */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  background: isDark ? "rgba(99, 102, 241, 0.12)" : "#EEF2FF",
                  color: "#6366F1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px"
                }}>
                  📅
                </div>
                <div>
                  <h3 style={{ color: isDark ? "#F8FAFC" : "#0F172A", fontSize: "15px", fontWeight: "700", margin: 0 }}>
                    Upcoming Tasks
                  </h3>
                  <p style={{ margin: "1px 0 0", fontSize: "11px", color: "#64748B" }}>
                    Stay on track with your planned tasks
                  </p>
                </div>
              </div>
              <button className="view-btn" onClick={() => navigate("/planner")} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                View all <span style={{ fontSize: "13px" }}>→</span>
              </button>
            </div>
            {/* Task Items List (Max 3 Items) */}
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: "42px", borderRadius: "10px", marginBottom: "6px" }} />
              ))
            ) : !stats?.upcomingTasks?.length ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ color: "#64748B", fontSize: "12px", margin: "0 0 8px" }}>No upcoming tasks planned.</p>
                <button onClick={() => navigate("/planner")} className="view-btn">Plan your study →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {stats.upcomingTasks.slice(0, 3).map(task => {
                  const color = PRIORITY_COLORS[task.priority] || "#F59E0B";
                  return (
                    <div
                      key={task._id}
                      className="task-card-item"
                      onClick={() => navigate("/planner")}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                        e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
                      }}
                    >
                      {/* Left Priority Accent Bar */}
                      <div style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "3px",
                        background: color,
                        borderTopLeftRadius: "10px",
                        borderBottomLeftRadius: "10px"
                      }} />
                      {/* Content Section */}
                      <div className="task-content">
                        <div style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: `2px solid ${isDark ? "#475569" : "#CBD5E1"}`,
                          background: "transparent",
                          flexShrink: 0
                        }} />
                        <div className="task-text">
                          <p className="task-title" style={{
                            margin: 0,
                            fontSize: "13px",
                            fontWeight: "600",
                            color: isDark ? "#F8FAFC" : "#1E293B",
                            letterSpacing: "-0.01em"
                          }}>
                            {task.title}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px", fontSize: "11px", color: "#64748B" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                              📂 {task.subject}
                            </span>
                            <span>•</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "3px", color: isDark ? "#A5B4FC" : "#6366F1", fontWeight: "500" }}>
                              📅 {formatDate(task.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Right Tag + Arrow */}
                      <div className="task-meta">
                        <span className="task-priority" style={{
                          fontSize: "10px",
                          fontWeight: "600",
                          color: color,
                          background: `${color}14`,
                          padding: "2px 8px",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          textTransform: "capitalize"
                        }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: color }} />
                          {task.priority}
                        </span>
                        <span className="task-arrow" style={{
                          color: isDark ? "#64748B" : "#94A3B8",
                          fontSize: "13px",
                          fontWeight: "700",
                          transition: "transform 0.2s ease, color 0.2s ease"
                        }}>
                          ›
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Minimized Bottom Encouragement Badge */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              marginTop: "10px",
              paddingTop: "8px",
              borderTop: `1px dashed ${isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9"}`
            }}>
              <div style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: isDark ? "rgba(99, 102, 241, 0.15)" : "#EEF2FF",
                color: "#6366F1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px"
              }}>
                ✨
              </div>
              <span style={{ fontSize: "11px", fontWeight: "500", color: "#64748B" }}>
                Keep going! You're building something great.
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
