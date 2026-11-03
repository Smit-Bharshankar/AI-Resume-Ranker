# Incident Runbook

## First response

1. Identify scope: one resume, one user, one queue, or all processing.
2. Record the affected job/resume ID, current status, failure details, and time.
3. Inspect API/worker logs, Sentry, and Bull Board before retrying or modifying
   records.
4. Avoid manually changing database statuses unless a documented recovery path
   cannot resolve the incident.

## Resume stuck or failed

1. Fetch `GET /resumes/:id`; check `status`, `lastProcessingFailure`, and retry
   information.
2. Determine the stage: extraction, structuring, scoring, or insights.
3. Verify the related job remains present and active for scoring.
4. Inspect the appropriate queue and worker logs.
5. Use `POST /resumes/:id/retry` only for eligible failed statuses. Respect its
   manual-retry and global provider-cooldown responses.
6. If repeatedly failing, preserve error evidence and fix the underlying cause
   before a further retry/re-upload.

## Requirements extraction failed

1. Verify AI provider configuration and run `npm run ai:smoke` from `backend/`.
2. Inspect the job’s failure data and extraction-worker logs.
3. Correct provider/rate-limit issues or the raw description as appropriate.
4. Start extraction again from `FAILED_STRUCTURE`.

## Queue backlog or outage

1. Verify Redis connectivity and all worker processes.
2. Check Bull Board for waiting, delayed, failed, and stalled jobs.
3. Inspect AI throttling settings and active global cooldown.
4. Restore worker/Redis availability; allow built-in retries/recovery to act.
5. Confirm idempotency/status guards before manually re-enqueueing work.

## Suspected data-access issue

1. Do not share resume contents or signed URLs in support channels.
2. Check authentication, owner scoping, and storage bucket access policy.
3. Rotate any exposed credential immediately through deployment secrets.
4. Preserve access logs and escalate according to the project’s security process.
