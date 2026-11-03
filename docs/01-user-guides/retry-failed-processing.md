# Retry Failed Processing

1. Open the candidate or candidate list and identify a failed processing status.
2. Read the visible failure context where available.
3. Use Retry only after checking that the job is active and the underlying issue
   (for example a temporary provider failure) is likely resolved.
4. Monitor the new processing status.

Retries are limited per resume and may be blocked during a system-wide provider
rate-limit cooldown. If retries repeatedly fail, re-upload only after correcting
the source document or raising an operational issue.
