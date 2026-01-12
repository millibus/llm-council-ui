# PRD Review: LLM Council Redesign (Codex Recommendations)

## High-Level Assessment
- Clear goal and phased plan; allowed model list is explicit and helpful.
- Buildable, but backend/frontend contract details are missing for telemetry and scorecard data.
- Metrics intent is strong but not testable without pricing source, rounding rules, and latency definitions.
- Design direction is coherent but lacks interaction specs, accessibility requirements, and state behavior.
- Success criteria are mostly subjective and need objective acceptance checks.

## Gaps and Ambiguities

### Backend
- Allowed model enforcement is underspecified: canonical IDs, mapping to provider slugs, and fail-closed behavior.
- Telemetry schema is undefined: required vs optional fields, error payloads, and missing usage cases.
- Cost estimation lacks pricing source/versioning, currency, and rounding rules.
- Latency measurement boundaries are unclear: start/end points, parallelism, and failure handling.
- Scorecard aggregation inputs and tie rules are not defined.

### Frontend
- No explicit response shape for metadata fields; unclear if data is incremental or final-only.
- Loading/error/partial states are undefined per stage.
- Scorecard visualization details are missing: sorting rule, axis labels, tooltips, missing-data behavior.
- "X/Y Models Completed" and "Avg Time" are not defined.
- Copy-to-clipboard content and failure behavior are not specified.

### Design/UX
- Placement and prominence of metrics are unclear across stages.
- Sidebar interactions are underspecified: sorting, empty state, truncation, and timestamps.
- Interaction feedback for tabs, accordions, and copy action is not defined.
- Accessibility requirements are absent (contrast, keyboard nav, focus, chart text alternatives).
- Responsive behavior beyond "smaller desktop windows" is undefined.

## Technical Implementation Concerns
- Allowed models must be enforced server-side with canonical IDs and slug mapping; UI filtering is insufficient.
- Metrics should be computed in backend to avoid drift; UI should display backend values.
- Pricing tables need versioning for consistent historical cost calculations.
- Scorecard ranking must be deterministic with tie-breaking rules.
- Decide how failures affect averages and leaderboard placement.

## Testability and Success Criteria (Proposed)
- Backend response includes per-model telemetry: usage, latencyMs, costUsd, status, error.
- Backend rejects non-allowed model requests with HTTP 400 and code MODEL_NOT_ALLOWED.
- Scorecard sorts by avgRank ascending; ties by agreementScore descending; all entries show firstPlaceVotes.
- Avg latency excludes failed requests; if no successes, display "N/A".
- Copy button copies Stage 3 markdown and shows success or error feedback.

## Redlines and Rewrite Suggestions
- "Update Backend Config" -> Define fail-closed behavior and map friendly name to provider slug.
- "Implement a cost estimation utility" -> Specify pricing source, formula, rounding, and versioning.
- "Display Total Duration and Avg Model Latency" -> Define units, inclusion rules, and empty state.
- "X/Y Models Completed" -> Define X, Y, and display failed count.
- "Leaderboard ... Average Rank ... Agreement Score" -> Define formula and tie rules.
- "Use skeleton loaders" -> Specify timing threshold and error fallback.

## Open Questions
- What are the canonical internal model IDs and provider slugs? How are updates managed?
- What is the pricing source and how is it versioned for historical runs?
- What is the exact input to the scorecard (ranks, scores, or criteria)?
- Do failed or timed-out requests count toward averages and leaderboard placement?
- What should the copy action include (markdown vs plain text, metrics or not)?
- What are the responsive breakpoints and sidebar behavior at narrower widths?

## Concrete Technical Suggestions

### TypeScript Interfaces (Backend -> Frontend)
```ts
type AllowedModelName =
  | "Grok 4.1"
  | "Claude Opus 4.5"
  | "Claude Sonnet 4.5"
  | "Claude Haiku 4.5"
  | "ChatGPT 5.2 (Thinking)"
  | "ChatGPT 5.2 (Fast)"
  | "Perplexity Pro"
  | "Gemini 3 Flash"
  | "Gemini 3 Pro"
  | "Microsoft Copilot (Family Plan)";

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface ModelTelemetry {
  model: AllowedModelName;
  requestId: string;
  status: "ok" | "error";
  error?: { code: string; message: string };
  usage?: TokenUsage;
  latencyMs: number;
  costUsd?: number;
  startedAt: string;
  endedAt: string;
}

interface StageTelemetry {
  stage: "stage1" | "stage2" | "stage3";
  durationMs: number;
  avgModelLatencyMs: number;
  perModel: ModelTelemetry[];
  totals: {
    costUsd: number;
    usage: TokenUsage;
  };
}

interface LeaderboardEntry {
  model: AllowedModelName;
  avgRank: number;
  agreementScore: number;
  firstPlaceVotes: number;
  totalValidReviews: number;
  rankCounts: Record<number, number>;
}

interface LeaderboardData {
  generatedAt: string;
  entries: LeaderboardEntry[];
}

interface CouncilRunTelemetry {
  runId: string;
  totalDurationMs: number;
  totalCostUsd: number;
  totalUsage: TokenUsage;
  stages: StageTelemetry[];
  leaderboard?: LeaderboardData;
}
```

### React Component Breakdown
- Stage 1: Stage1Card, StageHeader, ModelTabs, ModelResponsePane, ModelResponseMeta, Stage1Skeleton
- Stage 2: Stage2Card, ScorecardLeaderboard, LeaderboardRow, ScorecardLegend, PeerReviewAccordion, PeerReviewItem
- Stage 3: Stage3Card, FinalReportHeader, FinalReportBody, CopyReportButton, SessionSummaryFooter

### Cost/Latency Aggregation Pseudocode
```txt
stageStart = now()
results = runAll(models)
stageDurationMs = now() - stageStart

perModel = []
for r in results:
  latencyMs = r.end - r.start
  usage = r.usage ?? {promptTokens:0, completionTokens:0, totalTokens:0}
  price = priceTable[r.model]
  costUsd = usage.promptTokens * price.promptUsdPerToken +
            usage.completionTokens * price.completionUsdPerToken
  if r.error:
    perModel.push({status:"error", latencyMs, usage, costUsd:0})
  else:
    perModel.push({status:"ok", latencyMs, usage, costUsd})

avgLatencyMs = average(latencyMs for m in perModel if m.status == "ok") or null
totals.costUsd = sum(costUsd for m in perModel if m.status == "ok")
totals.usage = sum(usage for m in perModel if m.status == "ok")
```

### Allowed-Model Enforcement Pseudocode
```txt
ALLOWED = {
  "Grok 4.1": { providerSlug: "xai/grok-4.1" },
  ...
}

function resolveModel(name):
  if name not in ALLOWED:
    raise HttpError(400, "MODEL_NOT_ALLOWED")
  return ALLOWED[name].providerSlug

for requestedModel in request.models:
  providerSlug = resolveModel(requestedModel)
  callProvider(providerSlug)
```
