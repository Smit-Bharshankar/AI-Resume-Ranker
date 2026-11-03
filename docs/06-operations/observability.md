# Observability

## Logs

The backend uses the shared logger for API, queue, storage, and AI lifecycle
events. Important events include worker starts/failures, status transitions,
manual retries, storage deletion, AI model/provider metadata, and durations.

Never add raw resume text, bearer tokens, service-role keys, or signed URLs to
logs.

## Sentry

Set `SENTRY_DSN_BACKEND` to enable Sentry. API request/tracing middleware and
error handling are registered in `backend/src/server.js`; unhandled rejections
and uncaught exceptions are also captured. Workers use the same monitoring
integration.

## PostHog

Set `POSTHOG_KEY` to enable server-side PostHog events. Current flows include
analysis start/completion and worker-failure behavior. Events use the authenticated
user ID as `distinctId`; keep event properties operational and avoid candidate
PII unless an approved privacy policy permits it.

## Queue visibility

Bull Board is mounted at `/admin/queues`. It is useful for inspecting waiting,
active, completed, delayed, and failed work. It is operationally sensitive and
must be protected by deployment access controls before production exposure.

## Minimum production alerts

- API error-rate increase or health-check failures.
- Resume/job/insight worker failure increase.
- Queue lag, stalled jobs, and retry exhaustion.
- AI 429/rate-limit cooldowns and provider timeout spikes.
- Storage failures and database connection errors.
