# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Run Commands

```bash
# Install dependencies
uv sync                          # Backend (Python)
cd frontend && npm install       # Frontend

# Run application
./start.sh                       # Both servers (recommended)

# Run separately
uv run python -m backend.main    # Backend only (port 8001)
cd frontend && npm run dev       # Frontend only (port 5173)

# Frontend commands
cd frontend && npm run lint      # ESLint
cd frontend && npm run build     # Production build
```

**Environment:** Create `.env` in project root with `OPENROUTER_API_KEY=sk-or-v1-...`

## Architecture

LLM Council is a 3-stage deliberation system where multiple LLMs collaboratively answer questions:

```
User Query → Stage 1 (parallel queries) → Stage 2 (anonymized peer review) → Stage 3 (chairman synthesis)
```

### Backend (`backend/`)

| File | Purpose |
|------|---------|
| `config.py` | `COUNCIL_MODELS` list and `CHAIRMAN_MODEL` - edit to change models |
| `openrouter.py` | Async API calls with `query_model()` and `query_models_parallel()` |
| `council.py` | Core logic: `stage1_collect_responses()`, `stage2_collect_rankings()`, `stage3_synthesize_final()` |
| `storage.py` | JSON persistence in `data/conversations/` |
| `main.py` | FastAPI app with CORS for localhost:5173 and localhost:3000 |

**Key behavior:** Stage 2 anonymizes responses as "Response A, B, C..." with `label_to_model` mapping for de-anonymization. Graceful degradation on model failures.

### Frontend (`frontend/src/`)

| File | Purpose |
|------|---------|
| `App.jsx` | Main orchestration, conversation management |
| `components/ChatInterface.jsx` | Input textarea (Enter sends, Shift+Enter newline) |
| `components/Stage1.jsx` | Tab view of individual model responses |
| `components/Stage2.jsx` | Peer evaluations with client-side de-anonymization display |
| `components/Stage3.jsx` | Final chairman synthesis (green background) |

**Styling:** Light mode, primary color #4a90e2. All ReactMarkdown wrapped in `.markdown-content` class.

## Important Implementation Notes

- **Module imports:** Backend uses relative imports (`from .config import ...`). Always run as `uv run python -m backend.main` from project root.
- **Ports:** Backend 8001, Frontend 5173. Update `backend/main.py` and `frontend/src/api.js` if changing.
- **Metadata persistence:** `label_to_model` and `aggregate_rankings` are ephemeral (API response only, not saved to JSON).
- **Ranking parser:** Looks for "FINAL RANKING:" section. Fallback regex extracts "Response X" patterns in order.

## Stage 2 Prompt Format

The Stage 2 prompt requires strict format for parseable output:
1. Evaluate each response individually
2. Include "FINAL RANKING:" header
3. Numbered list: "1. Response C", "2. Response A"
4. No text after ranking section
