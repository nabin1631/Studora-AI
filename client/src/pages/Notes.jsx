import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";

// 👑 FIXED IMPORTS: TextStyle and FontSize are pulled directly from the text-style extension package
import { TextStyle, FontSize } from "@tiptap/extension-text-style";

import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import EditorToolbar from "../components/EditorToolbar";
import api from "../services/api";

const SUBJECTS = ["General", "CSIT Notes ", "BCA Notes ",  "BIT Notes",  "Engineering Notes", "Chemistry", "Physics", "Biology",  "Computer Science", "Other"];

// Design only: each subject gets a stable accent colour for its card
const SUBJECT_PALETTE = ["#6366F1", "#10B981", "#F59E0B", "#EC4899", "#38BDF8", "#8B5CF6", "#EF4444", "#14B8A6"];
const subjectColor = (subject = "") => {
  let h = 0;
  for (let i = 0; i < subject.length; i++) h = (h * 31 + subject.charCodeAt(i)) >>> 0;
  return SUBJECT_PALETTE[h % SUBJECT_PALETTE.length];
};

// Toast notification component
function Toast({ message, type = "error", onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let inner;
    const t = setTimeout(() => {
      setVisible(false);
      inner = setTimeout(onDone, 300);
    }, 3000);
    return () => { clearTimeout(t); clearTimeout(inner); };
  }, [onDone]);

  return (
    <div role="status" aria-live="polite" className={`nt-toast ${type === "error" ? "error" : "success"} ${visible ? "in" : "out"}`}>
      <span className="nt-toast-icon">{type === "error" ? "❌" : "✅"}</span>
      <span>{message}</span>
      <span className="nt-toast-bar" />
    </div>
  );
}

