import { Router } from "express";
import resumeController from "./resume.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import rateLimitMiddleware from "../../middleware/rate-limit.middleware.js";

const resumeRoutes = Router();

resumeRoutes.use(authMiddleware);
resumeRoutes.use(rateLimitMiddleware);

resumeRoutes.patch("/:resumeId/stage", resumeController.patchResumeStage);
resumeRoutes.delete("/:resumeId", resumeController.deleteResumeById);
resumeRoutes.get("/:id", resumeController.getResumeById);
resumeRoutes.get("/:id/file", resumeController.getResumeFileById);

export default resumeRoutes;
