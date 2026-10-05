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
  Search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
};

const NAV_ITEMS = [
  { to: "/dashboard", icon: Icons.Dashboard, label: "Dashboard", sub: "Your learning hub", category: "WORKSPACE" },
  { to: "/ai-tutor", icon: Icons.AITutor, label: "AI Tutor", sub: "Ask anything", category: "WORKSPACE" },
  { to: "/pdf-ai", icon: Icons.PDFAI, label: "PDF AI", sub: "Chat with PDFs", category: "WORKSPACE" },
  { to: "/notes", icon: Icons.Notes, label: "Notes", sub: "Take smart notes", category: "PRODUCTIVITY" },
  { to: "/planner", icon: Icons.Planner, label: "Planner", sub: "Plan your schedule", category: "PRODUCTIVITY" },
  { to: "/quiz-arena", icon: Icons.QuizArena, label: "Quiz Arena", sub: "Practice & compete", category: "PRODUCTIVITY" },
  { to: "/analytics", icon: Icons.Analytics, label: "Analytics", sub: "Track your progress", category: "PRODUCTIVITY" },
  { to: "/settings", icon: Icons.Settings, label: "Settings", sub: "Preferences & more", category: "ACCOUNT" },
];

function Layout({ children, isGuest = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { logout, user } = useAuth();
  const { colors: c } = useTheme();
  const navigate = useNavigate();
  const { promptAuth } = useGuest();

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
          if (isGuest) {
            return (
              <div
                key={item.to}
                onClick={() => {
                  promptAuth();
                  if (isMobileView) setSidebarOpen(false);
                }}
                className="nav-card-item"
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

        /* SEARCH BAR (42px HEIGHT) */
        .top-search-wrapper {
          position: relative;
          flex: 1;
          max-width: 360px;
          display: flex;
          align-items: center;
        }

        .top-search-icon {
          position: absolute;
          left: 14px;
          color: var(--theme-text-secondary);
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .top-search {
          background: var(--theme-bg);
          border: 1px solid var(--theme-border);
          border-radius: 10px;
          height: 42px;
          padding: 0 14px 0 38px;
          color: var(--theme-text-primary);
          font-size: 13.5px;
          font-weight: 500;
          outline: none;
          width: 100%;
          transition: all 200ms ease-out;
        }

        .top-search::placeholder {
          color: var(--theme-text-faint);
          font-weight: 400;
        }

        .top-search:focus {
          background: var(--theme-card-bg);
          border-color: var(--theme-accent);
          box-shadow: 0 0 0 3px rgba(110, 58, 255, 0.12);
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

        /* SIDEBAR DESKTOP */
        .sidebar-fixed {
          width: var(--sidebar-w);
          flex-shrink: 0;
          background: var(--theme-card-bg);
          border-right: 1px solid var(--theme-border);
          display: flex;
          flex-direction: column;
          z-index: 30;
          transition: background 200ms ease, border-color 200ms ease;
        }

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
          text-transform: uppercase;
          font-size: 11px;
          color: var(--theme-text-faint);
          letter-spacing: 0.08em;
          font-weight: 700;
          padding: 12px 12px 8px 12px;
        }

        .nav-card-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 12px;
          text-decoration: none;
          position: relative;
          transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          background: transparent;
        }

        .nav-card-item:hover {
          background: var(--theme-bg);
          transform: translateX(2px);
        }

        .nav-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(110, 58, 255, 0.12);
          color: var(--theme-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 200ms ease;
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
        }

        .nav-sub-text {
          color: var(--theme-text-secondary);
          font-size: 11.5px;
          font-weight: 500;
          margin-top: 1px;
        }

        .active-chevron {
          color: var(--theme-accent);
          opacity: 0;
          transform: translateX(-4px);
          transition: all 200ms ease;
        }

        .guest-lock-icon {
          font-size: 12px;
          color: var(--theme-text-faint);
        }

        .nav-card-item.active {
          background: rgba(110, 58, 255, 0.1);
        }

        .nav-card-item.active .nav-icon-badge {
          background: var(--theme-accent);
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(110, 58, 255, 0.3);
        }

        .nav-card-item.active .nav-title-text {
          color: var(--theme-accent);
          font-weight: 700;
        }

        .nav-card-item.active .active-chevron {
          opacity: 1;
          transform: translateX(0);
        }

        .upgrade-card-box {
          background: linear-gradient(135deg, #181822 0%, #11111A 100%);
          border-radius: 16px;
          padding: 18px;
          margin-top: 16px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .coming-soon-pill {
          position: absolute;
          top: 0;
          right: 0;
          background: linear-gradient(90deg, #FF6B6B, #FF8E53);
          color: #FFFFFF;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 4px 10px;
          border-bottom-left-radius: 12px;
          letter-spacing: 0.5px;
        }

        .profile-card-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 14px;
          margin-top: 16px;
          background: var(--theme-bg);
          border: 1px solid var(--theme-border);
          transition: all 200ms ease;
          cursor: pointer;
        }

        .profile-card-box:hover {
          border-color: var(--theme-accent);
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
        }

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
          transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 50;
        }

        @media (min-width: 992px) {
          .mobile-only { display: none !important; }
          .sidebar-fixed { margin-left: 0 !important; }
        }

        @media (max-width: 991px) {
          .desktop-only { display: none !important; }
          .sidebar-fixed { display: none !important; }
          .brand-logo-img { height: 32px; }
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
        <aside className="sidebar-mobile" style={{ transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}>
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
          {!mobileSearchOpen ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                <button className="icon-btn mobile-only" onClick={() => setSidebarOpen(!sidebarOpen)} title="Menu">
                  {Icons.Menu}
                </button>
                <img src="/logo.png" alt="Studora AI" className="brand-logo-img mobile-only" />

                <div className="top-search-wrapper desktop-only">
                  <span className="top-search-icon">{Icons.Search}</span>
                  <input className="top-search" placeholder="Search lessons, notes, tutors..." />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                <button className="icon-btn mobile-only" onClick={() => setMobileSearchOpen(true)} title="Search">
                  {Icons.Search}
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
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
              <button className="icon-btn" onClick={() => setMobileSearchOpen(false)} title="Back">←</button>
              <div className="top-search-wrapper" style={{ maxWidth: "none", flex: 1 }}>
                <span className="top-search-icon">{Icons.Search}</span>
                <input className="top-search" placeholder="Search everything..." autoFocus />
              </div>
            </div>
          )}
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