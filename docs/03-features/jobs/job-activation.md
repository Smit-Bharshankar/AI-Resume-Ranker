# Feature: Review and Activate a Job

## Purpose

Makes a job eligible for resume scoring only after structured requirements have
been validated and, where needed, corrected by the recruiter.

## Requirement editing

- API: `PATCH /jobs/:id/requirements`
- Allowed status: `REQUIREMENTS_STRUCTURED`
- The entire submitted requirements payload is schema-validated before it
  replaces `structuredRequirements`.
- A concurrent status change returns `409`; the client should refresh instead
  of overwriting newer state.

## Activation

- API: `PATCH /jobs/:id/activate`
- Allowed status: `REQUIREMENTS_STRUCTURED`

The backend verifies the job exists, belongs to the current user, has an object
in `structuredRequirements`, and that it passes the requirements validator. It
then performs a guarded transition to `ACTIVE`.

## Consequence

The resume matching service scores only resumes in `STRUCTURED` when their
related job is `ACTIVE`. This protects candidates from being ranked against
unreviewed or malformed requirements.

## Source map

- Controller: `backend/src/modules/job/job.controller.js`
- Validation: `backend/src/modules/jobExtraction/jobSchema.validator.js`
- Persistence guard: `backend/src/modules/job/job.repository.js`
