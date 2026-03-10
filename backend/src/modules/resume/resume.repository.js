import prisma from "../../config/prisma.js";

const toFailureRecord = (failure, { stage, code, message }) => {
  if (
    failure &&
    typeof failure === "object" &&
    !Array.isArray(failure)
  ) {
    return {
      code: typeof failure.code === "string" ? failure.code : code,
      retryable: Boolean(failure.retryable),
      statusCode: Number.isFinite(failure.statusCode) ? failure.statusCode : null,
      stage: typeof failure.stage === "string" ? failure.stage : stage,
      message: typeof failure.message === "string" ? failure.message : message,
      at:
        typeof failure.at === "string" && failure.at
          ? failure.at
          : new Date().toISOString(),
    };
  }

  return {
    code,
    retryable: false,
    statusCode: null,
    stage,
    message,
    at: new Date().toISOString(),
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
  const result = await prisma.resume.updateMany({
    where: {
      id,
      status: {
        in: ["UPLOADED", "FAILED_EXTRACTION"],
      },
    },
    data: {
      status: "FAILED_EXTRACTION",
      lastProcessingFailure: failureRecord,
    },
  });

  return result.count > 0;
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
  const result = await prisma.resume.updateMany({
    where: {
      id,
      status: {
        in: ["TEXT_EXTRACTED", "FAILED_STRUCTURE"],
      },
    },
    data: {
      status: "FAILED_STRUCTURE",
      lastProcessingFailure: failureRecord,
    },
  });

  return result.count > 0;
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
  const result = await prisma.resume.updateMany({
    where: {
      id,
      status: {
        in: ["STRUCTURED", "FAILED_SCORING"],
      },
    },
    data: {
      status: "FAILED_SCORING",
      lastProcessingFailure: failureRecord,
    },
  });

  return result.count > 0;
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
  const result = await prisma.resume.updateMany({
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

  return result.count > 0;
};

const markInsightsFailed = async (id, failure = null) => {
  const failureRecord = toFailureRecord(failure, {
    stage: "insights_generation",
    code: "RESUME_INSIGHTS_FAILED",
    message: "Resume insights generation failed",
  });
  const result = await prisma.resume.updateMany({
    where: {
      id,
      status: {
        in: ["SCORED", "INSIGHTS_GENERATING", "FAILED_INSIGHTS"],
      },
    },
    data: {
      status: "FAILED_INSIGHTS",
      lastProcessingFailure: failureRecord,
    },
  });

  return result.count > 0;
};

const deleteResume = async (id) => {
  return prisma.resume.delete({
    where: { id },
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
  getResumeById,
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
  getResumesByJob,
};

export default resumeRepository;
