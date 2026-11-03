# AI Extraction Ops Runbook

## Scope
This runbook covers Sprint 3 resume structuring:

`TEXT_EXTRACTED -> STRUCTURED`  
`TEXT_EXTRACTED -> FAILED_STRUCTURE` (on final failure)

It does not cover scoring, JD parsing, or insights.

## Required Env Vars
Set these in `backend/.env`:

- `AI_PROVIDER` (`gemini` or `openai`)
- `AI_API_KEY`
- `AI_MODEL`
- `AI_MAX_OUTPUT_TOKENS` (recommended: `600`)
- `AI_REQUEST_TIMEOUT_MS` (recommended: `20000`)
- `AI_EXTRACTION_MAX_RETRIES` (recommended: `2`)
- `AI_EXTRACTION_RETRY_BASE_DELAY_MS` (recommended: `500`)

Optional observability limits:

- `AI_RPM`
- `AI_RPD`
- `AI_TPM`

Provider-specific fallback vars are supported if generic vars are empty:

- Gemini: `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_RPM`, `GEMINI_RPD`, `GEMINI_TPM`
- OpenAI: `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_RPM`, `OPENAI_RPD`, `OPENAI_TPM`

## Provider/Model Switch (Config Only)
1. Set `AI_PROVIDER` to target provider.
2. Set `AI_API_KEY` for that provider.
3. Set `AI_MODEL` for that provider.
4. Restart API server and resume worker so env changes are loaded.
5. Run smoke check:

```bash
npm run ai:smoke
```

## Smoke Check
Run from `backend/`:

```bash
npm run ai:smoke
```

Expected:
- Log contains `AI extraction smoke check passed`.
- Output includes `provider`, `model`, token usage, and required structured keys.

## Common Failures And Fixes
### 1) Model Not Found (404)
Signature:
- `Gemini request failed with status 404`
- resume ends as `FAILED_STRUCTURE` after retries

Fix:
1. Verify `AI_MODEL` exists for your account/project.
2. Use a currently available model (for this setup, `gemini-2.5-flash` has been verified).
3. Re-run `npm run ai:smoke`.

### 2) Invalid JSON Retries
Signature:
- `AI response was not valid JSON`
- multiple retry attempts logged
- final status `FAILED_STRUCTURE`

Fix:
1. Ensure output tokens are not too low (`AI_MAX_OUTPUT_TOKENS` >= `600` recommended).
2. Keep `AI_PROVIDER`/`AI_MODEL` aligned.
3. Re-run smoke check.

### 3) Missing AI Config
Signature:
- startup logs show `AI config error`
- extraction fails quickly

Fix:
1. Set `AI_API_KEY` (or provider fallback key).
2. Set `AI_MODEL`.
3. Restart server/worker.

### 4) Rate Limits / Timeouts
Signature:
- retry attempts with rate/timeout errors
- increased processing latency

Fix:
1. Reduce worker concurrency or extraction throughput.
2. Keep retry settings at conservative defaults.
3. Respect plan limits (`AI_RPM`, `AI_RPD`, `AI_TPM`) during batch runs.

## Operational Notes
- Worker never calls provider SDK directly; it calls `resumeExtractionService.process(resumeId)`.
- DB writes are status-guarded (`WHERE id AND status='TEXT_EXTRACTED'`) for idempotence.
- Partial structured payloads are not persisted.
