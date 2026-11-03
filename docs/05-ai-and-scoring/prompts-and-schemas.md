# Prompts and Schemas

## Contract principle

Prompts guide model behavior, but application validators are the contract
authority. The system parses model output, validates/normalizes it, and rejects
or retries malformed responses before persistence.

## Resume extraction contract

The structured resume schema contains `name`, `email`, `phone`, `location`,
`total_years_experience`, `skills`, `primary_roles`, `education`, and
`certifications`. The validator normalizes textual values, converts valid
experience to a non-negative number, normalizes/deduplicates skills, and
normalizes array items.

## Job extraction contract

The structured requirements schema contains `required_skills`,
`preferred_skills`, `minimum_experience_years`, and `mandatory_keywords`.
All keys are required. Arrays must contain strings and are lowercased,
trimmed, deduplicated, and sorted; experience must be a non-negative finite
number. Unsupported or missing keys are rejected.

## Insight contract

Insight model output must be an object with `summary`, `strengths`,
`weaknesses`, and `interview_questions`. String-like values are normalized and
empty/invalid array entries removed. The deterministic `recommendation` is
added by backend code after model validation.

## Prompt data handling

Resume and job prompts normalize whitespace before use and cap source text at
15,000 characters. Resume prompt preparation also removes duplicate lines and
control characters. These controls reduce cost, malformed provider requests,
and repetitive model context; they do not guarantee semantic completeness.

## Change rules

When changing a schema, update the JSON schema, validator, prompt, data reader,
tests, and affected documentation together. Avoid adding candidate attributes to
prompts unless their purpose, privacy implications, and retention behavior have
been reviewed.