// All styles for the list, editor and reader views (design only)
const getCss = (c, readingTheme) => {
  const paperBg = readingTheme === "warm" ? "#F7F3E9" : "#FFFFFF";
  return `
  .nt-root {
    --ease: cubic-bezier(0.22, 1, 0.36, 1);
    color: var(--nt-text);
  }
  .nt-root *, .nt-root *::before, .nt-root *::after { box-sizing: border-box; }

  /* entrance keyframes define only the start state, so hover transforms keep working */
  @keyframes ntFadeUp { from { opacity: 0; transform: translateY(14px); } }
  @keyframes ntFade { from { opacity: 0; } }
  @keyframes ntPop { 0% { transform: scale(0.4); } 70% { transform: scale(1.3); } 100% { transform: scale(1); } }
  @keyframes ntShimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
  @keyframes ntFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes ntPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
  @keyframes ntToastIn { from { opacity: 0; transform: translateX(24px) scale(0.96); } }
  @keyframes ntShake { 0%,100% { translate: 0; } 25% { translate: -6px; } 75% { translate: 6px; } }
  @keyframes ntBar { from { transform: scaleX(1); } to { transform: scaleX(0); } }
  @keyframes ntGradient { to { background-position: 200% 0; } }

  /* ---------- Toast ---------- */
  .nt-toast {
    position: fixed; top: 20px; right: 20px; z-index: 1000; overflow: hidden;
    display: flex; align-items: center; gap: 10px;
    min-width: 220px; max-width: min(380px, calc(100vw - 32px));
    padding: 13px 18px; border-radius: 14px;
    color: #fff; font-size: 13px; font-weight: 600;
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.26);
    transition: opacity 0.3s ease, transform 0.35s var(--ease);
  }
  .nt-toast.success { background: linear-gradient(135deg, #22C55E, #16A34A); }
  .nt-toast.error { background: linear-gradient(135deg, #EF4444, #DC2626); }
  .nt-toast.in { animation: ntToastIn 0.4s var(--ease); }
  .nt-toast.error.in { animation: ntToastIn 0.4s var(--ease), ntShake 0.4s ease 0.35s; }
  .nt-toast.out { opacity: 0; transform: translateX(20px); }
  .nt-toast-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: rgba(255,255,255,0.55); transform-origin: left; animation: ntBar 3s linear forwards; }

  /* ---------- Buttons ---------- */
  .nt-primary {
    position: relative; overflow: hidden;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 11px 20px; border: 0; border-radius: 12px;
    color: #fff; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer;
    background: linear-gradient(135deg, var(--nt-accent), #5B4FE0);
    box-shadow: 0 6px 16px color-mix(in srgb, var(--nt-accent) 32%, transparent);
    transition: transform 0.3s var(--ease), box-shadow 0.3s ease, opacity 0.2s ease;
  }
  .nt-primary::after {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%);
    transform: translateX(-120%); transition: transform 0.6s var(--ease);
  }
  .nt-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px color-mix(in srgb, var(--nt-accent) 42%, transparent); }
  .nt-primary:hover:not(:disabled)::after { transform: translateX(120%); }
  .nt-primary:active:not(:disabled) { transform: scale(0.96); }
  .nt-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .nt-primary:focus-visible, .nt-btn:focus-visible, .nt-icon-btn:focus-visible, .nt-back:focus-visible,
  .nt-star:focus-visible, .nt-reader-btn:focus-visible, .nt-reader-primary:focus-visible { outline: 2px solid var(--nt-accent); outline-offset: 2px; }

  /* card action buttons: colour fills up from the bottom on hover */
  .nt-btn {
    --bc: var(--nt-accent);
    position: relative; isolation: isolate; overflow: hidden;
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
    padding: 8px 10px; border-radius: 10px;
    font: inherit; font-size: 12px; font-weight: 600; cursor: pointer;
    color: var(--bc);
    background: color-mix(in srgb, var(--bc) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--bc) 28%, transparent);
    transition: color 0.3s ease, transform 0.3s var(--ease), box-shadow 0.3s ease, border-color 0.3s ease;
  }
  .nt-btn::before {
    content: ""; position: absolute; inset: 0; z-index: -1;
    background: var(--bc);
    transform: scaleY(0); transform-origin: bottom;
    transition: transform 0.35s var(--ease);
  }
  .nt-btn:hover { color: #fff; border-color: var(--bc); transform: translateY(-2px); box-shadow: 0 8px 18px color-mix(in srgb, var(--bc) 35%, transparent); }
  .nt-btn:hover::before { transform: scaleY(1); }
  .nt-btn:active { transform: scale(0.96); }

  .nt-icon-btn {
    --bc: var(--nt-muted);
    min-width: 44px; min-height: 44px; display: grid; place-items: center;
    border: 0; border-radius: 14px; background: transparent; cursor: pointer;
    font-size: 19px; color: var(--bc);
    transition: transform 0.3s var(--ease), background 0.25s ease, box-shadow 0.3s ease;
  }
  .nt-icon-btn:hover { transform: translateY(-2px) scale(1.08); background: color-mix(in srgb, var(--bc) 14%, transparent); box-shadow: 0 8px 18px color-mix(in srgb, var(--bc) 22%, transparent); }
  .nt-icon-btn:active { transform: scale(0.92); }

  .nt-back {
    display: inline-flex; align-items: center; gap: 8px; min-height: 44px;
    padding: 0 16px 0 12px; border: 1px solid transparent; border-radius: 12px;
    background: transparent; color: var(--nt-muted); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer;
    transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease, transform 0.3s var(--ease);
  }
  .nt-back .arrow { display: inline-block; transition: transform 0.35s var(--ease); }
  .nt-back:hover { color: var(--nt-accent); background: color-mix(in srgb, var(--nt-accent) 8%, transparent); border-color: color-mix(in srgb, var(--nt-accent) 25%, transparent); }
  .nt-back:hover .arrow { transform: translateX(-5px); }
  .nt-back:active { transform: scale(0.96); }

  /* ================= LIST VIEW ================= */
  .nt-page { max-width: 1100px; margin: 0 auto; }

  .nt-header {
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 12px; margin-bottom: 24px;
    animation: ntFadeUp 0.5s var(--ease) backwards;
  }
  .nt-header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; color: var(--nt-text); }
  .nt-header p { display: none; }

  .nt-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .nt-stat {
    --sc: var(--nt-accent);
    position: relative; overflow: hidden; cursor: default;
    display: flex; align-items: center; gap: 16px; padding: 18px 20px;
    background: var(--nt-card); border: 1px solid var(--nt-border); border-radius: 16px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    animation: ntFadeUp 0.5s var(--ease) backwards;
    animation-delay: calc(var(--i, 0) * 70ms + 80ms);
    transition: transform 0.35s var(--ease), border-color 0.3s ease, box-shadow 0.35s ease;
  }
  .nt-stat::before {
    content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px;
    background: linear-gradient(90deg, var(--sc), transparent);
    transform: scaleX(0); transform-origin: left; transition: transform 0.5s var(--ease);
  }
  .nt-stat::after {
    content: ""; position: absolute; right: -40px; bottom: -50px; width: 130px; height: 130px; border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--sc) 20%, transparent), transparent 70%);
    transition: transform 0.5s var(--ease); pointer-events: none;
  }
  .nt-stat:hover { transform: translateY(-5px); border-color: color-mix(in srgb, var(--sc) 55%, var(--nt-border)); box-shadow: 0 14px 30px color-mix(in srgb, var(--sc) 20%, transparent); }
  .nt-stat:hover::before { transform: scaleX(1); }
  .nt-stat:hover::after { transform: scale(1.6); }
  .nt-stat > * { position: relative; z-index: 1; }
  .nt-stat .icon {
    width: 46px; height: 46px; flex-shrink: 0; display: grid; place-items: center;
    font-size: 22px; border-radius: 13px;
    background: color-mix(in srgb, var(--sc) 14%, transparent);
    transition: transform 0.45s var(--ease), background 0.3s ease, box-shadow 0.3s ease;
  }
  .nt-stat:hover .icon { transform: scale(1.12) rotate(-8deg); background: color-mix(in srgb, var(--sc) 26%, transparent); box-shadow: 0 6px 14px color-mix(in srgb, var(--sc) 28%, transparent); }
  .nt-stat h2 { margin: 0 0 2px; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: var(--nt-text); transition: color 0.25s ease; font-variant-numeric: tabular-nums; }
  .nt-stat:hover h2 { color: var(--sc); }
  .nt-stat span { font-size: 12px; font-weight: 500; color: var(--nt-muted); }

  .nt-search-wrap {
    position: relative; margin-bottom: 22px;
    animation: ntFadeUp 0.5s var(--ease) backwards; animation-delay: 0.3s;
  }
  .nt-search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: 14px; pointer-events: none; opacity: 0.7;
    transition: transform 0.35s var(--ease), opacity 0.25s ease;
  }
  .nt-search-wrap:focus-within .nt-search-icon { transform: translateY(-50%) scale(1.2) rotate(-12deg); opacity: 1; }
  .nt-search {
    width: 100%; max-width: 320px; padding: 11px 14px 11px 40px;
    color: var(--nt-text); font: inherit; font-size: 13px; outline: none;
    background: var(--nt-card); border: 1px solid var(--nt-border); border-radius: 12px;
    transition: max-width 0.45s var(--ease), border-color 0.25s ease, box-shadow 0.25s ease;
  }
  .nt-search::placeholder { color: var(--nt-faint); }
  .nt-search:hover { border-color: color-mix(in srgb, var(--nt-accent) 45%, var(--nt-border)); }
  .nt-search:focus { max-width: 440px; border-color: var(--nt-accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--nt-accent) 15%, transparent); }

  .nt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

  .nt-card {
    --nc: var(--nt-accent);
    position: relative; overflow: hidden; display: flex; flex-direction: column;
    padding: 18px; cursor: default;
    background: var(--nt-card); border: 1px solid var(--nt-border); border-radius: 18px;
    animation: ntFadeUp 0.5s var(--ease) backwards;
    animation-delay: calc(min(var(--i, 0), 10) * 55ms + 120ms);
    transition: transform 0.35s var(--ease), border-color 0.3s ease, box-shadow 0.35s ease;
  }
  .nt-card > * { position: relative; z-index: 1; }
  .nt-card::before {
    content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px; z-index: 2;
    background: linear-gradient(90deg, var(--nc), color-mix(in srgb, var(--nc) 30%, transparent));
    transform: scaleX(0); transform-origin: left; transition: transform 0.5s var(--ease);
  }
  .nt-card::after {
    content: ""; position: absolute; right: -50px; top: -60px; width: 170px; height: 170px; border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--nc) 16%, transparent), transparent 70%);
    opacity: 0; transform: scale(0.6); transition: opacity 0.4s ease, transform 0.5s var(--ease); pointer-events: none;
  }
  .nt-card:hover { transform: translateY(-6px); border-color: color-mix(in srgb, var(--nc) 55%, var(--nt-border)); box-shadow: 0 18px 38px color-mix(in srgb, var(--nc) 20%, transparent); }
  .nt-card:hover::before { transform: scaleX(1); }
  .nt-card:hover::after { opacity: 1; transform: scale(1); }
  .nt-card.important { border-color: rgba(234, 179, 8, 0.4); }

  .nt-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
  .nt-card-title { margin: 0; flex: 1; font-size: 15px; font-weight: 700; color: var(--nt-text); transition: color 0.25s ease, transform 0.35s var(--ease); }
  .nt-card:hover .nt-card-title { color: var(--nc); transform: translateX(2px); }
  .nt-card-text {
    margin: 0 0 14px; color: var(--nt-muted); font-size: 12px; line-height: 1.65;
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
  }
  .nt-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; margin-top: auto; }
  .nt-chip {
    padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; color: var(--nc);
    background: color-mix(in srgb, var(--nc) 12%, transparent);
    transition: background 0.3s ease, color 0.3s ease;
  }
  .nt-card:hover .nt-chip { background: var(--nc); color: #fff; }
  .nt-date { font-size: 10px; color: var(--nt-faint); }
  .nt-actions { display: flex; gap: 8px; padding-top: 14px; border-top: 1px solid var(--nt-border); }

  .nt-star {
    width: 34px; height: 34px; flex-shrink: 0; display: grid; place-items: center;
    border: 0; border-radius: 50%; background: transparent; cursor: pointer; font-size: 18px; color: var(--nt-muted);
    transition: transform 0.35s var(--ease), background 0.25s ease, box-shadow 0.3s ease;
  }
  .nt-star:hover { transform: scale(1.2) rotate(14deg); background: rgba(234, 179, 8, 0.16); box-shadow: 0 6px 14px rgba(234, 179, 8, 0.25); }
  .nt-star:active { transform: scale(0.9); }
  .nt-star.on { background: rgba(234, 179, 8, 0.14); }
  .nt-star.on span { display: inline-block; animation: ntPop 0.45s var(--ease); }

  /* empty + loading */
  .nt-empty {
    text-align: center; padding: 60px 20px;
    background: var(--nt-card); border: 1px dashed var(--nt-border); border-radius: 18px;
    animation: ntFadeUp 0.5s var(--ease) backwards;
  }
  .nt-empty-icon { display: inline-block; margin-bottom: 10px; font-size: 40px; animation: ntFloat 3.2s ease-in-out infinite; }
  .nt-empty p { margin: 0; font-size: 14px; color: var(--nt-muted); }
  .nt-loading-text { margin: 0 0 16px; font-size: 14px; color: var(--nt-muted); animation: ntPulse 1.4s ease-in-out infinite; }
  .nt-skeleton {
    height: 170px; border-radius: 18px;
    background: linear-gradient(90deg, var(--nt-border) 25%, color-mix(in srgb, var(--nt-accent) 14%, var(--nt-border)) 50%, var(--nt-border) 75%);
    background-size: 200% 100%; animation: ntShimmer 1.4s linear infinite;
  }

  /* ================= EDITOR VIEW ================= */
  .nt-editor-wrap {
    max-width: 820px; margin: 0 auto; height: calc(100vh - 140px);
    display: flex; flex-direction: column;
    animation: ntFadeUp 0.45s var(--ease) backwards;
  }
  .nt-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-shrink: 0; gap: 10px; flex-wrap: wrap; }
  .nt-topbar-right { display: flex; align-items: center; gap: 8px; }
  .nt-topbar .nt-primary { height: 44px; padding: 0 22px; font-size: 14px; }

  .nt-editor-card {
    position: relative; display: flex; flex-direction: column; flex: 1; overflow: hidden;
    padding: 24px 40px;
    background: var(--nt-card); border: 1px solid var(--nt-border); border-radius: 20px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.05);
    transition: border-color 0.3s ease, box-shadow 0.35s ease;
  }
  .nt-editor-card:focus-within { border-color: color-mix(in srgb, var(--nt-accent) 45%, var(--nt-border)); box-shadow: 0 12px 34px color-mix(in srgb, var(--nt-accent) 12%, transparent); }
  .nt-editor-card::before {
    content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px;
    background: linear-gradient(90deg, var(--nt-accent), #38BDF8, #22C55E, var(--nt-accent));
    background-size: 200% 100%; animation: ntGradient 6s linear infinite;
  }

  .nt-select {
    display: block; margin-bottom: 12px; min-height: 38px; padding: 8px 12px;
    color: var(--nt-text-2); font: inherit; font-size: 13px; outline: none; cursor: pointer;
    background: var(--nt-bg); border: 1px solid var(--nt-border); border-radius: 10px;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
  }
  .nt-select:hover { border-color: color-mix(in srgb, var(--nt-accent) 45%, var(--nt-border)); }
  .nt-select:focus { border-color: var(--nt-accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--nt-accent) 15%, transparent); }

  .nt-title-wrap { position: relative; }
  .nt-title-wrap::after {
    content: ""; position: absolute; left: 0; bottom: 0; height: 2px; width: 100%;
    background: linear-gradient(90deg, var(--nt-accent), #38BDF8);
    transform: scaleX(0); transform-origin: left; transition: transform 0.5s var(--ease);
  }
  .nt-title-wrap:focus-within::after { transform: scaleX(1); }
  .note-title-input {
    width: 100%; padding: 10px 0; background: transparent; border: none; outline: none;
    color: var(--nt-text); font-family: inherit; font-size: 22px; font-weight: 700;
  }
  .note-title-input::placeholder { color: var(--nt-faint); }

  .editor-scroll-container { max-height: calc(100vh - 290px); overflow-y: auto; padding-right: 4px; }
  .ProseMirror { min-height: 300px; outline: none; color: var(--nt-text); font-size: 14px; line-height: 1.8; caret-color: var(--nt-accent); }
  .ProseMirror ::selection { background: color-mix(in srgb, var(--nt-accent) 28%, transparent); }
  .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: var(--nt-faint); pointer-events: none; height: 0; }
  .ProseMirror h1 { font-size: 24px; font-weight: 700; margin: 18px 0 8px; color: var(--nt-text); }
  .ProseMirror h2 { font-size: 19px; font-weight: 700; margin: 16px 0 8px; color: var(--nt-text); }
  .ProseMirror p { margin: 8px 0; }
  .ProseMirror ul, .ProseMirror ol { padding-left: 22px; margin: 8px 0; }
  .ProseMirror blockquote { border-left: 3px solid var(--nt-accent); padding-left: 14px; color: var(--nt-muted); margin: 12px 0; font-style: italic; }
  .ProseMirror mark { background: #FEF08A; border-radius: 3px; padding: 0 2px; }
  .ProseMirror a { color: var(--nt-accent); text-decoration: underline; }
  .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 4px; }
  .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 8px; margin: 4px 0; }
  .ProseMirror ul[data-type="taskList"] li > label { margin-top: 3px; }
  .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div { text-decoration: line-through; color: var(--nt-faint); }

  /* ================= READER VIEW ================= */
  .nt-reader-wrap {
    max-width: 860px; margin: 0 auto; height: calc(100vh - 120px);
    display: flex; flex-direction: column;
    animation: ntFadeUp 0.45s var(--ease) backwards;
  }
  .reader-scroll-window { max-height: calc(100vh - 160px); overflow-y: auto; border-radius: 12px; padding-bottom: 20px; }
  .a4-page {
    width: 100%; max-width: 794px; min-height: 842px;
    background: ${paperBg}; margin: 0 auto; padding: clamp(20px, 5vw, 80px);
    border-radius: 14px; box-shadow: 0 14px 44px rgba(0, 0, 0, 0.12);
    color: #1A1A1A; font-family: Georgia, serif;
    word-wrap: break-word; overflow-wrap: break-word;
    animation: ntFadeUp 0.6s var(--ease) 0.1s backwards;
    transition: background 0.5s ease;
  }
  .a4-page * { max-width: 100%; box-sizing: border-box; }
  .a4-page h1 { font-size: clamp(18px, 4vw, 26px); font-weight: 700; margin: 0 0 20px; color: #111; word-break: break-word; }
  .a4-page h2 { font-size: clamp(16px, 3vw, 20px); font-weight: 700; margin: 20px 0 10px; word-break: break-word; }
  .a4-page p { margin: 10px 0; font-size: clamp(13px, 2.5vw, 15px); line-height: 1.8; word-break: break-word; }
  .a4-page ul, .a4-page ol { padding-left: 20px; margin: 10px 0; }
  .a4-page li { font-size: clamp(13px, 2.5vw, 15px); line-height: 1.8; margin: 4px 0; word-break: break-word; }
  .a4-page blockquote { border-left: 3px solid #7C6CF0; padding-left: 16px; color: #555; margin: 16px 0; font-style: italic; }
  .a4-page mark { background: #FEF08A; border-radius: 3px; padding: 0 2px; }
  .a4-page a { color: #7C6CF0; word-break: break-all; }
  .a4-page pre { background: #f4f4f4; border-radius: 8px; padding: 12px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; font-size: 12px; }
  .a4-page code { background: #f4f4f4; padding: 2px 5px; border-radius: 4px; font-size: 12px; word-break: break-all; }
  .a4-page table { width: 100%; border-collapse: collapse; display: block; overflow-x: auto; white-space: nowrap; }
  .a4-page img { max-width: 100%; height: auto; border-radius: 6px; }

  .nt-reader-toolbar {
    display: flex; align-items: center; gap: 2px; padding: 4px;
    background: ${c.bgSecondary}; border: 1px solid var(--nt-border); border-radius: 14px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
  }
  .nt-reader-btn {
    width: 44px; height: 44px; display: grid; place-items: center;
    border: 1px solid transparent; border-radius: 10px; background: transparent; cursor: pointer;
    font-size: 16px; color: var(--nt-text-2);
    transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, transform 0.3s var(--ease);
  }
  .nt-reader-btn span { display: inline-block; transition: transform 0.4s var(--ease); }
  .nt-reader-btn:hover { background: color-mix(in srgb, var(--nt-accent) 12%, transparent); color: var(--nt-accent); transform: translateY(-2px); }
  .nt-reader-btn:hover span { transform: scale(1.2) rotate(15deg); }
  .nt-reader-btn:active { transform: scale(0.92); }
  .nt-reader-btn.active { background: color-mix(in srgb, var(--nt-accent) 18%, transparent); color: var(--nt-accent); border-color: color-mix(in srgb, var(--nt-accent) 40%, transparent); }
  .nt-reader-divider { width: 1px; align-self: stretch; margin: 6px 6px; background: var(--nt-border); }
  .nt-reader-primary {
    position: relative; overflow: hidden; width: 44px; height: 44px; display: grid; place-items: center;
    border: 0; border-radius: 10px; cursor: pointer; font-size: 15px; color: #fff;
    background: linear-gradient(135deg, var(--nt-accent), #5B4FE0);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--nt-accent) 30%, transparent);
    transition: transform 0.3s var(--ease), box-shadow 0.3s ease;
  }
  .nt-reader-primary::after {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%);
    transform: translateX(-120%); transition: transform 0.6s var(--ease);
  }
  .nt-reader-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px color-mix(in srgb, var(--nt-accent) 45%, transparent); }
  .nt-reader-primary:hover::after { transform: translateX(120%); }
  .nt-reader-primary:active { transform: scale(0.92); }

  /* ================= MOBILE ================= */
  @media (max-width: 768px) {
    .nt-page { padding: 4px; }
    .nt-header { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
    .nt-header h1 { font-size: 28px; letter-spacing: -0.5px; }
    .nt-header p { display: block; margin: 4px 0 0; font-size: 14px; color: var(--nt-muted); }
    .nt-header .nt-primary { width: 100%; height: 48px; border-radius: 16px; font-size: 15px; }

    .nt-stats { grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
    .nt-stat { height: 96px; padding: 14px 16px; border-radius: 20px; gap: 12px; }
    .nt-stat .icon { width: 40px; height: 40px; font-size: 20px; border-radius: 12px; }
    .nt-stat h2 { font-size: 18px; line-height: 1.2; }
    .nt-stat span { font-size: 11px; white-space: nowrap; }

    .nt-search-wrap { width: 100%; margin-bottom: 24px; }
    .nt-search, .nt-search:focus { max-width: 100%; width: 100%; height: 48px; border-radius: 16px; font-size: 16px; padding-left: 44px; }
    .nt-search-icon { left: 16px; font-size: 16px; }

    .nt-grid { gap: 16px; }
    .nt-card { padding: 20px; border-radius: 18px; }
    .nt-card-title { font-size: 16px; }
    .nt-card-text { font-size: 13px; margin-bottom: 14px; }
    .nt-btn { min-height: 44px; border-radius: 12px; font-size: 13px; }
    .nt-star { width: 40px; height: 40px; }

    .nt-editor-wrap { height: auto; }
    .nt-editor-card { padding: 20px 16px; border-radius: 16px; }
    .editor-scroll-container { max-height: none; overflow-y: visible; }
    .note-title-input { font-size: 20px; }

    .reader-scroll-window { max-height: none; overflow-y: visible; }
    .nt-reader-wrap { height: auto; }
    .a4-page { padding: 24px 16px; box-shadow: none; border-radius: 16px; min-height: auto; }

    .nt-toast { top: auto; bottom: 18px; left: 16px; right: 16px; max-width: none; }
  }

  @media (max-width: 390px) {
    .nt-stats { gap: 10px; }
    .nt-stat { padding: 10px 12px; gap: 8px; }
    .nt-stat .icon { width: 34px; height: 34px; font-size: 16px; }
    .nt-stat h2 { font-size: 16px; }
    .nt-stat span { font-size: 10px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .nt-root *, .nt-root *::before, .nt-root *::after, .nt-toast, .nt-toast * {
      animation-duration: 0.01ms !important;
      animation-delay: 0ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
};

function Notes() {
  const { colors: c, mode } = useTheme();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [view, setView] = useState("list"); // "list" | "editor" | "reader"
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("General");
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null); // { message, type }
  const [readingTheme, setReadingTheme] = useState("warm"); // "warm" | "bright"

  const showToast = (message, type = "error") => {
    setToast({ message, type, id: Date.now() });
  };
  const clearToast = useCallback(() => setToast(null), []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle, // 👑 Added Text Style core module configuration
      FontSize,  // 👑 Added Font Size attribute assignment support
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Write your note here..." }),
    ],
    content: "",
  });

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notes");
      setNotes(res.data.notes);
    } catch {
      showToast("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotes();
  }, []);

  const openEditor = (note = null) => {
    setSelectedNote(note);
    setTitle(note ? note.title : "");
    setSubject(note ? note.subject : "General");
    editor?.commands.setContent(note ? note.content || "" : "");
    setView("editor");
  };

  const openReader = (note) => {
    setSelectedNote(note);
    setView("reader");
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast("Title is required", "error");
      return;
    }
    const html = editor?.getHTML() || "";
    setSaving(true);
    try {
      if (selectedNote) {
        await api.put(`/notes/${selectedNote._id}`, { title, content: html, subject });
      } else {
        await api.post("/notes", { title, content: html, subject });
      }
      showToast("Note saved successfully!", "success");
      await fetchNotes();
      setTimeout(() => setView("list"), 1200);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    try {
      await api.delete(`/notes/${id}`);
      showToast("Note deleted", "success");
      if (selectedNote?._id === id) setView("list");
      fetchNotes();
    } catch {
      showToast("Failed to delete note");
    }
  };

  const toggleImportant = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/notes/${id}/important`);
      setNotes((prev) => prev.map((n) => (n._id === id ? res.data.note : n)));
      if (selectedNote?._id === id) setSelectedNote(res.data.note);
    } catch {
      showToast("Failed to update note");
    }
  };

  const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      stripHtml(n.content).toLowerCase().includes(search.toLowerCase())
  );

  const rootVars = {
    "--nt-accent": c.accent,
    "--nt-bg": c.bg,
    "--nt-card": c.bgCard,
    "--nt-border": c.border,
    "--nt-text": c.text,
    "--nt-text-2": c.textSecondary,
    "--nt-muted": c.textMuted,
    "--nt-faint": c.textFaint,
  };
  const css = getCss(c, readingTheme);

  // ─── EDITOR VIEW ─────────────────────────────────────
  if (view === "editor") {
    return (
      <Layout>
        {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onDone={clearToast} />}
        <style>{css}</style>

        <div className="nt-root nt-editor-wrap" data-theme={mode} style={rootVars}>
          <div className="nt-topbar">
            <button className="nt-back" onClick={() => setView("list")}>
              <span className="arrow">←</span> Back
            </button>
            <div className="nt-topbar-right">
              {selectedNote && (
                <button
                  className="nt-icon-btn"
                  onClick={(e) => toggleImportant(selectedNote._id, e)}
                  style={{ "--bc": "#EAB308", color: selectedNote.isImportant ? "#EAB308" : undefined }}
                  title="Mark important"
                >
                  {selectedNote.isImportant ? "⭐" : "☆"}
                </button>
              )}
              {selectedNote && (
                <button
                  className="nt-icon-btn"
                  onClick={(e) => handleDelete(selectedNote._id, e)}
                  style={{ "--bc": "#EF4444", color: "#EF4444", fontSize: "18px" }}
                  title="Delete note"
                >
                  🗑️
                </button>
              )}
              <button className="nt-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "💾 Save"}
              </button>
            </div>
          </div>

          <div className="nt-editor-card">
            <div style={{ flexShrink: 0 }}>
              <select className="nt-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <div className="nt-title-wrap">
                <input
                  className="note-title-input"
                  placeholder="Note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <EditorToolbar editor={editor} colors={c} />
            </div>

            {/* Scrollable Container just for typing field */}
            <div className="editor-scroll-container">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── READER VIEW ─────────────────────────────────────
  if (view === "reader") {
    return (
      <Layout>
        {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onDone={clearToast} />}
        <style>{css}</style>

        <div className="nt-root nt-reader-wrap" data-theme={mode} style={rootVars}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px", flexShrink: 0 }}>
            <button className="nt-back" onClick={() => setView("list")}>
              <span className="arrow">←</span> Back
            </button>

            {/* Professional Minimalist Symbol-Only Toolbar */}
            <div className="nt-reader-toolbar">
              <button
                className={`nt-reader-btn ${readingTheme === "bright" ? "active" : ""}`}
                onClick={() => setReadingTheme("bright")}
                title="Bright Mode"
              >
                <span>☀</span>
              </button>
              <button
                className={`nt-reader-btn ${readingTheme === "warm" ? "active" : ""}`}
                onClick={() => setReadingTheme("warm")}
                title="Warm Mode"
              >
                <span>📖</span>
              </button>
              <div className="nt-reader-divider" />
              <button
                className="nt-reader-primary"
                onClick={() => openEditor(selectedNote)}
                title="Edit Note"
              >
                ✏️
              </button>
            </div>
          </div>

          {/* Scroll window strictly surrounding the single A4 sheet box */}
          <div className="reader-scroll-window">
            <div className="a4-page">
              <h1>{selectedNote?.title}</h1>
              <div
                dangerouslySetInnerHTML={{ __html: selectedNote?.content || "<p>No content</p>" }}
              />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── LIST VIEW ────────────────────────────────────────
  const STATS = [
    { icon: "📄", value: notes.length, label: "Notes", color: c.accent },
    { icon: "⭐", value: notes.filter(n => n.isImportant).length, label: "Favorites", color: "#EAB308" },
    { icon: "📚", value: new Set(notes.map(n => n.subject)).size, label: "Categories", color: "#10B981" },
    { icon: "🕒", value: "Today", label: "Updated", color: "#38BDF8" },
  ];

  return (
    <Layout>
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onDone={clearToast} />}
      <style>{css}</style>

      <div className="nt-root nt-page" data-theme={mode} style={rootVars}>
        {/* HERO HEADER SECTION */}
        <div className="nt-header">
          <div>
            <h1>📝 My Notes</h1>
            <p>Organize and manage your notes</p>
          </div>
          <button className="nt-primary" onClick={() => openEditor(null)}>+ New Note</button>
        </div>

        {/* DASHBOARD STATISTICS */}
        <div className="nt-stats">
          {STATS.map((s, i) => (
            <div key={s.label} className="nt-stat" style={{ "--sc": s.color, "--i": i }}>
              <div className="icon">{s.icon}</div>
              <div>
                <h2>{s.value}</h2>
                <span>{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH BAR */}
        <div className="nt-search-wrap">
          <span className="nt-search-icon">🔍</span>
          <input className="nt-search" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <>
            <p className="nt-loading-text">Loading notes...</p>
            <div className="nt-grid">
              {[1, 2, 3].map((i) => <div key={i} className="nt-skeleton" />)}
            </div>
          </>
        ) : filtered.length === 0 ? (
          <div className="nt-empty">
            <div className="nt-empty-icon">{search ? "🔍" : "📭"}</div>
            <p>{search ? "No notes match your search" : "No notes yet — create your first one!"}</p>
          </div>
        ) : (
          <div className="nt-grid">
            {filtered.map((note, i) => (
              <div
                key={note._id}
                className={`nt-card ${note.isImportant ? "important" : ""}`}
                style={{ "--nc": subjectColor(note.subject), "--i": i }}
              >
                <div className="nt-card-top">
                  <h4 className="nt-card-title">{note.title}</h4>
                  <button
                    className={`nt-star ${note.isImportant ? "on" : ""}`}
                    onClick={(e) => toggleImportant(note._id, e)}
                    style={{ color: note.isImportant ? "#EAB308" : undefined }}
                  >
                    <span>{note.isImportant ? "⭐" : "☆"}</span>
                  </button>
                </div>

                <p className="nt-card-text">{stripHtml(note.content) || "No content"}</p>

                <div className="nt-meta">
                  <span className="nt-chip">{note.subject}</span>
                  <span className="nt-date">{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>

                <div className="nt-actions">
                  <button className="nt-btn" style={{ "--bc": c.accent }} onClick={() => openReader(note)}>
                    👁 View
                  </button>
                  <button className="nt-btn" style={{ "--bc": "#10B981" }} onClick={() => openEditor(note)}>
                    ✏️ Edit
                  </button>
                  <button className="nt-btn" style={{ "--bc": "#EF4444" }} onClick={(e) => handleDelete(note._id, e)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Notes;