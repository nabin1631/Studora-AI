import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import api from "../services/api";

const SUBJECTS = ["General", "Math", "Physics", "Chemistry", "Biology", "English", "Computer Science", "Other"];
const PRIORITY_COLORS = { low: "#22C55E", medium: "#EAB308", high: "#EF4444" };

const getLocalDateString = () => {
  const now = new Date();
  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );
  return localDate.toISOString().split("T")[0];
};
function Planner() {
  const { colors: c, mode } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("active"); // "active" | "completed"

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("General");
  const [date, setDate] = useState(getLocalDateString);
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);

  // 1. Declare fetchTasks first so it is available to hooks below
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks);
    } catch {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // 2. Safely trigger the fully declared fetchTasks function
  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (date < getLocalDateString()) {
  setError("Please choose today or a future date for your study task.");
  return;
}
    setSaving(true);
    setError("");
    try {
      await api.post("/tasks", { title, subject, date, priority });
      setTitle("");
      setSubject("General");
      setPriority("medium");
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add task");
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const res = await api.patch(`/tasks/${id}/complete`);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)));
    } catch {
      setError("Failed to update task");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch {
      setError("Failed to delete task");
    }
  };

  // Separate tasks dynamically by status
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Group current displayed context tab list by date values
  const currentViewTasks = activeTab === "active" ? activeTasks : completedTasks;

  const grouped = currentViewTasks.reduce((acc, task) => {
    const dateKey = new Date(task.date).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(task);
    return acc;
  }, {});

  const sortedDateKeys = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };

  const totalCount = tasks.length;
  const completedCount = completedTasks.length;
  const pendingCount = activeTasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const STATS = [
    { label: "Total", value: totalCount, color: "#38BDF8" },
    { label: "Pending", value: pendingCount, color: "#EAB308" },
    { label: "Completed", value: completedCount, color: "#22C55E" },
    { label: "Progress", value: `${completionPercentage}%`, color: c.accent },
  ];

  const rootVars = {
    "--pl-accent": c.accent,
    "--pl-bg": c.bg,
    "--pl-card": c.bgCard,
    "--pl-border": c.border,
    "--pl-text": c.text,
    "--pl-text-2": c.textSecondary,
    "--pl-muted": c.textMuted,
    "--pl-faint": c.textFaint,
  };

  let rowCounter = 0; // only used to stagger the entrance animation

  return (
    <Layout>
      <style>{`
        .pl-root {
          --ease: cubic-bezier(0.22, 1, 0.36, 1);
          max-width: 760px;
          margin: 0 auto;
          color: var(--pl-text);
        }
        .pl-root *, .pl-root *::before, .pl-root *::after { box-sizing: border-box; }

        /* entrance keyframes only define the start state, so hover transforms keep working */
        @keyframes plFadeUp { from { opacity: 0; transform: translateY(14px); } }
        @keyframes plFade { from { opacity: 0; } }
        @keyframes plGrow { from { transform: scaleX(0); } }
        @keyframes plPop { 0% { transform: scale(0); } 70% { transform: scale(1.25); } 100% { transform: scale(1); } }
        @keyframes plShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes plFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes plPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
        @keyframes plPing { from { transform: scale(1); opacity: 0.7; } to { transform: scale(3); opacity: 0; } }
        @keyframes plWiggle { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-14deg); } 75% { transform: rotate(14deg); } }
        @keyframes plShimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        @keyframes plStripe { from { background-position: 0 0; } to { background-position: 28px 0; } }

        /* ---------- Header ---------- */
        .pl-header {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px; margin-bottom: 22px;
          animation: plFadeUp 0.5s var(--ease) backwards;
        }
        .pl-title { margin: 0 0 4px; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; color: var(--pl-text); }
        .pl-sub { margin: 0; font-size: 13px; color: var(--pl-muted); }

        .pl-add {
          position: relative; overflow: hidden;
          padding: 11px 20px; border: 0; border-radius: 12px;
          color: #fff; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer;
          background: linear-gradient(135deg, var(--pl-accent), #5B4FE0);
          box-shadow: 0 6px 16px color-mix(in srgb, var(--pl-accent) 32%, transparent);
          transition: transform 0.3s var(--ease), box-shadow 0.3s ease, background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
        .pl-add::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%);
          transform: translateX(-120%); transition: transform 0.6s var(--ease);
        }
        .pl-add:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px color-mix(in srgb, var(--pl-accent) 42%, transparent); }
        .pl-add:hover:not(:disabled)::after { transform: translateX(120%); }
        .pl-add:active:not(:disabled) { transform: scale(0.96); }
        .pl-add:disabled { opacity: 0.6; cursor: not-allowed; }
        .pl-add:focus-visible { outline: 2px solid var(--pl-accent); outline-offset: 3px; }
        .pl-add.is-open {
          color: var(--pl-text-2); background: var(--pl-card);
          border: 1px solid var(--pl-border); box-shadow: none;
        }
        .pl-add.is-open:hover { color: #EF4444; border-color: #EF4444; background: rgba(239, 68, 68, 0.08); box-shadow: 0 8px 18px rgba(239, 68, 68, 0.16); }

        /* ---------- Stat cards ---------- */
        .pl-stats {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;
          margin-bottom: 20px;
        }
        .pl-stat {
          --sc: var(--pl-accent);
          position: relative; overflow: hidden; cursor: default;
          padding: 16px; text-align: center;
          background: var(--pl-card); border: 1px solid var(--pl-border); border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          animation: plFadeUp 0.5s var(--ease) backwards;
          animation-delay: calc(var(--i, 0) * 70ms + 80ms);
          transition: transform 0.35s var(--ease), border-color 0.3s ease, box-shadow 0.35s ease;
        }
        .pl-stat::before {
          content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px;
          background: linear-gradient(90deg, transparent, var(--sc), transparent);
          transform: scaleX(0); transition: transform 0.5s var(--ease);
        }
        .pl-stat::after {
          content: ""; position: absolute; right: -36px; bottom: -44px; width: 120px; height: 120px; border-radius: 50%;
          background: radial-gradient(circle, color-mix(in srgb, var(--sc) 22%, transparent), transparent 70%);
          transition: transform 0.5s var(--ease);
          pointer-events: none;
        }
        .pl-stat:hover {
          transform: translateY(-5px);
          border-color: color-mix(in srgb, var(--sc) 55%, var(--pl-border));
          box-shadow: 0 14px 30px color-mix(in srgb, var(--sc) 22%, transparent);
        }
        .pl-stat:hover::before { transform: scaleX(1); }
        .pl-stat:hover::after { transform: scale(1.6); }
        .pl-stat > * { position: relative; z-index: 1; }
        .pl-stat-label { margin-bottom: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--sc); }
        .pl-stat-value { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: var(--sc); transition: transform 0.4s var(--ease); font-variant-numeric: tabular-nums; }
        .pl-stat:hover .pl-stat-value { transform: scale(1.12); }

        /* ---------- Progress bar ---------- */
        .pl-progress {
          height: 10px; margin-bottom: 26px; overflow: hidden; border-radius: 20px;
          background: var(--pl-border);
          animation: plFade 0.6s ease backwards; animation-delay: 0.3s;
        }
        .pl-progress-fill {
          height: 100%; border-radius: 20px; transform-origin: left;
          background-color: var(--pl-accent);
          background-image:
            repeating-linear-gradient(45deg, rgba(255,255,255,0.18) 0 10px, transparent 10px 20px),
            linear-gradient(90deg, var(--pl-accent), #5B4FE0, #38BDF8);
          background-size: 28px 28px, 100% 100%;
          animation: plGrow 1s var(--ease) backwards, plStripe 1.2s linear infinite;
          animation-delay: 0.4s, 0s;
          transition: width 0.6s var(--ease);
        }

        /* ---------- Error ---------- */
        .pl-error {
          margin-bottom: 16px; padding: 11px 14px; border-radius: 12px; font-size: 13px; font-weight: 500;
          color: #DC2626; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.28);
          animation: plShake 0.4s ease, plFade 0.3s ease;
        }
        .pl-root[data-theme="dark"] .pl-error { color: #FCA5A5; }

        /* ---------- Form ---------- */
        .pl-form {
          position: relative; overflow: hidden;
          margin-bottom: 24px; padding: 20px;
          background: var(--pl-card); border: 1px solid var(--pl-border); border-radius: 18px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
          animation: plFadeUp 0.4s var(--ease);
        }
        .pl-form::before {
          content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px;
          background: linear-gradient(90deg, var(--pl-accent), #38BDF8, #22C55E);
        }
        .pl-input {
          width: 100%; padding: 11px 14px; border-radius: 11px;
          color: var(--pl-text); font: inherit; font-size: 13.5px; outline: none;
          background: var(--pl-bg); border: 1px solid var(--pl-border);
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease, transform 0.3s var(--ease);
        }
        .pl-input:hover { border-color: color-mix(in srgb, var(--pl-accent) 45%, var(--pl-border)); }
        .pl-input:focus {
          border-color: var(--pl-accent); background: var(--pl-card);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--pl-accent) 15%, transparent);
        }
        .pl-input::placeholder { color: var(--pl-faint); }
        .pl-root[data-theme="dark"] .pl-input { color-scheme: dark; }
        .pl-form-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }

        /* ---------- Segmented tabs ---------- */
        .pl-tabs {
          position: relative; display: grid; grid-template-columns: 1fr 1fr;
          padding: 4px; margin-bottom: 20px;
          background: color-mix(in srgb, var(--pl-border) 55%, transparent);
          border: 1px solid var(--pl-border); border-radius: 14px;
          animation: plFadeUp 0.5s var(--ease) backwards; animation-delay: 0.35s;
        }
        .pl-tab-ind {
          position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px);
          border-radius: 10px;
          background: var(--pl-card);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px color-mix(in srgb, var(--pl-accent) 30%, transparent);
          transition: transform 0.45s var(--ease);
        }
        .pl-tab {
          position: relative; z-index: 1;
          padding: 10px 12px; border: 0; border-radius: 10px; background: transparent;
          font: inherit; font-size: 13.5px; font-weight: 600; color: var(--pl-muted); cursor: pointer;
          transition: color 0.25s ease, transform 0.3s var(--ease);
        }
        .pl-tab:hover { color: var(--pl-accent); }
        .pl-tab:active { transform: scale(0.97); }
        .pl-tab.active { color: var(--pl-accent); }
        .pl-tab:focus-visible { outline: 2px solid var(--pl-accent); outline-offset: -2px; }

        /* ---------- Date groups ---------- */
        .pl-group { margin-bottom: 24px; }
        .pl-date {
          display: flex; align-items: center; gap: 10px; margin: 0 0 12px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
          color: var(--pl-text-2);
          animation: plFade 0.5s ease backwards;
        }
        .pl-date::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, var(--pl-border), transparent); }
        .pl-date.today { color: var(--pl-accent); }
        .pl-date-dot { position: relative; width: 8px; height: 8px; border-radius: 50%; background: var(--pl-accent); }
        .pl-date-dot::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: var(--pl-accent); animation: plPing 2s ease-out infinite; }

        /* ---------- Task row ---------- */
        .pl-row {
          --pc: var(--pl-accent);
          position: relative; overflow: hidden;
          display: flex; align-items: center; gap: 12px;
          padding: 13px 14px; margin-bottom: 10px;
          background: var(--pl-card); border: 1px solid var(--pl-border); border-radius: 14px;
          animation: plFadeUp 0.5s var(--ease) backwards;
          animation-delay: calc(min(var(--i, 0), 12) * 45ms + 120ms);
          transition: transform 0.35s var(--ease), border-color 0.3s ease, box-shadow 0.35s ease;
        }
        .pl-row > * { position: relative; z-index: 1; }
        /* priority-coloured wash sweeping from the left */
        .pl-row::before {
          content: ""; position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(90deg, color-mix(in srgb, var(--pc) 15%, transparent), color-mix(in srgb, var(--pc) 2%, transparent));
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.5s var(--ease);
        }
        .pl-row:hover {
          transform: translateX(5px);
          border-color: color-mix(in srgb, var(--pc) 55%, var(--pl-border));
          box-shadow: 0 10px 24px color-mix(in srgb, var(--pc) 18%, transparent);
        }
        .pl-row:hover::before { transform: scaleX(1); }
        .pl-row.done { opacity: 0.8; }
        .pl-row.done:hover { opacity: 1; }

        .pl-check {
          width: 22px; height: 22px; flex-shrink: 0; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          border-radius: 7px; border: 2px solid var(--pl-border); background: var(--pl-bg);
          transition: transform 0.3s var(--ease), border-color 0.25s ease, background 0.25s ease, box-shadow 0.3s ease;
        }
        .pl-check:hover {
          transform: scale(1.18);
          border-color: var(--pl-accent);
          background: color-mix(in srgb, var(--pl-accent) 14%, var(--pl-bg));
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--pl-accent) 14%, transparent);
        }
        .pl-check:active { transform: scale(0.9); }
        .pl-check:focus-visible { outline: 2px solid var(--pl-accent); outline-offset: 2px; }
        .pl-check-mark { color: #fff; font-size: 12px; font-weight: 800; animation: plPop 0.4s var(--ease); }

        .pl-pbar {
          width: 4px; height: 30px; flex-shrink: 0; border-radius: 3px;
          transition: width 0.3s var(--ease), box-shadow 0.3s ease, height 0.3s var(--ease);
        }
        .pl-row:hover .pl-pbar { width: 6px; height: 34px; box-shadow: 0 0 12px var(--pc); }

        .pl-body { flex: 1; min-width: 0; }
        .pl-task-title {
          margin: 0 0 5px; font-size: 14px; font-weight: 600; word-break: break-word;
          transition: transform 0.35s var(--ease), color 0.25s ease;
        }
        .pl-row:hover .pl-task-title { transform: translateX(2px); }
        .pl-chip {
          display: inline-block; padding: 2px 9px; border-radius: 20px;
          font-size: 10px; font-weight: 600; color: var(--pl-accent);
          background: color-mix(in srgb, var(--pl-accent) 11%, transparent);
          transition: background 0.3s ease, color 0.3s ease, transform 0.3s var(--ease);
        }
        .pl-row:hover .pl-chip { background: var(--pl-accent); color: #fff; transform: translateX(2px); }

        .pl-del {
          width: 34px; height: 34px; flex-shrink: 0; display: grid; place-items: center;
          border: 0; border-radius: 10px; background: transparent; cursor: pointer;
          font-size: 14px; filter: grayscale(1); opacity: 0.55;
          transition: background 0.25s ease, opacity 0.25s ease, filter 0.25s ease, transform 0.3s var(--ease);
        }
        .pl-del:hover { background: rgba(239, 68, 68, 0.14); opacity: 1; filter: none; transform: scale(1.1); }
        .pl-del:hover span { display: inline-block; animation: plWiggle 0.5s ease; }
        .pl-del:active { transform: scale(0.9); }
        .pl-del:focus-visible { outline: 2px solid #EF4444; outline-offset: 2px; }

        /* ---------- Empty + loading ---------- */
        .pl-empty {
          text-align: center; padding: 54px 20px;
          background: var(--pl-card); border: 1px dashed var(--pl-border); border-radius: 18px;
          animation: plFadeUp 0.5s var(--ease) backwards;
        }
        .pl-empty-icon { display: inline-block; margin-bottom: 10px; font-size: 38px; animation: plFloat 3.2s ease-in-out infinite; }
        .pl-empty p { margin: 0; font-size: 14px; color: var(--pl-muted); }

        .pl-loading-text { margin: 0 0 14px; font-size: 14px; color: var(--pl-muted); animation: plPulse 1.4s ease-in-out infinite; }
        .pl-skeleton {
          height: 56px; margin-bottom: 10px; border-radius: 14px;
          background: linear-gradient(90deg, var(--pl-border) 25%, color-mix(in srgb, var(--pl-accent) 14%, var(--pl-border)) 50%, var(--pl-border) 75%);
          background-size: 200% 100%; animation: plShimmer 1.4s linear infinite;
        }

        /* ---------- Mobile ---------- */
        @media (max-width: 600px) {
          .pl-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .pl-title { font-size: 21px; }
          .pl-header .pl-add { width: 100%; }
          .pl-form { padding: 16px; }
          .pl-input { font-size: 16px; }
          .pl-row { padding: 12px; gap: 10px; }
          .pl-tab { font-size: 12.5px; padding: 10px 6px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pl-root *, .pl-root *::before, .pl-root *::after {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="pl-root" data-theme={mode} style={rootVars}>
        {/* Header Block */}
        <div className="pl-header">
          <div>
            <h1 className="pl-title">📅 Study Planner</h1>
            <p className="pl-sub">Organize and monitor your operational academic progress</p>
          </div>
          <button className={`pl-add ${showForm ? "is-open" : ""}`} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Task"}
          </button>
        </div>

        {/* Dash Statistics Deck */}
        <div className="pl-stats">
          {STATS.map((s, i) => (
            <div key={s.label} className="pl-stat" style={{ "--sc": s.color, "--i": i }}>
              <div className="pl-stat-label">{s.label}</div>
              <div className="pl-stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Global Progress Line Bar */}
        {totalCount > 0 && (
          <div className="pl-progress">
            <div className="pl-progress-fill" style={{ width: `${completionPercentage}%` }} />
          </div>
        )}

        {error && <div className="pl-error">{error}</div>}

        {/* Creation Dialog Form Drawer */}
        {showForm && (
          <form onSubmit={handleAddTask} className="pl-form">
            <input
              className="pl-input"
              placeholder="What do you need to study?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginBottom: "10px" }}
              autoFocus
            />
            <div className="pl-form-row">
              <select className="pl-input" style={{ flex: "1 1 140px" }} value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="date"
                min={getLocalDateString()}
                className="pl-input"
                style={{ flex: "1 1 140px" }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <select className="pl-input" style={{ flex: "1 1 110px" }} value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
            </div>
            <button className="pl-add" type="submit" disabled={saving} style={{ width: "100%" }}>
              {saving ? "Adding..." : "Add Task"}
            </button>
          </form>
        )}

        {/* Section Navigation Tabs Control Row */}
        <div className="pl-tabs" role="tablist">
          <span className="pl-tab-ind" style={{ transform: activeTab === "active" ? "translateX(0)" : "translateX(100%)" }} />
          <button
            role="tab"
            aria-selected={activeTab === "active"}
            className={`pl-tab ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Active Tasks ({pendingCount})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "completed"}
            className={`pl-tab ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed History ({completedCount})
          </button>
        </div>

        {/* Task Lists Node Processor */}
        {loading ? (
          <>
            <p className="pl-loading-text">Loading tasks...</p>
            {[1, 2, 3].map((i) => <div key={i} className="pl-skeleton" />)}
          </>
        ) : currentViewTasks.length === 0 ? (
          <div className="pl-empty">
            <div className="pl-empty-icon">{activeTab === "active" ? "🎉" : "📭"}</div>
            <p>
              {activeTab === "active" 
                ? "No active remaining tasks found. Time to relax or schedule a new one!" 
                : "No items completed in this loop sequence yet."}
            </p>
          </div>
        ) : (
          sortedDateKeys.map((dateKey) => {
            const label = formatDateLabel(dateKey);
            return (
              <div key={dateKey} className="pl-group">
                <h3 className={`pl-date ${label === "Today" ? "today" : ""}`}>
                  {label === "Today" && <span className="pl-date-dot" />}
                  {label}
                </h3>
                {grouped[dateKey].map((task) => {
                  const pc = PRIORITY_COLORS[task.priority];
                  return (
                    <div
                      key={task._id}
                      className={`pl-row ${task.completed ? "done" : ""}`}
                      style={{ "--pc": pc, "--i": rowCounter++ }}
                    >
                      <div
                        className="pl-check"
                        role="checkbox"
                        aria-checked={!!task.completed}
                        tabIndex={0}
                        onClick={() => toggleComplete(task._id)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleComplete(task._id); } }}
                        style={{
                          background: task.completed ? c.accent : undefined,
                          borderColor: task.completed ? c.accent : undefined,
                        }}
                      >
                        {task.completed && <span className="pl-check-mark">✓</span>}
                      </div>

                      <div className="pl-pbar" style={{ background: pc }} />

                      <div className="pl-body">
                        <p
                          className="pl-task-title"
                          style={{
                            color: task.completed ? c.textFaint : c.text,
                            textDecoration: task.completed ? "line-through" : "none",
                          }}
                        >
                          {task.title}
                        </p>
                        <span className="pl-chip">{task.subject}</span>
                      </div>

                      <button className="pl-del" onClick={() => handleDelete(task._id)} title="Delete task">
                        <span>🗑️</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
}

export default Planner;