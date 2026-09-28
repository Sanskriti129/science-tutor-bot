import { useState } from "react";
import { BookIcon, ChatIcon, ChevronIcon, CloseIcon, FlaskIcon, PlusIcon, TrashIcon } from "./icons";

export default function Sidebar({
  open,
  onClose,
  chats,
  activeId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  chapters,
  chaptersError,
  onPickChapter,
}) {
  const [chaptersOpen, setChaptersOpen] = useState(true);

  return (
    <>
      <div className={`scrim${open ? " is-open" : ""}`} onClick={onClose} aria-hidden="true" />

      <aside className={`sidebar${open ? " is-open" : ""}`} aria-label="Chats and chapters">
        <div className="brand">
          <span className="brand-mark"><FlaskIcon width={18} height={18} /></span>
          <span className="brand-text">
            <span className="brand-name">Science Tutor</span>
            <span className="brand-sub">Class 11 · 12</span>
          </span>
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        <button className="new-chat" onClick={onNewChat}>
          <PlusIcon width={16} height={16} />
          New chat
        </button>

        <div className="sidebar-scroll">
          <section className="side-section">
            <h2 className="side-heading">Recent</h2>
            {chats.length === 0 ? (
              <p className="side-empty">Your chats will appear here.</p>
            ) : (
              <ul className="chat-list">
                {chats.map((c) => (
                  <li key={c.id} className={c.id === activeId ? "is-active" : ""}>
                    <button className="chat-item" onClick={() => onSelectChat(c.id)} title={c.title}>
                      <ChatIcon width={15} height={15} />
                      <span>{c.title}</span>
                    </button>
                    <button className="chat-delete" onClick={() => onDeleteChat(c.id)} aria-label={`Delete chat: ${c.title}`}>
                      <TrashIcon width={14} height={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="side-section">
            <button
              className="side-heading side-toggle"
              onClick={() => setChaptersOpen((o) => !o)}
              aria-expanded={chaptersOpen}
            >
              <ChevronIcon width={14} height={14} className={chaptersOpen ? "rot" : ""} />
              Chemistry · Class 11
            </button>
            {chaptersOpen && (
              chaptersError ? (
                <p className="side-empty">Start the backend to see chapters.</p>
              ) : (
                <ul className="chapter-list">
                  {chapters.map((ch) => (
                    <li key={ch.id}>
                      <button className="chapter-item" onClick={() => onPickChapter(ch)} title={`Overview of ${ch.title}`}>
                        <span className="chapter-num">{ch.number}</span>
                        <span>{ch.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            )}
          </section>
        </div>

        <div className="sidebar-foot">
          <BookIcon width={14} height={14} />
          Answers come from your notes first
        </div>
      </aside>
    </>
  );
}
