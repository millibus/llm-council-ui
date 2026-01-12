# LLM Council Redesign - Final PRD

**Version:** 1.0
**Date:** 2026-01-11
**Goal:** Refresh the UI with a Copilot-branded theme, add token metrics, and create a visual leaderboard with cross-conversation win tracking.

---

## 1. Model Configuration

Update `backend/config.py` to use these 10 models:

| Friendly Name | OpenRouter Slug |
|---------------|-----------------|
| Grok 4.1 | `x-ai/grok-4` |
| Claude Opus 4.5 | `anthropic/claude-opus-4.5` |
| Claude Sonnet 4.5 | `anthropic/claude-sonnet-4.5` |
| Claude Haiku 4.5 | `anthropic/claude-haiku-4.5` |
| ChatGPT 5.2 (Thinking) | `openai/gpt-5-thinking` |
| ChatGPT 5.2 (Fast) | `openai/gpt-5` |
| Perplexity Pro | `perplexity/sonar-pro` |
| Gemini 3 Flash | `google/gemini-3-flash` |
| Gemini 3 Pro | `google/gemini-3-pro` |
| Microsoft Copilot | `microsoft/copilot` |

**Note:** Verify exact OpenRouter slugs before implementation. The Chairman model should be configurable separately.

### Acceptance Criteria
- [ ] `COUNCIL_MODELS` contains exactly 10 entries
- [ ] UI displays friendly names (not API slugs)
- [ ] All models appear in Stage 1 tabs

---

## 2. Token Metrics

Display token usage for transparency. **No cost calculation required.**

### Backend Changes (`backend/openrouter.py`)
Extract from OpenRouter API response:
```python
usage = {
    "prompt_tokens": response.get("usage", {}).get("prompt_tokens", 0),
    "completion_tokens": response.get("usage", {}).get("completion_tokens", 0),
    "total_tokens": response.get("usage", {}).get("total_tokens", 0)
}
```

### What to Display
| Location | Metrics |
|----------|---------|
| Stage 1 (per model tab) | Tokens: X prompt / Y completion |
| Stage 2 header | Total tokens used in peer review |
| Stage 3 footer | Total session tokens (all 3 stages) |

### Latency
- Capture wall-clock time per model request
- Display in Stage 1 tabs: "1.2s"
- Display total duration in Stage 3 footer

### Acceptance Criteria
- [ ] Token counts appear in Stage 1 for each model
- [ ] Total tokens displayed in Stage 3
- [ ] Latency shown per model

---

## 3. Stage 2 Leaderboard

Replace the text-based aggregate rankings with a visual leaderboard.

### Layout
```
+------------------------------------------+
| LEADERBOARD                              |
+------------------------------------------+
| 1. Claude Sonnet 4.5    ████████████ 1.2 |
| 2. Gemini 3 Pro         ████████     2.1 |
| 3. Grok 4.1             ██████       2.8 |
| ...                                      |
+------------------------------------------+
| [Collapse] Detailed Reviews              |
+------------------------------------------+
```

### Data (already computed in `council.py`)
- **Average Rank**: From `aggregate_rankings` (lower is better)
- **First Place Count**: How many reviewers ranked this model #1

### Visual Design
- Horizontal bars showing relative ranking
- Green accent (`#107C10`) for #1 ranked model
- Gray bars for others
- Sort by average rank ascending

### Detailed Reviews
- Collapse by default
- Show full peer critiques when expanded
- Display de-anonymized labels: "Claude's Review of Gemini"

### Acceptance Criteria
- [ ] Leaderboard displays above detailed reviews
- [ ] #1 model visually highlighted
- [ ] Rankings match current aggregate_rankings calculation

---

## 4. Wins Tracker

