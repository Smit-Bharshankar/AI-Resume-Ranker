# Feature: Usage Limits

## Purpose

Limits bound free-tier usage and control AI/storage cost while allowing the UI
to show a user’s current allowance.

## Current default limits

| Limit | Default setting |
| --- | --- |
| Jobs per user | 5 |
| Resumes per job | 30 |
| Lifetime resumes per user | 100 |
| Manual retries per resume | 3 |

Environment variables are the source for deployed values; see
[environment variables](../../06-operations/environment-variables.md).

## Job limit

Job creation counts the user’s current owned jobs before persisting. A limit
breach returns `409` and does not create a job.

## Resume limit and reservation

Before a batch upload processes individual files, the backend atomically reserves
the requested number of in-flight resume slots. It permits a reservation only
when completed + in-flight + requested slots stays within the lifetime limit.
Failed per-file work releases its reservation; processing lifecycle logic moves
accounting as work completes.

## Usage endpoint

`GET /users/me/usage` returns current job count/limit and resume completed,
in-flight, lifetime, and per-job values for the signed-in user.

## Manual retry limit

Manual retry is available only for eligible failed states, not active queue work,
and may be temporarily rejected during an AI global cooldown. It returns `429`
when its per-resume retry cap is exhausted.
