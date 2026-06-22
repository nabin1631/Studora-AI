
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { GuestProvider } from "./context/GuestContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
import GuestDashboard from "./pages/GuestDashboard";
import Settings from "./pages/Settings";
import Notes from "./pages/Notes";
import Planner from "./pages/Planner";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider>
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

              {/* Catch all - go to landing */}
              <Route path="*" element={<Navigate to="/" />} />

            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </GuestProvider>
    </ThemeProvider>
  );
}

export default App;

