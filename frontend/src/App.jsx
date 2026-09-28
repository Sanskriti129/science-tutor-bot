import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "katex/dist/katex.min.css";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Message from "./components/Message";
import Composer from "./components/Composer";
import EmptyState from "./components/EmptyState";
import { MenuIcon, MoonIcon, PlusIcon, SunIcon } from "./components/icons";
import { fetchChapters, streamChat } from "./lib/api";
import { makeTitle } from "./lib/format";
import { load, save } from "./lib/storage";

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const HISTORY_TURNS = 6;

// If the page was closed mid-answer, don't leave a message stuck "thinking"
function loadChats() {
  return load("stb.chats", []).map((c) => ({
    ...c,
    messages: c.messages.map((m) =>
      m.pending ? { ...m, pending: false, error: m.content ? null : "This answer was interrupted." } : m
    ),
  }));
}

function initialTheme() {
  const saved = load("stb.theme", null);
  if (saved) return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function friendlyError(err) {
  if (err instanceof TypeError) {
    return "Can't reach the tutor server. Make sure the backend is running on port 8000.";
  }
  return err.message || "Something went wrong. Please try again.";
}

export default function App() {
  const [chats, setChats] = useState(loadChats);
  const [activeId, setActiveId] = useState(() => load("stb.active", null));
  const [style, setStyle] = useState(() => load("stb.style", "detailed"));
  const [theme, setTheme] = useState(initialTheme);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [chaptersError, setChaptersError] = useState(false);

  const abortRef = useRef(null);
  const scrollRef = useRef(null);
  const stickToBottom = useRef(true);
  const inputRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeId) || null;
  const messages = useMemo(() => activeChat?.messages ?? [], [activeChat]);
  const sortedChats = useMemo(
    () => [...chats].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)),
    [chats]
  );

  // ── persistence ────────────────────────────────────────
  useEffect(() => {
    if (!streaming) save("stb.chats", chats); // skip saving on every streamed token
  }, [chats, streaming]);
  useEffect(() => save("stb.active", activeId), [activeId]);
  useEffect(() => save("stb.style", style), [style]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    save("stb.theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchChapters().then(setChapters).catch(() => setChaptersError(true));
  }, []);

  // ── auto-scroll (only when the reader is already near the bottom) ──
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = scrollRef.current;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  // ── chat state helpers ─────────────────────────────────
  const updateLastMessage = useCallback((chatId, fn) => {
    setChats((cs) =>
      cs.map((c) =>
        c.id !== chatId
          ? c
          : { ...c, messages: c.messages.map((m, i) => (i === c.messages.length - 1 ? fn(m) : m)) }
      )
    );
  }, []);

  const ask = async (question, chatId, prior) => {
    const history = prior
      .filter((m) => m.content && !m.error)
      .slice(-HISTORY_TURNS)
      .map(({ role, content }) => ({ role, content }));

    const controller = new AbortController();
    abortRef.current = controller;
    setStreaming(true);
    stickToBottom.current = true;

    try {
      await streamChat({
        question,
        history,
        style,
        signal: controller.signal,
        onSources: (sources) => updateLastMessage(chatId, (m) => ({ ...m, sources })),
        onToken: (t) => updateLastMessage(chatId, (m) => ({ ...m, content: m.content + t })),
      });
      updateLastMessage(chatId, (m) => ({ ...m, pending: false }));
    } catch (err) {
      if (err.name === "AbortError") {
        updateLastMessage(chatId, (m) => ({
          ...m,
          pending: false,
          error: m.content ? null : "Stopped before the tutor answered.",
        }));
      } else {
        updateLastMessage(chatId, (m) => ({ ...m, pending: false, error: friendlyError(err) }));
      }
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }
  };

  const send = (textArg, { fresh = false } = {}) => {
    const text = (textArg ?? input).trim();
    if (!text || streaming) return;

    const reuse = activeChat && !fresh;
    const chatId = reuse ? activeChat.id : newId();
    const prior = reuse ? activeChat.messages : [];
    const userMsg = { role: "user", content: text };
    const botMsg = { role: "assistant", content: "", sources: [], pending: true };

    setChats((cs) => {
      const base = reuse ? cs : [{ id: chatId, title: makeTitle(text), messages: [], createdAt: Date.now() }, ...cs];
      return base.map((c) =>
        c.id === chatId ? { ...c, messages: [...c.messages, userMsg, botMsg], updatedAt: Date.now() } : c
      );
    });
    setActiveId(chatId);
    setInput("");
    setSidebarOpen(false);
    ask(text, chatId, prior);
  };

  // Re-ask the last question (used by both "Regenerate" and "Try again")
  const regenerate = () => {
    if (!activeChat || streaming) return;
    const msgs = activeChat.messages;
    const lastUser = msgs[msgs.length - 2];
    if (!lastUser || lastUser.role !== "user") return;

    const prior = msgs.slice(0, -2);
    setChats((cs) =>
      cs.map((c) =>
        c.id === activeChat.id
          ? { ...c, messages: [...msgs.slice(0, -1), { role: "assistant", content: "", sources: [], pending: true }], updatedAt: Date.now() }
          : c
      )
    );
    ask(lastUser.content, activeChat.id, prior);
  };

  const stop = () => abortRef.current?.abort();

  const newChat = () => {
    stop();
    setActiveId(null);
    setInput("");
    setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const selectChat = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
    stickToBottom.current = true;
  };

  const deleteChat = (id) => {
    if (id === activeId) {
      stop();
      setActiveId(null);
    }
    setChats((cs) => cs.filter((c) => c.id !== id));
  };

  const pickChapter = (ch) =>
    send(
      `Give me an overview of Chapter ${ch.number}: ${ch.title}. Cover the key concepts, the important formulas, and what matters most for exams.`,
      { fresh: true }
    );

  return (
    <div className="shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={sortedChats}
        activeId={activeId}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        onNewChat={newChat}
        chapters={chapters}
        chaptersError={chaptersError}
        onPickChapter={pickChapter}
      />

      <main className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <MenuIcon />
          </button>
          <h2 className="topbar-title">{activeChat?.title || "New chat"}</h2>
          <div className="topbar-actions">
            <button
              className="icon-btn"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={theme === "dark" ? "Light theme" : "Dark theme"}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <button className="icon-btn" onClick={newChat} aria-label="New chat" title="New chat">
              <PlusIcon />
            </button>
          </div>
        </header>

        <div className="chat-scroll" ref={scrollRef} onScroll={onScroll}>
          <div className="chat-column">
            {messages.length === 0 ? (
              <EmptyState chapterCount={chapters.length} onPick={(t) => send(t)} />
            ) : (
              messages.map((m, i) => (
                <Message
                  key={i}
                  message={m}
                  isLast={i === messages.length - 1}
                  onRegenerate={regenerate}
                  onRetry={regenerate}
                />
              ))
            )}
          </div>
        </div>

        <Composer
          value={input}
          onChange={setInput}
          onSend={() => send()}
          onStop={stop}
          streaming={streaming}
          style={style}
          onStyleChange={setStyle}
          inputRef={inputRef}
        />
      </main>
    </div>
  );
}
