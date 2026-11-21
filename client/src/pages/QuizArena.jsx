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

// Design only: colour used by each mode card / badge / recommendation
const MODE_COLORS = { practice: "#6366F1", exam: "#EF4444", rapid: "#F59E0B", revision: "#10B981" };
const RECO_COLORS = ["#6366F1", "#EC4899", "#10B981", "#F59E0B"];

// ─── MAIN COMPONENT ──────────────────────────────────
export default function QuizArena() {
  const { colors: c, mode } = useTheme();
  const isDark = mode === "dark";

  // Core React State
 const [screen, setScreen] = useState("home"); // home|community|playing|result
const [stats, setStats] = useState(null);
const [loadingStats, setLoadingStats] = useState(true);

// Community Quiz State
const [communityQuizzes, setCommunityQuizzes] = useState([]);
const [loadingCommunity, setLoadingCommunity] = useState(false);
const [communityError, setCommunityError] = useState("");
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
  const [answerFeedback, setAnswerFeedback] = useState(null);
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

  // Fetch quizzes created by all users
const fetchCommunityQuizzes = async () => {
  setLoadingCommunity(true);
  setCommunityError("");

  try {
    const res = await api.get("/quiz/all");
    setCommunityQuizzes(res.data.quizzes || []);
  } catch (err) {
    setCommunityError(
      err.response?.data?.message || "Unable to load community quizzes."
    );
  } finally {
    setLoadingCommunity(false);
  }
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
const handleOpenCommunity = async () => {
  setScreen("community");
  await fetchCommunityQuizzes();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleStartCommunityQuiz = (selectedQuiz) => {
  const effectiveTime = quizMode === "rapid" ? 10 : timerSeconds;

  setQuiz(selectedQuiz);
  setCurrentQ(0);
  setAnswers([]);
  setSelected(null);
  setShowExplanation(false);
  setAnswerFeedback(null);
  setBookmarkedQs(new Set());

  setTimerSeconds(effectiveTime);
  setQuizStartTime(Date.now());
  setStartTime(Date.now());

  setScreen("playing");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  const handleGenerate = async () => {
    setGenError(""); setGenerating(true);
    const effectiveTime = quizMode === "rapid" ? 10 : timerSeconds;
    try {
      const res = await api.post("/quiz/generate", { subject, topic, difficulty, questionCount });
      setQuiz(res.data.quiz);
      setCurrentQ(0); setAnswers([]); setSelected(null);
      setShowExplanation(false); setAnswerFeedback(null); setBookmarkedQs(new Set());
      setTimerSeconds(effectiveTime);
      setQuizStartTime(Date.now()); setStartTime(Date.now());
      setScreen("playing");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { setGenError(err.response?.data?.message || "Failed to generate evaluation. Try again."); }
    finally { setGenerating(false); }
  };

  const handleTimeout = () => {
  if (selected !== null || showExplanation) return;

  clearInterval(timerRef.current);

  setAnswers(prev => [
    ...prev,
    { selectedAnswer: "", timeTaken: timerSeconds }
  ]);

  setSelected("__timeout__");
  setAnswerFeedback(null);
  setShowExplanation(true);
};

  const handleSelect = async (option) => {
  if (selected !== null || showExplanation) return;

  clearInterval(timerRef.current);

  const timeTaken = Math.round((Date.now() - startTime) / 1000);
  const newAnswer = { selectedAnswer: option, timeTaken };

  setSelected(option);
  setAnswers(prev => [...prev, newAnswer]);
  setAnswerFeedback(null);

  if (quizMode === "exam") {
    setTimeout(() => {
      setShowExplanation(false);
      goNext([...answers, newAnswer]);
    }, 250);
  } else {
    try {
      const res = await api.post("/quiz/check-answer", {
        quizId: quiz._id,
        questionIndex: currentQ,
        selectedAnswer: option
      });

      setAnswerFeedback(res.data);
    } catch (err) {
      setAnswerFeedback({
        error: err.response?.data?.message ||
          "Unable to check this answer. Please try again."
      });
    }

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

 const handlePrev = async () => {
  if (currentQ <= 0) return;

  const previousIndex = currentQ - 1;
  const previousAnswer = answers[previousIndex]?.selectedAnswer || "";

  setCurrentQ(previousIndex);
  setSelected(previousAnswer || null);
  setAnswerFeedback(null);
  setShowExplanation(false);
  setStartTime(Date.now());

  if (quizMode === "practice" && previousAnswer) {
    try {
      const res = await api.post("/quiz/check-answer", {
        quizId: quiz._id,
        questionIndex: previousIndex,
        selectedAnswer: previousAnswer
      });

      setAnswerFeedback(res.data);
      setShowExplanation(true);
    } catch {
      setAnswerFeedback({
        error: "Unable to reload answer feedback."
      });
      setShowExplanation(true);
    }
  } else if (quizMode === "exam" && previousAnswer) {
    setShowExplanation(true);
  }
};

 const toggleBookmark = async () => {
  try {
    const payload = {
      quizId: quiz._id,
      questionIndex: currentQ
    };

    const res = await api.post("/quiz/bookmarks", payload);

    setBookmarkedQs(prev => {
      const n = new Set(prev);

      if (res.data.bookmarked) {
        n.add(currentQ);
      } else {
        n.delete(currentQ);
      }

      return n;
    });

    fetchBookmarks();

  } catch (err) {
    console.error("Bookmark operation failed:", err);
  }
};
  const finishQuiz = async (finalAnswers = answers) => {
    if (submitting) return;

    clearInterval(timerRef.current);
    setSubmitting(true);

    try {
      const totalTime = quizStartTime
        ? Math.round((Date.now() - quizStartTime) / 1000)
        : 0;

      const res = await api.post("/quiz/submit", {
        quizId: quiz._id,
        answers: finalAnswers,
        timeTaken: totalTime
      });

      setResult(res.data);
      setNewBadges(res.data.newBadges || []);

      fetchStats();
      fetchAnalytics();
      fetchBookmarks();

      setScreen("result");
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      console.error("Quiz submission failed:", err);
      setGenError(
        err.response?.data?.message ||
        "Unable to submit quiz. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    clearInterval(timerRef.current);

    setQuiz(null);
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setShowExplanation(false);
    setAnswerFeedback(null);
    setTimeLeft(30);
    setStartTime(null);
    setQuizStartTime(null);
    setResult(null);
    setNewBadges([]);
    setBookmarkedQs(new Set());
    setGenError("");
    setSubmitting(false);

    setScreen("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  // Calculations
 const score = result?.attempt?.score ??
  answers.filter((a, i) => a.selectedAnswer === quiz?.questions[i]?.answer).length;

const pct = quiz?.questions?.length
  ? Math.round((score / quiz.questions.length) * 100)
  : 0;
  const timerColor = timerSeconds === 999 ? c.accent : timeLeft <= Math.floor(timerSeconds * 0.33) ? "#EF4444" : timeLeft <= Math.floor(timerSeconds * 0.66) ? "#F59E0B" : "#10B981";
  
  const filteredCategories = SUBJECT_CATEGORIES.map(cat => ({
    ...cat,
    subjects: cat.subjects.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase()))
  })).filter(cat => cat.subjects.length > 0);

  const rootVars = {
    "--qa-accent": c.accent,
    "--qa-text": c.text,
    "--qa-muted": c.textMuted,
    "--qa-faint": c.textFaint,
    "--qa-bg": c.bg,
  };

  return (
    <Layout>
      <style>{`
        .qa-viewport {
          --ease: cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          isolation: isolate;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
          color: var(--qa-text);
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(16px, 3vw, 24px) clamp(16px, 4vw, 32px) clamp(32px, 6vw, 80px);
          box-sizing: border-box;
          overflow-x: hidden;
          overflow-x: clip;
        }
        .qa-viewport *, .qa-viewport *::before, .qa-viewport *::after { box-sizing: border-box; }
        .qa-viewport h1, .qa-viewport h2, .qa-viewport h3, .qa-viewport p { margin: 0; }

        .qa-viewport[data-theme="light"] {
          --qa-card: rgba(255, 255, 255, 0.84);
          --qa-soft: rgba(30, 41, 90, 0.04);
          --qa-line: rgba(30, 41, 90, 0.1);
          --qa-line-strong: rgba(30, 41, 90, 0.22);
          --qa-shadow: 0 12px 32px -10px rgba(30, 41, 90, 0.14);
        }
        .qa-viewport[data-theme="dark"] {
          --qa-card: rgba(20, 25, 42, 0.74);
          --qa-soft: rgba(255, 255, 255, 0.045);
          --qa-line: rgba(255, 255, 255, 0.1);
          --qa-line-strong: rgba(255, 255, 255, 0.22);
          --qa-shadow: 0 14px 34px -10px rgba(0, 0, 0, 0.6);
        }

        /* aurora light behind the page */
        .qa-viewport::before, .qa-viewport::after {
          content: ""; position: absolute; z-index: -1; border-radius: 50%; filter: blur(60px); pointer-events: none;
        }
        .qa-viewport::before {
          top: -140px; right: -100px; width: 460px; height: 460px;
          background: radial-gradient(circle, color-mix(in srgb, var(--qa-accent) 30%, transparent), transparent 70%);
          animation: qaDrift 12s ease-in-out infinite;
        }
        .qa-viewport::after {
          bottom: 10%; left: -140px; width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.2), transparent 70%);
          animation: qaDrift 15s ease-in-out infinite reverse;
        }

        /* entrance keyframes define only the start state, so hover transforms keep working */
        @keyframes qaRise { from { opacity: 0; transform: translateY(16px); } }
        @keyframes qaFade { from { opacity: 0; } }
        @keyframes qaDrift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-30px, 24px); } }
        @keyframes qaPop { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.12); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes qaShake { 0%,100% { translate: 0; } 20% { translate: -7px; } 40% { translate: 7px; } 60% { translate: -4px; } 80% { translate: 4px; } }
        @keyframes qaGlowGreen { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.45); } 50% { box-shadow: 0 0 0 8px rgba(16,185,129,0); } }
        @keyframes qaTextShift { to { background-position: 200% 0; } }
        @keyframes qaFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes qaBolt { 0%,100% { filter: drop-shadow(0 0 0 transparent); transform: scale(1); } 50% { filter: drop-shadow(0 0 8px #FACC15); transform: scale(1.15) rotate(-6deg); } }
        @keyframes qaPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes qaSlideDown { from { opacity: 0; transform: translateY(-12px); } }
        @keyframes qaBounce { 0%,100% { transform: translateY(0) scale(1); } 40% { transform: translateY(-14px) scale(1.08); } 60% { transform: translateY(0) scale(0.96); } }
        @keyframes qaRing { from { box-shadow: 0 0 0 0 color-mix(in srgb, var(--qa-accent) 40%, transparent); } to { box-shadow: 0 0 0 22px transparent; } }

        .qa-stage { animation: qaRise 0.5s var(--ease) backwards; }

        /* ---------- Brand ---------- */
        .qa-brand-header { display: flex; align-items: center; margin-bottom: clamp(24px, 4vw, 40px); animation: qaFade 0.5s ease backwards; }
        .qa-brand-logo {
          display: flex; align-items: center; gap: 8px; user-select: none;
          font-size: clamp(20px, 2.5vw, 24px); font-weight: 800; letter-spacing: -0.03em;
        }
        .qa-brand-logo > span:first-child { display: inline-block; animation: qaBolt 3.2s ease-in-out infinite; }
        .qa-brand-logo > span:last-child {
          background: linear-gradient(90deg, var(--qa-accent), #38BDF8, #EC4899, var(--qa-accent));
          background-size: 200% 100%; -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: qaTextShift 8s linear infinite;
        }

        /* ---------- Typography ---------- */
        .qa-hero-title {
          font-size: clamp(30px, 4.8vw, 48px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.12; margin: 0 0 12px 0;
          background: linear-gradient(100deg, var(--qa-text) 0%, var(--qa-accent) 35%, #38BDF8 60%, #EC4899 85%, var(--qa-text) 100%);
          background-size: 220% 100%; -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: qaTextShift 10s linear infinite;
        }
        .qa-section-title { font-size: clamp(20px, 2.5vw, 28px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.25; }
        .qa-card-title { font-size: clamp(16px, 2vw, 20px); font-weight: 700; letter-spacing: -0.015em; line-height: 1.3; }
        .qa-secondary { font-size: clamp(14px, 1.6vw, 16px); font-weight: 500; line-height: 1.5; color: var(--qa-muted); }
        .qa-caption { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--qa-muted); }

        /* ---------- Cards ---------- */
        .qa-card {
          position: relative; width: 100%;
          background: var(--qa-card); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          border: 1px solid var(--qa-line); border-radius: clamp(18px, 2vw, 24px);
          padding: clamp(18px, 3vw, 32px);
          box-shadow: var(--qa-shadow);
          transition: transform 0.35s var(--ease), border-color 0.3s ease, box-shadow 0.35s ease;
        }
        .qa-card-subtle {
          position: relative;
          background: var(--qa-soft); border: 1px solid var(--qa-line); border-radius: 16px;
          padding: clamp(12px, 2vw, 18px);
          transition: transform 0.3s var(--ease), border-color 0.25s ease, background 0.25s ease, box-shadow 0.3s ease;
        }

        /* colourful stat tiles */
        .qa-stat { --sc: var(--qa-accent); overflow: hidden; animation: qaRise 0.5s var(--ease) backwards; animation-delay: calc(var(--i, 0) * 60ms + 100ms); }
        .qa-stat::before {
          content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: linear-gradient(180deg, var(--sc), transparent);
          transform: scaleY(0.4); transform-origin: top; transition: transform 0.4s var(--ease);
        }
        .qa-stat::after {
          content: ""; position: absolute; right: -30px; bottom: -36px; width: 100px; height: 100px; border-radius: 50%;
          background: radial-gradient(circle, color-mix(in srgb, var(--sc) 22%, transparent), transparent 70%);
          transition: transform 0.5s var(--ease); pointer-events: none;
        }
        .qa-stat:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--sc) 55%, var(--qa-line)); box-shadow: 0 12px 26px color-mix(in srgb, var(--sc) 20%, transparent); }
        .qa-stat:hover::before { transform: scaleY(1); }
        .qa-stat:hover::after { transform: scale(1.7); }
        .qa-stat > * { position: relative; z-index: 1; }
        .qa-stat .qa-emoji { display: inline-block; transition: transform 0.4s var(--ease); }
        .qa-stat:hover .qa-emoji { transform: scale(1.25) rotate(-10deg); }
        .qa-stat-value { color: var(--sc); transition: transform 0.35s var(--ease); transform-origin: left; font-variant-numeric: tabular-nums; }
        .qa-stat:hover .qa-stat-value { transform: scale(1.08); }

        /* quick actions */
        .qa-action {
          --ac: var(--qa-accent);
          overflow: hidden; cursor: pointer;
          animation: qaRise 0.55s var(--ease) backwards; animation-delay: calc(var(--i, 0) * 65ms + 150ms);
        }
        .qa-action::before {
          content: ""; position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(135deg, color-mix(in srgb, var(--ac) 18%, transparent), color-mix(in srgb, var(--ac) 3%, transparent));
          transform: scaleX(0); transform-origin: left; transition: transform 0.5s var(--ease);
        }
        .qa-action::after {
          content: "→"; position: absolute; right: 18px; top: 18px; font-weight: 800; color: var(--ac);
          opacity: 0; transform: translateX(-10px); transition: opacity 0.3s ease, transform 0.4s var(--ease);
        }
        .qa-action > * { position: relative; z-index: 1; }
        .qa-action:hover {
          transform: translateY(-6px);
          border-color: color-mix(in srgb, var(--ac) 60%, var(--qa-line));
          box-shadow: 0 18px 38px color-mix(in srgb, var(--ac) 24%, transparent);
        }
        .qa-action:hover::before { transform: scaleX(1); }
        .qa-action:hover::after { opacity: 1; transform: none; }
        .qa-action:active { transform: translateY(-2px) scale(0.98); }
        .qa-action-icon {
          width: 46px; height: 46px; margin-bottom: 12px; display: grid; place-items: center;
          font-size: 24px; border-radius: 14px;
          background: color-mix(in srgb, var(--ac) 15%, transparent);
          transition: transform 0.45s var(--ease), background 0.3s ease, box-shadow 0.3s ease;
        }
        .qa-action:hover .qa-action-icon { transform: scale(1.14) rotate(-8deg); background: color-mix(in srgb, var(--ac) 28%, transparent); box-shadow: 0 8px 18px color-mix(in srgb, var(--ac) 30%, transparent); }
        .qa-action-title { font-size: 15px; font-weight: 700; margin-bottom: 2px; transition: color 0.25s ease; }
        .qa-action:hover .qa-action-title { color: var(--ac); }

        .qa-reco { --ac: var(--qa-accent); cursor: pointer; overflow: hidden; }
        .qa-reco::before { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: var(--ac); transform: scaleX(0); transform-origin: left; transition: transform 0.45s var(--ease); }
        .qa-reco:hover { transform: translateY(-5px); border-color: color-mix(in srgb, var(--ac) 55%, var(--qa-line)); background: color-mix(in srgb, var(--ac) 8%, var(--qa-soft)); box-shadow: 0 14px 28px color-mix(in srgb, var(--ac) 20%, transparent); }
        .qa-reco:hover::before { transform: scaleX(1); }
        .qa-reco .qa-reco-cta { display: inline-block; transition: transform 0.35s var(--ease), color 0.25s ease; }
        .qa-reco:hover .qa-reco-cta { transform: translateX(5px); color: var(--ac); }

        /* ---------- Layout grids ---------- */
        .qa-grid-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(clamp(140px, 20vw, 200px), 1fr)); gap: clamp(10px, 2vw, 16px); }
        .qa-grid-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(clamp(130px, 15vw, 170px), 1fr)); gap: clamp(8px, 1.5vw, 14px); }
        .qa-grid-split { display: grid; grid-template-columns: repeat(auto-fit, minmax(clamp(280px, 45vw, 500px), 1fr)); gap: clamp(16px, 3vw, 28px); }

        /* ---------- Buttons ---------- */
        .qa-btn-primary {
          position: relative; overflow: hidden;
          min-height: 48px; padding: 0 clamp(20px, 3.5vw, 32px);
          color: #fff; border: 0; border-radius: 16px;
          font: inherit; font-size: 15px; font-weight: 700; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, var(--qa-accent) 0%, ${isDark ? "#8B5CF6" : "#4F46E5"} 100%);
          box-shadow: 0 6px 18px color-mix(in srgb, var(--qa-accent) 35%, transparent);
          transition: transform 0.3s var(--ease), box-shadow 0.3s ease, opacity 0.2s ease;
        }
        .qa-btn-primary::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.38) 50%, transparent 70%);
          transform: translateX(-120%); transition: transform 0.65s var(--ease);
        }
        .qa-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 12px 28px color-mix(in srgb, var(--qa-accent) 50%, transparent); }
        .qa-btn-primary:hover:not(:disabled)::after { transform: translateX(120%); }
        .qa-btn-primary:active:not(:disabled) { transform: scale(0.97); }
        .qa-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        .qa-btn-secondary {
          position: relative; isolation: isolate; overflow: hidden;
          min-height: 48px; padding: 0 clamp(18px, 3vw, 26px);
          color: var(--qa-text); font: inherit; font-size: 15px; font-weight: 600; cursor: pointer;
          background: var(--qa-soft); border: 1px solid var(--qa-line); border-radius: 16px;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          transition: color 0.3s ease, transform 0.3s var(--ease), border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .qa-btn-secondary::before {
          content: ""; position: absolute; inset: 0; z-index: -1;
          background: linear-gradient(135deg, var(--qa-accent), #38BDF8);
          transform: scaleY(0); transform-origin: bottom; transition: transform 0.4s var(--ease);
        }
        .qa-btn-secondary:hover:not(:disabled) { color: #fff; border-color: transparent; transform: translateY(-2px); box-shadow: 0 8px 20px color-mix(in srgb, var(--qa-accent) 30%, transparent); }
        .qa-btn-secondary:hover:not(:disabled)::before { transform: scaleY(1); }
        .qa-btn-secondary:active:not(:disabled) { transform: scale(0.96); }
        .qa-btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
        .qa-btn-primary:focus-visible, .qa-btn-secondary:focus-visible, .qa-chip:focus-visible, .qa-mode:focus-visible,
        .qa-seg:focus-visible, .qa-option-btn:focus-visible, .qa-pill:focus-visible, .qa-acc-head:focus-visible { outline: 2px solid var(--qa-accent); outline-offset: 2px; }

        /* ---------- Form controls ---------- */
        .qa-input {
          width: 100%; height: 44px; padding: 0 14px; margin-bottom: 10px;
          color: var(--qa-text); font: inherit; font-size: 13px; outline: none;
          background: var(--qa-soft); border: 1px solid var(--qa-line); border-radius: 14px;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        }
        .qa-input:hover { border-color: color-mix(in srgb, var(--qa-accent) 45%, var(--qa-line)); }
        .qa-input:focus { border-color: var(--qa-accent); background: var(--qa-card); box-shadow: 0 0 0 4px color-mix(in srgb, var(--qa-accent) 16%, transparent); }
        .qa-input::placeholder { color: var(--qa-faint); }

        .qa-mode {
          --mc: var(--qa-accent);
          position: relative; overflow: hidden; text-align: left; cursor: pointer; padding: 14px;
          font: inherit; color: var(--qa-text);
          background: var(--qa-soft); border: 1px solid var(--qa-line); border-radius: 16px;
          transition: transform 0.3s var(--ease), border-color 0.25s ease, background 0.25s ease, box-shadow 0.3s ease;
        }
        .qa-mode:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--mc) 55%, var(--qa-line)); background: color-mix(in srgb, var(--mc) 7%, var(--qa-soft)); }
        .qa-mode .qa-mode-icon { display: inline-block; font-size: 18px; margin-bottom: 4px; transition: transform 0.4s var(--ease); }
        .qa-mode:hover .qa-mode-icon { transform: scale(1.25) rotate(-10deg); }
        .qa-mode.sel { border-color: var(--mc); background: color-mix(in srgb, var(--mc) 12%, var(--qa-soft)); box-shadow: 0 8px 20px color-mix(in srgb, var(--mc) 22%, transparent); }
        .qa-mode.sel::after {
          content: "✓"; position: absolute; right: 10px; top: 10px; width: 20px; height: 20px; display: grid; place-items: center;
          border-radius: 50%; background: var(--mc); color: #fff; font-size: 11px; font-weight: 800; animation: qaPop 0.4s var(--ease);
        }

        .qa-acc { border: 1px solid var(--qa-line); border-radius: 18px; overflow: hidden; }
        .qa-acc-item { border-bottom: 1px solid var(--qa-line); }
        .qa-acc-item:last-child { border-bottom: 0; }
        .qa-acc-head {
          width: 100%; padding: 14px 16px; display: flex; justify-content: space-between; cursor: pointer;
          font: inherit; font-size: 13px; font-weight: 700; color: var(--qa-text);
          background: transparent; border: 0; transition: background 0.25s ease, color 0.25s ease, padding 0.3s var(--ease);
        }
        .qa-acc-head:hover { background: color-mix(in srgb, var(--qa-accent) 8%, transparent); color: var(--qa-accent); padding-left: 20px; }
        .qa-acc-body { padding: 14px 16px; display: flex; flex-wrap: wrap; gap: 8px; background: var(--qa-soft); animation: qaSlideDown 0.3s var(--ease); }

        .qa-chip {
          padding: 7px 13px; border-radius: 11px; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
          color: var(--qa-text); background: transparent; border: 1px solid var(--qa-line);
          transition: transform 0.25s var(--ease), background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.3s ease;
        }
        .qa-chip.sm { padding: 5px 10px; font-size: 11px; border-radius: 9px; color: var(--qa-muted); }
        .qa-chip:hover { transform: translateY(-2px); border-color: var(--qa-accent); color: var(--qa-accent); background: color-mix(in srgb, var(--qa-accent) 10%, transparent); }
        .qa-chip:active { transform: scale(0.95); }
        .qa-chip.sel { color: #fff; border-color: transparent; background: linear-gradient(135deg, var(--qa-accent), #8B5CF6); box-shadow: 0 6px 14px color-mix(in srgb, var(--qa-accent) 35%, transparent); }

        .qa-summary { position: sticky; top: 30px; display: flex; flex-direction: column; gap: 18px; overflow: hidden; }
        .qa-summary::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px; background: linear-gradient(90deg, var(--qa-accent), #38BDF8, #22C55E); }
        .qa-summary-row { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; }
        .qa-summary-row b { text-align: right; }

        .qa-seg-row { display: flex; gap: 8px; }
        .qa-seg {
          --sc: var(--qa-accent);
          flex: 1; padding: 9px 6px; border-radius: 11px; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer;
          color: var(--qa-muted); background: var(--qa-soft); border: 1px solid transparent; text-transform: capitalize;
          transition: transform 0.25s var(--ease), background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.3s ease;
        }
        .qa-seg:hover { transform: translateY(-2px); color: var(--sc); border-color: color-mix(in srgb, var(--sc) 45%, transparent); background: color-mix(in srgb, var(--sc) 10%, var(--qa-soft)); }
        .qa-seg:active { transform: scale(0.95); }
        .qa-seg.sel { color: var(--sc); border-color: var(--sc); background: color-mix(in srgb, var(--sc) 16%, transparent); box-shadow: 0 6px 14px color-mix(in srgb, var(--sc) 24%, transparent); }

        .qa-generate { width: 100%; min-height: 52px; font-size: 16px; }
        .qa-generating { animation: qaPulse 1.2s ease-in-out infinite; }
        .qa-error { font-size: 12px; font-weight: 600; color: #EF4444; animation: qaShake 0.4s ease; }

        /* ---------- Collapsible sections ---------- */
        .qa-collapsible-content { animation: qaSlideDown 0.35s var(--ease); overflow: hidden; }
        .qa-collapsible-content::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px; background: linear-gradient(90deg, var(--qa-accent), #EC4899); }
        .qa-section-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
        .qa-mini-btn { min-height: 34px; padding: 0 14px; font-size: 12px; border-radius: 11px; }

        .qa-row {
          --rc: var(--qa-accent);
          position: relative; overflow: hidden;
          background: var(--qa-soft); border: 1px solid var(--qa-line); border-radius: 14px;
          padding: 12px 14px;
          animation: qaRise 0.45s var(--ease) backwards; animation-delay: calc(min(var(--i, 0), 8) * 50ms);
          transition: transform 0.3s var(--ease), border-color 0.25s ease, background 0.25s ease, box-shadow 0.3s ease;
        }
        .qa-row::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--rc); transform: scaleY(0); transition: transform 0.35s var(--ease); }
        .qa-row:hover { transform: translateX(5px); border-color: color-mix(in srgb, var(--rc) 45%, var(--qa-line)); background: color-mix(in srgb, var(--rc) 6%, var(--qa-soft)); box-shadow: 0 8px 20px color-mix(in srgb, var(--rc) 14%, transparent); }
        .qa-row:hover::before { transform: scaleY(1); }
        .qa-list { display: flex; flex-direction: column; gap: 10px; }

        /* ---------- Achievements ---------- */
        .qa-badge-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
        .qa-badge {
          text-align: center; padding: 14px 6px; overflow: hidden;
          animation: qaPop 0.5s var(--ease) backwards; animation-delay: calc(var(--i, 0) * 50ms + 150ms);
        }
        .qa-badge.on { border-color: color-mix(in srgb, #F59E0B 50%, transparent); background: linear-gradient(160deg, rgba(245,158,11,0.14), transparent); }
        .qa-badge.on::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%);
          transform: translateX(-120%); animation: qaBadgeShine 4.5s ease-in-out infinite; animation-delay: calc(var(--i, 0) * 0.4s); pointer-events: none;
        }
        @keyframes qaBadgeShine { 50%, 100% { transform: translateX(120%); } }
        .qa-badge .b-icon { display: inline-block; font-size: 24px; margin-bottom: 4px; transition: transform 0.45s var(--ease); }
        .qa-badge:hover { transform: translateY(-5px); }
        .qa-badge.on:hover { box-shadow: 0 12px 24px rgba(245, 158, 11, 0.25); }
        .qa-badge:hover .b-icon { transform: scale(1.3) rotate(-12deg); }
        .qa-badge.off { opacity: 0.4; filter: grayscale(100%); }

        /* ---------- Leaderboard ---------- */
        .qa-pills { display: flex; gap: 4px; padding: 3px; border-radius: 10px; background: var(--qa-soft); border: 1px solid var(--qa-line); }
        .qa-pill {
          padding: 5px 10px; border: 0; border-radius: 8px; font: inherit; font-size: 10px; font-weight: 800; cursor: pointer;
          color: var(--qa-muted); background: transparent; transition: background 0.25s ease, color 0.25s ease, transform 0.25s var(--ease);
        }
        .qa-pill:hover { color: var(--qa-accent); transform: translateY(-1px); }
        .qa-pill.sel { color: #fff; background: linear-gradient(135deg, var(--qa-accent), #8B5CF6); box-shadow: 0 4px 10px color-mix(in srgb, var(--qa-accent) 35%, transparent); }
        .qa-rank { width: 28px; height: 28px; flex-shrink: 0; display: grid; place-items: center; border-radius: 50%; font-size: 11px; font-weight: 800; transition: transform 0.4s var(--ease); }
        .qa-row:hover .qa-rank { transform: scale(1.18) rotate(-8deg); }

        .qa-icon-tile { width: 34px; height: 34px; display: grid; place-items: center; font-size: 15px; border-radius: 11px; transition: transform 0.4s var(--ease); }
        .qa-row:hover .qa-icon-tile { transform: scale(1.15) rotate(-8deg); }

        /* ---------- Playing ---------- */
        .qa-play { max-width: 700px; margin: 0 auto; animation: qaRise 0.45s var(--ease) backwards; }
        .qa-play-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
        .qa-segments { display: flex; gap: 4px; margin-bottom: 20px; }
        .qa-segments i {
          flex: 1; height: 5px; border-radius: 3px; display: block; transform-origin: left;
          transition: background 0.3s ease, transform 0.35s var(--ease);
        }
        .qa-segments i.cur { transform: scaleY(1.7); box-shadow: 0 0 10px color-mix(in srgb, var(--qa-accent) 60%, transparent); }

        .qa-timer {
          --tc: #10B981; --p: 100;
          position: relative; width: 44px; height: 44px; flex-shrink: 0; display: grid; place-items: center; border-radius: 50%;
          font-size: 13px; font-weight: 800; color: var(--tc);
          background: conic-gradient(var(--tc) calc(var(--p) * 1%), var(--qa-line) 0);
          transition: color 0.3s ease;
        }
        .qa-timer::before { content: ""; position: absolute; inset: 4px; border-radius: 50%; background: var(--qa-card); }
        .qa-timer span { position: relative; }
        .qa-timer.urgent { animation: qaPulse 0.8s ease-in-out infinite; }

        .qa-option-btn {
          --oc: var(--qa-accent);
          position: relative; overflow: hidden;
          width: 100%; padding: clamp(14px, 2vw, 18px) clamp(16px, 2.5vw, 22px);
          display: flex; align-items: center; gap: 16px; text-align: left;
          font: inherit; font-size: clamp(14px, 1.6vw, 16px); font-weight: 500; color: var(--qa-text); cursor: pointer;
          background: var(--qa-soft); border: 1px solid var(--qa-line); border-radius: 18px;
          animation: qaRise 0.45s var(--ease) backwards; animation-delay: calc(var(--i, 0) * 60ms + 120ms);
          transition: transform 0.3s var(--ease), border-color 0.25s ease, background 0.25s ease, box-shadow 0.3s ease, color 0.25s ease;
        }
        .qa-option-btn::before {
          content: ""; position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(90deg, color-mix(in srgb, var(--oc) 16%, transparent), transparent);
          transform: scaleX(0); transform-origin: left; transition: transform 0.45s var(--ease);
        }
        .qa-option-btn > * { position: relative; z-index: 1; }
        .qa-option-btn:hover:not(:disabled) { transform: translateX(6px); border-color: var(--oc); box-shadow: 0 8px 22px color-mix(in srgb, var(--oc) 18%, transparent); }
        .qa-option-btn:hover:not(:disabled)::before { transform: scaleX(1); }
        .qa-option-btn:active:not(:disabled) { transform: translateX(6px) scale(0.99); }
        .qa-option-btn:disabled { cursor: default; }
        .qa-letter {
          width: 28px; height: 28px; flex-shrink: 0; display: grid; place-items: center; border-radius: 50%;
          font-size: 12px; font-weight: 800; border: 1px solid var(--qa-line-strong);
          transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, transform 0.35s var(--ease);
        }
        .qa-option-btn:hover:not(:disabled) .qa-letter { background: var(--oc); color: #fff; border-color: var(--oc); transform: scale(1.12); }
        .qa-option-btn.picked { border-color: var(--oc); background: color-mix(in srgb, var(--oc) 10%, var(--qa-soft)); }
        .qa-option-btn.picked .qa-letter { background: var(--oc); color: #fff; border-color: var(--oc); }
        .qa-option-btn.correct { --oc: #10B981; background: rgba(16,185,129,0.14); border-color: #10B981; color: ${isDark ? "#34D399" : "#065F46"}; animation: qaGlowGreen 1.4s ease-out 2; }
        .qa-option-btn.correct::before { transform: scaleX(1); }
        .qa-option-btn.correct .qa-letter { background: #10B981; color: #fff; border-color: #10B981; animation: qaPop 0.45s var(--ease); }
        .qa-option-btn.wrong { --oc: #EF4444; background: rgba(239,68,68,0.14); border-color: #EF4444; color: ${isDark ? "#F87171" : "#991B1B"}; animation: qaShake 0.45s ease; }
        .qa-option-btn.wrong::before { transform: scaleX(1); }
        .qa-option-btn.wrong .qa-letter { background: #EF4444; color: #fff; border-color: #EF4444; }

        .qa-explain {
          margin-top: 16px; padding: 14px 16px; font-size: 13px; line-height: 1.55; border-radius: 14px;
          background: color-mix(in srgb, var(--qa-accent) 8%, transparent);
          border: 1px solid color-mix(in srgb, var(--qa-accent) 22%, transparent);
          border-left: 4px solid var(--qa-accent);
          animation: qaSlideDown 0.4s var(--ease);
        }
        .qa-explain.ok { border-left-color: #10B981; background: rgba(16,185,129,0.08); }
        .qa-explain.bad { border-left-color: #EF4444; background: rgba(239,68,68,0.08); }

        .qa-play-foot { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
        .qa-play-foot .qa-btn-secondary, .qa-play-foot .qa-btn-primary { min-height: 40px; font-size: 13px; padding: 0 18px; }

        /* ---------- Result ---------- */
        .qa-result { max-width: 580px; margin: 0 auto; text-align: center; animation: qaRise 0.5s var(--ease) backwards; }
        .qa-result-card { padding: clamp(24px, 4vw, 40px); overflow: hidden; }
        .qa-result-card::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 4px; background: linear-gradient(90deg, #10B981, var(--qa-accent), #EC4899, #F59E0B); }
        .qa-result-emoji { display: inline-block; font-size: 56px; margin-bottom: 12px; animation: qaBounce 1.4s var(--ease) 0.3s 2; }
        .qa-result-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 24px; }
        .qa-result-grid .qa-card-subtle { animation: qaPop 0.5s var(--ease) backwards; animation-delay: calc(var(--i, 0) * 120ms + 300ms); }
        .qa-result-grid .qa-card-subtle:hover { transform: translateY(-4px) scale(1.04); }
        .qa-new-badge {
          position: relative; overflow: hidden; margin-bottom: 20px; padding: 14px;
          background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.35); border-radius: 16px;
          animation: qaPop 0.55s var(--ease) 0.7s backwards, qaRing 1.8s ease-out 1s 2;
        }

        /* ---------- Loading + misc ---------- */
        .qa-empty { text-align: center; padding: 22px 0; }

        @media (max-width: 640px) {
          .qa-btn-primary, .qa-btn-secondary { width: 100%; }
          .qa-hero-actions { width: 100%; flex-direction: column; }
          .qa-summary { position: static; }
          .qa-mini-btn { width: auto; }
          .qa-play-foot .qa-btn-secondary, .qa-play-foot .qa-btn-primary { width: auto; flex: 1; }
          .qa-result-grid { grid-template-columns: 1fr; }
          .qa-action::after { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .qa-viewport *, .qa-viewport *::before, .qa-viewport *::after {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="qa-viewport" data-theme={mode} style={rootVars}>
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
            <div className="qa-stage" style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 24px)" }}>
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
                    { label: "Total XP", value: `${stats.user.points} XP`, icon: "⭐", color: "#F59E0B" },
                    { label: "Current Level", value: `Lvl ${stats.user.level}`, icon: "🏅", color: "#8B5CF6" },
                    { label: "Active Streak", value: `${stats.user.streak} Days`, icon: "🔥", color: "#EF4444" },
                    { label: "Quizzes Solved", value: `${stats.user.totalQuizzes}`, icon: "📝", color: "#38BDF8" },
                  ].map((s, i) => (
                    <div key={s.label} className="qa-card-subtle qa-stat" style={{ display: "flex", alignItems: "center", gap: "12px", "--sc": s.color, "--i": i }}>
                      <span className="qa-emoji" style={{ fontSize: "clamp(20px, 2.5vw, 26px)" }}>{s.icon}</span>
                      <div>
                        <div className="qa-stat-value" style={{ fontSize: "clamp(15px, 2vw, 18px)", fontWeight: "800" }}>{s.value}</div>
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
                <div className="qa-card qa-action" style={{ "--ac": "#6366F1", "--i": 0 }} onClick={() => scrollToSection(setupRef)}>
                  <div className="qa-action-icon">🚀</div>
                  <div className="qa-action-title">New Quiz</div>
                  <div className="qa-secondary" style={{ fontSize: "12px" }}>Generate custom AI quiz</div>
                </div>
                <div className="qa-card qa-action" style={{ "--ac": "#38BDF8", "--i": 1 }} onClick={handleOpenCommunity}>
                  <div className="qa-action-icon">🌍</div>
                  <div className="qa-action-title">Community Quizzes</div>
                  <div className="qa-secondary" style={{ fontSize: "12px" }}>Explore quizzes created by everyone</div>
                </div>

                <div className="qa-card qa-action" style={{ "--ac": "#EF4444", "--i": 2 }} onClick={() => {
                  setShowMistakesSection(prev => !prev);
                  if (!showMistakesSection) { fetchMistakes(); setTimeout(() => scrollToSection(mistakesRef), 100); }
                }}>
                  <div className="qa-action-icon">❌</div>
                  <div className="qa-action-title">Mistakes</div>
                  <div className="qa-secondary" style={{ fontSize: "12px" }}>Review missed questions</div>
                </div>

                <div className="qa-card qa-action" style={{ "--ac": "#8B5CF6", "--i": 3 }} onClick={() => {
                  setShowAnalyticsSection(prev => !prev);
                  if (!showAnalyticsSection) { fetchAnalytics(); setTimeout(() => scrollToSection(analyticsRef), 100); }
                }}>
                  <div className="qa-action-icon">📊</div>
                  <div className="qa-action-title">Analytics</div>
                  <div className="qa-secondary" style={{ fontSize: "12px" }}>Performance insights</div>
                </div>

                <div className="qa-card qa-action" style={{ "--ac": "#F59E0B", "--i": 4 }} onClick={() => {
                  setShowBookmarksSection(prev => !prev);
                  if (!showBookmarksSection) { fetchBookmarks(); setTimeout(() => scrollToSection(bookmarksRef), 100); }
                }}>
                  <div className="qa-action-icon">⭐</div>
                  <div className="qa-action-title">Bookmarks</div>
                  <div className="qa-secondary" style={{ fontSize: "12px" }}>Saved questions list</div>
                </div>

                <div className="qa-card qa-action" style={{ "--ac": "#10B981", "--i": 5 }} onClick={() => scrollToSection(achievementsRef)}>
                  <div className="qa-action-icon">🏆</div>
                  <div className="qa-action-title">Achievements</div>
                  <div className="qa-secondary" style={{ fontSize: "12px" }}>Unlocked badges & rewards</div>
                </div>
              </div>
            </div>

            {/* PERFORMANCE OVERVIEW METRICS */}
            <div>
              <span className="qa-caption" style={{ display: "block", marginBottom: "12px" }}>Performance Overview</span>
              <div className="qa-grid-stats">
                <div className="qa-card-subtle qa-stat" style={{ "--sc": "#10B981", "--i": 0 }}>
                  <div className="qa-caption">Accuracy</div>
                  <div className="qa-stat-value" style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: "800", marginTop: "4px" }}>
                    {analytics?.overallAccuracy !== undefined 
                      ? `${Math.round(analytics.overallAccuracy)}%` 
                      : stats?.user?.accuracy !== undefined 
                      ? `${stats.user.accuracy}%` 
                      : "---"}
                  </div>
                </div>
                <div className="qa-card-subtle qa-stat" style={{ "--sc": "#F59E0B", "--i": 1 }}>
                  <div className="qa-caption">Total XP</div>
                  <div className="qa-stat-value" style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: "800", marginTop: "4px" }}>
                    {stats?.user?.points || 0}
                  </div>
                </div>
                <div className="qa-card-subtle qa-stat" style={{ "--sc": "#8B5CF6", "--i": 2 }}>
                  <div className="qa-caption">Level</div>
                  <div className="qa-stat-value" style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: "800", marginTop: "4px" }}>
                    Lvl {stats?.user?.level || 1}
                  </div>
                </div>
                <div className="qa-card-subtle qa-stat" style={{ "--sc": "#38BDF8", "--i": 3 }}>
                  <div className="qa-caption">Completed</div>
                  <div className="qa-stat-value" style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: "800", marginTop: "4px" }}>
                    {stats?.user?.totalQuizzes || 0}
                  </div>
                </div>
                <div className="qa-card-subtle qa-stat" style={{ "--sc": "#EC4899", "--i": 4 }}>
                  <div className="qa-caption">Avg. Speed</div>
                  <div className="qa-stat-value" style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: "800", marginTop: "4px" }}>
                    {analytics?.avgSpeed !== undefined ? `${analytics.avgSpeed}s` : "---"}
                  </div>
                </div>
                <div className="qa-card-subtle qa-stat" style={{ "--sc": "#EF4444", "--i": 5 }}>
                  <div className="qa-caption">Streak</div>
                  <div className="qa-stat-value" style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: "800", marginTop: "4px" }}>
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
                        <button key={m.id} onClick={() => setQuizMode(m.id)} className={`qa-mode ${quizMode === m.id ? "sel" : ""}`} style={{ "--mc": MODE_COLORS[m.id] }}>
                          <div className="qa-mode-icon">{m.icon}</div>
                          <div style={{ fontSize: "13px", fontWeight: "700" }}>{m.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject Accordion */}
                  <div>
                    <span className="qa-caption" style={{ display: "block", marginBottom: "10px" }}>Target Subject</span>
                    <input
                      className="qa-input"
                      placeholder="Search subjects..."
                      value={subjectSearch}
                      onChange={e => setSubjectSearch(e.target.value)}
                    />
                    <div className="qa-acc">
                      {filteredCategories.map(cat => (
                        <div key={cat.label} className="qa-acc-item">
                          <button
                            className="qa-acc-head"
                            onClick={() => setOpenCategory(openCategory === cat.label ? "" : cat.label)}
                          >
                            <span>{cat.label}</span>
                            <span>{openCategory === cat.label ? "▲" : "▼"}</span>
                          </button>
                          {(openCategory === cat.label || subjectSearch.length > 0) && (
                            <div className="qa-acc-body">
                              {cat.subjects.map(s => (
                                <button
                                  key={s}
                                  className={`qa-chip ${subject === s ? "sel" : ""}`}
                                  onClick={() => { setSubject(s); setTopic(""); }}
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
                      className="qa-input"
                      placeholder="Focus topic (e.g. Normalization)"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                    />
                    {TOPIC_SUGGESTIONS[subject]?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {TOPIC_SUGGESTIONS[subject].map(t => (
                          <button key={t} className={`qa-chip sm ${topic === t ? "sel" : ""}`} onClick={() => setTopic(topic === t ? "" : t)}>
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Summary Panel */}
                <div>
                  <div className="qa-card-subtle qa-summary">
                    <h3 className="qa-card-title">Summary</h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div className="qa-summary-row">
                        <span className="qa-secondary" style={{ fontSize: "13px" }}>Subject</span>
                        <b>{subject}</b>
                      </div>
                      <div className="qa-summary-row">
                        <span className="qa-secondary" style={{ fontSize: "13px" }}>Topic</span>
                        <b>{topic || "All Topics"}</b>
                      </div>
                      <div className="qa-summary-row">
                        <span className="qa-secondary" style={{ fontSize: "13px" }}>Duration</span>
                        <b>~{Math.round((timerSeconds === 999 ? 45 : timerSeconds) * questionCount / 60)} mins</b>
                      </div>
                    </div>

                    <div>
                      <span className="qa-caption" style={{ display: "block", marginBottom: "8px" }}>Difficulty</span>
                      <div className="qa-seg-row">
                        {["easy", "medium", "hard"].map(d => (
                          <button key={d} className={`qa-seg ${difficulty === d ? "sel" : ""}`} style={{ "--sc": DIFFICULTY_COLORS[d] }} onClick={() => setDifficulty(d)}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="qa-caption" style={{ display: "block", marginBottom: "8px" }}>Questions</span>
                      <div className="qa-seg-row">
                        {Q_COUNTS.map(q => (
                          <button
                            key={q.value}
                            className={`qa-seg ${questionCount === q.value ? "sel" : ""}`}
                            style={{ "--sc": q.premium ? "#F59E0B" : c.accent, color: q.premium && questionCount !== q.value ? "#F59E0B" : undefined, background: q.premium && questionCount !== q.value ? "rgba(245,158,11,0.1)" : undefined }}
                            onClick={() => q.premium ? setShowPremiumModal(true) : setQuestionCount(q.value)}
                          >
                            {q.premium ? "👑 " : ""}{q.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {genError && <p className="qa-error">{genError}</p>}

                    <button className={`qa-btn-primary qa-generate ${generating ? "qa-generating" : ""}`} onClick={handleGenerate} disabled={generating}>
                      {generating ? "Generating Questions..." : "Generate Session →"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* COLLAPSIBLE MISTAKES REVIEW */}
            {showMistakesSection && (
              <div ref={mistakesRef} className="qa-card qa-collapsible-content" style={{ scrollMarginTop: "30px" }}>
                <div className="qa-section-head">
                  <div>
                    <h3 className="qa-card-title">Mistakes Review</h3>
                    <p className="qa-secondary" style={{ fontSize: "13px", margin: 0 }}>Target and eliminate past incorrect answers.</p>
                  </div>
                  <button className="qa-btn-secondary qa-mini-btn" onClick={() => setShowMistakesSection(false)}>
                    Close ✕
                  </button>
                </div>
                {mistakes.length === 0 ? (
                  <p className="qa-secondary qa-empty">No unmastered mistakes found. Great work!</p>
                ) : (
                  <div className="qa-list">
                    {mistakes.map((m, i) => (
                      <div key={m._id} className="qa-row" style={{ "--rc": "#EF4444", "--i": i, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <div className="qa-caption" style={{ color: c.accent, marginBottom: "4px" }}>{m.subject}</div>
                          <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>{m.question}</div>
                          <div style={{ fontSize: "13px", color: "#10B981", fontWeight: "600" }}>Correct Answer: {m.correctAnswer}</div>
                        </div>
                        <button className="qa-btn-secondary qa-mini-btn" onClick={() => masterMistake(m._id)}>
                          ✓ Mark Mastered
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COLLAPSIBLE ANALYTICS */}
            {showAnalyticsSection &&(
              <div ref={analyticsRef} className="qa-card qa-collapsible-content" style={{ scrollMarginTop: "30px" }}>
                <div className="qa-section-head">
                  <div>
                    <h3 className="qa-card-title">Performance Analytics</h3>
                    <p className="qa-secondary" style={{ fontSize: "13px", margin: 0 }}>Deep breakdown of learning metrics.</p>
                  </div>
                  <button className="qa-btn-secondary qa-mini-btn" onClick={() => setShowAnalyticsSection(false)}>
                    Close ✕
                  </button>
                </div>

                {!analytics ? (
                  <p className="qa-secondary qa-empty" style={{ animation: "qaPulse 1.4s ease-in-out infinite" }}>Loading metrics...</p>
                ) : (
                  <>
                    <div className="qa-grid-stats">
                      <div className="qa-card-subtle qa-stat" style={{ "--sc": "#38BDF8", "--i": 0 }}>
                        <div className="qa-caption">Questions Solved</div>
                        <div className="qa-stat-value" style={{ fontSize: "22px", fontWeight: "800", marginTop: "4px" }}>{analytics.totalQuestions || 0}</div>
                      </div>

                      <div className="qa-card-subtle qa-stat" style={{ "--sc": "#10B981", "--i": 1 }}>
                        <div className="qa-caption">Best Subject</div>
                        <div style={{ fontSize: "13px", fontWeight: "700", marginTop: "6px", color: "#10B981" }}>
                          {analytics.bestSubject || "None recorded"}
                        </div>
                      </div>

                      <div className="qa-card-subtle qa-stat" style={{ "--sc": "#EF4444", "--i": 2 }}>
                        <div className="qa-caption">Weakest Subject</div>
                        <div style={{ fontSize: "13px", fontWeight: "700", marginTop: "6px", color: "#EF4444" }}>
                          {analytics.weakSubject || "None recorded"}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: "24px" }}>
                      <h3 className="qa-card-title" style={{ marginBottom: "12px" }}>Recent Quiz Attempts</h3>

                      {!analytics.recentAttempts?.length ? (
                        <p className="qa-secondary">No completed quizzes found yet.</p>
                      ) : (
                        <div style={{ display: "grid", gap: "12px" }}>
                          {analytics.recentAttempts.map((attempt, i) => (
                            <div key={attempt._id} className="qa-row" style={{ "--rc": "#8B5CF6", "--i": i, padding: "14px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                                <div>
                                  <div style={{ fontWeight: "800" }}>{attempt.quizTitle}</div>
                                  <div className="qa-secondary" style={{ fontSize: "12px", marginTop: "4px" }}>
                                    {attempt.subject}
                                  </div>
                                </div>

                                <div style={{ textAlign: "right" }}>
                                  <div style={{ fontWeight: "800" }}>
                                    {attempt.score}/{attempt.totalQuestions}
                                  </div>
                                  <div style={{ color: "#10B981", fontSize: "12px", fontWeight: "700" }}>
                                    {attempt.accuracy}% accuracy
                                  </div>
                                </div>
                              </div>

                              <div className="qa-secondary" style={{ fontSize: "12px", marginTop: "10px" }}>
                                Completed: {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : "Date unavailable"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* COLLAPSIBLE BOOKMARKS */}
            {showBookmarksSection && (
              <div ref={bookmarksRef} className="qa-card qa-collapsible-content" style={{ scrollMarginTop: "30px" }}>
                <div className="qa-section-head">
                  <div>
                    <h3 className="qa-card-title">Saved Questions</h3>
                    <p className="qa-secondary" style={{ fontSize: "13px", margin: 0 }}>Questions bookmarked for quick review.</p>
                  </div>
                  <button className="qa-btn-secondary qa-mini-btn" onClick={() => setShowBookmarksSection(false)}>
                    Close ✕
                  </button>
                </div>
                {bookmarks.length === 0 ? (
                  <p className="qa-secondary qa-empty">No bookmarked questions saved.</p>
                ) : (
                  <div className="qa-list">
                    {bookmarks.map((bm, i) => (
                      <div key={i} className="qa-row" style={{ "--rc": "#F59E0B", "--i": i }}>
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
                <div className="qa-section-head">
                  <h3 className="qa-card-title">Achievements</h3>
                  <span className="qa-caption">{stats?.user?.badges?.length || 0} Unlocked</span>
                </div>
                <div className="qa-badge-grid">
                  {Object.entries(BADGE_LABELS).map(([key, info], i) => {
                    const isUnlocked = stats?.user?.badges?.includes(key);
                    return (
                      <div key={key} className={`qa-card-subtle qa-badge ${isUnlocked ? "on" : "off"}`} style={{ "--i": i }}>
                        <div className="b-icon">{info.icon}</div>
                        <div style={{ fontSize: "11px", fontWeight: "700", margin: "0 0 2px" }}>{info.title}</div>
                        <div style={{ fontSize: "9px", color: c.textMuted, lineHeight: "1.2" }}>{info.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="qa-card">
                <div className="qa-section-head">
                  <h3 className="qa-card-title">Leaderboard</h3>
                  <div className="qa-pills">
                    {["week", "all"].map(f => (
                      <button key={f} className={`qa-pill ${lbFilter === f ? "sel" : ""}`} onClick={() => setLbFilter(f)}>{f.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
                {!stats?.leaderboard?.length ? (
                  <p className="qa-secondary qa-empty">No rankings recorded.</p>
                ) : (
                  <div className="qa-list" style={{ gap: "8px" }}>
                    {stats.leaderboard.slice(0, 5).map((u, i) => {
                      const isTop3 = i < 3;
                      const badgeColor = i === 0 ? "#F59E0B" : i === 1 ? "#94A3B8" : i === 2 ? "#D97706" : "transparent";
                      return (
                        <div key={u._id} className="qa-row" style={{
                          "--rc": isTop3 ? badgeColor : c.accent, "--i": i,
                          display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px",
                          borderColor: isTop3 ? `${badgeColor}55` : undefined
                        }}>
                          <div className="qa-rank" style={{
                            background: isTop3 ? `linear-gradient(135deg, ${badgeColor}, ${badgeColor}bb)` : "transparent",
                            color: isTop3 ? "#FFFFFF" : c.textMuted,
                            boxShadow: isTop3 ? `0 4px 10px ${badgeColor}55` : "none"
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
                <div className="qa-list" style={{ gap: "8px" }}>
                  {stats.recentAttempts.slice(0, 5).map((a, i) => {
                    const p = Math.round((a.score / a.totalQuestions) * 100);
                    return (
                      <div key={a._id} className="qa-row" style={{ "--rc": p >= 80 ? "#10B981" : "#EF4444", "--i": i, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div className="qa-icon-tile" style={{
                            background: p >= 80 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)"
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
                {["Data Structures", "System Analysis and Design", "Cyber Security", "Python"].map((rec, i) => (
                  <div key={rec} className="qa-card-subtle qa-reco" style={{ "--ac": RECO_COLORS[i % RECO_COLORS.length] }} onClick={() => { setSubject(rec); scrollToSection(setupRef); }}>
                    <div className="qa-caption" style={{ color: RECO_COLORS[i % RECO_COLORS.length] }}>Suggested Topic</div>
                    <div style={{ fontSize: "13px", fontWeight: "700", marginTop: "2px" }}>{rec}</div>
                    <div className="qa-secondary qa-reco-cta" style={{ fontSize: "11px", marginTop: "6px" }}>Start Practice Session →</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
                 {/* COMMUNITY QUIZZES SCREEN */}
        {screen === "community" && (
          <div className="qa-stage" style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "20px"
            }}>
              <h2 className="qa-card-title">Community Quizzes</h2>
              <button
                className="qa-btn-secondary"
                onClick={() => setScreen("home")}
              >
                Back
              </button>
            </div>

            {loadingCommunity && (
              <div className="qa-card" style={{ animation: "qaPulse 1.4s ease-in-out infinite" }}>Loading community quizzes...</div>
            )}

            {communityError && (
              <div className="qa-card qa-error">{communityError}</div>
            )}

            {!loadingCommunity && !communityError && communityQuizzes.length === 0 && (
              <div className="qa-card">
                No community quizzes yet. Be the first to create one!
              </div>
            )}

            <div className="qa-grid-actions">
              {communityQuizzes.map((item, i) => (
                <div className="qa-card qa-action" key={item._id} style={{ "--ac": RECO_COLORS[i % RECO_COLORS.length], "--i": i, cursor: "default" }}>
                  <h3 className="qa-card-title qa-action-title" style={{ fontSize: "clamp(16px, 2vw, 20px)" }}>
                    {item.topic || item.subject}
                  </h3>

                  <p className="qa-secondary" style={{ margin: "6px 0" }}>
                    {item.subject} · {item.difficulty} · {item.questions?.length || 0} questions
                  </p>

                  <p className="qa-secondary" style={{ margin: "0 0 14px" }}>
                    Created by {item.createdBy?.name || "STUDORA user"}
                  </p>

                  <button
                    className="qa-btn-primary"
                    onClick={() => handleStartCommunityQuiz(item)}
                  >
                    Attempt Quiz
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PLAYING SCREEN ── */}
        {screen === "playing" && quiz && (
          <div className="qa-play">
            <div className="qa-play-head">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <button className="qa-btn-secondary qa-mini-btn" onClick={resetQuiz}>
                  ← Exit Quiz
                </button>
                <span style={{ fontSize: "14px", fontWeight: "700" }}>{quiz.subject}</span>
                <span className="qa-caption" style={{ color: DIFFICULTY_COLORS[quiz.difficulty] }}>· {quiz.difficulty}</span>
              </div>
              <span className="qa-caption">Question {currentQ + 1} / {quiz.questions.length}</span>
            </div>

            {/* Dynamic Segmented Progress Bar */}
            <div className="qa-segments">
              {quiz.questions.map((_, i) => (
                <i key={i} className={i === currentQ ? "cur" : ""} style={{
                  background: i === currentQ ? c.accent
  : bookmarkedQs.has(i) ? "#F59E0B"
  : answers[i] ? "#64748B"
  : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"
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
                  <div
                    className={`qa-timer ${timeLeft <= Math.floor(timerSeconds * 0.33) ? "urgent" : ""}`}
                    style={{ "--tc": timerColor, "--p": Math.max(0, Math.min(100, (timeLeft / timerSeconds) * 100)) }}
                  >
                    <span>{timeLeft}</span>
                  </div>
                )}
              </div>

              {/* MCQ Options Stack */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
               {quiz.questions[currentQ]?.options.map((option, i) => {
  const isCorrect = answerFeedback?.correct &&
    option === answerFeedback.answer;
  const isSelected = option === selected;
  let cls = "qa-option-btn";

  if (showExplanation && answerFeedback && !answerFeedback.error) {
    if (isCorrect) cls += " correct";
    else if (isSelected && !answerFeedback.correct) cls += " wrong";
  }
  if (isSelected && !cls.includes("correct") && !cls.includes("wrong")) cls += " picked";
                  return (
                    <button key={`${currentQ}-${i}`} className={cls} style={{ "--i": i }} onClick={() => handleSelect(option)} disabled={showExplanation}>
                      <div className="qa-letter">{String.fromCharCode(65 + i)}</div>
                      <span style={{ flex: 1 }}>{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Dropdown */}
             {showExplanation && quizMode !== "exam" && answerFeedback && (
  <div className={`qa-explain ${answerFeedback.error ? "" : answerFeedback.correct ? "ok" : "bad"}`}>
    {answerFeedback.error ? (
      <span>{answerFeedback.error}</span>
    ) : (
      <>
        <strong style={{ color: answerFeedback.correct ? "#10B981" : "#EF4444" }}>
          {answerFeedback.correct ? "Correct! " : "Incorrect. "}
        </strong>
        <div>
          <strong>Correct answer: </strong>{answerFeedback.answer}
        </div>
        {answerFeedback.explanation && (
          <div style={{ marginTop: "6px" }}>
            <strong>Explanation: </strong>{answerFeedback.explanation}
          </div>
        )}
      </>
    )}
  </div>
)}
            </div>

            {/* Footer Question Nav Actions */}
            <div className="qa-play-foot">
              <button className="qa-btn-secondary" onClick={() => toggleBookmark(quiz.questions[currentQ])}>
                {bookmarkedQs.has(currentQ) ? "🔖 Bookmarked" : "🏳️ Bookmark"}
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                {currentQ > 0 && <button className="qa-btn-secondary" onClick={handlePrev}>Previous</button>}
                {showExplanation && (
                  <button className="qa-btn-primary" onClick={handleNext} disabled={submitting}>
                    {submitting ? "Submitting..." : currentQ + 1 < quiz.questions.length ? "Next Question →" : "Finish →"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS SCREEN ── */}
        {screen === "result" && (
          <div className="qa-result">
            <div className="qa-card qa-result-card">
              <div className="qa-result-emoji">{pct >= 80 ? "🏆" : pct >= 50 ? "👏" : "💪"}</div>
              <h2 className="qa-section-title" style={{ marginBottom: "8px" }}>Quiz Completed!</h2>
              <p className="qa-secondary" style={{ marginBottom: "20px" }}>Here is how you performed on <strong>{quiz?.subject}</strong></p>

              <div className="qa-result-grid">
                <div className="qa-card-subtle" style={{ "--i": 0 }}>
                  <div className="qa-caption">Score</div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#10B981", marginTop: "4px" }}>{score}/{result?.attempt?.totalQuestions ?? quiz?.questions?.length ?? 0}</div>
                </div>
                <div className="qa-card-subtle" style={{ "--i": 1 }}>
                  <div className="qa-caption">Accuracy</div>
                  <div style={{ fontSize: "20px", fontWeight: "800", marginTop: "4px" }}>{pct}%</div>
                </div>
                <div className="qa-card-subtle" style={{ "--i": 2 }}>
                  <div className="qa-caption">XP Earned</div>
                  <div style={{ fontSize: "20px", fontWeight: "800", color: "#F59E0B", marginTop: "4px" }}>+{result?.pointsEarned || 0}</div>
                </div>
              </div>

              {newBadges.length > 0 && (
                <div className="qa-new-badge">
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