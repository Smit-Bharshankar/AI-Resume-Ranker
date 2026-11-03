# Feature: Bulk PDF Upload

## Purpose

Accepts multiple candidate resume PDFs for one owned job and starts background
processing for every successfully stored file.

## Entry point

- API: `POST /jobs/:id/resumes`
- Encoding: `multipart/form-data`
- File field: `files`

## Validation and quotas

- Only `application/pdf` uploads are accepted.
- Default size limit: 5 MiB per file.
- PDFs must parse successfully and contain 1–5 pages by default.
- Default maximum: 30 resumes per job and 100 lifetime resumes per user.
- The user’s in-flight capacity is reserved before individual files are
  processed, preventing concurrent uploads from exceeding their quota.

## Per-file processing

1. Store the source PDF in the configured Supabase Storage bucket.
2. Create a `Resume` record with `status: UPLOADED` and the storage path.
3. Add a resume-processing queue job. Queue start may be staggered to control
   provider pressure.
4. Return aggregate `{ uploaded, failed }` counts.

## Failure handling

Each file is handled independently. If its database or queue step fails, the
service attempts to remove the created resume row and stored PDF and releases
the appropriate quota reservation. Other files in the batch can still succeed.

## Security

The job must belong to the authenticated user. Stored PDFs are accessed later
through owner-checked signed-file retrieval, not public URLs.
