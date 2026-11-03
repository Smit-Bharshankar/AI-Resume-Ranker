# Retry, Recovery, and Reliability Guide

This document describes the reliability hardening implemented for the async processing pipeline:

- `jobExtractionWorker` (job requirements structuring)
- `resumeWorker` (resume extraction, structuring, scoring, insight enqueue)
- `insightWorker` (insight generation)

It covers retry behavior, failure semantics, timeout controls, deduplication, stuck-job recovery, manual user-triggered retry, and global 429 cooldown handling.

---

## 1. Pipeline Stages and Failure States

### Resume lifecycle

`UPLOADED -> TEXT_EXTRACTED -> STRUCTURED -> SCORED -> INSIGHTS_GENERATING -> INSIGHTS_GENERATED`

### Resume failure states

- `FAILED_EXTRACTION`
- `FAILED_STRUCTURE`
- `FAILED_SCORING`
- `FAILED_INSIGHTS`

### Job extraction lifecycle

`EXTRACTING_REQUIREMENTS -> REQUIREMENTS_STRUCTURED`

### Job extraction failure state

- `FAILED_STRUCTURE`

---

## 2. BullMQ Success/Failure Semantics

### Principle

BullMQ job status should reflect real pipeline outcome:

- Successful stage transition => BullMQ success
- Terminal failure (`FAILED_*`) => BullMQ failure (throw)

### Implemented behavior

- Workers classify retryability and throw appropriately.
- On non-retryable or final-attempt failure, workers persist failed status and throw.
- Missing/deleted entities are treated as safe skips (no crash loops).

### Key files

- `src/queue/resumeWorker.js`
- `src/queue/jobExtractionWorker.js`
- `src/queue/insightWorker.js`

---

## 3. Retry Classification

### Shared classifier

`src/queue/retryPolicy.js`

Provides:

- `classifyRetry(error)`
- `isRetryableError(error)`

### Retryable categories

- network/transient connectivity errors
- timeouts
- HTTP 429
- HTTP 5xx
- temporary/transient failures

### Non-retryable categories

- invalid PDF
- schema validation errors
- empty extraction result
- invalid JSON after retry exhaustion
- upstream 4xx (except 429)

---

## 4. Timeout Protection

### Generic timeout wrapper

`src/utils/operationTimeout.js`

Provides:

- `withOperationTimeout({ operation, timeoutMs, operationName })`
- `OperationTimeoutError` (`code=PROCESS_TIMEOUT`, `retryable=true`)

### Applied to

- Resume file download + PDF parsing:
  - `src/queue/resumeWorker.js`
  - `src/modules/upload/upload.service.js`
- AI calls:
  - `src/modules/ai/extraction.service.js`
  - `src/modules/jobExtraction/jobExtraction.service.js`
  - `src/modules/insights/insight.service.js`

---

## 5. Queue Deduplication and Enqueue Rules

All queues use deterministic `jobId` dedupe:

- resume queue: `jobId = resumeId`
- insight queue: `jobId = resumeId`
- job extraction queue: `jobId = jobId`

If an existing non-terminal job exists, enqueue is skipped and existing job is reused.

### Key files

- `src/queue/resumeQueue.js`
- `src/queue/insightQueue.js`
- `src/queue/jobExtractionQueue.js`

---

## 6. Stage Retry Configuration

Configured via env (defaults shown):

- extraction attempts: `RESUME_EXTRACTION_ATTEMPTS=3`
- structuring attempts: `RESUME_STRUCTURING_ATTEMPTS=2`
- scoring attempts: `RESUME_SCORING_ATTEMPTS=1`
- insights attempts: `RESUME_INSIGHTS_ATTEMPTS=2`
- exponential backoff base: `STAGE_BACKOFF_MS=5000`

### Key file

- `src/config/env.js`

---

## 7. Structured Stage Logging

Workers now emit structured per-stage logs including:

- identifier (`resumeId` / `jobId`)
- `stage`
- `attempt`
- `durationMs`
- `result` (`success` / `failed` / `retry`)
- failure code (if any)

### Key files

- `src/queue/resumeWorker.js`
- `src/queue/jobExtractionWorker.js`
- `src/queue/insightWorker.js`

---

## 8. Stuck-Job Recovery Worker (Self-Healing)

### Worker

`src/queue/recoveryWorker.js`

### Schedule

- runs every `RECOVERY_SCAN_INTERVAL_MS` (default 3 minutes)

### Stuck criteria

- status in:
  - `TEXT_EXTRACTED`
  - `STRUCTURED`
  - `SCORED`
  - `INSIGHTS_GENERATING`
- `updatedAt < now - RECOVERY_STALE_AFTER_MS` (default 5 minutes)

### Actions

- `TEXT_EXTRACTED` / `STRUCTURED` => requeue resume pipeline
- `SCORED` / `INSIGHTS_GENERATING` => requeue insight generation
- dedupe-safe enqueue with deterministic `jobId`
- recovery event logging

