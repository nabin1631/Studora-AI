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
        fontSize: "12.5px",
        fontWeight: "500",
        background: type === "error" ? "#EF4444" : "#10B981",
        color: "#ffffff",
        boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.3)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.96)",
        transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span style={{ fontSize: "11px", fontWeight: "700" }}>
        {type === "error" ? "✕" : "✓"}
      </span>
      <span>{message}</span>
    </div>
  );
}

// --- Lucide React-style SVG Icon Suite ---
const Lucide = {
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Palette: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.72 1.7-1.61 0-.43-.17-.83-.44-1.14-.29-.33-.46-.77-.46-1.25 0-1 1-2 2-2h2.33c2.58 0 4.67-2.1 4.67-4.67 0-5.2-4.21-9.33-9.8-9.33z"/></svg>
  ),
  Sliders: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
  ),
  CheckCircle: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  Edit: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  EyeOff: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  ),
  Lock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
  Calendar: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="spin-icon" aria-hidden="true"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
  )
};

// --- Redesigned Danger Zone Component ---
function DangerZone({ c, user, logout, navigate, showToast }) {
  const [step, setStep] = useState("idle");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const CONFIRM_PHRASE = "DELETE MY ACCOUNT";

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_PHRASE) return;
    setDeleting(true);
    try {
      await api.delete("/user/delete-account");
      logout();
      navigate("/");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete account", "error");
      setStep("idle");
      setConfirmText("");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        background: "rgba(239, 68, 68, 0.02)",
        border: "1px solid rgba(239, 68, 68, 0.16)",
        borderRadius: "12px",
        padding: "16px 18px",
        marginTop: "16px",
      }}
    >
      <style>{`
        .danger-btn-primary {
          width: 170px;
          height: 42px;
          background: #EF4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 150ms ease, opacity 150ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .danger-btn-primary:hover:not(:disabled) {
          background: #DC2626;
        }

        .danger-btn-primary:disabled {
          background: rgba(239, 68, 68, 0.35);
          cursor: not-allowed;
        }

        .danger-btn-cancel {
          height: 42px;
          padding: 0 16px;
          background: ${c.bg};
          border: 1px solid ${c.border};
          border-radius: 8px;
          color: ${c.textSecondary};
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 150ms ease, color 150ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .danger-btn-cancel:hover {
          background: ${c.hover};
          color: ${c.text};
        }

        .danger-actions-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
        }

        @media (max-width: 580px) {
          .danger-actions-row {
            flex-direction: column;
            width: 100%;
          }
          .danger-btn-primary {
            width: 100%;
            order: 1;
          }
          .danger-btn-cancel {
            width: 100%;
            order: 2;
          }
        }
      `}</style>

      {/* Section Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <span style={{ fontSize: "14px", lineHeight: "1" }}>⚠️</span>
        <h3 style={{ color: "#EF4444", fontSize: "14px", fontWeight: "600", margin: 0, letterSpacing: "-0.01em" }}>
          Danger Zone
        </h3>
      </div>
      <p style={{ color: c.textMuted, fontSize: "12.5px", margin: "0 0 14px", lineHeight: "1.4" }}>
        Irreversible actions. Please proceed with caution.
      </p>

      {/* IDLE STATE */}
      {step === "idle" && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 14px", background: c.bgCard, border: `1px solid ${c.border}`,
          borderRadius: "10px", gap: "12px", flexWrap: "wrap",
        }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: "13.5px", fontWeight: "600", color: c.text }}>
              Delete Account
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: c.textMuted }}>
              Permanently remove your account and all associated data
            </p>
          </div>
          <button
            onClick={() => setStep("confirm")}
            style={{
              height: "36px",
              padding: "0 14px",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: "8px",
              color: "#EF4444",
              fontSize: "12.5px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            Delete Account
          </button>
        </div>
      )}

      {/* CONFIRMATION STATE */}
      {step === "confirm" && (
        <div style={{
          padding: "14px",
          background: c.bgCard,
          border: `1px solid ${c.border}`,
          borderRadius: "10px",
          animation: "fadeUp 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <p style={{ fontSize: "12.5px", color: c.text, margin: "0 0 8px", fontWeight: "500", lineHeight: "1.4" }}>
            To confirm deletion, type <strong style={{ color: "#EF4444", fontFamily: "monospace" }}>{CONFIRM_PHRASE}</strong> below:
          </p>

          <input
            style={{
              width: "100%",
              height: "42px",
              padding: "0 12px",
              background: c.bg,
              border: `1.5px solid ${confirmText === CONFIRM_PHRASE ? "#EF4444" : c.border}`,
              borderRadius: "8px",
              color: c.text,
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "monospace",
              letterSpacing: ".04em",
              transition: "border-color 150ms ease",
            }}
            placeholder={CONFIRM_PHRASE}
            value={confirmText}
            onChange={e => setConfirmText(e.target.value.toUpperCase())}
            autoFocus
          />

          <div className="danger-actions-row">
            <button
              className="danger-btn-primary"
              onClick={handleDelete}
              disabled={confirmText !== CONFIRM_PHRASE || deleting}
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
            <button
              className="danger-btn-cancel"
              onClick={() => { setStep("idle"); setConfirmText(""); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Settings() {
  const { user, setUser, logout } = useAuth();
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
      const updatedUser = {
        ...user,
        name: res.data.user.name,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
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
    { label: "8+ chars", test: /.{8,}/ },
    { label: "Letter", test: /[A-Za-z]/ },
    { label: "Number", test: /\d/ },
    { label: "Symbol", test: /[@$!%*#?&]/ },
  ];

  const strength = passwordChecks.filter(cCheck => cCheck.test.test(newPassword)).length;
  const strengthColor = ["#EF4444", "#F97316", "#EAB308", "#10B981"][strength - 1] || "transparent";

  const TABS = [
    { id: "profile", label: "Profile", subtitle: "Personal details", icon: Lucide.User },
    { id: "security", label: "Security", subtitle: "Password & auth", icon: Lucide.Shield },
    { id: "appearance", label: "Appearance", subtitle: "Theme & styles", icon: Lucide.Palette },
    { id: "account", label: "Account", subtitle: "Session & data", icon: Lucide.Sliders },
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

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .spin-icon {
          animation: spin 0.8s linear infinite;
        }

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
          animation: v-fade-in-slide 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: opacity, transform;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        /* 100vh Layout Container Engine */
        .settings-shell {
          max-width: 1080px;
          margin: 0 auto;
          padding: 18px 24px;
          width: 100%;
          height: calc(100vh - 60px);
          max-height: 100vh;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* Compact Header */
        .settings-header {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .header-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: ${c.accent}12;
          color: ${c.accent};
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid ${c.accent}25;
          flex-shrink: 0;
        }

        .header-title-text {
          color: ${c.text};
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.025em;
          margin: 0 0 2px 0;
          line-height: 1.1;
        }

        .header-desc-text {
          color: ${c.textMuted};
          font-size: 13px;
          margin: 0;
        }

        .header-divider {
          height: 1px;
          width: 100%;
          background: ${c.border};
          margin-top: 14px;
          margin-bottom: 14px;
          flex-shrink: 0;
        }

        /* Horizontal Navigation Grid (Target 64px Height) */
        .horizontal-nav-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 14px;
          width: 100%;
          flex-shrink: 0;
        }

        /* Nav Card Item */
        .nav-card-item {
          position: relative;
          display: flex;
          align-items: center;
          height: 64px;
          padding: 0 14px;
          border-radius: 12px;
          background: ${c.bgCard};
          border: 1px solid ${c.border};
          cursor: pointer;
          transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          text-align: left;
          outline: none;
          box-shadow: ${mode === "dark" ? "0 2px 6px rgba(0,0,0,0.2)" : "0 1px 2px rgba(0,0,0,0.02)"};
          box-sizing: border-box;
          overflow: hidden;
        }

        .nav-card-item:hover {
          background: ${mode === "dark" ? c.hover : "#F8FAFC"};
          border-color: ${c.accent}60;
          transform: translateY(-1px);
        }

        .nav-card-item:hover .nav-icon-circle {
          transform: scale(1.05);
          color: ${c.accent};
        }

        .nav-card-item:focus-visible {
          border-color: ${c.accent};
          box-shadow: 0 0 0 3px ${c.accent}20;
        }

        .nav-card-item.active {
          background: ${c.activeNav};
          border-color: ${c.accent};
          box-shadow: 0 2px 10px ${c.accent}1A;
        }

        /* Bottom Accent Indicator for Active Card */
        .nav-active-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: ${c.accent};
          border-radius: 3px 3px 0 0;
        }

        .nav-card-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .nav-icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: ${mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"};
          color: ${c.textMuted};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 180ms ease, color 180ms ease;
        }

        .nav-card-item.active .nav-icon-circle {
          background: ${c.accent}20;
          color: ${c.accent};
        }

        .nav-text-block {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .nav-label {
          color: ${c.textSecondary};
          font-size: 14px;
          font-weight: 500;
          line-height: 1.2;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .nav-card-item:hover .nav-label { color: ${c.text}; }
        .nav-card-item.active .nav-label { color: ${c.text}; font-weight: 700; }

        .nav-sublabel {
          color: ${c.textMuted};
          font-size: 11.5px;
          margin-top: 2px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        /* Main Viewport Content Area */
        .settings-content-shell {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .premium-card, .settings-card {
          background: ${c.bgCard};
          border: 1px solid ${c.border};
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 0;
          box-shadow: ${mode === "dark" ? "0 4px 16px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.02)"};
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .card-header-title, .section-title {
          color: ${c.text};
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 2px 0;
          letter-spacing: -0.015em;
        }

        .card-header-desc, .section-desc {
          color: ${c.textMuted};
          font-size: 13px;
          margin: 0 0 16px 0;
        }

        /* Compact Form Controls (Input: 44px, Button: 42px) */
        .input-label {
          display: block;
          font-size: 11.5px;
          font-weight: 600;
          color: ${c.textSecondary};
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .modern-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          background: ${c.bg};
          border: 1px solid ${c.border};
          border-radius: 10px;
          color: ${c.text};
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .modern-input:focus {
          border-color: ${c.accent};
          box-shadow: 0 0 0 3px ${c.accent}1A;
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
        }

        .eye-button:hover { color: ${c.text}; background: ${c.hover}; }

        /* Action Buttons */
        .btn-gradient {
          height: 42px;
          padding: 0 18px;
          background: linear-gradient(180deg, ${c.accent} 0%, #4F46E5 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 150ms ease, opacity 150ms ease, box-shadow 150ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn-gradient:hover:not(:disabled) {
          opacity: 0.95;
          box-shadow: 0 4px 12px ${c.accent}30;
        }

        .btn-gradient:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-outline {
          height: 42px;
          padding: 0 16px;
          background: ${c.bg};
          border: 1px solid ${c.border};
          border-radius: 10px;
          color: ${c.text};
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 150ms ease, border-color 150ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn-outline:hover {
          background: ${c.hover};
        }

        /* Theme Cards */
        .theme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }

        .theme-card {
          position: relative;
          background: ${c.bg};
          border: 2px solid ${c.border};
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 180ms ease;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .theme-card:hover {
          border-color: ${c.accent}80;
        }

        .theme-card.active {
          border-color: ${c.accent};
          background: ${c.accent}08;
        }

        /* Responsive Mechanics */
        @media (max-width: 868px) {
          .settings-shell {
            height: auto;
            max-height: none;
            overflow-y: auto;
          }
          .horizontal-nav-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 580px) {
          .settings-shell {
            padding: 14px;
          }
          .horizontal-nav-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .nav-card-item {
            height: 52px;
          }
          .nav-sublabel {
            display: none;
          }
        }
      `}</style>

      <div className="settings-shell">
        {/* Page Header */}
        <div className="settings-header">
          <div className="header-icon-box">
            <Lucide.Settings />
          </div>
          <div>
            <h1 className="header-title-text">Workspace Settings</h1>
            <p className="header-desc-text">
              Manage display identity, security credentials and system preferences.
            </p>
          </div>
        </div>

        <div className="header-divider" />

        {/* Horizontal Navigation Bar */}
        <div className="horizontal-nav-grid" role="tablist">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className={`nav-card-item ${isActive ? "active" : ""}`}
                onClick={() => setActiveSection(tab.id)}
              >
                {isActive && <div className="nav-active-indicator" />}
                <div className="nav-card-inner">
                  <div className="nav-icon-circle">
                    <Icon />
                  </div>
                  <div className="nav-text-block">
                    <span className="nav-label">{tab.label}</span>
                    <span className="nav-sublabel">{tab.subtitle}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Viewport Content Area */}
        <div className="settings-content-shell">
          {/* PROFILE SECTION */}
          {activeSection === "profile" && (
            <div className="tab-content-zone">
              <div className="premium-card">
                <h2 className="card-header-title">Public Identity</h2>
                <p className="card-header-desc">
                  Manage how your profile appears across workspace workspaces.
                </p>

                {/* Compact Profile Header Row */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "14px 16px", background: c.bg, border: `1px solid ${c.border}`,
                  borderRadius: "12px", marginBottom: "18px", flexWrap: "wrap",
                }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "14px",
                    background: `linear-gradient(135deg, ${c.accent}, #4F46E5)`,
                    color: "#ffffff", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "20px", fontWeight: "700",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)", flexShrink: 0,
                  }}>
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: c.text }}>
                        {user?.name || "User"}
                      </h3>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "3px",
                        padding: "1px 6px", borderRadius: "12px", fontSize: "10.5px",
                        fontWeight: "600", background: "rgba(16, 185, 129, 0.1)",
                        color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.2)",
                      }}>
                        <Lucide.CheckCircle /> Verified
                      </span>
                      <span style={{
                        padding: "1px 6px", borderRadius: "12px", fontSize: "10.5px",
                        fontWeight: "600", background: `${c.accent}15`, color: c.accent,
                        border: `1px solid ${c.accent}30`,
                      }}>
                        Free Plan
                      </span>
                    </div>
                    <p style={{ margin: "0 0 2px 0", fontSize: "12.5px", color: c.textMuted }}>
                      {user?.email}
                    </p>
                    {user?.createdAt && (
                      <p style={{ margin: 0, fontSize: "11px", color: c.textMuted, display: "flex", alignItems: "center", gap: "4px" }}>
                        <Lucide.Calendar /> Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile Form */}
                <div style={{ display: "grid", gap: "16px", maxWidth: "560px" }}>
                  <div>
                    <label className="input-label">Display Name</label>
                    {editingName ? (
                      <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                        <input
                          className="modern-input"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Your full name"
                          autoFocus
                        />
                        <button
                          className="btn-gradient"
                          onClick={handleSaveName}
                          disabled={savingName}
                        >
                          {savingName ? <Lucide.Loader /> : "Save"}
                        </button>
                        <button
                          className="btn-outline"
                          onClick={() => { setEditingName(false); setNewName(user?.name || ""); }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "0 14px", height: "44px", background: c.bg, border: `1px solid ${c.border}`,
                        borderRadius: "10px", marginTop: "2px",
                      }}>
                        <span style={{ fontSize: "14px", color: c.text, fontWeight: "500" }}>
                          {user?.name || "Not set"}
                        </span>
                        <button
                          className="btn-outline"
                          onClick={() => setEditingName(true)}
                          style={{ padding: "0 10px", height: "30px", fontSize: "12px" }}
                        >
                          <Lucide.Edit /> Edit Name
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="input-label">Email Address</label>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0 14px", height: "44px", background: c.bg, border: `1px solid ${c.border}`,
                      borderRadius: "10px", marginTop: "2px", opacity: 0.8,
                    }}>
                      <span style={{ fontSize: "14px", color: c.textSecondary }}>
                        {user?.email}
                      </span>
                      <span style={{ fontSize: "11px", color: c.textMuted, display: "flex", alignItems: "center", gap: "4px" }}>
                        <Lucide.Lock /> Primary
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY SECTION */}
          {activeSection === "security" && (
            <div className="tab-content-zone">
              <div className="premium-card">
                <h2 className="card-header-title">Security & Credentials</h2>
                <p className="card-header-desc">
                  Update your authentication details and manage password strength.
                </p>

                <form onSubmit={handleChangePassword} style={{ display: "grid", gap: "14px", maxWidth: "560px" }}>
                  <div>
                    <label className="input-label">Current Password</label>
                    <div className="pass-input-container">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        className="modern-input"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                      />
                      <button
                        type="button"
                        className="eye-button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                      >
                        {showCurrentPass ? <Lucide.EyeOff /> : <Lucide.Eye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="input-label">New Password</label>
                    <div className="pass-input-container">
                      <input
                        type={showNewPass ? "text" : "password"}
                        className="modern-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        className="eye-button"
                        onClick={() => setShowNewPass(!showNewPass)}
                      >
                        {showNewPass ? <Lucide.EyeOff /> : <Lucide.Eye />}
                      </button>
                    </div>

                    {/* Compact Password Strength Indicator */}
                    {newPassword && (
                      <div style={{ marginTop: "8px" }}>
                        <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                          {[1, 2, 3, 4].map((stepVal) => (
                            <div
                              key={stepVal}
                              style={{
                                flex: 1, height: "3px", borderRadius: "2px",
                                background: stepVal <= strength ? strengthColor : c.border,
                                transition: "all 200ms ease",
                              }}
                            />
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          {passwordChecks.map((chk, idx) => {
                            const isMet = chk.test.test(newPassword);
                            return (
                              <span key={idx} style={{
                                fontSize: "11px", color: isMet ? "#10B981" : c.textMuted,
                                display: "flex", alignItems: "center", gap: "3px",
                              }}>
                                {isMet ? "✓" : "•"} {chk.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="input-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="modern-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                    />
                  </div>

                  <div style={{ paddingTop: "2px" }}>
                    <button
                      type="submit"
                      className="btn-gradient"
                      disabled={savingPass}
                    >
                      {savingPass ? <Lucide.Loader /> : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* APPEARANCE SECTION */}
          {activeSection === "appearance" && (
            <div className="tab-content-zone">
              <div className="premium-card">
                <h2 className="card-header-title">Theme Preferences</h2>
                <p className="card-header-desc">
                  Customize the interface visual appearance across your devices.
                </p>

                <div className="theme-grid">
                  <div
                    className={`theme-card ${mode === "light" ? "active" : ""}`}
                    onClick={() => mode !== "light" && toggleTheme()}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        background: "#E0E7FF", color: "#4F46E5", display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <Lucide.Sun />
                      </div>
                      {mode === "light" && (
                        <span style={{
                          width: "18px", height: "18px", borderRadius: "50%",
                          background: c.accent, color: "#fff", display: "flex",
                          alignItems: "center", justifyContent: "center",
                        }}>
                          <Lucide.Check />
                        </span>
                      )}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "600", color: c.text }}>
                        Light Mode
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: c.textMuted }}>
                        Clean, high-contrast crisp theme
                      </p>
                    </div>
                  </div>

                  <div
                    className={`theme-card ${mode === "dark" ? "active" : ""}`}
                    onClick={() => mode !== "dark" && toggleTheme()}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        background: "#312E81", color: "#818CF8", display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <Lucide.Moon />
                      </div>
                      {mode === "dark" && (
                        <span style={{
                          width: "18px", height: "18px", borderRadius: "50%",
                          background: c.accent, color: "#fff", display: "flex",
                          alignItems: "center", justifyContent: "center",
                        }}>
                          <Lucide.Check />
                        </span>
                      )}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: "600", color: c.text }}>
                        Dark Mode
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: c.textMuted }}>
                        Low-light sleek, eye-friendly style
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT SECTION */}
          {activeSection === "account" && (
            <div className="tab-content-zone">
              <div className="premium-card">
                <h2 className="card-header-title">Account Administration</h2>
                <p className="card-header-desc">
                  Manage active session state and account deletion options.
                </p>

                <div style={{ marginBottom: "20px" }}>
                  <label className="input-label">Session Management</label>
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", background: c.bg, border: `1px solid ${c.border}`,
                    borderRadius: "12px", marginTop: "2px", flexWrap: "wrap", gap: "10px",
                  }}>
                    <div>
                      <p style={{ margin: "0 0 2px 0", fontSize: "13px", fontWeight: "600", color: c.text }}>
                        Current Active Session
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: c.textMuted }}>
                        Logged in as {user?.email}
                      </p>
                    </div>
                    <button
                      className="btn-outline"
                      onClick={logout}
                      style={{ padding: "0 14px", height: "34px", fontSize: "12px" }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>

                <DangerZone
                  c={c}
                  user={user}
                  logout={logout}
                  navigate={navigate}
                  showToast={showToast}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Settings;