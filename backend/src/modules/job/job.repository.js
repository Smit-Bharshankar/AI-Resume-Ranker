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
  return prisma.$transaction(async (tx) => {
    const createdJob = await tx.job.create({
      data: {
        userId,
        title,
        rawDescription,
        structuredRequirements: null,
        lastProcessingFailure: null,
        status: "DRAFT",
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        jobsCreatedCount: {
          increment: 1,
        },
      },
    });

    return createdJob;
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

const countJobsByUserId = async (userId) => {
  return prisma.job.count({
    where: { userId },
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

const getJobDeletionContext = async (id) => {
  return prisma.job.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      status: true,
    },
  });
};

const getResumesForJob = async (jobId) => {
  return prisma.resume.findMany({
    where: { jobId },
    select: {
      id: true,
      jobId: true,
      storagePath: true,
      status: true,
    },
  });
};

const deleteResumesByJobId = async ({ jobId, userId }) => {
  const result = await prisma.resume.deleteMany({
    where: {
      jobId,
      job: {
        userId,
      },
    },
  });

  return result.count;
};

const deleteJobScoped = async ({ id, userId }) => {
  const result = await prisma.job.deleteMany({
    where: {
      id,
      userId,
    },
  });

  return result.count > 0;
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
      lastProcessingFailure: null,
    },
  });

  return result.count > 0;
};

const markRequirementsExtractionFailed = async ({
  id,
  currentStatus = "EXTRACTING_REQUIREMENTS",
  userId,
  failure = null,
}) => {
  const result = await prisma.job.updateMany({
    where: buildUserScopedWhere({
      id,
      status: currentStatus,
    }, userId),
    data: {
      status: "FAILED_STRUCTURE",
      lastProcessingFailure: failure,
    },
  });

  return result.count > 0;
};

const jobRepository = {
  createJob,
  getJobsByUserId,
  countJobsByUserId,
  getJobById,
  getJobOwnerContext,
  getJobDeletionContext,
  getResumesForJob,
  deleteResumesByJobId,
  deleteJobScoped,
  updateStructuredRequirements,
  updateStructuredRequirementsIfStatus,
  updateStatusIfCurrent,
  completeRequirementsExtraction,
  markRequirementsExtractionFailed,
};

export default jobRepository;
