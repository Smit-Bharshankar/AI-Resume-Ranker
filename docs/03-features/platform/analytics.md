# Feature: Product Analytics

## Purpose

PostHog tracks selected product and processing lifecycle events when
`POSTHOG_KEY` is configured.

## Identity

The React authentication context identifies a signed-in user by Supabase user
ID and email, and resets PostHog on sign-out. The backend uses authenticated user
ID as `distinctId` for server-side events.

## Current backend events

The extraction start endpoint emits `analysis_started` with an analysis type,
job ID, and source. Worker lifecycle code captures selected completion/failure
events. Event additions must be reviewed for privacy: do not transmit resume
content, contact details, tokens, signed URLs, or secrets.

## Documentation contract

For every new event, document its name, trigger, stable properties, data owner,
and whether it contains personal data. Analytics must not be the only source of
truth for operational failure investigation; retain logs/Sentry coverage.
