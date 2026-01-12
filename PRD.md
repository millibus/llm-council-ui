# Product Requirements Document (PRD): LLM Council UI/UX Overhaul

## 1. Executive Summary

**Project Name:** LLM Council Redesign
**Goal:** Transform the current "developer-tool" aesthetic into a polished, product-grade dashboard that offers deep insights, clear comparisons, and a modern, professional user experience.
**Key Drivers:**
*   Professionalism: Move away from generic "AI purple" to a clean, data-dense interface.
*   Transparency: Expose cost and latency metrics.
*   Clarity: Replace text-heavy logs with visual scorecards and hierarchical summaries.

## 2. Model Constraints & Configuration

The application must strictly adhere to the following allowed model list for all operations (Council members and Chairman).

**Allowed Models:**
*   Grok 4.1
*   Claude Opus 4.5
*   Claude Sonnet 4.5
*   Claude Haiku 4.5
*   ChatGPT 5.2 (Thinking)
*   ChatGPT 5.2 (Fast)
*   Perplexity Pro
*   Gemini 3 Flash
*   Gemini 3 Pro
*   Microsoft Copilot (Family Plan)

**Action Items:**
1.  **Update Backend Config:** specific `backend/config.py` to allow *only* these models.
2.  **Verify Strings:** Ensure UI labels match these friendly names exactly (e.g., "ChatGPT 5.2 (Thinking)" instead of raw API slugs like `openai/gpt-5-thinking`).

## 3. Functional Requirements

### 3.1 Metrics & Telemetry
**Goal:** Users must know "How much did this cost?" and "How long did it take?"
*   **Cost Tracking:**
    *   Backend must capture `usage` (prompt/completion tokens) from OpenRouter API responses.
    *   Implement a cost estimation utility based on model pricing tiers.
    *   Display "Total Run Cost" for each query and "Per-Model Cost" in detailed views.
*   **Latency Tracking:**
    *   Measure wall-clock time for each stage and each individual model request.
    *   Display "Total Duration" and "Avg Model Latency."

### 3.2 Stage 1 (First Opinions)
*   **Layout:** Segmented control (tabs) for model switching.
*   **Header:** Summary line showing "X/Y Models Completed • Avg Time: 1.2s".
*   **Content:** Markdown rendering with clean typography.

### 3.3 Stage 2 (Peer Review & Scorecard)
*   **Primary View (The Scorecard):**
    *   **New Component:** A visual "Leaderboard" at the top of Stage 2.
    *   **Data:** Bar charts or a matrix showing:
        *   Average Rank (1st, 2nd, 3rd)
        *   Agreement Score (How often was this model ranked #1?)
    *   **Visuals:** Color-coded bars (Green for #1, neutral for others).
*   **Detailed View:**
    *   Retain the specific peer critiques but place them below the leaderboard in a collapsed/secondary view.
    *   Ensure "De-anonymized" labels are clear (e.g., "Grok 4.1's Review of Gemini 3 Pro").

### 3.4 Stage 3 (Chairman's Synthesis)
*   **Design:** Distinct "Final Report" styling.
*   **Actions:** "Copy to Clipboard" button.
*   **Footer:** Summary of total tokens used and total cost for the entire council session.

## 4. UI/UX & Design System

### 4.1 Aesthetic Direction
*   **Theme:** "Modern Professional."
    *   **Colors:** Slate/Grays for structure, White backgrounds, highly legible black text.
    *   **Accents:** Use color strictly for function (Green = Success/Best, Red = Error/High Cost). **No generic purple gradients.**
*   **Typography:** Inter or system-ui font stack. Strong weight on headers, readable line-heights (1.6) for body text.
*   **Spacing:** Increase whitespace. distinct separation between stages using cards with subtle borders (`1px solid #e2e8f0`).

### 4.2 Dashboard Layout
*   **Sidebar:** Refined conversation list with clearer timestamps and "New Chat" button.
*   **Main Stage:**
    *   Shift from a continuous vertical scroll to distinct "Stage Cards."
    *   Use skeleton loaders (shimmer effects) instead of simple spinners for better perceived performance.

## 5. Implementation Plan

### Phase 1: Backend Foundation
1.  **Refactor `config.py`:** Enforce the allowed model list.
2.  **Update `openrouter.py`:**
    *   Modify `query_model` to return `usage` statistics.
    *   Implement timing decorators to capture latency.
3.  **Update `council.py`:**
    *   Aggregate cost and timing data across all stages.
    *   Pass this metadata to the frontend in the final response object.

### Phase 2: Frontend Data Layer
1.  **Update State:** Modify `App.jsx` to handle the new metadata fields (cost, latency, usage).
2.  **Metrics Component:** Create a shared `MetricsBadge` component to display token/cost/time data consistently.

### Phase 3: Visual Overhaul
1.  **Global Styles:** Rewrite `App.css` and `index.css` to adopt the new Slate/Clean theme.
2.  **Stage 1 Redesign:** Polish the tab interface and markdown container.
3.  **Stage 2 Redesign:** Build the `Scorecard` component (Leaderboard visualization).
4.  **Stage 3 Redesign:** Style the Final Report card.

### Phase 4: Polish & Verify
1.  **Review:** Ensure no "Forbidden Models" appear in the UI.
2.  **Test:** Verify cost calculations and ranking visualizations.
3.  **Responsiveness:** Check layout on smaller desktop windows.

## 6. Success Criteria
*   **Visual:** Dashboard looks professional and data-rich.
*   **Functional:** Users can see exactly which model "won" stage 2 at a glance.
*   **Data:** Cost and Latency are visible for every query.
*   **Compliance:** Only approved models are used.
