import { useState, useEffect } from "react";
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

// Toast notification component
function Toast({ message, type = "error", onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", top: "20px", right: "20px", zIndex: 1000,
      padding: "12px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: "500",
      background: type === "error" ? "#EF4444" : "#22C55E",
      color: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      transition: "all .3s ease",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : "translateX(20px)",
      display: "flex", alignItems: "center", gap: "8px",
      animation: "toastShake .3s ease",
    }}>
      {type === "error" ? "❌" : "✅"} {message}
      <style>{`
        @keyframes toastShake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
      `}</style>
    </div>
  );
}

function Notes() {
  const { colors: c } = useTheme();
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
    setToast({ message, type });
  };

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

  // ─── EDITOR VIEW ─────────────────────────────────────
  if (view === "editor") {
    return (
      <Layout>
        {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
        <style>{`
          .note-title-input {
            width: 100%; padding: 10px 0; background: transparent; border: none;
            outline: none; color: ${c.text}; font-family: inherit;
            font-size: 22px; font-weight: 700;
          }
          .note-title-input::placeholder { color: ${c.textFaint}; }
          .editor-scroll-container {
            max-height: calc(100vh - 290px);
            overflow-y: auto;
            padding-right: 4px;
          }
          .ProseMirror {
            min-height: 300px; outline: none; color: ${c.text}; font-size: 14px; line-height: 1.8;
          }
          .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder); float: left; color: ${c.textFaint}; pointer-events: none; height: 0;
          }
          .ProseMirror h1 { font-size: 24px; font-weight: 700; margin: 18px 0 8px; color: ${c.text}; }
          .ProseMirror h2 { font-size: 19px; font-weight: 700; margin: 16px 0 8px; color: ${c.text}; }
          .ProseMirror p { margin: 8px 0; }
          .ProseMirror ul, .ProseMirror ol { padding-left: 22px; margin: 8px 0; }
          .ProseMirror blockquote { border-left: 3px solid ${c.accent}; padding-left: 14px; color: ${c.textMuted}; margin: 12px 0; font-style: italic; }
          .ProseMirror mark { background: #FEF08A; border-radius: 3px; padding: 0 2px; }
          .ProseMirror a { color: ${c.accent}; text-decoration: underline; }
          .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 4px; }
          .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 8px; margin: 4px 0; }
          .ProseMirror ul[data-type="taskList"] li > label { margin-top: 3px; }
          .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div { text-decoration: line-through; color: ${c.textFaint}; }
          .editor-action-btn {
            padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 600;
            cursor: pointer; transition: all .15s; border: none;
          }
          .editor-action-btn:hover { transform: translateY(-1px); opacity: .9; }
          
          /* Native Responsive Mobile Adjustments for Editor View */
          @media (max-width: 768px) {
            .editor-main-wrapper {
              height: auto !important;
            }
            .editor-container-card {
              padding: 20px 16px !important;
              border-radius: 16px !important;
            }
            .editor-scroll-container {
              max-height: none !important;
              overflow-y: visible !important;
            }
            .note-title-input {
              font-size: 20px;
            }
          }
        `}</style>

        <div className="editor-main-wrapper" style={{ maxWidth: "820px", margin: "0 auto", height: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexShrink: 0 }}>
            <button onClick={() => setView("list")} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: "none", color: c.textMuted,
              fontSize: "13px", cursor: "pointer", padding: "12px 16px 12px 0",
              minHeight: "44px"
            }}>
              ← Back
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {selectedNote && (
                <button
                  onClick={(e) => toggleImportant(selectedNote._id, e)}
                  style={{
                    background: "none", border: "none", cursor: "pointer", fontSize: "20px",
                    color: selectedNote.isImportant ? "#EAB308" : c.textMuted,
                    minWidth: "44px", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                  title="Mark important"
                >
                  {selectedNote.isImportant ? "⭐" : "☆"}
                </button>
              )}
              {selectedNote && (
                <button 
                  onClick={(e) => handleDelete(selectedNote._id, e)} 
                  style={{
                    background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#EF4444",
                    minWidth: "44px", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center"
                  }} 
                  title="Delete note"
                >
                  🗑️
                </button>
              )}
              <button
                className="editor-action-btn"
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: `linear-gradient(135deg, ${c.accent}, #5B4FE0)`,
                  color: "#fff", opacity: saving ? 0.6 : 1,
                  height: "44px", padding: "0 20px", borderRadius: "12px", fontSize: "14px",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                {saving ? "Saving..." : "💾 Save"}
              </button>
            </div>
          </div>

          <div className="editor-container-card" style={{
            background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: "16px",
            padding: "24px 40px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            display: "flex", flexDirection: "column", flex: 1, overflow: "hidden"
          }}>
            <div style={{ flexShrink: 0 }}>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  background: c.bg, border: `1px solid ${c.border}`, borderRadius: "8px",
                  padding: "8px 12px", fontSize: "13px", color: c.textSecondary, outline: "none",
                  marginBottom: "12px", minHeight: "36px", display: "block"
                }}
              >
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <input
                className="note-title-input"
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

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
    const warmBg = "#F7F3E9";
    const brightBg = "#FFFFFF";
    const paperBg = readingTheme === "warm" ? warmBg : brightBg;

    return (
      <Layout>
        <style>{`
          .reader-scroll-window {
            max-height: calc(100vh - 160px);
            overflow-y: auto;
            border-radius: 12px;
            padding-bottom: 20px;
          }
          .a4-page {
            width: 100%;
            max-width: 794px;
            min-height: 842px; /* Standard A4 proportion baseline */
            background: ${paperBg};
            margin: 0 auto;
            padding: clamp(20px, 5vw, 80px);
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            color: #1A1A1A;
            font-family: Georgia, serif;
            box-sizing: border-box;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .a4-page * {
            max-width: 100%;
            box-sizing: border-box;
          }
          .a4-page h1 { font-size: clamp(18px, 4vw, 26px); font-weight: 700; margin: 0 0 20px; color: #111; word-break: break-word; }
          .a4-page h2 { font-size: clamp(16px, 3vw, 20px); font-weight: 700; margin: 20px 0 10px; word-break: break-word; }
          .a4-page p { margin: 10px 0; font-size: clamp(13px, 2.5vw, 15px); line-height: 1.8; word-break: break-word; }
          .a4-page ul, .a4-page ol { padding-left: 20px; margin: 10px 0; }
          .a4-page li { font-size: clamp(13px, 2.5vw, 15px); line-height: 1.8; margin: 4px 0; word-break: break-word; }
          .a4-page blockquote { border-left: 3px solid #7C6CF0; padding-left: 16px; color: #555; margin: 16px 0; font-style: italic; }
          .a4-page mark { background: #FEF08A; border-radius: 3px; padding: 0 2px; }
          .a4-page a { color: #7C6CF0; word-break: break-all; }
          .a4-page pre {
            background: #f4f4f4; border-radius: 8px; padding: 12px;
            overflow-x: auto; white-space: pre-wrap;
            word-wrap: break-word; font-size: 12px;
          }
          .a4-page code {
            background: #f4f4f4; padding: 2px 5px; border-radius: 4px;
            font-size: 12px; word-break: break-all;
          }
          .a4-page table {
            width: 100%; border-collapse: collapse; display: block;
            overflow-x: auto; white-space: nowrap;
          }
          .a4-page img { max-width: 100%; height: auto; border-radius: 6px; }

          /* Professional reader toolbar styling */
          .reader-toolbar {
            display: flex;
            align-items: center;
            background: ${c.bgSecondary};
            border: 1px solid ${c.border};
            border-radius: 10px;
            padding: 4px;
            gap: 2px;
          }
          .reader-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: 8px;
            cursor: pointer;
            border: 1px solid transparent;
            background: transparent;
            color: ${c.textSecondary};
            transition: all 0.15s ease;
          }
          .reader-btn:hover {
            background: ${c.accent}12;
            color: ${c.accent};
          }
          .reader-btn.active {
            background: ${c.accent}22;
            color: ${c.accent};
            border-color: ${c.accent}40;
          }
          .reader-btn-primary {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: 8px;
            cursor: pointer;
            border: none;
            background: linear-gradient(135deg, ${c.accent}, #5B4FE0);
            color: #fff;
            transition: all 0.15s ease;
            box-shadow: 0 2px 8px ${c.accent}25;
          }
          .reader-btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px ${c.accent}40;
          }

          @media (max-width: 768px) {
            .reader-scroll-window {
              max-height: none !important;
              overflow-y: visible !important;
            }
            .a4-page {
              padding: 24px 16px !important;
              box-shadow: none !important;
              border-radius: 16px !important;
              min-height: auto !important;
            }
          }
        `}</style>

        <div style={{ maxWidth: "860px", margin: "0 auto", height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px", flexShrink: 0 }}>
            <button onClick={() => setView("list")} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: "none", color: c.textMuted,
              fontSize: "13px", cursor: "pointer", padding: "12px 16px 12px 0",
              minHeight: "44px"
            }}>
              ← Back
            </button>
            
            {/* Professional Minimalist Symbol-Only Toolbar */}
            <div className="reader-toolbar">
              <button
                className={`reader-btn ${readingTheme === "bright" ? "active" : ""}`}
                onClick={() => setReadingTheme("bright")}
                title="Bright Mode"
                style={{ fontSize: "16px" }}
              >
                ☀
              </button>
              <button
                className={`reader-btn ${readingTheme === "warm" ? "active" : ""}`}
                onClick={() => setReadingTheme("warm")}
                title="Warm Mode"
                style={{ fontSize: "16px" }}
              >
                📖
              </button>
              <div style={{ width: "1px", background: c.border, margin: "4px 6px", alignSelf: "stretch" }} />
              <button
                className="reader-btn-primary"
                onClick={() => openEditor(selectedNote)}
                title="Edit Note"
                style={{ fontSize: "15px" }}
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
  return (
    <Layout>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
      <style>{`
        /* --- LAYOUT UTILITIES --- */
        .page-container {
          max-width: 1100px;
          margin: 0 auto;
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .header-title-area h1 {
          color: ${c.text};
          font-size: 22px;
          font-weight: 700;
          margin: 0;
        }
        .header-title-area p {
          display: none;
        }

        /* --- SEARCH ARCHITECTURE --- */
        .search-wrapper {
          position: relative;
          margin-bottom: 20px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: ${c.textFaint};
          pointer-events: none;
        }
        .notes-search {
          background: ${c.bgCard};
          border: 1px solid ${c.border};
          border-radius: 10px;
          padding: 9px 14px 9px 38px;
          color: ${c.text};
          font-size: 13px;
          outline: none;
          width: 100%;
          max-width: 320px;
          box-sizing: border-box;
          transition: border-color .2s;
        }
        .notes-search::placeholder { color: ${c.textFaint}; }
        .notes-search:focus { border-color: ${c.accent}; }

        /* --- BUTTONS --- */
        .new-note-btn {
          padding: 10px 18px;
          background: linear-gradient(135deg, ${c.accent}, #5B4FE0);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all .15s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .new-note-btn:hover { 
          opacity: .92; 
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${c.accent}20;
        }
        .new-note-btn:active {
          transform: translateY(0);
        }

        .note-action-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all .15s ease;
          border: 1px solid;
        }
        .note-action-btn:hover { transform: translateY(-1px); }
        .note-action-btn:active { transform: translateY(0); }

        /* --- STATS DASHBOARD --- */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: ${c.bgCard};
          border: 1px solid ${c.border};
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }
        .stat-card .icon {
          font-size: 24px;
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${c.bg};
          border-radius: 10px;
        }
        .stat-card h2 {
          margin: 0 0 2px;
          font-size: 20px;
          font-weight: 700;
          color: ${c.text};
        }
        .stat-card span {
          font-size: 12px;
          color: ${c.textMuted};
          font-weight: 500;
        }

        /* --- NOTE CARDS GRID --- */
        .notes-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }
        .note-card {
          background: ${c.bgCard};
          border: 1px solid ${c.border};
          border-radius: 14px;
          padding: 16px;
          transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .note-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          border-color: ${c.accent}55;
          transform: translateY(-2px);
        }

        /* 📱 MOBILE ARCHITECTURE OVERRIDES (< 768px) */
        @media (max-width: 768px) {
          /* Layout Spacing Reset */
          .page-container {
            padding: 16px !important;
          }
          .header-section {
            margin-bottom: 24px !important;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px !important;
          }
          
          /* Hero Section Enhancement */
          .header-title-area {
            width: 100%;
          }
          .header-title-area h1 {
            font-size: 28px !important;
            letter-spacing: -0.5px;
          }
          .header-title-area p {
            display: block !important;
            margin: 4px 0 0 0;
            font-size: 14px;
            color: ${c.textMuted};
          }
          
          /* Premium Primary Native Button */
          .new-note-btn {
            width: 100%;
            height: 48px;
            border-radius: 16px !important;
            font-size: 15px !important;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px ${c.accent}30 !important;
          }
          
          /* 2x2 Clean Statistics Grid */
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
            margin-bottom: 24px !important;
          }
          .stat-card {
            height: 96px !important;
            border-radius: 20px !important;
            padding: 14px 16px !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 12px !important;
            background: ${c.bgCard};
            border: 1px solid ${c.border}AA !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.01) !important;
          }
          .stat-card .icon {
            width: 40px !important;
            height: 40px !important;
            font-size: 20px !important;
            border-radius: 10px !important;
            flex-shrink: 0;
          }
          .stat-card h2 {
            font-size: 18px !important;
            line-height: 1.2;
          }
          .stat-card span {
            font-size: 11px !important;
            white-space: nowrap;
          }

          /* Clerk/Linear Inspired Search Box */
          .search-wrapper {
            width: 100% !important;
            margin-bottom: 24px !important;
          }
          .notes-search {
            max-width: 100% !important;
            width: 100% !important;
            height: 48px !important;
            border-radius: 16px !important;
            font-size: 15px !important;
            padding-left: 44px !important;
          }
          .search-icon {
            left: 16px !important;
            font-size: 16px !important;
          }

          /* iOS Native Card Optimizations */
          .notes-cards-grid {
            gap: 16px !important;
          }
          .note-card {
            padding: 20px !important;
            border-radius: 16px !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.01) !important;
          }
          .note-card h4 {
            font-size: 16px !important;
          }
          .note-card p {
            font-size: 13px !important;
            margin-bottom: 14px !important;
          }
          
          /* Native Spaced Action Interfaces */
          .note-card button {
            min-height: 44px !important; /* Touch Targets */
          }
          .note-action-btn {
            border-radius: 12px !important;
            font-size: 13px !important;
          }
        }

        /* 📱 SPECIAL SUB-MINIATURE BREAKPOINT ADJUSTMENTS */
        @media (max-width: 390px) {
          .new-note-btn {
            width: 100% !important;
          }
          .stats-grid {
            gap: 12px !important;
          }
          .stat-card {
            padding: 10px 12px !important;
            gap: 8px !important;
          }
          .stat-card .icon {
            width: 34px !important;
            height: 34px !important;
            font-size: 16px !important;
          }
          .stat-card h2 {
            font-size: 16px !important;
          }
          .stat-card span {
            font-size: 10px !important;
          }
        }
      `}</style>

      <div className="page-container">
        {/* HERO HEADER SECTION */}
        <div className="header-section">
          <div className="header-title-area">
            <h1>📝 My Notes</h1>
            <p>Organize and manage your notes</p>
          </div>
          <button className="new-note-btn" onClick={() => openEditor(null)}>+ New Note</button>
        </div>

        {/* NATIVE 2X2 DASHBOARD STATISTICS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="icon">📄</div>
            <div>
              <h2>{notes.length}</h2>
              <span>Notes</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="icon">⭐</div>
            <div>
              <h2>{notes.filter(n => n.isImportant).length}</h2>
              <span>Favorites</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="icon">📚</div>
            <div>
              <h2>{new Set(notes.map(n => n.subject)).size}</h2>
              <span>Categories</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="icon">🕒</div>
            <div>
              <h2>Today</h2>
              <span>Updated</span>
            </div>
          </div>
        </div>

        {/* CLERK INSPIRED INPUT ELEMENT BAR */}
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input className="notes-search" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <p style={{ color: c.textMuted, fontSize: "14px" }}>Loading notes...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: "16px" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>{search ? "🔍" : "📭"}</div>
            <p style={{ color: c.textMuted, fontSize: "14px", margin: 0 }}>
              {search ? "No notes match your search" : "No notes yet — create your first one!"}
            </p>
          </div>
        ) : (
          /* CLEAN CARD ARCHITECTURE */
          <div className="notes-cards-grid">
            {filtered.map((note) => (
              <div key={note._id} className="note-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: c.text, flex: 1, marginRight: "8px" }}>
                    {note.title}
                  </h4>
                  <button
                    onClick={(e) => toggleImportant(note._id, e)}
                    style={{
                      background: "none", border: "none", cursor: "pointer", fontSize: "18px", flexShrink: 0,
                      color: note.isImportant ? "#EAB308" : c.textMuted,
                      minWidth: "32px", minHeight: "32px", display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                  >
                    {note.isImportant ? "⭐" : "☆"}
                  </button>
                </div>

                <p style={{
                  margin: "0 0 12px", color: c.textMuted, fontSize: "12px", lineHeight: "1.6",
                  display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {stripHtml(note.content) || "No content"}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "10px", color: c.accent, background: `${c.accent}1A`, padding: "2px 8px", borderRadius: "20px", fontWeight: "500" }}>
                    {note.subject}
                  </span>
                  <span style={{ fontSize: "10px", color: c.textFaint }}>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "6px", borderTop: `1px solid ${c.border}`, paddingTop: "12px" }}>
                  <button
                    className="note-action-btn"
                    onClick={() => openReader(note)}
                    style={{ background: `${c.accent}12`, color: c.accent, borderColor: `${c.accent}30`, flex: 1, justifyContent: "center" }}
                  >
                    👁 View
                  </button>
                  <button
                    className="note-action-btn"
                    onClick={() => openEditor(note)}
                    style={{ background: `#10B98112`, color: "#10B981", borderColor: `#10B98130`, flex: 1, justifyContent: "center" }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="note-action-btn"
                    onClick={(e) => handleDelete(note._id, e)}
                    style={{ background: `#EF444412`, color: "#EF4444", borderColor: `#EF444430`, flex: 1, justifyContent: "center" }}
                  >
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