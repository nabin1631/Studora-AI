import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import api from "../services/api";

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Computer Science", "History", "Geography", "General Knowledge"];
const DIFFICULTY_COLORS = { easy: "#22C55E", medium: "#EAB308", hard: "#EF4444" };
const DIFFICULTY_BG = { easy: "rgba(34,197,94,0.12)", medium: "rgba(234,179,8,0.12)", hard: "rgba(239,68,68,0.12)" };
const BADGE_LABELS = {
  first_quiz: "🎯 First Quiz", quiz_5: "📚 Quiz Enthusiast",
  quiz_25: "🏆 Quiz Master", streak_3: "🔥 3 Day Streak",
  streak_7: "⚡ 7 Day Streak", points_100: "⭐ 100 Points",
  points_500: "💎 500 Points", perfect: "✨ Perfect Score"
};

function QuizArena() {
  const { colors: c, mode } = useTheme();
  const isDark = mode === "dark";

  const [screen, setScreen] = useState("home");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [subject, setSubject] = useState("Math");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime, setStartTime] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const timerRef = useRef(null);

  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newBadges, setNewBadges] = useState([]);

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    if (screen === "playing" && !showExplanation) {
      setTimeLeft(30);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [currentQ, screen, showExplanation]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get("/quiz/stats");
      setStats(res.data);
    } catch { console.error("Failed to load stats"); }
    finally { setLoadingStats(false); }
  };

  const handleGenerate = async () => {
    setGenError(""); setGenerating(true);
    try {
      const res = await api.post("/quiz/generate", { subject, topic, difficulty, questionCount });
      setQuiz(res.data.quiz);
      setCurrentQ(0); setAnswers([]); setSelected(null);
      setShowExplanation(false);
      setQuizStartTime(Date.now()); setStartTime(Date.now());
      setScreen("playing");
    } catch (err) { setGenError(err.response?.data?.message || "Failed to generate. Try again."); }
    finally { setGenerating(false); }
  };

  const handleTimeout = () => {
    clearInterval(timerRef.current);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    setAnswers(prev => [...prev, { selectedAnswer: "", timeTaken }]);
    setSelected("__timeout__"); setShowExplanation(true);
  };

  const handleSelect = (option) => {
    if (selected !== null) return;
    clearInterval(timerRef.current);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    setSelected(option);
    setAnswers(prev => [...prev, { selectedAnswer: option, timeTaken }]);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQ + 1 < quiz.questions.length) {
      setCurrentQ(q => q + 1); setSelected(null);
      setShowExplanation(false); setStartTime(Date.now());
    } else { finishQuiz(); }
  };

  const finishQuiz = async () => {
    clearInterval(timerRef.current);
    const totalTime = Math.round((Date.now() - quizStartTime) / 1000);
    setSubmitting(true);
    try {
      const res = await api.post("/quiz/submit", { quizId: quiz._id, answers, timeTaken: totalTime });
      setResult(res.data); setNewBadges(res.data.newBadges || []);
      setScreen("result"); fetchStats();
    } catch { setScreen("result"); }
    finally { setSubmitting(false); }
  };

  const resetQuiz = () => {
    setQuiz(null); setCurrentQ(0); setAnswers([]);
    setSelected(null); setShowExplanation(false);
    setResult(null); setNewBadges([]); setGenError("");
    setScreen("home");
  };

  const score = answers.filter((a, i) => a.selectedAnswer === quiz?.questions[i]?.answer).length;
  const pct = quiz ? Math.round((score / quiz.questions.length) * 100) : 0;
  const timerPct = (timeLeft / 30) * 100;
  const timerColor = timeLeft <= 10 ? "#EF4444" : timeLeft <= 20 ? "#EAB308" : "#22C55E";

  return (
    <Layout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { transform: scale(.8); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 ${timerColor}66; }
          70% { box-shadow: 0 0 0 10px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        .quiz-animate { animation: fadeUp .35s ease; }
        .quiz-card {
          background: ${c.bgCard}; border: 1px solid ${c.border};
          border-radius: 18px; padding: 22px;
          transition: all .2s;
        }
        .quiz-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); }
        .option-btn {
          width: 100%; padding: 14px 18px; text-align: left;
          background: ${isDark ? "rgba(255,255,255,0.04)" : "#F8F9FC"};
          border: 1.5px solid ${c.border}; border-radius: 13px;
          color: ${c.text}; font-size: 14px; cursor: pointer;
          transition: all .15s cubic-bezier(.4,0,.2,1);
          display: flex; align-items: center; gap: 14px;
          position: relative; overflow: hidden;
        }
        .option-btn::before {
          content: ""; position: absolute; left: 0; top: 0; bottom: 0;
          width: 0; background: ${c.accent}10; transition: width .3s ease;
        }
        .option-btn:hover:not(:disabled)::before { width: 100%; }
        .option-btn:hover:not(:disabled) {
          border-color: ${c.accent}80;
          transform: translateX(4px);
        }
        .option-btn:disabled { cursor: default; }
        .option-btn.correct {
          background: rgba(34,197,94,0.1); border-color: #22C55E;
          animation: popIn .3s ease;
        }
        .option-btn.wrong {
          background: rgba(239,68,68,0.1); border-color: #EF4444;
        }
        .option-letter {
          width: 32px; height: 32px; border-radius: "50%";
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; flex-shrink: 0;
          transition: all .2s; border-radius: 50%;
        }
        .setup-select {
          width: 100%; padding: 11px 14px;
          background: ${c.bg}; border: 1.5px solid ${c.border};
          border-radius: 11px; color: ${c.text}; font-size: 13px;
          outline: none; box-sizing: border-box; transition: border-color .2s;
          cursor: pointer;
        }
        .setup-select:focus { border-color: ${c.accent}; }
        .setup-input {
          width: 100%; padding: 11px 14px;
          background: ${c.bg}; border: 1.5px solid ${c.border};
          border-radius: 11px; color: ${c.text}; font-size: 13px;
          outline: none; box-sizing: border-box; transition: border-color .2s;
        }
        .setup-input:focus { border-color: ${c.accent}; }
        .setup-input::placeholder { color: ${c.textFaint}; }
        .generate-btn {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, ${c.accent}, #5B4FE0);
          color: #fff; border: none; border-radius: 12px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          transition: all .2s; letter-spacing: .02em;
          box-shadow: 0 6px 20px ${c.accent}44;
        }
        .generate-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px ${c.accent}55; }
        .generate-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }
        .diff-btn {
          flex: 1; padding: 10px 8px; border-radius: 10px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all .15s; text-transform: capitalize;
        }
        .leaderboard-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          transition: background .15s; margin-bottom: 3px;
        }
        .leaderboard-row:hover { background: ${c.hover}; }
        .badge-chip {
          padding: 5px 12px;
          border-radius: 20px; font-size: 12px; font-weight: 600;
        }
        .stat-box {
          background: ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
          border: 1px solid ${c.border}; border-radius: 12px;
          padding: 12px; text-align: center;
        }
      `}</style>

      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* ── HOME ── */}
        {screen === "home" && (
          <div className="quiz-animate">
            {/* Hero */}
            <div style={{
              background: isDark
                ? "linear-gradient(135deg, #1a0a3d 0%, #0d0d2b 100%)"
                : "linear-gradient(135deg, #7C6CF0, #5B4FE0)",
              borderRadius: "22px", padding: "28px 32px",
              marginBottom: "18px", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", right: "-10px", top: "-10px", fontSize: "120px", opacity: 0.08, lineHeight: 1 }}>🎮</div>
              <div style={{ position: "absolute", left: "40%", bottom: "-20px", fontSize: "80px", opacity: 0.05 }}>⭐</div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "24px" }}>🎮</span>
                  <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: "800", margin: 0, letterSpacing: "-.02em" }}>
                    Quiz Arena
                  </h1>
                </div>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", margin: "0 0 20px", lineHeight: "1.6" }}>
                  Test your knowledge with AI-generated quizzes. Earn points, unlock badges, climb the leaderboard!
                </p>
                <button
                  onClick={() => setScreen("setup")}
                  style={{
                    padding: "11px 24px", background: "#fff",
                    color: "#5B4FE0", border: "none", borderRadius: "11px",
                    fontSize: "14px", fontWeight: "700", cursor: "pointer",
                    transition: "all .15s", boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                  }}
                  onMouseEnter={e => e.target.style.transform = "translateY(-1px)"}
                  onMouseLeave={e => e.target.style.transform = "translateY(0)"}
                >
                  🚀 Start Quiz
                </button>
              </div>
            </div>

            {/* User stats */}
            {!loadingStats && stats?.user && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" }}>
                {[
                  { icon: "⭐", label: "Points", value: stats.user.points, color: "#F59E0B" },
                  { icon: "🏅", label: "Level", value: stats.user.level, color: c.accent },
                  { icon: "🔥", label: "Streak", value: `${stats.user.streak}d`, color: "#EF4444" },
                  { icon: "📝", label: "Quizzes", value: stats.user.totalQuizzes, color: "#22C55E" },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: c.bgCard, border: `1px solid ${c.border}`,
                    borderRadius: "14px", padding: "14px",
                    display: "flex", alignItems: "center", gap: "10px",
                    transition: "all .2s",
                  }}>
                    <span style={{ fontSize: "22px" }}>{s.icon}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: s.color }}>{s.value}</p>
                      <p style={{ margin: 0, fontSize: "10px", color: c.textMuted, fontWeight: "500" }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {/* Badges */}
              <div className="quiz-card">
                <h3 style={{ color: c.text, fontSize: "14px", fontWeight: "700", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "6px" }}>
                  🏆 Your Badges
                  {stats?.user?.badges?.length > 0 && (
                    <span style={{ fontSize: "11px", background: `${c.accent}15`, color: c.accent, padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>
                      {stats.user.badges.length}
                    </span>
                  )}
                </h3>
                {!stats?.user?.badges?.length ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <p style={{ fontSize: "32px", margin: "0 0 8px" }}>🎯</p>
                    <p style={{ color: c.textMuted, fontSize: "12px", margin: "0 0 12px" }}>Complete quizzes to earn badges!</p>
                    <button onClick={() => setScreen("setup")} style={{
                      padding: "6px 14px", background: `${c.accent}15`, border: `1px solid ${c.accent}30`,
                      borderRadius: "8px", color: c.accent, fontSize: "12px", fontWeight: "600", cursor: "pointer",
                    }}>Take your first quiz →</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {stats.user.badges.map((badge) => (
                      <span key={badge} className="badge-chip" style={{
                        background: `${c.accent}15`, border: `1px solid ${c.accent}30`, color: c.accent,
                      }}>
                        {BADGE_LABELS[badge] || badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Leaderboard */}
              <div className="quiz-card">
                <h3 style={{ color: c.text, fontSize: "14px", fontWeight: "700", margin: "0 0 14px" }}>
                  📊 Leaderboard
                </h3>
                {!stats?.leaderboard?.length ? (
                  <p style={{ color: c.textMuted, fontSize: "12px", textAlign: "center", padding: "20px 0" }}>No data yet</p>
                ) : (
                  stats.leaderboard.slice(0, 5).map((u, i) => (
                    <div key={u._id} className="leaderboard-row">
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: i === 0 ? "linear-gradient(135deg, #FFD700, #FFA500)"
                          : i === 1 ? "linear-gradient(135deg, #C0C0C0, #A0A0A0)"
                          : i === 2 ? "linear-gradient(135deg, #CD7F32, #A0522D)"
                          : c.border,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: "800",
                        color: i < 3 ? "#fff" : c.textMuted, flexShrink: 0,
                        boxShadow: i === 0 ? "0 4px 12px rgba(255,215,0,0.4)" : "none",
                      }}>
                        {i + 1}
                      </div>
                      <span style={{ flex: 1, fontSize: "13px", color: c.text, fontWeight: "500" }}>{u.name}</span>
                      <span style={{
                        fontSize: "12px", fontWeight: "700", color: "#F59E0B",
                        background: "rgba(245,158,11,0.12)", padding: "3px 9px", borderRadius: "20px",
                      }}>⭐ {u.points}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent attempts */}
            {stats?.recentAttempts?.length > 0 && (
              <div className="quiz-card" style={{ marginTop: "12px" }}>
                <h3 style={{ color: c.text, fontSize: "14px", fontWeight: "700", margin: "0 0 14px" }}>
                  📋 Recent Quizzes
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {stats.recentAttempts.slice(0, 5).map((a) => {
                    const p = Math.round((a.score / a.totalQuestions) * 100);
                    return (
                      <div key={a._id} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "10px 14px", background: c.bg, borderRadius: "12px",
                        border: `1px solid ${c.border}`,
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: "11px",
                          background: p >= 80 ? "rgba(34,197,94,0.12)" : p >= 50 ? "rgba(234,179,8,0.12)" : "rgba(239,68,68,0.12)",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0,
                        }}>
                          {p >= 80 ? "🌟" : p >= 50 ? "👍" : "💪"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: c.text }}>{a.subject}</p>
                          <p style={{ margin: 0, fontSize: "11px", color: c.textMuted }}>
                            {a.score}/{a.totalQuestions} correct · +{a.pointsEarned} pts
                          </p>
                        </div>
                        <div style={{
                          fontSize: "15px", fontWeight: "800",
                          color: p >= 80 ? "#22C55E" : p >= 50 ? "#EAB308" : "#EF4444",
                          background: p >= 80 ? "rgba(34,197,94,0.1)" : p >= 50 ? "rgba(234,179,8,0.1)" : "rgba(239,68,68,0.1)",
                          padding: "4px 12px", borderRadius: "20px",
                        }}>{p}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SETUP ── */}
        {screen === "setup" && (
          <div className="quiz-animate">
            <button onClick={() => setScreen("home")} style={{
              background: "none", border: "none", color: c.textMuted,
              fontSize: "13px", cursor: "pointer", marginBottom: "16px", padding: 0,
              display: "flex", alignItems: "center", gap: "4px",
            }}>← Back to Quiz Arena</button>

            <div className="quiz-card" style={{ maxWidth: "500px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "22px" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "16px",
                  background: `linear-gradient(135deg, ${c.accent}, #5B4FE0)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "26px", margin: "0 auto 12px",
                  boxShadow: `0 8px 24px ${c.accent}44`,
                }}>🤖</div>
                <h2 style={{ color: c.text, fontSize: "18px", fontWeight: "800", margin: "0 0 5px" }}>
                  AI Quiz Generator
                </h2>
                <p style={{ color: c.textMuted, fontSize: "13px", margin: 0 }}>
                  Configure your quiz — AI generates questions instantly
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: c.textSecondary, marginBottom: "7px", textTransform: "uppercase", letterSpacing: ".06em" }}>
                    Subject
                  </label>
                  <select className="setup-select" value={subject} onChange={e => setSubject(e.target.value)}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: c.textSecondary, marginBottom: "7px", textTransform: "uppercase", letterSpacing: ".06em" }}>
                    Topic <span style={{ color: c.textFaint, fontWeight: "400", textTransform: "none" }}>(optional)</span>
                  </label>
                  <input className="setup-input" placeholder="e.g. Newton's Laws, Photosynthesis..."
                    value={topic} onChange={e => setTopic(e.target.value)} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: c.textSecondary, marginBottom: "9px", textTransform: "uppercase", letterSpacing: ".06em" }}>
                    Difficulty
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {["easy", "medium", "hard"].map(d => (
                      <button key={d} className="diff-btn"
                        onClick={() => setDifficulty(d)}
                        style={{
                          border: `2px solid ${difficulty === d ? DIFFICULTY_COLORS[d] : c.border}`,
                          background: difficulty === d ? DIFFICULTY_BG[d] : c.bg,
                          color: difficulty === d ? DIFFICULTY_COLORS[d] : c.textMuted,
                        }}>
                        {d === "easy" ? "😊 Easy" : d === "medium" ? "🤔 Medium" : "🔥 Hard"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: c.textSecondary, marginBottom: "9px", textTransform: "uppercase", letterSpacing: ".06em" }}>
                    Number of Questions
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[3, 5, 10].map(n => (
                      <button key={n}
                        onClick={() => setQuestionCount(n)}
                        style={{
                          flex: 1, padding: "10px",
                          border: `2px solid ${questionCount === n ? c.accent : c.border}`,
                          borderRadius: "11px",
                          background: questionCount === n ? `${c.accent}15` : c.bg,
                          color: questionCount === n ? c.accent : c.textMuted,
                          fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "all .15s",
                        }}>
                        {n} Qs
                      </button>
                    ))}
                  </div>
                </div>

                {genError && (
                  <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", fontSize: "13px", color: "#EF4444" }}>
                    {genError}
                  </div>
                )}

                <button className="generate-btn" onClick={handleGenerate} disabled={generating}>
                  {generating ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                      <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      Generating questions...
                    </span>
                  ) : "🚀 Generate Quiz"}
                </button>

                <p style={{ textAlign: "center", fontSize: "11px", color: c.textFaint, margin: 0 }}>
                  AI will generate {questionCount} questions · 30 seconds per question
                </p>
              </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── PLAYING ── */}
        {screen === "playing" && quiz && (
          <div className="quiz-animate">
            {/* Top bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ padding: "4px 12px", background: `${c.accent}15`, border: `1px solid ${c.accent}30`, borderRadius: "20px", fontSize: "12px", color: c.accent, fontWeight: "600" }}>
                  {quiz.subject}
                </span>
                <span style={{ padding: "4px 12px", background: DIFFICULTY_BG[quiz.difficulty], border: `1px solid ${DIFFICULTY_COLORS[quiz.difficulty]}30`, borderRadius: "20px", fontSize: "12px", color: DIFFICULTY_COLORS[quiz.difficulty], fontWeight: "600", textTransform: "capitalize" }}>
                  {quiz.difficulty}
                </span>
              </div>
              <span style={{ fontSize: "13px", color: c.textMuted, fontWeight: "600" }}>
                {currentQ + 1} / {quiz.questions.length}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", borderRadius: "20px", height: "6px", marginBottom: "16px", overflow: "hidden" }}>
              <div style={{
                width: `${((currentQ) / quiz.questions.length) * 100}%`, height: "100%",
                background: `linear-gradient(90deg, ${c.accent}, #5B4FE0)`,
                borderRadius: "20px", transition: "width .5s ease",
              }} />
            </div>

            {/* Timer + Question */}
            <div className="quiz-card" style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <h3 style={{ color: c.text, fontSize: "17px", fontWeight: "700", margin: 0, flex: 1, lineHeight: "1.5", paddingRight: "16px" }}>
                  {quiz.questions[currentQ]?.question}
                </h3>

                {/* Circular timer */}
                <div style={{ position: "relative", flexShrink: 0, width: 52, height: 52 }}>
                  <svg width="52" height="52" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="22" fill="none"
                      stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
                      strokeWidth="4" />
                    <circle cx="26" cy="26" r="22" fill="none"
                      stroke={timerColor}
                      strokeWidth="4"
                      strokeDasharray={`${(timerPct / 100) * 138} 138`}
                      strokeDashoffset="34.5"
                      strokeLinecap="round"
                      style={{ transition: "stroke-dasharray .9s linear, stroke .3s" }}
                    />
                  </svg>
                  <div style={{
                    position: "absolute", inset: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "14px", fontWeight: "800", color: timerColor,
                    animation: timeLeft <= 5 ? "pulse-ring 1s infinite" : "none",
                  }}>
                    {timeLeft}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {quiz.questions[currentQ]?.options.map((option, i) => {
                  const isCorrect = option === quiz.questions[currentQ].answer;
                  const isSelected = option === selected;
                  let btnClass = "option-btn";
                  if (showExplanation) {
                    if (isCorrect) btnClass += " correct";
                    else if (isSelected) btnClass += " wrong";
                  }
                  return (
                    <button key={i} className={btnClass}
                      onClick={() => handleSelect(option)}
                      disabled={showExplanation}>
                      <div className="option-letter" style={{
                        background: showExplanation && isCorrect ? "#22C55E"
                          : showExplanation && isSelected ? "#EF4444"
                          : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                        color: showExplanation && (isCorrect || isSelected) ? "#fff" : c.textMuted,
                        width: 32, height: 32,
                      }}>
                        {showExplanation && isCorrect ? "✓" : showExplanation && isSelected && !isCorrect ? "✗" : String.fromCharCode(65 + i)}
                      </div>
                      <span style={{ flex: 1 }}>{option}</span>
                    </button>
                  );
                })}
              </div>

              {showExplanation && selected === "__timeout__" && (
                <div style={{ marginTop: "14px", padding: "12px 14px", background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: "11px", fontSize: "13px", color: "#EAB308" }}>
                  ⏰ Time's up! Correct: <strong>{quiz.questions[currentQ].answer}</strong>
                </div>
              )}

              {showExplanation && quiz.questions[currentQ]?.explanation && selected !== "__timeout__" && (
                <div style={{ marginTop: "14px", padding: "13px 16px", background: `${c.accent}10`, border: `1px solid ${c.accent}25`, borderRadius: "11px", fontSize: "13px", color: c.textSecondary, lineHeight: "1.6" }}>
                  <strong style={{ color: c.accent }}>💡 </strong>
                  {quiz.questions[currentQ].explanation}
                </div>
              )}
            </div>

            {showExplanation && (
              <button onClick={handleNext} disabled={submitting} style={{
                width: "100%", padding: "14px",
                background: `linear-gradient(135deg, ${c.accent}, #5B4FE0)`,
                color: "#fff", border: "none", borderRadius: "13px",
                fontSize: "14px", fontWeight: "700", cursor: "pointer",
                boxShadow: `0 6px 20px ${c.accent}44`,
                transition: "all .15s",
              }}>
                {submitting ? "Submitting..." : currentQ + 1 < quiz.questions.length ? "Next Question →" : "🏁 Finish Quiz"}
              </button>
            )}
          </div>
        )}

        {/* ── RESULT ── */}
        {screen === "result" && (
          <div className="quiz-animate" style={{ textAlign: "center" }}>

            {newBadges.length > 0 && (
              <div style={{
                background: `linear-gradient(135deg, ${c.accent}20, #5B4FE020)`,
                border: `1px solid ${c.accent}30`, borderRadius: "16px",
                padding: "16px", marginBottom: "16px",
                animation: "popIn .4s ease",
              }}>
                <p style={{ color: c.accent, fontSize: "14px", fontWeight: "700", margin: "0 0 10px" }}>
                  🎉 New Badge{newBadges.length > 1 ? "s" : ""} Unlocked!
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                  {newBadges.map((b, i) => (
                    <span key={i} style={{ padding: "5px 14px", background: c.accent, color: "#fff", borderRadius: "20px", fontSize: "12px", fontWeight: "700" }}>{b}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="quiz-card" style={{ marginBottom: "14px" }}>
              <div style={{
                width: 100, height: 100, borderRadius: "50%", margin: "0 auto 18px",
                background: pct >= 80 ? "rgba(34,197,94,0.12)" : pct >= 50 ? "rgba(234,179,8,0.12)" : "rgba(239,68,68,0.12)",
                border: `5px solid ${pct >= 80 ? "#22C55E" : pct >= 50 ? "#EAB308" : "#EF4444"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column",
                boxShadow: `0 8px 32px ${pct >= 80 ? "rgba(34,197,94,0.2)" : pct >= 50 ? "rgba(234,179,8,0.2)" : "rgba(239,68,68,0.2)"}`,
                animation: "popIn .4s ease",
              }}>
                <span style={{ fontSize: "22px", fontWeight: "800", color: pct >= 80 ? "#22C55E" : pct >= 50 ? "#EAB308" : "#EF4444" }}>{pct}%</span>
              </div>

              <h2 style={{ color: c.text, fontSize: "20px", fontWeight: "800", margin: "0 0 6px" }}>
                {pct >= 80 ? "🌟 Excellent!" : pct >= 60 ? "👍 Good job!" : pct >= 40 ? "💪 Keep going!" : "📚 Study more!"}
              </h2>
              <p style={{ color: c.textMuted, fontSize: "14px", margin: "0 0 22px" }}>
                {score} of {quiz?.questions.length} correct
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "18px" }}>
                {[
                  { label: "Score", value: `${score}/${quiz?.questions.length}`, color: c.accent },
                  { label: "Points earned", value: `+${result?.pointsEarned || 0}`, color: "#22C55E" },
                  { label: "Accuracy", value: `${pct}%`, color: pct >= 60 ? "#22C55E" : "#EF4444" },
                ].map(s => (
                  <div key={s.label} className="stat-box">
                    <p style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: s.color }}>{s.value}</p>
                    <p style={{ margin: 0, fontSize: "10px", color: c.textMuted, fontWeight: "500" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {result?.userStats && (
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "18px", padding: "12px", background: c.bg, borderRadius: "12px", border: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: "12px", color: c.textSecondary }}>⭐ {result.userStats.points} pts</span>
                  <span style={{ color: c.border }}>·</span>
                  <span style={{ fontSize: "12px", color: c.textSecondary }}>🏅 Level {result.userStats.level}</span>
                  <span style={{ color: c.border }}>·</span>
                  <span style={{ fontSize: "12px", color: c.textSecondary }}>🔥 {result.userStats.streak} day streak</span>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setScreen("setup")} style={{
                  flex: 1, padding: "12px",
                  background: `linear-gradient(135deg, ${c.accent}, #5B4FE0)`,
                  color: "#fff", border: "none", borderRadius: "11px",
                  fontSize: "14px", fontWeight: "700", cursor: "pointer",
                  boxShadow: `0 4px 16px ${c.accent}44`,
                }}>🔄 Play Again</button>
                <button onClick={resetQuiz} style={{
                  flex: 1, padding: "12px", background: c.bg, color: c.text,
                  border: `1px solid ${c.border}`, borderRadius: "11px",
                  fontSize: "14px", fontWeight: "600", cursor: "pointer",
                }}>🏠 Home</button>
              </div>
            </div>

            {/* Answer review */}
            <div className="quiz-card">
              <h3 style={{ color: c.text, fontSize: "14px", fontWeight: "700", margin: "0 0 14px" }}>📋 Answer Review</h3>
              {quiz?.questions.map((q, i) => {
                const userAnswer = answers[i]?.selectedAnswer;
                const correct = userAnswer === q.answer;
                return (
                  <div key={i} style={{
                    padding: "12px 14px", borderRadius: "11px", marginBottom: "8px",
                    background: correct ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
                    border: `1px solid ${correct ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)"}`,
                  }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: correct ? 0 : "6px" }}>
                      <span style={{ fontSize: "15px", flexShrink: 0 }}>{correct ? "✅" : "❌"}</span>
                      <p style={{ margin: 0, fontSize: "13px", color: c.text, fontWeight: "500", flex: 1 }}>{q.question}</p>
                    </div>
                    {!correct && (
                      <div style={{ marginLeft: "24px" }}>
                        <p style={{ margin: "0 0 2px", fontSize: "12px", color: "#EF4444" }}>Your: {userAnswer || "No answer"}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#22C55E" }}>Correct: {q.answer}</p>
                      </div>
                    )}
                    {q.explanation && (
                      <p style={{ margin: "5px 0 0 24px", fontSize: "11px", color: c.textMuted, lineHeight: "1.5" }}>
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default QuizArena;