import resumeRepository from "./resume.repository.js";

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
  return resumeRepository.createResume({
    jobId,
    storagePath,
    rawText,
    structuredData,
    insights,
    status,
    score,
    scoreBreakdown,
  });
};

const updateStatus = async (id, status) => {
  return resumeRepository.updateStatus(id, status);
};

const updateRawText = async (id, rawText) => {
  return resumeRepository.updateRawText(id, rawText);
};

const updateStructuredData = async (id, structuredData) => {
  return resumeRepository.updateStructuredData(id, structuredData);
};

const updateScore = async (id, score, scoreBreakdown = null) => {
  return resumeRepository.updateScore(id, score, scoreBreakdown);
};

const getResumeById = async (id) => {
  return resumeRepository.getResumeById(id);
};

const completeTextExtraction = async ({ id, rawText }) => {
  return resumeRepository.completeTextExtraction({ id, rawText });
};

const markExtractionFailed = async (id) => {
  return resumeRepository.markExtractionFailed(id);
};

const deleteResume = async (id) => {
  return resumeRepository.deleteResume(id);
};

const getResumesByJob = async (jobId) => {
  return resumeRepository.getResumesByJob(jobId);
};

const resumeService = {
  createResume,
  updateStatus,
  updateRawText,
  updateStructuredData,
  updateScore,
  getResumeById,
  completeTextExtraction,
  markExtractionFailed,
  deleteResume,
  getResumesByJob,
};

export default resumeService;
