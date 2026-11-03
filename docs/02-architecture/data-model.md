# Data Model and State Machines

Schema source: `backend/prisma/schema.prisma`. PostgreSQL is accessed through
Prisma. All IDs are UUIDs.

## Entity relationships

```text
User 1 ─── * Job 1 ─── * Resume
```

Deleting a `User` cascades to its jobs; deleting a `Job` cascades to its resumes.
Application deletion logic additionally removes relevant Supabase storage files.

## User

| Field | Purpose |
| --- | --- |
| `id`, `email` | Auth-linked identity and unique email. |
| `jobsCreatedCount` | Quota accounting for created jobs. |
| `resumesCompletedCount` | Quota accounting for completed resume processing. |
| `resumeInFlightCount` | Quota reservation/accounting while processing. |
| `createdAt` | Record creation time. |

## Job

| Field | Purpose |
| --- | --- |
| `title`, `rawDescription` | Recruiter supplied job information. |
| `structuredRequirements` | Validated AI-extracted and optionally recruiter-edited requirements JSON. |
| `status` | Requirements-extraction/activation lifecycle. |
| `lastProcessingFailure` | Failure details useful for recovery and user feedback. |
| `userId` | Owner; indexed for owner-scoped queries. |

### Job status state machine

```text
DRAFT ──extract──> EXTRACTING_REQUIREMENTS ──success──> REQUIREMENTS_STRUCTURED ──activate──> ACTIVE
                            |                              ^
                            └────────failure────────> FAILED_STRUCTURE ──retry extract──┘
```

Only a structured, schema-valid job can become `ACTIVE`; scoring requires an
active job.

## Resume

| Field | Purpose |
| --- | --- |
| `storagePath` | Private storage object key for the source PDF. |
| `rawText` | Parsed and normalized PDF text. |
| `structuredData` | Validated AI-created resume data. |
| `score`, `scoreBreakdown` | Deterministic matching result and explanation. |
| `insights` | Validated recruiter-facing AI narrative. |
| `status` | Technical processing lifecycle. |
| `stage` | Recruiter decision lifecycle, independent of `status`. |
| `quotaReservationActive` | Tracks in-flight usage reservation. |
| `lastProcessingFailure` | Last terminal/recovery-relevant failure context. |

### Resume processing status state machine

```text
UPLOADED → TEXT_EXTRACTED → STRUCTURED → SCORED → INSIGHTS_GENERATING → INSIGHTS_GENERATED
    |             |              |              |                 |
    v             v              v              v                 v
FAILED_EXTRACTION FAILED_STRUCTURE FAILED_SCORING FAILED_INSIGHTS  FAILED_INSIGHTS
```

The precise worker behavior, retry rules, and guarded transitions are documented
in [queue-and-worker architecture](../06-operations/queues-and-workers.md).

### Candidate stage state machine

`NEW`, `SHORTLISTED`, `INTERVIEWING`, `REJECTED`, and `HIRED` represent the
recruiter’s decision. Stage validation lives in
`src/modules/resume/stage.service.js`; it must never be conflated with processing
status. A candidate can be technically processed yet remain `NEW`.

## Concurrency contract

State-changing persistence uses conditional writes such as `updateMany` with
both record ID and expected status. A zero-row result means another request or
worker changed the record first. Callers treat that as a conflict, skip, or
safe retry rather than overwriting a newer state.

## Database change process

1. Update `prisma/schema.prisma`.
2. Create and review a Prisma migration under `prisma/migrations/`.
3. Update affected service/repository logic.
4. Update this document and feature/API docs, including any new statuses or
   user-visible behavior.
5. Verify development and production migration procedures before release.
