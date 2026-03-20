export type UsageMetrics = {
  jobs: {
    currentCount: number;
    currentLimit: number;
    jobsCreatedCount: number;
  };
  resumes: {
    completedCount: number;
    inFlightCount: number;
    lifetimeLimit: number;
    perJobLimit: number;
  };
};
