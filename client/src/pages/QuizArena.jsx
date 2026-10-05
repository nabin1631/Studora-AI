import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import api from "../services/api";

// ─── CONSTANTS & DATA ──────────────────────────────────────────
const SUBJECT_CATEGORIES = [
  {
    label: "💻 IT & Programming",
    subjects: [
      "Computer Fundamentals", "Programming Fundamentals", "C Programming",
      "C++", "Java", "Python", "JavaScript", "HTML", "CSS", "React",
      "Node.js", "Express.js", "MongoDB", "SQL", "DBMS",
      "Operating System", "Computer Networks", "Software Engineering",
      "Data Structures", "Algorithms", "Cyber Security", "Cloud Computing",
      "AI & Machine Learning", "Linux", "Git & GitHub",
    ],
  },
  {
    label: "🎓 BSc CSIT Subjects",
    subjects: [
      "Theory of Computation", "Design and Analysis of Algorithms",
      "System Analysis and Design", "Cryptography",
      "Web Technology", "Simulation and Modeling",
      "Image Processing", "Automation and Robotics",
      "Compiler Design and Construction", "Net Centric Computing",
      "E-Governance", "Advanced Java Programming",
      "Data Warehouse and Data Mining", "Network Security",
      "Computer Architecture", "Numerical Methods",
      "Artificial Intelligence", "Software Project Management",
    ],
  },
  {
    label: "📚 Science",
    subjects: ["Math", "Physics", "Chemistry", "Biology", "Statistics"],
  },
  {
    label: "🌍 General",
    subjects: [
      "English", "General Knowledge", "Current Affairs",
      "Nepal GK", "World GK", "History", "Geography",
      "Economics", "Logical Reasoning", "IQ Test",
    ],
  },
];

const TOPIC_SUGGESTIONS = {
  "DBMS": ["SQL", "Normalization", "ER Diagram", "Transactions", "Indexing", "Concurrency", "Relational Algebra"],
  "Python": ["OOP", "Functions", "Lists", "Decorators", "File Handling", "Modules", "Exceptions", "Lambda"],
  "Data Structures": ["Arrays", "Linked Lists", "Trees", "Graphs", "Stacks", "Queues", "Hash Tables", "Heaps"],
  "Algorithms": ["Sorting", "Searching", "Dynamic Programming", "Greedy", "Recursion", "Big O", "Divide & Conquer"],
  "Design and Analysis of Algorithms": ["Sorting", "Greedy", "Dynamic Programming", "Graph Algorithms", "Complexity", "NP Problems"],
  "Theory of Computation": ["DFA", "NFA", "Regular Expressions", "Context Free Grammar", "Turing Machine", "Pumping Lemma"],
  "Cryptography": ["Symmetric Encryption", "RSA", "AES", "DES", "Hash Functions", "Digital Signatures", "Public Key"],
  "Web Technology": ["HTML5", "CSS3", "JavaScript", "PHP", "Ajax", "XML", "JSON", "REST API"],
  "Compiler Design and Construction": ["Lexical Analysis", "Parsing", "Syntax Analysis", "Code Generation", "Optimization"],
  "Data Warehouse and Data Mining": ["ETL", "OLAP", "Association Rules", "Clustering", "Classification", "Data Cubes"],
  "Network Security": ["Firewalls", "VPN", "SSL/TLS", "Intrusion Detection", "Authentication", "Protocols"],
  "Operating System": ["Process Management", "Memory Management", "File Systems", "Deadlocks", "Scheduling", "Virtual Memory"],
  "Computer Networks": ["OSI Model", "TCP/IP", "HTTP", "DNS", "Routing", "Subnetting", "Security"],
  "Java": ["OOP", "Collections", "Threads", "Exceptions", "Generics", "Streams", "Spring Boot"],
  "JavaScript": ["DOM", "Closures", "Promises", "Async/Await", "ES6+", "Prototypes", "Event Loop"],
  "Math": ["Algebra", "Calculus", "Trigonometry", "Statistics", "Probability", "Sets", "Matrices"],
  "Physics": ["Mechanics", "Thermodynamics", "Optics", "Electricity", "Magnetism", "Quantum"],
  "Image Processing": ["Filtering", "Edge Detection", "Segmentation", "Morphology", "Fourier Transform", "Compression"],
  "Simulation and Modeling": ["Monte Carlo", "Queuing Theory", "System Dynamics", "Discrete Event", "Verification"],
  "System Analysis and Design": ["SDLC", "DFD", "Use Cases", "UML", "Requirements", "Testing", "Feasibility"],
};

const DIFFICULTY_COLORS = { easy: "#10B981", medium: "#F59E0B", hard: "#EF4444" };
const DIFFICULTY_BG = { easy: "rgba(16,185,129,0.12)", medium: "rgba(245,158,11,0.12)", hard: "rgba(239,68,68,0.12)" };

const BADGE_LABELS = {
  first_quiz: { title: "First Step", desc: "Completed your first quiz session", icon: "🎯" },
  quiz_5: { title: "Quiz Enthusiast", desc: "Completed 5 quiz sessions", icon: "📚" },
  quiz_25: { title: "Quiz Master", desc: "Completed 25 quiz sessions", icon: "🏆" },
  streak_3: { title: "On Fire", desc: "Maintained a 3-day active streak", icon: "🔥" },
  streak_7: { title: "Unstoppable", desc: "Maintained a 7-day active streak", icon: "⚡" },
  points_100: { title: "Centurion", desc: "Earned 100 total experience points", icon: "⭐" },
  points_500: { title: "Grandmaster", desc: "Earned 500 total experience points", icon: "💎" },
  perfect: { title: "Perfectionist", desc: "Scored 100% on any evaluation", icon: "✨" },
};

