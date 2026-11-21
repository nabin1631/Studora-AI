import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import api from "../services/api";

// --- Toast (bottom on mobile, top-right on desktop) ---
function Toast({ message, type, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let inner;
    const timer = setTimeout(() => {
      setVisible(false);
      inner = setTimeout(onDone, 250);
    }, 2800);
    return () => { clearTimeout(timer); clearTimeout(inner); };
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`st-toast ${type === "error" ? "error" : "success"} ${visible ? "in" : "out"}`}
    >
      <span className="st-toast-icon">{type === "error" ? "✕" : "✓"}</span>
      <span className="st-toast-msg">{message}</span>
      <span className="st-toast-bar" />
    </div>
  );
}

// --- Lucide-style SVG icons ---
const Lucide = {
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  EyeOff: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="st-spin" aria-hidden="true"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
  ),
  Alert: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  ),
};

// --- Danger Zone (same delete logic as before) ---
function DangerZone({ logout, navigate, showToast }) {
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
    <div className="st-danger">
      <div className="st-danger-head">
        <span className="st-danger-icon"><Lucide.Alert /></span>
        <div>
          <h3 className="st-danger-title">Danger Zone</h3>
          <p className="st-danger-sub">Irreversible actions. Please proceed with caution.</p>
        </div>
      </div>

      {step === "idle" && (
        <div className="st-danger-row">
          <div>
            <p className="st-danger-row-title">Delete Account</p>
            <p className="st-danger-row-desc">Permanently remove your account and all associated data</p>
          </div>
          <button className="st-btn st-btn-danger-soft" onClick={() => setStep("confirm")}>
            Delete Account
          </button>
        </div>
      )}

      {step === "confirm" && (
        <div className="st-danger-confirm">
          <p className="st-danger-confirm-text">
            To confirm deletion, type <strong>{CONFIRM_PHRASE}</strong> below:
          </p>
          <input
            className={`st-input st-mono ${confirmText === CONFIRM_PHRASE ? "match" : ""}`}
            placeholder={CONFIRM_PHRASE}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            autoFocus
          />
          <div className="st-danger-actions">
            <button
              className="st-btn st-btn-danger"
              onClick={handleDelete}
              disabled={confirmText !== CONFIRM_PHRASE || deleting}
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
            <button
              className="st-btn st-btn-ghost"
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

  const showToast = (message, type = "success") => setToast({ message, type, id: Date.now() });
  const clearToast = useCallback(() => setToast(null), []);

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

  const strength = passwordChecks.filter((chk) => chk.test.test(newPassword)).length;
  const strengthColor = ["#EF4444", "#F97316", "#EAB308", "#10B981"][strength - 1] || "transparent";
  const strengthLabel = ["Weak", "Fair", "Good", "Strong"][strength - 1] || "";

  const TABS = [
    { id: "profile", label: "Profile", subtitle: "Personal details", icon: Lucide.User, color: "#6366F1" },
    { id: "security", label: "Security", subtitle: "Password & auth", icon: Lucide.Shield, color: "#10B981" },
    { id: "appearance", label: "Appearance", subtitle: "Theme & styles", icon: Lucide.Palette, color: "#EC4899" },
    { id: "account", label: "Account", subtitle: "Session & data", icon: Lucide.Sliders, color: "#F59E0B" },
  ];

  const rootVars = {
    "--st-accent": c.accent,
    "--st-bg": c.bg,
    "--st-card": c.bgCard,
    "--st-border": c.border,
    "--st-text": c.text,
    "--st-text-2": c.textSecondary,
    "--st-muted": c.textMuted,
    "--st-hover": c.hover,
    "--st-active": c.activeNav,
  };

  const activeTab = TABS.find((t) => t.id === activeSection);

  return (
    <Layout>
      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} onDone={clearToast} />
      )}

      <style>{`
        .st-root {
          --ease: cubic-bezier(0.22, 1, 0.36, 1);
          max-width: 1020px;
          margin: 0 auto;
          width: 100%;
          color: var(--st-text);
        }
        .st-root *, .st-root *::before, .st-root *::after { box-sizing: border-box; }
        .st-root h1, .st-root h2, .st-root h3, .st-root p { margin: 0; }

        @keyframes stFadeUp { from { opacity: 0; transform: translateY(12px); } }
        @keyframes stFade { from { opacity: 0; } }
        @keyframes stPop { 0% { transform: scale(0); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
        @keyframes stSpin { to { transform: rotate(360deg); } }
        @keyframes stBar { from { transform: scaleX(0); } }
        @keyframes stToastBar { from { transform: scaleX(1); } to { transform: scaleX(0); } }
        @keyframes stRing {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--st-accent) 35%, transparent); }
          50% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--st-accent) 0%, transparent); }
        }
        .st-spin { animation: stSpin 0.8s linear infinite; }

        /* ---------- Header ---------- */
        .st-header { display: flex; align-items: center; gap: 14px; animation: stFadeUp 0.5s var(--ease) backwards; }
        .st-header-icon {
          width: 46px; height: 46px; flex-shrink: 0;
          display: grid; place-items: center;
          border-radius: 14px; color: #fff;
          background: linear-gradient(135deg, var(--st-accent), #8B5CF6);
          box-shadow: 0 8px 20px color-mix(in srgb, var(--st-accent) 35%, transparent);
        }
        .st-header-icon svg { transition: transform 0.8s var(--ease); }
        .st-header:hover .st-header-icon svg { transform: rotate(120deg); }
        .st-title { font-size: 24px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; }
        .st-desc { margin-top: 3px; font-size: 13.5px; color: var(--st-muted); }

        /* ---------- Tabs ---------- */
        .st-tabs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 22px 0 18px;
        }
        .st-tab {
          --tc: var(--st-accent);
          position: relative; overflow: hidden;
          display: flex; align-items: center; gap: 12px;
          height: 68px; padding: 0 16px;
          text-align: left; font: inherit; cursor: pointer;
          color: var(--st-text);
          background: var(--st-card);
          border: 1px solid var(--st-border);
          border-radius: 16px;
          animation: stFadeUp 0.5s var(--ease) backwards;
          animation-delay: calc(var(--i, 0) * 60ms + 80ms);
          transition: transform 0.3s var(--ease), border-color 0.25s ease, background 0.25s ease, box-shadow 0.3s ease;
        }
        .st-tab:hover {
          transform: translateY(-3px);
          border-color: color-mix(in srgb, var(--tc) 55%, var(--st-border));
          box-shadow: 0 10px 22px color-mix(in srgb, var(--tc) 16%, transparent);
        }
        .st-tab:active { transform: scale(0.98); }
        .st-tab:focus-visible { outline: 2px solid var(--tc); outline-offset: 2px; }

        .st-tab-icon {
          width: 36px; height: 36px; flex-shrink: 0;
          display: grid; place-items: center;
          border-radius: 11px;
          color: var(--tc);
          background: color-mix(in srgb, var(--tc) 13%, transparent);
          transition: transform 0.4s var(--ease), background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
        }
        .st-tab:hover .st-tab-icon { transform: scale(1.1) rotate(-6deg); }
        .st-tab-text { display: flex; flex-direction: column; min-width: 0; }
        .st-tab-label { font-size: 14px; font-weight: 600; line-height: 1.2; color: var(--st-text-2); transition: color 0.25s ease; }
        .st-tab-sub { margin-top: 2px; font-size: 11.5px; color: var(--st-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .st-tab:hover .st-tab-label { color: var(--st-text); }

        .st-tab.active {
          background: color-mix(in srgb, var(--tc) 9%, var(--st-card));
          border-color: var(--tc);
        }
        .st-tab.active .st-tab-icon {
          background: var(--tc); color: #fff;
          box-shadow: 0 6px 14px color-mix(in srgb, var(--tc) 40%, transparent);
        }
        .st-tab.active .st-tab-label { color: var(--st-text); font-weight: 700; }
        .st-tab-bar {
          position: absolute; left: 0; right: 0; bottom: 0; height: 3px;
          background: var(--tc);
          transform-origin: left;
          animation: stBar 0.45s var(--ease);
        }

        /* ---------- Panel + cards ---------- */
        .st-panel { animation: stFadeUp 0.45s var(--ease) backwards; }

        .st-card {
          position: relative; overflow: hidden;
          padding: 26px;
          background: var(--st-card);
          border: 1px solid var(--st-border);
          border-radius: 20px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 28px rgba(15, 23, 42, 0.05);
        }
        .st-root[data-theme="dark"] .st-card { box-shadow: 0 10px 28px rgba(0, 0, 0, 0.3); }
        .st-card::before {
          content: ""; position: absolute; top: -90px; right: -70px;
          width: 240px; height: 240px; border-radius: 50%;
          background: radial-gradient(circle, color-mix(in srgb, var(--tc) 16%, transparent), transparent 70%);
          pointer-events: none;
        }
        .st-card > * { position: relative; }

        .st-card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
        .st-card-icon {
          width: 40px; height: 40px; flex-shrink: 0; display: grid; place-items: center;
          border-radius: 12px; color: var(--tc);
          background: color-mix(in srgb, var(--tc) 14%, transparent);
        }
        .st-card-title { font-size: 18px; font-weight: 700; letter-spacing: -0.015em; }
        .st-card-desc { margin-top: 2px; font-size: 13px; color: var(--st-muted); }

        /* ---------- Profile ---------- */
        .st-hero {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
          padding: 16px 18px; margin-bottom: 22px;
          background: linear-gradient(135deg, color-mix(in srgb, var(--tc) 10%, var(--st-bg)), var(--st-bg));
          border: 1px solid var(--st-border);
          border-radius: 16px;
        }
        .st-avatar {
          width: 60px; height: 60px; flex-shrink: 0; display: grid; place-items: center;
          border-radius: 18px; color: #fff; font-size: 24px; font-weight: 800;
          background: linear-gradient(135deg, var(--st-accent), #8B5CF6);
          animation: stRing 3s ease-in-out infinite;
        }
        .st-hero-info { flex: 1; min-width: 200px; }
        .st-hero-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
        .st-hero-name { font-size: 17px; font-weight: 700; }
        .st-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 8px; border-radius: 99px; font-size: 10.5px; font-weight: 700;
        }
        .st-badge.ok { color: #10B981; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.25); }
        .st-badge.plan { color: var(--st-accent); background: color-mix(in srgb, var(--st-accent) 12%, transparent); border: 1px solid color-mix(in srgb, var(--st-accent) 28%, transparent); }
        .st-hero-email { font-size: 13px; color: var(--st-text-2); word-break: break-all; }
        .st-hero-since { margin-top: 4px; display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--st-muted); }

        .st-form { display: grid; gap: 18px; max-width: 580px; }
        .st-label { display: block; margin-bottom: 7px; font-size: 12.5px; font-weight: 600; color: var(--st-text-2); }

        .st-value-row {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          height: 48px; padding: 0 12px 0 14px;
          background: var(--st-bg); border: 1px solid var(--st-border); border-radius: 12px;
          transition: border-color 0.25s ease;
        }
        .st-value-row:hover { border-color: color-mix(in srgb, var(--st-accent) 45%, var(--st-border)); }
        .st-value-row.locked { opacity: 0.85; }
        .st-value-row:hover.locked { border-color: var(--st-border); }
        .st-value-text { font-size: 14px; font-weight: 500; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .st-value-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--st-muted); flex-shrink: 0; }

        .st-edit-row { display: flex; gap: 8px; flex-wrap: wrap; animation: stFade 0.25s ease; }
        .st-edit-row .st-input { flex: 1 1 200px; }

        /* ---------- Inputs + buttons ---------- */
        .st-input {
          width: 100%; height: 48px; padding: 0 14px;
          color: var(--st-text); font: inherit; font-size: 14px;
          background: var(--st-bg); border: 1px solid var(--st-border); border-radius: 12px;
          outline: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        }
        .st-input:hover { border-color: color-mix(in srgb, var(--st-accent) 45%, var(--st-border)); }
        .st-input:focus {
          border-color: var(--st-accent); background: var(--st-card);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--st-accent) 15%, transparent);
        }
        .st-input::placeholder { color: var(--st-muted); opacity: 0.7; }
        .st-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0.04em; }
        .st-input.match { border-color: #EF4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.14); }

        .st-pass { position: relative; }
        .st-pass .st-input { padding-right: 46px; }
        .st-eye {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          width: 34px; height: 34px; display: grid; place-items: center;
          border: 0; border-radius: 9px; cursor: pointer;
          color: var(--st-muted); background: transparent;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .st-eye:hover { color: var(--st-accent); background: color-mix(in srgb, var(--st-accent) 10%, transparent); }

        .st-btn {
          position: relative; overflow: hidden;
          height: 44px; padding: 0 18px;
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer;
          border-radius: 12px; white-space: nowrap;
          transition: transform 0.3s var(--ease), box-shadow 0.3s ease, background 0.25s ease, border-color 0.25s ease, opacity 0.2s ease;
        }
        .st-btn:active:not(:disabled) { transform: scale(0.97); }
        .st-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .st-btn:focus-visible { outline: 2px solid var(--st-accent); outline-offset: 2px; }
        .st-btn.sm { height: 34px; padding: 0 12px; font-size: 12px; border-radius: 10px; }

        .st-btn-primary {
          color: #fff; border: 0;
          background: linear-gradient(135deg, var(--st-accent), #8B5CF6);
          box-shadow: 0 6px 16px color-mix(in srgb, var(--st-accent) 30%, transparent);
        }
        .st-btn-primary::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%);
          transform: translateX(-120%); transition: transform 0.6s var(--ease);
        }
        .st-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px color-mix(in srgb, var(--st-accent) 40%, transparent); }
        .st-btn-primary:hover:not(:disabled)::after { transform: translateX(120%); }

        .st-btn-ghost { color: var(--st-text); background: var(--st-bg); border: 1px solid var(--st-border); }
        .st-btn-ghost:hover:not(:disabled) { transform: translateY(-2px); border-color: var(--st-accent); background: color-mix(in srgb, var(--st-accent) 7%, var(--st-bg)); }

        .st-btn-danger { color: #fff; border: 0; background: #EF4444; box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3); }
        .st-btn-danger:hover:not(:disabled) { transform: translateY(-2px); background: #DC2626; box-shadow: 0 10px 22px rgba(239, 68, 68, 0.4); }
        .st-btn-danger-soft { color: #EF4444; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.28); }
        .st-btn-danger-soft:hover { transform: translateY(-2px); background: rgba(239, 68, 68, 0.14); border-color: #EF4444; }

        /* ---------- Password strength ---------- */
        .st-meter { margin-top: 10px; }
        .st-meter-bars { display: flex; gap: 5px; }
        .st-meter-bars i {
          flex: 1; height: 4px; border-radius: 4px; background: var(--st-border);
          transition: background 0.35s ease, transform 0.35s var(--ease);
          transform-origin: left;
        }
        .st-meter-bars i.on { transform: scaleY(1.4); }
        .st-meter-label { margin-top: 7px; display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
        .st-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .st-chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: 99px; font-size: 11px; font-weight: 600;
          color: var(--st-muted); background: var(--st-bg); border: 1px solid var(--st-border);
          transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease;
        }
        .st-chip.met { color: #10B981; background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); }
        .st-chip.met b { animation: stPop 0.35s var(--ease); display: inline-block; }
        .st-strength-text { font-size: 12px; font-weight: 700; }

        /* ---------- Appearance ---------- */
        .st-themes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        .st-theme {
          position: relative; display: flex; flex-direction: column; gap: 14px;
          padding: 14px; text-align: left; font: inherit; cursor: pointer; color: var(--st-text);
          background: var(--st-bg); border: 2px solid var(--st-border); border-radius: 18px;
          transition: transform 0.3s var(--ease), border-color 0.25s ease, box-shadow 0.3s ease, background 0.25s ease;
        }
        .st-theme:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--st-accent) 55%, var(--st-border)); box-shadow: 0 14px 28px color-mix(in srgb, var(--st-accent) 14%, transparent); }
        .st-theme:active { transform: scale(0.98); }
        .st-theme:focus-visible { outline: 2px solid var(--st-accent); outline-offset: 3px; }
        .st-theme.active { border-color: var(--st-accent); background: color-mix(in srgb, var(--st-accent) 6%, var(--st-bg)); }

        .st-preview {
          display: flex; gap: 8px; height: 96px; padding: 10px; border-radius: 12px; overflow: hidden;
          border: 1px solid rgba(128, 128, 128, 0.25);
          transition: transform 0.5s var(--ease);
        }
        .st-theme:hover .st-preview { transform: scale(1.03); }
        .st-preview .p-side { width: 22%; border-radius: 6px; }
        .st-preview .p-main { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .st-preview .p-bar { height: 8px; border-radius: 4px; }
        .st-preview .p-row { display: flex; gap: 6px; flex: 1; }
        .st-preview .p-card { flex: 1; border-radius: 6px; }
        .st-preview-light { background: #F3F4F8; }
        .st-preview-light .p-side { background: #fff; }
        .st-preview-light .p-bar { background: #D6DAE6; }
        .st-preview-light .p-bar.a { width: 55%; background: #7C6CF0; }
        .st-preview-light .p-card { background: #fff; }
        .st-preview-dark { background: #0B0F19; }
        .st-preview-dark .p-side { background: #151B2B; }
        .st-preview-dark .p-bar { background: #2A3350; }
        .st-preview-dark .p-bar.a { width: 55%; background: #7C6CF0; }
        .st-preview-dark .p-card { background: #151B2B; }

        .st-theme-foot { display: flex; align-items: center; gap: 10px; }
        .st-theme-icon { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; flex-shrink: 0; transition: transform 0.5s var(--ease); }
        .st-theme:hover .st-theme-icon { transform: rotate(25deg) scale(1.08); }
        .st-theme-name { font-size: 14px; font-weight: 700; }
        .st-theme-desc { margin-top: 2px; font-size: 12px; color: var(--st-muted); }
        .st-theme-check {
          position: absolute; top: 22px; right: 22px;
          width: 24px; height: 24px; display: grid; place-items: center;
          border-radius: 50%; color: #fff; background: var(--st-accent);
          box-shadow: 0 4px 10px color-mix(in srgb, var(--st-accent) 45%, transparent);
          animation: stPop 0.4s var(--ease);
        }

        /* ---------- Account ---------- */
        .st-session {
          display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          padding: 14px 16px; background: var(--st-bg); border: 1px solid var(--st-border); border-radius: 14px;
          transition: border-color 0.25s ease;
        }
        .st-session:hover { border-color: color-mix(in srgb, var(--st-accent) 40%, var(--st-border)); }
        .st-session-title { font-size: 13.5px; font-weight: 600; }
        .st-session-sub { margin-top: 2px; font-size: 12px; color: var(--st-muted); word-break: break-all; }

        .st-danger {
          margin-top: 20px; padding: 18px;
          background: rgba(239, 68, 68, 0.04);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 16px;
        }
        .st-danger-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .st-danger-icon { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 11px; color: #EF4444; background: rgba(239, 68, 68, 0.12); flex-shrink: 0; }
        .st-danger-title { font-size: 15px; font-weight: 700; color: #EF4444; }
        .st-danger-sub { margin-top: 1px; font-size: 12.5px; color: var(--st-muted); }
        .st-danger-row {
          display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          padding: 14px; background: var(--st-card); border: 1px solid var(--st-border); border-radius: 12px;
          animation: stFade 0.25s ease;
        }
        .st-danger-row-title { font-size: 13.5px; font-weight: 600; }
        .st-danger-row-desc { margin-top: 2px; font-size: 12px; color: var(--st-muted); }
        .st-danger-confirm {
          display: grid; gap: 10px; padding: 16px;
          background: var(--st-card); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px;
          animation: stFadeUp 0.3s var(--ease);
        }
        .st-danger-confirm-text { font-size: 13px; line-height: 1.5; }
        .st-danger-confirm-text strong { color: #EF4444; font-family: ui-monospace, Menlo, monospace; }
        .st-danger-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }

        /* ---------- Toast ---------- */
        .st-toast {
          position: fixed; top: 20px; right: 20px; z-index: 1000;
          display: flex; align-items: center; gap: 10px; overflow: hidden;
          min-width: 220px; max-width: min(360px, calc(100vw - 32px));
          padding: 12px 16px; border-radius: 14px;
          color: #fff; font-size: 13px; font-weight: 600;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.28);
          transition: opacity 0.25s ease, transform 0.35s var(--ease);
        }
        .st-toast.success { background: linear-gradient(135deg, #10B981, #059669); }
        .st-toast.error { background: linear-gradient(135deg, #EF4444, #DC2626); }
        .st-toast.in { opacity: 1; transform: translateX(0); animation: stToastIn 0.4s var(--ease); }
        .st-toast.out { opacity: 0; transform: translateX(16px) scale(0.97); }
        @keyframes stToastIn { from { opacity: 0; transform: translateX(24px) scale(0.96); } }
        .st-toast-icon { width: 22px; height: 22px; display: grid; place-items: center; flex-shrink: 0; border-radius: 50%; background: rgba(255,255,255,0.22); font-size: 11px; font-weight: 800; }
        .st-toast-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: rgba(255,255,255,0.55); transform-origin: left; animation: stToastBar 2.8s linear forwards; }

        /* ---------- Tablet ---------- */
        @media (max-width: 860px) {
          .st-tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        /* ---------- Mobile ---------- */
        @media (max-width: 640px) {
          .st-title { font-size: 20px; }
          .st-desc { font-size: 12.5px; }
          .st-header-icon { width: 40px; height: 40px; border-radius: 12px; }

          /* tabs become a swipeable pill row */
          .st-tabs {
            display: flex; gap: 8px; margin: 16px -14px 14px; padding: 4px 14px;
            overflow-x: auto; scroll-snap-type: x proximity;
            -ms-overflow-style: none; scrollbar-width: none;
          }
          .st-tabs::-webkit-scrollbar { display: none; }
          .st-tab { flex: 0 0 auto; height: 46px; padding: 0 14px 0 10px; gap: 8px; border-radius: 999px; scroll-snap-align: center; }
          .st-tab-icon { width: 28px; height: 28px; border-radius: 50%; }
          .st-tab-sub { display: none; }
          .st-tab-label { font-size: 13px; }
          .st-tab-bar { display: none; }
          .st-tab.active { box-shadow: 0 6px 16px color-mix(in srgb, var(--tc) 28%, transparent); }

          .st-card { padding: 18px 16px; border-radius: 18px; }
          .st-card-head { margin-bottom: 18px; }
          .st-card-title { font-size: 16px; }
          .st-hero { padding: 14px; gap: 12px; }
          .st-avatar { width: 52px; height: 52px; border-radius: 16px; font-size: 21px; }
          .st-hero-info { min-width: 0; flex-basis: calc(100% - 70px); }

          /* 16px inputs stop iOS from zooming on focus */
          .st-input { font-size: 16px; height: 50px; }
          .st-value-row { height: 50px; }
          .st-btn { height: 48px; }
          .st-btn.sm { height: 36px; }

          .st-edit-row .st-btn { flex: 1 1 0; }
          .st-themes { grid-template-columns: 1fr; gap: 12px; }
          .st-preview { height: 80px; }

          .st-danger { padding: 14px; }
          .st-danger-row .st-btn { width: 100%; }
          .st-danger-actions { flex-direction: column-reverse; }
          .st-danger-actions .st-btn { width: 100%; }

          /* toast sits at the bottom, within thumb reach */
          .st-toast { top: auto; bottom: 18px; left: 16px; right: 16px; max-width: none; }
          .st-toast.in { animation-name: stToastInMobile; }
          .st-toast.out { transform: translateY(16px) scale(0.97); }
          @keyframes stToastInMobile { from { opacity: 0; transform: translateY(24px) scale(0.96); } }
        }

        @media (prefers-reduced-motion: reduce) {
          .st-root *, .st-root *::before, .st-root *::after, .st-toast, .st-toast * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            animation-delay: 0ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="st-root" data-theme={mode} style={rootVars}>
        {/* Header */}
        <div className="st-header">
          <div className="st-header-icon"><Lucide.Settings /></div>
          <div>
            <h1 className="st-title">Workspace Settings</h1>
            <p className="st-desc">Manage display identity, security credentials and system preferences.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="st-tabs" role="tablist">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className={`st-tab ${isActive ? "active" : ""}`}
                style={{ "--tc": tab.color, "--i": i }}
                onClick={(e) => {
                  setActiveSection(tab.id);
                  e.currentTarget.scrollIntoView?.({ behavior: "smooth", inline: "center", block: "nearest" });
                }}
              >
                <div className="st-tab-icon"><Icon /></div>
                <div className="st-tab-text">
                  <span className="st-tab-label">{tab.label}</span>
                  <span className="st-tab-sub">{tab.subtitle}</span>
                </div>
                {isActive && <span className="st-tab-bar" />}
              </button>
            );
          })}
        </div>

        {/* PROFILE */}
        {activeSection === "profile" && (
          <div className="st-panel" key="profile">
            <div className="st-card" style={{ "--tc": activeTab.color }}>
              <div className="st-card-head">
                <div className="st-card-icon"><Lucide.User /></div>
                <div>
                  <h2 className="st-card-title">Public Identity</h2>
                  <p className="st-card-desc">Manage how your profile appears across workspace workspaces.</p>
                </div>
              </div>

              <div className="st-hero" style={{ "--tc": activeTab.color }}>
                <div className="st-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
                <div className="st-hero-info">
                  <div className="st-hero-name-row">
                    <h3 className="st-hero-name">{user?.name || "User"}</h3>
                    <span className="st-badge ok"><Lucide.CheckCircle /> Verified</span>
                    <span className="st-badge plan">Free Plan</span>
                  </div>
                  <p className="st-hero-email">{user?.email}</p>
                  {user?.createdAt && (
                    <p className="st-hero-since">
                      <Lucide.Calendar /> Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>

              <div className="st-form">
                <div>
                  <label className="st-label">Display Name</label>
                  {editingName ? (
                    <div className="st-edit-row">
                      <input
                        className="st-input"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Your full name"
                        autoFocus
                      />
                      <button className="st-btn st-btn-primary" onClick={handleSaveName} disabled={savingName}>
                        {savingName ? <Lucide.Loader /> : "Save"}
                      </button>
                      <button
                        className="st-btn st-btn-ghost"
                        onClick={() => { setEditingName(false); setNewName(user?.name || ""); }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="st-value-row">
                      <span className="st-value-text">{user?.name || "Not set"}</span>
                      <button className="st-btn st-btn-ghost sm" onClick={() => setEditingName(true)}>
                        <Lucide.Edit /> Edit Name
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="st-label">Email Address</label>
                  <div className="st-value-row locked">
                    <span className="st-value-text">{user?.email}</span>
                    <span className="st-value-tag"><Lucide.Lock /> Primary</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY */}
        {activeSection === "security" && (
          <div className="st-panel" key="security">
            <div className="st-card" style={{ "--tc": activeTab.color }}>
              <div className="st-card-head">
                <div className="st-card-icon"><Lucide.Shield /></div>
                <div>
                  <h2 className="st-card-title">Security & Credentials</h2>
                  <p className="st-card-desc">Update your authentication details and manage password strength.</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="st-form">
                <div>
                  <label className="st-label">Current Password</label>
                  <div className="st-pass">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      className="st-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                    />
                    <button type="button" className="st-eye" onClick={() => setShowCurrentPass(!showCurrentPass)} aria-label="Toggle password visibility">
                      {showCurrentPass ? <Lucide.EyeOff /> : <Lucide.Eye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="st-label">New Password</label>
                  <div className="st-pass">
                    <input
                      type={showNewPass ? "text" : "password"}
                      className="st-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                    <button type="button" className="st-eye" onClick={() => setShowNewPass(!showNewPass)} aria-label="Toggle password visibility">
                      {showNewPass ? <Lucide.EyeOff /> : <Lucide.Eye />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="st-meter">
                      <div className="st-meter-bars">
                        {[1, 2, 3, 4].map((v) => (
                          <i
                            key={v}
                            className={v <= strength ? "on" : ""}
                            style={{ background: v <= strength ? strengthColor : undefined }}
                          />
                        ))}
                      </div>
                      <div className="st-meter-label">
                        <div className="st-chips">
                          {passwordChecks.map((chk, idx) => {
                            const isMet = chk.test.test(newPassword);
                            return (
                              <span key={idx} className={`st-chip ${isMet ? "met" : ""}`}>
                                <b>{isMet ? "✓" : "•"}</b> {chk.label}
                              </span>
                            );
                          })}
                        </div>
                        {strengthLabel && (
                          <span className="st-strength-text" style={{ color: strengthColor }}>{strengthLabel}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="st-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="st-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                  />
                </div>

                <div>
                  <button type="submit" className="st-btn st-btn-primary" disabled={savingPass}>
                    {savingPass ? <Lucide.Loader /> : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* APPEARANCE */}
        {activeSection === "appearance" && (
          <div className="st-panel" key="appearance">
            <div className="st-card" style={{ "--tc": activeTab.color }}>
              <div className="st-card-head">
                <div className="st-card-icon"><Lucide.Palette /></div>
                <div>
                  <h2 className="st-card-title">Theme Preferences</h2>
                  <p className="st-card-desc">Customize the interface visual appearance across your devices.</p>
                </div>
              </div>

              <div className="st-themes">
                <button
                  type="button"
                  className={`st-theme ${mode === "light" ? "active" : ""}`}
                  aria-pressed={mode === "light"}
                  onClick={(e) => mode !== "light" && toggleTheme(e)}
                >
                  <div className="st-preview st-preview-light">
                    <i className="p-side" />
                    <div className="p-main">
                      <i className="p-bar a" />
                      <i className="p-bar" style={{ width: "35%" }} />
                      <div className="p-row"><i className="p-card" /><i className="p-card" /></div>
                    </div>
                  </div>
                  <div className="st-theme-foot">
                    <span className="st-theme-icon" style={{ background: "#E0E7FF", color: "#4F46E5" }}><Lucide.Sun /></span>
                    <div>
                      <p className="st-theme-name">Light Mode</p>
                      <p className="st-theme-desc">Clean, high-contrast crisp theme</p>
                    </div>
                  </div>
                  {mode === "light" && <span className="st-theme-check"><Lucide.Check /></span>}
                </button>

                <button
                  type="button"
                  className={`st-theme ${mode === "dark" ? "active" : ""}`}
                  aria-pressed={mode === "dark"}
                  onClick={(e) => mode !== "dark" && toggleTheme(e)}
                >
                  <div className="st-preview st-preview-dark">
                    <i className="p-side" />
                    <div className="p-main">
                      <i className="p-bar a" />
                      <i className="p-bar" style={{ width: "35%" }} />
                      <div className="p-row"><i className="p-card" /><i className="p-card" /></div>
                    </div>
                  </div>
                  <div className="st-theme-foot">
                    <span className="st-theme-icon" style={{ background: "#312E81", color: "#818CF8" }}><Lucide.Moon /></span>
                    <div>
                      <p className="st-theme-name">Dark Mode</p>
                      <p className="st-theme-desc">Low-light sleek, eye-friendly style</p>
                    </div>
                  </div>
                  {mode === "dark" && <span className="st-theme-check"><Lucide.Check /></span>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT */}
        {activeSection === "account" && (
          <div className="st-panel" key="account">
            <div className="st-card" style={{ "--tc": activeTab.color }}>
              <div className="st-card-head">
                <div className="st-card-icon"><Lucide.Sliders /></div>
                <div>
                  <h2 className="st-card-title">Account Administration</h2>
                  <p className="st-card-desc">Manage active session state and account deletion options.</p>
                </div>
              </div>

              <label className="st-label">Session Management</label>
              <div className="st-session">
                <div>
                  <p className="st-session-title">Current Active Session</p>
                  <p className="st-session-sub">Logged in as {user?.email}</p>
                </div>
                <button className="st-btn st-btn-ghost sm" onClick={logout}>Sign Out</button>
              </div>

              <DangerZone logout={logout} navigate={navigate} showToast={showToast} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Settings;