import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { prepareAnswer, parseChapter, uniqueSources } from "../lib/format";
import { AlertIcon, BookIcon, CheckIcon, CopyIcon, FlaskIcon, RefreshIcon } from "./icons";

const markdownComponents = {
  // Wide tables scroll sideways instead of breaking the layout
  // eslint-disable-next-line no-unused-vars -- drop react-markdown's node prop so it isn't passed to the DOM
  table: ({ node, ...props }) => (
    <div className="table-wrap">
      <table {...props} />
    </div>
  ),
};

function Markdown({ text }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={markdownComponents}
    >
      {text}
    </ReactMarkdown>
  );
}

function Sources({ sources }) {
  const list = uniqueSources(sources).slice(0, 3);
  if (list.length === 0) return null;
  return (
    <div className="sources" aria-label="Sources from your notes">
      <BookIcon width={14} height={14} />
      {list.map((s) => {
        const { number, title } = parseChapter(s.chapter);
        return (
          <span key={s.chapter} className="source-chip" title={`${s.subject} · ${s.class} · match ${Math.round(s.score * 100)}%`}>
            {number != null && <b>Ch {number}</b>}
            {title}
          </span>
        );
      })}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked; nothing useful to do
    }
  };
  return (
    <button className="msg-action" onClick={copy} aria-label="Copy answer">
      {copied ? <CheckIcon width={15} height={15} /> : <CopyIcon width={15} height={15} />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function Message({ message, isLast, onRegenerate, onRetry }) {
  if (message.role === "user") {
    return (
      <div className="msg msg-user">
        <div className="bubble">{message.content}</div>
      </div>
    );
  }

  const { content, pending, error, sources } = message;
  const text = prepareAnswer(content || "");
  const thinking = pending && !content;

  return (
    <div className="msg msg-assistant">
      <div className="avatar" aria-hidden="true">
        <FlaskIcon width={17} height={17} />
      </div>

      <div className="msg-body">
        {thinking && (
          <div className="thinking" role="status">
            <span className="dot" /><span className="dot" /><span className="dot" />
            <span className="thinking-label">Checking your notes…</span>
          </div>
        )}

        {text && (
          <div className={`answer${pending ? " is-streaming" : ""}`}>
            <Markdown text={text} />
          </div>
        )}

        {error && (
          <div className="msg-error" role="alert">
            <AlertIcon width={16} height={16} />
            <span>{error}</span>
            <button onClick={onRetry}>Try again</button>
          </div>
        )}

        {!pending && !error && content && (
          <div className="msg-footer">
            <Sources sources={sources} />
            <div className="msg-actions">
              <CopyButton text={text} />
              {isLast && (
                <button className="msg-action" onClick={onRegenerate} aria-label="Regenerate answer">
                  <RefreshIcon width={15} height={15} />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(Message);
