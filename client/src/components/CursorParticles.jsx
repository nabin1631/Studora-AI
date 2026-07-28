import  { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

export default function CursorParticles() {
  const canvasRef = useRef(null);
  
  // Gracefully adapt to both common context property naming conventions ('theme' or 'mode')
  const themeContext = useTheme();
  const currentTheme = themeContext?.theme || themeContext?.mode || "dark";
  const isDark = currentTheme === "dark";

  // Persistent loop and particle tracking references
  const animationFrameId = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Premium minimal AI Palette
    const colors = ["#00F5FF", "#3B82F6", "#8B5CF6"];

    // 1. Retina / High-DPI Matrix Scaling Integration
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // 2. State & Engine Switchboard Control
    if (!isDark) {
      // Halt loop instantly, flush heap allocation, and wipe canvas raw buffer
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      particles.current = [];
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      return; // Do not attach logic hooks if initialized in light mode
    }

    // Initialize layout dimensions on theme initialization activation
    resizeCanvas();

    // 3. Spawning Matrix Factory
  // 3. Spawning Matrix Factory (Adjusted 3% larger for perfect visual balance)
const createParticle = (x, y) => {
  // Occasional isolated bright white spark (~8% chance), otherwise sample standard AI cluster colors
  const isWhiteSpark = Math.random() > 0.92;
  const color = isWhiteSpark ? "#FFFFFF" : colors[Math.floor(Math.random() * colors.length)];
  
  return {
    x,
    y,
    // Premium subtle radial dispersion velocities
    vx: (Math.random() - 0.5) * 0.9,
    vy: (Math.random() - 0.5) * 0.9 - 0.1, // Elegant drifting pull vector
    color,
    // Scaled exactly 3% larger: base range moves from (1.0 to 2.0) to (1.03 to 2.06)
    size: Math.random() * 1.04 + 1.04,
    alpha: 1,
    // Configured for clean frame exit in ~0.4 to 0.6 seconds at 60fps
    decay: Math.random() * 0.012 + 0.016,
    shrink: 0.015
  };
};

    // Track mouse coordinate positioning changes and spawn on demand
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      // Limit particle count overhead (spawns up to 2 hyper-sharp micro-sparks per movement notch)
      if (particles.current.length < 80) {
        const count = Math.random() > 0.4 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          particles.current.push(createParticle(mouse.current.x, mouse.current.y));
        }
      }
    };

    // Register active functional windows handlers safely
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    // 4. Core Frame Animation Loop Processor
    const tick = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const activeParticles = particles.current;
      
      for (let i = activeParticles.length - 1; i >= 0; i--) {
        const p = activeParticles[i];

        // Frame adjustments
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size -= p.shrink;

        // Efficient removal validation pipeline checks
        if (p.alpha <= 0 || p.size <= 0.2) {
          activeParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        
        // Soft Glow Isolation Matrix Strategy (Soft shadow blur range 8 - 12)
        ctx.shadowBlur = Math.random() * 4 + 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId.current = requestAnimationFrame(tick);
    };

    // Start engine loop execution
    animationFrameId.current = requestAnimationFrame(tick);

    // 5. Explicit Event/Memory Isolation Cleanup Mechanics
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDark]); // Dynamic dependency tracking cleanly flags toggle changes instantly

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        // Canvas stays securely mounted, utilizing styling transforms for clean mode rendering toggles
        display: isDark ? "block" : "none",
      }}
    />
  );
}