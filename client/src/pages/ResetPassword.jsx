import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" y1="2" x2="22" y2="22"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Check your token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "radial-gradient(circle at 10% 10%, #BFDBFE 0%, transparent 30%), radial-gradient(circle at 90% 20%, #DDD6FE 0%, transparent 30%), radial-gradient(circle at 50% 90%, #CFFAFE 0%, transparent 35%), #F8FAFC",
        fontFamily: "sans-serif",
      }}
    >
      <style>{`
        .s-input {
          width: 100%;
          padding: 10px 14px;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          color: #0F172A;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          transition: border-color .2s, box-shadow .2s;
        }
        .s-input::placeholder { color: #94A3B8; }
        .s-input:focus {
          border-color: #7C6CF0;
          box-shadow: 0 0 0 3px rgba(124,108,240,0.15);
        }
        .eye-btn {
          background: none; border: none; cursor: pointer;
          color: #94A3B8; padding: 6px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          transition: color .15s, background .15s;
        }
        .eye-btn:hover { color: #0F172A; background: rgba(0,0,0,0.04); }
        .rp-btn {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg, #7C6CF0, #5B4FE0);
          color: #fff; border: none; border-radius: 10px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: transform .15s, opacity .15s;
          letter-spacing: .02em;
          box-shadow: 0 4px 20px rgba(124,108,240,0.25);
        }
        .rp-btn:hover { opacity: .92; transform: translateY(-1px); }
        .rp-btn:active { transform: scale(.98); }
        .rp-btn:disabled { opacity: .5; cursor: not-allowed; }
        
        .back-link {
          color: #7C6CF0;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: transform .2s;
        }
        .back-link:hover {
          transform: translateX(-3px);
        }
        
        .footer-link {
          color: #94A3B8;
          text-decoration: none;
          font-size: 12px;
          transition: color .2s;
        }
        .footer-link:hover {
          color: #7C6CF0;
        }
        
        .auth-footer {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          opacity: 0;
          animation: footerFadeIn 0.6s ease-out forwards;
        }
        
        @keyframes footerFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes dividerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .auth-divider {
          border-top: 1px solid #E2E8F0;
          margin: 0;
          animation: dividerFadeIn 0.8s ease-out;
        }
        
        .footer-links {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .footer-security {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #64748B;
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>

      {/* Center Section */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            background: "#FFFFFF",
            borderRadius: "20px",
            padding: "40px 32px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
            border: "1px solid rgba(226,232,240,0.6)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "16px",
                background: "linear-gradient(135deg, #7C6CF0, #33C9E8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "24px",
                boxShadow: "0 8px 24px rgba(124,108,240,0.25)",
              }}
            >
              🔒
            </div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#0F172A",
                margin: "0 0 8px",
              }}
            >
              Reset your password
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#64748B",
                margin: 0,
                lineHeight: "1.6",
              }}
            >
              Paste the token from your email
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#DC2626",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {success ? (
            <div
              style={{
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                color: "#16A34A",
                padding: "12px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                textAlign: "center",
                lineHeight: "1.5",
              }}
            >
              ✓ Password reset successful!<br />Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#0F172A",
                    marginBottom: "6px",
                  }}
                >
                  Reset Token
                </label>
                <input
                  className="s-input"
                  type="text"
                  placeholder="Paste token from email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#0F172A",
                    marginBottom: "6px",
                  }}
                >
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="s-input"
                    type={showPass ? "text" : "password"}
                    placeholder=" Enter Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute",
                      right: "6px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPass} />
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#0F172A",
                    marginBottom: "6px",
                  }}
                >
                  Confirm New Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="s-input"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: "absolute",
                      right: "6px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </div>

              <button className="rp-btn" type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <Link to="/login" className="back-link">
              ← Back to Login
            </Link>
          </div>

          {/* Auth Footer */}
          <div className="auth-footer">
            <hr className="auth-divider" style={{ width: "100%" }} />

            <div className="footer-security">
              <span>🛡</span>
              <span>Secure Password Reset</span>
            </div>

            <p
              style={{
                fontSize: "12px",
                color: "#94A3B8",
                margin: 0,
                textAlign: "center",
                lineHeight: "1.6",
              }}
            >
              Your password is encrypted and securely transmitted.
            </p>

            <div className="footer-links">
              <a href="#" className="footer-link">Privacy</a>
              <a href="#" className="footer-link">Terms</a>
              <a href="#" className="footer-link">Help Center</a>
            </div>

            <p
              style={{
                fontSize: "11px",
                color: "#94A3B8",
                margin: 0,
              }}
            >
              © 2026 Studora AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;