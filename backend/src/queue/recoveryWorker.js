import env from "../config/env.js";
import logger from "../utils/logger.js";
import resumeService from "../modules/resume/resume.service.js";
import { enqueueResumeExtraction, getAttemptsForResumeStatus } from "./resumeQueue.js";
import { enqueueResumeInsightGeneration } from "./insightQueue.js";

const RECOVERABLE_STATUSES = [
  "TEXT_EXTRACTED",
  "STRUCTURED",
  "SCORED",
  "INSIGHTS_GENERATING",
];

const requeueStuckResume = async (resume) => {
  const resumeId = resume.id;
  const userId = resume.job?.userId ?? null;
  const jobId = resume.jobId ?? null;

  if (resume.status === "SCORED" || resume.status === "INSIGHTS_GENERATING") {
    await enqueueResumeInsightGeneration({ resumeId, userId, jobId });
    return "insight_queue";
  }

  await enqueueResumeExtraction({
    resumeId,
    userId,
    jobId,
    attempts: getAttemptsForResumeStatus(resume.status),
  });
  return "resume_queue";
};

const runRecoveryScan = async () => {
  const startedAt = Date.now();
  const staleBefore = new Date(Date.now() - env.recoveryStaleAfterMs);

  const stuckResumes = await resumeService.findStuckResumes({
    statuses: RECOVERABLE_STATUSES,
    staleBefore,
    limit: env.recoveryBatchSize,
  });

  if (stuckResumes.length === 0) {
    logger.info("recovery_scan_completed", {
      scanned: 0,
      requeued: 0,
      durationMs: Date.now() - startedAt,
    });
    return;
  }

  let requeued = 0;

  for (const resume of stuckResumes) {
    try {
      const targetQueue = await requeueStuckResume(resume);
      requeued += 1;
      logger.info("resume_recovered", {
        resumeId: resume.id,
        jobId: resume.jobId,
        status: resume.status,
        updatedAt: resume.updatedAt,
        targetQueue,
        action: "requeued",
      });
    } catch (error) {
      logger.error("resume_recovery_failed", {
        resumeId: resume.id,
        jobId: resume.jobId,
        status: resume.status,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logger.info("recovery_scan_completed", {
    scanned: stuckResumes.length,
    requeued,
    durationMs: Date.now() - startedAt,
  });
};

logger.info("recovery_worker_started", {
  scanIntervalMs: env.recoveryScanIntervalMs,
  staleAfterMs: env.recoveryStaleAfterMs,
  statuses: RECOVERABLE_STATUSES,
});

let scanInProgress = false;

const start = async () => {
  scanInProgress = true;
  await runRecoveryScan().finally(() => {
    scanInProgress = false;
  });
  setInterval(() => {
    if (scanInProgress) {
      logger.warn("recovery_scan_skipped", { reason: "scan_in_progress" });
      return;
    }
    scanInProgress = true;
    void runRecoveryScan().finally(() => {
      scanInProgress = false;
    });
  }, env.recoveryScanIntervalMs);
};

void start();
