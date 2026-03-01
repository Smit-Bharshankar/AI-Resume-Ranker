import uploadService from "./upload.service.js";
import { successResponse, errorResponse } from "../../utils/api-response.js";
import { handleControllerError } from "../../utils/error-handler.js";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const uploadResumes = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const files = req.files ?? [];

    if (!UUID_V4_REGEX.test(jobId)) {
      return res.status(400).json(errorResponse("Invalid job id"));
    }

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json(errorResponse("At least one PDF is required"));
    }

    const result = await uploadService.uploadResumesForJob({
      userId: req.user.id,
      jobId,
      files,
    });

    return res.status(200).json(successResponse(result));
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json(errorResponse("Job not found"));
    }

    return handleControllerError(res, error, "Failed to upload resumes");
  }
};

const uploadController = {
  uploadResumes,
};

export default uploadController;
