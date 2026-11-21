import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import api from "../services/api";
import "./Dashboard.css";

// Animated number counter hook
function useCounter(target, duration = 800) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const start = useCallback(() => setStarted(true), []);

  useEffect(() => {
    if (!started || target === 0) { setCount(target); return; }
    let startTime = null;
    let frame;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, started, duration]);

  return { count, start };
}

// KPI Stat Card Component
function StatCard({ label, target, icon, color, onClick, delay = 0, index = 0 }) {
  const { count, start } = useCounter(typeof target === "number" ? target : 0, 800);
  const ref = useRef(null);

  useEffect(() => {
    let timer;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { timer = setTimeout(start, delay); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, [delay, start]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      role="button"
      tabIndex={0}
      className="kpi-card reveal"
      style={{ "--c": color, "--i": index + 2 }}
    >
      <div className="kpi-top">
        <div className="kpi-icon">{icon}</div>
        <span className="kpi-go">↗</span>
      </div>
      <div>
        <p className="kpi-value">{typeof target === "number" ? count : target ?? "0"}</p>
        <p className="kpi-label">{label}</p>
      </div>
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
  const [animateBars, setAnimateBars] = useState(false);

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
      // let the ring and bars grow from 0 after the first paint
      setTimeout(() => setAnimateBars(true), 150);
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
  const RING_R = 52;
  const RING_CIRC = 2 * Math.PI * RING_R;
  const shownProgress = animateBars ? taskProgress : 0;
  const strokeOffset = RING_CIRC - (RING_CIRC * shownProgress) / 100;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr), today = new Date(), tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    [d, today, tomorrow].forEach(x => x.setHours(0,0,0,0));
    if (d.getTime() === today.getTime()) return "Today";
    if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const NOTE_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EC4899", "#38BDF8", "#8B5CF6"];

  const QUICK_ACTIONS = [
    { icon: "📝", label: "New Note", desc: "Rich-text editor", path: "/notes", color: "#2563EB" },
    { icon: "📅", label: "Add Task", desc: "Study planner", path: "/planner", color: "#6366F1" },
    { icon: "🤖", label: "AI Tutor", desc: "Ask anything", path: "/ai-tutor", color: "#10B981" },
    { icon: "🎮", label: "Quiz Arena", desc: "Test knowledge", path: "/quiz-arena", color: "#EF4444" },
    { icon: "📄", label: "PDF AI", desc: "Chat with PDF", path: "/pdf-ai", color: "#F59E0B" },
    { icon: "📊", label: "Analytics", desc: "Track progress", path: "/analytics", color: "#8B5CF6" },
  ];

  const handleSpotlight = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const activate = (fn) => (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); }
  };

  return (
    <Layout>
      <div className="dash-container" data-theme={isDark ? "dark" : "light"}>

        {/* ── 1. HERO HEADER ── */}
        <div className="dashboard-header reveal" style={{ "--i": 0 }}>
          <div className="greeting-chip">
            <span>{greetingIcon}</span>
            <span>{greeting}</span>
          </div>
          <h1 className="dashboard-title">Welcome back, {user?.name || "Student"}! 👋</h1>
          <p className="hero-sub">
            {loading ? "Fetching latest statistics..." :
              `You have ${stats?.pendingTasks || 0} pending task${stats?.pendingTasks !== 1 ? "s" : ""} and ${stats?.totalNotes || 0} notes saved.`
            }
          </p>

          {stats && (
            <div className="mini-stats">
              {[
                { label: "Notes", val: stats.totalNotes, color: "#2563EB" },
                { label: "Done", val: stats.completedTasks, color: "#10B981" },
                { label: "Pending", val: stats.pendingTasks, color: "#F59E0B" },
                { label: "This Week", val: stats.notesThisWeek, color: "#6366F1" },
              ].map((s) => (
                <div key={s.label} className="mini-stat-badge" style={{ "--c": s.color }}>
                  <span className="dot" />
                  <span className="val">{s.val}</span>
                  <span className="lbl">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => navigate("/notes")}>
              📝 New Note
            </button>
            <button className="btn btn-ghost" onClick={() => navigate("/quiz-arena")}>
              🎮 Take a Quiz
            </button>
          </div>
        </div>

        {/* ── 2. KPI METRIC CARDS ── */}
        <div className="kpi-grid">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: "128px", borderRadius: "20px" }} />)
          ) : (
            <>
              <StatCard label="Total Notes" target={stats?.totalNotes ?? 0} icon="📝" color="#2563EB" onClick={() => navigate("/notes")} delay={0} index={0} />
              <StatCard label="Notes This Week" target={stats?.notesThisWeek ?? 0} icon="✨" color="#6366F1" onClick={() => navigate("/notes")} delay={40} index={1} />
              <StatCard label="Tasks Completed" target={stats?.completedTasks ?? 0} icon="✅" color="#10B981" onClick={() => navigate("/planner")} delay={80} index={2} />
              <StatCard label="Pending Tasks" target={stats?.pendingTasks ?? 0} icon="⏳" color="#F59E0B" onClick={() => navigate("/planner")} delay={120} index={3} />
            </>
          )}
        </div>

        {/* ── 3. MIDDLE ROW: STUDY PROGRESS + QUICK ACTIONS ── */}
        <div className="middle-grid">

          {/* Study Progress */}
          <div className="dash-card reveal" style={{ "--i": 6 }}>
            <div className="card-head">
              <div className="card-title-wrap">
                <div className="card-icon" style={{ "--accent": "#6366F1" }}>📊</div>
                <h3 className="card-title">Study Progress</h3>
              </div>
              <button className="view-btn" onClick={() => navigate("/analytics")}>
                Analytics <span className="arrow">→</span>
              </button>
            </div>

            <div className="progress-main">
              <div className="ring-wrap">
                <svg viewBox="0 0 124 124">
                  <defs>
                    <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#38BDF8" />
                    </linearGradient>
                  </defs>
                  <circle className="ring-track" cx="62" cy="62" r={RING_R} fill="none" strokeWidth="11" />
                  <circle
                    className="ring-value"
                    cx="62"
                    cy="62"
                    r={RING_R}
                    fill="none"
                    stroke="url(#ringGradient)"
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRC}
                    strokeDashoffset={strokeOffset}
                  />
                </svg>
                <div className="ring-center">
                  <span className="ring-pct">{taskProgress}%</span>
                  <span className="ring-cap">TASKS</span>
                </div>
              </div>

              <div className="progress-details">
                <div style={{ "--c": "#6366F1" }}>
                  <div className="bar-row-head">
                    <span>Overall tasks</span>
                    <b>{taskProgress}%</b>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${animateBars ? taskProgress : 0}%` }} />
                  </div>
                </div>
                <div style={{ "--c": "#10B981" }}>
                  <div className="bar-row-head">
                    <span>Today's tasks</span>
                    <b>{todayCompleted}/{todayTotal}</b>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${animateBars ? todayProgress : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="study-summary">
              {[
                { num: stats?.completedTasks ?? 0, cap: "Done", color: "#10B981", path: "/planner" },
                { num: stats?.pendingTasks ?? 0, cap: "Pending", color: "#EAB308", path: "/planner" },
                { num: stats?.totalNotes ?? 0, cap: "Notes", color: "#6366F1", path: "/notes" },
              ].map((t) => (
                <div
                  key={t.cap}
                  className="stat-tile"
                  style={{ "--c": t.color }}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(t.path)}
                  onKeyDown={activate(() => navigate(t.path))}
                >
                  <p className="num">{t.num}</p>
                  <span className="cap">{t.cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dash-card reveal" style={{ "--i": 7 }}>
            <div className="card-head">
              <div className="card-title-wrap">
                <div className="card-icon" style={{ "--accent": "#F59E0B" }}>⚡</div>
                <h3 className="card-title">Quick Actions</h3>
              </div>
            </div>
            <div className="quick-actions-grid">
              {QUICK_ACTIONS.map((a) => (
                <button key={a.label} className="quick-btn" style={{ "--c": a.color }} onClick={() => navigate(a.path)}>
                  <div className="qa-icon">{a.icon}</div>
                  <div className="qa-text">
                    <p className="qa-label">{a.label}</p>
                    <p className="qa-desc">{a.desc}</p>
                  </div>
                  <span className="qa-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. BOTTOM GRID ── */}
        <div className="bottom-grid">

          {/* Recent Notes */}
          <div className="dash-card reveal" style={{ "--i": 8 }}>
            <div className="card-head">
              <div className="card-title-wrap">
                <div className="card-icon" style={{ "--accent": "#6366F1" }}>📝</div>
                <h3 className="card-title">Recent Notes</h3>
              </div>
              <button className="view-btn" onClick={() => navigate("/notes")}>
                View all <span className="arrow">→</span>
              </button>
            </div>

            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
                  <div className="skeleton" style={{ width: 38, height: 38, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 12, marginBottom: 6, width: "60%" }} />
                    <div className="skeleton" style={{ height: 10, width: "40%" }} />
                  </div>
                </div>
              ))
            ) : !stats?.recentNotes?.length ? (
              <div className="empty-state">
                <p>No notes saved yet.</p>
                <button onClick={() => navigate("/notes")} className="view-btn">Create first note <span className="arrow">→</span></button>
              </div>
            ) : (
              <div className="recent-list">
                {stats.recentNotes.map((note, idx) => (
                  <div
                    key={note._id}
                    className="note-item"
                    style={{ "--c": NOTE_COLORS[idx % NOTE_COLORS.length], "--n": idx }}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate("/notes")}
                    onKeyDown={activate(() => navigate("/notes"))}
                    onMouseMove={handleSpotlight}
                  >
                    <div className="recent-icon">📝</div>
                    <div className="recent-row-content">
                      <p className="recent-row-title">{note.title}</p>
                      <p className="recent-row-description">{stripHtml(note.content) || "No content"}</p>
                    </div>
                    <div className="recent-row-meta">
                      <span className="subject-tag">{note.subject}</span>
                      <span className="recent-date">
                        {new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <span className="note-go">→</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Tasks */}
          <div className="dash-card upcoming-tasks-card reveal" style={{ "--i": 9 }}>
            <div className="card-head">
              <div className="card-title-wrap">
                <div className="card-icon" style={{ "--accent": "#6366F1" }}>📅</div>
                <div>
                  <h3 className="card-title">Upcoming Tasks</h3>
                  <p className="card-subtitle">Stay on track with your planned tasks</p>
                </div>
              </div>
              <button className="view-btn" onClick={() => navigate("/planner")}>
                View all <span className="arrow">→</span>
              </button>
            </div>

            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: "56px", borderRadius: "14px", marginBottom: "10px" }} />
              ))
            ) : !stats?.upcomingTasks?.length ? (
              <div className="empty-state">
                <p>No upcoming tasks planned.</p>
                <button onClick={() => navigate("/planner")} className="view-btn">Plan your study <span className="arrow">→</span></button>
              </div>
            ) : (
              <div className="task-list">
                {stats.upcomingTasks.slice(0, 3).map(task => {
                  const color = PRIORITY_COLORS[task.priority] || "#F59E0B";
                  return (
                    <div
                      key={task._id}
                      className="task-card-item"
                      style={{ "--c": color }}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate("/planner")}
                      onKeyDown={activate(() => navigate("/planner"))}
                      onMouseMove={handleSpotlight}
                    >
                      <span className="task-accent" />
                      <div className="task-content">
                        <span className="task-check" />
                        <div className="task-text">
                          <p className="task-title">{task.title}</p>
                          <div className="task-sub">
                            <span>📂 {task.subject}</span>
                            <span>•</span>
                            <span className="task-date">📅 {formatDate(task.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="task-meta">
                        <span className="task-priority"><i />{task.priority}</span>
                        <span className="task-arrow">›</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="encourage">
              <span>✨</span>
              <span>Keep going! You're building something great.</span>
            </div>
          </div>
        </div>

        {/* ── 5. FOOTER ── */}
        <footer className="dash-footer reveal" style={{ "--i": 10 }}>
          <div className="footer-top">
            <div>
              <div className="footer-brand-name">🚀 STUDORA AI</div>
              <p className="footer-tag">Learn Smarter. Study Faster. Achieve More.</p>
            </div>
            <nav className="footer-links" aria-label="Footer">
              <a href="/#docs">Documentation</a>
              <a href="/#help">Help Center</a>
              <a href="/#community">Community</a>
              <a href="/#privacy">Privacy</a>
              <a href="/#terms">Terms</a>
              <a href="mailto:support@studora.ai">Contact</a>
            </nav>
            <div className="footer-social">
              <a href="/#twitter" style={{ "--c": "#38BDF8" }} aria-label="X (Twitter)" title="X (Twitter)">🐦</a>
              <a href="/#linkedin" style={{ "--c": "#2563EB" }} aria-label="LinkedIn" title="LinkedIn">💼</a>
              <a href="/#instagram" style={{ "--c": "#EC4899" }} aria-label="Instagram" title="Instagram">📷</a>
              <a href="/#github" style={{ "--c": "#8B5CF6" }} aria-label="GitHub" title="GitHub">🐙</a>
              <a href="https://studora.ai/" style={{ "--c": "#10B981" }} aria-label="studora.ai" title="studora.ai">🌐</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 STUDORA AI. All rights reserved.</span>
            <span className="footer-status"><i className="status-dot" /> All Systems Operational</span>
            <span>Version 2.0 • Made with ❤️ for learners worldwide</span>
          </div>
        </footer>
      </div>
    </Layout>
  );
}