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
  getResumesByJob,
};

export default resumeRepository;
