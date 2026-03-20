import prisma from "../../config/prisma.js";

const toFailureRecord = (failure, { stage, code, message }) => {
  const at = new Date().toISOString();

  if (typeof failure === "string" && failure.trim()) {
    return {
      code,
      retryable: false,
      statusCode: null,
      stage,
      message: failure.trim(),
      rawFailure: failure,
      at,
    };
  }

  if (failure instanceof Error) {
    return {
      code: typeof failure.code === "string" ? failure.code : code,
      retryable: Boolean(failure.retryable),
      statusCode: Number.isFinite(failure.statusCode) ? failure.statusCode : null,
      stage,
      message: failure.message || message,
      rawFailure: {
        name: failure.name,
        message: failure.message,
        code: failure.code ?? null,
      },
      at,
    };
  }

  if (failure && typeof failure === "object" && !Array.isArray(failure)) {
    const parsedStatusCode = Number(failure.statusCode);

    return {
      code: typeof failure.code === "string" ? failure.code : code,
      retryable: Boolean(failure.retryable),
      statusCode: Number.isFinite(parsedStatusCode) ? parsedStatusCode : null,
      stage: typeof failure.stage === "string" ? failure.stage : stage,
      message: typeof failure.message === "string" ? failure.message : message,
      rawFailure:
        typeof failure.rawFailure === "undefined" ? null : failure.rawFailure,
      at: typeof failure.at === "string" && failure.at ? failure.at : at,
    };
  }

  return {
    code,
    retryable: false,
    statusCode: null,
    stage,
    message,
    rawFailure: failure ?? null,
    at,
  };
};

const withJobUserScope = (where, userId) => {
  if (!userId) {
    return where;
  }

  return {
    ...where,
    job: {
      userId,
    },
  };
};

const decrementUserInFlightCount = async (tx, userId, amount) => {
  if (!userId || amount <= 0) {
    return;
  }

  await tx.$executeRaw`
    UPDATE "User"
    SET "resumeInFlightCount" = GREATEST("resumeInFlightCount" - ${amount}, 0)
    WHERE "id" = CAST(${userId} AS UUID)
  `;
};

