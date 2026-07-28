 import { useState, useEffect } from "react";

import { useTheme } from "../context/ThemeContext";



const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];



function ToolbarBtn({ onClick, active, children, title, colors: c }) {

  const [hovered, setHovered] = useState(false);



  return (

    <button

      type="button"

      onClick={onClick}

      title={title}

      onMouseEnter={() => setHovered(true)}

      onMouseLeave={() => setHovered(false)}

      style={{

        background: active

          ? `${c.accent}25`

          : hovered

            ? `${c.accent}12`

            : "transparent",

        border: `1.5px solid ${active ? c.accent : hovered ? `${c.accent}40` : "transparent"}`,

        borderRadius: "6px",

        width: "34px",

        height: "32px",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        cursor: "pointer",

        color: active ? c.accent : hovered ? c.accent : c.textSecondary,

        fontSize: "13px",

        fontWeight: active ? "700" : "500",

        transition: "all .12s ease",

        flexShrink: 0,

        boxShadow: active ? `inset 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px ${c.accent}20` : "none",

        position: "relative",

      }}

    >

      {children}

      {active && (

        <div style={{

          position: "absolute",

          bottom: "2px",

          left: "5px",

          right: "5px",

          height: "2.5px",

          background: c.accent,

          borderRadius: "4px",

        }} />

      )}

    </button>

  );

}



function Divider({ colors: c }) {

  return (

    <div style={{

      width: "1px",

      background: c.border,

      margin: "4px 4px",

      alignSelf: "stretch",

    }} />

  );

}



export default function EditorToolbar({ editor }) {

  const { colors: c } = useTheme();

  const [fontSize, setFontSize] = useState("14px");

 

  const [, setUpdateTick] = useState(0);



  useEffect(() => {

    if (!editor) return;



    const handleUpdate = () => {

      setUpdateTick(tick => tick + 1);

    };



    editor.on("selectionUpdate", handleUpdate);

    editor.on("transaction", handleUpdate);



    return () => {

      editor.off("selectionUpdate", handleUpdate);

      editor.off("transaction", handleUpdate);

    };

  }, [editor]);



  if (!editor) return null;



  const applyFontSize = (size) => {

    setFontSize(size);

    editor.chain().focus().setMark("textStyle", { fontSize: size }).run();

  };



  return (

    <div style={{

      display: "flex",

      flexWrap: "wrap",

      gap: "4px",

      alignItems: "center",

      padding: "6px 10px",

      background: c.bgSecondary,

      borderRadius: "10px",

      border: `1px solid ${c.border}`,

      margin: "12px 0",

    }}>

      <ToolbarBtn colors={c}

        onClick={() => editor.chain().focus().toggleBold().run()}

        active={editor.isActive("bold")}

        title="Bold (Ctrl+B)">

        <strong style={{ fontSize: "14px" }}>B</strong>

      </ToolbarBtn>



      <ToolbarBtn colors={c}

        onClick={() => editor.chain().focus().toggleItalic().run()}

        active={editor.isActive("italic")}

        title="Italic (Ctrl+I)">

        <em style={{ fontStyle: "italic", fontSize: "14px" }}>I</em>

      </ToolbarBtn>



      <ToolbarBtn colors={c}

        onClick={() => editor.chain().focus().toggleUnderline().run()}

        active={editor.isActive("underline")}

        title="Underline (Ctrl+U)">

        <span style={{ textDecoration: "underline", fontSize: "14px" }}>U</span>

      </ToolbarBtn>



      <Divider colors={c} />



      {/* Lists section removed completely from here */}



      <ToolbarBtn colors={c}

        onClick={() => editor.chain().focus().toggleHighlight({ color: "#FEF08A" }).run()}

        active={editor.isActive("highlight")}

        title="Highlight">

        🖍️

      </ToolbarBtn>



      <Divider colors={c} />



      <ToolbarBtn colors={c}

        onClick={() => editor.chain().focus().setTextAlign("left").run()}

        active={editor.isActive({ textAlign: "left" })}

        title="Align left">

        ⬅

      </ToolbarBtn>



      <ToolbarBtn colors={c}

        onClick={() => editor.chain().focus().setTextAlign("center").run()}

        active={editor.isActive({ textAlign: "center" })}

        title="Align center">

        ⬌

      </ToolbarBtn>



      <ToolbarBtn colors={c}

        onClick={() => editor.chain().focus().setTextAlign("right").run()}

        active={editor.isActive({ textAlign: "right" })}

        title="Align right">

        ➡

      </ToolbarBtn>



      <Divider colors={c} />



      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>

        <span style={{ fontSize: "12px", color: c.textMuted }}>🔠</span>

        <select

          value={fontSize}

          onChange={(e) => applyFontSize(e.target.value)}

          style={{

            background: c.bgCard,

            border: `1px solid ${c.border}`,

            borderRadius: "6px",

            padding: "4px 6px",

            fontSize: "12px",

            color: c.textSecondary,

            outline: "none",

            cursor: "pointer",

          }}

          title="Font size"

        >

          {FONT_SIZES.map((s) => (

            <option key={s} value={s}>{s}</option>

          ))}

        </select>

      </div>



      <Divider colors={c} />



      <ToolbarBtn colors={c}

        onClick={() => editor.chain().focus().undo().run()}

        title="Undo (Ctrl+Z)">

        ↶

      </ToolbarBtn>



      <ToolbarBtn colors={c}

        onClick={() => editor.chain().focus().redo().run()}

        title="Redo (Ctrl+Y)">

        ↷

      </ToolbarBtn>

    </div>

  );

} 

