# Job Requirement Extraction

## Purpose

Transforms raw job-description prose into the normalized requirements consumed
by deterministic matching.

## Process

1. A recruiter creates a `DRAFT` job with `rawDescription`.
2. Extraction prompt preparation normalizes and caps the description at 15,000
   characters.
3. The job worker asks the configured provider for exact-schema JSON.
4. The backend parses and validates the output.
5. A successful guarded write stores `structuredRequirements` and sets
   `REQUIREMENTS_STRUCTURED`.
6. The recruiter may edit the requirements before activation.

## Safety controls

The prompt requires conservative extraction from explicitly stated text and
prohibits invented tools, skills, or keywords. The validator rejects incomplete
or unexpected shapes. Recruiter review before `ACTIVE` is a product control, not
an optional cosmetic step.

## Failure handling

Terminal service failures create `FAILED_STRUCTURE`; the recruiter can request
extraction again. Queue/job behavior is detailed in [queues and workers](../06-operations/queues-and-workers.md).
