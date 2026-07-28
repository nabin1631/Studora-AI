import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { GuestProvider } from "./context/GuestContext";

import CursorParticles from "./components/CursorParticles";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
import GuestDashboard from "./pages/GuestDashboard";
import Settings from "./pages/Settings";
import Notes from "./pages/Notes";
import Planner from "./pages/Planner";
import Analytics from "./pages/Analytics"; 
import AiTutor from "./pages/AiTutor"; 
import PdfAI from "./pages/PdfAI"; 
import QuizArena from "./pages/QuizArena"; // Added QuizArena import
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// UPDATED: Now checks 'loading' state so it waits for localStorage to sync
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // Show a blank view or simple loading screen while verifying token to prevent flash redirection
  if (loading) {
    return (
      <div style={{
        height: "100vh",
        background: "#0B0F19",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#F1F3F9",
        fontFamily: "sans-serif"
      }}>
        Initializing session...
      </div>
    );
  }

  return user ? children : <Navigate to="/" />;
}

// UPDATED: Also safely checks 'loading' state before executing the redirect fallback logic
function SmartRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) return null; 

  return <Navigate to={user ? "/dashboard" : "/"} />;
}

function App() {
  return (
    <ThemeProvider>
      <CursorParticles />
      <GuestProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>

              {/* Public landing dashboard - shown to everyone */}
              <Route path="/" element={<GuestDashboard />} />

              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes - logged in users only */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />

              <Route
                path="/notes"
                element={
                  <PrivateRoute>
                    <Notes />
                  </PrivateRoute>
                }
              />

              <Route
                path="/planner"
                element={
                  <PrivateRoute>
                    <Planner />
                  </PrivateRoute>
                }
              />

              {/* Added Protected Analytics route */}
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <Analytics />
                  </PrivateRoute>
                }
              />

              {/* Added Protected AI Tutor route */}
              <Route
                path="/ai-tutor"
                element={
                  <PrivateRoute>
                    <AiTutor />
                  </PrivateRoute>
                }
              />

              {/* Added Protected PDF AI route */}
              <Route
                path="/pdf-ai"
                element={
                  <PrivateRoute>
                    <PdfAI />
                  </PrivateRoute>
                }
              />

              {/* Added Protected Quiz Arena route */}
              <Route
                path="/quiz-arena"
                element={
                  <PrivateRoute>
                    <QuizArena />
                  </PrivateRoute>
                }
              />

              {/* Catch all - go to landing */}
              <Route path="*" element={<SmartRedirect />} />

            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </GuestProvider>
    </ThemeProvider>
  );
}

export default App;