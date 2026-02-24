import prisma from "../../config/prisma.js";

const createJob = async ({ title, rawDescription }) => {
  return prisma.job.create({
    data: {
      title,
      rawDescription,
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

const jobRepository = {
  createJob,
  getJobById,
  updateStructuredRequirements,
};

export default jobRepository;
