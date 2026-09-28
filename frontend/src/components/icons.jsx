// Minimal inline SVG icon set (stroke-based, inherits currentColor).
const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const make = (paths) =>
  function Icon(props) {
    return <svg {...base} {...props}>{paths}</svg>;
  };

export const FlaskIcon = make(<>
  <path d="M9 3h6" />
  <path d="M10 3v6.2L4.6 18.4A1.7 1.7 0 0 0 6.1 21h11.8a1.7 1.7 0 0 0 1.5-2.6L14 9.2V3" />
  <path d="M7.2 15h9.6" />
</>);
export const PlusIcon = make(<><path d="M12 5v14" /><path d="M5 12h14" /></>);
export const SendIcon = make(<><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></>);
export const StopIcon = make(<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none" />);
export const CopyIcon = make(<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></>);
export const CheckIcon = make(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const RefreshIcon = make(<><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 5v6h-6" /></>);
export const SunIcon = make(<>
  <circle cx="12" cy="12" r="4" />
  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
</>);
export const MoonIcon = make(<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />);
export const MenuIcon = make(<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>);
export const CloseIcon = make(<><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>);
export const TrashIcon = make(<>
  <path d="M4 7h16" /><path d="M10 11v6M14 11v6" />
  <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" /><path d="M9 7V4h6v3" />
</>);
export const BookIcon = make(<>
  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
</>);
export const ChatIcon = make(<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12Z" />);
export const ChevronIcon = make(<path d="m9 6 6 6-6 6" />);
export const AlertIcon = make(<><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5" /><path d="M12 16.5h.01" /></>);

// Suggestion-card icons
export const BulbIcon = make(<><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z" /></>);
export const CalcIcon = make(<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8" /><path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" /></>);
export const CompareIcon = make(<><path d="M7 4v16" /><path d="M17 4v16" /><path d="m3 8 4-4 4 4" /><path d="m13 16 4 4 4-4" /></>);
export const QuestionIcon = make(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6" /><path d="M12 17h.01" /></>);
