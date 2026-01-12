# PRD Review & Recommendations: LLM Council Redesign

**Reviewer Role:** Senior PM + Staff Full-Stack Engineer
**Date:** 2026-01-11
**Source Document:** PRD.md

---

## 1. High-Level Assessment

| Criterion | Rating | Notes |
|-----------|--------|-------|
| **Clarity** | Moderate | Goals are clear, but implementation details have gaps |
| **Buildable** | Needs Work | Missing data schemas, error handling, and edge cases |
| **Testable** | Weak | Success criteria are subjective ("looks professional") |

**Summary:** The PRD establishes a solid vision but lacks the specificity needed for engineering handoff. Most requirements need acceptance criteria, and the "happy path" is documented while failure modes are not.

---

## 2. Gaps & Ambiguities

### 2.1 Backend

| Gap | Impact | Severity |
|-----|--------|----------|
| **No response schema defined** | Frontend has no contract to code against | HIGH |
| **Cost calculation source undefined** | "Based on model pricing tiers" — where does pricing data come from? Static file? API? | HIGH |
| **`usage` field structure unspecified** | OpenRouter returns different formats; need explicit mapping | MEDIUM |
| **Error aggregation missing** | What happens if 3/10 models fail? Partial success? | MEDIUM |
| **No rate limiting strategy** | 10 parallel calls could hit OpenRouter limits | MEDIUM |
| **Metadata persistence contradicts CLAUDE.md** | PRD says "pass metadata to frontend" but CLAUDE.md says `label_to_model` is ephemeral | MEDIUM |

### 2.2 Frontend

| Gap | Impact | Severity |
|-----|--------|----------|
| **State shape undefined** | No TypeScript interfaces for metrics/leaderboard | HIGH |
| **Loading states per-stage vs global** | "Skeleton loaders" — one per stage? Per model? | MEDIUM |
| **Error UI unspecified** | What does a failed model look like in Stage 1 tabs? | MEDIUM |
| **Responsive breakpoints missing** | "Check layout on smaller desktop windows" — what's the minimum width? | MEDIUM |
| **Tab behavior undefined** | What's the default tab in Stage 1? First model? First completed? | LOW |
| **Copy to Clipboard scope** | Stage 3 only? Or can users copy individual model responses? | LOW |

### 2.3 Design/UX

| Gap | Impact | Severity |
|-----|--------|----------|
| **Leaderboard tie handling** | What if two models have identical average rank? | HIGH |
| **"Agreement Score" formula undefined** | "How often ranked #1" — across all reviewers? Weighted? | HIGH |
| **Color palette incomplete** | Slate/Gray values not specified (which Tailwind shades?) | MEDIUM |
| **Bar chart vs matrix** | "Bar charts or a matrix" — which one? Designer's choice? | MEDIUM |
| **Collapsed view default state** | Stage 2 detailed critiques — collapsed by default? | LOW |
| **"New Chat" placement** | Sidebar top or bottom? | LOW |

---

## 3. Technical Implementation Concerns

### 3.1 Model Allowlist Enforcement

**Problem:** PRD says "Update Backend Config" but doesn't address:
- What happens if a persisted conversation references a now-forbidden model?
- Should the allowlist be runtime-configurable or build-time only?

**Recommendation:**
```
MUST: Validate model names at API boundary (POST /query endpoint)
MUST: Strip/filter historical conversations with forbidden models on load
SHOULD: Log attempts to use forbidden models for auditing
```

### 3.2 Cost/Latency Aggregation

**Problem:** "Per-Model Cost" and "Total Run Cost" require:
1. A pricing table (where does it live?)
2. Token counting from `usage.prompt_tokens` + `usage.completion_tokens`
3. Currency handling (USD assumed?)

**Missing:** Formula for cost estimation. Example needed:
```
cost = (prompt_tokens * model_input_price / 1000) + (completion_tokens * model_output_price / 1000)
```

### 3.3 Ranking & Agreement Scores

**Problem:** "Agreement Score" is undefined mathematically.

**Proposed Definition:**
```
agreement_score[model] = (count of #1 rankings for model) / (total reviewers)
average_rank[model] = sum(rankings) / count(rankings)
```

**Edge Cases Not Addressed:**
- Model A reviews Model B's response — does Model A rank itself? (Excluded per Stage 2 anonymization)
- What if a reviewer's ranking is unparseable?

---

## 4. Success Criteria Rewrites (Acceptance-Test Style)

