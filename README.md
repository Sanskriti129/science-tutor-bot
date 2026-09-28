# 🔬 Science Tutor Bot

An AI tutor for Class 11/12 Science that answers from textbook notes first.
It uses retrieval-augmented generation (RAG): each question is matched against
chapter notes in a FAISS vector index, and the most relevant passages are sent
to an LLM on Groq, which writes a structured answer (concept, steps, key insight,
common mistake) with properly rendered maths.

## Features

- **Grounded answers**: retrieves the closest notes and cites the chapter they came from
- **Refuses off-topic questions** instead of guessing (confidence threshold on retrieval)
- **Streaming responses**: answers appear word by word, with a Stop button
- **Answer styles**: Detailed, Simple, or Exam-ready
- **Chapter browser**: one click for an overview of any chapter
- **Chat history** saved in the browser, **light/dark theme**, mobile-friendly layout
- LaTeX maths via KaTeX, tables via GitHub-flavoured Markdown

Notes currently cover **Class 11 Chemistry (16 chapters)**.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 19, Vite, react-markdown, remark-math + rehype-katex |
| Backend | FastAPI, Server-Sent Events for streaming |
| Retrieval | sentence-transformers (`all-MiniLM-L6-v2`), FAISS |
| LLM | Groq (`openai/gpt-oss-120b`) via LangChain |

## Run it locally

**1. Backend**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows  (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
```

Create `backend/.env`:

```
GROQ_API_KEY=your_groq_key_here
```

Get a free key at https://console.groq.com/keys. Then start the server:

```bash
uvicorn main:app --reload --port 8000
```

**2. Frontend** (in a second terminal)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

In VS Code, **Ctrl+Shift+B** starts both at once (see `.vscode/tasks.json`).

## API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | Ask a question, get the full answer + sources |
| POST | `/api/chat/stream` | Same, streamed as Server-Sent Events |
| GET | `/api/chapters` | Chapters the tutor has notes for |

Request body: `{ "question": "...", "chat_history": [...], "style": "detailed" | "simple" | "exam" }`

## Project structure

```
backend/
  main.py              FastAPI app
  config.py            settings (models, thresholds, paths)
  routers/chat.py      API endpoints
  services/
    retriever.py       FAISS search over the notes
    llm_router.py      prompt building + Groq calls
    ingest.py          builds the vector index from content/
  content/             chapter notes (subject/class/chapter/content.txt)
  vector_store/        prebuilt FAISS index + metadata
frontend/
  src/App.jsx          app state, chat flow
  src/components/      Sidebar, Message, Composer, EmptyState, icons
  src/lib/             streaming API client, formatting helpers
```
