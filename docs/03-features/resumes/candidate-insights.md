# Feature: Candidate Insights

## Purpose

Generates recruiter-readable interpretation after deterministic scoring: summary,
strengths, weaknesses, and interview questions.

## Preconditions

Insight generation starts from `SCORED` and atomically moves the resume to
`INSIGHTS_GENERATING`. It requires valid structured resume data, score breakdown,
related job, and structured job requirements.

## Internal behavior

1. The insight worker builds a schema-constrained prompt from structured
   candidate/job inputs and the score breakdown.
2. The configured AI provider returns JSON.
3. The backend parses and validates that JSON before storing it.
4. The backend derives the recommendation from the saved numeric score and adds
   it to the persisted insights; model text is not the recommendation authority.
5. On success, status becomes `INSIGHTS_GENERATED`.

## Reliability

Provider/network failures may be retried with backoff. Invalid schema output,
missing prerequisites, or exhausted failures create `FAILED_INSIGHTS` and store
failure context. See [retry and recovery](retry-and-recovery.md).

## Privacy boundary

The AI receives only the pipeline data needed for this operation. Treat all
candidate input as sensitive personal data and do not add unnecessary fields to
prompts.
