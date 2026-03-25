import resumeRepository from "./resume.repository.js";
import supabaseStorage from "../../storage/supabaseStorage.js";
import logger from "../../utils/logger.js";
import { cancelResumeQueueJobs } from "../../queue/deletionCleanup.js";

const PROCESSING_RESUME_STATUSES = new Set([
  "UPLOADED",
  "TEXT_EXTRACTED",
  "STRUCTURED",
  "SCORED",
  "INSIGHTS_GENERATING",
]);

class ResumeDeletionServiceError extends Error {
  constructor(message, statusCode, metadata = {}) {
    super(message);
    this.name = "ResumeDeletionServiceError";
    this.statusCode = statusCode;
    this.metadata = metadata;
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

const createResume = async ({
  jobId,
  storagePath,
  rawText = null,
  structuredData = null,
  insights = null,
  status,
  score = null,
  scoreBreakdown = null,
}) => {
  return resumeRepository.createResume({
    jobId,
    storagePath,
    rawText,
    structuredData,
    insights,
    status,
    score,
    scoreBreakdown,
  });
};

const updateStatus = async (id, status) => {
  return resumeRepository.updateStatus(id, status);
};

const updateRawText = async (id, rawText) => {
  return resumeRepository.updateRawText(id, rawText);
};

const updateStructuredData = async (id, structuredData) => {
  return resumeRepository.updateStructuredData(id, structuredData);
};

const updateLastProcessingFailure = async (id, failure = null) => {
  return resumeRepository.updateLastProcessingFailure(id, failure);
};

const getResumeById = async (id, userId) => {
  return resumeRepository.getResumeById(id, userId);
};

const resetFailedStatusForRetry = async ({
  id,
  userId,
  fromStatus,
  toStatus,
}) => {
  return resumeRepository.resetFailedStatusForRetry({
    id,
    userId,
    fromStatus,
    toStatus,
  });
};

const getResumeOwnerContext = async (id) => {
  return resumeRepository.getResumeOwnerContext(id);
};

const completeTextExtraction = async ({ id, rawText }) => {
  return resumeRepository.completeTextExtraction({ id, rawText });
};

const markExtractionFailed = async (id, failure = null) => {
  return resumeRepository.markExtractionFailed(id, failure);
};

const completeStructureExtraction = async ({ id, structuredData }) => {
  return resumeRepository.completeStructureExtraction({ id, structuredData });
};

const markStructureFailed = async (id, failure = null) => {
  return resumeRepository.markStructureFailed(id, failure);
};

const completeScoring = async ({ id, score, scoreBreakdown }) => {
  return resumeRepository.completeScoring({ id, score, scoreBreakdown });
};

const markScoringFailed = async (id, failure = null) => {
  return resumeRepository.markScoringFailed(id, failure);
};

const startInsightsGeneration = async (id) => {
  return resumeRepository.startInsightsGeneration(id);
};

const completeInsightsGeneration = async ({ id, insights }) => {
  return resumeRepository.completeInsightsGeneration({ id, insights });
};

const markInsightsFailed = async (id, failure = null) => {
  return resumeRepository.markInsightsFailed(id, failure);
};

const deleteResume = async (id) => {
  return resumeRepository.deleteResume(id);
};

const releaseReservationByOwner = async ({ resumeId, userId }) => {
  return resumeRepository.releaseReservationByOwner({ id: resumeId, userId });
};

const releaseReservationsByJob = async ({ jobId, userId }) => {
  return resumeRepository.releaseReservationsByJob({ jobId, userId });
};

const deleteResumeByOwner = async ({ resumeId, userId, confirm = false }) => {
  const resume = await resumeRepository.getResumeDeletionContext(resumeId);

  if (!resume) {
    throw new ResumeDeletionServiceError("Resume not found", 404);
  }

  if (resume.job?.userId !== userId) {
    throw new ResumeDeletionServiceError("Forbidden", 403);
  }

  if (!confirm && PROCESSING_RESUME_STATUSES.has(resume.status)) {
    throw new ResumeDeletionServiceError(
      "Resume is still processing. Retry with confirm=true to delete.",
      409,
      {
        requiresConfirmation: true,
        resumeStatus: resume.status,
      },
    );
  }

  const queueCleanup = await cancelResumeQueueJobs({
    resumeId: resume.id,
    userId,
    jobId: resume.jobId,
  });
  const hadActiveQueueJob = queueCleanup.some((item) => item.wasActive);

  if (hadActiveQueueJob) {
    try {
      await resumeRepository.updateLastProcessingFailure(resume.id, {
        code: "RESUME_DELETION_CANCELLED",
        retryable: false,
        statusCode: null,
        stage: "deletion",
        message: "Resume deletion requested while queue job was active",
        rawFailure: {
          queueCleanup,
        },
        at: new Date().toISOString(),
      });
    } catch (error) {
      logger.warn("resume_deletion_cancel_marker_failed", {
        userId,
        resumeId: resume.id,
        jobId: resume.jobId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  try {
    await supabaseStorage.removeResume(resume.storagePath);
    logger.info("resume_storage_deleted", {
      userId,
      resumeId: resume.id,
      jobId: resume.jobId,
      storagePath: resume.storagePath,
    });
  } catch (error) {
    if (!isStorageNotFoundError(error)) {
      throw new ResumeDeletionServiceError("Failed to delete resume storage file", 502);
    }

    logger.info("resume_storage_deleted", {
      userId,
      resumeId: resume.id,
      jobId: resume.jobId,
      storagePath: resume.storagePath,
      skipped: true,
      reason: "already_missing",
    });
  }

  const deleted = await resumeRepository.deleteResumeScoped({
    id: resume.id,
    userId,
  });

  logger.info("resume_deleted", {
    userId,
    resumeId: resume.id,
    jobId: resume.jobId,
    deleted,
  });

  return {
    deleted,
  };
};

const getResumesByJob = async (jobId, userId) => {
  return resumeRepository.getResumesByJob(jobId, userId);
};

const findStuckResumes = async ({ statuses, staleBefore, limit }) => {
  return resumeRepository.findStuckResumes({ statuses, staleBefore, limit });
};

const countResumesByJob = async (jobId, userId) => {
  return resumeRepository.countResumesByJob(jobId, userId);
};

const getResumeSignedFileUrl = async ({
  resumeId,
  userId,
  expiresInSeconds = 900,
}) => {
  const resume = await resumeRepository.getResumeById(resumeId, userId);
  if (!resume || !resume.storagePath) {
    return null;
  }

  const url = await supabaseStorage.createSignedResumeUrl(
    resume.storagePath,
    expiresInSeconds,
  );

  return {
    url,
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
  };
};

const resumeService = {
  createResume,
  updateStatus,
  updateRawText,
  updateStructuredData,
  updateLastProcessingFailure,
  getResumeById,
  resetFailedStatusForRetry,
  getResumeOwnerContext,
  completeTextExtraction,
  markExtractionFailed,
  completeStructureExtraction,
  markStructureFailed,
  completeScoring,
  markScoringFailed,
  startInsightsGeneration,
  completeInsightsGeneration,
  markInsightsFailed,
  deleteResume,
  releaseReservationByOwner,
  releaseReservationsByJob,
  deleteResumeByOwner,
  getResumesByJob,
  countResumesByJob,
  findStuckResumes,
  getResumeSignedFileUrl,
  PROCESSING_RESUME_STATUSES,
  ResumeDeletionServiceError,
};

export default resumeService;
export { PROCESSING_RESUME_STATUSES, ResumeDeletionServiceError };
