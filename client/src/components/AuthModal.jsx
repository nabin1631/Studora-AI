import { useNavigate } from "react-router-dom";

import { useGuest } from "../context/GuestContext";

import { useTheme } from "../context/ThemeContext";



function AuthModal() {

  const { showAuthModal, closeAuthModal } = useGuest();

  const { colors: c } = useTheme();

  const navigate = useNavigate();



  if (!showAuthModal) return null;



  const handleSignup = () => {

    closeAuthModal();

    navigate("/signup");

  };



  const handleLogin = () => {

    closeAuthModal();

    navigate("/login");

  };



  return (

    <>

      {/* Overlay */}

      <div

        onClick={closeAuthModal}

        style={{

          position: "fixed", inset: 0,

          background: "rgba(0,0,0,0.5)",

          zIndex: 200,

          animation: "fadeIn .2s ease",

        }}

      />



      {/* Modal */}

      <div style={{

        position: "fixed",

        top: "50%", left: "50%",

        transform: "translate(-50%, -50%)",

        zIndex: 201,

        background: c.bgCard,

        border: `1px solid ${c.border}`,

        borderRadius: "20px",

        padding: "2rem",

        width: "100%", maxWidth: "380px",

        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",

        animation: "slideUp .25s cubic-bezier(.16,1,.3,1)",

        boxSizing: "border-box",

      }}>

        <style>{`

          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

          @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -40%); } to { opacity: 1; transform: translate(-50%, -50%); } }

          .auth-modal-btn {

            width: 100%; padding: 12px; border-radius: 10px; font-size: 14px;

            font-weight: 600; cursor: pointer; transition: all .15s;

          }

          .auth-modal-btn:hover { transform: translateY(-1px); opacity: .92; }

        `}</style>



        {/* Icon */}

        <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>

          <div style={{

            width: 52, height: 52, borderRadius: "14px",

            background: `linear-gradient(135deg, ${c.accent}, #33C9E8)`,

            display: "flex", alignItems: "center", justifyContent: "center",

            margin: "0 auto 12px", fontSize: "22px",

            boxShadow: `0 8px 24px ${c.accent}44`,

          }}>

            🔐

          </div>

          <h2 style={{ color: c.text, fontSize: "18px", fontWeight: "700", margin: "0 0 6px" }}>

            Sign up to unlock this

          </h2>

          <p style={{ color: c.textMuted, fontSize: "13px", margin: 0, lineHeight: "1.5" }}>

            Create a free account to access Notes, AI Tutor, Planner, Quiz Arena and more.

          </p>

        </div>



        {/* Feature highlights */}

        <div style={{

          background: c.bg, border: `1px solid ${c.border}`, borderRadius: "12px",

          padding: "12px 14px", marginBottom: "16px",

        }}>

          {[

            { icon: "📝", text: "Smart Notes with rich text editor" },

            { icon: "🤖", text: "AI Tutor — ask anything" },

            { icon: "📅", text: "Study Planner to stay on track" },

            { icon: "🎮", text: "Quiz Arena for gamified learning" },

          ].map((f, i) => (

            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0" }}>

              <span style={{ fontSize: "16px" }}>{f.icon}</span>

              <span style={{ fontSize: "12px", color: c.textSecondary }}>{f.text}</span>

            </div>

          ))}

        </div>



        {/* Buttons */}

        <button

          className="auth-modal-btn"

          onClick={handleSignup}

          style={{

            background: `linear-gradient(135deg, ${c.accent}, #5B4FE0)`,

            color: "#fff", border: "none", marginBottom: "8px",

          }}

        >

          🚀 Create free account

        </button>



        <button

          className="auth-modal-btn"

          onClick={handleLogin}

          style={{

            background: c.bg, color: c.text,

            border: `1px solid ${c.border}`, marginBottom: "8px",

          }}

        >

          Login to my account

        </button>



        <button

          onClick={closeAuthModal}

          style={{

            width: "100%", padding: "10px", background: "none", border: "none",

            color: c.textMuted, fontSize: "13px", cursor: "pointer",

          }}

        >

          Maybe later — just browsing

        </button>

      </div>

    </>

  );

}



export default AuthModal; 

