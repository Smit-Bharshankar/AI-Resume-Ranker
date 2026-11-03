# Resume Extraction

## Purpose

Transforms text extracted from a candidate PDF into normalized structured data
for downstream matching and recruiter presentation.

## Process

1. The resume worker parses a stored PDF and saves normalized raw text.
2. The extraction service builds a constrained JSON prompt from that text.
3. The selected provider is asked for JSON using the resume schema.
4. The backend parses, validates, and normalizes the response.
5. A guarded write persists `structuredData` and moves status from
   `TEXT_EXTRACTED` to `STRUCTURED`.

## Reliability and limits

AI calls use provider timeout, retry, rate-budget, and queue controls. Bad JSON
or a validation failure does not reach the database as structured candidate data.
After terminal failure the resume becomes `FAILED_STRUCTURE` and can be subject
to eligible manual retry.

## Data quality posture

Structured data is AI-assisted, not a statement of fact. Review source PDFs and
the score breakdown when a candidate decision would be materially affected by a
possibly missing skill or incorrect experience estimate.
