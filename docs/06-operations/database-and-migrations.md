# Database and Migrations

## Technology

Sortres uses PostgreSQL with Prisma. The schema is in
`backend/prisma/schema.prisma`; migrations are in `backend/prisma/migrations/`.
The runtime Prisma client uses `DATABASE_URL` and a PostgreSQL adapter.

## Change procedure

1. Decide whether the change needs new data, a new enum value, an index, or a
   safe data migration.
2. Update `schema.prisma`.
3. Generate a Prisma migration and inspect its SQL before applying it.
4. Update repositories/services to handle the new contract and old-record
   compatibility where required.
5. Apply migrations to a non-production database first and verify processing
   flows that write the affected rows.
6. Update architecture, feature, API, and runbook docs in the same change.

## High-risk changes

- Renaming/removing a status used by workers can strand in-flight resumes.
- Changing quota counters requires validating both completed and in-flight
  reservation accounting.
- Altering JSON structures (`structuredRequirements`, `structuredData`,
  `scoreBreakdown`, `insights`) needs reader compatibility and validator updates.
- Database cascades remove jobs/resumes, but application deletion also removes
  corresponding storage files; preserve that order and behavior.

## Verification checklist

- Migration runs cleanly from a representative existing database.
- API and all workers start successfully against the migrated schema.
- Existing jobs/resumes still load and render.
- Queue/recovery behavior is safe for records in transitional statuses.
