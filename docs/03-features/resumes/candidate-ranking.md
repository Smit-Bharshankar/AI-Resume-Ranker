# Feature: Candidate Ranking

## Purpose

Produces a repeatable 0–100 match score and transparent breakdown for every
structured candidate against an active job.

## Inputs

Only these structured fields affect the score:

- Resume: skills and total years of experience.
- Job: required skills, preferred skills, minimum experience years.

Names, contact data, location, and education text are not numeric scoring
inputs.

## Scoring behavior

The matching service runs only for a `STRUCTURED` resume belonging to an
`ACTIVE` job. It invokes the pure scoring engine, writes `score` and
`scoreBreakdown`, then transitions to `SCORED`. The breakdown contains matching
and missing skills, experience comparison, component scores, weights, and final
score.

The score produces a deterministic recommendation band; AI cannot choose or
override it. See [scoring and ranking](../../05-ai-and-scoring/scoring-and-ranking.md)
for formula, thresholds, and fairness posture.

## Failure and concurrency behavior

Exceptions cause `FAILED_SCORING` with a structured failure reason. If a worker
cannot save because another process changed status first, it skips safely rather
than overwriting state.
