# Backend Worker and Pipeline Architecture

This document explains the backend processing system end-to-end, focused on the 3 BullMQ workers and all server-side stages from job/resume inputs to final persisted outputs.

Scope:
- Backend only (API, queues, workers, services, persistence, AI providers, observability)
- No UI behavior
- Current implementation as in this repository

## 1. Runtime Components

Main backend processes:
- API server: `npm run dev` -> [src/server.js](c:/Projects/AI Resume Ranker/backend/src/server.js)
- Resume worker: `npm run worker:resume` -> [src/queue/resumeWorker.js](c:/Projects/AI Resume Ranker/backend/src/queue/resumeWorker.js)
- Job extraction worker: `npm run worker:job-extraction` -> [src/queue/jobExtractionWorker.js](c:/Projects/AI Resume Ranker/backend/src/queue/jobExtractionWorker.js)
- Insight worker: `npm run worker:insight` -> [src/queue/insightWorker.js](c:/Projects/AI Resume Ranker/backend/src/queue/insightWorker.js)

Monitoring surface:
- Bull Board route mounted on API server: `/admin/queues`
- Wiring: [src/queue/bullBoard.js](c:/Projects/AI Resume Ranker/backend/src/queue/bullBoard.js)

## 2. Data Model and Status State Machines

Schema source: [prisma/schema.prisma](c:/Projects/AI Resume Ranker/backend/prisma/schema.prisma)

### Job statuses
- `DRAFT`
- `EXTRACTING_REQUIREMENTS`
- `REQUIREMENTS_STRUCTURED`
- `ACTIVE`
- `FAILED_STRUCTURE`

Typical transitions:
1. `DRAFT` -> `EXTRACTING_REQUIREMENTS` (API request)
2. `EXTRACTING_REQUIREMENTS` -> `REQUIREMENTS_STRUCTURED` (job extraction success)
3. `EXTRACTING_REQUIREMENTS` -> `FAILED_STRUCTURE` (job extraction failure)
4. `REQUIREMENTS_STRUCTURED` -> `ACTIVE` (manual activation API)

### Resume statuses
- `UPLOADED`
- `TEXT_EXTRACTED`
- `STRUCTURED`
- `SCORED`
- `INSIGHTS_GENERATING`
- `INSIGHTS_GENERATED`
- `FAILED_EXTRACTION`
- `FAILED_STRUCTURE`
- `FAILED_SCORING`
- `FAILED_INSIGHTS`

Typical transitions:
1. `UPLOADED` -> `TEXT_EXTRACTED` (PDF parsing)
2. `TEXT_EXTRACTED` -> `STRUCTURED` (AI resume structuring)
3. `STRUCTURED` -> `SCORED` (deterministic scoring)
4. `SCORED` -> `INSIGHTS_GENERATING` (insight service start)
5. `INSIGHTS_GENERATING` -> `INSIGHTS_GENERATED` (AI insights success)

Failure transitions:
- `UPLOADED` -> `FAILED_EXTRACTION`
- `TEXT_EXTRACTED` -> `FAILED_STRUCTURE`
- `STRUCTURED` -> `FAILED_SCORING`
- `INSIGHTS_GENERATING` -> `FAILED_INSIGHTS`

### Candidate stage (manual business stage, independent of AI pipeline)
- `NEW`, `SHORTLISTED`, `INTERVIEWING`, `REJECTED`, `HIRED`
- Transition rules enforced in: [src/modules/resume/stage.service.js](c:/Projects/AI Resume Ranker/backend/src/modules/resume/stage.service.js)

## 3. Queue Topology and Semantics

Queue definitions:
- Resume queue: [src/queue/resumeQueue.js](c:/Projects/AI Resume Ranker/backend/src/queue/resumeQueue.js)
- Job extraction queue: [src/queue/jobExtractionQueue.js](c:/Projects/AI Resume Ranker/backend/src/queue/jobExtractionQueue.js)
- Insight queue: [src/queue/insightQueue.js](c:/Projects/AI Resume Ranker/backend/src/queue/insightQueue.js)

Shared Redis connection:
- Created once in `resumeQueue.js` and reused by all queues/workers.

