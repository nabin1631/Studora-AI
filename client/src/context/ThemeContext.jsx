import { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

const themes = {
  dark: {
    bg: "#0B0F19",
    bgSecondary: "#0F1422",
    bgCard: "#151B2B",
    border: "#232B3D",
    borderSubtle: "#1A2030",
    text: "#F1F3F9",
    textSecondary: "#A5ADC2",
    textMuted: "#7B8499",
    textFaint: "#5B6478",
    accent: "#7C6CF0",
    accentSecondary: "#33C9E8",
    hover: "rgba(255,255,255,0.06)",
    activeNav: "rgba(124,108,240,0.15)",
  },
  light: {
    bg: "#F7F8FA",
    bgSecondary: "#FFFFFF",
    bgCard: "#FFFFFF",
    border: "#E5E7EB",
    borderSubtle: "#EEF0F3",
    text: "#1A1D29",
    textSecondary: "#4B5163",
    textMuted: "#6B7280",
    textFaint: "#9CA3AF",
    accent: "#7C6CF0",
    accentSecondary: "#0EA5C4",
    hover: "rgba(0,0,0,0.04)",
    activeNav: "rgba(124,108,240,0.1)",
  },
};

export const ThemeProvider = ({ children }) => {
 const [mode, setMode] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  const toggleTheme = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  const colors = themes[mode];

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);