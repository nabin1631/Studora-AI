import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: 9999,
      background: "rgba(239, 68, 68, 0.95)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: "1px solid rgba(239, 68, 68, 0.2)",
      borderRadius: "12px",
      padding: "14px 20px",
      minWidth: "280px",
      maxWidth: "420px",
      boxShadow: "0 10px 40px rgba(239, 68, 68, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      animation: "slideIn 0.3s ease-out",
      color: "#fff",
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      
      <div style={{
        flexShrink: 0,
        width: "20px",
        height: "20px",
        background: "rgba(255, 255, 255, 0.2)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "700",
      }}>
        ✕
      </div>
      
      <div style={{
        flex: 1,
        fontSize: "13px",
        fontWeight: "500",
        lineHeight: "1.4",
      }}>
        {message}
      </div>
      
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255, 255, 255, 0.7)",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          transition: "color 0.15s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => e.target.style.color = "#fff"}
        onMouseLeave={(e) => e.target.style.color = "rgba(255, 255, 255, 0.7)"}
      >
        ×
      </button>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: "1px solid rgba(59, 130, 246, 0.08)",
      borderRadius: "14px",
      padding: "20px 16px",
      transition: "transform 0.25s, box-shadow 0.25s",
      cursor: "default",
      textAlign: "center",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-6px)";
      e.currentTarget.style.boxShadow = "0 12px 32px rgba(15, 23, 42, 0.08)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}>
      <div style={{
        fontSize: "28px",
        marginBottom: "10px",
        display: "block",
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: "14px",
        fontWeight: "600",
        color: "#0F172A",
        margin: "0 0 4px 0",
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: "12px",
        color: "#64748B",
        margin: 0,
        lineHeight: "1.4",
      }}>
        {description}
      </p>
    </div>
  );
}

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        background: "rgba(241, 245, 249, 0.6)",
        color: "#64748B",
        transition: "all 0.2s",
        textDecoration: "none",
        fontSize: "16px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#3B82F6";
        e.currentTarget.style.color = "#fff";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(241, 245, 249, 0.6)";
        e.currentTarget.style.color = "#64748B";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
    </a>
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
  const [toastMessage, setToastMessage] = useState("");
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
  const strengthColor = ["#ef4444", "#f97316", "#d97706", "#16a34a"][strength - 1] || "transparent";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setToastMessage("");

    if (password !== confirmPassword) {
      const msg = "Passwords do not match";
      setError(msg);
      setToastMessage(msg);
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      const msg = "Password must be at least 8 characters with a letter, a number, and a symbol";
      setError(msg);
      setToastMessage(msg);
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/verify-otp");
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed";
      setError(msg);
      setToastMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100dvh",
      width: "100%",
      overflowY: "auto",
      overflowX: "hidden",
      WebkitOverflowScrolling: "touch",
      background: "radial-gradient(circle at 10% 10%,#BFDBFE 0%,transparent 30%), radial-gradient(circle at 90% 20%,#DDD6FE 0%,transparent 30%), radial-gradient(circle at 50% 90%,#CFFAFE 0%,transparent 35%), #F8FAFC",
      fontFamily: "sans-serif",
      boxSizing: "border-box",
    }}>
      <style>{`
        .s-input {
          width: 100%;
          padding: 8px 12px;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 9px;
          color: #0F172A;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          transition: border-color .2s, box-shadow .2s;
        }
        .s-input::placeholder { color: #94A3B8; }
        .s-input:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .s-input-error {
          border-color: #EF4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
        .eye-btn {
          background: none; border: none; cursor: pointer;
          color: #94A3B8; padding: 6px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          transition: color .15s, background .15s;
        }
        .eye-btn:hover { color: #64748B; background: rgba(15, 23, 42, 0.04); }
        .signup-btn {
          width: 100%; padding: 11px;
          background: linear-gradient(135deg, #2563EB, #3B82F6);
          color: #fff; border: none; border-radius: 10px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: transform .15s, opacity .15s, box-shadow .2s;
          letter-spacing: .02em;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.2);
          margin-top: 4px;
        }
        .signup-btn:hover { opacity: .95; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(37, 99, 235, 0.25); }
        .signup-btn:active { transform: scale(.98); }
        .signup-btn:disabled { opacity: .5; cursor: not-allowed; }
       
        .signin-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: #2563EB;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .signin-link:hover {
          color: #1D4ED8;
        }
        .signin-link svg {
          transition: transform 0.2s ease;
        }
        .signin-link:hover svg {
          transform: translateX(3px);
        }

        .footer-link {
          color: #64748B;
          text-decoration: none;
          font-size: 13px;
          transition: color 0.15s ease;
          line-height: 2;
        }
        .footer-link:hover {
          color: #3B82F6;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 40px;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 32px;
          }
        }

        @media (max-width: 768px) {
          .feature-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
        }

        @media (max-width: 480px) {
          .feature-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      {/* Main Content */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "48px 24px 80px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "48px",
      }}>

        {/* Signup Card */}
        <div style={{
          width: "100%",
          maxWidth: "400px",
        }}>
          <div className="auth-card-content" style={{
            position: "relative",
            background: "rgba(255, 255, 255, 0.88)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(59, 130, 246, 0.15)",
            borderRadius: "18px",
            padding: "1.5rem 2rem 2rem",
            width: "100%",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04), 0 40px 80px rgba(15, 23, 42, 0.06), 0 0 20px rgba(59, 130, 246, 0.05)",
            boxSizing: "border-box",
          }}>

            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "11px",
                background: "linear-gradient(135deg, #F1F5F9, #E2E8F0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 8px", fontSize: "18px",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
              }}>
                <img src="/logo.png" alt="Studora AI" style={{ width: "115%", height: "115%", objectFit: "contain" }} />
              </div>
              <h1 style={{ fontSize: "17px", fontWeight: "700", color: "#0F172A", margin: "0 0 2px" }}>
                Create your account
              </h1>
              <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>
                Start your AI study journey
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "7px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Name
                </label>
                <input 
                  className="s-input" 
                  type="text" 
                  placeholder="Your full name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ marginBottom: "7px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
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

              <div style={{ marginBottom: "7px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className={`s-input ${error && !password ? "s-input-error" : ""}`}
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
                  <div style={{ marginTop: "5px" }}>
                    <div style={{ display: "flex", gap: "3px", marginBottom: "4px" }}>
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} style={{
                          flex: 1, height: "3px", borderRadius: "2px",
                          background: strength >= level ? strengthColor : "#E2E8F0",
                          transition: "background .3s",
                        }} />
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {checks.map((c, i) => (
                        <span key={i} style={{ fontSize: "10px", fontWeight: "500", color: c.test.test(password) ? "#16A34A" : "#94A3B8" }}>
                          {c.test.test(password) ? "✓" : "○"} {c.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#334155", marginBottom: "4px" }}>
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className={`s-input ${error && confirmPassword ? "s-input-error" : ""}`}
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

              <p style={{ textAlign: "center", fontSize: "12px", color: "#64748B", marginTop: "14px", marginBottom: 0 }}>
                Already have an account?{" "}
                <Link to="/login" className="signin-link">
                  Sign in
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Trust Section */}
        <div style={{
          width: "100%",
          maxWidth: "600px",
          textAlign: "center",
          padding: "0.5rem 0",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "8px",
          }}>
            <span style={{ fontSize: "20px", letterSpacing: "2px" }}>★★★★★</span>
            <span style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#0F172A",
            }}>4.9/5</span>
          </div>
          <p style={{
            fontSize: "14px",
            color: "#64748B",
            margin: 0,
            fontWeight: "500",
          }}>
            Trusted by students worldwide · AI-powered learning for every subject
          </p>
        </div>

        {/* Why Studora AI Section */}
        <div style={{
          width: "100%",
          maxWidth: "900px",
          textAlign: "center",
        }}>
          <h2 style={{
            fontSize: "22px",
            fontWeight: "700",
            color: "#0F172A",
            marginBottom: "8px",
          }}>
            Why Studora AI?
          </h2>
          <p style={{
            fontSize: "14px",
            color: "#64748B",
            marginBottom: "24px",
          }}>
            Everything you need to study smarter, all in one place
          </p>
          
          <div className="feature-grid">
            <FeatureCard 
              icon="📝"
              title="AI Notes"
              description="Summarize and organize your notes instantly"
            />
            <FeatureCard 
              icon="📄"
              title="PDF AI"
              description="Chat with PDFs and get instant answers"
            />
            <FeatureCard 
              icon="🎮"
              title="Quiz Arena"
              description="Practice with AI-generated quizzes"
            />
            <FeatureCard 
              icon="📅"
              title="Study Planner"
              description="Plan smarter and stay on track"
            />
          </div>
        </div>

        {/* Testimonial */}
        <div style={{
          width: "100%",
          maxWidth: "600px",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(59, 130, 246, 0.08)",
          borderRadius: "18px",
          padding: "28px 36px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "18px", letterSpacing: "2px", marginBottom: "10px" }}>★★★★★</div>
          <blockquote style={{
            fontSize: "17px",
            color: "#0F172A",
            fontWeight: "500",
            margin: "0 0 10px 0",
            lineHeight: "1.6",
          }}>
            "Studora AI helped me reduce my study time by half."
          </blockquote>
          <cite style={{
            fontSize: "13px",
            color: "#64748B",
            fontStyle: "normal",
          }}>
            — Computer Science Student
          </cite>
        </div>

        {/* CTA Section */}
        <div style={{
          width: "100%",
          maxWidth: "700px",
          background: "linear-gradient(135deg, #2563EB, #3B82F6)",
          borderRadius: "20px",
          padding: "48px 40px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(37, 99, 235, 0.2)",
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#fff",
            margin: "0 0 8px 0",
          }}>
            Ready to study smarter?
          </h2>
          <p style={{
            fontSize: "15px",
            color: "rgba(255,255,255,0.85)",
            marginBottom: "24px",
            maxWidth: "400px",
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            Join thousands of students already using Studora AI.
          </p>
          <Link to="/signup" style={{
            display: "inline-block",
            padding: "12px 32px",
            background: "#fff",
            color: "#2563EB",
            fontWeight: "600",
            fontSize: "15px",
            borderRadius: "10px",
            textDecoration: "none",
            transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
          }}>
            Create Free Account →
          </Link>
        </div>

        {/* Footer */}
        <footer style={{
          width: "100%",
          maxWidth: "1100px",
          background: "#FFFFFF",
          borderRadius: "24px",
          padding: "48px 48px 32px",
          marginTop: "40px",
          border: "1px solid rgba(226, 232, 240, 0.6)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
        }}>
          <div className="footer-grid">
            {/* Brand */}
            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}>
                <img src="/logo.png" alt="Studora AI" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
                <span style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#0F172A",
                }}>Studora AI</span>
              </div>
              <p style={{
                fontSize: "13px",
                color: "#64748B",
                margin: "0 0 16px 0",
                lineHeight: "1.6",
                maxWidth: "280px",
              }}>
                AI-powered learning platform helping students study faster with notes, quizzes, PDF AI, flashcards and smart planning.
              </p>
              <div style={{
                display: "flex",
                gap: "8px",
              }}>
                <SocialIcon href="#" label="GitHub">🐙</SocialIcon>
                <SocialIcon href="#" label="LinkedIn">🔗</SocialIcon>
                <SocialIcon href="#" label="Discord">💬</SocialIcon>
                <SocialIcon href="#" label="Twitter">🐦</SocialIcon>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#0F172A",
                margin: "0 0 12px 0",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>Product</h4>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <a href="#" className="footer-link">AI Notes</a>
                <a href="#" className="footer-link">PDF AI</a>
                <a href="#" className="footer-link">Flashcards</a>
                <a href="#" className="footer-link">Quiz Arena</a>
                <a href="#" className="footer-link">Planner</a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#0F172A",
                margin: "0 0 12px 0",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>Company</h4>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <a href="#" className="footer-link">About</a>
                <a href="#" className="footer-link">Blog</a>
                <a href="#" className="footer-link">Careers</a>
                <a href="#" className="footer-link">Contact</a>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#0F172A",
                margin: "0 0 12px 0",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>Resources</h4>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <a href="#" className="footer-link">Documentation</a>
                <a href="#" className="footer-link">FAQ</a>
                <a href="#" className="footer-link">Feedback</a>
                <a href="#" className="footer-link">Community</a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#0F172A",
                margin: "0 0 12px 0",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>Legal</h4>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <a href="#" className="footer-link">Privacy</a>
                <a href="#" className="footer-link">Terms</a>
                <a href="#" className="footer-link">Cookies</a>
                <a href="#" className="footer-link">Security</a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            borderTop: "1px solid #E2E8F0",
            marginTop: "32px",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}>
            <p style={{
              fontSize: "12px",
              color: "#94A3B8",
              margin: 0,
            }}>
              © 2026 Studora AI. All rights reserved. Made for students worldwide.
            </p>
            <div style={{
              display: "flex",
              gap: "16px",
            }}>
              <a href="#" className="footer-link" style={{ fontSize: "11px" }}>GitHub</a>
              <a href="#" className="footer-link" style={{ fontSize: "11px" }}>LinkedIn</a>
              <a href="#" className="footer-link" style={{ fontSize: "11px" }}>Discord</a>
              <a href="#" className="footer-link" style={{ fontSize: "11px" }}>X</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Signup;