const releaseReservationForResume = async ({ tx, resumeId, userId }) => {
  const scopedResume = await tx.resume.findFirst({
    where: withJobUserScope({ id: resumeId, quotaReservationActive: true }, userId),
    select: {
      id: true,
      job: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!scopedResume?.job?.userId) {
    return false;
  }

  const updated = await tx.resume.updateMany({
    where: {
      id: scopedResume.id,
      quotaReservationActive: true,
    },
    data: {
      quotaReservationActive: false,
    },
  });

  if (updated.count === 0) {
    return false;
  }

  await decrementUserInFlightCount(tx, scopedResume.job.userId, 1);
  return true;
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
  return prisma.resume.create({
    data: {
      jobId,
      storagePath,
      rawText,
      structuredData,
      insights,
      lastProcessingFailure: null,
      status,
      score,
      scoreBreakdown,
      quotaReservationActive: true,
    },
  });
};

const updateStatus = async (id, status) => {
  return prisma.resume.update({
    where: { id },
    data: { status },
  });
};

const updateRawText = async (id, rawText) => {
  return prisma.resume.update({
    where: { id },
    data: { rawText },
  });
};

const updateStructuredData = async (id, structuredData) => {
  return prisma.resume.update({
    where: { id },
    data: { structuredData },
  });
};

const updateResumeStage = async (id, stage) => {
  return prisma.resume.update({
    where: { id },
    data: { stage },
  });
};

const updateLastProcessingFailure = async (id, failure = null) => {
  const failureRecord = toFailureRecord(failure, {
    stage: "processing",
    code: "PROCESSING_FAILED",
    message: "Resume processing failed",
  });

  const result = await prisma.resume.updateMany({
    where: { id },
    data: { lastProcessingFailure: failureRecord },
  });

  return result.count > 0;
};

const getResumeById = async (id, userId) => {
  return prisma.resume.findFirst({
    where: withJobUserScope({ id }, userId),
  });
};

const getResumeOwnerContext = async (id) => {
  return prisma.resume.findUnique({
    where: { id },
    select: {
      id: true,
      jobId: true,
      job: {
        select: {
          userId: true,
        },
      },
    },
  });
};

const getResumeDeletionContext = async (id) => {
  return prisma.resume.findUnique({
    where: { id },
    select: {
      id: true,
      jobId: true,
      storagePath: true,
      status: true,
      quotaReservationActive: true,
      job: {
        select: {
          userId: true,
        },
      },
    },
  });
};

const completeTextExtraction = async ({ id, rawText }) => {
  const result = await prisma.resume.updateMany({
    where: {
      id,
      status: "UPLOADED",
    },
    data: {
      rawText,
      status: "TEXT_EXTRACTED",
      lastProcessingFailure: null,
    },
  });

  return result.count > 0;
};

const markExtractionFailed = async (id, failure = null) => {
  const failureRecord = toFailureRecord(failure, {
    stage: "text_extraction",
    code: "RESUME_TEXT_EXTRACTION_FAILED",
    message: "Resume text extraction failed",
  });
  return prisma.$transaction(async (tx) => {
    const result = await tx.resume.updateMany({
      where: {
        id,
        status: "UPLOADED",
      },
      data: {
        status: "FAILED_EXTRACTION",
        lastProcessingFailure: failureRecord,
      },
    });

    if (result.count > 0) {
      await releaseReservationForResume({ tx, resumeId: id });
    }

    return result.count > 0;
  });
};

const completeStructureExtraction = async ({ id, structuredData }) => {
  const result = await prisma.resume.updateMany({
    where: {
      id,
      status: "TEXT_EXTRACTED",
    },
    data: {
      structuredData,
      status: "STRUCTURED",
      lastProcessingFailure: null,
    },
  });

  return result.count > 0;
};

const markStructureFailed = async (id, failure = null) => {
  const failureRecord = toFailureRecord(failure, {
    stage: "structuring",
    code: "RESUME_STRUCTURING_FAILED",
    message: "Resume structuring failed",
  });
  return prisma.$transaction(async (tx) => {
    const result = await tx.resume.updateMany({
      where: {
        id,
        status: "TEXT_EXTRACTED",
      },
      data: {
        status: "FAILED_STRUCTURE",
        lastProcessingFailure: failureRecord,
      },
    });

    if (result.count > 0) {
      await releaseReservationForResume({ tx, resumeId: id });
    }

    return result.count > 0;
  });
};

const completeScoring = async ({ id, score, scoreBreakdown }) => {
  const result = await prisma.resume.updateMany({
    where: {
      id,
      status: "STRUCTURED",
    },
    data: {
      score,
      scoreBreakdown,
      status: "SCORED",
      lastProcessingFailure: null,
    },
  });

  return result.count > 0;
};

const markScoringFailed = async (id, failure = null) => {
  const failureRecord = toFailureRecord(failure, {
    stage: "scoring",
    code: "RESUME_SCORING_FAILED",
    message: "Resume scoring failed",
  });
  return prisma.$transaction(async (tx) => {
    const result = await tx.resume.updateMany({
      where: {
        id,
        status: "STRUCTURED",
      },
      data: {
        status: "FAILED_SCORING",
        lastProcessingFailure: failureRecord,
      },
    });

    if (result.count > 0) {
      await releaseReservationForResume({ tx, resumeId: id });
    }

    return result.count > 0;
  });
};

const startInsightsGeneration = async (id) => {
  const result = await prisma.resume.updateMany({
    where: {
      id,
      status: "SCORED",
    },
    data: {
      status: "INSIGHTS_GENERATING",
    },
  });

  return result.count > 0;
};

const completeInsightsGeneration = async ({ id, insights }) => {
  return prisma.$transaction(async (tx) => {
    const resumeContext = await tx.resume.findUnique({
      where: { id },
      select: {
        id: true,
        job: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!resumeContext?.job?.userId) {
      return false;
    }

    const reservedResult = await tx.resume.updateMany({
      where: {
        id,
        status: "INSIGHTS_GENERATING",
        quotaReservationActive: true,
      },
      data: {
        insights,
        status: "INSIGHTS_GENERATED",
        lastProcessingFailure: null,
        quotaReservationActive: false,
      },
    });

    if (reservedResult.count > 0) {
      await tx.$executeRaw`
        UPDATE "User"
        SET
          "resumesCompletedCount" = "resumesCompletedCount" + 1,
          "resumeInFlightCount" = GREATEST("resumeInFlightCount" - 1, 0)
        WHERE "id" = CAST(${resumeContext.job.userId} AS UUID)
      `;
      return true;
    }

    const fallbackResult = await tx.resume.updateMany({
      where: {
        id,
        status: "INSIGHTS_GENERATING",
      },
      data: {
        insights,
        status: "INSIGHTS_GENERATED",
        lastProcessingFailure: null,
      },
    });

    return fallbackResult.count > 0;
  });
};

const markInsightsFailed = async (id, failure = null) => {
  const failureRecord = toFailureRecord(failure, {
    stage: "insights_generation",
    code: "RESUME_INSIGHTS_FAILED",
    message: "Resume insights generation failed",
  });
  return prisma.$transaction(async (tx) => {
    const result = await tx.resume.updateMany({
      where: {
        id,
        status: {
          in: ["SCORED", "INSIGHTS_GENERATING"],
        },
      },
      data: {
        status: "FAILED_INSIGHTS",
        lastProcessingFailure: failureRecord,
      },
    });

    if (result.count > 0) {
      await releaseReservationForResume({ tx, resumeId: id });
    }

    return result.count > 0;
  });
};

const deleteResume = async (id) => {
  return prisma.$transaction(async (tx) => {
    await releaseReservationForResume({ tx, resumeId: id });

    return tx.resume.delete({
      where: { id },
    });
  });
};

const deleteResumeScoped = async ({ id, userId }) => {
  return prisma.$transaction(async (tx) => {
    await releaseReservationForResume({ tx, resumeId: id, userId });

    const result = await tx.resume.deleteMany({
      where: {
        id,
        job: {
          userId,
        },
      },
    });

    return result.count > 0;
  });
};

const releaseReservationByOwner = async ({ id, userId }) => {
  return prisma.$transaction(async (tx) => {
    return releaseReservationForResume({ tx, resumeId: id, userId });
  });
};

const releaseReservationsByJob = async ({ jobId, userId }) => {
  return prisma.$transaction(async (tx) => {
    const reservedResumes = await tx.resume.findMany({
      where: withJobUserScope({ jobId, quotaReservationActive: true }, userId),
      select: { id: true },
    });

    const reservedCount = reservedResumes.length;
    if (reservedCount === 0) {
      return 0;
    }

    await tx.resume.updateMany({
      where: withJobUserScope({ jobId, quotaReservationActive: true }, userId),
      data: {
        quotaReservationActive: false,
      },
    });

    await decrementUserInFlightCount(tx, userId, reservedCount);
    return reservedCount;
  });
};

const countResumesByJob = async (jobId, userId) => {
  return prisma.resume.count({
    where: withJobUserScope({ jobId }, userId),
  });
};

const getResumesByJob = async (jobId, userId) => {
  return prisma.resume.findMany({
    where: withJobUserScope({ jobId }, userId),
    orderBy: [
      {
        score: {
          sort: "desc",
          nulls: "last",
        },
      },
      { createdAt: "desc" },
    ],
  });
};

const resumeRepository = {
  createResume,
  updateStatus,
  updateRawText,
  updateStructuredData,
  updateResumeStage,
  updateLastProcessingFailure,
  getResumeById,
  getResumeOwnerContext,
  getResumeDeletionContext,
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
  deleteResumeScoped,
  releaseReservationByOwner,
  releaseReservationsByJob,
  countResumesByJob,
  getResumesByJob,
};

export default resumeRepository;
