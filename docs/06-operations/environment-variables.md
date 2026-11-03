# Backend Configuration Reference

Configuration is read in `src/config/env.js`. Keep secret values only in the
deployment environment; do not commit them or place them in documentation.

## Server, security, and observability

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | Runtime environment label. |
| `PORT` | `5000` | HTTP listener port. |
| `API_RATE_LIMIT_WINDOW_MS` | `60000` | API rate-limit window. |
| `API_RATE_LIMIT_MAX_REQUESTS` | `100` | Maximum requests within the window. |
| `SENTRY_DSN_BACKEND` | empty | Sentry backend error reporting. |
| `POSTHOG_KEY` | empty | PostHog analytics key. |
| `POSTHOG_HOST` | PostHog cloud | PostHog host. |

## Supabase authentication and storage

| Variable | Default | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | empty | Supabase project URL. |
| `SUPABASE_ANON_KEY` | empty | Auth token validation key. |
| `SUPABASE_PUBLISHABLE_DEFAULT_KEY` | fallback | Fallback name for the publishable auth key. |
| `SUPABASE_SERVICE_ROLE_KEY` | empty | Privileged server-side storage access; secret. |
| `SUPABASE_STORAGE_BUCKET` | `resumes` | Candidate PDF bucket. |
| `AUTH_REQUIRE_EMAIL_CONFIRMATION` | `true` | Whether auth requires confirmed email. |

## Redis and queues

| Variable group | Purpose |
| --- | --- |
| `REDIS_URL`, or `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`, `REDIS_USE_TLS` | Redis connection. |
| `RESUME_QUEUE_NAME`, `RESUME_QUEUE_ATTEMPTS`, `RESUME_QUEUE_BACKOFF_MS` | Resume queue identity and retry policy. |
| `RESUME_INSIGHT_QUEUE_NAME`, `RESUME_INSIGHT_QUEUE_ATTEMPTS`, `RESUME_INSIGHT_QUEUE_BACKOFF_MS` | Insight queue identity and retry policy. |
| `JOB_EXTRACTION_QUEUE_NAME`, `JOB_EXTRACTION_QUEUE_ATTEMPTS`, `JOB_EXTRACTION_QUEUE_BACKOFF_MS` | Job extraction queue identity and retry policy. |
| `RESUME_WORKER_CONCURRENCY`, `RESUME_INSIGHT_WORKER_CONCURRENCY`, `JOB_EXTRACTION_WORKER_CONCURRENCY` | Parallel work per worker type. |
| `RESUME_PROCESS_TIMEOUT_MS`, `RESUME_INSIGHT_PROCESS_TIMEOUT_MS`, `JOB_EXTRACTION_PROCESS_TIMEOUT_MS` | Logical worker timeout. |

Resume/insight limiter variables and per-stage retry variables are also exposed
in `env.js`; tune them together with the selected AI provider’s capacity.

## AI provider and rate controls

| Variable | Default | Purpose |
| --- | --- | --- |
| `AI_PROVIDER` | `gemini` | Selects `gemini` or `openai`. |
| `AI_API_KEY` | empty | Provider key; provider-specific key names are fallbacks. |
| `AI_MODEL` | provider default | Model identifier. |
| `AI_MAX_OUTPUT_TOKENS` | `600` | Max structured/narrative output length. |
| `AI_REQUEST_TIMEOUT_MS` | `20000` | Provider request timeout. |
| `AI_RPM`, `AI_RPD`, `AI_TPM` | `0` | Optional provider budget/rate constraints. |
| `AI_STRUCTURING_RPM` | `10` | Resume structuring limiter. |
| `AI_INSIGHTS_RPM` | `4` | Insights limiter. |
| `AI_JOB_EXTRACTION_RPM` | `1` | Job extraction limiter. |
| `AI_EXTRACTION_MAX_RETRIES` | `2` | Internal extraction retry count. |
| `AI_EXTRACTION_RETRY_BASE_DELAY_MS` | `500` | Internal retry backoff base. |
| `AI_GLOBAL_RATE_LIMIT_COOLDOWN_SEC` | `60` | Global cooldown after provider throttling. |

## Product limits and scoring policy

| Variable | Default | Purpose |
| --- | --- | --- |
| `FREE_TIER_MAX_JOBS_PER_USER` | `5` | Job quota. |
| `FREE_TIER_MAX_RESUMES_PER_JOB` | `30` | Upload/batch quota. |
| `FREE_TIER_MAX_RESUMES_PER_USER` | `100` | Per-user resume quota. |
| `UPLOAD_MAX_FILE_SIZE_BYTES` | 5 MiB | Maximum PDF size. |
| `UPLOAD_MAX_PDF_PAGES` | `5` | Maximum expected PDF pages. |
| `RECOMMENDATION_STRONG_FIT_MIN` | `80` | Strong-fit threshold. |
| `RECOMMENDATION_GOOD_FIT_MIN` | `60` | Good-fit threshold. |
| `RECOMMENDATION_MODERATE_FIT_MIN` | `40` | Moderate-fit threshold. |

## Recovery and manual retry

| Variable | Default | Purpose |
| --- | --- | --- |
| `MANUAL_RETRY_MAX_PER_RESUME` | `3` | User retry cap per resume. |
| `MANUAL_RETRY_COUNTER_TTL_SEC` | 90 days | Retry-counter retention. |
| `RECOVERY_SCAN_INTERVAL_MS` | 3 minutes | Stale-work scan cadence. |
| `RECOVERY_STALE_AFTER_MS` | 5 minutes | Age after which work is stale. |
| `RECOVERY_BATCH_SIZE` | `200` | Maximum scan batch. |

For production values, record non-secret choices in deployment documentation and
justify changes that alter cost, throughput, candidate experience, or scoring.
