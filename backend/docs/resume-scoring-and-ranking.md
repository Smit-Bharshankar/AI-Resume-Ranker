# Resume Scoring and Ranking: Deterministic, Reliable, and Explainable

This document explains exactly how resumes are scored, graded, and ranked in the backend pipeline.

Audience:
- Product and engineering teams
- Customer-facing teams who need to explain scoring behavior
- Users who need transparency on reliability, consistency, and bias controls

Scope:
- Resume scoring and recommendation labeling only
- Current backend implementation in this repository

---

## 1. Executive Summary

The platform uses a deterministic scoring model based on:
- Required skill match
- Preferred skill match
- Experience match

Key guarantees:
- Same structured inputs always produce the same numeric score.
- Same numeric score always produces the same recommendation label.
- Recommendation labels are not AI-decided; they are score-derived from centralized thresholds.

AI is used for text extraction/structuring and for narrative insights, but not for numeric scoring math or final recommendation grading logic.

---

## 2. End-to-End Pipeline (Score and Grade)

Resume processing path:

1. `UPLOADED`
- Resume PDF uploaded.

2. `TEXT_EXTRACTED`
- PDF text is extracted.

3. `STRUCTURED`
- AI converts resume text into structured JSON (skills, years of experience, etc.).

4. `SCORED`
- Deterministic scoring engine computes numeric score and breakdown.

5. `INSIGHTS_GENERATING` -> `INSIGHTS_GENERATED`
- AI generates textual insights (summary, strengths, weaknesses, interview questions).
- Recommendation label is enforced from score using deterministic policy before persistence.

Status references:
- Resume state model: `backend/prisma/schema.prisma`
- Scoring service: `backend/src/modules/matching/matching.service.js`
- Insight service: `backend/src/modules/insights/insight.service.js`

---

## 3. Inputs Used for Scoring

The scoring engine uses only these fields:

From structured resume:
- `skills`
- `total_years_experience`

From structured job requirements:
- `required_skills`
- `preferred_skills`
- `minimum_experience_years`

Important:
- No name, email, phone, location, education text, or other personal attributes are used in score computation.

Source:
- `backend/src/modules/matching/scoring.engine.js`

---

## 4. Deterministic Scoring Formula

Weights (fixed):
- Required skills: `0.5`
- Experience: `0.3`
- Preferred skills: `0.2`

Component scores:

1. Required skills score
- `requiredSkillScore = matchedRequired / totalRequired`
- If `totalRequired === 0`, score is `1`

2. Experience score
- `experienceScore = min(candidateYears / requiredYears, 1)`
- If `requiredYears === 0`, score is `1`

3. Preferred skills score
- `preferredSkillScore = matchedPreferred / totalPreferred`
- If `totalPreferred === 0`, score is `0`

Final score:
- `finalScoreRaw = (0.5 * requiredSkillScore + 0.3 * experienceScore + 0.2 * preferredSkillScore) * 100`
- `finalScore = Math.round(finalScoreRaw)` (integer 0-100 in normal conditions)

Normalization behavior:
- Skills are trimmed + lowercased before matching.
- Skills are deduplicated via sets.
- Experience values are clamped to minimum `0`.

Source:
- `backend/src/modules/matching/scoring.engine.js`

---

## 5. Score Breakdown Saved per Resume

For transparency and explainability, backend stores:
- Required matched count, total count, and missing required skills
- Preferred matched count and total count
- Candidate and required experience years + experience sub-score
- Weights used
- Final score

Source:
- Breakdown builder: `backend/src/modules/matching/score.explainer.js`
- Persistence call: `backend/src/modules/matching/matching.service.js`

---

## 6. Deterministic Recommendation Label Mapping

Recommendation labels:
- `STRONG_FIT`
- `GOOD_FIT`
- `MODERATE_FIT`
- `WEAK_FIT`

Centralized mapping:
- Recommendation is derived from numeric score using centralized threshold config.
- AI-generated recommendation text is not trusted as source of truth.

