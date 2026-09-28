/**
 * The frontend's remark-math only understands $...$ and $$...$$, but models
 * sometimes write \( ... \) or \[ ... \]. The backend fixes this for normal
 * answers; streamed answers are fixed here, on the full text so far.
 */
export function normalizeMath(text) {
  return text
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `$$${m}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m}$`);
}

/** The tutor ends answers with "[Source: chemistry/class11/chapter1_...]". We show chips instead. */
export function stripSourceLines(text) {
  return text.replace(/\n*\s*\[Source:[^\]]*\]\s*/g, "\n").trimEnd();
}

export function prepareAnswer(text) {
  return stripSourceLines(normalizeMath(text));
}

const SMALL_WORDS = new Set(["of", "and", "in", "the", "to", "a"]);

/** "chapter4_structure_of_atom" -> { number: 4, title: "Structure of Atom" } */
export function parseChapter(id) {
  const m = /^chapter(\d+)_(.+)$/.exec(id || "");
  if (!m) return { number: null, title: id };
  const title = m[2]
    .split("_")
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
  return { number: Number(m[1]), title };
}

/** Collapses the retrieved chunks to one entry per chapter, keeping the best match score. */
export function uniqueSources(sources = []) {
  const best = new Map();
  for (const s of sources) {
    const prev = best.get(s.chapter);
    if (!prev || s.score > prev.score) best.set(s.chapter, s);
  }
  return [...best.values()].sort((a, b) => b.score - a.score);
}

export function makeTitle(question) {
  const clean = question.replace(/\s+/g, " ").trim();
  return clean.length > 48 ? clean.slice(0, 46).trimEnd() + "…" : clean;
}
