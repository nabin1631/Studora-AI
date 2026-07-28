import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import api from "../services/api";

// --- Custom Toast Notification ---
function Toast({ message, type, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 200);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 1000,
        padding: "10px 16px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "500",
        background: type === "error" ? "#EF4444" : "#10B981",
        color: "#ffffff",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.98)",
        transition: "opacity 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span style={{ fontSize: "12px", fontWeight: "700" }}>
        {type === "error" ? "✕" : "✓"}
      </span>
      <span>{message}</span>
    </div>
  );
}

// --- Lucide React-style SVG Icon Suite ---
const Lucide = {
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  User: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Shield: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Palette: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.72 1.7-1.61 0-.43-.17-.83-.44-1.14-.29-.33-.46-.77-.46-1.25 0-1 1-2 2-2h2.33c2.58 0 4.67-2.1 4.67-4.67 0-5.2-4.21-9.33-9.8-9.33z"/></svg>
  ),
  Sliders: () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
  ),
  CheckCircle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  ),
  Eye: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  EyeOff: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  ),
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
  HardDrive: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  AlertTriangle: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
  LogOut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  ),
  Mail: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  ),
  Zap: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Activity: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  Sun: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
  ),
  Moon: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  ),
  Loader: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="spin-icon" aria-hidden="true"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
  )
};

