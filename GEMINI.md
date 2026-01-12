# LLM Council

**LLM Council** is a locally-hosted web application that leverages multiple Large Language Models (LLMs) to provide a thoroughly deliberated answer to user queries. Instead of relying on a single model, it convenes a "council" of diverse LLMs to answer, peer-review each other, and synthesize a final best-possible response.

## Project Overview

The application operates in a unique 3-stage process for every query:

1.  **Stage 1 (First Opinions):** The user's query is sent to multiple configured LLMs (e.g., GPT-4, Claude 3, Gemini Pro) simultaneously.
2.  **Stage 2 (Peer Review):** Each LLM reviews the anonymous answers of the others, providing a critique and ranking based on accuracy and insight.
3.  **Stage 3 (Synthesis):** A designated "Chairman" LLM analyzes the original answers and the peer reviews to compile a single, comprehensive final response.

**Key Technologies:**
*   **Backend:** Python 3.10+, FastAPI, `uv` (package manager), OpenRouter API.
*   **Frontend:** React 19, Vite, `react-markdown`.
*   **Storage:** Local JSON files (`data/conversations/`).

## Building and Running

### Prerequisites
*   **Python:** >= 3.10
*   **Node.js:** (Recent version recommended)
*   **uv:** Python package manager ([docs](https://docs.astral.sh/uv/))
*   **OpenRouter API Key:** Required for LLM access.

### Configuration
1.  Create a `.env` file in the project root:
    ```env
    OPENROUTER_API_KEY=sk-or-v1-...
    ```
2.  (Optional) Edit `backend/config.py` to change the specific models used in the council.

### Quick Start
Use the provided shell script to start both the backend and frontend:
```bash
./start.sh
```

### Manual Setup
If you prefer to run services individually:

**Backend (Port 8001):**
```bash
uv sync                      # Install dependencies
uv run python -m backend.main # Start server
```

**Frontend (Port 5173):**
```bash
cd frontend
npm install                  # Install dependencies
npm run dev                  # Start dev server
```

## Directory Structure

*   **`backend/`**: Contains the FastAPI application code.
    *   `main.py`: API entry point and route definitions (supports Server-Sent Events for streaming).
    *   `council.py`: Core logic for the 3-stage deliberation process.
    *   `openrouter.py`: Handles communication with the OpenRouter API.
    *   `storage.py`: Manages local JSON persistence for conversations.
    *   `config.py`: Configuration for model selection.
*   **`frontend/`**: The React single-page application.
    *   `src/components/`: UI components for each stage (`Stage1.jsx`, `Stage2.jsx`, etc.) and the main chat interface.
    *   `src/api.js`: API client logic.
*   **`data/`**: Runtime storage for conversation history (JSON files).

## Development Conventions

*   **Dependency Management:** strictly use `uv` for Python and `npm` for JavaScript.
*   **Imports:** The backend uses relative imports (e.g., `from .config import ...`). Always run the backend module from the root directory: `uv run python -m backend.main`.
*   **Persistence:** Conversation data is stored as JSON files. There is no external database dependency.
*   **Streaming:** The application heavily relies on Server-Sent Events (SSE) to stream the progress of the multi-stage LLM interaction to the frontend.

## Architecture Notes

*   **Stage 2 Anonymization:** To prevent bias, model identities are hidden during peer review (labeled as "Response A", "Response B", etc.). The mapping is resolved client-side for display.
*   **Chairman Role:** One specific model (configured in `config.py`) is designated as the "Chairman" to perform the final synthesis.
