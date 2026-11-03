# React Client Architecture

## Stack

The Sortres application client is a Vite + React + TypeScript single-page app.
It uses React Router for navigation, TanStack Query for remote state, Supabase
for session management, Axios for API transport, Tailwind/UI components for
presentation, and Sentry/PostHog integrations for observability.

## Provider hierarchy

`App.tsx` wraps routes with theme, authentication, and query-client providers.
The router protects application routes and keeps login/signup public.

## Route map

| Route | Page |
| --- | --- |
| `/login`, `/signup` | Authentication |
| `/jobs` | Jobs list and account usage |
| `/jobs/create` | Job creation |
| `/jobs/:jobId` | Job requirements/extraction/activation |
| `/jobs/:jobId/candidates` | Upload and ranked candidate list |
| `/candidates/:resumeId` | Candidate detail and source PDF viewer |

## Data flow

Pages use focused query/mutation hooks. API modules call the shared Axios client,
which adds the current Supabase bearer token and normalizes common errors.
Mutations invalidate/refetch related query keys. Polling hooks refresh jobs and
resumes while their backend statuses indicate asynchronous work is active.

## UI state model

Each major page handles loading, empty, error, pending-action, and successful
states. The client displays pipeline progress from server status values rather
than assuming immediate completion after a mutation.

## Boundary

The client is a presentation and request-orchestration layer. Auth, ownership,
quotas, state transitions, scoring, storage access, and AI validation remain
backend responsibilities.
