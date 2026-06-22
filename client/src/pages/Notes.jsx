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

import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import EditorToolbar from "../components/EditorToolbar";
import api from "../services/api";

const SUBJECTS = [ "CSIT", "BCA","CEE", "BIT", "General", "Math", "Physics", "Chemistry", "Biology",  "Other"];

function Notes() {
  const { colors: c } = useTheme();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("General");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Write your note here..." }),
    ],
    content: "",
  });

 useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notes");
      setNotes(res.data.notes);
    } catch {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const openNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setSubject(note.subject);
    editor?.commands.setContent(note.content || "");
    setIsEditing(true);
  };

  const openNewNote = () => {
    setSelectedNote(null);
    setTitle("");
    setSubject("General");
    editor?.commands.setContent("");
    setIsEditing(true);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setSelectedNote(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    const html = editor?.getHTML() || "";
    setSaving(true);
    setSaveStatus("Saving...");
    try {
      if (selectedNote) {
        const res = await api.put(`/notes/${selectedNote._id}`, { title, content: html, subject });
        setSelectedNote(res.data.note);
      } else {
        const res = await api.post("/notes", { title, content: html, subject });
        setSelectedNote(res.data.note);
      }
      setSaveStatus("Saved ✓");
      await fetchNotes();
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save note");
      setSaveStatus("");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    try {
      await api.delete(`/notes/${id}`);
      if (selectedNote?._id === id) closeEditor();
      fetchNotes();
    } catch {
      setError("Failed to delete note");
    }
  };

  const toggleImportant = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/notes/${id}/important`);
      setNotes((prev) => prev.map((n) => (n._id === id ? res.data.note : n)));
      if (selectedNote?._id === id) setSelectedNote(res.data.note);
    } catch {
      setError("Failed to update note");
    }
  };

  const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      stripHtml(n.content).toLowerCase().includes(search.toLowerCase())
  );

  // ---------- EDITOR VIEW ----------
  if (isEditing) {
    return (
      <Layout>
        <style>{`
          .note-title-input {
            width: 100%; padding: 10px 0; background: transparent; border: none;
            outline: none; color: ${c.text}; font-family: inherit;
            font-size: 22px; font-weight: 700;
          }
          .note-title-input::placeholder { color: ${c.textFaint}; }

          .ProseMirror {
            min-height: 380px; outline: none; color: ${c.text}; font-size: 14px; line-height: 1.7;
          }
          .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder); float: left; color: ${c.textFaint}; pointer-events: none; height: 0;
          }
          .ProseMirror h1 { font-size: 24px; font-weight: 700; margin: 18px 0 8px; }
          .ProseMirror h2 { font-size: 19px; font-weight: 700; margin: 16px 0 8px; }
          .ProseMirror p { margin: 8px 0; }
          .ProseMirror ul, .ProseMirror ol { padding-left: 22px; margin: 8px 0; }
          .ProseMirror mark { background: #FEF08A; border-radius: 3px; padding: 0 2px; }
          .ProseMirror a { color: ${c.accent}; text-decoration: underline; }
          .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 4px; }
          .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 8px; margin: 4px 0; }
          .ProseMirror ul[data-type="taskList"] li > label { margin-top: 3px; }
          .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div { text-decoration: line-through; color: ${c.textFaint}; }
        `}</style>

        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          {/* Editor header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <button onClick={closeEditor} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: "none", color: c.textMuted,
              fontSize: "13px", cursor: "pointer", padding: "6px 0",
            }}>
              ← Back to Notes
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {saveStatus && <span style={{ fontSize: "12px", color: c.textMuted }}>{saveStatus}</span>}
              {selectedNote && (
                <button onClick={(e) => toggleImportant(selectedNote._id, e)} style={{
                  background: "none", border: "none", cursor: "pointer", fontSize: "18px",
                }} title="Mark important">
                  {selectedNote.isImportant ? "⭐" : "☆"}
                </button>
              )}
              {selectedNote && (
                <button onClick={() => handleDelete(selectedNote._id)} style={{
                  background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#EF4444",
                }} title="Delete note">
                  🗑️
                </button>
              )}
              <button onClick={handleSave} disabled={saving} style={{
                padding: "8px 18px", background: `linear-gradient(135deg, ${c.accent}, #5B4FE0)`,
                color: "#fff", border: "none", borderRadius: "9px", fontSize: "13px",
                fontWeight: "600", cursor: "pointer", opacity: saving ? 0.6 : 1,
              }}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: "9px", fontSize: "13px", marginBottom: "14px" }}>
              {error}
            </div>
          )}

          {/* Editor card - styled like a document page */}
          <div style={{
            background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: "16px",
            padding: "32px 40px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          }}>

            <div style={{ marginBottom: "8px" }}>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  background: c.bg, border: `1px solid ${c.border}`, borderRadius: "8px",
                  padding: "6px 10px", fontSize: "12px", color: c.textSecondary, outline: "none",
                }}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <input
              className="note-title-input"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <EditorToolbar editor={editor} />

            <EditorContent editor={editor} />
          </div>
        </div>
      </Layout>
    );
  }

  // ---------- LIST VIEW ----------
  return (
    <Layout>
      <style>{`
        .note-card {
          background: ${c.bgCard}; border: 1px solid ${c.border}; border-radius: 14px;
          padding: 16px; cursor: pointer; transition: all .18s;
        }
        .note-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: ${c.accent}55; }
        .notes-search {
          background: ${c.bgCard}; border: 1px solid ${c.border}; border-radius: 10px;
          padding: 9px 14px 9px 36px; color: ${c.text}; font-size: 13px;
          outline: none; width: 100%; max-width: 320px; box-sizing: border-box; transition: border-color .2s;
        }
        .notes-search::placeholder { color: ${c.textFaint}; }
        .notes-search:focus { border-color: ${c.accent}; }
        .new-note-btn {
          padding: 10px 18px; background: linear-gradient(135deg, ${c.accent}, #5B4FE0);
          color: #fff; border: none; border-radius: 10px; font-size: 13px;
          font-weight: 600; cursor: pointer; transition: transform .15s, opacity .15s;
        }
        .new-note-btn:hover { opacity: .92; transform: translateY(-1px); }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ color: c.text, fontSize: "20px", fontWeight: "700", margin: "0 0 4px" }}>📝 My Notes</h1>
            <p style={{ color: c.textMuted, fontSize: "13px", margin: 0 }}>{notes.length} note{notes.length !== 1 ? "s" : ""} total</p>
          </div>
          <button className="new-note-btn" onClick={openNewNote}>+ New Note</button>
        </div>

        <div style={{ position: "relative", marginBottom: "20px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: c.textFaint, pointerEvents: "none" }}>🔍</span>
          <input className="notes-search" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: "9px", fontSize: "13px", marginBottom: "14px" }}>
            {error}
          </div>
        )}

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
            {filtered.map((note) => (
              <div key={note._id} className="note-card" onClick={() => openNote(note)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: c.text, flex: 1 }}>
                    {note.title}
                  </h4>
                  <button onClick={(e) => toggleImportant(note._id, e)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", flexShrink: 0, marginLeft: "8px" }}>
                    {note.isImportant ? "⭐" : "☆"}
                  </button>
                </div>
                <p style={{
                  margin: "0 0 10px", color: c.textMuted, fontSize: "12px", lineHeight: "1.6",
                  display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {stripHtml(note.content) || "No content"}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "10px", color: c.accent, background: `${c.accent}1A`, padding: "2px 8px", borderRadius: "20px", fontWeight: "500" }}>
                    {note.subject}
                  </span>
                  <span style={{ fontSize: "10px", color: c.textFaint }}>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
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