### 4.1 Visual Polish

**Original:** "Dashboard looks professional and data-rich."

**Rewrite:**
- [ ] No purple gradients present in any component
- [ ] All body text uses `font-family: Inter, system-ui, sans-serif`
- [ ] Line height for paragraph text is exactly `1.6`
- [ ] Stage cards have `1px solid #e2e8f0` border
- [ ] Lighthouse accessibility score >= 90

### 4.2 Cost/Latency Visibility

**Original:** "Cost and Latency are visible for every query."

**Rewrite:**
- [ ] `MetricsBadge` component displays: tokens (prompt/completion), cost (USD, 4 decimals), latency (ms)
- [ ] Total run cost appears in Stage 3 footer
- [ ] Per-model latency appears in Stage 1 tab headers
- [ ] Cost displays "$0.0000" format (not "0" or blank) when cost is zero

### 4.3 Winner Identification

**Original:** "Users can see exactly which model 'won' stage 2 at a glance."

**Rewrite:**
- [ ] Leaderboard renders within 100ms of Stage 2 data arrival
- [ ] #1 ranked model has green (`#22c55e`) accent bar
- [ ] Model name, average rank, and agreement score visible without scrolling
- [ ] Tie-breaker rule documented and applied (e.g., lower latency wins)

### 4.4 Model Compliance

**Original:** "Only approved models are used."

**Rewrite:**
- [ ] `COUNCIL_MODELS` array contains exactly 10 entries matching PRD Section 2
- [ ] API returns 400 if request includes non-allowlisted model
- [ ] UI model selector only renders allowlisted models
- [ ] Integration test asserts no forbidden model strings in any API response

---

## 5. Redlines & Rewrites

### Section 3.1 (Metrics & Telemetry)

**Before:**
> "Implement a cost estimation utility based on model pricing tiers."

**After:**
> "Implement `calculate_cost(model_id: str, prompt_tokens: int, completion_tokens: int) -> float` using pricing from `backend/pricing.json`. Pricing file must include all 10 allowed models with `input_price_per_1k` and `output_price_per_1k` fields in USD."

### Section 3.3 (Stage 2 Scorecard)

**Before:**
> "Agreement Score (How often was this model ranked #1?)"

**After:**
> "Agreement Score = `(#1_count / total_reviewers) * 100`, displayed as percentage. If a reviewer fails to submit a valid ranking, exclude them from the denominator."

### Section 4.2 (Dashboard Layout)

**Before:**
> "Use skeleton loaders (shimmer effects) instead of simple spinners"

**After:**
> "Each Stage Card renders a skeleton loader matching the expected content shape:
> - Stage 1: 3-line text block skeleton per tab
> - Stage 2: Horizontal bar skeleton (leaderboard) + collapsed accordion skeleton
> - Stage 3: 5-line text block skeleton
> Skeleton uses `animate-pulse` with `bg-slate-200` fill."

---

## 6. Open Questions for PRD Author

### Product/Business
1. **Pricing source:** Is OpenRouter pricing static or should we fetch it dynamically? How often does it change?
2. **Historical data:** What happens to existing conversations that used now-forbidden models?
3. **Cost visibility:** Should users see cost *before* running a query (estimated) or only after?
4. **Chairman model:** Is the Chairman always the same model, or user-selectable?

### Design
5. **Tie handling:** If two models tie for #1 rank, what's the display behavior?
6. **Responsive targets:** What's the minimum supported viewport width? Tablet support?
7. **Dark mode:** Explicitly excluded, or future scope?
8. **Empty states:** What does Stage 2 look like if only 1 model responds?

### Engineering
9. **Caching:** Should cost/latency be persisted to `data/conversations/` JSON?
10. **Real-time updates:** Should Stage 1 tabs update as each model completes, or wait for all?
11. **Retry policy:** If a model fails, retry once? Never? Configurable?

---

## 7. Engineering Suggestions

### 7.1 TypeScript Types for Backend -> Frontend Payload

