import  {  useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useInView,
  useSpring,
  useTransform,
  useMotionValue,
} from "framer-motion";

import { useGuest } from "../context/GuestContext";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import AuthModal from "../components/AuthModal";

// --- DATA STRUCTURES ---

const FEATURES = [
  {
    icon: "🤖",
    title: "AI Tutor",
    desc: "Get instant, personalized explanations powered by your study context.",
    color: "#7C6CF0",
    benefits: ["Instant explanations", "Deep concept drilling", "24/7 AI assistance"],
  },
  {
    icon: "📝",
    title: "Smart Notes",
    desc: "Create AI-formatted rich notes with auto-summaries and concept links.",
    color: "#06B6D4",
    benefits: ["Markdown formatting", "Auto-tagging & linking", "Topic synthesis"],
  },
  {
    icon: "📄",
    title: "PDF AI",
    desc: "Upload textbooks or papers to summarize chapters and extract citations.",
    color: "#10B981",
    benefits: ["Instant summarization", "Chapter parsing", "Citation tracing"],
  },
  {
    icon: "📅",
    title: "Study Planner",
    desc: "Schedule study sessions with adaptive deadlines and progress tracking.",
    color: "#F59E0B",
    benefits: ["Smart reminders", "Task blocking", "Streak multipliers"],
  },
  {
    icon: "🎮",
    title: "Quiz Arena",
    desc: "Test your knowledge with AI quizzes and climb global leaderboards.",
    color: "#EF4444",
    benefits: ["Adaptive difficulty", "Performance analytics", "Gamified rewards"],
  },
  {
    icon: "📊",
    title: "Analytics",
    desc: "Track study hours and pinpoint knowledge gaps with predictive diagnostics.",
    color: "#8B5CF6",
    benefits: ["Time attribution maps", "Weakness flagging", "Velocity insights"],
  },
];

const STATS = [
  { numericValue: 10000, suffix: "+", label: "Active Students", icon: "👥" },
  { numericValue: 250000, suffix: "+", label: "AI Questions Solved", icon: "✨" },
  { numericValue: 95, suffix: "%", label: "Satisfaction Rate", icon: "🎯" },
  { numericValue: 24, suffix: "/7", label: "Instant AI Support", icon: "⚡" }
];

const TESTIMONIALS = [
  {
    name: "Dinesh Karthik",
    role: "Pre-Med Student",
    text: "The AI Tutor feels like a premium private professor sitting right next to me, identifying my conceptual gaps perfectly.",
    rating: "⭐⭐⭐⭐⭐",
    avatar: "DK",
    image: "/DineshKarthik.png"
  },
  {
    name: "Elena Rostova",
    role: "Law Student",
    text: "Analyzing case law turned from an 8-hour nightmare into a 30-minute interactive Q&A session.",
    rating: "⭐⭐⭐⭐⭐",
    avatar: "ER",
    image: "/ElenaRostova.png"
  },
  {
    name: "Marcus Vance",
    role: "Electrical Engineering",
    text: "The Quiz Arena predicted almost 80% of my exact midterm questions. Absolute game changer.",
    rating: "⭐⭐⭐⭐⭐",
    avatar: "MV",
    image: "/MarcusVance.png"
  },
  {
    name: "Aria Chen",
    role: "Data Analytics Student",
    text: "Smart Notes auto-linked my statistics terms with python data structures automatically. Saved my semester.",
    rating: "⭐⭐⭐⭐⭐",
    avatar: "AC",
    image: "/Ariachen.png"
  },
  {
    name: "Lucas Meyer",
    role: "Bio-Chemistry",
    text: "The UI design is so ridiculously clean and fast that studying actually feels fun and rewarding.",
    rating: "⭐⭐⭐⭐⭐",
    avatar: "LM",
    image: "/LucasMeyer.png"
  },
  {
    name: "Kiran Jenkins",
    role: "Computer Science Major",
    text: "Studora's PDF AI completely changed how I study for exams. I can summarize dense chapters in minutes.",
    rating: "⭐⭐⭐⭐⭐",
    avatar: "KJ",
    image: "/KiranJenkins.png"
  }
];

