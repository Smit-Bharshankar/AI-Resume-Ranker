# Resume Storage

## Service and object layout

Candidate PDFs are stored in the configured Supabase Storage bucket, default
`resumes`. Each upload receives a generated object key:

```text
jobs/{jobId}/resumes/{random-uuid}.pdf
```

Only this path is stored in PostgreSQL; binary PDF content is not stored in the
database.

## Operations

- Upload: `uploadResume` stores a PDF with its supplied MIME type and does not
  upsert an existing key.
- Processing: workers download the object by `storagePath` to extract text.
- Viewing: a verified owner requests a signed URL; the default expiry is 900
  seconds (15 minutes).
- Deletion: resume/job deletion removes storage objects, then database records.

## Failure behavior

If a per-file upload pipeline step fails, the service attempts to delete any
stored object and persisted resume. During deletion, an already-missing object
is treated as a logged, safe condition; other storage failures stop deletion
with a server error rather than silently claiming all data was removed.

## Security requirements

- Keep the storage bucket private.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never reach the frontend.
- Obtain resume files only through authenticated, owner-checked API behavior.
- Define backup/retention policy before accepting production candidate data.