```typescript
// Shared types (could live in shared/types.ts)

interface ModelUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface ModelMetrics {
  model_id: string;
  model_name: string;  // Friendly name from PRD Section 2
  latency_ms: number;
  usage: ModelUsage;
  cost_usd: number;
}

interface Stage1Response {
  model_id: string;
  model_name: string;
  content: string;
  metrics: ModelMetrics;
  status: 'success' | 'error' | 'timeout';
  error_message?: string;
}

interface PeerReview {
  reviewer_model_id: string;
  reviewer_model_name: string;
  rankings: Array<{
    rank: number;
    label: string;           // "Response A"
    model_id: string;        // De-anonymized
    model_name: string;
  }>;
  critique: string;
  metrics: ModelMetrics;
}

interface LeaderboardEntry {
  model_id: string;
  model_name: string;
  average_rank: number;
  agreement_score: number;  // 0-100 percentage
  rank_distribution: Record<number, number>;  // { 1: 3, 2: 2, 3: 1 }
}

interface Stage2Response {
  leaderboard: LeaderboardEntry[];
  peer_reviews: PeerReview[];
  label_to_model: Record<string, string>;
}

interface Stage3Response {
  chairman_model: string;
  synthesis: string;
  metrics: ModelMetrics;
}

interface CouncilResponse {
  query_id: string;
  user_query: string;
  timestamp: string;
  stage1: Stage1Response[];
  stage2: Stage2Response;
  stage3: Stage3Response;
  totals: {
    total_tokens: number;
    total_cost_usd: number;
    total_duration_ms: number;
    models_succeeded: number;
    models_failed: number;
  };
}
```

### 7.2 React Component Hierarchy

```
<App>
├── <Sidebar>
│   ├── <NewChatButton />
│   └── <ConversationList>
│       └── <ConversationItem /> (xN)
│
└── <MainContent>
    ├── <QueryHeader query={string} totals={TotalsMetrics} />
    │
    ├── <StageCard stage={1} status={loading|complete|error}>
    │   ├── <StageHeader title="First Opinions" metrics={aggregated} />
    │   ├── <ModelTabs>
    │   │   └── <ModelTab model={} isActive={} onClick={} /> (x10)
    │   └── <TabContent>
    │       ├── <SkeletonLoader /> (if loading)
    │       ├── <ErrorState message={} /> (if error)
    │       └── <MarkdownRenderer content={} />
    │           └── <MetricsBadge metrics={ModelMetrics} />
    │
    ├── <StageCard stage={2}>
    │   ├── <StageHeader title="Peer Review" />
    │   ├── <Leaderboard entries={LeaderboardEntry[]}>
    │   │   └── <LeaderboardRow
    │   │         model={}
    │   │         rank={}
    │   │         isWinner={}
    │   │         agreementScore={} />
    │   └── <CollapsibleSection title="Detailed Reviews" defaultOpen={false}>
    │       └── <PeerReviewCard review={PeerReview} /> (xN)
    │
    ├── <StageCard stage={3} variant="final-report">
    │   ├── <StageHeader title="Chairman's Synthesis" />
    │   ├── <MarkdownRenderer content={} />
    │   ├── <CopyToClipboardButton content={} />
    │   └── <SessionSummary totals={} />
    │
    └── <ChatInterface onSubmit={} disabled={isLoading} />
```

### 7.3 Pseudocode: Timing Decorator (Python)

```python
# backend/utils/timing.py
import time
from functools import wraps
from typing import TypeVar, Callable, Any
from dataclasses import dataclass

@dataclass
class TimedResult:
    result: Any
    latency_ms: float

def timed_async(func: Callable) -> Callable:
    """Decorator that wraps async function result with timing metadata."""
    @wraps(func)
    async def wrapper(*args, **kwargs) -> TimedResult:
        start = time.perf_counter()
        result = await func(*args, **kwargs)
        elapsed_ms = (time.perf_counter() - start) * 1000
        return TimedResult(result=result, latency_ms=round(elapsed_ms, 2))
    return wrapper

# Usage in openrouter.py:
@timed_async
async def query_model(model_id: str, prompt: str) -> dict:
    response = await client.post(...)
    return {
        "content": response["choices"][0]["message"]["content"],
        "usage": response.get("usage", {}),
    }

# Caller receives:
# TimedResult(result={"content": "...", "usage": {...}}, latency_ms=1234.56)
```

### 7.4 Pseudocode: Cost Estimation Utility (Python)

