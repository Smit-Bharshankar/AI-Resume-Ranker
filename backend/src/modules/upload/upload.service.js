import jobService from "../job/job.service.js";
import resumeService from "../resume/resume.service.js";
import supabaseStorage from "../../storage/supabaseStorage.js";
import { enqueueResumeExtraction } from "../../queue/resumeQueue.js";
import logger from "../../utils/logger.js";

const processSingleFile = async ({ userId, jobId, file }) => {
  let createdResume = null;
  let storagePath = "";

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
    });

    return true;
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

    return false;
  }
};

const uploadResumesForJob = async ({ userId, jobId, files }) => {
  const job = await jobService.getJobById(jobId, userId);

  if (!job) {
    const error = new Error("Job not found");
    error.statusCode = 404;
    throw error;
  }

  const results = await Promise.all(
    files.map((file) => processSingleFile({ userId, jobId, file })),
  );

  const uploaded = results.filter(Boolean).length;
  const failed = results.length - uploaded;

  return {
    uploaded,
    failed,
  };
};

const uploadService = {
  uploadResumesForJob,
};

export default uploadService;
