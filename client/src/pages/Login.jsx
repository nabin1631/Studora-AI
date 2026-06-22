import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: "100dvh",
      background: "#0B0F19",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
      padding: "1rem",
      overflow: "hidden",
      boxSizing: "border-box",
    }}>

      <style>{`
        .s-input {
          width: 100%;
          padding: 11px 14px;
          background: #0F1422;
          border: 1.5px solid #2A3142;
          border-radius: 10px;
          color: #F1F3F9;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-color .2s, box-shadow .2s;
        }
        .s-input::placeholder { color: #5B6478; }
        .s-input:focus {
          border-color: #7C6CF0;
          box-shadow: 0 0 0 3px rgba(124,108,240,0.15);
        }
        .eye-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #5B6478;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color .15s, background .15s;
        }
        .eye-btn:hover { color: #A5ADC2; background: rgba(255,255,255,0.04); }
        .login-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #7C6CF0, #5B4FE0);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform .15s, opacity .15s, box-shadow .2s;
          letter-spacing: .02em;
          box-shadow: 0 4px 20px rgba(124,108,240,0.25);
        }
        .login-btn:hover { opacity: .92; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(124,108,240,0.35); }
        .login-btn:active { transform: scale(.98); }
        .login-btn:disabled { opacity: .5; cursor: not-allowed; }
        .glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
      `}</style>

      {/* Subtle AI glows */}
      <div className="glow" style={{ width: 320, height: 320, background: "#7C6CF0", opacity: 0.12, top: "-80px", left: "-60px" }} />
      <div className="glow" style={{ width: 260, height: 260, background: "#33C9E8", opacity: 0.1, bottom: "-60px", right: "-60px" }} />

      {/* Card */}
      <div  className="auth-card-content" style={{
        position: "relative", zIndex: 10,
        background: "#151B2B",
        border: "1px solid #232B3D",
        borderRadius: "18px",
        padding: "2rem 2rem 1.6rem",
        width: "100%", maxWidth: "360px",
        maxHeight: "90dvh",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "12px",
            background: "linear-gradient(135deg, #dfdee9, #cedee1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px", fontSize: "20px",
            boxShadow: "0 8px 24px rgba(124,108,240,0.35)",
          }}>
             <img src="/logo.png" alt="Studora AI" style={{ width: "115%", height: "115%", objectFit: "contain" }} />
</div>
          <h1 style={{ fontSize: "18px", fontWeight: "700", color: "#F1F3F9", margin: "0 0 4px", letterSpacing: "-.01em" }}>
            STUDORA AI
          </h1>
          <p style={{ fontSize: "12px", color: "#7B8499", margin: 0 }}>
            Your AI Study Partner
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
            color: "#FCA5A5", padding: "9px 13px", borderRadius: "9px",
            fontSize: "12px", marginBottom: "14px",
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#A5ADC2", marginBottom: "6px" }}>
              Email
            </label>
            <input
              className="s-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "500", color: "#A5ADC2" }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: "11px", color: "#7C6CF0", textDecoration: "none" }}>
                Forgot?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                className="s-input"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: "44px" }}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)" }}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? (
                  // eye-off icon
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                ) : (
                  // eye icon
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button className="login-btn" type="submit" disabled={loading} style={{ marginTop: "14px" }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#7B8499", marginTop: "16px", marginBottom: 0 }}>
          No account?{" "}
          <Link to="/signup" style={{ color: "#7C6CF0", fontWeight: "600", textDecoration: "none" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;