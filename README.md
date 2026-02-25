# AI Resume Ranker

AI Resume Ranker is an AI-assisted candidate shortlisting tool for small recruitment teams.
It ranks resumes against a job description using deterministic scoring plus structured AI insights.

## Why this project
Recruiters often review 10-100 resumes per role, which causes:
- Slow shortlisting cycles
- Inconsistent evaluation quality
- Keyword-only filtering bias
- Missed qualified candidates

This project focuses on one job: fast, explainable resume ranking.

## MVP goals
- Upload resumes in bulk (PDF)
- Parse resumes into structured JSON
- Parse job description into required/preferred criteria
- Rank candidates with deterministic scoring (0-100)
- Show recruiter-ready summaries, strengths, weaknesses, and interview prompts
- Export ranked output to CSV

## Target users
- Small recruitment agencies (primary)
- Startup founders hiring early teams
- Independent HR consultants

Not intended for full enterprise ATS replacement in MVP.

## Repository structure
```text
AI-Resume-Ranker/
|- frontend/   # React UI (dashboard, upload, ranking table)
|- backend/    # API, parsing pipeline, scoring engine
|- README.md
```

## Backend Ops Docs
- AI extraction runbook: [backend/docs/ai-extraction-ops.md](backend/docs/ai-extraction-ops.md)

## Planned architecture
- Frontend: React + Tailwind CSS
- Backend: Node.js + Express
- AI layer: OpenAI API for structured extraction and candidate insight generation
- Storage: temporary/local file handling in MVP (optional DB later)

## Processing flow
1. Upload resumes (PDF)
2. Extract raw text from each resume
3. Convert resume text to structured JSON
4. Parse job description to structured JSON
5. Run deterministic scoring engine
6. Generate explainable insights
7. Return ranked list and optional CSV export

## Scoring model
Deterministic weighted scoring:

Final score is scaled to `0-100`.

## Explainability output per candidate
- Matched required skills (X/Y)
- Missing required skills
- Experience comparison with JD minimum
- Preferred skill matches
- AI summary (5 bullets)
- 3 strengths
- 3 weaknesses
- 3 interview questions

## Performance and reliability notes
- Limit concurrent AI requests (for example, 5 at a time)
- Truncate long resume text before extraction prompts
- Validate all AI JSON responses
- Retry once on malformed AI output
- Clean temporary files after processing

## Cost controls
- Use structured prompts to reduce token usage
- Avoid sending the same raw resume text repeatedly
- Reuse extracted structured data for downstream steps
- Limit batch size per upload

## Risks
- Inconsistent resume parsing quality
- AI JSON formatting failures
- Skill normalization edge cases
- Overweighting keywords

Mitigation: deterministic scoring, validation layers, and transparent match breakdown.

## Success criteria (MVP)
- Process about 30 resumes per job
- Stable structured extraction (~95% successful parses)
- Ranking output is recruiter-logical and explainable
- Demo-ready workflow for pilot users

## Future roadmap
- Multi-user auth and team workspaces
- Resume database and indexing
- Semantic matching using embeddings
- Interview scheduling and notifications
- Billing and usage metering

## Positioning
"AI Resume Ranker helps small recruitment agencies shortlist the best candidates in minutes instead of hours, with transparent and explainable scoring."

## License
This repository is licensed under the terms in [LICENSE](LICENSE).
