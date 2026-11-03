# Explainability and Fairness

## What Sortres can explain

For each scored candidate, Sortres stores a score breakdown showing required and
preferred-skill matching, missing required skills, candidate versus required
experience, weights, and final score. The same structured inputs produce the
same numeric score and recommendation.

## What does not affect numeric scoring

The scoring engine uses skills and total years of experience only. Name, email,
phone, location, education text, and other personal attributes are not direct
numeric inputs.

## Important limitations

- AI-derived structured data can be incomplete or incorrect.
- Exact normalized skill matching may fail to recognize equivalent skills or
  nonstandard terminology.
- Past hiring patterns or protected characteristics are not scoring inputs, but
  source documents and AI extraction can still carry contextual bias/errors.
- A score is decision support, not a hiring decision.

## Responsible use

Recruiters should review source resumes, requirement edits, and score breakdowns
before consequential decisions; provide a human override path; and avoid using
Sortres as the sole automated basis for rejection. Monitor extraction failures
and systematically review mismatches to improve prompts and validation without
introducing hidden scoring rules.
