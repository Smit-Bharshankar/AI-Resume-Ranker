# Local Development

## Required services

Sortres backend development needs:

- PostgreSQL reachable through `DATABASE_URL`.
- Redis for BullMQ queues.
- Supabase project credentials for authentication and resume storage.
- An AI provider key for extraction and insights.

## Backend processes

Run these from `backend/` in separate terminals:

```bash
npm run dev
npm run worker:resume
npm run worker:job-extraction
npm run worker:insight
npm run worker:recovery
```

The API process serves HTTP requests. The other processes are required for job
extraction, uploaded resumes, AI insights, and stale-work recovery respectively.
Without workers, the client may show records stuck in processing states.

## Client process

From `frontend/`, use `npm run dev`. Configure `VITE_API_BASE_URL` to the local
backend (default example: `http://localhost:5000`) and matching Supabase values.

## Basic smoke checks

1. Request `GET /health` and expect `200` with `status: ok`.
2. Start all workers and confirm their startup logs identify the expected queues.
3. Run `npm run ai:smoke` from `backend/` after configuring the AI provider.
4. Create a test job, extract requirements, activate it, and upload a small PDF.
5. Inspect the resume’s status and queue dashboard if work does not advance.

## Local safety

Use a development database/bucket/project. Candidate resumes contain sensitive
personal data; do not put real applicant files or production service-role keys
in source control or shared local environments.
