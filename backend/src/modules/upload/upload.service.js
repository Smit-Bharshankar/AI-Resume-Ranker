import jobService from "../job/job.service.js";
import resumeService from "../resume/resume.service.js";
import userRepository from "../user/user.repository.js";
import supabaseStorage from "../../storage/supabaseStorage.js";
import { enqueueResumeExtraction } from "../../queue/resumeQueue.js";
import logger from "../../utils/logger.js";
import env from "../../config/env.js";
import { PDFParse } from "pdf-parse";
import { withOperationTimeout } from "../../utils/operationTimeout.js";

class UploadServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "UploadServiceError";
    this.statusCode = statusCode;
  }
}

const parsePdfPages = async (file) => {
  const parser = new PDFParse({ data: file.buffer });
  try {
    const info = await withOperationTimeout({
      timeoutMs: env.pdfParseTimeoutMs,
      operationName: "PDF page validation parse",
      operation: () => parser.getInfo(),
    });
    return Number(info?.total ?? 0);
  } catch {
    throw new UploadServiceError("Invalid PDF file. Please upload a valid PDF.", 400);
  } finally {
    await parser.destroy();
  }
};

const validatePdfPageLimits = async (files) => {
  for (const file of files) {
    const pages = await parsePdfPages(file);
    if (!Number.isFinite(pages) || pages < 1 || pages > env.uploadMaxPdfPages) {
      throw new UploadServiceError(
        `Each PDF must be between 1 and ${env.uploadMaxPdfPages} pages`,
        400,
      );
    }
  }
};

const processSingleFile = async ({ userId, jobId, file, index }) => {
  let createdResume = null;
  let storagePath = "";
  let reservationReleased = false;

  try {
    storagePath = await supabaseStorage.uploadResume({
      jobId,
      buffer: file.buffer,
      contentType: file.mimetype,
    });

    createdResume = await resumeService.createResume({
      jobId,
      storagePath,
      status: "UPLOADED",
    });

    await enqueueResumeExtraction({
      resumeId: createdResume.id,
      userId,
      jobId,
      delayMs: index * env.resumeQueueStaggerMs,
    });

    return {
      uploaded: true,
      reservationReleased: false,
    };
  } catch (error) {
    logger.error("Resume upload pipeline failed for file", {
      jobId,
      fileName: file.originalname,
      error: error.message,
      cause: error.cause?.message,
      stack: error.stack,
    });

    if (createdResume?.id) {
      try {
        await resumeService.deleteResume(createdResume.id);
        reservationReleased = true;
      } catch (deleteError) {
        logger.error("Failed to rollback resume record", {
          resumeId: createdResume.id,
          error: deleteError.message,
        });
      }
    }

    if (storagePath) {
      try {
        await supabaseStorage.removeResume(storagePath);
      } catch (removeError) {
        logger.error("Failed to rollback storage upload", {
          jobId,
          storagePath,
          error: removeError.message,
        });
      }
    }

    return {
      uploaded: false,
      reservationReleased,
    };
  }
};

const uploadResumesForJob = async ({ userId, jobId, files }) => {
  const job = await jobService.getJobById(jobId, userId);

  if (!job) {
    throw new UploadServiceError("Job not found", 404);
  }

  await validatePdfPageLimits(files);

  const [existingResumesForJob, usage] = await Promise.all([
    resumeService.countResumesByJob(jobId, userId),
    userRepository.getUsageByUserId(userId),
  ]);

  if (!usage) {
    throw new UploadServiceError("User not found", 404);
  }

  if (existingResumesForJob + files.length > env.freeTierMaxResumesPerJob) {
    throw new UploadServiceError(
      `Free tier job limit reached (${env.freeTierMaxResumesPerJob} resumes per job). Upgrade to continue.`,
      409,
    );
  }

  const reserveAccepted = await userRepository.reserveResumeInFlightSlots({
    userId,
    slots: files.length,
    maxResumesPerUser: env.freeTierMaxResumesPerUser,
  });

  if (!reserveAccepted) {
    throw new UploadServiceError(
      `Free tier lifetime limit reached (${env.freeTierMaxResumesPerUser} resumes). Upgrade to continue.`,
      409,
    );
  }

  let results;
  try {
    results = await Promise.all(
      files.map((file, index) => processSingleFile({ userId, jobId, file, index })),
    );
  } catch (error) {
    await userRepository.releaseResumeInFlightSlots({
      userId,
      slots: files.length,
    });
    throw error;
  }

  const uploaded = results.filter((result) => result.uploaded).length;
  const failed = results.length - uploaded;
  const failedNeedingReservationRelease = results.filter(
    (result) => !result.uploaded && !result.reservationReleased,
  ).length;

  if (failedNeedingReservationRelease > 0) {
    await userRepository.releaseResumeInFlightSlots({
      userId,
      slots: failedNeedingReservationRelease,
    });
  }

  return {
    uploaded,
    failed,
  };
};

const uploadService = {
  uploadResumesForJob,
};

export default uploadService;
export { UploadServiceError };
