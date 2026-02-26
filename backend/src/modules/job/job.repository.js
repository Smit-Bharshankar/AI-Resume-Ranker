import prisma from "../../config/prisma.js";

const createJob = async ({ title, rawDescription }) => {
  return prisma.job.create({
    data: {
      title,
      rawDescription,
      structuredRequirements: null,
      status: "DRAFT",
    },
  });
};

const getJobById = async (id) => {
  return prisma.job.findUnique({
    where: { id },
  });
};

const updateStructuredRequirements = async (id, structuredRequirements) => {
  return prisma.job.update({
    where: { id },
    data: {
      structuredRequirements,
    },
  });
};

const updateStructuredRequirementsIfStatus = async ({
  id,
  structuredRequirements,
  status,
}) => {
  const result = await prisma.job.updateMany({
    where: {
      id,
      status,
    },
    data: {
      structuredRequirements,
    },
  });

  return result.count > 0;
};

const updateStatusIfCurrent = async ({ id, currentStatus, nextStatus }) => {
  const result = await prisma.job.updateMany({
    where: {
      id,
      status: currentStatus,
    },
    data: {
      status: nextStatus,
    },
  });

  return result.count > 0;
};

const completeRequirementsExtraction = async ({
  id,
  structuredRequirements,
  currentStatus = "EXTRACTING_REQUIREMENTS",
}) => {
  const result = await prisma.job.updateMany({
    where: {
      id,
      status: currentStatus,
    },
    data: {
      structuredRequirements,
      status: "REQUIREMENTS_STRUCTURED",
    },
  });

  return result.count > 0;
};

const markRequirementsExtractionFailed = async ({
  id,
  currentStatus = "EXTRACTING_REQUIREMENTS",
}) => {
  const result = await prisma.job.updateMany({
    where: {
      id,
      status: currentStatus,
    },
    data: {
      status: "FAILED_STRUCTURE",
    },
  });

  return result.count > 0;
};

const jobRepository = {
  createJob,
  getJobById,
  updateStructuredRequirements,
  updateStructuredRequirementsIfStatus,
  updateStatusIfCurrent,
  completeRequirementsExtraction,
  markRequirementsExtractionFailed,
};

export default jobRepository;
