import prisma from "../../config/prisma.js";

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

const updateScore = async (id, score, scoreBreakdown = null) => {
  return prisma.resume.update({
    where: { id },
    data: {
      score,
      scoreBreakdown,
    },
  });
};

const getResumeById = async (id) => {
  return prisma.resume.findUnique({
    where: { id },
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

const deleteResume = async (id) => {
  return prisma.resume.delete({
    where: { id },
  });
};

const getResumesByJob = async (jobId) => {
  return prisma.resume.findMany({
    where: { jobId },
    orderBy: { createdAt: "desc" },
  });
};

const resumeRepository = {
  createResume,
  updateStatus,
  updateRawText,
  updateStructuredData,
  updateScore,
  getResumeById,
  completeTextExtraction,
  markExtractionFailed,
  completeStructureExtraction,
  markStructureFailed,
  deleteResume,
  getResumesByJob,
};

export default resumeRepository;