const QUIZ_MODES = [
  { id: "practice", icon: "📝", label: "Practice Mode", desc: "Learn with live feedback & hints", available: true },
  { id: "exam", icon: "🎯", label: "Exam Mode", desc: "Timed test without answer reveals", available: true },
  { id: "rapid", icon: "⚡", label: "Rapid Fire", desc: "10 seconds max per question", available: true },
  { id: "revision", icon: "🔄", label: "Revision Mode", desc: "Target prior missed questions", available: true },
];

const Q_COUNTS = [
  { value: 5, label: "5 Qs", premium: false },
  { value: 15, label: "15 Qs", premium: false },
  { value: 30, label: "30 Qs", premium: true },
  { value: 50, label: "50 Qs", premium: true },
];

// ─── MAIN COMPONENT ──────────────────────────────────
export default function QuizArena() {
  const { colors: c, mode } = useTheme();
  const isDark = mode === "dark";

  // Core React State
  const [screen, setScreen] = useState("home"); // home|playing|result
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("quiz_favorites") || "[]"); } catch { return []; }
  });

  // Section Toggle States
  const [showMistakesSection, setShowMistakesSection] = useState(false);
  const [showAnalyticsSection, setShowAnalyticsSection] = useState(false);
  const [showBookmarksSection, setShowBookmarksSection] = useState(false);

  // Setup State
  const [subject, setSubject] = useState("DBMS");
  const [topic, setTopic] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(15);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [quizMode, setQuizMode] = useState("practice");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [openCategory, setOpenCategory] = useState("💻 IT & Programming");

  // Quiz Execution State
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime, setStartTime] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [bookmarkedQs, setBookmarkedQs] = useState(new Set());
  const timerRef = useRef(null);

  // Results State
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [lbFilter, setLbFilter] = useState("all");

  // DOM Refs for Smooth Scrolling
  const setupRef = useRef(null);
  const mistakesRef = useRef(null);
  const analyticsRef = useRef(null);
  const bookmarksRef = useRef(null);
  const achievementsRef = useRef(null);

  // Data Fetching Hooks
  useEffect(() => {
    fetchStats();
    fetchDailyChallenge();
    fetchBookmarks();
    fetchAnalytics(); // <-- Added to ensure accuracy & avg speed populate on load
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try { const res = await api.get("/quiz/stats"); setStats(res.data); }
    catch { console.error("Failed to load stats"); }
    finally { setLoadingStats(false); }
  };

  const fetchDailyChallenge = async () => {
    try { const res = await api.get("/quiz/daily-challenge"); setDailyChallenge(res.data.challenge); }
    catch { console.error("Failed to load daily challenge"); }
  };

  const fetchAnalytics = async () => {
    try { const res = await api.get("/quiz/analytics"); setAnalytics(res.data.analytics); }
    catch { console.error("Failed to load analytics"); }
  };

  const fetchMistakes = async () => {
    try { const res = await api.get("/quiz/mistakes"); setMistakes(res.data.mistakes); }
    catch { console.error("Failed to load mistakes"); }
  };

  const fetchBookmarks = async () => {
    try { const res = await api.get("/quiz/bookmarks"); setBookmarks(res.data.bookmarks || []); }
    catch { console.error("Failed to load bookmarks"); }
  };

  // Timer Lifecycle
  useEffect(() => {
    if (screen === "playing" && !showExplanation && timerSeconds !== 999) {
      setTimeLeft(timerSeconds);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [currentQ, screen, showExplanation]);

  // Handlers & Core Functions
  const scrollToSection = (ref) => {
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleGenerate = async () => {
    setGenError(""); setGenerating(true);
    const effectiveTime = quizMode === "rapid" ? 10 : timerSeconds;
    try {
      const res = await api.post("/quiz/generate", { subject, topic, difficulty, questionCount });
      setQuiz(res.data.quiz);
      setCurrentQ(0); setAnswers([]); setSelected(null);
      setShowExplanation(false); setBookmarkedQs(new Set());
      setTimerSeconds(effectiveTime);
      setQuizStartTime(Date.now()); setStartTime(Date.now());
      setScreen("playing");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { setGenError(err.response?.data?.message || "Failed to generate evaluation. Try again."); }
    finally { setGenerating(false); }
  };

  const handleTimeout = () => {
    clearInterval(timerRef.current);
    setAnswers(prev => [...prev, { selectedAnswer: "", timeTaken: timerSeconds }]);
    setSelected("__timeout__"); setShowExplanation(true);
  };

  const handleSelect = (option) => {
    if (selected !== null || showExplanation) return;
    clearInterval(timerRef.current);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    setSelected(option);
    setAnswers(prev => [...prev, { selectedAnswer: option, timeTaken }]);
    if (quizMode === "exam") {
      setTimeout(() => { setShowExplanation(false); goNext([...answers, { selectedAnswer: option, timeTaken }]); }, 250);
    } else {
      setShowExplanation(true);
    }
  };

  const goNext = (currentAnswers = answers) => {
    if (currentQ + 1 < quiz.questions.length) {
      setCurrentQ(q => q + 1); setSelected(null);
      setShowExplanation(false); setStartTime(Date.now());
    } else { finishQuiz(currentAnswers); }
  };

  const handleNext = () => goNext();

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(q => q - 1);
      setSelected(answers[currentQ - 1]?.selectedAnswer || null);
      setShowExplanation(true);
    }
  };

  const toggleBookmark = async (q) => {
    try {
      const payload = {
        question: q.question, options: q.options || [], answer: q.answer,
        explanation: q.explanation || "", subject: quiz.subject, quizId: quiz._id
      };
      const res = await api.post("/quiz/bookmarks", payload);
      setBookmarkedQs(prev => {
        const n = new Set(prev);
        if (res.data.bookmarked) n.add(currentQ); else n.delete(currentQ);
        return n;
      });
      fetchBookmarks();
    } catch (err) { console.error("Bookmark operation failed:", err); }
  };

  const finishQuiz = async (finalAnswers = answers) => {
    clearInterval(timerRef.current);
    const totalTime = Math.round((Date.now() - quizStartTime) / 1000);
    setSubmitting(true);
    try {
      const res = await api.post("/quiz/submit", { quizId: quiz._id, answers: finalAnswers, timeTaken: totalTime });
      setResult(res.data); setNewBadges(res.data.newBadges || []);
      setScreen("result"); 
      fetchStats();
      fetchAnalytics(); // Refresh analytics after completing a quiz
    } catch { setScreen("result"); }
    finally { setSubmitting(false); }
  };

  const masterMistake = async (id) => {
    try { await api.patch(`/quiz/mistakes/${id}/master`); fetchMistakes(); }
    catch { console.error("Failed to mark mistake as mastered"); }
  };

  const resetQuiz = () => {
    setQuiz(null); setCurrentQ(0); setAnswers([]);
    setSelected(null); setShowExplanation(false);
    setResult(null); setNewBadges([]); setGenError("");
    setScreen("home");
  };

  // Calculations
  const score = answers.filter((a, i) => a.selectedAnswer === quiz?.questions[i]?.answer).length;
  const pct = quiz ? Math.round((score / quiz.questions.length) * 100) : 0;
  const timerColor = timerSeconds === 999 ? c.accent : timeLeft <= Math.floor(timerSeconds * 0.33) ? "#EF4444" : timeLeft <= Math.floor(timerSeconds * 0.66) ? "#F59E0B" : "#10B981";
  
  const filteredCategories = SUBJECT_CATEGORIES.map(cat => ({
    ...cat,
    subjects: cat.subjects.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase()))
  })).filter(cat => cat.subjects.length > 0);

  return (
    <Layout>
      <style>{`
        .qa-viewport {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
          color: ${c.text};
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(16px, 3vw, 24px) clamp(16px, 4vw, 32px) clamp(32px, 6vw, 80px);
          box-sizing: border-box;
          overflow-x: hidden;
          animation: qaFadeIn 0.4s ease-out;
        }

        @keyframes qaFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Seamless Floating Branding Header (Zero container/border) */
        .qa-brand-header {
          display: flex;
          align-items: center;
          margin-bottom: clamp(24px, 4vw, 40px);
          padding: 0;
        }

        .qa-brand-logo {
          font-size: clamp(20px, 2.5vw, 24px);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: ${c.text};
          display: flex;
          align-items: center;
          gap: 8px;
          user-select: none;
        }

        /* Typography Hierarchy */
        .qa-hero-title {
          font-size: clamp(28px, 4.5vw, 44px);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.15;
          margin: 0 0 12px 0;
        }

        .qa-section-title {
          font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.25;
          margin: 0;
        }

        .qa-card-title {
          font-size: clamp(16px, 2vw, 20px);
          font-weight: 700;
          letter-spacing: -0.015em;
          line-height: 1.3;
          margin: 0;
        }

        .qa-secondary {
          font-size: clamp(14px, 1.6vw, 16px);
          font-weight: 500;
          line-height: 1.5;
          color: ${c.textMuted};
        }

        .qa-caption {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${c.textMuted};
        }

        /* Glassmorphism Cards & Elevation */
        .qa-card {
          background: ${isDark ? "rgba(18, 20, 26, 0.75)" : "rgba(255, 255, 255, 0.85)"};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"};
          border-radius: clamp(18px, 2vw, 22px);
          padding: clamp(18px, 3vw, 32px);
          box-shadow: ${isDark ? "0 12px 32px -8px rgba(0,0,0,0.4)" : "0 12px 32px -8px rgba(0,0,0,0.05)"};
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
          width: 100%;
        }

        .qa-card-interactive {
          cursor: pointer;
        }
        .qa-card-interactive:hover {
          transform: translateY(-3px);
          border-color: ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.18)"};
          box-shadow: ${isDark ? "0 18px 40px -10px rgba(0,0,0,0.6)" : "0 18px 40px -10px rgba(0,0,0,0.08)"};
        }

        .qa-card-subtle {
          background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"};
          border-radius: 16px;
          padding: clamp(12px, 2vw, 18px);
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        /* Layout Grids */
        .qa-grid-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(clamp(140px, 20vw, 200px), 1fr));
          gap: clamp(10px, 2vw, 16px);
        }

        .qa-grid-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(clamp(130px, 15vw, 170px), 1fr));
          gap: clamp(8px, 1.5vw, 14px);
        }

        .qa-grid-split {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(clamp(280px, 45vw, 500px), 1fr));
          gap: clamp(16px, 3vw, 28px);
        }

        /* Interactive Buttons */
        .qa-btn-primary {
          min-height: 48px;
          padding: 0 clamp(20px, 3.5vw, 32px);
          background: linear-gradient(135deg, ${c.accent} 0%, ${isDark ? "#8B5CF6" : "#4F46E5"} 100%);
          color: #FFFFFF;
          border: none;
          border-radius: 18px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 16px ${c.accent}40;
          box-sizing: border-box;
        }
        .qa-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 8px 24px ${c.accent}60;
          filter: brightness(1.08);
        }
        .qa-btn-primary:active:not(:disabled) {
          transform: translateY(0) scale(0.99);
        }
        .qa-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .qa-btn-secondary {
          min-height: 48px;
          padding: 0 clamp(18px, 3vw, 26px);
          background: ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"};
          color: ${c.text};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"};
          border-radius: 18px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(8px);
          box-sizing: border-box;
        }
        .qa-btn-secondary:hover:not(:disabled) {
          background: ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"};
          transform: translateY(-1px);
          border-color: ${isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"};
        }

        /* MCQ Options Buttons */
        .qa-option-btn {
          width: 100%;
          padding: clamp(14px, 2vw, 18px) clamp(16px, 2.5vw, 22px);
          background: ${isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"};
          border-radius: 18px;
          color: ${c.text};
          font-size: clamp(14px, 1.6vw, 16px);
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: left;
          box-sizing: border-box;
        }
        .qa-option-btn:hover:not(:disabled) {
          border-color: ${c.accent};
          background: ${c.accent}12;
          transform: translateX(2px);
        }
        .qa-option-btn.correct {
          background: rgba(16,185,129,0.14) !important;
          border-color: #10B981 !important;
          color: ${isDark ? "#34D399" : "#065F46"} !important;
        }
        .qa-option-btn.wrong {
          background: rgba(239,68,68,0.14) !important;
          border-color: #EF4444 !important;
          color: ${isDark ? "#F87171" : "#991B1B"} !important;
        }

        .qa-collapsible-content {
          animation: qaSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes qaSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .qa-btn-primary, .qa-btn-secondary {
            width: 100%;
          }
          .qa-hero-actions {
            width: 100%;
            flex-direction: column;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .qa-viewport, .qa-card, .qa-btn-primary, .qa-btn-secondary, .qa-option-btn {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="qa-viewport">
        {/* ── MINIMAL LOGO BRANDING ── */}
        <header className="qa-brand-header">
          <div className="qa-brand-logo">
            <span>⚡</span>
            <span>QuizArena</span>
          </div>
        </header>

        {/* ── MAIN DASHBOARD VIEW ── */}
        {screen === "home" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(20px, 4vw, 36px)" }}>
            
            {/* HERO SECTION */}
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 24px)" }}>
              <div style={{ maxWidth: "720px" }}>
                <h1 className="qa-hero-title">Master Every Quiz with AI</h1>
                <p className="qa-secondary" style={{ margin: "0 0 24px 0" }}>
                  Generate quizzes instantly, review mistakes, track your progress and improve every day.
                </p>
                
                <div className="qa-hero-actions" style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <button className="qa-btn-primary" onClick={() => scrollToSection(setupRef)}>
                    Start Quiz
                  </button>
                  {quiz ? (
                    <button className="qa-btn-secondary" onClick={() => setScreen("playing")}>
                      Continue Session
                    </button>
                  ) : dailyChallenge ? (
                    <button className="qa-btn-secondary" onClick={() => {
                      setSubject(dailyChallenge.subject);
                      setDifficulty(dailyChallenge.difficulty);
                      setQuestionCount(dailyChallenge.questionCount);
                      scrollToSection(setupRef);
                    }}>
                      Daily Challenge (+{dailyChallenge.reward} XP)
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Stat Counters Display */}
              {stats?.user && (
                <div className="qa-grid-stats" style={{ paddingTop: "clamp(16px, 3vw, 24px)" }}>
                  {[
                    { label: "Total XP", value: `${stats.user.points} XP`, icon: "⭐" },
                    { label: "Current Level", value: `Lvl ${stats.user.level}`, icon: "🏅" },
                    { label: "Active Streak", value: `${stats.user.streak} Days`, icon: "🔥" },
                    { label: "Quizzes Solved", value: `${stats.user.totalQuizzes}`, icon: "📝" },
                  ].map(s => (
                    <div key={s.label} className="qa-card-subtle" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "clamp(20px, 2.5vw, 26px)" }}>{s.icon}</span>
                      <div>
                        <div style={{ fontSize: "clamp(15px, 2vw, 18px)", fontWeight: "800" }}>{s.value}</div>
                        <div className="qa-caption" style={{ fontSize: "10px" }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* QUICK ACTIONS GRID */}
            <div>
              <span className="qa-caption" style={{ display: "block", marginBottom: "12px" }}>Quick Actions</span>
              <div className="qa-grid-actions">
                <div className="qa-card qa-card-interactive" onClick={() => scrollToSection(setupRef)}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>🚀</div>
                  <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "2px" }}>New Quiz</div>
                  <div className="qa-secondary" style={{ fontSize: "12px" }}>Generate custom AI quiz</div>
                </div>

                <div className="qa-card qa-card-interactive" onClick={() => {
                  setShowMistakesSection(prev => !prev);
                  if (!showMistakesSection) { fetchMistakes(); setTimeout(() => scrollToSection(mistakesRef), 100); }
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>❌</div>
                  <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "2px" }}>Mistakes</div>
                  <div className="qa-secondary" style={{ fontSize: "12px" }}>Review missed questions</div>
                </div>

                <div className="qa-card qa-card-interactive" onClick={() => {
                  setShowAnalyticsSection(prev => !prev);
                  if (!showAnalyticsSection) { fetchAnalytics(); setTimeout(() => scrollToSection(analyticsRef), 100); }
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>📊</div>
                  <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "2px" }}>Analytics</div>
                  <div className="qa-secondary" style={{ fontSize: "12px" }}>Performance insights</div>
                </div>

                <div className="qa-card qa-card-interactive" onClick={() => {
                  setShowBookmarksSection(prev => !prev);
                  if (!showBookmarksSection) { fetchBookmarks(); setTimeout(() => scrollToSection(bookmarksRef), 100); }
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>⭐</div>
                  <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "2px" }}>Bookmarks</div>
                  <div className="qa-secondary" style={{ fontSize: "12px" }}>Saved questions list</div>
                </div>

                <div className="qa-card qa-card-interactive" onClick={() => scrollToSection(achievementsRef)}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>🏆</div>
                  <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "2px" }}>Achievements</div>
                  <div className="qa-secondary" style={{ fontSize: "12px" }}>Unlocked badges & rewards</div>
                </div>
              </div>
            </div>

            {/* PERFORMANCE OVERVIEW METRICS */}
            <div>
              <span className="qa-caption" style={{ display: "block", marginBottom: "12px" }}>Performance Overview</span>
              <div className="qa-grid-stats">
                <div className="qa-card-subtle">
                  <div className="qa-caption">Accuracy</div>
                  <div style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: "800", marginTop: "4px", color: "#10B981" }}>
                    {analytics?.overallAccuracy !== undefined 
                      ? `${Math.round(analytics.overallAccuracy)}%` 
                      : stats?.user?.accuracy !== undefined 
                      ? `${stats.user.accuracy}%` 
                      : "---"}
                  </div>
                </div>
                <div className="qa-card-subtle">
                  <div className="qa-caption">Total XP</div>
                  <div style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: "800", marginTop: "4px", color: "#F59E0B" }}>
                    {stats?.user?.points || 0}
                  </div>
                </div>
                <div className="qa-card-subtle">
                  <div className="qa-caption">Level</div>
                  <div style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: "800", marginTop: "4px" }}>
                    Lvl {stats?.user?.level || 1}
                  </div>
                </div>
                <div className="qa-card-subtle">
                  <div className="qa-caption">Completed</div>
                  <div style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: "800", marginTop: "4px" }}>
                    {stats?.user?.totalQuizzes || 0}
                  </div>
                </div>
                <div className="qa-card-subtle">
                  <div className="qa-caption">Avg. Speed</div>
                  <div style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: "800", marginTop: "4px" }}>
                    {analytics?.avgSpeed !== undefined ? `${analytics.avgSpeed}s` : "---"}
                  </div>
                </div>
                <div className="qa-card-subtle">
                  <div className="qa-caption">Streak</div>
                  <div style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: "800", marginTop: "4px", color: "#EF4444" }}>
                    🔥 {stats?.user?.streak || 0}d
                  </div>
                </div>
              </div>
            </div>

            {/* QUIZ SETUP CONFIGURATOR */}
            <div ref={setupRef} className="qa-card" style={{ scrollMarginTop: "30px" }}>
              <div style={{ marginBottom: "clamp(16px, 3vw, 28px)" }}>
                <h2 className="qa-section-title" style={{ marginBottom: "4px" }}>Configure Session</h2>
                <p className="qa-secondary" style={{ margin: 0, fontSize: "14px" }}>Select parameters to prompt AI generation.</p>
              </div>

              <div className="qa-grid-split">
                {/* Left Controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  
                  {/* Mode Selector */}
                  <div>
                    <span className="qa-caption" style={{ display: "block", marginBottom: "10px" }}>Quiz Mode</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                      {QUIZ_MODES.map(m => (
                        <button key={m.id} onClick={() => setQuizMode(m.id)} className="qa-card-subtle" style={{
                          border: `1px solid ${quizMode === m.id ? (isDark ? "#FFFFFF" : "#000000") : "transparent"}`,
                          cursor: "pointer", textAlign: "left", padding: "12px"
                        }}>
                          <div style={{ fontSize: "16px", marginBottom: "2px" }}>{m.icon}</div>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: c.text }}>{m.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject Accordion */}
                  <div>
                    <span className="qa-caption" style={{ display: "block", marginBottom: "10px" }}>Target Subject</span>
                    <input
                      placeholder="Search subjects..."
                      value={subjectSearch}
                      onChange={e => setSubjectSearch(e.target.value)}
                      style={{
                        width: "100%", height: "42px", padding: "0 14px", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, borderRadius: "14px", color: c.text,
                        fontSize: "13px", outline: "none", boxSizing: "border-box", marginBottom: "10px"
                      }}
                    />
                    <div style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, borderRadius: "16px", overflow: "hidden" }}>
                      {filteredCategories.map(cat => (
                        <div key={cat.label} style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
                          <button
                            onClick={() => setOpenCategory(openCategory === cat.label ? "" : cat.label)}
                            style={{ width: "100%", padding: "12px 16px", background: "transparent", border: "none", color: c.text, fontSize: "13px", fontWeight: "600", display: "flex", justifyContent: "space-between", cursor: "pointer" }}
                          >
                            <span>{cat.label}</span>
                            <span>{openCategory === cat.label ? "▲" : "▼"}</span>
                          </button>
                          {(openCategory === cat.label || subjectSearch.length > 0) && (
                            <div style={{ padding: "12px 16px", background: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.01)", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {cat.subjects.map(s => (
                                <button
                                  key={s}
                                  onClick={() => { setSubject(s); setTopic(""); }}
                                  style={{
                                    padding: "6px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: "600",
                                    border: `1px solid ${subject === s ? c.accent : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                                    background: subject === s ? `${c.accent}20` : "transparent",
                                    color: subject === s ? c.accent : c.text, cursor: "pointer"
                                  }}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Topic Input */}
                  <div>
                    <span className="qa-caption" style={{ display: "block", marginBottom: "8px" }}>Topic Context (Optional)</span>
                    <input
                      placeholder="Focus topic (e.g. Normalization)"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      style={{
                        width: "100%", height: "42px", padding: "0 14px", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, borderRadius: "14px", color: c.text,
                        fontSize: "13px", outline: "none", boxSizing: "border-box", marginBottom: "8px"
                      }}
                    />
                    {TOPIC_SUGGESTIONS[subject]?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {TOPIC_SUGGESTIONS[subject].map(t => (
                          <button key={t} onClick={() => setTopic(topic === t ? "" : t)} style={{
                            padding: "4px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "600",
                            border: `1px solid ${topic === t ? c.accent : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                            background: topic === t ? `${c.accent}15` : "transparent",
                            color: topic === t ? c.accent : c.textMuted, cursor: "pointer"
                          }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Summary Panel */}
                <div>
                  <div className="qa-card-subtle" style={{ position: "sticky", top: "30px", display: "flex", flexDirection: "column", gap: "18px" }}>
                    <h3 className="qa-card-title">Summary</h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span className="qa-secondary">Subject</span>
                        <span style={{ fontWeight: "700" }}>{subject}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span className="qa-secondary">Topic</span>
                        <span style={{ fontWeight: "700" }}>{topic || "All Topics"}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span className="qa-secondary">Duration</span>
                        <span style={{ fontWeight: "700" }}>~{Math.round((timerSeconds === 999 ? 45 : timerSeconds) * questionCount / 60)} mins</span>
                      </div>
                    </div>

                    <div>
                      <span className="qa-caption" style={{ display: "block", marginBottom: "8px" }}>Difficulty</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {["easy", "medium", "hard"].map(d => (
                          <button key={d} onClick={() => setDifficulty(d)} style={{
                            flex: 1, padding: "8px", border: `1px solid ${difficulty === d ? DIFFICULTY_COLORS[d] : "transparent"}`,
                            borderRadius: "10px", background: difficulty === d ? DIFFICULTY_BG[d] : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                            color: difficulty === d ? DIFFICULTY_COLORS[d] : c.textMuted, fontSize: "12px", fontWeight: "700", cursor: "pointer", textTransform: "capitalize"
                          }}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="qa-caption" style={{ display: "block", marginBottom: "8px" }}>Questions</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {Q_COUNTS.map(q => (
                          <button key={q.value} onClick={() => q.premium ? setShowPremiumModal(true) : setQuestionCount(q.value)} style={{
                            flex: 1, padding: "8px", border: `1px solid ${questionCount === q.value ? c.accent : "transparent"}`,
                            borderRadius: "10px", background: questionCount === q.value ? `${c.accent}20` : q.premium ? "rgba(245,158,11,0.1)" : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                            color: q.premium ? "#F59E0B" : questionCount === q.value ? c.accent : c.textMuted, fontSize: "12px", fontWeight: "700", cursor: "pointer"
                          }}>
                            {q.premium ? "👑 " : ""}{q.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {genError && <p style={{ fontSize: "12px", color: "#EF4444", margin: 0 }}>{genError}</p>}

                    <button className="qa-btn-primary" onClick={handleGenerate} disabled={generating} style={{ width: "100%" }}>
                      {generating ? "Generating Questions..." : "Generate Session →"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* COLLAPSIBLE MISTAKES REVIEW */}
            {showMistakesSection && (
              <div ref={mistakesRef} className="qa-card qa-collapsible-content" style={{ scrollMarginTop: "30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 className="qa-card-title">Mistakes Review</h3>
                    <p className="qa-secondary" style={{ fontSize: "13px", margin: 0 }}>Target and eliminate past incorrect answers.</p>
                  </div>
                  <button className="qa-btn-secondary" style={{ minHeight: "32px", padding: "0 12px", fontSize: "12px" }} onClick={() => setShowMistakesSection(false)}>
                    Close ✕
                  </button>
                </div>
                {mistakes.length === 0 ? (
                  <p className="qa-secondary" style={{ textAlign: "center", padding: "20px 0" }}>No unmastered mistakes found. Great work!</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {mistakes.map(m => (
                      <div key={m._id} className="qa-card-subtle" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <div className="qa-caption" style={{ color: c.accent, marginBottom: "4px" }}>{m.subject}</div>
                          <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>{m.question}</div>
                          <div style={{ fontSize: "13px", color: "#10B981", fontWeight: "600" }}>Correct Answer: {m.correctAnswer}</div>
                        </div>
                        <button className="qa-btn-secondary" style={{ minHeight: "36px", fontSize: "12px" }} onClick={() => masterMistake(m._id)}>
                          ✓ Mark Mastered
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COLLAPSIBLE ANALYTICS */}
            {showAnalyticsSection && (
              <div ref={analyticsRef} className="qa-card qa-collapsible-content" style={{ scrollMarginTop: "30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 className="qa-card-title">Performance Analytics</h3>
                    <p className="qa-secondary" style={{ fontSize: "13px", margin: 0 }}>Deep breakdown of learning metrics.</p>
                  </div>
                  <button className="qa-btn-secondary" style={{ minHeight: "32px", padding: "0 12px", fontSize: "12px" }} onClick={() => setShowAnalyticsSection(false)}>
                    Close ✕
                  </button>
                </div>
                {!analytics ? (
                  <p className="qa-secondary" style={{ textAlign: "center", padding: "20px 0" }}>Loading metrics...</p>
                ) : (
                  <div className="qa-grid-stats">
                    <div className="qa-card-subtle">
                      <div className="qa-caption">Questions Solved</div>
                      <div style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>{analytics.questionsSolved || 0}</div>
                    </div>
                    <div className="qa-card-subtle">
                      <div className="qa-caption">Strong Subjects</div>
                      <div style={{ fontSize: "13px", fontWeight: "700", marginTop: "6px", color: "#10B981" }}>
                        {analytics.strongSubjects?.join(", ") || "None recorded"}
                      </div>
                    </div>
                    <div className="qa-card-subtle">
                      <div className="qa-caption">Weak Subjects</div>
                      <div style={{ fontSize: "13px", fontWeight: "700", marginTop: "6px", color: "#EF4444" }}>
                        {analytics.weakSubjects?.join(", ") || "None recorded"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COLLAPSIBLE BOOKMARKS */}
            {showBookmarksSection && (
              <div ref={bookmarksRef} className="qa-card qa-collapsible-content" style={{ scrollMarginTop: "30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h3 className="qa-card-title">Saved Questions</h3>
                    <p className="qa-secondary" style={{ fontSize: "13px", margin: 0 }}>Questions bookmarked for quick review.</p>
                  </div>
                  <button className="qa-btn-secondary" style={{ minHeight: "32px", padding: "0 12px", fontSize: "12px" }} onClick={() => setShowBookmarksSection(false)}>
                    Close ✕
                  </button>
                </div>
                {bookmarks.length === 0 ? (
                  <p className="qa-secondary" style={{ textAlign: "center", padding: "20px 0" }}>No bookmarked questions saved.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {bookmarks.map((bm, i) => (
                      <div key={i} className="qa-card-subtle">
                        <div className="qa-caption" style={{ color: c.accent, marginBottom: "4px" }}>{bm.subject}</div>
                        <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>{bm.question}</div>
                        <div style={{ fontSize: "13px", color: "#10B981" }}><strong>Answer:</strong> {bm.answer}</div>
                        {bm.explanation && <div style={{ fontSize: "12px", color: c.textMuted, marginTop: "4px" }}>{bm.explanation}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ACHIEVEMENTS & LEADERBOARD GRID */}
            <div className="qa-grid-split">
              
              {/* Achievements Gallery */}
              <div ref={achievementsRef} className="qa-card" style={{ scrollMarginTop: "30px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 className="qa-card-title">Achievements</h3>
                  <span className="qa-caption">{stats?.user?.badges?.length || 0} Unlocked</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px" }}>
                  {Object.entries(BADGE_LABELS).map(([key, info]) => {
                    const isUnlocked = stats?.user?.badges?.includes(key);
                    return (
                      <div key={key} className="qa-card-subtle" style={{
                        opacity: isUnlocked ? 1 : 0.4, filter: isUnlocked ? "none" : "grayscale(100%)",
                        textAlign: "center", padding: "12px 6px", border: `1px solid ${isUnlocked ? `${c.accent}40` : "transparent"}`
                      }}>
                        <div style={{ fontSize: "22px", marginBottom: "4px" }}>{info.icon}</div>
                        <div style={{ fontSize: "11px", fontWeight: "700", margin: "0 0 2px" }}>{info.title}</div>
                        <div style={{ fontSize: "9px", color: c.textMuted, lineHeight: "1.2" }}>{info.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="qa-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 className="qa-card-title">Leaderboard</h3>
                  <div style={{ display: "flex", gap: "4px", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", padding: "2px", borderRadius: "8px" }}>
                    {["week", "all"].map(f => (
                      <button key={f} onClick={() => setLbFilter(f)} style={{
                        padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", border: "none",
                        background: lbFilter === f ? (isDark ? "#FFFFFF" : "#000000") : "transparent",
                        color: lbFilter === f ? (isDark ? "#000000" : "#FFFFFF") : c.textMuted, cursor: "pointer"
                      }}>{f.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
                {!stats?.leaderboard?.length ? (
                  <p className="qa-secondary" style={{ textAlign: "center", padding: "20px 0" }}>No rankings recorded.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {stats.leaderboard.slice(0, 5).map((u, i) => {
                      const isTop3 = i < 3;
                      const badgeColor = i === 0 ? "#F59E0B" : i === 1 ? "#94A3B8" : i === 2 ? "#D97706" : "transparent";
                      return (
                        <div key={u._id} className="qa-card-subtle" style={{
                          display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px",
                          border: isTop3 ? `1px solid ${badgeColor}40` : "1px solid transparent"
                        }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: "50%", background: badgeColor,
                            color: isTop3 ? "#FFFFFF" : c.textMuted, display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: "11px", fontWeight: "800", flexShrink: 0
                          }}>{i + 1}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "13px", fontWeight: "700" }}>{u.name}</div>
                            <div className="qa-caption" style={{ fontSize: "10px" }}>Level {u.level || 1}</div>
                          </div>
                          <div style={{ fontSize: "13px", fontWeight: "800", color: "#F59E0B" }}>{u.points} XP</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RECENT ACTIVITY LOG */}
            {stats?.recentAttempts?.length > 0 && (
              <div className="qa-card">
                <h3 className="qa-card-title" style={{ marginBottom: "16px" }}>Recent Activity Log</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {stats.recentAttempts.slice(0, 5).map((a) => {
                    const p = Math.round((a.score / a.totalQuestions) * 100);
                    return (
                      <div key={a._id} className="qa-card-subtle" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "10px",
                            background: p >= 80 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px"
                          }}>
                            {p >= 80 ? "🎯" : "💡"}
                          </div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "700" }}>{a.subject}</div>
                            <div className="qa-caption" style={{ fontSize: "10px", textTransform: "none" }}>{a.score}/{a.totalQuestions} Correct · {a.difficulty || "medium"}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "14px", fontWeight: "800", color: p >= 80 ? "#10B981" : "#EF4444" }}>{p}%</div>
                          <div className="qa-caption" style={{ fontSize: "10px" }}>+{a.pointsEarned} XP</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RECOMMENDED TOPICS */}
            <div className="qa-card">
              <h3 className="qa-card-title" style={{ marginBottom: "14px" }}>Recommended Focus Areas</h3>
              <div className="qa-grid-actions">
                {["Data Structures", "System Analysis and Design", "Cyber Security", "Python"].map(rec => (
                  <div key={rec} className="qa-card-subtle qa-card-interactive" onClick={() => { setSubject(rec); scrollToSection(setupRef); }}>
                    <div className="qa-caption" style={{ color: c.accent }}>Suggested Topic</div>
                    <div style={{ fontSize: "13px", fontWeight: "700", marginTop: "2px" }}>{rec}</div>
                    <div className="qa-secondary" style={{ fontSize: "11px", marginTop: "6px" }}>Start Practice Session →</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── PLAYING SCREEN ── */}
        {screen === "playing" && quiz && (
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button className="qa-btn-secondary" style={{ minHeight: "32px", padding: "0 10px", fontSize: "12px" }} onClick={resetQuiz}>
                  ← Exit Quiz
                </button>
                <span style={{ fontSize: "14px", fontWeight: "700" }}>{quiz.subject}</span>
                <span className="qa-caption" style={{ color: DIFFICULTY_COLORS[quiz.difficulty] }}>· {quiz.difficulty}</span>
              </div>
              <span className="qa-caption">Question {currentQ + 1} / {quiz.questions.length}</span>
            </div>

            {/* Dynamic Segmented Progress Bar */}
            <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
              {quiz.questions.map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: "4px", borderRadius: "2px",
                  background: i === currentQ ? c.accent
                    : answers[i]?.selectedAnswer === quiz.questions[i]?.answer ? "#10B981"
                    : answers[i] ? "#EF4444"
                    : bookmarkedQs.has(i) ? "#F59E0B"
                    : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                  transition: "background 0.2s ease"
                }} />
              ))}
            </div>

            {/* Question Card */}
            <div className="qa-card" style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
                <h3 className="qa-card-title" style={{ fontWeight: "600", flex: 1, lineHeight: "1.4" }}>
                  {quiz.questions[currentQ]?.question}
                </h3>
                {timerSeconds !== 999 && (
                  <div style={{
                    minWidth: "36px", height: "36px", borderRadius: "50%", border: `2px solid ${timerColor}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: timerColor
                  }}>{timeLeft}</div>
                )}
              </div>

              {/* MCQ Options Stack */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {quiz.questions[currentQ]?.options.map((option, i) => {
                  const isCorrect = option === quiz.questions[currentQ].answer;
                  const isSelected = option === selected;
                  let cls = "qa-option-btn";
                  if (showExplanation) {
                    if (isCorrect) cls += " correct";
                    else if (isSelected) cls += " wrong";
                  }
                  return (
                    <button key={i} className={cls} onClick={() => handleSelect(option)} disabled={showExplanation}>
                      <div style={{
                        width: "22px", height: "22px", borderRadius: "50%", border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0
                      }}>{String.fromCharCode(65 + i)}</div>
                      <span style={{ flex: 1 }}>{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Dropdown */}
              {showExplanation && quiz.questions[currentQ]?.explanation && quizMode !== "exam" && (
                <div style={{ marginTop: "16px", padding: "14px", background: `${c.accent}10`, border: `1px solid ${c.accent}20`, borderRadius: "14px", fontSize: "13px", lineHeight: "1.5" }}>
                  <strong style={{ color: c.accent }}>Explanation: </strong>{quiz.questions[currentQ].explanation}
                </div>
              )}
            </div>

            {/* Footer Question Nav Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
              <button className="qa-btn-secondary" style={{ minHeight: "38px", fontSize: "13px" }} onClick={() => toggleBookmark(quiz.questions[currentQ])}>
                {bookmarkedQs.has(currentQ) ? "🔖 Bookmarked" : "🏳️ Bookmark"}
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                {currentQ > 0 && <button className="qa-btn-secondary" style={{ minHeight: "38px", fontSize: "13px" }} onClick={handlePrev}>Previous</button>}
                {showExplanation && (
                  <button className="qa-btn-primary" style={{ minHeight: "38px", fontSize: "13px" }} onClick={handleNext} disabled={submitting}>
                    {submitting ? "Submitting..." : currentQ + 1 < quiz.questions.length ? "Next Question →" : "Finish →"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS SCREEN ── */}
        {screen === "result" && (
          <div style={{ maxWidth: "580px", margin: "0 auto", textAlign: "center" }}>
            <div className="qa-card" style={{ padding: "clamp(24px, 4vw, 40px)" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>{pct >= 80 ? "🏆" : pct >= 50 ? "👏" : "💪"}</div>
              <h2 className="qa-section-title" style={{ marginBottom: "8px" }}>Quiz Completed!</h2>
              <p className="qa-secondary" style={{ marginBottom: "20px" }}>Here is how you performed on <strong>{quiz?.subject}</strong></p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "24px" }}>
                <div className="qa-card-subtle">
                  <div className="qa-caption">Score</div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#10B981", marginTop: "4px" }}>{score}/{quiz?.questions?.length}</div>
                </div>
                <div className="qa-card-subtle">
                  <div className="qa-caption">Accuracy</div>
                  <div style={{ fontSize: "20px", fontWeight: "800", marginTop: "4px" }}>{pct}%</div>
                </div>
                <div className="qa-card-subtle">
                  <div className="qa-caption">XP Earned</div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#F59E0B", marginTop: "4px" }}>+{result?.pointsEarned || 0}</div>
                </div>
              </div>

              {newBadges.length > 0 && (
                <div style={{ marginBottom: "20px", padding: "14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "16px" }}>
                  <div className="qa-caption" style={{ color: "#F59E0B", marginBottom: "6px" }}>🎉 New Badge Unlocked!</div>
                  {newBadges.map(b => (
                    <div key={b} style={{ fontWeight: "700", fontSize: "13px" }}>{BADGE_LABELS[b]?.icon} {BADGE_LABELS[b]?.title}</div>
                  ))}
                </div>
              )}

              <button className="qa-btn-primary" onClick={resetQuiz} style={{ width: "100%" }}>
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}