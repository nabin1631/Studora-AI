import { createContext, useState, useContext, useLayoutEffect, useCallback, useMemo, useId } from "react";
import { flushSync } from "react-dom";

/* =========================================================
   THEME CONTEXT + ANIMATED THEME TOGGLE  (single file)
   - ThemeProvider : state, persistence, animated switching
   - useTheme      : { mode, setMode, toggleTheme, colors }
   - ThemeToggle   : sun/moon button (import from this file)
   All CSS is injected from this file, no .css files needed.
========================================================= */

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

/* ---------------------------------------------------------
   Injected styles: theme-switch animation + toggle button
--------------------------------------------------------- */
const THEME_CSS = `
/* View Transitions: JS drives the circular reveal */
::view-transition-old(root),
::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
::view-transition-old(root) { z-index: 1; }
::view-transition-new(root) { z-index: 2; }

/* Fallback (no View Transitions): smooth colour fade */
html.theme-switching,
html.theme-switching *,
html.theme-switching *::before,
html.theme-switching *::after {
  transition: background-color .45s ease, color .45s ease, border-color .45s ease,
              box-shadow .45s ease, fill .45s ease, stroke .45s ease !important;
}

/* ---------- Toggle button ---------- */
.theme-toggle {
  --tt-size: 46px;
  --tt-color: #f59e0b;
  --tt-bg: #ffffff;
  --tt-border: #e5e7eb;
  --tt-glow: rgba(245,158,11,.35);
  position: relative; display: grid; place-items: center;
  width: var(--tt-size); height: var(--tt-size); padding: 0; overflow: hidden;
  cursor: pointer; color: var(--tt-color); background: var(--tt-bg);
  border: 1px solid var(--tt-border); border-radius: 14px;
  transition: transform .3s cubic-bezier(.22,1,.36,1), border-color .3s ease,
              box-shadow .3s ease, background .4s ease, color .4s ease;
}
.theme-toggle[data-mode="dark"] {
  --tt-color: #c4b5fd; --tt-bg: #151b2b; --tt-border: #2a3350; --tt-glow: rgba(124,108,240,.45);
}
.theme-toggle:hover { transform: translateY(-2px); border-color: var(--tt-color); box-shadow: 0 10px 22px var(--tt-glow); }
.theme-toggle:active { transform: scale(.93); }
.theme-toggle:focus-visible { outline: 2px solid #7c6cf0; outline-offset: 3px; }

.tt-glow {
  position: absolute; inset: 0; opacity: 0; transform: scale(.5);
  background: radial-gradient(circle at 50% 50%, var(--tt-glow), transparent 70%);
  transition: opacity .35s ease, transform .45s cubic-bezier(.22,1,.36,1);
}
.theme-toggle:hover .tt-glow { opacity: 1; transform: scale(1.2); }

.tt-icon { position: relative; width: 24px; height: 24px; fill: currentColor; stroke: currentColor;
  transition: transform .6s cubic-bezier(.22,1,.36,1); }
.theme-toggle:hover .tt-icon { transform: rotate(25deg) scale(1.08); }

.tt-core, .tt-cut, .tt-rays {
  transform-box: fill-box; transform-origin: center;
  transition: transform .6s cubic-bezier(.22,1,.36,1), opacity .4s ease;
}
.tt-core { stroke: none; }
.tt-cut { transform: translate(20px,-20px); }

.theme-toggle[data-mode="light"] .tt-core { transform: scale(1); }
.theme-toggle[data-mode="light"] .tt-rays { transform: rotate(0) scale(1); opacity: 1; }
.theme-toggle[data-mode="dark"] .tt-core { transform: scale(1.8); }
.theme-toggle[data-mode="dark"] .tt-cut { transform: translate(5px,-5px); }
.theme-toggle[data-mode="dark"] .tt-rays { transform: rotate(90deg) scale(0); opacity: 0; }

.tt-stars i {
  position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #fff;
  opacity: 0; transform: scale(0); transition: opacity .4s ease .2s, transform .4s ease .2s;
}
.tt-stars i:nth-child(1) { top: 9px; right: 9px; }
.tt-stars i:nth-child(2) { bottom: 10px; right: 12px; width: 2px; height: 2px; }
.tt-stars i:nth-child(3) { top: 14px; left: 8px; width: 2px; height: 2px; }
.theme-toggle[data-mode="dark"] .tt-stars i { opacity: .9; transform: scale(1); animation: ttTwinkle 2.4s ease-in-out infinite; }
.theme-toggle[data-mode="dark"] .tt-stars i:nth-child(2) { animation-delay: .6s; }
.theme-toggle[data-mode="dark"] .tt-stars i:nth-child(3) { animation-delay: 1.2s; }
@keyframes ttTwinkle { 0%,100% { opacity:.9; transform:scale(1); } 50% { opacity:.25; transform:scale(.6); } }

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
  .theme-toggle, .theme-toggle * { transition-duration: .01ms !important; animation: none !important; }
}
`;

