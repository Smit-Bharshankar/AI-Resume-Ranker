# Feature: AI Requirement Extraction

## Purpose

Turns the recruiter-provided raw job description into validated, editable
structured requirements used by the deterministic scoring engine.

## Entry point and state transition

- API: `POST /jobs/:id/extract`
- Allowed status: `DRAFT` or `FAILED_STRUCTURE`
- Immediate state: `EXTRACTING_REQUIREMENTS`
- Queue: job-requirements extraction queue

## Internal flow

1. The API verifies ownership and an allowed current status.
2. A conditional status write prevents two extraction requests from starting
   concurrently.
3. The API enqueues `{ jobId, userId }`; if enqueueing fails, it restores the
   prior status.
4. The worker builds a requirements prompt from `rawDescription` and calls the
   configured AI provider through the provider abstraction.
5. Returned JSON is parsed and schema-validated.
6. Valid output is persisted in `structuredRequirements` and the job becomes
   `REQUIREMENTS_STRUCTURED`. Terminal failure becomes `FAILED_STRUCTURE`.

## Output contract

The structured requirements schema contains the scoring inputs: required skills,
preferred skills, and minimum experience. The exact validation contract is owned
by `backend/src/modules/jobExtraction/jobSchema.validator.js`, not by an AI
response alone.

## Recruiter control and failure handling

The recruiter can review and edit requirements only while the job is
`REQUIREMENTS_STRUCTURED`. A failed extraction may be started again. Queue and
AI retry behavior is documented in [queues and workers](../../06-operations/queues-and-workers.md).

## Observability

Starting extraction emits the PostHog `analysis_started` event with
`analysis_type: requirements_extraction`. Worker errors go to logs/Sentry.
