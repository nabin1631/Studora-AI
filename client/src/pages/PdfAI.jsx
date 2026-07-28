import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import api from "../services/api";

function PdfAI() {
  const { colors: c } = useTheme();
  const [pdfs, setPdfs] = useState([]);
  const [activePdf, setActivePdf] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingPdfs, setLoadingPdfs] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  const [pinnedIds, setPinnedIds] = useState([]);
  const [activeMenuPdfId, setActiveMenuPdfId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const viewportRef = useRef(null);
  const fileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);

  const theme = {
    bg: c?.bg || "#131314",
    bgSecondary: c?.bgSecondary || "#1e1e20",
    bgCard: c?.bgCard || "#282a2c",
    border: c?.border || "#3c4043",
    text: c?.text || "#e3e3e3",
    textSecondary: c?.textSecondary || "#c4c7c5",
    textMuted: c?.textMuted || "#8e918f",
    textFaint: c?.textFaint || "#474747",
    accent: c?.accent || "#a8c7fa",
    hover: c?.hover || "rgba(255,255,255,0.04)",
    activeNav: c?.activeNav || "rgba(168,199,250,0.15)",
  };

  const isDark = theme.accent === '#a8c7fa' || theme.bg !== '#ffffff';

  const fetchPdfs = async () => {
    setLoadingPdfs(true);
    try {
      const res = await api.get("/pdf");
      setPdfs(res.data.pdfs || []);
    } catch {
      console.error("Failed to load PDFs");
    } finally {
      setLoadingPdfs(false);
    }
  };

  useEffect(() => {
    fetchPdfs();
    const savedPins = localStorage.getItem("studora_pinned_pdfs");
    if (savedPins) {
      try { setPinnedIds(JSON.parse(savedPins)); } catch (e) { console.error(e); }
    }

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }

    const elementsToLock = [document.documentElement, document.body];
    
    let parent = viewportRef.current?.parentElement;
    while (parent && parent.tagName !== 'BODY') {
      elementsToLock.push(parent);
      parent = parent.parentElement;
    }

    ['#__next', '#root', '[data-reactroot]'].forEach(selector => {
      const el = document.querySelector(selector);
      if (el) elementsToLock.push(el);
    });

    elementsToLock.forEach(el => {
      el.style.overflow = 'hidden';
      el.style.height = '100%';
      el.style.maxHeight = '100vh';
    });

    return () => {
      elementsToLock.forEach(el => {
        el.style.overflow = '';
        el.style.height = '';
        el.style.maxHeight = '';
      });
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuPdfId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const loadPdf = async (pdfId) => {
    try {
      const res = await api.get(`/pdf/${pdfId}`);
      setActivePdf(res.data.pdf);
      setMessages(res.data.pdf.messages || []);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    } catch {
      setError("Failed to load PDF");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB");
      return;
    }

    setError("");
    setUploading(true);
    setUploadProgress("Uploading PDF...");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      setUploadProgress("Extracting text...");
      const res = await api.post("/pdf/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchPdfs();
      loadPdf(res.data.pdf._id);
      setShowUploadModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload PDF");
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (modalFileInputRef.current) modalFileInputRef.current.value = "";
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading || !activePdf) return;

    const userMessage = input.trim();
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "...", loading: true }]);
    setLoading(true);

    try {
      const res = await api.post(`/pdf/${activePdf._id}/ask`, { question: userMessage });
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Sorry, I encountered an error. Please try again.", error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!activePdf || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: "📋 Summarize this PDF" }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "...", loading: true }]);
    setLoading(true);

    try {
      const res = await api.post(`/pdf/${activePdf._id}/summarize`);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: res.data.summary },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Failed to summarize. Please try again.", error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const deletePdf = async (pdfId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Delete this PDF?")) return;
    try {
      await api.delete(`/pdf/${pdfId}`);
      if (activePdf?._id === pdfId) {
        setActivePdf(null);
        setMessages([]);
      }
      const updatedPins = pinnedIds.filter(id => id !== pdfId);
      setPinnedIds(updatedPins);
      localStorage.setItem("studora_pinned_pdfs", JSON.stringify(updatedPins));
      fetchPdfs();
    } catch {
      setError("Failed to delete PDF");
    }
  };

  const togglePinPdf = (pdfId, e) => {
    e.stopPropagation();
    setActiveMenuPdfId(null);
    if (pinnedIds.includes(pdfId)) {
      const updated = pinnedIds.filter(id => id !== pdfId);
      setPinnedIds(updated);
      localStorage.setItem("studora_pinned_pdfs", JSON.stringify(updated));
    } else {
      if (pinnedIds.length >= 10) {
        alert("You can only pin up to 10 items\n\nUnpin an item to pin something new");
        return;
      }
      const updated = [...pinnedIds, pdfId];
      setPinnedIds(updated);
      localStorage.setItem("studora_pinned_pdfs", JSON.stringify(updated));
    }
  };

  const handleClearConversation = () => {
    if (window.confirm("Clear all conversations for this PDF?")) {
      setMessages([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const filteredPdfs = pdfs.filter(pdf =>
    pdf.originalName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedPdfs = filteredPdfs.filter(pdf => pinnedIds.includes(pdf._id));
  const recentPdfs = filteredPdfs.filter(pdf => !pinnedIds.includes(pdf._id));

  const SUGGESTIONS = [
    "Summarize this PDF",
    "Explain Chapter 2",
    "Generate MCQs",
    "Important Questions",
    "Key Concepts",
    "Exam Preparation"
  ];

  const formatMessage = (content) => {
    if (!content) return "";
    let html = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre style="background:${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)'};padding:14px;border-radius:8px;overflow-x:auto;border:1px solid ${theme.border};font-family:monospace;margin:12px 0;font-size:13px;line-height:1.5;color:inherit;"><code style="background:transparent;padding:0;border-radius:0;font-size:inherit;">${code.trim()}</code></pre>`;
    });

    html = html
      .replace(/\*\*(.*?)\*\*/g, "<strong style='font-weight:600;color:inherit;'>$1</strong>")
      .replace(/\*(.*?)\*(?!\*)/g, "<em style='font-style:italic;'>$1</em>")
      .replace(/`(.*?)`/g, `<code style="background:${theme.bgSecondary};padding:2px 5px;border-radius:4px;font-size:13px;font-family:monospace;border:1px solid ${theme.border};color:inherit;">$1</code>`);

    html = html.replace(/^\s*-\s+(.*?)$/gm, `<li style="margin-left:20px;margin-bottom:4px;list-style-type:disc;">$1</li>`);
    html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, `<li style="margin-left:20px;margin-bottom:4px;list-style-type:decimal;">$1</li>`);

    return html.replace(/\n/g, "<br/>");
  };

  const renderPdfItem = (pdf) => {
    const isPinned = pinnedIds.includes(pdf._id);
    return (
      <div
        key={pdf._id}
        className={`flat-pdf-item ${activePdf?._id === pdf._id ? "active" : ""}`}
        onClick={() => loadPdf(pdf._id)}
        style={{ position: 'relative' }}
      >
        <span style={{ fontSize: "14px", marginRight: "6px" }}>📄</span>
        <span className="pdf-item-text">{pdf.originalName}</span>
        <span style={{ fontSize: "11px", color: theme.textMuted, marginLeft: "auto", marginRight: "30px" }}>
          {pdf.pageCount || 0}p
        </span>
        
        <div className="flat-action-wrapper" style={{ position: 'absolute', right: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button 
            className="flat-menu-trigger-btn"
            style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuPdfId(activeMenuPdfId === pdf._id ? null : pdf._id);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="5" r="1.5"></circle>
              <circle cx="12" cy="12" r="1.5"></circle>
              <circle cx="12" cy="19" r="1.5"></circle>
            </svg>
          </button>
        </div>

        {activeMenuPdfId === pdf._id && (
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '32px',
              right: '8px',
              backgroundColor: theme.bgCard,
              border: `1px solid ${theme.border}`,
              borderRadius: '6px',
              padding: '4px 0',
              zIndex: 100,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              minWidth: '110px'
            }}
          >
            <button 
              onClick={(e) => togglePinPdf(pdf._id, e)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: theme.text, fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isPinned ? 'rotate(45deg)' : 'none' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{isPinned ? "Unpin" : "Pin"}</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveMenuPdfId(null); deletePdf(pdf._id, e); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Truncate filename for mobile
  const truncateFileName = (name, maxLength = 14) => {
    if (!name) return "";
    if (name.length <= maxLength) return name;
    const ext = name.split('.').pop();
    const base = name.slice(0, maxLength - 3 - ext.length);
    return `${base}...${ext}`;
  };

  return (
    <Layout>
      <style>{`
        html, body, #__next, #root {
          overflow: hidden !important;
          height: 100vh !important;
          max-height: 100vh !important;
          width: 100vw !important;
          margin: 0;
          padding: 0;
        }

        .pdf-viewport {
          display: flex;
          position: relative;
          width: 100%;
          margin-top: 24px; 
          height: calc(100vh - 84px); 
          background-color: ${theme.bg};
          color: ${theme.text};
          overflow: hidden !important;
        }

        .pdf-sidebar {
          width: 260px;
          height: 100%;
          background-color: ${theme.bgSecondary};
          border-right: 1px solid ${theme.border};
          display: flex;
          flex-direction: column;
          z-index: 40;
          transition: transform 0.2s ease-in-out, margin-right 0.2s ease-in-out;
          flex-shrink: 0;
          overflow: hidden; 
        }

        @media (min-width: 1024px) {
          .pdf-sidebar.closed {
            transform: translateX(-260px);
            margin-right: -260px;
          }
        }

        @media (max-width: 1023px) {
          .pdf-sidebar {
            position: absolute;
            left: 0;
            top: 0;
            transform: translateX(-100%);
            height: 100%;
          }
          .pdf-sidebar.open {
            transform: translateX(0);
          }
        }

        .pdf-sidebar-overlay {
          position: absolute;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.4);
          z-index: 35;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
        .pdf-sidebar-overlay.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .sidebar-action-container {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
        }

        .sidebar-top-controls {
          display: flex;
          align-items: center;
          gap: 6px;
          width: 100%;
        }

        .upload-pdf-btn {
          flex: 1;
          padding: 10px 12px;
          background: linear-gradient(135deg, ${theme.accent}20, ${theme.accent}05);
          color: ${theme.text};
          border: 1px solid ${theme.accent}40;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 6px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .upload-pdf-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, ${theme.accent}20, transparent);
          transition: left 0.5s ease;
        }
        .upload-pdf-btn:hover::before {
          left: 100%;
        }
        .upload-pdf-btn:hover {
          background: ${theme.accent}30;
          border-color: ${theme.accent};
          transform: translateY(-1px);
          box-shadow: 0 4px 12px ${theme.accent}20;
        }
        .upload-pdf-btn:active {
          transform: scale(0.97);
        }

        .close-sidebar-btn {
          padding: 10px;
          background-color: transparent;
          color: ${theme.textMuted};
          border: 1px solid ${theme.border};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .close-sidebar-btn:hover {
          background-color: ${theme.hover};
          color: ${theme.text};
          transform: rotate(90deg);
        }

        .sidebar-search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background-color: ${theme.bg};
          border: 1px solid ${theme.border};
          border-radius: 6px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .sidebar-search-box:focus-within {
          border-color: ${theme.accent};
          box-shadow: 0 0 0 3px ${theme.accent}20;
        }
        .sidebar-search-box svg {
          color: ${theme.accent};
          transition: transform 0.3s ease;
        }
        .sidebar-search-box:focus-within svg {
          transform: scale(1.1);
        }
        .sidebar-search-box input {
          background: transparent;
          border: none;
          outline: none;
          color: ${theme.text};
          font-size: 13px;
          width: 100%;
        }

        .sidebar-history-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 4px 8px;
          min-height: 0; 
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .sidebar-history-scroll::-webkit-scrollbar {
          display: none;
          width: 0 !important;
          height: 0 !important;
        }

        .flat-pdf-item {
          position: relative;
          padding: 9px 12px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
          transition: all 0.2s ease;
        }
        .flat-pdf-item:hover {
          background-color: ${theme.hover};
          transform: translateX(4px);
        }
        .flat-pdf-item.active {
          background-color: ${theme.activeNav};
        }

        .pdf-item-text {
          flex: 1;
          font-size: 13.5px;
          color: ${theme.textSecondary};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-right: 4px;
        }
        .flat-pdf-item.active .pdf-item-text {
          color: ${theme.text};
        }

        .history-section-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: ${theme.textMuted};
          padding: 10px 12px 6px 12px;
          letter-spacing: 0.5px;
        }

        .workspace-main-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-width: 0;
          min-height: 0; 
          position: relative;
          background-color: ${theme.bg};
          overflow: hidden !important;
        }

        .pdf-header-row {
          height: 48px;
          border-bottom: 1px solid ${theme.border};
          padding: 0 16px;
          display: flex;
          align-items: center;
          background-color: ${theme.bg};
          flex-shrink: 0;
          gap: 8px;
        }

        .sidebar-toggle-trigger {
          background: none;
          border: none;
          cursor: pointer;
          color: ${theme.textMuted};
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .sidebar-toggle-trigger:hover {
          background-color: ${theme.hover};
          color: ${theme.text};
        }

        .pdf-header-title {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: ${theme.textSecondary};
          white-space: nowrap;
        }

        .pdf-header-file {
          font-size: 13px;
          color: ${theme.textMuted};
          margin-left: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 300px;
        }
        @media (max-width: 767px) {
          .pdf-header-file {
            max-width: 120px;
            font-size: 12px;
          }
          .pdf-header-title {
            font-size: 13px;
          }
        }

        .chat-stream-scroller {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          min-height: 0; 
          padding: 24px 0;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .chat-stream-scroller::-webkit-scrollbar {
          display: none;
          width: 0 !important;
          height: 0 !important;
        }

        .stream-row-block {
          width: 100%;
          display: flex;
          flex-direction: column;
          margin-bottom: 24px;
        }

        .stream-alignment-width {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          padding: 0 24px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 767px) {
          .stream-alignment-width {
            padding: 0 16px;
          }
        }

        .bubble-user {
          background-color: ${theme.bgSecondary};
          color: ${theme.text};
          padding: 10px 16px;
          border-radius: 20px;
          max-width: 75%;
          align-self: flex-end;
          font-size: 15px;
          line-height: 1.5;
          word-break: break-word;
          border: 1px solid ${theme.border};
          animation: slideInRight 0.3s ease;
        }
        @media (max-width: 767px) {
          .bubble-user {
            max-width: 85%;
          }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .assistant-row-layout {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          width: 100%;
          animation: slideInLeft 0.3s ease;
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .assistant-avatar-square {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          background: linear-gradient(135deg, ${theme.accent}, ${theme.accent}80);
          color: ${isDark ? '#131314' : '#ffffff'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
          border: 1px solid ${theme.border};
          transition: transform 0.3s ease;
        }
        .assistant-avatar-square:hover {
          transform: scale(1.05);
        }

        .bubble-assistant {
          flex: 1;
          background: transparent;
          color: ${theme.text};
          padding: 4px 0 0 0;
          font-size: 15px;
          line-height: 1.6;
        }

        .flat-error-banner {
          background-color: rgba(239, 68, 68, 0.06);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14.5px;
          width: 100%;
        }

        .pdf-input-dock {
          padding: 0 24px 24px 24px;
          background-color: ${theme.bg};
          flex-shrink: 0;
        }
        @media (max-width: 767px) {
          .pdf-input-dock {
            padding: 0 16px 16px 16px;
            padding-bottom: calc(12px + env(safe-area-inset-bottom));
          }
        }

        .input-bar-capsule {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          position: relative;
          background-color: ${theme.bgSecondary};
          border: 1px solid ${theme.border};
          border-radius: 20px;
          display: flex;
          align-items: flex-end;
          padding: 8px 12px;
          box-sizing: border-box;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .input-bar-capsule:focus-within {
          border-color: ${theme.accent};
          box-shadow: 0 0 0 3px ${theme.accent}20;
        }

        .pdf-textarea {
          flex: 1;
          padding: 8px 36px 8px 8px;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          color: ${theme.text};
          font-size: 15px;
          line-height: 1.4;
          font-family: inherit;
          max-height: 200px;
          box-sizing: border-box;
          display: block;
        }

        .send-action-btn {
          position: absolute;
          right: 12px;
          bottom: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${theme.accent}, ${theme.accent}80);
          color: ${theme.bg};
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .send-action-btn:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 4px 12px ${theme.accent}40;
        }
        .send-action-btn:active:not(:disabled) {
          transform: scale(0.95);
        }
        .send-action-btn:disabled {
          background: ${theme.border};
          color: ${theme.textMuted};
          cursor: not-allowed;
          opacity: 0.4;
        }

        .welcome-screen-minimal {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding: 40px 24px;
          text-align: center;
        }

        .welcome-avatar-icon {
          font-size: 28px;
          margin-bottom: 16px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .welcome-heading-flat {
          color: ${theme.text};
          font-size: 20px;
          font-weight: 500;
          margin: 0 0 24px 0;
        }

        .suggestion-chips-flow-layout {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          width: 100%;
          max-width: 640px;
        }

        .compact-suggestion-pill-btn {
          padding: 10px 18px;
          background-color: ${theme.bgSecondary};
          border: 1px solid ${theme.border};
          border-radius: 20px;
          font-size: 13px;
          color: ${theme.textSecondary};
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .compact-suggestion-pill-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, ${theme.accent}20, transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .compact-suggestion-pill-btn:hover {
          background: ${theme.accent}20;
          border-color: ${theme.accent};
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 4px 16px ${theme.accent}20;
          color: ${theme.text};
        }
        .compact-suggestion-pill-btn:hover::before {
          opacity: 1;
        }
        .compact-suggestion-pill-btn:active {
          transform: scale(0.97);
        }

        .disclaimer-text-flat {
          font-size: 11px;
          color: ${theme.textMuted};
          margin: 12px 0 0 0;
          text-align: center;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          animation: fadeIn 0.2s ease;
        }
        .modal-content {
          background: ${theme.bgCard};
          border: 1px solid ${theme.border};
          border-radius: 16px;
          padding: 32px;
          max-width: 460px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .modal-title {
          font-size: 18px;
          font-weight: 600;
          color: ${theme.text};
        }
        .modal-close {
          background: none;
          border: none;
          color: ${theme.textMuted};
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .modal-close:hover {
          color: ${theme.text};
          transform: rotate(90deg);
        }
        .drop-zone {
          border: 2px dashed ${theme.border};
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .drop-zone:hover {
          border-color: ${theme.accent};
          background: ${theme.accent}10;
          transform: scale(1.02);
        }
        .drop-zone-icon {
          font-size: 40px;
          margin-bottom: 12px;
          animation: float 3s ease-in-out infinite;
        }
        .drop-zone-text {
          color: ${theme.textSecondary};
          font-size: 14px;
        }
        .drop-zone-text span {
          color: ${theme.accent};
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .drop-zone-text span:hover {
          text-decoration: underline;
        }
        .upload-progress {
          color: ${theme.text};
          font-size: 14px;
          padding: 20px;
        }
        .typing-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: ${theme.textMuted};
          margin: 0 2px;
          animation: dotPulse 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      <div className="pdf-viewport" ref={viewportRef}>
        <div 
          className={`pdf-sidebar-overlay ${sidebarOpen ? "visible" : ""}`} 
          onClick={() => setSidebarOpen(false)}
        />

        <aside className={`pdf-sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-action-container">
            <div className="sidebar-top-controls">
              <button 
                className="upload-pdf-btn" 
                onClick={() => setShowUploadModal(true)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <span>📤 Upload PDF</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>

              <button 
                className="close-sidebar-btn" 
                onClick={() => setSidebarOpen(false)}
                title="Close sidebar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <path d="M14 15l-3-3 3-3" />
                </svg>
              </button>
            </div>

            <div className="sidebar-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search PDFs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-history-scroll">
            {loadingPdfs ? (
              <div style={{ padding: "16px", textAlign: "center" }}>
                <span style={{ color: theme.textMuted, fontSize: "12px" }}>Loading...</span>
              </div>
            ) : filteredPdfs.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center" }}>
                <span style={{ color: theme.textMuted, fontSize: "12px" }}>No PDFs found</span>
              </div>
            ) : (
              <>
                {pinnedPdfs.length > 0 && (
                  <>
                    <div className="history-section-title">📌 Pinned</div>
                    {pinnedPdfs.map(pdf => renderPdfItem(pdf))}
                  </>
                )}

                {recentPdfs.length > 0 && (
                  <>
                    <div className="history-section-title" style={{ marginTop: pinnedPdfs.length > 0 ? "12px" : "0" }}>📄 Recent</div>
                    {recentPdfs.map(pdf => renderPdfItem(pdf))}
                  </>
                )}
              </>
            )}
          </div>

          <div style={{ padding: "12px", borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "11px", color: theme.textMuted }}>⚡ Powered by Studora AI</span>
          </div>
        </aside>

        <main className="workspace-main-panel">
          <header className="pdf-header-row">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="sidebar-toggle-trigger"
              title="Toggle sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1 className="pdf-header-title">📄 PDF Assistant</h1>
            {activePdf && (
              <span className="pdf-header-file">
                {window.innerWidth <= 767 ? truncateFileName(activePdf.originalName, 12) : activePdf.originalName}
                <span style={{ color: theme.textFaint, marginLeft: "4px" }}>
                  ({activePdf.pageCount || 0}p)
                </span>
              </span>
            )}
          </header>

          <div className="chat-stream-scroller">
            {messages.length === 0 ? (
              <div className="welcome-screen-minimal">
                <div className="welcome-avatar-icon">📄</div>
                <h2 className="welcome-heading-flat">How can I help with your document?</h2>
                
                <div className="suggestion-chips-flow-layout">
                  {SUGGESTIONS.map((s) => (
                    <button 
                      key={s} 
                      className="compact-suggestion-pill-btn" 
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="stream-row-block">
                  <div className="stream-alignment-width">
                    
                    {msg.role === "user" ? (
                      <div className="bubble-user">
                        <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                      </div>
                    ) : (
                      <div className="assistant-row-layout">
                        <div className="assistant-avatar-square">AI</div>
                        <div className={msg.error ? "flat-error-banner" : "bubble-assistant"}>
                          {msg.loading ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "3px", padding: "6px 0" }}>
                              <span className="typing-dot" />
                              <span className="typing-dot" />
                              <span className="typing-dot" />
                            </div>
                          ) : (
                            <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="pdf-input-dock">
            <div className="input-bar-capsule">
              <textarea
                ref={inputRef}
                className="pdf-textarea"
                placeholder={activePdf ? "Ask about this PDF..." : "Upload a PDF to get started"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={!activePdf}
              />
              <button
                className="send-action-btn"
                onClick={sendMessage}
                disabled={loading || !input.trim() || !activePdf}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </button>
            </div>
            <p className="disclaimer-text-flat">
              ✨ AI can make errors. Verify important information.
            </p>
          </div>
        </main>
      </div>

      {showUploadModal && (
        <div className="modal-overlay" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">📤 Upload PDF</h2>
              <button className="modal-close" onClick={() => !uploading && setShowUploadModal(false)}>✕</button>
            </div>
            
            <input
              ref={modalFileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              style={{ display: "none" }}
              id="modal-pdf-upload"
              disabled={uploading}
            />

            <label htmlFor="modal-pdf-upload" style={{ display: "block", cursor: uploading ? "not-allowed" : "pointer" }}>
              <div className="drop-zone">
                {uploading ? (
                  <div className="upload-progress">
                    <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "8px" }}>
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                    <p>{uploadProgress}</p>
                  </div>
                ) : (
                  <>
                    <div className="drop-zone-icon">📥</div>
                    <div className="drop-zone-text">
                      Drop your PDF here, or <span>Browse Files</span>
                      <p style={{ fontSize: "12px", color: theme.textMuted, marginTop: "8px" }}>📏 Max 10MB</p>
                    </div>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default PdfAI;