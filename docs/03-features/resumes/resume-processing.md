# Feature: Resume Processing Pipeline

## Purpose

Converts an uploaded PDF into structured candidate data, a deterministic score,
and recruiter-facing insights without blocking the upload request.

## Pipeline

```text
UPLOADED → TEXT_EXTRACTED → STRUCTURED → SCORED → INSIGHTS_GENERATING → INSIGHTS_GENERATED
```

1. **Text extraction:** the resume worker downloads the PDF from Supabase,
   extracts/normalizes its text, and records `rawText`.
2. **Resume structuring:** AI transforms text into validated structured resume
   data, including the inputs needed for matching.
3. **Scoring:** deterministic code compares structured resume data with an
   active job’s structured requirements.
4. **Insights:** a second worker requests validated narrative insights using the
   structured data and saved score breakdown.

## Preconditions and safe skips

The worker processes only the stage matching the record’s current status.
Scoring safely skips when the job is absent, not active, or lacks requirements;
it never invents a score. Conditional writes prevent stale workers from advancing
a changed record.

## Failure states

Failures are stored explicitly as `FAILED_EXTRACTION`, `FAILED_STRUCTURE`,
`FAILED_SCORING`, or `FAILED_INSIGHTS`, together with failure context. A
recruiter may retry an eligible failed resume.

## Related documentation

- [Queue and worker architecture](../../06-operations/queues-and-workers.md)
- [Resume extraction operations](../../05-ai-and-scoring/ai-extraction-operations.md)
- [Retry and recovery](retry-and-recovery.md)
