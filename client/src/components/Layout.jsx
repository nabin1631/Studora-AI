import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useGuest } from "../context/GuestContext";
import NotificationPanel from "./NotificationPanel";

// SVG Icon Definitions matching the sleek lavender badge design
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
  const { logout, user } = useAuth(); // Logged-in user context
  const { colors: c } = useTheme();
  const navigate = useNavigate();
  const { promptAuth } = useGuest();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getNavItemsByCategory = (cat) => NAV_ITEMS.filter((item) => item.category === cat);

  // Dynamic user details calculation
  const userName = user?.name || user?.username || "Nabin Basyal";
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "N";

  const renderNavGroup = (category, isMobileView) => (
    <div key={category}>
      <div className="nav-category-header">{category}</div>
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
  );

  return (
    <div style={{ height: "100dvh", width: "100%", display: "flex", background: c.bg, overflow: "hidden", boxSizing: "border-box" }}>
      <style>{`
        :root {
          --sidebar-w: 280px;
          --purple-accent: ${c.accent || "#6E3AFF"};
          --purple-soft-bg: ${c.accent ? c.accent + "1F" : "#F3EAFE"};
          --text-dark: ${c.text || "#0F172A"};
          --text-sub: ${c.textSecondary || "#64748B"};
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes iconPop { 0% { transform: scale(1); } 50% { transform: scale(0.85); } 100% { transform: scale(1); } }

        /* Top Bar Styling */
        .icon-btn {
          background: ${c.bgCard}; border: 1px solid ${c.border}; cursor: pointer; color: ${c.textSecondary};
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: 10px; transition: all .18s cubic-bezier(.4,0,.2,1);
          flex-shrink: 0; font-size: 17px;
        }
        .icon-btn:hover {
          background: ${c.accent}1A; border-color: ${c.accent}55; color: ${c.accent};
          transform: translateY(-2px); box-shadow: 0 4px 12px ${c.accent}26;
        }
        .icon-btn:active { animation: iconPop .25s ease; transform: translateY(0); }

        .top-search {
          background: ${c.bgCard}; border: 1px solid ${c.border}; border-radius: 10px;
          padding: 9px 14px 9px 38px; color: ${c.text}; font-size: 13px;
          outline: none; width: 100%; max-width: 320px; transition: all .18s; box-sizing: border-box;
        }
        .top-search::placeholder { color: ${c.textFaint}; }
        .top-search:focus { border-color: ${c.accent}; box-shadow: 0 0 0 3px ${c.accent}1F; }
        .navbar-header { background: ${c.bgSecondary}; }

        /* Header Guest Buttons Hover Effects */
        .auth-btn-login {
          padding: 8px 16px;
          background: ${c.bgCard};
          border: 1px solid ${c.border};
          border-radius: 10px;
          color: ${c.text};
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .auth-btn-login:hover {
          background: ${c.bgCardHover || c.borderSubtle};
          border-color: ${c.accent};
          color: ${c.accent};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .auth-btn-login:active {
          transform: translateY(0);
        }

        .auth-btn-signup {
          padding: 8px 18px;
          background: linear-gradient(135deg, ${c.accent || "#6E3AFF"}, #5B4FE0);
          border: none;
          border-radius: 10px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px ${c.accent ? c.accent + "33" : "rgba(110, 58, 255, 0.2)"};
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .auth-btn-signup:hover {
          background: linear-gradient(135deg, #7C4DFF, #4D3FE0);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px ${c.accent ? c.accent + "55" : "rgba(110, 58, 255, 0.35)"};
        }
        .auth-btn-signup:active {
          transform: translateY(0);
        }

        /* Sidebar Styling */
        .sidebar-fixed {
          width: var(--sidebar-w); flex-shrink: 0;
          background: ${c.bgSecondary || c.bgCard};
          border-right: 1px solid ${c.borderSubtle || c.border}; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
          border-radius: 0 24px 24px 0; display: flex; flex-direction: column;
          transition: margin-left 250ms ease; z-index: 10;
        }

        .sidebar-mobile {
          position: fixed; top: 0; left: 0; bottom: 0; width: 88vw; max-width: 300px;
          background: ${c.bgSecondary || c.bgCard}; border-right: 1px solid ${c.borderSubtle || c.border};
          box-shadow: 0 12px 40px rgba(0,0,0,0.15); border-radius: 0 24px 24px 0; z-index: 50;
          display: flex; flex-direction: column; transition: transform 300ms ease;
        }

        .sidebar-header-area { padding: 24px 20px 16px 20px; flex-shrink: 0; }
        .sidebar-scroll-area {
          flex: 1; overflow-y: auto; overflow-x: hidden;
          -ms-overflow-style: none; scrollbar-width: none;
          padding: 0 16px 20px 16px; scroll-behavior: smooth;
        }
        .sidebar-scroll-area::-webkit-scrollbar { display: none; }

        /* Categories */
        .nav-category-header {
          text-transform: uppercase; font-size: 11px; color: ${c.textFaint || "#94A3B8"};
          letter-spacing: 0.08em; font-weight: 700; margin: 20px 0 10px 12px;
        }

        /* Nav Item Cards */
        .nav-card-item {
          display: flex; align-items: center; gap: 14px; height: 60px; padding: 0 14px;
          border-radius: 16px; text-decoration: none; position: relative;
          transition: all 220ms ease; cursor: pointer; margin-bottom: 4px;
        }
        .nav-card-item:hover {
          background: ${c.bgCardHover || c.bgCard}; transform: translateX(4px);
        }

        .nav-icon-badge {
          width: 42px; height: 42px; border-radius: 14px;
          background: var(--purple-soft-bg); color: var(--purple-accent);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: transform 220ms ease;
        }
        .nav-card-item:hover .nav-icon-badge { transform: scale(1.05); }

        .nav-text-container {
          display: flex; flex-direction: column; flex: 1; min-width: 0;
        }
        
        /* DYNAMIC THEMED TITLES */
        .nav-title-text {
          color: var(--text-dark) !important;
          font-size: 14px; font-weight: 700; line-height: 1.25;
          letter-spacing: -0.01em;
        }
        .nav-sub-text {
          color: var(--text-sub); font-size: 12px; font-weight: 500; margin-top: 2px;
        }

        .active-chevron {
          color: var(--purple-accent); opacity: 0; transform: translateX(-4px); transition: all 220ms ease;
        }
        .guest-lock-icon { font-size: 11px; color: ${c.textFaint || "#94A3B8"}; }

        /* ACTIVE CARD STYLING */
        .nav-card-item.active {
          background: linear-gradient(90deg, ${c.accent ? c.accent + "17" : "rgba(110, 58, 255, 0.09)"} 0%, ${c.accent ? c.accent + "05" : "rgba(110, 58, 255, 0.02)"} 100%);
        }
        .nav-card-item.active .nav-icon-badge {
          background: var(--purple-accent); color: #FFFFFF;
          box-shadow: 0 6px 16px ${c.accent ? c.accent + "40" : "rgba(110, 58, 255, 0.25)"};
        }
        .nav-card-item.active .active-chevron { opacity: 1; transform: translateX(0); }
        .nav-card-item.active::before {
          content: ''; position: absolute; left: 0; top: 12px; bottom: 12px;
          width: 4px; background: var(--purple-accent); border-radius: 0 4px 4px 0;
        }

        /* Upgrade Card */
        .upgrade-card-box {
          background: linear-gradient(135deg, #1E1E2E 0%, #0F0F1A 100%);
          border-radius: 18px; padding: 18px; margin-top: 28px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.08); position: relative; overflow: hidden;
        }
        .coming-soon-pill {
          position: absolute; top: 0; right: 0;
          background: linear-gradient(90deg, #FF6B6B, #FF8E53); color: #FFF;
          font-size: 9px; font-weight: 800; text-transform: uppercase;
          padding: 4px 10px; border-bottom-left-radius: 12px; letter-spacing: 0.5px;
        }

        /* Profile Card */
        .profile-card-box {
          display: flex; align-items: center; gap: 12px; padding: 12px 14px;
          border-radius: 18px; margin-top: 14px; background: ${c.bgCard};
          border: 1px solid ${c.border}; transition: background 220ms ease;
        }
        .profile-card-box:hover { background: ${c.bgCardHover || c.bgCard}; }
        .profile-avatar-circle {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: #FFF; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 16px; flex-shrink: 0;
        }

        @media (min-width: 701px) {
          .mobile-search-icon, .mobile-search-bar, .sidebar-mobile, .drawer-overlay { display: none !important; }
        }
        @media (max-width: 700px) {
          .desktop-search-bar, .sidebar-fixed, .desktop-only-logout { display: none !important; }
        }
      `}</style>

      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar-fixed" style={{ marginLeft: sidebarOpen ? "0" : "calc(-1 * var(--sidebar-w))" }}>
        {/* Fixed Header */}
        <div className="sidebar-header-area">
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <img src="/logo.png" alt="Studora AI" style={{ width: "36px", height: "36px", objectFit: "contain", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: c.text, fontWeight: "800", fontSize: "18px", letterSpacing: "-0.02em" }}>STUDORA AI</span>
              <span style={{ color: c.textSecondary, fontSize: "12px", fontWeight: "500" }}>AI Learning Workspace</span>
            </div>
          </div>
          <div style={{ height: "1px", background: c.borderSubtle || c.border, marginTop: "20px" }} />
        </div>

        {/* Scrollable Navigation */}
        <nav className="sidebar-scroll-area">
          {["WORKSPACE", "PRODUCTIVITY", "ACCOUNT"].map((cat) => renderNavGroup(cat, false))}

          {/* Upgrade Card */}
          <div className="upgrade-card-box">
            <div className="coming-soon-pill">Coming Soon</div>
            <h4 style={{ color: "#FFF", margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700" }}>Upgrade to Pro ✨</h4>
            <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: "12px" }}>Unlock advanced AI features and more.</p>
          </div>

          {/* User Profile Card */}
          {!isGuest && (
            <div className="profile-card-box">
              <div className="profile-avatar-circle">{userInitial}</div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                <span style={{ color: c.text, fontSize: "14px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {userName}
                </span>
                <span style={{ color: c.accent || "#6E3AFF", fontSize: "12px", fontWeight: "600" }}>Free Plan</span>
              </div>
              <span style={{ color: c.textFaint }}>{Icons.ChevronRight}</span>
            </div>
          )}

          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "11px", color: c.textFaint, fontWeight: "500" }}>
            © 2026 STUDORA AI • v1.0
          </div>
        </nav>
      </aside>

      {/* MOBILE SIDEBAR & DRAWER */}
      {sidebarOpen && <div className="drawer-overlay" onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />}

      <aside className="sidebar-mobile" style={{ transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}>
        <div className="sidebar-header-area" style={{ padding: "18px 16px 12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src="/logo.png" alt="Studora AI" style={{ width: "32px", height: "32px", objectFit: "contain", flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ color: c.text, fontWeight: "800", fontSize: "16px" }}>STUDORA AI</span>
                <span style={{ color: c.textSecondary, fontSize: "11px" }}>AI Learning Workspace</span>
              </div>
            </div>
            <button className="icon-btn" onClick={() => setSidebarOpen(false)} style={{ width: "36px", height: "36px" }}>✕</button>
          </div>
        </div>

        <nav className="sidebar-scroll-area">
          {["WORKSPACE", "PRODUCTIVITY", "ACCOUNT"].map((cat) => renderNavGroup(cat, true))}

          <div className="upgrade-card-box" style={{ marginTop: "20px" }}>
            <div className="coming-soon-pill">Coming Soon</div>
            <h4 style={{ color: "#FFF", margin: "0 0 4px 0", fontSize: "14px", fontWeight: "700" }}>Upgrade to Pro ✨</h4>
            <p style={{ color: "rgba(255,255,255,0.7)", margin: 0, fontSize: "11px" }}>Unlock advanced AI features.</p>
          </div>

          {!isGuest && (
            <div className="profile-card-box">
              <div className="profile-avatar-circle">{userInitial}</div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                <span style={{ color: c.text, fontSize: "13px", fontWeight: "700" }}>{userName}</span>
                <span style={{ color: c.accent || "#6E3AFF", fontSize: "11px", fontWeight: "600" }}>Free Plan</span>
              </div>
            </div>
          )}

          {!isGuest && (
            <button onClick={handleLogout} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
              borderRadius: "14px", color: "#EF4444", fontSize: "13px", fontWeight: "600", cursor: "pointer",
              marginTop: "20px", width: "100%"
            }}>
              ⏻ Logout
            </button>
          )}

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "11px", color: c.textFaint }}>
            © 2026 STUDORA AI • v1.0
          </div>
        </nav>
      </aside>

      {/* Main Column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Top Navbar */}
        <header className="navbar-header" style={{
          height: "60px", flexShrink: 0, display: "flex", alignItems: "center",
          justify: "space-between", padding: "0 18px", gap: "10px",
          borderBottom: `1px solid ${c.borderSubtle}`,
        }}>
          {!mobileSearchOpen ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)} title="Menu">☰</button>
                <img src="/logo.png" alt="Studora AI" style={{ width: "44px", height: "44px", objectFit: "contain", flexShrink: 0, margin: "0 10px 0 6px" }} />

                <div className="desktop-search-bar" style={{ position: "relative", flex: 1, maxWidth: "320px" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: c.textFaint, pointerEvents: "none" }}>🔍</span>
                  <input className="top-search" placeholder="Search everything..." />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                <button className="icon-btn mobile-search-icon" onClick={() => setMobileSearchOpen(true)} title="Search">🔍</button>
                {!isGuest && <NotificationPanel />}

                {isGuest ? (
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button className="auth-btn-login" onClick={() => navigate("/login")}>Login</button>
                    <button className="auth-btn-signup" onClick={() => navigate("/signup")}>Sign up</button>
                  </div>
                ) : (
                  <button className="icon-btn desktop-only-logout" onClick={handleLogout} title="Logout" style={{ fontSize: "17px" }}>⏻</button>
                )}
              </div>
            </>
          ) : (
            <div className="mobile-search-bar" style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
              <button className="icon-btn" onClick={() => setMobileSearchOpen(false)} title="Back">←</button>
              <div style={{ position: "relative", flex: 1 }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: c.textFaint, pointerEvents: "none" }}>🔍</span>
                <input className="top-search" style={{ maxWidth: "none" }} placeholder="Search everything..." autoFocus />
              </div>
            </div>
          )}
        </header>

        {/* Page Main Content */}
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "20px", background: c.bg }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;