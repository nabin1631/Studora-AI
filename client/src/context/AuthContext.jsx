import { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Tracks the initial storage sync

  // Sync auth state on mount/refresh
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Failed to parse user session storage:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false); // Auth status verified, lift loading gates
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const signup = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("pendingEmail", res.data.user.email);
    return res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post("/auth/verify-otp", { email, otp });
    localStorage.removeItem("pendingEmail");
    
    // Process full authentication validation status
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (savedUser) {
      savedUser.verified = true;
      localStorage.setItem("user", JSON.stringify(savedUser));
      setUser(savedUser);
    }
    return res.data;
  };

  const resendOtp = async (email) => {
    const res = await api.post("/auth/resend-otp", { email });
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  };

  const resetPassword = async (token, password) => {
    const res = await api.post("/auth/reset-password", { token, password });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        setUser,
        loading, 
        login, 
        signup, 
        logout, 
        verifyOtp, 
        resendOtp, 
        forgotPassword, 
        resetPassword 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);