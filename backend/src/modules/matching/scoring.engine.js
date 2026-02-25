const WEIGHTS = Object.freeze({
  required: 0.5,
  experience: 0.3,
  preferred: 0.2,
});

const normalizeSkill = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
};

const normalizeSkillSet = (skills) => {
  if (!Array.isArray(skills)) {
    return new Set();
  }

  const normalized = new Set();
  for (const skill of skills) {
    const value = normalizeSkill(skill);
    if (value) {
      normalized.add(value);
    }
  }

  return normalized;
};

const toSkillArray = (skillSet) => {
  return [...skillSet];
};

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const clampMinZero = (value) => {
  return Math.max(0, safeNumber(value, 0));
};

const getIntersection = (leftSet, rightSet) => {
  const intersection = new Set();
  for (const value of leftSet) {
    if (rightSet.has(value)) {
      intersection.add(value);
    }
  }
  return intersection;
};

const getDifference = (leftSet, rightSet) => {
  const difference = new Set();
  for (const value of leftSet) {
    if (!rightSet.has(value)) {
      difference.add(value);
    }
  }
  return difference;
};

const computeWeightedScore = ({
  requiredSkillScore,
  experienceScore,
  preferredSkillScore,
}) => {
  return (
    WEIGHTS.required * requiredSkillScore +
    WEIGHTS.experience * experienceScore +
    WEIGHTS.preferred * preferredSkillScore
  );
};

const score = ({ structuredResume, structuredRequirements }) => {
  const candidateSkills = normalizeSkillSet(structuredResume?.skills);
  const candidateYears = clampMinZero(structuredResume?.total_years_experience);

  const requiredSkills = normalizeSkillSet(
    structuredRequirements?.required_skills,
  );
  const preferredSkills = normalizeSkillSet(
    structuredRequirements?.preferred_skills,
  );
  const requiredYears = clampMinZero(
    structuredRequirements?.minimum_experience_years,
  );

  const matchedRequiredSkills = getIntersection(candidateSkills, requiredSkills);
  const missingRequiredSkills = getDifference(requiredSkills, candidateSkills);
  const matchedPreferredSkills = getIntersection(candidateSkills, preferredSkills);

  const requiredTotal = requiredSkills.size;
  const preferredTotal = preferredSkills.size;

  const requiredSkillScore =
    requiredTotal === 0 ? 1 : matchedRequiredSkills.size / requiredTotal;

  const experienceScore =
    requiredYears === 0 ? 1 : Math.min(candidateYears / requiredYears, 1);

  const preferredSkillScore =
    preferredTotal === 0 ? 0 : matchedPreferredSkills.size / preferredTotal;

  const finalScoreRaw =
    computeWeightedScore({
      requiredSkillScore,
      experienceScore,
      preferredSkillScore,
    }) * 100;
  const finalScore = Math.round(finalScoreRaw);

  return {
    finalScore,
    finalScoreRaw,
    componentScores: {
      requiredSkillScore,
      experienceScore,
      preferredSkillScore,
    },
    candidate: {
      skills: toSkillArray(candidateSkills),
      yearsExperience: candidateYears,
    },
    required: {
      matchedSkills: toSkillArray(matchedRequiredSkills),
      missingSkills: toSkillArray(missingRequiredSkills),
      matchedCount: matchedRequiredSkills.size,
      totalCount: requiredTotal,
    },
    preferred: {
      matchedSkills: toSkillArray(matchedPreferredSkills),
      matchedCount: matchedPreferredSkills.size,
      totalCount: preferredTotal,
    },
    experience: {
      candidateYears,
      requiredYears,
      score: experienceScore,
    },
    weights: WEIGHTS,
  };
};

const scoringEngine = {
  score,
};

export default scoringEngine;
