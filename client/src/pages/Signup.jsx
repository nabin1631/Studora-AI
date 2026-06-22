import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// EyeIcon is now outside Signup
function EyeIcon({ open = false }) {
  return (
    open ? (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12c0 0 3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </svg>
    ) : (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  );
}

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const checks = [
    { label: "8+ characters", test: /.{8,}/ },
    { label: "A letter", test: /[A-Za-z]/ },
    { label: "A number", test: /\d/ },
    { label: "A symbol (@$!%*#?&)", test: /[@$!%*#?&]/ },
  ];
  const strength = checks.filter((c) => c.test.test(password)).length;
  const strengthColor = ["#ef4444", "#f97316", "#eab308", "#22c55e"][strength - 1] || "transparent";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters with a letter, a number, and a symbol");
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/verify-otp");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
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
          padding: 10px 14px;
          background: #0F1422;
          border: 1.5px solid #2A3142;
          border-radius: 10px;
          color: #F1F3F9;
          font-size: 13px;
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
          background: none; border: none; cursor: pointer;
          color: #5B6478; padding: 6px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          transition: color .15s, background .15s;
        }
        .eye-btn:hover { color: #A5ADC2; background: rgba(255,255,255,0.04); }
        .signup-btn {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg, #7C6CF0, #5B4FE0);
          color: #fff; border: none; border-radius: 10px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: transform .15s, opacity .15s, box-shadow .2s;
          letter-spacing: .02em;
          box-shadow: 0 4px 20px rgba(124,108,240,0.25);
        }
        .signup-btn:hover { opacity: .92; transform: translateY(-1px); }
        .signup-btn:active { transform: scale(.98); }
        .signup-btn:disabled { opacity: .5; cursor: not-allowed; }
        .glow { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
      `}</style>

      <div className="glow" style={{ width: 320, height: 320, background: "#7C6CF0", opacity: 0.12, top: "-80px", left: "-60px" }} />
      <div className="glow" style={{ width: 260, height: 260, background: "#33C9E8", opacity: 0.1, bottom: "-60px", right: "-60px" }} />

      <div   className="auth-card-content" style={{
        position: "relative", zIndex: 10,
        background: "#151B2B",
        border: "1px solid #232B3D",
        borderRadius: "18px",
        padding: "1.7rem 2rem 1.5rem",
        width: "100%", maxWidth: "370px",
        maxHeight: "90dvh",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        boxSizing: "border-box",
      }}>

        <div style={{ textAlign: "center", marginBottom: "1.1rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "11px",
            background: "linear-gradient(135deg, #e0dfeb, #dce7e9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 10px", fontSize: "18px",
            boxShadow: "0 8px 24px rgba(124,108,240,0.35)",
          }}>
             <img src="/logo.png" alt="Studora AI" style={{ width: "115%", height: "115%", objectFit: "contain" }} />
</div>
          <h1 style={{ fontSize: "17px", fontWeight: "700", color: "#F1F3F9", margin: "0 0 3px" }}>
            Create your account
          </h1>
          <p style={{ fontSize: "11px", color: "#7B8499", margin: 0 }}>
            Start your AI study journey
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
            color: "#FCA5A5", padding: "8px 12px", borderRadius: "9px",
            fontSize: "12px", marginBottom: "12px",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "9px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "500", color: "#A5ADC2", marginBottom: "5px" }}>
              Name
            </label>
            <input className="s-input" type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div style={{ marginBottom: "9px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "500", color: "#A5ADC2", marginBottom: "5px" }}>
              Email
            </label>
            <input className="s-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div style={{ marginBottom: "9px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "500", color: "#A5ADC2", marginBottom: "5px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="s-input"
                type={showPass ? "text" : "password"}
                placeholder="Min 8 chars, letter + number + symbol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: "44px" }}
              />
              <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)" }}
                aria-label={showPass ? "Hide password" : "Show password"}>
                <EyeIcon open={showPass} />
              </button>
            </div>

            {password.length > 0 && (
              <div style={{ marginTop: "7px" }}>
                <div style={{ display: "flex", gap: "3px", marginBottom: "5px" }}>
                  {[1, 2, 3, 4].map((level) => (
                    <div key={level} style={{
                      flex: 1, height: "3px", borderRadius: "2px",
                      background: strength >= level ? strengthColor : "#2A3142",
                      transition: "background .3s",
                    }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {checks.map((c, i) => (
                    <span key={i} style={{ fontSize: "10px", color: c.test.test(password) ? "#86EFAC" : "#5B6478" }}>
                      {c.test.test(password) ? "✓" : "○"} {c.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "500", color: "#A5ADC2", marginBottom: "5px" }}>
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="s-input"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ paddingRight: "44px" }}
              />
              <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)" }}
                aria-label={showConfirm ? "Hide password" : "Show password"}>
                <EyeIcon open={showConfirm} />
              </button>
            </div>
          </div>

          <button className="signup-btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#7B8499", marginTop: "14px", marginBottom: 0 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#7C6CF0", fontWeight: "600", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;