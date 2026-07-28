import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import api from "../services/api";

function Analytics() {
  const { colors: c } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/analytics");
      setData(res.data.analytics);
    } catch {
      console.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics();
  }, []);

  const PRIORITY_COLORS = {
    low: "#22C55E",
    medium: "#EAB308",
    high: "#EF4444",
  };

  const SUBJECT_COLORS = [
    "#7C6CF0", "#06B6D4", "#10B981", "#F59E0B",
    "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6",
  ];

  if (loading) {
    return (
      <Layout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
          <p style={{ color: c.textMuted, fontSize: "14px" }}>Loading analytics...</p>
        </div>
      </Layout>
    );
  }

  const subjectEntries = Object.entries(data?.notesBySubject || {});
  const taskSubjectEntries = Object.entries(data?.tasksBySubject || {});
  const maxNoteCount = Math.max(...subjectEntries.map(([, v]) => v), 1);
  const maxDayCount = Math.max(...(data?.last7Days || []).map(d => d.count), 1);

  return (
    <Layout>
      <style>{`
        .analytics-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 16px;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        .analytics-card {
          background: ${c.bgCard}; 
          border: 1px solid ${c.border};
          border-radius: 14px; 
          padding: 20px;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
        }
        .stats-grid {
          display: grid;
          /* Force exactly 6 columns on desktop so 'Due This Week' never drops down */
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .stats-card {
          background: ${c.bgCard};
          border: 1px solid ${c.border};
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
        }
        .dashboard-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }
        .subject-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        .subject-card {
          background: ${c.bg};
          border: 1px solid ${c.border};
          border-radius: 10px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s ease;
        }
        .action-btn {
          margin-top: 8px;
          padding: 7px 14px;
          background: ${c.accent};
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s ease, transform 0.1s ease;
        }
        .action-btn:active {
          transform: scale(0.97);
        }

        /* Responsive Breakpoint for smaller screens/tablets if 6 columns get too squeezed */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Mobile Adjustments (Max Width 767px) */
        @media (max-width: 767px) {
          .analytics-container {
            padding: 16px;
          }
          .header-section {
            margin-bottom: 24px !important;
          }
          .header-title {
            font-size: 22px !important;
            letter-spacing: -0.4px;
          }
          .header-desc {
            font-size: 14px !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
            margin-bottom: 24px !important;
          }
          .stats-card {
            height: 96px !important;
            border-radius: 20px !important;
            border: 1px solid ${c.border} !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
            padding: 14px 16px !important;
          }
          .stats-card-top {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          .stats-card-icon {
            font-size: 18px !important;
            margin-bottom: 0 !important;
          }
          .stats-card-value {
            font-size: 22px !important;
            font-weight: 700 !important;
            margin-bottom: 0 !important;
            letter-spacing: -0.5px;
          }
          .stats-card-label {
            font-size: 12px !important;
            font-weight: 500 !important;
            color: ${c.textMuted} !important;
          }
          .stats-card:active, .analytics-card:active, .subject-card:active {
            transform: scale(0.98);
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02) !important;
          }
          .dashboard-row {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            margin-bottom: 16px !important;
          }
          .analytics-card {
            border-radius: 20px !important;
            padding: 20px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
          }
          .analytics-card h3 {
            font-size: 15px !important;
            font-weight: 600 !important;
            letter-spacing: -0.2px;
          }
          .subject-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .subject-card {
            border-radius: 14px !important;
            padding: 14px !important;
          }
          .action-btn {
            height: 44px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 14px !important;
            border-radius: 12px !important;
            width: 100% !important;
            margin-top: 14px !important;
          }
        }
      `}</style>

      <div className="analytics-container">
        {/* Header */}
        <div className="header-section" style={{ marginBottom: "20px" }}>
          <h1 className="header-title" style={{ color: c.text, fontSize: "20px", fontWeight: "700", margin: "0 0 4px" }}>
            📊 Learning Analytics
          </h1>
          <p className="header-desc" style={{ color: c.textMuted, fontSize: "13px", margin: 0 }}>
            Track your study habits and progress
          </p>
        </div>

        {/* Top stat cards */}
        <div className="stats-grid">
          {[
            { label: "Total Notes", value: data?.totalNotes, icon: "📝", color: "#7C6CF0" },
            { label: "Important Notes", value: data?.importantNotes, icon: "⭐", color: "#F59E0B" },
            { label: "Total Tasks", value: data?.totalTasks, icon: "📅", color: "#06B6D4" },
            { label: "Tasks Completed", value: data?.completedTasks, icon: "✅", color: "#22C55E" },
            { label: "Completion Rate", value: `${data?.completionRate}%`, icon: "🎯", color: "#8B5CF6" },
            { label: "Due This Week", value: data?.tasksDueThisWeek, icon: "⏳", color: "#EF4444" },
          ].map((s) => (
            <div key={s.label} className="stats-card">
              <div className="stats-card-top">
                <div className="stats-card-icon" style={{ fontSize: "22px", marginBottom: "8px" }}>{s.icon}</div>
                <div className="stats-card-value" style={{ fontSize: "24px", fontWeight: "800", color: s.color, marginBottom: "2px" }}>
                  {s.value ?? "—"}
                </div>
              </div>
              <div className="stats-card-label" style={{ fontSize: "11px", color: c.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Middle row */}
        <div className="dashboard-row">
          {/* Notes activity - last 7 days bar chart */}
          <div className="analytics-card">
            <h3 style={{ color: c.text, fontSize: "14px", fontWeight: "600", margin: "0 0 16px" }}>
              📈 Notes Activity (Last 7 Days)
            </h3>
            {data?.last7Days?.every(d => d.count === 0) ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ fontSize: "28px", margin: "0 0 6px" }}>📭</p>
                <p style={{ color: c.textMuted, fontSize: "12px", margin: 0 }}>No notes created this week</p>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px" }}>
                {(data?.last7Days || []).map((day, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                      <div style={{
                        width: "100%",
                        height: day.count === 0 ? "4px" : `${(day.count / maxDayCount) * 100}%`,
                        background: day.count === 0
                          ? c.border
                          : `linear-gradient(180deg, ${c.accent}, #5B4FE0)`,
                        borderRadius: "6px 6px 0 0",
                        transition: "height .5s ease",
                        position: "relative",
                      }}>
                        {day.count > 0 && (
                          <div style={{
                            position: "absolute", top: "-18px", left: "50%",
                            transform: "translateX(-50%)", fontSize: "10px",
                            color: c.accent, fontWeight: "700",
                          }}>
                            {day.count}
                          </div>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: "10px", color: c.textMuted }}>{day.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task completion donut-style */}
          <div className="analytics-card">
            <h3 style={{ color: c.text, fontSize: "14px", fontWeight: "600", margin: "0 0 16px" }}>
              🎯 Task Completion
            </h3>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{
                width: 100, height: 100, borderRadius: "50%", margin: "0 auto 10px",
                background: `conic-gradient(${c.accent} ${data?.completionRate ?? 0}%, ${c.border} 0%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: c.bgCard, display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column",
                }}>
                  <span style={{ fontSize: "18px", fontWeight: "800", color: c.accent }}>
                    {data?.completionRate ?? 0}%
                  </span>
                </div>
              </div>
              <p style={{ color: c.textMuted, fontSize: "12px", margin: 0 }}>Overall completion rate</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(data?.tasksByPriority || {}).map(([priority, count]) => (
                <div key={priority} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: PRIORITY_COLORS[priority], flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", color: c.textSecondary, flex: 1, textTransform: "capitalize" }}>{priority} priority</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: c.text }}>{count} tasks</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="dashboard-row">
          {/* Notes by subject */}
          <div className="analytics-card">
            <h3 style={{ color: c.text, fontSize: "14px", fontWeight: "600", margin: "0 0 16px" }}>
              📚 Notes by Subject
            </h3>
            {subjectEntries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ color: c.textMuted, fontSize: "12px" }}>No notes yet</p>
                <button className="action-btn" onClick={() => navigate("/notes")}>Create a note →</button>
              </div>
            ) : (
              <div className="subject-grid">
                {subjectEntries.sort(([,a],[,b]) => b - a).map(([subject, count], i) => {
                  const itemColor = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
                  return (
                    <div key={subject} className="subject-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {subject}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: itemColor, background: `${itemColor}15`, padding: "2px 6px", borderRadius: "6px", flexShrink: 0 }}>
                          {count} {count === 1 ? "note" : "notes"}
                        </span>
                      </div>
                      <div style={{ background: c.border, borderRadius: "20px", height: "6px", overflow: "hidden", marginTop: "4px" }}>
                        <div style={{
                          width: `${(count / maxNoteCount) * 100}%`,
                          height: "100%",
                          background: itemColor,
                          borderRadius: "20px",
                          transition: "width .6s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tasks by subject */}
          <div className="analytics-card">
            <h3 style={{ color: c.text, fontSize: "14px", fontWeight: "600", margin: "0 0 16px" }}>
              ✅ Task Progress by Subject
            </h3>
            {taskSubjectEntries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ color: c.textMuted, fontSize: "12px" }}>No tasks yet</p>
                <button className="action-btn" onClick={() => navigate("/planner")}>Add a task →</button>
              </div>
            ) : (
              <div className="subject-grid">
                {taskSubjectEntries.sort(([,a],[,b]) => b.total - a.total).map(([subject, val], i) => {
                  const pct = Math.round((val.completed / val.total) * 100);
                  const itemColor = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
                  return (
                    <div key={subject} className="subject-card">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {subject}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: itemColor, background: `${itemColor}15`, padding: "2px 6px", borderRadius: "6px", flexShrink: 0 }}>
                          {val.completed}/{val.total} ({pct}%)
                        </span>
                      </div>
                      <div style={{ background: c.border, borderRadius: "20px", height: "6px", overflow: "hidden", marginTop: "4px" }}>
                        <div style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: itemColor,
                          borderRadius: "20px",
                          transition: "width .6s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Analytics;