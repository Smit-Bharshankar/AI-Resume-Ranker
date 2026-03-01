import prisma from "../../config/prisma.js";

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

const getResumeById = async (id, userId) => {
  return prisma.resume.findFirst({
    where: withJobUserScope({ id }, userId),
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
    },
  });

  return result.count > 0;
};

const markExtractionFailed = async (id) => {
  return prisma.resume.updateMany({
    where: {
      id,
      status: "UPLOADED",
    },
    data: {
      status: "FAILED_EXTRACTION",
    },
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
    },
  });

  return result.count > 0;
};

const markStructureFailed = async (id) => {
  const result = await prisma.resume.updateMany({
    where: {
      id,
      status: "TEXT_EXTRACTED",
    },
    data: {
      status: "FAILED_STRUCTURE",
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
    },
  });

  return result.count > 0;
};

const markScoringFailed = async (id) => {
  const result = await prisma.resume.updateMany({
    where: {
      id,
      status: "STRUCTURED",
    },
    data: {
      status: "FAILED_SCORING",
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
    },
  });

  return result.count > 0;
};

const markInsightsFailed = async (id) => {
  const result = await prisma.resume.updateMany({
    where: {
      id,
      status: "INSIGHTS_GENERATING",
    },
    data: {
      status: "FAILED_INSIGHTS",
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
  getResumeById,
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
