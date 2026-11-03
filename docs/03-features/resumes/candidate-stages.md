# Feature: Candidate Stages

## Purpose

Tracks the recruiter’s hiring decision separately from automated processing.

## Values

`NEW`, `SHORTLISTED`, `INTERVIEWING`, `REJECTED`, and `HIRED`.

## Entry point

- API: `PATCH /resumes/:resumeId/stage`
- Body: `{ "stage": "SHORTLISTED" }`

## Transition rules

- `NEW` → shortlisted, interviewing, rejected, hired
- `SHORTLISTED` → new, interviewing, rejected, hired
- `INTERVIEWING` → shortlisted, rejected, hired
- `REJECTED` → new, shortlisted, interviewing
- `HIRED` → interviewing

An unchanged value is accepted. An invalid value returns `400`; a disallowed
transition returns `409`.

## Important separation

Candidate stage is a business decision. It does not alter resume processing
status, trigger AI calls, recalculate the score, or change quota accounting.
