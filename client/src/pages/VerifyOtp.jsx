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
        .otp-input {
          width: 44px;
          height: 52px;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          color: #0F172A;
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
          transition: color .2s;
        }
        .resend-link:hover { color: #5B4FE0; }
        .resend-link:disabled { color: #94A3B8; cursor: not-allowed; }
        .footer-link {
          color: #64748B;
          text-decoration: none;
          font-size: 13px;
          transition: color .2s;
        }
        .footer-link:hover {
          color: #2563EB;
        }
        @media (max-width:900px) {
          .footer-grid {
            grid-template-columns: repeat(2,1fr) !important;
          }
        }
        @media (max-width:600px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
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
              ✉️
            </div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#0F172A",
                margin: "0 0 8px",
              }}
            >
              Verify your email
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#64748B",
                margin: 0,
                lineHeight: "1.6",
              }}
            >
              We sent a 6-digit code to
              <br />
              <span style={{ color: "#0F172A", fontWeight: "600" }}>{email}</span>
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

          {success && (
            <div
              style={{
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                color: "#16A34A",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "center",
                marginBottom: "24px",
              }}
              onPaste={handlePaste}
            >
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

          <p
            style={{
              textAlign: "center",
              fontSize: "13px",
              color: "#64748B",
              marginTop: "20px",
              marginBottom: 0,
            }}
          >
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

      {/* Footer */}
      <footer
        style={{
          width: "100%",
          borderTop: "1px solid #E2E8F0",
          background: "#fff",
          padding: "48px 0",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          <div
            className="footer-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
              gap: "40px",
            }}
          >
            {/* Brand */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <img
                  src="/logo.png"
                  alt="Studora AI"
                  style={{
                    width: "32px",
                    height: "32px",
                    objectFit: "contain",
                  }}
                />
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#0F172A",
                  }}
                >
                  Studora AI
                </span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#64748B",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                AI-powered learning platform helping students study smarter with Notes,
                PDF AI, Quiz Arena, Flashcards and Planner.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 style={{ color: "#0F172A", marginBottom: "12px", fontSize: "14px" }}>
                Product
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a href="#" className="footer-link">AI Notes</a>
                <a href="#" className="footer-link">PDF AI</a>
                <a href="#" className="footer-link">Quiz Arena</a>
                <a href="#" className="footer-link">Planner</a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 style={{ color: "#0F172A", marginBottom: "12px", fontSize: "14px" }}>
                Company
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a href="#" className="footer-link">About</a>
                <a href="#" className="footer-link">Blog</a>
                <a href="#" className="footer-link">Careers</a>
                <a href="#" className="footer-link">Contact</a>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 style={{ color: "#0F172A", marginBottom: "12px", fontSize: "14px" }}>
                Resources
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a href="#" className="footer-link">Documentation</a>
                <a href="#" className="footer-link">FAQ</a>
                <a href="#" className="footer-link">Community</a>
                <a href="#" className="footer-link">Support</a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 style={{ color: "#0F172A", marginBottom: "12px", fontSize: "14px" }}>
                Legal
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a href="#" className="footer-link">Privacy</a>
                <a href="#" className="footer-link">Terms</a>
                <a href="#" className="footer-link">Cookies</a>
                <a href="#" className="footer-link">Security</a>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid #E2E8F0",
              marginTop: "32px",
              paddingTop: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#94A3B8",
                margin: 0,
              }}
            >
              © 2026 Studora AI. All rights reserved.
            </p>

            <div
              style={{
                display: "flex",
                gap: "16px",
              }}
            >
              <a href="#" className="footer-link">GitHub</a>
              <a href="#" className="footer-link">LinkedIn</a>
              <a href="#" className="footer-link">Discord</a>
              <a href="#" className="footer-link">X</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default VerifyOtp;