import { Worker } from "bullmq";
import { connection } from "./resumeQueue.js";
import env from "../config/env.js";
import resumeService from "../modules/resume/resume.service.js";
import resumeExtractionService from "../modules/ai/extraction.service.js";
import resumeMatchingService from "../modules/matching/matching.service.js";
import { enqueueResumeInsightGeneration } from "./insightQueue.js";
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

const enqueueInsightsPipeline = async ({ resumeId, jobLogger }) => {
  await enqueueResumeInsightGeneration({ resumeId });

  const transitioned = await resumeService.startInsightsGeneration(resumeId);
  if (!transitioned) {
    jobLogger.warn("Skipped insights transition due to concurrent status update", {
      stage: "insights_enqueue",
    });
    return;
  }

  jobLogger.info("Resume insights generation enqueued", {
    stage: "insights_enqueue",
    nextStatus: "INSIGHTS_GENERATING",
  });
};

const processResumeJob = async (job) => {
  const startedAtMs = Date.now();
  const { resumeId } = job.data ?? {};

  if (!resumeId || typeof resumeId !== "string") {
    throw new Error("Invalid resumeId in queue payload");
  }

  const baseJobLogger = logger.child({
    queue: env.resumeQueueName,
    jobId: job.id,
    resumeId,
    attemptsMade: job.attemptsMade + 1,
    maxAttempts: job.opts.attempts ?? env.resumeQueueAttempts,
  });

  baseJobLogger.info("Resume pipeline job started");

  let resume = await resumeService.getResumeById(resumeId);

  if (!resume) {
    baseJobLogger.warn("Skipping missing resume");
    return;
  }

  const jobLogger = baseJobLogger.child({
    currentStatus: resume.status,
  });

  if (resume.status === "UPLOADED") {
    const extractionStartedAtMs = Date.now();
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
        jobLogger.warn("Skipped completion due to concurrent status update", {
          stage: "text_extraction",
          durationMs: Date.now() - extractionStartedAtMs,
        });
        return;
      }

      jobLogger.info("Resume text extraction completed", {
        stage: "text_extraction",
        durationMs: Date.now() - extractionStartedAtMs,
      });
    } catch (error) {
      const attempts = job.opts.attempts ?? env.resumeQueueAttempts;
      const isFinalAttempt = job.attemptsMade + 1 >= attempts;

      jobLogger.error("Resume text extraction failed", {
        stage: "text_extraction",
        isFinalAttempt,
        durationMs: Date.now() - extractionStartedAtMs,
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
    const structuringStartedAtMs = Date.now();
    const structureResult = await resumeExtractionService.process(resumeId);
    jobLogger.info("Resume structuring stage finished", {
      stage: "structuring",
      structureStatus: structureResult?.status ?? "unknown",
      durationMs: Date.now() - structuringStartedAtMs,
    });

    if (structureResult?.status === "structured") {
      const scoringStartedAtMs = Date.now();
      const scoringResult = await resumeMatchingService.process(resumeId);
      jobLogger.info("Resume scoring stage finished", {
        stage: "scoring",
        scoringStatus: scoringResult?.status ?? "unknown",
        durationMs: Date.now() - scoringStartedAtMs,
        totalDurationMs: Date.now() - startedAtMs,
      });

      if (scoringResult?.status === "scored") {
        try {
          await enqueueInsightsPipeline({ resumeId, jobLogger });
        } catch (error) {
          jobLogger.error("Failed to enqueue resume insights", {
            stage: "insights_enqueue",
            error: error.message,
          });
        }
      }
      return;
    }

    if (structureResult?.status === "failed") {
      jobLogger.warn("Stopping pipeline due to structuring failure", {
        stage: "structuring",
        totalDurationMs: Date.now() - startedAtMs,
      });
      return;
    }

    const refreshedResume = await resumeService.getResumeById(resumeId);
    if (refreshedResume?.status === "STRUCTURED") {
      const scoringStartedAtMs = Date.now();
      const scoringResult = await resumeMatchingService.process(resumeId);
      jobLogger.info("Resume scoring stage finished after status refresh", {
        stage: "scoring",
        scoringStatus: scoringResult?.status ?? "unknown",
        durationMs: Date.now() - scoringStartedAtMs,
        totalDurationMs: Date.now() - startedAtMs,
      });

      if (scoringResult?.status === "scored") {
        try {
          await enqueueInsightsPipeline({ resumeId, jobLogger });
        } catch (error) {
          jobLogger.error("Failed to enqueue resume insights", {
            stage: "insights_enqueue",
            error: error.message,
          });
        }
      }
    }
    return;
  }

  if (resume?.status === "STRUCTURED") {
    const scoringStartedAtMs = Date.now();
    const scoringResult = await resumeMatchingService.process(resumeId);
    jobLogger.info("Resume scoring stage finished from structured state", {
      stage: "scoring",
      scoringStatus: scoringResult?.status ?? "unknown",
      durationMs: Date.now() - scoringStartedAtMs,
      totalDurationMs: Date.now() - startedAtMs,
    });

    if (scoringResult?.status === "scored") {
      try {
        await enqueueInsightsPipeline({ resumeId, jobLogger });
      } catch (error) {
        jobLogger.error("Failed to enqueue resume insights", {
          stage: "insights_enqueue",
          error: error.message,
        });
      }
    }
    return;
  }

  if (resume?.status === "SCORED") {
    try {
      await enqueueInsightsPipeline({ resumeId, jobLogger });
    } catch (error) {
      jobLogger.error("Failed to enqueue resume insights from scored state", {
        stage: "insights_enqueue",
        error: error.message,
      });
    }
    return;
  }

  jobLogger.info("Skipping resume with unsupported status in worker", {
    status: resume?.status,
    totalDurationMs: Date.now() - startedAtMs,
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
