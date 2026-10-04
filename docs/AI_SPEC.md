# EXPA — AI Specification

## Pipeline
```
User msg → IntentDetector → UserContextBuilder → Retriever → SourceVerifier → LlmClient → ResponseLabeler → ActionSuggester
```
1. **IntentDetector**: lightweight rules + LLM fallback → `immigration | documents | jobs | study | learning | patente | housing | health | money | smalltalk | out_of_scope | emergency`. `emergency` short-circuits to local emergency numbers (112) text.
2. **UserContextBuilder**: minimal profile subset (nationality, city, segment, Italian level, nearest document expiries). Never sends email/name/attachments to the LLM.
3. **Retriever**: searches `knowledge_chunks` (published, same locale then fallback). Returns top-k with `source_name`, `source_url`, `source_type`, `last_verified_at`.
4. **SourceVerifier**: drops chunks with no source, flags stale (>365d) chunks, and builds the only list of URLs the model may cite. URLs not in this list are stripped from the output post-hoc.
5. **LlmClient** (interface; adapters: Anthropic, Fake for tests). System prompt: answer in user language; use ONLY provided sources for government/legal/tax facts; if sources insufficient say so and point to the official body; never invent fees/deadlines/URLs; add Italian terms in parentheses.
6. **ResponseLabeler**: tags each answer segment/answer as `official | ai_explanation | general_guidance | third_party`. Answer with no retrieved official source cannot be labelled `official`.
7. **ActionSuggester**: rules map intents/entities to actions (create reminder, open guide, open booking page, start lesson).

## Safety
- Disclaimers for legal/tax/medical topics; no diagnosis.
- Prompt-injection hardening: retrieved text and user text are delimited and treated as data.
- Per-plan rate limits (`ai_usage`), output length caps, timeout 20s.
- **Failure mode**: on timeout/provider error return localized "I couldn't process that right now. Please try again." plus search/navigation fallback links; HTTP 200 with `meta.degraded=true` so clients never show a broken state.

## Testing
FakeLlmClient with scripted responses; tests assert: source-less answers are not labelled official, invented URLs are stripped, emergency short-circuit, degraded mode, profile minimization.

## Later
Job matching (rules-based first: weighted skills/Italian/English/location/remote/salary with explanation list), Rental Checker, Document Explainer, Patente Teacher, OCR scanner.

## Implemented (T-018) — what the code actually does
- **Pipeline**: `AiAssistant` = IntentDetector → UserContextBuilder → KeywordRetriever → SourceVerifier → PromptBuilder → `LlmClient` → ResponseProcessor → label → ActionSuggester.
- **Knowledge index** (`knowledge_chunks`): derived from PUBLISHED guides, government services/offices, appointment guides, one chunk per locale+section, only if source name + https URL exist. Kept in step by `ContentChanged` (create/edit/delete/transition) → `ReindexKnowledge`; `expa:ai-reindex` rebuilds. Italian term is part of every chunk's search text, so questions in any language match it.
- **Retrieval**: shared `TextNormalizer` (Arabic diacritics/tatweel/alef/ya/ta-marbuta/digits, Italian accents, "ال" stripping), scored lexically (title ×3, coverage, requested-locale, official, freshness), ≤2 chunks per item, top 5. Swappable for a vector retriever behind `retrieve()`.
- **Hard rules in code (not prompt)**: emergencies → static 112/118/113/115 text, no LLM, no quota. Sensitive intents (immigration, documents, health, money, business, housing, appointments) with no verified source → canned "no verified info" + browse-guides action, no LLM, no quota. Output URLs not in the verified source list are replaced; `[n]` citations outside the provided range are removed. Label is computed from the sources (never from the model): any official → `official`; institutional → `general_guidance`; only third-party/partner → `third_party`; none → `ai_explanation`.
- **Prompt hardening**: sources/profile/user text wrapped in delimiters; forged delimiter tags are stripped from content; system prompt declares them data.
- **Personalization**: profile context only with `ai_personalization` consent; contains nationality, city, situation, residence type, Italian level and expiring document *types + days* — never name, email, labels, notes or files.
- **Failure mode**: provider error/timeout → HTTP 200, `degraded:true`, localized "I couldn't process that right now…" + search action, quota refunded.
- **Limits**: atomic per-day counter (`ai_usage`), plan via `PlanResolver` (subscriptions plug in later), plus 20/min throttle.
- **Privacy**: messages and titles encrypted at rest, 12-month retention (`expa:prune-ai-messages`), export/erase via `AiData`, conversations owner-scoped.
- **Drivers**: `AI_DRIVER=fake|anthropic`. The Anthropic adapter (Messages API) is implemented and tested against `Http::fake`; **live use is untested and needs `ANTHROPIC_API_KEY` (T-019 BLOCKED)**.
- **Not built yet**: vector embeddings, streaming responses, rental checker / document explainer / OCR (post-MVP), jobs/lessons/patente knowledge sources (added when those modules exist).
