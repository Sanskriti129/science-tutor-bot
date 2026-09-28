import os
import re
import sys
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Literal, Optional

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "services"))

from config import CONTENT_PATH
from llm_router import get_tutor_response, stream_tutor_response

router = APIRouter()


# ── Request/Response Schemas ──────────────────────────────
class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    question: str
    chat_history: Optional[List[ChatMessage]] = []
    style: Literal["detailed", "simple", "exam"] = "detailed"

class ChatResponse(BaseModel):
    answer: str
    sources: List[dict]


def to_sources(chunks):
    return [
        {
            "subject": c["subject"],
            "class": c["class"],
            "chapter": c["chapter"],
            "score": float(c["score"])
        }
        for c in chunks
    ]


# ── Endpoints ──────────────────────────────────────────────
@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    # Convert Pydantic chat history into plain dicts for the LLM
    history = [{"role": m.role, "content": m.content} for m in request.chat_history]

    answer, chunks = get_tutor_response(request.question, history, request.style)

    return ChatResponse(answer=answer, sources=to_sources(chunks))


@router.post("/chat/stream")
def chat_stream(request: ChatRequest):
    """
    Same as /chat, but streams the answer as Server-Sent Events:
      data: {"type": "sources", "sources": [...]}
      data: {"type": "token", "text": "..."}   (many)
      data: {"type": "done"}
    """
    history = [{"role": m.role, "content": m.content} for m in request.chat_history]

    def events():
        try:
            for kind, value in stream_tutor_response(request.question, history, request.style):
                if kind == "sources":
                    payload = {"type": "sources", "sources": to_sources(value)}
                else:
                    payload = {"type": "token", "text": value}
                yield f"data: {json.dumps(payload)}\n\n"
            yield 'data: {"type": "done"}\n\n'
        except Exception as e:
            print(f"❌ Stream error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': 'The tutor had trouble answering. Please try again.'})}\n\n"

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


SMALL_WORDS = {"of", "and", "in", "the", "to", "a"}

def chapter_title(slug: str) -> str:
    words = slug.split("_")
    return " ".join(
        w if (i > 0 and w in SMALL_WORDS) else w.capitalize()
        for i, w in enumerate(words)
    )


@router.get("/chapters")
def chapters():
    """Lists the chapters the tutor has notes for, read from the content/ folder."""
    result = []
    if not os.path.isdir(CONTENT_PATH):
        return {"chapters": result}

    for subject in sorted(os.listdir(CONTENT_PATH)):
        subject_dir = os.path.join(CONTENT_PATH, subject)
        if not os.path.isdir(subject_dir):
            continue
        for class_ in sorted(os.listdir(subject_dir)):
            class_dir = os.path.join(subject_dir, class_)
            if not os.path.isdir(class_dir):
                continue
            for folder in os.listdir(class_dir):
                m = re.match(r"chapter(\d+)_(.+)", folder)
                if not m:
                    continue
                result.append({
                    "id": folder,
                    "subject": subject,
                    "class": class_,
                    "number": int(m.group(1)),
                    "title": chapter_title(m.group(2)),
                })

    result.sort(key=lambda c: (c["subject"], c["class"], c["number"]))
    return {"chapters": result}