Default queue behavior:
- Exponential backoff
- Queue-level attempts from env
- `removeOnComplete` and `removeOnFail` both keep latest 1000 jobs

Dedup/idempotency at enqueue time:
- Each queue uses deterministic `jobId`:
  - resume queue uses `resumeId`
  - insight queue uses `resumeId`
  - job extraction queue uses `jobId`
- If an existing job with same ID is in non-terminal state, enqueue returns that existing job.
- If existing job is `failed`/`completed`, it is removed and a fresh job is added.

## 4. Timeouts, Retries, and Error Layers

### 4.1 Worker-level timeout wrapper
- Shared helper: [src/queue/processorTimeout.js](c:/Projects/AI Resume Ranker/backend/src/queue/processorTimeout.js)
- Applied in all 3 workers via `withProcessTimeout(...)`
- Throws `ProcessTimeoutError` with `code="PROCESS_TIMEOUT"` and `retryable=true`

Important behavior:
- Timeout marks the BullMQ job failed/retriable
- It does **not** cancel underlying in-flight I/O (it races and returns failure first)

### 4.2 Queue-level retries (BullMQ)
Configured in env ([src/config/env.js](c:/Projects/AI Resume Ranker/backend/src/config/env.js)):
- `RESUME_QUEUE_ATTEMPTS` (default 3)
- `JOB_EXTRACTION_QUEUE_ATTEMPTS` (default 3)
- `RESUME_INSIGHT_QUEUE_ATTEMPTS` (default 2)

### 4.3 Service-level AI retries
Internal retries inside services (in addition to queue retries):
- Resume structuring: `env.aiExtractionMaxRetries` (default 2) in [extraction.service.js](c:/Projects/AI Resume Ranker/backend/src/modules/ai/extraction.service.js)
- Job extraction: `MAX_AI_RETRIES = 2` in [jobExtraction.service.js](c:/Projects/AI Resume Ranker/backend/src/modules/jobExtraction/jobExtraction.service.js)
- Insights generation: `MAX_AI_RETRIES = 2` in [insight.service.js](c:/Projects/AI Resume Ranker/backend/src/modules/insights/insight.service.js)

Backoff for service retries:
- Uses `retry-after` header when present
- Else exponential with `AI_EXTRACTION_RETRY_BASE_DELAY_MS`

## 5. AI Provider Abstraction and Call Sites

Provider factory:
- [src/modules/ai/providers/provider.factory.js](c:/Projects/AI Resume Ranker/backend/src/modules/ai/providers/provider.factory.js)
- Selects `gemini` or `openai` from env
- Singleton provider instance in-process

Provider implementations:
- OpenAI: [openai.provider.js](c:/Projects/AI Resume Ranker/backend/src/modules/ai/providers/openai.provider.js)
- Gemini: [gemini.provider.js](c:/Projects/AI Resume Ranker/backend/src/modules/ai/providers/gemini.provider.js)

AI is called in exactly 3 services:
1. Resume structuring: `requestStructuredResume()` in [extraction.service.js](c:/Projects/AI Resume Ranker/backend/src/modules/ai/extraction.service.js)
2. Job requirements extraction: `requestStructuredRequirements()` in [jobExtraction.service.js](c:/Projects/AI Resume Ranker/backend/src/modules/jobExtraction/jobExtraction.service.js)
3. Resume insights generation: `requestInsights()` in [insight.service.js](c:/Projects/AI Resume Ranker/backend/src/modules/insights/insight.service.js)

No AI calls in:
- API controllers
- Queue modules
- Scoring service (pure deterministic logic)

## 6. End-to-End Flow: Job Description -> Structured Requirements

### Entry API
- Route: `POST /jobs/:id/extract`
- Controller: [job.controller.js](c:/Projects/AI Resume Ranker/backend/src/modules/job/job.controller.js)

Steps:
1. Validate job UUID and ownership.
2. Ensure current status is `DRAFT` or `FAILED_STRUCTURE`.
3. Atomic transition attempt: `currentStatus -> EXTRACTING_REQUIREMENTS` via `updateMany` guard.
4. Enqueue job extraction queue with payload `{ jobId, userId }`.
5. If enqueue fails, rollback status to prior status.

