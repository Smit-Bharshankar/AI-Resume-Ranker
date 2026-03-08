import resumeRepository from "./resume.repository.js";
import supabaseStorage from "../../storage/supabaseStorage.js";

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

const getResumeById = async (id, userId) => {
  return resumeRepository.getResumeById(id, userId);
};

const getResumeOwnerContext = async (id) => {
  return resumeRepository.getResumeOwnerContext(id);
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

const getResumesByJob = async (jobId, userId) => {
  return resumeRepository.getResumesByJob(jobId, userId);
};

const getResumeSignedFileUrl = async ({
  resumeId,
  userId,
  expiresInSeconds = 900,
}) => {
  const resume = await resumeRepository.getResumeById(resumeId, userId);
  if (!resume || !resume.storagePath) {
    return null;
  }

  const url = await supabaseStorage.createSignedResumeUrl(
    resume.storagePath,
    expiresInSeconds,
  );

  return {
    url,
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
  };
};

const resumeService = {
  createResume,
  updateStatus,
  updateRawText,
  updateStructuredData,
  getResumeById,
  getResumeOwnerContext,
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
  getResumeSignedFileUrl,
};

export default resumeService;
