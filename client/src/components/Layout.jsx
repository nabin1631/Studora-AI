import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useGuest } from "../context/GuestContext";
import NotificationPanel from "./NotificationPanel";

// SVG Icon Definitions
const Icons = {
  Dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ),
  AITutor: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8.01" y2="16" />
      <line x1="16" y1="16" x2="16.01" y2="16" />
    </svg>
  ),
  PDFAI: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Notes: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Planner: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  QuizArena: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <circle cx="15" cy="13" r="1" />
      <circle cx="17.5" cy="10.5" r="1" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.246 2.196-.282 5.378 1.134 7.618A4 4 0 0 0 7.302 18h9.396a4 4 0 0 0 3.466-1.792c1.416-2.24 1.38-5.422 1.134-7.618A4 4 0 0 0 17.32 5z" />
    </svg>
  ),
  Analytics: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  ChevronRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Sun: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  Moon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
};

// `color` is only used for each item's hover/active tint (sidebar design only).
const NAV_ITEMS = [
  { to: "/dashboard", icon: Icons.Dashboard, label: "Dashboard", sub: "Your learning hub", category: "WORKSPACE", color: "#6366F1" },
  { to: "/ai-tutor", icon: Icons.AITutor, label: "AI Tutor", sub: "Ask anything", category: "WORKSPACE", color: "#10B981" },
  { to: "/pdf-ai", icon: Icons.PDFAI, label: "PDF AI", sub: "Chat with PDFs", category: "WORKSPACE", color: "#F59E0B" },
  { to: "/notes", icon: Icons.Notes, label: "Notes", sub: "Take smart notes", category: "PRODUCTIVITY", color: "#2563EB" },
  { to: "/planner", icon: Icons.Planner, label: "Planner", sub: "Plan your schedule", category: "PRODUCTIVITY", color: "#EC4899" },
  { to: "/quiz-arena", icon: Icons.QuizArena, label: "Quiz Arena", sub: "Practice & compete", category: "PRODUCTIVITY", color: "#EF4444" },
  { to: "/analytics", icon: Icons.Analytics, label: "Analytics", sub: "Track your progress", category: "PRODUCTIVITY", color: "#8B5CF6" },
  { to: "/settings", icon: Icons.Settings, label: "Settings", sub: "Preferences & more", category: "ACCOUNT", color: "#38BDF8" },
];