Default thresholds:
- `STRONG_FIT` if score `>= 80`
- `GOOD_FIT` if score `>= 60` and `< 80`
- `MODERATE_FIT` if score `>= 40` and `< 60`
- `WEAK_FIT` if score `< 40`

Configurable env vars:
- `RECOMMENDATION_STRONG_FIT_MIN` (default `80`)
- `RECOMMENDATION_GOOD_FIT_MIN` (default `60`)
- `RECOMMENDATION_MODERATE_FIT_MIN` (default `40`)

Threshold safety:
- Thresholds are normalized to prevent overlap/inversion.
- Score is clamped to `[0,100]` before label resolution.

Source:
- Policy: `backend/src/modules/recommendation/recommendationPolicy.js`
- Env: `backend/src/config/env.js`

---

## 7. Consistency Enforcement Across Services and UI

Single source of truth behavior:

1. Backend computes/overwrites recommendation from score.
2. Resume API responses are decorated with deterministic `recommendation`.
3. Frontend displays backend-provided `resume.recommendation`.

This prevents label drift like:
- Same score -> different recommendation labels

Source:
- Resume decoration in service layer:
  - `backend/src/modules/resume/resume.service.js`
  - `backend/src/modules/resume/stage.service.js`
- Frontend usage:
  - `frontend/src/types/resume.ts`
  - `frontend/src/components/candidates/CandidateRow.tsx`
  - `frontend/src/components/candidates/CandidateProfileHeader.tsx`
  - `frontend/src/components/insights/InsightRecommendation.tsx`
  - `frontend/src/pages/candidates/CandidateDetailPage.tsx`

---

## 8. Reliability and Predictability Controls

The scoring and grading pipeline is designed for repeatability:

- Deterministic math (no randomness).
- Guarded status transitions with expected-state checks (`updateMany ... where status=...`) to avoid race-condition writes.
- Explicit failure states (`FAILED_SCORING`, `FAILED_INSIGHTS`) to avoid silent invalid outputs.
- Retry/recovery workers for resilient async processing.

Operational references:
- `backend/docs/backend-workers-architecture.md`
- `backend/docs/retry-recovery-reliability.md`

---

## 9. Bias and Fairness Posture (Current Implementation)

Current model reduces direct bias risk by design:
- Score uses skill and experience alignment only.
- Personal identifiers and demographic proxies are not part of scoring formula.
- Recommendation labels are deterministic and score-based, not AI-phrasing-based.

Important nuance:
- Upstream structured data extraction is AI-assisted. If extracted skills/experience are wrong or incomplete, score quality can degrade.
- This is a data quality/reliability issue, not scoring randomness.

Mitigations in place:
- Structured schema validation
- Retry and failure handling
- Score breakdown visibility for human auditability

---

## 10. Worked Examples

Example A:
- Required: 8 total, 6 matched -> `0.75`
- Experience: candidate 4 yrs, required 5 yrs -> `0.8`
- Preferred: 5 total, 2 matched -> `0.4`
- Final raw: `(0.5*0.75 + 0.3*0.8 + 0.2*0.4) * 100 = 69.5`
- Final rounded score: `70`
- Recommendation (default thresholds): `GOOD_FIT`

Example B:
- Score: `55`
- Recommendation: always `MODERATE_FIT` (with default thresholds)

---

## 11. What Users Can Reliably Expect

- Repeatability: same structured resume + same structured job requirements => same score.
- Determinism: same score => same recommendation label.
- Explainability: score breakdown shows exactly how the score was formed.
- Configurability: threshold bands can be adjusted centrally without duplicating logic.

---

## 12. File Map (Quick Reference)

- Scoring math: `backend/src/modules/matching/scoring.engine.js`
- Score breakdown: `backend/src/modules/matching/score.explainer.js`
- Scoring orchestration: `backend/src/modules/matching/matching.service.js`
- Recommendation policy: `backend/src/modules/recommendation/recommendationPolicy.js`
- Insight orchestration with recommendation enforcement: `backend/src/modules/insights/insight.service.js`
- Env thresholds: `backend/src/config/env.js`
- Resume state persistence: `backend/src/modules/resume/resume.repository.js`

