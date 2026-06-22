import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function VerifyOtp() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [email] = useState(() => localStorage.getItem("pendingEmail") || "");

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const otp = digits.join("");
    if (otp.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);
    try {
      await resendOtp(email);
      setSuccess("A new code has been sent");
      setCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code");
    } finally {
      setResending(false);
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
        .otp-input {
          width: 44px;
          height: 52px;
          background: #0F1422;
          border: 1.5px solid #2A3142;
          border-radius: 10px;
          color: #F1F3F9;
          font-size: 20px;
          font-weight: 600;
          text-align: center;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .otp-input:focus {
          border-color: #7C6CF0;
          box-shadow: 0 0 0 3px rgba(124,108,240,0.15);
        }
        .verify-btn {
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
        .verify-btn:hover { opacity: .92; transform: translateY(-1px); }
        .verify-btn:active { transform: scale(.98); }
        .verify-btn:disabled { opacity: .5; cursor: not-allowed; }
        .resend-link {
          background: none; border: none; cursor: pointer;
          color: #7C6CF0; font-size: 12px; font-weight: 600;
          padding: 0; text-decoration: none;
        }
        .resend-link:disabled { color: #5B6478; cursor: not-allowed; }
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
        width: "100%", maxWidth: "380px",
        maxHeight: "90dvh",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        boxSizing: "border-box",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "12px",
            background: "linear-gradient(135deg, #7C6CF0, #33C9E8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px", fontSize: "20px",
            boxShadow: "0 8px 24px rgba(124,108,240,0.35)",
          }}>
            ✉️
          </div>
          <h1 style={{ fontSize: "17px", fontWeight: "700", color: "#F1F3F9", margin: "0 0 6px" }}>
            Verify your email
          </h1>
          <p style={{ fontSize: "12px", color: "#7B8499", margin: 0, lineHeight: "1.5" }}>
            We sent a 6-digit code to<br />
            <span style={{ color: "#A5ADC2", fontWeight: "500" }}>{email}</span>
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

        {success && (
          <div style={{
            background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
            color: "#86EFAC", padding: "9px 13px", borderRadius: "9px",
            fontSize: "12px", marginBottom: "14px", textAlign: "center",
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "18px" }} onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                className="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>

          <button className="verify-btn" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#7B8499", marginTop: "16px", marginBottom: 0 }}>
          Didn't get the code?{" "}
          <button
            className="resend-link"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending..." : "Resend code"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default VerifyOtp;