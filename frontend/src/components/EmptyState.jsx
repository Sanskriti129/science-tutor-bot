import { BulbIcon, CalcIcon, CompareIcon, FlaskIcon, QuestionIcon } from "./icons";

const SUGGESTIONS = [
  { icon: BulbIcon, kind: "Concept", text: "Explain the mole concept with an example" },
  { icon: CalcIcon, kind: "Numerical", text: "How many moles of CO₂ are there in 22 g of CO₂?" },
  { icon: CompareIcon, kind: "Compare", text: "What is the difference between sigma and pi bonds?" },
  { icon: QuestionIcon, kind: "Why?", text: "Why does atomic radius decrease across a period?" },
];

export default function EmptyState({ chapterCount, onPick }) {
  return (
    <div className="empty">
      <div className="empty-mark" aria-hidden="true">
        <FlaskIcon width={28} height={28} />
      </div>
      <h1>What are we learning <span className="grad">today?</span></h1>
      <p className="empty-sub">
        Ask a question, a numerical, or a derivation. Answers follow your
        textbook's method, step by step.
      </p>

      <div className="suggestions">
        {SUGGESTIONS.map(({ icon: Icon, kind, text }) => (
          <button key={text} className="suggestion" onClick={() => onPick(text)}>
            <span className="suggestion-kind">
              <Icon width={15} height={15} />
              {kind}
            </span>
            <span className="suggestion-text">{text}</span>
          </button>
        ))}
      </div>

      {chapterCount > 0 && (
        <p className="empty-note">
          Notes loaded: <b>Class 11 Chemistry</b> · {chapterCount} chapters
        </p>
      )}
    </div>
  );
}