function Layout({ children, isGuest = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const themeCtx = useTheme();
  const { colors: c } = themeCtx;
  const navigate = useNavigate();
  const { promptAuth } = useGuest();

  // Works with the common ThemeContext shapes (toggleTheme / isDark, etc.)
  const toggleTheme =
    themeCtx.toggleTheme || themeCtx.toggle || themeCtx.toggleMode || themeCtx.switchTheme || (() => {});
  const isDark =
    typeof themeCtx.isDark === "boolean"
      ? themeCtx.isDark
      : themeCtx.darkMode === true || themeCtx.theme === "dark" || themeCtx.mode === "dark";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getNavItemsByCategory = (cat) => NAV_ITEMS.filter((item) => item.category === cat);

  const userName = user?.name || user?.username || "Nabin Basyal";
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "N";

  const themeStyles = {
    "--sidebar-w": "300px",
    "--navbar-h": "60px",
    "--theme-bg": c.bg || "#F7F8FC",
    "--theme-card-bg": c.bgCard || "#FFFFFF",
    "--theme-secondary-bg": c.bgSecondary || "#FAF9FE",
    "--theme-border": c.border || "#E8EAF3",
    "--theme-border-subtle": c.borderSubtle || "#F1F3F9",
    "--theme-text-primary": c.text || "#111827",
    "--theme-text-secondary": c.textSecondary || "#6B7280",
    "--theme-text-faint": c.textFaint || "#9CA3AF",
    "--theme-accent": c.accent || "#6E3AFF",
  };

  const renderNavGroup = (category, isMobileView) => (
    <div key={category} style={{ marginBottom: "16px" }}>
      <div className="nav-category-header">{category}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {getNavItemsByCategory(category).map((item) => {
          const itemStyle = { "--nc": item.color, "--ni": NAV_ITEMS.indexOf(item) };

          if (isGuest) {
            return (
              <div
                key={item.to}
                onClick={() => {
                  promptAuth();
                  if (isMobileView) setSidebarOpen(false);
                }}
                className="nav-card-item"
                style={itemStyle}
                role="button"
                tabIndex={0}
              >
                <div className="nav-icon-badge">{item.icon}</div>
                <div className="nav-text-container">
                  <span className="nav-title-text">{item.label}</span>
                  <span className="nav-sub-text">{item.sub}</span>
                </div>
                <span className="guest-lock-icon">🔒</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={itemStyle}
              onClick={() => isMobileView && setSidebarOpen(false)}
              className={({ isActive }) => `nav-card-item ${isActive ? "active" : ""}`}
            >
              <div className="nav-icon-badge">{item.icon}</div>
              <div className="nav-text-container">
                <span className="nav-title-text">{item.label}</span>
                <span className="nav-sub-text">{item.sub}</span>
              </div>
              <span className="active-chevron">{Icons.ChevronRight}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="app-layout-root" style={themeStyles}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body, html {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: var(--theme-bg);
          color: var(--theme-text-primary);
          -webkit-font-smoothing: antialiased;
        }

        .app-layout-root {
          height: 100dvh;
          width: 100vw;
          display: flex;
          background: var(--theme-bg);
          overflow: hidden;
          position: relative;
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* PREMIUM STICKY NAVBAR (60px) */
        .navbar-header {
          height: var(--navbar-h);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          gap: 16px;
          background: var(--theme-card-bg);
          border-bottom: 1px solid var(--theme-border);
          position: sticky;
          top: 0;
          z-index: 40;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          transition: all 200ms ease;
        }

        .icon-btn {
          background: var(--theme-card-bg);
          border: 1px solid var(--theme-border);
          cursor: pointer;
          color: var(--theme-text-secondary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          transition: all 200ms ease;
          flex-shrink: 0;
        }

        .icon-btn:hover {
          background: var(--theme-bg);
          border-color: var(--theme-accent);
          color: var(--theme-accent);
        }

        /* ----- Dark / Light mode toggle ----- */
        .theme-toggle-btn {
          overflow: hidden;
          position: relative;
        }
        .theme-toggle-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: lxThemeSpin 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .theme-toggle-btn:hover .theme-toggle-icon {
          transform: rotate(18deg) scale(1.12);
        }
        .theme-toggle-btn:active .theme-toggle-icon {
          transform: scale(0.9);
        }
        .theme-toggle-btn.is-dark {
          color: #F59E0B;
        }
        .theme-toggle-btn.is-dark:hover {
          border-color: #F59E0B;
          color: #F59E0B;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.14);
        }
        .theme-toggle-btn:not(.is-dark):hover {
          box-shadow: 0 0 0 3px rgba(110, 58, 255, 0.12);
        }
        @keyframes lxThemeSpin {
          from { opacity: 0; transform: rotate(-90deg) scale(0.5); }
        }

        .btn-primary {
          background: var(--theme-accent);
          color: #FFFFFF;
          border: none;
          border-radius: 10px;
          padding: 0 16px;
          height: 38px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(110, 58, 255, 0.2);
          transition: all 200ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(110, 58, 255, 0.3);
        }

        .btn-secondary {
          background: var(--theme-card-bg);
          color: var(--theme-text-primary);
          border: 1px solid var(--theme-border);
          border-radius: 10px;
          padding: 0 16px;
          height: 38px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms ease;
        }

        .btn-secondary:hover {
          background: var(--theme-bg);
        }

        /* LOGO STYLING - UNWRAPPED & ENLARGED */
        .brand-logo-img {
          height: 36px;
          width: auto;
          object-fit: contain;
          display: block;
        }

        /* =====================================================
           SIDEBAR (restyled: only design + hover animation)
        ===================================================== */

        @keyframes lxSlideIn { from { opacity: 0; transform: translateX(-14px); } }
        @keyframes lxFade { from { opacity: 0; } }
        @keyframes lxAurora {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-16px, 12px) scale(1.15); }
        }
        @keyframes lxShine { 50%, 100% { transform: translateX(120%); } }

        .sidebar-fixed {
          --ease: cubic-bezier(0.22, 1, 0.36, 1);
          position: relative;
          width: var(--sidebar-w);
          flex-shrink: 0;
          background: var(--theme-card-bg);
          border-right: 1px solid var(--theme-border);
          display: flex;
          flex-direction: column;
          z-index: 30;
          transition: background 200ms ease, border-color 200ms ease;
        }

        /* soft accent glow at the top of the sidebar */
        .sidebar-fixed::before, .sidebar-mobile::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 170px;
          background: radial-gradient(120% 100% at 0% 0%, color-mix(in srgb, var(--theme-accent) 12%, transparent), transparent 70%);
          pointer-events: none;
        }
        .sidebar-fixed > *, .sidebar-mobile > * { position: relative; }

        .sidebar-header-area {
          padding: 18px 24px 14px 24px;
          flex-shrink: 0;
        }

        .sidebar-scroll-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 8px 16px 24px 16px;
        }

        .nav-category-header {
          display: flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
          font-size: 11px;
          color: var(--theme-text-faint);
          letter-spacing: 0.08em;
          font-weight: 700;
          padding: 12px 12px 8px 12px;
        }
        .nav-category-header::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, var(--theme-border), transparent);
        }

        /* ----- Menu item ----- */
        .nav-card-item {
          --ease: cubic-bezier(0.22, 1, 0.36, 1);
          --nc: var(--theme-accent);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid transparent;
          text-decoration: none;
          cursor: pointer;
          background: transparent;
          animation: lxSlideIn 0.5s var(--ease) backwards;
          animation-delay: calc(var(--ni, 0) * 45ms + 120ms);
          transition: transform 0.35s var(--ease), border-color 0.3s ease, box-shadow 0.35s ease;
        }
        .nav-card-item > * { position: relative; z-index: 1; }

        /* colour wash that sweeps in from the left on hover */
        .nav-card-item::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          background: linear-gradient(90deg, color-mix(in srgb, var(--nc) 16%, transparent), color-mix(in srgb, var(--nc) 3%, transparent));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.45s var(--ease);
        }

        /* accent bar on the left edge, grows from the centre */
        .nav-card-item::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          z-index: 2;
          width: 3px;
          height: 0;
          border-radius: 0 4px 4px 0;
          background: var(--nc);
          transform: translateY(-50%);
          transition: height 0.4s var(--ease);
        }

        .nav-card-item:hover {
          transform: translateX(5px);
          border-color: color-mix(in srgb, var(--nc) 25%, transparent);
          box-shadow: 0 6px 16px color-mix(in srgb, var(--nc) 12%, transparent);
        }
        .nav-card-item:hover::after { transform: scaleX(1); }
        .nav-card-item:hover::before { height: 22px; }
        .nav-card-item:active { transform: translateX(5px) scale(0.98); }
        .nav-card-item:focus-visible { outline: 2px solid var(--nc); outline-offset: 2px; }

        .nav-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--nc) 14%, transparent);
          color: var(--nc);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.45s var(--ease), background 0.3s ease, color 0.3s ease, box-shadow 0.35s ease;
        }
        .nav-card-item:hover .nav-icon-badge {
          transform: scale(1.1) rotate(-8deg);
          background: var(--nc);
          color: #FFFFFF;
          box-shadow: 0 6px 14px color-mix(in srgb, var(--nc) 40%, transparent);
        }

        .nav-text-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .nav-title-text {
          color: var(--theme-text-primary);
          font-size: 13.5px;
          font-weight: 600;
          line-height: 1.25;
          transition: color 0.25s ease, transform 0.35s var(--ease);
        }
        .nav-card-item:hover .nav-title-text { color: var(--nc); transform: translateX(2px); }

        .nav-sub-text {
          color: var(--theme-text-secondary);
          font-size: 11.5px;
          font-weight: 500;
          margin-top: 1px;
          transition: transform 0.35s var(--ease) 0.03s;
        }
        .nav-card-item:hover .nav-sub-text { transform: translateX(2px); }

        .active-chevron {
          display: flex;
          color: var(--nc);
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.25s ease, transform 0.4s var(--ease);
        }
        .nav-card-item:hover .active-chevron { opacity: 0.75; transform: translateX(0); }

        .guest-lock-icon {
          font-size: 12px;
          color: var(--theme-text-faint);
          transition: transform 0.35s var(--ease);
        }
        .nav-card-item:hover .guest-lock-icon { transform: scale(1.25) rotate(-10deg); }

        /* ----- Active route ----- */
        .nav-card-item.active {
          background: linear-gradient(90deg, color-mix(in srgb, var(--nc) 16%, transparent), color-mix(in srgb, var(--nc) 4%, transparent));
          border-color: color-mix(in srgb, var(--nc) 30%, transparent);
        }
        .nav-card-item.active::after { display: none; }
        .nav-card-item.active::before { height: 26px; }

        .nav-card-item.active .nav-icon-badge {
          background: var(--nc);
          color: #FFFFFF;
          box-shadow: 0 6px 16px color-mix(in srgb, var(--nc) 45%, transparent);
        }

        .nav-card-item.active .nav-title-text {
          color: var(--nc);
          font-weight: 700;
        }

        .nav-card-item.active .active-chevron {
          opacity: 1;
          transform: translateX(0);
        }

        /* ----- Upgrade card ----- */
        .upgrade-card-box {
          background: linear-gradient(135deg, #1b1b2e 0%, #11111A 100%);
          border-radius: 16px;
          padding: 18px;
          margin-top: 16px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.3s ease;
        }
        .upgrade-card-box::before {
          content: "";
          position: absolute;
          width: 180px; height: 180px;
          right: -60px; top: -70px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.5), transparent 70%);
          animation: lxAurora 7s ease-in-out infinite;
          pointer-events: none;
        }
        .upgrade-card-box::after {
          content: "";
          position: absolute;
          width: 140px; height: 140px;
          left: -50px; bottom: -70px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.3), transparent 70%);
          animation: lxAurora 9s ease-in-out infinite reverse;
          pointer-events: none;
        }
        .upgrade-card-box > * { position: relative; z-index: 1; }
        .upgrade-card-box:hover {
          transform: translateY(-3px);
          border-color: rgba(167, 139, 250, 0.5);
          box-shadow: 0 16px 34px rgba(99, 102, 241, 0.26);
        }

        .coming-soon-pill {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 2;
          overflow: hidden;
          background: linear-gradient(90deg, #FF6B6B, #FF8E53);
          color: #FFFFFF;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 4px 10px;
          border-bottom-left-radius: 12px;
          letter-spacing: 0.5px;
        }
        .coming-soon-pill::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%);
          transform: translateX(-120%);
          animation: lxShine 3.4s ease-in-out infinite;
        }

        /* ----- Profile card ----- */
        .profile-card-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 14px;
          margin-top: 16px;
          background: var(--theme-bg);
          border: 1px solid var(--theme-border);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.25s ease, box-shadow 0.35s ease;
          cursor: pointer;
        }

        .profile-card-box:hover {
          transform: translateY(-2px);
          border-color: var(--theme-accent);
          box-shadow: 0 10px 22px color-mix(in srgb, var(--theme-accent) 16%, transparent);
        }

        .profile-avatar-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--theme-accent), #8B5CF6);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 15px;
          flex-shrink: 0;
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .profile-card-box:hover .profile-avatar-circle { transform: scale(1.08) rotate(-6deg); }

        /* ----- Mobile drawer ----- */
        .sidebar-mobile {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 85vw;
          max-width: 320px;
          background: var(--theme-card-bg);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          z-index: 60;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        /* menu items only animate when the drawer opens */
        .sidebar-mobile .nav-card-item { animation: none; }
        .sidebar-mobile.open .nav-card-item {
          animation: lxSlideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards;
          animation-delay: calc(var(--ni, 0) * 40ms + 150ms);
        }

        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 50;
          animation: lxFade 0.3s ease;
        }

        @media (min-width: 992px) {
          .mobile-only { display: none !important; }
          .sidebar-fixed { margin-left: 0 !important; }
        }

        @media (max-width: 991px) {
          .desktop-only { display: none !important; }
          .sidebar-fixed { display: none !important; }
          .brand-logo-img { height: 32px; }
          .navbar-header { padding: 0 16px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .sidebar-fixed *, .sidebar-fixed *::before, .sidebar-fixed *::after,
          .sidebar-mobile *, .sidebar-mobile *::before, .sidebar-mobile *::after,
          .theme-toggle-icon {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar-fixed desktop-only">
        <div className="sidebar-header-area">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/logo.png" alt="Studora AI" className="brand-logo-img" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "var(--theme-text-primary)", fontWeight: "800", fontSize: "17px", letterSpacing: "-0.02em" }}>STUDORA AI</span>
              <span style={{ color: "var(--theme-text-secondary)", fontSize: "11px", fontWeight: "500" }}>AI Learning Workspace</span>
            </div>
          </div>
          <div style={{ height: "1px", background: "var(--theme-border)", marginTop: "16px" }} />
        </div>

        <nav className="sidebar-scroll-area hide-scrollbar">
          {["WORKSPACE", "PRODUCTIVITY", "ACCOUNT"].map((cat) => renderNavGroup(cat, false))}

          <div className="upgrade-card-box">
            <div className="coming-soon-pill">COMING SOON</div>
            <h4 style={{ color: "#FFFFFF", margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700" }}>Upgrade to Pro ✨</h4>
            <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0, fontSize: "12px", lineHeight: "1.4" }}>Unlock advanced AI features & unlimited uploads.</p>
          </div>

          {!isGuest && (
            <div className="profile-card-box">
              <div className="profile-avatar-circle">{userInitial}</div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                <span style={{ color: "var(--theme-text-primary)", fontSize: "13.5px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {userName}
                </span>
                <span style={{ color: "var(--theme-accent)", fontSize: "11px", fontWeight: "600" }}>Free Plan</span>
              </div>
              <span style={{ color: "var(--theme-text-secondary)" }}>{Icons.ChevronRight}</span>
            </div>
          )}

          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "11px", color: "var(--theme-text-faint)", fontWeight: "500" }}>
            © 2026 STUDORA AI • v1.0
          </div>
        </nav>
      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      <div className="mobile-only">
        {sidebarOpen && <div className="drawer-overlay" onClick={() => setSidebarOpen(false)} />}
        <aside
          className={`sidebar-mobile ${sidebarOpen ? "open" : ""}`}
          style={{ transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}
        >
          <div className="sidebar-header-area" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img src="/logo.png" alt="Studora AI" className="brand-logo-img" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "var(--theme-text-primary)", fontWeight: "800", fontSize: "15px" }}>STUDORA AI</span>
                  <span style={{ color: "var(--theme-text-secondary)", fontSize: "11px" }}>AI Learning Workspace</span>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setSidebarOpen(false)} style={{ width: "34px", height: "34px" }}>✕</button>
            </div>
          </div>

          <nav className="sidebar-scroll-area hide-scrollbar">
            {["WORKSPACE", "PRODUCTIVITY", "ACCOUNT"].map((cat) => renderNavGroup(cat, true))}

            <div className="upgrade-card-box">
              <div className="coming-soon-pill">COMING SOON</div>
              <h4 style={{ color: "#FFFFFF", margin: "0 0 4px 0", fontSize: "14px", fontWeight: "700" }}>Upgrade to Pro ✨</h4>
              <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0, fontSize: "11.5px" }}>Unlock advanced AI features.</p>
            </div>

            {!isGuest && (
              <div className="profile-card-box">
                <div className="profile-avatar-circle">{userInitial}</div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                  <span style={{ color: "var(--theme-text-primary)", fontSize: "13.5px", fontWeight: "700" }}>{userName}</span>
                  <span style={{ color: "var(--theme-accent)", fontSize: "11px", fontWeight: "600" }}>Free Plan</span>
                </div>
              </div>
            )}

            {!isGuest && (
              <button onClick={handleLogout} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "12px", color: "#EF4444", fontSize: "13px", fontWeight: "600", cursor: "pointer",
                marginTop: "16px", width: "100%"
              }}>
                {Icons.Logout} Logout
              </button>
            )}

            <div style={{ marginTop: "16px", textAlign: "center", fontSize: "11px", color: "var(--theme-text-faint)" }}>
              © 2026 STUDORA AI • v1.0
            </div>
          </nav>
        </aside>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* PREMIUM STICKY HEADER NAV (60px) */}
        <header className="navbar-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
            <button className="icon-btn mobile-only" onClick={() => setSidebarOpen(!sidebarOpen)} title="Menu">
              {Icons.Menu}
            </button>
            <img src="/logo.png" alt="Studora AI" className="brand-logo-img mobile-only" />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <button
              className={`icon-btn theme-toggle-btn ${isDark ? "is-dark" : ""}`}
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle dark and light mode"
            >
              <span key={isDark ? "sun" : "moon"} className="theme-toggle-icon">
                {isDark ? Icons.Sun : Icons.Moon}
              </span>
            </button>

            {!isGuest && <NotificationPanel />}

            {isGuest ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn-secondary" onClick={() => navigate("/login")}>Login</button>
                <button className="btn-primary" onClick={() => navigate("/signup")}>Sign up</button>
              </div>
            ) : (
              <button className="icon-btn desktop-only" onClick={handleLogout} title="Logout" style={{ color: "#EF4444" }}>
                {Icons.Logout}
              </button>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "28px 24px", background: "var(--theme-bg)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;