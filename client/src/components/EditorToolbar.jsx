import { useTheme } from "../context/ThemeContext";

function EditorToolbar({ editor }) {
  const { colors: c } = useTheme();

  if (!editor) return null;

  const ToolbarBtn = ({ onClick, active, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        background: active ? `${c.accent}22` : c.bg,
        border: `1px solid ${active ? c.accent : c.border}`,
        borderRadius: "8px",
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: active ? c.accent : c.textSecondary,
        fontSize: "13px",
        transition: "all .15s",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );

  const Divider = () => (
    <div style={{ width: "1px", background: c.border, margin: "0 4px", alignSelf: "stretch" }} />
  );

  const setLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: "5px", alignItems: "center",
      padding: "10px 0", borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`,
      margin: "12px 0",
    }}>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
        <strong>B</strong>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
        <em>I</em>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
        <span style={{ textDecoration: "underline" }}>U</span>
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
        <span style={{ textDecoration: "line-through" }}>S</span>
      </ToolbarBtn>

      <Divider />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
        H1
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
        H2
      </ToolbarBtn>

      <Divider />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
        •≡
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
        1.
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Checklist">
        ☑
      </ToolbarBtn>

      <Divider />

      <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight({ color: "#FEF08A" }).run()} active={editor.isActive("highlight")} title="Highlight">
        🖍️
      </ToolbarBtn>
      <ToolbarBtn onClick={setLink} active={editor.isActive("link")} title="Add link">
        🔗
      </ToolbarBtn>

      <Divider />

      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
        ⬅
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center">
        ⬌
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
        ➡
      </ToolbarBtn>

      <Divider />

      <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
        ↶
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
        ↷
      </ToolbarBtn>
    </div>
  );
}

export default EditorToolbar;