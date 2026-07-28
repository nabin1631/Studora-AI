import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import api from "../services/api";

const SUBJECTS = ["General", "Math", "Physics", "Chemistry", "Biology", "English", "Computer Science", "Other"];
const PRIORITY_COLORS = { low: "#22C55E", medium: "#EAB308", high: "#EF4444" };

function Planner() {
  const { colors: c } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("active"); // "active" | "completed"

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("General");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
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

  return (
    <Layout>
      <style>{`
        .planner-input {
          width: 100%; padding: 9px 12px; background: ${c.bg}; border: 1px solid ${c.border};
          border-radius: 9px; color: ${c.text}; font-size: 13px; outline: none;
          box-sizing: border-box; transition: border-color .2s;
        }
        .planner-input:focus { border-color: ${c.accent}; }
        .planner-input::placeholder { color: ${c.textFaint}; }
        
        .add-task-btn {
          padding: 10px 18px; background: linear-gradient(135deg, ${c.accent}, #5B4FE0);
          color: #fff; border: none; border-radius: 10px; font-size: 13px;
          font-weight: 600; cursor: pointer; transition: transform .15s, opacity .15s;
        }
        .add-task-btn:hover { opacity: .92; transform: translateY(-1px); }
        
        .stat-card {
          background: ${c.bgCard}; border: 1px solid ${c.border}; border-radius: 14px;
          padding: 14px 16px; flex: 1; min-width: 120px; text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        
        .tab-btn {
          background: none; border: none; padding: 8px 16px; font-size: 14px;
          font-weight: 600; color: ${c.textMuted}; cursor: pointer; position: relative;
          transition: color .2s;
        }
        .tab-btn.active { color: ${c.accent}; }
        .tab-btn.active::after {
          content: ""; position: absolute; bottom: -2px; left: 16px; right: 16px;
          height: 3px; background: ${c.accent}; border-radius: 2px;
        }

        .task-row {
          display: flex; align-items: center; gap: 12px; padding: 12px 14px;
          background: ${c.bgCard}; border: 1px solid ${c.border}; border-radius: 12px;
          margin-bottom: 8px; transition: all .15s;
        }
        .task-row:hover { border-color: ${c.accent}55; }
        
        .task-checkbox {
          width: 20px; height: 20px; border-radius: 6px; border: 2px solid ${c.border};
          cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          transition: all .15s; background: ${c.bg};
        }
        
        .delete-task-btn {
          background: none; border: none; cursor: pointer; color: ${c.textFaint};
          font-size: 14px; padding: 4px; transition: color .15s;
        }
        .delete-task-btn:hover { color: #EF4444; }
      `}</style>

      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        {/* Header Block */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ color: c.text, fontSize: "22px", fontWeight: "700", margin: "0 0 4px" }}>📅 Study Planner</h1>
            <p style={{ color: c.textMuted, fontSize: "13px", margin: 0 }}>Organize and monitor your operational academic progress</p>
          </div>
          <button className="add-task-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Task"}
          </button>
        </div>

        {/* Dash Statistics Deck */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
          <div className="stat-card">
            <div style={{ fontSize: "11px", fontWeight: "600", color: c.textMuted, textTransform: "uppercase", marginBottom: "4px" }}>Total</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: c.text }}>{totalCount}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#EAB308", textTransform: "uppercase", marginBottom: "4px" }}>Pending</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#EAB308" }}>{pendingCount}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#22C55E", textTransform: "uppercase", marginBottom: "4px" }}>Completed</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#22C55E" }}>{completedCount}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: "11px", fontWeight: "600", color: c.accent, textTransform: "uppercase", marginBottom: "4px" }}>Progress</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: c.accent }}>{completionPercentage}%</div>
          </div>
        </div>

        {/* Global Progress Line Bar */}
        {totalCount > 0 && (
          <div style={{ background: c.border, borderRadius: "20px", height: "8px", marginBottom: "24px", overflow: "hidden" }}>
            <div style={{
              width: `${completionPercentage}%`, height: "100%",
              background: `linear-gradient(90deg, ${c.accent}, #5B4FE0)`, transition: "width .4s cubic-bezier(0.4, 0, 0.2, 1)",
            }} />
          </div>
        )}

        {error && (
          <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: "9px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {/* Creation Dialog Form Drawer */}
        {showForm && (
          <form onSubmit={handleAddTask} style={{
            background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: "14px",
            padding: "18px", marginBottom: "24px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)"
          }}>
            <input
              className="planner-input"
              placeholder="What do you need to study?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginBottom: "10px" }}
              autoFocus
            />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
              <select className="planner-input" style={{ flex: "1 1 140px" }} value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="date"
                className="planner-input"
                style={{ flex: "1 1 140px" }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <select className="planner-input" style={{ flex: "1 1 110px" }} value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
            </div>
            <button className="add-task-btn" type="submit" disabled={saving} style={{ width: "100%" }}>
              {saving ? "Adding..." : "Add Task"}
            </button>
          </form>
        )}

        {/* Section Navigation Tabs Control Row */}
        <div style={{ display: "flex", gap: "8px", borderBottom: `2px solid ${c.border}`, marginBottom: "18px", paddingBottom: "2px" }}>
          <button 
            className={`tab-btn ${activeTab === "active" ? "active" : ""}`} 
            onClick={() => setActiveTab("active")}
          >
            Active Tasks ({pendingCount})
          </button>
          <button 
            className={`tab-btn ${activeTab === "completed" ? "active" : ""}`} 
            onClick={() => setActiveTab("completed")}
          >
            Completed History ({completedCount})
          </button>
        </div>

        {/* Task Lists Node Processor */}
        {loading ? (
          <p style={{ color: c.textMuted, fontSize: "14px" }}>Loading tasks...</p>
        ) : currentViewTasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px", background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: "16px" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>{activeTab === "active" ? "🎉" : "📭"}</div>
            <p style={{ color: c.textMuted, fontSize: "14px", margin: 0 }}>
              {activeTab === "active" 
                ? "No active remaining tasks found. Time to relax or schedule a new one!" 
                : "No items completed in this loop sequence yet."}
            </p>
          </div>
        ) : (
          sortedDateKeys.map((dateKey) => (
            <div key={dateKey} style={{ marginBottom: "22px" }}>
              <h3 style={{ color: c.textSecondary, fontSize: "12px", fontWeight: "600", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {formatDateLabel(dateKey)}
              </h3>
              {grouped[dateKey].map((task) => (
                <div key={task._id} className="task-row" style={{ opacity: task.completed ? 0.8 : 1 }}>
                  <div
                    className="task-checkbox"
                    onClick={() => toggleComplete(task._id)}
                    style={{
                      background: task.completed ? c.accent : c.bg,
                      borderColor: task.completed ? c.accent : c.border,
                    }}
                  >
                    {task.completed && <span style={{ color: "#fff", fontSize: "12px", fontWeight: "700" }}>✓</span>}
                  </div>

                  <div style={{ width: "4px", height: "28px", borderRadius: "2px", background: PRIORITY_COLORS[task.priority], flexShrink: 0 }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: "0 0 4px 0", fontSize: "14px", color: task.completed ? c.textFaint : c.text,
                      textDecoration: task.completed ? "line-through" : "none", fontWeight: "500",
                    }}>
                      {task.title}
                    </p>
                    <span style={{ fontSize: "10px", color: c.accent, background: `${c.accent}1A`, padding: "2px 8px", borderRadius: "20px", fontWeight: "500" }}>
                      {task.subject}
                    </span>
                  </div>

                  <button className="delete-task-btn" onClick={() => handleDelete(task._id)} title="Delete task">
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default Planner;