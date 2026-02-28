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

const getResumeById = async (id) => {
  return resumeRepository.getResumeById(id);
};

const completeTextExtraction = async ({ id, rawText }) => {
  return resumeRepository.completeTextExtraction({ id, rawText });
};

const markExtractionFailed = async (id) => {
  return resumeRepository.markExtractionFailed(id);
};

const completeStructureExtraction = async ({ id, structuredData }) => {
  return resumeRepository.completeStructureExtraction({ id, structuredData });
};

const markStructureFailed = async (id) => {
  return resumeRepository.markStructureFailed(id);
};

const completeScoring = async ({ id, score, scoreBreakdown }) => {
  return resumeRepository.completeScoring({ id, score, scoreBreakdown });
};

const markScoringFailed = async (id) => {
  return resumeRepository.markScoringFailed(id);
};

const startInsightsGeneration = async (id) => {
  return resumeRepository.startInsightsGeneration(id);
};

const completeInsightsGeneration = async ({ id, insights }) => {
  return resumeRepository.completeInsightsGeneration({ id, insights });
};

const markInsightsFailed = async (id) => {
  return resumeRepository.markInsightsFailed(id);
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
  getResumeById,
  completeTextExtraction,
  markExtractionFailed,
  completeStructureExtraction,
  markStructureFailed,
  completeScoring,
  markScoringFailed,
  startInsightsGeneration,
  completeInsightsGeneration,
  markInsightsFailed,
  deleteResume,
  getResumesByJob,
};

export default resumeService;