Track which model "wins" (ranks #1) across all conversations.

### Storage (`backend/storage.py`)
Create `data/wins.json`:
```json
{
  "claude-sonnet-4.5": 12,
  "gemini-3-pro": 8,
  "grok-4.1": 5,
  ...
}
```

### Logic
- After Stage 2 completes, find model with lowest average rank
- Increment that model's win count
- Ties: Both models get a win (or first alphabetically - your choice)

### UI Display
- Show in sidebar header or main header area
- Simple format: "Wins: Claude 12 | Gemini 8 | Grok 5"
- Or as a mini leaderboard card

### Acceptance Criteria
- [ ] Wins persist across browser sessions
- [ ] Win count increments after each query
- [ ] Visible in UI without clicking into a conversation

---

## 5. UI Theme: Copilot Style

Adopt Microsoft Copilot's design language.

### Color Palette
| Element | Color |
|---------|-------|
| Primary accent | `#0078D4` (Microsoft Blue) |
| Success/Winner | `#107C10` (Green) |
| Sidebar background | `#1F1F1F` (Dark) |
| Sidebar text | `#FFFFFF` |
| Content background | `#FFFFFF` |
| Content text | `#242424` |
| Borders | `#E0E0E0` |
| Hover states | `#F5F5F5` |

### Typography
```css
font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
```
- Headers: 600 weight
- Body: 400 weight, line-height 1.5

### Layout Changes
- **Sidebar**: Dark background, light text, rounded conversation items
- **Stage Cards**: White background, subtle border (`1px solid #E0E0E0`), rounded corners (`8px`)
- **Spacing**: Increase padding inside cards (16px minimum)
- **Buttons**: Rounded (`4px`), filled primary style

### Stage 3 Styling
- Keep distinct "final answer" appearance
- Light green tint background (`#F0FFF0`) or Copilot blue tint
- "Copy to Clipboard" button prominent

### Acceptance Criteria
- [ ] Sidebar is dark with light text
- [ ] Stage cards have subtle borders and rounded corners
- [ ] Microsoft Blue used for primary actions
- [ ] Overall feel matches Copilot dashboard aesthetic

---

## 6. Files to Modify

### Backend
| File | Changes |
|------|---------|
| `backend/config.py` | Add 10 models with friendly names |
| `backend/openrouter.py` | Extract `usage` from API response, add timing |
| `backend/council.py` | Pass metrics through stages, compute winner |
| `backend/storage.py` | Add `load_wins()`, `save_wins()`, `increment_win()` |
| `backend/main.py` | Add `/api/wins` endpoint, include metrics in responses |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/App.css` | Copilot theme colors and layout |
| `frontend/src/index.css` | Base typography and variables |
| `frontend/src/App.jsx` | Fetch and display wins |
| `frontend/src/components/Stage1.jsx` | Add token/latency display |
| `frontend/src/components/Stage2.jsx` | Visual leaderboard component |
| `frontend/src/components/Stage3.jsx` | Session summary footer |
| New: `frontend/src/components/Leaderboard.jsx` | Reusable leaderboard bars |
| New: `frontend/src/components/WinsTracker.jsx` | Overall wins display |

---

## 7. Implementation Order

### Phase 1: Backend Metrics
1. Update `config.py` with 10 models
2. Extract tokens/timing in `openrouter.py`
3. Pass metrics through `council.py`
4. Add wins tracking to `storage.py`

### Phase 2: Frontend Data
1. Update API response handling in `App.jsx`
2. Create `Leaderboard.jsx` component
3. Create `WinsTracker.jsx` component
4. Add metrics display to Stage components

### Phase 3: Visual Theme
1. Update `index.css` with Copilot variables
2. Restyle sidebar (dark theme)
3. Restyle stage cards (borders, spacing)
4. Polish typography and buttons

---

## 8. Out of Scope

The following were considered but explicitly excluded:

- **Cost calculation**: No pricing tables or USD estimates
- **TypeScript conversion**: Keep existing JSX
- **Skeleton loaders**: Current spinners are fine
- **Complex analytics**: No per-model historical trends
- **Rate limiting**: Not a current problem
- **Dark mode toggle**: Single theme only

---

## 9. Verification Checklist

After implementation, verify:

- [ ] Submit a query and see all 10 models in Stage 1
- [ ] Token counts visible for each model response
- [ ] Stage 2 shows visual leaderboard (bars, not just text)
- [ ] Winner highlighted in green
- [ ] Wins tracker updates after query completes
- [ ] Wins persist after page refresh
- [ ] Sidebar has dark Copilot theme
- [ ] Stage cards have rounded borders
- [ ] Copy button works in Stage 3
- [ ] No console errors

---

*This document supersedes PRD.md, PRD_Claude.md, and PRD_codex.md for implementation purposes.*
