import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/ai-tutor", icon: "🤖", label: "AI Assistant" },
  { to: "/pdf-ai", icon: "📄", label: "PDF AI" },
  { to: "/notes", icon: "📝", label: "Notes" },
  { to: "/planner", icon: "📅", label: "Planner" },
  { to: "/quiz-arena", icon: "🎮", label: "Quiz Arena" },
  { to: "/analytics", icon: "📊", label: "Analytics" },
  { to: "/settings", icon: "⚙️", label: "Settings" },
];

const SIDEBAR_WIDTH = 260;

function Layout({ children, isGuest = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { logout } = useAuth();
  const { colors: c } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    borderRadius: "10px",
    color: isActive ? c.text : c.textMuted,
    background: isActive ? c.activeNav : "transparent",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: isActive ? "600" : "500",
    transition: "background .15s, color .15s",
    marginBottom: "2px",
  });

  return (
    <div style={{ height: "100dvh", width: "100%", display: "flex", background: c.bg, overflow: "hidden", boxSizing: "border-box" }}>
      <style>{`
        .nav-link:hover { background: ${c.hover} !important; color: ${c.text} !important; }
        .drawer-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          z-index: 40; animation: fadeIn .2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes iconPop { 0% { transform: scale(1); } 50% { transform: scale(0.85); } 100% { transform: scale(1); } }

        .icon-btn {
          background: ${c.bgCard};
          border: 1px solid ${c.border};
          cursor: pointer;
          color: ${c.textSecondary};
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px; border-radius: 10px;
          transition: all .18s cubic-bezier(.4,0,.2,1);
          flex-shrink: 0; font-size: 17px;
        }
        .icon-btn:hover {
          background: ${c.accent}1A;
          border-color: ${c.accent}55;
          color: ${c.accent};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px ${c.accent}26;
        }
        .icon-btn:active {
          animation: iconPop .25s ease;
          transform: translateY(0);
        }

        .top-search {
          background: ${c.bgCard}; border: 1px solid ${c.border}; border-radius: 10px;
          padding: 9px 14px 9px 38px; color: ${c.text}; font-size: 13px;
          outline: none; width: 100%; max-width: 320px; transition: all .18s;
          box-sizing: border-box;
        }
        .top-search::placeholder { color: ${c.textFaint}; }
        .top-search:focus {
          border-color: ${c.accent};
          box-shadow: 0 0 0 3px ${c.accent}1F;
        }

        .navbar-header {
          background: ${c.bgSecondary};
        }

        .sidebar-fixed {
          width: ${SIDEBAR_WIDTH}px; flex-shrink: 0; background: ${c.bgSecondary};
          border-right: 1px solid ${c.borderSubtle}; display: flex; flex-direction: column;
          padding: 18px 14px; overflow-y: auto; transition: margin-left .25s ease;
        }
        .sidebar-mobile {
          position: fixed; top: 0; left: 0; bottom: 0; width: 260px;
          background: ${c.bgSecondary}; border-right: 1px solid ${c.borderSubtle};
          z-index: 50; display: flex; flex-direction: column; padding: 18px 14px;
          overflow-y: auto; transition: transform .25s cubic-bezier(.16,1,.3,1);
        }

        @media (min-width: 701px) {
          .mobile-search-icon, .mobile-search-bar, .sidebar-mobile, .drawer-overlay-desktop-skip { display: none !important; }
        }
       @media (max-width: 700px) {
          .desktop-search-bar, .sidebar-fixed, .desktop-only-logout { display: none !important; }
        }
      `}</style>

      {/* Desktop sidebar - pushes layout, no overlay */}
      <aside className="sidebar-fixed" style={{ marginLeft: sidebarOpen ? "0" : `-${SIDEBAR_WIDTH}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", padding: "0 4px" }}>
          <img src="/logo.png" alt="Studora AI" style={{ width: "26px", height: "26px", objectFit: "contain", borderRadius: "7px" }} />
          <span style={{ color: c.text, fontWeight: "700", fontSize: "15px" }}>STUDORA AI</span>
        </div>
        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav-link" style={navLinkStyle}>
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p style={{ fontSize: "11px", color: c.textFaint, margin: 0, padding: "8px 4px 0" }}>
          © 2026 STUDORA AI · v1.0
        </p>
      </aside>

      {/* Mobile sidebar - overlay drawer */}
      {sidebarOpen && (
        <div className="drawer-overlay" onClick={() => setSidebarOpen(false)} style={{ display: "none" }} />
      )}
      <aside className="sidebar-mobile" style={{ transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.png" alt="Studora AI" style={{ width: "26px", height: "26px", objectFit: "contain", borderRadius: "7px" }} />
            <span style={{ color: c.text, fontWeight: "700", fontSize: "15px" }}>STUDORA AI</span>
          </div>
          <button className="icon-btn" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav-link" style={navLinkStyle} onClick={() => setSidebarOpen(false)}>
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        {!isGuest && (
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            padding: "9px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "10px", color: "#EF4444", fontSize: "13px", fontWeight: "500", cursor: "pointer",
            marginBottom: "10px",
          }}>
            ⏻ Logout
          </button>
        )}
        <p style={{ fontSize: "11px", color: c.textFaint, margin: 0, padding: "0 4px" }}>
          © 2026 STUDORA AI · v1.0
        </p>
      </aside>

      {/* Mobile overlay - tap outside to close */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="mobile-search-icon"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 45 }}
        />
      )}

      {/* Main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Top navbar */}
       <header className="navbar-header" style={{
          height: "60px", flexShrink: 0, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 18px", gap: "10px",
          borderBottom: `1px solid ${c.borderSubtle}`,
        }}>
          {!mobileSearchOpen ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)} title="Menu">☰</button>
                <img src="/logo.png" alt="Studora AI" style={{ width: "38px", height: "38px", objectFit: "contain", borderRadius: "10px", flexShrink: 0 }} />

                <div className="desktop-search-bar" style={{ position: "relative", flex: 1, maxWidth: "320px", marginLeft: "8px" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: c.textFaint, pointerEvents: "none" }}>🔍</span>
                  <input className="top-search" placeholder="Search everything..." />
                </div>
              </div>

             <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            <button className="icon-btn mobile-search-icon" onClick={() => setMobileSearchOpen(true)} title="Search">🔍</button>
            {!isGuest && <button className="icon-btn" title="Notifications">🔔</button>}
            {isGuest ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => navigate("/login")} style={{
                  padding: "7px 14px", background: c.bgCard, border: `1px solid ${c.border}`,
                  borderRadius: "8px", color: c.text, fontSize: "12px", fontWeight: "600", cursor: "pointer",
                }}>Login</button>
                <button onClick={() => navigate("/signup")} style={{
                  padding: "7px 14px", background: `linear-gradient(135deg, ${c.accent}, #5B4FE0)`,
                  border: "none", borderRadius: "8px", color: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer",
                }}>Sign up</button>
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

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "20px", background: c.bg }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;