export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Streams an answer from the backend's Server-Sent Events endpoint.
 * Calls onSources once, then onToken for every piece of text as it arrives.
 */
export async function streamChat({ question, history, style, signal, onSources, onToken }) {
  const res = await fetch(`${API_BASE}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, chat_history: history, style }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`The tutor server responded with ${res.status}.`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });

    // Events are separated by a blank line
    let boundary;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      const line = raw.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;

      const event = JSON.parse(line.slice(6));
      if (event.type === "sources") onSources(event.sources);
      else if (event.type === "token") onToken(event.text);
      else if (event.type === "error") throw new Error(event.message);
      else if (event.type === "done") return;
    }
  }
}

export async function fetchChapters() {
  const res = await fetch(`${API_BASE}/api/chapters`);
  if (!res.ok) throw new Error("Could not load chapters");
  const data = await res.json();
  return data.chapters;
}