### Worker execution
Worker file: [jobExtractionWorker.js](c:/Projects/AI Resume Ranker/backend/src/queue/jobExtractionWorker.js)

Worker process path:
1. Validate queue payload.
2. Resolve owner context for analytics.
3. Call `jobExtractionService.process(jobId)`.
4. On thrown error, worker decides retry by `error.retryable === true`.

### Service execution
Service file: [jobExtraction.service.js](c:/Projects/AI Resume Ranker/backend/src/modules/jobExtraction/jobExtraction.service.js)

Core logic:
1. Verify job exists and status is `EXTRACTING_REQUIREMENTS`.
2. Build prompt via [jobPrompt.builder.js](c:/Projects/AI Resume Ranker/backend/src/modules/jobExtraction/jobPrompt.builder.js)
3. AI call via provider abstraction.
4. Parse JSON: [json.parser.js](c:/Projects/AI Resume Ranker/backend/src/modules/ai/json.parser.js)
5. Validate schema: [jobSchema.validator.js](c:/Projects/AI Resume Ranker/backend/src/modules/jobExtraction/jobSchema.validator.js)
6. Persist with guarded transition to `REQUIREMENTS_STRUCTURED`.
7. On terminal failure, mark `FAILED_STRUCTURE`.

## 7. End-to-End Flow: Resume Upload -> Insights Generated

### Upload entry API
- Route: `POST /jobs/:id/resumes`
- Controller: [upload.controller.js](c:/Projects/AI Resume Ranker/backend/src/modules/upload/upload.controller.js)
- Multer constraints in [upload.routes.js](c:/Projects/AI Resume Ranker/backend/src/modules/upload/upload.routes.js)

Input constraints:
- PDFs only
- Max file size 5 MB each
- Max files 30 per request

Upload service path ([upload.service.js](c:/Projects/AI Resume Ranker/backend/src/modules/upload/upload.service.js)):
1. Verify job exists and belongs to user.
2. For each file:
   - Upload PDF to Supabase storage ([supabaseStorage.js](c:/Projects/AI Resume Ranker/backend/src/storage/supabaseStorage.js))
   - Create resume row with status `UPLOADED`
   - Enqueue resume queue job `{ resumeId, userId, jobId }`
3. On per-file failure, rollback DB row and storage object.

### Resume worker pipeline
Worker file: [resumeWorker.js](c:/Projects/AI Resume Ranker/backend/src/queue/resumeWorker.js)

Stage A: Text extraction (non-AI)
- Preconditions: resume status is `UPLOADED`
- Download file from Supabase
- Parse PDF text via `pdf-parse`
- Normalize text
- Persist guarded transition `UPLOADED -> TEXT_EXTRACTED`
- On final queue attempt failure, mark `FAILED_EXTRACTION`

Stage B: Resume structuring (AI)
- Triggered when status `TEXT_EXTRACTED`
- Calls `resumeExtractionService.process(resumeId)`
- Service performs prompt build, AI call, parse, schema validation
- Persist guarded transition `TEXT_EXTRACTED -> STRUCTURED`
- On terminal failure, mark `FAILED_STRUCTURE`

Stage C: Scoring (deterministic)
- Triggered when status `STRUCTURED`
- Calls `resumeMatchingService.process(resumeId)`
- Requires job status `ACTIVE` and structured requirements present
- Score formula in [scoring.engine.js](c:/Projects/AI Resume Ranker/backend/src/modules/matching/scoring.engine.js)
- Persist guarded transition `STRUCTURED -> SCORED`
- On error, mark `FAILED_SCORING`

Stage D: Insight queue enqueue
- Triggered after successful scoring (`SCORED`)
- Enqueue insight queue job with same resume ID dedup key

### Insight worker pipeline
Worker file: [insightWorker.js](c:/Projects/AI Resume Ranker/backend/src/queue/insightWorker.js)

Service file: [insight.service.js](c:/Projects/AI Resume Ranker/backend/src/modules/insights/insight.service.js)

Steps:
1. Validate payload and resume existence.
2. Ensure status is `SCORED` or `INSIGHTS_GENERATING`.
3. If `SCORED`, atomically move to `INSIGHTS_GENERATING`.
4. Validate prerequisites:
   - resume structured data exists
   - score breakdown exists
   - related job exists with structured requirements
