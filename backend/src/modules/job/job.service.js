import jobRepository from "./job.repository.js";

const createJob = async ({ userId, title, rawDescription }) => {
  return jobRepository.createJob({ userId, title, rawDescription });
};

const getJobsByUserId = async (userId) => {
  return jobRepository.getJobsByUserId(userId);
};

const getJobById = async (id, userId) => {
  return jobRepository.getJobById(id, userId);
};

const getJobOwnerContext = async (id) => {
  return jobRepository.getJobOwnerContext(id);
};

const updateStructuredRequirements = async (id, structuredRequirements, userId) => {
  return jobRepository.updateStructuredRequirements(id, structuredRequirements, userId);
};

const updateStructuredRequirementsIfStatus = async ({
  id,
  structuredRequirements,
  status,
  userId,
}) => {
  return jobRepository.updateStructuredRequirementsIfStatus({
    id,
    structuredRequirements,
    status,
    userId,
  });
};

const updateStatusIfCurrent = async ({ id, currentStatus, nextStatus, userId }) => {
  return jobRepository.updateStatusIfCurrent({ id, currentStatus, nextStatus, userId });
};

const completeRequirementsExtraction = async ({
  id,
  structuredRequirements,
  currentStatus,
  userId,
}) => {
  return jobRepository.completeRequirementsExtraction({
    id,
    structuredRequirements,
    currentStatus,
    userId,
  });
};

const markRequirementsExtractionFailed = async ({
  id,
  currentStatus,
  userId,
  failure = null,
}) => {
  return jobRepository.markRequirementsExtractionFailed({
    id,
    currentStatus,
    userId,
    failure,
  });
};

const jobService = {
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

export default jobService;
