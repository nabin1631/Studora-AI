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
    <div 
      style={{
        width: "100%",
        maxWidth: "100vw",
        minHeight: "100dvh",
        overflowX: "hidden", /* Safely prevents horizontal overflow while enabling normal vertical scrolling */
        background: "linear-gradient(135deg, #EAF4FF 0%, #FDFEFF 100%)",
        fontFamily: "sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div 
        className="main-container"
        style={{
          width: "100%",
          maxWidth: "100%",
          padding: "2rem 1rem",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <style>{`
          *, *::before, *::after {
            box-sizing: border-box;
          }

          img {
            max-width: 100%;
            display: block;
            height: auto;
          }

          .s-input {
            width: 100%;
            padding: 11px 14px;
            background: #F8FAFC;
            border: 1.5px solid #D1D5DB;
            border-radius: 10px;
            color: #1F2937;
            font-size: 14px;
            outline: none;
            transition: .2s;
          }

          .s-input::placeholder {
            color: #94A3B8;
          }

          .s-input:focus {
            border-color: #3B82F6;
            box-shadow: 0 0 0 3px rgba(59,130,246,.15);
          }

          .eye-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #64748B;
            padding: 6px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color .15s, background .15s;
          }

          .eye-btn:hover { 
            color: #374151; 
            background: rgba(0, 0, 0, 0.04); 
          }

          .login-btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #2563EB, #3B82F6);
            color: #fff;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: transform .15s, opacity .15s, box-shadow .2s;
            letter-spacing: .02em;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.2);
          }

          .login-btn:hover { 
            background: linear-gradient(135deg, #1D4ED8, #2563EB);
            opacity: .95; 
            transform: translateY(-1px); 
            box-shadow: 0 6px 18px rgba(29, 78, 216, 0.3); 
          }

          .login-btn:active { transform: scale(.98); }
          .login-btn:disabled { opacity: .5; cursor: not-allowed; }

          .glow {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            pointer-events: none;
          }

          .feature-card {
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            transition: all 0.2s;
            cursor: default;
          }

          .feature-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.06);
            border-color: #BFDBFE;
          }

          .testimonial-card {
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 16px;
            padding: 24px 28px;
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
            text-align: center;
          }

          .footer-link {
            color: #94A3B8;
            text-decoration: none;
            font-size: 13px;
            transition: color 0.2s;
          }

          .footer-link:hover {
            color: #3B82F6;
          }

          .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 16px;
          }

          .footer-links-container {
            display: flex;
            justify-content: center;
            gap: 24px;
            flex-wrap: wrap;
            margin-bottom: 16px;
          }

          /* === TABLET MEDIA QUERIES (<= 768px) === */
          @media (max-width: 768px) {
            .main-container {
              padding: 1.5rem 1rem !important;
            }

            .hero-heading {
              font-size: 28px !important;
              line-height: 1.25 !important;
            }

            .login-card-inner {
              padding: 1.75rem !important;
            }

            .feature-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          /* === MOBILE MEDIA QUERIES (<= 480px) === */
          @media (max-width: 480px) {
            .main-container {
              padding: 1rem 0.8rem !important;
            }

            .hero-heading {
              font-size: 24px !important;
              line-height: 1.3 !important;
            }

            .login-card-inner {
              padding: 1.5rem !important;
            }

            .testimonial-card {
              padding: 18px !important;
            }

            .footer-links-container {
              gap: 12px !important;
            }

            .feature-grid {
              grid-template-columns: 1fr;
            }

            .glow {
              display: none;
            }
          }
        `}</style>

        {/* === LOGIN HERO SECTION === */}
        <div style={{
          maxWidth: "420px",
          width: "100%",
          marginBottom: "32px",
          textAlign: "center",
          position: "relative",
          boxSizing: "border-box",
          paddingLeft: "1rem",
          paddingRight: "1rem",
        }}>
          <span
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "#DBEAFE",
              color: "#2563EB",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            👋 Welcome Back
          </span>

          <h1
            className="hero-heading"
            style={{
              marginTop: "18px",
              fontSize: "34px",
              fontWeight: "700",
              color: "#0F172A",
              letterSpacing: "-0.02em",
              lineHeight: "1.2",
            }}
          >
            Continue your AI learning journey
          </h1>

          <p
            style={{
              color: "#64748B",
              marginTop: "10px",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Sign in to access Notes, PDF AI, Planner, Quiz Arena and your study progress.
          </p>
        </div>

        {/* === LOGIN CARD === */}
        <div style={{
          position: "relative",
          maxWidth: "400px",
          width: "100%",
          marginBottom: "48px",
          borderRadius: "18px",
        }}>
          {/* Outer glow container strictly clipping offset glows */}
          <div style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            borderRadius: "18px",
            pointerEvents: "none",
          }}>
            <div className="glow" style={{ width: 320, height: 320, background: "#60A5FA", opacity: 0.2, top: "-80px", left: "-60px" }} />
            <div className="glow" style={{ width: 260, height: 260, background: "#BFDBFE", opacity: 0.2, bottom: "-60px", right: "-60px" }} />
          </div>

          <div className="login-card-inner" style={{
            position: "relative",
            zIndex: 10,
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "18px",
            padding: "2rem 2rem 1.6rem",
            width: "100%",
            boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
            boxSizing: "border-box",
          }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "12px",
                background: "linear-gradient(135deg, #EAF4FF, #E0F2FE)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px", fontSize: "20px",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)",
              }}>
                <img src="/logo.png" alt="Studora AI" style={{ width: "120%", height: "120%", objectFit: "contain" }} />
              </div>
              <h1 style={{ fontSize: "18px", fontWeight: "700", color: "#1E3A8A", margin: "0 0 4px", letterSpacing: "-.01em" }}>
                STUDORA AI
              </h1>
              <p style={{ fontSize: "12px", color: "#64748B", margin: 0 }}>
                Your AI Study Partner
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "#FEF2F2", border: "1px solid #FEE2E2",
                color: "#EF4444", padding: "9px 13px", borderRadius: "9px",
                fontSize: "12px", marginBottom: "14px", fontWeight: "500"
              }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>
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
                  <label style={{ fontSize: "12px", fontWeight: "500", color: "#374151" }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: "11px", color: "#2563EB", textDecoration: "none", fontWeight: "500" }}>
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
                    )}
                  </button>
                </div>
              </div>

              <button className="login-btn" type="submit" disabled={loading} style={{ marginTop: "14px" }}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: "12px", color: "#64748B", marginTop: "16px", marginBottom: 0 }}>
              No account?{" "}
              <Link to="/signup" style={{ color: "#2563EB", fontWeight: "600", textDecoration: "none" }}>
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* === TRUST SECTION === */}
        <div style={{
          maxWidth: "600px",
          width: "100%",
          marginBottom: "48px",
          textAlign: "center",
          padding: "16px 0",
          borderTop: "1px solid #E5E7EB",
          borderBottom: "1px solid #E5E7EB",
          boxSizing: "border-box",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: "24px" }}>⭐</span>
            <span style={{ fontWeight: "600", color: "#0F172A", fontSize: "15px" }}>
              4.9/5
            </span>
            <span style={{ color: "#64748B", fontSize: "14px" }}>
              Trusted by <strong style={{ color: "#0F172A" }}>10,000+</strong> Students
            </span>
          </div>
        </div>

        {/* === FEATURE CARDS === */}
        <div style={{
          maxWidth: "900px",
          width: "100%",
          marginBottom: "48px",
          textAlign: "center",
          boxSizing: "border-box",
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#0F172A",
            marginBottom: "8px",
          }}>
            Why Studora AI
          </h2>
          <p style={{
            color: "#64748B",
            fontSize: "14px",
            marginBottom: "24px",
          }}>
            Everything you need to study smarter
          </p>

          <div className="feature-grid">
            <div className="feature-card">
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>📄</div>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#0F172A", margin: "0 0 4px" }}>AI Notes</h3>
              <p style={{ fontSize: "12px", color: "#64748B", margin: 0, lineHeight: "1.4" }}>Smart note generation</p>
            </div>

            <div className="feature-card">
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🤖</div>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#0F172A", margin: "0 0 4px" }}>AI Tutor</h3>
              <p style={{ fontSize: "12px", color: "#64748B", margin: 0, lineHeight: "1.4" }}>Personalized help</p>
            </div>

            <div className="feature-card">
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>📅</div>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#0F172A", margin: "0 0 4px" }}>Planner</h3>
              <p style={{ fontSize: "12px", color: "#64748B", margin: 0, lineHeight: "1.4" }}>Study schedule</p>
            </div>

            <div className="feature-card">
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎮</div>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#0F172A", margin: "0 0 4px" }}>Quiz Arena</h3>
              <p style={{ fontSize: "12px", color: "#64748B", margin: 0, lineHeight: "1.4" }}>Test your knowledge</p>
            </div>
          </div>
        </div>

        {/* === TESTIMONIAL === */}
        <div style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginBottom: "48px",
          boxSizing: "border-box",
        }}>
          <div className="testimonial-card">
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>💬</div>
            <p style={{
              fontSize: "16px",
              color: "#1F2937",
              lineHeight: "1.6",
              marginBottom: "12px",
              fontStyle: "italic",
            }}>
              "Studora AI helped me organize my studies and improve my grades significantly. The AI tutor is a game-changer!"
            </p>
            <div>
              <p style={{ fontWeight: "600", color: "#0F172A", margin: 0, fontSize: "14px" }}>— Alex Johnson</p>
              <p style={{ color: "#94A3B8", fontSize: "12px", margin: "4px 0 0" }}>Computer Science Student</p>
            </div>
          </div>
        </div>

        {/* === FOOTER === */}
        <div style={{
          width: "100%",
          maxWidth: "1000px",
          borderTop: "1px solid #E5E7EB",
          paddingTop: "24px",
          paddingBottom: "16px",
          textAlign: "center",
          boxSizing: "border-box",
        }}>
          <div className="footer-links-container">
            <Link to="/about" className="footer-link">About</Link>
            <Link to="/privacy" className="footer-link">Privacy</Link>
            <Link to="/terms" className="footer-link">Terms</Link>
            <Link to="/support" className="footer-link">Support</Link>
          </div>
          <p style={{
            color: "#94A3B8",
            fontSize: "12px",
            margin: 0,
          }}>
            © 2026 Studora AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;