const readSavedMode = () => {
  try {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || saved === "light" ? saved : "light";
  } catch {
    return "light";
  }
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(readSavedMode);

  // Inject the CSS once
  useLayoutEffect(() => {
    if (document.getElementById("theme-context-styles")) return;
    const el = document.createElement("style");
    el.id = "theme-context-styles";
    el.textContent = THEME_CSS;
    document.head.appendChild(el);
  }, []);

  // Apply theme to <html> and persist
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = mode;
    root.style.colorScheme = mode;
    try { localStorage.setItem("theme", mode); } catch { /* storage unavailable */ }
  }, [mode]);

  const toggleTheme = useCallback((event) => {
    const next = mode === "dark" ? "light" : "dark";
    const root = document.documentElement;

    // Reveal origin = centre of the clicked button (works for keyboard too)
    const rect = event?.currentTarget?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    // Best: circular reveal via View Transitions API
    if (document.startViewTransition && !prefersReducedMotion()) {
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      const transition = document.startViewTransition(() => {
        flushSync(() => setMode(next));
      });
      transition.ready
        .then(() => {
          root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
          );
        })
        .catch(() => {});
      return;
    }

    // Fallback: smooth colour fade
    if (!prefersReducedMotion()) {
      root.classList.add("theme-switching");
      window.setTimeout(() => root.classList.remove("theme-switching"), 450);
    }
    setMode(next);
  }, [mode]);

  const colors = themes[mode];
  const value = useMemo(() => ({ mode, setMode, toggleTheme, colors }), [mode, toggleTheme, colors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/* ---------------------------------------------------------
   Animated sun/moon toggle button
   usage: import { ThemeToggle } from "../context/ThemeContext";
--------------------------------------------------------- */
export function ThemeToggle({ className = "" }) {
  const { mode, toggleTheme } = useContext(ThemeContext);
  const isDark = mode === "dark";
  const maskId = useId();

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      data-mode={mode}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span className="tt-glow" aria-hidden="true" />
      <svg className="tt-icon" viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="24" height="24" fill="#fff" />
            <circle className="tt-cut" cx="12" cy="12" r="8" fill="#000" />
          </mask>
        </defs>
        <circle className="tt-core" cx="12" cy="12" r="5" mask={`url(#${maskId})`} />
        <g className="tt-rays" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="1.5" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22.5" />
          <line x1="1.5" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22.5" y2="12" />
          <line x1="4.6" y1="4.6" x2="6.4" y2="6.4" />
          <line x1="17.6" y1="17.6" x2="19.4" y2="19.4" />
          <line x1="4.6" y1="19.4" x2="6.4" y2="17.6" />
          <line x1="17.6" y1="6.4" x2="19.4" y2="4.6" />
        </g>
      </svg>
      <span className="tt-stars" aria-hidden="true"><i /><i /><i /></span>
    </button>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);