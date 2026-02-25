import { Worker } from "bullmq";
import { connection } from "./resumeQueue.js";
import env from "../config/env.js";
import resumeService from "../modules/resume/resume.service.js";
import resumeExtractionService from "../modules/ai/extraction.service.js";
import { validateAiConfiguration } from "../modules/ai/providers/provider.factory.js";
import supabaseStorage from "../storage/supabaseStorage.js";
import logger from "../utils/logger.js";
import { PDFParse } from "pdf-parse";

const normalizeText = (rawText) => {
  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const processResumeJob = async (job) => {
  const { resumeId } = job.data ?? {};

  if (!resumeId || typeof resumeId !== "string") {
    throw new Error("Invalid resumeId in queue payload");
  }

  let resume = await resumeService.getResumeById(resumeId);

  if (!resume) {
    logger.warn("Skipping missing resume", {
      queue: env.resumeQueueName,
      resumeId,
      jobId: job.id,
    });
    return;
  }

  if (resume.status === "UPLOADED") {
    try {
      const fileBuffer = await supabaseStorage.downloadResume(resume.storagePath);
      const parser = new PDFParse({ data: fileBuffer });
      let parsedText = "";

      try {
        const parsed = await parser.getText();
        parsedText = parsed.text ?? "";
      } finally {
        await parser.destroy();
      }

      const normalizedText = normalizeText(parsedText);

      if (!normalizedText) {
        throw new Error("Extracted text was empty");
      }

      const updated = await resumeService.completeTextExtraction({
        id: resumeId,
        rawText: normalizedText,
      });

      if (!updated) {
        logger.warn("Skipped completion due to concurrent status update", {
          queue: env.resumeQueueName,
          resumeId,
          jobId: job.id,
        });
        return;
      }

      logger.info("Resume text extraction completed", {
        queue: env.resumeQueueName,
        resumeId,
        jobId: job.id,
      });
    } catch (error) {
      const attempts = job.opts.attempts ?? env.resumeQueueAttempts;
      const isFinalAttempt = job.attemptsMade + 1 >= attempts;

      logger.error("Resume text extraction failed", {
        queue: env.resumeQueueName,
        resumeId,
        jobId: job.id,
        attemptsMade: job.attemptsMade + 1,
        attempts,
        isFinalAttempt,
        error: error.message,
      });

      if (isFinalAttempt) {
        await resumeService.markExtractionFailed(resumeId);
      }

      throw error;
    }

    resume = await resumeService.getResumeById(resumeId);
  }

  if (resume?.status === "TEXT_EXTRACTED") {
    await resumeExtractionService.process(resumeId);
    return;
  }

  logger.info("Skipping resume with unsupported status in worker", {
    queue: env.resumeQueueName,
    resumeId,
    status: resume?.status,
    jobId: job.id,
  });
};

const worker = new Worker(env.resumeQueueName, processResumeJob, {
  connection,
  concurrency: env.resumeWorkerConcurrency,
});

const aiConfigHealth = validateAiConfiguration();
for (const warning of aiConfigHealth.warnings) {
  logger.warn("AI config warning", {
    queue: env.resumeQueueName,
    warning,
  });
}
for (const error of aiConfigHealth.errors) {
  logger.error("AI config error", {
    queue: env.resumeQueueName,
    error,
  });
}

worker.on("error", (error) => {
  logger.error("Worker encountered an error", {
    queue: env.resumeQueueName,
    error: error.message,
  });
});

worker.on("failed", (job, error) => {
  logger.error("Queue job failed", {
    queue: env.resumeQueueName,
    jobId: job?.id,
    resumeId: job?.data?.resumeId,
    attemptsMade: job?.attemptsMade,
    error: error.message,
  });
});

logger.info("Resume worker started", {
  queue: env.resumeQueueName,
  concurrency: env.resumeWorkerConcurrency,
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled rejection in worker", {
    queue: env.resumeQueueName,
    error: error instanceof Error ? error.message : String(error),
  });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception in worker", {
    queue: env.resumeQueueName,
    error: error.message,
  });
  process.exit(1);
});
