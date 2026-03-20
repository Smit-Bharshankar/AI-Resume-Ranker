import env from "../../config/env.js";
import jobRepository from "../job/job.repository.js";
import userRepository from "./user.repository.js";

const getCurrentUsage = async (userId) => {
  const [usage, currentJobsCount] = await Promise.all([
    userRepository.getUsageByUserId(userId),
    jobRepository.countJobsByUserId(userId),
  ]);

  if (!usage) {
    return null;
  }

  return {
    jobs: {
      currentCount: currentJobsCount,
      currentLimit: env.freeTierMaxJobsPerUser,
      jobsCreatedCount: usage.jobsCreatedCount,
    },
    resumes: {
      completedCount: usage.resumesCompletedCount,
      inFlightCount: usage.resumeInFlightCount,
      lifetimeLimit: env.freeTierMaxResumesPerUser,
      perJobLimit: env.freeTierMaxResumesPerJob,
    },
  };
};

const userService = {
  getCurrentUsage,
};

export default userService;
