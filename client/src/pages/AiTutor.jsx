import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import api from "../services/api";

function AiTutor() {
  const { colors: c } = useTheme();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const viewportRef = useRef(null);

  // New states for pin functionality
  const [pinnedIds, setPinnedIds] = useState([]);
  const [activeMenuChatId, setActiveMenuChatId] = useState(null);

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

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const res = await api.get("/chat");
      setChats(res.data.chats || []);
    } catch {
      console.error("Failed to load chats");
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats();
    // Load local pinning states if available
    const savedPins = localStorage.getItem("studora_pinned_chats");
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

  // Handle clicking outside custom contextual menus to clear overlays
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuChatId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const loadChat = async (chatId) => {
    try {
      const res = await api.get(`/chat/${chatId}`);
      setActiveChatId(chatId);
      setMessages(res.data.chat.messages || []);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    } catch {
      console.error("Failed to load chat");
    }
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "...", loading: true }]);
    setLoading(true);

    try {
      const res = await api.post("/chat/message", {
        message: userMessage,
        chatId: activeChatId || undefined,
      });

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: res.data.reply },
      ]);

      setActiveChatId(res.data.chatId);
      fetchChats();
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Sorry, I encountered an error. Please try again.", error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Delete this chat?")) return;
    try {
      await api.delete(`/chat/${chatId}`);
      if (activeChatId === chatId) startNewChat();
      // Also clean up pinned configuration if deleted
      const updatedPins = pinnedIds.filter(id => id !== chatId);
      setPinnedIds(updatedPins);
      localStorage.setItem("studora_pinned_chats", JSON.stringify(updatedPins));
      fetchChats();
    } catch {
      console.error("Failed to delete chat");
    }
  };

  // Toggle Pinned Configuration Logic
  const togglePinChat = (chatId, e) => {
    e.stopPropagation();
    setActiveMenuChatId(null);
    if (pinnedIds.includes(chatId)) {
      const updated = pinnedIds.filter(id => id !== chatId);
      setPinnedIds(updated);
      localStorage.setItem("studora_pinned_chats", JSON.stringify(updated));
    } else {
      if (pinnedIds.length >= 10) {
        alert("You can only pin up to 10 items\n\nUnpin an item to pin something new");
        return;
      }
      const updated = [...pinnedIds, chatId];
      setPinnedIds(updated);
      localStorage.setItem("studora_pinned_chats", JSON.stringify(updated));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Categorize histories safely
  const pinnedChats = filteredChats.filter(chat => pinnedIds.includes(chat._id));
  const recentChats = filteredChats.filter(chat => !pinnedIds.includes(chat._id));

  const SUGGESTIONS = [
    "Explain Newton's laws of motion",
    "How does photosynthesis work?",
    "What is the Pythagorean theorem?",
    "Explain DNA replication simply",
    "What caused World War 1?",
    "How do computers work?",
  ];

  const formatMessage = (content) => {
    if (!content) return "";
    let html = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre style="background:${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)'};padding:14px;border-radius:8px;overflow-x:auto;border:1px solid ${theme.border};font-family:monospace;margin:12px 0;font-size:13px;line-height:1.5;color:inherit;"><code style="background:transparent;padding:0;border-radius:0;font-size:inherit;">${code.trim()}</code></pre>`;
    });

    html = html
      .replace(/\*\*(.*?)\*"/g, "<strong style='font-weight:600;color:inherit;'>$1</strong>")
      .replace(/\*(.*?)\*(?!\*)/g, "<em style='font-style:italic;'>$1</em>")
      .replace(/`(.*?)`/g, `<code style="background:${theme.bgSecondary};padding:2px 5px;border-radius:4px;font-size:13px;font-family:monospace;border:1px solid ${theme.border};color:inherit;">$1</code>`);

    html = html.replace(/^\s*-\s+(.*?)$/gm, `<li style="margin-left:20px;margin-bottom:4px;list-style-type:disc;">$1</li>`);
    html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, `<li style="margin-left:20px;margin-bottom:4px;list-style-type:decimal;">$1</li>`);

    return html.replace(/\n/g, "<br/>");
  };

  // Helper renderer block to lower code size and handle option context layout updates cleanly
  const renderChatItem = (chat) => {
    const isPinned = pinnedIds.includes(chat._id);
    return (
      <div
        key={chat._id}
        className={`flat-chat-item ${activeChatId === chat._id ? "active" : ""}`}
        onClick={() => loadChat(chat._id)}
        style={{ position: 'relative' }}
      >
        <span className="chat-item-text">{chat.title}</span>
        
        {/* Dynamic Context Options Menu Button Container */}
        <div className="flat-action-wrapper" style={{ position: 'absolute', right: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button 
            className="flat-menu-trigger-btn"
            style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuChatId(activeMenuChatId === chat._id ? null : chat._id);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="5" r="1.5"></circle>
              <circle cx="12" cy="12" r="1.5"></circle>
              <circle cx="12" cy="19" r="1.5"></circle>
            </svg>
          </button>
        </div>

        {/* Floating Context Action Overlay */}
        {activeMenuChatId === chat._id && (
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
              onClick={(e) => togglePinChat(chat._id, e)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', background: 'none', border: 'none', color: theme.text, fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isPinned ? 'rotate(45deg)' : 'none' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{isPinned ? "Unpin" : "Pin"}</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveMenuChatId(null); deleteChat(chat._id, e); }}
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

        .chatgpt-viewport {
          display: flex;
          position: relative;
          width: 100%;
          margin-top: 24px; 
          height: calc(100vh - 84px); 
          background-color: ${theme.bg};
          color: ${theme.text};
          overflow: hidden !important;
        }

        .chatgpt-sidebar {
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
          .chatgpt-sidebar.closed {
            transform: translateX(-260px);
            margin-right: -260px;
          }
        }

        @media (max-width: 1023px) {
          .chatgpt-sidebar {
            position: absolute;
            left: 0;
            top: 0;
            transform: translateX(-100%);
            height: 100%;
          }
          .chatgpt-sidebar.open {
            transform: translateX(0);
          }
        }

        .chatgpt-sidebar-overlay {
          position: absolute;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.4);
          z-index: 35;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
        .chatgpt-sidebar-overlay.visible {
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

        .new-chat-btn-flat {
          flex: 1;
          padding: 10px 12px;
          background-color: transparent;
          color: ${theme.text};
          border: 1px solid ${theme.border};
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 6px;
          transition: background-color 0.15s ease;
        }
        .new-chat-btn-flat:hover {
          background-color: ${theme.hover};
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
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .close-sidebar-btn:hover {
          background-color: ${theme.hover};
          color: ${theme.text};
        }

        .sidebar-search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background-color: ${theme.bg};
          border: 1px solid ${theme.border};
          border-radius: 6px;
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
          scrollbar-width: none;            /* Firefox */
          -ms-overflow-style: none;         /* IE and Edge */
        }
        .sidebar-history-scroll::-webkit-scrollbar {
          display: none;                    /* WebKit (Chrome, Safari) */
          width: 0 !important;
          height: 0 !important;
        }

        .flat-chat-item {
          position: relative;
          padding: 9px 12px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 2px;
          transition: background-color 0.15s ease;
        }
        .flat-chat-item:hover {
          background-color: ${theme.hover};
        }
        .flat-chat-item.active {
          background-color: ${theme.activeNav};
        }

        .chat-item-text {
          flex: 1;
          font-size: 13.5px;
          color: ${theme.textSecondary};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-right: 24px;
        }
        .flat-chat-item.active .chat-item-text {
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

        .chatgpt-header-row {
          height: 48px;
          border-bottom: 1px solid ${theme.border};
          padding: 0 16px;
          display: flex;
          align-items: center;
          background-color: ${theme.bg};
          flex-shrink: 0;
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
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .sidebar-toggle-trigger:hover {
          background-color: ${theme.hover};
          color: ${theme.text};
        }

        .chatgpt-header-title {
          margin: 0;
          margin-left: 12px;
          font-size: 14px;
          font-weight: 500;
          color: ${theme.textSecondary};
        }

        .chat-stream-scroller {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          min-height: 0; 
          padding: 24px 0;
          scroll-behavior: smooth;
          scrollbar-width: none;            /* Firefox */
          -ms-overflow-style: none;         /* IE and Edge */
        }
        .chat-stream-scroller::-webkit-scrollbar {
          display: none;                    /* WebKit (Chrome, Safari) */
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

        .bubble-chatgpt-user {
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
        }
        @media (max-width: 767px) {
          .bubble-chatgpt-user {
            max-width: 85%;
          }
        }

        .assistant-row-layout {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          width: 100%;
        }

        .assistant-avatar-square {
          width: 30px;
          height: 30px;
          border-radius: 6px;
          background-color: ${theme.accent};
          color: ${isDark ? '#131314' : '#ffffff'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
          border: 1px solid ${theme.border};
        }

        .bubble-chatgpt-assistant {
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

        .chatgpt-input-dock {
          padding: 0 24px 24px 24px;
          background-color: ${theme.bg};
          flex-shrink: 0;
        }
        @media (max-width: 767px) {
          .chatgpt-input-dock {
            padding: 0 16px 16px 16px;
            padding-bottom: calc(12px + env(safe-area-inset-bottom));
          }
        }

        .input-bar-chatgpt-capsule {
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
        }

        .chatgpt-textarea {
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

        .chatgpt-send-action-btn {
          position: absolute;
          right: 12px;
          bottom: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: ${theme.text};
          color: ${theme.bg};
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.15s ease, background-color 0.15s ease;
        }
        .chatgpt-send-action-btn:hover:not(:disabled) {
          opacity: 0.85;
        }
        .chatgpt-send-action-btn:disabled {
          background-color: ${theme.border};
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
          color: ${theme.accent};
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
          padding: 8px 14px;
          background-color: ${theme.bgSecondary};
          border: 1px solid ${theme.border};
          border-radius: 18px;
          font-size: 13px;
          color: ${theme.textSecondary};
          cursor: pointer;
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }
        .compact-suggestion-pill-btn:hover {
          background-color: ${theme.hover};
          border-color: ${theme.textMuted};
        }

        .disclaimer-text-flat {
          font-size: 11px;
          color: ${theme.textMuted};
          margin: 12px 0 0 0;
          text-align: center;
        }
      `}</style>

      <div className="chatgpt-viewport" ref={viewportRef}>
        <div 
          className={`chatgpt-sidebar-overlay ${sidebarOpen ? "visible" : ""}`} 
          onClick={() => setSidebarOpen(false)}
        />

        <aside className={`chatgpt-sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-action-container">
            <div className="sidebar-top-controls">
              <button className="new-chat-btn-flat" onClick={startNewChat}>
                <span>New chat</span>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: theme.textMuted }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search chats..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-history-scroll">
            {loadingChats ? (
              <div style={{ padding: "16px", textAlign: "center" }}>
                <span style={{ color: theme.textMuted, fontSize: "12px" }}>Loading...</span>
              </div>
            ) : filteredChats.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center" }}>
                <span style={{ color: theme.textMuted, fontSize: "12px" }}>No chats found</span>
              </div>
            ) : (
              <>
                {/* Pinned Section Header and Iteration */}
                {pinnedChats.length > 0 && (
                  <>
                    <div className="history-section-title">Pinned</div>
                    {pinnedChats.map(chat => renderChatItem(chat))}
                  </>
                )}

                {/* Recent Section Header and Iteration */}
                {recentChats.length > 0 && (
                  <>
                    <div className="history-section-title" style={{ marginTop: pinnedChats.length > 0 ? "12px" : "0" }}>Recent</div>
                    {recentChats.map(chat => renderChatItem(chat))}
                  </>
                )}
              </>
            )}
          </div>

          <div style={{ padding: "12px", borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "11px", color: theme.textMuted }}>Powered by Gemini AI</span>
          </div>
        </aside>

        <main className="workspace-main-panel">
          <header className="chatgpt-header-row">
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
            <h1 className="chatgpt-header-title">AI Tutor STUDORA</h1>
          </header>

          <div className="chat-stream-scroller">
            {messages.length === 0 ? (
              <div className="welcome-screen-minimal">
                <div className="welcome-avatar-icon">✨</div>
                <h2 className="welcome-heading-flat">How can I help your studies today?</h2>
                
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
                      <div className="bubble-chatgpt-user">
                        <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                      </div>
                    ) : (
                      <div className="assistant-row-layout">
                        <div className="assistant-avatar-square">AI</div>
                        <div className={msg.error ? "flat-error-banner" : "bubble-chatgpt-assistant"}>
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

          <div className="chatgpt-input-dock">
            <div className="input-bar-chatgpt-capsule">
              <textarea
                ref={inputRef}
                className="chatgpt-textarea"
                placeholder="Message AI Tutor..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="chatgpt-send-action-btn"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </button>
            </div>
            <p className="disclaimer-text-flat">
              AI Tutor can make errors. Verify important parameters.
            </p>
          </div>
        </main>
      </div>
    </Layout>
  );
}

export default AiTutor;