# Glossary

| Term | Meaning |
| --- | --- |
| Job | Recruiter-owned role record containing raw and structured requirements. |
| Raw description | Original job-description text entered by a recruiter. |
| Structured requirements | Validated required/preferred skills, experience, and keywords extracted from a job description. |
| Active job | A reviewed job eligible for deterministic candidate scoring. |
| Resume | Candidate PDF plus its extracted, structured, scored, and insight data. |
| Processing status | Technical pipeline state, such as `STRUCTURED` or `FAILED_INSIGHTS`. |
| Candidate stage | Recruiter’s business decision state, such as Shortlisted or Interviewing. |
| Score breakdown | Persisted evidence explaining the numeric match score. |
| Recommendation | Deterministic fit band derived from score, not selected by AI. |
| Insight | AI-generated summary, strengths, weaknesses, and interview questions. |
| Worker | Background process that handles long-running processing tasks. |
| Queue | Redis/BullMQ work list used to deliver jobs to workers. |
