📄 AI Resume Ranker — Product & Technical Specification
1️⃣ Product Overview
Product Name (Working)
AI Resume Ranker

Core Problem
Recruiters at small agencies manually review 100–500 resumes per job posting.
This leads to:

Time waste (5–20 hours per role)

Inconsistent evaluation

Bias toward keyword scanning

Overlooking qualified candidates

Core Solution
A lightweight AI-powered screening engine that:

Accepts bulk resume uploads (PDF)

Parses resumes into structured data

Extracts job requirements from a job description

Matches candidates deterministically

Ranks candidates by relevance score

Generates recruiter-ready insights

This is NOT a full ATS.
It is a focused resume ranking engine.

2️⃣ Target User
Primary:

Small recruitment agencies (1–10 recruiters)

Secondary:

Startup founders hiring first employees

HR consultants

Not targeting:

Large enterprises using complex ATS systems

3️⃣ MVP Scope (2-Week Build)
Included
1. Resume Upload
Bulk PDF upload (max 30–50)

Drag & drop UI

File validation (size/type)

2. Resume Parsing
Extract text from PDF

Normalize text

Convert to structured JSON using LLM

3. Job Description Input
Paste JD text

Extract required skills

Extract preferred skills

Extract minimum experience

4. Deterministic Matching Engine
Score based on:

Required skill match

Experience alignment

Preferred skill bonus

Mandatory keyword presence

5. Candidate Summary
For each candidate:

5 bullet summary

3 strengths

3 weaknesses

3 interview questions

6. Ranking Output
Score (0–100)

Match breakdown

Sortable table

Expandable candidate card

7. Export
Download ranked candidates as CSV

Explicitly Out of Scope (MVP)
Full ATS features

Email sending

Interview scheduling

Multi-role permissions

Payment system

Resume database storage

Chrome extension

Candidate CRM

4️⃣ System Architecture
Frontend
React

Tailwind CSS

Single dashboard page

Backend
Node.js (Express)

MongoDB (optional for session storage)

Local storage for resumes (temporary)

AI Layer
OpenAI (or similar LLM API)

Temperature 0–0.2 for structured extraction

Strict JSON schema validation

5️⃣ Processing Flow
User uploads resumes (PDF)

Server extracts text

Resume text → LLM → structured JSON

Job description → LLM → structured JSON

Matching engine runs deterministic scoring

Candidates ranked by score

AI generates recruiter insights

Results returned to UI

Optional CSV export

6️⃣ Resume Extraction Schema
Expected JSON format:

{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "total_years_experience": 0,
  "skills": [],
  "primary_roles": [],
  "job_history": [
    {
      "title": "",
      "company": "",
      "duration_years": 0
    }
  ],
  "education": [],
  "certifications": []
}
Rules:

Skills normalized to lowercase

Remove duplicates

Conservative experience estimation

Missing fields → null or empty array

7️⃣ JD Extraction Schema
{
  "job_title": "",
  "required_skills": [],
  "preferred_skills": [],
  "minimum_experience_years": 0,
  "mandatory_keywords": []
}
8️⃣ Matching Algorithm
Deterministic hybrid model.

Skill Score
required_matches / total_required
Experience Score
min(candidate_years / required_years, 1)
Preferred Bonus
preferred_matches / total_preferred
Final Weighted Score
score =
(0.5 × skill_score) +
(0.3 × experience_score) +
(0.2 × preferred_score)
Scaled to 0–100.

9️⃣ Explainability Layer
Each candidate displays:

Matched X/Y required skills

Missing skills

Experience comparison

Preferred skill matches

This builds recruiter trust.

🔟 AI Insight Generation
Input:

Structured resume JSON

Structured JD JSON

Output:

5 bullet summary

3 strengths

3 weaknesses

3 interview questions

Must:

Avoid hallucination

Avoid exaggeration

Use only structured data

1️⃣1️⃣ Performance Considerations
Limit concurrent AI calls (e.g., 5 at a time)

Truncate resume text to ~15k characters

Validate JSON responses

Retry once on malformed output

Clean up temporary files

1️⃣2️⃣ Cost Control Strategy
Use structured prompts (lower tokens)

Avoid sending raw resume multiple times

Reuse structured data for summary

Limit resume count per batch

1️⃣3️⃣ Risks
Resume parsing inconsistencies

AI JSON format errors

Poor skill normalization

Over-reliance on keyword match

Recruiter distrust of AI scoring

Mitigation:

Deterministic scoring

Clear match breakdown

Validation layer

1️⃣4️⃣ Success Criteria (MVP)
Within 2 weeks:

Process 30 resumes per job

Stable JSON extraction (95% success)

Ranking feels logical

Output explainable

Demo-ready for recruiters

1️⃣5️⃣ Future Expansion (Post-MVP)
Multi-user accounts

Agency dashboards

Resume database indexing

Embedding-based semantic matching

Interview scheduling

Email automation

Stripe billing

1️⃣6️⃣ Product Positioning Statement
“AI Resume Ranker helps small recruitment agencies shortlist the best candidates in minutes instead of hours — with transparent, explainable scoring.”