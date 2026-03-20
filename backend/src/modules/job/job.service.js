import jobRepository from "./job.repository.js";
import logger from "../../utils/logger.js";
import supabaseStorage from "../../storage/supabaseStorage.js";
import { PROCESSING_RESUME_STATUSES } from "../resume/resume.service.js";
import resumeService from "../resume/resume.service.js";
import env from "../../config/env.js";
import {
  cancelJobExtractionQueueJob,
  cancelResumeQueueJobs,
} from "../../queue/deletionCleanup.js";

class JobDeletionServiceError extends Error {
  constructor(message, statusCode, metadata = {}) {
    super(message);
    this.name = "JobDeletionServiceError";
    this.statusCode = statusCode;
    this.metadata = metadata;
  }
}

class JobLimitServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "JobLimitServiceError";
    this.statusCode = statusCode;
  }
}

const isStorageNotFoundError = (error) => {
  const message = `${error?.message ?? ""} ${error?.cause?.message ?? ""}`.toLowerCase();
  return (
    message.includes("not found") ||
    message.includes("not exist") ||
    message.includes("no such") ||
    message.includes("missing")
  );
};

const createJob = async ({ userId, title, rawDescription }) => {
  const currentJobsCount = await jobRepository.countJobsByUserId(userId);
  if (currentJobsCount >= env.freeTierMaxJobsPerUser) {
    throw new JobLimitServiceError(
      `Free tier limit reached (${env.freeTierMaxJobsPerUser} jobs). Upgrade to continue.`,
      409,
    );
  }

  return jobRepository.createJob({ userId, title, rawDescription });
};

const getJobsByUserId = async (userId) => {
  return jobRepository.getJobsByUserId(userId);
};

const getJobById = async (id, userId) => {
  return jobRepository.getJobById(id, userId);
};

const getJobOwnerContext = async (id) => {
  return jobRepository.getJobOwnerContext(id);
};

const updateStructuredRequirements = async (id, structuredRequirements, userId) => {
  return jobRepository.updateStructuredRequirements(id, structuredRequirements, userId);
};

const updateStructuredRequirementsIfStatus = async ({
  id,
  structuredRequirements,
  status,
  userId,
}) => {
  return jobRepository.updateStructuredRequirementsIfStatus({
    id,
    structuredRequirements,
    status,
    userId,
  });
};

const updateStatusIfCurrent = async ({ id, currentStatus, nextStatus, userId }) => {
  return jobRepository.updateStatusIfCurrent({ id, currentStatus, nextStatus, userId });
};

const completeRequirementsExtraction = async ({
  id,
  structuredRequirements,
  currentStatus,
  userId,
}) => {
  return jobRepository.completeRequirementsExtraction({
    id,
    structuredRequirements,
    currentStatus,
    userId,
  });
};

const markRequirementsExtractionFailed = async ({
  id,
  currentStatus,
  userId,
  failure = null,
}) => {
  return jobRepository.markRequirementsExtractionFailed({
    id,
    currentStatus,
    userId,
    failure,
  });
};

const deleteJobByOwner = async ({ jobId, userId, confirm = false }) => {
  const job = await jobRepository.getJobDeletionContext(jobId);

  if (!job) {
    throw new JobDeletionServiceError("Job not found", 404);
  }

  if (job.userId !== userId) {
    throw new JobDeletionServiceError("Forbidden", 403);
  }

  const resumes = await jobRepository.getResumesForJob(jobId);
  const processingResumes = resumes.filter((resume) =>
    PROCESSING_RESUME_STATUSES.has(resume.status),
  );

  if (!confirm && processingResumes.length > 0) {
    throw new JobDeletionServiceError(
      "Some resumes are still processing. Retry with confirm=true to delete.",
      409,
      {
        requiresConfirmation: true,
        processingResumeCount: processingResumes.length,
        totalResumeCount: resumes.length,
      },
    );
  }

  await Promise.all(
    resumes.map((resume) =>
      cancelResumeQueueJobs({
        resumeId: resume.id,
        userId,
        jobId,
      }),
    ),
  );

  await cancelJobExtractionQueueJob({ jobId, userId });

  await resumeService.releaseReservationsByJob({ jobId, userId });

  const storagePaths = resumes
    .map((resume) => resume.storagePath)
    .filter((path) => typeof path === "string" && path.trim().length > 0);
  const resumeIdByStoragePath = new Map(
    resumes.map((resume) => [resume.storagePath, resume.id]),
  );

  if (storagePaths.length > 0) {
    try {
      await supabaseStorage.removeResumes(storagePaths);

      for (const path of storagePaths) {
        logger.info("resume_storage_deleted", {
          userId,
          jobId,
          resumeId: resumeIdByStoragePath.get(path) ?? null,
          storagePath: path,
          skipped: false,
        });
      }
    } catch (error) {
      if (!isStorageNotFoundError(error)) {
        throw new JobDeletionServiceError("Failed to delete one or more resume files", 502);
      }

      for (const path of storagePaths) {
        logger.info("resume_storage_deleted", {
          userId,
          jobId,
          resumeId: resumeIdByStoragePath.get(path) ?? null,
          storagePath: path,
          skipped: true,
          reason: "already_missing",
        });
      }
    }
  }

  const deletedResumeCount = await jobRepository.deleteResumesByJobId({
    jobId,
    userId,
  });
  const deletedJob = await jobRepository.deleteJobScoped({
    id: jobId,
    userId,
  });

  logger.info("job_deleted", {
    userId,
    jobId,
    deletedJob,
    deletedResumeCount,
    totalResumeCount: resumes.length,
  });

  return {
    deletedJob,
    deletedResumeCount,
  };
};

const jobService = {
  createJob,
  getJobsByUserId,
  getJobById,
  getJobOwnerContext,
  updateStructuredRequirements,
  updateStructuredRequirementsIfStatus,
  updateStatusIfCurrent,
  completeRequirementsExtraction,
  markRequirementsExtractionFailed,
  deleteJobByOwner,
  JobDeletionServiceError,
  JobLimitServiceError,
};

export default jobService;
export { JobDeletionServiceError, JobLimitServiceError };
