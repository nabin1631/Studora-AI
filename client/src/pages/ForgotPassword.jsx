import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
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
        .fp-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #7C6CF0, #5B4FE0);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform .15s, opacity .15s;
          letter-spacing: .02em;
          box-shadow: 0 4px 20px rgba(124,108,240,0.25);
        }
        .fp-btn:hover { opacity: .92; transform: translateY(-1px); }
        .fp-btn:active { transform: scale(.98); }
        .fp-btn:disabled { opacity: .5; cursor: not-allowed; }
        .glow { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
      `}</style>

      <div className="glow" style={{ width: 320, height: 320, background: "#7C6CF0", opacity: 0.12, top: "-80px", left: "-60px" }} />
      <div className="glow" style={{ width: 260, height: 260, background: "#33C9E8", opacity: 0.1, bottom: "-60px", right: "-60px" }} />

      <div   className="auth-card-content" style={{
        position: "relative", zIndex: 10,
        background: "#151B2B",
        border: "1px solid #232B3D",
        borderRadius: "18px",
        padding: "1.7rem 1.9rem 1.5rem",
        width: "100%", maxWidth: "370px",
        maxHeight: "90dvh",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        boxSizing: "border-box",
      }}>

        <div style={{ textAlign: "center", marginBottom: "1.3rem" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "12px",
            background: "linear-gradient(135deg, #7C6CF0, #33C9E8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px", fontSize: "20px",
            boxShadow: "0 8px 24px rgba(124,108,240,0.35)",
          }}>
            🔑
          </div>
          <h1 style={{ fontSize: "17px", fontWeight: "700", color: "#F1F3F9", margin: "0 0 6px" }}>
            Forgot password?
          </h1>
          <p style={{ fontSize: "12px", color: "#7B8499", margin: 0, lineHeight: "1.5" }}>
            Enter your email and we'll send you<br />a link to reset it
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
            color: "#FCA5A5", padding: "9px 13px", borderRadius: "9px",
            fontSize: "12px", marginBottom: "14px", textAlign: "center",
          }}>
            {error}
          </div>
        )}

        {sent ? (
          <div>
            <div style={{
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
              color: "#86EFAC", padding: "12px 14px", borderRadius: "10px",
              fontSize: "13px", marginBottom: "16px", textAlign: "center", lineHeight: "1.5",
            }}>
              ✓ Reset instructions sent to<br /><strong>{email}</strong>
            </div>
            <Link to="/reset-password">
              <button className="fp-btn" type="button">
                I have my reset token
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
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
            <button className="fp-btn" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", fontSize: "12px", color: "#7B8499", marginTop: "16px", marginBottom: 0 }}>
          Remembered your password?{" "}
          <Link to="/login" style={{ color: "#7C6CF0", fontWeight: "600", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;