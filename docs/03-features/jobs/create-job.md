# Feature: Create a Job

## Purpose

Creates a recruiter-owned vacancy as the starting point for requirement
extraction, activation, resume upload, and candidate ranking.

## Entry point

- API: `POST /jobs`
- Request body: `{ "title": "…", "rawDescription": "…" }`
- Backend: `backend/src/modules/job/job.controller.js` and `job.service.js`

## Behavior

1. Authentication middleware resolves the current user.
2. The controller requires non-empty `title` and `rawDescription` strings.
3. The service counts jobs owned by that user.
4. When the free-tier job limit has not been reached, it persists a `Job` record
   with `status: DRAFT`.
5. The client receives the new job; no AI or queue work starts automatically.

## Rules and constraints

- A job belongs to exactly one user.
- The default per-user job cap is `FREE_TIER_MAX_JOBS_PER_USER=5`.
- A quota breach returns `409`, rather than creating a partial job.
- A new job cannot accept deterministic scoring until requirement extraction,
  validation, and activation are complete.

## Data written

`Job`: `userId`, `title`, `rawDescription`, `status`, timestamps.

## Related flows

- [AI requirement extraction](ai-requirement-extraction.md)
- [Job activation](job-activation.md)
- [API overview](../../04-api/api-overview.md)