function Settings() {
  const { user, logout } = useAuth();
  const { mode, toggleTheme, colors: c } = useTheme();
  const navigate = useNavigate();

  const [toast, setToast] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");

  // Profile state
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const showToast = (message, type = "success") => setToast({ message, type });

  const handleSaveName = async () => {
    if (!newName.trim()) { showToast("Name cannot be empty", "error"); return; }
    if (newName.trim() === user?.name) { setEditingName(false); return; }
    setSavingName(true);
    try {
      const res = await api.put("/user/profile", { name: newName.trim() });
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      savedUser.name = res.data.user.name;
      localStorage.setItem("user", JSON.stringify(savedUser));
      showToast("Profile name updated!");
      setEditingName(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update name", "error");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    setSavingPass(true);
    try {
      await api.put("/user/change-password", { currentPassword, newPassword });
      showToast("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setSavingPass(false);
    }
  };

  const passwordChecks = [
    { label: "8+ characters", test: /.{8,}/ },
    { label: "A letter", test: /[A-Za-z]/ },
    { label: "A number", test: /\d/ },
    { label: "A symbol", test: /[@$!%*#?&]/ },
  ];
  const strength = passwordChecks.filter(cCheck => cCheck.test.test(newPassword)).length;
  const strengthColor = ["#EF4444", "#F97316", "#EAB308", "#10B981"][strength - 1] || "transparent";

  const TABS = [
    { id: "profile", label: "Profile", subtitle: "Personal details & storage", icon: Lucide.User },
    { id: "security", label: "Security", subtitle: "Password & authentication", icon: Lucide.Shield },
    { id: "appearance", label: "Appearance", subtitle: "Themes & layout style", icon: Lucide.Palette },
    { id: "account", label: "Account", subtitle: "Subscription & session", icon: Lucide.Sliders },
  ];

  return (
    <Layout>
      {toast && (
        <Toast
          key={Date.now()}
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      {/* STEP 12 & STEP 13: DESIGN SYSTEM, ANIMATIONS & POLISH */}
      <style>{`
        /* Smooth Spinner Animation */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 0.8s linear infinite;
        }

        /* Subtle Fade Slide Content Entrance */
        @keyframes v-fade-in-slide {
          0% {
            opacity: 0;
            transform: translateY(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tab-content-zone {
          animation: v-fade-in-slide 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: opacity, transform;
        }

        /* Global Layout Bounds */
        .settings-shell {
          max-width: 1160px;
          margin: 0 auto;
          padding: 32px 24px;
          width: 100%;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* Header Zone */
        .settings-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .header-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: ${c.accent}10;
          color: ${c.accent};
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid ${c.accent}20;
          flex-shrink: 0;
        }

        .header-title-text {
          color: ${c.text};
          font-size: clamp(20px, 2.5vw, 24px);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 2px 0;
        }

        .header-desc-text {
          color: ${c.textMuted};
          font-size: 13.5px;
          margin: 0;
        }

        .header-divider {
          height: 1px;
          width: 100%;
          background: ${c.border};
          margin-bottom: 28px;
        }

        /* Settings Main Grid */
        .settings-grid-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 36px;
          align-items: start;
        }

        /* Navigation Sidebar */
        .linear-sidebar {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          text-align: left;
          outline: none;
        }

        .sidebar-item:hover {
          background: ${c.hover};
        }

        .sidebar-item:focus-visible {
          border-color: ${c.accent};
          box-shadow: 0 0 0 3px ${c.accent}20;
        }

        .sidebar-item.active {
          background: ${c.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"};
          border-color: ${c.border};
        }

        .sidebar-active-indicator {
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: ${c.accent};
          transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sidebar-icon-wrap {
          color: ${c.textMuted};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 150ms ease;
        }

        .sidebar-item:hover .sidebar-icon-wrap { color: ${c.text}; }
        .sidebar-item.active .sidebar-icon-wrap { color: ${c.accent}; }

        .sidebar-label {
          color: ${c.textSecondary};
          font-size: 13.5px;
          font-weight: 500;
          transition: color 150ms ease;
          display: block;
        }

        .sidebar-item:hover .sidebar-label { color: ${c.text}; }
        .sidebar-item.active .sidebar-label { color: ${c.text}; font-weight: 600; }

        .sidebar-sublabel {
          color: ${c.textMuted};
          font-size: 11px;
          margin-top: 1px;
          display: block;
        }

        /* Generic Premium Cards */
        .premium-card {
          background: ${c.bgCard};
          border: 1px solid ${c.border};
          border-radius: 12px;
          padding: clamp(20px, 2.5vw, 24px);
          margin-bottom: 20px;
          box-shadow: ${c.mode === "dark" ? "0 4px 20px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.05)"};
          transition: border-color 180ms ease, box-shadow 180ms ease;
        }

        .card-header-title {
          color: ${c.text};
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px 0;
          letter-spacing: -0.01em;
        }

        .card-header-desc {
          color: ${c.textMuted};
          font-size: 13px;
          margin: 0 0 20px 0;
        }

        /* Forms & Inputs */
        .input-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: ${c.textSecondary};
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .modern-input {
          width: 100%;
          padding: 10px 14px;
          background: ${c.bg};
          border: 1px solid ${c.border};
          border-radius: 8px;
          color: ${c.text};
          font-size: 13.5px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .modern-input:focus {
          border-color: ${c.accent};
          box-shadow: 0 0 0 3px ${c.accent}1F;
        }

        .pass-input-container { position: relative; }

        .eye-button {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: ${c.textMuted};
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 150ms ease, background-color 150ms ease;
        }

        .eye-button:hover { color: ${c.text}; background: ${c.hover}; }
        .eye-button:focus-visible { outline: 2px solid ${c.accent}; }

        /* Actions & Buttons */
        .btn-gradient {
          padding: 10px 18px;
          background: linear-gradient(180deg, ${c.accent} 0%, #4F46E5 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 120ms ease, opacity 150ms ease, box-shadow 150ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .btn-gradient:hover:not(:disabled) {
          opacity: 0.94;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${c.accent}30;
        }

        .btn-gradient:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-gradient:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px ${c.accent}35;
        }

        .btn-gradient:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-outline {
          padding: 10px 16px;
          background: ${c.bg};
          border: 1px solid ${c.border};
          border-radius: 8px;
          color: ${c.text};
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 150ms ease, border-color 150ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-outline:hover {
          background: ${c.hover};
          border-color: ${c.mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"};
        }

        .btn-outline:focus-visible {
          outline: none;
          border-color: ${c.accent};
          box-shadow: 0 0 0 3px ${c.accent}20;
        }

        /* Theme Cards */
        .theme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }

        .theme-card {
          position: relative;
          background: ${c.bg};
          border: 1px solid ${c.border};
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms ease, box-shadow 180ms ease;
          overflow: hidden;
          outline: none;
        }

        .theme-card:hover {
          transform: translateY(-2px);
          border-color: ${c.accent}70;
          box-shadow: 0 8px 20px -4px ${c.accent}15;
        }

        .theme-card:focus-visible {
          border-color: ${c.accent};
          box-shadow: 0 0 0 3px ${c.accent}25;
        }

        .theme-card.selected {
          border-color: ${c.accent};
          background: ${c.accent}05;
          box-shadow: 0 0 0 1px ${c.accent}, 0 6px 18px -3px ${c.accent}20;
        }

        .theme-card-indicator {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${c.accent};
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px ${c.accent}40;
        }

        .theme-preview-box {
          height: 110px;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border: 1px solid ${c.border};
          box-sizing: border-box;
        }

        .preview-light { background: #FFFFFF; border-color: #E2E8F0; }
        .preview-dark { background: #090D16; border-color: #1E293B; }

        .preview-bar { height: 8px; border-radius: 4px; }
        .preview-light .bar-primary { background: #6366F1; width: 40%; }
        .preview-light .bar-sub { background: #E2E8F0; width: 75%; }
        .preview-light .bar-sub2 { background: #F1F5F9; width: 55%; }

        .preview-dark .bar-primary { background: #818CF8; width: 40%; }
        .preview-dark .bar-sub { background: #1E293B; width: 75%; }
        .preview-dark .bar-sub2 { background: #0F172A; width: 55%; }

        /* Dashboard Widgets */
        .account-widget-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
        }

        .account-widget {
          background: ${c.bg};
          border: 1px solid ${c.border};
          border-radius: 10px;
          padding: 16px;
          transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .account-widget:hover {
          transform: translateY(-2px);
          border-color: ${c.accent}40;
          box-shadow: 0 6px 16px -4px rgba(0,0,0,0.06);
        }

        .widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: ${c.textMuted};
          margin-bottom: 10px;
        }

        .widget-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .widget-value {
          font-size: 15px;
          font-weight: 600;
          color: ${c.text};
          margin: 0;
          word-break: break-all;
        }

        /* Danger Zone Card */
        .danger-zone-card {
          background: ${c.mode === "dark" ? "rgba(239, 68, 68, 0.04)" : "rgba(254, 242, 242, 0.6)"};
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 12px;
          padding: clamp(20px, 2.5vw, 24px);
          margin-top: 24px;
        }

        .danger-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .danger-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .btn-danger-large {
          width: 100%;
          padding: 12px 20px;
          background: #EF4444;
          color: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 120ms ease, background-color 150ms ease, box-shadow 150ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
        }

        .btn-danger-large:hover {
          background: #DC2626;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
        }

        .btn-danger-large:active {
          transform: translateY(0);
        }

        .btn-danger-large:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.35);
        }

        /* Mobile Breakpoints */
        @media (max-width: 860px) {
          .settings-grid-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .linear-sidebar {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 4px;
            margin-bottom: 4px;
            border-bottom: 1px solid ${c.border};
            -webkit-overflow-scrolling: touch;
          }

          .sidebar-item {
            width: auto;
            white-space: nowrap;
            padding: 8px 12px;
          }

          .sidebar-active-indicator {
            left: 6px;
            right: 6px;
            top: auto;
            bottom: 0;
            width: auto;
            height: 2px;
            border-radius: 2px 2px 0 0;
          }

          .sidebar-sublabel { display: none; }
          .btn-gradient, .btn-outline { width: 100%; }
        }
      `}</style>

      <div className="settings-shell">
        {/* PAGE HEADER */}
        <header className="settings-header">
          <div className="header-icon-box">
            <Lucide.Settings />
          </div>
          <div>
            <h1 className="header-title-text">Workspace Settings</h1>
            <p className="header-desc-text">Manage display identity, security credentials, and system preferences.</p>
          </div>
        </header>

        <div className="header-divider" />

        <div className="settings-grid-layout">
          {/* NAVIGATION SIDEBAR */}
          <nav className="linear-sidebar" aria-label="Settings categories">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`sidebar-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveSection(tab.id)}
                  aria-selected={isActive}
                  role="tab"
                >
                  {isActive && <div className="sidebar-active-indicator" />}
                  <span className="sidebar-icon-wrap">
                    <Icon />
                  </span>
                  <div>
                    <span className="sidebar-label">{tab.label}</span>
                    <span className="sidebar-sublabel">{tab.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* MAIN TAB CONTENT DISPLAY ZONE */}
          <main style={{ minWidth: 0 }}>
            {/* PROFILE SECTION */}
            {activeSection === "profile" && (
              <div className="tab-content-zone" key="profile">
                <div className="premium-card">
                  <h2 className="card-header-title">User Profile</h2>
                  <p className="card-header-desc">Manage your public persona, verified email, and plan limits.</p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      padding: "16px",
                      borderRadius: "10px",
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      marginBottom: "24px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${c.accent}, #4F46E5)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontSize: "28px",
                        fontWeight: "700",
                        flexShrink: 0,
                        boxShadow: `0 4px 16px ${c.accent}30`,
                      }}
                    >
                      {(newName || user?.name || "U")[0]?.toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <h3 style={{ margin: 0, color: c.text, fontSize: "17px", fontWeight: "600" }}>
                          {user?.name}
                        </h3>

                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: "rgba(16, 185, 129, 0.12)",
                            color: "#10B981",
                            border: "1px solid rgba(16, 185, 129, 0.2)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Lucide.CheckCircle /> Verified
                        </span>

                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: `${c.accent}12`,
                            color: c.accent,
                            border: `1px solid ${c.accent}20`,
                          }}
                        >
                          Free Plan
                        </span>
                      </div>

                      <p style={{ margin: "0 0 8px 0", color: c.textMuted, fontSize: "13.5px" }}>
                        {user?.email}
                      </p>

                      <div style={{ display: "flex", gap: "16px", color: c.textMuted, fontSize: "12px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <Lucide.Calendar /> Member since Jan 2026
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12.5px", fontWeight: "600", color: c.text, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <Lucide.HardDrive /> Storage Usage
                      </span>
                      <span style={{ fontSize: "12px", color: c.textMuted }}>
                        2.4 GB / 5.0 GB used
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: c.bg, borderRadius: "3px", border: `1px solid ${c.border}`, overflow: "hidden" }}>
                      <div style={{ width: "48%", height: "100%", background: `linear-gradient(90deg, ${c.accent}, #4F46E5)`, borderRadius: "3px" }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px", maxWidth: "440px" }}>
                    <label className="input-label">Display Name</label>
                    {editingName ? (
                      <div>
                        <input
                          className="modern-input"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Enter display name"
                          autoFocus
                          style={{ marginBottom: "10px" }}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                        />
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button className="btn-gradient" onClick={handleSaveName} disabled={savingName}>
                            {savingName ? <><Lucide.Loader /> Saving...</> : "Save Name"}
                          </button>
                          <button
                            className="btn-outline"
                            onClick={() => {
                              setEditingName(false);
                              setNewName(user?.name || "");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <input
                          className="modern-input"
                          value={user?.name || ""}
                          readOnly
                          style={{ background: c.bg, cursor: "default", flex: 1 }}
                        />
                        <button className="btn-outline" onClick={() => setEditingName(true)}>
                          <Lucide.Edit /> Edit
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ maxWidth: "440px" }}>
                    <label className="input-label">Email Address</label>
                    <input
                      className="modern-input"
                      value={user?.email || ""}
                      readOnly
                      style={{ background: c.bg, cursor: "default", color: c.textMuted }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY SECTION */}
            {activeSection === "security" && (
              <div className="tab-content-zone" key="security">
                <div className="premium-card">
                  <h2 className="card-header-title">Security & Password</h2>
                  <p className="card-header-desc">Update your current password to secure your account credentials.</p>

                  <form onSubmit={handleChangePassword} style={{ maxWidth: "440px" }}>
                    <div style={{ marginBottom: "18px" }}>
                      <label className="input-label">Current Password</label>
                      <div className="pass-input-container">
                        <input
                          className="modern-input"
                          type={showCurrentPass ? "text" : "password"}
                          placeholder="••••••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          style={{ paddingRight: "44px" }}
                          required
                        />
                        <button
                          type="button"
                          className="eye-button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          title={showCurrentPass ? "Hide password" : "Show password"}
                        >
                          {showCurrentPass ? <Lucide.EyeOff /> : <Lucide.Eye />}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                      <label className="input-label">New Password</label>
                      <div className="pass-input-container">
                        <input
                          className="modern-input"
                          type={showNewPass ? "text" : "password"}
                          placeholder="Min. 8 chars, mixed format"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={{ paddingRight: "44px" }}
                          required
                        />
                        <button
                          type="button"
                          className="eye-button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          title={showNewPass ? "Hide password" : "Show password"}
                        >
                          {showNewPass ? <Lucide.EyeOff /> : <Lucide.Eye />}
                        </button>
                      </div>
                    </div>

                    {newPassword.length > 0 && (
                      <div
                        style={{
                          padding: "14px",
                          borderRadius: "8px",
                          background: c.bg,
                          border: `1px solid ${c.border}`,
                          marginBottom: "18px",
                        }}
                      >
                        <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              style={{
                                flex: 1,
                                height: "4px",
                                borderRadius: "2px",
                                background: strength >= level ? strengthColor : c.border,
                                transition: "background-color 200ms ease",
                              }}
                            />
                          ))}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                          {passwordChecks.map((check, i) => {
                            const isMet = check.test.test(newPassword);
                            return (
                              <span
                                key={i}
                                style={{
                                  fontSize: "11.5px",
                                  fontWeight: "500",
                                  color: isMet ? "#10B981" : c.textMuted,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                {isMet ? <Lucide.CheckCircle /> : <span style={{ width: 14, textAlign: "center" }}>○</span>}
                                {check.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: "24px" }}>
                      <label className="input-label">Confirm New Password</label>
                      <input
                        className="modern-input"
                        type="password"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                          borderColor: confirmPassword && confirmPassword !== newPassword ? "#EF4444" : c.border,
                        }}
                        required
                      />
                      {confirmPassword && confirmPassword !== newPassword && (
                        <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#EF4444", fontWeight: "500" }}>
                          Passwords do not match
                        </p>
                      )}
                    </div>

                    <button
                      className="btn-gradient"
                      type="submit"
                      disabled={savingPass || strength < 4 || newPassword !== confirmPassword}
                    >
                      {savingPass ? <><Lucide.Loader /> Updating...</> : <><Lucide.Lock /> Update Password</>}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* APPEARANCE SECTION */}
            {activeSection === "appearance" && (
              <div className="tab-content-zone" key="appearance">
                <div className="premium-card">
                  <h2 className="card-header-title">Appearance Preferences</h2>
                  <p className="card-header-desc">Select your workspace interface theme with real-time UI switching.</p>

                  <div className="theme-grid">
                    {/* Light Card */}
                    <button
                      type="button"
                      className={`theme-card ${mode === "light" ? "selected" : ""}`}
                      onClick={() => mode !== "light" && toggleTheme()}
                    >
                      {mode === "light" && (
                        <div className="theme-card-indicator">
                          <Lucide.Check />
                        </div>
                      )}
                      <div className="theme-preview-box preview-light">
                        <div className="preview-bar bar-primary" />
                        <div className="preview-bar bar-sub" />
                        <div className="preview-bar bar-sub2" />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Lucide.Sun />
                        <span style={{ fontSize: "14px", fontWeight: "600", color: c.text }}>Light Mode</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "12.5px", color: c.textMuted, textAlign: "left" }}>
                        Clean, high-visibility interface designed for bright workspaces.
                      </p>
                    </button>

                    {/* Dark Card */}
                    <button
                      type="button"
                      className={`theme-card ${mode === "dark" ? "selected" : ""}`}
                      onClick={() => mode !== "dark" && toggleTheme()}
                    >
                      {mode === "dark" && (
                        <div className="theme-card-indicator">
                          <Lucide.Check />
                        </div>
                      )}
                      <div className="theme-preview-box preview-dark">
                        <div className="preview-bar bar-primary" />
                        <div className="preview-bar bar-sub" />
                        <div className="preview-bar bar-sub2" />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Lucide.Moon />
                        <span style={{ fontSize: "14px", fontWeight: "600", color: c.text }}>Dark Mode</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "12.5px", color: c.textMuted, textAlign: "left" }}>
                        High-contrast dark layout engineered to minimize eye strain.
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ACCOUNT & DANGER ZONE SECTION */}
            {activeSection === "account" && (
              <div className="tab-content-zone" key="account">
                <div className="premium-card">
                  <h2 className="card-header-title">Account Overview</h2>
                  <p className="card-header-desc">Essential plan metrics and active session details.</p>

                  <div className="account-widget-grid">
                    <div className="account-widget">
                      <div className="widget-header">
                        <span className="widget-title">Email Address</span>
                        <Lucide.Mail />
                      </div>
                      <p className="widget-value">{user?.email || "N/A"}</p>
                    </div>

                    <div className="account-widget">
                      <div className="widget-header">
                        <span className="widget-title">Current Plan</span>
                        <Lucide.Zap />
                      </div>
                      <p className="widget-value" style={{ color: c.accent }}>Free Tier</p>
                    </div>

                    <div className="account-widget">
                      <div className="widget-header">
                        <span className="widget-title">Account Status</span>
                        <Lucide.Activity />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981" }} />
                        <p className="widget-value">Active</p>
                      </div>
                    </div>

                    <div className="account-widget">
                      <div className="widget-header">
                        <span className="widget-title">Verification</span>
                        <Lucide.CheckCircle />
                      </div>
                      <p className="widget-value" style={{ color: "#10B981" }}>Verified</p>
                    </div>

                    <div className="account-widget">
                      <div className="widget-header">
                        <span className="widget-title">Member Since</span>
                        <Lucide.Calendar />
                      </div>
                      <p className="widget-value">January 2026</p>
                    </div>
                  </div>
                </div>

                {/* DANGER ZONE */}
                <div className="danger-zone-card">
                  <div className="danger-header">
                    <div className="danger-icon-wrap">
                      <Lucide.AlertTriangle />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#EF4444" }}>
                        Danger Zone
                      </h2>
                      <p style={{ margin: 0, fontSize: "12.5px", color: c.textMuted }}>
                        Sign out of your active account session on this device.
                      </p>
                    </div>
                  </div>

                  <p style={{ margin: "14px 0 18px 0", fontSize: "13.5px", color: c.textSecondary, lineHeight: "1.5" }}>
                    Logging out will terminate your current session token. You will need to re-authenticate to regain access to your dashboard.
                  </p>

                  <button
                    className="btn-danger-large"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    <Lucide.LogOut /> Sign Out of Account
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;