import resumeService from "./resume.service.js";
import { successResponse, errorResponse } from "../../utils/api-response.js";
import { handleControllerError } from "../../utils/error-handler.js";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!UUID_V4_REGEX.test(id)) {
      return res.status(400).json(errorResponse("Invalid resume id"));
    }

    const resume = await resumeService.getResumeById(id);
    if (!resume) {
      return res.status(404).json(errorResponse("Resume not found"));
    }

    return res.status(200).json(successResponse(resume));
  } catch (error) {
    return handleControllerError(res, error, "Failed to fetch resume");
  }
};

const resumeController = {
  getResumeById,
};

export default resumeController;
