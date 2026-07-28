import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import api from "../services/api";

const PRIORITY_COLORS = {
  low: "#0eb47d",
  medium: "#f19b08",
  high: "#ea4040",
};

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  d.setHours(0, 0, 0, 0);

  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Premium Component for Smooth Number Counting Animations
function AnimatedCounter({ from = 0, to }) {
  const target = parseInt(to, 10) || 0;
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 800; // ms

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * (target - from) + from));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(target); // ✅ Fixed: Removed the accidental 'count:' label that broke ESLint
      }
    };

    let animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [target, from]);

  return <span>{count}</span>;
}

function Dashboard() {
  const { user } = useAuth();
  const { colors: c } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get("/dashboard/stats");
        setStats(res?.data?.stats || null);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const taskProgress = useMemo(() => {
    if (!stats?.totalTasks) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  }, [stats]);

  const todayProgress = useMemo(() => {
    if (!stats?.todayTasksCount) return 0;
    return Math.round((stats.todayCompletedCount / stats.todayTasksCount) * 100);
  }, [stats]);

  // Framer motion variants definition
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.02 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } }
  };

  return (
    <Layout>
      <style>{`
        /* --- Performance Optimized Keyframes --- */
        @keyframes dynamicGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes microFloat1 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.02); }
        }

        @keyframes microFloat2 {
          0%, 100% { transform: translateY(0) scale(1.03); }
          50% { transform: translateY(4px) scale(0.97); }
        }

        /* --- Unified Responsive Engine Layout --- */
        .dash-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 12px;
          box-sizing: border-box;
        }

        .responsive-grid-2col {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .stats-responsive-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        /* --- Optimized Premium Theme Component Base Architecture --- */
        .dash-card {
          background: ${c.bgCard};
          border: 1px solid ${c.border};
          border-radius: 24px;
          padding: 16px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.02);
          box-sizing: border-box;
        }

        .stat-card {
          background: ${c.bgCard};
          border: 1px solid ${c.border};
          border-radius: 16px;
          padding: 12px 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          min-width: 0;
          box-shadow: 0 4px 14px -3px rgba(0, 0, 0, 0.01);
          box-sizing: border-box;
        }

        .quick-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid ${c.border};
          background: ${c.bgCard};
          cursor: pointer;
          box-sizing: border-box;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }

        .recent-item, .task-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid ${c.border};
          box-sizing: border-box;
        }
        
        .recent-item { cursor: pointer; }
        .recent-item:last-child, .task-item:last-child { border-bottom: none; }

        /* --- Progress Rings Dynamic Layout Adaptability --- */
        .progress-visualization-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 12px 0;
        }

        .ring-element-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
          width: 100%;
        }

        .ring-element-box {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
        }

        .ring-meta-title {
          font-size: 14px;
          font-weight: 700;
          color: ${c.text};
          margin: 0;
        }

        .ring-meta-sub {
          font-size: 12px;
          color: ${c.textMuted};
          margin: 2px 0 0 0;
        }

        /* --- Mini Layout Cards Grid for bottom statistics --- */
        .bottom-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 20px;
        }

        .mini-status-card {
          background: ${c.bg};
          border: 1px solid ${c.border};
          padding: 10px 4px;
          border-radius: 16px;
          text-align: center;
        }

        /* --- Custom Hero Optimization Classes --- */
        .hero-section {
          background: linear-gradient(-45deg, #4840d9, #7536e1, #1858e3, #09bfdf);
          background-size: 400% 400%;
          animation: dynamicGradient 10s ease infinite;
          border-radius: 24px;
          padding: 18px 16px;
          margin-bottom: 16px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 35px -5px rgba(79, 70, 229, 0.25), inset 0 -6px 12px rgba(0,0,0,0.12), inset 0 6px 12px rgba(255,255,255,0.22);
        }

        .hero-pill-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        /* --- Device Resolution Breakpoints Mapping --- */
        @media (min-width: 400px) {
          .progress-visualization-wrapper {
            flex-direction: row;
            justify-content: space-around;
          }
          .ring-element-container {
            width: auto;
            flex: 1;
          }
          .ring-element-box {
            width: 130px;
            height: 130px;
          }
        }

        @media (min-width: 576px) {
          .dash-card {
            padding: 24px;
          }
          .hero-section {
            padding: 32px 28px;
            margin-bottom: 20px;
          }
          .hero-pill-grid {
            display: flex;
            gap: 10px;
          }
          .stats-responsive-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          .bottom-stats-grid {
            gap: 12px;
          }
          .mini-status-card {
            padding: 14px 8px;
          }
          .ring-element-box {
            width: 145px;
            height: 145px;
          }
        }

        @media (min-width: 768px) {
          .dash-container { padding: 0 24px; }
          .responsive-grid-2col { grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .stats-responsive-grid { margin-bottom: 20px; }
        }
      `}</style>

      <motion.div 
        className="dash-container"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* Welcome Header Section */}
        <motion.div
          className="hero-section"
          variants={itemVariants}
        >
          <div style={{
            position: "absolute", top: "-30px", right: "5%", width: "140px", height: "140px",
            borderRadius: "50%", background: "rgba(6, 182, 212, 0.35)", filter: "blur(20px)",
            animation: "microFloat1 6s ease-in-out infinite"
          }} />
          <div style={{
            position: "absolute", bottom: "-40px", left: "25%", width: "110px", height: "110px",
            borderRadius: "50%", background: "rgba(124, 58, 237, 0.3)", filter: "blur(15px)",
            animation: "microFloat2 8s ease-in-out infinite alternate"
          }} />

          <div style={{ position: "relative", zIndex: 2 }}>
            <span style={{
              background: "rgba(255, 255, 255, 0.16)", backdropFilter: "blur(8px)",
              padding: "4px 10px", borderRadius: "999px", color: "#FFF", fontSize: "12px",
              fontWeight: "600", display: "inline-block", marginBottom: "8px",
              border: "1px solid rgba(255, 255, 255, 0.2)"
            }}>
              {greeting} ✨
            </span>

            <h1 style={{
              color: "#FFFFFF", fontSize: "clamp(22px, 4.5vw, 36px)", fontWeight: "850",
              letterSpacing: "-0.5px", margin: "0 0 6px 0", lineHeight: 1.15
            }}>
              Welcome back, {user?.name || "Scholar"}!
            </h1>

            <p style={{
              color: "rgba(255, 255, 255, 0.9)", fontSize: "clamp(13px, 2.3vw, 15px)",
              maxWidth: "580px", margin: "0 0 14px 0", lineHeight: 1.4
            }}>
              Your current roadmap performance indices are optimized. You have {stats?.pendingTasks || 0} active task lines awaiting processing.
            </p>

            <div className="hero-pill-grid">
              <div style={{
                background: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(6px)",
                border: "1px solid rgba(255, 255, 255, 0.12)", padding: "6px 10px",
                borderRadius: "12px", color: "#FFF", fontSize: "12px", fontWeight: "600",
                textAlign: "center"
              }}>
                📝 <AnimatedCounter to={stats?.totalNotes} /> Notes
              </div>
              <div style={{
                background: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(6px)",
                border: "1px solid rgba(255, 255, 255, 0.12)", padding: "6px 10px",
                borderRadius: "12px", color: "#FFF", fontSize: "12px", fontWeight: "600",
                textAlign: "center"
              }}>
                ⏳ <AnimatedCounter to={stats?.pendingTasks} /> Pending
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Achievements & Streaks Card */}
        <motion.div 
          className="dash-card" 
          variants={itemVariants} 
          style={{ 
            marginBottom: "16px",
            border: `1px solid ${c.border}`,
            background: `linear-gradient(135deg, ${c.bgCard} 0%, ${c.bg} 100%)`,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.03)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{ fontSize: "20px" }}>🏆</span>
            <h3 style={{ margin: 0, color: c.text, fontSize: "16px", fontWeight: "800", letterSpacing: "-0.2px" }}>
              Achievements & Streaks
            </h3>
          </div>
          <p style={{ color: c.textMuted, marginBottom: "14px", fontSize: "13px", marginTop: 0 }}>
            Students love seeing consistent metrics! Keep your performance high.
          </p>

          <div style={{
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
            gap: "10px"
          }}>
            {/* Streak Sub-Card */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.02, boxShadow: "0 12px 20px -8px rgba(239, 68, 68, 0.15)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "12px 10px",
                borderRadius: "14px", background: c.bgCard, border: `1px solid ${c.border}`,
                boxShadow: "0 4px 10px rgba(0,0,0,0.01)", cursor: "pointer", transition: "border-color 0.2s"
              }}
            >
              <div style={{
                width: "38px", height: "38px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0
              }}>
                🔥
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "11px", fontWeight: "600", color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Streak</p>
                <p style={{ margin: "1px 0 0 0", fontSize: "16px", fontWeight: "800", color: "#EF4444" }}>5 days</p>
              </div>
            </motion.div>

            {/* Notes Created Sub-Card */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.02, boxShadow: "0 12px 20px -8px rgba(99, 102, 241, 0.15)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "12px 10px",
                borderRadius: "14px", background: c.bgCard, border: `1px solid ${c.border}`,
                boxShadow: "0 4px 10px rgba(0,0,0,0.01)", cursor: "pointer", transition: "border-color 0.2s"
              }}
            >
              <div style={{
                width: "38px", height: "38px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0
              }}>
                📝
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "11px", fontWeight: "600", color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Notes</p>
                <p style={{ margin: "1px 0 0 0", fontSize: "16px", fontWeight: "800", color: "#6366F1" }}>
                  {loading ? "—" : <AnimatedCounter to={stats?.totalNotes} />}
                </p>
              </div>
            </motion.div>

            {/* Tasks Finished Sub-Card */}
            <motion.div 
              whileHover={{ y: -5, scale: 1.02, boxShadow: "0 12px 20px -8px rgba(16, 185, 129, 0.15)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "12px 10px",
                borderRadius: "14px", background: c.bgCard, border: `1px solid ${c.border}`,
                boxShadow: "0 4px 10px rgba(0,0,0,0.01)", cursor: "pointer", transition: "border-color 0.2s"
              }}
            >
              <div style={{
                width: "38px", height: "38px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0
              }}>
                ✅
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "11px", fontWeight: "600", color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Finished</p>
                <p style={{ margin: "1px 0 0 0", fontSize: "16px", fontWeight: "800", color: "#10B981" }}>
                  {loading ? "—" : <AnimatedCounter to={stats?.completedTasks} />}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Analytics Summary Stats Grid */}
        <div className="stats-responsive-grid">
          {[
            { label: "Total Notes", value: stats?.totalNotes ?? 0, icon: "📝", color: "#6366F1", bg: "#6366F115" },
            { label: "This Week", value: stats?.notesThisWeek ?? 0, icon: "✨", color: "#06B6D4", bg: "#06B6D415" },
            { label: "Completed", value: stats?.completedTasks ?? 0, icon: "✅", color: "#10B981", bg: "#10B98115" },
            { label: "Pending Loops", value: stats?.pendingTasks ?? 0, icon: "⏳", color: "#F59E0B", bg: "#F59E0B15" },
          ].map((s, idx) => (
            <motion.div 
              key={idx} 
              className="stat-card"
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: "8px", background: s.bg,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: s.color, lineHeight: 1.2 }}>
                  {loading ? "—" : <AnimatedCounter to={s.value} />}
                </p>
                <p style={{ margin: "1px 0 0 0", fontSize: "11px", fontWeight: "500", color: c.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Core Middle Dynamic Split Layout */}
        <div className="responsive-grid-2col">
          
          {/* Study Analytics Card */}
          <motion.div className="dash-card" variants={itemVariants}>
            <div style={{ display: "flex", flexDirection: "column", marginBottom: "12px" }}>
              <h3 style={{ color: c.text, fontSize: "16px", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                📊 Study Analytics
              </h3>
              <p style={{ color: c.textMuted, marginTop: 4, marginBottom: 0, fontSize: "13px" }}>
                You're making great progress this week 🚀 
                <span style={{ display: "block", fontSize: "12px", fontWeight: "600", marginTop: "2px", color: c.accent }}>
                  {taskProgress}% of your study goals completed.
                </span>
              </p>
            </div>

            <div className="progress-visualization-wrapper">
              
              {/* Overall Progress Element */}
              <div className="ring-element-container">
                <div className="ring-element-box">
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="overallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#2563EB" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="42" stroke={c.border} strokeWidth="8" fill="transparent" />
                    <motion.circle 
                      cx="50" cy="50" r="42" stroke="url(#overallGrad)" strokeWidth="8" fill="transparent"
                      strokeDasharray="263.89"
                      initial={{ strokeDashoffset: 263.89 }}
                      animate={{ strokeDashoffset: 263.89 - (263.89 * taskProgress) / 100 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                  }}>
                    <span style={{ fontWeight: "850", fontSize: "20px", color: c.text }}>{taskProgress}%</span>
                  </div>
                </div>
                <div>
                  <h4 className="ring-meta-title">Overall Progress</h4>
                  <p className="ring-meta-sub">+12% this week</p>
                </div>
              </div>

              {/* Today's Target Progress Element */}
              <div className="ring-element-container">
                <div className="ring-element-box">
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="todayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#22C55E" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="42" stroke={c.border} strokeWidth="8" fill="transparent" />
                    <motion.circle 
                      cx="50" cy="50" r="42" stroke="url(#todayGrad)" strokeWidth="8" fill="transparent"
                      strokeDasharray="263.89"
                      initial={{ strokeDashoffset: 263.89 }}
                      animate={{ strokeDashoffset: 263.89 - (263.89 * todayProgress) / 100 }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                  }}>
                    <span style={{ fontWeight: "850", fontSize: "20px", color: "#10B981" }}>{todayProgress}%</span>
                  </div>
                </div>
                <div>
                  <h4 className="ring-meta-title">Today's Goal</h4>
                  <p className="ring-meta-sub">{todayProgress === 100 ? "Completed 🎉" : "In progress"}</p>
                </div>
              </div>

            </div>

            {/* Bottom Status Grid */}
            <div className="bottom-stats-grid">
              <div className="mini-status-card">
                <p style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#10B981" }}>✅ {stats?.completedTasks ?? 0}</p>
                <p style={{ margin: "2px 0 0 0", fontSize: "11px", fontWeight: "600", color: c.textMuted }}>Done</p>
              </div>
              <div className="mini-status-card">
                <p style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#f39c06" }}>⏳ {stats?.pendingTasks ?? 0}</p>
                <p style={{ margin: "2px 0 0 0", fontSize: "11px", fontWeight: "600", color: c.textMuted }}>Pending</p>
              </div>
              <div className="mini-status-card">
                <p style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: c.accent }}>🎯 {stats?.todayTasksCount ?? 0}</p>
                <p style={{ margin: "2px 0 0 0", fontSize: "11px", fontWeight: "600", color: c.textMuted }}>Today</p>
              </div>
            </div>

            <p style={{ margin: "16px 0 0 0", textAlign: "center", fontSize: "12px", fontWeight: "700", color: c.text }}>
              🔥 Keep going! You're {taskProgress}% through your goals.
            </p>
          </motion.div>

          {/* Quick Actions Engine Container */}
          <motion.div className="dash-card" variants={itemVariants}>
            <h3 style={{ color: c.text, fontSize: "16px", fontWeight: "800", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
              ⚡ Engine Operations
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { icon: "📝", label: "Create Study Note", path: "/notes" },
                { icon: "📅", label: "Open Planner Engine", path: "/planner" },
                { icon: "🤖", label: "Consult AI Copilot", path: "/ai-tutor" },
                { icon: "🎮", label: "Enter Arena Challenge", path: "/quiz-arena" },
              ].map((a) => (
                <motion.button 
                  key={a.label} 
                  className="quick-btn" 
                  onClick={() => navigate(a.path)}
                  whileHover={{ x: 4, borderColor: c.accent, background: `${c.accent}04` }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, background: `${c.accent}12`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0
                  }}>
                    {a.icon}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: c.text, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.label}
                    </div>
                  </div>
                  <span style={{ fontSize: "12px", color: c.textMuted }}>→</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Secondary Downstream Core Feeds Layout */}
        <div className="responsive-grid-2col">
          
          {/* Recent Study Documents List Stream */}
          <motion.div className="dash-card" variants={itemVariants}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ color: c.text, fontSize: "15px", fontWeight: "800", margin: 0 }}>📝 Recent Knowledge Cache</h3>
              <span onClick={() => navigate("/notes")} style={{ color: c.accent, fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                View Feed
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {loading ? (
                <p style={{ color: c.textMuted, fontSize: "13px" }}>Accessing core buffer...</p>
              ) : !stats?.recentNotes?.length ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: "22px", margin: "0 0 4px 0" }}>📁</p>
                  <p style={{ color: c.textMuted, fontSize: "12px", margin: 0 }}>Knowledge pipeline empty</p>
                </div>
              ) : (
                stats.recentNotes.map((note) => (
                  <motion.div 
                    key={note._id} 
                    className="recent-item" 
                    onClick={() => navigate("/notes")}
                    whileHover={{ paddingLeft: 4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: "6px", background: `${c.accent}12`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0
                    }}>📝</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {note.title}
                      </p>
                      <p style={{ margin: "1px 0 0 0", fontSize: "11px", color: c.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {stripHtml(note.content) || "No document configuration parameters"}
                      </p>
                    </div>
                    <span style={{ fontSize: "11px", color: c.textFaint, flexShrink: 0, marginLeft: "6px" }}>
                      {new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Upcoming Planner Queue Stream */}
          <motion.div className="dash-card" variants={itemVariants}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ color: c.text, fontSize: "15px", fontWeight: "800", margin: 0 }}>📅 Planner Timelines Queue</h3>
              <span onClick={() => navigate("/planner")} style={{ color: c.accent, fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                View Stack
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {loading ? (
                <p style={{ color: c.textMuted, fontSize: "13px" }}>Reaching task manifest schedules...</p>
              ) : !stats?.upcomingTasks?.length ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: "22px", margin: "0 0 4px 0" }}>🏁</p>
                  <p style={{ color: c.textMuted, fontSize: "12px", margin: 0 }}>No pending blockages detected</p>
                </div>
              ) : (
                stats.upcomingTasks.map((task) => (
                  <div key={task._id} className="task-item">
                    <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {task.title}
                      </p>
                      <p style={{ margin: "1px 0 0 0", fontSize: "11px", color: c.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {task.subject} · {formatDate(task.date)}
                      </p>
                    </div>
                    <span style={{
                      fontSize: "10px", padding: "2px 6px", borderRadius: "20px", fontWeight: "600", flexShrink: 0, marginLeft: "6px",
                      color: PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium,
                      background: `${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}14`,
                      textTransform: "capitalize"
                    }}>
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
          
        </div> 
      </motion.div>
    </Layout>
  );
}

export default Dashboard;