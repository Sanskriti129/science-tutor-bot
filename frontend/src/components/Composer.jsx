import { useEffect, useRef } from "react";
import { SendIcon, StopIcon } from "./icons";

const STYLES = [
  { id: "detailed", label: "Detailed", hint: "Full explanation with concept, steps and common mistakes" },
  { id: "simple", label: "Simple", hint: "Short, plain-language explanation with an analogy" },
  { id: "exam", label: "Exam-ready", hint: "Crisp points and formulas for revision" },
];

export default function Composer({ value, onChange, onSend, onStop, streaming, style, onStyleChange, inputRef }) {
  const localRef = useRef(null);
  const ref = inputRef || localRef;

  // Grow the textarea with its content, up to a limit
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!value) {
      // Empty: let CSS size it (measuring before layout settles gives a bogus height)
      el.style.height = "";
      return;
    }
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value, ref]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = value.trim().length > 0 && !streaming;

  return (
    <div className="composer-wrap">
      <div className="composer">
        <div className="style-picker" role="radiogroup" aria-label="Answer style">
          {STYLES.map((s) => (
            <button
              key={s.id}
              role="radio"
              aria-checked={style === s.id}
              className={style === s.id ? "is-active" : ""}
              onClick={() => onStyleChange(s.id)}
              title={s.hint}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="composer-row">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a science question…"
            rows={1}
            aria-label="Your question"
          />
          {streaming ? (
            <button className="send-btn is-stop" onClick={onStop} aria-label="Stop generating">
              <StopIcon />
            </button>
          ) : (
            <button className="send-btn" onClick={onSend} disabled={!canSend} aria-label="Send">
              <SendIcon />
            </button>
          )}
        </div>
      </div>
      <p className="composer-hint">
        <kbd>Enter</kbd> to send · <kbd>Shift</kbd> + <kbd>Enter</kbd> for a new line · Always double-check important answers with your textbook.
      </p>
    </div>
  );
}
