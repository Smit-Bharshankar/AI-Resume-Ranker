import jobService from "./job.service.js";
import resumeService from "../resume/resume.service.js";
import { successResponse, errorResponse } from "../../utils/api-response.js";
import { handleControllerError } from "../../utils/error-handler.js";
import { enqueueJobRequirementsExtraction } from "../../queue/jobExtractionQueue.js";
import {
  JobSchemaValidationError,
  validateJobStructuredRequirements,
} from "../jobExtraction/jobSchema.validator.js";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getJobs = async (req, res) => {
  try {
    const jobs = await jobService.getJobsByUserId(req.user.id);
    return res.status(200).json(successResponse(jobs));
  } catch (error) {
    return handleControllerError(res, error, "Failed to fetch jobs");
  }
};

const createJob = async (req, res) => {
  try {
    const { title, rawDescription } = req.body ?? {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json(errorResponse("title is required"));
    }

    if (
      !rawDescription ||
      typeof rawDescription !== "string" ||
      !rawDescription.trim()
    ) {
      return res.status(400).json(errorResponse("rawDescription is required"));
    }

    const job = await jobService.createJob({
      userId: req.user.id,
      title: title.trim(),
      rawDescription: rawDescription.trim(),
    });

    return res.status(201).json(successResponse(job));
  } catch (error) {
    return handleControllerError(res, error, "Failed to create job");
  }
};

const extractRequirements = async (req, res) => {
  try {
    const { id } = req.params;

    if (!UUID_V4_REGEX.test(id)) {
      return res.status(400).json(errorResponse("Invalid job id"));
    }

    const job = await jobService.getJobById(id, req.user.id);
    if (!job) {
      return res.status(404).json(errorResponse("Job not found"));
    }

    if (!["DRAFT", "FAILED_STRUCTURE"].includes(job.status)) {
      return res
        .status(409)
        .json(errorResponse("Extraction can only be started from DRAFT or FAILED_STRUCTURE"));
    }

    const transitioned = await jobService.updateStatusIfCurrent({
      id,
      currentStatus: job.status,
      nextStatus: "EXTRACTING_REQUIREMENTS",
      userId: req.user.id,
    });

    if (!transitioned) {
      return res.status(409).json(errorResponse("Job status changed, please retry"));
    }

    try {
      await enqueueJobRequirementsExtraction({ jobId: id });
    } catch (error) {
      await jobService.updateStatusIfCurrent({
        id,
        currentStatus: "EXTRACTING_REQUIREMENTS",
        nextStatus: job.status,
        userId: req.user.id,
      });
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Extraction started",
    });
  } catch (error) {
    return handleControllerError(res, error, "Failed to start extraction");
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!UUID_V4_REGEX.test(id)) {
      return res.status(400).json(errorResponse("Invalid job id"));
    }

    const job = await jobService.getJobById(id, req.user.id);

    if (!job) {
      return res.status(404).json(errorResponse("Job not found"));
    }

    return res.status(200).json(successResponse(job));
  } catch (error) {
    return handleControllerError(res, error, "Failed to fetch job");
  }
};

const getResumesByJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!UUID_V4_REGEX.test(id)) {
      return res.status(400).json(errorResponse("Invalid job id"));
    }

    const job = await jobService.getJobById(id, req.user.id);

    if (!job) {
      return res.status(404).json(errorResponse("Job not found"));
    }

    const resumes = await resumeService.getResumesByJob(id, req.user.id);

    return res.status(200).json(successResponse(resumes));
  } catch (error) {
    return handleControllerError(res, error, "Failed to fetch resumes");
  }
};

const patchRequirements = async (req, res) => {
  try {
    const { id } = req.params;

    if (!UUID_V4_REGEX.test(id)) {
      return res.status(400).json(errorResponse("Invalid job id"));
    }

    const job = await jobService.getJobById(id, req.user.id);
    if (!job) {
      return res.status(404).json(errorResponse("Job not found"));
    }

    if (job.status !== "REQUIREMENTS_STRUCTURED") {
      return res
        .status(409)
        .json(errorResponse("Requirements can only be edited when job is REQUIREMENTS_STRUCTURED"));
    }

    const payload = req.body ?? {};
    const structuredRequirements = validateJobStructuredRequirements(payload);
    const updated = await jobService.updateStructuredRequirementsIfStatus({
      id,
      status: "REQUIREMENTS_STRUCTURED",
      structuredRequirements,
      userId: req.user.id,
    });

    if (!updated) {
      return res.status(409).json(errorResponse("Job status changed, please retry"));
    }

    const refreshed = await jobService.getJobById(id, req.user.id);
    return res.status(200).json(successResponse(refreshed));
  } catch (error) {
    if (error instanceof JobSchemaValidationError) {
      return res.status(400).json(errorResponse(error.message));
    }

    return handleControllerError(res, error, "Failed to update requirements");
  }
};

const hasStructuredRequirements = (value) => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const activateJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!UUID_V4_REGEX.test(id)) {
      return res.status(400).json(errorResponse("Invalid job id"));
    }

    const job = await jobService.getJobById(id, req.user.id);
    if (!job) {
      return res.status(404).json(errorResponse("Job not found"));
    }

    if (job.status !== "REQUIREMENTS_STRUCTURED") {
      return res
        .status(409)
        .json(errorResponse("Only REQUIREMENTS_STRUCTURED jobs can be activated"));
    }

    if (!hasStructuredRequirements(job.structuredRequirements)) {
      return res.status(409).json(errorResponse("structuredRequirements are required"));
    }

    try {
      validateJobStructuredRequirements(job.structuredRequirements);
    } catch {
      return res.status(409).json(errorResponse("structuredRequirements are invalid"));
    }

    const activated = await jobService.updateStatusIfCurrent({
      id,
      currentStatus: "REQUIREMENTS_STRUCTURED",
      nextStatus: "ACTIVE",
      userId: req.user.id,
    });

    if (!activated) {
      return res.status(409).json(errorResponse("Job status changed, please retry"));
    }

    const refreshed = await jobService.getJobById(id, req.user.id);
    return res.status(200).json(successResponse(refreshed));
  } catch (error) {
    return handleControllerError(res, error, "Failed to activate job");
  }
};

const jobController = {
  getJobs,
  createJob,
  extractRequirements,
  patchRequirements,
  activateJob,
  getJobById,
  getResumesByJob,
};

export default jobController;
