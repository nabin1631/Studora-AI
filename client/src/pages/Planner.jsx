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

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("General");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const grouped = tasks.reduce((acc, task) => {
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

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ color: c.text, fontSize: "20px", fontWeight: "700", margin: "0 0 4px" }}>📅 Study Planner</h1>
            <p style={{ color: c.textMuted, fontSize: "13px", margin: 0 }}>
              {totalCount === 0 ? "No tasks yet" : `${completedCount} of ${totalCount} tasks completed`}
            </p>
          </div>
          <button className="add-task-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Task"}
          </button>
        </div>

        {totalCount > 0 && (
          <div style={{ background: c.border, borderRadius: "20px", height: "6px", marginBottom: "20px", overflow: "hidden" }}>
            <div style={{
              width: `${(completedCount / totalCount) * 100}%`, height: "100%",
              background: `linear-gradient(90deg, ${c.accent}, #5B4FE0)`, transition: "width .3s",
            }} />
          </div>
        )}

        {error && (
          <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: "9px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleAddTask} style={{
            background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: "14px",
            padding: "18px", marginBottom: "20px",
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

        {loading ? (
          <p style={{ color: c.textMuted, fontSize: "14px" }}>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: "16px" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
            <p style={{ color: c.textMuted, fontSize: "14px", margin: 0 }}>
              No tasks yet — add one to start planning your studies!
            </p>
          </div>
        ) : (
          sortedDateKeys.map((dateKey) => (
            <div key={dateKey} style={{ marginBottom: "22px" }}>
              <h3 style={{ color: c.textSecondary, fontSize: "13px", fontWeight: "600", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {formatDateLabel(dateKey)}
              </h3>
              {grouped[dateKey].map((task) => (
                <div key={task._id} className="task-row">
                  <div
                    className="task-checkbox"
                    onClick={() => toggleComplete(task._id)}
                    style={{
                      background: task.completed ? c.accent : c.bg,
                      borderColor: task.completed ? c.accent : c.border,
                    }}
                  >
                    {task.completed && <span style={{ color: "#fff", fontSize: "12px" }}>✓</span>}
                  </div>

                  <div style={{ width: "4px", height: "28px", borderRadius: "2px", background: PRIORITY_COLORS[task.priority], flexShrink: 0 }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontSize: "14px", color: task.completed ? c.textFaint : c.text,
                      textDecoration: task.completed ? "line-through" : "none", fontWeight: "500",
                    }}>
                      {task.title}
                    </p>
                    <span style={{ fontSize: "11px", color: c.accent, background: `${c.accent}1A`, padding: "2px 8px", borderRadius: "20px", fontWeight: "500" }}>
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