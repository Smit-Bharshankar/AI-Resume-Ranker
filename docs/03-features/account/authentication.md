# Feature: Authentication and Access Control

## Identity provider

Sortres uses Supabase Auth. The React app obtains the user session; its API
client sends the current access token as `Authorization: Bearer <token>`.

## Backend enforcement

Every `/jobs`, `/resumes`, and `/users` route passes through authentication
middleware. The middleware validates the token with Supabase, optionally
requires a confirmed email, upserts the local `User` record, and places the
authenticated `{ id, email }` on the request.

Services/repositories then use that user ID for ownership-scoped access. A
resource not owned by the caller is intentionally indistinguishable from a
missing resource in ordinary read flows.

## Client behavior

Protected routes redirect unauthenticated visitors to login. A `401` API
response signs the user out and redirects to `/login`, preventing a stale client
session from continuing to call protected endpoints.

## Security notes

- The frontend uses the Supabase anon/publishable key; the service-role key is
  backend-only.
- Email confirmation behavior is configured in both client and backend
  environments and should remain aligned.
- Authentication does not by itself protect the operational queue dashboard;
  deployment must restrict that route separately.
