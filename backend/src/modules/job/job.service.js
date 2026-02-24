import jobRepository from "./job.repository.js";

const createJob = async ({ title, rawDescription }) => {
  return jobRepository.createJob({ title, rawDescription });
};

const getJobById = async (id) => {
  return jobRepository.getJobById(id);
};

const updateStructuredRequirements = async (id, structuredRequirements) => {
  return jobRepository.updateStructuredRequirements(id, structuredRequirements);
};

const jobService = {
  createJob,
  getJobById,
  updateStructuredRequirements,
};

export default jobService;
