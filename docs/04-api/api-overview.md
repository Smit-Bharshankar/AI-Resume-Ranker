# Backend API Reference

## Base behavior

The API server exposes `/health` without authentication. All `/jobs`,
`/resumes`, and `/users` endpoints require the authentication middleware and are
also rate limited. Successful resource responses use `{ success: true, data }`;
errors normally use `{ success: false, error }`.

All resource IDs below are UUIDs. Invalid IDs return `400`; inaccessible or
missing owner-scoped records return `404`.

## Health and operations

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Returns `{ status: "ok" }` for process health checks. |
| GET | `/admin/queues` | Bull Board queue interface. Treat as operationally sensitive. |

## Jobs

| Method | Path | Purpose and main rules |
| --- | --- | --- |
| GET | `/jobs` | Lists the authenticated user’s jobs. |
| POST | `/jobs` | Creates a `DRAFT` job. Body requires non-empty `title` and `rawDescription`; user job quota applies. |
| GET | `/jobs/:id` | Reads one owned job. |
| POST | `/jobs/:id/extract` | Queues requirements extraction. Allowed only from `DRAFT` or `FAILED_STRUCTURE`. |
| PATCH | `/jobs/:id/requirements` | Replaces structured requirements after schema validation. Allowed only in `REQUIREMENTS_STRUCTURED`. |
| PATCH | `/jobs/:id/activate` | Activates a validated structured job. Allowed only in `REQUIREMENTS_STRUCTURED`. |
| GET | `/jobs/:id/resumes` | Lists resumes belonging to an owned job. |
| POST | `/jobs/:id/resumes` | Multipart upload using `files`; PDF-only and user/job quotas apply. |
| DELETE | `/jobs/:jobId?confirm=true` | Deletes an owned job and associated resumes/files. Requires explicit confirmation. |

### Structured requirements payload

`PATCH /jobs/:id/requirements` accepts the schema validated by
`src/modules/jobExtraction/jobSchema.validator.js`. The current concept is a
structured version of the description containing required skills, preferred
skills, and minimum experience; use the frontend’s emitted shape or the
validator as the contract source when changing this endpoint.

## Resumes

| Method | Path | Purpose and main rules |
| --- | --- | --- |
| GET | `/resumes/:id` | Returns an owned resume, pipeline outputs, and manual-retry information. |
| GET | `/resumes/:id/file` | Returns signed access data for the owned original PDF. |
| PATCH | `/resumes/:resumeId/stage` | Updates recruiter business stage. Body: `{ "stage": "SHORTLISTED" }`. |
| POST | `/resumes/:resumeId/retry` | Re-queues a failed resume when manual-retry policy permits it. |
| DELETE | `/resumes/:resumeId?confirm=true` | Deletes an owned resume and its stored file. Requires explicit confirmation. |

Allowed stage values are `NEW`, `SHORTLISTED`, `INTERVIEWING`, `REJECTED`, and
`HIRED`. Pipeline status and business stage are independent.

## User

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/users/me/usage` | Returns current user usage/quota information. |

## Upload constraints

- Request: `multipart/form-data`, field name `files`.
- Content type: `application/pdf` only.
- Default size cap: 5 MB per file.
- Default batch cap: 30 files, controlled by the resume-per-job setting.
- Each successful file is independently stored, persisted, and queued. A
  per-file failure is rolled back by the upload service.

## Important status codes

| Status | Meaning in this API |
| --- | --- |
| 200 | Read/update/request accepted. Asynchronous processing may still be running. |
| 201 | Job created. |
| 400 | Invalid ID, body, upload, or structured-requirements schema. |
| 401/403 | Authentication or authorization middleware rejection. |
| 404 | Resource is not found for the authenticated user. |
| 409 | Invalid state transition, changed concurrent state, or missing required processing prerequisite. |
| 429 | API rate limit or usage/manual-retry limit where applicable. |
| 500 | Unexpected server failure; inspect Sentry/logs and queue state. |

## Contract maintenance rules

- Add endpoints to this document in the same change as their route.
- Document asynchronous effects: queue insertion, state transition, storage
  write, and analytics event—not merely the immediate HTTP response.
- Do not document secrets, service-role keys, or raw signed URLs.