const TICKER_ITEMS = [
  { icon: "🤖", title: "AI Tutor" },
  { icon: "📝", title: "Smart Notes" },
  { icon: "📄", title: "PDF AI Parsing" },
  { icon: "📅", title: "Adaptive Planner" },
  { icon: "🎮", title: "Gamified Quizzes" },
  { icon: "📊", title: "Predictive Analytics" },
  { icon: "⚡", title: "Context Synthesis" }
];

// --- HELPER COMPONENTS ---

function AnimatedCounter({ value, suffix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const displayValue = useTransform(spring, (current) =>
    Math.floor(current).toLocaleString()
  );

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <span ref={ref}>
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
}

function AnimatedText({ text, className = "", delay = 0 }) {
  const characters = Array.from(text);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.02, delayChildren: i * delay },
    }),
  };

  const childVariants = {
    hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
  };

  return (
    <motion.div
      style={{ display: "inline-block" }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
    >
      {characters.map((char, index) => (
        <motion.span key={index} variants={childVariants} style={{ display: "inline-block" }}>
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
}

function InteractiveFeatureCard({ feature, index, onPromptAuth }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Mouse move handler for premium cursor spotlight tracking
  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Dynamic spotlight background calculation following the cursor
  const spotlightBg = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.2), rgba(124, 108, 240, 0.08) 40%, transparent 80%)`
  );

  return (
    <motion.div
      className="feature-card-glow-wrapper"
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseMove={handleMouseMove}
      onClick={onPromptAuth}
    >
      {/* Animated gradient border container */}
      <div className="card-animated-border" />

      {/* Mouse Spotlight Layer */}
      <motion.div
        className="spotlight-layer"
        style={{ background: spotlightBg }}
      />

      <div className="feature-card-inner">
        <div className="card-top-section">
          <div className="icon-badge-box">
            <span className="feature-card-icon">{feature.icon}</span>
          </div>

          <div className="title-desc-group">
            <div className="feature-header-row">
              <h3 className="feature-title">{feature.title}</h3>
              <span className="locked-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                LOCKED
              </span>
            </div>
            <p className="feature-desc">{feature.desc}</p>
          </div>
        </div>

        <ul className="feature-benefits">
          {feature.benefits.map((benefit, bIdx) => (
            <li key={bIdx} className="feature-benefit-item">
              <div className="check-icon-circle">
                <span className="check-mark">✓</span>
              </div>
              <span className="benefit-text">{benefit}</span>
            </li>
          ))}
        </ul>

        <div className="feature-card-footer">
          <button
            className="try-btn"
            onClick={(e) => {
              e.stopPropagation();
              onPromptAuth();
            }}
          >
            <span>Unlock Feature</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// MAIN DASHBOARD COMPONENT
function GuestDashboard() {
  const { colors: c } = useTheme();
  const { promptAuth } = useGuest();
  const navigate = useNavigate();

  return (
    <Layout isGuest>
      <AuthModal />

      <style>{`
        /* --- CORE PAGE LAYOUT --- */
        .dashboard-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 16px 16px 80px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          overflow-x: hidden;
        }

        /* --- HERO SECTION --- */
        .hero-section {
          position: relative;
          width: 100%;
          min-height: 480px;
          max-width: 100%;
          margin: 0 auto 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px 20px;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid ${c.border}90;
          background: #0a0a0f;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
        }

        .hero-video-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          z-index: 0;
          filter: none !important;
          transform: translateZ(0);
        }

        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.65),
            rgba(0, 0, 0, 0.35),
            rgba(0, 0, 0, 0.65)
          );
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 720px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(0, 0, 0, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 14px;
          backdrop-filter: blur(8px);
        }

        .hero-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
        }

        .hero-title {
          font-size: clamp(26px, 4.2vw, 46px);
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin: 0 auto 12px;
          text-shadow: 0 4px 16px rgba(0, 0, 0, 0.85);
        }

        .hero-title-gradient {
          display: inline-block;
          background: linear-gradient(270deg, #38BDF8, #A855F7, #F43F5E, #38BDF8);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: glowGradient 6s ease infinite;
          filter: drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.9));
          font-weight: 900;
        }

        @keyframes glowGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .hero-subtitle {
          font-size: clamp(13px, 1.5vw, 15px);
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.95);
          margin: 0 auto;
          max-width: 580px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
          font-weight: 400;
        }

        /* --- BUTTONS --- */
        .btn-primary {
          padding: 12px 24px;
          background: linear-gradient(135deg, ${c.accent}, #5B4FE0);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 18px ${c.accent}45;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 22px ${c.accent}65;
        }

        /* --- PERFECT SMOOTH SLIDING TICKER --- */
        .ticker-section {
          margin-bottom: 54px;
          overflow: hidden;
          position: relative;
        }

        .ticker-mask {
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        }

        .ticker-track {
          display: flex;
          gap: 20px;
          width: max-content;
          will-change: transform;
          animation: smoothScrollTicker 25s linear infinite;
        }

        .ticker-track:hover {
          animation-play-state: paused;
        }

        @keyframes smoothScrollTicker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }

        .ticker-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: ${c.bgCard};
          border: 1px solid ${c.border};
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          color: ${c.text};
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(0,0,0,0.03);
        }

        /* --- STATS GRID --- */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 72px;
        }

        .glow-card-container {
          position: relative;
          border-radius: 20px;
        }

        .glow-effect-bg {
          position: absolute;
          inset: -2px;
          border-radius: 22px;
          background: linear-gradient(135deg, #0894FF, #C959DD, #FF2E54, #FF9004);
          filter: blur(14px);
          opacity: 0.6;
          z-index: 0;
        }

        .stat-card-glow-inner {
          position: relative;
          z-index: 1;
          background: ${c.bgCard};
          border: 1px solid ${c.border};
          border-radius: 20px;
          padding: 28px 20px;
          text-align: center;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
        }

        .stat-icon-wrapper {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: clamp(28px, 3.5vw, 36px);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
          color: ${c.text};
        }

        .stat-label {
          font-size: 13.5px;
          color: ${c.textMuted};
          font-weight: 600;
        }

        /* --- FEATURE CARDS & ADVANCED HOVER EFFECTS --- */
        .section-header {
          text-align: center;
          margin-bottom: 44px;
        }

        .section-title {
          font-size: clamp(26px, 3.2vw, 36px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: ${c.text};
          margin: 0 0 10px;
        }

        .section-subtitle {
          color: ${c.textMuted};
          font-size: 15px;
          max-width: 540px;
          margin: 0 auto;
          line-height: 1.55;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 28px;
          margin-bottom: 80px;
        }

        .feature-card-glow-wrapper {
          position: relative;
          border-radius: 26px;
          background: #ffffff;
          border: 1px solid #E2E8F0;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.3s ease;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.04);
        }

        /* ENHANCED HOVER: Lift (-8px), Scale (1.04), and Blue Glow */
        .feature-card-glow-wrapper:hover {
          transform: translateY(-8px) scale(1.04);
          box-shadow: 0 20px 50px rgba(59, 130, 246, 0.25);
          border-color: rgba(59, 130, 246, 0.4);
        }

        /* ANIMATED GRADIENT BORDER */
        .card-animated-border {
          position: absolute;
          inset: 0;
          border-radius: 26px;
          padding: 2px;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899, #3B82F6);
          background-size: 300% 300%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 2;
        }

        .feature-card-glow-wrapper:hover .card-animated-border {
          opacity: 1;
          animation: borderGlowAnimation 4s ease infinite;
        }

        @keyframes borderGlowAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .spotlight-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          transition: opacity 0.3s ease;
        }

        .feature-card-inner {
          position: relative;
          z-index: 2;
          padding: 28px;
          display: flex;
          flex-direction: column;
          min-height: 380px;
          justify-content: space-between;
        }

        .card-top-section {
          display: flex;
          gap: 18px;
          align-items: flex-start;
          margin-bottom: 22px;
        }

        .icon-badge-box {
          width: 64px;
          height: 64px;
          min-width: 64px;
          border-radius: 18px;
          background: #F3E8FF;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .feature-card-icon {
          font-size: 32px;
          display: inline-block;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* ICON ROTATES & TILTS ON HOVER (5-10 deg) */
        .feature-card-glow-wrapper:hover .feature-card-icon {
          transform: rotate(8deg) scale(1.1);
        }

        .title-desc-group {
          flex: 1;
        }

        .feature-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .feature-title {
          margin: 0;
          font-size: 21px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.01em;
        }

        .locked-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 12px;
          border-radius: 100px;
          background: #FEE2E2;
          color: #DC2626;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .feature-desc {
          margin: 0;
          font-size: 14.5px;
          color: #475569;
          line-height: 1.5;
          font-weight: 500;
        }

        .feature-benefits {
          list-style: none;
          padding: 0;
          margin: 0 0 24px;
          display: flex;
          flex-direction: column;
        }

        .feature-benefit-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px dotted #E2E8F0;
        }

        .feature-benefit-item:last-child {
          border-bottom: none;
        }

        .check-icon-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #EEF2FF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .check-mark {
          color: #6366F1;
          font-weight: 900;
          font-size: 14px;
        }

        .benefit-text {
          font-size: 14.5px;
          font-weight: 700;
          color: #1E293B;
        }

        .feature-card-footer {
          border-top: 1px solid #F1F5F9;
          padding-top: 20px;
        }

        .try-btn {
          width: 100%;
          padding: 14px 20px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          background: linear-gradient(90deg, #6366F1, #8B5CF6);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
          transition: all 0.2s ease;
        }

        .btn-arrow {
          display: inline-block;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* SMALL ARROW SLIDES RIGHT ON HOVER */
        .feature-card-glow-wrapper:hover .btn-arrow {
          transform: translateX(6px);
        }

        .feature-card-glow-wrapper:hover .try-btn {
          background: linear-gradient(90deg, #3B82F6, #7C3AED);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        /* --- PERFECT SMOOTH TESTIMONIALS SLIDER --- */
        .testimonials-section {
          margin-bottom: 80px;
          overflow: hidden;
          position: relative;
        }

        .testimonials-slider-track {
          display: flex;
          gap: 24px;
          width: max-content;
          will-change: transform;
          animation: smoothScrollTestimonials 35s linear infinite;
        }

        .testimonials-slider-track:hover {
          animation-play-state: paused;
        }

        @keyframes smoothScrollTestimonials {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }

        .testimonial-card {
          width: 380px;
          background: ${c.bgCard};
          border: 1px solid ${c.border};
          border-radius: 22px;
          padding: 30px 26px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-4px);
          border-color: ${c.accent}80;
        }

        .testimonial-rating {
          font-size: 15px;
          letter-spacing: 2px;
          margin-bottom: 12px;
        }

        .testimonial-comment {
          font-size: 15px;
          color: ${c.text};
          line-height: 1.6;
          margin: 0 0 22px;
          font-style: normal;
          font-weight: 500;
        }

        .testimonial-meta {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .testimonial-img {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid ${c.accent}40;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          background: linear-gradient(135deg, #06B6D4, ${c.accent});
        }

        .testimonial-avatar-fallback {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06B6D4, ${c.accent});
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          border: 2px solid ${c.accent}40;
        }

        .testimonial-name {
          font-size: 15px;
          font-weight: 800;
          color: ${c.text};
          margin: 0;
        }

        .testimonial-role {
          font-size: 13px;
          color: ${c.textMuted};
          margin: 2px 0 0;
          font-weight: 500;
        }

        /* --- CTA SECTION --- */
        .cta-closure-block {
          position: relative;
          background: linear-gradient(135deg, ${c.bgCard} 0%, rgba(89, 102, 218, 0.08) 100%);
          border: 1px solid ${c.border};
          border-radius: 26px;
          padding: 56px 20px;
          text-align: center;
          overflow: hidden;
        }

        .cta-closure-heading {
          font-size: clamp(24px, 3.4vw, 34px);
          font-weight: 800;
          color: ${c.text};
          letter-spacing: -0.02em;
          margin: 0 0 12px;
        }

        .cta-closure-desc {
          color: ${c.textMuted};
          font-size: 15px;
          max-width: 460px;
          margin: 0 auto 30px;
          line-height: 1.55;
        }

        /* --- REFINED STUDORA FOOTER --- */
        .studora-footer {
          position: relative;
          background: #0B1220;
          color: #CBD5E1;
          margin-top: 80px;
          padding: 80px 24px 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          overflow: hidden;
        }

        .studora-footer-bg-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
          z-index: 0;
        }

        .studora-footer-ambient-glow {
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 300px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .studora-footer-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .studora-footer-grid {
          display: grid;
          grid-template-columns: 2fr repeat(5, 1fr);
          gap: 36px;
          margin-bottom: 60px;
        }

        .footer-brand-col {
          padding-right: 20px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 22px;
          font-weight: 900;
          color: #FFFFFF;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .footer-logo-gradient {
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .footer-tagline {
          font-size: 14px;
          font-weight: 600;
          color: #94A3B8;
          margin-bottom: 16px;
        }

        .footer-about-text {
          font-size: 13.5px;
          color: #CBD5E1;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .footer-col-title {
          font-size: 13px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-links li a {
          color: #CBD5E1;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s ease, transform 0.2s ease;
          display: inline-block;
        }

        .footer-links li a:hover {
          color: #60A5FA;
          transform: translateX(2px);
        }

        .footer-connect-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-connect-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #CBD5E1;
          font-size: 14px;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-connect-item:hover {
          color: #60A5FA;
        }

        .footer-connect-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .footer-connect-item:hover .footer-connect-icon {
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          color: #FFF;
          transform: translateY(-2px);
        }

        .footer-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 40px 0;
          border: none;
        }

        .footer-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 13px;
          color: #94A3B8;
        }

        .footer-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 100px;
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 6px #10B981;
        }

        .footer-legal-links {
          display: flex;
          gap: 16px;
        }

        .footer-legal-links a {
          color: #94A3B8;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-legal-links a:hover {
          color: #60A5FA;
        }

        /* --- RESPONSIVE BREAKPOINTS --- */
        @media (max-width: 1024px) {
          .studora-footer-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
          }
          .footer-brand-col {
            grid-column: span 3;
            padding-right: 0;
            margin-bottom: 12px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container { 
            padding: 12px 12px 60px; 
          }
          .hero-section {
            min-height: auto;
            aspect-ratio: 16 / 10;
            padding: 24px 12px;
            margin-bottom: 24px;
            border-radius: 16px;
          }
          .hero-title {
            font-size: clamp(20px, 5.5vw, 28px);
          }
          .hero-subtitle {
            font-size: clamp(11px, 3vw, 13px);
            line-height: 1.35;
          }
          .stats-grid { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 14px; 
          }
          .features-grid { 
            grid-template-columns: 1fr; 
            gap: 20px; 
          }
          .feature-card-inner {
            min-height: auto;
          }
          .testimonial-card { 
            width: 300px; 
            padding: 22px 20px; 
          }
          .studora-footer {
            padding: 60px 16px 24px;
          }
          .studora-footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 28px;
          }
          .footer-brand-col {
            grid-column: span 2;
          }
          .footer-bottom-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            aspect-ratio: 16 / 12;
            padding: 18px 10px;
          }
          .studora-footer-grid {
            grid-template-columns: 1fr;
          }
          .footer-brand-col {
            grid-column: span 1;
          }
        }
      `}</style>

      <div className="dashboard-container">
        {/* HERO SECTION */}
        <motion.section
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <video className="hero-video-bg" autoPlay loop muted playsInline>
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
          </video>

          <div className="hero-content">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
            >
              <div className="hero-badge-dot" />
              <span>Next-Gen AI Learning Platform</span>
            </motion.div>

            <h1 className="hero-title">
              <AnimatedText text="Unlock Superpowered Learning with " delay={0.05} />
              <span className="hero-title-gradient">STUDORA AI</span>
            </h1>

            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Your adaptive workspace for automated smart notes, context-aware AI tutoring, dynamic PDF parsing, and predictive exam simulations.
            </motion.p>
          </div>
        </motion.section>

        {/* INFINITE FEATURE TICKER */}
        <div className="ticker-section ticker-mask">
          <div className="ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
              <div key={idx} className="ticker-item">
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STATS SECTION */}
        <section className="stats-grid">
          {STATS.map((stat, idx) => (
            <div key={idx} className="glow-card-container">
              <div className="glow-effect-bg" />
              <div className="stat-card-glow-inner">
                <div className="stat-icon-wrapper">{stat.icon}</div>
                <div className="stat-value">
                  <AnimatedCounter value={stat.numericValue} suffix={stat.suffix} />
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* FEATURE SHOWCASE SECTION */}
        <section>
          <div className="section-header">
            <motion.h2
              className="section-title"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Everything you need to study smarter
            </motion.h2>
            <p className="section-subtitle">
              Ditch legacy organizational overhead. Let artificial intelligence construct and synthesize your academic roadmap.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, index) => (
              <InteractiveFeatureCard
                key={f.title}
                feature={f}
                index={index}
                onPromptAuth={promptAuth}
              />
            ))}
          </div>
        </section>

        {/* INFINITE TESTIMONIALS SLIDER */}
        <section className="testimonials-section">
          <div className="section-header">
            <h2 className="section-title">Endorsed by Top Students</h2>
            <p className="section-subtitle">
              See how ambitious students optimize their academic workflows with Studora.
            </p>
          </div>

          <div className="ticker-mask">
            <div className="testimonials-slider-track">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
                <div key={idx} className="testimonial-card">
                  <div>
                    <div className="testimonial-rating">{t.rating}</div>
                    <p className="testimonial-comment">"{t.text}"</p>
                  </div>
                  <div className="testimonial-meta">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="testimonial-img"
                      onError={(e) => {
                        e.target.style.display = "none";
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = "flex";
                        }
                      }}
                    />
                    <div className="testimonial-avatar-fallback" style={{ display: "none" }}>
                      {t.avatar}
                    </div>
                    <div>
                      <h4 className="testimonial-name">{t.name}</h4>
                      <p className="testimonial-role">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA CLOSURE SECTION */}
        <motion.section
          className="cta-closure-block"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="cta-closure-heading">Ready to Study Smarter?</h2>
          <p className="cta-closure-desc">
            Join 10,000+ students already utilizing STUDORA AI to accelerate their degree.
          </p>
          <motion.button
            onClick={() => navigate("/signup")}
            className="btn-primary"
            style={{ fontSize: "15px", padding: "14px 36px" }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Free Account
          </motion.button>
          <p style={{ color: c.textMuted, fontSize: "12px", margin: "14px 0 0", fontWeight: "500" }}>
            No credit card required • Instant access
          </p>
        </motion.section>
      </div>

      {/* STUDORA AI REFINED FOOTER */}
      <footer className="studora-footer">
        <div className="studora-footer-bg-grid" />
        <div className="studora-footer-ambient-glow" />
        
        <div className="studora-footer-container">
          <div className="studora-footer-grid">
            
            {/* BRAND SUMMARY */}
            <div className="footer-brand-col">
              <div className="footer-logo">
                🚀 <span className="footer-logo-gradient">STUDORA AI</span>
              </div>
              <div className="footer-tagline">Learn Smarter. Study Faster. Achieve More.</div>
              <p className="footer-about-text">
                Your AI-powered learning workspace designed for modern students.
                Transform notes, summarize PDFs, chat with AI, prepare for exams, and learn smarter every day.
              </p>
            </div>

            {/* PRODUCT COLUMN */}
            <div>
              <h4 className="footer-col-title">PRODUCT</h4>
              <ul className="footer-links">
                <li><a href="#aitutor">AI Tutor</a></li>
                <li><a href="#notes">Smart Notes</a></li>
                <li><a href="#pdf">PDF AI</a></li>
                <li><a href="#quiz">Quiz Arena</a></li>
                <li><a href="#planner">Study Planner</a></li>
                <li><a href="#analytics">Analytics</a></li>
              </ul>
            </div>

            {/* SUPPORT COLUMN */}
            <div>
              <h4 className="footer-col-title">SUPPORT</h4>
              <ul className="footer-links">
                <li><a href="#docs">Documentation</a></li>
                <li><a href="#tutorials">Tutorials</a></li>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#community">Community</a></li>
                <li><a href="#faqs">FAQs</a></li>
              </ul>
            </div>

            {/* COMPANY COLUMN */}
            <div>
              <h4 className="footer-col-title">COMPANY</h4>
              <ul className="footer-links">
                <li><a href="#about">About</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            {/* LEGAL COLUMN */}
            <div>
              <h4 className="footer-col-title">LEGAL</h4>
              <ul className="footer-links">
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#cookies">Cookies Policy</a></li>
              </ul>
            </div>

            {/* CONNECT COLUMN */}
            <div>
              <h4 className="footer-col-title">CONNECT</h4>
              <div className="footer-connect-list">
                <a href="mailto:support@studora.ai" className="footer-connect-item">
                  <div className="footer-connect-icon">📧</div>
                  <span>support@studora.ai</span>
                </a>
                <a href="https://studora.ai" className="footer-connect-item">
                  <div className="footer-connect-icon">🌐</div>
                  <span>studora.ai</span>
                </a>
                <a href="#twitter" className="footer-connect-item">
                  <div className="footer-connect-icon">🐦</div>
                  <span>X (Twitter)</span>
                </a>
                <a href="#linkedin" className="footer-connect-item">
                  <div className="footer-connect-icon">💼</div>
                  <span>LinkedIn</span>
                </a>
                <a href="#instagram" className="footer-connect-item">
                  <div className="footer-connect-icon">📷</div>
                  <span>Instagram</span>
                </a>
                <a href="#github" className="footer-connect-item">
                  <div className="footer-connect-icon">🐙</div>
                  <span>GitHub</span>
                </a>
              </div>
            </div>

          </div>

          <hr className="footer-divider" />

          {/* BOTTOM BAR */}
          <div className="footer-bottom-bar">
            <div>
              © 2026 STUDORA AI. All rights reserved. • Built with ❤️ using React, Node.js, Express & MongoDB.
            </div>
            
            <div className="footer-status-badge">
              <div className="status-dot" />
              <span>Status ● All Systems Operational</span>
            </div>

            <div>
              Version 2.0 • Made with ❤️ for learners worldwide 🇳P
            </div>

            <div className="footer-legal-links">
              <a href="#privacy">Privacy</a>
              <span>•</span>
              <a href="#terms">Terms</a>
              <span>•</span>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
}

export default GuestDashboard;