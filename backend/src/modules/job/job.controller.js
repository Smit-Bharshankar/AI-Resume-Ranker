import jobService from "./job.service.js";
import resumeService from "../resume/resume.service.js";
import { successResponse, errorResponse } from "../../utils/api-response.js";
import { handleControllerError } from "../../utils/error-handler.js";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
      title: title.trim(),
      rawDescription: rawDescription.trim(),
    });

    return res.status(201).json(successResponse(job));
  } catch (error) {
    return handleControllerError(res, error, "Failed to create job");
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!UUID_V4_REGEX.test(id)) {
      return res.status(400).json(errorResponse("Invalid job id"));
    }

    const job = await jobService.getJobById(id);

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

    const job = await jobService.getJobById(id);

    if (!job) {
      return res.status(404).json(errorResponse("Job not found"));
    }

    const resumes = await resumeService.getResumesByJob(id);

    return res.status(200).json(successResponse(resumes));
  } catch (error) {
    return handleControllerError(res, error, "Failed to fetch resumes");
  }
};

const jobController = {
  createJob,
  getJobById,
  getResumesByJob,
};

export default jobController;
