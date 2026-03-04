import resumeService from "./resume.service.js";
import stageService, { StageServiceError } from "./stage.service.js";
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

    const resume = await resumeService.getResumeById(id, req.user.id);
    if (!resume) {
      return res.status(404).json(errorResponse("Resume not found"));
    }

    return res.status(200).json(successResponse(resume));
  } catch (error) {
    return handleControllerError(res, error, "Failed to fetch resume");
  }
};

const getResumeFileById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!UUID_V4_REGEX.test(id)) {
      return res.status(400).json(errorResponse("Invalid resume id"));
    }

    const signedFile = await resumeService.getResumeSignedFileUrl({
      resumeId: id,
      userId: req.user.id,
    });

    if (!signedFile) {
      return res.status(404).json(errorResponse("Resume file not found"));
    }

    return res.status(200).json(successResponse(signedFile));
  } catch (error) {
    return handleControllerError(res, error, "Failed to fetch resume file");
  }
};

const patchResumeStage = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { stage } = req.body ?? {};

    if (!UUID_V4_REGEX.test(resumeId)) {
      return res.status(400).json(errorResponse("Invalid resume id"));
    }

    if (typeof stage !== "string" || !stage.trim()) {
      return res.status(400).json(errorResponse("stage is required"));
    }

    const updated = await stageService.updateResumeStage({
      resumeId,
      userId: req.user.id,
      stage: stage.trim(),
    });

    return res.status(200).json(successResponse(updated));
  } catch (error) {
    if (error instanceof StageServiceError) {
      return res.status(error.statusCode).json(errorResponse(error.message));
    }

    return handleControllerError(res, error, "Failed to update resume stage");
  }
};

const resumeController = {
  getResumeById,
  getResumeFileById,
  patchResumeStage,
};

export default resumeController;
