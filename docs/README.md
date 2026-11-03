# Sortres Documentation

This is the source of truth for Sortres product, user, client, backend, AI, and
operational documentation. The backend coordinates Supabase authentication and
file storage, PostgreSQL persistence via Prisma, BullMQ/Redis background
processing, and configurable AI providers.

## Product foundation

- [Product overview](00-product/product-overview.md)
- [Personas and problems](00-product/personas-and-problems.md)
- [Glossary](00-product/glossary.md)
- [Feature catalog](00-product/feature-catalog.md)
- [Roadmap and changelog](00-product/roadmap-and-changelog.md)

## Read this first

1. [Backend system overview](02-architecture/backend-architecture.md) — components, boundaries, and the
   complete business flow.
2. [API overview](04-api/api-overview.md) — authenticated HTTP endpoints and their
   state-changing behavior.
3. [Data model and state machines](02-architecture/data-model.md) — database
   entities, relationships, and allowed statuses.
4. [Environment variables](06-operations/environment-variables.md) — every runtime setting grouped
   by operational purpose.

## Recruiter guides

- [End-to-end recruiter workflow](01-user-guides/recruiter-workflow.md)
- [Create and activate a job](01-user-guides/create-and-activate-job.md)
- [Upload and rank resumes](01-user-guides/upload-and-rank-resumes.md)
- [Review a candidate](01-user-guides/review-candidate.md)
- [Candidate stages](01-user-guides/candidate-stages.md)
- [Retry failed processing](01-user-guides/retry-failed-processing.md)

## Application architecture

- [React client architecture](02-architecture/frontend-architecture.md)
- [Backend architecture](02-architecture/backend-architecture.md)
- [Data model](02-architecture/data-model.md)

## Deep dives

- [Queue and worker architecture](06-operations/queues-and-workers.md)
- [Resume scoring and ranking](05-ai-and-scoring/scoring-and-ranking.md)
- [AI extraction operations](05-ai-and-scoring/ai-extraction-operations.md)
- [Retry and recovery](03-features/resumes/retry-and-recovery.md)

## Feature documentation

### Jobs

- [Create a job](03-features/jobs/create-job.md)
- [AI requirement extraction](03-features/jobs/ai-requirement-extraction.md)
- [Review and activate a job](03-features/jobs/job-activation.md)

### Resumes and candidates

- [Bulk PDF upload](03-features/resumes/bulk-pdf-upload.md)
- [Resume processing pipeline](03-features/resumes/resume-processing.md)
- [Candidate ranking](03-features/resumes/candidate-ranking.md)
- [Candidate insights](03-features/resumes/candidate-insights.md)
- [Candidate stages](03-features/resumes/candidate-stages.md)

### Account and platform

- [Authentication and access control](03-features/account/authentication.md)
- [Usage limits](03-features/account/usage-limits.md)
- [Product analytics](03-features/platform/analytics.md)
- [Monitoring and error handling](03-features/platform/monitoring-and-errors.md)

## Operations

- [Local development](06-operations/local-development.md)
- [Database and migrations](06-operations/database-and-migrations.md)
- [Resume storage](06-operations/storage.md)
- [Observability](06-operations/observability.md)
- [Incident runbook](06-operations/incident-runbook.md)

## AI, scoring, and trust

- [AI provider architecture](05-ai-and-scoring/ai-provider-architecture.md)
- [Prompts and schemas](05-ai-and-scoring/prompts-and-schemas.md)
- [Resume extraction](05-ai-and-scoring/resume-extraction.md)
- [Job requirement extraction](05-ai-and-scoring/job-extraction.md)
- [Explainability and fairness](05-ai-and-scoring/explainability-and-fairness.md)

## What the backend owns

- Authenticated, owner-scoped job and resume operations.
- Usage quotas and reservation accounting.
- Storage of source PDFs and signed file access.
- Asynchronous extraction, scoring, and recruiter insight generation.
- Deterministic candidate scores, recommendations, and candidate stages.
- Queue retry/recovery, observability, and operational health.

## Documentation status

This documentation describes the implementation currently in this repository.
When a feature changes, update its corresponding document in the same change.
This root-level documentation system will also contain the React application and
marketing site guides in subsequent milestones.
