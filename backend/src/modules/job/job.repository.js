import prisma from "../../config/prisma.js";

const buildUserScopedWhere = (baseWhere, userId) => {
  if (!userId) {
    return baseWhere;
  }

  return {
    ...baseWhere,
    userId,
  };
};

const createJob = async ({ userId, title, rawDescription }) => {
  return prisma.job.create({
    data: {
      userId,
      title,
      rawDescription,
      structuredRequirements: null,
      status: "DRAFT",
    },
  });
};

const getJobsByUserId = async (userId) => {
  return prisma.job.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getJobById = async (id, userId) => {
  return prisma.job.findFirst({
    where: buildUserScopedWhere({ id }, userId),
  });
};

const getJobOwnerContext = async (id) => {
  return prisma.job.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
    },
  });
};

const updateStructuredRequirements = async (id, structuredRequirements, userId) => {
  return prisma.job.updateMany({
    where: buildUserScopedWhere({ id }, userId),
    data: {
      structuredRequirements,
    },
  });
};

const updateStructuredRequirementsIfStatus = async ({
  id,
  structuredRequirements,
  status,
  userId,
}) => {
  const result = await prisma.job.updateMany({
    where: buildUserScopedWhere({
      id,
      status,
    }, userId),
    data: {
      structuredRequirements,
    },
  });

  return result.count > 0;
};

const updateStatusIfCurrent = async ({ id, currentStatus, nextStatus, userId }) => {
  const result = await prisma.job.updateMany({
    where: buildUserScopedWhere({
      id,
      status: currentStatus,
    }, userId),
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
  userId,
}) => {
  const result = await prisma.job.updateMany({
    where: buildUserScopedWhere({
      id,
      status: currentStatus,
    }, userId),
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
  userId,
}) => {
  const result = await prisma.job.updateMany({
    where: buildUserScopedWhere({
      id,
      status: currentStatus,
    }, userId),
    data: {
      status: "FAILED_STRUCTURE",
    },
  });

  return result.count > 0;
};

const jobRepository = {
  createJob,
  getJobsByUserId,
  getJobById,
  getJobOwnerContext,
  updateStructuredRequirements,
  updateStructuredRequirementsIfStatus,
  updateStatusIfCurrent,
  completeRequirementsExtraction,
  markRequirementsExtractionFailed,
};

export default jobRepository;
