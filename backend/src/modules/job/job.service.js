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

const updateStructuredRequirementsIfStatus = async ({
  id,
  structuredRequirements,
  status,
}) => {
  return jobRepository.updateStructuredRequirementsIfStatus({
    id,
    structuredRequirements,
    status,
  });
};

const updateStatusIfCurrent = async ({ id, currentStatus, nextStatus }) => {
  return jobRepository.updateStatusIfCurrent({ id, currentStatus, nextStatus });
};

const completeRequirementsExtraction = async ({
  id,
  structuredRequirements,
  currentStatus,
}) => {
  return jobRepository.completeRequirementsExtraction({
    id,
    structuredRequirements,
    currentStatus,
  });
};

const markRequirementsExtractionFailed = async ({ id, currentStatus }) => {
  return jobRepository.markRequirementsExtractionFailed({ id, currentStatus });
};

const jobService = {
  createJob,
  getJobById,
  updateStructuredRequirements,
  updateStructuredRequirementsIfStatus,
  updateStatusIfCurrent,
  completeRequirementsExtraction,
  markRequirementsExtractionFailed,
};

export default jobService;
