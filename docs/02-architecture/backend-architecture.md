# Backend System Overview

## Purpose

The Sortres backend turns a recruiter’s job description and candidate PDF files
into explainable, ranked candidate records. It is intentionally asynchronous:
HTTP requests create or request work quickly, while workers perform file parsing
and AI work outside the request-response cycle.

## Runtime architecture

```text
React client
  | authenticated HTTP requests
  v
Express API --------------------> PostgreSQL (Prisma)
  |                                  | Job, Resume, User records
  |                                  v
  |----------------------------> Supabase Storage
  |                                  | original candidate PDFs
  v
Redis + BullMQ queues
  | job-requirements extraction worker
  | resume-processing worker
  | insight-generation worker
  | recovery worker
  v
AI provider abstraction (Gemini or OpenAI)

Sentry receives errors; PostHog receives selected product/worker events.
```

## Core principles

- **Owner-scoped data:** requests are authenticated and query records using the
  authenticated user ID. A user cannot retrieve or modify another user’s jobs or
  resumes through the normal API.
- **AI is not the scoring engine:** AI structures unstructured text and produces
  narrative insights. Numeric scores and recommendation bands are calculated by
  deterministic backend logic.
- **State is explicit:** database status fields describe pipeline progress and
  failure; candidate stage separately describes the recruiter’s decision.
- **Work is safe to retry:** queues use stable job IDs and database writes guard
  against stale workers by checking the expected prior status.

## Main business flows

### 1. Job description to active job

1. `POST /jobs` creates a job in `DRAFT`.
2. `POST /jobs/:id/extract` moves it to `EXTRACTING_REQUIREMENTS` and queues AI
   extraction.
3. The job extraction worker validates AI output and moves the job to
   `REQUIREMENTS_STRUCTURED`, or `FAILED_STRUCTURE` on terminal failure.
4. A recruiter can edit validated requirements with `PATCH /jobs/:id/requirements`.
5. `PATCH /jobs/:id/activate` transitions the job to `ACTIVE`.

### 2. Resume PDF to ranked candidate

1. `POST /jobs/:id/resumes` validates PDF uploads, stores each file, creates a
   `Resume` record in `UPLOADED`, and queues it.
2. The resume worker extracts PDF text, structures the resume using AI, and
   calculates a deterministic score once the job is active.
3. A separate insight worker generates the recruiter-facing summary, strengths,
   weaknesses, and interview prompts.
4. The client polls job/resume endpoints to show progress and final results.

### 3. Recruiter decision workflow

The recruiter independently changes a resume’s business stage through
`PATCH /resumes/:resumeId/stage`. This does not restart or alter its AI pipeline
status. Stages are `NEW`, `SHORTLISTED`, `INTERVIEWING`, `REJECTED`, and `HIRED`.

## Main source map

| Responsibility | Source |
| --- | --- |
| Express application and routes | `src/server.js` |
| Authentication and rate limits | `src/middleware/` |
| Business modules | `src/modules/` |
| Queue definitions and workers | `src/queue/` |
| AI providers and extraction helpers | `src/modules/ai/` |
| PostgreSQL model | `prisma/schema.prisma` |
| PDF storage adapter | `src/storage/supabaseStorage.js` |
| Error monitoring | `src/monitoring/sentry.js` |
| Product analytics | `src/analytics/posthog.js` |

## Boundaries and non-goals

The API is not a public multi-tenant integration API yet: it is designed for the
Sortres application client. Bull Board is mounted at `/admin/queues`; protect it
at the infrastructure layer before exposing any production environment. The
backend does not itself render recruiter screens or marketing content.

## Related documentation

- [API overview](../04-api/api-overview.md)
- [Data model and state machines](data-model.md)
- [Queue and worker architecture](../06-operations/queues-and-workers.md)
- [Resume scoring and ranking](../05-ai-and-scoring/scoring-and-ranking.md)
