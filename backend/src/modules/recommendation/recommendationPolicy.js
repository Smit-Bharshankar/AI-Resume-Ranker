import env from "../../config/env.js";

const RECOMMENDATION_LABELS = Object.freeze({
  STRONG_FIT: "STRONG_FIT",
  GOOD_FIT: "GOOD_FIT",
  MODERATE_FIT: "MODERATE_FIT",
  WEAK_FIT: "WEAK_FIT",
});

const SCORE_MIN = 0;
const SCORE_MAX = 100;

const clampScore = (value) => {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, value));
};

const isFiniteNumber = (value) => Number.isFinite(value);

const resolveRecommendationScore = (resume = {}) => {
  const directScore = Number(resume?.score);
  if (isFiniteNumber(directScore)) {
    return clampScore(directScore);
  }

  const breakdownScore = Number(resume?.scoreBreakdown?.final_score);
  if (isFiniteNumber(breakdownScore)) {
    return clampScore(breakdownScore);
  }

  return null;
};

const normalizeThresholds = ({ strongFitMin, goodFitMin, moderateFitMin }) => {
  const strong = clampScore(strongFitMin);
  const good = Math.min(strong, clampScore(goodFitMin));
  const moderate = Math.min(good, clampScore(moderateFitMin));

  return Object.freeze({
    strongFitMin: strong,
    goodFitMin: good,
    moderateFitMin: moderate,
  });
};

const THRESHOLDS = normalizeThresholds({
  strongFitMin: env.recommendationStrongFitMin,
  goodFitMin: env.recommendationGoodFitMin,
  moderateFitMin: env.recommendationModerateFitMin,
});

const resolveRecommendationFromScore = (score) => {
  const numericScore = Number(score);
  if (!isFiniteNumber(numericScore)) {
    return null;
  }

  const normalizedScore = clampScore(numericScore);

  if (normalizedScore >= THRESHOLDS.strongFitMin) {
    return RECOMMENDATION_LABELS.STRONG_FIT;
  }

  if (normalizedScore >= THRESHOLDS.goodFitMin) {
    return RECOMMENDATION_LABELS.GOOD_FIT;
  }

  if (normalizedScore >= THRESHOLDS.moderateFitMin) {
    return RECOMMENDATION_LABELS.MODERATE_FIT;
  }

  return RECOMMENDATION_LABELS.WEAK_FIT;
};

const decorateResumeWithRecommendation = (resume) => {
  if (!resume || typeof resume !== "object" || Array.isArray(resume)) {
    return resume;
  }

  const recommendationScore = resolveRecommendationScore(resume);
  const recommendation = resolveRecommendationFromScore(recommendationScore);

  if (!recommendation) {
    return {
      ...resume,
      recommendation: null,
    };
  }

  const insights =
    resume.insights && typeof resume.insights === "object" && !Array.isArray(resume.insights)
      ? {
          ...resume.insights,
          recommendation,
        }
      : resume.insights;

  return {
    ...resume,
    insights,
    recommendation,
  };
};

export {
  RECOMMENDATION_LABELS,
  THRESHOLDS as RECOMMENDATION_THRESHOLDS,
  resolveRecommendationScore,
  resolveRecommendationFromScore,
  decorateResumeWithRecommendation,
};
