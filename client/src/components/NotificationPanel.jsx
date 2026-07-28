import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

const TYPE_COLORS = {
  success: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)", dot: "#22C55E" },
  warning: { bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.25)", dot: "#EAB308" },
  error: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", dot: "#EF4444" },
  info: { bg: "rgba(124,108,240,0.12)", border: "rgba(124,108,240,0.25)", dot: "#7C6CF0" },
};

function NotificationPanel({ onUnreadCount }) {
  const { colors: c } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [read, setRead] = useState([]);
  const panelRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
      const unread = res.data.notifications.filter(n => !read.includes(n.id)).length;
      onUnreadCount?.(unread);
    } catch {
      console.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(!open);
    if (!open) {
      fetchNotifications();
      // Mark all as read when opened
      setRead(notifications.map(n => n.id));
      onUnreadCount?.(0);
    }
  };

  const handleNotificationClick = (notification) => {
    setRead(prev => [...prev, notification.id]);
    setOpen(false);
    if (notification.action) navigate(notification.action);
  };

  const unreadCount = notifications.filter(n => !read.includes(n.id)).length;

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      <style>{`
        /* Global & Desktop Panel Animations */
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(-8px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mobilePanelIn {
          from { opacity: 0; transform: translate(-50%, -15px) scale(.97); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        
        .notif-dropdown {
          position: absolute; top: "calc(100% + 10px)"; right: 0;
          width: 360px; maxHeight: 480px;
          background: ${c.bgCard}; border: 1px solid ${c.border};
          border-radius: 16px; boxShadow: 0 16px 48px rgba(0,0,0,0.15);
          z-index: 500; animation: panelIn .2s ease;
          display: flex; flex-direction: column;
          overflow: hidden;
        }

        .notif-item {
          display: flex; gap: 12px; padding: 12px 14px;
          border-radius: 10px; cursor: pointer; transition: background .15s, border-color .15s;
          border: 1px solid transparent; margin-bottom: 6px;
        }
        .notif-item:hover { background: ${c.hover}; }
        .notif-item:last-child { margin-bottom: 0; }

        /* Shared Close Button Utility */
        .notif-close-btn {
          background: none; border: none; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: ${c.textMuted}; border-radius: 8px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 0; outline: none; width: 28px; height: 28px; font-size: 14px;
        }
        .notif-close-btn:hover { background: ${c.hover}; color: ${c.text}; }
        .notif-close-btn:focus-visible { box-shadow: 0 0 0 2px ${c.accent}; color: ${c.text}; }

        /* Scrollable List Adjustments */
        .notif-list-container {
          flex: 1; overflow-y: auto; padding: 10px;
          scrollbar-width: none;
        }
        .notif-list-container::-webkit-scrollbar {
          display: none;
        }

        /* Mobile Layout Modifications Override */
        @media (max-width: 768px) {
          .notif-dropdown {
            position: fixed;
            top: 20px;
            left: 50%;
            right: auto;
            transform: translateX(-50%);
            width: 92%;
            max-height: 72vh;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05);
            animation: mobilePanelIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .notif-header-title {
            font-size: 16px !important;
            font-weight: 600 !important;
          }

          .notif-header-subtitle {
            font-size: 13px !important;
          }

          .notif-list-container {
            padding: 16px 12px 12px 12px;
          }

          .notif-item {
            padding: 8px 10px;
            margin-bottom: 8px;
            height: auto;
            align-items: center;
          }

          .notif-item-icon {
            width: 34px !important;
            height: 34px !important;
            font-size: 15px !important;
            border-radius: 8px !important;
          }

          .notif-item-title {
            font-size: 15px !important;
            font-weight: 600 !important;
          }

          .notif-item-desc {
            font-size: 13px !important;
          }

          .notif-close-btn {
            width: 44px;
            height: 44px;
            font-size: 16px;
            border-radius: 50%;
          }
          
          .desktop-only-close {
            display: none !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-only-close {
            display: none !important;
          }
        }
      `}</style>

      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{
          background: open ? `${c.accent}20` : c.bgCard,
          border: `1px solid ${open ? c.accent : c.border}`,
          borderRadius: "10px",
          width: "40px", height: "40px",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: open ? c.accent : c.textMuted,
          fontSize: "17px", transition: "all .15s", position: "relative",
          flexShrink: 0,
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <div style={{
            position: "absolute", top: "-4px", right: "-4px",
            width: 18, height: 18, borderRadius: "50%",
            background: "#EF4444", color: "#fff",
            fontSize: "10px", fontWeight: "700",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${c.bg}`,
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="notif-dropdown">

          {/* Header */}
          <div style={{
            padding: "14px 16px",
            borderBottom: `1px solid ${c.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexShrink: 0,
          }}>
            <div>
              <h3 className="notif-header-title" style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: c.text }}>
                Notifications
              </h3>
              <p className="notif-header-subtitle" style={{ margin: 0, fontSize: "11px", color: c.textMuted }}>
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : `${notifications.length} update${notifications.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => { setRead(notifications.map(n => n.id)); onUnreadCount?.(0); }}
                style={{
                  background: "none", border: "none", color: c.accent,
                  fontSize: "12px", fontWeight: "500", cursor: "pointer",
                  marginRight: "4px"
                }}
              >
                Mark all read
              </button>

              {/* Desktop & Mobile Responsive Close Triggers sharing native context closure functionality */}
              <button 
                onClick={() => setOpen(false)}
                className="notif-close-btn mobile-only-close"
                aria-label="Close notifications"
              >
                ✕
              </button>
              <button 
                onClick={() => setOpen(false)}
                className="notif-close-btn desktop-only-close"
                aria-label="Close notifications"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="notif-list-container">
            {loading ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <p style={{ color: c.textMuted, fontSize: "13px" }}>Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 20px" }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>🎉</div>
                <p style={{ color: c.text, fontSize: "14px", fontWeight: "600", margin: "0 0 4px" }}>
                  All caught up!
                </p>
                <p style={{ color: c.textMuted, fontSize: "12px", margin: 0 }}>
                  No new notifications right now
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const colors = TYPE_COLORS[notif.type] || TYPE_COLORS.info;
                const isRead = read.includes(notif.id);
                return (
                  <div
                    key={notif.id}
                    className="notif-item"
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      background: isRead ? "transparent" : colors.bg,
                      borderColor: isRead ? "transparent" : colors.border,
                    }}
                  >
                    {/* Icon */}
                    <div className="notif-item-icon" style={{
                      width: 38, height: 38, borderRadius: "10px",
                      background: isRead ? c.bg : colors.bg,
                      border: `1px solid ${isRead ? c.border : colors.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "18px", flexShrink: 0,
                    }}>
                      {notif.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                        <p className="notif-item-title" style={{
                          margin: "0 0 3px", fontSize: "13px",
                          fontWeight: isRead ? "500" : "600",
                          color: c.text, lineHeight: "1.3",
                        }}>
                          {notif.title}
                        </p>
                        <span style={{ fontSize: "10px", color: c.textFaint, flexShrink: 0, marginTop: "2px" }}>
                          {notif.time}
                        </span>
                      </div>
                      <p className="notif-item-desc" style={{ margin: 0, fontSize: "12px", color: c.textMuted, lineHeight: "1.4" }}>
                        {notif.message}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!isRead && (
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: colors.dot, flexShrink: 0, marginTop: "6px",
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: "10px 14px", borderTop: `1px solid ${c.border}`,
            flexShrink: 0, textAlign: "center",
          }}>
            <button
              onClick={() => { fetchNotifications(); }}
              style={{
                background: "none", border: "none", color: c.accent,
                fontSize: "12px", fontWeight: "500", cursor: "pointer",
              }}
            >
              🔄 Refresh notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;