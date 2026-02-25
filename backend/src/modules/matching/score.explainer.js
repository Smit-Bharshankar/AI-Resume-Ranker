const sortStrings = (values) => {
  return [...values].sort((left, right) => left.localeCompare(right));
};

const buildScoreBreakdown = (scoringResult) => {
  const requiredMissing = Array.isArray(scoringResult?.required?.missingSkills)
    ? scoringResult.required.missingSkills
    : [];

  return {
    required: {
      matched: scoringResult?.required?.matchedCount ?? 0,
      total: scoringResult?.required?.totalCount ?? 0,
      missing: sortStrings(requiredMissing),
    },
    preferred: {
      matched: scoringResult?.preferred?.matchedCount ?? 0,
      total: scoringResult?.preferred?.totalCount ?? 0,
    },
    experience: {
      candidate_years: scoringResult?.experience?.candidateYears ?? 0,
      required_years: scoringResult?.experience?.requiredYears ?? 0,
      score: scoringResult?.experience?.score ?? 0,
    },
    weights: {
      required: scoringResult?.weights?.required ?? 0.5,
      experience: scoringResult?.weights?.experience ?? 0.3,
      preferred: scoringResult?.weights?.preferred ?? 0.2,
    },
    final_score: scoringResult?.finalScore ?? 0,
  };
};

const scoreExplainer = {
  buildScoreBreakdown,
};

export default scoreExplainer;
