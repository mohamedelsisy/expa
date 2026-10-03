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