```python
# backend/utils/cost.py
import json
from pathlib import Path
from typing import Optional

# Load pricing once at module import
PRICING_FILE = Path(__file__).parent.parent / "pricing.json"
MODEL_PRICING: dict = {}

def _load_pricing():
    global MODEL_PRICING
    if PRICING_FILE.exists():
        with open(PRICING_FILE) as f:
            MODEL_PRICING = json.load(f)

_load_pricing()

def calculate_cost(
    model_id: str,
    prompt_tokens: int,
    completion_tokens: int
) -> Optional[float]:
    """
    Calculate cost in USD for a model call.
    Returns None if model not in pricing table.
    """
    pricing = MODEL_PRICING.get(model_id)
    if not pricing:
        return None

    input_cost = (prompt_tokens / 1000) * pricing["input_price_per_1k"]
    output_cost = (completion_tokens / 1000) * pricing["output_price_per_1k"]

    return round(input_cost + output_cost, 6)

# Example pricing.json structure:
# {
#   "anthropic/claude-3-opus": {
#     "input_price_per_1k": 0.015,
#     "output_price_per_1k": 0.075,
#     "friendly_name": "Claude Opus 4.5"
#   },
#   ...
# }
```

### 7.5 Pseudocode: Leaderboard Computation (Python)

```python
# backend/utils/leaderboard.py
from collections import defaultdict
from dataclasses import dataclass

@dataclass
class LeaderboardEntry:
    model_id: str
    model_name: str
    average_rank: float
    agreement_score: float  # Percentage 0-100
    rank_distribution: dict[int, int]

def compute_leaderboard(
    rankings: list[dict],  # Each dict: {"reviewer": str, "rankings": [{"model_id": str, "rank": int}]}
    model_names: dict[str, str]  # model_id -> friendly_name
) -> list[LeaderboardEntry]:
    """
    Compute leaderboard from all peer review rankings.
    """
    # Aggregate ranks per model
    model_ranks: dict[str, list[int]] = defaultdict(list)
    first_place_counts: dict[str, int] = defaultdict(int)

    valid_reviewers = 0
    for review in rankings:
        if not review.get("rankings"):
            continue
        valid_reviewers += 1
        for item in review["rankings"]:
            model_id = item["model_id"]
            rank = item["rank"]
            model_ranks[model_id].append(rank)
            if rank == 1:
                first_place_counts[model_id] += 1

    # Build leaderboard entries
    entries = []
    for model_id, ranks in model_ranks.items():
        rank_dist = defaultdict(int)
        for r in ranks:
            rank_dist[r] += 1

        entries.append(LeaderboardEntry(
            model_id=model_id,
            model_name=model_names.get(model_id, model_id),
            average_rank=round(sum(ranks) / len(ranks), 2),
            agreement_score=round((first_place_counts[model_id] / valid_reviewers) * 100, 1) if valid_reviewers > 0 else 0,
            rank_distribution=dict(rank_dist),
        ))

    # Sort by average_rank ascending (lower is better)
    entries.sort(key=lambda e: (e.average_rank, -e.agreement_score))
    return entries
```

---

## 8. Implementation Checklist

Before starting implementation, ensure:

- [ ] **Pricing JSON** created with all 10 models and verified pricing
- [ ] **Response schema** agreed upon (use types from Section 7.1 as starting point)
- [ ] **Tie-breaker rule** defined for leaderboard
- [ ] **Error states** designed for each stage
- [ ] **Minimum viewport width** specified
- [ ] **Historical conversation migration** plan documented
- [ ] **Real-time vs batch** rendering for Stage 1 decided

---

## 9. Recommended Implementation Order

### Phase 1: Backend Foundation (Priority: HIGH)
1. Create `backend/pricing.json` with all 10 allowed models
2. Refactor `config.py` to enforce the allowed model list with validation
3. Update `openrouter.py` to return `usage` statistics and implement timing
4. Create `backend/utils/cost.py` for cost calculation
5. Update `council.py` to aggregate cost and timing data

### Phase 2: Frontend Data Layer (Priority: HIGH)
1. Define TypeScript interfaces in `frontend/src/types.ts`
2. Update `App.jsx` to handle new metadata fields
3. Create shared `MetricsBadge` component

### Phase 3: Visual Overhaul (Priority: MEDIUM)
1. Rewrite `App.css` and `index.css` for Slate/Clean theme
2. Redesign Stage 1 tab interface
3. Build `Leaderboard` component for Stage 2
4. Style Stage 3 Final Report card with copy button

### Phase 4: Polish & Verify (Priority: MEDIUM)
1. Add skeleton loaders for each stage
2. Implement error states for failed models
3. Test responsive layout
4. Write integration tests for model compliance

---

*This document should be used alongside PRD.md to provide engineering clarity and testable requirements.*