5. Build prompt and call AI.
6. Parse and validate insight JSON schema.
7. Persist guarded transition `INSIGHTS_GENERATING -> INSIGHTS_GENERATED`.
8. On terminal failure, mark `FAILED_INSIGHTS`.

## 8. Where Concurrency Safety Is Enforced

Pattern used heavily:
- `updateMany(... where: { id, status: expectedStatus })`
- Treat `count === 0` as status changed concurrently, then skip/abort gracefully

This prevents stale worker attempts from corrupting state transitions.

Files with guarded state writes:
- [job.repository.js](c:/Projects/AI Resume Ranker/backend/src/modules/job/job.repository.js)
- [resume.repository.js](c:/Projects/AI Resume Ranker/backend/src/modules/resume/resume.repository.js)

## 9. Analytics and Error Reporting

Sentry:
- API + workers capture exceptions
- Setup in [sentry.js](c:/Projects/AI Resume Ranker/backend/src/monitoring/sentry.js)

PostHog:
- Tracks analysis started/completed and worker_failed events
- Helper in [posthog.js](c:/Projects/AI Resume Ranker/backend/src/analytics/posthog.js)

## 10. Configuration Surface (Most Important Env Vars)

Queue and worker:
- `REDIS_URL` or `REDIS_HOST/PORT/...`
- `RESUME_QUEUE_NAME`, `RESUME_QUEUE_ATTEMPTS`, `RESUME_QUEUE_BACKOFF_MS`
- `JOB_EXTRACTION_QUEUE_NAME`, `JOB_EXTRACTION_QUEUE_ATTEMPTS`, `JOB_EXTRACTION_QUEUE_BACKOFF_MS`
- `RESUME_INSIGHT_QUEUE_NAME`, `RESUME_INSIGHT_QUEUE_ATTEMPTS`, `RESUME_INSIGHT_QUEUE_BACKOFF_MS`
- `RESUME_WORKER_CONCURRENCY`, `JOB_EXTRACTION_WORKER_CONCURRENCY`, `RESUME_INSIGHT_WORKER_CONCURRENCY`
- `RESUME_PROCESS_TIMEOUT_MS`, `JOB_EXTRACTION_PROCESS_TIMEOUT_MS`, `RESUME_INSIGHT_PROCESS_TIMEOUT_MS`

AI:
- `AI_PROVIDER` (`gemini` or `openai`)
- `AI_API_KEY`, `AI_MODEL`
- `AI_REQUEST_TIMEOUT_MS`, `AI_MAX_OUTPUT_TOKENS`
- `AI_EXTRACTION_MAX_RETRIES`, `AI_EXTRACTION_RETRY_BASE_DELAY_MS`