### Data access

- `resumeRepository.findStuckResumes(...)`
- `resumeService.findStuckResumes(...)`

### Scripts

- `npm run worker:recovery`
- `npm run worker:recovery:dev`

---

## 9. Manual Retry API (User-Triggered Recovery)

### Endpoint

`POST /resumes/:resumeId/retry`

### Implemented modules

- Validation mapping:
  - `src/modules/resume/retry.validation.js`
- Service:
  - `src/modules/resume/manualRetry.service.js`
- Controller/route:
  - `src/modules/resume/resume.controller.js`
  - `src/modules/resume/resume.routes.js`
- Queue retry counter:
  - `src/queue/manualRetryLimiter.js`

### Eligibility

Only failed statuses are retryable:

- `FAILED_EXTRACTION`
- `FAILED_STRUCTURE`
- `FAILED_SCORING`
- `FAILED_INSIGHTS`

### Stage-aware reset mapping

- `FAILED_EXTRACTION -> UPLOADED`
- `FAILED_STRUCTURE -> TEXT_EXTRACTED`
- `FAILED_SCORING -> STRUCTURED`
- `FAILED_INSIGHTS -> SCORED`

Reset is atomic and scoped by owner/status:

- clear `lastProcessingFailure`
- update `status`
- rely on Prisma `updatedAt @updatedAt`

### Queue safety

Before retry:

- checks active/in-flight queue jobs (`resumeQueue` and `insightQueue`)
- blocks retry if already processing
- best-effort stale queue cleanup (`removeJobs`)
- dedupe-safe re-enqueue via existing queue helpers

### Response metadata

Retry and resume detail responses expose:

- `currentStatus`
- `retryAllowed`
- `lastError`
- `retryCount`

### Manual retry abuse guard

Redis-backed per-resume manual retry limit:

- `MANUAL_RETRY_MAX_PER_RESUME` (default `3`)
- `MANUAL_RETRY_COUNTER_TTL_SEC` (default `90 days`)

---

## 10. 429 Protection and Retry-Storm Control

### Problem solved

Without global coordination, 429 can trigger compounded retries from:

- workers
- user manual retries
- recovery scans

### Guard implemented

`src/modules/ai/rateBudget.js` now includes global cooldown:

- `activateGlobalRateLimitCooldown(ttlSec)`
- `is/get global cooldown`
- `waitForAiBudget` fails fast with retryable cooldown error while active

### Cooldown activation points

On detected `429`, services activate global cooldown:

- `src/modules/ai/extraction.service.js`
- `src/modules/jobExtraction/jobExtraction.service.js`
- `src/modules/insights/insight.service.js`

### Manual retry cooldown respect

Manual retry endpoint checks cooldown and returns user-safe `429` response instead of enqueueing.

### Env

- `AI_GLOBAL_RATE_LIMIT_COOLDOWN_SEC` (default `60`)

---

## 11. Deleted Entity Handling

Workers handle deleted records gracefully:

- missing resume/job => safe skip
- no throw loops for deleted entities

Key files:

- `src/queue/resumeWorker.js`
- `src/queue/jobExtractionWorker.js`
- `src/queue/insightWorker.js`

---

## 12. Operational Checklist

Recommended process configuration:

1. Run workers:
   - `worker:resume`
   - `worker:insight`
   - `worker:job-extraction`
   - `worker:recovery`
2. Set conservative stage backoff and limits in production.
3. Monitor logs for:
   - `manual_retry`
   - `resume_recovered`
   - `recovery_scan_completed`
   - stage execution logs (`result=retry|failed`)
4. Use Bull Board for queue visibility and failed-job inspection.

---

## 13. Environment Variables Added

From `src/config/env.js`:

- `RESUME_EXTRACTION_ATTEMPTS`
- `RESUME_STRUCTURING_ATTEMPTS`
- `RESUME_SCORING_ATTEMPTS`
- `RESUME_INSIGHTS_ATTEMPTS`
- `STAGE_BACKOFF_MS`
- `PDF_PARSE_TIMEOUT_MS`
- `STORAGE_READ_TIMEOUT_MS`
- `AI_CALL_TIMEOUT_MS`
- `RECOVERY_SCAN_INTERVAL_MS`
- `RECOVERY_STALE_AFTER_MS`
- `RECOVERY_BATCH_SIZE`
- `AI_GLOBAL_RATE_LIMIT_COOLDOWN_SEC`
- `MANUAL_RETRY_MAX_PER_RESUME`
- `MANUAL_RETRY_COUNTER_TTL_SEC`

---

## 14. Notes

- The reliability layer is intentionally status-guarded and idempotent.
- Queue dedupe and DB state checks are the primary anti-duplication controls.
- Recovery worker is designed as a safety net, not a replacement for normal worker flow.
