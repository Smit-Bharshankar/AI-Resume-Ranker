# Feature: Monitoring and Error Handling

## User-facing errors

The API follows success/error envelopes. The React client maps common failures
to actionable messages: expired sessions cause sign-out, `429` indicates a
temporarily busy service, server errors receive a generic safe message, and
network failures suggest retrying the connection.

## Backend error boundaries

Controllers validate input and map expected service errors to HTTP responses.
Unhandled Express errors use a final server error handler. Queue workers record
stage failures in database state so the product can show a failure rather than
an endlessly loading candidate.

## Monitoring

Sentry captures backend request and unhandled-process errors when configured.
Bull Board supports queue inspection; structured logs provide request/worker
context. See [observability](../../06-operations/observability.md) and the
[incident runbook](../../06-operations/incident-runbook.md).

## Handling rule

Never return internal stack traces, provider keys, raw storage errors, or other
sensitive infrastructure details in customer-facing API responses.