Storage/auth:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`
- `SUPABASE_ANON_KEY` (or publishable fallback) for auth validation middleware

## 11. Worker-by-Worker AI Call Matrix

Resume worker (`resumeWorker`):
- Calls AI in structuring stage only (`resumeExtractionService.process`)
- Does not call AI for PDF text extraction or scoring
- Enqueues insight worker after scoring

Job extraction worker (`jobExtractionWorker`):
- Calls AI once per internal attempt in `jobExtractionService.process`
- Converts raw job description -> structured requirements

Insight worker (`insightWorker`):
- Calls AI to produce recruiter-facing insight JSON
- Requires structured resume + structured requirements + score breakdown

## 12. Important Robustness Notes (Current Behavior)

1. Nested retry amplification
- Queue retries and service-level retries both exist.
- In worst-case paths this multiplies AI calls (attempts x internal retries).

2. Timeout is logical, not cancellation
- `withProcessTimeout` fails job after deadline, but in-flight network/storage calls are not force-cancelled (except provider-level abort mechanisms where implemented internally).

3. Job extraction retry signaling mismatch
- `jobExtractionService.process` usually returns `{ status: "failed" }` instead of throwing on AI/schema failure.
- `jobExtractionWorker` only retries when an error is thrown and `error.retryable === true`.
- Result: many failures become "completed with failed status in DB" rather than true BullMQ failed/retried jobs.

4. Hardcoded retries in some services
- Job extraction and insights use hardcoded `MAX_AI_RETRIES = 2`, while resume structuring uses env-driven retries.
- Behavior is inconsistent across services.

5. Potential duplicate failure side-effects
- Some workers call failure state updates both in processing catch and failed-event handlers, which can duplicate writes/log noise.

## 13. Optimization and Hardening Recommendations

Priority 1:
1. Standardize retry contract across all services.
- Either always throw typed errors for retriable vs non-retriable, or return structured result and let worker decide uniformly.

2. Make retry policy centralized and env-driven.
- Replace hardcoded `MAX_AI_RETRIES` in job/insight services with env variables.

3. Align BullMQ job outcome with business outcome.
- If service returns `{status: "failed"}`, decide if Bull job should fail too (for visibility/retry) or intentionally complete with terminal business failure.

Priority 2:
1. Add per-stage timeout controls inside resume pipeline (text extraction, structuring, scoring enqueue) rather than only whole-job timeout.
2. Add queue dead-letter strategy for repeatedly failing jobs.
3. Add idempotency keys for upload requests if clients can retry same request.

Priority 3:
1. Add structured metrics counters (success/fail/skip by stage and reason code).
2. Add correlation IDs across API enqueue -> worker logs.
3. Add integration tests that assert status transition correctness under concurrent updates.

## 14. Quick Reference: Key Files

API and routing:
- [src/server.js](c:/Projects/AI Resume Ranker/backend/src/server.js)
- [src/modules/job/job.routes.js](c:/Projects/AI Resume Ranker/backend/src/modules/job/job.routes.js)
- [src/modules/upload/upload.routes.js](c:/Projects/AI Resume Ranker/backend/src/modules/upload/upload.routes.js)
- [src/modules/resume/resume.routes.js](c:/Projects/AI Resume Ranker/backend/src/modules/resume/resume.routes.js)

Queue and workers:
- [src/queue/resumeQueue.js](c:/Projects/AI Resume Ranker/backend/src/queue/resumeQueue.js)
- [src/queue/jobExtractionQueue.js](c:/Projects/AI Resume Ranker/backend/src/queue/jobExtractionQueue.js)
- [src/queue/insightQueue.js](c:/Projects/AI Resume Ranker/backend/src/queue/insightQueue.js)
- [src/queue/resumeWorker.js](c:/Projects/AI Resume Ranker/backend/src/queue/resumeWorker.js)
- [src/queue/jobExtractionWorker.js](c:/Projects/AI Resume Ranker/backend/src/queue/jobExtractionWorker.js)
- [src/queue/insightWorker.js](c:/Projects/AI Resume Ranker/backend/src/queue/insightWorker.js)
- [src/queue/processorTimeout.js](c:/Projects/AI Resume Ranker/backend/src/queue/processorTimeout.js)
- [src/queue/bullBoard.js](c:/Projects/AI Resume Ranker/backend/src/queue/bullBoard.js)

AI services/providers:
- [src/modules/ai/extraction.service.js](c:/Projects/AI Resume Ranker/backend/src/modules/ai/extraction.service.js)
- [src/modules/jobExtraction/jobExtraction.service.js](c:/Projects/AI Resume Ranker/backend/src/modules/jobExtraction/jobExtraction.service.js)
- [src/modules/insights/insight.service.js](c:/Projects/AI Resume Ranker/backend/src/modules/insights/insight.service.js)
- [src/modules/ai/providers/provider.factory.js](c:/Projects/AI Resume Ranker/backend/src/modules/ai/providers/provider.factory.js)
- [src/modules/ai/providers/openai.provider.js](c:/Projects/AI Resume Ranker/backend/src/modules/ai/providers/openai.provider.js)
- [src/modules/ai/providers/gemini.provider.js](c:/Projects/AI Resume Ranker/backend/src/modules/ai/providers/gemini.provider.js)

Persistence:
- [src/modules/job/job.repository.js](c:/Projects/AI Resume Ranker/backend/src/modules/job/job.repository.js)
- [src/modules/resume/resume.repository.js](c:/Projects/AI Resume Ranker/backend/src/modules/resume/resume.repository.js)
- [prisma/schema.prisma](c:/Projects/AI Resume Ranker/backend/prisma/schema.prisma)
