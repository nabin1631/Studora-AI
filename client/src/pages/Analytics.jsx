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

  // Theme tokens exposed as CSS variables so every style adapts to dark/light automatically.
  const themeVars = {
    "--an-bg": c.bg,
    "--an-card": c.bgCard,
    "--an-border": c.border,
    "--an-text": c.text,
    "--an-muted": c.textMuted,
    "--an-secondary": c.textSecondary || c.textMuted,
    "--an-accent": c.accent,
  };

  if (loading) {
    return (
      <Layout>
        <style>{`
          @keyframes anSpin { to { transform: rotate(360deg); } }
          @media (prefers-reduced-motion: reduce) { .an-spinner { animation-duration: 2s !important; } }
        `}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", height: "60vh" }}>
          <div
            className="an-spinner"
            style={{
              width: 34, height: 34, borderRadius: "50%",
              border: `3px solid ${c.border}`, borderTopColor: c.accent,
              animation: "anSpin 0.8s linear infinite",
            }}
          />
          <p style={{ color: c.textMuted, fontSize: "14px", margin: 0 }}>Loading analytics...</p>
        </div>
      </Layout>
    );
  }

  const subjectEntries = Object.entries(data?.notesBySubject || {});
  const taskSubjectEntries = Object.entries(data?.tasksBySubject || {});
  const maxNoteCount = Math.max(...subjectEntries.map(([, v]) => v), 1);
  const maxDayCount = Math.max(...(data?.last7Days || []).map(d => d.count), 1);

  // Donut ring geometry (display only; completionRate itself comes from the API untouched)
  const RING_R = 58;
  const RING_C = 2 * Math.PI * RING_R;
  const ringRate = Math.min(100, Math.max(0, Number(data?.completionRate) || 0));
  const ringOffset = RING_C * (1 - ringRate / 100);

  const statCards = [
    { label: "Total Notes", value: data?.totalNotes, icon: "📝", color: "#7C6CF0" },
    { label: "Important Notes", value: data?.importantNotes, icon: "⭐", color: "#F59E0B" },
    { label: "Total Tasks", value: data?.totalTasks, icon: "📅", color: "#06B6D4" },
    { label: "Tasks Completed", value: data?.completedTasks, icon: "✅", color: "#22C55E" },
    { label: "Completion Rate", value: `${data?.completionRate}%`, icon: "🎯", color: "#8B5CF6" },
    { label: "Due This Week", value: data?.tasksDueThisWeek, icon: "⏳", color: "#EF4444" },
  ];

  return (
    <Layout>
      <style>{`
        /* ============ Keyframes ============ */
        @keyframes anRise { from { opacity: 0; transform: translateY(16px); } }
        @keyframes anFade { from { opacity: 0; } }
        @keyframes anGrowY { from { transform: scaleY(0); } }
        @keyframes anGrowX { from { transform: scaleX(0); } }
        @keyframes anRing { from { stroke-dashoffset: var(--an-circ); } }
        @keyframes anPop { from { opacity: 0; transform: scale(0.85); } }

        /* ============ Container ============ */
        .an-container {
          position: relative;
          isolation: isolate;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 4px 0 24px;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
          animation: anFade 0.5s ease both;
        }
        .an-container *, .an-container *::before, .an-container *::after { box-sizing: border-box; }

        /* soft ambient glow behind the page header */
        .an-container::before {
          content: "";
          position: absolute;
          z-index: -1;
          top: -28px; left: -24px; right: -24px;
          height: 340px;
          pointer-events: none;
          background:
            radial-gradient(55% 100% at 12% 0%, color-mix(in srgb, var(--an-accent) 15%, transparent), transparent 70%),
            radial-gradient(45% 90% at 92% 0%, color-mix(in srgb, #06B6D4 11%, transparent), transparent 70%);
        }

        /* ============ Header ============ */
        .an-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 26px;
          animation: anRise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .an-header-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 23px;
          flex-shrink: 0;
          background: linear-gradient(135deg,
            color-mix(in srgb, var(--an-accent) 22%, transparent),
            color-mix(in srgb, #06B6D4 18%, transparent));
          border: 1px solid color-mix(in srgb, var(--an-accent) 30%, transparent);
          box-shadow: 0 8px 22px -8px color-mix(in srgb, var(--an-accent) 50%, transparent);
        }
        .an-title {
          margin: 0 0 4px;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.15;
          background: linear-gradient(90deg, var(--an-text) 35%, var(--an-accent));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: var(--an-text);
        }
        .an-subtitle {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: var(--an-muted);
        }

        /* ============ Stat cards ============ */
        .an-stats {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }
        .an-stat {
          --ic: var(--an-accent);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 16px;
          border-radius: 18px;
          border: 1px solid var(--an-border);
          background: linear-gradient(160deg, color-mix(in srgb, var(--ic) 9%, var(--an-card)), var(--an-card) 70%);
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05), 0 10px 26px -16px rgba(15, 23, 42, 0.28);
          animation: anRise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--i, 0) * 70ms + 120ms);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.3s ease;
        }
        .an-stat::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--ic), transparent 85%);
          opacity: 0.9;
        }
        .an-stat::after {
          content: "";
          position: absolute;
          width: 120px; height: 120px;
          right: -44px; top: -52px;
          border-radius: 50%;
          background: radial-gradient(circle, color-mix(in srgb, var(--ic) 34%, transparent), transparent 70%);
          pointer-events: none;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
          opacity: 0.8;
        }
        .an-stat:hover {
          transform: translateY(-5px);
          border-color: color-mix(in srgb, var(--ic) 45%, var(--an-border));
          box-shadow: 0 18px 38px -16px color-mix(in srgb, var(--ic) 55%, transparent);
        }
        .an-stat:hover::after { transform: scale(1.35); opacity: 1; }
        .an-stat-icon {
          position: relative;
          z-index: 1;
          width: 40px; height: 40px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 19px;
          background: linear-gradient(135deg,
            color-mix(in srgb, var(--ic) 26%, transparent),
            color-mix(in srgb, var(--ic) 10%, transparent));
          border: 1px solid color-mix(in srgb, var(--ic) 32%, transparent);
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .an-stat:hover .an-stat-icon { transform: scale(1.1) rotate(-6deg); }
        .an-stat-body { position: relative; z-index: 1; min-width: 0; }
        .an-stat-value {
          display: block;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          background: linear-gradient(135deg, var(--ic), color-mix(in srgb, var(--ic) 55%, var(--an-text)));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: var(--ic);
        }
        .an-stat-label {
          display: block;
          margin-top: 5px;
          font-size: 12px;
          font-weight: 600;
          color: var(--an-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ============ Section cards ============ */
        .an-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
          gap: 18px;
          margin-bottom: 18px;
        }
        .an-card {
          position: relative;
          overflow: hidden;
          padding: 22px;
          border-radius: 20px;
          border: 1px solid var(--an-border);
          background: linear-gradient(180deg, color-mix(in srgb, var(--an-accent) 5%, var(--an-card)), var(--an-card) 55%);
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05), 0 14px 34px -22px rgba(15, 23, 42, 0.32);
          animation: anRise 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: var(--d, 0ms);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.3s ease;
        }
        /* thin glowing edge along the top of each card */
        .an-card::before {
          content: "";
          position: absolute;
          top: 0; left: 12%; right: 12%;
          height: 1px;
          background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--an-accent) 70%, transparent), transparent);
          opacity: 0.7;
        }
        .an-card:hover {
          transform: translateY(-3px);
          border-color: color-mix(in srgb, var(--an-accent) 38%, var(--an-border));
          box-shadow: 0 22px 44px -22px color-mix(in srgb, var(--an-accent) 45%, transparent);
        }
        .an-card-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .an-card-icon {
          width: 34px; height: 34px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          background: color-mix(in srgb, var(--an-accent) 14%, transparent);
          border: 1px solid color-mix(in srgb, var(--an-accent) 24%, transparent);
        }
        .an-card-title {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--an-text);
        }

        /* ============ Notes activity chart ============ */
        .an-chart {
          position: relative;
          display: flex;
          align-items: stretch;
          gap: 10px;
          height: 190px;
          padding-top: 6px;
        }
        .an-chart-grid {
          position: absolute;
          left: 0; right: 0; top: 6px; bottom: 26px;
          pointer-events: none;
          background-image: repeating-linear-gradient(
            to bottom,
            color-mix(in srgb, var(--an-border) 80%, transparent) 0,
            color-mix(in srgb, var(--an-border) 80%, transparent) 1px,
            transparent 1px,
            transparent 25%
          );
          opacity: 0.7;
        }
        .an-col {
          position: relative;
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          height: 100%;
          cursor: default;
        }
        .an-col-track {
          position: relative;
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .an-bar-wrap {
          position: relative;
          width: 100%;
          max-width: 46px;
        }
        .an-bar {
          width: 100%;
          height: 100%;
          border-radius: 10px 10px 4px 4px;
          background: linear-gradient(180deg, #22D3EE 0%, var(--an-accent) 55%, #5B4FE0 100%);
          box-shadow: 0 8px 18px -8px color-mix(in srgb, var(--an-accent) 70%, transparent);
          transform-origin: bottom;
          animation: anGrowY 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--i, 0) * 70ms + 250ms);
          transition: filter 0.25s ease, box-shadow 0.25s ease;
        }
        .an-bar.is-empty {
          background: var(--an-border);
          box-shadow: none;
          border-radius: 4px;
          animation: none;
        }
        .an-col:hover .an-bar:not(.is-empty) {
          filter: brightness(1.12) saturate(1.1);
          box-shadow: 0 12px 24px -8px color-mix(in srgb, var(--an-accent) 85%, transparent);
        }
        .an-bar-count {
          position: absolute;
          top: -26px;
          left: 50%;
          transform: translateX(-50%);
          min-width: 22px;
          padding: 2px 7px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          text-align: center;
          color: var(--an-accent);
          background: color-mix(in srgb, var(--an-accent) 14%, var(--an-card));
          border: 1px solid color-mix(in srgb, var(--an-accent) 28%, transparent);
          animation: anPop 0.5s ease both;
          animation-delay: calc(var(--i, 0) * 70ms + 800ms);
          transition: transform 0.25s ease;
        }
        .an-col:hover .an-bar-count { transform: translateX(-50%) translateY(-3px); }
        .an-day {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--an-muted);
          transition: color 0.2s ease;
        }
        .an-col:hover .an-day { color: var(--an-text); }

        /* ============ Empty states ============ */
        .an-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 8px;
          padding: 30px 16px;
          border-radius: 16px;
          border: 1.5px dashed color-mix(in srgb, var(--an-border) 90%, var(--an-accent));
          background: color-mix(in srgb, var(--an-accent) 4%, transparent);
        }
        .an-empty-icon {
          width: 56px; height: 56px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
          background: color-mix(in srgb, var(--an-accent) 12%, transparent);
          margin-bottom: 2px;
        }
        .an-empty-text {
          margin: 0;
          font-size: 13px;
          font-weight: 500;
          color: var(--an-muted);
        }

        /* ============ Donut ============ */
        .an-donut-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 22px;
        }
        .an-donut {
          position: relative;
          width: 164px;
          height: 164px;
          margin-bottom: 12px;
          filter: drop-shadow(0 10px 22px color-mix(in srgb, var(--an-accent) 35%, transparent));
        }
        .an-donut svg { width: 100%; height: 100%; transform: rotate(-90deg); display: block; }
        .an-ring-track { stroke: var(--an-border); opacity: 0.8; }
        .an-ring-fill {
          stroke-linecap: round;
          animation: anRing 1.5s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: 0.35s;
        }
        .an-donut-inner {
          position: absolute;
          inset: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          background: radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--an-accent) 8%, var(--an-card)), var(--an-card) 75%);
          border: 1px solid color-mix(in srgb, var(--an-border) 80%, transparent);
          box-shadow: inset 0 2px 10px rgba(15, 23, 42, 0.06);
        }
        .an-donut-pct {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          background: linear-gradient(135deg, var(--an-accent), #22D3EE);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: var(--an-accent);
        }
        .an-donut-caption {
          margin: 0;
          font-size: 13px;
          font-weight: 500;
          color: var(--an-muted);
        }

        .an-priority-list { display: flex; flex-direction: column; gap: 8px; }
        .an-priority {
          --pc: var(--an-accent);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--pc) 20%, var(--an-border));
          background: linear-gradient(90deg, color-mix(in srgb, var(--pc) 9%, transparent), transparent 80%);
          animation: anRise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--i, 0) * 80ms + 500ms);
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .an-priority:hover {
          transform: translateX(4px);
          border-color: color-mix(in srgb, var(--pc) 50%, var(--an-border));
        }
        .an-priority-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          background: var(--pc);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--pc) 20%, transparent), 0 0 12px color-mix(in srgb, var(--pc) 60%, transparent);
        }
        .an-priority-name {
          flex: 1;
          font-size: 13px;
          font-weight: 600;
          text-transform: capitalize;
          color: var(--an-secondary);
        }
        .an-priority-count {
          font-size: 12px;
          font-weight: 700;
          color: var(--pc);
          background: color-mix(in srgb, var(--pc) 14%, transparent);
          padding: 3px 10px;
          border-radius: 999px;
          white-space: nowrap;
        }

        /* ============ Subject cards ============ */
        .an-subject-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr));
          gap: 12px;
        }
        .an-subject {
          --ic: var(--an-accent);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 14px 14px 18px;
          border-radius: 14px;
          border: 1px solid var(--an-border);
          background: linear-gradient(135deg,
            color-mix(in srgb, var(--ic) 8%, color-mix(in srgb, var(--an-bg) 60%, var(--an-card))),
            color-mix(in srgb, var(--an-bg) 60%, var(--an-card)) 75%);
          animation: anRise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--i, 0) * 55ms + 350ms);
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.25s ease, box-shadow 0.3s ease;
        }
        .an-subject::before {
          content: "";
          position: absolute;
          left: 0; top: 12px; bottom: 12px;
          width: 4px;
          border-radius: 0 4px 4px 0;
          background: linear-gradient(180deg, var(--ic), color-mix(in srgb, var(--ic) 40%, transparent));
        }
        .an-subject:hover {
          transform: translateY(-3px);
          border-color: color-mix(in srgb, var(--ic) 50%, var(--an-border));
          box-shadow: 0 14px 28px -16px color-mix(in srgb, var(--ic) 60%, transparent);
        }
        .an-subject-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .an-subject-name {
          min-width: 0;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--an-text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .an-badge {
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 700;
          color: var(--ic);
          background: color-mix(in srgb, var(--ic) 15%, transparent);
          border: 1px solid color-mix(in srgb, var(--ic) 26%, transparent);
          padding: 3px 8px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .an-track {
          height: 8px;
          border-radius: 999px;
          overflow: hidden;
          background: color-mix(in srgb, var(--an-border) 85%, transparent);
        }
        .an-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, color-mix(in srgb, var(--ic) 70%, #fff), var(--ic));
          box-shadow: 0 0 10px color-mix(in srgb, var(--ic) 55%, transparent);
          transform-origin: left;
          animation: anGrowX 1s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--i, 0) * 60ms + 550ms);
        }

        /* ============ Buttons ============ */
        .an-btn {
          margin-top: 6px;
          padding: 9px 18px;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(135deg, var(--an-accent), color-mix(in srgb, var(--an-accent) 60%, #22D3EE));
          box-shadow: 0 8px 18px -8px color-mix(in srgb, var(--an-accent) 80%, transparent);
          transition: transform 0.2s ease, box-shadow 0.25s ease, filter 0.2s ease;
        }
        .an-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.06);
          box-shadow: 0 12px 24px -8px color-mix(in srgb, var(--an-accent) 90%, transparent);
        }
        .an-btn:active { transform: scale(0.97); }
        .an-btn:focus-visible { outline: 2px solid var(--an-accent); outline-offset: 2px; }

        /* ============ Responsive ============ */
        @media (max-width: 1359px) {
          .an-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }

        @media (max-width: 767px) {
          .an-container::before { left: -16px; right: -16px; }
          .an-header { gap: 12px; margin-bottom: 20px; }
          .an-header-icon { width: 42px; height: 42px; font-size: 20px; border-radius: 12px; }
          .an-title { font-size: 22px; }
          .an-subtitle { font-size: 13px; }

          .an-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
          .an-stat { padding: 14px; gap: 10px; border-radius: 16px; }
          .an-stat-icon { width: 36px; height: 36px; font-size: 17px; border-radius: 11px; }
          .an-stat-value { font-size: 26px; }
          .an-stat-label { font-size: 11.5px; }
          .an-stat:active, .an-card:active, .an-subject:active { transform: scale(0.98); }

          .an-row { grid-template-columns: 1fr; gap: 16px; margin-bottom: 16px; }
          .an-card { padding: 18px; border-radius: 18px; }
          .an-card-head { margin-bottom: 16px; }
          .an-card-title { font-size: 14.5px; }

          .an-chart { height: 170px; gap: 6px; }
          .an-donut { width: 148px; height: 148px; }
          .an-donut-inner { inset: 18px; }
          .an-donut-pct { font-size: 28px; }

          .an-subject-grid { grid-template-columns: 1fr; }
          .an-btn { width: 100%; height: 44px; font-size: 14px; border-radius: 12px; margin-top: 10px; }
        }

        @media (max-width: 380px) {
          .an-stat-value { font-size: 23px; }
        }

        /* ============ Accessibility ============ */
        @media (prefers-reduced-motion: reduce) {
          .an-container, .an-container *, .an-container *::before, .an-container *::after {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="an-container" style={themeVars}>
        {/* Header */}
        <div className="an-header">
          <div className="an-header-icon">📊</div>
          <div>
            <h1 className="an-title">Learning Analytics</h1>
            <p className="an-subtitle">Track your study habits and progress</p>
          </div>
        </div>

        {/* Top stat cards */}
        <div className="an-stats">
          {statCards.map((s, i) => (
            <div key={s.label} className="an-stat" style={{ "--ic": s.color, "--i": i }}>
              <div className="an-stat-icon">{s.icon}</div>
              <div className="an-stat-body">
                <span className="an-stat-value">{s.value ?? "—"}</span>
                <span className="an-stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Middle row */}
        <div className="an-row">
          {/* Notes activity - last 7 days bar chart */}
          <div className="an-card" style={{ "--d": "380ms" }}>
            <div className="an-card-head">
              <div className="an-card-icon">📈</div>
              <h3 className="an-card-title">Notes Activity (Last 7 Days)</h3>
            </div>
            {data?.last7Days?.every(d => d.count === 0) ? (
              <div className="an-empty">
                <div className="an-empty-icon">📭</div>
                <p className="an-empty-text">No notes created this week</p>
              </div>
            ) : (
              <div className="an-chart">
                <div className="an-chart-grid" />
                {(data?.last7Days || []).map((day, i) => (
                  <div key={i} className="an-col" style={{ "--i": i }} title={`${day.label}: ${day.count}`}>
                    <div className="an-col-track">
                      <div
                        className="an-bar-wrap"
                        style={{ height: day.count === 0 ? "4px" : `${(day.count / maxDayCount) * 86}%` }}
                      >
                        <div className={`an-bar ${day.count === 0 ? "is-empty" : ""}`} />
                        {day.count > 0 && <div className="an-bar-count">{day.count}</div>}
                      </div>
                    </div>
                    <span className="an-day">{day.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task completion donut-style */}
          <div className="an-card" style={{ "--d": "460ms" }}>
            <div className="an-card-head">
              <div className="an-card-icon">🎯</div>
              <h3 className="an-card-title">Task Completion</h3>
            </div>
            <div className="an-donut-wrap">
              <div className="an-donut" style={{ "--an-circ": RING_C }}>
                <svg viewBox="0 0 140 140" aria-hidden="true">
                  <defs>
                    <linearGradient id="anRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={c.accent} />
                      <stop offset="100%" stopColor="#22D3EE" />
                    </linearGradient>
                  </defs>
                  <circle className="an-ring-track" cx="70" cy="70" r={RING_R} fill="none" strokeWidth="12" />
                  <circle
                    className="an-ring-fill"
                    cx="70" cy="70" r={RING_R}
                    fill="none"
                    stroke="url(#anRingGrad)"
                    strokeWidth="12"
                    strokeDasharray={RING_C}
                    strokeDashoffset={ringOffset}
                  />
                </svg>
                <div className="an-donut-inner">
                  <span className="an-donut-pct">{data?.completionRate ?? 0}%</span>
                </div>
              </div>
              <p className="an-donut-caption">Overall completion rate</p>
            </div>

            <div className="an-priority-list">
              {Object.entries(data?.tasksByPriority || {}).map(([priority, count], i) => (
                <div
                  key={priority}
                  className="an-priority"
                  style={{ "--pc": PRIORITY_COLORS[priority] || c.accent, "--i": i }}
                >
                  <div className="an-priority-dot" />
                  <span className="an-priority-name">{priority} priority</span>
                  <span className="an-priority-count">{count} tasks</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="an-row">
          {/* Notes by subject */}
          <div className="an-card" style={{ "--d": "540ms" }}>
            <div className="an-card-head">
              <div className="an-card-icon">📚</div>
              <h3 className="an-card-title">Notes by Subject</h3>
            </div>
            {subjectEntries.length === 0 ? (
              <div className="an-empty">
                <p className="an-empty-text">No notes yet</p>
                <button className="an-btn" onClick={() => navigate("/notes")}>Create a note →</button>
              </div>
            ) : (
              <div className="an-subject-grid">
                {subjectEntries.sort(([,a],[,b]) => b - a).map(([subject, count], i) => {
                  const itemColor = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
                  return (
                    <div key={subject} className="an-subject" style={{ "--ic": itemColor, "--i": i }}>
                      <div className="an-subject-top">
                        <span className="an-subject-name" title={subject}>{subject}</span>
                        <span className="an-badge">{count} {count === 1 ? "note" : "notes"}</span>
                      </div>
                      <div className="an-track">
                        <div className="an-fill" style={{ width: `${(count / maxNoteCount) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tasks by subject */}
          <div className="an-card" style={{ "--d": "620ms" }}>
            <div className="an-card-head">
              <div className="an-card-icon">✅</div>
              <h3 className="an-card-title">Task Progress by Subject</h3>
            </div>
            {taskSubjectEntries.length === 0 ? (
              <div className="an-empty">
                <p className="an-empty-text">No tasks yet</p>
                <button className="an-btn" onClick={() => navigate("/planner")}>Add a task →</button>
              </div>
            ) : (
              <div className="an-subject-grid">
                {taskSubjectEntries.sort(([,a],[,b]) => b.total - a.total).map(([subject, val], i) => {
                  const pct = Math.round((val.completed / val.total) * 100);
                  const itemColor = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
                  return (
                    <div key={subject} className="an-subject" style={{ "--ic": itemColor, "--i": i }}>
                      <div className="an-subject-top">
                        <span className="an-subject-name" title={subject}>{subject}</span>
                        <span className="an-badge">{val.completed}/{val.total} ({pct}%)</span>
                      </div>
                      <div className="an-track">
                        <div className="an-fill" style={{ width: `${pct}%` }} />
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